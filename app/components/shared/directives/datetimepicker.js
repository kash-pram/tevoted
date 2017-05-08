'use strict';

angular.module('rpOperatorApp')

  .directive('ddatetimepicker', [
    '$timeout',
    function($timeout) {
      return {
        require: '?ngModel',
        restrict: 'EA',
        scope: {
          options: '@',
          onChange: '&',
          onClick: '&',
          onRemoveClick: '&',
          includeRemove: '=?',
          readonly: '=?'
        },
        replace: true,
        template:'<div class="input-group date">'+
            '<input type="text" class="form-control" ng-readonly="readonly"/>'+
            '<span class="input-group-addon first">'+
                '<span class="glyphicon glyphicon-time"></span>'+
            '</span>'+
            '<span class="input-group-addon remove" ng-if="::includeRemove">'+
                '<span class="glyphicon glyphicon-remove"></span>'+
            '</span>'+
        '</div>',
        link: function($scope, $element, $attrs, controller) {
          $scope.options = $scope.$eval($attrs.options)
          var datetimepicker = window.datetimepicker

        /*  if(!$scope.options.defaultDate._isUtc){

            $scope.options.defaultDate.utc()
          }*/

          // Update the model
          $($element).on('dp.change', function(e) {
            $timeout(function() {

              var dtp = $($element).data('DateTimePicker');

              controller.$setViewValue(dtp.date());
              $scope.onChange();
            });
          });


          // if model changes, update the timepicker
          $scope.$watch(controller.$modelValue, function(){
            if(controller.$modelValue && !_.isEmpty(controller.$modelValue)){
              var dtp = $($element).data('DateTimePicker');
              controller.$setViewValue(controller.$modelValue);
              //$scope.onChange();  
            }
          })


          // Add onclick function, and X handling
          $element.on('click', function(e) {
            // if the remove icon is clicked, don't show the popover
            if(e.srcElement.classList.contains('glyphicon-remove')){
              $scope.picker.data("DateTimePicker").hide();
              $scope.picker.data("DateTimePicker").date(null);
              $scope.onRemoveClick()
            } else {
              $scope.onClick();
            }
          });


          controller.$render = function () {
            if (!!controller) {
              if (controller.$viewValue === undefined || !controller.$viewValue) {
                controller.$viewValue = null;
              }
              else if (!(controller.$viewValue instanceof moment)) {
                if(controller.$viewValue.length === 8){
                  // Assume 'XX:XX:XX'
                  controller.$viewValue = moment(controller.$viewValue, 'HH:mm:ss')
                }else if(controller.$viewValue.length === 5){
                  // Assume 'XX:XX'
                  controller.$viewValue = moment(controller.$viewValue, 'HH:mm')
                }else{
                  controller.$viewValue = moment(new Date(controller.$viewValue));
                }
              }
              $($element).data('DateTimePicker').date(controller.$viewValue);
            }
          };

          $scope.picker = $($element).datetimepicker($scope.options);
        }
      };
    }
  ]);