angular.module("Backend").service("Validation", [
	function () {
		this.checkCategory = function (name) {
			return name !== "";
		};

		this.checkArticleTitle = function (title) {
			return title !== "";
		};

		this.checkImageMimeType = function (type) {
			return /^image\/*/.test(type);
		};

		this.checkDirectoryName = function (name) {
			return name !== "";
		};
	}
]);