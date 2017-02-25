angular.module('glean')
  .controller('ReceiveController', function($scope) {
    $scope.orgs = [{name:'Shelter 1'}, {name:'Shelter 2'}];
    $scope.deliveries = [{restaurantID:'McDonlads', description:'Ten big macs', quantity:10, notes:'We like big macs'}];
  });