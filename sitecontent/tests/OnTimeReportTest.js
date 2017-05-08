describe('OnTimeReport', function() {

	var $controller,controller,$scope;
	beforeEach(module('rpOperatorApp'));
	beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
  }));


	describe('OnTimeReportCtrl', function(){

		beforeEach(inject(function(){
	    $scope = {};
    	controller = $controller('OnTimeReportCtrl', { $scope: $scope });
    	jasmine.getJSONFixtures().fixturesPath = "base/tests/json"
	  }));
		

		it('is defined', isDefined)
    it('shows and hides things properly', showHideAccordinglyTest)
    it('resets all necessary data', resetDataTest)
    it('validates the form correctly', validateFormTest)
    it('validates the form correctly', validateFormTest)
    it('correctly filter inactive buses', activeTest)
    it('correctly updates query parameters', updateQueryParametersTest)
    it('correctly updates display parameters', updateDisplayParametersTest)





    function isDefined(){
      expect(controller).toBeDefined();
    }

    function showHideAccordinglyTest(){
      $scope.spinner = true;
      $scope.expanded = true;
      $scope.displayTable = false;

      $scope.showHideAccordingly();
      expect($scope.spinner).toEqual(false)
      expect($scope.expanded).toEqual(false)
      expect($scope.noResults).toEqual(true)
      expect($scope.displayTable).toEqual(false)

      $scope.noResults = false;
      $scope.displayData.am = {not:'empty'}

      $scope.showHideAccordingly();
      expect($scope.spinner).toEqual(false)
      expect($scope.expanded).toEqual(false)
      expect($scope.noResults).toEqual(false)
      expect($scope.displayTable).toEqual(true)

    }

    function resetDataTest(){
      $scope.displayData = {foo:'bar'}
      $scope.runs = {foo:'bar'}
      $scope.allRuns = {foo:'bar'}
      $scope.markers = {foo:'bar'}
      $scope.polyline = {foo:'bar'}

      $scope.resetData();

      expect($scope.displayData).toEqual({})
      expect($scope.runs).toEqual([])
      expect($scope.allRuns).toEqual([])
      expect($scope.markers).toEqual({})
      expect($scope.polyline).toEqual({})
    }

    function validateFormTest(){
      $scope.select = { selectedRoute:{ routeId:1 } }
      $scope.missingBus = false;

      expect( $scope.validateForm() ).toEqual(true)
      expect( $scope.missingBus ).toEqual(false)

      $scope.select.selectedRoute.routeId = null
      expect( $scope.validateForm() ).toEqual(false)
      expect( $scope.missingBus ).toEqual(true)

      delete $scope.select.selectedRoute.routeId
      expect( $scope.validateForm() ).toEqual(false)
      expect( $scope.missingBus ).toEqual(true)
    }

    function activeTest(){
      var route = {
        startDate: moment().subtract(5,'days').valueOf(),
        endDate:null
      }

      expect( $scope.active()(route) ).toEqual(true)
    }

    function updateQueryParametersTest(){
      $scope.dates = {}
      $scope.dates.startDateField = 1456092524000
      $scope.dates.endDateField = 1456178926000
      $scope.select = {selectedRoute:{routeId:1,shortName:2}}

      $scope.updateQueryParameters()
      expect($scope.queryParameters.start).toEqual('2016-02-21')
      expect($scope.queryParameters.end).toEqual('2016-02-22')
      expect($scope.queryParameters.routeId).toEqual(1)
      
    }

    function updateDisplayParametersTest(){
      $scope.dates = {}
      $scope.dates.startDateField = 1456092524000
      $scope.dates.endDateField = 1456178926000
      $scope.select = {selectedRoute:{routeId:1,shortName:2}}

      $scope.updateDisplayParameters()
      expect($scope.displayParameters.start).toEqual('Feb 21, 2016')
      expect($scope.displayParameters.end).toEqual('Feb 22, 2016')
      expect($scope.displayParameters.shortName).toEqual(2)
      
    }




	});

});