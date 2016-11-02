angular.module("Backend").service("Validation", [
	function () {
		this.checkCategory = function (name) {
			return name !== "";
		};

		this.checkArticleTitle = function (title) {
			return title !== "";
		};

		this.checkDirectoryName = function (name) {
			return name !== "";
		};
	}
]);