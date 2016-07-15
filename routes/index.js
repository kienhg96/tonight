var express = require('express');
var router = express.Router();
var yelp = require('../app/yelp');
/* GET home page. */


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
	router.get('/auth', passport.authenticate('twitter'));
	router.get('/auth/callback', passport.authenticate('twitter', {
		failureRedirect: '/'
	}), function(req, res){
		res.send('<script>if(window.opener){window.opener.location.reload();window.close();}else{window.location="/"}</script>');
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
		if (req.body.search) {
			yelp.search({term: 'bar', location: req.body.search})
			.then(function(data){
				var resJson = [];
				for (var i = 0; i < data.businesses.length; i++){
					resJson.push({
						name: data.businesses[i].name,
						id: data.businesses[i].id,
						img: data.businesses[i].image_url,
						url: data.businesses[i].url,
						rating: data.businesses[i].rating_img_url
					});
				}
				res.json(resJson);
			})
			.catch(function(err){
				throw err;
			});
		}
		else {
			res.json(null);
		}
	});
	return router;
}
