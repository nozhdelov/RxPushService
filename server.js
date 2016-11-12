'use strict';

var commandLineArgs = require('command-line-args');
var Rx = require('rxjs');
var AppObservable = require('./src/AppObservable.js');
var Storage = require('./src/Storage.js');
var PushObservable = require('./src/PushObservable.js');
var AuthHelper = require('./src/AuthHelper.js');



try {
	var optionDefinitions = [
		{ name: 'env', alias: 'e', type: String, defaultOption: true },
	];
	var options = commandLineArgs(optionDefinitions);
} catch (e){
	options = {env : 'production'};
}


var config = require('./config.js').load(options.env || 'production');




var app$ = new AppObservable(config.port);
var storage = new Storage(config.redisHost, config.redisPort);
var push$ = new PushObservable();
var auth = new AuthHelper(config.API_KEYS);


app$.route('/register/').filter(function(requestData){
	requestData.project = auth.getProjectNameByKey(requestData.params.apiKey);
	try {
		auth.authenticate(requestData.params);
		requestData.response.send('OK');
		return true;
	} catch(err){
		requestData.response.send(err.message);
		return false;
	}
	
}).map(function(requestData){
	var regData = JSON.parse(requestData.params.registration);
	regData.userId = requestData.params.userId;
	regData.project = requestData.project;

	return regData;
}).switchMap(function(regData){	
	return storage.registrationExists(regData.project, regData.userId, regData.endpoint);
}, function(outerValue, innerValue){
	return {exists : innerValue, regData : outerValue};
}).filter(function(data){
	return !data.exists;
}).pluck('regData').retry().subscribe(
	function(regData){
		storage.saveRegistration(regData);
	}, function(err){
		console.log('ERROR : ', err);
	}
);


app$.route('/register/').filter(function(requestData){
	requestData.project = auth.getProjectNameByKey(requestData.params.apiKey);
	try {
		auth.authenticate(requestData.params);
		requestData.response.send('OK');
		return true;
	} catch(err){
		requestData.response.send(err.message);
		return false;
	}
	
}).map(function(requestData){
	var regData = JSON.parse(requestData.params.registration);
	regData.userId = requestData.params.userId;
	regData.project = requestData.project;

	return regData;
}).switchMap(function(regData){	
	return storage.registrationExists(regData.project, regData.userId, regData.endpoint);
}, function(outerValue, innerValue){
	return {exists : innerValue, regData : outerValue};
}).filter(function(data){
	return !data.exists;
}).pluck('regData').retry().subscribe(
	function(regData){
		storage.removeRegistration(regData);
	}
);




app$.route('/send/').filter(function(requestData){
	requestData.params.project = auth.getProjectNameByKey(requestData.params.apiKey);
	try {
		auth.authenticate(requestData.params);
		requestData.response.send('OK');
		return true;
	} catch(err){
		requestData.response.send(err.message);
		return false;
	}
	
}).switchMap(function(requestData){
	var params = requestData.params;
	return storage.getRegistrations(params.project, params.userId);
}, function(outerValue, innerValue){
	return {registration : innerValue, params : outerValue.params };
}).switchMap(function(data){

	return push$.send(data.registration, data.params.payload).catch(function(err){
		console.log('SEND ERROR : ', err.body);
		return Rx.Observable.empty();
	});
}).retry().subscribe(function(sendResult){});



app$.route('/certVer/payHEOgCuyqeLAsvkLaHxfSLTgoxnzntJSwaMtmgHpc/').filter(function(requestData){
	requestData.response.send('payHEOgCuyqeLAsvkLaHxfSLTgoxnzntJSwaMtmgHpc');
}).subscribe(function(){});


app$.staticRoute('/testapp', 'testapp');
app$.staticRoute('/certVer', 'certVer');




