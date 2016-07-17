var express = require('express');
var router = express.Router();
var yelp = require('../app/yelp');
var db = require('./../app/database.js');
/* GET home page. */
var MongoClient = require('mongodb').MongoClient;

module.exports = function(passport){
	router.get('/', function(req, res, next) {
		if (req.user){
			console.log(req.user.twitterId);
		}
  		res.render('index', { title: 'Express', 
  							  user: (req.user ? { 
  							  				name: req.user.displayName, 
  							  				icon: req.user.icon, 
  							  				id: req.user.twitterId
  							  			} 
  							  				: null)});
	});
	router.get('/user', function(req, res){
		if (req.isAuthenticated()){
			res.json({
				name: req.user.displayName,
				icon: req.user.icon,
				id: req.user.twitterId
			});
		}
		else {
			res.json(null);
		}
	});
	router.get('/auth', passport.authenticate('twitter'));
	router.get('/auth/callback', passport.authenticate('twitter', {
		failureRedirect: '/'
	}), function(req, res){
		res.send('<script>if(window.opener){window.opener.refreshUser();window.close();}else{window.location="/"}</script>');
	});
	router.get('/user', function(req,res){
		res.json(req.user);
	});
	router.get('/logout', function(req, res){
		if (req.isAuthenticated()) {
			req.logout();
		}
		res.redirect('/');
	});
	router.get('/yelptest', function(req, res){
		yelp.search({term: 'bar', location: 'San Francisco'})
		.then(function(data){
			res.json(data);
		})
		.catch(function(err){
			throw err;
		});
	});
	router.post('/search', function(req, res){
		yelp.search({term: 'bar', location: req.body.search}).then(function(data){
			//console.log(data);
			var resJson = data.businesses.map(function(elem){
				return {
					name: elem.name,
					id: elem.id,
					img: elem.image_url,
					url: elem.url,
					rating: elem.rating_img_url,
					description: elem.snippet_text,
					going: 0,
					userGoing: false
				}
			});
			db('going', function(collection){
				var processed = 0;
				resJson.forEach(function(elem){
					collection.findOne({"id" : elem.id}, function(err, doc){
						if (err) throw err;
						processed++;
						//console.log('Processed: ' + processed);

						//console.log(doc);
						if (doc){
							elem.going = doc.going;
							//console.log('Doc.going ' + doc.going);
							if (req.isAuthenticated()){
								//console.log(req.user.twitterId);
								//console.log(doc.userList);
								if (doc.userList.indexOf(req.user.twitterId) !== -1){
									elem.userGoing = true;
								}
							}
						}
						else {
							db('going', function(col){
								col.insert({id: elem.id, going: elem.going, userList: []}, function(err){
									if (err) throw err;
								});
							});
						}
						if (processed === resJson.length) {
							res.json(resJson);
						}
					});
				});
			});
		})
	});
	router.post('/going', function(req, res){
		console.log(req.body);
		//res.send('ok');
		if (req.isAuthenticated()){
			MongoClient.connect(process.env.MONGO_URI, function(err, dbase){
				if (err) throw err;
				var id = req.body.id;
				var collection = dbase.collection('going');
				collection.findOne({'id': id}, function(err, doc){
					if (err) throw err;
					var userId = req.user.twitterId;
					var userList = doc.userList;
					var going = doc.going;
					if (userList.indexOf(userId) === -1){
						userList.push(userId);
						going++;
					}
					else {
						userList.splice(userList.indexOf(userId), 1);
						going--;
					}
					collection.update({'id': id}, {$set: {userList: userList, going: going}}, function(err){
						if (err) throw err;
					});
					res.send('OK');
				});
			});
		}
		else {
			res.send('Failed');
		}
	});
	return router;
}
