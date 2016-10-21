angular.module("Backend").directive("addCategoryDialog", [
	"$rootScope",
	"Config",
	"Category",
	function ($rootScope, Config, Category) {
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
					var category = scope.category.trim();

					if (category === "") {
						$rootScope.$emit("message", {
							type: Config.MESSAGE.ERROR,
							msg: "category name can't be empty"
						});
						return;
					}
					
					Category.addCategory(category).then(function (category) {
						$rootScope.$emit("message", {
							type: Config.MESSAGE.SUCCESS,
							msg: "add category success"
						});

						scope.onConfirm && scope.onConfirm({
							category: category
						});
					}).catch(function (err){
						$rootScope.$emit("message", {
							type: Config.MESSAGE.ERROR,
							msg: err.message
						});
					});
				}
			}
		};
	}
]);