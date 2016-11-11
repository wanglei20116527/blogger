angular.module("Backend").directive("onContextMenu", [
    "$parse",

	function ($parse) {
		return {
			restrict: 'A',

			link: function (scope, elements, attrs) {
                var fn = $parse(attrs.onContextMenu);
                
                elements.on("contextmenu", function (event) {
                    scope.$apply(function () {
                        fn(scope, {
                            $event: event
                        });
                    });
                });
			}
		};
	}
]);