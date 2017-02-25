angular.module('glean')
  .controller('OfferController', function($scope) {
    // TODO: Use live data.
    $scope.restaurants = [{name:'McDonalds on Hwy 59', id:1},
                          {name:'McDonalds by Regent', id:2},
                          {name:'Burger King', id:3}];

    $scope.selectedRestaurant = {};
    $scope.description = '';
    $scope.mealCount = 1;
    $scope.notes = '';

    $scope.submit = function() {
      console.log('submitting.');
    };
  });