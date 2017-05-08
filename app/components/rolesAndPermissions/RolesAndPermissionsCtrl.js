'use strict';

angular.module('rpOperatorApp')
  .controller('RolesAndPermissionsCtrl', ["$scope", "RolesAndPermissionsService","$uibModal","ngToast", "sweetAlert","$timeout",
  	function($scope, RolesAndPermissionsService, $uibModal, ngToast, SweetAlert, $timeout) {
  		$scope.selectedRole = {}
  		$scope.newRole = {}
  		$scope.newPermission = {}
  		$scope.filters = {}
  		$scope.roles = []
  		$scope.companies = []
  		$scope.operators = []
  		$scope.searching = {
  			users:false
  		}
  		$scope.loading = {
  			users: false,
  			usersWithRole: true,
  			rolePermissions: true,
  			allPermissions: true,
  			roles: true
  		}

  		$scope.getCompanies = function(){
	  		RolesAndPermissionsService.getCompanies().then(function(response){
	  			$scope.companies = response.companies
	  		})	
  		}

  		$scope.getOperators = function(){
  			RolesAndPermissionsService.getOperators().then(function(response){
	  			$scope.operators = response
	  		})	
  		}

  		$scope.getRoles = function(){
  			$scope.loading.roles = true
	  		RolesAndPermissionsService.getRoles().then(function(roles){
  				$scope.formatRoles(roles)
	  		})	
  		}

  		$scope.formatRoles = function(roles){
  			if($scope.companies.length < 1 || $scope.operators.length < 1) 
  				$timeout(function(){$scope.formatRoles(roles)},50);
  			else {
	  			var company
					for (var i = 0; i < roles.length; i++) {
						if(roles[i].context_type == 'operator'){
							var company = _.find($scope.operators, function(o){return o.operatorId == roles[i].context_id})
							roles[i].company = angular.isDefined(company) ? company.operatorName : 'N/A'
						}else if (roles[i].context_type == 'organization'){
							var company = _.find($scope.companies, function(o){return o.id == roles[i].context_id})
							roles[i].company = angular.isDefined(company) ? company.name : 'N/A'
						}else roles[i].company = null
            roles[i].searchString = roles[i].context_type + roles[i].name + roles[i].company
					}
	  			$scope.loading.roles = false
	  			$scope.roles = $scope.sortRoles(roles)
		  	}
  		}

  		$scope.sortRoles = function(roles){
  			return roles.sort(function(a,b){
  				if(a.context_type == 'ridepal'){
  					return -1
					}else if(b.context_type == 'ridepal'){
						return 1
  				}else{
  					return (a.company > b.company) - (b.company > a.company)
  				}
  			})
  		}
  		
  		$scope.getPermissions = function(){
  			$scope.loading.allPermissions = true
	  		RolesAndPermissionsService.getPermissions().then(function(allPermissions){
	  			$scope.allPermissions = allPermissions
	  			$scope.loading.allPermissions = false
	  		})
  		}

  		$scope.selectRole = function(role){
  			$scope.selectedRole = role;
  			$scope.loading.rolePermissions = $scope.loading.usersWithRole = true
  			RolesAndPermissionsService.getRoleAndPermissions(role).then(function(response){
  				$scope.rolePermissions = response.permissions
  				$scope.loading.rolePermissions = false
  			})
  			RolesAndPermissionsService.getUsersWithRole(role.id).then(function(response){
  				$scope.usersWithRole = response
  				$scope.loading.usersWithRole = false
  			})
  		}

  		$scope.searchUsers = function(){
  			if($scope.filters.searchUsers){
	  			$scope.loading.users = true
	  			RolesAndPermissionsService.searchUsers($scope.filters.searchUsers).then(function(users){
	  				$scope.loading.users = false
	  				$scope.searchedUsers = users
	  			})
	  		}
  		}

  		$scope.notEmpty = function(objectOrArray){
  			return angular.isDefined(objectOrArray) && (objectOrArray.length > 0 || Object.keys(objectOrArray).length > 0)
  		}

  		$scope.openModal = function(name){
  			var modalInstance = $uibModal.open({
		      animation: $scope.animationsEnabled,
		      templateUrl: name+'.html',
		      scope: $scope,
		      size: 'lg'
		    })
  		}

  		$scope.createRole = function(){
  			if($scope.newRole.context_type && $scope.newRole.name
  				&& ($scope.newRole.context_type == 'ridepal' || $scope.newRole.context_id)){
  				$scope.newRole.status = 'present'
  				$scope.newRole.description = ''
  				$scope.newRole.context_id = $scope.newRole.context_id || null
  				$scope.newRole.start_date = moment().format('x')
  				$scope.newRole.end_date = null
  				$scope.newRole.creation_date = moment().format('x')
  				RolesAndPermissionsService.createRole($scope.newRole).then(function(newRole){
  					$scope.roles.push(newRole)
  				}).then(function(){
  					SweetAlert.swal({closeOnConfirm: true,title:"Aww Yeah!", text:"You created that role real good", type:"success"});
  				})
  			}else{
  				$scope.toast('Required fields are missing for new role.')
  			}
  		}

  		$scope.createPermission = function(){
  			if($scope.newPermission.action && $scope.newPermission.name){
  				$scope.newPermission.status = 'present'
  				$scope.newPermission.start_date = moment().format('x')
  				$scope.newPermission.end_date = null
  				$scope.newPermission.creation_date = moment().format('x')
  				RolesAndPermissionsService.createPermission($scope.newPermission).then(function(newPermission){
  					$scope.allPermissions.push(newPermission)
  				}).then(function(){
  					SweetAlert.swal({closeOnConfirm: true,title:"Aww Yeah!", text:"You created that role real good", type:"success"});
  				})
  			}else{
  				ngToast.create({
            className: 'danger',
            content: 'Required fields are missing for new role.',
            additionalClasses: 'nga-default nga-fade-remove nga-slide-right-add nga-slide-right-move',
            timeout: 6000,
            dismissButton: true,
            animation: 'slide'
          });
  			}
  		}

  		$scope.attachPermission = function(permission){
				if( _.includes( _.pluck($scope.rolePermissions, 'id'), permission.id )){
					$scope.toast('Permission already assigned to role.')
				} else if(!$scope.notEmpty($scope.selectedRole)){ // Do nothing
				} else {
					var contextIdString = $scope.selectedRole.context_id ? ' ' + $scope.selectedRole.context_id : ''
					SweetAlert.swal({
				  	title: "Are you sure?",
				  	text: "Are you sure you want to allow \"" + $scope.selectedRole.context_type + contextIdString + " - " + $scope.selectedRole.name
				  		+ "\" to " + permission.action + " " + permission.object_id.name,
				  	type: "warning", showCancelButton: true, confirmButtonColor: "#1ABC9C", confirmButtonText: "Yes, do it!", closeOnConfirm: true
				  }).then(
					function(confirmed){
						if(confirmed){
							RolesAndPermissionsService.attachPermissionToRole(permission.id, $scope.selectedRole.id).then(function(){
								$scope.selectRole($scope.selectedRole)
						  	SweetAlert.swal({closeOnConfirm: true,title:"Boom!", text:"You added this permission to " + $scope.selectedRole.context_type + contextIdString + " - " + $scope.selectedRole.name, type:"success"});
							})
						}
					});
				}
			}

			$scope.detatchPermission = function(permission){
				var contextIdString = $scope.selectedRole.context_id ? ' ' + $scope.selectedRole.context_id : ''
				SweetAlert.swal({
			  	title: "Are you sure?",
			  	text: "Are you sure you want to no longer allow \"" + $scope.selectedRole.context_type + contextIdString + " - " + $scope.selectedRole.name
			  		+ "\" to " + permission.action + " " + permission.object,
			  	type: "warning",  showCancelButton: true, confirmButtonColor: "#1ABC9C", confirmButtonText: "Yes, detatch this permission!", closeOnConfirm: true
			  }).then(
				function(confirmed){
					if(confirmed){
						RolesAndPermissionsService.detachPermissionFromRole(permission.id, $scope.selectedRole.id).then(function(){
							$scope.selectRole($scope.selectedRole)
					  	SweetAlert.swal({closeOnConfirm: true,title:"Awesome!", text:"You removed this permission from " + $scope.selectedRole.context_type + contextIdString + " - " + $scope.selectedRole.name, type:"success"});
						})
					}
				});
			}

			$scope.attachUser = function(user){
				if( _.includes( _.pluck($scope.usersWithRole, 'id'), user.id )){
					$scope.toast('Role already attached to this user.')
				} else if(!$scope.notEmpty($scope.selectedRole)){ // Do nothing 
				} else {
					var contextIdString = $scope.selectedRole.context_id ? ' ' + $scope.selectedRole.context_id : ''
					SweetAlert.swal({
				  	title: "Are you sure?",
				  	text: "Are you sure you want to make \"" + user.first_name + " " + user.last_name + ": " + user.email
				  		+ "\" a \"" + $scope.selectedRole.context_type + contextIdString + " - " + $scope.selectedRole.name + "\"",
				  	type: "warning", showCancelButton: true, confirmButtonColor: "#1ABC9C", confirmButtonText: "Yes, do it!", closeOnConfirm: true
				  }).then(
					function(confirmed){
						if(confirmed){
							RolesAndPermissionsService.attachRoleToUser(user.id, $scope.selectedRole.id).then(function(newUserRole){
								$scope.selectRole($scope.selectedRole)
						  	SweetAlert.swal({closeOnConfirm: true,title:"Sweet!", text:user.first_name + " " + user.last_name + " now has this role!", type:"success"});
							})
						}
					});
				}
			}

			$scope.detachUser = function(user){
				var contextIdString = $scope.selectedRole.context_id ? ' ' + $scope.selectedRole.context_id : ''
				SweetAlert.swal({
			  	title: "Are you sure?",
			  	text: "Are you sure that \"" + user.first_name + " " + user.last_name + ": " + user.email
				  		+ "\" should no longer be a \"" + $scope.selectedRole.context_type + contextIdString + " - " + $scope.selectedRole.name + "\"",
			  	type: "warning",  showCancelButton: true, confirmButtonColor: "#1ABC9C", confirmButtonText: "Yes, detatch this role!", closeOnConfirm: true
			  }).then( 
				function(confirmed){
					if(confirmed){
						RolesAndPermissionsService.detachRoleFromUser(user.id, $scope.selectedRole.id).then(function(){
							$scope.selectRole($scope.selectedRole)
					  	SweetAlert.swal({closeOnConfirm: true,title:"Good work!", text:"This user is no longer a " + $scope.selectedRole.context_type + contextIdString + " - " + $scope.selectedRole.name, type:"success"});
						})
					}
				});
			}

			$scope.toast = function(message){
				ngToast.create({
          className: 'danger',
          content: message,
          additionalClasses: 'nga-default nga-fade-remove nga-slide-right-add nga-slide-right-move',
          timeout: 6000,
          dismissButton: true,
          animation: 'slide'
        });
			}

  		$scope.getRoles()
  		$scope.getPermissions()
  		$scope.getCompanies()
  		$scope.getOperators()

	}])