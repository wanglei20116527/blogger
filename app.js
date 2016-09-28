const http         = require("http");
const path         = require("path");
const express      = require("express");
const bodyParser   = require("body-parser");
const cookieParser = require("cookie-parser");
const session      = require("express-session");
const router       = require("./route/router");
const database     = require("./model/database");

database.init().then(initApp).catch(err=>{
	console.error(err);
});


function initApp () {
	let app = express();

	app.use(session({
		secret: "wl breath hn",
		resave: false,
		maxAge: 100 * 1000,
		httpOnly: false,
		saveUninitialized: false,
	}));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));

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
}
