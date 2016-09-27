const {spawn} = require("child_process");

function startApp () {
	spawn("node", ["--harmony", "app.js"]).on("exit", code=>{
		if (code == 0) {
			return;
		}

		startApp();
	});
}	

startApp();

