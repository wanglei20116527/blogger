angular.module("Backend").controller("profileCtrl", [
	"$scope",
	function ($scope) {
		$scope.image = {
			source: "http://pic.sc.chinaz.com/files/pic/pic9/201508/apic14052.jpg",
			width: 540,
			height: 360
		};
	}
]);