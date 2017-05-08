describe('VehicleManagement', function() {

	var $controller,controller,$scope;
	beforeEach(module('rpOperatorApp'));
	beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
  }));


	describe('VehicleManagementCtrl', function(){

		beforeEach(inject(function($rootScope){
	    $scope = $rootScope.$new();
    	controller = $controller('VehicleManagementCtrl', { $scope: $scope });
    	jasmine.getJSONFixtures().fixturesPath = "base/tests/json"
	  }));
		

		it('is defined', function(){
  		expect(controller).toBeDefined();
  	})

  	it('sets correct save button class', function(){
  		$scope.success = false
  		expect($scope.getSaveBtnClass()).toEqual('btn-info')

  		$scope.success = true
  		expect($scope.getSaveBtnClass()).toEqual('btn-success')
  	})

  	it('sets the correct label for vehicle dropdown', function(){
  		var vehicle = {
  			vin: 'vinNum',
        make: 'mercedes',
        model: 'e430',
        capacity: 5,
  			customerId: 123
  		}

  		expect($scope.getLabel(vehicle)).toEqual('123 ---- (mercedes e430) ---- Capacity: 5')

  	})

	});

});