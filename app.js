const http         = require("http");
const path         = require("path");
const express      = require("express");
const bodyParser   = require("body-parser");
const cookieParser = require("cookie-parser");
const session      = require("express-session");
const router       = require("./route/router");
const database     = require("./model/database");

const articleModel = require("./model/article");

database.init().then(initApp).catch(err=>{
	console.error(err);
});


function initApp () {
	let app = express(); 

	app.set('view engine', 'ejs');
	app.set('views', path.join(__dirname, "view"));

	app.use(cookieParser());

	app.use(session({
		secret: "wl breath hn",
		resave: false,
		maxAge: 100000,
		httpOnly: false,
		saveUninitialized: false,
	}));
	
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));

	app.use("/static/photo", express.static(path.join(__dirname, "public/photo")));

	// app.use("/static/common/js"	  , express.static(path.join(__dirname, "public/common/js")));
	// app.use("/static/common/css"  , express.static(path.join(__dirname, "public/common/css")));

	// app.use("/blog/static/lib"    , express.static(path.join(__dirname, "public/lib")));
	// app.use("/blog/static/js"     , express.static(path.join(__dirname, "public/blog/js")));
	// app.use("/blog/static/css"    , express.static(path.join(__dirname, "public/blog/css")));


	app.use("/backend/static", express.static(path.join(__dirname, "public/backend")));
	app.use("/backend/static", express.static(path.join(__dirname, "public/lib")));

	// app.use("/backend/static" , express.static(path.join(__dirname, "public/backend/css")));


	app.use(router);

	let server = http.createServer(app);

	server.listen(process.env.port || 3002, ()=>{
		console.log("app start");
	});

	server.on("error", err =>{
		console.error(err);
	});
}
