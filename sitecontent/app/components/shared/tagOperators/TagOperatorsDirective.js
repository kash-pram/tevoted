'use strict';

angular.module('rpOperatorApp')
.directive('stTagOperators', [function() {
      return {
        restrict: 'E',
        require: '^stTable',
        scope: {
          collection: '=',
          fields: '=',
          advancedFilters: '='
        },
        templateUrl: '/components/shared/tagOperators/TagOperatorsView.html',
        link: function(scope, element, attr, table) {
        	scope.filters = {
        		addAdvanced: [],
        		advancedFilters: []
        	}
        	scope.errors = false;
          	scope.operators = [
			    'equals',
			    'contains',
			    'begins with',
			    'ends with',
			    'less than',
			    'greater than'
			];

			scope.addAdvancedFilter = function(){
				scope.errors = false;
		    	if(!scope.filters.addAdvanced || !scope.filters.addAdvanced.key  || !scope.filters.addAdvanced.operator){
		    		scope.errors = true;
		    		return;
		    	}
		    	var advancedFilter = {};
		    	angular.extend(advancedFilter, scope.filters.addAdvanced, scope.filters.addAdvanced.key, scope.filters.addAdvanced.operator);
		    	scope.filters.advancedFilters.push(advancedFilter);
		    	scope.filters.addAdvanced = {};
		    	scope.update();
		    }

		    scope.removeAdvancedFilter = function(index){
		    	scope.filters.advancedFilters.splice(index,1);
		    	scope.update();
		    }

		    scope.update = function(){
		    	var query = {};
		    	query.expressions = angular.copy(scope.filters.advancedFilters);
	    		table.search(query,'advanced');
		    }
        } 
      }
}])
.filter('customFilter', ['$filter', function($filter) {
  var filterFilter = $filter('filter');
  var standardComparator = function standardComparator(obj, text) {
    text = ('' + text).toLowerCase();
    return ('' + obj).toLowerCase().indexOf(text) > -1;
  };

  return function customFilter(array, expression) {
	var operators = {
	    'equals': function(a, b) { return st(a) == st(b) },
	    'contains': function(a,b) { return (st(a,true).indexOf(st(b,true)) > -1) },
	    'begins with': function(a,b) { return (st(a,true).indexOf(st(b,true)) == 0) },
	    'ends with': function(a,b) { return (st(a,true).indexOf(st(b,true), st(a,true).length - st(b,true).length) !== -1) },
	    'less than': function(a, b) { return st(a) < st(b) },
	    'greater than': function(a, b) { return st(a) > st(b) },
	};

	var st = function (item,stringify){
		if(stringify)
			item = String(item);
		if(typeof item == "string")
			return item.toLowerCase();
		if(!isNaN(item))
			return parseInt(item,10);
		return item
	}

	var filtered = [];

  	angular.forEach(array, function(value){
  		var add = true;
		for (var i = 0; i < expression.advanced.expressions.length; i++) {
			// This line is a doosie. It takes uses the "operator" as a key for the function. Operators -> function map is above.
			if( !( operators[expression.advanced.expressions[i].operator](
					value[expression.advanced.expressions[i].fieldValue],
					expression.advanced.expressions[i].value ) 
				) ){
				add = false;
				break;
			}
		};
		if(add)
			filtered.push(value);
  	})

    return filtered;
  };
}])