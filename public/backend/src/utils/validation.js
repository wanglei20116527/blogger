angular.module("Backend").service("Validation", [
	function () {
		this.checkCategory = function (name) {
			return name !== "";
		};
	}
]);