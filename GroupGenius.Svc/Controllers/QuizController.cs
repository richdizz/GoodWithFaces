using GroupGenius.Svc.Models;
using GroupGenius.Svc.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace GroupGenius.Svc.Controllers
{
    [Authorize]
    public class QuizController : ApiController
    {
        [Route("api/Quiz")]
        [HttpPost]
        public async Task<HttpResponseMessage> Post([FromBody]QuizResultModel results)
        {
            results.id = Guid.NewGuid();
            results.user = System.Security.Claims.ClaimsPrincipal.Current.Identity.Name.ToLower();

            // Add the results
            var photos = await DocumentDBRepository<QuizResultModel>.CreateItemAsync("Scores", results);

            // Return the item with id
            return Request.CreateResponse<QuizResultModel>(HttpStatusCode.OK, results);
        }

        [Route("api/Quiz/{group_id}")]
        [HttpGet]
        public List<RankingModel> Get(Guid group_id)
        {
            List<RankingModel> leaderboard = new List<RankingModel>();

            // Get all scores for the group
            var scores = DocumentDBRepository<QuizResultModel>.GetItems("Scores", i => i.group_id == group_id);

            // Group by user
            var grouped = scores.GroupBy(i => i.user);

            foreach (var userScores in grouped)
            {
                RankingModel ranking = new RankingModel() { user = userScores.Key, pct_score = 0, total_possible = 0, total_score = 0 };
                for (var i = 0; i < userScores.Count(); i++)
                {
                    ranking.total_possible += userScores.ElementAt(i).questions;
                    ranking.total_score += userScores.ElementAt(i).correct;
                }
                ranking.pct_score = ((ranking.total_score + 0.0) / ranking.total_possible) * 100.0;
                leaderboard.Add(ranking);
            }

            return leaderboard.OrderByDescending(i => i.pct_score).ToList();
        }

        // Get quiz (groupid, members, #questions)
        // Submit quiz
        [Route("api/Quiz/{group_id}/{questions}")]
        [HttpPost]
        public async Task<HttpResponseMessage> GenerateQuiz(Guid group_id, int questions, [FromBody]List<MemberModel> members)
        {
            //return System.Security.Claims.ClaimsPrincipal.Current.Identity.Name.ToLower();
            var questionsResponse = new List<QuizQuestionModel>();

            // Get the photos for this gorup
            var photos = DocumentDBRepository<PhotoModel>.GetItems("Photos", i => i.group_id == group_id).ToList();

            // Filter out untagged photos or photos only tagged with the current user
            string currUser = System.Security.Claims.ClaimsPrincipal.Current.Identity.Name.ToLower();
            photos = photos.Where(i => i.tags.Exists(k => k.user_upn != null && k.user_upn != currUser)).ToList();

            // Filter out current user from the members
            members = members.Where(i => i.userPrincipalName != currUser).ToList();

            // Make sure there are enough photos from 
            var totalPhotos = photos.Count + members.Count;
            if (totalPhotos < questions)
                return Request.CreateResponse<string>(HttpStatusCode.BadRequest, "Not enough photos to handle request");
            else
            {
                // Add random questions
                Random rand = new Random();
                Dictionary<int, bool> chron = new Dictionary<int, bool>();
                for (int i = 0; i < questions; i++)
                {
                    // Get a random index
                    var index = rand.Next(totalPhotos);
                    while (chron.ContainsKey(index))
                        index = rand.Next(totalPhotos);
                    chron.Add(index, true);

                    // Determine question answer
                    bool answer = (rand.Next(2) == 1);

                    // Determine the question type
                    if (index >= photos.Count)
                    {
                        // Adjust the index by the photo.Count
                        index = index - photos.Count;

                        // This is a member photo
                        var member = members[index];
                        questionsResponse.Add(GetRandomMemberPhotoQuestion(member, members, answer, rand));
                    }
                    else
                    {
                        // This is a tagged photo
                        var photo = photos[index];
                        questionsResponse.Add(GetRandomTaggedPhotoQuestion(photo, members, currUser, answer, rand));
                    }   
                }

                return Request.CreateResponse<List<QuizQuestionModel>>(HttpStatusCode.OK, questionsResponse);
            }
        }

        private QuizQuestionModel GetRandomTaggedPhotoQuestion(PhotoModel photo, List<MemberModel> members, string currUser, bool answer, Random rand)
        {
            // Get a random member based on answer
            MemberModel txtMember = null;
            var tags = photo.tags.Where(i => i.user_upn != null && i.user_upn != currUser).ToList();
            while (txtMember == null)
            {
                if (answer)
                {
                    var tag = tags[rand.Next(tags.Count)];
                    txtMember = new MemberModel() { displayName = tag.user_name, id = tag.user_id, userPrincipalName = tag.user_upn };
                }
                else
                {
                    var index = rand.Next(members.Count);
                    if (!tags.Exists(i => i.user_upn == members[index].userPrincipalName))
                        txtMember = members[index];
                }
            }

            return new QuizQuestionModel()
            {
                questionType = QuestionType.TaggedPhoto,
                questionText = String.Format("Is {0} in this photo?", txtMember.displayName),
                answer = answer,
                photoId = photo.onedrive_id,
                portrait = photo.portrait
            };
        }

        private QuizQuestionModel GetRandomMemberPhotoQuestion(MemberModel member, List<MemberModel> members, bool answer, Random rand)
        {
            // Get a random member based on answer
            MemberModel txtMember = null;
            while (txtMember == null)
            {
                if (answer)
                    txtMember = member;
                else
                {
                    var index = rand.Next(members.Count);
                    if (!members[index].userPrincipalName.Equals(member.userPrincipalName, StringComparison.CurrentCultureIgnoreCase))
                        txtMember = members[index];
                }
            }

            return new QuizQuestionModel()
            {
                questionType = QuestionType.MemberPhoto,
                questionText = String.Format("Is this {0}?", txtMember.displayName),
                answer = answer,
                photoId = member.id.ToString(),
                img = member.img
            };
        }
    }
}
