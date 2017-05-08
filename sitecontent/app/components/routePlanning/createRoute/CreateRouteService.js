'use strict';

angular.module('rpOperatorApp')
	.service('CreateRouteService', ["$q","$http", "$rootScope",
	function ($q,$http,$rootScope) {

		this.getOperators = function(){
    	var defer = $q.defer();
		
    	$http.get($rootScope.endpoint + '/operators')
    		.success(defer.resolve)
    		.error(function(err, status){defer.reject(err);})
			
			return defer.promise;
    }

    this.saveRoute = function(route){
    	var defer = $q.defer();
    	
			var method = 'POST'
			var url = $rootScope.newEndpoint + '/route'
			if(!_.isUndefined(route.id) && route.id){
				url = url + '/' + route.id
				method = 'PUT'
			}

    	$http({
          method: method,
          url: url,
          data: route
      	})
    		.success(defer.resolve)
    		.error(function(err, status){defer.reject(err);})
			
			return defer.promise;
    }

	}]);