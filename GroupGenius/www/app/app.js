(function () {
    "use strict";

    angular.module("myapp", ["ionic", "ionic.contrib.ui.tinderCards", "myapp.controllers", "myapp.services"])
        .run(function ($ionicPlatform, myappService) {
            $ionicPlatform.ready(function () {
                if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                if (window.StatusBar) {
                    StatusBar.styleDefault();
                }
            });

            window.addEventListener("orientationchange", function () {
                var landscape = (Math.abs(window.orientation) === 90);
                myappService.orientationChange(!landscape);
            }, false);
        })
        .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
            $stateProvider
            .state("splash", {
                url: "/splash",
                templateUrl: "app/templates/view-splash.html",
                controller: "splashCtrl"
            })
            .state("login", {
                url: "/login",
                templateUrl: "app/templates/view-login.html",
                controller: "loginCtrl"
            })
            .state("app", {
                url: "/app",
                abstract: true,
                templateUrl: "app/templates/view-menu.html",
                controller: "appCtrl"
            })
            .state("app.groups", {
                url: "/groups",
                templateUrl: "app/templates/view-groups.html",
                controller: "groupsCtrl"
            })
            .state("app.group", {
                abstract: true,
                url: "/groups/:id",
                templateUrl: "app/templates/view-group.html"
            })
            .state("app.group.members", {
                url: "/members",
                views: {
                    "members": {
                        templateUrl: "app/templates/view-members.html",
                        controller: "groupMembersCtrl"
                    }
                }
            })
            .state("app.group.leaderboard", {
                url: "/leaderboard/:quiz_id",
                views: {
                    "leaderboard": {
                        templateUrl: "app/templates/view-leaderboard.html",
                        controller: "groupLeaderboardCtrl"
                    }
                }
            })
            .state("app.group.photos", {
                url: "/photos",
                views: {
                    "photos": {
                        templateUrl: "app/templates/view-photos.html",
                        controller: "groupPhotosCtrl"
                    }
                }
            })
            .state("app.group.quiz", {
                url: "/quiz",
                views: {
                    "quiz": {
                        templateUrl: "app/templates/view-startquiz.html",
                        controller: "groupQuizCtrl"
                    }
                }
            })

            .state("app.user", {
                url: "/users/:id",
                templateUrl: "app/templates/view-user.html",
                controller: "userCtrl"
            })
            .state("app.quiz", {
                url: "/groups/:id/quiz",
                templateUrl: "app/templates/view-quiz.html",
                controller: "quizCtrl"
            });
            $urlRouterProvider.otherwise("/splash");

            // Configure tabs to be at bottom
            //$ionicConfigProvider.tabs.position("bottom");
        })

    .directive("range", function () {
        return {
            restrict: "C",
            link: function (scope, element, attr) {
                element.bind("touchstart mousedown", function (event) {
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                });
            }
        }
    });
})();