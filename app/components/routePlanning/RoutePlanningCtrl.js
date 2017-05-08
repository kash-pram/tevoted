'use strict';

angular.module('rpOperatorApp')
  .controller('RoutePlanningCtrl', ["$scope", "RoutePlanningService", "$uibModal",
	function($scope,RoutePlanningService, $uibModal) {
		$scope.routes = []
		$scope.runGroups = {am:[],pm:[]}
		$scope.runHeaders = {am:[],pm:[]}
		$scope.noRuns = false

		$scope.getRoutes = function(){
			RoutePlanningService.getRoutes().then(function(response){
				$scope.processRoutes(response)
			})
		}
		$scope.getRoutes();

		$scope.processRoutes = function(routeResponse){
			var addRoute;
			angular.forEach(routeResponse, function(route){
				if( route.endDate === null || route.endDate > moment().valueOf()){
					addRoute = route;
					addRoute.shortName = parseInt(route.shortName)
					$scope.routes.push(addRoute);
				}
			})
			$scope.routes.sort(naturalSortBy('shortName'))
		}

		$scope.selectRoute = function(route){
			$scope.runGroups = {am:[],pm:[]}
			$scope.runHeaders = {am:[],pm:[]}
			$scope.selectedRoute = route; // overridden in getRunTimelines()
			$scope.setStartString(route)
			$scope.getRunTimelines(route.routeId);
		}


		$scope.setStartString = function(route){
			var startDate = moment(route.startDate,'x')
			$scope.startString = (startDate.isAfter(moment()) ? 'Starts: ' : 'Started: ') + startDate.format('MMM Do YYYY, h:mm:ss a')
		}

		$scope.setEndString = function(route){
			if(!route.endDate)
				$scope.endString = ''
			else{
				var endDate = moment(route.endDate,'x')
				$scope.endString = (endDate.isAfter(moment()) ? 'Ends: ' : 'Ended: ') + endDate.format('MMM Do YYYY, h:mm:ss a')	
			}
			
		}

		$scope.getRunTimelines = function(routeId){
			RoutePlanningService.getRunTimelines(routeId).then(function(response){
				$scope.processRunTimelines(response.runTimelines);
				$scope.selectedRoute = _.extend($scope.selectedRoute, response.route)
				$scope.getRunHeaders(response.runTimelines);
			})
		}

		$scope.processRunTimelines = function(runTimelineResponse){
			if(runTimelineResponse.length === 0){
				$scope.noRuns = true
			}
			angular.forEach(runTimelineResponse, function(runTimeline){
				$scope.runGroups[ $scope.amOrPm(runTimeline[0].stops[0].stopTime) ].push(runTimeline)
			})
		}

		// used to show/hide runGroups
		$scope.runGroupsSet = function(){
			return (!_.isEmpty($scope.runGroups.am) || !_.isEmpty($scope.runGroups.pm)) || $scope.noRuns
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
							stopTime:run.stops[i].stopTime
						}

						// This tries to figure out the order that the stops should be in
						// It is for runs that have an extra stop or two
						if(_.pluck($scope.runHeaders[ amOrPm ],'stopDescId').indexOf(runHeader.stopDescId) == -1){
							spliceIndex = (i == 0) ? 0 : _.pluck($scope.runHeaders[ amOrPm ],'stopDescId').indexOf(run.stops[i-1].stopDescId) + 1
							$scope.runHeaders[ amOrPm ].splice(spliceIndex, 0, runHeader)
						}
					}
				})
			})
			$scope.runHeaders.am = _.sortBy($scope.runHeaders.am, 'stopTime')
			$scope.runHeaders.pm = _.sortBy($scope.runHeaders.pm, 'stopTime')
			console.log($scope.runHeaders)
		}

		$scope.amOrPm = function(time){
			return (time.replace(':','').substring(0,4) >= 1200) ? 'pm' : 'am'
		}

		$scope.getStopTime = function(run, runHeader){
			for (var i = 0; i < run.stops.length; i++) {
				if(run.stops[i].stopDescId == runHeader.stopDescId){
					return moment(run.stops[i].stopTime,'HH:mm:ss').format('HH:mm')
				}
			}
		}

		$scope.addEditRoute = function(route){
			if(_.isUndefined(route))
				route = null

			var modalInstance = $uibModal.open({
	      templateUrl: '/components/routePlanning/createRoute/CreateRouteView.html',
	      controller: 'CreateRouteCtrl',
	      size: 'lg',
	      resolve: {
	        route: function () {
	          return route;
	        }
	      }
	    });

	    modalInstance.result.then(function (route) {
	      console.log(route)
	    }, function () {
	      console.log('Modal dismissed at: ' + new Date());
	    });
		}

}])