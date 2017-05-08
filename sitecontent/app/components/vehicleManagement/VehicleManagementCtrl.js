'use strict';


angular.module('rpOperatorApp')
  .controller('VehicleManagementCtrl', ["$scope", "$timeout", "VehicleManagementService", function($scope, $timeout, VehicleManagementService) {

    $scope.formDataNew = {
      id:-1
    }
    $scope.formData = angular.copy($scope.formDataNew);
    $scope.vehicles = []
    $scope.selectedVehicle = {}
    $scope.startDatepickerOptions = {}

    $scope.getVehicles = function(){
      VehicleManagementService.getVehicles().then(function(response){
        $scope.vehicles = response;
      })
    }
    $scope.getVehicles();

    $scope.saveVehicle = function(){
      if($scope.form.$valid && !$scope.form.$pristine){
        $scope.success = false;
        $scope.form.$setSubmitted();
        VehicleManagementService.saveVehicle($scope.getFinalPostData()).then(function(response){
          $scope.vehicleSaved();
        })
      }
    }

    $scope.getFinalPostData = function(){
      $scope.formData.startDate = $scope.formData.startDate.local().format('x')
      $scope.formData.endDate = typeof $scope.formData.endDate === 'undefined' ? null : $scope.formData.endDate.local().format('x')
      return $scope.formData
    }

    $scope.vehicleSaved = function(){
      $scope.success = true;
      $timeout(function(){
        $scope.clearForm();
      },5000)
    }

    $scope.getSaveBtnClass = function(){
      if($scope.success)
        return 'btn-success'
      else
        return 'btn-info'
    }

    $scope.clearForm = function(){
      if(!$scope.form.$pristine){       
        $scope.form.$setPristine();
        $scope.form.$setUntouched();
        $scope.formData = angular.copy($scope.formDataNew);
        $scope.success = false;
        $scope.selectedVehicle = {};
        $scope.removeReadonly()
      }
    }

    $scope.getLabel = function(vehicle){
      return vehicle.customerId + " ---- (" + vehicle.make + " " + vehicle.model + ")" + " ---- Capacity: " + vehicle.capacity
    }

    $scope.selectVehicle = function(){
      $scope.removeReadonly();
      $scope.formData = $scope.selectedVehicle;
      $scope.form.$setDirty();
      $scope.addReadonly()
    }

    $scope.removeReadonly = function(){
      $scope.startReadonly = $scope.endReadonly = false;
      $scope.allReadonly = false;
    }

    $scope.addReadonly = function(){
      $scope.startReadonly = true

      // If end date is in past, readonly
      if( moment($scope.selectedVehicle.endDate).isBefore(moment()) ){
        $scope.allReadonly = true;
      }
    }

}]);