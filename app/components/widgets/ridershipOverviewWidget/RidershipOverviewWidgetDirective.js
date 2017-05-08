'use strict';

angular.module('rpOperatorApp')

  .directive('widgetRidership',
    function() {
      return {
        restrict: 'AE',
        scope: {
          dates: '=?',
          ridershipData: '=?',
          graphHeight: '=?',
          loadingFn: '=?'
        },
        controller: 'RidershipOverviewWidgetCtrl',
        templateUrl: '/components/widgets/ridershipOverviewWidget/RidershipOverviewWidgetView.html',
        link: function($scope, $element, $attrs, controller) {
          controller.init($scope, $element, $attrs)
        }
      };
    }
  );