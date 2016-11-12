angular.module("Backend").service("Clipboard", [
	"$document",
    "$timeout",

	function ($document, $timeout) {
        this.isSupportCopy = function () {
            var document = $document[0];
            var textarea = document.createElement("textarea");

            if (!("select" in textarea)) {
                return false;
            }

            if (!("queryCommandSupported" in document)) {
                return false;
            }

            return document.queryCommandSupported("copy");
        };
        
        this.copyText = function (text) {
            if (!this.isSupportCopy()) {
                return false;
            }

            var isSuccess = false;

            try {

                var document = $document[0];
                var textarea = document.createElement("textarea");
                
                textarea.value = text;
                textarea.style.position = "fixed";
                textarea.style.left = "-1000px";
                textarea.style.top  = "-1000px";
                
                document.body.appendChild(textarea);
                

                textarea.select();
                
                isSuccess = document.execCommand("copy");
                
                document.body.removeChild(textarea);

            } catch (err) {
                console.error(err);
                isSuccess = false;
            }

            return isSuccess;
        };
	}
]);