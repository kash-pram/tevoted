'use strict';


angular.module('rpOperatorApp')
  .controller('TrackingCtrl', ["$scope", "$timeout", "TrackingService", "uiGmapGoogleMapApi", function ($scope, $timeout, TrackingService,uiGmapGoogleMapApi) {
    $scope.leftPage = false;
    $scope.map = { 
      center: { latitude: 39, longitude: -123 }, 
      zoom: 7,
      control:{},
      options:{}
    };
    $scope.map.options.styles = [{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"on"},{"saturation":-100},{"lightness":20}]},{"featureType":"road","elementType":"all","stylers":[{"visibility":"on"},{"saturation":-100},{"lightness":40}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"on"},{"saturation":-10},{"lightness":30}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"simplified"},{"saturation":-60},{"lightness":10}]},{"featureType":"landscape.natural","elementType":"all","stylers":[{"visibility":"simplified"},{"saturation":-60},{"lightness":60}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"},{"saturation":-100},{"lightness":60}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"},{"saturation":-100},{"lightness":60}]}]
    $scope.map.control = {}
    $scope.data = {
      markers: [],
      polylines: [],
      stops:[]
    }
    $scope.display = {
      markers:[],
      polylines: [],
      stops:[]
    }
    $scope.defaultColors = ['#D34E47','#181664','#0A6F16','#8F6F0D','#D34E47','#424093','#37A344','#D3B147','#F57973','#5F5EAB','#89D793','#FFE8A3',
      'aqua','black','blue','fuchsia','gray','green','lime','maroon','navy','olive','orange','purple','red','silver','teal','white','yellow'];


  	$scope.getTimetables = function(){
  		TrackingService.getTimetables().then(function(response){
				//show vans first for now
  			$scope.schedules = response.data.schedules.van.concat(response.data.schedules.bus).sort(naturalSortBy('shortName'));
  			$scope.activeRoutes = $scope.allRoutes = _.map($scope.schedules,'shortName');
  			$scope.assignColors();
  			$scope.getMarkers(true);
  			$scope.updateEtas();
        $scope.addPolyLines();
        $scope.addStopMarkers();
  		})
  	}
  	$scope.getTimetables();
  	

  	$scope.addRemoveRoute = function(route){
  		if($scope.activeRoutes.indexOf(route.shortName) != -1){
  			$scope.activeRoutes.splice($scope.activeRoutes.indexOf(route.shortName),1);
  			$scope.syncMarkersWithActiveRoutes()
  			$scope.centerMap()
  		}else{
  			$scope.activeRoutes.push(route.shortName);
        $scope.syncMarkersWithActiveRoutes()
  			$scope.centerMap()
  		}
  	}

  	$scope.assignColors = function(){
  		$scope.colorMap = {}
  		for (var i = 0; i < $scope.activeRoutes.length; i++) {
        if($scope.defaultColors[i]) $scope.colorMap[$scope.activeRoutes[i]] = $scope.defaultColors[i];
        else $scope.colorMap[$scope.activeRoutes[i]] = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')'
  		};
  	}

  	$scope.getColor = function(shortName){
  		return {color:$scope.colorMap[shortName]};
  	}

  	$scope.selectAll = function(){
  		$scope.activeRoutes = _.pluck($scope.schedules,'shortName');
  		$scope.syncMarkersWithActiveRoutes();
  		$scope.centerMap();
  	}

  	$scope.deselectAll = function(){
  		$scope.activeRoutes = [];
  		$scope.syncMarkersWithActiveRoutes();
  	}

    $scope.activeOnly = function(){
      $scope.activeRoutes = _.pluck($scope.schedules,'shortName');
      $scope.removeInactiveBuses();
      $scope.centerMap();
    }

    $scope.shuttlesOnly = function(){
      $scope.activeRoutes = _.pluck(_.filter($scope.schedules,{mode:'bus'}),'shortName');
      $scope.syncMarkersWithActiveRoutes();
      $scope.centerMap();
    }

    $scope.vanpoolsOnly = function(){
      $scope.activeRoutes = _.pluck(_.filter($scope.schedules,{mode:'van'}),'shortName');
      $scope.syncMarkersWithActiveRoutes();
      $scope.centerMap();
    }

  	$scope.getMarkers = function(remove){
  		TrackingService.getLastMarker().then(function(response){
        $scope.data.markers = []
        angular.forEach(response.data,function(route){
          if(route.shortName != '' && route.shortName && $scope.allRoutes.indexOf(route.shortName) != -1)
            $scope.data.markers.push(route)
        })
        if(remove === true){
          $scope.removeInactiveBuses();
          $scope.centerMap();
        }
        $scope.syncMarkersWithActiveRoutes();
        $scope.addLabels();
  		})
      $timeout(function(){
        if(!$scope.leftPage)
         $scope.getMarkers();
      },10000)
  	}

    // Only syncs one way for now
    $scope.syncMarkersWithActiveRoutes = function(){
      var hour = new Date().getHours();
      var am = (hour < 15) ? true : false;
      $scope.display.markers = []
      $scope.display.polylines = []
      $scope.display.stops = []
      $scope.display.markers = _.filter($scope.data.markers, function(marker){
        return _.find($scope.activeRoutes, function(activeRoute){
          return marker.shortName == activeRoute;
        });
      })
      $scope.display.polylines = _.filter($scope.data.polylines, function(polyline){
        if((am && polyline.startHour < 15) || (!am && polyline.startHour >= 15)){
          return _.find($scope.activeRoutes, function(activeRoute){
            return polyline.shortName == activeRoute;
          });
        }
      })

      $scope.display.stops = _.filter($scope.data.stops, function(stop){
        if((am && stop.startHour < 15) || (!am && stop.startHour >= 15)){
          return _.find($scope.activeRoutes, function(activeRoute){
            return stop.shortName == activeRoute;
          });
        }
      })
    }
  	
  	$scope.removeInactiveBuses = function(){
  		$scope.activeRoutes = [];
  		angular.forEach($scope.data.markers, function(marker){
  			$scope.activeRoutes.push(marker.shortName)
  		})
      $scope.syncMarkersWithActiveRoutes();
  	}



    $scope.addLabels = function(){
      angular.forEach($scope.data.markers, function(marker){
        marker.options = {
         labelContent: '<span style="font-weight:bold;position: absolute;left: 12px;top: -10px;font-size: 13px;z-index:999">'+
            marker.shortName+'</span><i class="fa fa-bus fa-3x" style="color:'+$scope.colorMap[marker.shortName]+';margin:5px;-webkit-text-stroke: 1px black;"></i>',
          labelAnchor: '19 37',
          labelClass: 'marker_labels'
        }
        marker.icon = {
          url: '/assets/images/logo.png', // url
          scaledSize: new google.maps.Size(1, 1), // size
        };
      })
    }

  	$scope.isActiveBus = function(routeId){
  		return !!(_.pluck($scope.data.markers,'shortName').indexOf(routeId) != -1);
  	}

  	$scope.polylines = [];
  	$scope.addPolyLines = function(){
  		angular.forEach($scope.schedules, function(schedule){
  			angular.forEach(schedule.runs,function(run){
          if(!_.isEmpty(run.polylines[0])){
            $scope.data.polylines.push({
              id:run.runId,
  						mode: schedule.mode,
              shortName: schedule.shortName,
              path: google.maps.geometry.encoding.decodePath(run.polylines[0].polyline),
              stroke:{
                color: $scope.colorMap[schedule.shortName],
                opacity: 1.0,
                weight: 4
              },
              startHour: parseInt(run.stops[0].stopTime.split(':')[0])
            })
          }
  			})
  		})
  		
  	}


  	$scope.stops = [];
  	$scope.addStopMarkers = function(){
  		var startHour;
  		angular.forEach($scope.schedules, function(schedule){
  			angular.forEach(schedule.runs,function(run){
  				startHour = parseInt(run.stops[0].stopTime.split(':')[0])
  				angular.forEach(run.stops, function(stop){
            $scope.data.stops.push({
							mode:schedule.mode,
              shortName:schedule.shortName,
              runId:run.runId,
              id:stop.stopId,
              startHour:startHour,
              stopName: stop.stopName,
              stopTime: stop.stopTime,
              latitude:stop.latitude,
              longitude:stop.longitude,
              icon:'/assets/images/bus.png'
            })
  				})
  			})
  		})
  	}


  	$scope.centerMap = function(){
      uiGmapGoogleMapApi.then(function(){
    		var bounds = new google.maps.LatLngBounds();
        for (var i = $scope.display.markers.length - 1; i >= 0; i--) {
          bounds.extend(new google.maps.LatLng($scope.display.markers[i].latitude,$scope.display.markers[i].longitude))
        }
        for (var i = $scope.display.stops.length - 1; i >= 0; i--) {
          bounds.extend(new google.maps.LatLng($scope.display.stops[i].latitude,$scope.display.stops[i].longitude))
        }
    		if($scope.display.markers.length > 0)
    			$scope.map.control.getGMap().fitBounds(bounds);
      })
  	}

  	$scope.nextStopRecapData = {}
  	$scope.updateEtas = function(){
  		TrackingService.getTimetables().then(function(response){
  			var nextStop;
				//QUESTION updating schedules ok here?
  			$scope.schedules = response.data.schedules.van.concat(response.data.schedules.bus);
	  		angular.forEach($scope.schedules, function(route){
	  			nextStop = false; // this ensures only one display per route
	  			angular.forEach(route.runs, function(run){
	  				angular.forEach(run.stops,function(stop){
	  					if(!nextStop && angular.isDefined(stop.eta)){
							$scope.nextStopRecapData[route.shortName] = {
								mode: route.mode,
								shortName: route.shortName,
								stopName: stop.stopName,
								stopTime: stop.stopTime,
								stopEta: stop.eta,
								stopEtaSeconds: stop.etaSeconds
							}
							nextStop = true;
						}
	  				})
	  			})
	  		})
	  		$timeout(function(){
          if(!$scope.leftPage)
		        $scope.updateEtas();
        },60000)
  		});
  	}

    $scope.$on('$destroy', function () { $scope.leftPage = true; })



  }]);
