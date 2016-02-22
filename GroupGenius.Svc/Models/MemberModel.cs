using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GroupGenius.Svc.Models
{
    public class MemberModel
    {
        [JsonProperty(PropertyName = "id")]
        public Guid id { get; set; }

        [JsonProperty(PropertyName = "displayName")]
        public string displayName { get; set; }

        [JsonProperty(PropertyName = "userPrincipalName")]
        public string userPrincipalName { get; set; }

        [JsonProperty(PropertyName = "img")]
        public string img { get; set; }
    }
}
