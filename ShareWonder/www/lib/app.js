/**
 * Describe Salesforce object to be used in the app. For example: Below AngularJS factory shows how to describe and
 * create an 'Contact' object. And then set its type, fields, where-clause etc.
 *
 *  PS: This module is injected into ListCtrl, EditCtrl etc. controllers to further consume the object.
 */

angular.module('SeeTheWonder', ['AngularForce', 'AngularForceObjectFactory', 'Wonder__c']);

    /**
     * Configure all the AngularJS routes here.
     */
angular.module('SeeTheWonder').config(function($routeProvider) {
        $routeProvider.
        when('/about', {
            controller: 'AboutCtrl',
            templateUrl: 'partials/about.html'
        }).
        when('/logout', {
            controller: 'AboutCtrl',
            templateUrl: 'partials/logout.html'
        }).        
       when('/wonder', {
            controller: 'WonderCtrl',
            templateUrl: 'partials/wonder.html'
            }).
       when('/wonder/:wonderId', {
            controller: 'WonderDetailCtrl',
            templateUrl: 'partials/detail.html'
            }).       
       when('/camera', {
            controller: 'CameraCtrl',
            templateUrl: 'partials/camera.html'
            }).       
        otherwise({
            redirectTo: '/wonder'
        });
    });


angular.module('Wonder__c', []).factory('Wonder__c', function (AngularForceObjectFactory) {
    //Describe the contact object
    var objDesc = {
        type: 'Wonder__c',
        fields: ['Id', 'Name', 'Active__c', 'Description__c', 'Primary_Image__c'],
        where: 'Active__c = TRUE',
        orderBy: 'CreatedDate DESC',
        limit: 20
    };
    var Wonder__c = AngularForceObjectFactory(objDesc);

    return Wonder__c;
});


angular.module('SeeTheWonder').controller('AboutCtrl', ['$scope','$location','AngularForce','$rootScope',
     function($scope,$location,AngularForce,$rootScope) {
        $rootScope.buttonPrompt = "Back";
        $rootScope.doButtonAction = function() {
            $location.path("/wonder");
        }

        $scope.doLogout=function() {
            //AngularForce.logout(function() { $scope.showFinal(); });
            cordova.require("salesforce/plugin/oauth").logout();
        }
     }]);


angular.module('SeeTheWonder').controller('WonderCtrl', ['$scope', '$location', 'Wonder__c','AngularForce','SFConfig','$rootScope',
    function($scope, $location, Wonder__c,AngularForce,SFConfig,$rootScope) {
        $scope.errorMessage = null;
        $scope.instanceUrl = SFConfig.originalOptions.instanceUrl;

        $rootScope.buttonPrompt = " + ";
        $rootScope.doButtonAction = function() {
            $location.path("/camera");
        }
        $rootScope.hasButtonPrompt = function() {
            return $rootScope.buttonPrompt != null;
        }


        $scope.hasErrorMessage = function() {
            return $scope.errorMessage != null;
        }

        $scope.showDetail = function(targetId) {
            logToConsole('here I am');
            $location.path('/wonder/'+targetId);
        }

        Wonder__c.query(
            function(data) {
                $scope.records = data.records;
                $scope.$apply();               
            },
            function(data) {
                logToConsole('QUERYERROR');
                logToConsole(data);
                $scope.errorMessage = data.responseText;
                $scope.$apply();
            }
        );



    }]);

