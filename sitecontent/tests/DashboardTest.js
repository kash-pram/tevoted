describe('DispatchDashboard', function() {

	var $controller,controller,$scope;

	beforeEach(module('rpOperatorApp'));
	beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
  }));
	var rootScope;
	beforeEach(inject(function($rootScope) {
		rootScope = $rootScope;
	}));

	describe('DispatchDashboardCtrl', function(){

		beforeEach(inject(function($httpBackend){
			jasmine.getJSONFixtures().fixturesPath = "base/tests/json"
	    $scope = rootScope.$new(),
    	controller = $controller('DispatchDashboardCtrl', { $scope: $scope });
    	httpBackend = $httpBackend;

    	// Have to do this because I need the apply for the promise
			//httpBackend.expectGET("/admin/report/tablet?key=coehf89y3202y80FTFFugsG7&window=4").respond({ hello: 'world'})
			//httpBackend.expectGET("/metrics/runs/day?date=2016-03-09&operatorId=4").respond({ hello: 'world'})
			httpBackend.expect('GET',/(.+)\/admin\/report\/tablet(.+)/).respond({ hello: 'world'})
			httpBackend.expect('GET',/(.+)\/metrics\/runs\/day(.+)/).respond({ hello: 'world'})

			httpBackend.expect('GET',/(.+)\/schedule/).respond({ hello: 'world'})
			httpBackend.expect('GET',/(.+)\/route\/active(.+)/).respond({ hello: 'world'})
			httpBackend.expectGET("components/login/LoginView.html").respond({ hello: 'world'})
	  }))

	  it('is defined', function(){
  		expect(controller).toBeDefined();
  	})

		it('am/pm check works',function(){
			jasmine.clock().mockDate( new Date(2016, 2, 9, 20, 55) )
			$scope.checkAmPm()
			expect($scope.filters.amOrPm).toEqual('PM')

			jasmine.clock().mockDate( new Date(2016, 2, 9, 8, 55) )
			$scope.checkAmPm()
			expect($scope.filters.amOrPm).toEqual('AM')
		})

		it('getting battery icon correctly', function(){
			expect($scope.getBatteryIcon(91)).toEqual('fa-battery-4');
			expect($scope.getBatteryIcon(81)).toEqual('fa-battery-3');
			expect($scope.getBatteryIcon(51)).toEqual('fa-battery-2');
			expect($scope.getBatteryIcon(26)).toEqual('fa-battery-1');
			expect($scope.getBatteryIcon(11)).toEqual('fa-battery-0');
		})

		it('tabletOn status is working', function(){
			var now = moment().format("HH:mm");
			var nowPlus30 = moment().add(30,'minutes').format("HH:mm");
			var nowMinus30 = moment().subtract(30,'minutes').format("HH:mm");
			var oldMarker = moment().subtract(300,'minutes').valueOf();
			var oldLogin = moment().subtract(300,'minutes').format("HH:mm");
			var nowMarker = moment().valueOf();

			$scope.tabletStatuses = {
				'1': {shortName:'1',lastMarkerTime: oldMarker,foo:'bar'},
				'2': {shortName:'2',lastMarkerTime: nowMarker,foo:'bar2'},
				'3': {shortName:'3',lastMarkerTime: nowMarker,foo:'bar3'},
			}

			var route1 = {tablet_login: now, shortName:'1'}
			expect($scope.tabletOnStatus(route1)).toEqual('On')

			var route2 = {tablet_login: nowPlus30, shortName:'2'}
			expect($scope.tabletOnStatus(route2)).toEqual('Early')

			var route3 = {tablet_login: nowMinus30, shortName:'3'}
			expect($scope.tabletOnStatus(route3)).toEqual('Late')

			var route4 = {tablet_login: oldLogin, shortName:'4'}
			expect($scope.tabletOnStatus(route4)).toEqual('Off')

		})

/*		it('formatting driver data is working', function(){
			
      $scope.routeScoresRaw = getJSONFixture("routeScoreRaw.json");
			$scope.formatDriverData().then(function(response){
				expect($scope.runDriverMap).toEqual({354: "Bouie, Noyoka", 438: "Love, Kathleen", 441: "Meiran, German", 444: "Creighton, Chris", 445: "Briggs, Byron", 447: "Ulibas, Darwin", 448: "Niumata, Lau", 451: "Alvarez, Ariana", 452: "Espanol, Ramon", 454: "Lee, Andy", 458: "Oliver, Trinice", 462: "Siemer, Dan", 466: "Feng, Rong", 467: "Cobaugh, Josh", 481: "Linco, Erwin", 486: "Loge, Mark", 489: "Seto, Peter", 493: "Carney, Barbara", 497: "Hughes, Jermain", 499: "Lane, Nathan", 500: "Harris, Martin", 502: "Kelley, Monte"})
				expect($scope.runDepartMap).toEqual({354: 1455032761000, 438: 1455031144999, 439: 1455026262023, 441: 1455028441999, 444: 1455033484999, 445: 1455025863000, 446: 1455029345000, 447: 1455032461000, 448: 1455031443999, 449: 1455027544000, 451: 1455028202999, 452: 1455029099999, 453: 1455028145999, 454: 1455040194452, 455: 1455025326000, 458: 1455031863000, 462: 1455027243000, 463: 1455031203000, 466: 1455032935999, 467: 1455039117999, 479: 1455041784596, 481: 1455029400999, 482: 1455037281880, 486: 1455039845000, 489: 1455033301999, 493: 1455037346594, 497: 1455028625000, 499: 1455027600000, 500: 1455030365999, 502: 1455032882999, 503: 1455031501000, 505: 1455040920999})
			});
			$scope.$rootScope.$digest()
		})*/
//@TODO reimplement these two tests when changes are settled
/*		it('formatting timetable data is working', function(){
      $scope.timeTableData = getJSONFixture("routeActive.json");
      var formattedRouteActive = getJSONFixture("formattedRouteActive.json");
			$scope.formatTimetableData().then(function(response){
				expect(JSON.stringify($scope.timeTableDataRaw)).toEqual(JSON.stringify(formattedRouteActive[0]))
			});
			$scope.$rootScope.$digest()
		})*/

		it('dot coloring is returning correct color classes', function(){
			var stop = {
				stopDeparted:3,
				stopTime:2,
				stopEta:4
			}
			expect($scope.getDotClass(stop)).toEqual('fa-green fa-circle-o')
			stop.stopDeparted = 1
			expect($scope.getDotClass(stop)).toEqual('fa-green fa-circle-o')
			stop.stopDeparted = stop.stopTime = null
			expect($scope.getDotClass(stop)).toEqual('fa-green fa-circle-o')
			stop.stopEta = null
			expect($scope.getDotClass(stop)).toEqual('fa-circle-o')

		})

		it('propOrNull function is working propery',function(){
			var rick = {
				neverGonna: 'give you up',
				neverGonna1: 'let you down',
				neverGonna2: 'run around and hurt you'
			}

			expect($scope.propOrNull(rick,'neverGonna')).toEqual('give you up')
			expect($scope.propOrNull(rick,'neverGonna1')).toEqual('let you down')
			expect($scope.propOrNull(rick,'neverGonna2')).toEqual('run around and hurt you')
			expect($scope.propOrNull(rick,'neverGonna3')).toBeNull()
			expect($scope.propOrNull(rick,'neverGonna4')).toBeNull()
		})

		it('getting background color correctly',function(){
			expect($scope.getBackgroundColor(11)).toEqual('danger')
			expect($scope.getBackgroundColor(0)).toEqual('')
			expect($scope.getBackgroundColor(-1)).toEqual('')
		})



	})
})