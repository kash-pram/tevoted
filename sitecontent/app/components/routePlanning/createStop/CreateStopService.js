'use strict';

angular.module('rpOperatorApp')
	.service('CreateStopService', ["$q","$http", "$rootScope",
		function ($q,$http,$rootScope) {

	    this.upsertStop = function(stop){
	    	console.log('stawp',stop)
	      var defer = $q.defer()
	      var url = ( angular.isDefined(stop.stopDescId) ) ? $rootScope.endpoint + '/stopdescription/' + stop.stopDescId : $rootScope.endpoint + '/stopdescription';
        $http.put(url, stop)
	        .success(function(res){ defer.resolve(res); })
	        .error(function(err, status){ defer.reject(err); })
        return defer.promise;
	    }

	}]);