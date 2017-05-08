'use strict';

angular.module('rpOperatorApp')
  .directive('ngAutocomplete', ["$timeout", "$rootScope", "uiGmapGoogleMapApi", function ($timeout, $rootScope, uiGmapGoogleMapApi) {
    return {
      require: 'ngModel',
      scope: {
        ngModel: '=model',
        options: '=?',
        details: '=?',
        executeFunction: '&'
      },

      link: function(scope, element, attrs, controller) {
        uiGmapGoogleMapApi.then(function(maps) {

          //options for autocomplete
          var opts
          var watchEnter = false
          //convert options provided to opts
          var initOpts = function() {

            opts = {}
            if (scope.options) {

              if (scope.options.watchEnter !== true) {
                watchEnter = false
              } else {
                watchEnter = true
              }

              if (scope.options.types) {
                opts.types = []
                opts.types.push(scope.options.types)
                scope.gPlace.setTypes(opts.types)
              } else {
                scope.gPlace.setTypes([])
              }

              if (scope.options.bounds) {
                opts.bounds = scope.options.bounds
                scope.gPlace.setBounds(opts.bounds)
              } else {
                scope.gPlace.setBounds(null)
              }

              if (scope.options.country) {
                opts.componentRestrictions = {
                  country: scope.options.country
                }
                scope.gPlace.setComponentRestrictions(opts.componentRestrictions)
              } else {
                scope.gPlace.setComponentRestrictions(null)
              }
            }
          }

          if (scope.gPlace == undefined) {
            scope.gPlace = new google.maps.places.Autocomplete(element[0], {});
          }
          google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
            var result = scope.gPlace.getPlace();

            setData(result);
            
          })
          var setData = function(result){
          		if (result !== undefined) {
  		            if (result.address_components !== undefined) {

  		              scope.$apply(function() {

  		                scope.details = result;
  		                

  		                controller.$setViewValue(element.val());
  		              });
  		            }
  		            else {
  		              if (watchEnter) {
  		                getPlace(result)
  		              }
  		              else{
  		              }
  		            }
  		        }
  		        else{
  		        	setData(result);
  		        }
              scope.executeFunction();
          }
          //function to get retrieve the autocompletes first result using the AutocompleteService 
          var getPlace = function(result) {
            var autocompleteService = new google.maps.places.AutocompleteService();
            if (result.name.length > 0){
              autocompleteService.getPlacePredictions(
                {
                  input: angular.copy(result.name),
                  offset: result.name.length
                },
                function listentoresult(list, status) {
                  if(list == null || list.length == 0) {

                    scope.$apply(function() {
                      // scope.details = null;
                      controller.$viewValue = list.description
                    });

                  } else {
                    var placesService = new google.maps.places.PlacesService(element[0]);
                    placesService.getDetails(
                      {'reference': list[0].reference},
                      function detailsresult(detailsResult, placesServiceStatus) {

                        if (placesServiceStatus == google.maps.GeocoderStatus.OK) {
                          scope.$apply(function() {

                            controller.$viewValue = detailsResult.formatted_address;
                            element.val(detailsResult.formatted_address);

                            scope.details = detailsResult;

                            //on focusout the value reverts, need to set it again.
                            var watchFocusOut = element.on('focusout', function(event) {
                              // element.val(detailsResult.formatted_address);
                              // element.unbind('focusout')
                              controller.$viewValue = detailsResult.formatted_address;
                            })

                          });
                        }
                      }
                    );
                  }
                });
            }
          }

          controller.$render = function () {
            var location = controller.$viewValue;
            element.val(location);
          };

          //watch options provided to directive
          scope.watchOptions = function () {
            return scope.options
          };
          scope.$watch(scope.watchOptions, function () {
            initOpts()
          }, true);
        });

      }
    };
  }]);