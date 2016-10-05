angular.module('EditLogsCtrl', []).controller('EditLogsController', function($http, $scope, $state, AuthService, AUTH_EVENTS, API_ENDPOINT) {

	//$scope.user = {};

	$scope.alert = null;
	//$scope.alert2 = null;
	//$scope.requesting = false;

	$scope.memberCatsEmpty = [true, true, true, true];
	$scope.memberRoles = {};
	$scope.memberName = "";

	$scope.currentState = $state;
	$scope.logTitle = null;
	$scope.logTitleSingular = null;
	$scope.logIcon = null;
	$scope.showSpinner = false;
	$scope.paidPeople = [];

	var LOA_TIME_DISTORTION = 1439;

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
			if(!$scope.memberRoles[$scope.currentState.current.name.substring(5)][2]) {
				$state.go('home');
			}
		}
	}, true);

	$scope.agencyHelper = "XXX";

	$scope.agencyChange = function() {
		$scope.agencyHelper = "";
		if($scope.addForm.agency.val == "" || $scope.addForm.agency.val === null || $scope.addForm.agency.val === undefined){
			$scope.agencyHelper = "XXX";
			return;
		}
		var str = $scope.addForm.agency.val.trim();
		if(str.indexOf(' ') == -1) {
			$scope.agencyHelper = str.substring(0,5).toUpperCase();
		} else {
			for (var i = 0, len = str.length; i < len; i++) {
				if(i == 0 || str[i-1] == ' ') {
					$scope.agencyHelper += str[i].toUpperCase();
					if($scope.agencyHelper.length >= 5)
						break;
				}
			}
		}
	}

	$scope.removePaid = function(index) {
		$scope.paidPeople.splice(index, 1);
	}

	$scope.addPaid = function() {
		if(!$scope.addForm.paidPeople.username.val)
			return;
		
		if(!$scope.addForm.paidPeople.pay.val)
			$scope.addForm.paidPeople.pay.val = 0;
			
		if($scope.addForm.paidPeople.pay.val == 0 && !$scope.addForm.paidPeople.notes.val)
			$scope.addForm.paidPeople.notes.val = "Promotion.";

		$scope.paidPeople.push({username: $scope.addForm.paidPeople.username.val, pay: $scope.addForm.paidPeople.pay.val, notes: $scope.addForm.paidPeople.notes.val});
		$scope.addForm.paidPeople.username.val = "";
		$scope.addForm.paidPeople.notes.val = "";
	}

	if(!$state.params.obj || !$state.params.obj._id) {
		$state.go('home');
		return;
	}

	$scope.addForm = {
		username : {show: false, tip1: "", tip2: "", val: "", dis: false},
		svOrVip : {show: false, tip1: "", tip2: "", val: "", dis: false},
		paidPeople : {show: false, tip1: "", username: {tip1: "", tip2: "", dis: false, val: ""}, pay: {tip1: "", tip2: "", dis: false, val: ""}, notes: {tip1: "", tip2: "", dis: false, val: ""}},
		payDay : {show: false, tip1: "", tip2: "", val: "", dis: false},
		payTime : {show: false, tip1: "", tip2: "", val: "", dis: false},
		passOrFail : {show: false, tip1: "", tip2: "", val: "", dis: false},
		recSecTrainOrHR : {show: false, tip1: "", tip2: "", val: "", dis: false},
		prevRank : {show: false, tip1: "", tip2: "", val: "", dis: false},
		agency : {show: false, tip1: "", tip2: "", val: "", dis: false},
		oldRank : {show: false, tip1: "", tip2: "", val: "", dis: false},
		offeredRank : {show: false, tip1: "", tip2: "", val: "", dis: false},
		fullTransferOrNearMiss : {show: false, tip1: "", tip2: "", val: "", dis: false},
		warnNumber : {show: false, tip1: "", tip2: "", val: "", dis: false},
		strikeNumber : {show: false, tip1: "", tip2: "", val: "", dis: false},
		reason : {show: false, tip1: "", tip2: "", val: "", dis: false},
		screenshots : {show: false, tip1: "", tip2: "", val: "", dis: false},
		price : {show: false, tip1: "", tip2: "", val: "", dis: false},
		newRank : {show: false, tip1: "", tip2: "", val: "", dis: false},
		startDate : {show: false, tip1: "", tip2: "", val: "", dis: false},
		endDate : {show: false, tip1: "", tip2: "", val: "", dis: false},
		approvedBy : {show: false, tip1: "", tip2: "", val: "", dis: false},
		notes : {show: false, tip1: "", tip2: "", val: "", dis: false},
		createdAt : {show: false, tip1: "", tip2: "", val: "", dis: false},
		updatedAt : {show: false, tip1: "", tip2: "", val: "", dis: false},
		logger : {show: false, tip1: "", tip2: "", val: "", dis: false},
		loggerRank : {show: false, tip1: "", tip2: "", val: "", dis: false},
		rehired : {show: false, tip1: "", tip2: "", val: "", dis: false},
		_id : {show: false, tip1: "ID", tip2: "The Log ID", val: $state.params.obj._id, dis: true}
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

	$scope.editLog = function() {
		var content = {type: $scope.currentState.current.name.substring(5), _id: $scope.addForm._id.val};
		switch($scope.currentState.current.name) {
			case 'edit-training-logs':
				content.username = $scope.addForm.username.val;
				content.passOrFail = $scope.addForm.passOrFail.val;
				content.recSecTrainOrHR = $scope.addForm.recSecTrainOrHR.val;
				content.notes = $scope.addForm.notes.val;
				if(!checkRequired(content.username)) {
					$scope.alert = {msg: "The username is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.passOrFail)) {
					$scope.alert = {msg: "The pass or fail option is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkEnum(content.passOrFail, ['pass', 'fail'])) {
					$scope.alert = {msg: "The pass or fail option is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.recSecTrainOrHR)) {
					$scope.alert = {msg: "The type of training is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkEnum(content.recSecTrainOrHR, ['rec', 'sec', 'train', 'hr'])) {
					$scope.alert = {msg: "The type of training is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				break;
			case 'edit-promotion-logs':
				content.username = $scope.addForm.username.val;
				content.prevRank = $scope.addForm.prevRank.val;
				content.newRank = $scope.addForm.newRank.val;
				content.notes = $scope.addForm.notes.val;
				if(!checkRequired(content.username)) {
					$scope.alert = {msg: "The username is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.prevRank)) {
					$scope.alert = {msg: "The previous rank is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.newRank)) {
					$scope.alert = {msg: "The new rank is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				break;
			case 'edit-warning-logs':
				content.username = $scope.addForm.username.val;
				content.warnNumber = $scope.addForm.warnNumber.val;
				content.reason = $scope.addForm.reason.val;
				content.screenshots = $scope.addForm.screenshots.val;
				content.notes = $scope.addForm.notes.val;
				content.removed = $scope.addForm.rehired.val;
				if(!checkRequired(content.username)) {
					$scope.alert = {msg: "The username is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.removed)) {
					$scope.alert = {msg: "The removed option is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.warnNumber)) {
					$scope.alert = {msg: "The warning number must be either 1, 2, or 3.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRange(content.warnNumber, [1, 3])) {
					$scope.alert = {msg: "The warning number must be either 1, 2, or 3.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.reason)) {
					$scope.alert = {msg: "The reason must have at least 20 characters.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkMinLength(content.reason, 20)) {
					$scope.alert = {msg: "The reason must have at least 20 characters.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.screenshots)) {
					$scope.alert = {msg: "The screenshots are invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				break;
			case 'edit-demotion-logs':
				content.username = $scope.addForm.username.val;
				content.prevRank = $scope.addForm.prevRank.val;
				content.newRank = $scope.addForm.newRank.val;
				content.reason = $scope.addForm.reason.val;
				content.screenshots = $scope.addForm.screenshots.val;
				content.notes = $scope.addForm.notes.val;
				if(!checkRequired(content.username)) {
					$scope.alert = {msg: "The username is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.prevRank)) {
					$scope.alert = {msg: "The previous rank is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.newRank)) {
					$scope.alert = {msg: "The new rank is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.reason)) {
					$scope.alert = {msg: "The reason must have at least 20 characters.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkMinLength(content.reason, 20)) {
					$scope.alert = {msg: "The reason must have at least 20 characters.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.screenshots)) {
					$scope.alert = {msg: "The screenshots are invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				break;
			case 'edit-strike-logs':
				content.username = $scope.addForm.username.val;
				content.strikeNumber = $scope.addForm.strikeNumber.val;
				content.reason = $scope.addForm.reason.val;
				content.screenshots = $scope.addForm.screenshots.val;
				content.notes = $scope.addForm.notes.val;
				content.removed = $scope.addForm.rehired.val;
				if(!checkRequired(content.username)) {
					$scope.alert = {msg: "The username is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.removed)) {
					$scope.alert = {msg: "The removed option is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.strikeNumber)) {
					$scope.alert = {msg: "The strike number must be either 1, 2, or 3.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRange(content.strikeNumber, [1, 3])) {
					$scope.alert = {msg: "The strike number must be either 1, 2, or 3.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.reason)) {
					$scope.alert = {msg: "The reason must have at least 20 characters.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkMinLength(content.reason, 20)) {
					$scope.alert = {msg: "The reason must have at least 20 characters.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.screenshots)) {
					$scope.alert = {msg: "The screenshots are invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				break;
			case 'edit-fired-logs':
				content.username = $scope.addForm.username.val;
				content.reason = $scope.addForm.reason.val;
				content.screenshots = $scope.addForm.screenshots.val;
				content.notes = $scope.addForm.notes.val;
				content.rehired = $scope.addForm.rehired.val;
				if(!checkRequired(content.username)) {
					$scope.alert = {msg: "The username is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.rehired)) {
					$scope.alert = {msg: "The rehired option is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.reason)) {
					$scope.alert = {msg: "The reason must have at least 20 characters.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkMinLength(content.reason, 20)) {
					$scope.alert = {msg: "The reason must have at least 20 characters.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.screenshots)) {
					$scope.alert = {msg: "The screenshots are invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				break;
			case 'edit-transfer-logs':
				content.username = $scope.addForm.username.val;
				content.agency = $scope.addForm.agency.val;
				content.oldRank = $scope.addForm.oldRank.val;
				content.offeredRank = $scope.addForm.offeredRank.val;
				content.fullTransferOrNearMiss = $scope.addForm.fullTransferOrNearMiss.val;
				content.notes = $scope.addForm.notes.val;
				if(!checkRequired(content.username)) {
					$scope.alert = {msg: "The username is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.agency)) {
					$scope.alert = {msg: "The agency is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.oldRank)) {
					$scope.alert = {msg: "The old rank is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.offeredRank)) {
					$scope.alert = {msg: "The offered rank is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.fullTransferOrNearMiss)) {
					$scope.alert = {msg: "The type of transfer is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkEnum(content.fullTransferOrNearMiss, ['fullTransfer', 'nearMiss'])) {
					$scope.alert = {msg: "The type of transfer is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				break;
			case 'edit-rank-selling-logs':
				content.username = $scope.addForm.username.val;
				content.prevRank = $scope.addForm.prevRank.val;
				content.newRank = $scope.addForm.newRank.val;
				content.price = $scope.addForm.price.val;
				content.notes = $scope.addForm.notes.val;
				if(!checkRequired(content.username)) {
					$scope.alert = {msg: "The username is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.prevRank)) {
					$scope.alert = {msg: "The previous rank is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.newRank)) {
					$scope.alert = {msg: "The new rank is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.price)) {
					$scope.alert = {msg: "The price must be 0 or a positive number.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRange(content.price, [0])) {
					$scope.alert = {msg: "The price must be 0 or a positive number.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				break;
			case 'edit-loa-logs':
				//content.username = $scope.addForm.username.val;
				content.startDate = $scope.addForm.startDate.val;
				content.endDate = $scope.addForm.endDate.val;
				content.reason = $scope.addForm.reason.val;
				content.approvedBy = $scope.addForm.approvedBy.val;
				content.notes = $scope.addForm.notes.val;
				// if(!checkRequired(content.username)) {
				// 	$scope.alert = {msg: "The username is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
				// 	return;
				// }
				if(!checkRequired(content.startDate)) {
					$scope.alert = {msg: "The start date's format is invalid (yyyy-mm-dd).", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.endDate)) {
					$scope.alert = {msg: "The end date's format is invalid (yyyy-mm-dd).", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.reason)) {
					$scope.alert = {msg: "The reason must have at least 20 characters.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkMinLength(content.reason, 20)) {
					$scope.alert = {msg: "The reason must have at least 20 characters.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.approvedBy)) {
					$scope.alert = {msg: "The approved by field is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				content.endDate.addMinutes(LOA_TIME_DISTORTION);
				break;
			case 'edit-sv-vip-logs':
				content.username = $scope.addForm.username.val;
				content.svOrVip = $scope.addForm.svOrVip.val;
				content.notes = $scope.addForm.notes.val;
				content.removed = $scope.addForm.rehired.val;
				if(!checkRequired(content.username)) {
					$scope.alert = {msg: "The username is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.svOrVip)) {
					$scope.alert = {msg: "The type of badge is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkEnum(content.svOrVip, ['sv', 'vip'])) {
					$scope.alert = {msg: "The type of badge is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.removed)) {
					$scope.alert = {msg: "The removed option is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
					return;
				}
				break;
			case 'edit-pay-logs':
				content.paidPeople = $scope.paidPeople;
				content.payDay = $scope.addForm.payDay.val;
				content.payTime = $scope.addForm.payTime.val;
				content.notes = $scope.addForm.notes.val;
				if(!checkRequired(content.payDay)) {
					$scope.alert = {msg: "The pay day is invalid.", strong: "Failed to add " + $scope.logTitleSingular + "!"};
					return;
				}
				if(!checkRequired(content.payTime)) {
					$scope.alert = {msg: "The pay time is invalid.", strong: "Failed to add " + $scope.logTitleSingular + "!"};
					return;
				}
				break;
		}
		$scope.showSpinner = true;
		$http.post(API_ENDPOINT.url + '/editLog', content).then(function(result) {
			$scope.showSpinner = false;
			if (result.data.success) {
				$scope.alert = {type: "success", msg: result.data.msg, strong: $scope.logTitleSingular + " edited successfully!"};
			} else {
				$scope.alert = {msg: result.data.msg, strong: "Failed to edit " + $scope.logTitleSingular + "!"};
			}
		});
	}

	$scope.$watch('currentState.current.name', function (newValue) {
		//if(newValue == LogService.getPage() && LogService.isValid()) {
		//	$scope.addForm = LogService.getProperty();
		//	LogService.setValid(false);
		//}
		switch(newValue) {
			case 'edit-training-logs':
				$scope.logTitle = "Training Logs";
				$scope.logTitleSingular = "Training Log";
				$scope.logIcon = "wrench";
				$scope.addForm.username = {show: true, tip1: "Username", tip2: "Trained user", dis: false, val: $state.params.obj.username};
				$scope.addForm.passOrFail = {show: true, tip1: "Pass or Fail", tip2: "Whether the trainee passed or failed", dis: false, val: $state.params.obj.passOrFail};
				$scope.addForm.recSecTrainOrHR = {show: true, tip1: "Training Type", tip2: "Type of training received", dis: false, val: $state.params.obj.recSecTrainOrHR};
				$scope.addForm.notes = {show: true, tip1: "Notes", tip2: "Optional additional notes", dis: false, val: $state.params.obj.notes};
				$scope.addForm.createdAt = {show: true, tip1: "Created At", tip2: "yyyy-mm-dd", dis: true, val: new Date($state.params.obj.createdAt)};
				$scope.addForm.updatedAt = {show: true, tip1: "Updated At", tip2: "yyyy-mm-dd", dis: true, val: new Date($state.params.obj.updatedAt)};
				$scope.addForm.logger = {show: true, tip1: "Logger", tip2: "The logger name", dis: true, val: $state.params.obj.logger};
				$scope.addForm.loggerRank = {show: true, tip1: "Logger Rank", tip2: "The logger rank", dis: true, val: $state.params.obj.loggerRank};
				break;
			case 'edit-promotion-logs':
				$scope.logTitle = "Promotion Logs";
				$scope.logTitleSingular = "Promotion Log";
				$scope.logIcon = "certificate";
				$scope.addForm.username = {show: true, tip1: "Username", tip2: "Promoted user", dis: false, val: $state.params.obj.username};
				$scope.addForm.prevRank = {show: true, tip1: "Previous Rank", tip2: "Rank before promotion", dis: false, val: $state.params.obj.prevRank};
				$scope.addForm.newRank = {show: true, tip1: "New Rank", tip2: "Rank after promotion", dis: false, val: $state.params.obj.newRank};
				$scope.addForm.notes = {show: true, tip1: "Notes", tip2: "Optional additional notes", dis: false, val: $state.params.obj.notes};
				$scope.addForm.createdAt = {show: true, tip1: "Created At", tip2: "yyyy-mm-dd", dis: true, val: new Date($state.params.obj.createdAt)};
				$scope.addForm.updatedAt = {show: true, tip1: "Updated At", tip2: "yyyy-mm-dd", dis: true, val: new Date($state.params.obj.updatedAt)};
				$scope.addForm.logger = {show: true, tip1: "Logger", tip2: "The logger name", dis: true, val: $state.params.obj.logger};
				$scope.addForm.loggerRank = {show: true, tip1: "Logger Rank", tip2: "The logger rank", dis: true, val: $state.params.obj.loggerRank};
				break;
			case 'edit-warning-logs':
				$scope.logTitle = "Warning Logs";
				$scope.logTitleSingular = "Warning Log";
				$scope.logIcon = "warning-sign";
				$scope.addForm.username = {show: true, tip1: "Username", tip2: "Warned user", dis: false, val: $state.params.obj.username};
				$scope.addForm.warnNumber = {show: true, tip1: "Warning Number", tip2: "Number of this warning", dis: false, val: $state.params.obj.warnNumber};
				$scope.addForm.reason = {show: true, tip1: "Reason", tip2: "Reason for this warning (20 characters minimum)", dis: false, val: $state.params.obj.reason};
				$scope.addForm.screenshots = {show: true, tip1: "Screenshots", tip2: "URL's linking to the screenshots", dis: false, val: $state.params.obj.screenshots};
				$scope.addForm.notes = {show: true, tip1: "Notes", tip2: "Optional additional notes", dis: false, val: $state.params.obj.notes};
				$scope.addForm.createdAt = {show: true, tip1: "Created At", tip2: "yyyy-mm-dd", dis: true, val: new Date($state.params.obj.createdAt)};
				$scope.addForm.updatedAt = {show: true, tip1: "Updated At", tip2: "yyyy-mm-dd", dis: true, val: new Date($state.params.obj.updatedAt)};
				$scope.addForm.logger = {show: true, tip1: "Logger", tip2: "The logger name", dis: true, val: $state.params.obj.logger};
				$scope.addForm.loggerRank = {show: true, tip1: "Logger Rank", tip2: "The logger rank", dis: true, val: $state.params.obj.loggerRank};
				$scope.addForm.rehired = {show: true, tip1: "Check if you want to remove this warning", tip2: "Warning has been removed?", dis: false, val: $state.params.obj.removed};
				break;
			case 'edit-demotion-logs':
				$scope.logTitle = "Demotion Logs";
				$scope.logTitleSingular = "Demotion Log";
				$scope.logIcon = "circle-arrow-down";
				$scope.addForm.username = {show: true, tip1: "Username", tip2: "Demoted user", dis: false, val: $state.params.obj.username};
				$scope.addForm.prevRank = {show: true, tip1: "Previous Rank", tip2: "Rank before demotion", dis: false, val: $state.params.obj.prevRank};
				$scope.addForm.newRank = {show: true, tip1: "New Rank", tip2: "Rank after demotion", dis: false, val: $state.params.obj.newRank};
				$scope.addForm.reason = {show: true, tip1: "Reason", tip2: "Reason for this demotion (20 characters minimum)", dis: false, val: $state.params.obj.reason};
				$scope.addForm.screenshots = {show: true, tip1: "Screenshots", tip2: "URL's linking to the screenshots", dis: false, val: $state.params.obj.screenshots};
				$scope.addForm.notes = {show: true, tip1: "Notes", tip2: "Optional additional notes", dis: false, val: $state.params.obj.notes};
				$scope.addForm.createdAt = {show: true, tip1: "Created At", tip2: "yyyy-mm-dd", dis: true, val: new Date($state.params.obj.createdAt)};
				$scope.addForm.updatedAt = {show: true, tip1: "Updated At", tip2: "yyyy-mm-dd", dis: true, val: new Date($state.params.obj.updatedAt)};
				$scope.addForm.logger = {show: true, tip1: "Logger", tip2: "The logger name", dis: true, val: $state.params.obj.logger};
				$scope.addForm.loggerRank = {show: true, tip1: "Logger Rank", tip2: "The logger rank", dis: true, val: $state.params.obj.loggerRank};
				break;
			case 'edit-strike-logs':
				$scope.logTitle = "Strike Logs";
				$scope.logTitleSingular = "Strike Log";
				$scope.logIcon = "flash";
				$scope.addForm.username = {show: true, tip1: "Username", tip2: "Striked user", dis: false, val: $state.params.obj.username};
				$scope.addForm.strikeNumber = {show: true, tip1: "Strike Number", tip2: "Number of this strike", dis: false, val: $state.params.obj.strikeNumber};
				$scope.addForm.reason = {show: true, tip1: "Reason", tip2: "Reason for this strike (20 characters minimum)", dis: false, val: $state.params.obj.reason};
				$scope.addForm.screenshots = {show: true, tip1: "Screenshots", tip2: "URL's linking to the screenshots", dis: false, val: $state.params.obj.screenshots};
				$scope.addForm.notes = {show: true, tip1: "Notes", tip2: "Optional additional notes", dis: false, val: $state.params.obj.notes};
				$scope.addForm.createdAt = {show: true, tip1: "Created At", tip2: "yyyy-mm-dd", dis: true, val: new Date($state.params.obj.createdAt)};
				$scope.addForm.updatedAt = {show: true, tip1: "Updated At", tip2: "yyyy-mm-dd", dis: true, val: new Date($state.params.obj.updatedAt)};
				$scope.addForm.logger = {show: true, tip1: "Logger", tip2: "The logger name", dis: true, val: $state.params.obj.logger};
				$scope.addForm.loggerRank = {show: true, tip1: "Logger Rank", tip2: "The logger rank", dis: true, val: $state.params.obj.loggerRank};
				$scope.addForm.rehired = {show: true, tip1: "Check if you want to remove this strike", tip2: "Strike has been removed?", dis: false, val: $state.params.obj.removed};
				break;
			case 'edit-fired-logs':
				$scope.logTitle = "Fired Logs";
				$scope.logTitleSingular = "Fired Log";
				$scope.logIcon = "fire";
				$scope.addForm.username = {show: true, tip1: "Username", tip2: "Fired user", dis: false, val: $state.params.obj.username};
				$scope.addForm.rehired = {show: true, tip1: "Check if you want to rehire this fired user", tip2: "Fired user has been rehired?", dis: false, val: $state.params.obj.rehired};
				$scope.addForm.reason = {show: true, tip1: "Reason", tip2: "Reason for this firing (20 characters minimum)", dis: false, val: $state.params.obj.reason};
				$scope.addForm.screenshots = {show: true, tip1: "Screenshots", tip2: "URL's linking to the screenshots", dis: false, val: $state.params.obj.screenshots};
				$scope.addForm.notes = {show: true, tip1: "Notes", tip2: "Optional additional notes", dis: false, val: $state.params.obj.notes};
				$scope.addForm.createdAt = {show: true, tip1: "Created At", tip2: "yyyy-mm-dd", dis: true, val: new Date($state.params.obj.createdAt)};
				$scope.addForm.updatedAt = {show: true, tip1: "Updated At", tip2: "yyyy-mm-dd", dis: true, val: new Date($state.params.obj.updatedAt)};
				$scope.addForm.logger = {show: true, tip1: "Logger", tip2: "The logger name", dis: true, val: $state.params.obj.logger};
				$scope.addForm.loggerRank = {show: true, tip1: "Logger Rank", tip2: "The logger rank", dis: true, val: $state.params.obj.loggerRank};
				break;
			case 'edit-transfer-logs':
				$scope.logTitle = "Transfer Logs";
				$scope.logTitleSingular = "Transfer Log";
				$scope.logIcon = "transfer";
				$scope.addForm.username = {show: true, tip1: "Username", tip2: "Transfered user", dis: false, val: $state.params.obj.username};
				$scope.addForm.agency = {show: true, tip1: "Agency", tip2: "Agency from which the user is transfering", dis: false, val: $state.params.obj.agency};
				$scope.addForm.oldRank = {show: true, tip1: "Old Rank", tip2: "Rank from the previous agency or HIT", dis: false, val: $state.params.obj.oldRank};
				$scope.addForm.offeredRank = {show: true, tip1: "Offered Rank", tip2: "Offered HIT rank", dis: false, val: $state.params.obj.offeredRank};
				$scope.addForm.fullTransferOrNearMiss = {show: true, tip1: "Type of Transfer", tip2: "Whether the transfer succeeded or was close to succeed", dis: false, val: $state.params.obj.fullTransferOrNearMiss};
				$scope.addForm.notes = {show: true, tip1: "Notes", tip2: "Optional additional notes", dis: false, val: $state.params.obj.notes};
				$scope.addForm.createdAt = {show: true, tip1: "Created At", tip2: "yyyy-mm-dd", dis: true, val: new Date($state.params.obj.createdAt)};
				$scope.addForm.updatedAt = {show: true, tip1: "Updated At", tip2: "yyyy-mm-dd", dis: true, val: new Date($state.params.obj.updatedAt)};
				$scope.addForm.logger = {show: true, tip1: "Logger", tip2: "The logger name", dis: true, val: $state.params.obj.logger};
				$scope.addForm.loggerRank = {show: true, tip1: "Logger Rank", tip2: "The logger rank", dis: true, val: $state.params.obj.loggerRank};
				break;
			case 'edit-rank-selling-logs':
				$scope.logTitle = "Rank Selling Logs";
				$scope.logTitleSingular = "Rank Selling Log";
				$scope.logIcon = "usd";
				$scope.addForm.username = {show: true, tip1: "Username", tip2: "Rank buyer user", dis: false, val: $state.params.obj.username};
				$scope.addForm.prevRank = {show: true, tip1: "Previous Rank", tip2: "Rank before the rank selling", dis: false, val: $state.params.obj.prevRank};
				$scope.addForm.newRank = {show: true, tip1: "New Rank", tip2: "Rank after the rank selling", dis: false, val: $state.params.obj.newRank};
				$scope.addForm.price = {show: true, tip1: "Price", tip2: "The price of the sold rank", dis: false, val: $state.params.obj.price};
				$scope.addForm.notes = {show: true, tip1: "Notes", tip2: "Optional additional notes", dis: false, val: $state.params.obj.notes};
				$scope.addForm.createdAt = {show: true, tip1: "Created At", tip2: "yyyy-mm-dd", dis: true, val: new Date($state.params.obj.createdAt)};
				$scope.addForm.updatedAt = {show: true, tip1: "Updated At", tip2: "yyyy-mm-dd", dis: true, val: new Date($state.params.obj.updatedAt)};
				$scope.addForm.logger = {show: true, tip1: "Logger", tip2: "The logger name", dis: true, val: $state.params.obj.logger};
				$scope.addForm.loggerRank = {show: true, tip1: "Logger Rank", tip2: "The logger rank", dis: true, val: $state.params.obj.loggerRank};
				break;
			case 'edit-loa-logs':
				$scope.logTitle = "Leave of Absence (LoA) Logs";
				$scope.logTitleSingular = "Leave of Absence (LoA) Log";
				$scope.logIcon = "hourglass";
				//$scope.addForm.username = {show: true, tip1: "Username", tip2: "Absent user", dis: false, val: $state.params.obj.username};
				$scope.addForm.startDate = {show: true, tip1: "Start Date", tip2: "yyyy-mm-dd", dis: false, val: new Date($state.params.obj.startDate)};
				$scope.addForm.endDate = {show: true, tip1: "End Date", tip2: "yyyy-mm-dd", dis: false, val: new Date($state.params.obj.endDate)};
				$scope.addForm.reason = {show: true, tip1: "Reason", tip2: "Reason for the absence (20 characters minimum)", dis: false, val: $state.params.obj.reason};
				$scope.addForm.approvedBy = {show: true, tip1: "Approved By", tip2: "User that accepted this LoA", dis: false, val: $state.params.obj.approvedBy};
				$scope.addForm.notes = {show: true, tip1: "Notes", tip2: "Optional additional notes", dis: false, val: $state.params.obj.notes};
				$scope.addForm.createdAt = {show: true, tip1: "Created At", tip2: "yyyy-mm-dd", dis: true, val: new Date($state.params.obj.createdAt)};
				$scope.addForm.updatedAt = {show: true, tip1: "Updated At", tip2: "yyyy-mm-dd", dis: true, val: new Date($state.params.obj.updatedAt)};
				$scope.addForm.logger = {show: true, tip1: "Logger", tip2: "The logger name", dis: true, val: $state.params.obj.logger};
				$scope.addForm.loggerRank = {show: true, tip1: "Logger Rank", tip2: "The logger rank", dis: true, val: $state.params.obj.loggerRank};
				break;
			case 'edit-sv-vip-logs':
				$scope.logTitle = "SV/VIP Logs";
				$scope.logTitleSingular = "SV/VIP Log";
				$scope.logIcon = "glass";
				$scope.addForm.username = {show: true, tip1: "Username", tip2: "Badge holder", dis: false, val: $state.params.obj.username};
				$scope.addForm.svOrVip = {show: true, tip1: "Badge Type", tip2: "Type of access granted", dis: false, val: $state.params.obj.svOrVip};
				$scope.addForm.notes = {show: true, tip1: "Notes", tip2: "Optional additional notes", dis: false, val: $state.params.obj.notes};
				$scope.addForm.createdAt = {show: true, tip1: "Created At", tip2: "yyyy-mm-dd", dis: true, val: new Date($state.params.obj.createdAt)};
				$scope.addForm.updatedAt = {show: true, tip1: "Updated At", tip2: "yyyy-mm-dd", dis: true, val: new Date($state.params.obj.updatedAt)};
				$scope.addForm.logger = {show: true, tip1: "Logger", tip2: "The logger name", dis: true, val: $state.params.obj.logger};
				$scope.addForm.loggerRank = {show: true, tip1: "Logger Rank", tip2: "The logger rank", dis: true, val: $state.params.obj.loggerRank};
				$scope.addForm.rehired = {show: true, tip1: "Check if you want to remove the possession of the badge", tip2: "Badge has been removed?", dis: false, val: $state.params.obj.removed};
				break;
			case 'edit-pay-logs':
				$scope.logTitle = "Pay Logs";
				$scope.logTitleSingular = "Pay Log";
				$scope.logIcon = "gift";
				$scope.paidPeople = $state.params.obj.paidPeople;
				$scope.addForm.paidPeople = {show: true, tip1: "List of Paid Members", username: {tip1: "Username", tip2: "Paid user", dis: false}, pay: {tip1: "Pay", tip2: "", dis: false}, notes: {tip1: "Note", tip2: "Optional note", dis: false}},
				$scope.addForm.payDay = {show: true, tip1: "Pay Day", tip2: "e.g: Monday", dis: false, val: $state.params.obj.payDay},
				$scope.addForm.payTime = {show: true, tip1: "Pay Time", tip2: "e.g: 6pm", dis: false, val: $state.params.obj.payTime},
				$scope.addForm.notes = {show: true, tip1: "Notes", tip2: "Optional additional notes", dis: false, val: $state.params.obj.notes};
				$scope.addForm.createdAt = {show: true, tip1: "Created At", tip2: "yyyy-mm-dd", dis: true, val: new Date($state.params.obj.createdAt)};
				$scope.addForm.updatedAt = {show: true, tip1: "Updated At", tip2: "yyyy-mm-dd", dis: true, val: new Date($state.params.obj.updatedAt)};
				$scope.addForm.logger = {show: true, tip1: "Logger", tip2: "The logger name", dis: true, val: $state.params.obj.logger};
				$scope.addForm.loggerRank = {show: true, tip1: "Logger Rank", tip2: "The logger rank", dis: true, val: $state.params.obj.loggerRank};
				break;
		}
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