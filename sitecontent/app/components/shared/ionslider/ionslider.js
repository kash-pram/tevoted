'use strict';

angular.module('rpOperatorApp')
	.directive('ionslider', function() {
    return {
      restrict: 'EA',
      require: 'ngModel',
      template: '<input type="text" style="display:none"/>',
      scope:{
      	onChange: '=',
        prettify: '='
      },
      link: function(scope, element, attrs, ngModel) {
        var input = element.find('input'),
          isDouble = attrs.type === 'double';
        $(element).ionRangeSlider({
          grid: false,
          grid_snap: attrs.gridSnap,
          hide_min_max: true,
          values: scope.$eval(attrs.values),
          min_prefix: attrs.minPrefix,
          max_prefix: attrs.maxPrefix,
          min_postfix: attrs.minPostfix,
          max_postfix: attrs.maxPostfix,
          min: +attrs.min,
          max: +attrs.max,
          type: attrs.type,
          force_edges: attrs.forceEdges,
          onChange: scope.onChange,
          prettify: scope.prettify
        });
        var slider = $(element).data("ionRangeSlider");

        ngModel.$render = function() {
          var options;
          if(isDouble) {
            options = ngModel.$viewValue || {};
          } else {
            options = {
              from: ngModel.$viewValue
            };
          }
          slider.update(options);
        };
        
        $(element).on('change', function() {
          ngModel.$setViewValue(isDouble ? {from: $(element).data("from"), to: $(element).data("to")} : $(element).data("from"));
        });
        
        $(element).on('mousedown', function() {
          if(!scope.$eval(attrs.ngDisabled)) {
            $document.one('mouseup', function() {
              scope.$emit('sliderSlideFinished');
            });
          }
        });
        
        scope.$watch(attrs.ngDisabled, function(disabled) {
          slider.update({
            disable: disabled
          });
        });
            
        scope.$on('$destroy', function() {
          slider.destroy();
        });
      }
    };
	});