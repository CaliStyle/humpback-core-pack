(function ( window, angular ) {

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
  'humpback.io',
  'ngTagsInput',
  'ui.ace',
  'ngSanitize',

  'humpback.core.cms',
  'humpback.core.users',
  'humpback.core.categories',
  'humpback.core.routes',
  'humpback.core.models',
  'humpback.core.settings'
]);

angular.module('humpback.core.cms', [])
.factory('CMS', function($document, $rootElement) {
  
  var CMS = function(){
    this.suffix = " | " + window._name;
    this.title = '';
    this.description = '';
    this.keywords = '';
    this.image = '';
    this.url = '';
    this.siteName = '';
    this.locale = window._locale;
  };
 
  CMS.prototype.setSuffix = function(s) {
    return this.suffix = s;
  }

  CMS.prototype.getSuffix = function() {
    return this.suffix;
  }

  CMS.prototype.setTitle = function(t) {
    if (this.suffix !== "") {
      this.title = t + this.suffix;
    } else {
      this.title = t;
    }

    var meta = angular.element(document.querySelectorAll('meta[property="og:title"]'));
    meta.attr('content', this.title);

    return $document.prop('title', this.title);
  }

  CMS.prototype.getTitle = function() {
    return $document.prop('title');
  }

  CMS.prototype.setDescription = function(d) {
    this.description = d;
    var meta = angular.element(document.querySelectorAll('meta[name="description"]'));
    return meta.attr('content', this.description);
  }

  CMS.prototype.getDescription = function() {
    return angular.element(document.querySelectorAll('meta[name="description"]'));
  }

  CMS.prototype.setKeywords = function(k) {
    if(_.isObject(k)){
      this.keywords = _.pluck(k, 'text').join(',');
    }else{
      this.keywords = k;
    }
    
    var meta = angular.element(document.querySelectorAll('meta[name="keywords"]'));
    return meta.attr('content', this.keywords);
  }

  CMS.prototype.getKeywords = function() {
    return angular.element(document.querySelectorAll('meta[name="keywords"]'));
  }

  CMS.prototype.setImage = function(i) {
    this.image = i;
    var meta = angular.element(document.querySelectorAll('meta[property="og:image"]'));
    return meta.attr('content', this.image);
  }

  CMS.prototype.getImage = function() {
    return angular.element(document.querySelectorAll('meta[property="og:image"]'));
  }

  CMS.prototype.setUrl = function(u) {
    this.url = u;
    var meta = angular.element(document.querySelectorAll('meta[property="og:url"]'));
    return meta.attr('content', this.url);
  }

  CMS.prototype.getUrl = function() {
    return angular.element(document.querySelectorAll('meta[property="og:url"]'));
  }

  CMS.prototype.setSiteName = function(s) {
    this.siteName = s;
    var meta = angular.element(document.querySelectorAll('meta[property="og:site_name"]'));
    return meta.attr('content', this.siteName);
  }

  CMS.prototype.getSiteName = function() {
    return angular.element(document.querySelectorAll('meta[property="og:site_name"]'));
  }

  CMS.prototype.setLocale = function(l) {
    this.locale = l;
    var meta = angular.element(document.querySelectorAll('meta[property="og:locale"]'));
    return meta.attr('content', this.locale);
  }

  CMS.prototype.getLocale = function() {
    return angular.element(document.querySelectorAll('meta[property="og:locale"]'));
  }

  return CMS;
});

angular.module('humpback.core.users', [])

