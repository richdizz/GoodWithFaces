using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GroupGenius.Svc.Models
{
    public class PhotoTagModel
    {
        [JsonProperty(PropertyName = "user_id")] //id
        public Guid user_id { get; set; }

        [JsonProperty(PropertyName = "user_name")] //displayName
        public string user_name { get; set; }

        [JsonProperty(PropertyName = "user_upn")] //userPrincipalName
        public string user_upn { get; set; }

        [JsonProperty(PropertyName = "face_id")] //face.FaceId
        public Guid face_id { get; set; }

        [JsonProperty(PropertyName = "face_width")] //face.FaceRectangle.Width
        public int face_width { get; set; }

        [JsonProperty(PropertyName = "face_height")] //face.FaceRectangle.Height
        public int face_height { get; set; }

        [JsonProperty(PropertyName = "face_left")] //face.FaceRectangle.Left
        public int face_left { get; set; }

        [JsonProperty(PropertyName = "face_top")] //face.FaceRectangle.Top
        public int face_top { get; set; }
    }
}
