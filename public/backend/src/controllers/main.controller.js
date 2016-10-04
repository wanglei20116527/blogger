angular.module("Backend").controller("mainCtrol", [
	"$scope",
	"User",
	function ($scope, User) {
		$scope.user = {};
		$scope.collapseMenuBar = false;

		$scope.logout = function () {
		};

		$scope.toogleMenuBar = function () {
			$scope.collapseMenuBar = !$scope.collapseMenuBar;
		};

		init();

		function init () {
			$scope.collapseMenuBar = false;

			User.get().then(function (user) {
				$scope.user = user;
				console.log(user);
			}).catch(function (err) {
				console.error(err);
			});
		}
	}
]);