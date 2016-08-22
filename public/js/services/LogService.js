angular.module('LogService', [])

.service('LogService', function($q, $http, API_ENDPOINT) {
	var property = '';
	var page = '';
	var valid = false;

	return {
		getProperty: function () {
			return property;
		},
		setProperty: function(value) {
			property = value;
		},
		getPage: function () {
			return page;
		},
		setPage: function(value) {
			page = value;
		},
		isValid: function () {
			return valid;
		},
		setValid: function(value) {
			valid = value;
		}
	};
});