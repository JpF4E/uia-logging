angular.module('EditProfileCtrl', []).controller('EditProfileController', function($http, $scope, $state, AuthService, AUTH_EVENTS, API_ENDPOINT) {

	//$scope.user = {};

	$scope.alert = null;
	$scope.alert2 = null;
	//$scope.requesting = false;

	$scope.memberCatsEmpty = [true, true, true, true];
	$scope.memberRoles = {};
	$scope.memberName = "";
	$scope.memberAllInfo = null;

	$scope.currentState = $state;
	$scope.logTitle = "Your Profile";
	$scope.logTitleSingular = "Profile";
	$scope.logIcon = "user";
	$scope.showSpinner = false;

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

	$scope.closeAlert2 = function() {
		$scope.alert2 = null;
	};

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
			$scope.memberAllInfo = AuthService.getMemberInfo();
			$scope.logTitle = $scope.memberName + "'s Profile";

			if($scope.memberAllInfo) {
				$scope.addForm = {
					username : {show: true, tip1: "Username", tip2: "Your Username", val: $scope.memberAllInfo.name, dis: true},
					rank : {show: true, tip1: "Rank", tip2: "Input your current rank", val: $scope.memberAllInfo.rank, dis: false},
					promoTag : {show: true, tip1: "Promotion Tag (4 characters max)", tip2: "Input your promotion tag without the brackets", val: $scope.memberAllInfo.promoTag, dis: false},
					type : {show: true, tip1: "Type of Membership", tip2: "Your membership", val: $scope.memberAllInfo.type, dis: true},
					email : {show: true, tip1: "Email", tip2: "Your email", val: $scope.memberAllInfo.email, dis: false},
					pass : {show: true, tip1: "New Password", tip2: "", val: "", dis: false},
					passC : {show: true, tip1: "New Password Confirmation", tip2: "", val: "", dis: false},
					oldPass: {show: true, tip1: "Current Password", tip2: "", val: "", dis: false}
				}
			}
		}
	}, true);

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

	function checkMinLength(val, length) {
		return val.length >= length;
	}

	function checkMaxLength(val, length) {
		return val.length <= length;
	}

	function checkPw(val1, val2) {
		return val1 === val2;
	}

	function checkPromoTag(val) {
		return /^[a-zA-Z0-9]{0,4}$/.test(val);
	}

	$scope.editProfile = function() {
		var content = {};
		content.rank = $scope.addForm.rank.val;
		content.promoTag = $scope.addForm.promoTag.val;
		content.email = $scope.addForm.email.val;
		if(!checkRequired(content.rank)) {
			$scope.alert = {msg: "The rank is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
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
		if(!checkRequired(content.email)) {
			$scope.alert = {msg: "The email is invalid.", strong: "Failed to edit " + $scope.logTitleSingular + "!"};
			return;
		}
		$scope.showSpinner = true;
		$http.post(API_ENDPOINT.url + '/editProfile', content).then(function(result) {
			$scope.showSpinner = false;
			if (result.data.success) {
				AuthService.reloadUser();
				$scope.alert = {type: "success", msg: result.data.msg, strong: $scope.logTitleSingular + " edited successfully!"};
			} else {
				$scope.alert = {msg: result.data.msg, strong: "Failed to edit " + $scope.logTitleSingular + "!"};
			}
		});
	}

	$scope.changePw = function() {
		var content = {};
		content.oldPass = $scope.addForm.oldPass.val;
		content.pass = $scope.addForm.pass.val;
		content.passC = $scope.addForm.passC.val;
		if(!checkRequired(content.oldPass)) {
			$scope.alert2 = {msg: "The current password is invalid.", strong: "Failed to change password!"};
			return;
		}
		if(!checkRequired(content.pass)) {
			$scope.alert2 = {msg: "The new password is invalid.", strong: "Failed to change password!"};
			return;
		}
		if(!checkRequired(content.passC)) {
			$scope.alert2 = {msg: "The confirmation field is invalid.", strong: "Failed to change password!"};
			return;
		}
		if(!checkPw(content.pass, content.passC)) {
			$scope.alert2 = {msg: "The new passwords are not equal.", strong: "Failed to change password!"};
			return;
		}
		$scope.showSpinner = true;
		$http.post(API_ENDPOINT.url + '/changePw', content).then(function(result) {
			$scope.showSpinner = false;
			if (result.data.success) {
				$scope.alert2 = {type: "success", msg: result.data.msg, strong: "Changed password successfully!"};
			} else {
				$scope.alert2 = {msg: result.data.msg, strong: "Failed to change password!"};
			}
		});
	}

	if(AuthService.isFirstLogin()) {
		AuthService.falseFirstLogin();
		$('#myModal').modal();
	}

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