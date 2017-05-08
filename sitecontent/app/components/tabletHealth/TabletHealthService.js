'use strict';

angular.module('rpOperatorApp')
	.service('TabletHealthService', ["$q","$http","$rootScope", function ($q,$http,$rootScope) {

		this.getTabletStatuses = function () {
			var defer = $q.defer();

	    	$http.get($rootScope.endpoint + "/admin/report/tablet")
	    	.success(function(res){
	    		defer.resolve(res);
	    	})
	    	.error(function(err, status){
	    		defer.reject(err);
	    	})

	    	return defer.promise;
		};

	}]);