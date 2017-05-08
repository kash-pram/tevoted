angular.module('rpOperatorApp')
	.service('NotificationV2Service', ["$q","$http","$rootScope","$templateCache", 
		function ($q,$http,$rootScope,$templateCache) {
		'use strict';

		this.getUserCount = function(context){
			 var defer = $q.defer();
        $http({
        	method: 'POST',
        	url: $rootScope.newEndpoint + '/notification/recipients',
        	data: {context:context}
        }).then(function(response){
        	defer.resolve(response.data);
        },function(response){
        	defer.reject(response);
        });
        return defer.promise;
		}


	}]);