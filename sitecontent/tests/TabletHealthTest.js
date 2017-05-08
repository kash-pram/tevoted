describe('TabletHealth', function() {

	var $controller,controller,$scope;
	beforeEach(module('rpOperatorApp'));
	beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
  }));


	describe('TabletHealthCtrl', function(){

		beforeEach(inject(function($rootScope){
	    $scope = $rootScope.$new();
    	controller = $controller('TabletHealthCtrl', { $scope: $scope });
    	jasmine.getJSONFixtures().fixturesPath = "base/tests/json"
	  }));
		

		it('is defined', function(){
  		expect(controller).toBeDefined();
  	})

  	it('properly formats tablet health data', function(){
  		$scope.tabletStatusesOriginal = getJSONFixture("tabletHealth.json");

      // need to make the last update time more recent than 1 hour ago
      angular.forEach($scope.tabletStatusesOriginal, function(tablet){
        tablet.lastHealthUpdateTime = moment();
      })

  		$scope.formatTabletStatuses();
  		expect($scope.tabletStatusesDisplay[0].shortName).toBe(17); // must be int
  		expect($scope.tabletStatusesDisplay[6].shortName).toBe(63); // must be int
  		expect($scope.tabletStatusesDisplay[10].shortName).toBe(90); // must be int
  	})

  	it('properly colors based on battery level', function(){
  		var tabletData = [
  			{batteryLevel:100, batteryStatus: 'discharging', expected: 'success'},
  			{batteryLevel:80, batteryStatus: 'discharging', expected: 'warning'},
  			{batteryLevel:60, batteryStatus: 'discharging', expected: 'warning'},
  			{batteryLevel:59, batteryStatus: 'discharging', expected: 'danger'},
  			{batteryLevel:40, batteryStatus: 'discharging', expected: 'danger'},
  			{batteryLevel:1, batteryStatus: 'Charging', expected: 'success'},
  			{batteryLevel:55, batteryStatus: 'Charging', expected: 'success'}
  		]

  		for (var i = 0; i < tabletData.length; i++) {
  			expect($scope.getColoring(tabletData[i])).toEqual(tabletData[i].expected)
  		};

  	})



	});

});