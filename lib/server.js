var square = require('./square');
var device = require('./device');
var express = require('express');

var app = express();

app.get('/login', function(req, res){
  res.writeHead(303, { 'location': square.getAuthClientRedirectUrl() });
  res.end();
});

app.get('/callback', function (req, res) {
  square.getAccessToken({
    code: req.query.code
  }, function (error, accessToken) {
    if(error) {
      res.send('An error was thrown: ' + error.message);
    } else {
      // Save the accessToken and redirect.
      square.accessToken = accessToken;
      console.log('Logged in with', accessToken);
      device.start();
    }
  });
});

module.exports = app;