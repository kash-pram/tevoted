'use strict';

angular.module('rpOperatorApp')
  .controller('404Ctrl', ["$scope", 
	function($scope) {
		$.getScript("/assets/js/404game.js", function(){});

		$scope.playTime = function(){
			$scope.play = true;
			draw();
		}

  }]);
