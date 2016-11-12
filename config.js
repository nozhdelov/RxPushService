var Config = {
        ENV : {
                development : {
                        port : 8080,
                        redisHost : '127.0.0.1',
                        redisPort : 6379
                },

                production : {
                        port : 8443,
                        redisHost : '127.0.0.1',
                        redisPort : 6379
                },
        },

        API_KEYS : {
                'TestApp' : {
                        key : 'jflkLKDFJF87dsfyF&Df8s7df--sdjfhFHDIyfhsdi',
                        secret : 'FLKDJ$%#FLDfiusdhgfdjgh9384hfs'
                } 
        }
};


module.exports.load = function(env){
        var result = {};

        if(!env || !Config.ENV[env]){
                throw new Error('Invalid Env');
        }

        Object.keys(Config).forEach(function(key){
                if(key !== 'ENV'){
                        result[key] = Config[key];
                }
        });

        Object.keys(Config.ENV[env]).forEach(function(key){
                 result[key] = Config.ENV[env][key];
        });
        return result;
};