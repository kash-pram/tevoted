angular.module('rpOperatorApp')
  .controller('ReservationsCtrl', ["$scope", "ReservationsService","$window","ngToast",
    function($scope, ReservationsService, $window, ngToast) {
		'use strict';
		
		$scope.reservations = []
		$scope.newReservation = {}
		$scope.filters = {}
		$scope.selectedDates = []
		$scope.gettingReservations = false
		$scope.mode = 'Create'


		$scope.getReservations = function(filters){
			if(!_.isEmpty(filters)){
				$scope.gettingReservations = true
				ReservationsService.getReservations(filters).then(function(reservations){
					$scope.reservations = $scope.formatReservations(reservations)
					$scope.gettingReservations = false
				})	
			}
		}
		//$scope.getReservations()

		$scope.formatReservations = function(reservations){
			angular.forEach(reservations, function(reservation){
				reservation.local_ride_date = moment.parseZone(reservation.local_ride_date).format('YYYY-MM-DD')
			})
			return reservations
		}

		$scope.saveReservation = function(){
			var reservations = $scope.getReservationDataToSave();
			console.log(reservations)
			if(reservations.length > 0){

				// if only one, change from an array so POST could be switched to PUT if need be
				if(reservations.length === 1){
					reservations = reservations[0]
				}
				ReservationsService.saveReservation(reservations)
				.then(function(savedRecord){
					var message = _.isArray(savedRecord) ? 'Successfully created ' + savedRecord.length + ' reservations!' : 'Reservation created/edited!'
  				ngToast.create({
            className: 'success',
            content: message,
            additionalClasses: 'nga-default nga-fade-remove nga-slide-right-add nga-slide-right-move',
            timeout: 6000,
            dismissButton: true,
            animation: 'slide'
          });
					if(Object.keys($scope.filters).length > 0){
						$scope.getReservations($scope.filters)
					}
				}, function(err){
  				ngToast.create({
            className: 'danger',
            content: err.error_message.summary,
            additionalClasses: 'nga-default nga-fade-remove nga-slide-right-add nga-slide-right-move',
            timeout: 6000,
            dismissButton: true,
            animation: 'slide'
          });
				})				
			}
		}

		$scope.getReservationDataToSave = function(){
			// Get array of userIds and runTimelineIds
			var userIds = String($scope.newReservation.user_id).split(',').filter(function(v){return v !== ''}).map(function(v){return parseInt(v.trim())});
			var runTimelineIds = String($scope.newReservation.run_timeline_id).split(',').filter(function(v){return v !== ''}).map(function(v){return parseInt(v.trim())});
			var dataToSave = []
			var reservationToAdd = angular.copy($scope.newReservation)

			// if editing, date will be singlar and in YYYY-MM-DD format, change to x format and proceed
			if(_.isEmpty($scope.selectedDates)){
				$scope.selectedDates.push(moment($scope.newReservation.local_ride_date, 'YYYY-MM-DD').format('x'))
			}

			angular.forEach($scope.selectedDates, function(date){
				angular.forEach(userIds, function(userId){
					angular.forEach(runTimelineIds, function(runTimelineId){
						reservationToAdd.local_ride_date = moment(date, 'x').format('YYYY-MM-DD')
						reservationToAdd.user_id = userId
						reservationToAdd.run_timeline_id = runTimelineId
						dataToSave.push( angular.copy(reservationToAdd) )
					})
				})
			})
			

			return dataToSave
		}

		$scope.selectReservation = function(reservation){
			$scope.mode = 'Edit'
			$scope.selectedDates = []
			$scope.newReservation = angular.copy(reservation)
			delete $scope.newReservation.reservationEvents
			delete $scope.newReservation.updated_at
			delete $scope.newReservation.created_at
			$scope.newReservation.user_id = $scope.newReservation.user_id.id
			$scope.newReservation.run_timeline_id = $scope.newReservation.run_timeline_id.id
			$scope.newReservation.local_ride_date = moment($scope.newReservation.local_ride_date).format('YYYY-MM-DD')
			$("body").animate({scrollTop: 0});
		}

		$scope.clearReservation = function(){
			$scope.mode = 'Create'
			$scope.selectedDates = []
			$scope.newReservation = {}
		}

		$scope.filtersChanged = function(){
			// pick filters out empty object values
			$scope.getReservations(_.omit($scope.filters, _.isEmpty))
		}

}]);