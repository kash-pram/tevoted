'use strict';

angular.module('rpOperatorApp')
	.directive('slideDownContent', ["$timeout", function ($timeout) {
		return {
			restrict: 'E',
			transclude: true,
			template: 
				'<div class="top-slide-menu">' +
					'<div class="collapse-menu-bar" ng-class="{\'with-border\':!isExpanded}">' +
						'<h1>All Interlines</h1>' +
						'<div class="collapse-toggle" ng-click="isExpanded = !isExpanded">' +
							'<i class="fa" ng-class="isExpanded ? \'fa-angle-up\' : \'fa-angle-down\'"></i>' +
						'</div>' +
					'</div>' +
					'<div class="top-slide-content" uib-collapse="!isExpanded">' +
						'<div class="top-slide-inner-content" ng-transclude>' +
						'</div>' +
					'</div>' +
					'<div class="just-border">' +
					'</div>' +
				'</div>',
			scope:{
				title: '@',
				expanded: '=?'
			},
			link: function(scope){
				if(angular.isDefined(scope.expanded) || scope.expanded == true){
					scope.isExpanded = false;
					// Delayed to show animation of content sliding in
					$timeout(function(){
						scope.isExpanded = true
					},500)	
				}else{
					scope.isExpanded = false;
				}
			}
		};
}]);