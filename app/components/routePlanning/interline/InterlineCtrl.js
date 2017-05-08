angular.module('rpOperatorApp')
  .controller('InterlineCtrl', ["$scope", "InterlineService", "$stateParams", "$timeout", "leafletData", "ngToast", "EditRunService",
	function($scope, InterlineService, $stateParams, $timeout, leafletData, ngToast, EditRunService) {
		'use strict';
		$scope.interlinedRuns = []
		$scope.shortNameByRouteId = {}
		$scope.paths = []
		$scope.allRoutes = []


		// gets current schedule, processed into interlines
		$scope.getInterlines = function(){
			InterlineService.getInterlines().then(function(busSchedules){
				$scope.interlines = InterlineService.processSchedulesIntoInterlines(busSchedules)
				$scope.processRoutes(busSchedules)
				$scope.orderInterline()
				$scope.setInitialInterlinedRuns()
			})
		}
		$scope.getInterlines()

		// Sets current multi run Id from url
		$scope.selectedMultiRunId = $stateParams.multiRunId

		// Reorders the runs in the interlines to display sequentially
		$scope.orderInterline = function(){
			angular.forEach($scope.interlines, function(interline){
				angular.forEach(interline, function(run){
					run.firstStopTime = $scope.getStopTimeOfRun(run)
					run.firstStopTimeFormatted = run.firstStopTime.format('h:mm a')
					run.lastStopTime = $scope.getStopTimeOfRun(run,'last')
					run.lastStopTimeFormatted = run.lastStopTime.format('h:mm a')
				})
				interline = interline.sort(function(a,b){
					if(a.firstStopTimeFormatted < b.firstStopTimeFormatted)
						return -1
					else if(a.firstStopTimeFormatted > b.firstStopTimeFormatted)
						return 1
					else
						return 0
				})
			})
		}

		// Sets a couple arrays that need to be used elsewhere for route info
		$scope.processRoutes = function(routes){
			$scope.shortNameByRouteId = {}
			$scope.allRoutes = []
			_.each(routes, function(route){
				$scope.shortNameByRouteId[route.routeId] = route.shortName
				$scope.allRoutes.push({routeId:route.routeId,shortName:route.shortName})
			})
		}

		// Gets the saveable run obj
		$scope.getRunDetails = function(runId){
			return EditRunService.getRunDetails(runId).then(function(response){
				$scope.runs[response.runId] = response
				return response
			})
		}

		// Gets the stop time of run, second argument is optional and will return the last stop if specified
		$scope.getStopTimeOfRun = function(run, firstOrLast){
			if(_.isUndefined(firstOrLast)) 
				firstOrLast = 'first'
			return moment( _.reduce( _.pluck( run.stops, 'stopTime' ), function(a,b){ 
				return firstOrLast === 'first' ? (a<b?a:b) : (a>b?a:b);
			}),'HH:mm:ss')
		}

		// uses the interline data to populate the current interlined run
		$scope.setInitialInterlinedRuns = function(){
			_.each($scope.interlines[ $scope.selectedMultiRunId ], function(run){
				run.polylineColor = $scope.getRandomColor()
				run.polyline = run.polylines[0].polyline
				$scope.interlinedRuns.push(run);
				$timeout(function(){$scope.centerMap()},50) // center map in 50ms in case initial centering misses one of the runs
			})
		}

		// If run exists in interlinedRuns or is empty, then it shoudl be hidden
		$scope.shouldHideRun = function(run){
			return ( _.pluck($scope.interlinedRuns,'runId').indexOf(run.runId) > -1 ) || _.isEmpty(run)
		}

		// Allows drops on the entire document
		// It then adds them back to the routeRuns array
		$('body').droppable({
	    drop: function ( e, ui ) {
	    	$scope.interlinedRuns = _.filter($scope.interlinedRuns, function(run){
	    		if(run.runId !== parseInt(ui.draggable[0].id))
	    			return true
	    		else {
	    			if(run.routeId == parseInt($scope.routeSearchText))
	    				$scope.routeRuns.push(run)
	    			return false
	    		}
	    	})
	    	$scope.$apply()
	    },
			accept: ".inside",
		});

		// Detetcs drops on the droppable area
		// It then removes it from the routeRuns array
		$( "#interlineDrop" ).on( "drop", function( event, ui ) {
    	$timeout(function(){
				$scope.routeRuns = _.filter($scope.routeRuns, function(run){
					if(run.runId !== parseInt(ui.draggable[0].id) || _.isEmpty(run))
						return true
					else {
						return false
					}
	    	})
	    	$scope.$apply()
    	},50)
		});

		// Searches for a route and adds necessary data
		$scope.searchRoutes = function(){
			InterlineService.findRoute($scope.routeSearchText).then(function(route){
				$scope.routeRuns = []
				_.each(route.runTimelines, function(runTimeline){
					// add last run to routeRuns
					$scope.routeRuns.push( runTimeline[ runTimeline.length - 1 ] )
					$scope.routeRuns[ $scope.routeRuns.length - 1 ].routeId = $scope.routeSearchText
					$scope.routeRuns[ $scope.routeRuns.length - 1 ].polylineColor = $scope.getRandomColor()
					$scope.routeRuns[ $scope.routeRuns.length - 1 ].firstStopTime = $scope.getStopTimeOfRun($scope.routeRuns[ $scope.routeRuns.length - 1 ])
					$scope.routeRuns[ $scope.routeRuns.length - 1 ].firstStopTimeFormatted = $scope.routeRuns[ $scope.routeRuns.length - 1 ].firstStopTime.format('h:mm a')
					$scope.routeRuns[ $scope.routeRuns.length - 1 ].lastStopTime = $scope.getStopTimeOfRun($scope.routeRuns[ $scope.routeRuns.length - 1 ],'last')
					$scope.routeRuns[ $scope.routeRuns.length - 1 ].lastStopTimeFormatted = $scope.routeRuns[ $scope.routeRuns.length - 1 ].lastStopTime.format('h:mm a')
				})
			})
		}

		// Add or remove polylines
		$scope.$watch(function(){
			return _.pluck($scope.interlinedRuns, 'runId')
		}, function(){
			// filter out empty runs and duplicates that get added at times
			$scope.interlinedRuns = _.uniq(_.filter($scope.interlinedRuns, function(run){return !_.isEmpty(run)}))
			if($scope.interlinedRuns.length > 0){
				$scope.determineIfTimesOverlap($scope.interlinedRuns[$scope.interlinedRuns.length - 1].runId)
				$scope.paths = []
				_.each($scope.interlinedRuns, function(run){
					if(run.polyline){
						$scope.paths.push({
							color: run.polylineColor,
							weight: 4,
							latlngs: polyline.decode(run.polyline)
						})
					}
				})
				$scope.centerMap()
			}
		}, true)

		// Used to validate if a new run will overlap with any existing ones
		$scope.determineIfTimesOverlap = function(runIdOfNewItem){
			_.each($scope.interlinedRuns, function(run){
				if(run.runId == runIdOfNewItem){
					_.each($scope.interlinedRuns, function(runToCompare){
						if(runToCompare.runId !== run.runId && $scope.runsOverlap(run, runToCompare)){
							$scope.interlinedRuns = _.filter($scope.interlinedRuns, function(run){return run.runId !== runIdOfNewItem})
							$scope.routeRuns.push(run)
							$scope.createErrorToast('This run overlaps with runs in this interline. It could not be added.')
						}
					})
				}
			})
		}

		// true if the two runs overlap
		$scope.runsOverlap = function(run1, run2) {
			return moment.range(run1.firstStopTime, run1.lastStopTime).overlaps(moment.range(run2.firstStopTime, run2.lastStopTime))
		}

		// returns a random bright color
		$scope.getRandomColor = function(){
			return randomColor({
			   luminosity: 'bright',
			   format: 'rgb'
			});
		}

		// Helper function for toasts
		$scope.createErrorToast = function(message, className){
			if(_.isUndefined(className))
				className = 'danger'
    	ngToast.create({
        className: className,
        content: message,
        additionalClasses: 'nga-default nga-fade-remove nga-slide-right-add nga-slide-right-move',
        timeout: 10000,
        dismissButton: true,
        animation: 'slide'
      });
    }

    // Centers the map around the polylines
		$scope.centerMap = function(){
			leafletData.getMap('map').then(function(map){
				var bounds = new L.LatLngBounds()
				if($scope.paths.length > 0){
					_.each(map._layers, function(path){
						if(path.options.type === 'polyline'){
							bounds.extend(path.getBounds().pad(0.1))
						}
					})
					if(bounds)
	 					map.fitBounds(bounds)
	 			}
			});
		}

		// Saves each run with the multiRunId
		$scope.saveInterline = function(){
			_.each($scope.interlinedRuns, function(run){
				run.multiRunId = $scope.selectedMultiRunId
				InterlineService.saveRun(run).then(function(savedRun){
					$scope.createErrorToast('Interline Saved Successfully','success')
				})	
			})
		}


		/**
		 * Start Map Stuff
		 */
		$scope.map = {};
		$scope.defaults = {
			tileLayer: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'
		}
		$scope.layers = {
			baselayers: {
	      openStreetMap: {name: 'OpenStreetMap',type: 'xyz',url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'}
      }
    }
    /**
		 * End Map Stuff
		 */

}])