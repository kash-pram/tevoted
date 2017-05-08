'use strict';

angular.module('rpOperatorApp')
	.directive('slideInContent', ["$timeout", function ($timeout) {
		return {
			restrict: 'E',
			transclude: true,
			template: '<div class="slide-in-container animated fadeIn" ng-class="expanded ? \'shown\' : \'\'"><div class="slide-in-content" ng-transclude></div>'+
			'<div class="btn btn-primary slide-content-toggle" ng-click="expanded = !expanded">'+
			'<i class="fa fa-angle-double-right" ng-class="{\'fa-angle-double-left\':!expanded,\'fa-angle-double-right\':expanded}"></i> {{::buttonText}}</div></div>',
			scope:{
				buttonText: '@',
				expanded: '=?'
			},
			link: function(scope){
				if(!angular.isDefined(scope.expanded) || scope.expanded == true){
					scope.expanded = false;
					// Delayed to show animation of content sliding in
					$timeout(function(){
						scope.expanded = true
					},500)	
				}


				if(!angular.isDefined(scope.expanded) || scope.expanded == null)
					scope.expanded = false;

				
			}
		};
}]);