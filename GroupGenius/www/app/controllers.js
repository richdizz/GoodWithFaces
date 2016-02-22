(function () {
    "use strict";

    angular.module("myapp.controllers", [])

    .controller("appCtrl", ["$scope", function ($scope) {
    }])

    //splashCtrl provides the logic for the splash screen
    .controller("splashCtrl", ["$scope", "$state", "myappService", function ($scope, $state, myappService) {
        myappService.tryLoginSilent().then(function (result) {
            if (result)
                $state.go("app.groups");
            else
                $state.go("login");
        });
    }])

    //loginCtrl provides the logic for the login screen
    .controller("loginCtrl", ["$scope", "$state", "myappService", function ($scope, $state, myappService) {
        $scope.login = function () {
            myappService.wait(true);
            myappService.tryLoginExplicit().then(function (result) {
                if (result)
                    $state.go("app.groups");
                else {
                    myappService.wait(false);
                    myappService.broadcastError("login failed");
                }
            });
        };
    }])

    //groupsCtrl provides the logic for the home screen
    .controller("groupsCtrl", ["$scope", "$state", "myappService", function ($scope, $state, myappService) {
        $scope.groups = [];

        $scope.refresh = function () {
            myappService.wait(true);
            myappService.getGroups(true).then(function (data) {
                // Refresh binding
                $scope.groups = data;
                $scope.$broadcast("scroll.refreshComplete");
                myappService.wait(false);

                // Loop through, initialize and load images for each item
                for (var i = 0; i < $scope.groups.length; i++) {
                    $scope.groups[i].img = myappService.groupIcon;
                    myappService.loadPhoto($scope.groups[i], "https://graph.microsoft.com/beta/myorganization/groups/" + $scope.groups[i].id + "/photo/$value").then(function (obj) {
                        // Do nothing...
                    })
                }
            }, function (err) {
                // Stop the refresh and broadcast the error
                $scope.$broadcast("scroll.refreshComplete");
                $scope.$broadcast("error", err);
                myappService.wait(false);
            });
        };
        $scope.refresh();
    }])

    //groupMembersCtrl provides logic for group members
    .controller("groupMembersCtrl", ["$scope", "$state", "$stateParams", "$ionicTabsDelegate", "$ionicScrollDelegate", "myappService", function ($scope, $state, $stateParams, $ionicTabsDelegate, $ionicScrollDelegate, myappService) {
        myappService.getGroup($stateParams.id).then(function (g) {
            $scope.group = g;
        });
        $scope.members = [];
        $scope.refresh = function () {
            myappService.wait(true);
            myappService.getGroupMembers($stateParams.id).then(function (data) {
                $scope.members = data;
                $scope.$broadcast("scroll.refreshComplete");
                myappService.wait(false);

                // Loop through, initialize and load images for each item
                for (var i = 0; i < $scope.members.length; i++) {
                    $scope.members[i].img = myappService.userIcon;
                    myappService.loadPhoto($scope.members[i], "https://graph.microsoft.com/beta/myorganization/users/" + $scope.members[i].id + "/photo/$value").then(function (obj) {
                        // Do nothing...
                    })
                }
            });
        };
        $scope.refresh();

        $scope.nav = function (id) {
            $state.go("app.user", { id: $stateParams.id, uid: id });
        };
    }])

    //groupLeaderboardCtrl provides logic for the gorup leaderboard
    .controller("groupLeaderboardCtrl", ["$scope", "$state", "$stateParams", "$ionicModal", "$ionicTabsDelegate", "$ionicScrollDelegate", "myappService", function ($scope, $state, $stateParams, $ionicModal, $ionicTabsDelegate, $ionicScrollDelegate, myappService) {
        $scope.members = myappService.members; // The group members used for pickers

        // Get the active group
        myappService.getGroup($stateParams.id).then(function (g) {
            $scope.group = g;
        });

        // Set modal style
        var header = 42;
        if (device.platform === "iOS")
            header = 64;
        $scope.modalStyle = "top: " + header + "px;";

        // Load the leaderboard
        $scope.refresh = function () {
            myappService.wait(true);
            myappService.getLeaderboard($stateParams.id).then(function (data) {
                // Loop through and update names
                for (var i = 0; i < data.length; i++) {
                    for (var k = 0; k < $scope.members.length; k++) {
                        if (data[i].user === $scope.members[k].userPrincipalName) {
                            data[i].name = $scope.members[k].displayName;
                            break;
                        }
                    }
                }

                $scope.rankings = data;
                $scope.$broadcast("scroll.refreshComplete");
                myappService.wait(false);
            }, function (err) {
            });
        };
        $scope.refresh();

        // Initialize the modal for quiz results
        $ionicModal.fromTemplateUrl("app/templates/view-results.html", {
            scope: $scope,
            animation: "slide-in-up"
        }).then(function (modal) {
            $scope.modal = modal;
            if ($stateParams.quiz_id) {
                $scope.modal.show();
                $scope.results = myappService.lastQuizTaken;
                $scope.results.pct = (($scope.results.correct + 0.0) / $scope.results.questions) * 100;
                myappService.wait(false);
            };
        });

        $scope.close = function () {
            $scope.modal.hide();
            $state.go("app.group.leaderboard");
        };
    }])

    //groupPhotosCtrl provides logic for the group photos list
    .controller("groupPhotosCtrl", ["$scope", "$state", "$window", "$stateParams", "$ionicActionSheet", "$ionicTabsDelegate", "$ionicScrollDelegate", "$ionicModal", "myappService", function ($scope, $state, $window, $stateParams, $ionicActionSheet, $ionicTabsDelegate, $ionicScrollDelegate, $ionicModal, myappService) {
        // Local properties
        $scope.members = myappService.members; // The group members used for pickers
        $scope.photos = []; // The group photos
        var selectedIndex = -1; // The selected index of photo
        var selectedTagIndex = -1; // The selected index of the tag
        var deviceB = (window.innerHeight > window.innerWidth) ? window.innerHeight : window.innerWidth; // The big device dimension
        var deviceS = (window.innerHeight > window.innerWidth) ? window.innerWidth : window.innerHeight; // The small device dimension
        $scope.picStyle = {}; // The style of the picture in modal
        var offsetTop = 0; // The top offset of the picture
        var offsetLeft = 0; // The left offset of the picture
        var scale = 0; // The scale of the picture from the original
        $scope.showPicker = false; // Indicates if the picker should be displayed
        $scope.picker = { pickerStyle: "", imgStyle: "" }; // Picker styles
        $scope.search = { searchText: "" }; // Search text
        $scope.canSave = false; // Dirty flag for saves

        // Initialize the modal for picture detail
        $ionicModal.fromTemplateUrl("app/templates/view-photo.html", {
            scope: $scope,
            animation: "slide-in-up"
        }).then(function (modal) {
            $scope.modal = modal;
        });

        // Refreshes the photos view
        $scope.refresh = function () {
            myappService.wait(true);
            myappService.getGroupPhotos($scope.group).then(function (data) {
                $scope.photos = data;
                $scope.$broadcast("scroll.refreshComplete");
                myappService.wait(false);

                // Loop through, initialize and load thumbnails for each item
                for (var i = 0; i < $scope.photos.length; i++) {
                    myappService.loadGroupPhoto($stateParams.id, $scope.photos[i]).then(function (obj) {

                    });
                }
            });
        };

        // Get the active group
        myappService.getGroup($stateParams.id).then(function (g) {
            $scope.group = g;
            $scope.refresh();
        });

        // Fires when the orientation changes to update photo view
        $scope.$on("orientationChange", function (evt, val) {
            resizePhoto(val);
            $scope.$apply();
        });

        // Resizes the photo in the photo detail modal
        var resizePhoto = function (portrait) {
            if (selectedIndex != -1) {
                // Reposition the picture in the window
                var header = 42;
                if (device.platform === "iOS")
                    header = 64;
                var windowRatio, w, h;
                if (portrait) {
                    windowRatio = (deviceB - header) / deviceS;
                    h = (deviceB - header);
                    w = deviceS;
                }
                else {
                    windowRatio = (deviceS - header) / deviceB;
                    h = (deviceS - header);
                    w = deviceB;
                }
                $scope.modalStyle = "height: " + h + "px; margin-top: " + header + "px";
                var picRatio = $scope.photos[selectedIndex].height / $scope.photos[selectedIndex].width;
                var displayWidth = 0;
                if (windowRatio > picRatio) {
                    // Vertical align picture
                    offsetTop = (h - ((w / $scope.photos[selectedIndex].width) * $scope.photos[selectedIndex].height)) / 2;
                    $scope.picStyle = "margin-top: " + offsetTop + "px; margin-left: 0px; height: " + (picRatio * w) + "px; width: " + w + "px;";
                    displayWidth = w;
                }
                else {
                    // Horizonal align picture
                    offsetLeft = (w - ((h / $scope.photos[selectedIndex].height) * $scope.photos[selectedIndex].width)) / 2;
                    $scope.picStyle = "margin-top: 0px; margin-left: " + offsetLeft + "px; height: " + h + "px; width: " + (w - (2 * offsetLeft)) + "px;";
                    displayWidth = (w - (2 * offsetLeft));
                }

                // Reset the photos and tags
                scale = displayWidth / $scope.photos[selectedIndex].width;
                resetTags();
            }
        };

        // Resets all the face tags
        var resetTags = function () {
            // Adjust the picture vertically
            var newStyle = $scope.picStyle.substring($scope.picStyle.indexOf("margin-left"));
            newStyle = "margin-top: " + offsetTop + "px; " + newStyle;
            $scope.picStyle = newStyle;

            // Loop through and position each of the face tags
            for (var i = 0; i < $scope.active.tags.length; i++) {
                $scope.active.tags[i].style = "top: " + (offsetTop + (scale * $scope.active.tags[i].face_top)) + "px; " +
                    "left: " + (offsetLeft + (scale * $scope.active.tags[i].face_left)) + "px; " +
                    "width: " + (scale * $scope.active.tags[i].face_width) + "px; " +
                    "height: " + (scale * $scope.active.tags[i].face_height) + "px;";
                if ($scope.active.tags[i].user_name)
                    $scope.active.tags[i].style += " border: 1px solid transparent;";
                $scope.active.tags[i].textStyle = "top: " + (scale * $scope.active.tags[i].face_height - 1) + "px; " +
                    "width: " + (scale * $scope.active.tags[i].face_width - 2) + "px;";
            }
        };

        // Tags a photo
        $scope.tagPhoto = function (index) {
            // Get the selected tag
            selectedTagIndex = index;
            var tag = $scope.active.tags[selectedTagIndex];

            // Adjust the picture vertically
            var newStyle = $scope.picStyle.substring($scope.picStyle.indexOf("margin-left"));
            newStyle = "margin-top: -" + (scale * tag.face_top) + "px; " + newStyle;
            $scope.picStyle = newStyle;

            // Loop through all tag squares and update their positions
            var tagAdjust = (offsetTop + (scale * tag.face_top));
            for (var i = 0; i < $scope.active.tags.length; i++) {
                $scope.active.tags[i].style = "top: " + (tagAdjust - (offsetTop + (scale * $scope.active.tags[i].face_top))) + "px; " +
                    "left: " + (offsetLeft + (scale * $scope.active.tags[i].face_left)) + "px; " +
                    "width: " + (scale * $scope.active.tags[i].face_width) + "px; " +
                    "height: " + (scale * $scope.active.tags[i].face_height) + "px;";
            }

            // Update the picker position
            $scope.picker.pickerStyle = "top: " + (scale * tag.face_height) + "px;";
            $scope.picker.imgStyle = "margin-left: " + ((offsetLeft + (scale * tag.face_left)) + ((scale * tag.face_width) / 2) - 12) + "px;";

            // Show the picker
            $scope.showPicker = true;
            
        };

        // Fires when a member is picked
        $scope.memberPicked = function (id) {
            // Get the member from the members collection
            var member = myappService.getById($scope.members, id);

            // Set the details on the tag
            var tag = $scope.active.tags[selectedTagIndex];
            tag.user_id = member.id;
            tag.user_name = member.displayName;
            tag.user_upn = member.userPrincipalName;

            $scope.canSave = true;
            selectedTagIndex = -1;
            $scope.search.searchText = "";
            $scope.showPicker = false;
            resetTags();
        };

        // Loads a photo in the photo detail dialog
        $scope.photoDetail = function (index) {
            // Set the selected index and active photo
            selectedIndex = index;
            $scope.active = $scope.photos[selectedIndex];

            // Launch the modal
            $scope.modal.show();

            // Resize the photo to fit centered
            resizePhoto(!(Math.abs(window.orientation) === 90));
        };

        // Cancel of the photo detail dialog
        $scope.cancel = function () {
            // Reset the selectedIndex and active photo variables before closing modal
            resetTags();
            selectedIndex = -1;
            selectedTagIndex - 1;
            $scope.search.searchText = "";
            $scope.showPicker = false;
            $scope.canSave = false;
            $scope.active = null;
            $scope.modal.hide();
        };

        // Save the tags in the photo detail dialog
        $scope.save = function () {
            // Save the tags
            myappService.wait(true);
            myappService.saveTags($scope.active.id, $scope.active.tags).then(function (r) {
                // Reset the selectedIndex and active photo variables before closing modal
                resetTags();
                selectedIndex = -1;
                selectedTagIndex = -1;
                $scope.search.searchText = "";
                $scope.showPicker = false;
                $scope.canSave = false;
                $scope.active = null;
                $scope.modal.hide();
                myappService.wait(false);
            }, function (err) {
                var x = "";
            });
        };

        // Handles adding a photo for the group
        $scope.addPhoto = function () {
            // Launch the action sheet to allow photo source
            $ionicActionSheet.show({
                titleText: "Upload Group Photo",
                buttons: [
                  { text: "Camera" },
                  { text: "Photo Library" },
                ],
                cancelText: "Cancel",
                cancel: function () {
                    // Do nothing
                },
                buttonClicked: function (index) {
                    navigator.camera.getPicture(function (imgData) {
                        myappService.wait(true);
                        myappService.uploadPhoto(imgData, $scope.group).then(function (r) {
                            $scope.photos.push(r)
                            myappService.loadGroupPhoto($stateParams.id, r).then(function (obj) {
                                $scope.photoDetail($scope.photos.length - 1);
                                myappService.wait(false);
                            });
                        }, function (err) {
                            // TODO
                            var x = "";
                            myappService.wait(false);
                        });
                    }, function (err) {
                        var x = "";
                    }, {
                        quality: 25,
                        destinationType: Camera.DestinationType.DATA_URL,

                        // Set the image source based on the button index
                        sourceType: (index === 0) ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY
                    });
                    return true;
                }
            });
        };
    }])
    
    //groupQuizCtrl provides logic for the quiz
    .controller("groupQuizCtrl", ["$scope", "$q", "$state", "$stateParams", "$ionicModal", "$ionicTabsDelegate", "$ionicScrollDelegate", "$ionicSideMenuDelegate", "myappService", function ($scope, $q, $state, $stateParams, $ionicModal, $ionicTabsDelegate, $ionicScrollDelegate, $ionicSideMenuDelegate, myappService) {
        // Local properties
        $scope.members = myappService.members; // The group members used for generating quiz questions
        $scope.quiz = { qcnt: 5, activeIndex: 0, correct: 0, wrong: 0 }; // The number of questions in the quiz
        $scope.liveQuiz = [];
        var header = 42;
        if (device.platform === "iOS")
            header = 64;
        $scope.style = "top: " + header + "px;";

        // Initialize the modal for picture detail
        $ionicModal.fromTemplateUrl("app/templates/view-quiz.html", {
            scope: $scope,
            animation: "slide-in-up"
        }).then(function (modal) {
            $scope.modal = modal;
        });

        // Get the active group
        myappService.getGroup($stateParams.id).then(function (g) {
            $scope.group = g;
        });

        var turnOnQuestion = function (index) {
            var deferred = $q.defer();

            // Push question to live quiz
            var question = $scope.quiz.questions[index];
            $scope.liveQuiz.push(angular.extend({}, question));

            // Load image
            if (question.questionType == 1) {
                // Load the tagged photo
                $scope.liveQuiz[0].onedrive_id = $scope.liveQuiz[0].photoId;
                myappService.loadGroupPhoto($stateParams.id, $scope.liveQuiz[0]).then(function (obj) {
                    myappService.wait(false);
                    deferred.resolve();
                }, function (err) {
                    deferred.reject();
                });
            }
            else if (!$scope.liveQuiz[0].img) {
                // Load profile picture
                myappService.loadPhoto($scope.liveQuiz[0], "https://graph.microsoft.com/beta/myorganization/users/" + $scope.liveQuiz[0].photoId + "/photo/$value").then(function (obj) {
                    myappService.wait(false);
                    deferred.resolve();
                }, function (err) {
                    deferred.reject();
                });
            }
            else {
                // Image should already be loaded
                myappService.wait(false);
                deferred.resolve();
            }

            return deferred.promise;
        };

        // Gets the quiz configuration and starts the quiz
        $scope.startQuiz = function () {
            myappService.wait(true);
            myappService.getQuiz($scope.group.id, $scope.quiz.qcnt, $scope.members).then(function (questions) {
                $scope.quiz.questions = questions;

                // Turn on the first question
                turnOnQuestion(0).then(function () {
                    // Launch the modal
                    $scope.modal.show();
                }, function (err) {
                    //TODO????
                });
            }, function (err) {
                myappService.wait(false);
                myappService.broadcastError(err)
            });
        };

        $scope.destroy = function (index) {
            $scope.liveQuiz.splice(index, 1);
            myappService.wait(true);

            // Check if the quiz is complete
            if ($scope.quiz.activeIndex < ($scope.quiz.qcnt - 1)) {
                $scope.quiz.activeIndex++;
                turnOnQuestion($scope.quiz.activeIndex);
            }
            else {
                // End the quiz
                myappService.submitQuizResults($scope.group.id, $scope.quiz.qcnt, $scope.quiz.correct).then(function (r) {
                    $scope.modal.hide();
                    $state.go("app.group.leaderboard", { quiz_id: r.id });
                }, function (err) {
                    //TODO
                });
            }
        };
        $scope.swipeLeft = function (index) {
            // check score
            if ($scope.liveQuiz[index].answer == false)
                $scope.quiz.correct++;
            else
                $scope.quiz.wrong++;
        };
        $scope.swipeRight = function (index) {
            // check score
            if ($scope.liveQuiz[index].answer == true)
                $scope.quiz.correct++;
            else
                $scope.quiz.wrong++;
        };
    }])



    //userCtrl provides the logic for the home screen
    .controller("userCtrl", ["$scope", "$state", "$stateParams", "$ionicHistory", "$ionicSideMenuDelegate", "myappService", function ($scope, $state, $stateParams, $ionicHistory, $ionicSideMenuDelegate, myappService) {
        $ionicSideMenuDelegate.canDragContent(false);
        $scope.goBack = function () {
            $ionicHistory.goBack();
        };
    }])

    //tempCtrl provides the logic for the home screen
    .controller("tempCtrl", ["$scope", "$state", "myappService", function ($scope, $state, myappService) {
        var x = "";
    }])

    //quizCtrl provides the logic for the home screen
    .controller("quizCtrl", ["$scope", "$state", "myappService", function ($scope, $state, myappService) {
        var x = "";
    }])

    //errorCtrl managed the display of error messages bubbled up from other controllers, directives, myappService
    .controller("errorCtrl", ["$scope", "myappService", function ($scope, myappService) {
        //public properties that define the error message and if an error is present
        $scope.error = "";
        $scope.activeError = false;

        //function to dismiss an active error
        $scope.dismissError = function () {
            $scope.activeError = false;
        };

        //broadcast event to catch an error and display it in the error section
        $scope.$on("error", function (evt, val) {
            //set the error message and mark activeError to true
            $scope.error = val;
            $scope.activeError = true;

            //stop any waiting indicators (including scroll refreshes)
            myappService.wait(false);
            $scope.$broadcast("scroll.refreshComplete");

            //manually apply given the way this might bubble up async
            $scope.$apply();
        });
    }]);
})();