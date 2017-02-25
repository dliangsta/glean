angular.module('glean')
  .controller('RegisterController', function($scope) {
    // TODO: Use live data.
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
      console.log('submitting.');
       window.glean.registerLocation(
        $scope.restaurantName, $scope.type, $scope.chainName, $scope.contact, $scope.street, $scope.street2, $scope.city, $scope.state, $scope.phone, $scope.notes
      )
    };
  });