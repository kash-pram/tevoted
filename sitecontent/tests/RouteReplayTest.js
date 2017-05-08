describe('RouteReplay', function() {

	var $controller,controller,$scope;

	beforeEach(module('rpOperatorApp'));
	beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
  }));

	describe('RouteReplayCtrl', function(){
		beforeEach(inject(function($httpBackend){
	    $scope = {};
    	controller = $controller('RouteReplayCtrl', { $scope: $scope });
      jasmine.getJSONFixtures().fixturesPath = "base/tests/json"
    	httpBackend = $httpBackend;
    }))

		it('is defined', function(){
  		expect(controller).toBeDefined();
  	})

		it('correctly processing bus data', function(){
      var busData = getJSONFixture("routeActive.json");
      $scope.processBusResponse(busData);
      var formattedBusData = getJSONFixture("formattedRouteActive2.json");
      expect(JSON.stringify($scope.busData)).toEqual(JSON.stringify(formattedBusData))
		})

    it('assigns proper function depending on am/pm', function(){
      $scope.filters = {
        amOrPm: 'AM'
      }
      $scope.assignAmPm()

      expect($scope.filterFunction("12:00",1300)).toEqual(true)
      expect($scope.filterFunction("12:00",1100)).toEqual(false)

      $scope.filters.amOrPm = 'PM'
      $scope.assignAmPm()

      expect($scope.filterFunction("12:00",1300)).toEqual(false)
      expect($scope.filterFunction("12:00",1100)).toEqual(true)
    })

    it('shows hint properly', function(){
      inject(function(_$timeout_) {
        $timeout = _$timeout_;
      });
      httpBackend.expect('GET',/(.+)\/route\/active(.+)/).respond({ hello: 'world'})
      httpBackend.expectGET("components/login/LoginView.html").respond({ hello: 'world'})
      expect($scope.showHint).toEqual(false)
      $scope.showHintOnMap();
      expect($scope.showHint).toEqual(true)

      $timeout.flush(3000);
      expect($scope.showHint).toEqual(false)

    })
	})

})