'use strict';

angular.module('rpOperatorApp')
	.service('OnTimeReportService', ["$q","$http","$rootScope",
		function ($q,$http,$rootScope) {

	    this.getOnTimeData = function(params){
	      var defer = $q.defer();
	      
	    	$http({
	    		method: 'GET',
	    		url: $rootScope.endpoint + "/route/on-time/" + params.routeId,
	    		params: params
	    	})
		    	.success(function(res){defer.resolve(res);})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	    this.getTimetables = function(){
        var defer = $q.defer();
	    	$http.get($rootScope.endpoint + '/schedule')
	    	.success(function(res){ defer.resolve(res); })
	    	.error(function(err, status){ defer.reject(err); })
	    	return defer.promise;
    	}

    	this.getRunDetails = function(runId){
    		var defer = $q.defer();
	    	$http.get($rootScope.endpoint + '/run/listedstops/'+ runId)
	    	.success(function(res){ defer.resolve(res); })
	    	.error(function(err, status){ defer.reject(err); })
	    	return defer.promise;
    	}

	}]);