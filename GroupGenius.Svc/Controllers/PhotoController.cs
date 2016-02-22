using GroupGenius.Svc.Models;
using GroupGenius.Svc.Utils;
using Microsoft.ProjectOxford.Face;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Http;

namespace GroupGenius.Svc.Controllers
{
    [Authorize]
    public class PhotoController : ApiController
    {
        [Route("api/Photo/{group_id}")]
        [HttpGet]
        public async Task<List<PhotoModel>> Get(Guid group_id)
        {
            return DocumentDBRepository<PhotoModel>.GetItems("Photos", i => i.group_id == group_id).ToList();
        }

        [Route("api/Photo/{folder_id}")]
        [HttpPost]
        public async Task<HttpResponseMessage> Post(string folder_id, Guid group_id, string access_token)
        {
            PhotoModel photoResponse = null;

            // First convert to the content body to byte array
            var base64Photo = await Request.Content.ReadAsStringAsync();
            byte[] photoBytes = Convert.FromBase64String(base64Photo);
            string filename = String.Format("{0}.jpg", Guid.NewGuid().ToString());

            // Upload the file to the group in Office 365 using the passed in access token
            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Add("Authorization", "Bearer " + access_token);
            client.DefaultRequestHeaders.Add("Accept", "application/json;odata.metadata=full");
            using (var o365Stream = new MemoryStream(photoBytes, 0, photoBytes.Length))
            {
                StreamContent streamContent = new StreamContent(o365Stream);
                streamContent.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
                var url = String.Format("https://graph.microsoft.com/v1.0/myorganization/groups/{0}/drive/items/{1}/children/{2}/content", group_id.ToString(), folder_id, filename);
                using (HttpResponseMessage response = await client.PutAsync(new Uri(url, UriKind.Absolute), streamContent))
                {
                    // Check for success before calling into facial recognition service
                    if (response.IsSuccessStatusCode)
                    {
                        // Convert the response to an entity we can work with
                        var json = JObject.Parse(await response.Content.ReadAsStringAsync());
                        photoResponse = new PhotoModel();
                        photoResponse.id = Guid.NewGuid();
                        photoResponse.group_id = group_id;
                        photoResponse.onedrive_id = (string)json.SelectToken("id");
                        photoResponse.name = (string)json.SelectToken("name");

                        // Determine dimensions of photo
                        using (var imgStream = new MemoryStream(photoBytes, 0, photoBytes.Length))
                        {
                            var img = Image.FromStream(imgStream);
                            photoResponse.height = img.Size.Height;
                            photoResponse.width = img.Size.Width;
                            photoResponse.portrait = img.Size.Height > img.Size.Width;
                        }

                        try
                        {
                            // Call the Oxford APIs to detect faces
                            var faceServiceClient = new FaceServiceClient(ConfigurationManager.AppSettings["oxfordkey"]);
                            using (var faceStream = new MemoryStream(photoBytes, 0, photoBytes.Length))
                            {
                                var faces = await faceServiceClient.DetectAsync(faceStream, true, true);
                                foreach (var face in faces)
                                {
                                    // Add the photo tag
                                    photoResponse.tags.Add(new PhotoTagModel()
                                    {
                                        face_id = face.FaceId,
                                        face_width = face.FaceRectangle.Width,
                                        face_height = face.FaceRectangle.Height,
                                        face_left = face.FaceRectangle.Left,
                                        face_top = face.FaceRectangle.Top
                                    });
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            var x = "";
                            // Error occurred calling Oxford APIs...do nothing
                        }
                        finally
                        {
                            // Save the photo to DocumentDB
                            await DocumentDBRepository<PhotoModel>.CreateItemAsync("Photos", photoResponse);
                        }
                    }
                }
            }

            return Request.CreateResponse<PhotoModel>(HttpStatusCode.OK, photoResponse);
        }

        [Route("api/Photo/Tag/{id}")]
        [HttpPost]
        public async Task Tag(Guid id, [FromBody]List<PhotoTagModel> tags)
        {
            // First get the photo from document db
            var photo = DocumentDBRepository<PhotoModel>.GetItem("Photos", i => i.id == id);

            // Update the tags
            photo.tags = tags;

            // Save the photo back to DocumentDB
            await DocumentDBRepository<PhotoModel>.UpdateItemAsync("Photos", id.ToString(), photo);
        }
    }
}
