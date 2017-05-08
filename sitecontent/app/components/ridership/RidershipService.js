'use strict';

angular.module('rpOperatorApp')
	.service('RidershipService', ["$q","$http","$rootScope",
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

	    this.getAllRoutes = function(){
	    	var defer = $q.defer();
	    	$http.get($rootScope.endpoint + '/route')
	    		.success(function(res){defer.resolve(res);})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	    this.getAllCompanies = function(){
	      var defer = $q.defer();
	    	$http.get($rootScope.endpoint + '/admin/company')
	    		.success(function(res){defer.resolve(res);})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }


	}]);