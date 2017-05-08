'use strict';

angular.module('rpOperatorApp')
  .controller('CorpOverviewWidgetCtrl', ["$scope", "RidershipService","$timeout",
	function($scope, RidershipService, $timeout) {
		$scope.loading = true
		$scope.isLoading = {}
		$scope.data = {}

		this.init = function( scope, element, attrs ){
			// this is the link function from the directive in case I need any of this data
		}

		$scope.loadingDone = function(widgetName){
			$scope.isLoading[widgetName] = false
			if($scope.isLoading.capacity == false)
				$scope.loading = false
		}

		$scope.loadingFn = function(){
			$scope.loading = true
		}

		// Need RunId in ridership
		$scope.processRidershipData = function(data){
			var response = {}, date = '', realResponse = []
			for (var i = data.length - 1; i >= 0; i--) {
				date = moment(data[i].date,'x').startOf('day').format('x')
				response[date] = ( angular.isDefined(response[date]) ) ? response[date] + 1 : 1
			}
			return realResponse
		}

		$scope.processCapacityData = function(data){
			$scope.loading = true
			$scope.detectWhenCapacityProcessingDone(data)
			var runData = {}, maxUtil = 0
			$scope.data.capacity = {}
			angular.forEach(data, function(bus){
				$scope.data.capacity[bus.shortName] = {}
				angular.forEach(bus.runs, function(run){
					maxUtil = 0
					angular.forEach(run.dates, function(runDate){
						if(runDate.capacity > 0 && runDate.riders / runDate.capacity > maxUtil){
							maxUtil = runDate.riders / runDate.capacity
						}
					})
					$scope.data.capacity[bus.shortName][run.runId] = Math.round( maxUtil * 100 )
				})
			})
		}

		$scope.detectWhenCapacityProcessingDone = function(rawCapacity){
			if(angular.isDefined($scope.data.capacity) && _.pluck(rawCapacity,'shortName').length === Object.keys($scope.data.capacity).length)
				$scope.loadingDone('capacity')
			else
				$timeout(function(){
					$scope.detectWhenCapacityProcessingDone(rawCapacity)
				},100)
		}

		$scope.processOnTimeData = function(data){

		}

		if(angular.isDefined($scope.ridershipData) && $scope.ridershipData){
			$scope.processRidershipData($scope.ridershipData);
		}

		if(angular.isDefined($scope.onTimeData) && $scope.onTimeData){
			$scope.processOnTimeData($scope.onTimeData);
		}

		if(angular.isDefined($scope.capacityData) && $scope.capacityData){
			$scope.capacityData.then(function(data){
				$scope.processCapacityData(data)
				$scope.watchForCapacityChanges()
			})
		}

		$scope.watchForCapacityChanges = function(){
			$scope.$watch('capacityData', function(data){
				data.then($scope.processCapacityData)
			})
		}
}])