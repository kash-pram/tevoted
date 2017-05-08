'use strict';

angular.module('rpOperatorApp')
  .controller('CapacityCtrl', ["$scope", "CapacityService","$timeout","sweetAlert","$location","$q",
	function($scope,CapacityService, $timeout, SweetAlert, $location, $q) {
		$scope.dates = {}
		$scope.dates.startDateField = new Date(new Date().setDate(new Date().getDate()-14))
  	$scope.dates.endDateField = new Date();
  	$scope.format = "MMM dd yyyy";
  	$scope.queryParameters = {}
  	$scope.hideProgressBars = false
  	$scope.go = false
  	$scope.spinner = true
	  $scope.routeView = true
	  $scope.switch = {radio:'Peak'}
	  $scope.series = ['Series A'];
	  $scope.capacityData = []
	  $scope.runTimes = {}


	  $scope.getCapacityData = function(){
	  	$scope.spinner = true
	  	$scope.updateQueryDates()
	  	CapacityService.getCapacityData($scope.queryParameters).then(function(response){
	  		$scope.spinner = false
	  		$scope.capacityData = response;
	  		$scope.addTimesToCapacityData()
	  		$scope.addChartData();
	  		$scope.getBusTotalUtilization();
	  		$scope.checkIfBusIsInQueryParameters();
	  	})
	  }

	  $scope.getRunTimes = function(){
	  	CapacityService.getRunTimes().then(function(runTimes){
	  		$scope.runTimes = runTimes
	  		$scope.addTimesToCapacityData()
	  	})
	  }
	  $scope.getRunTimes()

	  $scope.addTimesToCapacityData = function(){
	  	if($scope.capacityData.length !== 0 && !_.isEmpty($scope.runTimes)){
		  	angular.forEach($scope.capacityData, function(capacityRow){
		  		angular.forEach(capacityRow.runs, function(run){
			  		run.runTime = moment( $scope.runTimes.runs[ run.runId ], 'HH:mm:ss' ).format('LT')
		  		})
		  	})	
	  	}
	  }

	  $scope.addChartData = function(){
	  	angular.forEach($scope.capacityData, function(bus){
	  		bus.shortNameInt = parseInt(bus.shortName)
	  		angular.forEach(bus.runs, $scope.setChartData)
	  	})
	  }

	  $scope.setChartData = function(runOrBus){
			$scope.sortChartDataByDate(runOrBus).then(function(response){
				runOrBus = response;
		  	runOrBus.chartData = $scope.getChartDataForRunOrBus(runOrBus)
				runOrBus.chartLabels = $scope.getChartLabelsForRunOrBus(runOrBus)
			})
	  }

	  $scope.sortChartDataByDate = function(runOrBus){
	  	var defer = $q.defer();
	  	runOrBus.dates = _.sortBy(runOrBus.dates, function(o) { return moment(o.date,'YYYY-MM-DD').valueOf(); })
	  	defer.resolve( runOrBus )
	  	return defer.promise;
	  }

	  $scope.getChartLabelsForRunOrBus = function(runOrBus){
	  	var labels = []
	  	angular.forEach(runOrBus.dates, function(date){
	  		if(date.capacity != 0){
		  		labels.push( moment(date.date,'YYYY-MM-DD').format('MMM D, YYYY') )
		  	}
	  	})
	  	return labels;
	  }

	  $scope.getChartDataForRunOrBus = function(runOrBus){
	  	var utilizations = []
	  	angular.forEach(runOrBus.dates, function(date){
	  		if(date.capacity != 0){
		  		date.utilization = $scope.prettifyUtilizationPercent( date.riders, date.capacity )
		  		utilizations.push(date.utilization)
		  	}
	  	})
	  	runOrBus.utilization = Math.round( $scope.getAverageOfArray( utilizations ) )
	  	runOrBus.peakUtilization = _.max(utilizations)
	  	return [utilizations];
	  }

	  $scope.getBusTotalUtilization = function(){
	  	var allRiders = 0, allCapacity = 0;
	  	angular.forEach($scope.capacityData, function(bus){
	  		bus.peakUtilization = 0
	  		allRiders = 0, allCapacity = 0;
	  		angular.forEach(bus.runs, function(run){
	  			angular.forEach(run.dates, function(date){
	  				if(date.capacity != 0){
		  				allRiders += date.riders;
		  				allCapacity += date.capacity;
		  				if(bus.peakUtilization < $scope.prettifyUtilizationPercent( date.riders, date.capacity ))
		  					bus.peakUtilization = $scope.prettifyUtilizationPercent( date.riders, date.capacity )
	  				}
	  			})
	  		})
	  		bus.utilization = $scope.prettifyUtilizationPercent( allRiders, allCapacity )
	  	})
	  }

	  $scope.prettifyUtilizationPercent = function(riders,capacity){
	  	if(capacity === 0)
	  		return 0
	  	else
	  		return Math.round( riders / capacity * 100 )
	  }

	  $scope.getAverageOfArray = function(numbers){
	  	var sum = 0;
	  	for (var i = 0; i < numbers.length; i++) {
	  		sum += numbers[i]
	  	}
	  	return ( numbers.length > 0 ) ? sum / numbers.length : 0;
	  }

	  $scope.updateQueryDates = function(){
			$scope.queryParameters.start =  moment($scope.dates.startDateField).format("YYYY-MM-DD");
			$scope.queryParameters.end = moment($scope.dates.endDateField).format("YYYY-MM-DD");
		}

	  $scope.getType = function(utilization){
	  	if(utilization > 79)
	  		return 'danger'
	  	else if(utilization  > 69 && utilization < 80)
	  		return 'warning'
	  	else
	  		return 'success'
	  }

	  $scope.formatLabels = function(dates){
	  	var datesResponse = []
	  	angular.forEach(dates, function(date){
	  		datesResponse.push( moment(date,'YYYY-MM-DD').format('MMM D, YYYY') )
	  	})
	  	return datesResponse;
	  }


	  $scope.selectRoute = function(route){
	  	$scope.selectedRoute = route
	  	$scope.routeView = false
	  	$location.search('bus', route.shortName);
	  	//$scope.getRouteDetails(route.routeId)
	  }

	  $scope.getRouteDetails = function(routeId){
	  	CapacityService.getRouteDetails(routeId).then(function(response){
	  		$scope.routeDetails = response
	  	})
	  }

	  $scope.getValue = function(capacity, adjustForBus){
	  	if($scope.hideProgressBars)
	  		return 1
	  	else{
	  		var adjustment = (adjustForBus) ? 5 : 0;
	  		return ($scope.switch.radio == 'Peak') ? capacity.peakUtilization - adjustment : capacity.utilization - adjustment
	  	}
	  }
	  
	  $scope.goBack = function(){
	  	$scope.routeView = true
	  	$location.search({})
	  }
	  $scope.getCapacityData()

	  $scope.checkIfBusIsInQueryParameters = function(){
	  	if( angular.isDefined( $location.search().bus ) ){
	  		var route = _.where( $scope.capacityData, { shortName: $location.search().bus } )[0];
  			$scope.selectRoute(route)
	  	}else{
	  		$scope.routeView = true
	  	}
	  }

	  if(typeof $scope.$watch == 'function'){ // karma doesn't recognize this, @TODO fix this
		  $scope.$watch(function(){ return $location.search() }, function(newParams,oldParams){
			  if( newParams.bus != oldParams.bus ){
			  	$scope.checkIfBusIsInQueryParameters()
			  }
			});
		}

	  $scope.raceBuses = function(){
	  	$('.race-messages h1').removeClass('animated tada')
	  	$('.progress-bar').removeClass('race');
	  	$scope.hideProgressBars = true;
	  	$timeout($scope.showProgressBars, 2000) //delay for animation
	  }

	  $scope.showProgressBars = function(){
	  	$scope.go = true;
	  	$('.race-messages h1').addClass('animated tada')
	  	$('.progress-bar').addClass('race');
	  	$scope.hideProgressBars = false
	  	$timeout($scope.hideGo,1200)
	  	$timeout($scope.showWinner,12400)
	  }

	  $scope.hideGo = function(){
	  	$scope.go = false
	  }

	  $scope.getWinner = function(){
	  	return _.max($scope.capacityData, function(o){return ($scope.switch.radio == 'Peak') ? o.peakUtilization : o.utilization;});
	  }

	  $scope.showWinner = function(){
	  	$('.progress-bar').removeClass('race');
	  	SweetAlert.swal({
			  html: '<p  style="font-size:50px"><i class="fa fa-flag-checkered"></i> Done!</p><br><br> <p>and the winner is</p> <p style="font-size:70px"><i class="fa fa-trophy"></i> Bus ' + $scope.getWinner().shortName + ' <i class="fa fa-trophy"></i></p>',
			  timer: 10000,
			  confirmButtonText: 'Wooohooo!',
			  closeOnConfirm:true
			})
	  }


	  $scope.colors = [{
	  	fillColor: "rgba(34, 167, 240,0.2)",
      strokeColor: "#22A7F0",
      pointColor: "#22A7F0",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "#22A7F0",
	  }]
	  $scope.options = {
	  	//showScale: false,
	    scaleShowGridLines: true,
	    scaleGridLineColor: "rgba(0,0,0,.05)",
	    scaleGridLineWidth: 1,
	    scaleOverride: true, 
	    scaleStartValue: 0,
	    scaleStepWidth: 10,
	    scaleSteps: 10,
	    showXLabels: 10,
	    scaleShowHorizontalLines: true,
	    scaleShowVerticalLines: true,
	    //bezierCurve: false,
	    //bezierCurveTension: 0.4,
	    pointDot: true,
	    pointDotRadius: 4,
	    pointDotStrokeWidth: 1,
	    pointHitDetectionRadius: 1,
	    datasetStroke: true,
	    datasetStrokeWidth: 2,
	    datasetFill: true
	  }


	  /********
		* This stuff is used to make fancy little tooltips. Only way to do it...
	  *********/
	  Chart.defaults.global.tooltipTemplate = function(v){
	  	return v.label + ':::' + v.value + ':::' + v.datasetLabel
	  }

	  Chart.defaults.global.customTooltips = function (v) {
        var tooltipEl = $('.chartjs-tooltip');
        // hide tooltip if not in use
        if (!v) { 
        	tooltipEl.css({ opacity: 0 }); 
        	return; 
        }

        var parts = v.text.split(":::");
        tooltipEl = $('.chartjs-tooltip.run-'+parts[2]);
        tooltipEl.removeClass('above below');
        tooltipEl.addClass(v.yAlign);

        var formattedDate = moment(parts[0],'MMM D, YYYY').format('YYYY-MM-DD')
        var riders = 0
        var capacity = 0

        angular.forEach($scope.selectedRoute.runs, function(run){
        	if(run.runId == parts[2]){
        		angular.forEach(run.dates, function(date){
        			if(date.date == formattedDate){
        				riders = date.riders
        				capacity = date.capacity
        			}
        		})
        	}
        })
        
        // split out the label and value and make your own tooltip here
        var innerHtml = '<span>' + parts[0] + '<br>Utilization: ' + parts[1] + '%<br>Riders: ' + riders +  '/' + capacity + '</span>';
        tooltipEl.html(innerHtml);
        var left = (v.x < tooltipEl.width()) ? tooltipEl.width() + 'px' : v.chart.canvas.offsetLeft + v.x + 'px'
        if(v.chart.canvas.width - v.x < 50)
        	left = v.chart.canvas.width - 55 + 'px'
        tooltipEl.css({
            opacity: 1,
            left: left,
            top: (v.y < 0) ? 0 : v.chart.canvas.offsetTop + v.y + 'px',
            fontFamily: v.fontFamily,
            fontSize: v.fontSize,
            fontStyle: v.fontStyle,
        });
    }
    /********
		* End of tooltip stuff
	  *********/


}])