angular.module('AuthService', [])

.service('AuthService', function($q, $http, API_ENDPOINT) {
	var LOCAL_TOKEN_KEY = 'yourTokenKey';
	var isAuthenticated = false;
	var authToken;
	var memberInfo = null;

	var memberCatsEmpty = [true, true, true];
	var memberRoles = {};
	var memberName = "";
	var memberType = "";
	var firstLogin = false;
	var userInfoReady = false;
	var tokenTimeout = false;

	function loadUserCredentials() {
		var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
		if (token) {
			useCredentials(token);
		}
	}
 
	function storeUserCredentials(token) {
		window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
		useCredentials(token);
	}

	var reloadUser = function() {
		userInfoReady = false;
		$http.get(API_ENDPOINT.url + '/memberinfo').then(function(result) {
			if (result.data.success) {
				memberInfo = result.data.theUser;
				for (var check in memberInfo.allowedRoles) {
					switch(memberInfo.allowedRoles[check].role) {
						case 'training-logs':
						case 'promotion-logs':
							if(memberInfo.allowedRoles[check].perm[0] ||
								memberInfo.allowedRoles[check].perm[1]) {
								memberCatsEmpty[0] = false;
							}
							break;
						case 'warning-logs':
						case 'demotion-logs':
						case 'strike-logs':
						case 'fired-logs':
							if(memberInfo.allowedRoles[check].perm[0] ||
								memberInfo.allowedRoles[check].perm[1]) {
								memberCatsEmpty[1] = false;
							}
							break;
						case 'transfer-logs':
						case 'rank-selling-logs':
						case 'loa-logs':
							if(memberInfo.allowedRoles[check].perm[0] ||
								memberInfo.allowedRoles[check].perm[1]) {
								memberCatsEmpty[2] = false;
							}
							break;
					}
					memberRoles[memberInfo.allowedRoles[check].role] = memberInfo.allowedRoles[check].perm;
				}
				memberName = memberInfo.name;
				memberType = memberInfo.type;
				firstLogin = result.data.fstLogin;
				userInfoReady = true;
			}
		});
	}

	function useCredentials(token) {
		isAuthenticated = true;
		authToken = token;

		// Set the token as header for your requests!
		$http.defaults.headers.common.Authorization = authToken;

		reloadUser();
	}

	function destroyUserCredentials() {
		authToken = undefined;
		userInfoReady = false;
		isAuthenticated = false;
		memberInfo = null;
		memberCatsEmpty = [true, true, true];
		memberRoles = {};
		$http.defaults.headers.common.Authorization = undefined;
		window.localStorage.removeItem(LOCAL_TOKEN_KEY);
	}

	var register = function(user) {
		return $q(function(resolve, reject) {
			$http.post(API_ENDPOINT.url + '/signup', user).then(function(result) {
				if (result.data.success) {
					resolve(result.data.msg);
				} else {
					reject(result.data.msg);
				}
			});
		});
	};

	var login = function(user) {
		return $q(function(resolve, reject) {
			$http.post(API_ENDPOINT.url + '/authenticate', user).then(function(result) {
				if (result.data.success) {
					storeUserCredentials(result.data.token);
					resolve(result.data.msg);
				} else {
					reject(result.data.msg);
				}
			});
		});
	};
 
	var logout = function(dced) {
		destroyUserCredentials();
		if(dced) {
			tokenTimeout = true;
		}
	};

	// var getTokenStatus = function() {
	// 	return $q(function(resolve, reject) {
	// 		$http.get(API_ENDPOINT.url + '/memberinfo').then(function(result) {
	// 			if (!result.data.success) {
	// 				reject(result.data.msg);
	// 			} else {
	// 				resolve(result.data.msg);
	// 			}
	// 		});
	// 	});
	// };

	loadUserCredentials();
 
	return {
		login: login,
		register: register,
		logout: logout,
		isAuthenticated: function() {return isAuthenticated;},
		isUserInfoReady: function() {return userInfoReady;},
		getMemberInfo: function() {return memberInfo;},
		getMemberCatsEmpty: function() {return memberCatsEmpty;},
		getMemberRoles: function() {return memberRoles;},
		getMemberName: function() {return memberName;},
		getMemberType: function() {return memberType;},
		getTokenTimeout: function() {return tokenTimeout;},
		setTokenTimeout: function(val) {tokenTimeout = val;},
		isFirstLogin: function() {return firstLogin;},
		falseFirstLogin: function() {firstLogin = false;},
		reloadUser: reloadUser
		//getTokenStatus: getTokenStatus
	};
})

.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
	return {
		responseError: function (response) {
			$rootScope.$broadcast({
				401: AUTH_EVENTS.notAuthenticated,
			}[response.status], response);
			return response;
		}
	};
})

.config(function ($httpProvider) {
	$httpProvider.interceptors.push('AuthInterceptor');
});