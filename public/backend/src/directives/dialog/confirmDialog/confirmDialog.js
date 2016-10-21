angular.module("Backend").directive("confirmDialog", [
	function () {
		return {
			restrict: 'E',
			scope: {
				title        : "@",
				message      : "@",     
				onClose      : "&?",
				onCancel     : "&?",
				onConfirm    : "&?",
			},

			templateUrl: "/backend/static/src/directives/dialog/confirmDialog/confirmDialog.html",

			link: function (scope, elements, attrs) {
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
					scope.onConfirm && scope.onConfirm();
				}
			}
		};
	}
]);