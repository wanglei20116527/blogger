angular.module("Backend").controller("pictureCtrl", [
	"$rootScope",
	"$scope",
	function ($rootScope, $scope) {
		$rootScope.$emit("pageChanged", {
			page: "picture",
		});

		$scope.imageUploadDialog = {
			show: true,

			onCancel: function () {
				this.show = false;
			},

			onClose: function () {
				this.show = false;
			},

			onConfirm: function () {
				console.log("wanglei is cool and houna is cute");
			},
		}

	}
]);