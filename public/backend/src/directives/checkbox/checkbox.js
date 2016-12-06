angular.module("Backend").directive("checkbox", [
    "$document",

	function ($document) {
		return {
			restrict: 'E',
            replace: true,  
			scope: {
                defaultValue: "@?",
                onChange: "&?",
			},
			transclude: true,
			templateUrl: "/backend/static/src/directives/checkbox/checkbox.html",

			link: function (scope, elements) {
                scope.$watch("defaultValue", function (value) {
                    scope.isChecked = value === "true";
                });

                scope.onClick = function () {
                    scope.isChecked = !scope.isChecked;
                    
                    scope.onChange && scope.onChange({
                        isChecked: scope.isChecked
                    });
                };
			}
		};
	}
]);