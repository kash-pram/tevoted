'use strict';

angular.module('rpOperatorApp')
	.service('EditRunService', ["$q","$http", "$rootScope",
		function ($q,$http,$rootScope) {

	    this.getRoutes = function(){
	      var defer = $q.defer();
	    	$http.get($rootScope.endpoint + "/routes")
	    		.success(function(res){defer.resolve(res);})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	    this.getRunTimelines = function(routeId){
	      var defer = $q.defer();
	    	$http.get($rootScope.endpoint + "/admin/route/allruns?routeId=" + routeId)
	    		.success(function(res){defer.resolve(res);})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	    this.getRunDetails = function(runId){
	    	var defer = $q.defer();
	    	$http.get($rootScope.endpoint + "/run/" + runId)
	    		.success(function(res){defer.resolve(res);})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	    this.getTimetables = function(){
	    	var defer = $q.defer();
	    	$http.get($rootScope.endpoint + "/schedule?showOtherPublic=false")
	    		.success(function(res){defer.resolve(res);})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	    this.saveRun = function(run){
	    	var defer = $q.defer();
	    	var urlSuffix = (run.runId == 0) ? '/run' : '/run/' + run.runId;
	    	$http({
            method: 'PUT',
            url: $rootScope.endpoint + urlSuffix,
            data: run
        	})
	    		.success(function(res){defer.resolve(res);})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	    this.getYards = function(operatorId){
	    	var defer = $q.defer();
	    	var urlSuffix = _.isUndefined(operatorId) ? '' : '?operator_id=' + operatorId
	    	$http.get($rootScope.newEndpoint + "/vehicleyard" + urlSuffix)
	    		.success(function(res){defer.resolve(res);})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
    	}

    	/**
    	 * delete one run
    	 * @param  {obj} run  The run obj
    	 * @param  {int} when The datetime in timestamp format
    	 * @return {promise}      Promise that resolves after the api call
    	 */
    	this.deleteRun = function(run, when){
				if(!_.isEmpty(run.dates) && run.dates.start && run.dates.start > Date.now()){

					// Future run, just delete it
	        var defer = $q.defer();
	        $http({
	            method: 'DELETE',
	            url: $rootScope.endpoint + '/run/' + run.runId
	        })
		    		.success(function(res){defer.resolve(res);})
		    		.error(function(err, status){defer.reject(err);})
	        return defer.promise;
				}else{

					// Current run, update end time
					if(!_.isUndefined(when) || when !== null){
						run.dates.end = run.dates.change = when
						console.log(when,run)
						return this.saveRun(run)
					}else{
						return $q.reject()
					}

				}
    	}


    	this.getStops = function(){
    		var defer = $q.defer();
	    	$http.get($rootScope.newEndpoint + "/stopdescription")
	    		.success(function(res){defer.resolve(res);})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
    	}

	}]);