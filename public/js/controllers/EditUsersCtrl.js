angular.module('EditUsersCtrl', []).controller('EditUsersController', function($http, $scope, $state, AuthService, AUTH_EVENTS, API_ENDPOINT) {

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
			$scope.memberType = AuthService.getMemberType();
			if($scope.memberType != "Admin" && $scope.memberType != "Owner") {
				$state.go('home');
			}
		}
	}, true);

	if(!$state.params.obj || !$state.params.obj._id) {
		$state.go('home');
		return;
	}

	$scope.normalizeRole = function(role) {
		return role.replace(/-/g, ' ').replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) + ':';
	}

	$scope.addForm = {
		name : {show: false, tip1: "", tip2: "", val: "", dis: false},
		valid : {show: false, tip1: "", tip2: "", val: "", dis: false},
		type : {show: false, tip1: "", tip2: "", val: "", dis: false},
		promoTag : {show: false, tip1: "", tip2: "", val: "", dis: false},
		rank : {show: false, tip1: "", tip2: "", val: "", dis: false},
		email : {show: false, tip1: "", tip2: "", val: "", dis: false},
		tokenTimestamp : {show: false, tip1: "", tip2: "", val: "", dis: false},
		firstLogin : {show: false, tip1: "", tip2: "", val: "", dis: false},
		banned : {show: false, tip1: "", tip2: "", val: "", dis: false},
		createdAt : {show: false, tip1: "", tip2: "", val: "", dis: false},
		updatedAt : {show: false, tip1: "", tip2: "", val: "", dis: false},
		allowedRoles : {show: false, tip1: "", tip2: "", val: "", dis: false},
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

	function checkMaxLength(val, length) {
		return val.length <= length;
	}

	function checkPromoTag(val) {
		return /^[a-zA-Z0-9]{0,4}$/.test(val);
	}

	var tempRoles = [];

	$scope.changeType = function() {
		if($scope.addForm.type.val == "Owner") {
			for (var i = $scope.addForm.allowedRoles.val.length - 1; i >= 0; i--) {
				$scope.addForm.allowedRoles.val[i].perm = [true, true, true, true];
			}
		} else if($scope.addForm.type.val == "Admin") {
			for (var i = $scope.addForm.allowedRoles.val.length - 1; i >= 0; i--) {
				$scope.addForm.allowedRoles.val[i].perm[0] = true;
				$scope.addForm.allowedRoles.val[i].perm[1] = true;
				$scope.addForm.allowedRoles.val[i].perm[2] = true;
				$scope.addForm.allowedRoles.val[i].perm[3] = tempRoles[i].perm[3];
			}
		} else {
			for (var i = $scope.addForm.allowedRoles.val.length - 1; i >= 0; i--) {
				$scope.addForm.allowedRoles.val[i].perm[0] = tempRoles[i].perm[0];
				$scope.addForm.allowedRoles.val[i].perm[1] = tempRoles[i].perm[1];
				$scope.addForm.allowedRoles.val[i].perm[2] = tempRoles[i].perm[2];
				$scope.addForm.allowedRoles.val[i].perm[3] = tempRoles[i].perm[3];
			}
		}
	}

	var toChangeTr = false, toChangeHr = false, toChangeTu = false, toChangeRs = false;
	$scope.shortcut = function(stype) {
		if(stype == "Trainer") {
			for (var i = $scope.addForm.allowedRoles.val.length - 1; i >= 0; i--) {
				if($scope.addForm.allowedRoles.val[i].role == "training-logs" ||
					$scope.addForm.allowedRoles.val[i].role == "loa-logs") {
					$scope.addForm.allowedRoles.val[i].perm[0] = !toChangeTr;
					$scope.addForm.allowedRoles.val[i].perm[1] = !toChangeTr;
					$scope.addForm.allowedRoles.val[i].perm[2] = !toChangeTr;
				}
			}
			toChangeTr = !toChangeTr;
		} else if(stype == "High Rank") {
			for (var i = $scope.addForm.allowedRoles.val.length - 1; i >= 0; i--) {
				if($scope.addForm.allowedRoles.val[i].role != "transfer-logs" &&
					$scope.addForm.allowedRoles.val[i].role != "rank-selling-logs") {
					$scope.addForm.allowedRoles.val[i].perm[0] = !toChangeHr;
					$scope.addForm.allowedRoles.val[i].perm[1] = !toChangeHr;
					$scope.addForm.allowedRoles.val[i].perm[2] = !toChangeHr;
				} else {
					$scope.addForm.allowedRoles.val[i].perm[1] = !toChangeHr;
				}
			}
			toChangeHr = !toChangeHr;
		} else if(stype == "TU Member") {
			for (var i = $scope.addForm.allowedRoles.val.length - 1; i >= 0; i--) {
				if($scope.addForm.allowedRoles.val[i].role == "transfer-logs") {
					$scope.addForm.allowedRoles.val[i].perm[0] = !toChangeTu;
					$scope.addForm.allowedRoles.val[i].perm[1] = !toChangeTu;
					$scope.addForm.allowedRoles.val[i].perm[2] = !toChangeTu;
				}
			}
			toChangeTu = !toChangeTu;
		} else if(stype == "Rank Seller") {
			for (var i = $scope.addForm.allowedRoles.val.length - 1; i >= 0; i--) {
				if($scope.addForm.allowedRoles.val[i].role == "rank-selling-logs") {
					$scope.addForm.allowedRoles.val[i].perm[0] = !toChangeRs;
					$scope.addForm.allowedRoles.val[i].perm[1] = !toChangeRs;
					$scope.addForm.allowedRoles.val[i].perm[2] = !toChangeRs;
				}
			}
			toChangeRs = !toChangeRs;
		} else if(stype == "Reset") {
			for (var i = $scope.addForm.allowedRoles.val.length - 1; i >= 0; i--) {
				$scope.addForm.allowedRoles.val[i].perm[0] = tempRoles[i].perm[0];
				$scope.addForm.allowedRoles.val[i].perm[1] = tempRoles[i].perm[1];
				$scope.addForm.allowedRoles.val[i].perm[2] = tempRoles[i].perm[2];
				$scope.addForm.allowedRoles.val[i].perm[3] = tempRoles[i].perm[3];
			}
		} else if(stype == "Clear") {
			for (var i = $scope.addForm.allowedRoles.val.length - 1; i >= 0; i--) {
				if($scope.memberType == 'Owner') {
					if($scope.addForm.type.val == 'Admin') {
						$scope.addForm.allowedRoles.val[i].perm[3] = false;
					} else if($scope.addForm.type.val == 'Regular') {
						$scope.addForm.allowedRoles.val[i].perm[0] = false;
						$scope.addForm.allowedRoles.val[i].perm[1] = false;
						$scope.addForm.allowedRoles.val[i].perm[2] = false;
						$scope.addForm.allowedRoles.val[i].perm[3] = false;
					}
				} else {
					if($scope.addForm.type.val == 'Regular') {
						$scope.addForm.allowedRoles.val[i].perm[0] = false;
						$scope.addForm.allowedRoles.val[i].perm[1] = false;
						$scope.addForm.allowedRoles.val[i].perm[2] = false;
					}
				}
			}
		}
	}

	$scope.editUser = function() {
		var content = {_id: $scope.addForm._id.val};
			
		content.name = $scope.addForm.name.val;
		content.valid = $scope.addForm.valid.val;
		content.type = $scope.addForm.type.val;
		content.promoTag = $scope.addForm.promoTag.val;
		content.rank = $scope.addForm.rank.val;
		content.email = $scope.addForm.email.val;
		content.firstLogin = $scope.addForm.firstLogin.val;
		content.banned = $scope.addForm.banned.val;
		content.allowedRoles = $scope.addForm.allowedRoles.val;
		if(!checkRequired(content.name)) {
			$scope.alert = {msg: "The username is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
			return;
		}
		if(!checkRequired(content.valid)) {
			$scope.alert = {msg: "The accepted option is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
			return;
		}
		if(!checkRequired(content.type)) {
			$scope.alert = {msg: "The membership type option is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
			return;
		}
		if(!checkEnum(content.type, ['Owner', 'Admin', 'Regular'])) {
			$scope.alert = {msg: "The membership type option is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
			return;
		}
		if(!checkRequired(content.promoTag)) {
			$scope.alert = {msg: "The promotion tag must be entered and cannot exceed 4 characters.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
			return;
		}
		if(!checkMaxLength(content.promoTag, 4)) {
			$scope.alert = {msg: "The promotion tag must be entered and cannot exceed 4 characters.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
			return;
		}
		if(!checkPromoTag(content.promoTag)) {
			$scope.alert = {msg: "The promotion tag must can only contain letters and digits.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
			return;
		}
		if(!checkRequired(content.rank)) {
			$scope.alert = {msg: "The rank is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
			return;
		}
		if(!checkRequired(content.email)) {
			$scope.alert = {msg: "The email is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
			return;
		}
		if(!checkRequired(content.firstLogin)) {
			$scope.alert = {msg: "The first login option is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
			return;
		}
		if(!checkRequired(content.banned)) {
			$scope.alert = {msg: "The banned option is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
			return;
		}
		if(!checkRequired(content.allowedRoles)) {
			$scope.alert = {msg: "The membership permissions are invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
			return;
		}

		$http.post(API_ENDPOINT.url + '/editUser', content).then(function(result) {
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
		$scope.logTitle = "Members";
		$scope.logTitleSingular = "Member";
		$scope.logIcon = "user";
		$scope.addForm.name = {show: true, tip1: "Username", tip2: "Habbo name", dis: false, val: $state.params.obj.name};
		$scope.addForm.valid = {show: true, tip1: "Accepted", tip2: "Whether this member has been accepted or not", dis: false, val: $state.params.obj.valid};
		$scope.addForm.type = {show: true, tip1: "Membership Type", tip2: "Owner, Admin, or Regular", dis: false, val: $state.params.obj.type};
		$scope.addForm.promoTag = {show: true, tip1: "Promotion Tag", tip2: "The member's promotion tag", dis: false, val: $state.params.obj.promoTag};
		$scope.addForm.createdAt = {show: true, tip1: "Created At", tip2: "yyyy-mm-dd", dis: true, val: new Date($state.params.obj.createdAt)};
		$scope.addForm.updatedAt = {show: true, tip1: "Updated At", tip2: "yyyy-mm-dd", dis: true, val: new Date($state.params.obj.updatedAt)};
		$scope.addForm.rank = {show: true, tip1: "Rank", tip2: "The member's current rank", dis: false, val: $state.params.obj.rank};
		$scope.addForm.email = {show: true, tip1: "Email", tip2: "The member's email", dis: false, val: $state.params.obj.email};
		$scope.addForm.tokenTimestamp = {show: true, tip1: "Last Active", tip2: "The date this member was last active", dis: true, val: new Date($state.params.obj.tokenTimestamp)};
		$scope.addForm.firstLogin = {show: true, tip1: "Never Logged In", tip2: "Whether this member has never logged in or not", dis: false, val: $state.params.obj.firstLogin};
		$scope.addForm.banned = {show: true, tip1: "Banned", tip2: "Whether this member has been banned or not", dis: false, val: $state.params.obj.banned};
		$scope.addForm.allowedRoles = {show: true, tip1: "Permissions", tip2: "This member can perform these operations", dis: false, val: $state.params.obj.allowedRoles};
		tempRoles = [];
		for (var i = $scope.addForm.allowedRoles.val.length - 1; i >= 0; i--) {
			tempRoles[i] = {perm: []};
			tempRoles[i].perm[0] = $scope.addForm.allowedRoles.val[i].perm[0];
			tempRoles[i].perm[1] = $scope.addForm.allowedRoles.val[i].perm[1];
			tempRoles[i].perm[2] = $scope.addForm.allowedRoles.val[i].perm[2];
			tempRoles[i].perm[3] = $scope.addForm.allowedRoles.val[i].perm[3];
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