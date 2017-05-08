'use strict';

angular.module('rpOperatorApp')
  .service('TrackingService', ["$http", "$q","$rootScope", function TrackingService($http, $q, $rootScope) {

  	this.getTimetables = function(){
        var defer = $q.defer();
        var url = $rootScope.endpoint + '/schedule'
        url = url + '?showOtherPublic=false'

        $http({
        	method: 'GET',
        	url: url
        }).then(function(response){
        	defer.resolve(response);
        },function(response){
        	defer.resolve(response);
        });

        return defer.promise;
    }

    this.getLastMarker = function(){
        var defer = $q.defer();

        $http({
        	method: 'GET',
        	url: $rootScope.endpoint + '/telemetry?showAll=true'
        }).then(function(response){
        	defer.resolve(response);
        },function(response){
        	defer.resolve(response);
        });

        return defer.promise;
    }

  }]);