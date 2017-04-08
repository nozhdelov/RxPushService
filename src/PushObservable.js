'use strict';

var Rx = require('rxjs');
var webpush = require('web-push');

function PushObservable(){
        this.pushService = webpush;
        this.pushService.setGCMAPIKey('**************************************');

}

PushObservable.prototype.send = function(registration, payload, options){
        var pushSubscription = {
		endpoint: registration.endpoint,
		keys: {
			p256dh: registration.publicKey,
			auth: registration.secret
		}
	};

        var result = this.pushService.sendNotification(pushSubscription, payload, options);
        return Rx.Observable.fromPromise(result);
};


module.exports = PushObservable;
