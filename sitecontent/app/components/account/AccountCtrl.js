'use strict';

angular.module('rpOperatorApp')
  .controller('AccountCtrl', ["$scope", "AccountService", "Session",
	function($scope,AccountService,Session) {

		$scope.me = Session.user


}])