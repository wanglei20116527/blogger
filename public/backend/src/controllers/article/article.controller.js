angular.module("Backend").controller("articleCtrl", [
	"$rootScope",
	function ($rootScope) {
		$rootScope.$emit("pageChanged", {
			page: "article",
		});
	}
]);