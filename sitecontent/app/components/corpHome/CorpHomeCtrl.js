'use strict';

angular.module('rpOperatorApp')
  .controller('CorpHomeCtrl', ["$scope", "CorpHomeService","$q",
	function($scope, CorpHomeService, $q) {
		$scope.activeWidgets = [
			'ridership',
			'capacity',
			//'onTime'
		]
		$scope.selectedDateRange = 'Last 7 days'
		$scope.customCollapsed = true
		$scope.dates = {}
		$scope.dates.startDateField = null
  	$scope.dates.endDateField = null;
		$scope.get = {}
		$scope.loading = {}

		$scope.dateRanges = {
			'Today': {start: moment().startOf('day').format('x'), end: moment().format('x')},
			'Last 7 days': {start: moment().subtract(6,'days').startOf('day').format('x'), end: moment().format('x')},
			'Last 30 days': {start: moment().subtract(29,'days').startOf('day').format('x'), end: moment().format('x')},
		}

		$scope.initWidgetData = function(){
			angular.forEach($scope.activeWidgets, function(widgetName){
				$scope[widgetName] = []
			})
		}
		$scope.initWidgetData()

		$scope.selectDateRange = function(rangeName){
			$scope.selectedDateRange = rangeName;
			$scope.collapseCustomAppropriately(rangeName)
			$scope.setWidgetData()
		}

		$scope.selectCustom = function(){
			$scope.selectedDateRange = 'Custom'
			$scope.collapseCustomAppropriately('Custom')
		}

		$scope.selectDate = function(){
			if($scope.dates.startDateField && $scope.dates.endDateField){
				$scope.setWidgetData()
			}
		}

		$scope.collapseCustomAppropriately = function(rangeName){
			$scope.customCollapsed = !(rangeName == 'Custom')
		}

		$scope.setWidgetData = function(){
			$scope.loading()
			angular.forEach($scope.activeWidgets, function(widgetName){
				$scope[widgetName] = $scope.get[widgetName]($scope.getDateRange())
			})
		}

		$scope.getDateRange = function(){
			if($scope.selectedDateRange == 'Custom'){
				return {
					start: moment($scope.dates.startDateField).startOf('day').format('x'),
					end: moment($scope.dates.endDateField).endOf('day').format('x')
				}
			}else{
				return $scope.dateRanges[ $scope.selectedDateRange ]
			}
		}

		$scope.formatDatesIntoOtherFormat = function(dates){
			return {
				start: moment(dates.start,'x').format('YYYY-MM-DD'),
				end: moment(dates.end,'x').format('YYYY-MM-DD')
			}
		}

		$scope.setLoadingFunctions = function(){
			var defer = $q.defer()
			angular.forEach($scope.activeWidgets, function(widgetName, i){
				$scope.loading[widgetName] = function(){}
				if(i + 1 == $scope.activeWidgets.length) defer.resolve()
			})
			return defer.promise;
		}
		$scope.setLoadingFunctions().then($scope.setWidgetData)

		$scope.loading = function(){
			angular.forEach($scope.activeWidgets, function(widgetName){
				if(angular.isDefined($scope.loading[widgetName]) && angular.isFunction($scope.loading[widgetName]))
					$scope.loading[widgetName]()
			})
		}

		$scope.ping = function(){
			CorpHomeService.ping()
		}

		/** 
		*
		* Widget specific logic below
		*
		**/

		// Need RunId/RunStartTime
		$scope.get.ridership = function(dates){
			var defer = $q.defer();
			CorpHomeService.getRidershipData(dates).then(function(response){
				defer.resolve(response.data)
			})
			return defer.promise
		}

		$scope.get.capacity = function(dates){
			var defer = $q.defer();
			dates = $scope.formatDatesIntoOtherFormat(dates)
			CorpHomeService.getCapacityData(dates).then(function(response){
				defer.resolve(response)
			})
			return defer.promise
		}

		// Need all entitled
		$scope.get.onTime = function(dates){
			var defer = $q.defer();
			CorpHomeService.getOnTime(dates).then(function(response){
				defer.resolve(response.data)
			})
			return defer.promise
		}

}])