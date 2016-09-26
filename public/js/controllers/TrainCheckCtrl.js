angular.module('TrainCheckCtrl', []).controller('TrainCheckController', function($http, $scope, $state, AuthService, AUTH_EVENTS, API_ENDPOINT) {

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
	$scope.trainers = [];
	$scope.trainersCorrect = [];

	$scope.comments = [];
	$scope.commentsCorrect = [];

	$scope.search = {};
	$scope.showSpinner = false;
	$scope.loadMoreShow = true;

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
		promoTag : {show: false, tip1: ""},
		rank : {show: false, tip1: ""},
		email : {show: false, tip1: ""},
		createdAt : {show: false, tip1: ""},
		lastTrained : {show: false, tip1: ""},
		allowedRoles : {show: false, tip1: ""}
	}

	$scope.resetForm = function() {
		$scope.search.name = null;
	}

	var lastTrainedAt = null;

	$scope.searchTheTrainers = function(reload) {
		$scope.showSpinner = true;
		if(reload) {
			lastTrainedAt = null;
		}
		$http.post(API_ENDPOINT.url + '/searchTrainers', {name: $scope.search.name, lastTrained: lastTrainedAt || ServerDate()}).then(function(result) {
			$scope.showSpinner = false;
			if (result.data.success) {

				if(result.data.trainers.length > 0)
					lastTrainedAt = result.data.trainers[result.data.trainers.length-1].trainAtRisk;
				if(result.data.trainers.length == 0)
					$scope.loadMoreShow = false;
				if(reload) {
					$scope.trainers = [];
					$scope.trainersCorrect = [];
				}

				console.log(result.data.trainers);

				for (var i = 0; i < result.data.trainers.length; i++) {
					if(result.data.trainers[i].name == "Admin")
						continue;
					var mom = moment(result.data.trainers[i].trainAtRisk);
					if(result.data.trainers[i].trainAtRisk != null) {
						result.data.trainers[i].lastTrainedDiff = mom.from(moment(ServerDate.now()));
					} else {
						result.data.trainers[i].lastTrainedDiff = "";
					}
					result.data.trainers[i].joined = moment(result.data.trainers[i].createdAt).from(moment(ServerDate.now()));
					if(moment(ServerDate.now()).diff(mom, "weeks") >= 1 || result.data.trainers[i].trainAtRisk == null) {
						result.data.trainers[i].trainersAllowedRolesNames = printableNames(result.data.trainers[i].allowedRoles);
						result.data.trainers[i].trainersAllowedRoles = printableRoles(result.data.trainers[i].allowedRoles);
						$scope.comments.push(false);
						$scope.trainers.push(result.data.trainers[i]);
					} else {
						result.data.trainers[i].trainersCorrectAllowedRolesNames = printableNames(result.data.trainers[i].allowedRoles);
						result.data.trainers[i].trainersCorrectAllowedRoles = printableRoles(result.data.trainers[i].allowedRoles);
						$scope.commentsCorrect.push(false);
						$scope.trainersCorrect.push(result.data.trainers[i]);
					}
				}

				// var nullArray = [];
				// for (var i = $scope.trainers.length - 1; i >= 0; i--) {
				// 	if($scope.trainers[i].trainAtRisk == null) {
				// 		nullArray.push($scope.trainers[i]);
				// 		$scope.trainers = $scope.trainers.slice(0, i);
				// 	} else {
				// 		break;
				// 	}
				// }

				// $scope.trainers = nullArray.concat($scope.trainers);

				//$scope.alert = {type: "success", msg: result.data.msg, strong: $scope.logTitleSingular + " added successfully!"};
			} else {
				$scope.alert = {msg: result.data.msg, strong: "Failed to retrieve Trainers!"};
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

	//TODO SEE IF PROMO TAG ALREADY EXISTS
	$scope.$watch('currentState.current.name', function (newValue) {
		//if(newValue == LogService.getPage() && LogService.isValid()) {
		//	$scope.addForm = LogService.getProperty();
		//	LogService.setValid(false);
		//}
		$scope.logTitle = "Trainer Check";
		$scope.logTitleSingular = "Trainer Check";
		$scope.logIcon = "flag";
		$scope.addForm.name = {show: true, tip1: "Username"};
		$scope.addForm.promoTag = {show: false, tip1: "Promotion Tag"};
		$scope.addForm.rank = {show: true, tip1: "Current Rank"};
		$scope.addForm.email = {show: true, tip1: "Email"};
		$scope.addForm.createdAt = {show: true, tip1: "Joined"};
		$scope.addForm.lastTrained = {show: true, tip1: "Last Trained"};
		$scope.addForm.allowedRoles = {show: true, tip1: "Member Permissions"};

		$scope.searchTheTrainers(true);
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