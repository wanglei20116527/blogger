let express = require("express");
let router  = express.Router();

router.post("/login", (req, res)=>{
	console.log(req.session);
	req.session.cookie.maxAge = 60 * 1000;
	req.session.user = {
		name: "wanglei"
	};

	res.json({
		info: "wanglei is cool"
	});
});

router.post("/logout", (req, res)=>{
	req.session.destroy(err=>{
		if (err) {
			
		} else {

		}
	});
});

module.exports = router; 