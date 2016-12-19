angular.module("Backend").directive("wlDialog", [
	"$window",

	function (
		$window
	) {
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
				var _position = {
					x: 0,
					y: 0
				};

				var _offset = {
					x: 0,
					y: 0
				};

				var $dialog = null;
				var $header = null;

				scope.buttons = scope.buttons || [];

				if (!angular.isArray(scope.buttons)) {
					throw new Error("dialog scope buttons type must be array");
				}

				scope.close = function ($event) {
					scope.onClose && scope.onClose();
				};

				scope.preventDefault = function ($event) {
					event.stopPropagation();
				};

				scope.$on("$destroy", function () {
					offEvents();

					$dialog = null;
					$header = null;
				});

				init();

				function init () {
					$dialog = angular.element(elements).find(".wrapper");
					$header = angular.element(elements).find(".dialog-header");

					initEvents();
					initPosition();
				}
				
				function initPosition () {
					var windowSize = {
						width: angular.element($window).width(),
						height: angular.element($window).height()
					};

					var dialogSize = {
						width: $dialog.width(),
						height: $dialog.height()
					};

					var position = {
						left: parseInt((windowSize.width - dialogSize.width) / 2, 10),
						top: parseInt((windowSize.height - dialogSize.height) /2, 10)
					};

					$dialog.css({
						left: position.left + "px",
						top: position.top + "px"
					});
				}

				function initEvents () {
					$header.on("mousedown", dragStart);
				}

				function offEvents () {
					$header.off("mousedown");
				}

				function dragStart (event) {
					var position = $dialog.position();

					_position.x = position.left;
					_position.y = position.top;

					_offset.x = event.pageX;
					_offset.y = event.pageY;

					angular.element($window).on("mousemove", dragging);
					angular.element($window).on("mouseup", dragStop);
					angular.element($window).on("mousecancel", dragStop);
				}

				function dragging (event) {
					var offset = {
						x: event.pageX - _offset.x,
						y: event.pageY - _offset.y
					};

					var position = {
						left: _position.x + offset.x,
						top: _position.y + offset.y
					};

					$dialog.css({
						left: position.left + "px",
						top: position.top + "px"
					});
				}

				function dragStop (event) {
					var offset = {
						x: event.pageX - _offset.x,
						y: event.pageY - _offset.y
					};

					var position = {
						left: _position.x + offset.x,
						top: _position.y + offset.y
					};

					$dialog.css({
						left: position.left + "px",
						top: position.top + "px"
					});

					_offset.x = 0;
					_offset.y = 0;

					_position.x = 0;
					_position.y = 0;

					angular.element($window).off("mousemove");
					angular.element($window).off("mouseup");
					angular.element($window).off("mousecancel");
				}
			}
		};
	}
]);