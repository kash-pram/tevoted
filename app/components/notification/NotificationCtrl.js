

angular.module('rpOperatorApp')
  .controller('NotificationCtrl', ["$scope", "$timeout", "NotificationService", "$q", "$templateCache", "$http", "$interpolate", "DispatchDashboardService", "sweetAlert", "rbac",
    function($scope, $timeout, NotificationService,$q,$templateCache,$http,$interpolate,DispatchDashboardService, SweetAlert, rbac) {
    'use strict';

  	$scope.noteType = ''
  	$scope.selectedRoute = null
  	$scope.selectedTemplate = null
    $scope.sending = false;

  	$scope.selectAlert = function(){
  		$scope.noteType = 'alert'
  	}

  	$scope.routeSelected = function(){
  		// In order to fresh the template
  		if($scope.selectedTemplate)
  			$scope.selectTemplate($scope.selectedTemplate)
  	}

  	$scope.selectNotification = function(){
  		$scope.noteType = 'notification'
  	}

  	$scope.selectTemplate = function(templateUrl){
  		$scope.selectedTemplate = templateUrl;
  		NotificationService.getTemplate(templateUrl).then(function(html){
  			$scope.interpolateTheTemplate(html)
  		})
  	}

    $scope.interpolateTheTemplate = function(html){
      var interpolate = $interpolate(html);
      $scope.message = interpolate({routeId:$scope.selectedRoute});
    }

  	$scope.getRoutes = function(){
  		DispatchDashboardService.getTimetableData().then(function(response){
  			$scope.processRoutes(response);
  		})
  	}
  	$scope.getRoutes();

    $scope.processRoutes = function(response){
			//vans listed first for now
      $scope.routes = _.pluck(response.schedules.van.concat(response.schedules.bus),'shortName').sort(naturalSort);
      $scope.alertRoutes = angular.copy($scope.routes)

      // if ridepal, add all registered and all active options
      if( rbac.getRoles().indexOf('ridepal') > -1 ){
        $scope.routes.unshift('All registered riders');
        $scope.routes.unshift('All active routes');  
      }
    }

  	$scope.sendMessage = function(){
  		if($scope.sending)
  			return // prevent duplicate submissions
      var defer = $q.defer();
  		$scope.sending = true;
  		var dataToSend = $scope.formatDataForSending()
  		NotificationService.sendMessage(dataToSend,$scope.noteType).then(function(response){
  			if(response.success === true){
          defer.resolve(response)
          $scope.messageSendSuccess()
        } else {
          defer.reject(response)
          $scope.messageSendFailed()
        }
  		}, function(error){
        defer.reject(error)
        $scope.messageSendFailed()
      })
      return defer.promise;
  	}

    $scope.messageSendSuccess = function(){
      $scope.sending = false
    }

    $scope.messageSendFailed = function(){
      $scope.sending = false
    }

  	$scope.formatDataForSending = function(){
  		var dataToSend = {}
  		dataToSend[$scope.noteType] = {}
  		dataToSend[$scope.noteType].allRegistered = ($scope.selectedRoute == 'All registered riders');
		  dataToSend[$scope.noteType].allActive = ($scope.selectedRoute == 'All active routes'); 
  		if($scope.selectedRoute != 'All registered riders' && $scope.selectedRoute != 'All active routes'){
        dataToSend[$scope.noteType].shortName = $scope.selectedRoute;
  			dataToSend[$scope.noteType].mode = 'bus';
  		}
  		dataToSend[$scope.noteType].message = $scope.message;
  		return dataToSend;
  	}

    $scope.openConfirm = function(){
      SweetAlert.swal({
        title: "Are you sure?",
        text: "Are you sure you wish to send this message to route " + $scope.selectedRoute + " riders?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, send to bus " + $scope.selectedRoute,
        cancelButtonText: "No, nevermind",
        closeOnConfirm: false,
        closeOnCancel: true }).then(
      function(isConfirm){ 
        if (isConfirm) {
          $scope.sendMessage().then(function(successResponse){
            SweetAlert.swal({title:"Sent!", text:"Your " + $scope.noteType + " has been sent to route " + $scope.selectedRoute + " riders.", type:"success",closeOnConfirm:true});
          }, function(errorResponse){
            SweetAlert.swal({title:"Not Sent!", text:"Your " + $scope.noteType + " was not sent to route " + $scope.selectedRoute + " riders.", type:"error",closeOnConfirm:true});
          })
        }
      });
    }

  	$scope.templates = {
  		alert:[
	  		{url:'trafficAlert.html', name:'Late Bus - Traffic'},
	  		{url:'serviceDelayAlert.html', name:'Late Bus - Service Delay'},
	  		{url:'accidentOnRouteAlert.html', name:'Late Bus - Accident On Route'},
	  		{url:'fullBusAlert.html', name:'Full Bus'},
	  		{url:'fullBikeRackAlert.html', name:'Full Bike Rack'},
	  		{url:'brokenDownBusNewBusAlert.html', name:'Broken Down Bus - New Bus'},
	  		{url:'brokenDownBusMechanicAlert.html', name:'Broken Down Bus - Mechanic'},
	  		{url:'brokenDownBusPassengersNewBusAlert.html', name:'Broken Down Bus w/ Passengers - New Bus'},
	  		{url:'brokenDownBusPassengersMechanicAlert.html', name:'Broken Down Bus w/ Passengers - Mechanic'},
	  		{url:'differentBusAlert.html', name:'Different Bus'},
	  		{url:'eventDelayAlert.html', name:'Event Delay'},
	  		{url:'tabletNotWorkingAlert.html', name:'Tablet Not Working'},
	  		{url:'freeFormAlert.html', name:'Custom Alert'}
	  	],
	  	notification:[
	  		{url:'freeFormNotification.html', name:'Custom Notification'}
	  	]
  	}
  	

}]);