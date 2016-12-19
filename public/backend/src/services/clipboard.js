angular.module("Backend").service("Clipboard", [
	"$document",
    "$timeout",

	function ($document, $timeout) {
        var textareaId = [
            "wl",
            "clipboard",
            "textarea"
        ].join("-");

        this.isSupportCopy = function () {
            var document = $document[0];
            var textarea = getTextarea();

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
                var textarea = getTextarea();

                textarea.value = text;
                
                textarea.select();
                
                isSuccess = document.execCommand("copy");
            } catch (err) {
                console.error(err);
                isSuccess = false;
            }

            return isSuccess;
        };

        this.getText = function () {
            return getTextarea().value;
        };
        

        function getTextarea () {
            var document = $document[0];
            var textarea = document.getElementById(textareaId);

            if (textarea == null) {
                textarea    = document.createElement("textarea");
                textarea.id = textareaId;
                textarea.style.position = "fixed";
                textarea.style.top  = "-10000000px";
                textarea.style.left = "-10000000px";

                document.body.appendChild(textarea);
            }

            return textarea;
        }
	}
]);