describe('RouteScorecard', function() {

	var $controller,controller,$scope;
	beforeEach(module('rpOperatorApp'));
	beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
  }));


	describe('RouteScorecardCtrl', function(){

		beforeEach(inject(function($rootScope){
	    $scope = $rootScope.$new();
    	controller = $controller('RouteScorecardCtrl', { $scope: $scope });
    	jasmine.getJSONFixtures().fixturesPath = "base/tests/json"
	  }));
		

		it('is defined', function(){
  		expect(controller).toBeDefined();
  	})

  	it('assigns proper function depending on am/pm', function(){
      $scope.filters = {
        amOrPm: 'AM'
      }
      $scope.routeScoresRaw = [
      	{stop_time: '1:00'}, {stop_time: '11:00'}, {stop_time: '13:00'}, {stop_time: '15:00'}, {stop_time: '18:00'}
    	]
      $scope.assignAmPm()
      expect($scope.routeScoresSafe.length).toEqual(2)
      $scope.filters.amOrPm = 'PM'
      $scope.assignAmPm()
      expect($scope.routeScoresSafe.length).toEqual(3)
    })

    it('checks am/pm correctly', function(){
    	jasmine.clock().mockDate( moment().startOf('day').add(2,'hours').toDate() );
    	$scope.checkAmPm();

    	expect($scope.filters.amOrPm).toEqual('AM')

    	jasmine.clock().mockDate( moment().startOf('day').add(17,'hours').toDate() );
    	$scope.checkAmPm();

    	expect($scope.filters.amOrPm).toEqual('PM')
    })

    it('correctly gets background colors for TDs', function(){
    	expect($scope.getBackground(-10)).toEqual('success-light');
    	expect($scope.getBackground(-1)).toEqual('success-light');
    	expect($scope.getBackground(0)).toEqual('success-light');
    	expect($scope.getBackground(4)).toEqual('success-light');
    	expect($scope.getBackground(5)).toEqual('success-light');
    	expect($scope.getBackground(6)).toEqual('warning');
    	expect($scope.getBackground(9)).toEqual('warning');
    	expect($scope.getBackground(10)).toEqual('warning');
    	expect($scope.getBackground(11)).toEqual('danger');
    	expect($scope.getBackground(100)).toEqual('danger');
    	expect($scope.getBackground(99999999999999)).toEqual('danger');
    })

    it('correctly gets the score background', function(){
    	expect($scope.getScoreBackground(0)).toEqual('danger')
    	expect($scope.getScoreBackground(1)).toEqual('danger')
    	expect($scope.getScoreBackground(2)).toEqual('danger')
    	expect($scope.getScoreBackground(3)).toEqual('danger')
    	expect($scope.getScoreBackground(4)).toEqual('success')
    	expect($scope.getScoreBackground(5)).toEqual('success')
    })

    it('processes run data correctly', function(){
    	$scope.routeScoresRaw = getJSONFixture("routeScoreRaw.json");
    	$scope.formatRunData();
    	expect($scope.runDataformatted).toEqual(true)
    	expect($scope.routeScoresRaw[0].runId).toEqual(479)
    	//expect($scope.routeScoresRaw[0].yard_depart).toBeDefined();
    	//expect($scope.routeScoresRaw[0].yard_depart.valueOf()).toEqual(1455041703999);
    })

    it('processes timetable data correctly', function(){
    	$scope.timeTableData = getJSONFixture("routeActive.json");
    	$scope.formatTimetableData();
    	expect($scope.timeTableDataFormatted).toEqual(true)
    	expect($scope.timeTableData[354].shortName).toEqual('62');
    	expect($scope.timeTableData[354].first_stop_arrive).toEqual("07:45:00");
    	expect($scope.timeTableData[354].preflight_done).toEqual("06:55");
    	expect($scope.timeTableData[354].staging_arrive).toEqual("07:35:00");
    	expect($scope.timeTableData[354].stop_time).toEqual("07:45:00");
    	expect($scope.timeTableData[354].tablet_login).toEqual("06:45");
    	expect($scope.timeTableData[354].yard_depart).toEqual("07:05");
    	
    	expect($scope.timeTableData[501].shortName).toEqual('86');
    	expect($scope.timeTableData[501].first_stop_arrive).toEqual("19:00:00");
    	expect($scope.timeTableData[501].preflight_done).toEqual("18:30");
    	expect($scope.timeTableData[501].staging_arrive).toEqual("19:00:00");
    	expect($scope.timeTableData[501].stop_time).toEqual("19:00:00");
    	expect($scope.timeTableData[501].tablet_login).toEqual("18:20");
    	expect($scope.timeTableData[501].yard_depart).toEqual("18:40");
    })

    it('scores rows correctly', function(){
    	var scoreThis = {
    		tablet_login: 0,
    		preflight_done: 0,
    		yard_depart: 0,
    		staging_arrive: 0,
    		first_stop_arrive: 0
    	}
    	expect($scope.scoreIt(scoreThis)).toEqual(5)

    	scoreThis.tablet_login = 6
    	expect($scope.scoreIt(scoreThis)).toEqual(4)

    	delete scoreThis.yard_depart
    	expect($scope.scoreIt(scoreThis)).toEqual(3)
    })

    it('correctly identifies integers', function(){
    	expect($scope.isInt(0)).toEqual(true)
    	expect($scope.isInt(2)).toEqual(true)
    	expect($scope.isInt(-5)).toEqual(true)

    	expect($scope.isInt(null)).toEqual(false)
    	expect($scope.isInt('wooo')).toEqual(false)
    	expect($scope.isInt('12')).toEqual(false)
    	expect($scope.isInt('')).toEqual(false)
    })




	});

});