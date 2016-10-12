angular.module("Backend").controller("indexCtrl", [
	"$rootScope",
	function ($rootScope) {
		$rootScope.$emit("pageChanged", {
			page: "index",
		});
		
		this.info = "index controller";
	}
]);