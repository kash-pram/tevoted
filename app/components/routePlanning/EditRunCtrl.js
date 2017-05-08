angular.module('rpOperatorApp')
  .controller('EditRunCtrl', ["$scope", "EditRunService", "$stateParams", "uiGmapGoogleMapApi", "leafletData", "filterFilter", "$uibModal","$q","$timeout","ngToast","RunValidationService","$rootScope",
	function($scope,EditRunService, $stateParams, uiGmapGoogleMapApi, leafletData, filterFilter, $uibModal, $q, $timeout, ngToast, RunValidationService, $rootScope) {
		'use strict';
		$rootScope.pageLoading = true
		$scope.isMobile = function(){
			return window.innerWidth < 680
		}
		$scope.runGroups = {am:[],pm:[]}
		$scope.runGroup = []
		$scope.runHeaders = {am:[],pm:[]}
		$scope.meridiem = null;
		$scope.firstRun = null;
		$scope.paths = [];
		$scope.stopToUpsert = {};
		$scope.filter = {
			filterText: null
		}
		$scope.originalRuns = {}
		$scope.map = {};
		$scope.creatingStop = false;
		$scope.editingStop = false;
		$scope.selectedStop = {}
		$scope.stopListView = true;
		$scope.markers = []
		$scope.runs = {}
		$scope.yardList = []
		$scope.m = {operatorId: undefined}
		$scope.waypoints = {}

		$scope.defaults = {
			tileLayer: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'
		}

		// Basic set up for leaflet map and layers. Condensed because it will seldom change
		$scope.layers = {
				baselayers: {
            openStreetMap: {name: 'OpenStreetMap',type: 'xyz',url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'}
        },
        overlays: {
            stops: {type: 'group',name: 'This Run\'s Stops',visible: true},
            listedStops: {type: 'group',name: 'All Stops',visible: true},
            createStop: {type: 'group',name: 'Create Stop Marker',visible: true}
        }
    }

		$scope.listedStops = []

		$scope.createStopAddressSelected = function(autocomplete){
			$scope.creatingStop = false;
			$scope.editingStop = false;
			$scope.getStops()
		}

		$scope.getYards = function(){
			EditRunService.getYards($scope.m.operatorId).then(function(res){
				$scope.yardList = res
			})			
		}
		$scope.getYards()

		$scope.toggleCreatingStop = function(){
			$scope.creatingStop = !$scope.creatingStop
		}

		$scope.getRunDetails = function(runId){
			return EditRunService.getRunDetails(runId).then(function(response){
				$scope.runs[response.runId] = response
				return response
			})
		}

		$scope.getRunTimelines = function(routeId){
			EditRunService.getRunTimelines(routeId).then(function(response){
				$scope.routeName = response.route.shortName
				var runGroup = $scope.processRunTimelines(response.runTimelines);
				$scope.addRunsForTimeline(runGroup)				
				$scope.getRunHeaders(response.runTimelines);
				$scope.resizeStopList()
				$rootScope.pageLoading = false
			})
		}

		$scope.getTimetables = function(withoutStops){
			EditRunService.getTimetables().then(function(response){
				$scope.setRunTimelines(response.schedules)
				$scope.meridiem = $stateParams.meridiem
				$scope.routeId = $stateParams.routeId
				$scope.getRunTimelines($stateParams.routeId)
			})
		}
		$scope.getTimetables()

		$scope.getStops = function(){
			EditRunService.getStops().then(function(response){
				$scope.listedStops = response
				$scope.setAllStops($scope.listedStops);
			})
		}
		$scope.getStops()

		$scope.runTimelines = {}
		$scope.setRunTimelines = function(schedules){
			$scope.runTimelines = {}
			angular.forEach(schedules, function(mode){
				for (var i = 0; i < mode.length; i++) {
					for (var x = 0; x < mode[i].runs.length; x++) {
						if( _.isUndefined($scope.runTimelines[ mode[i].runs[x].runTimelineId ]) )
							$scope.runTimelines[ mode[i].runs[x].runTimelineId ] = []
						$scope.runTimelines[ mode[i].runs[x].runTimelineId ].push(mode[i].runs[x])
					}
				}
			})
		}
		
		
		$scope.addRunsForTimeline = function(runGroup){
			var promises = {}, promise = {}, multipromise = []
			$scope.runGroup = []

			for (var i = 0; i < runGroup.length; i++) {
				angular.forEach(runGroup[i], function(run){
					if(_.isUndefined(promises[i])) { promises[i] = [] }
					promises[i].push($scope.getRunDetails(run.runId))
				})
				multipromise.push($q.all(promises[i]).then(function(all){
					$scope.firstRun = all[0]
					$scope.runGroup.push(all)
					$scope.saveCopyOfAllRuns(all)
					return all
				}))
			}

			$q.all(multipromise).then(function(allAll){
				if(allAll.length > 0)
					$scope.selectRunForPolylineEditing(allAll[0][0])
			})
		}

		$scope.saveCopyOfAllRuns = function(runs){
			runs.forEach(function(run){
				$scope.originalRuns[run.runId] = angular.copy(run)
			})
		}

		$scope.processRunTimelines = function(runTimelineResponse){
			$scope.runGroups = {am:[],pm:[]}
			for (var i = 0; i < runTimelineResponse.length; i++) {
				$scope.runGroups[ $scope.amOrPm(runTimelineResponse[i][0].stops[0].stopTime) ].push(runTimelineResponse[i])
			}
			return $scope.runGroups[$scope.meridiem];
		}

		$scope.sortRunTimelines = function(runTimeline){
			return runTimeline[0].runId
		}

		$scope.geoCodeFn = function(lat, lng){
			var defer = $q.defer();
			var geocoder = new google.maps.Geocoder()
			var latlng = new google.maps.LatLng(lat, lng);
			geocoder.geocode({'latLng': latlng}, function(results, status) {
				if(status == google.maps.GeocoderStatus.OK || !results[0]){
					defer.resolve(results)
				}
			})
			return defer.promise
		}

		$scope.getRunHeaders = function(runTimelineResponse){
			var runHeader = {}, spliceIndex, amOrPm;
			angular.forEach(runTimelineResponse, function(runTimeline){
				angular.forEach(runTimeline, function(run){
					for (var i = 0; i < run.stops.length; i++) {
						amOrPm = $scope.amOrPm(run.stops[i].stopTime);
						runHeader = {
							stopDescId: run.stops[i].stopDescId,
							stopName: run.stops[i].stopName,
							stopTime: run.stops[i].stopTime,
							stopType: run.stops[i].stopType
						}
						if(_.pluck($scope.runHeaders[ amOrPm ],'stopDescId').indexOf(runHeader.stopDescId) == -1){
							spliceIndex = (i === 0) ? 0 : _.pluck($scope.runHeaders[ amOrPm ],'stopDescId').indexOf(run.stops[i-1].stopDescId) + 1
							$scope.runHeaders[ amOrPm ].splice(spliceIndex, 0, runHeader)
						}
					}
				})
			})
			$scope.sortRunHeaders()
			$scope.runHeader = $scope.runHeaders[$scope.meridiem];
		}

		$scope.sortRunHeaders = function(){
			$scope.runHeaders.am = _.sortBy($scope.runHeaders.am, 'stopTime')
			$scope.runHeaders.pm = _.sortBy($scope.runHeaders.pm, 'stopTime')
		}

		// reorders the stops in the selectedPoylineRun
		// Then reorders runs based on that
		// Then redoes the map
		$scope.reorderStops = function(){
			$scope.selectedPolylineRun.stops = _.sortBy($scope.selectedPolylineRun.stops, 'stopTime')
			$scope.reorderRunHeaders();
			$scope.setMarkers()
		}

		$scope.reorderRunHeaders = function(){
			var newRunHeader = [], runHeaderRecord = {}
			_.each($scope.selectedPolylineRun.stops, function(stop){
				runHeaderRecord = _.find($scope.runHeader, {stopDescId:stop.stopDescId})
				runHeaderRecord.stopTime = typeof stop.stopTime === 'object' ? stop.stopTime.format('HH:mm:ss') : stop.stopTime
				newRunHeader.push(runHeaderRecord)
			})
			$scope.runHeader = newRunHeader
		}

		$scope.amOrPm = function(time){
			if(angular.isDefined(time._isAMomentObject))
				return time.format('a')
			else
				return (time.replace(':','').substring(0,4) >= 1200) ? 'pm' : 'am'
		}


		$scope.getStop = function(run, runHeader){
			for (var i = 0; i < run.stops.length; i++) {
				if(run.stops[i].stopDescId == runHeader.stopDescId){
					return run.stops[i]
				}
			}
			return {}
		}

		$scope.getStopTimeDefault = function(stop, field){
			if(_.isUndefined(field))
				field = 'stopTime'
			return stop[field].length === 8 ? moment(stop[field],'HH:mm:ss') : moment(stop[field],'HH:mm')
		}

		$scope.endpointOptions = function(endpoint, endpointTimeName){
			return {
				format:'H:mm a',
				defaultDate: $scope.getStopTimeDefault(endpoint, endpointTimeName),
				allowInputToggle:true,
				timeZone: null,
				widgetPositioning:{vertical:'top'},
			}
		}

		$scope.deleteOrigin = function(origin){
			var newOrigins = []
			angular.forEach($scope.selectedRun.endpoints.origin, function(existingOrigin){
				if(!_.isEqual(origin, existingOrigin))
					newOrigins.push(existingOrigin)
			})
			$scope.selectedRun.endpoints.origin = newOrigins
		}

		$scope.timepickerOptions = function(stop){
			return {
				format:'H:mm a',
				defaultDate: !_.isEmpty(stop) && stop.stopTime ? $scope.getStopTimeDefault(stop) : false,
				allowInputToggle:true,
				widgetPositioning:{vertical:'top'},
				timeZone: null,
				widgetParent: ".run-edit-page .card"
			}
		}

		// This places the datetimepicker correctly
		// It had to be done due to absolute positioning
		$(document).on('dp.show', function(e){
			var dimensions = e.target.getBoundingClientRect()
			var offset = dimensions.left - 60
			if(300 + offset + 60 > window.innerWidth)
				offset = window.innerWidth - 300 - 60
			// if not an endpoint datepicker, then move
			if(!$(e.target).parents('.endpoint-management').length){
				$('div.bootstrap-datetimepicker-widget.dropdown-menu.top').css({'left': offset +'px',bottom: 'calc(100vh - '+dimensions.top+'px)'})
			}
		})

		$scope.toggle = {
			updateWhen:'now',
			updateRunsAt: '',
			deleteWhen:'now',
			deleteRunsAt: '',
			runsToDelete:{}
		}

		$scope.saveModal = {}
		$scope.openSave = function(){
			// calls saveRun() on completion
			$scope.saveModal = $uibModal.open({
	      templateUrl:'/components/routePlanning/RunSaveModalView.html',
	      size: 'md',
	      scope: $scope
	    });
		}

		$scope.saveRunIsDisabled = function(){
			return ($scope.toggle.updateWhen == 'later' && !$scope.toggle.updateRunsAt)
		}

		$scope.toggleUpdate = function(timeframe){
			if(timeframe == 'now'){
				$scope.toggle.updateWhen = 'now'
				$scope.toggle.updateRunsAt = ''
			}else{
				$scope.toggle.updateWhen = 'later'
			}
		}

		$scope.openDelete = function(){
			$scope.deleteModal = $uibModal.open({
	      templateUrl:'/components/routePlanning/RunDeleteModalView.html',
	      size: 'md',
	      scope: $scope
	    });
		}

		$scope.deleteRunIsDisabled = function(){
			return ($scope.toggle.deleteWhen == 'later' && !$scope.toggle.deleteRunsAt)
		}

		$scope.deleteRuns = function(){
			var runIdsToDelete = Object.keys( _.pick($scope.toggle.runsToDelete,function(a){return a}) )
			$scope.removeAllNewRuns(runIdsToDelete)
			$scope.deleteAllRuns(runIdsToDelete)
			$timeout(function(){
				$scope.getTimetables(true)
			},1100)
			$scope.deleteModal.close()
		}

		$scope.removeAllNewRuns = function(runIdsToDelete){
			$scope.runGroup = _.filter($scope.runGroup, function(runTimeline){
				return runIdsToDelete.indexOf(runTimeline[0].runId) < 0 || !runTimeline[0].runId.startsWith('New Run')
			})
		}

		$scope.deleteAllRuns = function(runIdsToDelete){
			$scope.toggle.deleteRunsAt = $scope.toggle.deleteRunsAt === '' ? 0 : $scope.toggle.deleteRunsAt
			var deleteAt = !_.isObject($scope.toggle.deleteRunsAt) ? $scope.toggle.deleteRunsAt : $scope.toggle.deleteRunsAt.format('x')
			deleteAt = parseInt(deleteAt)
			var runs = $scope.getFormattedRunsForSave()

			runs.forEach(function(run){
				if(runIdsToDelete.indexOf(run.runId.toString()) > -1){
					EditRunService.deleteRun(run, deleteAt).then(function(success){
						$scope.createValidationToast('Run ' + run.runId + ' deleted','success')
					},function(error){
						$scope.createValidationToast('Could not delete run ' + run.runId)
					})
				}
			})
				//runIdsToDelete[i]
		}

		$scope.openStopRadiusModal = function(stop){
			var modalInstance = $uibModal.open({
	      templateUrl:'/components/routePlanning/stopRadius/StopRadiusView.html',
	      controller:'StopRadiusCtrl',
	      size: 'lg',
	      resolve: {
	      	stop: stop,
	      	time: true
	      }
	    })

	    modalInstance.result.then(function (modalResult) {
	    	if(_.isEmpty(stop.operations))
	    		stop.operations = {}
	      stop.operations.stagingRadius = modalResult.stopRadius;
	      stop.operations.stagingTime = modalResult.stagingTime;
	    })
		}

		$scope.toggleDelete = function(timeframe){
			if(timeframe == 'now'){
				$scope.toggle.deleteWhen = 'now'
				$scope.toggle.deleteRunsAt = ''
			}else{
				$scope.toggle.deleteWhen = 'later'
			}
		}

		$scope.selectedRun = {}
		$scope.editEndpoints = function(run){
			if(angular.isDefined($scope.selectedRun) && $scope.selectedRun.runId == run.runId)
				$scope.selectedRun = {}
			else {
				$scope.selectedRun = run
				if(_.isUndefined($scope.selectedRun.endpoints))
					$scope.selectedRun.endpoints = {}
				if(_.isUndefined($scope.selectedRun.endpoints.origin))
					$scope.selectedRun.endpoints.origin = []
			}
		}

		$scope.runIsSelected = function(){
			return !_.isEmpty($scope.selectedRun)
		}

		$scope.selectRunForPolylineEditing = function(run){
			if(!_.isEmpty($scope.selectedPolylineRun)) $scope.updateSelectedRun();
			$scope.selectedPolylineRun = run
			$scope.reorderStops()
			$scope.centerMap()
		}

		$scope.setMarkers = function(){
			// remove all stop markers before adding them all back
			$scope.markers = _.filter($scope.markers, function(marker){return marker.layer !== 'stops'})
			if(_.isEmpty($scope.selectedPolylineRun)){
				return $timeout($scope.setMarkers,100)
			}
			angular.forEach($scope.selectedPolylineRun.stops, function(stop, index){
				$scope.addRunMarker(stop, index)
			})
			$scope.syncRunMarkers();
			$scope.routeIt();
			$scope.centerMap();
		}
		$scope.setMarkers();

		// Creates cool stop markers on map
		$scope.addRunMarker = function(stop, index){
			if(!_.isUndefined(stop)){
				$scope.markers.push({
					layer: 'stops',
					lat: !_.isUndefined(stop.latitude) ? stop.latitude : stop.lat,
					lng: !_.isUndefined(stop.longitude) ? stop.longitude : stop.lng,
					index:index,
					icon:{
						type: 'div',
						html: '<span class="fa-stack fa-lg">'+
								 		'<i class="fa fa-circle-thin fa-stack-2x"></i>'+
								 		'<i class="fa fa-circle fa-stack-1x"></i>'+
								 		'<i class="fa fa-stack-1x stop-number">' + (index+1) + '</i>'+
									'</span>',
						popupAchor: [0,0],
						className: 'run-stop-marker'
					},
				})
			}
		}

		// Centers map around stops and waypoints
		$scope.centerMap = function(){
			leafletData.getMap('map').then(function(map){
				var stops = _.filter($scope.markers, function(marker){ return marker.layer == 'stops' })
				stops = stops.concat( _.map($scope.routing.getPlan().getWaypoints(), function(marker){
					return marker.latLng
				}))
			 	var bounds = new L.latLngBounds(stops);
 				map.fitBounds(bounds.pad(0.5))
			});
		}

		// Adds the polyline from the first run to the map
		$scope.setPath = function(){
			$scope.paths = [{
				color: '#22A7F0',
				weight: 4,
				latlngs: polyline.decode($scope.firstRun.polyline)
			}]
		}

		// This adds all stops to the map
		// May need to rethink this in the future as stop number increases
		$scope.setAllStops = function(listedStops){
			for (var i = 0; i < listedStops.length; i++) {
				$scope.listedStops[i].stopDescId = $scope.listedStops[i].id
				$scope.listedStops[i].stopName = $scope.listedStops[i].street_address

				$scope.markers.push({
					lat: listedStops[i].latitude,
					lng: listedStops[i].longitude,
					stopDescId: listedStops[i].id,
					title: listedStops[i].street_address,
					opacity:1,
					layer: 'listedStops',
					icon:{
						type: 'div',
						html: '<i class="fa fa-circle" id="stop'+listedStops[i].stop_desc_id+'"></i>',
						
						className: 'stop-marker'
					}
				})
			}
			$scope.filterListedStops()
		}

		// Removes waypoint from routing array
		// Happens on doubleclick
		$scope.removeWaypoint = function(e,args){
			$scope.routing.spliceWaypoints( e.target.options.waypointIndex, 1 )
			$scope.updateSelectedRun()
		}

		// This part does the actual routing
		// Most of it is just configs
		$scope.routing = {}
		$scope.addRouting = function(){
			leafletData.getMap('map').then(function(map){
				$scope.map = map;
				$scope.routing = L.Routing.control({
					serviceUrl: $rootScope.routingEndpoint + '/route/v1', // local routing
					collapsible:true,
					plan: L.Routing.plan($scope.runMarkers, {
						// create method for waypoints
						createMarker: function(i, wp) {
							var marker = L.marker(wp.latLng, {
								draggable: true,
								title: 'Double click to delete',
								waypointIndex: i,
								icon: new L.divIcon({
									popupAchor: [0,0],
									className: 'routing-stop-marker',
									html: '<i class="fa fa-circle"></i>',
								})
							});
							marker.on('dblclick',$scope.removeWaypoint)
							return marker;
						},
						routeWhileDragging: true
					}),
					units: 'imperial',
			    waypoints: [null],
			    routeWhileDragging: true,
			    lineOptions: {
			    	styles:[{
			    		color:'#22A7F0',
			    		opacity:1,
			    		weight:4
			    	}]
			    },
					controlOptions:{
						position:'topright'
					}

				}).addTo(map);
			})			
		}
		$scope.addRouting();

		// Creates polyline and routing info
		$scope.routeIt = function(){
			$scope.routing.getPlan().setWaypoints($scope.runMarkers);
			$scope.routing.getPlan().on('waypointdragend', $scope.updateSelectedRun)
			$scope.spliceInWaypoints()

		}

		// Adds stop to all appropriate places
		$scope.addListedStopToRun = function(stop){
			// if no run exists, create one first
			if($scope.runGroup.length === 0){
				$scope.duplicateLastRun()
				$scope.firstRun = $scope.runGroup[0][0]
				$scope.selectRunForPolylineEditing($scope.runGroup[0][0])
			}

			var newStopIndex = _.filter($scope.markers, function(marker){ return marker.layer == 'stops' }).length
			$scope.addRunMarker(stop, newStopIndex) // Creates marker on map
			$scope.syncRunMarkers() // Creates marker for routing
			$scope.addNewRunHeader(stop) // Adds stop into runHeader
			$scope.addStopToRuns(stop) // Adds stop to each run
			$scope.backToStopList(); // Navigates user back to stop list
			$scope.routeIt() // Creates polyline and routing
			$scope.centerMap(); // Recenters map
		}

		// Adds a new stop to the run header
		$scope.addNewRunHeader = function(stop){
			$scope.runHeader.push({
				stopName: stop.street_address,
				stopDescId: stop.id,
				stopType: 'pickup'
			})
		}

		$scope.getWaypointsFromMap = function(){
			// get all waypoints (includes stops)
			var allPoints = $scope.routing.getPlan().getWaypoints()

			// get all stops in array of {lat,lng}
			var stops = _.map($scope.selectedPolylineRun.stops, function(stop){
				return {lat: stop.latitude, lng: stop.longitude}
			})
			// strip out stops, just include waypoints
			var waypoints = _.filter( _.map(allPoints, function(point, index){
				return _.find(stops, {lat:point.latLng.lat, lng:point.latLng.lng}) ? null : index + ',' + point.latLng.lat + ',' + point.latLng.lng
			}), function(point){return point !== null})

			// create string of them seperated by '|'
			return waypoints.join('|')
		}


		$scope.updateSelectedRun = function(){
			$scope.updateSelectedRunWithWaypoints()
			$scope.updatePolylineOfRun()
		}

		// Set the run's waypoints to those on the map
		$scope.updateSelectedRunWithWaypoints = function(){
			$scope.selectedPolylineRun.waypoints = $scope.getWaypointsFromMap()
		}

		// Gets and parses the waypoints from the currently visible polyline run
		$scope.getWaypointLatLngsFromRun = function(){
			var latLngSplit = []
			if(!$scope.selectedPolylineRun.waypoints) return []
			return _.map($scope.selectedPolylineRun.waypoints.split('|'), function(latLng){
				return latLng.split(',')
			})
		}

		// Adds waypoints in
		$scope.spliceInWaypoints = function(){
			var waypoints = $scope.getWaypointLatLngsFromRun()
			_.each(waypoints, function(waypoint){
				$scope.routing.getPlan().spliceWaypoints(waypoint[0],0,{latLng: L.latLng(waypoint[1], waypoint[2])})
			})
		}

		// Gets the polyline of the coords currently on the map and attatched it to the run
		$scope.updatePolylineOfRun = function(){
			var coords = _.map($scope.routing._routes[0].coordinates, function(point){
				return [point.lat, point.lng]
			})
			$scope.selectedPolylineRun.polyline = polyline.encode(coords)
		}

		// removes a stop from header then calls removeStopFromRuns()
		$scope.removeStop = function(stopHeader){
			$scope.runHeader = _.filter($scope.runHeader, function(header){
				return header.stopDescId !== stopHeader.stopDescId
			})
			$scope.removeStopFromRuns(stopHeader.stopDescId)
		}

		// Removes a specific stop from all runs
		$scope.removeStopFromRuns = function(stopDescId){
			angular.forEach($scope.runGroup, function(runTimeline){
				angular.forEach(runTimeline, function(run){
					run.stops = _.filter(run.stops, function(stop){
						return stop.stopDescId !== stopDescId
					})
				})
			})
			$scope.setMarkers()
		}

		// Adds a stop to all runs
		$scope.addStopToRuns = function(stop){
			angular.forEach($scope.runGroup, function(runTimeline){
				angular.forEach(runTimeline, function(run){
					stop.stopTime = _.max(run.stops,'stopTime').stopTime
					run.stops.push(stop)
				})
			})
		}

		// Toggles through pickup/dropoff/both in the stopHeader
		$scope.switchPickupDropOff = function(stopHeader){
			if(stopHeader.stopType == 'pickup')
				stopHeader.stopType = 'dropoff'
			else if(stopHeader.stopType == 'dropoff')
				stopHeader.stopType = 'both'
			else
				stopHeader.stopType = 'pickup'
		}

		// Function happens when user clicks "Add Run"
		// It duplicates the last run, or if no runs exist, adds a blank one in
		$scope.duplicateLastRun = function(){
			var newRun = {}
			if(_.isUndefined($scope.runGroup) || $scope.runGroup.length === 0){
				$scope.runGroup = []
				newRun = $scope.getBlankRunTimeline()
				$scope.runGroup.push(newRun)
			}else{
				var lastRunTimeline = $scope.runGroup[$scope.runGroup.length - 1]
				var lastRunOfLastRunTimeline = lastRunTimeline[lastRunTimeline.length - 1]
				newRun = $scope.cleanNewRun( lastRunOfLastRunTimeline )
				$scope.runGroup.push(newRun)	
			}
			$scope.selectRunForPolylineEditing(newRun)
			$scope.resizeStopList()
		}

		// Needed to use javascript to resize the stop list so you can scroll all the way to the bottom
		$scope.resizeStopList = function(){
			$timeout(function(){
				var runContainerHeight = $('.run-edit-page .card').height()
				var minusHeight = runContainerHeight + 60
				$('.run-edit-page .stop-list-container,.leaflet-container').css({ 'height': 'calc(100vh - ' + minusHeight + 'px)' });				
			},200)
		}

		// This is used if the user adds a new run if none exist
		$scope.getBlankRunTimeline = function(){
			return [{
				runId: 'New Run 1',
				stringRunId: 'New Run 1',
				stops: [],
				dates: {
					start: 0
				},
				endpoints: {
					origin:[],
					destination:[]
				},
				//runTimelineId: 0,
				routeId: parseInt($scope.routeId),
				waypoints: ''
			}]
		}

		// After a run is duplicated, this cleans it up
		$scope.cleanNewRun = function(existingRun){
			var run = angular.copy(existingRun)
			var newRunNum = angular.isNumber(run.runId) ? 1 : parseInt(run.runId.match(/(\d+)$/)[0], 10) + 1
			run.runId = 'New Run ' + newRunNum
			delete run.createdDate
			delete run.multiRunId
			delete run.runTimelineId
			delete run.oldRunId
			run.stringRunId = run.runId
			run.startDate = null
			run.dates = {
				start: 0,
				end: null
			}
			run.endDate = null
			angular.forEach(run.stops, function(stop){
				stop.stopId = 0
			})
			run.endpoints.origin = []
			run.endpoints.destination = []
			return [run]
		}

		/* globals L */
		$scope.syncRunMarkers = function(){
			$scope.runMarkers = []
			// for each marker in layer 'stop', ie the run's stops
			// add them to runMarkers, which are the markers used for Routing
			_.each(_.filter($scope.markers, function(marker){ return marker.layer == 'stops' }), function(marker){
				$scope.runMarkers.push({latLng: L.latLng(marker.lat, marker.lng)});
			})
		}

		$scope.$on('leafletDirectiveMarker.map.click', function(e, args) {
		    // Args will contain the marker name and other relevant information
		    if(args.layerName == 'listedStops'){
		    	$scope.stopOnMapClicked(args.model)
		    }
		});

		$scope.stopOnMapClicked = function(stop){
			// find the stop in stopList based on the stopDescId that was clocked on map
			$scope.clickStop( _.find($scope.listedStops, function(item){ return item.stopDescId == stop.stopDescId } ) )
		}

		$scope.clickStop = function(stop){
			$('.stop-marker').removeClass('active');
			$scope.hoveringOnStop(stop.stopDescId);
			$scope.stopListView = false;
			$scope.selectedStop = stop;
		}

		$scope.editStop = function(){
			$scope.editingStop = true;
			$scope.stopToUpsert = $scope.selectedStop
			$('#stop'+$scope.selectedStop.stopDescId).parent().removeClass('active');
		}

		// moves navigation back to stoplist
		$scope.backToStopList = function(){
			// Back button has different function depending on what view you are in
			if($scope.editingStop === true){
				$scope.editingStop = false;
				$scope.hoveringOnStop($scope.selectedStop.stopDescId)
			}else{
				$scope.stopListView = true;
				$('.stop-marker').removeClass('active');	
			}
		}

		// used to show a stop is active
		$scope.hoveringOnStop = function(stopDescId){
			$('#stop'+stopDescId).parent().addClass('active');
		}

		// used to show a stop is no l onger active
		$scope.stoppedHoveringOnStop = function(stopDescId){
			if($scope.stopListView)
				$('#stop'+stopDescId).parent().removeClass('active');
		}

		// Used to filter the stop list
		$scope.filterListedStops = function(){
			if(!_.isEmpty($scope.filter.filterText))
				$scope.filteredListedStops = filterFilter($scope.listedStops, {street_address: $scope.filter.filterText})
			else
				$scope.filteredListedStops = $scope.listedStops

			for (var i = 0; i < $scope.markers.length; i++) {
				if($scope.markers[i].layer == 'listedStops'){
					//hide marker if not in filtered stop list
					$scope.markers[i].opacity = ( _.pluck($scope.filteredListedStops,'stopDescId').indexOf($scope.markers[i].stopDescId) == -1 ) ? 0 : 1;
				}
			}
		}

		$scope.saveRuns = function(){
			$scope.updateSelectedRun();
			var runs = $scope.getFormattedRunsForSave();
			runs = $scope.removedUnchangedRunsForSave(runs)
			if(runs.length < 1){
				$scope.saveModal.dismiss('No runs to save')
				return
			}

			var runSavePromises = []
			RunValidationService.validateRuns(runs).then(function(){
				// Validation succeeded
				for (var i = 0; i < runs.length; i++) {
					runSavePromises.push(EditRunService.saveRun(runs[i]))
				}
				$q.all(runSavePromises).then(function(allRunResponses){
					// runs saved
					$scope.saveModal.close()
					for (var i = 0; i < runs.length; i++) {
						$scope.createValidationToast('Run "' + (_.isUndefined(runs[i].stringRunId) ? runs[i].runId : runs[i].stringRunId) + '" saved!', 'success')
					}

					// delay 500ms to let delay on server to finish
					$timeout(function(){
						$scope.getTimetables(true)
					},500)
				}, function(error){
					// there was an error
					$scope.saveModal.dismiss('Failed server validation')
				})
			},function(errors){
				$scope.createValidationToast('Run' + (runs.length > 1 ? 's ' : ' ') + 'did not save!')
				$scope.saveModal.dismiss('Failed validation')
				$scope.displayValidations(errors)
			})
		}

		// If a run didn't change from when we first downloaded it, don't send a PUT and alert user with a warning toast
		$scope.removedUnchangedRunsForSave = function(runs){
			var runToCompare = {}
			var	runIdsToSave = []

			for (var i = 0; i < runs.length; i++) {
				runToCompare = $scope.originalRuns[ runs[i].runId ]
				if( _.isUndefined($scope.originalRuns[ runs[i].runId ]) || RunValidationService.runHasChangedFromInitialRun(runs[i], runToCompare) ){
					runIdsToSave.push(runs[i].runId)
				}else {
					$scope.createValidationToast('Run ' + runs[i].runId + ' did not change, so does not need to be saved.','warning')
				}
			}

			return _.filter(runs, function(run){ return runIdsToSave.indexOf(run.runId) > -1 })
		}

		/**
		 * Loop through and display all Run's validations
		 * @param  {array} errors The validations array
		 * @return {void}        
		 */
		$scope.displayValidations = function(errors){
			var runId = null
			for (var i = 0; i < errors.length; i++) {
				runId = errors[i].runId
				angular.forEach(errors[i].validations, function(validation){
					if(!validation.valid && !_.isEmpty(validation.messages)){
						for (var x = 0; x < validation.messages.length; x++) {
							$scope.createValidationToast('Run Id ' + runId + ': ' + validation.messages[x])
						}
					}
				})
			}
		}

		// helper function to create toasts
		$scope.createValidationToast = function(message, className){
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

		$scope.getFormattedRunsForSave = function(){
			var runsToEdit = [], runObj = {}
			var updateAt = parseInt( $scope.toggle.updateRunsAt ? $scope.toggle.updateRunsAt.format('x') : 0 )
			var stops = []

			angular.forEach($scope.runGroup, function(runTimeline){
				runObj = angular.copy( _.last(runTimeline) )
				// new runs should have runId of 0
				if(_.isString(runObj.runId) && runObj.runId.startsWith('New Run'))
					runObj.runId = 0

				// set up correct dates
				runObj.dates = {
					start: runObj.dates.start ? runObj.dates.start : updateAt,
					change: updateAt
				}

				// format stops properly
				stops = []
				angular.forEach(runObj.stops,function(stop){

					// format stoptimes into string
					if( _.isObject( stop.stopTime ) && angular.isDefined(stop.stopTime._isAMomentObject) && stop.stopTime._isAMomentObject ){
						stop.stopTime = stop.stopTime.format('HH:mm:ss')
					}

					// sets stopId to 0 for new runs
					if( _.isUndefined(stop.stopId) || !stop.stopId ){
						stop.stopId = 0
					}

					//set stopType from values in runHeader
					stop.stopType = _.find($scope.runHeader, {stopDescId: stop.stopDescId}).stopType

					// if stop time is null, then ignore the stop
					if(stop.stopTime !== null){
						stops.push(stop)
					}
				})
				runObj.stops = stops

				// format endpoint times properly
				if(!_.isEmpty(runObj.endpoints) && !_.isEmpty(runObj.endpoints.origin) ){
					angular.forEach(runObj.endpoints.origin, function(origin){
						// If it already isn't a formatted time string
						if(origin.departTime.length !== 8 && origin.departTime.length !== 5){
							origin.departTime = moment(origin.departTime).format('HH:mm:ss')
							origin.loginTime = moment(origin.loginTime).format('HH:mm:ss')
							origin.preflightTime = moment(origin.preflightTime).format('HH:mm:ss')
						}
					})
				}

				runsToEdit.push(runObj)
			})
			return runsToEdit
		}

}])