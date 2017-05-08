'use strict';

angular.module('rpOperatorApp')
  .controller('PermissionModalCtrl', ["$scope", "PermissionService","$http","$rootScope","$q",
	function($scope, PermissionService,$http,$rootScope,$q) {
  	
		$scope.selectedContext = {}
		$scope.showContextIdInput = false;
		$scope.showRoleInput = false;
		$scope.contextId = null;

		$scope.defaultContexts = [
			{
				name:'ridepal',
				roles:[
					{name:'admin',needContextId:false},
					{name:'employee',needContextId:false},
				]
			},
			{
				name:'organization',
				roles:[
					{name:'admin',needContextId:true},
				]
			},
			{
				name:'operator',
				roles:[
					{name:'admin',needContextId:true},
					{name:'dispatch',needContextId:true},
					{name:'driver',needContextId:true},
				]
			}
		]

		$scope.setContextOptions = function(){
			//$scope.contextOptions = PermissionService.getAuthorizations();
			$scope.contextOptions = $scope.defaultContexts;
		}
		$scope.setContextOptions();

		$scope.getOptionName = function(context){
			return $scope.capitalizeFirstLetter(context)
		}

		$scope.capitalizeFirstLetter = function(string) {
		  return string.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}); 
		}

		$scope.lowercaseFirstLetter = function(string) {
		  return string.replace(/\w\S*/g, function(txt){return txt.charAt(0).toLowerCase() + txt.substr(1).toLowerCase();}); 
		}

		// Once a context is selected, show the role select
		$scope.contextSelected = function(){
			$scope.newContext = {
				contextType: $scope.selectedContext.name,
				permission:[]
			}
			$scope.showContextInput = true;
			$scope.showRoleInput = true
			$scope.setContextIdDropdownOptions($scope.selectedContext.name)
		}

		// Once a role is selected, show the contextId input if need to
		$scope.roleSelected = function(){
			if(!_.isEmpty($scope.selectedRole)){
				$scope.contextId = null;
				$scope.showContextIdInput = $scope.selectedRole.needContextId
				$scope.newContext.name = $scope.selectedRole.name
				$scope.newContext.description = $scope.capitalizeFirstLetter($scope.newContext.contextType + ' ' + $scope.selectedRole.name);
			}
		}

		$scope.contextIdSelected = function(){
			$scope.newContext.contextId = parseInt($scope.contextId.id)
			$scope.newContext.description = $scope.capitalizeFirstLetter($scope.newContext.contextType + ' ' + $scope.selectedRole.name) + ' - ' + $scope.contextId.name;
		}

		$scope.setRole = function(){
			PermissionService.selectContext($scope.newContext)
			$scope.$close();
		}

		$scope.getAllCompanies = function(){
      	var defer = $q.defer();
	
    		$http.get($rootScope.endpoint + '/admin/company')
    			.success(function(res){
    				$scope.companies = res.companies
  					})
   				.error(function(err, status){defer.reject(err);})
			
				return defer.promise;
    }

    $scope.getAllOperators = function(){
      var defer = $q.defer();
			
    	$http.get($rootScope.endpoint + '/operators')
    		.success(function(res){
    			$scope.operators = res
    			angular.forEach($scope.operators, function(operator){
    				operator.id = operator.operatorId
    				operator.name = operator.operatorName
    			})
    		})
    		.error(function(err, status){defer.reject(err);})
				
				return defer.promise;
    }

    $scope.setContextIdDropdownOptions = function(contextName){
    	if(contextName == 'organization')
    		$scope.contextIdOptions = $scope.companies
    	else if(contextName == 'operator')
    		$scope.contextIdOptions = $scope.operators
    }

    $scope.getAllCompanies()
    $scope.getAllOperators()

  }]);
