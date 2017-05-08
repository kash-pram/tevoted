'use strict';

angular.module('rpOperatorApp')
  .config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise( function($injector) {
      var $state = $injector.get("$state");
      $state.go('404');
    });

    $stateProvider
      .state('login', {
        url: '/login?redirect',
        templateUrl: 'components/login/LoginView.html',
        controller: 'LoginCtrl'
      })
      .state('404', {
        url: '/404',
        templateUrl: 'components/shared/404/404View.html',
        controller: '404Ctrl'
      })
      .state('home', {
        url: '/',
        templateUrl: 'components/shared/HomeView.html'
      })
      .state('driverManagement', {
        url: '/driver-management',
        templateUrl: 'components/driverMgmt/driverMgmt.view.html',
        controller: 'DriverMgmtCtrl',
        controllerAs: 'driverMgmt',
        resolve: {
          getDriversResolve: function(DriverMgmtService) {
            return DriverMgmtService.getDrivers();
          }
        }
      })
      .state('corpHome', {
        url: '/corporate-dashboard',
        templateUrl: 'components/corpHome/CorpHomeView.html',
        controller: 'CorpHomeCtrl'
      })
      .state('dispatchDashboard', {
        url: '/dispatch-dashboard',
        templateUrl: 'components/dispatchDashboard/DispatchDashboardView.html',
        controller: 'DispatchDashboardCtrl'
      })
        .state('tabletHealth', {
          url: '/tablet-health',
          templateUrl: 'components/tabletHealth/TabletHealthView.html',
          controller: 'TabletHealthCtrl'
        })
        .state('tracking', {
          url: '/tracking',
          templateUrl: 'components/tracking/TrackingView.html',
          controller: 'TrackingCtrl'
        })
        .state('notifications', {
          url: '/notifications',
          templateUrl: 'components/notification/NotificationView.html',
          controller: 'NotificationCtrl'
        })
        .state('notificationsV2', {
          url: '/notificationsV2',
          templateUrl: 'components/notificationV2/NotificationV2View.html',
          controller: 'NotificationV2Ctrl'
        })
        .state('routeScorecard', {
          url: '/route-scorecard',
          templateUrl: 'components/routeScorecard/RouteScorecardView.html',
          controller: 'RouteScorecardCtrl'
        })
        .state('routeReplay', {
          url: '/route-replay',
          templateUrl: 'components/routeReplay/RouteReplayView.html',
          controller: 'RouteReplayCtrl'
        })
        .state('vehicleManagement', {
          url: '/vehicle-management',
          templateUrl: 'components/vehicleManagement/VehicleManagementView.html',
          controller: 'VehicleManagementCtrl'
        })
        .state('onTimeReport', {
          url: '/on-time-report',
          templateUrl: 'components/onTimeReport/OnTimeReportView.html',
          controller: 'OnTimeReportCtrl'
        })
        .state('account', {
          url: '/me',
          templateUrl: 'components/account/AccountView.html',
          controller: 'AccountCtrl'
        })
        .state('capacity', {
          url: '/capacity',
          templateUrl: 'components/capacity/CapacityView.html',
          controller: 'CapacityCtrl'
        })
        .state('employeeManagement', {
          url: '/employee-management',
          templateUrl: 'components/employeeManagement/EmployeeManagementView.html',
          controller: 'EmployeeManagementCtrl'
        })
        .state('riders', {
          url: '/riders',
          templateUrl: 'components/riders/RidersView.html',
          controller: 'RidersCtrl'
        })
        .state('chat', {
          url: '/chat',
          templateUrl: 'components/chat/ChatView.html',
          controller: 'ChatCtrl'
        })
        .state('routePlanning', {
          url: '/routes',
          templateUrl: 'components/routePlanning/RoutePlanningView.html',
          controller: 'RoutePlanningCtrl'
        })
        .state('editRun', {
          url: '/route/:routeId/:meridiem',
          templateUrl: 'components/routePlanning/EditRunView.html',
          controller: 'EditRunCtrl'
        })
        .state('interline', {
          url: '/interline/:multiRunId',
          templateUrl: 'components/routePlanning/interline/InterlineView.html',
          controller: 'InterlineCtrl'
        })
        .state('rolesAndPermissions', {
          url: '/roles-permissions',
          templateUrl: 'components/rolesAndPermissions/RolesAndPermissionsView.html',
          controller: 'RolesAndPermissionsCtrl'
        })
        .state('reservations', {
          url: '/reservations',
          templateUrl: 'components/reservations/ReservationsView.html',
          controller: 'ReservationsCtrl'
        })
        .state('ridership', {
          url: '/ridership',
          templateUrl: 'components/ridership/RidershipView.html',
          controller: 'RidershipCtrl'
        })
        .state('operatorManual',{
          url:'/operator-manual',
          onEnter: ["$window", function($window){
            $window.location.href = 'https://s3-us-west-1.amazonaws.com/ridepal/static/Operator-Manual.pdf'
          }]
        });
  }]);
