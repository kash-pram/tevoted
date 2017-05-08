describe('Notification', function() {

	var $controller,controller,$scope;
	beforeEach(module('rpOperatorApp'));
	beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
  }));

	describe('NotificationCtrl', function(){

		beforeEach(inject(function(){
	    $scope = {};
    	controller = $controller('NotificationCtrl', { $scope: $scope });
	  }))
		

		it('is defined', function(){
  		expect(controller).toBeDefined();
  	})

  	it('selecting alert works', function(){
  		expect($scope.noteType).toEqual('')
  		$scope.selectAlert()
  		expect($scope.noteType).toEqual('alert')
  	})

  	it('selecting notification works', function(){
  		expect($scope.noteType).toEqual('')
  		$scope.selectNotification()
  		expect($scope.noteType).toEqual('notification')
  	})

  	it('routes should be processed after request', function(){
  		var routes = {
  			schedules: {
					van:[
		  			{'shortName':'1'},
		  			{'shortName':'2'},
		  		],
		  		bus:[
	  				{'shortName':'3'}
  				]
		  	}
			}
  		$scope.processRoutes(routes);
  		expect($scope.routes).toEqual(['1','2','3'])
  	})

  	it('interpolating the template works', function(){
  		var html = 'Yo yo #{{routeId}} riders! What is up?';
  		$scope.selectedRoute = '1'
  		$scope.interpolateTheTemplate(html);
  		expect($scope.message).toEqual('Yo yo #1 riders! What is up?')
  	})

  	describe('Formatting Message Data', function(){
  		beforeEach(inject(function(){
		    $scope = {};
	    	controller = $controller('NotificationCtrl', { $scope: $scope });
	    	$scope.noteType = 'alert'
  			$scope.message = 'Hola amigo!'
		  }))

  		it('selected route', function(){
	  		$scope.selectedRoute = '1'
	  		var formattedData = $scope.formatDataForSending()
	  		var expected = {
	  			'alert':{
	  				allRegistered: false,
	  				allActive: false,
	  				shortName: $scope.selectedRoute,
	  				mode: 'bus',
	  				message: $scope.message
	  			}
	  		}
	  		expect(formattedData).toEqual(expected)
	  	})

	  	it('all active', function(){
	  		$scope.selectedRoute = 'All active routes'
	  		var formattedData = $scope.formatDataForSending()
	  		var expected = {
	  			'alert':{
	  				allRegistered: false,
	  				allActive: true,
	  				message: $scope.message
	  			}
	  		}
	  		expect(formattedData).toEqual(expected)
	  	})

	  	it('all registered', function(){
	  		$scope.selectedRoute = 'All registered riders'
	  		var formattedData = $scope.formatDataForSending()
	  		var expected = {
	  			'alert':{
	  				allRegistered: true,
	  				allActive: false,
	  				message: $scope.message
	  			}
	  		}
	  		expect(formattedData).toEqual(expected)
	  	})

  	})
  	

	});

	describe('NotificationService', function(){
		beforeEach(inject(function (_NotificationService_, $httpBackend) {
	    NotificationService = _NotificationService_;
	    httpBackend = $httpBackend;
	  }));

		it('get template - not in cache', function(){
			var templateUrl = 'test_template'
			httpBackend.whenGET('/components/notification/templates/'+templateUrl).respond({
        data:'test_template'
    	});

			NotificationService.getTemplate(templateUrl).then(function(response){
				expect(response.data).toEqual('test_template')
			})

		})

		it('get template - in cache', function(){
			var templateUrl = 'test_template'
			httpBackend.whenGET('/components/notification/templates/'+templateUrl).respond({
        data:'test_template'
    	});

			NotificationService.getTemplate(templateUrl).then(function(response){
				expect(response.data).toEqual('test_template')

				// mess up the response data, but see if it persists because it is in cache
				httpBackend.whenGET('/components/notification/templates/'+templateUrl).respond({
	        data:'should never see this'
	    	});

	    	NotificationService.getTemplate(templateUrl).then(function(response){
					expect(response.data).toEqual('test_template')
				})

			})

			

    	

		})

	})

});