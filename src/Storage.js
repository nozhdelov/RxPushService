'use strict';

var redis = require('redis');
var Rx = require('rxjs');
var Crypto = require('crypto');


function Storage(host, port){
        this.host = host; 
        this.port = port; 
        this.client = redis.createClient({
                host : this.host,
                port : this.port
        });

        this.client.select(3, function() {});

}


Storage.prototype.registrationExists = function(project, userId, endpoint){
        var observable = Rx.Observable.create(function(observer){
                var registrationId = this.generateRegistrationId(project, userId, endpoint);
                this.getRegistrationIds(project, userId).subscribe(function(regIds){
                        observer.next(regIds.indexOf(registrationId) >= 0);
                        observer.complete();
                }, function(){
                        observer.next(false);
                        observer.complete();
                });
        }.bind(this));
        
        return observable;
};


Storage.prototype.getRegistrationIds = function(project, userId){
        var key = project + '::userRegistrations::' + userId;
        var observable = Rx.Observable.create(function(observer){
                this.client.lrange(key, 0, -1, function(err, regIds){
                        if(err){
                                observer.error(err.message);
                                observer.complete();
                                return;
                        }
                        observer.next(regIds);
                        observer.complete();
                });
        }.bind(this));

        return observable;
};


Storage.prototype.saveRegistration = function(registrationData){
        var project = registrationData.project;
        var registrationId = this.generateRegistrationId(project, registrationData.userId, registrationData.endpoint);
        var registrationInfo = {
                endpoint : registrationData.endpoint,
                publicKey : registrationData.keys.p256dh,
                secret : registrationData.keys.auth
        };
        var transaction = this.client.multi();
        transaction.hmset(project + '::registrations::' + registrationId, registrationInfo);
        transaction.lpush(project + '::userRegistrations::' + registrationData.userId, registrationId);
        transaction.exec(function(err, results){
                if(err){
                        console.log(err);
                }
        });
};


Storage.prototype.removeRegistration = function(registrationData){
        var project = registrationData.project;
        var registrationId = this.generateRegistrationId(project, registrationData.userId, registrationData.endpoint);
    
        var transaction = this.client.multi();
        transaction.del(project + '::registrations::' + registrationId);
        transaction.lrem(project + '::userRegistrations::' + registrationData.userId, 1, registrationId);
        transaction.exec(function(err, results){
                if(err){
                        console.log(err);
                }
        });
};


Storage.prototype.generateRegistrationId = function(project, userId, endpoint){
        return Crypto.createHash('md5').update(project + ':' + userId + ':' + endpoint).digest('hex');
};


Storage.prototype.getRegistrations = function(project, userId){
        var transaction = this.client.multi();
        var observable = Rx.Observable.create(function(observer){
                this.getRegistrationIds(project, userId).subscribe(function(regIds){
                        regIds.forEach(function(regId){
                                transaction.hgetall(project + '::registrations::' + regId);
                        });
                        transaction.exec(function(err, result){
                                if(err){

                                        return;
                                }
                                result.forEach(function(registration){
                                        observer.next(registration);
                                });
                                observer.complete();   
                        });
                });
        }.bind(this));
        
        return observable;
};


Storage.prototype.incrDayMessageCount = function(project){
        var date = new Date();
        var key = project + '::messagesPerDay::' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        this.client.incr(key);
}


module.exports = Storage;