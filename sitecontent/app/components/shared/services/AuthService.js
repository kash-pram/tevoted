'use strict';

angular.module('rpOperatorApp')
  .factory('AuthService', ["$http", "$q", "$location", "$rootScope", "ngToast", "Session", "PermissionService",
    function ($http, $q, $location, $rootScope, ngToast, Session, PermissionService) {
  	var AuthService = {};

    AuthService.isAuthenticated = function(){
    	return !!(Session.user && Session.token && Session.user.id);
    }

    AuthService.login = function(obj){
    	var defer = $q.defer();
    	$http.post($rootScope.endpoint + '/auth/login', obj)
    	.success(function(res){
    		Session.create(res.token, res);
            PermissionService.addPermissions(res.authorizations);
    		defer.resolve(res);
    	})
    	.error(function(err, status){
    		defer.reject(err);
    	})
    	return defer.promise;
    }

    return AuthService;
  }]);
