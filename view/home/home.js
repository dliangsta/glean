angular.module('glean')
  .controller('HomeController', function($scope) {
    document.glean.then(function(glean) {
      if (glean.auth.currentUser) {
        $scope.message = 'Welcome back, ' + glean.auth.currentUser.displayName + '!';
      } else {
        $scope.message = 'Please sign in to do stuff.';
      }
      $scope.$apply();
    });
  });