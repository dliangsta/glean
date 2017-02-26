angular.module('glean')
  .controller('ReceiveController', function($scope) {
    document.glean.then(function(glean) {
      $scope.selectedOrg = {};    
      glean.getLocationsOfUser(
          glean.auth.currentUser.ID,
          false /* Return shelters, not restaurants. */,
          function(orgs) { 
            $scope.orgs = [];
            orgs.forEach(function(orgKey) {
              glean.getByKey(orgKey, function(org) {
                $scope.orgs.push(org);
                $scope.$apply();
              });
            });
          });
      $scope.delivs = [];
      $scope.loadDelivs = function() {
        glean.getDeliveriesForShelter($scope.selectedOrg.ID, function(delivs) {
          console.log($scope.selectedOrg.ID);
          for (var idx in delivs) {
            var deliv = delivs[idx].obj;
            glean.getById(deliv.offerID, function(offer) {
              glean.getById(offer.restaurantID, function(rst) {
                deliv.restaurantName = rst.name;
              });
              deliv.description = offer.description;
              deliv.quantity = offer.quantity
              deliv.notes = offer.notes;
            });
            $scope.delivs.push(deliv);
            $scope.$apply();
          }
        });
      };
      $scope.$apply();
    });
  });