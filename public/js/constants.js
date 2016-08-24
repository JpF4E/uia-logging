angular.module('starter', [])

.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated'
})

.constant('API_ENDPOINT', {
  url: 'https://uia-portal.scalingo.io/api'
  //url: 'http://127.0.0.1:8080/api'
  //  For a simulator use: url: 'http://127.0.0.1:8080/api'
})

.constant('HOME_ENDPOINT', {
  url: 'https://uia-portal.scalingo.io/'
  //url: 'http://127.0.0.1:8080/'
  //  For a simulator use: url: 'http://127.0.0.1:8080/api'
});