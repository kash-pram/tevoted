'use strict';

angular.module('rpOperatorApp')
.config(["uiGmapGoogleMapApiProvider", function(uiGmapGoogleMapApiProvider){
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyDyly0johlyra0xKVN6roijZ54IlKTsLiU',
        v: '3.24', //defaults to latest 3.X anyhow
        libraries: 'geometry,places'
    });
}]);