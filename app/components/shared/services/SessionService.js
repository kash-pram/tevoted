'use strict';

angular.module('rpOperatorApp')
	.service('Session', ["localStorageService","$q", function (localStorageService,$q) {
	  this.create = function (token, userData, authorizations) {
	    this.token = token;
	    this.user = userData;
	    localStorageService.set('token', token);
	    localStorageService.set('user', userData);
	  };
	  this.destroy = function () {
	    this.token = null;
	    this.user = null;
	    this.authorizations = null;
	    localStorageService.remove('token', 'user');
	  };
	  this.reestablish = function(){
	  	if(localStorageService.get('token') && localStorageService.get('user') ){
	  		this.create(
	  			localStorageService.get('token'),
	  			localStorageService.get('user') 
  			);
	  		return true;
  		}else{
  			return false;
  		}
	  }
	  this.getToken = function(){
	  	if(this.token)
	  		return this.token
	  	return false;
	  }
	  
	  this.storeAuthorizations = function(authorizations){
	  	var defer = $q.defer()
	  	defer.resolve( localStorageService.set('authorizations', authorizations) )
	  	return defer.promise;
	  }
	  this.getAuthorizations = function(){
	  	return localStorageService.get('authorizations')
	  }
	  this.removeAuthorizations = function(){
	  	localStorageService.remove('authorizations')
	  }
	  this.setSelectedRole = function(role){
	  	localStorageService.set('selectedRole',role)
	  }
	  this.getSelectedRole = function(role){
	  	return localStorageService.get('selectedRole')
	  }
	  this.removeSelectedRole = function(){
	  	localStorageService.remove('selectedRole')
	  }
	}]);