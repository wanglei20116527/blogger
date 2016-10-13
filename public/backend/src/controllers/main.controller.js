angular.module("Backend").controller("mainCtrol", [
	"$rootScope",
	"$scope",
	"$timeout",
	"Config",
	"Uuid",
	"User",

	function ($rootScope, $scope, $timeout, Config, Uuid, User) {
		$scope.user = {};
		$scope.activePage = "index";
		$scope.collapseMenuBar = false;
		$scope.msgQueue = [];

		$rootScope.$on("message", function (event, msg) {
			var msgObj = null;

			switch (msg.type) {
				case Config.MESSAGE.ERROR:
					msgObj = {
						id  : Uuid.getUuid(), 
						type: msg.type,
						msg : msg.msg,
						cls : "error",
						icon: "&#xe699;"
					}
					break;

				case Config.MESSAGE.SUCCESS:
					msgObj = {
						id  : Uuid.getUuid(),
						type: msg.type,
						msg : msg.msg,
						cls : "success",
						icon: "&#xe615;"
					}
					break;
			}

			msgObj && dispatchMessage(msgObj);
		});

		$rootScope.$on("userUpdate", function () {
			updateUser();
		});

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

			updateUser();
		}

		function updateUser () {
			User.get().then(function (user) {
				$scope.user = user;
			}).catch(function (err) {
				console.error(err);
			});
		}

		function dispatchMessage (msg) {
			$scope.msgQueue.push(msg);
				
			$timeout(function () {
				for (var i = 0, len = $scope.msgQueue.length; i < len; ++i) {
					if (msg.id === $scope.msgQueue[i].id) {
						$scope.msgQueue.splice(i, 1);
						break;
					}
				}
			}, 1000);
		}
	}
]);