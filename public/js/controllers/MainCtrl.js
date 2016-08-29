angular.module('MainCtrl', []).controller('MainController', function($http, $rootScope, $scope, $state, $interval, AuthService, AUTH_EVENTS, API_ENDPOINT) {

	$scope.user = {};

	$scope.alert = null;
	$scope.alert2 = null;
	$scope.requesting = false;
	$scope.currentState = $state;
	$scope.memberInfo = {};

	$scope.memberCatsEmpty = [true, true, true];
	$scope.memberRoles = {};
	$scope.memberName = "";
	$scope.showSpinner = true;

	var locale = window.navigator.userLanguage || window.navigator.language || window.navigator.browserLanguage || window.navigator.systemLanguage || "en-us";
	moment.locale(locale);

	var tz = moment.tz.guess();
	Date.prototype.toLocaleString = function(locale, options) {
		if('month' in options) {
			if(options.month != 'numeric') {
				return moment(this).tz(tz).format("ddd, LL");
			} else {
				return moment(this).tz(tz).format("ddd, L");
			}
		} else {
			if('timeZoneName' in options) {
				return moment(this).tz(tz).format("LTS z");
			} else {
				return moment(this).tz(tz).format("LTS");
			}
		}
	};
	//ServerDate.toLocaleString = dateFormatting;

	var options1 = {weekday: "short", year:"numeric", month:"long", day:"numeric"};
	var options2 = {hour:"numeric", minute:"numeric", second: "numeric", timeZoneName: "short"};
	
	var tick = function() {
		$rootScope.clockDate = ServerDate.toLocaleString(locale, options1);
		$rootScope.clockTime = ServerDate.toLocaleString(locale, options2);
	}
	tick();
	$interval(tick, 500);

	$scope.login = function() {
		$scope.showSpinner = true;
		AuthService.login($scope.user).then(function(msg) {
			$scope.showSpinner = false;
			$state.go('main');
		}, function(errMsg) {
			$scope.showSpinner = false;
			$scope.alert = {msg: errMsg, strong: "Login failed!"};
		});
	};

	$scope.signup = function() {
		if($scope.user.registerRepeatPassword !== $scope.user.registerPassword) {
			$scope.alert2 = {msg: "Passwords do not match.", strong: "Registration failed!"};
			return;
		}
		if(!$scope.requesting) {
			$scope.requesting = true;
		} else {
			$scope.showSpinner = true;
			AuthService.register($scope.user).then(function(msg) {
				$scope.showSpinner = false;
				$scope.alert2 = {type: "success", msg: msg, strong: "Registration succeeded!"};
				$scope.requesting = false;
				$scope.user = {};
			}, function(errMsg) {
				$scope.showSpinner = false;
				$scope.alert2 = {msg: errMsg, strong: "Registration failed!"};
			});
		}
	};

	$scope.logout = function() {
		AuthService.logout(false);
		if($scope.currentState.current.name != 'sec-search')
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
			$scope.memberInfo = AuthService.getMemberInfo();
			$scope.memberName = AuthService.getMemberName();
			if(AuthService.isFirstLogin()) {
				$state.go('edit-profile');
			}
			$scope.showSpinner = false;
		}
	}, true);

	if(AuthService.getTokenTimeout()) {
		AuthService.setTokenTimeout(false);
		//$scope.alert = {type: "warning", msg: "Please login again.", strong: "Session timed out!"};
	}
});