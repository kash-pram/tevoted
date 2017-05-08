'use strict';

angular.module('rpOperatorApp')
  .controller('RouteReplayCtrl', ['$scope','RouteReplayService','uiGmapGoogleMapApi','$filter','$timeout', 
    function($scope,RouteReplayService,uiGmapGoogleMapApi,$filter,$timeout) {
  	$scope.data = {
  		date: moment().startOf('day'),
      start: moment().startOf('day'),
      end: moment().endOf('day'),
      tz: moment.tz.guess()
  	};
    $scope.timezones = moment.tz.names()
    $scope.mapLoading = false;
    $scope.showHint = false;
  	$scope.busLoading = false;
    $scope.busData = [];
    $scope.filters = {
      amOrPm: 'AM'
    }
    $scope.startStopMinuteBuffer = 120;

  	$scope.formatDates = function(){
  		$scope.data.date.formatted =  moment($scope.data.date).format('YYYY-MM-DD');
  	}

    $scope.timeWasSet = function(){
      $scope.formatStartEndDates();
      $scope.reGetMarkerDataIfNeedTo();
    }

    $scope.formatStartEndDates = function(){
      $scope.data.startFormatted =  moment($scope.data.start).format('MMM D, YYYY h:mma');
      $scope.data.endFormatted =  moment($scope.data.end).format('MMM D, YYYY h:mma');
    }
    $scope.formatStartEndDates();

    $scope.reGetMarkerDataIfNeedTo = function(){
      if($scope.data.start.valueOf() != $scope.getStartTime().valueOf() || $scope.data.end.valueOf() != $scope.getEndTime().valueOf()){
        $scope.latLngs = {};
        $scope.latLngsOriginal = {};
        $scope.checkinLatLngs = {}
        $scope.getMarkerData();
        $scope.getReservationData()
      }
    }

    $scope.getReservationData = function(){
      RouteReplayService.getReservations($scope.selectedRun.runId, moment($scope.data.start).format('YYYY-MM-DD')).then(function(reservations){
        $scope.setCheckinMarkersFromReservations(reservations)
      })
    }

    $scope.setCheckinMarkersFromReservations = function(reservations){
      reservations.forEach(function(reservation){
        reservation.reservationEvents.forEach(function(reservationEvent){
          if(reservationEvent.type == 'rider_checkin'){
            $scope.checkinLatLngs[reservationEvent.id] = {
              center: { 
                latitude:reservationEvent.latitude,
                longitude:reservationEvent.longitude,
              }, 
              time: !_.isUndefined(reservationEvent.location_timestamp) ? reservationEvent.location_timestamp : reservationEvent.created_at,
              id:reservationEvent.id,
              reservation: reservation,
              distance:reservationEvent.distance_to_driver,
              location_accuracy:reservationEvent.location_accuracy,
              location_timestamp:reservationEvent.location_timestamp,
              user: reservation.user_id
            };
          }
        })
      })
    }

  	$scope.getBusData = function(){
      $scope.busLoading = true;
  		RouteReplayService.getBusData(moment($scope.data.date).startOf('day'),moment($scope.data.date).endOf('day'))
  			.then(function(response){
          $scope.processBusResponse(response);
  				$scope.busLoading = false;
          $scope.setStopData(response);
          $scope.busData.sort(naturalSortBy('shortName'))
  			})
  	}

    $scope.processBusResponse = function(response){
      var loginTime, logoutTime;
      angular.forEach(response,function(runData){
        angular.forEach(runData.runs,function(run){

          if(angular.isDefined(run.endpoints.origin[0]))
            loginTime = run.endpoints.origin[0].loginTime

          if(angular.isDefined(run.endpoints.destination[0]))
            logoutTime = run.endpoints.origin[0].logoutTime

          $scope.busData.push({
            mode: runData.route.mode,
            shortName: runData.route.shortName,
            runId: run.runId,
            firstStopTime: run.stops[0].stopTime,
            lastStopTime: run.stops[ run.stops.length - 1 ].stopTime,
            loginTime: loginTime,
            logoutTime: logoutTime
          })
        })
      })
    }

    $scope.assignAmPm = function(){
      if($scope.filters.amOrPm == 'AM'){
        $scope.filterFunction = function(a,b){
          a = parseInt(a.replace(':',''));
          return a <= b;
        }
      }else{
        $scope.filterFunction = function(a,b){
          a = parseInt(a.replace(':',''));
          return a > b;
        }
      } 
      
    }
    $scope.assignAmPm();

    $scope.filterAmPm = function(time){
      time = time.firstStopTime;
      return $scope.filterFunction(time,1200);
    }

    $scope.getStartTime = function(){
      var timeSplit = $scope.selectedRun.firstStopTime.split(':')
      var start = moment($scope.data.start).startOf('day')
        .add(parseInt(timeSplit[0]), 'hours')
        .add(parseInt(timeSplit[1]), 'minutes')
        .add(parseInt(timeSplit[2]), 'seconds')
        .subtract($scope.startStopMinuteBuffer,'minutes')
      return start;
    }

    $scope.getEndTime = function(){
      var timeSplit = $scope.selectedRun.lastStopTime.split(':')
      var end = moment($scope.data.end).startOf('day')
        .add(parseInt(timeSplit[0]), 'hours')
        .add(parseInt(timeSplit[1]), 'minutes')
        .add(parseInt(timeSplit[2]), 'seconds')
        .add($scope.startStopMinuteBuffer,'minutes')
      return end
    }

    $scope.getMarkerData = function(){
      var variables = $scope.getVariablesForMarkerData()

      RouteReplayService.getReplayData(
        variables.start,
        variables.end,
        $scope.selectedRun.shortName,
        $scope.selectedRun.mode,
        variables.tz
      ).then(function(response){
          $scope.setDataOnMap(response);          
        });
    }

    $scope.getVariablesForMarkerData = function(){
      $scope.mapLoading = true;
      $scope.formatDates();
      var start = $scope.getStartTime();
      var end = $scope.getEndTime();

      if($scope.data.start)
        start = moment($scope.data.start)
      else
        $scope.data.start = start;
      if($scope.data.end)
        end = moment($scope.data.end)
      else{
        $scope.data.end = end;
        $scope.formatStartEndDates();
      }      

      start = start.format('YYYY-MM-DD%20HH:mm:ss');
      end = end.format('YYYY-MM-DD%20HH:mm:ss');
      return {start:start,end:end, tz:$scope.data.tz}
    }

    $scope.timeChange = function(){
      $scope.formatDates();
      $scope.getBusData();
    }

    $scope.timeChange();

    $scope.selectRun = function(runId){
      $scope.latLngs = {};
      $scope.latLngsOriginal = {};
      $scope.checkinLatLngs = {}
      $scope.selectedRunId = runId;
      $scope.selectedRun = $filter('filter')($scope.busData, {runId: runId}, true)[0];
      $scope.data.end = $scope.getEndTime();
      $scope.data.start = $scope.getStartTime();
      $scope.formatStartEndDates();
      $scope.getMarkerData();
      $scope.getReservationData()
      $scope.showCircles(runId);
    }


  // Map stuff
  $scope.latLngs = {};
  $scope.latLngsOriginal = {};
  $scope.checkinLatLngs = {}


  $scope.map = { 
  	center: { 
  		latitude: 43.515309, 
  		longitude: -98.186316 
  	}, 
  	zoom: 4,
  	stroke: {
  		color: '#6060FB',
  		weight:3
  	},
  	bounds:{},
  	control:{}
  };

  $scope.map.events = {
    bounds_changed: function (map, eventName, b) {
      // only show markers that are within bounds, for speed reasons
      if(angular.isDefined(map.getBounds()) && angular.isDefined(map.getBounds().getNorthEast())){
        var addDueFromZoom = (.1/map.getZoom());
        var highestLat = map.getBounds().getNorthEast().lat() + addDueFromZoom;
        var lowestLat = map.getBounds().getSouthWest().lat() - addDueFromZoom;
        var highestLng = map.getBounds().getNorthEast().lng() + addDueFromZoom;
        var lowestLng = map.getBounds().getSouthWest().lng() - addDueFromZoom;
        angular.forEach($scope.latLngsOriginal,function(deviceMarkerArray,key){
          $scope.latLngs[key] = [];
          for (var i = 0; i < deviceMarkerArray.length; i++) {
            if( deviceMarkerArray[i].latitude > lowestLat && deviceMarkerArray[i].latitude < highestLat &&
              deviceMarkerArray[i].longitude > lowestLng && deviceMarkerArray[i].longitude < highestLng ){
              if(!_.find($scope.latLngs[key],function(o){return o.id === deviceMarkerArray[i].id}))
                $scope.latLngs[key].push(deviceMarkerArray[i]);
              if(!_.isUndefined(deviceMarkerArray[i+1]) && !_.find($scope.latLngs[key],function(o){return o.id === deviceMarkerArray[i+1].id}))
                $scope.latLngs[key].push(deviceMarkerArray[i+1]);
              if(!_.isUndefined(deviceMarkerArray[i-1]) && !_.find($scope.latLngs[key],function(o){return o.id === deviceMarkerArray[i-1].id}))
                $scope.latLngs[key].push(deviceMarkerArray[i-1]);
            }
          }
        })
      }
    }
  }

	$scope.polyline = {
		control:{}
	}
  $scope.expanded = true;

	$scope.setDataOnMap = function(data){
		angular.forEach(data,function(dataRow){
      if(!angular.isDefined($scope.latLngs[dataRow.deviceId])){

        $scope.latLngs[dataRow.deviceId] = [];
        $scope.latLngsOriginal[dataRow.deviceId] = [];
      }
			$scope.latLngs[dataRow.deviceId].push({
				latitude:dataRow.lat,
				longitude:dataRow.lng,
        time:dataRow.timestamp_utc,
				timeUploaded:dataRow.created_utc,
        id:dataRow.id,
				accuracy:dataRow.accuracy,
        speed:dataRow.speed
			});
		});
    $scope.latLngsOriginal = angular.copy($scope.latLngs);
		$scope.centerMap();
    $scope.mapLoading = false;
    $scope.showHintOnMap();

	}

  $scope.addKmls = function(){
    $scope.arterialStreets = new google.maps.KmlLayer({
      url: 'https://s3-us-west-1.amazonaws.com/com.ridepal.gis/SF+Arterials+-+RidePal.com/SF_Arterials_Small.kml.zip',
      map: null
    })

    $scope.restrictedStreets = new google.maps.KmlLayer({
      url: 'https://s3-us-west-1.amazonaws.com/com.ridepal.gis/Restricted+Streets/SF+Restricted+Streets+WGS+84+Pseudo+Mercator.kml',
      map: null
    })  
  }


  $scope.toggleArterialStreets = function(isOn){
    if(angular.isDefined(isOn)){
      if(isOn) $scope.arterialStreets.setMap($scope.map.control.getGMap());
      else $scope.arterialStreets.setMap(null);
    }else{
      if(!$scope.arterialStreets.map) $scope.arterialStreets.setMap($scope.map.control.getGMap());
      else $scope.arterialStreets.setMap(null);
    }

  }

  $scope.toggleRestrictedStreets = function(isOn){
    if(angular.isDefined(isOn)){
      if(isOn) $scope.restrictedStreets.setMap($scope.map.control.getGMap());
      else $scope.restrictedStreets.setMap(null);
    }else{
      if(!$scope.restrictedStreets.map) $scope.restrictedStreets.setMap($scope.map.control.getGMap());
      else $scope.restrictedStreets.setMap(null);
    }
  }

  $scope.showHintOnMap = function(){
    $scope.showHint = true;
    $timeout(function(){
      $scope.showHint = false;
    },3000)
  }

  $scope.onClick = function(marker, eventName, model) {
    model.show = !model.show;
  };

	$scope.centerMap = function(){
		var map = $scope.map.control.getGMap();
    var maps = google.maps;
    var latlngbounds = new google.maps.LatLngBounds();

    angular.forEach($scope.latLngs, function(value, key){
      for (var i = 0; i < $scope.latLngs[key].length; i+=Math.ceil($scope.latLngs[key].length/30)) {
      	latlngbounds.extend(new maps.LatLng($scope.latLngs[key][i].latitude, $scope.latLngs[key][i].longitude));
      }
    });
    map.fitBounds(latlngbounds);
    map.setZoom( map.getZoom() );
	}

  $scope.stopData = {};
  $scope.setStopData = function(response){
    angular.forEach(response, function(routeData){
      angular.forEach(routeData.runs, function(run){
        $scope.stopData[run.runId] = {
          stops:[],
        }
        angular.forEach(run.stops, function(stop){
          $scope.stopData[run.runId].stops.push({
            center: {latitude: stop.latitude, longitude: stop.longitude},
            stopTime: stop.stopTime ,
            id: stop.stopId + stop.stopTime,
            title: stop.stopName
          })
          $scope.addCircle(routeData,stop,run);
        })
      })
    })
  }

  $scope.circles = {}
  $scope.addCircle = function(routeData,stop,run){
    var map = $scope.map.control.getGMap();
    if(!angular.isDefined($scope.circles[run.runId]))
      $scope.circles[run.runId] = [];
    $scope.circles[run.runId].push( new google.maps.Circle({
      strokeColor: '#08B21F',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#08B21F',
      fillOpacity: 0.35,
      center: {lat: stop.latitude, lng: stop.longitude},
      map:map,
      radius: parseInt(stop.stopDesc.radius),
      visible: false
    }));
  }

  $scope.showCircles = function(runId){
    angular.forEach($scope.circles, function(runCircles, runCircleRunId){
      angular.forEach(runCircles, function(circle){
        circle.setVisible(false);
        if(runCircleRunId == runId)
          circle.setVisible(true);
      })
    })
  }

  // Makes sure map loads after animation
  uiGmapGoogleMapApi.then(function(){
    $timeout($scope.refreshMap, 400);
    $scope.addKmls()
  })

  $scope.refreshMap = function(){
    $scope.map.control.refresh()
  }


}]);
