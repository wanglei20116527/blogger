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
				onPictureSelect: "&?"
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
					crossDomainUpload : true,
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
							scope.$apply(function () {
								openPicSelectDialog();
							});
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
                    },

					onfullscreen : function() {
						isFullScreen = true;
					},

					onfullscreenExit : function() {
						isFullScreen = false;
					}

				};
				
				var editor    = null;
				var timeoutId = null;
				var size      = {
					width: angular.element(elements).width(),
					height: 450
				};

				var isFullScreen = false;

				var picSelectDialogOption = scope.picSelectDialogOption = {
					show: false,
					picUrl: "",
					linkUrl: "http://",
					desc: "",
					title: "Add Picture",
					buttons: [
						{
							text: "Cancel",
							style: {
								color: "#fff",
								backgroundColor: "#666"
							},
							onClick: function () {
								closePicSelectDialog();
							}
						},

						{
							text: "Confirm",
							style: {
								color: "#fff",
								backgroundColor: "#2196F3"
							},
							onClick: function () {
								var url  = picSelectDialogOption.picUrl;
								var link = picSelectDialogOption.linkUrl;
								var desc = picSelectDialogOption.desc;

								insertPicture(url, link, desc);

								closePicSelectDialog();
							}
						}
					],

					onClose: function () {
						closePicSelectDialog();
					}
				};

				scope.selectPic = function () {
					if (!scope.onPictureSelect) {
						return;
					}
					
					scope.onPictureSelect({
						isFullScreen: isFullScreen
					})
					.then(function (ret) {
						if (!ret.selected) {
							return;
						}

						scope.picSelectDialogOption.picUrl = ret.url;
					})
					.catch(function (err) {
						console.error(err);
					});
				}				

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

				function openPicSelectDialog () {
					scope.picSelectDialogOption.show = true;
				}

				function closePicSelectDialog () {
					scope.picSelectDialogOption.show = false;
					scope.picSelectDialogOption.picUrl = "";
					scope.picSelectDialogOption.linkUrl = "http://";
					scope.picSelectDialogOption.desc = "";
				}

				function insertPicture (url, link, desc) {
					var str = "";

					if (desc) {
						str = "![" + desc + "](" + url + " '" + desc + "')";
					} else {	
						str = "![](" + url + ")";
					}

					if (!!link 
						&& (link.indexOf("http://") === 0 && link !== "http://"
							||
							link.indexOf("https://") === 0 && link !== "https://"
							)
						) {

						if (desc) {
							str = "[" + str + "]" + "(" + url + " '" + desc + "')"
						} else {
							str = "[" + str + "]" + "(" + url + ")"
						}	
					}

					editor.insertValue(str);
				}
			}
		};
	}
]);