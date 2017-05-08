describe('EditRun', function() {

	var $controller,controller,$scope;

	beforeEach(module('rpOperatorApp'));
	beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
  }));

	describe('RouteReplayCtrl', function(){

		beforeEach(inject(function($rootScope){
	    $scope = $rootScope.$new();
    	controller = $controller('EditRunCtrl', { $scope: $scope });
    	jasmine.getJSONFixtures().fixturesPath = "base/tests/json"
	  }));

		it('is defined', function(){
  		expect(controller).toBeDefined();
  	})

  	it('correctly sets run timelines', function(){
      var schedules = {
      	bus:[
      		{runs:[
      			{runTimelineId:1},
      			{runTimelineId:2},
      			{runTimelineId:3},
    			]},
    			{runs:[
      			{runTimelineId:4},
      			{runTimelineId:5},
      			{runTimelineId:6},
    			]}
      	],
      	van:[
      		{runs:[
      			{runTimelineId:7},
      			{runTimelineId:8},
      			{runTimelineId:9},
    			]},
    			{runs:[
      			{runTimelineId:10},
      			{runTimelineId:11},
      			{runTimelineId:12},
    			]}
      	]
      }

			$scope.setRunTimelines(schedules)

			var expected = {
				1:[{runTimelineId:1}],
				2:[{runTimelineId:2}],
				3:[{runTimelineId:3}],
				4:[{runTimelineId:4}],
				5:[{runTimelineId:5}],
				6:[{runTimelineId:6}],
				7:[{runTimelineId:7}],
				8:[{runTimelineId:8}],
				9:[{runTimelineId:9}],
				10:[{runTimelineId:10}],
				11:[{runTimelineId:11}],
				12:[{runTimelineId:12}]
			}

			expect(expected).toEqual($scope.runTimelines)

		})


  	it('properly processes runtimelines', function(){

  		var runTimelines = [
  			[{stops:[
  				{stopTime:'08:00:00'},
  				{stopTime:'09:00:00'},
  				{stopTime:'10:00:00'},
				]}],
				[{stops:[
  				{stopTime:'11:00:00'},
  				{stopTime:'12:00:00'},
  				{stopTime:'13:00:00'},
				]}],
				[{stops:[
  				{stopTime:'01:00:00'},
  				{stopTime:'02:00:00'},
  				{stopTime:'03:00:00'},
				]}]
  		]
  		$scope.meridiem = 'am'
  		
  		var expected = [
	  		[
		  		{stops:[
		  			{stopTime:"08:00:00"},
		  			{stopTime:"09:00:00"},
		  			{stopTime:"10:00:00"}
	  			]}
	  		],
		  	[
		  		{stops:[
		  			{stopTime:"11:00:00"},
		  			{stopTime:"12:00:00"},
		  			{stopTime:"13:00:00"}
	  			]}
  			],
	  		[
	  			{stops:[
		  			{stopTime:"01:00:00"},
			  		{stopTime:"02:00:00"},
			  		{stopTime:"03:00:00"}
		  		]}
	  		]
  		]

  		expect(expected).toEqual($scope.processRunTimelines(runTimelines))

  	})

		it('correctly adds runs for timelines', function(){

			var runTimelines = [
  			[{stops:[
  				{stopType: 'pickup', stopDescId: 08, stopName: 'stop 08', stopTime:'08:00:00'},
  				{stopType: 'pickup', stopDescId: 09, stopName: 'stop 09', stopTime:'09:00:00'},
  				{stopType: 'pickup', stopDescId: 10, stopName: 'stop 10', stopTime:'10:00:00'},
				]}],
				[{stops:[
  				{stopType: 'pickup', stopDescId: 11, stopName: 'stop 11', stopTime:'11:00:00'},
  				{stopType: 'pickup', stopDescId: 12, stopName: 'stop 12', stopTime:'12:00:00'},
  				{stopType: 'pickup', stopDescId: 13, stopName: 'stop 13', stopTime:'13:00:00'},
				]}],
				[{stops:[
  				{stopType: 'pickup', stopDescId: 01, stopName: 'stop 01', stopTime:'01:00:00'},
  				{stopType: 'pickup', stopDescId: 02, stopName: 'stop 02', stopTime:'02:00:00'},
  				{stopType: 'pickup', stopDescId: 03, stopName: 'stop 03', stopTime:'03:00:00'},
				]}]
  		]

			var expected = [
				{stopDescId:1,stopName:"stop 01",stopTime:"01:00:00",stopType:"pickup"},
				{stopDescId:2,stopName:"stop 02",stopTime:"02:00:00",stopType:"pickup"},
				{stopDescId:3,stopName:"stop 03",stopTime:"03:00:00",stopType:"pickup"},
				{stopDescId:8,stopName:"stop 08",stopTime:"08:00:00",stopType:"pickup"},
				{stopDescId:9,stopName:"stop 09",stopTime:"09:00:00",stopType:"pickup"},
				{stopDescId:10,stopName:"stop 10",stopTime:"10:00:00",stopType:"pickup"},
				{stopDescId:11,stopName:"stop 11",stopTime:"11:00:00",stopType:"pickup"}
			]

  		$scope.meridiem = 'am'
  		$scope.getRunHeaders(runTimelines)
			expect(expected).toEqual($scope.runHeader)


		})


		it('deduces am or pm correctly', function(){
			expect( $scope.amOrPm('10:00:00') ).toEqual('am')
			expect( $scope.amOrPm('11:59:59') ).toEqual('am')
			expect( $scope.amOrPm('00:00:00') ).toEqual('am')
			expect( $scope.amOrPm('10:00') ).toEqual('am')
			expect( $scope.amOrPm('03:00:00') ).toEqual('am')
			expect( $scope.amOrPm('12:00:00') ).toEqual('pm')
			expect( $scope.amOrPm('13:00:00') ).toEqual('pm')
			expect( $scope.amOrPm('23:59:99') ).toEqual('pm')
		})




	})

})