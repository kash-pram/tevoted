'use strict';

angular.module('rpOperatorApp')
  .controller('OnTimeReportCtrl', ["$scope", "OnTimeReportService", "RidershipService","$q","DispatchDashboardService","$rootScope","$timeout","$filter",
	function($scope,OnTimeReportService,RidershipService,$q,DispatchDashboardService,$rootScope,$timeout,$filter) {
		$scope.dates = {}
		$scope.dates.startDateField = new Date(new Date().setDate(new Date().getDate()-5))
  	$scope.dates.endDateField = new Date();
		$scope.routes = [];
		$scope.csvData = [];
		$scope.spinner = false;
		$scope.queryParameters = {};
		$scope.select = {selectedRoute: {}};
		$scope.displayData = {}
		$scope.expanded = true;
		$scope.showSlider = false;
		$scope.displayTable = false;
		$scope.polyline = {}
		$scope.view = {
			radio:'table'
		}
		$scope.selected = {
			actual:false,
			scheduled:false
		}

		/*

		@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
		http://jsfiddle.net/xjv07o73/5/
		@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

		*/

		$scope.format = "MMM dd yyyy";

		$scope.startOpened = false;
		$scope.endOpened = false;

		RidershipService.getAllRoutes()
			.then(function(response){
      	$scope.routes.push.apply($scope.routes,response);
      	$scope.routes.sort(naturalSortBy('shortName'))
    	});

  	$scope.displayParameters = {
  		start: null,
  		end: null,
			mode: null,
  		shortName: null
  	}

  	$scope.radioToggleChanged = function(){
  		if($scope.view.radio == 'map'){
	  		//need tiny delay to allow animation to start
	  		$timeout(function(){
	  			$scope.refreshMap()
	  		},10)
  		}
  	}

  	$scope.resetData = function(){
  		$scope.displayData = {}
  		$scope.runs = []
  		$scope.allRuns = []
  		$scope.markers = {}
  		$scope.polyline = {}
  	}

  	$scope.missingBus = false;
		$scope.validateForm = function(){
			if(!angular.isDefined($scope.select.selectedRoute.routeId) || $scope.select.selectedRoute.routeId === null){
				$scope.missingBus = true;
				return false;
			}else{
				$scope.missingBus = false;
				return true;
			}
		}


		$scope.active = function(){
			var now = Date.now();
			return function(route){
				if(route.startDate < now && (route.endDate === null || route.endDate > now) || route.routeId == "All Routes"){
					return true;
				}else{
					return $scope.showInactiveBuses;
				}
			}
		}

  	$scope.updateQueryParameters = function(){
			$scope.queryParameters.start =  moment($scope.dates.startDateField).format("YYYY-MM-DD");
			$scope.queryParameters.end = moment($scope.dates.endDateField).format("YYYY-MM-DD");
			$scope.queryParameters.routeId = $scope.select.selectedRoute.routeId;
		}

		// These are solely used to display the parameters to the user
		$scope.updateDisplayParameters = function(){
			$scope.displayParameters.start = moment($scope.dates.startDateField).format("MMM D, YYYY")
			$scope.displayParameters.end = moment($scope.dates.endDateField).format("MMM D, YYYY")
			$scope.displayParameters.mode = angular.copy($scope.select.selectedRoute.mode)
			$scope.displayParameters.shortName = angular.copy($scope.select.selectedRoute.shortName)
		}

		$scope.getResults = function(){
			if($scope.validateForm()){
				$scope.resetData();
				$scope.spinner = true;
				$scope.displayTable = false;
				$scope.noResults = false;
				$scope.showSlider = false;
				$scope.deleteResultData();
				$scope.updateQueryParameters();
				$scope.updateDisplayParameters();
				$scope.getData();
			}
		}

		$scope.getData = function(){
			OnTimeReportService.getOnTimeData($scope.queryParameters)
				.then(function(response){
					if(response.length>0) {						
						$scope.data = response;
						$scope.processData()
	  				$scope.allRuns = {}
						$scope.getRuns(_.pluck(response,'runId')).then(function(){
							$scope.filterRunsForMap()
							$scope.selectFirstRun()
							$scope.setMapData()
							$scope.showHideAccordingly();
							$scope.getStopList();

						}, function(error){
							$scope.showHideAccordingly();
						})
						$scope.setSliderOptions();
					}
					else {
						$scope.showHideAccordingly();
					}
				}, function(error){
					$scope.showHideAccordingly();
				});
		}

		$scope.processData = function(){
			$scope.displayData = { am:[], pm:[] }
			angular.forEach($scope.data, function(run){
				run.mode = $scope.displayParameters.mode;
				run.shortName = $scope.displayParameters.shortName;
				$scope.displayData[ $scope.runIsAmOrPm(run) ].push(run);
			})
		}

		$scope.runIsAmOrPm = function(run){
			var firstStopTime = angular.isDefined(run.dates) ? run.dates[0].stops[0].scheduled : run.stops[0].stopTime;
			return ( parseInt( firstStopTime.replace(/\:/g,'') ) < 120000 ) ? 'am' : 'pm';
		}
		
		$scope.arrayIsEmpty = function(amOrPm){
			return _.isEmpty($scope.displayData[amOrPm])
		}

		$scope.showHideAccordingly = function(){
			$scope.spinner = false;
			$scope.expanded = false;
			if(_.isEmpty($scope.displayData.am) && _.isEmpty($scope.displayData.pm)){
				$scope.noResults = true
			}else{
				$scope.displayTable = true;
			}
		}

		$scope.getStopList = function(){
			$scope.stopList = { am:[], pm:[] }
			var amOrPm = null, spliceIndex=null;
			angular.forEach($scope.allRuns, function(run){
				amOrPm = $scope.runIsAmOrPm(run);
				angular.forEach(run.stops, function(stop,i){
					if( $scope.stopList[ amOrPm ].indexOf(stop.stopName) == -1 ){
						spliceIndex = (i == 0) ? 0 : $scope.stopList[ amOrPm ].indexOf(run.stops[i-1].stopName) + 1
						$scope.stopList[ amOrPm ].splice(spliceIndex, 0, stop.stopName)
					}
				})
			})
		}

		$scope.getCorrectStopScheduled = function(date, stopName, run){
			var stopData = _.where(date.stops, {stopName: stopName})[0]
			var stop = _.where($scope.allRuns[run.runId].stops, {stopName: stopName})[0]
			if(angular.isDefined(stop) && stop){
				return angular.isDefined(stop.stopTime) ? stop.stopTime : '-'
			}else{
				return 'n/a'
			}
		}

		$scope.getCorrectStopActual = function(date, stopName, run){
			var stopData = _.where(date.stops, {stopName: stopName})[0]
			var stop = _.where($scope.allRuns[run.runId].stops, {stopName: stopName})[0]
			console.log(stopData)

			if(angular.isDefined(stop) && stop){
				if(angular.isDefined(stopData)){
					if(stop.stopType == 'dropoff' && angular.isDefined(stopData.arrived))
						return stopData.arrived
					else if(stop.stopType == 'pickup' && angular.isDefined(stopData.departed))
						return stopData.departed
					else return '-'
				} else return '-'
			}else{
				return 'n/a'
			}
		}

		$scope.getCorrectStopDiff = function(date, stopName, run){
			var stopData = _.where(date.stops, {stopName: stopName})[0]
			var stop = _.where($scope.allRuns[run.runId].stops, {stopName: stopName})[0]
			if(!angular.isDefined(stop) || !stop)
				return 'n/a'
			else
				return ( angular.isDefined(stopData) && angular.isDefined(stopData.scheduled) && stopData.scheduled) ? $scope.diffTwoTimes(stopData.scheduled, $scope.getCorrectStopActual(date, stopName, run)) : '-';
		}

		// numbers come in format of '07:40:20' and '17:40:20'
		$scope.diffTwoTimes = function(expected, actual){

			return moment(actual,'hh:mm:ss').diff(moment(expected,'hh:mm:ss'),'minutes')
		}

		$scope.getBackgroundClass = function(diff){
			if(diff >= 10)
				return 'danger'
			else if(diff >= 5 && diff < 10)
				return 'warning'
			else 
				return 'green'

		}

		$scope.getFirstStopTime = function(run){
			return (!_.isEmpty($scope.allRuns)) ? $scope.formatTime( $scope.allRuns[run.runId].stops[0].stopTime ) : ''
		}

		$scope.getCsvData = function(amOrPm){
			$scope.csvData = [];
			var newArray = {};
			var diff = null;
			var stop = {}
			angular.forEach($scope.displayData[ amOrPm ], function(run){
				angular.forEach(run.dates, function(date){
					newArray = [date.date, run.mode, run.shortName, run.runId]

					angular.forEach($scope.stopList[ amOrPm ], function(stopName){
						stop = _.where(date.stops, {stopName: stopName})[0]
						if( !angular.isDefined( _.where($scope.allRuns[run.runId].stops, {stopName: stopName})[0] ) )
							diff = 'n/a'
						else
							diff = ( angular.isDefined(stop) && angular.isDefined(stop.scheduled) && stop.scheduled && angular.isDefined(stop.departed) && stop.departed ) ? $scope.diffTwoTimes(stop.scheduled, $scope.getCorrectStopActual(date, stopName, run)) : '-';
						newArray.push( diff )
						if( $scope.selected.scheduled )
							newArray.push($scope.getCorrectStopScheduled(date, stopName, run));
						if( $scope.selected.actual )
							newArray.push($scope.getCorrectStopActual(date, stopName, run));
					})

					$scope.csvData.push(newArray);
				})
			})
			return $scope.csvData;
		}

		$scope.getCsvHeaders = function(amOrPm){
			var stopHeaders = ['Date','Mode','Route Number','Run Id']

			angular.forEach($scope.stopList[ amOrPm ], function(stopName){
				stopHeaders.push(stopName);
				if( $scope.selected.scheduled )
					stopHeaders.push('Scheduled - ' + stopName);
				if( $scope.selected.actual )
					stopHeaders.push('Actual Time - ' + stopName);
			})
			return stopHeaders;
		}

		$scope.deleteResultData = function(){
			delete $scope.resultData;
		}

		$scope.allRuns = {}
		$scope.selectedRun = {
			stops:[]
		}
		$scope.sliderDate = null
		$scope.slider = {}
		$scope.setSliderOptions = function(){
			$scope.slider = {
		  	min: moment($scope.dates.startDateField).format("X"),
		    max: moment($scope.dates.endDateField).format("X"),
		    model: moment($scope.dates.startDateField).format("X"),
		    grid: false,
		    grid_snap: false,
		    step: 86400,
		    forceEdges: true,
		    prettify: function (num) {
		        var m = moment(num, "X");
		        return m.format("Do MMMM");
		    }
		  }
		  $scope.showSlider = true;
		}

		$scope.setMapData = function(update){
			if($scope.sliderDate != moment($scope.slider.model,'X').format('YYYY-MM-DD') || update === true){
				$scope.sliderDate = moment($scope.slider.model,'X').format('YYYY-MM-DD')
				$scope.updateRun()
				$scope.updatePolyline();
			}
		}

		$scope.refreshMap = function(){
			$scope.map.control.refresh()
			$scope.centerMap()
		}


		$scope.updateRun = function(){
			if(angular.isDefined($scope.runs[$scope.selectedRunId])){
				$scope.selectedRun = $scope.runs[$scope.selectedRunId];
				$scope.createLabels()
			}
		}

		$scope.updatePolyline = function(){
			$scope.polyline = {
				path: polyline.decode($scope.selectedRun.polylines[0].polyline,null,true),
				stroke: {
		  		color: '#22A7F0',
		  		weight:3
		  	},
			}			
		}

		$scope.setRun = function(runId){
			$scope.selectedRunId = runId;
			$scope.setMapData(true);
		}

		// For info window when clicking marker
		$scope.onClick = function(marker, eventName, model) {
			console.log('marker click')
	    model.show = !model.show;
	  };

		$scope.markers = []
		$scope.createLabels = function(){
			$scope.markers = []
			var stopData = {}, newStop = {}
			console.log('creating',$scope.selectedRun)
			angular.forEach($scope.selectedRun.stops, function(stop){
				newStop = angular.copy(stop)
				stopData = {}
				stopData = $scope.getStopData($scope.selectedRun.runId, moment($scope.slider.model,'X').format('YYYY-MM-DD'), stop.stopName)
				newStop.options = {
					labelAnchor: '0 0',
					labelClass: 'marker_labels',
					icon: '/assets/images/bus.png'
				}
				if(stopData){
					newStop.options.labelContent='<span class="fa-stack fa-3x"><i class="fa fa-circle fa-stack-2x fa-' + $scope.getBackgroundClass(stopData.diff) + '"></i><i class="fa fa-stack-1x" style="font-size: 21px;color: white;">' + stopData.diff + '</i></span>';
					newStop.title = 'Scheduled: '+stopData.scheduled+' - Actual: '+$scope.getCorrectStopActual(moment($scope.slider.model,'X').format('YYYY-MM-DD'), stop.stopName, $scope.selectedRun);				
				}else{
					newStop.options.labelContent='<span class="fa-stack fa-3x"><i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-stack-1x" style="font-size: 21px;color: white;">-</i></span>'
					newStop.title = 'n/a';
				}
				$scope.markers.push(newStop)
			})
		}

		$scope.formatTime = function(time){
			return moment(time,'hh:mm:ss').format('h:mm a')
		}

		$scope.getStopData = function(runId, date, stopName){
			for (var i = 0; i < $scope.data.length; i++) {
				for (var x = 0; x < $scope.data[i].dates.length; x++) {
					for (var y = 0; y < $scope.data[i].dates[x].stops.length; y++) {
						if($scope.data[i].runId == runId && $scope.data[i].dates[x].date == date && $scope.data[i].dates[x].stops[y].stopName == stopName){
							return $scope.processStopData( $scope.data[i].dates[x].stops[y], $scope.data[i].dates[x], stopName)
						}
					}
				}
			}
		}

		$scope.processStopData = function(stopData, date, stopName){
			stopData.diff = $scope.diffTwoTimes($scope.getCorrectStopScheduled(date, stopName, $scope.selectedRun), $scope.getCorrectStopActual(date, stopName, $scope.selectedRun));
			return stopData
		}

		$scope.selectFirstRun = function(){
			$scope.setRun(Object.keys($scope.runs)[0])
			$scope.centerMap()
		}

		$scope.map = { center: { latitude: 37.66843429554795, longitude: -122.42905961914062 }, zoom: 8, control:{},options:{disableDefaultUI: true,zoomControl: true} };
    $scope.map.options.styles = [{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"on"},{"saturation":-100},{"lightness":20}]},{"featureType":"road","elementType":"all","stylers":[{"visibility":"on"},{"saturation":-100},{"lightness":40}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"on"},{"saturation":-10},{"lightness":30}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"simplified"},{"saturation":-60},{"lightness":10}]},{"featureType":"landscape.natural","elementType":"all","stylers":[{"visibility":"simplified"},{"saturation":-60},{"lightness":60}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"},{"saturation":-100},{"lightness":60}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"},{"saturation":-100},{"lightness":60}]}]

    $scope.centerMap = function(){
  		var bounds = new google.maps.LatLngBounds();
  		angular.forEach($scope.selectedRun.stops, function(marker){
				bounds.extend(new google.maps.LatLng(marker.latitude,marker.longitude))
  		})
  		if($scope.selectedRun.stops.length > 0){
  			var map = $scope.map.control.getGMap()
  			map.fitBounds(bounds);
  			map.setZoom( map.getZoom() - 1 ); // zoom out to ensure can see all stops
  		}
  	}

  	$scope.runs = []
  	$scope.getRuns = function(runIdArray){
  		var defer = $q.defer();
  		var requests = []
  		angular.forEach(runIdArray, function(runId, i){
  			requests[i] = OnTimeReportService.getRunDetails(runId).then(function(response){
  				$scope.allRuns[runId] = response.run;
  			})
  		})
  		$q.all(requests).then(function(){
  			$scope.runs = $scope.allRuns
  			defer.resolve();
  		})
  		return defer.promise;
  	}

		$scope.getTimetables = function(){
			OnTimeReportService.getTimetables().then(function(response){
				//van displayed first
				$scope.processTimetables(response.schedules.van.concat(response.schedules.bus))
			})
		}
		//$scope.getTimetables();

		$scope.processTimetables = function( schedules ){
			angular.forEach(schedules, function(schedule){
				angular.forEach(schedule.runs, function(run){
					$scope.allRuns[run.runId] = run;
					$scope.allRuns[run.runId].mode = schedule.mode
					$scope.allRuns[run.runId].shortName = schedule.shortName
				})
			})
		}

		$scope.filterRunsForMap = function(){
		}


}])