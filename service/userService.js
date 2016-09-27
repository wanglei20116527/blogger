const database  = require("../model/database");
const userModel = require("../model/user");


let userService = {
	login: function (name, password) {
		return database.executeTemplate(conn=>{
			return new Promise((resolve, reject)=>{
				userModel
					.getUserByNameAndPassword(conn, name, password)
					.then(user=>{
						resolve(user != null);
					})
					.catch(reject);
			});		
		});
	}	
};

module.exports = userService;