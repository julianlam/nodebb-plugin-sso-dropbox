(function(module) {
	"use strict";

	var User = module.parent.require('./user'),
		meta = module.parent.require('./meta'),
		db = module.parent.require('../src/database'),
		passport = module.parent.require('passport'),
  		passportDropbox = require('passport-dropbox-oauth2').Strategy,
  		fs = module.parent.require('fs'),
  		path = module.parent.require('path'),
  		nconf = module.parent.require('nconf'),
  		async = module.parent.require('async');

	var constants = Object.freeze({
		'name': "Dropbox",
		'admin': {
			'route': '/plugins/sso-dropbox',
			'icon': 'fa-dropbox'
		}
	});

	var Dropbox = {};

	Dropbox.init = function(app, middleware, controllers, callback) {
		function render(req, res, next) {
			res.render('admin/plugins/sso-dropbox', {});
		}

		app.get('/admin/plugins/sso-dropbox', middleware.admin.buildHeader, render);
		app.get('/api/admin/plugins/sso-dropbox', render);

		callback();
	}

	Dropbox.getStrategy = function(strategies, callback) {
		meta.settings.get('sso-dropbox', function(err, settings) {
			if (!err && settings['id'] && settings['secret']) {
				passport.use(new passportDropbox({
					clientID: settings['id'],
					clientSecret: settings['secret'],
					callbackURL: nconf.get('url') + '/auth/dropbox/callback'
				}, function(accessToken, refreshToken, profile, done) {
					Dropbox.login(profile.id, profile.displayName, profile.emails[0].value, function(err, user) {
						if (err) {
							return done(err);
						}
						done(null, user);
					});
				}));

				strategies.push({
					name: 'dropbox-oauth2',
					url: '/auth/dropbox',
					callbackURL: '/auth/dropbox/callback',
					icon: 'fa-dropbox'
				});
			}

			callback(null, strategies);
		});
	};

	Dropbox.login = function(dropboxId, handle, email, callback) {
		Dropbox.getUid(dropboxId, function(err, uid) {
			if(err) {
				return callback(err);
			}

			if (uid !== null) {
				// Existing User
				callback(null, {
					uid: uid
				});
			} else {
				// New User
				var success = function(uid) {
					// Save dropbox-specific information to the user
					User.setUserField(uid, 'dropboxId', dropboxId);
					db.setObjectField('dropboxId:uid', dropboxId, uid);
					callback(null, {
						uid: uid
					});
				};

				User.getUidByEmail(email, function(err, uid) {
					if(err) {
						return callback(err);
					}

					if (!uid) {
						User.create({username: handle, email: email}, function(err, uid) {
							if(err) {
								return callback(err);
							}

							success(uid);
						});
					} else {
						success(uid); // Existing account -- merge
					}
				});
			}
		});
	};

	Dropbox.getUid = function(dropboxId, callback) {
		db.getObjectField('dropboxId:uid', dropboxId, function(err, uid) {
			if (err) {
				return callback(err);
			}
			callback(null, uid);
		});
	};

	Dropbox.addMenuItem = function(custom_header, callback) {
		custom_header.authentication.push({
			"route": constants.admin.route,
			"icon": constants.admin.icon,
			"name": constants.name
		});

		callback(null, custom_header);
	};

	Dropbox.deleteUserData = function(uid, callback) {
		async.waterfall([
			async.apply(User.getUserField, uid, 'dropboxId'),
			function(oAuthIdToDelete, next) {
				db.deleteObjectField('dropboxId:uid', oAuthIdToDelete, next);
			}
		], function(err) {
			if (err) {
				winston.error('[sso-oauth] Could not remove dropbox data for uid ' + uid + '. Error: ' + err);
				return callback(err);
			}
			callback();
		});
	};

	module.exports = Dropbox;
}(module));