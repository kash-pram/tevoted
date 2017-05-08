'use strict';

angular.module('rpOperatorApp')
.controller('RouteScorecardCtrl', ["$scope","RouteScorecardService","$filter","$interval", function($scope, RouteScorecardService,$filter,$interval) {

    $scope.routeScoresDisplay = [];
    $scope.routeScoresSafe = [];
    $scope.routeScoresRaw = [];
    $scope.editable = false;
    $scope.dateOptions = {
		formatYear: 'yy',
		startingDay: 1,
		showWeeks:false
	};
	$scope.status = {
		opened: false
	}
    $scope.loading = true;

    $scope.$watch('datePicked',function(){
        $scope.loading = true;
        $scope.getRunData();
        $scope.routeScoresDisplay = $scope.routeScoresSafe = [];
        if(!$scope.timeTableData)
    		$scope.getTimeTableData();
    })
	$scope.datePicked = Date.now();

	$interval(function(){
        if($scope.datePickedIsToday())
            $scope.checkAmPm();
		$scope.getRunData();
	},180000); // refresh data every 3 min

    $scope.filters = {
    	itemsPerPage: 25,
    	addAdvanced: {},
        amOrPm: 'AM',
    	operators:{
    		"<":"less than",
    		"=":"equals",
    		">":"greater than"
    	},
    	fields:{
	    	driver: "Driver",
			tablet_login: "Tablet Login",
			preflight_done: "Checklist Complete",
			yard_depart: "Departure",
			staging_arrive: "Staging",
			first_stop_arrive: "First Stop",
			score: "Driver Score"
    	},
    	advancedFilters: []
    }

    $scope.datePickedIsToday = function(){
        return !!( moment($scope.datePicked).day() == moment().day() );
    }

    $scope.getters= {
      shortName: function (value) {
        return _.map($scope.routeScoresSafe,'shortName').sort(naturalSort).indexOf(value.shortName);
      }
    }

    $scope.assignAmPm = function(){
        $scope.routeScoresSafe = [].concat($scope.routeScoresRaw);
        var func = ($scope.filters.amOrPm == 'AM') ? function(a,b){return a <= b;} : function(a,b){return a > b;};
        // filters routes that start after or before 12:00
        $scope.routeScoresSafe = $scope.routeScoresSafe.filter(function(row){
            if(angular.isDefined(row.stop_time))
                return func(parseInt(row.stop_time.replace(":","")),1200);
        });
        $scope.routeScoresDisplay = [].concat($scope.routeScoresSafe);
    }

    $scope.checkAmPm = function(){
        // Switches to PM after 3pm
        var mmtNoon = moment().startOf('day').add(15,'hours');
        if(moment().isAfter(mmtNoon)){
            $scope.filters.amOrPm = 'PM';
        }else{
            $scope.filters.amOrPm = 'AM';
        }
    }
    $scope.checkAmPm();

    $scope.getTimeTableData = function(){
    	var start = moment($scope.datePicked).startOf('day');
    	var end = moment($scope.datePicked).endOf('day');

    	RouteScorecardService.getTimetableData(start, end).then(
    		function(response){
    			$scope.timeTableData = response;
				$scope.formatTimetableData();

    		});
    }

    $scope.getRunData = function(){
    	var date = moment($scope.datePicked).format('YYYY-MM-DD');
    	$scope.routeScoresRaw = [];
    	RouteScorecardService.getMetrics(date).then(
    		function(response){
                if(response.length < 1)
                    $scope.loading = false;
    			$scope.routeScoresRaw = response;
    			$scope.formatRunData();
                $scope.addNonStartedRows();
    			//$scope.fakeRouteScorecardData();
    		});
    }

    $scope.open = function($event) {
		$scope.status.opened = true;
	};

    $scope.getBackground = function(value,mustBeEarlier,mustBeLater,login){

        /*if( angular.isDefined(mustBeLater) ){
            if((!angular.isDefined(mustBeEarlier)))
                return 'danger';

            mustBeEarlier = mustBeEarlier.replace(":","");
            mustBeLater = mustBeLater.replace(":","");

            if(angular.isDefined(login) && login)
                mustBeLater = mustBeLater - 2 // login must be 2 minutes before depart

            if( mustBeEarlier > mustBeLater )
                return 'danger'
        }*/

        if(!isNaN(parseFloat(value))){ // if is a number
            if( value <= 5)
                return 'success-light'
            else if ( value > 5 && value <= 10 )
                return 'warning'
            else
                return 'danger'
        }
    }

    $scope.getScoreBackground = function(value){
    	if( value >= 4)
			return 'success'
		else if ( value < 4)
			return 'danger'
		else
			return 'danger'
    }

    $scope.formatRunData = function(){
    	var finalData = []
    	angular.forEach($scope.routeScoresRaw, function(runData){
    		var rowData = {runId: runData.runId};
    		angular.forEach(runData.runEvents, function(runEvent){
                if(!angular.isDefined(rowData[runEvent.kind])){
        			rowData[runEvent.kind] = moment(runEvent.timestampUTC);
        			if(runEvent.kind == 'tablet_login'){
    	    			rowData['driver'] = runEvent.sourceData.driverName;
    	    		}
                }
    		});
    		finalData.push(rowData);
    	});
    	$scope.routeScoresRaw = finalData;
    	$scope.runDataformatted = true;
    	$scope.getDiffs();
    }

    $scope.formatTimetableData = function(){
		var data = {},
			shortName = 0;
    	angular.forEach($scope.timeTableData, function(routeData){
    		shortName = routeData.route.shortName;
    		angular.forEach(routeData.runs, function(run){
				data[run.runId] = {
    				shortName: shortName,
    				mode: routeData.route.mode,
    				tablet_login: run.endpoints.origin[0] ? run.endpoints.origin[0].loginTime : 'not set',
    				preflight_done: run.endpoints.origin[0] ? run.endpoints.origin[0].preflightTime : 'not set',
    				yard_depart: run.endpoints.origin[0] ? run.endpoints.origin[0].departTime : 'not set',
    				staging_arrive: run.stops[0].operations.stagingTime,
                    first_stop_arrive: run.stops[0].stopTime,
    				stop_time: run.stops[0].stopTime
    			}
    		});
    	});
    	$scope.timeTableData = data;
        $scope.addNonStartedRows();

    	$scope.timeTableDataFormatted = true;
    	$scope.getDiffs();
    }

    $scope.scoreIt = function(runRowData){
    	function aboveThreshold(number){
    		return (number > 5 || !angular.isDefined(number) || !$scope.isInt(number) || isNaN(number) ) ? 0 : 1;
    	}
    	return aboveThreshold(runRowData.tablet_login) + aboveThreshold(runRowData.preflight_done)
   			+ aboveThreshold(runRowData.yard_depart) + aboveThreshold(runRowData.staging_arrive)
   			+ aboveThreshold(runRowData.first_stop_arrive);
    }

    $scope.isInt = function(num){
        return angular.isNumber(num);
    }

    $scope.getDiffs = function(){
    	if($scope.timeTableDataFormatted && $scope.runDataformatted){
	    	var scheduledTime;
	    	var timeSplit = [];
	    	var updatedArray = []
	    	angular.forEach($scope.routeScoresRaw, function(routeScoreRow){
	    		if(angular.isDefined($scope.timeTableData[routeScoreRow.runId])){
	    			var newObj = {};
	    			newObj.shortName = $scope.timeTableData[routeScoreRow.runId].shortName;
					newObj.mode = $scope.timeTableData[routeScoreRow.runId].mode
	    			newObj.runId = routeScoreRow.runId
                    newObj.driver = routeScoreRow.driver;
	    			newObj.stop_time = $scope.timeTableData[routeScoreRow.runId].stop_time;
                                //routeScoreRow['yard_depart'] = moment(1452641718389);
                                //routeScoreRow['tablet_login'] = angular.copy(routeScoreRow['yard_depart']);
		    		angular.forEach(["tablet_login","preflight_done","yard_depart","staging_arrive","first_stop_arrive"], function(point){
                        if(angular.isDefined(routeScoreRow[point])){
                            timeSplit = $scope.timeTableData[routeScoreRow.runId][point].split(':');
                            scheduledTime = angular.copy(routeScoreRow[point]).startOf('day').hour(parseInt(timeSplit[0],10)).minute(parseInt(timeSplit[1],10));
                            newObj[point] = angular.copy(routeScoreRow[point].diff(scheduledTime,'minutes'));
                            if( newObj[point] < -120 ){
                                delete newObj[point];
                            }else{
                                newObj[point+'_scheduled'] = angular.copy(scheduledTime).format('H:mm');
                                newObj[point+'_actual'] = angular.copy(routeScoreRow[point]).format('H:mm');    
                            }
                        }else if($scope.timeTableData[routeScoreRow.runId][point] == 'not set'){
                            newObj[point] = 'not set'
                        }
		    		})
		    		newObj.score = $scope.scoreIt(newObj);
		    		updatedArray.push(newObj);
		    	}
	    	});
	    	$scope.routeScoresRaw = updatedArray;
	    	$scope.routeScoresSafe = [].concat($scope.routeScoresRaw);
            $scope.assignAmPm();
	    	$scope.routeScoresDisplay = [].concat($scope.routeScoresSafe);
            $scope.loading = false;

    	}
    }

    $scope.addNonStartedRows = function(){
        if(angular.isDefined($scope.timeTableData)){
            var usedRuns = _.pluck($scope.routeScoresRaw,'runId');
            var allRuns = Object.keys($scope.timeTableData).map(_.partial(parseInt, _, 10));
            var nonUsedRuns = _.difference(allRuns,usedRuns);
            angular.forEach(nonUsedRuns, function(nonUsedRunId){
                $scope.routeScoresRaw.push({
                    driver:'-',
                    runId:parseInt(nonUsedRunId)
                })
            })
        }
    }

    
	
}]);