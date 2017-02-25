angular.module('glean')
  .controller('OfferController', function($scope) {
    document.glean.getLocationsOfUser(
        document.glean.auth.currentUser.ID,
        true /* Return restaurants, not shelters*/,
        function(restaurants) { 
          console.log('Got ' + restaurants);
          $scope.restaurants = restaurants;
        });

    $scope.selectedRestaurant = {};
    $scope.description = '';
    $scope.quantity = 0;
    $scope.notes = '';

    $scope.error = '';

    $scope.submit = function() {
      if (!$scope.description) {
        $scope.error = 'Please provide a description!';
        return;
      } else if ($scope.quantity <= 0) {
        $scope.error = 'Number of people fed must be a positive number!';
        return;
      }
      document.glean.createOffer(
          $scope.selectedRestaurant.id,
          $scope.description,
          $scope.quantity,
          $scope.notes);
    };
  });