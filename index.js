var sentiment = require('sentiment');
var cfg = require('./config');
var app = require('./lib/server');
var dev = require('./lib/device');
var twit = require('./lib/twitter');

app.listen(cfg.port);

console.log('Listening to', cfg.port);

/* bluetooth */
dev.on('error', function(err){
  console.log('error', err);
});

dev.on('found', function(per){
  console.log('name', per.advertisement.localName);
  console.log('uuid', per.uuid);
});

dev.on('connected', function(per){
  console.log('connected');
});

dev.on('disconnected', function(per){
  console.log('disconnected');
});

var ping = function(per) {
  if (!per.interval) return; // cancelled
  per.write(new Buffer("ping"), function(err){
    if (err) console.log(err);
  });
};

var script = function(per) {
  wink(per, 8000);
  /*
  dance(per, 6000, function(){
    wink(per, 4000);
  });
  */
};

var dance = function(per, delay, cb) {
  per.write(new Buffer("Dance start"));
  setTimeout(function(){
    per.write(new Buffer("Dance stop"));
    if (cb) cb();
  }, delay);
};

var wink = function(per, delay, cb) {
  setInterval(function(){
    console.log('open');
    per.write(new Buffer("Open eye"));
    setTimeout(function(){
      console.log('close');
      per.write(new Buffer("Close eye"));
    }, delay/2);
  }, delay);
};

dev.on('ready', function(per){
  per.interval = setInterval(ping.bind(null, per), 1000);
  
  script(per);

  dev.on('positive', function(){
    wink(per, 8000);
  });
  dev.on('negative', function(){
    dance(per, 8000);
  });
  dev.on('neutral', function(){

  });
});

/* twitter */

twit.watch(function(stream){
  stream.on('data', function (data) {
    sentiment(data.text, function(err, res){
      if (err) return console.log(err);
      var positive = res.score > 0;
      var negative = res.score < 0;
      var neutral = res.score === 0;
      if (positive) dev.emit('positive', data.text);
      if (negative) dev.emit('negative', data.text);
      if (neutral) dev.emit('neutral', data.text);
      console.log(data.text, {
        positive: positive,
        negative: negative,
        neutral: neutral
      });
    });
  });
});

module.exports = {
  device: dev,
  server: app
};