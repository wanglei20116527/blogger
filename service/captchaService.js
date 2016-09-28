const ccap    = require("ccap");
const config  = require("../config").backend.captcha; 

const captcha = ccap(config);

module.exports = {
	getNewCaptcha: function () {
		let data = captcha.get();
		return {
			text   : data[0],
			buffer : data[1]
		};
	}
};