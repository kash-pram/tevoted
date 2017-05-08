angular.module('rpOperatorApp')
  .controller('NotificationV2Ctrl', ["$scope", "NotificationV2Service",
    function($scope, NotificationV2Service) {
		'use strict';
		/* {
			runId: int or [int,int,...],
			routeId: int or [int,int,...],
			companyId: int or [int,int,...],
			activeInLast: int, // seconds
			role: string or [string,string,...] // 'Driver', 'Admin', 'Member', etc
		} */
		$scope.modelOptions = {debounce:{'default':500,'blur':0}}
		$scope.userCount = 0
		$scope.context = {}
		$scope.userCountLoading = false
		$scope.activeLastButton = ''
		$scope.radio = {
			action: "null"
		}


		$scope.$watch('context', function(){
			if(Object.keys($scope.context).length > 0){
				$scope.userCountLoading = true
				NotificationV2Service.getUserCount($scope.removeEmptyContexts($scope.context)).then(function(response){
					$scope.userCount = response.count
					$scope.userCountLoading = false
				},function(error){
					$scope.userCount = 0
					$scope.userCountLoading = false
				})
			}
		},true)

		$scope.removeEmptyContexts = function(context){
			var newContext = {}
			angular.forEach(context, function(value, key){
				if(value.length !== 0)
					newContext[key] = value
			})
			return newContext
		}

		$scope.activeInLastClick = function(timePeriod){
			if($scope.activeInLastButton == timePeriod){
				$scope.activeInLastButton = ''
				$scope.context.activeInLast = []
			}else{
				$scope.activeInLastButton = timePeriod
				$scope.setActiveInLast(timePeriod)
			}
		}

		$scope.setActiveInLast = function(timePeriod){
			switch(timePeriod){
				case 'day':
					$scope.context.activeInLast = 24 * 60 * 60
					break
				case 'week':
					$scope.context.activeInLast = 7 * 24 * 60 * 60
					break
				case 'month':
					$scope.context.activeInLast = 30 * 24 * 60 * 60
					break
				case 'custom':
					$scope.context.activeInLast = []
					break

			}
		}
  	

}]);