angular.module("Backend").controller("pictureCtrl", [
	"$rootScope",
	function ($rootScope) {
		$rootScope.$emit("pageChanged", {
			page: "picture",
		});
	}
]);