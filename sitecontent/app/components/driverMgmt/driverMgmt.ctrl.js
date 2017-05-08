(function() {
    'use strict';

    angular
        .module('rpOperatorApp')
        .controller('DriverMgmtCtrl', DriverMgmtCtrl);

     DriverMgmtCtrl.$inject = ['DriverMgmtService', '$uibModal', 'getDriversResolve'];

    function DriverMgmtCtrl(DriverMgmtService, $uibModal, getDriversResolve) {
        var vm = this;
        vm.createDriver = createDriver;
        vm.drivers = getDriversResolve.data;
        vm.editDriver = editDriver;
        vm.deleteDriver = deleteDriver;

        function editDriver(driverID) {
          console.log(driverID);
        }

        function deleteDriver(driverID) {
          console.log(driverID);
        }

        function createDriver(){
          $uibModal.open({
  		      templateUrl: '/components/driverMgmt/createDriver.modal.html',
  		      size: 'sm'
  		    });
        }
    }
})();
