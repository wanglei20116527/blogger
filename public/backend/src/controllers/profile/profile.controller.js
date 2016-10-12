angular.module("Backend").controller("profileCtrl", [
	"$rootScope",
	"$scope",
	"$q",
	"$timeout",
	"$window",
	"User",
	function ($rootScope, $scope, $q, $timeout, $window, User) {
		$rootScope.$emit("pageChanged", {
			page: "profile",
		});

		$scope.loading = true;
		$scope.message = {
			error: {
				show: false,
				msg: "",
			},

			success: {
				show: false,
				msg: "",
			},
		};

		$scope.imageCropper = {
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
			},
		};

		$scope.user  = {};

		$scope.onImageSelect = function (event) {
			var self = this;
			var file = this.files[0];

			$scope.$apply(function () {
				self.value = null;

				if ($window.FileReader == null) {
					showErrorMsg("browser not support FileReader");
					return;
				}

				if (!/^image\//.test(file.type)) {
					showErrorMsg("file type invalid");	
					return;
				}

				var fileReader = new FileReader();

				fileReader.onload = function (args) {
					$scope.$apply(function(){
						$scope.imageCropper.show  = true;
						$scope.imageCropper.image = args.target.result;
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

		function showErrorMsg (msg) {
			$timeout(function () {
				$scope.message.error.show = true;
				$scope.message.error.msg  = msg;

				$timeout(function () {
					$scope.message.error.show = false;
					$scope.message.error.msg  = "";
				}, 1500);
			}, 600);
		}

		function showSuccessMsg (msg) {
			$timeout(function () {
				$scope.message.success.show = true;
				$scope.message.success.msg  = msg;

				$timeout(function () {
					$scope.message.success.show = false;
					$scope.message.success.msg  = "";
				}, 1500);
			}, 600);
		}

	}
]);