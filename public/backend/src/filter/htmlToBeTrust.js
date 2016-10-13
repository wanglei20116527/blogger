angular.module("Backend").filter("htmlToBeTrust", [
	"$sce", function ($sce) {
		return function (msg) {
			return $sce.trustAsHtml(msg);
		};
	}
]);