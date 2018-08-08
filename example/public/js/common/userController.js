/*global app:false */
'use strict'

app.controller('UserLoginCtrl', [
  '$rootScope',
  '$scope',
  '$routeParams',
  '$location',
  function($rootScope, $scope, $routeParams, $location) {}
])

app.controller('UserSignUpCtrl', [
  '$rootScope',
  '$scope',
  '$routeParams',
  '$location',
  function($rootScope, $scope, $routeParams, $location) {}
])

app.service('UserService', [
  '$http',
  function($http) {
    return {
      removeAccount: function() {
        $http({ method: 'DELETE', url: '/account' })
          .success(function() {
            window.location = '/'
          })
          .error(function(data) {
            console.log('Error occured', data)
          })
      }
    }
  }
])
