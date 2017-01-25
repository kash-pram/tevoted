(function(){
    angular.module('timerApp', [])
    .filter('splitTime', function() {
        return function(input, splitChar, splitIndex) {
            return input.split(splitChar)[splitIndex];
        }
    })
    .filter('nonZero', function() {
        return function(inputVal) {
            if(parseInt(inputVal) !== 0)
                return true;
            else
                return false;
        }
    })
    .filter('nonEmpty', function() {
        return function(inputObj) {
            if(angular.equals(inputObj, {}))
                return false;
            else
                return true;
        }
    })
    /*.factory('tevotedFactory', ['$http', '$q', function($http, $q){
        var deferred = $q.defer();
        var getData = function (uriName){
            $http({
              method: 'GET',
              url: uriName
                }).then(function successCallback(response) {
                    deferred.resolve(response.data);
                }, function errorCallback(response) {
                    console.log('Error', response.data);
            });
            return deferred.promise;
        };
        return {getData:getData};
    }])*/
/*    .factory('tevotedUpdateService', ['$http', '$q', function($http, $q){
        var updateData = function(uriName, dataObj){
            var df = $q.defer();
            $http({
              method: 'PUT',
              data: dataObj,
              url: uriName
                }).then(function successCallback(response) {
                    df.resolve(response.data);
                }, function errorCallback(response) {
                    df.reject(response.data);
            });
            return df.promise;
        };
        return {updateData:updateData};
    }])*/
    .factory('tevotedUpdateService', ['$http', function($http){
        var updateData = function(uriName, dataObj){
            return $http({
              method: 'PUT',
              data: dataObj,
              url: uriName
            })
            .then(function successCallback(response) {
                return response.data;
            })
            .catch(function errorCallback(err) {
                throw err;
            });
        };
        return {updateData:updateData};
    }])
    .factory('tevotedDeleteService', ['$http', function($http){
        var deleteData = function(uriName, dataObj){
            return $http({
              method: 'PUT',
              data: dataObj,
              url: uriName
            })
            .then(function successCallback(response) {
                return response.data;
            })
            .catch(function errorCallback(err) {
                throw err;
            });
        };
        return {deleteData:deleteData};
    }])
    .factory('tevotedService', ['$http', '$q', function($http, $q){
        var getData = function (uriName){
            var deferred = $q.defer();
            $http({
              method: 'GET',
              url: uriName
                }).then(function successCallback(response) {
                    deferred.resolve(response.data);
                }, function errorCallback(response) {
                    deferred.reject(response.data);
            });
            return deferred.promise;
        };
        return {getData:getData};
    }])
    .controller('MainCtrl', ['$scope','tevotedService', 'tevotedUpdateService', 'tevotedDeleteService', function($scope, tevotedService, tevotedUpdateService, tevotedDeleteService) {

        $scope.timerData = [];
        var uriName = "https://ec2-35-164-183-71.us-west-2.compute.amazonaws.com";

        // INITIALIZATION AKA RESET CODE
        $scope.init = function(){
            $scope.tab = 1;
            $scope.timerAction = "START";
            $scope.dynClass = "startTimer";
            $scope.enTimer = false;
            $scope.currentTimer = "";
            $scope.currentIndex = -1;
        };
        $scope.init();
        // END INITIALIZATION AKA RESET CODE

        // TAB CONTROLS
        $scope.setTab = function(newTab){
            /*if(newTab === 1){
              $("#div_innerData").css("background-color", "#E0FFFF");
            } else {
              $("body").css("overflow", "auto");
            }*/
          $scope.tab = newTab;
        };
        $scope.isSet = function(tabNum){
          return $scope.tab === tabNum;
        };
        $scope.ifData = function(){
            if($scope.timerData.length === 0) {
                return false;
            }
            return true;
        };
        // END TAB CONTROLS
        
        // UTILITY
        $scope.getTimerData = function() {
            tevotedService.getData(uriName).then(function(result) {
                $scope.timerData = result;
                $(".loader").fadeOut("slow");
            }, function(reject){
                console.log('GET rejected');
            });
        };
        $scope.getTimerData();

        $scope.saveToServer = function(msg){
            var tmpObj = {
                "_id" : $scope.timerData[$scope.currentIndex]._id,
                "timerName" : $scope.timerData[$scope.currentIndex].timerName,
                "startTime" : $scope.timerData[$scope.currentIndex].startTime,
                "pastData" : $scope.timerData[$scope.currentIndex].pastData,
                "method" : "update"
            };
            tevotedUpdateService.updateData(uriName, tmpObj)
            .then(function(resolved) {
                $scope.timerData = resolved;
                $(".loader").fadeOut("slow");
            })
            .catch(function(errorData) {
                console.log(msg,' ERROR');
                showToast("There seems to be a problem. Kindly reload the page.", "warning");
            });
            /*tevotedUpdateService.updateData(uriName, tmpObj)
            .then(function(resolved) {
                $scope.timerData = resolved;
            }, function(rejected){
                console.log('PUT rejected');
            });*/
        };
        $scope.findTimer = function (tmpName) {
            var i;
            for(i=0; i < $scope.timerData.length; i++){
                if(tmpName === $scope.timerData[i].timerName){
                    $scope.currentIndex = i;
                    break;
                }
            }
        };
        $scope.isDatePresent = function (tmpDate) {
            var innerIndex = -1;
            var tmpObj = $scope.timerData[$scope.currentIndex].pastData;
            for(var dateKey in tmpObj){
                if(tmpObj.hasOwnProperty(dateKey)){
                    if(dateKey === tmpDate){
                        return true;
                    }
                }
            }
            return false;
        };
        // END UTILITY

        // EVENTS
        $scope.btnTimerClick = function() {
            if($scope.timerAction === "START"){
                $scope.dynClass = "stopTimer";
                $scope.timerAction = "STOP";
                if($scope.currentIndex === -1){
                    $scope.currentIndex = $scope.timerData.length;
                    var tmpData = {};
                    tmpData['_id'] = "";
                    tmpData['timerName'] = $scope.currentTimer;
                    tmpData['startTime'] = "";
                    tmpData['pastData'] = {};
                    $scope.timerData.push(tmpData);
                }
                $scope.timerData[$scope.currentIndex].startTime = getTimeStamp();
                $(".loader").fadeIn("slow");
                $scope.saveToServer("START");
                showToast("Timer started successfully", "success");
            } else {
                $scope.dynClass = "startTimer";
                $scope.timerAction = "START";
                
                var tmpCurrentTime = getTimeStamp();
                var tmpDate = getDateVal($scope.timerData[$scope.currentIndex].startTime);
                
                var tmpHours = getHourDiff($scope.timerData[$scope.currentIndex].startTime, tmpCurrentTime);
                var tmpMinutes = getMinSecDiff($scope.timerData[$scope.currentIndex].startTime, tmpCurrentTime, "min");
                var tmpSeconds = getMinSecDiff($scope.timerData[$scope.currentIndex].startTime, tmpCurrentTime, "sec");

                tmpHours = parseInt(tmpHours);
                tmpMinutes = parseInt(tmpMinutes);
                tmpSeconds = parseInt(tmpSeconds);

                // ADJUSTMENTS
                if(tmpMinutes !== 0){
                    tmpMinutes--;
                }
                if(tmpHours !== 0){
                    tmpHours--;
                }
                
                if($scope.isDatePresent(tmpDate)){
                    // CUMULATE
                    var tmpCumulate = $scope.timerData[$scope.currentIndex].pastData[tmpDate];
                    var tmpCumArr = tmpCumulate.split(",");
                    tmpHours = parseInt(tmpCumArr[0]) + tmpHours;
                    tmpMinutes = parseInt(tmpCumArr[1]) + tmpMinutes;
                    tmpSeconds = parseInt(tmpCumArr[2]) + tmpSeconds;
                } else {
                    // NEW ENTRY
                    $scope.timerData[$scope.currentIndex].pastData[tmpDate] = "";
                }
                
                // ADJUSTMENTS
                if((tmpSeconds/60) > 1){
                        tmpMinutes = tmpMinutes + parseInt(tmpSeconds / 60);
                        tmpSeconds = (tmpSeconds % 60);
                }
                if((tmpMinutes/60) > 1){
                        tmpHours = tmpHours + parseInt(tmpMinutes / 60);
                        tmpMinutes = (tmpMinutes % 60);
                }
                
                var tmpDuration = tmpHours + "," + tmpMinutes + "," + tmpSeconds;
                $scope.timerData[$scope.currentIndex].pastData[tmpDate] = tmpDuration;
                $scope.timerData[$scope.currentIndex].startTime = "";
                $(".loader").fadeIn("slow");
                $scope.saveToServer("PUT");
                showToast("Timer stopped", "message");
            }
        };
        $scope.btnResetClick = function () {                
            $scope.init();
            enableInput();
        };
        $scope.inpKeyPress = function ($event) {
            var tmpKeyCode = $event.which || $event.keyCode;
            if(tmpKeyCode === 13) {
                $event.preventDefault();
                $scope.btnSelectClick();
            } 
        };
        $scope.btnDeleteClick = function (timerName, timerDate, timerVal) {
            if(timerName === $scope.currentTimer){
                showToast("Kindly reset the timer.","warning");
            } else {
                $(".loader").fadeIn("slow");
                tevotedDeleteService.deleteData(uriName,
                  {
                    timerName:timerName,
                    timerDate:timerDate,
                    timerValue:timerVal,
                    method:"delete"
                  }
                ).then(function(result){
                    $scope.timerData = result;
                    $(".loader").fadeOut("slow");
                }).catch(function(errorData) {
                    console.log('DELETE ERROR');
                });
            }
        };
        $scope.btnSelectClick = function () {
            if($scope.currentTimer !== "" && $scope.currentTimer !== undefined){
                $scope.enTimer = true;
                disableInput();

                $scope.findTimer($scope.currentTimer);
                if($scope.currentIndex === -1){

                } else {
                    if($scope.timerData[$scope.currentIndex].startTime !== ""){
                        $scope.timerAction = "STOP";
                        $scope.dynClass = "stopTimer";
                        showToast("Timer already running", "warning");
                    }
                    else {
                        $scope.timerAction = "START";
                        $scope.dynClass = "startTimer";
                    }
                }
            }
            else
                showToast("Kindly enter a timer name","warning");
        };
        // END EVENTS

    }]); // MAINCTRL END

})();