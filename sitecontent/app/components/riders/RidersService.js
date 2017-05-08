'use strict';

angular.module('rpOperatorApp')
	.service('RidersService', ["$q","$http","$rootScope", 
		function ($q,$http,$rootScope) {

		this.getRiders = function (orgId) {
			var defer = $q.defer();

    	$http.get($rootScope.newEndpoint + '/org/' + orgId + '/user')
    	.success(function(res){
    		defer.resolve(res);
    	})
    	.error(function(err, status){
    		defer.reject(err);
    	})

    	return defer.promise;
		};

		this.userExist = function(email){
			var defer = $q.defer();

    	$http.get($rootScope.newEndpoint + '/user/exist/' + email)
	    	.success(defer.resolve)
	    	.error(defer.reject)

    	return defer.promise;
		}

		this.associateUser = function(email, orgId){
			var defer = $q.defer();
			var postData = {}
			if(typeof orgId !== 'undefined')
				postData.orgId = orgId

    	$http.post($rootScope.newEndpoint + '/user/associate/' + email, postData)
	    	.success(defer.resolve)
	    	.error(defer.reject)

    	return defer.promise;
		}

		this.registerProspect = function(newProspect){
			var defer = $q.defer();

    	$http.post($rootScope.newEndpoint + '/prospect', newProspect)
	    	.success(defer.resolve)
	    	.error(defer.reject)

    	return defer.promise;
		}

		this.disassociateUser = function(email, orgId){
			var defer = $q.defer();
			var postData = {}
			if(typeof orgId !== 'undefined')
				postData.orgId = orgId

    	$http.post($rootScope.newEndpoint + '/user/disassociate/' + email, postData)
	    	.success(defer.resolve)
	    	.error(defer.reject)

    	return defer.promise;			
		}

	}]);