'use strict';

angular.module('rpOperatorApp')
  .controller('RidershipCtrl', ["$scope", "RidershipService","PermissionService","$q",
	function($scope,RidershipService,PermissionService,$q) {

		$scope.RidershipService = RidershipService;
		$scope.dates = {}
  	//Sets start date to 5 days ago
  	$scope.dates.startDateField = new Date(new Date().setDate(new Date().getDate()-5))
  	$scope.dates.endDateField = new Date();
  	$scope.companies = [{name:"All Companies"}, {id: 5, name: "Unaffiliated"}];
		$scope.dateOptions = {};
		$scope.csvData = [];
		$scope.selectedMode = null
		$scope.spinner = false;
		$scope.expanded = true;
		$scope.filters = {
			itemsPerPage: 25
		}
		$scope.queryParameters = {};
		$scope.displayParameters = {};
		$scope.rawRidership = []

		$scope.format = "MMM dd yyyy";

		$scope.startOpened = false;
		$scope.endOpened = false;

		RidershipService.getAllRoutes()
			.then(function(response){
				$scope.routes = response;
      	$scope.processRoutes();
    	});

  	$scope.processRoutes = function(){
			$scope.routes.sort(naturalSortBy('shortName'))
  		$scope.routes.unshift({shortName:"All Vanpools"});
  		$scope.routes.unshift({shortName:"All Shuttles"});
  	}

  	if(PermissionService.isActuallyRidepalAdmin()){
	  	RidershipService.getAllCompanies()
				.then(function(response){
	      	$scope.companies.push.apply($scope.companies,response.companies);
	    	});	
  	}
		

		$scope.selected = {
			company:{},
			route:{},
			unique:false
		}

		$scope.setDisplayParameters = function(){
			$scope.displayParameters.start = moment($scope.dates.startDateField).format("MMM D, YYYY")
			$scope.displayParameters.end = moment($scope.dates.endDateField).format("MMM D, YYYY")
		}

		$scope.missingBus = false;
		$scope.validateForm = function(){
			if( angular.equals( {}, $scope.selected.route ) ){
				$scope.missingBus = true;
				return false;
			}else{
				$scope.missingBus = false;
				return true;
			}
		}

		$scope.getResults = function(){
			if($scope.validateForm()){
				$scope.spinner = true;
				$scope.noResults = false;
				$scope.deleteResultData();
				$scope.setParameters();
				$scope.setMode()
				$scope.setDisplayParameters();
				$scope.rawRidership = RidershipService.getRidershipData($scope.queryParameters)
					.then(function(response){
						$scope.spinner = false;
						$scope.expanded = false;
						if(response.status == 200){
							if(response.data.length != 0){
								var resultData = $scope.removeModeIfSet(response.data)
								$scope.formatData(resultData);
								return $scope.resultData
							}else{
								$scope.error()
							}
						}else{
							$scope.error();
						}
					}, function(error){
						$scope.error();
					});
			}
		}

		$scope.removeModeIfSet = function(resultData){
			if($scope.selected.route.shortName == "All Shuttles" || $scope.selected.route.shortName == "All Vanpools"){
				var newResultData = []
				for (var i = 0; i < resultData.length; i++) {
					if(resultData[i].mode === $scope.mode)
						newResultData.push(resultData[i])
				}
				return newResultData
			} else {
				return resultData
			}
		}

		$scope.error = function(){
			$scope.spinner = false;
			$scope.noResults = true;
		}

		$scope.formatData = function(resultData){
			for (var i = 0; i < resultData.length; i++) {
				resultData[i].displayDate = moment(resultData[i].date).format('MMM D, YYYY h:mma');
				resultData[i].validated = resultData[i].distanceToDriver === null || resultData[i].distanceToDriver > 500 ? 'Unvalidated' : 'Validated'
				resultData[i] = $scope.deleteNecessaryFields(resultData[i]);
			}
			$scope.resultData = resultData
			console.log(resultData)
			$scope.resultDataSafe = _.clone(resultData);
			$scope.exportData = _.clone(resultData);
		}

		$scope.updateExportDataOnSearch = function(smartTableCtrl){
			$scope.exportData = smartTableCtrl.getFilteredCollection()
		}

		$scope.deleteNecessaryFields = function(user){
			delete user.addresses
			delete user.stopBoarded
			delete user.route
			delete user.companyId
			if($scope.selected.unique){
				delete user.debit
				delete user.stopBoardedAddress
				delete user.stopBoardedCity
				delete user.date
			}
			return user
		}

		$scope.showInactiveBuses = false;

		$scope.active = function(){
			var now = Date.now();
			return function(route){
				if(route.startDate < now && (route.endDate === null || route.endDate > now) || route.shortName == "All Shuttles" || route.shortName == "All Vanpools"){
					return true;
				}else{
					return $scope.showInactiveBuses;
				}
			}
		}

		$scope.busSort = function(route){
			if(typeof route.shortName == "string"){
				return 0
			}else{
				return route.shortName;
			}
		}

		$scope.setParameters = function(){
			$scope.queryParameters = {}
			$scope.queryParameters.start =  moment($scope.dates.startDateField).startOf('day').utc().format('x');
			$scope.queryParameters.end = moment($scope.dates.endDateField).endOf('day').utc().format('x');
			
			if($scope.selected.company.name != "All Companies"){
				$scope.queryParameters['orgIdFilter'] = $scope.selected.company.id;
			}else{
				delete $scope.queryParameters['orgIdFilter'];
			}
			if($scope.selected.route.shortName != "All Shuttles" || $scope.selected.route.shortName != "All Vanpools"){
				$scope.queryParameters['route'] = $scope.selected.route.routeId;
				$scope.displayParameters.shortName = angular.copy($scope.selected.route.shortName)
			}else{
				$scope.displayParameters.shortName = $scope.selected.route.shortName
				delete $scope.queryParameters['route'];
			}
			if($scope.selected.unique){
				$scope.queryParameters.uniquesOnly = $scope.selected.unique;
			}

		}

		$scope.setMode = function(){
			if( $scope.selected.route.shortName === "All Shuttles" )
				$scope.mode = 'bus'
			else if( $scope.selected.route.shortName === "All Vanpools" )
				$scope.mode = 'van'
			else
				$scope.mode = $scope.selected.route.mode
		}

		$scope.deleteResultData = function(){
			delete $scope.resultData;
		}

		$scope.uniqueCsvHeaders = [
			'userId',
			'userRole',
			'barcode',
			'email',
			'firstName',
			'lastName',
			'shortName',
			'rideCount'
		]

		$scope.headersToOmit = {
			van: [
				'barcode',
				'debit'
			],
			bus: [
				'distanceToDriver',
				'validated',
				'userRole'
			]
		}

		$scope.getCsvData = function(){
			$scope.csvData = [];
			var i = 0;
			for (i = 0; i < $scope.exportData.length; i++) { 
				var newObject = {};
				angular.forEach($scope.exportData[i], function(value, key){
					if( (!$scope.selected.unique || ($scope.selected.unique && $scope.uniqueCsvHeaders.indexOf(key) != -1)) && key != '$$hashKey' && $scope.headersToOmit[ $scope.mode ].indexOf(key) == -1 ){
						if(key == 'date'){
							newObject.date = moment(value,'x').format( 'YYYY-MM-DD' )
							newObject.time = moment(value,'x').format( 'h:mm a' )
						}else{
							newObject[key] = value;
						}
					}
				});
				$scope.csvData.push(newObject);
			}
			return $scope.csvData;
		}

		$scope.getCsvHeaders = function(){
			return Object.keys($scope.csvData[0]);
		}

  }])
.directive('pageSelect', function() {
  return {
    restrict: 'E',
    template: '<input type="text" class="select-page" ng-model="inputPage" ng-change="selectPage(inputPage)">',
    link: function(scope, element, attrs) {
      scope.$watch('currentPage', function(c) {
        scope.inputPage = c;
      });
    }
  }
})
.directive('onFilter', function () {
    return {
        require: '^stTable',
        scope: {
            onFilter: '='
        },
        link: function (scope, element, attr, ctrl) {
          scope.$watch(ctrl.getFilteredCollection, function  (val) {
		        scope.onFilter(ctrl)
		      })
        }
    };
});
