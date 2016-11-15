angular.module('PendingCtrl', []).controller('PendingController', function($http, $scope, $state, AuthService, AUTH_EVENTS, API_ENDPOINT) {

	//$scope.user = {};

	$scope.alert = null;
	//$scope.alert2 = null;
	//$scope.requesting = false;

	$scope.memberCatsEmpty = [true, true, true, true];
	$scope.memberRoles = {};
	$scope.memberName = "";
	$scope.memberType = "";
	$scope.modal = null;

	$scope.currentState = $state;
	$scope.logTitle = null;
	$scope.logTitleSingular = null;
	$scope.logIcon = null;
	$scope.pending = [];
	$scope.logToPending = null;

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
		allowedRoles : {show: false, tip1: ""}
	}

	$scope.resetForm = function() {
		$scope.search.name = null;
	}

	var lastCreatedAt = null;

	$scope.searchThePending = function(reload) {
		$scope.showSpinner = true;
		if(reload) {
			lastCreatedAt = null;
		}
		$http.post(API_ENDPOINT.url + '/searchPending', {name: $scope.search.name, lastCreatedAt: lastCreatedAt || ServerDate()}).then(function(result) {
			$scope.showSpinner = false;
			if (result.data.success) {
				if(result.data.pending.length > 0)
					lastCreatedAt = result.data.pending[result.data.pending.length-1].createdAt;
				if(result.data.pending.length == 0)
					$scope.loadMoreShow = false;
				if(reload) {
					$scope.pending = result.data.pending;
				} else {
					$scope.pending = $scope.pending.concat(result.data.pending);
				}
				for (var i = 0; i < $scope.pending.length; i++) {
					$scope.pending[i].pendingAllowedRolesNames = printableNames($scope.pending[i].allowedRoles);
					$scope.pending[i].pendingAllowedRoles = printableRoles($scope.pending[i].allowedRoles);
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
					if(j != 0)
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

	//$scope.editLog = function(x) {
	//	$state.go('edit-' + $scope.currentState.current.name, {obj: x});
	//}

	$scope.prepare = function(x, accept) {
		$scope.logToPending = {_id: x._id, accept: accept};
		$scope.modal = (accept) ? 'accept ' : 'deny ';
		$scope.modal += x.name + "'s access to the IDC Portal";
	}

	$scope.decided = function() {
		$http.post(API_ENDPOINT.url + '/decidedPending', $scope.logToPending).then(function(result) {
			if (result.data.success) {
				//$scope.alert = {type: "success", msg: result.data.msg, strong: $scope.logTitleSingular + " deleted successfully!"};
				for (var i = $scope.pending.length - 1; i >= 0; i--) {
					if($scope.pending[i]._id == $scope.logToPending._id) {
						$scope.pending.splice(i, 1);
						break;
					}
				}
				//$scope.searchTheLogs(true);
			} else {
				$scope.alert = {msg: result.data.msg, strong: "Failed to do this operation on this " + $scope.logTitleSingular + "!"};
			}
		});
	}
	//TODO SEE IF PROMO TAG ALREADY EXISTS
	$scope.$watch('currentState.current.name', function (newValue) {
		//if(newValue == LogService.getPage() && LogService.isValid()) {
		//	$scope.addForm = LogService.getProperty();
		//	LogService.setValid(false);
		//}
		$scope.logTitle = "Pending Members";
		$scope.logTitleSingular = "Pending Member";
		$scope.logIcon = "pushpin";
		$scope.addForm.name = {show: true, tip1: "Username"};
		$scope.addForm.valid = {show: false, tip1: "Accepted"};
		$scope.addForm.type = {show: false, tip1: "Membership Type"};
		$scope.addForm.promoTag = {show: false, tip1: "Promotion Tag"};
		$scope.addForm.rank = {show: false, tip1: "Current Rank"};
		$scope.addForm.email = {show: true, tip1: "Email"};
		$scope.addForm.tokenTimestamp = {show: false, tip1: "Last Active"};
		$scope.addForm.firstLogin = {show: false, tip1: "First Login"};
		$scope.addForm.createdAt = {show: true, tip1: "Created At"};
		$scope.addForm.allowedRoles = {show: false, tip1: "Member Permissions"};

		$scope.searchThePending(true);
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