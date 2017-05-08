'use strict';

angular.module('rpOperatorApp')
	.service('DispatchDashboardService', ["$q","$http","$rootScope", function ($q,$http,$rootScope) {

		this.getTabletStatuses = function () {
			var defer = $q.defer();

	    	$http.get($rootScope.endpoint + "/admin/report/tablet?key=coehf89y3202y80FTFFugsG7&window=4")
	    	.success(function(res){
	    		defer.resolve(res);
	    	})
	    	.error(function(err, status){
	    		defer.reject(err);
	    	})

	    	return defer.promise;
		};

		this.getTimetableData = function() {
			var defer = $q.defer();

	    	$http.get($rootScope.endpoint + '/schedule')
	    	.success(function(res){
	    		defer.resolve(res);
	    	})
	    	.error(function(err, status){
	    		defer.reject(err);
	    	})

	    	return defer.promise;
		};


	}]);