const captchaService = require("../service/captchaService");

module.exports = {
	updateCaptcha: function (req, res) {
		try {
			let {
				text,
				buffer
			} = captchaService.getNewCaptcha();

			req.session.captcha = text;
			
			res.end(buffer);
			
		} catch (err) {
			res.json({
				success: false,
				error: {
					code: err.code,
					message: err.stack
				}
			});
		}
	},

	getCaptchaText: function (req, res) {
		res.json({
			success: true,
			data: {
				captcha: req.session.captcha || "",
			}
		});
	},
};