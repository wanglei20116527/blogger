angular.module("Backend").controller("mainCtrol", [
	"$rootScope",
	"$location",
	"$window",
	"$scope",
	"$timeout",
	"Config",
	"Uuid",
	"User",
	"Directory",

	function (
			$rootScope,
			$location, 
			$window,
			$scope, 
			$timeout, 
			Config, 
			Uuid, 
			User, 
			Directory) {

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

		$scope.onViewLoaded = function () {
			updateActiveMenu("#!" + $location.path());
		};

		$scope.user = {};
		$scope.collapseMenuBar = false;
		$scope.msgQueue = [];

		$scope.menu = [
			{
				name: "Home",
				active: false,
				url: "#!/"
			},

			{
				name: "Article",
				active: false,
				url: "#!/article/list",
				hasSubMenu: true,
				subMeun: [
					{
						name: "All",
						active: false,
						url: "#!/article/list"
					},

					{
						name: "Writing",
						active: false,
						url: "#!/article/write"
					},

					{
						name: "Category",
						active: false,
						url: "#!/article/category"
					}
				]
			},

			{
				name: "Picture",
				active: false,
				url: "#!/picture"
			},

			{
				name: "Profile",
				active: false,
				url: "#!/profile/basic",
				hasSubMenu: true,
				subMeun: [
					{
						name: "Basic",
						active: false,
						url: "#!/profile/basic"
					},

					{
						name: "Password",
						active: false,
						url: "#!/profile/password"
					},

					{
						name: "photo",
						active: false,
						url: "#!/profile/photo"
					}
				]
			}
		];

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

		function updateActiveMenu (activeUrl) {
			var menu = $scope.menu;
			
			for (var i = 0, ii = menu.length; i < ii; ++i) {
				var menuItem   = menu[i];
				var hasSubMenu = menuItem.hasSubMenu;

				if (hasSubMenu) {
					var subMeun = menuItem.subMeun;
					var active  = false;

					for (var j = 0, jj = subMeun.length; j < jj; ++j) {
						var subMeunItem = subMeun[j];
						
						if (subMeunItem.url === activeUrl) {
							active = true;
							subMeunItem.active = true;
							
						} else {
							subMeunItem.active = false;
						}
					}

					menuItem.active = active;
				} else {
					menuItem.active = menuItem.url === activeUrl;
				}
			}
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