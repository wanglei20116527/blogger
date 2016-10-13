angular.module("Backend").factory("Config", [
	"Uuid",

	function (Uuid) {
		return {
			MESSAGE: {
				WARN   : Uuid.getUuid(),
				ERROR  : Uuid.getUuid(),
				SUCCESS: Uuid.getUuid()
			}
		};
	}
]);