angular.module('SeeTheWonder').controller('WonderDetailCtrl', ['$scope', '$routeParams', '$location', 'Wonder__c','AngularForce','SFConfig','$rootScope',
    function($scope, $routeParams, $location, Wonder__c,AngularForce,SFConfig,$rootScope) {
        
        $rootScope.buttonPrompt = "Back";
        $rootScope.doButtonAction = function() {
            $location.path("/wonder");
        }

        $scope.instanceUrl = SFConfig.originalOptions.instanceUrl;

        $scope.targetId = $routeParams.wonderId;
        
        $scope.summary = null;

        $scope.processing = true;

        $scope.description = null;

        $scope.isWorking = function() {
            return $scope.processing;
        }

        
        $scope.doCommentOnDetail = function() {
            logToConsole("in do comment on detail");
            if (!$scope.description || $scope.description == "") {
                logToConsole("about description is " + $scope.description);
                return;
            } 
            data = {
                "comment" : $scope.description
            };

            $scope.processing = true;

            Wonder__c.apexrest(
                "/wonder/detail/"+$scope.targetId,
                function(data) {
                    logToConsole("wonder detail post comment success");
                    $scope.processing = false;
                    $scope.description = null;
                    $scope.doDisplayDetail();
                },
                function(data) {
                    logToConsole("combined failure");
                    logArray(data);
                    $scope.errorText = data.responseText;
                    $scope.processing = false;
                    $scope.$apply();
                },
                "post",
                data,
                {}, 
                false);  
        }
        
        $scope.doDisplayDetail = function() {
            Wonder__c.apexrest(
                "/wonder/detail/"+$scope.targetId,
                function(data) {
                    logToConsole("wonder detail success");
                    $scope.summary = data;
                    $scope.processing = false;

                    $scope.$apply();
                },
                function(data) {
                    logToConsole("combined failure");
                    logArray(data);
                    $scope.errorText = data.responseText;
                    $scope.processing = false;
                    $scope.$apply();
                },
                "get",
                {},
                {}, 
                false);      
        }

        $scope.doDisplayDetail();

    }]);

angular.module('SeeTheWonder').controller('CameraCtrl', ['$scope', '$location','Wonder__c','$rootScope',
        function($scope,$location,Wonder__c,$rootScope) {

        $rootScope.buttonPrompt = "Back";
        $rootScope.doButtonAction = function() {
            $location.path("/wonder");
        }


            $scope.newPicture = null;
            $scope.newWonder = null;
            $scope.status = "Ready";
            $scope.description;
            $scope.processing = false;
            $scope.errorText = null;

            $scope.imagesource = Camera.PictureSourceType.PHOTOLIBRARY;

            $scope.hasPicture = function() {
                return $scope.newPicture != null;
            }

            $scope.hasError = function() {
                return $scope.errorText != null;
            }

            $scope.isWorking = function() {
                return $scope.processing;
            }

            $scope.doList = function() {
                logToConsole('attempting to update location');
                $location.path('/wonder');
                $scope.$apply();
            }

            $scope.doPictureCamera = function() {
                $scope.imagesource = Camera.PictureSourceType.CAMERA;
                $scope.doPicture();
            };
            
            $scope.doPictureLibrary = function() {
                $scope.imagesource = Camera.PictureSourceType.PHOTOLIBRARY;
                $scope.doPicture();
            };
                                                    

                                                        
            $scope.doPicture = function() {
                var options = {
                    quality: 25,
                    correctOrientation: true,
                    // Very useful for debugging in the emulator!
                    sourceType: $scope.imagesource,
                    //sourceType: Camera.PictureSourceType.CAMERA,
                    destinationType: Camera.DestinationType.DATA_URL,
                    encodingType: Camera.EncodingType.JPEG
                };
                navigator.camera.getPicture(
                    function(imageData) {
                        $scope.status="Photo Success";
                        $scope.newPicture = imageData;
                        var image = document.getElementById('myImage');
                        image.src = "data:image/jpeg;base64," + imageData
                        $scope.$apply();
                    }, 
                    function(errorMsg) {
                        // Most likely error is user cancelling out
                        //cordova.require("salesforce/util/logger").logToConsole("Photo Error " + errorMsg);
                        $scope.status="Photo Fail";

                    }, 
                    options);            
                    return false;
                };

            $scope.doReportTheWasteCombined = function() {
                //path, callback, error, method, payload, paramMap, retry
                logToConsole("in doCombinedPost1");

                $scope.processing = true;

                data = {
                    "image" : $scope.newPicture,
                    "description" : $scope.description,
                };

                logToConsole("in doCombinedPost2");

                
                Wonder__c.apexrest(
                    "/wonderHelper",
                    function(data) {
                        logToConsole("combined success");
                        $scope.doList();
                    },
                    function(data) {
                        logToConsole("combined failure");
                        logArray(data);
                        $scope.errorText = data.responseText;
                        $scope.processing = false;
                        $scope.$apply();
                    },
                    "post",
                    data,
                    {}, 
                    false);

                

            };                   
        }]);



