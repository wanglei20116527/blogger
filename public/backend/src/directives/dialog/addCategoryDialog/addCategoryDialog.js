angular.module("Backend").directive("addCategoryDialog", [
	function () {
		return {
			restrict: 'E',
			scope: {
				onClose      : "&?",
				onCancel     : "&?",
				onConfirm    : "&?",
			},

			templateUrl: "/backend/static/src/directives/dialog/addCategoryDialog/addCategoryDialog.html",

			link: function (scope) {
				scope.category = "";

				scope.close = function () {
					close();
				};

				scope.cancel = function () {
					cancel();
				};

				scope.confirm = function () {
					confirm();
				};

				function close () {
					scope.onClose && scope.onClose();
				}

				function cancel () {
					scope.onCancel && scope.onCancel();
				}

				function confirm () {
					scope.onConfirm && category.onConfirm({
						name: category
					});
				}
			}
		};
	}
]);