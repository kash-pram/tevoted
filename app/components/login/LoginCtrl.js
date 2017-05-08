'use strict';

angular.module('rpOperatorApp')
  .controller('LoginCtrl', ["$scope", "$location","$rootScope","AuthService", "$stateParams", "$state", 
	function($scope, $location, $rootScope, AuthService, $stateParams, $state) {
  	$rootScope.expanded = false;

  	$scope.loginObj = {};

    $scope.submit = function() {
    	AuthService.login($scope.loginObj).then(
    		function(response){
  				$state.go( $scope.loginDestination() );
    		});

		  return false;
    }

    $scope.loginDestination = function(){
      if($rootScope.highestRole == 'admin')
        return 'home'
      else if($rootScope.highestRole == 'operator')
        return 'dispatchDashboard'
      else if($rootScope.highestRole == 'corpAdmin')
        return 'home'
      else
        return 'home'
    }

  }]);
