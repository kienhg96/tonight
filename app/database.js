var MongoClient = require('mongodb').MongoClient;

module.exports = function(col, cb) {	
		MongoClient.connect(process.env.MONGO_URI, function(err, db){
			if (err) throw err;
			var collection = db.collection(col);
			cb(collection);
			console.log('closed');
			db.close();
		});
	}