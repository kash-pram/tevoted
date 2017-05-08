'use strict';

angular.module('rpOperatorApp')
	.service('RoutePlanningService', ["$q","$http", "$rootScope",
		function ($q,$http,$rootScope) {

	    this.getRoutes = function(){
	      var defer = $q.defer();
	    	$http.get($rootScope.endpoint + "/routes")
	    		.success(function(res){defer.resolve(res);})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	    this.getRunTimelines = function(routeId){
	      var defer = $q.defer();
	    	$http.get($rootScope.endpoint + "/admin/route/allruns?routeId=" + routeId)
	    		.success(function(res){defer.resolve(res);})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	    this.getRunDetails = function(runId){
	    	var defer = $q.defer();
	    	$http.get($rootScope.endpoint + "/run/" + runId)
	    		.success(function(res){defer.resolve(res);})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	}]);