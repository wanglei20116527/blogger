angular.module("Backend").directive("wlEditor", [
	"Directory",
	"Picture",

	function (Directory, Picture) {

		return {
			restrict: 'E',
			scope: {
				onChange: "&?"
			},

			templateUrl: "/backend/static/src/directives/editor/editor.html",

			link: function (scope, elements, attrs) {
				var EDITOR_OPTIONS = {
					height: 400,
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
							"image", 
							// "picture", 
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
								content: editor.getHTML()
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
							scope.$apply(function () {
								showPictureDialog(true);
							});
						}
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

				var editor = null;
				
				scope.pictureDialog = {
					show: false,
					config: PICTURE_DIALOG_CONFIG
				};


				initEditor();

				function initEditor () {
					editor = editormd("editormd", EDITOR_OPTIONS);
				}

				function showPictureDialog (show) {
					scope.pictureDialog.show = !!show;
				}
				
			}
		};
	}
]);