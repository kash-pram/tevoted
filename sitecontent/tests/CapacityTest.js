describe('Capacity', function() {

	var $controller,controller,$scope;
	beforeEach(module('rpOperatorApp'));
	beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
  }));


	describe('CapacityCtrl', function(){

		beforeEach(inject(function(){
	    $scope = {};
    	controller = $controller('CapacityCtrl', { $scope: $scope });
    	jasmine.getJSONFixtures().fixturesPath = "base/tests/json"
	  }));
		

		it('is defined', function(){
  		expect(controller).toBeDefined();
  	})

/*  	it('sets chart data correctly', function(){
  		$scope.capacityData = getJSONFixture("capacity.json");
  		$scope.addChartData();
  		for (var i = 0; i < $scope.capacityData.length; i++) {
  			for (var x = 0; x < $scope.capacityData[i].runs.length; x++) {
  				expect($scope.capacityData[i].runs[x].chartData).toBeDefined()
  				expect($scope.capacityData[i].runs[x].chartLabels).toBeDefined()
  				expect($scope.capacityData[i].runs[x].chartData.length).toEqual(1)
  				expect($scope.capacityData[i].runs[x].chartData[0].length).toEqual(3)
  				expect($scope.capacityData[i].runs[x].chartLabels.length).toEqual(3)
  			};
  		};

  		// spot check random one
  		expect($scope.capacityData[0].runs[1].chartData[0][1]).toEqual(89)
  	})*/

  	it('gets type correctly', function(){
  		expect($scope.getType(1)).toEqual('success')
  		expect($scope.getType(61)).toEqual('success')
  		expect($scope.getType(70)).toEqual('warning')
  		expect($scope.getType(79)).toEqual('warning')
  		expect($scope.getType(80)).toEqual('danger')
  		expect($scope.getType(99)).toEqual('danger')
  		expect($scope.getType(100)).toEqual('danger')
  	})

/*  	it('switches view at the right time', function(){
  		$scope.routeView = true;

  		$scope.selectRoute(null)
  		expect($scope.routeView).toBe(false)

  		$scope.goBack()
  		expect($scope.routeView).toBe(true)
  	})*/

  


	});

});