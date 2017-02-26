'use strict';

angular.module('glean')
  .controller('TestUserController', function ($scope) {
    $scope.username = '';
    $scope.firstName = '';
    $scope.lastName = '';
    $scope.role = '';
    $scope.email = '';
    $scope.phone = '';
    $scope.submit = function () {
      console.log('Registering user!');
      window.glean.registerUser(
        $scope.username, $scope.firstName, $scope.lastName, $scope.role, $scope.email, $scope.phone, null, null
      )
    }.bind(this);
  })
  .controller('TestLocationController', function ($scope) {
    $scope.restaurantName = '';
    $scope.type = '';
    $scope.chainName = '';
    $scope.contact = '';
    $scope.street = '';
    $scope.street2 = '';
    $scope.city = '';
    $scope.state = '';
    $scope.phone = 0;
    $scope.notes = '';
    $scope.submit = function () {
      console.log('Registering location!');
      window.glean.registerLocation(
        $scope.restaurantName, $scope.type, $scope.chainName, $scope.street, $scope.street2, $scope.city, $scope.state, $scope.phone, $scope.notes
      )
    }.bind(this);
  })
  .controller('TestOfferController', function ($scope) {
    $scope.restaurant = '';
    $scope.description = '';
    $scope.quantity = 0;
    $scope.notes = '';
    $scope.submit = function () {
      console.log('Registering offer!');
      window.glean.createOffer(
        $scope.restaurant, $scope.description, $scope.quantity, $scope.notes
      )
    }.bind(this);
  })
  .controller('TestDeliveryController', function ($scope) {
    $scope.offer = '';
    $scope.driver = '';
    $scope.shelter = '';
    $scope.submit = function () {
      console.log('Registering delivery!');
      window.glean.createDelivery(
        $scope.offer, $scope.driver, $scope.shelter
      )
    }.bind(this);
  })