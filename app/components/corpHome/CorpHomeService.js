'use strict';

angular.module('rpOperatorApp')
	.service('CorpHomeService', ["$q","$http","$rootScope",
		function ($q,$http,$rootScope) {

	  	this.getRidershipData = function(searchParameters){
	        var defer = $q.defer();
	        var url = $rootScope.endpoint + '/route/ridership';
	        url = (angular.isDefined(searchParameters.route)) ? url + "/" + searchParameters.route : url;
	        delete searchParameters.route;
	        
	        $http({
	        	method: 'GET',
	        	url: url,
	        	params: searchParameters
	        }).then(function(response){
	        	defer.resolve(response);
	        },function(response){
	        	defer.resolve(response);
	        });

	        return defer.promise;
	    }

	    this.getCapacityData = function(params){
	    	var defer = $q.defer();
	    	$http.get($rootScope.endpoint + '/route/utilization',{params:params})
	    		.success(function(res){defer.resolve(res);})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	    this.ping = function(){
	    	var defer = $q.defer();
	    	$http.get($rootScope.endpoint + '/routes')
	    		.success(function(res){
	    			console.log(res)
	    			defer.resolve(res);
	    		})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	}]);