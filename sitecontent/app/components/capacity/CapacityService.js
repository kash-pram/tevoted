'use strict';

angular.module('rpOperatorApp')
	.service('CapacityService', ["$q","$http","$rootScope","$timeout",
		function ($q,$http,$rootScope,$timeout) {

	    this.getAllCompanies = function(){
	      var defer = $q.defer();
	    	$http.get($rootScope.endpoint + '/admin/company')
	    		.success(function(res){defer.resolve(res);})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	    this.getCapacityData = function(params){
	    	var defer = $q.defer();
	    	//defer.resolve(this.getMockData(params))
	    	$http.get($rootScope.endpoint + '/route/utilization',{params:params})
	    		.success(function(res){defer.resolve(res);})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	    this.getRouteDetails = function(routeId){
	    	var defer = $q.defer();
	    	//defer.resolve(this.getMockData(params))
	    	$http.get($rootScope.endpoint + '/route/' + routeId)
	    		.success(function(res){defer.resolve(res);})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	    this.getRunTimes = function(){
	    	var defer = $q.defer();
	    	$http.get($rootScope.newEndpoint + '/run/times')
	    		.success(function(res){defer.resolve(res);})
	    		.error(function(err, status){defer.reject(err);})
	      return defer.promise;
	    }

	    this.getMockData = function(params){
	    	var defer = $q.defer();
	    	console.log('mocking data for:',params)
			  defer.resolve($timeout(function(){
			  	var numDates = moment(params.end,"YYYY-MM-DD").diff( moment(params.start,"YYYY-MM-DD"), 'days' ) + 1
			  	var response = [], numberOfBuses = Math.floor((Math.random()*10)+1)
			  	var numberOfRuns = 0, shortName = 0, capacity = 0, newRoute = {}, run = {}

			  	for (var i = 0; i < numberOfBuses; i++) {
			  		newRoute = {}
			  		numberOfRuns = Math.floor((Math.random()*4)+1)
			  		newRoute.shortName = Math.floor((Math.random()*99)+1)
			  		newRoute.runs = []
			  		for (var x = 0; x < numberOfRuns; x++) {
			  			run = {}
			  			run.runId = Math.floor((Math.random()*300)+200)
			  			run.dates = []
			  			for (var y = 0; y < numDates; y++) {
			  				capacity = Math.floor((Math.random()*30)+20)
			  				run.dates.push({
			  					date: moment(params.start,"YYYY-MM-DD").add(y, 'days').format("YYYY-MM-DD"),
			  					capacity: capacity,
			  					riders: Math.floor((Math.random()*(capacity-10))+11)
			  				})
			  			}
			  			newRoute.runs.push(run)
			  		}
		  			response.push(newRoute)
			  	}
	    		return response
			  },2000))

			  return defer.promise;
	    }

	}]);