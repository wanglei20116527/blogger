angular.module("Backend").filter("byteFormat", [
    function () {
		return function (bytes) {
            if (bytes < 1024) {
                return bytes + "B";
            }

            bytes /= 1024;
            
            if (bytes < 1024) {
                return bytes.toFixed(1) + "KB";
            }
            
            bytes /= 1024;

            if (bytes < 1024) {
               return bytes.toFixed(1) + "M";
            }

            bytes /= 1024;

            return bytes.toFixed(1) + "G";
		};
	}
]);