.factory('Users', function(DS, utils) {
  
  var Users = function() {
    this.visible = [];
    this.users = [];
    this.busy = false;
    this.skip = 0;
    this.limit = 10;
    this.total = 0;
    this.start = 0;
    this.end = 10;
    this.criteria = '';
    this.sort = 'createdAt desc';
    this.error = null;
    this.message = null;
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

    if(utils.development()){ console.log("SKIP:",users.skip,"START:",users.start,"END:",users.end); };

    DS.findAll('route', {limit: users.limit, skip: users.skip, sort: users.sort})
    .then(function(list){

      users.users = _.merge(users.users, list);
      users.visible = list;
      users.skip = users.skip + users.limit;
      
    })
    .finally(function () {
      users.busy = false;
    })
    .catch(function(err){
      users.error = err.status;
      users.message = err.data;
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

    if(utils.development()){ console.log("SKIP:",users.skip,"START:",users.start,"END:",users.end); };

    DS.findAll('user', {limit: users.limit, skip: users.skip, sort: users.sort})
    .then(function(list){

      users.users = _.merge(users.users, list);
      users.visible = list;
      users.skip = users.skip + users.limit;
        
    })
    .finally(function () {
      users.busy = false;
    })
    .catch(function(err){
      users.error = err.status;
      users.message = err.data;
    });

   }
  
  return Users;
})
.factory('User', function(DS, utils) {

  var User = function(id) {
    this.id = id;
    this.user = {};
    this.criteria = '';
    this.busy = false;
    this.updating = false;
    this.error = null;
    this.message = null;
    
  };
  
  User.prototype.create = function() {
    var user = this;
    
    if (user.busy){ 
      return;
    }
    user.busy = true;

  }

  User.prototype.read = function() {
    var user = this;
    if (user.busy){ 
      return;
    }
    user.busy = true;

    DS.find('user', user.id)
    .then(function(thisuser){
      
      console.log(thisuser);

      user.user = thisuser;
    })
    .finally(function () {
      user.busy = false;
    })
    .catch(function (err) {
      user.error = err.status;
      user.message = err.data;
    });
  }

  User.prototype.get = function(id) {
    var user = this;
    user.busy = true;

    DS.find('user', id)
    .then(function(thisuser){
      user.user = thisuser;

    })
    .finally(function () {
      user.busy = false;
    })
    .catch(function (err) {
      user.error = err.status;
      user.message = err.data;
    });
  }
  

  User.prototype.update = function(thisroute) {
    var user = this;
    
    if (user.busy || user.updating){ 
      return;
    }
    user.busy = true;
    user.updating = true;
    
    console.log(user.user);

    DS.update('user', user.id, thisuser)
    .then(function(updatedUser){
      user.user = updatedUser;
    })
    .finally(function () {
      user.busy = false;
      user.updating = false;
    })
    .catch(function(err){
      user.error = err.status;
      user.message = err.data;
    });
  }

  return User;

})
;

angular.module('humpback.core.categories', [])
.factory('Categories', function(DS, utils, $location) {
  
  var Categories = function() {
    this.visible = [];
    this.categories = [];
    this.busy = false;
    this.skip = 0;
    this.limit = 100;
    this.total = 0;
    this.start = 0;
    this.end = 100;
    this.criteria = {};
    this.sort = 'createdAt desc';
    this.error = null;
    this.message = null;
  };

  Categories.prototype.buildRequest = function(){
    var categories = this;

    var request = {
      limit: categories.limit,
      skip: categories.skip,
      sort: categories.sort
    }
    if(!_.isEmpty(categories.criteria)){
      request.where = categories.criteria;
    }
    return request;
  };

  Categories.prototype.search = function() {
    var categories = this, request;
    
    if (categories.busy){ 
      return;
    }
    categories.busy = true;
    request = categories.buildRequest();
    
    if(utils.development()){ console.log("SKIP:",categories.skip,"START:",categories.start,"END:",categories.end,"WHERE:",categories.criteria); };
    
    DS.findAll('category', request)
    .then(function(list){
      
      categories.categories = _.merge(categories.categories, list);
      categories.visible = _.rest(categories.categories, categories.start).slice(0, categories.end);
      categories.skip = categories.skip + categories.limit;

    })
    .finally(function () {
      categories.busy = false;
    })
    .catch(function(err){
      categories.error = err.status;
      categories.message = err.data;
    });
  }

  Categories.prototype.init = function() {
    var categories = this;
    
    if (categories.busy){ 
      return;
    }

    categories.start = categories.skip;
    categories.end = categories.skip + categories.limit;
    
    categories.search();
  }

  Categories.prototype.infinite = function() {
    var categories = this;
    if (categories.busy){ 
      return;
    }

    categories.start = 0;
    categories.end = categories.skip + categories.limit;
    
    categories.search();

  }

  Categories.prototype.prevPage = function() {
    var categories = this, request;
    
    if (categories.busy){ 
      return;
    }
 
    categories.skip = categories.skip - categories.limit * 2 >= 0 ? categories.skip - categories.limit * 2 : 0;
    categories.start = categories.skip;
    categories.end = categories.skip + categories.limit;

    categories.search();

  }

  Categories.prototype.nextPage = function() {
    var categories = this, request;
    
    if (categories.busy){ 
      return;
    }

    categories.start = categories.skip;
    categories.end = categories.skip + categories.limit;
    
    categories.search();

  }

  Categories.prototype.reset = function(type) {
    var categories = this;
    if(type){
       $location.search(type, categories[type]);
    }
    
    this.skip = 0;
    this.init(); 
  }
  
  return Categories;

})
.factory('Category', function(DS, utils, $state) {

  var Category = function(id) {
    this.id = id;
    this.category = {};
    this.criteria = {};
    this.busy = false;
    this.updating = false;
    this.error = null;
    this.message = null;
    
  };

  Category.prototype.create = function(thiscategory) {
    var category = this;
    
    if (category.busy || category.updating){ 
      return;
    }
    category.busy = true;
    category.updating = true;

    DS.create('category', thiscategory)
    .then(function(thiscategory){
      
      category.category = thiscategory;
      category.id = thiscategory.id;
      utils.alert({location: 'system-alerts', color: 'success', title:category.category.name, content: 'Created Successfully', autoclose: 2000});
      $state.go('admin.cms.categories.view',{id: thiscategory.id});
    })
    .finally(function () {
      category.busy = false;
      category.updating = false;
    })
    .catch(function (err) {
      category.error = err.status;
      category.message = err.data;
      utils.alert({location: 'system-alerts', color: 'error', title:category.category.name, content: err.status, autoclose: 2000});
    });

  }

  Category.prototype.read = function() {
    var category = this;
    if (category.busy){ 
      return;
    }
    category.busy = true;

    DS.find('category', category.id)
    .then(function(thiscategory){
      
      console.log(thiscategory);
      category.category = thiscategory;

    })
    .finally(function () {
      category.busy = false;
    })
    .catch(function (err) {
      category.error = err.status;
      category.message = err.data;
    });
  }

  Category.prototype.update = function(thiscategory) {
    var category = this;
    
    if (category.busy || category.updating){ 
      return;
    }
    category.busy = true;
    category.updating = true;
    
    console.log(category.category);
    //delete thisroute.target;

    DS.update('category', category.id, thiscategory)
    .then(function(updatedCategory){
      category.category = updatedCategory;
      utils.alert({location: 'system-alerts', color: 'success', title:category.category.name, content: 'Updated Successfully', autoclose: 2000});
    })
    .finally(function () {
      category.busy = false;
      category.updating = false;
    })
    .catch(function(err){
      category.error = err.status;
      category.message = err.data;
      utils.alert({location: 'system-alerts', color: 'error', title: category.category.name, content: err.status, autoclose: 2000});
    });
  }

  Category.prototype.add = function () {

  }

  Category.prototype.remove = function () {
    
  }


  return Category;
})
;


angular.module('humpback.core.routes', [])
.factory('Routes', function(DS, utils, $location, Categories) {
  
  var Routes = function() {
    this.visible    = [];
    this.routes     = [];
    this.categories = new Categories().init();
    this.busy       = false;
    this.skip       = 0;
    this.limit      = 10;
    this.total      = 0;
    this.pages      = 0;
    this.start      = 0;
    this.end        = 10;
    this.criteria   = {verb: 'get'};
    this.sort       = 'createdAt desc';
    this.error      = null;
    this.message    = null;
  };

  Routes.prototype.buildRequest = function(){
    var routes = this;

    var request = {
      limit: routes.limit,
      skip: routes.skip,
      sort: routes.sort
    }
    if(!_.isEmpty(routes.criteria)){
      request.where = routes.criteria;
    }
    return request;
  };

  Routes.prototype.search = function() {
    var routes = this, request;
    
    if (routes.busy){ 
      return;
    }
    routes.busy = true;
    request = routes.buildRequest();
    
    if(utils.development()){ console.log("SKIP:",routes.skip,"START:",routes.start,"END:",routes.end,"WHERE:",routes.criteria); };
    
    DS.findAll('route', request)
    .then(function(list){
      routes.routes = _.merge(routes.routes, list);
      routes.visible = _.rest(routes.routes, routes.start).slice(0, routes.end);
      routes.skip = routes.skip + routes.limit;

    })
    .finally(function (request) {
      console.log(request);

      routes.busy = false;
    })
    .catch(function(err){
      routes.error = err.status;
      routes.message = err.data;
    });
  }

  Routes.prototype.init = function() {
    var routes = this;
    if (routes.busy){ 
      return;
    }

    routes.start = routes.skip;
    routes.end = routes.skip + routes.limit;
    
    routes.search();
  }

  Routes.prototype.infinite = function() {
    var routes = this;
    if (routes.busy){ 
      return;
    }

    routes.start = 0;
    routes.end = routes.skip + routes.limit;
    
    routes.search();

  }

  Routes.prototype.prevPage = function() {
    var routes = this;
    if (routes.busy){ 
      return;
    }
 
    routes.skip = routes.skip - routes.limit * 2 >= 0 ? routes.skip - routes.limit * 2 : 0;
    routes.start = routes.skip;
    routes.end = routes.skip + routes.limit;

    routes.search();

  }

  Routes.prototype.nextPage = function() {
    var routes = this;
    
    if (routes.busy){ 
      return;
    }

    routes.start = routes.skip;
    routes.end = routes.skip + routes.limit;
    
    routes.search();

  }

  Routes.prototype.reset = function(type) {
    var routes = this;
    if(type){
       $location.search(type, routes[type]);
    }

    this.skip = 0;
    this.init(); 
  }
  
  return Routes;


})

.factory('Route', function(DS, utils, CMS, Categories) {

  var Route = function(id) {
    this.id = id;
    this.route = {};
    this.categories = new Categories();
    this.criteria = {};
    this.busy = false;
    this.updating = false;
    this.error = null;
    this.message = null;
    this.cms = new CMS();
    
  };
  
  Route.prototype.create = function(thisroute) {
    var route = this;
    
    if (route.busy){ 
      return;
    }
    route.busy = true;
    DS.create('route', thisroute)
    .then(function(thisroute){
      
      console.log(thisroute);

      route.route = thisroute;
    })
    .finally(function () {
      route.busy = false;
    })
    .catch(function (err) {
      route.error = err.status;
      route.message = err.data;
    });


  }

  Route.prototype.read = function() {
    var route = this;
    if (route.busy){ 
      return;
    }
    route.busy = true;

    DS.find('route', route.id)
    .then(function(thisroute){
      
      console.log(thisroute);
      route.route = thisroute;
      route.categories.init();
    })
    .finally(function () {
      route.busy = false;
    })
    .catch(function (err) {
      route.error = err.status;
      route.message = err.data;
    });
  }

  Route.prototype.get = function(id) {
    var route = this;
    route.busy = true;

    DS.find('route', id)
    .then(function(thisroute){
      route.route = thisroute;

       route.cms.setTitle(thisroute.title);
       route.cms.setDescription(thisroute.description);
       route.cms.setImage(thisroute.image);
       route.cms.setKeywords(thisroute.keywords);

    })
    .finally(function () {
      route.busy = false;
    })
    .catch(function (err) {
      route.error = err.status;
      route.message = err.data;
    });
  }
  

  Route.prototype.update = function(thisroute) {
    var route = this;
    
    if (route.busy || route.updating){ 
      return;
    }
    route.busy = true;
    route.updating = true;
    
    console.log(route.route);
    delete thisroute.target;

    DS.update('route', route.id, thisroute)
    .then(function(updatedRoute){
      route.route = updatedRoute;
      utils.alert({location: 'system-alerts', color: 'success', title:route.route.title, content: 'Updated Successfully', autoclose: 2000});
    })
    .finally(function () {
      route.busy = false;
      route.updating = false;
    })
    .catch(function(err){
      route.error = err.status;
      route.message = err.data;
      utils.alert({location: 'system-alerts', color: 'error', title:route.route.title, content: err.status, autoclose: 2000});
    });
  }

  return Route;

})
;

angular.module('humpback.core.models', [])
.factory('Models', function(DS, utils) {
  
  var Models = function() {
    this.visible = [];
    this.models = [];
    this.busy = false;
    this.skip = 0;
    this.limit = 10;
    this.total = 0;
    this.start = 0;
    this.end = 10;
    this.criteria = '';
    this.sort = 'createdAt desc';
    this.error = null;
    this.message = null;

  };

  Models.prototype.prevPage = function() {
    var models = this;
    
    if (models.busy){ 
      return;
    }
    models.busy = true;

    models.skip = models.skip - models.limit * 2 >= 0 ? models.skip - models.limit * 2 : 0;
    models.start = models.skip;
    models.end = models.skip + models.limit;

    if(utils.development()){ console.log("SKIP:",models.skip,"START:",models.start,"END:",models.end); };

    DS.findAll('model', {limit: models.limit, skip: models.skip, sort: models.sort})
    .then(function(list){

      models.models = _.merge(models.models, list);
      models.visible = list;
      models.skip = models.skip + models.limit;
       
    })
    .finally(function () {
      models.busy = false;
    })
    .catch(function(err){
      models.error = err.status;
      models.message = err.data;
    });

  }

  Models.prototype.nextPage = function() {
    var models = this;
    
    if (models.busy){ 
      return;
    }
    models.busy = true;

    models.start = models.skip;
    models.end = models.skip + models.limit;

    if(utils.development()){ console.log("SKIP:",models.skip,"START:",models.start,"END:",models.end); };

    DS.findAll('model', {limit: models.limit, skip: models.skip, sort: models.sort})
    .then(function(list){

      models.models = _.merge(models.models, list);
      models.visible = list;
      models.skip = models.skip + models.limit;
        
    })
    .finally(function () {
      models.busy = false;
    })
    .catch(function(err){
      models.error = err.status;
      models.message = err.data;
    });

  }
  
  return Models;


 });

angular.module('humpback.core.settings', [])
.factory('Settings', function(DS, utils) {
  
  var Settings = function() {
    this.visible = [];
    this.settings = [];
    this.busy = false;
    this.skip = 0;
    this.limit = 10;
    this.total = 0;
    this.start = 0;
    this.end = 10;
    this.criteria = '';
    this.sort = 'createdAt desc';
    this.error = null;
    this.message = null;

  };

  Settings.prototype.prevPage = function() {
    var settings = this;
    
    if (settings.busy){ 
      return;
    }
    settings.busy = true;

    settings.skip = settings.skip - settings.limit * 2 >= 0 ? settings.skip - settings.limit * 2 : 0;
    settings.start = settings.skip;
    settings.end = settings.skip + settings.limit;

    if(utils.development()){ console.log("SKIP:",settings.skip,"START:",settings.start,"END:",settings.end); };

    DS.findAll('setting', {limit: settings.limit, skip: settings.skip, sort: settings.sort})
    .then(function(list){

      settings.settings = _.merge(settings.settings, list);
      settings.visible = list;
      settings.skip = settings.skip + settings.limit;
       
    })
    .finally(function () {
      settings.busy = false;
    })
    .catch(function(err){
      settings.error = err.status;
      settings.message = err.data;
    });

  }

  Settings.prototype.nextPage = function() {
    var settings = this;
    
    if (settings.busy){ 
      return;
    }
    settings.busy = true;

    settings.start = settings.skip;
    settings.end = settings.skip + settings.limit;

    if(utils.development()){console.log("SKIP:",settings.skip,"START:",settings.start,"END:",settings.end); };

    DS.findAll('setting', {limit: settings.limit, skip: settings.skip, sort: settings.sort})
    .then(function(list){

      settings.settings = _.merge(settings.settings, list);
      settings.visible = list;
      settings.skip = settings.skip + settings.limit;
        
    })
    .finally(function () {
      settings.busy = false;
    })
    .catch(function(err){
      settings.error = err.status;
      settings.message = err.data;
    });

  }
  
  return Settings;


 })
;

})( window, angular );