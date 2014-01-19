var ntwitter = require('ntwitter');
var cfg = require('../config');

var twit = new ntwitter(cfg.twitter);

twit.watch = function(cb) {
  twit.stream('statuses/filter', {track:'hackphx'}, function(stream) {
    cb(stream);
  });
};

module.exports = twit;