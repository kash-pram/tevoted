'use strict';

angular.module('rpOperatorApp')
	.service('AccountService', ["$q","$http",
		function ($q,$http) {

	    this.getAllCompanies = function(){
	      var defer = $q.defer();
	    	$http.get('https://api.ridepal.com/admin/company')
	    		.success(function(res){defer.resolve(res);})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	}]);