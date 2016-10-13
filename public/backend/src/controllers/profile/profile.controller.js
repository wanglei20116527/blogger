angular.module("Backend").controller("profileCtrl", [
	"$rootScope",
	"$scope",
	"$q",
	"$timeout",
	"$window",
	"Config",
	"User",
	function ($rootScope, $scope, $q, $timeout, $window, Config, User) {
		$rootScope.$emit("pageChanged", {
			page: "profile",
		});

		$scope.loading = true;

		$scope.uploadPhotoDialog = {
			show : false,
			image: null,
			cancel: function () {
				this.show  = !this.show;
				this.image = null;
			},

			confirm: function (image) {
				this.show  = !this.show;
				this.image = null;
				
				$scope.user.photo = image;

				$rootScope.$emit("userUpdate");
			},
		};

		$scope.user  = {};

		$scope.onImageSelect = function (event) {
			var self = this;
			var file = this.files[0];

			$scope.$apply(function () {
				self.value = null;

				if ($window.FileReader == null) {
					dispatchMsg({
						type: Config.MESSAGE.ERROR,
						msg : "browser version is too low"
					});
					return;
				}

				if (!/^image\//.test(file.type)) {
					dispatchMsg({
						type: Config.MESSAGE.ERROR,
						msg : "file type invalid"
					});
					return;
				}

				var fileReader = new FileReader();

				fileReader.onload = function (args) {
					$scope.$apply(function(){
						$scope.uploadPhotoDialog.show  = true;
						$scope.uploadPhotoDialog.image = args.target.result;
					});
				};

				fileReader.readAsDataURL(file);
			});
		};

		init();

		function init () {
			var promises = [];
			var p = null;
			
			p = initUser();
			promises.push(p);

			$q.all(promises).then(function () {
				$scope.loading = false;

			}).catch(function (err) {
				console.error(err);
			});
		}

		function initUser () {
			return new $q(function (resolve, reject) {
				try {
					User.get().then(function (user) {
						$scope.user = user || {};
						resolve();
					}).catch(reject);
				} catch (err) {
					reject(err);
				}
			});
		}

		function dispatchMsg (msg) {
			$rootScope.$emit("message", msg);
		}
	}
]);