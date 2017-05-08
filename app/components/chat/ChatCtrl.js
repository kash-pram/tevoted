
angular.module('rpOperatorApp')
  .controller('ChatCtrl', ["$scope", "$http","$timeout","$q","$rootScope","$sails","Session",
	function($scope, $http, $timeout, $q, $rootScope, $sails, Session) {
	'use strict';

		$scope.sendMessage = function(){
			if($scope.message && $scope.runId){
				$scope.postMessage({
					message:$scope.message,
					run_id: $scope.runId
				})
			}else{
				alert('need more info')
			}
		}

		$scope.subscribeToRunsChats = function(runId){
			$sails.get('/run/'+runId+'/chat?token='+Session.token)
				.success(function(res){
    			console.log(res)
    			$scope.allMessages = res
    		})
    		.error(function(err, status){
    			console.log('U MAD BRO???')
    		})
		}

/*		$sails.on('connect', function(){
			$scope.subscribeToRunsChats(444)
		})*/

		$sails.on("runtimeline", function(newMessage){
			if(newMessage.verb == 'messaged'){
				$scope.allMessages.push(newMessage.data)
			}
		})

		$scope.postMessage = function(messageObj){
			var defer = $q.defer();
    	$sails.post("/run/"+messageObj.run_id+"/chat?token="+Session.token, messageObj)
    		.success(function(res){
    			console.log(res)
    			$scope.allMessages = res.chat
    		})
    		.error(function(err, status){
    			console.log('Ahhh snap')
    		})
      return defer.promise;
		}
		



}])