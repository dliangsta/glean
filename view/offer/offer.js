angular.module('glean')
  .controller('OfferController', function($scope) {
    document.glean.then(function(glean) {
      glean.getLocationsOfUser(
          glean.auth.currentUser.ID,
          false /* Return shelters, not restaurants. */,
          function(restaurants) {
            $scope.restaurants = [];
            restaurants.forEach(function(rstKey) {
              glean.getByKey(rstKey, function(restaurant) {
                $scope.restaurants.push(restaurant);
                $scope.$apply();
              }); 
            });
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
        glean.createOffer(
            $scope.selectedRestaurant.id,
            $scope.description,
            $scope.quantity,
            $scope.notes);
      };
      $scope.$apply();
    });
  });