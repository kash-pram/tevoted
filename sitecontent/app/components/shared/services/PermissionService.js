'use strict';

angular.module('rpOperatorApp')
  .factory('PermissionService', ["Session", "$state", "ngToast", "$rootScope", "rbac",
    function (Session, $state, ngToast,  $rootScope, rbac) {
  	var PermissionService = {};
    PermissionService.authorizations = {}
        $rootScope.authorizationsSet = true

    // Happens after login
    PermissionService.addPermissions = function(authorizations){
        PermissionService.authorizations = authorizations
        Session.storeAuthorizations(authorizations).then(function(){
            PermissionService.setPermissions()
        })
    }

    PermissionService.getAuthorizations = function(){
    	return Session.getAuthorizations();
    }

    PermissionService.getSelectedRole = function(){
    	return Session.getSelectedRole();
    }

    PermissionService.setPermissions = function(){
      if( !this.permissionsAreSet() && this.authorizationsAreInLocalStorage()){
    		if( this.selectedRoleExists() ){
          this.setNewSelectedRole( this.getSelectedRole() )
          this.setOutgoingApiContextIfNeedBe()
    		}else{
          this.setNewPermissions( this.getAuthorizations() )
    		}
      }else{
      	// go to login if not on login page
      	this.redirectToLogin()
      }
    }

    PermissionService.inNewFormat = function(authorizations){
        return angular.isDefined(authorizations.roles)
    }

    PermissionService.setNewPermissions = function(authorizations){
      if(this.inNewFormat(authorizations)){
        this.setRolesAndPermissionsInNewFormat(authorizations)
      }else{
        var roleArray = [], roleObj = {}
        angular.forEach(authorizations, function(authorization){
            roleObj = {
                name: authorization.contextType,
                permissions: []
            }
            angular.forEach(authorization.permissions, function(permission){
                roleObj.permissions.push(permission.action + permission.objectName.split('/').join('-') )
            })
            roleArray.push(roleObj)
        })

        rbac.setRoles(roleArray)
      }
    }

    PermissionService.setRolesAndPermissionsInNewFormat = function(authorizations){
      var permissions = _.map(authorizations.permissions,function(permission){
        return permission.action + permission.object.split('/').join('-')
      })
      rbac.setRoles( _.pluck(authorizations.roles, 'context_type') )
      rbac.setPermissions( permissions )
    }

    PermissionService.setNewSelectedRole = function(authorizations){
        if(!angular.isArray(authorizations))
          authorizations = [authorizations]
        PermissionService.setNewPermissions(authorizations)
    }


    PermissionService.redirectToLogin = function(){
    	if( $state.current.name && $state.current.name != 'login' ){
	    	ngToast.create({
    	        className: 'danger',
    	        content: 'You must login to see this page',
    	        timeout: 6000,
    	        dismissButton: true,
    	        animation: 'slide'
            });
            $state.go('login')
	    }
    }

    PermissionService.permissionsAreSet = function(){
    	return !_.isEmpty( rbac.getRolesAndPermissions() )
    }

    PermissionService.authorizationsAreInLocalStorage = function(){
    	return !_.isEmpty( this.getAuthorizations() )
    }

    PermissionService.selectedRoleExists = function(){
    	var selectedRole = this.getSelectedRole();
    	return !_.isEmpty( selectedRole ) && selectedRole
    }

    PermissionService.removeAllPermissions = function(){
      rbac.clearRolesAndPermissions()
    	Session.removeAuthorizations()
    	Session.removeSelectedRole()
    }

    PermissionService.resetPermissions = function(){
      Session.removeSelectedRole()
      location.reload();
    }

    PermissionService.selectContext = function(role){
    	Session.removeSelectedRole()
    	Session.setSelectedRole(role)
    	PermissionService.setNewSelectedRole(role)
      this.setOutgoingApiContextIfNeedBe()

      // Refresh to show the changes on UI. This is to prevent have a lot of extra watches in the code
    	location.reload();
    }

    PermissionService.isActuallyRidepalAdmin = function(){
        var allRoles = _.map(
            this.getAuthorizations(), 
            function(authorization) {
                return authorization.contextType + '-' + authorization.name;
            }
        );

        return !!(allRoles.indexOf('ridepal-admin') != -1);
    }

    PermissionService.setOutgoingApiContextIfNeedBe = function(){
        // If selectedRole exists
        // && not ridepal ( so a possibly spoofed role )
        // && isActuallyRidepalAdmin ( and user actually is a ridepal admin )
        // Set rootscope role-spoofing variables consumed by APIInterceptor
        console.log(rbac.getRoles())
        var allRoleNames = rbac.getRoles();
        if( this.selectedRoleExists() 
        && allRoleNames[0] != 'ridepal' // eventually change this to be only ridepal admin, not just ridepal
        && this.isActuallyRidepalAdmin() ){
            $rootScope.context = Session.getSelectedRole()
        }else{
            $rootScope.context = {}
        }
    }

    return PermissionService;
  }]);
