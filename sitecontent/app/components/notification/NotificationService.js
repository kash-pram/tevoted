'use strict';

angular.module('rpOperatorApp')
	.service('NotificationService', ["$q","$http","$rootScope","$templateCache", 
		function ($q,$http,$rootScope,$templateCache) {

		this.sendMessage = function (postData,notificationOrAlert) {
			if(notificationOrAlert == 'notification')
				var url = $rootScope.endpoint + '/notification?key=lksj183hh382983iwufwi7bvjdhgdg'
			else
				var url = $rootScope.endpoint + '/notification/alert?key=lksj183hh382983iwufwi7bvjdhgdg'
			var defer = $q.defer();
	    	$http({
	        	method: 'POST',
	        	url: url,
	        	data:postData
	        })
	    	.success(function(res){ defer.resolve(res); })
	    	.error(function(err, status){ defer.reject(err); })
	    	return defer.promise;
		};

		this.getTemplate = function(templateUrl){
  		var defer = $q.defer();
  		var templateHtml = $templateCache.get(templateUrl)
  		if( templateHtml ){
  			defer.resolve(templateHtml);
  		}else{
  			$http.get('/components/notification/templates/'+templateUrl)
		    	.success(function(res){
		    		$templateCache.put(templateUrl,res)
		    		defer.resolve(res);
		    	})
		    	.error(function(err, status){defer.reject(err);})
  		}
    	return defer.promise;
  	}


	}]);