'use strict';

angular.module('rpOperatorApp')

  .directive('widgetCorp',
    function() {
      return {
        restrict: 'AE',
        scope: {
          dates: '=?',
          loadingFn: '=?',
          ridershipData: '=?',
          capacityData: '=?',
          onTimeData: '=?'
        },
        controller: 'CorpOverviewWidgetCtrl',
        templateUrl: '/components/widgets/corpOverviewWidget/CorpOverviewWidgetView.html',
        link: function($scope, $element, $attrs, controller) {
          controller.init($scope, $element, $attrs)
        }
      };
    }
  );