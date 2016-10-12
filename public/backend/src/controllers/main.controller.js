angular.module("Backend").controller("mainCtrol", [
	"$rootScope",
	"$scope",
	"User",
	function ($rootScope, $scope, User) {
		$rootScope.$on("pageChanged", function (event, args) {
			$scope.activePage = args.page;
		});

		$scope.user = {};
		$scope.activePage = "index";
		$scope.collapseMenuBar = false;

		$scope.logout = function () {
			User.logout().then(function(){
				// todo redirct to login page 
				// or other things
			}).catch(function(err){
				console.error(err);
			});
		};

		$scope.toogleMenuBar = function () {
			$scope.collapseMenuBar = !$scope.collapseMenuBar;
		};

		init();

		function init () {
			$scope.collapseMenuBar = false;

			User.get().then(function (user) {
				$scope.user = user;
			}).catch(function (err) {
				console.error(err);
			});
		}
	}
]);