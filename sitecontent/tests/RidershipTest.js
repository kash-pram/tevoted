describe('Ridership', function() {

	var $controller,controller,$scope;
	beforeEach(module('rpOperatorApp'));
	beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
  }));


	describe('RidershipCtrl', function(){

		beforeEach(inject(function(){
	    $scope = {};
    	controller = $controller('RidershipCtrl', { $scope: $scope });
    	jasmine.getJSONFixtures().fixturesPath = "base/tests/json"
	  }));
		

		it('is defined', function(){
  		expect(controller).toBeDefined();
  	})

  	it('processes routes correctly', function(){
  		$scope.routes = getJSONFixture("routes.json");
  		$scope.processRoutes()
  		//First node is 'All Routes'
      expect($scope.routes[0]).toEqual({shortName:"All Shuttles"})
  		expect($scope.routes[1]).toEqual({shortName:"All Vanpools"})
  	})

    it('sets parameters correctly',function(){
      $scope.selected.company = {id:2}
      $scope.selected.route = {routeId:3}
      $scope.dates.startDateField = 1456092524000
      $scope.dates.endDateField = 1456178926000

      $scope.setParameters();

      expect($scope.queryParameters.orgIdFilter).toEqual(2)
      expect($scope.queryParameters.route).toEqual(3)
      expect($scope.queryParameters.start).toEqual('1456041600000')
      expect($scope.queryParameters.end).toEqual('1456214399999')
    })

    it('validates form', function(){
      $scope.selected.route = {}
      expect($scope.validateForm()).toEqual(false)
      expect($scope.missingBus).toEqual(true)

      $scope.selected.route = {imnot:'empty'}
      expect($scope.validateForm()).toEqual(true)
      expect($scope.missingBus).toEqual(false)
    })


	});

});