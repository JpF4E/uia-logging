angular.module('appRoutes', [])

.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {

	$stateProvider

		// home page
		.state('home', {
			url: '/',
			templateUrl: 'views/home.html',
			controller: 'MainController'
		})

		.state('main', {
			url: '/main',
			templateUrl: 'views/main.html',
			controller: 'MainController'
		})

		.state('training-logs', {
			url: '/logs/training',
			templateUrl: 'views/logs.html',
			controller: 'LogsController'
		})

		.state('promotion-logs', {
			url: '/logs/promotion',
			templateUrl: 'views/logs.html',
			controller: 'LogsController'
		})

		.state('warning-logs', {
			url: '/logs/warning',
			templateUrl: 'views/logs.html',
			controller: 'LogsController'
		})

		.state('demotion-logs', {
			url: '/logs/demotion',
			templateUrl: 'views/logs.html',
			controller: 'LogsController'
		})

		.state('strike-logs', {
			url: '/logs/strike',
			templateUrl: 'views/logs.html',
			controller: 'LogsController'
		})

		.state('fired-logs', {
			url: '/logs/fired',
			templateUrl: 'views/logs.html',
			controller: 'LogsController'
		})

		.state('transfer-logs', {
			url: '/logs/transfer',
			templateUrl: 'views/logs.html',
			controller: 'LogsController'
		})

		.state('rank-selling-logs', {
			url: '/logs/rank-selling',
			templateUrl: 'views/logs.html',
			controller: 'LogsController'
		})

		.state('loa-logs', {
			url: '/logs/loa',
			templateUrl: 'views/logs.html',
			controller: 'LogsController'
		})

		.state('add-training-logs', {
			url: '/logs/training/add',
			templateUrl: 'views/addLogs.html',
			controller: 'AddLogsController'
		})

		.state('add-promotion-logs', {
			url: '/logs/promotion/add',
			templateUrl: 'views/addLogs.html',
			controller: 'AddLogsController'
		})

		.state('add-warning-logs', {
			url: '/logs/warning/add',
			templateUrl: 'views/addLogs.html',
			controller: 'AddLogsController'
		})

		.state('add-demotion-logs', {
			url: '/logs/demotion/add',
			templateUrl: 'views/addLogs.html',
			controller: 'AddLogsController'
		})

		.state('add-strike-logs', {
			url: '/logs/strike/add',
			templateUrl: 'views/addLogs.html',
			controller: 'AddLogsController'
		})

		.state('add-fired-logs', {
			url: '/logs/fired/add',
			templateUrl: 'views/addLogs.html',
			controller: 'AddLogsController'
		})

		.state('add-transfer-logs', {
			url: '/logs/transfer/add',
			templateUrl: 'views/addLogs.html',
			controller: 'AddLogsController'
		})

		.state('add-rank-selling-logs', {
			url: '/logs/rank-selling/add',
			templateUrl: 'views/addLogs.html',
			controller: 'AddLogsController'
		})

		.state('add-loa-logs', {
			url: '/logs/loa/add',
			templateUrl: 'views/addLogs.html',
			controller: 'AddLogsController'
		})

		.state('edit-training-logs', {
			url: '/logs/training/edit',
			params: {
				obj: null
			},
			templateUrl: 'views/editLogs.html',
			controller: 'EditLogsController'
		})

		.state('edit-promotion-logs', {
			url: '/logs/promotion/edit',
			params: {
				obj: null
			},
			templateUrl: 'views/editLogs.html',
			controller: 'EditLogsController'
		})

		.state('edit-warning-logs', {
			url: '/logs/warning/edit',
			params: {
				obj: null
			},
			templateUrl: 'views/editLogs.html',
			controller: 'EditLogsController'
		})

		.state('edit-demotion-logs', {
			url: '/logs/demotion/edit',
			params: {
				obj: null
			},
			templateUrl: 'views/editLogs.html',
			controller: 'EditLogsController'
		})

		.state('edit-strike-logs', {
			url: '/logs/strike/edit',
			params: {
				obj: null
			},
			templateUrl: 'views/editLogs.html',
			controller: 'EditLogsController'
		})

		.state('edit-fired-logs', {
			url: '/logs/fired/edit',
			params: {
				obj: null
			},
			templateUrl: 'views/editLogs.html',
			controller: 'EditLogsController'
		})

		.state('edit-transfer-logs', {
			url: '/logs/transfer/edit',
			params: {
				obj: null
			},
			templateUrl: 'views/editLogs.html',
			controller: 'EditLogsController'
		})

		.state('edit-rank-selling-logs', {
			url: '/logs/rank-selling/edit',
			params: {
				obj: null
			},
			templateUrl: 'views/editLogs.html',
			controller: 'EditLogsController'
		})

		.state('edit-loa-logs', {
			url: '/logs/loa/edit',
			params: {
				obj: null
			},
			templateUrl: 'views/editLogs.html',
			controller: 'EditLogsController'
		})

		.state('edit-profile', {
			url: '/profile',
			templateUrl: 'views/editProfile.html',
			controller: 'EditProfileController'
		})

		.state('pending', {
			url: '/admin/pending',
			templateUrl: 'views/pending.html',
			controller: 'PendingController'
		})

		.state('users', {
			url: '/admin/users',
			templateUrl: 'views/users.html',
			controller: 'UsersController'
		})

		.state('edit-users', {
			url: '/admin/users/edit',
			params: {
				obj: null
			},
			templateUrl: 'views/editUsers.html',
			controller: 'EditUsersController'
		})

		.state('sec-search', {
			url: '/security-search',
			templateUrl: 'views/secSearch.html',
			controller: 'SecSearchController'
		});

	$urlRouterProvider.otherwise('/');

	$locationProvider.html5Mode(true);
}])

.run(['$rootScope', '$state', 'AuthService', 'AUTH_EVENTS', function($rootScope, $state, AuthService, AUTH_EVENTS) {
	$rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {
		if (!AuthService.isAuthenticated()) {
			if (next.name !== 'home' && next.name !== 'sec-search') {
				event.preventDefault();
				$state.go('home');
			}
		} else {
			if (next.name === 'home') {
				event.preventDefault();
				$state.go('main');
			}
		}
	});
}]);