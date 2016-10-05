angular.module('SecSearchCtrl', []).controller('SecSearchController', function($http, $scope, $state, AuthService, AUTH_EVENTS, API_ENDPOINT) {

	$scope.alert = null;

	$scope.memberCatsEmpty = [true, true, true, true];
	$scope.memberRoles = {};
	$scope.memberName = "";
	$scope.memberType = "";

	$scope.currentState = $state;
	$scope.logTitle = null;
	$scope.logTitleSingular = null;
	$scope.logIcon = null;

	$scope.panel = {color: 'white', text: 'Input the username...', motto: ''};
	$scope.search = {};
	$scope.showSpinner = false;

	$scope.logout = function() {
		AuthService.logout(false);
		$state.go('sec-search');
	};

	$scope.closeAlert = function() {
		$scope.alert = null;
	};

	$scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
		AuthService.logout(true);
	});

	$scope.$watch(function(){
		return AuthService.isUserInfoReady();
	}, function (newValue) {
		if(newValue != null) {
			$scope.memberCatsEmpty = AuthService.getMemberCatsEmpty();
			$scope.memberRoles = AuthService.getMemberRoles();
			$scope.memberName = AuthService.getMemberName();
			$scope.memberType = AuthService.getMemberType();
			if(newValue == false)
				$scope.memberName = "";
		}
	}, true);

	$scope.resetForm = function() {
		$scope.search.username = null;
		$scope.panel = {color: 'white', text: 'Input the username...', motto: ''};
	}

	$scope.secSearch = function() {
		$scope.showSpinner = true;
		$http.post(API_ENDPOINT.url + '/secSearch', {username: $scope.search.username}).then(function(result) {
			$scope.showSpinner = false;
			if (result.data.success) {
				$scope.panel = result.data.panel;
			} else {
				$scope.alert = {msg: result.data.msg, strong: "Failed to " + $scope.logTitle + "!"};
			}
		});
	}

	$scope.$watch('currentState.current.name', function (newValue) {
		$scope.logTitle = "Security Search";
		$scope.logTitleSingular = "Security Search";
		$scope.logIcon = "eye-open";
	}, true);

	Date.prototype.addMinutes= function(h){
		this.setMinutes(this.getMinutes()+h);
		return this;
	}
});