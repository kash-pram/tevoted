'use strict';

angular.module('rpOperatorApp')
.directive('createStop', function () {
  return {
    restrict: 'E',
    templateUrl: '/components/routePlanning/createStop/CreateStopView.html',
    controller: 'CreateStopCtrl',
    scope: {
    	isVisible: '=',
    	onAddressSelect: '=',
    	mapInstance: "=",
      geoCodeFn: '=',
    	stop: '=?'
    },
    link: function ($scope, $element, attrs, CreateStopCtrl) {
      CreateStopCtrl.init( $element )
    }
  };
});