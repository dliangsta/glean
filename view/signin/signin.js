angular.module('glean')
  .controller('SignInController', function($scope) {
    $scope.email = '';
    $scope.password = '';
    
    $scope.error = '';

    $scope.signIn = function() {
      document.glean.then(function(glean) {
        if (!email || !password) {
          $scope.error = 'Please enter your email and password.';
        }
        glean.signIn($scope.email, $scope.password);
      });
    };

    $scope.signInWithGoogle = function() {
      document.glean.then(function(glean) { glean.signIn(); });
    }
  });