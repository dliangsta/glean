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
      })
      .when('/register/', {
        templateUrl: 'view/register/register.html',
        controller: 'RegisterController'
      });
  })
  .controller('NavController', function($scope) {
    $scope.loginText = document.glean.auth.currentUser ? 'Sign Out' : 'Sign In';
    $scope.toggleSignIn = function() {
      if (document.glean.auth.currentUser) {
        document.glean.signOut();
        $scope.loginText = 'Sign in';
      } else {
        document.glean.signIn();
        $scope.loginText = 'Sign out';
      }
    };
  });