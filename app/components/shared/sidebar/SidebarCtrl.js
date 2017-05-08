'use strict';

angular.module('rpOperatorApp')
  .controller('SidebarCtrl', ["$scope", "$location", "$state","Session","$rootScope", function($scope, $location, $state, Session, $rootScope) {

  	$scope.$state = $state;

  	$scope.getOperatorEndpoint = function(){
  		return $rootScope.operatorEndpoint;
  	}

  	$scope.Session = Session;

  }]);
