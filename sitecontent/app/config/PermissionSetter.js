'use strict';

angular.module('rpOperatorApp')
  .run(["$location","$rootScope","localStorageService","PermissionService",
    function($location,$rootScope,localStorageService, PermissionService){

      PermissionService.setPermissions()

  }])