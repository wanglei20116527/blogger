angular.module("Backend").service("Uuid", [
	function () {
		var _uuid = 0;
		
		this.getUuid = function () {
			return ++_uuid;
		};
	}
]);