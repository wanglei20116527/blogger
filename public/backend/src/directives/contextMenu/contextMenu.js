angular.module("Backend").directive("contextMenu", [
    "$document",

	function ($document) {
		return {
			restrict: 'E',
			scope: {
				onBlur: "&?"
			},
			transclude: true,
			templateUrl: "/backend/static/src/directives/contextMenu/contextMenu.html",

			link: function (scope, elements) {
                $document.on("click", simulateBlurEvent);

				scope.$on("$destory", function () {
					$document.off("click", simulateBlurEvent);
				});

				function simulateBlurEvent (event) {
					if (elements.is(event.target) || elements.has(event.target).length > 0) {
						return;
					}

					scope.$apply(function () {
						scope.onBlur && scope.onBlur();
					});
				}
			}
		};
	}
]);