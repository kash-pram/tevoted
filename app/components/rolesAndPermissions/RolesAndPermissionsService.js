'use strict';

angular.module('rpOperatorApp')
	.service('RolesAndPermissionsService', ["$q","$http", "$rootScope",
		function ($q,$http,$rootScope) {

	    this.getRoles = function(){
	      var defer = $q.defer();
	    	$http.get($rootScope.newEndpoint + "/role")
	    		.success(function(res){
	    			defer.resolve(res);
	    		})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	    this.getRoleAndPermissions = function(role){
	    	var defer = $q.defer();
	    	$http.get($rootScope.newEndpoint + "/role/"+role.context_type+'/'+role.name+'/'+role.context_id)
	    		.success(function(res){
	    			defer.resolve(res);
	    		})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	    this.getUsersWithRole = function(roleId){
	    	var defer = $q.defer();
	    	$http.get($rootScope.newEndpoint + "/user/role/"+roleId)
	    		.success(function(res){
	    			defer.resolve(res);
	    		})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	    this.searchUsers = function(searchString){
	    	var defer = $q.defer();
	    	$http.get($rootScope.newEndpoint + "/user/search/"+searchString)
	    		.success(function(res){
	    			defer.resolve(res);
	    		})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	    this.getPermissions = function(){
	    	var defer = $q.defer();
	    	$http.get($rootScope.newEndpoint + "/permission")
	    		.success(function(res){
	    			defer.resolve(res);
	    		})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	    this.createRole = function(role){
	    	var defer = $q.defer();
	    	$http.post($rootScope.newEndpoint + "/role", role)
	    		.success(function(res){
	    			defer.resolve(res);
	    		})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	    this.createPermission = function(permission){
	    	var defer = $q.defer();
	    	$http.post($rootScope.newEndpoint + "/permission", permission)
	    		.success(function(res){
	    			defer.resolve(res);
	    		})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	    this.attachPermissionToRole = function(permissionId, roleId){
	    	var defer = $q.defer();
	    	$http.post($rootScope.newEndpoint + "/permission/role", {permission_id:permissionId,role_id:roleId})
	    		.success(function(res){
	    			defer.resolve(res);
	    		})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	    this.detachPermissionFromRole = function(permissionId, roleId){
	    	var defer = $q.defer();
	    	$http({
	    		url: $rootScope.newEndpoint + "/permission/role",
	    		data: {permission_id:permissionId,role_id:roleId},
	    		method: 'DELETE'
	    	})
	    		.success(function(res){
	    			defer.resolve(res);
	    		})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	    this.attachRoleToUser = function(userId, roleId){
	    	var defer = $q.defer();
	    	$http.post($rootScope.newEndpoint + "/user/role", {user_id:userId,role_id:roleId})
	    		.success(function(res){
	    			defer.resolve(res);
	    		})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	    this.detachRoleFromUser = function(userId, roleId){
	    	var defer = $q.defer();
	    	$http({
	    		url: $rootScope.newEndpoint + "/user/role",
	    		data: {user_id:userId,role_id:roleId},
	    		method: 'DELETE'
	    	})
	    		.success(function(res){
	    			defer.resolve(res);
	    		})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	    this.getCompanies = function(){
      	var defer = $q.defer();
	
    		$http.get($rootScope.endpoint + '/admin/company')
    			.success(defer.resolve)
   				.error(function(err, status){defer.reject(err);})
			
				return defer.promise;
	    }

	    this.getOperators = function(){
	    	var defer = $q.defer();
			
	    	$http.get($rootScope.endpoint + '/operators')
	    		.success(defer.resolve)
	    		.error(function(err, status){defer.reject(err);})
				
				return defer.promise;
	    }

	}]);