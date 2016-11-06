'use strict';
var Rx = require('rxjs');
var crypto = require('crypto');


function AuthHelper(apiKeys){
        this.apiKeys = apiKeys;
 

}




AuthHelper.prototype.authenticate = function(params){
        if(!params.apiKey || !params.userId || !params.time || !params.hash){
                throw new Error('Missing params');
        }

        var secret = this.getSecretForKey(params.apiKey);
        if(!secret){
               throw new Error('Invalid API Key'); 
        }

        if(this.generateHash(params.userId, params.apiKey, params.time, secret) !== params.hash){
                throw new Error('Hash mismatch'); 
        }

        return true;
};

AuthHelper.prototype.generateHash = function(userId, apiKey, time, secret){
        return crypto.createHash('md5').update(userId + ':' + apiKey +  ':' + time + ':' + secret).digest('hex');
};

AuthHelper.prototype.getSecretForKey = function(apiKey){
        var secret = false;
        Object.keys(this.apiKeys).forEach(function(name){
                if(this.apiKeys[name].key === apiKey){
                        secret = this.apiKeys[name].secret;
                }
        }.bind(this));
        return secret;
};

AuthHelper.prototype.getProjectNameByKey = function(apiKey){
        var projectName = false;
        Object.keys(this.apiKeys).forEach(function(name){
                if(this.apiKeys[name].key === apiKey){
                        projectName = name;
                }
        }.bind(this));
        return projectName;
};


module.exports = AuthHelper;