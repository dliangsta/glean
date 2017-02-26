angular.module('glean')
  .controller('SignUpController', ['$scope', '$location', function($scope, $location) {
    $scope.firstName = '';
    $scope.lastName = '';
    $scope.email = '';
    $scope.password = '';
    $scope.rpassword = '';

    $scope.error = '';

    $scope.submit = function() {
      if (!$scope.firstName || !$scope.lastName || !$scope.email || !$scope.password || !$scope.password) {
        $scope.error = 'Please fill in all fields!';
      } else if ($scope.password != $scope.rpassword) {
        $scope.error = 'Password entries do not match!';
      }
      console.log('Submitting...');
      $location.replace('/');
    };
  }]);