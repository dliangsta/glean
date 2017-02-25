'use strict';

angular.module('glean', ['ngRoute'])
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'view/home/home.html',
        controller: 'HomeController'
      })
      .when('/offer/', {
        templateUrl: 'view/offer/offer.html',
        controller: 'OfferController'
      })
      .when('/receive/', {
        templateUrl: 'view/receive/receive.html',
        controller: 'ReceiveController'
      })
      .when('/locations/', {
        templateUrl: 'view/locations/locations.html',
        controller: 'LocationsController'
      })
      .when('/login/', {
        templateUrl: 'view/login/login.html',
        controller: 'LoginController'
      })
      .when('/test/', {
        templateUrl: 'view/test/test.html'
      });
  })
  .controller('NavController', function($scope) {
    $scope.loginText = 'Sign In';
    $scope.toggleSignIn = function() {
      if (window.glean.auth.currentUser) {
        window.glean.signOut();
        $scope.loginText = 'Sign in';
      } else {
        window.glean.signIn();
        $scope.loginText = 'Sign out';
      }
    };
  });