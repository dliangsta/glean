angular.module('glean')
  .controller('TestRestaurantController', function($scope) {
    $scope.rid = 0;
    $scope.mid = 0;
    $scope.address = "";
    $scope.phone = 0;
    $scope.notes = "";
    $scope.submit = function() { console.log('Submitting!'); }.bind(this);
  })
  .controller('TestOfferController', function($scope) {
    $scope.rid = 0;
    $scope.description = "";
    $scope.peopleServed = 0;
    $scope.submit = function() { console.log('Submitting!'); }.bind(this);
  })
  .controller('TestUserController', function($scope) {
    $scope.userID = 0;
    $scope.firstName = "";
    $scope.lastName = "";
    $scope.email = "";
    $scope.submit = function() { console.log('Submitting!'); }.bind(this);
  });