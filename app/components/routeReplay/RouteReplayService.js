'use strict';

angular.module('rpOperatorApp')
	.service('RouteReplayService', ["$q","$http","$rootScope", function ($q,$http,$rootScope) {

		this.getReplayData = function (startDate,endDate,shortName,mode, tz) {
			var defer = $q.defer();

  		$http.get($rootScope.endpoint + "/admin/report/routereplay?start="+startDate+"&end="+endDate+"&shortName="+shortName+"&mode="+mode+"&tz="+tz)
	    	.success(function(res){
	    		defer.resolve(res);
	    	})
	    	.error(function(err, status){
	    		defer.reject(err);
	    	})

    	return defer.promise;
		};

		this.getBusData = function(startDate,endDate){
			var defer = $q.defer();

    	$http.get($rootScope.endpoint + "/route/active?startDate="+startDate+"&endDate="+endDate)
	    	.success(function(res){
	    		defer.resolve(res);
	    	})
	    	.error(function(err, status){
	    		defer.reject(err);
	    	})

    	return defer.promise;
		}

		this.getReservations = function(runId, localRideDate){
			var defer = $q.defer();

    	$http.get($rootScope.newEndpoint + "/run/"+runId+"/reservation?where={\"local_ride_date\":\""+localRideDate+"\"}&populate=reservationEvents")
	    	.success(function(res){
	    		defer.resolve(res);
	    	})
	    	.error(function(err, status){
	    		defer.reject(err);
	    	})

    	return defer.promise;
		}

	}]);