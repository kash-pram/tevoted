'use strict';

angular.module('rpOperatorApp')
	.service('InterlineService', ["$q","$http", "$rootScope",
		function ($q,$http,$rootScope) {
			var $this = this

	    this.getInterlines = function(){
	      var defer = $q.defer()
        $http.get( $rootScope.endpoint + '/schedule?showOtherPublic=false' )
	        .success(function(res){ 
	        	defer.resolve( res.schedules.bus ); 
	        })
	        .error(function(err, status){ defer.reject(err); })
        return defer.promise;
	    }

	    this.processSchedulesIntoInterlines = function(routes){
	    	var interlines = {}, multiRunId = null
	    	for (var i = 0; i < routes.length; i++) {
	    		for (var x = 0; x < routes[i].runs.length; x++) {
	    			multiRunId = routes[i].runs[x].multiRunId
	   				if(_.isUndefined(interlines[ multiRunId ]))
	   					interlines[ multiRunId ] = [routes[i].runs[x]]
   					else
   						interlines[ multiRunId ].push(routes[i].runs[x])
	    		}
	    	}
	    	interlines = _.pick(interlines, function(interlineArray){
	    		return interlineArray.length > 1
	    	})
	    	return interlines
	    }

	    this.findRoute = function(routeId){
	    	var defer = $q.defer()
	    	$http.get( $rootScope.endpoint + '/admin/route/allruns?routeId=' + routeId )
		    	.success(function(res){ defer.resolve( res ); })
	        .error(function(err, status){ defer.reject(err); })
        return defer.promise;
	    }

	    this.saveRun = function(run){
	    	var defer = $q.defer();
	    	$http({
            method: 'PUT',
            url: $rootScope.newEndpoint + '/run/' + run.runId,
            data: {multi_run_id: run.multiRunId}
        	})
	    		.success(function(res){defer.resolve(res);})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	}]);