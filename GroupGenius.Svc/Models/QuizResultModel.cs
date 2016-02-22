using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GroupGenius.Svc.Models
{
    public class QuizResultModel
    {
        [JsonProperty(PropertyName = "id")]
        public Guid id { get; set; }

        [JsonProperty(PropertyName = "group_id")]
        public Guid group_id { get; set; }

        [JsonProperty(PropertyName = "user")]
        public string user { get; set; }

        [JsonProperty(PropertyName = "questions")]
        public int questions { get; set; }

        [JsonProperty(PropertyName = "correct")]
        public int correct { get; set; }
    }
}
