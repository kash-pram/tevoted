'use strict';

angular.module('rpOperatorApp')
	.service('RouteScorecardService', ["$q","$http","$rootScope", 
		function ($q,$http,$rootScope) {

		this.getTimetableData = function (startDate,endDate) {
			var defer = $q.defer();

	    	$http.get($rootScope.endpoint + '/route/active?startDate='+startDate+'&endDate='+endDate)
	    	.success(function(res){
	    		defer.resolve(res);
	    	})
	    	.error(function(err, status){
	    		defer.reject(err);
	    	})

	    	return defer.promise;
		};

		this.getMetrics = function (date) {
			var defer = $q.defer();

	    	$http.get($rootScope.endpoint + '/metrics/runs/day?date='+date+'&operatorId=4')
	    	.success(function(res){
	    		defer.resolve(res);
	    	})
	    	.error(function(err, status){
	    		defer.reject(err);
	    	})

	    	return defer.promise;
		};

	}]);