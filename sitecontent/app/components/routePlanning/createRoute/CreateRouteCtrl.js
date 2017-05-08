/*globals L*/
angular.module('rpOperatorApp')
  .controller('CreateRouteCtrl', ["$scope", "CreateRouteService", "route", "$uibModalInstance", "ngToast",
	function($scope, CreateRouteService, route, $uibModalInstance, ngToast) {
		$scope.operators = []
		$scope.createMode = route ? false : true
		$scope.route = route ? angular.copy(route) : {}
		$scope.form = {}
		$scope.form.submitted = false

		$scope.init = function(){
			$scope.getOperators()
		}

		$scope.getOperators = function(){
			CreateRouteService.getOperators().then(function(operators){
				$scope.operators = operators
			})
		}

		$scope.cancel = function(){
			$uibModalInstance.dismiss('cancel');
		}

		$scope.save = function(formValid){
			$scope.form.submitted = true
			if(formValid){
				CreateRouteService.saveRoute($scope.getFormattedRouteForSave()).then(function(savedRoute){
					ngToast.create({
		        className: 'success',
		        content: 'Route saved!',
		        additionalClasses: 'nga-default nga-fade-remove nga-slide-right-add nga-slide-right-move',
		        timeout: 10000,
		        dismissButton: true,
		        animation: 'slide'
		      });
					$uibModalInstance.close($scope.route);
				})
			}
		}

		$scope.getFormattedRouteForSave = function(){
			var routeToSave = angular.copy($scope.route)

			// delete erroneous properties
			delete routeToSave.busNumber
			delete routeToSave.createdDate
			delete routeToSave.longName
			delete routeToSave.oldRouteId
			delete routeToSave.operator
			delete routeToSave.priceId

			// change camelcase to underscore for saving in node
			// also set defaults if they do not exist
			routeToSave.operator_id = !_.isUndefined(routeToSave.operatorId) ? routeToSave.operatorId : null
			routeToSave.start_date = !_.isUndefined(routeToSave.startDate) ? routeToSave.startDate : null
			routeToSave.short_name = !_.isUndefined(routeToSave.shortName) ? routeToSave.shortName : null
			routeToSave.id = !_.isUndefined(routeToSave.routeId) ? routeToSave.routeId : null
			routeToSave.is_public = !_.isUndefined(routeToSave.isPublic) ? routeToSave.isPublic : false
			routeToSave.end_date = !_.isUndefined(routeToSave.endDate) ? routeToSave.endDate : null

			// remove now erroneous properties
			delete routeToSave.operatorId
			delete routeToSave.startDate
			delete routeToSave.shortName
			delete routeToSave.routeId
			delete routeToSave.isPublic
			delete routeToSave.endDate

			// change start date to timestamp
			if(_.isObject(routeToSave.start_date))
				routeToSave.start_date = routeToSave.start_date.valueOf()

			// change end date to timestamp
			if(_.isObject(routeToSave.end_date))
				routeToSave.end_date = routeToSave.end_date.valueOf()

			// remove properties that cannot be updated
			if(!$scope.createMode){
				delete routeToSave.from
				delete routeToSave.mode
				delete routeToSave.operator_id
				delete routeToSave.short_name
				delete routeToSave.start_date
				delete routeToSave.to				
			}

			// handle Id
			if(_.isUndefined(routeToSave.id) || !routeToSave.id)
				delete routeToSave.id

			return routeToSave
		}

		$scope.datepickerOptions = function(){
			return {
				allowInputToggle:true,
				widgetPositioning:{vertical:'top'},
			}
		}


		$scope.init()
	}])