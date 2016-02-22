using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GroupGenius.Svc.Models
{
    public class RankingModel
    {
        [JsonProperty(PropertyName = "user")]
        public string user { get; set; }

        [JsonProperty(PropertyName = "total_score")]
        public int total_score { get; set; }

        [JsonProperty(PropertyName = "total_possible")]
        public int total_possible { get; set; }

        [JsonProperty(PropertyName = "pct_score")]
        public double pct_score { get; set; }
    }
}
