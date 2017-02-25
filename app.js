'use strict';

angular.module('glean', ['ngRoute'])
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'view/home/home.html',
        controller: 'HomeController'
      })
      .when('/distribute/', {
        templateUrl: 'view/distribute/distribute.html',
        controller: 'DistributeController'
      })
      .when('/receive/', {
        templateUrl: 'view/receive/receive.html',
        controller: 'ReceiveController'
      })
      .when('/register/', {
        templateUrl: 'view/register/register.html',
        controller: 'RegisterController'
      })
      .when('/login/', {
        templateUrl: 'view/login/login.html',
        controller: 'LoginController'
      })
      .when('/test/', {
        templateUrl: 'view/test/test.html'
      });
  });