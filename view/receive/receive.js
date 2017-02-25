angular.module('glean')
  .controller('ReceiveController', function($scope) {
    document.glean.getLocationsOfUser(
        document.glean.auth.currentUser.ID,
        true /* Return restaurants, not shelters. */,
        function(orgs) { 
          console.log('Got ' + orgs);
          $scope.orgs = orgs;
        });
    $scope.loadOffers = function() {
      document.glean.get
    };
  });