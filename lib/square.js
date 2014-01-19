var request = require('request');
var _ = require('lodash');
var sq = require('node-foursquare');
var cfg = require('../config');

var api = sq(cfg.square);

if (cfg.square.token) {
  api.accessToken = cfg.square.token;
}

api.venues = function(lat, lon, cb) {
  var url = "https://api.foursquare.com/v2/venues/explore";
  var rOpt = {
    url: url,
    json: true,
    qs: {
      ll: lat+","+lon,
      novelty: "new",
      section: cfg.square.category,
      oauth_token: api.accessToken
    }
  };
  request(rOpt, function(err, res, body) {
    if (err) return cb(err);
    var wrapper = body.response.groups[0].items;
    var venues = _.chain(wrapper)
      .map('venue')
      .where(function(v){
        return v.hours && v.hours.isOpen;
      });
    cb(null, venues.value());
  });
};

module.exports = api;