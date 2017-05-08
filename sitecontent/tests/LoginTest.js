describe('Login', function() {

	var $controller,controller,$scope;
	beforeEach(module('rpOperatorApp'));
	beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
  }));



	describe('LoginCtrl', function(){

		beforeEach(inject(function(){
	    $scope = {};
    	controller = $controller('LoginCtrl', { $scope: $scope });
	  }));
		

		it('is defined', function(){
  		expect(controller).toBeDefined();
  	})

	});


});