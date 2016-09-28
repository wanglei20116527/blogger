const database  = require("../model/database");
const userModel = require("../model/user");


let userService = {
	getUserByNameAndPassword: function (name, password) {
		return database.executeTemplate(conn=>{
			return new Promise((resolve, reject)=>{
				userModel
					.getUserByNameAndPassword(conn, name, password)
					.then(resolve)
					.catch(reject);
			});		
		});
	}	
};

module.exports = userService;