angular.module("Backend").directive("wlEditor", [
	"$rootScope",
	"$window",
	"$timeout",
	"Uuid",
	"Directory",
	"Picture",

	function (
		$rootScope, 
		$window,
		$timeout,
		Uuid, 
		Directory, 
		Picture) {
			
		return {
			restrict: 'E',
			scope: {
				content: "@?",
				onCtrlS: "&?",
				onChange: "&?",	
			},

			templateUrl: "/backend/static/src/directives/editor/editor.html",

			link: function (scope, elements, attrs) {
				var EDITOR_OPTIONS = {
					width: "100%",
					height: 450,
					saveHTMLToTextarea: true,
					theme: "ambiance-mobile",
					path: "/backend/static/editormd/lib/",
					htmlDecode : "style,script,iframe|on*",
					placeholder: "Enjoy writing article now ...",
					toolbarIcons: function () {
						return  [
							"bold", 
							"del", 
							"italic", 
							"quote", 
							"uppercase", 
							"lowercase", "|", 
							"h1", 
							"h2", 
							"h3", 
							"h4", 
							"h5", 
							"h6", "|", 
							"list-ul", 
							"list-ol", 
							"hr", "|",
							"link", 
							"reference-link", 
							// "image", 
							"picture", 
							"code", 
							"code-block", 
							"table", 
							"datetime",  
							"html-entities", 
							"pagebreak", "|", 
							"watch", 
							"preview", 
							"fullscreen", 
							"search", "|",
							"help"
						]
					},

					onchange: function () {
						scope.$apply(function () {
							scope.onChange && scope.onChange({
								html: editor.getHTML(),
								markdown: editor.getMarkdown(),
							});
						});
					},

					toolbarIconsClass : {
						picture : "fa-picture-o"
					},
						    
					toolbarIconTexts : {
						picture : "添加图片"
					},

					toolbarHandlers: {
						picture: function (cm, icon, cursor, selection) {
							debugger;
							// scope.$apply(function () {
							// 	showPictureDialog(true);
							// });
						}
					},

					onload : function() {
						var keyMap = {
							"Ctrl-S": function(cm) {
								scope.onCtrlS && scope.onCtrlS();
							}
						};

						this.addKeyMap(keyMap);
						
						detectResizeEvent();
                    }

				};
				
				var PICTURE_DIALOG_CONFIG = {
					title: "Select Picture",
					
					buttons: [
						{
							text: "Cancel",
							style: {
								color: "#fff",
								backgroundColor: "#666"
							},
							onClick: function () {
								showPictureDialog(false);
							}
						},

						{
							text: "Confirm",
							style: {
								color: "#fff",
								backgroundColor: "#2196F3"
							},
							onClick: function () {
								console.log("wanglei is cool and houna is cute");
								showPictureDialog(false);
							}
						},
					],
					
					onClose: function () {
						showPictureDialog(false);
					}
				};
				
				var editor    = null;
				var timeoutId = null;
				var size      = {
					width: angular.element(elements).width(),
					height: 450
				};
				

				scope.pictureDialog = {
					show: false,
					config: PICTURE_DIALOG_CONFIG
				};

				scope.$on("$destroy", function () {
					offDetectResizeEvent();
					destroyEditor();
				});

				init();

				function init () {
					initEditor(initEditorId());
				}

				function initEditorId () {
					var $el = elements.find(".editormd").eq(0);
					var id  = "editormd-" + Uuid.getUuid();

					$el.attr("id", id);

					return id;
				}

				function initEditor (id) {
					var options = angular.merge({}, EDITOR_OPTIONS, {
						markdown: scope.content || ""
					});

					editor = editormd(id, options);
				}

				function destroyEditor () {
					if (editor != null) {
						editor.editor.remove();
					}
				}

				function detectResizeEvent () {
					var width  = angular.element(elements).width();

					if (width !== size.width) {
						size.width  = width;
							
						editor.resize(size.width, size.height);
					}

					timeoutId = setTimeout(detectResizeEvent, 50);
				}

				function offDetectResizeEvent () {
					if (timeoutId != null) {
						clearTimeout(timeoutId);
						timeoutId = null;
					}
				}

				function showPictureDialog (show) {
					scope.pictureDialog.show = !!show;
				}
			}
		};
	}
]);