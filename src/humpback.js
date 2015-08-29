'use strict';

/**
 * @ngdoc module
 * @name humpback-core-pack
 * @file humpback.js
 *
 * @description
 *
 * For more information, visit:
 * http://github.com/CaliStyle/humpback-core-pack
 */
angular.module('humpback.core', [
  'ngTagsInput',
  'humpback.core.cms'
]);


angular.module('humpback.core.cms', [])

.factory('Users', function(DS, utils) {
  
  var Users = function() {
    this.users = [];
    this.busy = false;
    this.skip = 0;
    this.limit = 10;
    this.total = 0;
    this.start = 0;
    this.end = 10;
    this.criteria = '';
    this.sort = 'createdAt desc';
  };
  
  Users.prototype.count = function() {
    var users = this;
    users.total = 0;

  }

  Users.prototype.prevPage = function() {
    var users = this;
    
    if (users.busy){ 
      return;
    }
    users.busy = true;

    users.skip = users.skip - users.limit * 2 >= 0 ? users.skip - users.limit * 2 : 0;
    users.start = users.skip;
    users.end = users.skip + users.limit;

    console.log("SKIP:",users.skip,"START:",users.start,"END:",users.end);

    DS.findAll('route', {limit: users.limit, skip: users.skip, sort: users.sort})
    .then(function(list){

      users.users = _.merge(users.users, list);
      users.visible = list;
      
        users.skip = users.skip + users.limit;
        users.busy = false;
    })
    .catch(function(err){
      if(utils.development()){ console.log(err); }; // reason why query failed
    });

   }

  Users.prototype.nextPage = function() {
    var users = this;
    
    if (users.busy){ 
      return;
    }
    users.busy = true;

    users.start = users.skip;
    users.end = users.skip + users.limit;

    console.log("SKIP:",users.skip,"START:",users.start,"END:",users.end);

    DS.findAll('route', {limit: users.limit, skip: users.skip, sort: users.sort})
    .then(function(list){

      users.users = _.merge(users.users, list);
      users.visible = list;
      
        users.skip = users.skip + users.limit;
        users.busy = false;
    })
    .catch(function(err){
      if(utils.development()){ console.log(err); }; // reason why query failed
    });

   }
  
  return Users;
})

.factory('Routes', function(DS, utils) {
  
  var Routes = function() {
    this.visible = [];
    this.routes = [];
    this.busy = false;
    this.skip = 0;
    this.limit = 10;
    this.total = 0;
    this.start = 0;
    this.end = 10;
    this.criteria = '';
    this.sort = 'createdAt desc';
  };

  Routes.prototype.prevPage = function() {
    var routes = this;
    
    if (routes.busy){ 
      return;
    }
    routes.busy = true;

    routes.skip = routes.skip - routes.limit * 2 >= 0 ? routes.skip - routes.limit * 2 : 0;
    routes.start = routes.skip;
    routes.end = routes.skip + routes.limit;

    console.log("SKIP:",routes.skip,"START:",routes.start,"END:",routes.end);

    DS.findAll('route', {limit: routes.limit, skip: routes.skip, sort: routes.sort})
    .then(function(list){

      routes.routes = _.merge(routes.routes, list);
      routes.visible = list;
      
        routes.skip = routes.skip + routes.limit;
        routes.busy = false;
    })
    .catch(function(err){
      if(utils.development()){ console.log(err); }; // reason why query failed
    });

   }

  Routes.prototype.nextPage = function() {
    var routes = this;
    
    if (routes.busy){ 
      return;
    }
    routes.busy = true;

    routes.start = routes.skip;
    routes.end = routes.skip + routes.limit;

    console.log("SKIP:",routes.skip,"START:",routes.start,"END:",routes.end);

    DS.findAll('route', {limit: routes.limit, skip: routes.skip, sort: routes.sort})
    .then(function(list){

      routes.routes = _.merge(routes.routes, list);
      routes.visible = list;
      
        routes.skip = routes.skip + routes.limit;
        routes.busy = false;
    })
    .catch(function(err){
      if(utils.development()){ console.log(err); }; // reason why query failed
    });

   }
  
  return Routes;


 }) 

;