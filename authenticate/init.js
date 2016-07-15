var db = require('./../app/database.js');
var TwitterStrategy = require('passport-twitter').Strategy;

module.exports = function(passport){
	passport.use(new TwitterStrategy({
		consumerKey: process.env.TWITTER_CONSUMER_KEY,
		consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
		callbackURL: process.env.TWITTER_CALLBACK_URL
	}, function(token, tokenSecret, profile, done){
		//console.log(profile);
		var user = {
			twitterId: profile.id,
			username: profile.username,
			displayName: profile.displayName,
			icon: profile.photos[0].value
		};
		db('user', function(collection){
			collection.findOne({twitterId: user.twitterId}, function(err, data){
				if (err) 
					return done(err);
				if (!data){
					collection.insert(user, function(err, data){
						return done(err, user);
					});
				}
				if (data){
					return done(null, user);
				}
			});
			//console.log('findFinish');
		});
	}));

	passport.serializeUser(function(user, done){
		done(null, user.twitterId);
	});

	passport.deserializeUser(function(id, done){
		db('user', function(collection){
			collection.findOne({twitterId: id}, function(err, user){
				done(err, user);
			});
		});
		//console.log('Deserialize Finish');
	});
}