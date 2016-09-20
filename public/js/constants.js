angular.module('starter', [])

.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated'
})

.constant('API_ENDPOINT', {
  url: 'http://uia-portal.herokuapp.com/api'
  //url: 'http://127.0.0.1:8080/api'
  //  For a simulator use: url: 'http://127.0.0.1:8080/api'
})

.constant('HOME_ENDPOINT', {
  url: 'http://uia-portal.herokuapp.com/'
  //url: 'http://127.0.0.1:8080/'
  //  For a simulator use: url: 'http://127.0.0.1:8080/api'
});