angular.module('glean')
  .controller('ReceiveController', function($scope) {
    document.glean.then(function(glean) {
      glean.getLocationsOfUser(
          glean.ID,
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
      $scope.loadDelivs = function() {
        $scope.delivs = [];
        glean.getDeliveriesForShelter($scope.selectedOrg.ID, function(delivs) {
          for (var idx in delivs) {
            var deliv = delivs[idx].obj;
            glean.getByID(deliv.offerID, function(offer) {
              glean.getByID(offer.restaurantID, function(rst) {
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
    });
  });