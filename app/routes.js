module.exports = function(app, User, passport, jwt, config, TrainingLogs, PromotionLogs, WarningLogs, DemotionLogs, StrikeLogs, FiredLogs, TransferLogs, RankSellingLogs, LoaLogs) {

	require('../config/passport')(passport);
	var TOKEN_TIMEOUT = 10080;

	var logsDict = {
		'training-logs' : TrainingLogs,
		'promotion-logs' : PromotionLogs,
		'warning-logs' : WarningLogs,
		'demotion-logs' : DemotionLogs,
		'strike-logs' : StrikeLogs,
		'fired-logs' : FiredLogs,
		'transfer-logs' : TransferLogs,
		'rank-selling-logs' : RankSellingLogs,
		'loa-logs' : LoaLogs
	}

	var notHRRegex = /^(?=(.*(agent|security|training|instructor).*))(?!(field|director))/i;
	var SecPlusRegex = /^(?=(.*(agent).*))(?!(field|security))/i;
	var noTagsRegex = /\[[^\]]*\]/g;

	// server routes ===========================================================
	// handle things like api calls
	// authentication routes

	app.post('/api/secSearch', function(req, res) {
		var query = {};

		if(req.body.username && req.body.username.trim()) {
			query.username = new RegExp("^" + escapeRegExp(req.body.username.trim()) + "$", "i");
		} else {
			res.json({success: true, panel: {color: 'white', text: 'Input the username...', motto: '', promoter: ''}});
			return;
		}

		query.rehired = false;
		FiredLogs.findOne(query, function(err, log) {
			delete query.rehired;
			if (err) throw err;
			if (log) {
				res.json({success: true, panel: {color: 'red', text: 'This member has been Fired!', motto: '', promoter: ''}});
			} else {
				var theLogs = [];
				var theStrikesNum = null;
				TrainingLogs.findOne(query, function(nerr, nlog) {
					if (nerr) throw nerr;
					if (nlog) {
						nlog.logType = 'training-logs';
						theLogs.push(nlog);
					}
					PromotionLogs.findOne(query, function(err2, nlog2) {
						if (err2) throw err2;
						if (nlog2) {
							nlog2.logType = 'promotion-logs';
							theLogs.push(nlog2);
						}
						DemotionLogs.findOne(query, function(err3, nlog3) {
							if (err3) throw err3;
							if (nlog3) {
								nlog3.logType = 'demotion-logs';
								theLogs.push(nlog3);
							}
							query.removed = false;
							StrikeLogs.findOne(query, function(err4, nlog4) {
								delete query.removed;
								if (err4) throw err4;
								if (nlog4) {
									theStrikesNum = nlog4.strikeNumber;
								}
								TransferLogs.findOne(query, function(err5, nlog5) {
									if (err5) throw err5;
									if (nlog5) {
										nlog5.logType = 'transfer-logs';
										theLogs.push(nlog5);
									}
									RankSellingLogs.findOne(query, function(err6, nlog6) {
										if (err6) throw err6;
										if (nlog6) {
											nlog6.logType = 'rank-selling-logs';
											theLogs.push(nlog6);
										}
										
										theLogs.sort(function(a, b) {
											if(a.createdAt >= b.createdAt)
												return -1;
											else
												return 1;
										});

										var i = -1;
										while(true) {
											i++;
											if(theLogs.length < i + 1) {
												User.findOne({name: query.username}, function(nerr10, user10) {
													if (nerr10) throw nerr10;
													if (user10) {
														res.json({success: true, panel: {color: 'white', text: 'Member in UIA Portal but not yet logged.', motto: '', promoter: ''}});
													} else {
														res.json({success: true, panel: {color: 'orange', text: 'Member not found. Potential Recruit...', motto: '[UIA] Recruit', promoter: ''}});
													}
												}).sort('-createdAt');
											} else {
												var mainLog = theLogs[i];
												if(mainLog.logType == 'training-logs') {
													if(mainLog.passOrFail == 'pass') {
														if(mainLog.recSecTrainOrHR == 'rec') {
															getPromoTag(mainLog.logger, function(tag) {
																res.json({success: true, panel: {color: 'green', text: 'This member passed training and is UIA\'s staff.', motto: '[UIA] Agent I ' + tag + ((theStrikesNum) ? ' x' + theStrikesNum : ''), promoter: mainLog.logger}});
															});
														} else if(mainLog.recSecTrainOrHR == 'sec') {
															getPromoTag(mainLog.logger, function(tag) {
																res.json({success: true, panel: {color: 'green', text: 'This member passed training and is UIA\'s staff.', motto: '[UIA] Security Official I ' + tag + ((theStrikesNum) ? ' x' + theStrikesNum : ''), promoter: mainLog.logger}});
															});
														} else if(mainLog.recSecTrainOrHR == 'train') {
															getPromoTag(mainLog.logger, function(tag) {
																res.json({success: true, panel: {color: 'green', text: 'This member passed training and is UIA\'s staff.', motto: '[UIA] Instructor I ' + tag + ((theStrikesNum) ? ' x' + theStrikesNum : ''), promoter: mainLog.logger}});
															});
														} else {
															continue;
														}
													} else {
														if(mainLog.recSecTrainOrHR == 'rec') {
															res.json({success: true, panel: {color: 'orange', text: 'This member failed training. Potential Recruit...', motto: '[UIA] Recruit', promoter: ''}});
														} else {
															continue;
														}
													}
												} else if(mainLog.logType == 'promotion-logs' ||
													mainLog.logType == 'demotion-logs') {
													if(SecPlusRegex.test(mainLog.newRank)) {
														getPromoTag(mainLog.logger, function(tag) {
															res.json({success: true, panel: {color: 'green', text: 'This member is UIA\'s staff.', motto: '[UIA] ' + mainLog.newRank + ' ' + tag + ((theStrikesNum) ? ' x' + theStrikesNum : ''), promoter: mainLog.logger}});
														});
													}
													else {
														getPromoTag(mainLog.logger, function(tag) {
															res.json({success: true, panel: {color: 'grey', text: 'This member is Security+. Use the group gate.', motto: '[UIA] ' + mainLog.newRank + ' ' + tag + ((theStrikesNum) ? ' x' + theStrikesNum : ''), promoter: mainLog.logger}});
														});
													}
												} else if(mainLog.logType == 'transfer-logs') {
													if(mainLog.fullTransferOrNearMiss == 'fullTransfer') {
														if(SecPlusRegex.test(mainLog.offeredRank)) {
															getPromoTag(mainLog.logger, function(tag) {
																res.json({success: true, panel: {color: 'green', text: 'This member transfered and is UIA\'s staff.', motto: '[UIA] ' + mainLog.offeredRank + ' ' + tag + ((theStrikesNum) ? ' x' + theStrikesNum : ''), promoter: mainLog.logger}});
															});
														}
														else {
															getPromoTag(mainLog.logger, function(tag) {
																res.json({success: true, panel: {color: 'grey', text: 'This member transfered and is Security+. Use the group gate.', motto: '[UIA] ' + mainLog.offeredRank + ' ' + tag + ((theStrikesNum) ? ' x' + theStrikesNum : ''), promoter: mainLog.logger}});
															});
														}
													} else {
														res.json({success: true, panel: {color: 'orange', text: 'This member tried to transfer. Potential Recruit...', motto: '[UIA] Recruit', promoter: ''}});
													}
												} else if(mainLog.logType == 'rank-selling-logs') {
													if(SecPlusRegex.test(mainLog.newRank)) {
														getPromoTag(mainLog.logger, function(tag) {
															res.json({success: true, panel: {color: 'green', text: 'This member bought a rank and is UIA\'s staff.', motto: '[UIA] ' + mainLog.newRank + ' ' + tag + ((theStrikesNum) ? ' x' + theStrikesNum : ''), promoter: mainLog.logger}});
														});
													}
													else {
														getPromoTag(mainLog.logger, function(tag) {
															res.json({success: true, panel: {color: 'grey', text: 'This member bought a rank and is Security+. Use the group gate.', motto: '[UIA] ' + mainLog.newRank + ' ' + tag + ((theStrikesNum) ? ' x' + theStrikesNum : ''), promoter: mainLog.logger}});
														});
													}
												}
											}
											break;
										}
									}).sort('-createdAt');
								}).sort('-createdAt');
							}).sort('-createdAt');
						}).sort('-createdAt');
					}).sort('-createdAt');
				}).sort('-createdAt');
			}
		}).sort('-createdAt');
	});

	function getPromoTag(username, cont) {
		User.findOne({
			name: username
		}, function(err, user) {
			if (err) throw err;
		 
		 	var tag;
			if (!user) {
				tag = '-Unknown Promotion Tag-';
			} else {
				tag = '[' + user.promoTag + ']';
			}

			cont(tag);
		});
	}

	app.post('/api/signup', function(req, res) {
		if (!req.body.registerName || !req.body.registerPassword || !req.body.registerEmail) {
			res.json({success: false, msg: 'Please input your Habbo username, your email, and a password.'});
		} else {
			var newUser = new User({
				name: req.body.registerName,
				password: req.body.registerPassword,
				email: req.body.registerEmail,
				allowedRoles: [{"role" : "training-logs", "perm" : [true, true, true, false]},
				{"role" : "promotion-logs", "perm" : [true, true, true, false]},
				{"role" : "warning-logs", "perm" : [false, false, false, false]},
				{"role" : "demotion-logs", "perm" : [false, false, false, false]},
				{"role" : "strike-logs", "perm" : [false, false, false, false]},
				{"role" : "fired-logs", "perm" : [false, false, false, false]},
				{"role" : "transfer-logs", "perm" : [false, false, false, false]},
				{"role" : "rank-selling-logs", "perm" : [false, false, false, false]},
				{"role" : "loa-logs", "perm" : [true, true, true, false]}]
			});
			// save the user
			newUser.save(function(err) {
				if (err) {
					return res.json({success: false, msg: 'An account already exists with that username or email.'});
				}
				res.json({success: true, msg: 'Requested membership successfully. Please wait for an admin to accept it.'});
			});
		}
	})

	app.post('/api/authenticate', function(req, res) {
		User.findOne({
			name: req.body.name
		}, function(err, user) {
			if (err) throw err;

			if (!user) {
				res.send({success: false, msg: 'Authentication failed. User not found.'});
			} else {
				// check if password matches
				user.comparePassword(req.body.password, function (err, isMatch) {
					if (isMatch && !err) {
						if(user.banned) {
							res.send({success: false, msg: 'Authentication failed. Your account has been disabled. Please contact the founders in base.'});
						}
						else if(!user.valid) {
							res.send({success: false, msg: 'Authentication failed. Your account has not been accepted yet.'});
						} else {
							user.tokenTimestamp = new Date();
							user.save(function(err) {
								if (err) {
									return res.json({success: false, msg: 'Unkown error.'});
								}
								// if user is found and password is right create a token
								var token = jwt.encode(user, config.secret);
								// return the information including token as JSON
								res.json({success: true, token: 'JWT ' + token});
							});
						}
					} else {
						res.send({success: false, msg: 'Authentication failed. Wrong password.'});
					}
				});
			}
		});
	});

	app.get('/api/memberinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
		var token = getToken(req.headers);
		if (token) {
			var decoded = jwt.decode(token, config.secret);
			User.findOne({
				name: decoded.name
			}, function(err, user) {
				if (err) throw err;

				if (!user) {
					return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
				} else {
					handleTokenTimeout(user, res, function(){
						if(user.firstLogin) {
							user.firstLogin = false;
							user.save(function(err) {
								res.json({success: true, theUser: user, fstLogin: true});
							});
						} else {
							res.json({success: true, theUser: user, fstLogin: false});
						}
					});
				}
			});
		} else {
			return res.status(403).send({success: false, msg: 'No token provided.'});
		}
	});

	app.post('/api/addLog', passport.authenticate('jwt', { session: false}), function(req, res) {
		var token = getToken(req.headers);
		if (token) {
			var decoded = jwt.decode(token, config.secret);
			User.findOne({
				name: decoded.name
			}, function(err, user) {
				if (err) throw err;

				if (!user) {
					return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
				} else {
					handleTokenTimeout(user, res, function(){
						var valid = false;
						for (var i = user.allowedRoles.length - 1; i >= 0; i--) {
							if(user.allowedRoles[i].role == req.body.type
								&& user.allowedRoles[i].perm[0]) {
								valid = true;
							}
						}

						if(valid) {

							if(!user.promoTag || !user.promoTag.trim()
								|| !user.rank || !user.rank.trim()) {
								return res.status(403).send({success: false, msg: 'Please go to your profile and update your rank and promotion tag.'});
							}

							req.body.logger = user.name;
							req.body.loggerRank = user.rank;

							if(req.body.prevRank) {
								req.body.prevRank = req.body.prevRank.replace(noTagsRegex, '');
							}
							if(req.body.oldRank) {
								req.body.oldRank = req.body.oldRank.replace(noTagsRegex, '');
							}
							if(req.body.offeredRank) {
								req.body.offeredRank = req.body.offeredRank.replace(noTagsRegex, '');
							}
							if(req.body.newRank) {
								req.body.newRank = req.body.newRank.replace(noTagsRegex, '');
							}

							var newLog = new logsDict[req.body.type](req.body);
							if(!newLog) {
								return res.status(403).send({success: false, msg: 'Internal error.'});
							}
							newLog.save(function(err) {
								if (err) {
									return handleError(err, res);
								}

								if(req.body.username) {
									if(req.body.newRank ||
										(req.body.offeredRank && req.body.fullTransferOrNearMiss == 'fullTransfer')) {
										User.findOne({name: new RegExp("^" + escapeRegExp(req.body.username.trim()) + "$", "i")}, function(nerr10, user10) {
											if (nerr10) throw nerr10;
											if (user10) {
												if(req.body.newRank) {
													user10.rank = req.body.newRank;
												} else {
													user10.rank = req.body.offeredRank;
												}
												user10.save(function(err) {
													if (err) {
														return res.json({success: false, msg: 'Unkown error.'});
													}

													if(req.body.type == 'training-logs') {
														user.trainAtRisk = new Date();
														user.save(function(err) {
															if (err) {
																return res.json({success: false, msg: 'Unkown error.'});
															}
															res.json({success: true, msg: 'Your log has been stored.'});
														});
													} else {
														res.json({success: true, msg: 'Your log has been stored.'});
													}
												});
											} else {
												if(req.body.type == 'training-logs') {
													user.trainAtRisk = new Date();
													user.save(function(err) {
														if (err) {
															return res.json({success: false, msg: 'Unkown error.'});
														}
														res.json({success: true, msg: 'Your log has been stored.'});
													});
												} else {
													res.json({success: true, msg: 'Your log has been stored.'});
												}
											}
										}).sort('-createdAt');
									} else {
										if(req.body.type == 'training-logs') {
											user.trainAtRisk = new Date();
											user.save(function(err) {
												if (err) {
													return res.json({success: false, msg: 'Unkown error.'});
												}
												res.json({success: true, msg: 'Your log has been stored.'});
											});
										} else {
											res.json({success: true, msg: 'Your log has been stored.'});
										}
									}
								} else {
									if(req.body.type == 'training-logs') {
										user.trainAtRisk = new Date();
										user.save(function(err) {
											if (err) {
												return res.json({success: false, msg: 'Unkown error.'});
											}
											res.json({success: true, msg: 'Your log has been stored.'});
										});
									} else {
										res.json({success: true, msg: 'Your log has been stored.'});
									}
								}
							});
						} else {
							return res.status(403).send({success: false, msg: 'User with no permissions to do this operation.'});
						}
					});
				}
			});
		} else {
			return res.status(403).send({success: false, msg: 'No token provided.'});
		}
	});

	app.post('/api/editLog', passport.authenticate('jwt', { session: false}), function(req, res) {
		var token = getToken(req.headers);
		if (token) {
			var decoded = jwt.decode(token, config.secret);
			User.findOne({
				name: decoded.name
			}, function(err, user) {
				if (err) throw err;

				if (!user) {
					return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
				} else {
					handleTokenTimeout(user, res, function(){
						var valid, valid2 = false;
						for (var i = user.allowedRoles.length - 1; i >= 0; i--) {
							if(user.allowedRoles[i].role == req.body.type
								&& user.allowedRoles[i].perm[2]) {
								valid = true;
								break;
							}
						}

						valid2 = user.type == 'Admin' || user.type == 'Owner';

						if(valid || valid2) {
							if(!user.promoTag || !user.promoTag.trim()
								|| !user.rank || !user.rank.trim()) {
								return res.status(403).send({success: false, msg: 'Please go to your profile and update your rank and promotion tag.'});
							}

							var editLog = logsDict[req.body.type];
							if(!editLog) {
								return res.status(403).send({success: false, msg: 'Internal error.'});
							}
							editLog.findOne({
								_id: req.body._id
							}, function(err, newLog) {
								if (err) throw err;

								if (!newLog) {
									return res.status(403).send({success: false, msg: 'Log not found.'});
								} else {

									if(!valid2 && newLog.logger != user.name) {
										return res.status(403).send({success: false, msg: 'User with no permissions to do this operation.'});
									}

									newLog.username = req.body.username;
									newLog.passOrFail = req.body.passOrFail;
									newLog.recSecTrainOrHR = req.body.recSecTrainOrHR;
									newLog.prevRank = req.body.prevRank;
									newLog.agency = req.body.agency;
									newLog.oldRank = req.body.oldRank;
									newLog.offeredRank = req.body.offeredRank;
									newLog.fullTransferOrNearMiss = req.body.fullTransferOrNearMiss;
									newLog.warnNumber = req.body.warnNumber;
									newLog.strikeNumber = req.body.strikeNumber;
									newLog.reason = req.body.reason;
									newLog.screenshots = req.body.screenshots;
									newLog.price = req.body.price;
									newLog.newRank = req.body.newRank;
									newLog.startDate = req.body.startDate;
									newLog.endDate = req.body.endDate;
									newLog.approvedBy = req.body.approvedBy;
									newLog.notes = req.body.notes;
									newLog.username = req.body.username;
									newLog.rehired = req.body.rehired;
									newLog.removed = req.body.removed;

									newLog.save(function(err) {
										if (err) {
											return handleError(err, res);
										}

										if(req.body.username) {
											if(req.body.newRank ||
												(req.body.offeredRank && req.body.fullTransferOrNearMiss == 'fullTransfer')) {
												User.findOne({name: new RegExp("^" + escapeRegExp(req.body.username.trim()) + "$", "i")}, function(nerr10, user10) {
													if (nerr10) throw nerr10;
													if (user10) {
														if(req.body.newRank) {
															user10.rank = req.body.newRank;
														} else {
															user10.rank = req.body.offeredRank;
														}
														user10.save(function(err) {
															res.json({success: true, msg: 'Your log has been updated.'});
														});
													} else {
														res.json({success: true, msg: 'Your log has been updated.'});
													}
												}).sort('-createdAt');
											} else {
												res.json({success: true, msg: 'Your log has been updated.'});
											}
										} else {
											res.json({success: true, msg: 'Your log has been updated.'});
										}
									});
								}
							});
						} else {
							return res.status(403).send({success: false, msg: 'User with no permissions to do this operation.'});
						}
					});
				}
			});
		} else {
			return res.status(403).send({success: false, msg: 'No token provided.'});
		}
	});

	app.post('/api/deleteLog', passport.authenticate('jwt', { session: false}), function(req, res) {
		var token = getToken(req.headers);
		if (token) {
			var decoded = jwt.decode(token, config.secret);
			User.findOne({
				name: decoded.name
			}, function(err, user) {
				if (err) throw err;

				if (!user) {
					return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
				} else {
					handleTokenTimeout(user, res, function(){
						var valid, valid2 = false;
						for (var i = user.allowedRoles.length - 1; i >= 0; i--) {
							if(user.allowedRoles[i].role == req.body.type
								&& user.allowedRoles[i].perm[3]) {
								valid = true;
								break;
							}
						}

						valid2 = user.type == 'Owner';

						if(valid || valid2) {

							if(!user.promoTag || !user.promoTag.trim()
								|| !user.rank || !user.rank.trim()) {
								return res.status(403).send({success: false, msg: 'Please go to your profile and update your rank and promotion tag.'});
							}

							var deleteLog = logsDict[req.body.type];
							if(!deleteLog) {
								return res.status(403).send({success: false, msg: 'Internal error.'});
							}
							deleteLog.findOne({
								_id: req.body._id
							}, function(err, newLog) {
								if (err) throw err;

								if (!newLog) {
									return res.status(403).send({success: false, msg: 'Log not found.'});
								} else {

									if(!valid2 && newLog.logger != user.name) {
										return res.status(403).send({success: false, msg: 'User with no permissions to do this operation.'});
									}

									newLog.remove(function(err) {
										if (err) {
											return handleError(err, res);
										}
										if(req.body.type == 'training-logs') {
										user.trainAtRisk = null;
											user.save(function(err) {
												if (err) {
													return res.json({success: false, msg: 'Unkown error.'});
												}
												res.json({success: true, msg: 'Your log has been deleted.'});
											});
										} else {
											res.json({success: true, msg: 'Your log has been deleted.'});
										}
									});
								}
							});
						} else {
							return res.status(403).send({success: false, msg: 'User with no permissions to do this operation.'});
						}
					});
				}
			});
		} else {
			return res.status(403).send({success: false, msg: 'No token provided.'});
		}
	});

	app.post('/api/searchLog', passport.authenticate('jwt', { session: false}), function(req, res) {
		var token = getToken(req.headers);
		if (token) {
			var decoded = jwt.decode(token, config.secret);
			User.findOne({
				name: decoded.name
			}, function(err, user) {
				if (err) throw err;

				if (!user) {
					return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
				} else {
					handleTokenTimeout(user, res, function(){
						var valid = false;
						for (var i = user.allowedRoles.length - 1; i >= 0; i--) {
							if(user.allowedRoles[i].role == req.body.type
								&& user.allowedRoles[i].perm[1]) {
								valid = true;
							}
						}

						if(valid) {
							var query = {
								createdAt: {
									$lt: req.body.lastCreatedAt
								}
							}

							if(req.body.username && req.body.username.trim()) {
								query.username = new RegExp("^" + escapeRegExp(req.body.username.trim()), "i");
							}

							if(req.body.logger && req.body.logger.trim()) {
								query.logger = new RegExp("^" + escapeRegExp(req.body.logger.trim()), "i");
							}

							if(!logsDict[req.body.type]) {
								return res.status(403).send({success: false, msg: 'Internal error.'});
							}
							logsDict[req.body.type].find(query, function(err, logs) {
								if (err) throw err;

								res.json({success: true, logs: logs});
							}).limit(100).sort('-createdAt');
						} else {
							return res.status(403).send({success: false, msg: 'User with no permissions to do this operation.'});
						}
					});
				}
			});
		} else {
			return res.status(403).send({success: false, msg: 'No token provided.'});
		}
	});

	app.post('/api/searchPending', passport.authenticate('jwt', { session: false}), function(req, res) {
		var token = getToken(req.headers);
		if (token) {
			var decoded = jwt.decode(token, config.secret);
			User.findOne({
				name: decoded.name
			}, function(err, user) {
				if (err) throw err;

				if (!user) {
					return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
				} else {
					handleTokenTimeout(user, res, function(){
						var valid = (user.type == 'Admin' || user.type == 'Owner');

						if(valid) {
							var query;
							if(user.type == 'Owner') {
								query = {
									createdAt: {
										$lt: req.body.lastCreatedAt
									},
									valid: false,
									name: {
										$ne: user.name
									}
								}
							} else {
								query = {
									createdAt: {
										$lt: req.body.lastCreatedAt
									},
									type: "Regular",
									valid: false,
									name: {
										$ne: user.name
									}
								}
							}

							if(req.body.name && req.body.name.trim()) {
								query.name.$regex = new RegExp("^" + escapeRegExp(req.body.name.trim()), "i");
							}

							User.find(query, function(err, pending) {
								if (err) throw err;

								res.json({success: true, pending: pending});
							}).limit(100).sort('-createdAt');
						} else {
							return res.status(403).send({success: false, msg: 'User with no permissions to do this operation.'});
						}
					});
				}
			});
		} else {
			return res.status(403).send({success: false, msg: 'No token provided.'});
		}
	});

	app.post('/api/searchUsers', passport.authenticate('jwt', { session: false}), function(req, res) {
		var token = getToken(req.headers);
		if (token) {
			var decoded = jwt.decode(token, config.secret);
			User.findOne({
				name: decoded.name
			}, function(err, user) {
				if (err) throw err;

				if (!user) {
					return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
				} else {
					handleTokenTimeout(user, res, function(){
						var valid = (user.type == 'Admin' || user.type == 'Owner');

						if(valid) {
							var query;
							if(user.type == 'Owner') {
								if(!req.body.banned) {
									query = {
										createdAt: {
											$lt: req.body.lastCreatedAt
										},
										name: {
											$ne: user.name
										}
									}
								} else {
									query = {
										createdAt: {
											$lt: req.body.lastCreatedAt
										},
										name: {
											$ne: user.name
										},
										banned: true
									}
								}
								if(req.body.admin) {
									query.type = { $ne: 'Regular' }
								}
							} else {
								if(!req.body.banned) {
									query = {
										createdAt: {
											$lt: req.body.lastCreatedAt
										},
										type: "Regular",
										name: {
											$ne: user.name
										}
									}
								} else {
									query = {
										createdAt: {
											$lt: req.body.lastCreatedAt
										},
										type: "Regular",
										name: {
											$ne: user.name
										},
										banned: true
									}
								}
							}

							if(req.body.name && req.body.name.trim()) {
								query.name.$regex = new RegExp("^" + escapeRegExp(req.body.name.trim()), "i");
							}

							if(req.body.promoTag && req.body.promoTag.trim()) {
								query.promoTag = new RegExp("^" + escapeRegExp(req.body.promoTag.trim()), "i");
							}

							User.find(query, function(err, newUsers) {
								if (err) throw err;

								res.json({success: true, users: newUsers});
							}).limit(100).sort('-createdAt');
						} else {
							return res.status(403).send({success: false, msg: 'User with no permissions to do this operation.'});
						}
					});
				}
			});
		} else {
			return res.status(403).send({success: false, msg: 'No token provided.'});
		}
	});

	app.post('/api/searchTrainers', passport.authenticate('jwt', { session: false}), function(req, res) {
		var token = getToken(req.headers);
		if (token) {
			var decoded = jwt.decode(token, config.secret);
			User.findOne({
				name: decoded.name
			}, function(err, user) {
				if (err) throw err;

				if (!user) {
					return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
				} else {
					handleTokenTimeout(user, res, function(){
						var valid = (user.type == 'Admin' || user.type == 'Owner');

						if(valid) {
							var query;
							query = {
								$or: [
									{trainAtRisk: {
										$lt: req.body.lastTrained
									}},
									{trainAtRisk: null}
								],
								valid: true,
								banned: false
							}

							if(req.body.name && req.body.name.trim()) {
								query.name.$regex = new RegExp("^" + escapeRegExp(req.body.name.trim()), "i");
							}

							User.find(query, {password: 0, valid: 0, type: 0, tokenTimestamp: 0, firstLogin: 0, banned: 0}, function(err, newUsers) {
								if (err) throw err;
								
								res.json({success: true, trainers: newUsers});
							}).limit(100).sort('+trainAtRisk');
						} else {
							return res.status(403).send({success: false, msg: 'User with no permissions to do this operation.'});
						}
					});
				}
			});
		} else {
			return res.status(403).send({success: false, msg: 'No token provided.'});
		}
	});

	// tempFunc = function(usersArr, index) {
	// 	User.findOne({name: usersArr[index].name}, function(arrErr, arrUser) {
	// 		if (arrErr) throw arrErr;
	// 		if(arrUser) {
	// 			if(!arrUser.banned) {
	// 				arrUser.banned = false;
	// 			}
	// 			arrUser.trainAtRisk = usersArr[index].date;

	// 			arrUser.save(function(arrBestErr) {
	// 				if (arrBestErr) throw arrBestErr;

	// 				if(index+1 < usersArr.length)
	// 					tempFunc(usersArr, index+1);
	// 			});
	// 		} else {
	// 			console.log("ERROR: THIS USER DOES NOT EXIST: " + usersArr[index].name);

	// 			if(index+1 < usersArr.length)
	// 				tempFunc(usersArr, index+1);
	// 		}
	// 	});
	// }

	// TrainingLogs.find({}, function(tempErr, tempLogs) {
	// 	if (tempErr) throw tempErr;

	// 	var theTempUsers = {};
	// 	User.find({}, function(tempErr1, tempLogs2) {
	// 		if (tempErr1) throw tempErr1;

	// 		for (var i = tempLogs2.length - 1; i >= 0; i--) {
	// 			theTempUsers[tempLogs2[i].name] = null;
	// 		}

	// 		for (var i = tempLogs.length - 1; i >= 0; i--) {
	// 			theTempUsers[tempLogs[i].logger] = tempLogs[i].createdAt;
	// 		}

	// 		var theTempUsersArr = [];
	// 		for (var key in theTempUsers) {
	// 			if (theTempUsers.hasOwnProperty(key)) {
	// 				theTempUsersArr.push({name: key, date: theTempUsers[key]});
	// 			}
	// 		}
	// 		tempFunc(theTempUsersArr, 0);
	// 	}).sort('-createdAt');
	// }).sort('-createdAt');

	app.post('/api/decidedPending', passport.authenticate('jwt', { session: false}), function(req, res) {
		var token = getToken(req.headers);
		if (token) {
			var decoded = jwt.decode(token, config.secret);
			User.findOne({
				name: decoded.name
			}, function(err, user) {
				if (err) throw err;

				if (!user) {
					return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
				} else {
					handleTokenTimeout(user, res, function(){
						var valid = (user.type == 'Admin' || user.type == 'Owner');

						if(valid) {
							var query;
							if(user.type == 'Owner') {
								query = {
									_id: req.body._id
								}
							} else {
								query = {
									type: "Regular",
									_id: req.body._id
								}
							}

							User.findOne(query, function(err, pending) {
								if (err) throw err;

								if (!pending) {
									return res.status(403).send({success: false, msg: 'Member not found.'});
								}

								if(req.body.accept) {
									pending.valid = true;
					
									pending.save(function(err) {
										if (err) {
											return handleError(err, res);
										}
										res.json({success: true, msg: "The member's request has been accepted."});
									});
								} else {
									pending.remove(function(err) {
										if (err) {
											return handleError(err, res);
										}
										res.json({success: true, msg: "The member's request has been denied."});
									});
								}

								//res.json({success: true, pending: pending});
							});
						} else {
							return res.status(403).send({success: false, msg: 'User with no permissions to do this operation.'});
						}
					});
				}
			});
		} else {
			return res.status(403).send({success: false, msg: 'No token provided.'});
		}
	});

	app.post('/api/decidedPendingBan', passport.authenticate('jwt', { session: false}), function(req, res) {
		var token = getToken(req.headers);
		if (token) {
			var decoded = jwt.decode(token, config.secret);
			User.findOne({
				name: decoded.name
			}, function(err, user) {
				if (err) throw err;

				if (!user) {
					return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
				} else {
					handleTokenTimeout(user, res, function(){
						var valid = (user.type == 'Admin' || user.type == 'Owner');

						if(valid) {
							var query;
							if(user.type == 'Owner') {
								query = {
									_id: req.body._id
								}
							} else {
								query = {
									type: "Regular",
									_id: req.body._id
								}
							}

							User.findOne(query, function(err, newUser) {
								if (err) throw err;

								if (!newUser) {
									return res.status(403).send({success: false, msg: 'Member not found.'});
								}

								newUser.banned = true;
				
								newUser.save(function(err) {
									if (err) {
										return handleError(err, res);
									}
									res.json({success: true, msg: "The member has been banned."});
								});

								//res.json({success: true, pending: pending});
							});
						} else {
							return res.status(403).send({success: false, msg: 'User with no permissions to do this operation.'});
						}
					});
				}
			});
		} else {
			return res.status(403).send({success: false, msg: 'No token provided.'});
		}
	});

	app.post('/api/editProfile', passport.authenticate('jwt', { session: false}), function(req, res) {
		var token = getToken(req.headers);
		if (token) {
			var decoded = jwt.decode(token, config.secret);
			User.findOne({
				name: decoded.name
			}, function(err, user) {
				if (err) throw err;

				if (!user) {
					return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
				} else {
					handleTokenTimeout(user, res, function(){

						if(!req.body.promoTag || !req.body.promoTag.trim()
							|| !req.body.rank || !req.body.rank.trim()) {
							return res.status(403).send({success: false, msg: 'Please update your rank and promotion tag.'});
						}

						user.rank = req.body.rank.replace(noTagsRegex, '');
						user.promoTag = req.body.promoTag;
						user.email = req.body.email;

						User.findOne({
							promoTag: req.body.promoTag
						}, function(err, promoUser) {
							if (err) throw err;

							if (promoUser && promoUser.name != user.name) {
								return res.status(403).send({success: false, msg: 'This promotion tag is already in use. Please pick another.'});
							}
							
							user.save(function(err) {
								if (err) {
									return handleError(err, res);
								}
								res.json({success: true, msg: 'Your profile has been updated.'});
							});
						});
					});
				}
			});
		} else {
			return res.status(403).send({success: false, msg: 'No token provided.'});
		}
	});

	app.post('/api/changePw', passport.authenticate('jwt', { session: false}), function(req, res) {
		var token = getToken(req.headers);
		if (token) {
			var decoded = jwt.decode(token, config.secret);
			User.findOne({
				name: decoded.name
			}, function(err, user) {
				if (err) throw err;

				if (!user) {
					return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
				} else {

					// check if password matches
					user.comparePassword(req.body.oldPass, function (err, isMatch) {
						if (isMatch && !err) {
							handleTokenTimeout(user, res, function(){
								if(!user.promoTag || !user.promoTag.trim()
									|| !user.rank || !user.rank.trim()) {
									return res.status(403).send({success: false, msg: 'Please update your rank and promotion tag.'});
								}

								user.password = req.body.pass;

								user.save(function(err) {
									if (err) {
										return handleError(err, res);
									}
									res.json({success: true, msg: 'Your password has been changed.'});
								});
							});
						} else {
							res.send({success: false, msg: 'Authentication failed. Wrong password.'});
						}
					});
				}
			});
		} else {
			return res.status(403).send({success: false, msg: 'No token provided.'});
		}
	});

	app.post('/api/editUser', passport.authenticate('jwt', { session: false}), function(req, res) {
		var token = getToken(req.headers);
		if (token) {
			var decoded = jwt.decode(token, config.secret);
			User.findOne({
				name: decoded.name
			}, function(err, user) {
				if (err) throw err;

				if (!user) {
					return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
				} else {
					handleTokenTimeout(user, res, function(){
						// var valid, valid2 = false;
						// for (var i = user.allowedRoles.length - 1; i >= 0; i--) {
						// 	if(user.allowedRoles[i].role == req.body.type
						// 		&& user.allowedRoles[i].perm[2] && user.name == req.body.logger) {
						// 		valid = true;
						// 	}
						// }

						valid = user.type == 'Admin' || user.type == 'Owner';

						if(valid) {

							User.findOne({
								_id: req.body._id
							}, function(err, newLog) {
								if (err) throw err;

								if (!newLog) {
									return res.status(403).send({success: false, msg: 'User not found.'});
								} else {

									newLog.name = req.body.name;
									newLog.valid = req.body.valid;
									if(user.type == 'Owner')
										newLog.type = req.body.type;
									if(req.body.promoTag)
										newLog.promoTag = req.body.promoTag;
									if(req.body.rank)
										newLog.rank = req.body.rank;
									newLog.email = req.body.email;
									newLog.firstLogin = req.body.firstLogin;
									newLog.banned = req.body.banned;

									if(user.type == 'Owner') {
										if(req.body.type == 'Owner') {
											for (var i = req.body.allowedRoles.length - 1; i >= 0; i--) {
												for (var j = req.body.allowedRoles[i].perm.length - 1; j >= 0; j--) {
													newLog.allowedRoles[i].perm[j] = true;
													newLog.markModified('allowedRoles.' + i + '.perm.' + j);
												}
											}
										} else if(req.body.type == 'Admin') {
											for (var i = req.body.allowedRoles.length - 1; i >= 0; i--) {
												for (var j = req.body.allowedRoles[i].perm.length - 1; j >= 0; j--) {
													if(j != req.body.allowedRoles[i].perm.length - 1) {
														newLog.allowedRoles[i].perm[j] = true;
														newLog.markModified('allowedRoles.' + i + '.perm.' + j);
													} else {
														newLog.allowedRoles[i].perm[j] = req.body.allowedRoles[i].perm[j];
														newLog.markModified('allowedRoles.' + i + '.perm.' + j);
													}
												}
											}
										} else {
											newLog.allowedRoles = req.body.allowedRoles;
										}
									} else if(user.type == 'Admin') {
										if(req.body.type == 'Owner' || req.body.type == 'Admin') {
											return res.status(403).send({success: false, msg: 'User with no permissions to do this operation.'});
										} else {
											for (var i = req.body.allowedRoles.length - 1; i >= 0; i--) {
												for (var j = req.body.allowedRoles[i].perm.length - 1; j >= 0; j--) {
													if(j != req.body.allowedRoles[i].perm.length - 1) {
														newLog.allowedRoles[i].perm[j] = req.body.allowedRoles[i].perm[j];
														newLog.markModified('allowedRoles.' + i + '.perm.' + j);
													}
												}
											}
										}
									} else {
										return res.status(403).send({success: false, msg: 'User with no permissions to do this operation.'});
									}

									newLog.save(function(err) {
										if (err) {
											return handleError(err, res);
										}
										res.json({success: true, msg: 'This Member has been updated.'});
									});
								}
							});
						} else {
							return res.status(403).send({success: false, msg: 'User with no permissions to do this operation.'});
						}
					});
				}
			});
		} else {
			return res.status(403).send({success: false, msg: 'No token provided.'});
		}
	});

	function escapeRegExp(str) {
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}

	function handleTokenTimeout(user, res, cb) {
		if(user.banned) {
			return res.status(401).send({success: false, msg: 'Authentication failed. Your account has been disabled. Please contact the founders in base.'});
		} else if(new Date().getTime() > user.tokenTimestamp.addMinutes(TOKEN_TIMEOUT).getTime()) {
			return res.status(401).send({success: false, msg: 'Token expired.'});
		} else if(!user.valid) {
			return res.status(401).send({success: false, msg: 'User is not valid.'});
		} else {
			user.tokenTimestamp = new Date();
			user.save(function(err) {
				if (err) {
					return res.json({success: false, msg: 'Unkown error.'});
				}
				cb()
			});
		}
	}

	function handleError(err, res) {
		var theItem = "";
		if(!err) {
			return res.json({success: false, msg: 'Unkown error.'});
		} else if(!err.errors) {
			return res.json({success: false, msg: 'Unkown error.'});
		} else if('username' in err.errors) {
			theItem = 'username';
		} else if('passOrFail' in err.errors) {
			theItem = 'passOrFail';
		} else if('recSecTrainOrHR' in err.errors) {
			theItem = 'recSecTrainOrHR';
		} else if('prevRank' in err.errors) {
			theItem = 'prevRank';
		} else if('agency' in err.errors) {
			theItem = 'agency';
		} else if('oldRank' in err.errors) {
			theItem = 'oldRank';
		} else if('offeredRank' in err.errors) {
			theItem = 'offeredRank';
		} else if('fullTransferOrNearMiss' in err.errors) {
			theItem = 'fullTransferOrNearMiss';
		} else if('warnNumber' in err.errors) {
			theItem = 'warnNumber';
		} else if('strikeNumber' in err.errors) {
			theItem = 'strikeNumber';
		} else if('reason' in err.errors) {
			theItem = 'reason';
		} else if('screenshots' in err.errors) {
			theItem = 'screenshots';
		} else if('price' in err.errors) {
			theItem = 'price';
		} else if('newRank' in err.errors) {
			theItem = 'newRank';
		} else if('startDate' in err.errors) {
			theItem = 'startDate';
		} else if('endDate' in err.errors) {
			theItem = 'endDate';
		} else if('approvedBy' in err.errors) {
			theItem = 'approvedBy';
		} else if('notes' in err.errors) {
			theItem = 'notes';
		} else {
			return res.json({success: false, msg: 'Unkown error.'});
		}
		return res.json({success: false, msg: err.errors[theItem].message});
	}

	function checkRequired(val) {
		if(val !== undefined && val !== null) {
			if(typeof val === 'string' || val instanceof String) {
				if(val.trim() != '') {
					return true;
				} else {
					return false;
				}
			} else {
				return true;
			}
		}
		return false;
	}

	function checkEnum(val, enumer) {
		for (var i = enumer.length - 1; i >= 0; i--) {
			if(val == enumer[i])
				return true;
		}
		return false;
	}

	function checkRange(val, range) {
		if(range.length == 1) {
			if(val >= range[0]) {
				return true;
			} else {
				return false;
			}
		} else if(range.length >= 2) {
			if(val >= range[0] && val <= range[1]) {
				return true;
			} else {
				return false;
			}
		}
		return false;
	}

	function checkMinLength(val, length) {
		return val.length >= length;
	}

	Date.prototype.addMinutes= function(h){
		this.setMinutes(this.getMinutes()+h);
		return this;
	}

	getToken = function (headers) {
		if (headers && headers.authorization) {
			var parted = headers.authorization.split(' ');
			if (parted.length === 2) {
				return parted[1];
			} else {
				return null;
			}
		} else {
			return null;
		}
	};

	// frontend routes =========================================================
	// route to handle all angular requests
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html');
	});



};