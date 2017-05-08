/*globals L*/
angular.module('rpOperatorApp')
  .controller('StopRadiusCtrl', ["$scope","leafletData","$timeout","$uibModalInstance","stop","time",
	function($scope,leafletData,$timeout,$uibModalInstance, stop, time) {
    'use strict';

    $scope.time = time
		$scope.stopRadiusMap = {};
    $scope.var = {}
    $scope.var.stopRadius = stop.radius ? stop.radius : 0
    if(!$scope.var.stopRadius && !_.isEmpty(stop.operations) && stop.operations.stagingRadius)
      $scope.var.stopRadius = stop.operations.stagingRadius

    if(!_.isEmpty(stop.operations) && stop.operations.stagingTime){
      $scope.var.stagingTime = stop.operations.stagingTime
    }
    else
      $scope.var.stagingTime = moment().startOf('day')

		$scope.defaults ={
			tileLayer: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
		}
		$scope.center = {
        lat: stop.latitude,
        lng: stop.longitude,
        zoom: 14
    }
    $scope.markers = {
    	stopMarker: {
        lat: stop.latitude,
        lng: stop.longitude,
        message: "First Stop",
        focus: true,
        draggable: false
      }
    }
		$scope.layers = {
			baselayers: {
        openStreetMap: {
          name: 'OpenStreetMap',
          type: 'xyz',
          url: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
        }
      }
    }

    $scope.timeOptions = {
			format:'LT',
      timeZone:null,
      defaultDate: moment($scope.var.stagingTime,'HH:mm:ss'),
			allowInputToggle:true
		}

    // Must do this on load to refresh map
    leafletData.getMap('stopRadiusMap').then(function(map) {
    	$timeout(function(){
	    	map.invalidateSize();
	    },0)
			$scope.circle = L.circle({lat: stop.latitude,lng: stop.longitude}, $scope.var.stopRadius).addTo(map)
		});

    $scope.done = function(){
      if(angular.isDefined(stop.radius))
        stop.radius = $scope.var.stopRadius
    	$uibModalInstance.close({
    		stopRadius:$scope.var.stopRadius,
    		stagingTime: $scope.var.stagingTime ? $scope.var.stagingTime.format('HH:mm:ss') : null
    	})
    }

		$scope.$watch('var.stopRadius', function(newRadius){
			if(angular.isDefined(newRadius) && angular.isDefined($scope.circle))
				$scope.circle.setRadius(newRadius)
		})


}])