angular.module("Backend").directive("updateCategoryDialog", [
	function () {
		return {
			restrict: 'E',
			scope: {
				onClose      : "&?",
				onCancel     : "&?",
				onConfirm    : "&?",
			},

			templateUrl: "/backend/static/src/directives/dialog/updateCategoryDialog/updateCategoryDialog.html",

			link: function (scope, elements, attrs) {
				var category = null;

				try {
					category = JSON.parse(attrs.category);
				} catch (err) {	
					category = {};
				}

				scope.category =  category;

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
					scope.onConfirm && scope.onConfirm({
						category: scope.category
					});
				}
			}
		};
	}
]);