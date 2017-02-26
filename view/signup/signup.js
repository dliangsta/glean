angular.module('glean')
  .controller('SignUpController', ['$scope', '$location', function($scope, $location) {
    $scope.firstName = '';
    $scope.lastName = '';
    $scope.email = '';
    $scope.phone = '';
    $scope.username = '';
    $scope.password = '';
    $scope.rpassword = '';

    $scope.error = '';

    document.glean.then(function(glean) {
      $scope.submit = function() {
        if (!$scope.firstName
            || !$scope.lastName
            || !$scope.email
            || !$scope.username
            || !$scope.password
            || !$scope.password) {
          $scope.error = 'Please fill in all fields!';
        } else if ($scope.password != $scope.rpassword) {
          $scope.error = 'Password entries do not match!';
        }
        glean.registerUser(
            $scope.username,
            $scope.firstName,
            $scope.lastName,
            '' /* Role? */,
            $scope.email,
            $scope.phone,
            null,
            null);
      };
    });
  }]);