'use strict';

angular.module('rpOperatorApp')
  .controller('RidershipOverviewWidgetCtrl', ["$scope", "RidershipService","$timeout",
	function($scope, RidershipService, $timeout) {
		$scope.rides = '-'
		$scope.loading = true
		$scope.chartData = [{
			values: []
		}]


		this.init = function( scope, element, attrs ){
			// this is the link function from the directive in case I need any of this data
		}

		$scope.getRidershipData = function(){
			RidershipService.getRidershipData( $scope.getRidershipDates() ).then(function(response){
				$scope.processData(response.data)
			})
		}

		$scope.getRidershipDates = function(){
			return (angular.isDefined($scope.dates)) ? $scope.dates : {start: moment().subtract(2,'weeks').format('x'), end: moment().format('x')}
		}

		$scope.processData = function(data){
			$scope.rides = data.length
			$scope.setGraphData(data)
			$scope.detectWhenGraphReady()
		}

		// If ridership is not set, but dates are. Watch for date changes and update accordingly
		$scope.watchForDateChanges = function(){
			if(angular.isDefined($scope.dates)){
				$scope.$watch('dates', $scope.getRidershipData)
			}
		}

		$scope.watchForRidershipChanges = function(){
			if(angular.isDefined($scope.ridershipData)){
				$scope.$watch('ridershipData', function(){
					if($scope.ridershipData && angular.isFunction($scope.ridershipData.then))
						$scope.ridershipData.then($scope.processData)
				})
			}
		}

		$scope.detectWhenGraphReady = function(){
			var totalGraphRides = $scope.chartData[0].values.length > 0 ? _.reduce($scope.chartData[0].values, function(dataPoint,b){ return dataPoint + parseFloat(b[1])},0) : 0;
			if($scope.rides === totalGraphRides)
				$scope.loadingDone()
			else
				$timeout($scope.detectWhenGraphReady,100)
		}

		$scope.loadingDone = function(){
			$scope.loading = false
		}

		$scope.loadingFn = function(){
			$scope.loading = true
		}

		$scope.parseDataOrMakeApiCall = function(){
			if(angular.isDefined($scope.ridershipData) && angular.isFunction($scope.ridershipData.then)){
				$scope.ridershipData.then($scope.processData)
				$scope.watchForRidershipChanges()
			}else if(angular.isDefined($scope.ridershipData)){
				$timeout($scope.parseDataOrMakeApiCall,2000)
			}else{
				$scope.getRidershipData()
				$scope.watchForDateChanges()
			}
		}
		$scope.parseDataOrMakeApiCall()

		$scope.setGraphData = function(data){
			$scope.chartData = [{
				key: 'Rides',
				values: $scope.getGraphValues(data)
			}]
		}

		$scope.getGraphValues = function(data){
			var response = {}, date = '', realResponse = []
			for (var i = data.length - 1; i >= 0; i--) {
				date = moment(data[i].date,'x').startOf('day').format('x')
				response[date] = ( angular.isDefined(response[date]) ) ? response[date] + 1 : 1
			}
			angular.forEach(response, function(value, date){
				realResponse.push([parseInt(date),value])
			})
			realResponse = _.sortBy(realResponse, function(array){ return array[0] });
			return realResponse
		}

		$scope.chartOptions = {
			chart: {
        type: 'multiBarChart',
        height: $scope.graphHeight || 250,
        showLegend:false,
        margin: {
            top: 20,
            bottom: 60
        },
        x: function(d){ return d[0]; },
        y: function(d){ return d[1]; },
        valueFormat: function(d){
        	parseInt(d)
        },
       	reduceXTicks:true,
       	showControls: false,
        color: function(){return 'rgb(31, 119, 180)'},
        xAxis: {
          tickFormat: function(d){
            return d3.time.format('%x')(new Date(d));
          },
          rotateLabels: 30,
      		showMaxMin: false,
        },
        yAxis: {
          axisLabel: 'Rides',
          axisLabelDistance: -10,
          showMaxMin: false,
          tickFormat: function(d){
            return parseInt(d);
          },
        },
	    }
	    
		}

}])