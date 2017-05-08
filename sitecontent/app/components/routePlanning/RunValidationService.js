'use strict';

angular.module('rpOperatorApp')
	.service('RunValidationService', ["$q","$rootScope",
		function ($q,$rootScope) {

			/**
			 * Validates all runs passed to it
			 * @param  {arr} runs Array of runs
			 * @return {Promise}      Promise that resolves or rejects to nothing
			 */
	    this.validateRuns = function(runs){
	    	var RunValidationService = this; // To be used inside of of promises below

	    	var runValidationPromises = []
	    	for (var i = 0; i < runs.length; i++) {
	    		// Add each run's validation promise to an array to be processed when they all finish
	    		runValidationPromises.push(this.validateRun(runs[i]))
	    	}

	    	// Once each run is through validation, determine if any failed
	    	return $q.all(runValidationPromises)
	    		.then(function(allRunValidationResults){
	    			// If at least one run failed, reject with validations, else resolve with validations
	    			return RunValidationService.atLeastOneRunFailed(allRunValidationResults) ? $q.reject(allRunValidationResults) : $q.resolve(allRunValidationResults)
	    		})
	    }

	    this.atLeastOneRunFailed = function(allRunValidationResults){
	    	var runId = null
	    	for (var i = 0; i < Object.keys(allRunValidationResults).length; i++) {
	    		runId = Object.keys(allRunValidationResults)[i]
		    	for (var x = 0; x < allRunValidationResults[runId].validations.length; x++) {
	    			if(allRunValidationResults[runId].validations[x].valid === false) return true
		    	}
	    	}
	    	return false
	    }


	    this.validateRun = function(run){
	    	// Once all validations for run are complete determine if any failed
	    	return $q.all([
    			this.validateStaging(run),
    			this.validateRouteId(run),
    			this.validateStopsHaveStopTime(run),
    			this.validateStartDate(run),
    			this.validatePickupDropoff(run),
    			this.validateOriginEndpoint(run),
    			this.validateOriginEndpoint(run)
    		]).then(function(validations){
    			// make key as string runId if it exists, which is a arbitrary string to identify the run
    			return {runId:_.isUndefined(run.stringRunId) ? run.runId : run.stringRunId, validations: validations}
    		})
	    }

	    /**
	     * Validates that the run has staging info
	     * @param  {obj} run A run obj
	     * @return {obj}     Returns an objection explaining the validation
	     */
	    this.validateStaging = function(run){
    		var firstStop = this.getFirstStopOfRun(run)
    		if( !_.isEmpty(firstStop.operations) && !_.isEmpty(firstStop.operations.stagingTime) && _.isNumber(firstStop.operations.stagingRadius) &&
    			this.convertTimeToInt(firstStop.operations.stagingTime) < this.convertTimeToInt(firstStop.stopTime) )
    			return this.getValidationObject('staging', true, true)
    		else
    			return this.getValidationObject('staging', false, true, 'Staging time must be before first stop time')
	    }

	    // Determine if run contains routeId
	    this.validateRouteId = function(run){
	    	return _.isNumber(run.routeId) || _.isString(run.routeId) ? 
    					this.getValidationObject('routeId', true, true) : 
    					this.getValidationObject('routeId', false, true, 'Run must contain routeId field')
	    }

	    // Determine if run contains routeId
	    this.validateStopsHaveStopTime = function(run){
	    	for (var i = 0; i < run.stops.length; i++) {
	    		if(_.isEmpty(run.stops[i].stopTime))
	    			return this.getValidationObject('stops.stopTime', false, true, 'All stops must have stop time') 
	    	}
	    	return this.getValidationObject('stops.stopTime', true, true)
    					
	    }

	    // Determine if run contains dates.start and is before now if creating
	    this.validateStartDate = function(run){
	    	if(!_.isEmpty(run.dates) && ( _.isNumber(run.dates.start) || _.isString(run.routeId) )){
	    		if( ( (_.isString(run.runId) && run.runId.indexOf('New Run') > -1) || run.runId === 0 ) && run.dates.start < Date.now() && run.dates.start !== 0 ){
	    			return this.getValidationObject('dates.start', false, true, 'Run start date must be after now')
	    		}
	    		return this.getValidationObject('dates.start', true, true)
	    	}else{
	    		return this.getValidationObject('dates.start', false, true, 'Run must contain start date')
	    	}
	    }

	    // Determine is first stop is pickup and last stop is dropoff
	    this.validatePickupDropoff = function(run){
	    	if(this.getFirstStopOfRun(run).stopType == 'pickup' && this.getLastStopOfRun(run).stopType == 'dropoff')
	    		return this.getValidationObject('stop.stopType', true, true)
	    	else
	    		return this.getValidationObject('stop.stopType', false, true, 'First stop must be pickup / Last stop must be dropoff')
	    }

	    // Validates that the run contains endpoint.origin array, and if populated, the times don't conflict
	    this.validateOriginEndpoint = function(run){
	    	if(_.isEmpty(run.endpoints) || _.isUndefined(run.endpoints.origin)){
	    		return this.getValidationObject('endpoints.origin', false, true, 'Run must contain an origin endpoint')
	    	}else{
	    		if(_.isArray(run.endpoints.origin) && !_.isEmpty(run.endpoints.origin)){
	    			var firstStop = this.getFirstStopOfRun(run)
	    			for (var i = 0; i < run.endpoints.origin.length; i++) {
	    				if( this.convertTimeToInt(run.endpoints.origin[i].loginTime) > this.convertTimeToInt(run.endpoints.origin[i].preflightTime) )
	    					return this.getValidationObject('endpoints.origin', false, true, 'Login time cannot be after preflight time')

	    				else if( this.convertTimeToInt(run.endpoints.origin[i].preflightTime) > this.convertTimeToInt(run.endpoints.origin[i].departTime) )
	    					return this.getValidationObject('endpoints.origin', false, true, 'Preflight time cannot be after depart time')

	    				else if( this.convertTimeToInt(run.endpoints.origin[i].departTime) > this.convertTimeToInt(firstStop.stopTime) )
	    					return this.getValidationObject('endpoints.origin', false, true, 'Preflight time cannot be after depart time')
	    			}
	    		}
	    		return this.getValidationObject('endpoints.origin', true, true)
	    	}
	    }

	    // Validates that the run contains endpoint.destination array, and if populated, the times don't conflict
	    this.validateOriginEndpoint = function(run){
	    	if(_.isEmpty(run.endpoints) || _.isUndefined(run.endpoints.origin)){
	    		return this.getValidationObject('endpoints.destination', false, true, 'Run must contain an destination endpoint')
	    	}else{
	    		return this.getValidationObject('endpoints.destination', true, true)
	    	}
	    }

	    /********************
	     * 									*
	     * Helper functions *
	     * 									*
	     ********************/


	    this.getValidationObject = function(key, isValid, promise, messages){
	    	var validationObj = {
	    		key: key,
	    		valid: isValid
	    	}

	    	if(!isValid && !_.isEmpty(messages)){
	    		validationObj.messages = _.isArray(messages) ? messages : [messages]
	    	}
	    	// if promise field is true, return the obj as a promise
	    	return !_.isUndefined(promise) && promise ? $q.when(validationObj) : validationObj
	    }

	    this.getFirstStopOfRun = function(run){
	    	return _.min(run.stops, function(stop){
	    		return moment(stop.stopTime, 'HH:mm:ss').format('x')
	    	})
	    }

	    this.getLastStopOfRun = function(run){
	    	return _.max(run.stops, function(stop){
	    		return moment(stop.stopTime, 'HH:mm:ss').format('x')
	    	})
	    }

	    // returns time formatted as an int, includes seconds
	    this.convertTimeToInt = function(time){
	    	if(time.length === 5)
					time = time + ':00'
				return parseInt(time.replace(/:+/g, ''));
	    }

	    // Detects if possiblyChangedRun has changed from originalRun or not
	    // true = run has changed, false = run has not changed
	    this.runHasChangedFromInitialRun = function(possiblyChangedRun, originalRun){

	    	// true = they are essntially equal
	    	function essentiallyEqual(a,b){
					var key = null

					// if a and b are not equal, lets find out if that is really true
					if( !_.isEqual( a, b ) ){

						//if a is an array, lets loop through each, return false if any were not actually equal to corresponding value in b
						if( _.isArray(a) ){
							for (var i = 0; i < a.length; i++) {
								if( !essentiallyEqual(a[i],b[i]) ){
									return false
								}
							}
							return true
						}

						// if a is an object, lets loop through each key, return false if the key is not equal to key of b
						else if(_.isObject(a)){
							for (var i = 0; i < Object.keys(a).length; i++) {
								key = Object.keys(a)[i]
								if(key !== 'change'){ // change can be altered, thats ok

									// if the key doesnt exist in b or is not equal, return false
									if( (_.isUndefined(b) || _.isUndefined(b[ key ])) || !essentiallyEqual(a[key],b[ key ]) ){
										return false
									}
								}
							}
							return true
						}

						// if it is a string, determine if the other one is a moment object
						else {
							// if it is a moment object, convert it to a string and compare
							if( b && !_.isUndefined(b.isValid) ) {
								return !_.isEqual(a, b.format('HH:mm:ss')) && !_.isEqual(a, b.format('HH:mm'))
							} 

							// if they are waypoints, they are not equal
							// This checks for waypoints
							else if(a.split(',').length > 2 || b.split(',').length > 2){
								return false
							} 

							// check if times equal
							else if(_.isEqual(moment(a,'HH:mm:ss').format('HH:mm:ss'), moment(b,'HH:mm:ss').format('HH:mm:ss'))){
								return true
							} else {
								return false
							}
						}
					}else{
						// a and b are equal
						return true
					}
				}

				return !essentiallyEqual(possiblyChangedRun, originalRun)

	    }

	}]);