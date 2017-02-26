angular.module('glean')
   .controller('AboutController', function ($scope) {
      document.glean.then(function (glean) {
         $scope.$apply();
      });
   });