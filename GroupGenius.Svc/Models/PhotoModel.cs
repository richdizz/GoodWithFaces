using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GroupGenius.Svc.Models
{
    public class PhotoModel
    {
        public PhotoModel()
        {
            tags = new List<PhotoTagModel>();
        }

        [JsonProperty(PropertyName = "id")]
        public Guid id { get; set; }

        [JsonProperty(PropertyName = "onedrive_id")]
        public string onedrive_id { get; set; }

        [JsonProperty(PropertyName = "group_id")]
        public Guid group_id { get; set; }

        [JsonProperty(PropertyName = "name")]
        public string name { get; set; }
        
        [JsonProperty(PropertyName = "portrait")]
        public bool portrait { get; set; }

        [JsonProperty(PropertyName = "height")]
        public int height { get; set; }

        [JsonProperty(PropertyName = "width")]
        public int width { get; set; }
        
        [JsonProperty(PropertyName = "tags")]
        public List<PhotoTagModel> tags { get; set; }
    }
}
