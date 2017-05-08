angular.module('rpOperatorApp')
	.service('ReservationsService', ["$q","$http","$rootScope","$templateCache", 
		function ($q,$http,$rootScope,$templateCache) {
		'use strict';

		this.getReservations = function(filters){
			var defer = $q.defer();
    	$http.get($rootScope.newEndpoint + '/reservation/all',{params:filters})
    	.success(function(res){
    		defer.resolve(res);
    	})
    	.error(function(err, status){
    		defer.reject(err);
    	})
    	return defer.promise;
		}

		this.saveReservation = function(record){
    	var defer = $q.defer();
			var url = $rootScope.newEndpoint + "/reservation/"
			var method = 'POST'
    	if(record.id){
    		url = url + record.id
    		method = 'PUT'
    	}
			console.log(url)
			$http({
      	method: method,
      	url: url,
      	data: record
      }).success(function(res){defer.resolve(res);})
    		.error(function(err, status){defer.reject(err);})
      return defer.promise;
		}


	}]);