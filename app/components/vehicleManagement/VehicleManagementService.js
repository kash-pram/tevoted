angular.module('rpOperatorApp')
  .service('VehicleManagementService', ["$http", "$q", "$rootScope", function VehicleManagementService($http, $q,$rootScope) {
    'use strict';

  	this.getVehicles = function(){
        var defer = $q.defer();
        $http({
        	method: 'GET',
        	url: $rootScope.endpoint + '/vehicle'
        }).then(function(response){
        	defer.resolve(response.data);
        },function(response){
        	defer.resolve(response);
        });
        return defer.promise;
    }

    this.saveVehicle = function(data){
        var defer = $q.defer();
        data.operatorId = 4;
        $http({
        	method: 'POST',
        	url: $rootScope.endpoint + '/vehicle',
        	data:data
        }).then(function(response){
        	defer.resolve(response);
        },function(response){
        	defer.resolve(response);
        });
        return defer.promise;
    }

  }]);