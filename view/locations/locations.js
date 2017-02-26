angular.module('glean')
  .controller('LocationsController', function($scope) {
    document.glean.then(function(glean) {
      $scope.restaurantName = '';
      $scope.type = '';
      $scope.chain = '';
      $scope.street = '';
      $scope.street2 = '';
      $scope.city = '';
      $scope.state = '';
      $scope.phone = 0;
      $scope.notes = '';
      $scope.contact = '';
      $scope.shelterLocation = '';

      $scope.submit = function() {
        glean.registerLocation(
          $scope.restaurantName,
          $scope.type,
          $scope.chain,
          $scope.contact,
          $scope.street,
          $scope.street2,
          $scope.city,
          $scope.state,
          $scope.phone,
          $scope.notes);
      };
    });
  });