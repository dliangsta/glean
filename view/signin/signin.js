angular.module('glean')
  .controller('SignInController', ['$scope', '$location', function($scope, $location) {
    $scope.email = '';
    $scope.password = '';
    
    $scope.error = '';

    $scope.signIn = function() {
      document.glean.then(function(glean) {
        if (!email || !password) {
          $scope.error = 'Please enter your email and password.';
        }
        glean.signIn($scope.email, $scope.password);
        $location.url('/');
        $scope.$apply();
      });
    };

    $scope.signInWithGoogle = function() {
      document.glean.then(function(glean) { 
        glean.signIn();
        $location.url('/');
        $scope.$apply();
      });
    };
  }]);