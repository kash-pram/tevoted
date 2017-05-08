(function() {
    'use strict';

    angular
        .module('rpOperatorApp')
        .factory('DriverMgmtService', DriverMgmtService);

    DriverMgmtService.$inject = ['$http', '$rootScope'];

    function DriverMgmtService($http, $rootScope) {
        var service = {
            getDrivers: getDrivers,
            addDriver: addDriver
        };

        return service;

        function getDrivers() {
          //TO DO: return $http.get($rootScope.endpoint + '/drivers')
          return $http.get('sample.json')
            .then(function(res){
              return res;
            })
            .catch(function(err){
              // TO DO: LOG
              console.log(err);
              return err;
            });
        }

        function addDriver() {
          return $http.POST($rootScope.endpoint + '/driver')
            .then(function(res){
              // TO DO: LOG
              console.log(res);
            })
            .catch(function(err){
              // TO DO: LOG
              console.log(err);
            });
        }
    }
})();
