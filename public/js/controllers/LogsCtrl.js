angular.module('LogsCtrl', []).controller('LogsController', function($http, $scope, $state, AuthService, AUTH_EVENTS, API_ENDPOINT) {

	//$scope.user = {};

	$scope.alert = null;
	//$scope.alert2 = null;
	//$scope.requesting = false;

	$scope.memberCatsEmpty = [true, true, true];
	$scope.memberRoles = {};
	$scope.memberName = "";
	$scope.memberType = "";

	$scope.currentState = $state;
	$scope.logTitle = null;
	$scope.logTitleSingular = null;
	$scope.logIcon = null;
	$scope.logs = [];
	$scope.logToDelete = null;

	$scope.comments = [];

	$scope.search = {};
	$scope.showSpinner = false;
	$scope.loadMoreShow = true;

	//$scope.login = function() {
	//	AuthService.login($scope.user).then(function(msg) {
	//		$state.go('main');
	//	}, function(errMsg) {
	//		$scope.alert = {msg: errMsg, strong: "Login failed!"};
	//	});
	//};

	//$scope.signup = function() {
	//	if(!$scope.requesting) {
	//		$scope.requesting = true;
	//	} else {
	//		AuthService.register($scope.user).then(function(msg) {
	//			$scope.alert2 = {type: "success", msg: msg, strong: "Registration succeeded!"};
	//			$scope.requesting = false;
	//			$scope.user = {};
	//		}, function(errMsg) {
	//			$scope.alert2 = {msg: errMsg, strong: "Registration failed!"};
	//		});
	//	}
	//};

	$scope.recSecTrainOrHRDict = {
		rec: "Recruit",
		sec: "Security",
		train: "Train",
		hr: "Operative"
	}

	$scope.passOrFailDict = {
		pass: "Pass",
		fail: "Fail"
	}

	$scope.fullTransferOrNearMissDict = {
		fullTransfer: "Full Transfer",
		nearMiss: "Near Miss"
	}

	$scope.logout = function() {
		AuthService.logout(false);
		$state.go('home');
	};

	$scope.closeAlert = function() {
		$scope.alert = null;
	};

	//$scope.closeAlert2 = function() {
	//	$scope.alert2 = null;
	//};

	$scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
		AuthService.logout(true);
		$state.go('home');
	});

	$scope.$watch(function(){
		return AuthService.isUserInfoReady();
	}, function (newValue) {
		if(newValue != null) {
			$scope.memberCatsEmpty = AuthService.getMemberCatsEmpty();
			$scope.memberRoles = AuthService.getMemberRoles();
			$scope.memberName = AuthService.getMemberName();
			$scope.memberType = AuthService.getMemberType();
			if(!$scope.memberRoles[$scope.currentState.current.name][1]) {
				$state.go('home');
			}
		}
	}, true);

	$scope.agencyPrefix = function(val) {
		if(val == "" || val === null || val === undefined){
			return "XXX";
		}
		var str = val.trim();
		if(str.indexOf(' ') == -1) {
			return str.substring(0,5).toUpperCase();
		} else {
			var agencyHelper = "";
			for (var i = 0, len = str.length; i < len; i++) {
				if(i == 0 || str[i-1] == ' ') {
					agencyHelper += str[i].toUpperCase();
					if(agencyHelper.length >= 5)
						break;
				}
			}
			return agencyHelper;
		}
	}

	var locale = window.navigator.userLanguage || window.navigator.language || window.navigator.browserLanguage || window.navigator.systemLanguage || "en-us";
	var options1 = {weekday: "short", year:"numeric", month:"numeric", day:"numeric"};
	var options2 = {hour:"numeric", minute:"numeric", second: "numeric"};
	
	$scope.getDate = function(theDate) {
		return new Date(theDate).toLocaleString(locale, options1);
	}

	$scope.getTime = function(theDate) {
		return new Date(theDate).toLocaleString(locale, options2);
	}

	$scope.addForm = {
		username : {show: false, tip1: ""},
		passOrFail : {show: false, tip1: ""},
		recSecTrainOrHR : {show: false, tip1: ""},
		prevRank : {show: false, tip1: ""},
		agency : {show: false, tip1: ""},
		oldRank : {show: false, tip1: ""},
		offeredRank : {show: false, tip1: ""},
		fullTransferOrNearMiss : {show: false, tip1: ""},
		warnNumber : {show: false, tip1: ""},
		strikeNumber : {show: false, tip1: ""},
		reason : {show: false, tip1: ""},
		screenshots : {show: false, tip1: ""},
		price : {show: false, tip1: ""},
		newRank : {show: false, tip1: ""},
		startDate : {show: false, tip1: ""},
		endDate : {show: false, tip1: ""},
		approvedBy : {show: false, tip1: ""},
		notes : {show: false, tip1: ""},
		createdAt : {show: false, tip1: ""},
		updatedAt : {show: false, tip1: ""},
		logger : {show: false, tip1: ""},
		loggerRank : {show: false, tip1: ""},
		rehired : {show: false, tip1: ""},
		loa : {show: false, tip1: ""},
		loaRank : {show: false, tip1: ""}
	}

	$scope.resetForm = function() {
		$scope.search.username = null;
		$scope.search.logger = null;
	}

	var lastCreatedAt = null;

	$scope.searchTheLogs = function(reload) {
		$scope.showSpinner = true;
		if(reload) {
			lastCreatedAt = null;
		}
		$http.post(API_ENDPOINT.url + '/searchLog', {logger: $scope.search.logger, username: $scope.search.username, type: $scope.currentState.current.name, lastCreatedAt: lastCreatedAt || ServerDate()}).then(function(result) {
			$scope.showSpinner = false;
			if (result.data.success) {
				if(result.data.logs.length > 0)
					lastCreatedAt = result.data.logs[result.data.logs.length-1].createdAt;
				if(result.data.logs.length == 0)
					$scope.loadMoreShow = false;
				if(reload) {
					$scope.logs = result.data.logs;
				} else {
					$scope.logs = $scope.logs.concat(result.data.logs);
				}
				for (var i = $scope.logs.length - 1; i >= 0; i--) {
					$scope.comments.push(false);
				};
				//$scope.alert = {type: "success", msg: result.data.msg, strong: $scope.logTitleSingular + " added successfully!"};
			} else {
				$scope.alert = {msg: result.data.msg, strong: "Failed to retrieve " + $scope.logTitle + "!"};
			}
		});
	}

	$scope.editLog = function(x) {
		$state.go('edit-' + $scope.currentState.current.name, {obj: x});
	}

	$scope.prepareDelete = function(x) {
		$scope.logToDelete = {_id: x._id, logger: x.logger};
	}

	$scope.deleteLog = function() {
		$scope.logToDelete.type = $scope.currentState.current.name;
		$http.post(API_ENDPOINT.url + '/deleteLog', $scope.logToDelete).then(function(result) {
			if (result.data.success) {
				//$scope.alert = {type: "success", msg: result.data.msg, strong: $scope.logTitleSingular + " deleted successfully!"};
				for (var i = $scope.logs.length - 1; i >= 0; i--) {
					if($scope.logs[i]._id == $scope.logToDelete._id) {
						$scope.logs.splice(i, 1);
						break;
					}
				}
				//$scope.searchTheLogs(true);
			} else {
				$scope.alert = {msg: result.data.msg, strong: "Failed to delete " + $scope.logTitleSingular + "!"};
			}
		});
	}

	$scope.$watch('currentState.current.name', function (newValue) {
		//if(newValue == LogService.getPage() && LogService.isValid()) {
		//	$scope.addForm = LogService.getProperty();
		//	LogService.setValid(false);
		//}
		switch(newValue) {
			case 'training-logs':
				$scope.logTitle = "Training Logs";
				$scope.logTitleSingular = "Training Log";
				$scope.logIcon = "wrench";
				$scope.addForm.username = {show: true, tip1: "Trained"};
				$scope.addForm.passOrFail = {show: true, tip1: "Outcome"};
				$scope.addForm.recSecTrainOrHR = {show: true, tip1: "Training Type"};
				$scope.addForm.notes = {show: true, tip1: "Notes"};
				$scope.addForm.createdAt = {show: true, tip1: "Created At"};
				$scope.addForm.updatedAt = {show: false, tip1: "Updated At"};
				$scope.addForm.logger = {show: true, tip1: "Trainer"};
				$scope.addForm.loggerRank = {show: true, tip1: "Trainer Rank"};
				break;
			case 'promotion-logs':
				$scope.logTitle = "Promotion Logs";
				$scope.logTitleSingular = "Promotion Log";
				$scope.logIcon = "certificate";
				$scope.addForm.username = {show: true, tip1: "Promoted"};
				$scope.addForm.prevRank = {show: true, tip1: "Previous Rank"};
				$scope.addForm.newRank = {show: true, tip1: "New Rank"};
				$scope.addForm.notes = {show: true, tip1: "Notes"};
				$scope.addForm.createdAt = {show: true, tip1: "Created At"};
				$scope.addForm.updatedAt = {show: false, tip1: "Updated At"};
				$scope.addForm.logger = {show: true, tip1: "Promoter"};
				$scope.addForm.loggerRank = {show: true, tip1: "Promoter Rank"};
				break;
			case 'warning-logs':
				$scope.logTitle = "Warning Logs";
				$scope.logTitleSingular = "Warning Log";
				$scope.logIcon = "warning-sign";
				$scope.addForm.username = {show: true, tip1: "Warned"};
				$scope.addForm.warnNumber = {show: true, tip1: "Warning Number"};
				$scope.addForm.reason = {show: true, tip1: "Reason"};
				$scope.addForm.screenshots = {show: true, tip1: "Screenshots"};
				$scope.addForm.notes = {show: true, tip1: "Notes"};
				$scope.addForm.createdAt = {show: true, tip1: "Created At"};
				$scope.addForm.updatedAt = {show: false, tip1: "Updated At"};
				$scope.addForm.logger = {show: true, tip1: "Warner"};
				$scope.addForm.loggerRank = {show: true, tip1: "Warner Rank"};
				$scope.addForm.rehired = {show: true, tip1: "Removed"};
				break;
			case 'demotion-logs':
				$scope.logTitle = "Demotion Logs";
				$scope.logTitleSingular = "Demotion Log";
				$scope.logIcon = "circle-arrow-down";
				$scope.addForm.username = {show: true, tip1: "Demoted"};
				$scope.addForm.prevRank = {show: true, tip1: "Previous Rank"};
				$scope.addForm.newRank = {show: true, tip1: "New Rank"};
				$scope.addForm.reason = {show: true, tip1: "Reason"};
				$scope.addForm.screenshots = {show: true, tip1: "Screenshots"};
				$scope.addForm.notes = {show: true, tip1: "Notes"};
				$scope.addForm.createdAt = {show: true, tip1: "Created At"};
				$scope.addForm.updatedAt = {show: false, tip1: "Updated At"};
				$scope.addForm.logger = {show: true, tip1: "Demoter"};
				$scope.addForm.loggerRank = {show: true, tip1: "Demoter Rank"};
				break;
			case 'strike-logs':
				$scope.logTitle = "Strike Logs";
				$scope.logTitleSingular = "Strike Log";
				$scope.logIcon = "flash";
				$scope.addForm.username = {show: true, tip1: "Striked"};
				$scope.addForm.strikeNumber = {show: true, tip1: "Strike Number"};
				$scope.addForm.reason = {show: true, tip1: "Reason"};
				$scope.addForm.screenshots = {show: true, tip1: "Screenshots"};
				$scope.addForm.notes = {show: true, tip1: "Notes"};
				$scope.addForm.createdAt = {show: true, tip1: "Created At"};
				$scope.addForm.updatedAt = {show: false, tip1: "Updated At"};
				$scope.addForm.logger = {show: true, tip1: "Striker"};
				$scope.addForm.loggerRank = {show: true, tip1: "Striker Rank"};
				$scope.addForm.rehired = {show: true, tip1: "Removed"};
				break;
			case 'fired-logs':
				$scope.logTitle = "Fired Logs";
				$scope.logTitleSingular = "Fired Log";
				$scope.logIcon = "fire";
				$scope.addForm.username = {show: true, tip1: "Fired"};
				$scope.addForm.reason = {show: true, tip1: "Reason"};
				$scope.addForm.screenshots = {show: true, tip1: "Screenshots"};
				$scope.addForm.notes = {show: true, tip1: "Notes"};
				$scope.addForm.createdAt = {show: true, tip1: "Created At"};
				$scope.addForm.updatedAt = {show: false, tip1: "Updated At"};
				$scope.addForm.logger = {show: true, tip1: "Firer"};
				$scope.addForm.loggerRank = {show: true, tip1: "Firer Rank"};
				$scope.addForm.rehired = {show: true, tip1: "Rehired"};
				break;
			case 'transfer-logs':
				$scope.logTitle = "Transfer Logs";
				$scope.logTitleSingular = "Transfer Log";
				$scope.logIcon = "transfer";
				$scope.addForm.username = {show: true, tip1: "Transfered"};
				$scope.addForm.agency = {show: true, tip1: "Previous Agency"};
				$scope.addForm.oldRank = {show: true, tip1: "Old Rank"};
				$scope.addForm.offeredRank = {show: true, tip1: "Offered Rank"};
				$scope.addForm.fullTransferOrNearMiss = {show: true, tip1: "Type of Transfer"};
				$scope.addForm.notes = {show: true, tip1: "Notes"};
				$scope.addForm.createdAt = {show: true, tip1: "Created At"};
				$scope.addForm.updatedAt = {show: false, tip1: "Updated At"};
				$scope.addForm.logger = {show: true, tip1: "Transferer"};
				$scope.addForm.loggerRank = {show: true, tip1: "Transferer Rank"};
				break;
			case 'rank-selling-logs':
				$scope.logTitle = "Rank Selling Logs";
				$scope.logTitleSingular = "Rank Selling Log";
				$scope.logIcon = "usd";
				$scope.addForm.username = {show: true, tip1: "Rank Buyer"};
				$scope.addForm.prevRank = {show: true, tip1: "Previous Rank"};
				$scope.addForm.newRank = {show: true, tip1: "New Rank"};
				$scope.addForm.price = {show: true, tip1: "Price"};
				$scope.addForm.notes = {show: true, tip1: "Notes"};
				$scope.addForm.createdAt = {show: true, tip1: "Created At"};
				$scope.addForm.updatedAt = {show: false, tip1: "Updated At"};
				$scope.addForm.logger = {show: true, tip1: "Rank Seller"};
				$scope.addForm.loggerRank = {show: true, tip1: "Rank Seller Rank"};
				break;
			case 'loa-logs':
				$scope.logTitle = "Leave of Absence (LoA) Logs";
				$scope.logTitleSingular = "Leave of Absence (LoA) Log";
				$scope.logIcon = "hourglass";
				//$scope.addForm.username = {show: true, tip1: "LoA User"};
				$scope.addForm.startDate = {show: true, tip1: "Start Date"};
				$scope.addForm.endDate = {show: true, tip1: "End Date"};
				$scope.addForm.reason = {show: true, tip1: "Reason"};
				$scope.addForm.approvedBy = {show: true, tip1: "Approved By"};
				$scope.addForm.notes = {show: true, tip1: "Notes"};
				$scope.addForm.createdAt = {show: true, tip1: "Created At"};
				$scope.addForm.updatedAt = {show: false, tip1: "Updated At"};
				$scope.addForm.logger = {show: false, tip1: "Member on LoA"};
				$scope.addForm.loggerRank = {show: false, tip1: "Member's Rank"};
				$scope.addForm.loa = {show: true, tip1: "Member on LoA"};
				$scope.addForm.loaRank = {show: true, tip1: "Member's Rank"};
				break;
			default:
				return;
		}
		$scope.searchTheLogs(true);
	}, true);

	Date.prototype.addMinutes= function(h){
		this.setMinutes(this.getMinutes()+h);
		return this;
	}

	//$scope.$on('$stateChangeStart',
	//	function(event, toState, toParams, fromState, fromParams) {
	//		LogService.setPage($scope.currentState.current.name);
	//		LogService.setProperty($scope.addForm);
	//	})
});