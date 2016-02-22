(function () {
    "use strict";

    angular.module("myapp.services", []).factory("myappService", ["$rootScope", "$http", "$q", function ($rootScope, $http, $q) {
        var myappService = {};

        // Private variables
        var authContext = null;
        var graphResource = "https://graph.microsoft.com";
        var groupGeniusResource = "https://rzdemos.onmicrosoft.com/groupgenius";
        var groups = null;
        var activeGroup = null;
        var appFolderId = null;  //TODO: change to group

        // Public variables
        myappService.groupIcon = "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkZFQkUxQzU2RDA3NzExRTVBNkM0RkQ3NUEyODVCRUYwIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkZFQkUxQzU3RDA3NzExRTVBNkM0RkQ3NUEyODVCRUYwIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RkVCRTFDNTREMDc3MTFFNUE2QzRGRDc1QTI4NUJFRjAiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RkVCRTFDNTVEMDc3MTFFNUE2QzRGRDc1QTI4NUJFRjAiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5y5tj0AAAEyElEQVR42uxYaSh1XRR+7zXzmed5zJAIRZmLkPwyR5JMIcr4UxnyR4gyJWMoU8Yyy5CZkMgUIiRTyDy+T++p081wr3tfbm9fZ/847fY+a59nr/WsZ617aSsrK7/+vUH/9U8OChYFi4JFwaJgfcvg/cpL9/f3Y2NjKFNKSkr29vZSUlJsfePu7m50dHRtbU1VVdXOzk5CQuIbYD09PdXX1zc0NGxtbcnIyGxsbERERIiJiX0R0/Pzc21tbWNj4+7urpycHMxDQ0PFxcWZW9GYl+qHh4eYmJiRkREcpKend3h4iNP19fVLS0ulpaVZYoJ5QkJCf38/HKyjo3NwcLC3t6etrV1eXg6InHOrtbUVmMzNzbu7u6uqqjo7OwMDA1dXV7Oysr7iqrq6OmCytbXt6emBeVdXl6+v7+bmZlFR0V95KyAgYH5+vr29HVckg+Ls7Hx+fj44OMgylN7e3rgD0KioqJA0dXR0fHl5GRgYEBIS4tBbZ2dn/Pz8ioqK5AoPD4+ysvLNzc3t7S1z29fXV5gLCwsrKCiQiwICAjjt4uICecB5EA0NDWGPQJAr29vbi4uLyClJSUkWgaDRwMLLy0v4lVyE85CSWlpazD3NEx0dzWRbXl6+paUF6Q3OgvVLS0uJiYnwQWxsrImJCfkavg0un56eIsQiIiKM5iAA2CkrKysqKrqwsJCUlARXxcfH48KccwujoKAgPz+fuD3igomrq2tOTg6xu7Ozg6wEe66vr4l3bGxskBZ4Ei+UlZUR+UGaOzg44EzmH2XhLVwUWXN1dcXLy4uo0en0x8dHOAYrVlZW09PTQUFB8AFk1t/fH1DgrYmJiY6ODkFBQTMzM/C6uLgYvuTj44OKAhnM9/f3QQxLS0sOvYUtfAy5ExYWhpyCloLpU1NTmZmZEDC4ZGhoCDIWFxcHcMgMwmp4eDg5Ofn4+Dg8PLy6uhoIoqKiPDw8QAN4dHx8PC8vD8hAhpCQELZhQQlhNjs7m5ub6+LiwriFQyEcQIY5uBIcHPzGdnl5GffBCZgjgm5uboy7MIR6QWIQeriZvUycm5sDJgsLizeYMCAQkZGRmEDo/fz8PsxflE5M8HyDCQN6gQsDdG9vL9sCAcaAT6isH+4SzMDnP5NEFAY8ra2tP9zFOsiHWsR2qUaY3N3dP6up4Bl0EoH4zBw5gaeBgcGHu5qamn19fZBWtmH992d8tgsnofSCQ6C8mprae31HDYWz1dXVP44RnY6L/Ugb6OPjAznIyMhAqr7ZQoOwvr7u5OQEFeXscBrH/0EAEzIfwmZsbAzxMzU1hXugrhUVFW1tbQCELo2xmHIJFhEsVCEioSBLgHVycoLuAO1GYWHh++ByqZdHJ40CR/YaR0dHwER0GX/5RxDn3srOzkY1xATh8/T01NDQQG2B0jY3N09OTmLdy8srNTUV7OYeLAITdDUlJYWsyuRA55iWloYehmNknFwFZAImiHVNTc17TIT/Kisr0fs3NTWB+NzgFn4Igc6YwE+MbeebAR1OT08HyUpKSlj2sd8Aa+3PQNNCVD0mw8jICNKFwjwzM/PjsFC/yZrIcqAnwxNt2Y/DQlx0dXXhra+8jF4eLyNDuSqn1D82FCwKFgWLgkXB+h/B+i3AAEW7ZCvqKY+1AAAAAElFTkSuQmCC";
        myappService.userIcon = "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjA2RDdDNzk5RDA3ODExRTVBRDI4QUM1OUE1NUI1MTY5IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjA2RDdDNzlBRDA3ODExRTVBRDI4QUM1OUE1NUI1MTY5Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MDZEN0M3OTdEMDc4MTFFNUFEMjhBQzU5QTU1QjUxNjkiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MDZEN0M3OThEMDc4MTFFNUFEMjhBQzU5QTU1QjUxNjkiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz466kUuAAAChUlEQVR42uyXPUiyURTH08SSJCmXUCE08AOhJV0MEnHJWRGnbFDc3fxACaIWwcWPyUWQCHUWBGlJKUREHLRFXDQQAkHzAxT7wwPy8lYvvYpPDvcMl8u557n8OOfcc87DqNVqG+snzI21FIJFsAgWwSJYBItgrTUWa/krer1eoVB4enoaj8cKhUKv1wsEgiXvZCw5b728vIRCocfHx9FoRGmOj48vLy8NBsOvYWUyGbfbDSAej6dWq/f29qrVar1ex9HFxYXL5fqFIDYaDY/HAya73W6z2XZ3dyl9qVQCazweF4vFFouF7pQPBALD4dBkMjmdzjkT5OTkJBKJbG1tIbjzyNKE1e12i8Xi5uam1Wr9fHp0dHR2dvb29lYul+nG6vf7+/v7iNSXBiqVCmu73aYVi8/nczic9/d3VIcvDTqdDlaEklYsLpcrEokGg0E+n//SIJfLYVUqlbRiMRgMs9lMJX6z2fz8GqA8PT39LsQrrFuTyQTFCUmNgDocDkCgeuG2ZDKZzWZ3dnbu7++R+79QTtFtUDNRVCn/sdlsaLCXyWTBYHBhVy3bqiuVCpXakNlsRjFRjlz4DS7rLSRQLBbDBuFDez48PGQyma1WC8n+8PAAPSqt3+9nsRZpJAs2n9vbW7SXg4MDr9cLpj+PjEYjKq3P50ulUnDh9fU1TUGEP8AkFArv7u7+YqIEbTuRSGDISafTeAF0YE2n03A4jM3V1RW89Z0ZGsDNzQ26UzQanefcCrEwOCAdNRoNUurflnK5XKfTvb6+LtAZ/xvr+fkZ6/n5+U+MtVrt/JPVYiEiUqlUIpH8xBhDDoy3t7fpHprJDxnBIlgEi2ARLIJFsNZGPgQYAOMZDFo+ARHMAAAAAElFTkSuQmCC";

        //starts and stops the application waiting indicator
        myappService.wait = function (show) {
            if (show)
                $(".spinner").show();
            else
                $(".spinner").hide();
        };

        // Gets all groups for the signed in user
        myappService.getGroups = function (refresh) {
            var deferred = $q.defer();

            if (groups !== null && !refresh)
                deferred.resolve(groups);
            else {
                // Try to get token to call into the Microsoft Graph
                getTokenForResource(graphResource).then(function (token) {
                    $http.defaults.headers.common["Authorization"] = "Bearer " + token.accessToken;
                    $http.defaults.headers.post["accept"] = "application/json;odata=verbose";
                    $http.get(graphResource + "/beta/me/joinedgroups").then(function (r) {
                        groups = r.data.value;
                        deferred.resolve(groups);
                    }, function (err) {
                        // Error calling API...reject the promise
                        deferred.reject(err);
                    });
                }, function (err) {
                    // Error occurred getting token...reject the promise
                    deferred.reject(err);
                });
            }

            return deferred.promise;
        };

        // Gets specific group by id
        myappService.getGroup = function (id) {
            var deferred = $q.defer();
            
            if (activeGroup != null && id === activeGroup.id)
                deferred.resolve(activeGroup);
            else {
                myappService.getGroups(false).then(function (g) {
                    activeGroup = null;
                    for (var i = 0; i < g.length; i++) {
                        if (g[i].id == id) {
                            activeGroup = g[i];
                            break;
                        }
                    }
                    deferred.resolve(activeGroup);
                });
            }

            return deferred.promise;
        };

        // Gets group members for a specific group
        myappService.members = [];
        myappService.getGroupMembers = function (id) {
            var deferred = $q.defer();

            // Try to get token to call into the Microsoft Graph
            getTokenForResource(graphResource).then(function (token) {
                $http.defaults.headers.common["Authorization"] = "Bearer " + token.accessToken;
                $http.defaults.headers.post["accept"] = "application/json;odata=verbose";
                $http.get(graphResource + "/beta/myorganization/groups/" + id + "/members").then(function (r) {
                    myappService.members = r.data.value;
                    deferred.resolve(myappService.members);
                }, function (err) {
                    // Error calling API...reject the promise
                    deferred.reject(err);
                });
            }, function (err) {
                // Error occurred getting token...reject the promise
                deferred.reject(err);
            });

            return deferred.promise;
        };

        // Gets group photos for a specific group
        myappService.getGroupPhotos = function (group) {
            var deferred = $q.defer();

            getTokenForResource(groupGeniusResource).then(function (token) {
                $http.defaults.headers.common["Authorization"] = "Bearer " + token.accessToken;
                $http.defaults.headers.post["accept"] = "application/json;odata=verbose";
                $http.get("https://groupgenius.azurewebsites.net/api/photo/" + group.id).then(function (r) {
                    deferred.resolve(r.data);
                }, function (err) {
                    // Error occurred calling API...reject the promise
                    deferred.reject(err);
                });
            }, function (err) {
                // Error occurred getting token...reject the promise
                deferred.reject(err);
            });
            
            return deferred.promise;
        };

        // Loads a photo from the files of a unified group
        myappService.loadGroupPhoto = function (groupid, obj) {
            var deferred = $q.defer();

            // Try to get token to call into the Microsoft Graph
            getTokenForResource(graphResource).then(function (token) {
                $http.defaults.headers.common["Authorization"] = "Bearer " + token.accessToken;
                $http.defaults.headers.post["accept"] = "application/json;odata=verbose";
                $http.get(graphResource + "/beta/myorganization/groups/" + groupid + "/drive/items/" + obj.onedrive_id + "/thumbnails").then(function (r) {
                    // Now make a call using the small thumbnail
                    var resource = r.data.value[0].small.url.substring(8);
                    resource = "https://" + resource.substring(0, resource.indexOf('/'));

                    // Try to get token to call into SharePoint for files
                    getTokenForResource(resource).then(function (token) {
                        // Get the image thumbnail
                        $http.defaults.headers.common["Authorization"] = "Bearer " + token.accessToken;
                        $http.defaults.headers.post["accept"] = "application/json;odata=verbose";
                        $http.get(r.data.value[0].small.url, { responseType: "blob" }).then(function (image) {
                            // Convert blob into image that app can display
                            var url = window.URL || window.webkitURL;
                            var blobUrl = url.createObjectURL(image.data);
                            obj.img = blobUrl;
                            deferred.resolve(obj);
                        }, function (err) {
                            // Error calling API...reject the promise
                            deferred.reject(err);
                        });
                    }, function (err) {
                        // Error occurred getting token...reject the promise
                        deferred.reject(err);
                    });
                }, function (err) {
                    // Error calling API...reject the promise
                    deferred.reject(err);
                });
            }, function (err) {
                // Error occurred getting token...reject the promise
                deferred.reject(err);
            });

            return deferred.promise;
        };

        // Loads a photo for a specific object using the provided url
        myappService.loadPhoto = function (obj, url) {
            var deferred = $q.defer();

            // Try to get token to call into the Microsoft Graph
            getTokenForResource(graphResource).then(function (token) {
                $http.defaults.headers.common["Authorization"] = "Bearer " + token.accessToken;
                $http.defaults.headers.post["accept"] = "application/json;odata=verbose";
                $http.get(url, { responseType: "blob" }).then(function (image) {
                    // Convert blob into image that app can display
                    var url = window.URL || window.webkitURL;
                    var blobUrl = url.createObjectURL(image.data);
                    obj.img = blobUrl;
                    deferred.resolve(obj);
                }, function (err) {
                    // Error calling API...reject the promise
                    deferred.reject(err);
                });
            }, function (err) {
                // Error occurred getting token...reject the promise
                deferred.reject(err);
            });

            return deferred.promise;
        };

        // Ensure GroupGenius folder exists
        myappService.ensureAppFolder = function (group) {
            var deferred = $q.defer();

            if (group.appFolderId)
                deferred.resolve(group.appFolderId);
            else {
                // Try to get token to call into the Microsoft Graph
                getTokenForResource(graphResource).then(function (token) {
                    // First get all root items to check for the GroupGenius folder
                    $http.defaults.headers.common["Authorization"] = "Bearer " + token.accessToken;
                    $http.defaults.headers.post["accept"] = "application/json;odata=verbose";
                    $http.get(graphResource + "/beta/myorganization/groups/" + group.id + "/drive/root/children").then(function (r) {
                        var files = [];
                        for (var i = 0; i < r.data.value.length; i++) {
                            if (r.data.value[i].size === 0 && r.data.value[i].name === "GroupGenuis") {
                                group.appFolderId = r.data.value[i].id;
                                break;
                            }
                        }

                        // Check if the app folder exists
                        if (group.appFolderId) {
                            deferred.resolve(group.appFolderId);
                        }
                        else {
                            $http.defaults.headers.common["Authorization"] = "Bearer " + token.accessToken;
                            $http.defaults.headers.post["accept"] = "application/json;odata=verbose";
                            $http.post(graphResource + "/beta/myorganization/groups/" + group.id + "/drive/root/children", { "name": "GroupGenuis", "folder": { "@odata.type": "microsoft.graph.folder" }, }).then(function (folder) {
                                group.appFolderId = folder.data.id;
                                deferred.resolve(group.appFolderId);
                            }, function (err) {
                                // Error occurred creating folder...reject the promise
                                deferred.reject(err);
                            });
                        }
                    });
                }, function (err) {
                    // Error occurred getting token...reject the promise
                    deferred.reject(err);
                });
            }

            return deferred.promise;
        };

        // Uploads a photo into the files for the group
        myappService.uploadPhoto = function (data, group) {
            var deferred = $q.defer();

            //ensure the GroupGenius folder exists
            myappService.ensureAppFolder(group).then(function (folder_id) {
                group.appFolderId = folder_id;

                // First get token for group genius
                getTokenForResource(groupGeniusResource).then(function (ggToken) {
                    // Try to get token to call into the Microsoft Graph
                    getTokenForResource(graphResource).then(function (graphToken) {
                        var url = "https://groupgenius.azurewebsites.net/api/photo/" + group.appFolderId + "?group_id=" + group.id + "&access_token=" + graphToken.accessToken;
                        $http({
                            method: "POST",
                            url: url,
                            headers: {
                                "Authorization": "Bearer " + ggToken.accessToken,
                                "Accept": "application/json;odata=verbose"
                            },
                            data: data,
                            transformRequest: []
                        }).success(function (r) {
                            // Convert blob into image that app can display
                            deferred.resolve(r);
                        }).error(function (err) {
                            // Error occurred uploading image...reject the promise
                            deferred.reject(err);
                        });


                        //var url = graphResource + "/beta/myorganization/groups/" + group.id + "/drive/items/" + group.appFolderId + "/children/" + filename + "/content";
                        //var imgData = getBinaryFileContents(data);
                        //$http({
                        //    method: "PUT",
                        //    url: url,
                        //    headers: {
                        //        "Authorization": "Bearer " + token.accessToken,
                        //        "Accept": "application/json;odata.metadata=full"
                        //    },
                        //    data: imgData,
                        //    transformRequest: []
                        //})
                    }, function (err) {
                        // Error occurred getting token...reject the promise
                        deferred.reject(err);
                    });
                }, function (err) {
                    // Error occurred getting token...reject the promise
                    deferred.reject(err);
                });
            }, function (err) {
                // Error ensuring app folder exists...reject the promise
                deferred.reject(err);
            });

            return deferred.promise;
        };

        // Saves face tags for a photo
        myappService.saveTags = function (id, tags) {
            var deferred = $q.defer();

            // First get token for group genius
            getTokenForResource(groupGeniusResource).then(function (token) {
                var url = "https://groupgenius.azurewebsites.net/api/photo/tag/" + id ;
                $http({
                    method: "POST",
                    url: url,
                    headers: {
                        "Authorization": "Bearer " + token.accessToken,
                        "Accept": "application/json;odata=verbose"
                    },
                    data: JSON.stringify(tags),
                    transformRequest: []
                }).success(function (r) {
                    // Convert blob into image that app can display
                    deferred.resolve(r);
                }).error(function (err) {
                    // Error occurred uploading image...reject the promise
                    deferred.reject(err);
                });
            }, function (err) {
                // Error occurred getting token...reject the promise
                deferred.reject(err);
            });

            return deferred.promise;
        };

        // Gets a quiz for a group with a specified amount of questions
        myappService.getQuiz = function (group_id, questions, members) {
            var deferred = $q.defer();

            // First get token for group genius
            getTokenForResource(groupGeniusResource).then(function (token) {
                var url = "https://groupgenius.azurewebsites.net/api/quiz/" + group_id + "/" + questions;
                $http({
                    method: "POST",
                    url: url,
                    headers: {
                        "Authorization": "Bearer " + token.accessToken,
                        "Accept": "application/json;odata=verbose"
                    },
                    data: JSON.stringify(members),
                    transformRequest: []
                }).success(function (r) {
                    // Convert blob into image that app can display
                    deferred.resolve(r);
                }).error(function (err) {
                    // Error occurred uploading image...reject the promise
                    deferred.reject(err);
                });
            }, function (err) {
                // Error occurred getting token...reject the promise
                deferred.reject(err);
            });

            return deferred.promise;
        };

        // Submits quiz results
        myappService.lastQuizTaken = null;
        myappService.submitQuizResults = function (group_id, questions, correct) {
            var deferred = $q.defer();

            // First get token for group genius
            getTokenForResource(groupGeniusResource).then(function (token) {
                var url = "https://groupgenius.azurewebsites.net/api/quiz/";
                $http({
                    method: "POST",
                    url: url,
                    headers: {
                        "Authorization": "Bearer " + token.accessToken,
                        "Accept": "application/json;odata=verbose"
                    },
                    data: JSON.stringify({ group_id: group_id, questions: questions, correct: correct }),
                    transformRequest: []
                }).success(function (r) {
                    myappService.lastQuizTaken = r;
                    deferred.resolve(r);
                }).error(function (err) {
                    // Error occurred uploading image...reject the promise
                    deferred.reject(err);
                });
            }, function (err) {
                // Error occurred getting token...reject the promise
                deferred.reject(err);
            });

            return deferred.promise;
        };

        myappService.getLeaderboard = function (group_id) {
            var deferred = $q.defer();

            // First get token for group genius
            getTokenForResource(groupGeniusResource).then(function (token) {
                var url = "https://groupgenius.azurewebsites.net/api/quiz/" + group_id;
                $http({
                    method: "GET",
                    url: url,
                    headers: {
                        "Authorization": "Bearer " + token.accessToken,
                        "Accept": "application/json;odata=verbose"
                    }
                }).success(function (r) {
                    deferred.resolve(r);
                }).error(function (err) {
                    // Error occurred uploading image...reject the promise
                    deferred.reject(err);
                });
            }, function (err) {
                // Error occurred getting token...reject the promise
                deferred.reject(err);
            });

            return deferred.promise;
        };

        myappService.broadcastError = function (err) {
            $rootScope.$broadcast("error", err);
        };

        myappService.getById = function (list, id) {
            var obj = {};
            for (var i = 0; i < list.length; i++) {
                if (list[i].id === id) {
                    obj = list[i];
                    break;
                }
            }
            return obj;
        };

        myappService.orientationChange = function (portrait) {
            $rootScope.$broadcast("orientationChange", portrait);
        };






























        // The following are authentication functions
        myappService.tryLoginSilent = function () {
            var deferred = $q.defer();

            getAuthContext().then(function (context) {
                // First try to get the token silently
                getTokenForResourceSilent(context, graphResource).then(function (token) {
                    deferred.resolve(true);
                }, function (err) {
                    deferred.resolve(false);
                });
            }, function (err) {
                deferred.resolve(false);
            });

            return deferred.promise;
        };

        myappService.tryLoginExplicit = function () {
            var deferred = $q.defer();

            getTokenForResource(graphResource).then(function (token) {
                deferred.resolve(true);
            }, function (err) {
                deferred.resolve(false);
            });

            return deferred.promise;
        };


        //get access token for a specific resource
        var getTokenForResource = function (resource) {
            var deferred = $q.defer();

            getAuthContext().then(function (context) {
                // First try to get the token silently
                getTokenForResourceSilent(context, resource).then(function (token) {
                    // We were able to get the token silently...return it
                    deferred.resolve(token);
                }, function (err) {
                    // We failed to get the token silently...try getting it with user interaction
                    authContext.acquireTokenAsync(resource, O365.clientId, O365.redirectUri).then(function (token) {
                        // Resolve the promise with the token
                        deferred.resolve(token);
                    }, function (err) {
                        // Reject the promise
                        deferred.reject("Error getting token");
                    });
                });
            });

            return deferred.promise;
        };

        var getTokenForResourceSilent = function (context, resource) {
            var deferred = $q.defer();

            // read the tokenCache
            context.tokenCache.readItems().then(function (cacheItems) {
                // Try to get the roken silently
                var userId;
                if (cacheItems.length > 1) {
                    userId = cacheItems[0].userInfo.userId;
                }
                context.acquireTokenSilentAsync(resource, O365.clientId, userId).then(function (authResult) {
                    // Resolve the authResult from the silent token call
                    deferred.resolve(authResult);
                }, function (err) {
                    // Error getting token silent...reject the promise
                    deferred.reject("Error getting token silent");
                });
            }, function (err) {
                // Error getting cached data...reject the promise
                deferred.reject("Error reading token cache");
            });

            return deferred.promise;
        };

        var getAuthContext = function () {
            var deferred = $q.defer();

            // Check if authContext is already initialized
            if (!authContext) {
                // authContext is null...initialize it
                authContext = Microsoft.ADAL.AuthenticationContext;
                authContext.createAsync(O365.authUri).then(function (context) {
                    // authContext is initialized...resolve in promise
                    authContext = context;
                    deferred.resolve(authContext);
                }, function (err) {
                    // authContext creation failed...reject the promise
                    authContext = null;
                    deferred.reject("Error creating auth context");
                });
            }
            else {
                // authContext is already initialized so resolve in promise
                deferred.resolve(authContext);
            }

            return deferred.promise;
        };

        return myappService;
    }]);
})();