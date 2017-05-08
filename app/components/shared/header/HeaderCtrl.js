'use strict';

angular.module('rpOperatorApp')
  .controller('HeaderCtrl', ['$scope', '$state', '$rootScope', 'Session', '$uibModal', 'PermissionService',
   function($scope, $state, $rootScope, Session, $uibModal, PermissionService) {

    $scope.$state = $state;
    $rootScope.expanded = false;
    $scope.Session = Session;

    $scope.toggleSidebar = function(){
		  $rootScope.expanded = !$rootScope.expanded;
    }

    $scope.logout = function(){
    	Session.destroy();
      PermissionService.removeAllPermissions()
      $rootScope.context = {}
    	$state.go('login');
    }
    $scope.pageTitle = $rootScope.pageName;

    $scope.getPageTitle = function(name){
      if(name){
        return name
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, function(str){ return str.toUpperCase() });
      }
      return name;
    }

    $scope.openPermissionModal = function(){
      var permissionModalInstance = $uibModal.open({
        animation:true,
        templateUrl: '/components/shared/permissionModal/PermissionModalView.html',
        controller: 'PermissionModalCtrl',
        size:'md'
      })
    }

    $scope.resetPermissions = function(){
      return PermissionService.resetPermissions()
    }

    $scope.isActuallyRidepalAdmin = function(){
      return PermissionService.isActuallyRidepalAdmin();
    }

    $scope.showContext = function(){
      return angular.isDefined($rootScope.context) && !_.isEmpty($rootScope.context) && $rootScope.context.contextType != 'ridepal'
    }

    $scope.getContext = function(){
      return 'Viewing as: ' + $rootScope.context.description
    }

    

  }]);
