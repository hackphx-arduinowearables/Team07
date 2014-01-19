var cfg = require('../config');
var EE = require('events').EventEmitter;
var noble = require('noble');

var device = new EE();

var onDiscover = function(per){
  if (cfg.uuid && per.uuid !== cfg.uuid) {
    console.log('not a match', per.uuid);
    return;
  }

  if (per.advertisement.localName.indexOf('Xadow') === -1) {
    console.log('not a xadow', per.advertisement.localName);
    return;
  }

  per.write = function(data, cb) {
    var dataSvc = per.__services.filter(function(s){
      return s.uuid === 'fff0';
    })[0];
    var dataChar = dataSvc.characteristics.filter(function(s){
      return s.uuid === 'fff2';
    })[0];
    dataChar.write(data, true, cb);
    return per;
  };

  per.read = function(cb) {
    var dataSvc = per.__services.filter(function(s){
      return s.uuid === 'fff0';
    })[0];
    var dataChar = dataSvc.characteristics.filter(function(s){
      return s.uuid === 'fff1';
    })[0];
    dataChar.read(cb);
    return per;
  };

  device.emit('found', per);

  per.on('connect', function(){
    noble.stopScanning();
    device.emit('connected', per);
    if (per.__services) return device.emit('ready', per);
    per.discoverAllServicesAndCharacteristics(function(err, services, chars){
      if (err) return device.emit('error', err);

      per.__services = services;
      per.__chars = chars;

      device.emit('ready', per);
    });
  });

  per.on('disconnect', function(){
    clearInterval(per.interval);
    delete per.interval;

    device.emit('disconnected', per);
    setTimeout(per.connect.bind(per), 1000);
  });

  per.connect();
};

noble.on('discover', onDiscover);

noble.on('stateChange', function(state) {
  console.log('noble', state);
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});


module.exports = device;