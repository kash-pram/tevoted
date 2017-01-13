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
    .controller('MainCtrl', ['$scope', function($scope) {
        // INITIALIZATION AKA RESET CODE
        $scope.timerData = [{
                timerName: "testData",
                startTime: "",
                pastData: {
                    "12-Jan-2017": "22,23,58",
                    "3-Dec-2015": "0,2,32",
                    "4-Dec-2015": "0,2,32",
                    "5-Dec-2015": "0,2,32",
                    "6-Dec-2015": "0,2,32",
                    "10-Dec-2015": "0,2,32",
                    "12-Dec-2015": "0,2,32",
                    "24-Dec-2015": "0,0,32",
                    "16-Dec-2015": "0,2,32",
                    "30-Nov-2016": "4,30,32"
                }
            }];  // TO BE STORED IN DB
        $scope.cacheData = {};  // TO BE STORED IN DB
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
                    tmpData['timerName'] = $scope.currentTimer;
                    tmpData['startTime'] = "";
                    tmpData['pastData'] = {};
                    $scope.timerData.push(tmpData);
                }
                $scope.timerData[$scope.currentIndex].startTime = getTimeStamp();
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
                showToast("Timer stopped", "message");
            }
        };
        $scope.btnResetClick = function () {                
            $scope.init();
            enableInput();
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
                showToast("Kindly enter the timer name","warning");
        };
        // END EVENTS
        
        
    }]); // MAINCTRL END

})();