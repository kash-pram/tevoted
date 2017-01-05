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
            $scope.resCount = 2;
            $scope.dynClass= "stEmpty";
            $scope.resName = "";
            $scope.selectedSeats = 0;
            $scope.selSeatNos = [];
            $scope.enConfirm = false;
            $scope.enStart = false;
            $scope.enSeats = false;
        };

        $scope.calculateSeats = function () {
            var tmpElemsArr = document.querySelectorAll('.stEmpty');
            $scope.availableSeats = tmpElemsArr.length -1;
        };
        
        $scope.booked = [
                {name: 'Prakaash', nos: 2, seats: ['E7','E8']},
                {name: 'Valavan', nos: 3, seats: ['J3','J4','J5']}
        ];
        
        angular.element(document).ready(function () {
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
        
        $scope.range = function(count){
            var ratings = [];
            for (var i = 0; i < count; i++) { 
                ratings.push(i) 
            }
            return ratings;
        };

        $scope.startSelecting = function (rname,rcount) {
            $scope.enStart = false;
            $scope.enSeats = true;
            $scope.checkInputCount();
        };
        
        $scope.checkInputCount = function () {
            if($('#inpt_count').val() > $scope.availableSeats) {
                $('#inpt_count').val($scope.availableSeats);
                $scope.resCount = $('#inpt_count').val();
                showToast("No. of Seats reset to maximum available.");
            }
        };
        
        $scope.inputChanged = function () {        

            $scope.checkInputCount();

            if($('#inpt_name').val() === "" || $('#inpt_count').val() === "" ) {
                $scope.enStart = false;
                showToast("Kindly fill all the details.");
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
        
        $scope.chConfirm = function () {
            if($scope.selectedSeats === $scope.resCount) {
                $scope.enConfirm = true;
            }
            else
                $scope.enConfirm = false;
        };
        
        $scope.selectSeat = function($event){
            var tmpStr = $event.currentTarget.id;
            tmpStr = tmpStr.substr(2);
            var tmpClass = $event.currentTarget.className.split(" ")[3];

            if(tmpClass === "stEmpty") {
                if($scope.selectedSeats < $scope.resCount){
                    this.dynClass = "stSelected";
                    $scope.selectedSeats +=1;
                    $scope.selSeatNos.push(tmpStr);
                } else
                    showToast('Please Confirm Selection.');
            } else if (tmpClass === "stSelected") {
                this.dynClass = "stEmpty";
                $scope.selectedSeats -=1;
                
                var tmpIndex = $scope.selSeatNos.indexOf(tmpStr);
                $scope.selSeatNos.splice(tmpIndex,1);
            }
            else
                ; // do nothing

            $scope.chConfirm();
        };
        
        $scope.confirmSeats = function () {        
            if($scope.selectedSeats < $scope.resCount){
                showToast("Please Select Seats");
            }
            else {
                var tmpObj = {};
                var tmpElem;
                for(i in $scope.selSeatNos){
                    angular.element('#sp'+$scope.selSeatNos[i]).removeClass('stSelected').addClass('stReserved');
                }
                tmpObj['name'] = $scope.resName;
                tmpObj['nos'] = $scope.resCount;
                tmpObj['seats'] = $scope.selSeatNos;
                $scope.booked.push(tmpObj);
                showToast("Seats Booked!");
                
                // reset
                $scope.init();
                $scope.calculateSeats();
            } 
        };
        
    });
    
})();

function showToast(msg) {
    $('#toast').html(msg).clearQueue().fadeIn(400).delay(2000).fadeOut(400);
}