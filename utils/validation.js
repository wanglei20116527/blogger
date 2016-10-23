module.exports = {
	checkUsername: function (username) {
		return /[\s\S]+/.test(username);
	},

	checkPassword: function (password) {
		return 	/\d/.test(password) 
			&&  /[a-zA-Z]/.test(password)
			&&  password.length >= 6;
	},

	checkEmail: function (email) {
		return /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(email);
	},

	checkPhone: function (phone) {
		return /^\d{11}$/.test(phone);
	},

	checkCategoryName: function (name) {
		return name !== "";
	},

	checkDirName: function (name) {
		return name !== "" && name.length <= 100;
	}
};