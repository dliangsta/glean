angular.module('glean')
  .controller('ReceiveController', function($scope) {
    $scope.selectedOrg = {};    
    document.glean.getLocationsOfUser(
        document.glean.auth.currentUser.ID,
        true /* Return restaurants, not shelters. */,
        function(orgs) { 
          $scope.orgs = [];
          orgs.forEach(function(orgKey) {
            document.glean.getByKey(orgKey, function(org) {
              console.log(org);
              $scope.orgs.push(org);
              $scope.$apply();
            });
          });
        });
    $scope.offers = [];
    $scope.loadOffers = function() {
      
    };
  });