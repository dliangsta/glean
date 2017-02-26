angular.module('glean')
  .controller('ReceiveController', function($scope) {
    console.log('Constructing...');
    document.glean.then(function(glean) {
      console.log('Got into the promised land...');
      $scope.selectedOrg = {};    
      glean.getLocationsOfUser(
          glean.auth.currentUser.ID,
          true /* Return restaurants, not shelters. */,
          function(orgs) { 
            console.log(orgs);
            $scope.orgs = [];
            orgs.forEach(function(orgKey) {
              glean.getByKey(orgKey, function(org) {
                console.log(org);
                $scope.orgs.push(org);
                $scope.$apply();
              });
            });
          });
      $scope.offers = [];
      $scope.loadOffers = function() {
      };
      $scope.$apply();
    });
  });