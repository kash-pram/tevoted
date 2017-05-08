'use strict';

angular.module('rpOperatorApp')
  .controller('TabletHealthCtrl', ["$scope", "$state","TabletHealthService","$interval","$timeout",
  	function($scope, $state, TabletHealthService, $interval, $timeout) {

	$scope.tabletStatusesOriginal=[]

	$scope.getTabletStats = function(){
    	TabletHealthService.getTabletStatuses().then(function(response){
    		$scope.tabletStatusesOriginal = response;
    		$scope.formatTabletStatuses();
    	})
    }
    $scope.getTabletStats();

    $scope.getters= {
      shortName: function (value) {
        return _.map($scope.tabletStatusesDisplay,'shortName').sort(naturalSort).indexOf(value.shortName);
      }
    }

    $scope.formatTabletStatuses = function(){
        var tabletStatusesDisplay = [], tabletObj = {};
    	angular.forEach($scope.tabletStatusesOriginal,function(tablet){
            // Only display tablets where health updated less than 1 hour ago
            if( moment(tablet.lastHealthUpdateTime).add(1,'hours').isAfter(moment())  ){
                tabletObj = tablet;
                if(!isNaN(parseFloat(tablet.shortName)) && isFinite(tablet.shortName))
                    tabletObj.shortName = parseInt(tablet.shortName)
                else
                    tabletObj.shortName = 'n/a'
                tabletStatusesDisplay.push(tabletObj);           
            }

    	})

        $scope.tabletStatusesDisplay = tabletStatusesDisplay;
    }


    $scope.getColoring = function(tablet){
    	if(tablet.batteryLevel == 100 || tablet.batteryStatus == 'Charging')
    		return 'success'
    	else if(tablet.batteryLevel > 59)
    		return 'warning'
    	else if(tablet.batteryLevel < 60)
    		return 'danger'
    	else 
    		return ''
    }

    $scope.intervals = 0;
    $scope.refreshAfter = 30;
    $scope.progressValue = 0
    $scope.updateInterval = 20 //time per second
    $scope.interval = $interval(function(){
        $scope.intervals++;
        $scope.progressValue = $scope.intervals/($scope.refreshAfter * $scope.updateInterval)*100
        if($scope.intervals > $scope.refreshAfter * $scope.updateInterval){
            $scope.getTabletStats();
            $scope.intervals = 0;
        }
    }, 1000/$scope.updateInterval )
    $scope.$on('$destroy', function () { $interval.cancel($scope.interval); })


}]);