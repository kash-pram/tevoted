'use strict';

angular.module('rpOperatorApp')
  .config(["$httpProvider","$locationProvider","$sailsProvider","ENV", function($httpProvider,$locationProvider,$sailsProvider,ENV){
      $httpProvider.interceptors.push('APIInterceptor');
      $locationProvider.html5Mode({ enabled: true, requireBase: false });
      //ENV = 'production'
      if(ENV === 'production'){
	      $sailsProvider.url = 'https://apinew.ridepal.com\:443';
	    } else if (ENV === 'development'){
	      $sailsProvider.url = 'http://localhost\:1337';
	    }
  }]);