angular.module('UsersCtrl', []).controller('UsersController', function($http, $scope, $state, AuthService, AUTH_EVENTS, API_ENDPOINT) {

	//$scope.user = {};

	$scope.alert = null;
	//$scope.alert2 = null;
	//$scope.requesting = false;

	$scope.memberCatsEmpty = [true, true, true];
	$scope.memberRoles = {};
	$scope.memberName = "";
	$scope.memberType = "";
	$scope.modal = null;

	$scope.currentState = $state;
	$scope.logTitle = null;
	$scope.logTitleSingular = null;
	$scope.logIcon = null;
	$scope.users = [];
	$scope.logToUsers = null;

	$scope.comments = [];

	$scope.search = {};
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
		name : {show: false, tip1: ""},
		valid : {show: false, tip1: ""},
		type : {show: false, tip1: ""},
		promoTag : {show: false, tip1: ""},
		rank : {show: false, tip1: ""},
		email : {show: false, tip1: ""},
		tokenTimestamp : {show: false, tip1: ""},
		firstLogin : {show: false, tip1: ""},
		createdAt : {show: false, tip1: ""},
		banned : {show: false, tip1: ""},
		allowedRoles : {show: false, tip1: ""}
	}

	$scope.resetForm = function() {
		$scope.search.name = null;
		$scope.search.promoTag = null;
		$scope.search.banned = false;
		$scope.search.admin = false;
	}

	var lastCreatedAt = null;

	$scope.searchTheUsers = function(reload) {
		$scope.showSpinner = true;
		if(reload) {
			lastCreatedAt = null;
		}
		$http.post(API_ENDPOINT.url + '/searchUsers', {name: $scope.search.name, banned: $scope.search.banned, admin: $scope.search.admin, promoTag: $scope.search.promoTag, lastCreatedAt: lastCreatedAt || ServerDate()}).then(function(result) {
			$scope.showSpinner = false;
			if (result.data.success) {
				if(result.data.users.length > 0)
					lastCreatedAt = result.data.users[result.data.users.length-1].createdAt;
				$scope.users = result.data.users;
				for (var i = 0; i < $scope.users.length; i++) {
					$scope.users[i].usersAllowedRolesNames = printableNames($scope.users[i].allowedRoles);
					$scope.users[i].usersAllowedRoles = printableRoles($scope.users[i].allowedRoles);
					$scope.comments.push(false);
				}
				//$scope.alert = {type: "success", msg: result.data.msg, strong: $scope.logTitleSingular + " added successfully!"};
			} else {
				$scope.alert = {msg: result.data.msg, strong: "Failed to retrieve " + $scope.logTitle + "!"};
			}
		});
	}

	permArr = ['Add', 'View', 'Edit', 'Delete'];

	printableNames = function(roles) {
		var result = [];
		for (var i = 0; i < roles.length; i++) {
			result.push(normalizeRole(roles[i].role));
		}
		return result;
	}

	printableRoles = function(roles) {
		var result = [];
		for (var i = 0; i < roles.length; i++) {
			var occupied = false;
			var partial = "";
			for (var j = 0; j < roles[i].perm.length; j++) {
				if(roles[i].perm[j]) {
					occupied = true;
					if(partial.length != 0)
						partial += ', ';
					partial += permArr[j];
				}
			}
			if(!occupied)
				partial += 'No permissions';
			result.push(partial);
		}
		return result;
	}

	function normalizeRole(role) {
		return role.replace(/-/g, ' ').replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) + ':';
	}

	$scope.prepareBan = function(x) {
		$scope.logToUsers = {_id: x._id};
		$scope.modal = 'ban ';
		$scope.modal += x.name + "'s access to the UIA Portal";
	}

	$scope.decidedBan = function() {
		$http.post(API_ENDPOINT.url + '/decidedPendingBan', $scope.logToUsers).then(function(result) {
			if (result.data.success) {
				//$scope.alert = {type: "success", msg: result.data.msg, strong: $scope.logTitleSingular + " deleted successfully!"};
				for (var i = $scope.users.length - 1; i >= 0; i--) {
					if($scope.users[i]._id == $scope.logToUsers._id) {
						$scope.users[i].banned = true;
						break;
					}
				}
				//$scope.searchTheLogs(true);
			} else {
				$scope.alert = {msg: result.data.msg, strong: "Failed to do this operation on this " + $scope.logTitleSingular + "!"};
			}
		});
	}

	$scope.editUser = function(x) {
		$state.go('edit-users', {obj: x});
	}

	// $scope.prepareDelete = function(x) {
	// 	$scope.logToDelete = {_id: x._id, logger: x.logger};
	// }

	// $scope.deleteLog = function() {
	// 	$scope.logToDelete.type = $scope.currentState.current.name;
	// 	$http.post(API_ENDPOINT.url + '/deleteLog', $scope.logToDelete).then(function(result) {
	// 		if (result.data.success) {
	// 			//$scope.alert = {type: "success", msg: result.data.msg, strong: $scope.logTitleSingular + " deleted successfully!"};
	// 			for (var i = $scope.logs.length - 1; i >= 0; i--) {
	// 				if($scope.logs[i]._id == $scope.logToDelete._id) {
	// 					$scope.logs.splice(i, 1);
	// 					break;
	// 				}
	// 			}
	// 			//$scope.searchTheLogs(true);
	// 		} else {
	// 			$scope.alert = {msg: result.data.msg, strong: "Failed to delete " + $scope.logTitleSingular + "!"};
	// 		}
	// 	});
	// }

	// $scope.prepare = function(x, accept) {
	// 	$scope.logToPending = {_id: x._id, accept: accept};
	// 	$scope.modal = (accept) ? 'accept ' : 'deny ';
	// 	$scope.modal += x.name + "'s access to the UIA Portal";
	// }

	// $scope.decided = function() {
	// 	$http.post(API_ENDPOINT.url + '/decidedPending', $scope.logToPending).then(function(result) {
	// 		if (result.data.success) {
	// 			//$scope.alert = {type: "success", msg: result.data.msg, strong: $scope.logTitleSingular + " deleted successfully!"};
	// 			for (var i = $scope.pending.length - 1; i >= 0; i--) {
	// 				if($scope.pending[i]._id == $scope.logToPending._id) {
	// 					$scope.pending.splice(i, 1);
	// 					break;
	// 				}
	// 			}
	// 			//$scope.searchTheLogs(true);
	// 		} else {
	// 			$scope.alert = {msg: result.data.msg, strong: "Failed to do this operation on this " + $scope.logTitleSingular + "!"};
	// 		}
	// 	});
	// }
	//TODO SEE IF PROMO TAG ALREADY EXISTS
	$scope.$watch('currentState.current.name', function (newValue) {
		//if(newValue == LogService.getPage() && LogService.isValid()) {
		//	$scope.addForm = LogService.getProperty();
		//	LogService.setValid(false);
		//}
		$scope.logTitle = "All Members";
		$scope.logTitleSingular = "Member";
		$scope.logIcon = "user";
		$scope.addForm.name = {show: true, tip1: "Username"};
		$scope.addForm.valid = {show: true, tip1: "Accepted"};
		$scope.addForm.type = {show: true, tip1: "Membership Type"};
		$scope.addForm.promoTag = {show: true, tip1: "Promotion Tag"};
		$scope.addForm.rank = {show: true, tip1: "Current Rank"};
		$scope.addForm.email = {show: true, tip1: "Email"};
		$scope.addForm.tokenTimestamp = {show: true, tip1: "Last Active"};
		$scope.addForm.firstLogin = {show: true, tip1: "Has Logged In"};
		$scope.addForm.banned = {show: true, tip1: "Banned"};
		$scope.addForm.createdAt = {show: true, tip1: "Created At"};
		$scope.addForm.allowedRoles = {show: true, tip1: "Member Permissions"};

		$scope.searchTheUsers(true);
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