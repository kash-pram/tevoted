'use strict';

angular.module('rpOperatorApp')
.service('APIInterceptor', ["$rootScope", "ngToast", "$q","Session", "$injector",
    function($rootScope, ngToast, $q, Session, $injector) {
        var service = this;

        service.request = function(request){
            if (Session.token && (request.url.indexOf($rootScope.endpoint) > -1 || request.url.indexOf($rootScope.newEndpoint) > -1) ) {
                request.headers.Authorization = service.getAuthorizationHeaderString();
            }
            return $q.resolve(request);
        }

        service.getAuthorizationHeaderString = function(){
            var authArray = []
            authArray.push(Session.token);
            if( angular.isDefined($rootScope.context) && $rootScope.context ){
                if( angular.isDefined($rootScope.context.contextType) ) authArray.push($rootScope.context.contextType);
                if( angular.isDefined($rootScope.context.contextId) ) authArray.push($rootScope.context.contextId);
                if( angular.isDefined($rootScope.context.name) ) authArray.push($rootScope.context.name);
            }
            return authArray.join(',');
        }

        service.spoofContext = function(token){
            if(false){
                return token + "," 
            }
            console.log($rootScope.context)

        }

        service.responseError = function(rejection) {
            if(angular.isDefined(rejection.data) && rejection.data && angular.isDefined(rejection.data.messages)){
                var messages = rejection.data.messages;
            }else{
                var messages = [];
            }

            // if error in old format, convert to new format
            if(angular.isDefined(rejection.message)){
                messages.push(rejection.message);
            }

            // 2nd possible old format
            if(angular.isDefined(rejection.data) && rejection.data && angular.isDefined(rejection.data.message)){
                messages.push(rejection.data.message);
            }
            
            angular.forEach(messages, function(errorMessage){
                if(!errorMessage) return; //for blanks
                ngToast.create({
                    className: 'danger',
                    content: errorMessage,
                    additionalClasses: 'nga-default nga-fade-remove nga-slide-right-add nga-slide-right-move',
                    timeout: 6000,
                    dismissButton: true,
                    animation: 'slide'
                });
                service.redirectToLoginIfNotAuthorized(errorMessage);
            });

            if(messages.length == 0){
                console.log(rejection)
                if(rejection.status == -1){
                    service.spitOutWhoopsError();
                }
            }
            if(rejection.status == 401){
                $injector.get('$state').go( 'login' );
            }

            return $q.reject(rejection);;
        }

        service.spitOutWhoopsError = function(){
            ngToast.create({
                className: 'danger',
                additionalClasses: 'nga-default nga-fade-remove nga-slide-right-add nga-slide-right-move',
                content: 'Whoops, looks like something went wrong.',
                timeout: 6000,
                dismissButton: true
            });
        }
            

        service.redirectToLoginIfNotAuthorized = function(message){
            if(message == "You're not authorized to perform this operation"){
                $injector.get('$state').go( 'login' );
            }
        }
}]);