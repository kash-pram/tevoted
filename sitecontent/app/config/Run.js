'use strict';

angular.module('rpOperatorApp')
  .run(["$rootScope","ngToast","AuthService","localStorageService","$state", "Session", "ENV", "RbacAuthorization",
    function($rootScope, ngToast, AuthService,localStorageService,$state,Session, ENV,RbacAuthorization){

    // ENV is set by grunt serve or grunt build
    // ENV = 'production';
    if(ENV === 'production'){
      $rootScope.endpoint = 'https://api-test.ridepal.com';
      $rootScope.operatorEndpoint = 'http://oldoperator.ridepal.com'
      $rootScope.newEndpoint = 'https://apinew.ridepal.com'
      $rootScope.routingEndpoint = 'https://route.ridepal.com'
    } else if (ENV === 'development'){
      //$rootScope.endpoint = 'https://api-test.ridepal.com';
      //$rootScope.operatorEndpoint = 'http://oldoperator.ridepal.com'
      //$rootScope.newEndpoint = 'https://apinew.ridepal.com'
      $rootScope.endpoint = 'http://localhost:9000';
      $rootScope.operatorEndpoint = 'http://mf.ridepal.com'
      $rootScope.newEndpoint = 'http://localhost:1337'
      $rootScope.routingEndpoint = 'http://127.0.0.1:5000'
    }
    $rootScope.operatorEndpoint = 'http://localhost:9001';
    $rootScope.endpoint = 'http://192.168.28.215:9000';
    $rootScope.newEndpoint = 'http://192.168.28.215:9000';
    $rootScope.routingEndpoint = 'http://localhost:9001';
    //List of states that don't require login
    var openStates = ['login'];

    // Authenitcation
    $rootScope.$on('$stateChangeStart',
      function(event, toState, toParams, fromState, fromParams){
        // If new state is not in openStates
        // and user is not authenticated, allow continue, otherwise error
        if( !( openStates.indexOf(toState.name) != -1 ) &&
          !( AuthService.isAuthenticated() ) &&
          !( Session.reestablish() ) ){
          event.preventDefault();

          if(toState.name != 'dispatchDashboard' && toState.name != 'home'){
            ngToast.create({
              className: 'danger',
              content: 'Login is required to view this page.',
              timeout: 10000,
              dismissButton: true,
              animation: 'slide'
            });
          }
          $state.go("login");

        }
      });

    $rootScope.$on('$stateChangeSuccess',
      function(event, toState, toParams, fromState, fromParams){
        $rootScope.pageName = toState.name;
        userUniqueVariables()
      });

    function userUniqueVariables(){
      $rootScope.portalName = ''
      if( RbacAuthorization.hasRole('ridepal') ){
        $rootScope.portalName = 'Admin'
      } else if( RbacAuthorization.hasRole('operator') ){
        $rootScope.portalName = 'Operator'
      }else if( RbacAuthorization.hasRole('organization') ){
        $rootScope.portalName = 'Corporation Admin'
      }
    }



  }])
