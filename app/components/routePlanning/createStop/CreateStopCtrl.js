angular.module('rpOperatorApp')
  .controller('CreateStopCtrl', ["$scope", "CreateStopService","$timeout","$uibModal", "leafletData",
	function($scope, CreateStopService, $timeout, $uibModal, leafletData) {
		'use strict';
		$scope.marker = {};
		$scope.editing = false;
		$scope.isActive = false;

		this.init = function( element ){
			$scope.element = element;
			$scope.blankNgAutoComplete();
			//$scope.blankStop();
		}

		$scope.blankNgAutoComplete = function(){
			$scope.autocomplete = {
				details:{},
				text:''
			}
		}

		$scope.blankStop = function(){
			$scope.stop = {
				marketId: 1
			}
		}

		$scope.addressSelected = function(){
			$scope.addOrMoveMarker( $scope.autocomplete.details.geometry.location.lat(), $scope.autocomplete.details.geometry.location.lng() )
		}

		$scope.addOrMoveMarker = function(lat, lng){
			if($scope.isActive){
				console.log(leafletData)

				var base64icon = "data:image/png;base64,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";
        var base64shadow = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAApCAYAAACoYAD2AAAC5ElEQVRYw+2YW4/TMBCF45S0S1luXZCABy5CgLQgwf//S4BYBLTdJLax0fFqmB07nnQfEGqkIydpVH85M+NLjPe++dcPc4Q8Qh4hj5D/AaQJx6H/4TMwB0PeBNwU7EGQAmAtsNfAzoZkgIa0ZgLMa4Aj6CxIAsjhjOCoL5z7Glg1JAOkaicgvQBXuncwJAWjksLtBTWZe04CnYRktUGdilALppZBOgHGZcBzL6OClABvMSVIzyBjazOgrvACf1ydC5mguqAVg6RhdkSWQFj2uxfaq/BrIZOLEWgZdALIDvcMcZLD8ZbLC9de4yR1sYMi4G20S4Q/PWeJYxTOZn5zJXANZHIxAd4JWhPIloTJZhzMQduM89WQ3MUVAE/RnhAXpTycqys3NZALOBbB7kFrgLesQl2h45Fcj8L1tTSohUwuxhy8H/Qg6K7gIs+3kkaigQCOcyEXCHN07wyQazhrmIulvKMQAwMcmLNqyCVyMAI+BuxSMeTk3OPikLY2J1uE+VHQk6ANrhds+tNARqBeaGc72cK550FP4WhXmFmcMGhTwAR1ifOe3EvPqIegFmF+C8gVy0OfAaWQPMR7gF1OQKqGoBjq90HPMP01BUjPOqGFksC4emE48tWQAH0YmvOgF3DST6xieJgHAWxPAHMuNhrImIdvoNOKNWIOcE+UXE0pYAnkX6uhWsgVXDxHdTfCmrEEmMB2zMFimLVOtiiajxiGWrbU52EeCdyOwPEQD8LqyPH9Ti2kgYMf4OhSKB7qYILbBv3CuVTJ11Y80oaseiMWOONc/Y7kJYe0xL2f0BaiFTxknHO5HaMGMublKwxFGzYdWsBF174H/QDknhTHmHHN39iWFnkZx8lPyM8WHfYELmlLKtgWNmFNzQcC1b47gJ4hL19i7o65dhH0Negbca8vONZoP7doIeOC9zXm8RjuL0Gf4d4OYaU5ljo3GYiqzrWQHfJxA6ALhDpVKv9qYeZA8eM3EhfPSCmpuD0AAAAASUVORK5CYII=";

        var icon = new L.Icon.Default({
          iconUrl: base64icon,
          shadowUrl: base64shadow,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });


				if(_.isEmpty($scope.marker)){
					$scope.marker = {}
					$scope.marker = L.marker(
						[lat, lng],
						{
							icon: icon,
							draggable: !$scope.editing,
							title: 'New Stop',
						}
					).addTo($scope.mapInstance );
					$scope.setEventHandlers();
				}else{
					$scope.blankStop()
					$scope.marker.setLatLng([lat, lng])
				}

				$scope.updateStreetView(lat,lng);
				if(!$scope.editing)
					$scope.updateInputs(lat,lng)
			}
		}

		$scope.updateInputs = function(lat, lng){
			$scope.stop.latitude = lat
			$scope.stop.longitude = lng
			$scope.geoCodeFn(lat,lng).then(function(addressData){
				angular.forEach(addressData, function(addressType){
					switch(addressType.types[0]){
	          case "postal_code":
		          $scope.stop.zipcode = addressType.address_components[0].short_name
              break;
	          case "street_address":
          		$scope.stop.streetAddress = addressType.address_components[0].short_name + ' ' + addressType.address_components[1].short_name
              break;
	          case "administrative_area_level_1":
	          	$scope.stop.state = addressType.address_components[0].short_name
              break;
	          case "locality":
	          	$scope.stop.city = addressType.address_components[0].long_name
              break;                  
	        }
				})
			})

		}

		$scope.setEventHandlers = function(){
			$scope.marker.on('dragend', $scope.dragEnded);
		}

		$scope.dragEnded = function(dragObject, args){
			$scope.updateStreetView(dragObject.target.getLatLng().lat, dragObject.target.getLatLng().lng)
		}

		$scope.$on('leafletDirectiveMap.map.click', function(e, args) {
			if(!$scope.editing)
				$scope.addOrMoveMarker(args.leafletEvent.latlng.lat, args.leafletEvent.latlng.lng);
		});

		$scope.removeMarker = function(){
			$scope.mapInstance.removeLayer($scope.marker);
			$scope.marker = {}
			$scope.blankNgAutoComplete();
			//$scope.blankStop();
		}

		$scope.shouldShowStopInputs = function(){
			return !_.isEmpty($scope.marker);
		}

		$scope.updateStreetView = function(lat, lng){
      var placeLoc = new google.maps.LatLng(lat, lng);
      var panoramaOptions = {
          disableDefaultUI:true,
          panControl:true,
          pov: {
            heading: 30,
            pitch: 5,
            zoom: 1
          }
      };

      // init panorama
      $scope.streetView = new google.maps.StreetViewPanorama(document.getElementById('streetView'),panoramaOptions);

      // set final destination panorama - needed to force outdoors
      new google.maps.StreetViewService().getPanorama({
      	location: placeLoc,
      	source: google.maps.StreetViewSource.OUTDOOR
      },function(data){
      	$scope.streetView.setPano(data.location.pano)
    		// This refreshes the panorama after fade animation finshed
      	$scope.refreshPano()
      });
    }

    $scope.refreshPano = function(){
    	$timeout(function(){
      	google.maps.event.trigger($scope.streetView, 'resize')
    	},100)
    }

    $scope.editStopRadius = function(){
			var modalInstance = $uibModal.open({
	      templateUrl:'/components/routePlanning/stopRadius/StopRadiusView.html',
	      controller:'StopRadiusCtrl',
	      size: 'lg',
	      resolve: {
	      	stop: $scope.stop,
	      	time:false
	      }
	    })

	    modalInstance.result.then(function (modalResult) {
	      $scope.stop.radius = parseInt(modalResult.stopRadius);
	    })
    }

    $scope.updateStreetViewPictrueUrl = function(){
        var lat = $scope.streetView.getPosition().lat();
        var lng = $scope.streetView.getPosition().lng();
        var heading = $scope.streetView.getPov().heading;
        var pitch = $scope.streetView.getPov().pitch;
        var finalUrlPrefix = "https://maps.googleapis.com/maps/api/streetview?size=300x204&location=";

        $scope.stop.pictureUrl = finalUrlPrefix + lat + "," + lng + "&fov=90&heading=" + heading + "&pitch=" + pitch;
    }

    $scope.saveStop = function(){
    	// Add lat, lng
    	// validate
    	$scope.stop.latitude = $scope.marker.getLatLng().lat
    	$scope.stop.longitude = $scope.marker.getLatLng().lng
    	$scope.updateStreetViewPictrueUrl();
    	CreateStopService.upsertStop($scope.stop).then(function(res){
    		$scope.onAddressSelect()
    		$scope.isVisible = false
    		$scope.editing = true
    	}, function(err){
    	})
    }

    $scope.isNowVisible = function(){
    	if($scope.stopIsSet()){
    		$scope.editing = true;
    		$scope.setStopFromInput()
    	}else{
    		$scope.editing = false;
    		$scope.blankStop()
    	}
    }

    $scope.setStopFromInput = function(){
			if(!_.isEmpty($scope.stop)){
				$scope.stop.marketId = $scope.stop.market_id
				$scope.stop.streetAddress = $scope.stop.street_address	
			}
    	$scope.addOrMoveMarker($scope.stop.latitude,$scope.stop.longitude)
    }

    $scope.stopIsSet = function(){
    	return angular.isDefined($scope.stop) && !_.isEmpty($scope.stop) && ( angular.isDefined($scope.stop.lat) || angular.isDefined($scope.stop.latitude) );
    }

		$scope.$watch('isVisible',function(isVisible){
			if(isVisible === false){
				$scope.isActive = false;
				$scope.removeMarker();
			}else{
    		$scope.isActive = true;
				$scope.isNowVisible()
			}
		})



}])