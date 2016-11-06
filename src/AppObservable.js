'use strict';
var Rx = require('rxjs');
var express = require('express');
var app = express();

function AppObservable(){
        this.routes = [];
        this.app = app;
        
}


AppObservable.prototype.route = function(route){
        this.routes.push(route);
        var observable = Rx.Observable.create(function(observer){
                app.get(route, function(req, res) {
                         observer.next({params : req.query, response : res});
                });

                app.post(route, function(req, res) {
                         observer.next({params : req.params, response : res});
                });

        });
        var hot = observable.publish();
        hot.connect();
        return hot;
}; 


AppObservable.prototype.staticRoute = function(route, dir){
        app.use(route, express.static(dir));
        
};

AppObservable.prototype.start = function(port){
        this.app.listen(port);
        console.log('listening on  port :', port);
}; 


module.exports = AppObservable;