const http     = require("http");
const path     = require("path");
const express  = require("express");
const router   = require("./route/router");
const database = require("./model/database");

database.init().then(()=>{
	let app = express();

	app.use("/blog/view"    , express.static(path.join(__dirname, "public/blog/view")))
	app.use("/blog/js"      , express.static(path.join(__dirname, "public/blog/js")));
	app.use("/blog/css"     , express.static(path.join(__dirname, "public/blog/css")));

	app.use("/backend/view" , express.static(path.join(__dirname, "public/backend/view")))
	app.use("/backend/js"   , express.static(path.join(__dirname, "public/backend/js")));
	app.use("/backend/css"  , express.static(path.join(__dirname, "public/backend/css")));


	app.use(router);

	let server = http.createServer(app);

	server.listen(process.env.port || 3000, ()=>{
		console.log("app start");
	});

	server.on("error", err =>{
		console.error(err);
	});

}).catch(err=>{
	console.error(err);
});
