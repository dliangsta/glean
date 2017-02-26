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
      .when('/signin/', {
        templateUrl: 'view/signin/signin.html',
        controller: 'SignInController'
      })
      .when('/signup/', {
        templateUrl: 'view/signup/signup.html',
        controller: 'SignUpController'
      })
      .when('/test/', {
        templateUrl: 'view/test/test.html'
      })
  })
  .controller('NavController', function($scope) {
    document.glean.then(function(glean) {
      $scope.loginText = glean.auth.currentUser ? 'Sign out' : 'Sign in';
      $scope.toggleSignIn = function() {
        if (glean.signedIn()) {
          glean.signOut();
          $scope.loginText = 'Sign in';
        } else {
          
        }
      };
    });

    $scope.activeEl = $('.active')[0];
    $scope.onNav = function($event) {
      // TODO: Why doesn't this update the dom?
      $event.toElement.className = 'active';
      $scope.activeEl.className = '';
      $scope.activeEl = $event.toElement;
    };
  });