module.exports = {
	backend: {
		renderDefaultPage: function (req, res) {
			let session = req.session;
			let cookies = req.cookies;

			if (session.user 
				&& session.user.token
				&& cookies._token 
				&& session.user.token === cookies._token) {
				res.redirect("/backend/home");
			} else {
				res.redirect("/backend/login");
			}
		},

		renderLoginPage: function (req, res, next) {
			let session = req.session;
			let cookies = req.cookies;

			if (session.user 
				&& session.user.token
				&& cookies._token 
				&& session.user.token === cookies._token) {
				res.redirect("/backend/home");
				return;
			}

			res.render("backend/login");
		},

		renderHomePage: function (req, res, next) {
			let session = req.session;
			let cookies = req.cookies;

			if (session.user 
				&& session.user.token
				&& cookies._token 
				&& session.user.token === cookies._token) {
				res.render("backend/home");
				return;
			}

			res.redirect("/backend/login");
		},

		redirectToLoginPage: function (req, res) {
			res.redirect("/backend/login");
		},

		redirectToHomePage: function (req, res) {
			res.redirect("/backend/home");
		}
	},

	blog: {
		renderIndexPage: function (req, res) {

		}
	}
};