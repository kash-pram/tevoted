(function(){
    
    angular.module('timerApp', [])
    .controller('MainCtrl', ['$scope', function($scope) {

        // INITIALIZATION AKA RESET CODE
        $scope.timerData = [{
                timerName: "dataOne",
                startTime: "",
                pastData: {
                    "22-10-2017": "22-hrs/23-mins",
                    "30-11-2016": "2-mins/32-secs"
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
            var i, tmpFlag=false;
            for(i=0; i < $scope.timerData.length; i++){
                if(tmpName === $scope.timerData[i].timerName){
                    tmpFlag = true;
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
                    if(tmpObj[dateKey] === tmpDate){
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
                /*var tmpHours = getHourDiff("Wed, 11 Jan 2017 17:15:10 GMT", "Wed, 11 Jan 2017 17:15:58 GMT");
                var tmpMinutes = getMinSecDiff("Wed, 11 Jan 2017 17:15:10 GMT", "Wed, 11 Jan 2017 17:15:58 GMT", "min");
                var tmpSeconds = getMinSecDiff("Wed, 11 Jan 2017 17:15:10 GMT", "Wed, 11 Jan 2017 17:15:58 GMT", "sec");*/

                console.log("data date: "+tmpDate);
                console.log("Total Duration is: ");
                console.log((tmpHours-1)+" Hours");
                console.log((tmpMinutes-1)+" Minutes");
                console.log(tmpSeconds + " Seconds");

                // IF THE VALUE IS NON-ZERO
                // DO A  - MINUS ONE - TO THE HOURS AND MINUTES
                
                /*if($scope.isDatePresent(tmpDate)){
                    // CUMULATIVE
                    
                } else {
                    ADD DATE ENTRY
                }*/
                
                // DO THE MINUTES TO HOURS, SECONDS TO MINUTES
                
                // ADD THE NEW VALUE TO DATA ENTRY
                
                $scope.timerData[$scope.currentIndex].startTime = "";
                showToast("Timer stopped", "message");
            }
        };
        $scope.btnResetClick = function () {                
            $scope.init();
        };
        $scope.btnSelectClick = function () {

            // only if currentTimer is set
            $scope.enTimer = true;
            
            $scope.findTimer($scope.currentTimer);
            if($scope.currentIndex === -1){
                $scope.currentIndex = $scope.timerData.length;
                var tmpData = {};
                tmpData['timerName'] = $scope.currentTimer;
                tmpData['startTime'] = "";
                tmpData['pastData'] = {};
                $scope.timerData.push(tmpData);
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
        };
        // END EVENTS
        
        
    }]); // MAINCTRL END

})();