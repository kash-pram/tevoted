(function(){
    var app = angular.module("seatsApp", []);

    app.directive("limitTo", [function() {
    return {
        restrict: "A",
        link: function(scope, elem, attrs) {
            var limit = parseInt(attrs.limitTo);
            angular.element(elem).on("keypress", function(e) {
                if (this.value >= limit) e.preventDefault();
            });
        }
    }
    }]);
    
    app.filter('iif', function () {
        return function(input, trueValue, falseValue) {
            return input ? trueValue : falseValue;
        };
    });
    
    app.controller("SeatSelectionCtrl", function($scope){
        $scope.init = function(){
            $scope.resName = "";
            $scope.resCount = 2;
            $scope.dynClass= "stEmpty";
            $scope.selectedSeats = 0;
            $scope.selSeatNos = [];
            
            // hooks to toggle button and seats accessibility
            $scope.enConfirm = false;
            $scope.enStart = false;
            $scope.enSeats = false;
        };

        $scope.calculateSeats = function () {
            // to calculate number of seats available
            var tmpElemsArr = document.querySelectorAll('.stEmpty');
            $scope.availableSeats = tmpElemsArr.length -1;
        };
        
        // hard-coded value for seats already booked
        $scope.booked = [
                {name: 'Prakaash', nos: 2, seats: ['E7','E8']},
                {name: 'Valavan', nos: 3, seats: ['J3','J4','J5']}
        ];
        
        angular.element(document).ready(function () {
            
            // to mark the hard-coded booked seats as Reserved
            var tmpStr;
            for(i in $scope.booked){
                for(j in $scope.booked[i]['seats']){
                    tmpStr = '#sp'+$scope.booked[i]['seats'][j];
                    angular.element(document.querySelector(tmpStr)).removeClass('stEmpty').addClass('stReserved');
                }
            }
            
            $scope.calculateSeats();
        });
        
        $scope.init();
        
        // used for ng repeat on seats table
        $scope.range = function(count){
            var ratings = [];
            for (var i = 0; i < count; i++) { 
                ratings.push(i) 
            }
            return ratings;
        };

        // on click function for Start Selecting button
        $scope.startSelecting = function () {
            $scope.enStart = false;
            $scope.enSeats = true;
            $scope.checkInputCount();
        };
        
        // to validate the Number of Seats input box
        $scope.checkInputCount = function () {
            if($('#inpt_count').val() > $scope.availableSeats) {
                $('#inpt_count').val($scope.availableSeats);
                $scope.resCount = $('#inpt_count').val();
                showToast("No. of Seats reset to maximum available.", "message");
            }
        };
        
        // to validate both the input boxes
        $scope.inputChanged = function () {
            $scope.checkInputCount();

            if($('#inpt_name').val() === "" || $('#inpt_count').val() === "" ) {
                $scope.enStart = false;
                showToast("Kindly fill all the details.", "warning");
            }
            else  if($scope.enSeats != true)
                $scope.enStart = true;
            else if($scope.enSeats === true ) {
                $scope.enSeats = false;
                $scope.enStart = true;
                // optional: reset the seats selection
            }

            $scope.chConfirm();
        };
        
        // to enable or disable the Confirm Selection button
        $scope.chConfirm = function () {
            if($scope.selectedSeats === $scope.resCount) {
                $scope.enConfirm = true;
            }
            else
                $scope.enConfirm = false;
        };
        
        // ng click of the seats (within td of the table)
        $scope.selectSeat = function($event){
            var tmpStr = $event.currentTarget.id;

            // substring of the span id will give the seat number
            tmpStr = tmpStr.substr(2);
            
            // assumption: the last value will be the dynamic class value set by the ng class
            var tmpArr = $event.currentTarget.className.split(" ");
            var tmpClass = tmpArr[tmpArr.length-1];

            // toggle class, on each seat selection till the mentioned seats are selected
            if(tmpClass === "stEmpty") {
                if($scope.selectedSeats < $scope.resCount){
                    this.dynClass = "stSelected";
                    $scope.selectedSeats +=1;
                    $scope.selSeatNos.push(tmpStr);
                } else
                    showToast("Please Confirm Selection.", "warning"); // if selection exceeds the mentioned value
            } else if (tmpClass === "stSelected") {
                this.dynClass = "stEmpty";
                $scope.selectedSeats -=1;
                
                // to remove the deselected seat number from the temporary selection array
                var tmpIndex = $scope.selSeatNos.indexOf(tmpStr);
                $scope.selSeatNos.splice(tmpIndex,1);
            }
            else
                ; // do nothing

            $scope.chConfirm();
        };
        
        $scope.confirmSeats = function () {        
            if($scope.selectedSeats < $scope.resCount){
                showToast("Please Select Seats.", "warning");
            }
            else {
                // transform the selected seats to reserved seats and update the booked history
                var tmpObj = {};
                var tmpElem;
                for(i in $scope.selSeatNos){
                    angular.element('#sp'+$scope.selSeatNos[i]).removeClass('stSelected').addClass('stReserved');
                }
                tmpObj['name'] = $scope.resName;
                tmpObj['nos'] = $scope.resCount;
                tmpObj['seats'] = $scope.selSeatNos;
                $scope.booked.push(tmpObj);
                showToast("Seats Booked!", "success");
                
                // reset
                $scope.init();
                $scope.calculateSeats();
            } 
        };
        
    });
    
})();

function showToast(msg,msgStatus) {
    if(msgStatus === "success") {
        $('#toast').css('background-color', '#DFF2BF');
        $('#toast').css('color', '#4F8A10');
    }
    else if(msgStatus === "message") {
        $('#toast').css('background-color', '#BDE5F8');
        $('#toast').css('color', '#00529B');
    }
    else if (msgStatus === "warning"){
        $('#toast').css('background-color', '#FEEFB3');
        $('#toast').css('color', '#9F6000');
    }
    else
        ;
    
    $('#toast').html(msg).clearQueue().fadeIn(400).delay(2000).fadeOut(400);
}