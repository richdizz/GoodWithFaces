using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GroupGenius.Svc.Models
{
    public class QuizQuestionModel
    {
        [JsonProperty(PropertyName = "questionType")]
        public QuestionType questionType { get; set; }

        [JsonProperty(PropertyName = "questionText")]
        public string questionText { get; set; }

        [JsonProperty(PropertyName = "answer")]
        public bool answer { get; set; }

        [JsonProperty(PropertyName = "photoId")]
        public string photoId { get; set; }

        [JsonProperty(PropertyName = "img")]
        public string img { get; set; }

        [JsonProperty(PropertyName = "portrait")]
        public bool portrait { get; set; }
    }

    public enum QuestionType
    {
        MemberPhoto,
        TaggedPhoto
    }
}
