const captchaService = require("../../service/captchaService");

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
					code: 190000,
					message: err.stack
				}
			});
		}
	}
};