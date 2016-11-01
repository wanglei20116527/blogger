angular.module("Backend").directive("wlDialog", [
	function () {
		return {
			restrict: 'E',
			scope: {
				title    : "@" ,
				buttons  : "=?",
				onClose  : "&?",
			},

			transclude: true,
			templateUrl: "/backend/static/src/directives/dialog/dialog.html",

			link: function (scope, elements, attrs) {
				scope.buttons = scope.buttons || [];

				if (!angular.isArray(scope.buttons)) {
					throw new Error("dialog scope buttons type must be array");
				}

				scope.close = function ($event) {
					scope.onClose && scope.onClose();
				};
			}
		};
	}
]);