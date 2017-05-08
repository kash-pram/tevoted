angular.module('rpOperatorApp')
.controller('RidersCtrl', ["$scope","RidersService","sweetAlert","PermissionService", function($scope, RidersService, SweetAlert, PermissionService) {
'use strict';
	$scope.riders = []
	$scope.loading = {riders:true}
	$scope.filters = {riders:'',orgId:null}
	$scope.newUser = {}

	// @TODO SET ORGID BASED ON ROLES

	$scope.getRiders = function(orgId){
		$scope.loading = {riders:true}
		RidersService.getRiders(orgId).then(function(riders){
			console.log(riders)
			$scope.riders = riders
			$scope.loading.riders = false
		})
	}

	$scope.determineAndSetOrgId = function(){
		var orgRole = _.find(PermissionService.getAuthorizations(),{context_type:'organization',name:'admin'})
		if(!_.isUndefined(orgRole)){
			$scope.filters.orgId = orgRole.context_id
			$scope.getRiders($scope.filters.orgId)
		}
	}
	$scope.determineAndSetOrgId()

	$scope.updateOrgId = function(){
		if($scope.filters.orgId)
			$scope.getRiders($scope.filters.orgId)
	}

	$scope.searchUser = function(){
		if(!$scope.newUser.email) return
		RidersService.userExist($scope.newUser.email).then(function(response){
			if(response.user_found)
				$scope.userAlreadyExists()
			else if(response.prospect_found)
				$scope.prospectAlreadyExists()
			else
				$scope.hidden.ridepass = false

			console.log(response)
		})
	}

	/*
	If email changes, then all other fields should be cleared and hidden
	 */
	$scope.emailChanged = function(){
		$scope.hideAll()
		$scope.newUser = _.pick($scope.newUser,'email')
	}

	$scope.hideAll = function(){
		$scope.hidden = {
			ridepass: true,
			additional: true
		}
	}
	$scope.hideAll()

	$scope.userAlreadyExists = function(){
		SweetAlert.swal({
	  	title: "User Exists",
	  	text: "That user already exists. Would you like to associate him/her with your organization?",
	  	type: "warning", 
	  	showCancelButton: true, 
	  	confirmButtonColor: "#1ABC9C", 
	  	confirmButtonText: "Yes, do it!", 
	  	closeOnConfirm: true
	  }).then(function(isConfirm){
	  	if(isConfirm){
	  		RidersService.associateUser($scope.newUser.email, $scope.filters.orgId).then(function(response){
	  			console.log(response)
	  			$scope.getRiders($scope.filters.orgId)
	  			$scope.newUser = {}
	  			SweetAlert.swal({title: "Nice!",
				  	text: "This rider was added to your organization",
				  	type: "success", closeOnConfirm: true})
	  			})
	  	}
	  })
	}

	$scope.prospectAlreadyExists = function(){
		SweetAlert.swal({
	  	title: "User Already Invited",
	  	text: "This user was already invited to join your organization. He or she must complete the registration via the email sent to their inbox.",
	  	type: "warning", 
	  	closeOnConfirm: true
	  })
	}

	$scope.registerProspect = function(){
		$scope.newUser.sendNotification = true
		RidersService.registerProspect($scope.newUser).then(function(response){
			console.log(response)
			$scope.getRiders($scope.filters.orgId)
			$scope.newUser = {}
			SweetAlert.swal({
				title: "Nice!",
		  	text: "This rider has been emailed registration instructions and will be added to your organization when he or she signs up.",
		  	type: "success", 
		  	closeOnConfirm: true
			})
		})
	}

	$scope.openRemoveConfirm = function(rider){
		SweetAlert.swal({
	  	title: "Stop sponsoring rider?",
	  	text: "Are you sure you would like to stop sponsoring this rider?",
	  	type: "warning", 
	  	showCancelButton: true, 
	  	confirmButtonColor: "#1ABC9C", 
	  	confirmButtonText: "Yes, do it!", 
	  	closeOnConfirm: true
		}).then(function(isConfirm){
	  	if(isConfirm){
	  		RidersService.disassociateUser(rider.email, $scope.filters.orgId).then(function(response){
	  			console.log(response)
	  			$scope.getRiders($scope.filters.orgId)
	  			SweetAlert.swal({title: "Ok!",
				  	text: "This rider has been removed from your sponsorship",
				  	type: "success", closeOnConfirm: true})
	  			})
	  	}
	  })
	}
	
}]);