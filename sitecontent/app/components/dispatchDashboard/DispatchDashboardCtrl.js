angular.module('rpOperatorApp')
  .controller('DispatchDashboardCtrl', ["$scope", "$state","RouteScorecardService","$interval", "DispatchDashboardService","Session","$q","$rootScope",
  	function($scope, $state, RouteScorecardService,$interval,DispatchDashboardService,Session,$q,$rootScope) {
    'use strict';

    $scope.$state = $state;
    $rootScope.pageLoading = true
    $scope.routeScoresDisplay = [];
    $scope.routeScoresSafe = [];
    $scope.routeScoresRaw = [];
    $scope.timeTableDataRaw = []
    $scope.timeTableDataDisplay = []
    $scope.tabletStatuses = {}
    $scope.timeTableLength = 0;
    $scope.Session = Session
    $scope.filters = {
    	amOrPm:'AM',
    	itemsPerPage:25
    }
    $scope.$rootScope = $rootScope
    
    $scope.datePicked = Date.now();

    $scope.interval = $interval(function(){
        $scope.datePicked = Date.now();
        $scope.checkAmPm();
		$scope.getRunData();
		$scope.getTimeTableData();
	},10000); // refresh data every 2 min

	$scope.checkAmPm = function(){
        // Switches to PM after 3pm
        var mmtNoon = moment().startOf('day').add(12,'hours');
        if(moment().isAfter(mmtNoon)){
            $scope.filters.amOrPm = 'PM';
        }else{
            $scope.filters.amOrPm = 'AM';
        }
    }
    $scope.checkAmPm();

    $scope.getTabletStats = function(){
    	DispatchDashboardService.getTabletStatuses().then(function(response){
    		$scope.tabletStatusesOriginal = response;
    		$scope.formatTabletStatuses();
    	})
    }
    $scope.getTabletStats();

    $scope.getters= {
      shortName: function (value) {
        return _.map($scope.tabletStatusesDisplay,'busNumber').sort(naturalSort).indexOf(value.busNumber);
      }
    }

    $scope.formatTabletStatuses = function(){
    	for (var i = 0; i < $scope.tabletStatusesOriginal.length; i++) {
            if( moment($scope.tabletStatusesOriginal[i].lastHealthUpdateTime).add(1,'hours').isAfter(moment())  )
              $scope.tabletStatuses [ $scope.tabletStatusesOriginal[i].busNumber ] = $scope.tabletStatusesOriginal[i]
            else
              $scope.tabletStatuses [ $scope.tabletStatusesOriginal[i].busNumber ] = 'Off'
    	}
    }

    $scope.getBatteryIcon = function(batteryLevel){
    	if(!batteryLevel)
    		return ''
    	else if(batteryLevel > 90)
    		return 'fa-battery-4'
    	else if(batteryLevel > 75)
    		return 'fa-battery-3'
    	else if (batteryLevel > 50)
    		return 'fa-battery-2'
    	else if (batteryLevel > 25)
    		return 'fa-battery-1'
    	else
    		return 'fa-battery-0'

    }

    $scope.tabletOnStatus = function(route){
    	var howLate = $scope.howLate(route.tablet_login);
    	//if last marker was less than 5 min ago, tablet is on
    	if( angular.isDefined($scope.tabletStatuses[route.shortName]) && ( Date.now() - $scope.tabletStatuses[route.shortName].lastMarkerTime ) > ( 5*60 ) ){
    		return 'On'
    	}else if( howLate < 0 ){
    		return 'Early'
    	}else if( howLate < 120 ){ // if not over 2 hours late, show they are late
    		return 'Late'
    	}else{
    		return 'Off'
    	}
    }

    $scope.getTimeTableData = function(){
    	var start = moment($scope.datePicked).startOf('day');
    	var end = moment($scope.datePicked).endOf('day');
        $scope.getRealTimetableData()

    	RouteScorecardService.getTimetableData(start, end).then(
    		function(response){
    			$scope.timeTableData = response;
				$scope.formatTimetableData();
    		});
    }

    $scope.getRealTimetableData = function(){
      DispatchDashboardService.getTimetableData().then( $scope.setFullEta )
    }

    $scope.getRunData = function(){
    	var date = moment($scope.datePicked).format('YYYY-MM-DD');
    	$scope.routeScoresRaw = [];
    	RouteScorecardService.getMetrics(date).then(
    		function(response){
    			$scope.routeScoresRaw = response;
    			$scope.formatDriverData();
    		});
    } 

    $scope.formatDriverData = function(){
        var deferred = $q.defer()
    	var runDriverMap = {}
    	var runDepartMap = {}
    	angular.forEach($scope.routeScoresRaw, function(runData){
    		angular.forEach(runData.runEvents, function(runEvent){
    			if(runEvent.kind == 'tablet_login'){
	    			runDriverMap[runEvent.runId] = runEvent.sourceData.driverName;
	    		}else if(runEvent.kind == 'yard_depart'){
	    			runDepartMap[runEvent.runId] = runEvent.timestampUTC;
	    		}

    		});
    	});
        $q.all(runDriverMap).then(function(){
            $scope.runDriverMap = runDriverMap;
            $scope.runDepartMap = runDepartMap;
            $scope.runDataformatted = true;
            deferred.resolve(true)
        })
        return deferred.promise;
    }

    $scope.formatTimetableData = function(){
        var deferred = $q.defer(),
            promises = [],
            data = {},
						shortName = 0,
						mode = '';
    	angular.forEach($scope.timeTableData, function(routeData){
				mode = routeData.route.mode;
    		shortName = routeData.route.shortName;
    		angular.forEach(routeData.runs, function(run){
          var showMoreThanOneRun = true // this is for convenience. Should delete soon.
    			if( ( showMoreThanOneRun || angular.isDefined(run.endpoints.origin[0]) ) && mode == 'bus' && $scope.runInCorrectTimeframe(run)){
            promises[run.runId] = $q.defer()
    				data[run.runId] = {
							mode: mode,
	    				shortName: shortName,
	    				tablet_login: angular.isDefined(run.endpoints.origin[0]) ? run.endpoints.origin[0].loginTime : 'n/a',
	    				yard_depart: angular.isDefined(run.endpoints.origin[0]) ? run.endpoints.origin[0].departTime : 'n/a',
	    				stop_time: run.stops[0].stopTime,
	    				runId: run.runId,
	    				stops:[]
	    			}
	    			var newStop = {}
	    			angular.forEach(run.stops,function(stop){
	    				newStop = {
	    					stopId: stop.stopId,
  							stopEta: $scope.propOrNull(stop,'eta'),
  							stopArrived: $scope.propOrNull(stop,'arrived'),
  							stopDeparted: $scope.propOrNull(stop,'departed'),
  							stopEtaSeconds: stop.etaSeconds,
  							stopName: stop.stopName,
  							stopTime: stop.stopTime
  						}
  						data[run.runId].stops.push(newStop);
	    			})
            promises[run.runId].resolve()
    			}

    		});
    	});
        $q.all(promises).then(function(){
            $scope.timeTableDataRaw = _.values(data).sort(naturalSortBy('shortName'));
            $scope.timeTableDataDisplay = angular.copy( $scope.timeTableDataRaw );
            $scope.timeTableLength = $scope.timeTableDataRaw.length;

            $scope.timeTableDataFormatted = true;
            $rootScope.pageLoading = false
            deferred.resolve()
        })
        return deferred.promise;
    }

    $scope.etas = {}
    $scope.setFullEta = function(response){
      var data,stopData;
      angular.forEach(response.schedules, function(mode){
        angular.forEach(mode, function(route){
          angular.forEach(route.runs, function(run){
            angular.forEach(run.stops,function(stop){
              data = {
                mode: route.mode,
                shortName: route.shortName,
                runId: run.runId,
                stopName: stop.stopName,
                stopTime: stop.stopTime,
                stopId: stop.stopId,
                stopEta: propOrNull(stop,'eta'),
                stopArrived: propOrNull(stop,'arrived'),
                stopDeparted: propOrNull(stop,'departed'),
                stopEtaSeconds: stop.etaSeconds
              }
              $scope.etas[stop.stopId] = data
            })
          })         
        })

      })
    }

    var propOrNull = function(obj,property){
        if(angular.isDefined(obj[property]))
            return obj[property]
        return null;
    }

    $scope.getDotClass = function(eta){
        if(!angular.isDefined(eta))
            return 'fa-circle-o'
        if(!eta.stopEta && !eta.stopArrived && !eta.stopDeparted)
            return 'fa-circle-o';
        if(eta.stopArrived && eta.stopDeparted){
            var scheduled = moment(eta.stopTime,'HH:mm:ss');
            var departed = moment(eta.stopDeparted, 'HH:mm:ss');
            if(departed.diff(scheduled,'minutes') > 5)
                return 'fa-danger fa-circle';
            return 'fa-green fa-circle';
        }
        if(eta.stopEta){
            if(eta.stopEtaSeconds > ( 5 * 60 ) )
                return 'fa-danger fa-circle-o';
            return 'fa-green fa-circle-o';
        }
        if(!eta.stopEta && eta.stopArrived && !eta.stopDeparted)
            return 'fa-green fa-circle-o';
        return 'fa-circle-o';
    }

    $scope.getStopTooltipString = function(stop){
        var string = '<p>'
        string = string + stop.stopName.replace("'","\'")
        string = string + '<br>Scheduled: '
        string = string + $scope.formatScheduledTime(stop.stopTime)
				
			if($scope.etas[stop.stopId] !== undefined) 
			{
        string = string + ($scope.etas[stop.stopId].stopDeparted !== null ? '<br>Actual: ' + $scope.formatScheduledTime($scope.etas[stop.stopId].stopDeparted) : '')
        string = string + ($scope.etas[stop.stopId].stopEta !== null ? '<br>ETA: ' + $scope.formatScheduledTime($scope.etas[stop.stopId].stopEta) : '')
			}
        return string + '</p>'
    }

    $scope.propOrNull = function(obj,property){
  		if(angular.isDefined(obj[property]))
  			return obj[property]
  		return null;
  	}

    $scope.getStopTooltipString = function(stop){
      var string = '<p>'
      string = string + stop.stopName.replace("'","\'")
      string = string + '<br>Scheduled: '
      string = string + $scope.formatScheduledTime(stop.stopTime)
      
      if($scope.etas[stop.stopId] !== undefined){
        string = string + ($scope.etas[stop.stopId].stopDeparted !== null ? '<br>Actual: ' + $scope.formatScheduledTime($scope.etas[stop.stopId].stopDeparted) : '')
        string = string + ($scope.etas[stop.stopId].stopEta !== null ? '<br>ETA: ' + $scope.formatScheduledTime($scope.etas[stop.stopId].stopEta) : '')
      }
      return string + '</p>'
    }

    $scope.formatScheduledTime = function(time){
        if(time == 'n/a')
            return time
    	return moment(time,'HH:mm').format('h:mm a')
    }

    $scope.runInCorrectTimeframe = function(run){
    	var func = ($scope.filters.amOrPm == 'AM') ? function(a,b){return a <= b;} : function(a,b){return a > b;};
    	return func(parseInt(run.stops[0].stopTime.replace(":","")),1200);
    }

    $scope.isInt = function(num){
        return num % 1 === 0;
    }

    $scope.howLate = function(time){
    	var theTime = moment(time,"HH:mm");
    	return moment().diff(theTime,'minutes')
    }

    $scope.getBackgroundColor = function(value){
    	if(value > 7)
    		return 'danger'
    	else
    		return ''
    }
		
    $scope.clock = moment().format('h:mm a')
    $scope.interval2 = $interval(function () { $scope.clock = moment().format('h:mm a') }, 1000);

    $scope.getRunData();
	$scope.getTimeTableData();
    $scope.$on('$destroy', function () { $interval.cancel($scope.interval); $interval.cancel($scope.interval2); })

  }]);
