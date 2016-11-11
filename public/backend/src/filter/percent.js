angular.module("Backend").filter("percent", [
    function () {
		return function (number) {
			if (number >= 1) {
                return "100%";
            }

            number *= 100;

            return number.toFixed(1) + "%";
		};
	}
]);