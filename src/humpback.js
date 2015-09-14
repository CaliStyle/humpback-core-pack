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
  'humpback.core.api'
  
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

  CMS.prototype.setPage = function(thisroute) {
    var cms = this;
    cms.setTitle(thisroute.title);
    cms.setDescription(thisroute.description);
    cms.setImage(thisroute.image);
    cms.setKeywords(thisroute.keywords);
  }

  return CMS;
});

angular.module('humpback.core.api', [])
.factory('Api', function(DS, utils, $location, $q) {

  /*
   * Api
   * @param String resource
   * @param Function cb
   */
  var Api = function(resource, cb) {
    //Holds the models displayed
    this.visible = [];
    
    //Holds all models
    this.api = [];

    //A single Selected model
    this.selected = {};
    
    //Type of model
    this.resource = resource;

    //Callback
    this.cb = cb || angular.noop;

    this.deferred = typeof cb !== 'function' ? $q.defer() : null; 

    //If api busy
    this.busy = false;
    
    //If api updating
    this.updating = false;
    
    //Amount of models to skip
    this.skip = 0;

    //Amount of models to return 
    this.limit = 10;

    //Total amount of models in collection
    this.total = 0;

    //Total amount of pages collection / limit
    this.pages = 0;

    //Index of this.api to start adding models to this.visible 
    this.start = 0;
    
    //Index of this.api to stop adding models to this.visible
    this.end = 10;
    
    //Criteria to search for 
    this.criteria = {};

    //Model Api options
    this.options = {};

    //Sort this.visible
    this.sort = 'createdAt DESC';
    
    //Angular sort this.visible
    this.angularSort = 'createdAt';

    //Api error codes
    this.error = null;

    //Api error message
    this.message = null;
  };

  /*
   * Convert Sorting for Angular vs Sails/Js-data
   */
  Api.prototype._handleSort = function(){
      var api = this, part1 = null, part2 = null;
      var sortPieces = this.sort.split(" ");

      part1 = sortPieces[0];
      if(sortPieces[1] === 'DESC'){
        part2 = '';
      }else{
        part2 = '-';
      }
      return api.angularSort = part2+part1;
  };

  /*
   * Build Request
   */
  Api.prototype._buildRequest = function(){
    var api = this;

    var request = {
      limit: api.limit,
      skip: api.skip,
      sort: api.sort
    }
    if(!_.isEmpty(api.criteria)){
      request.where = api.criteria;
    }
    
    api._handleSort();

    return request;
  };

  /*
   * Search 
   */
  Api.prototype.search = function(cb) {
    var api = this, request;
    
    if (api.busy){ 
      return;
    }
    api.busy = true;
    request = api._buildRequest();
    
    if(utils.development()){ console.log("SKIP:",api.skip,"START:",api.start,"END:",api.end,"WHERE:",api.criteria,"OPTIONS:",api.options); };
    
    DS.findAll(api.resource, request, api.options)
    .then(function(list){

      api.api = _.union(api.api, list);
      api.visible = _.slice(api.api, api.start, api.end);
      api.skip = api.skip + api.limit;

      if(api.deferred){
        api.deferred.resolve(api.visible);
      }
      return api.cb(null, api.visible);

    })
    .finally(function(){
      api.busy = false;
    })
    .catch(function(err){
      api.error = err.status;
      api.message = err.data;
      
      if(api.deferred){
        api.deferred.reject(err);
      }
      return api.cb(err);

    });

    if(api.deferred){
      return api.deferred.promise;
    }
  }

  /*
   * Initiate Page
   * @param Function cb (optional)
   */
  Api.prototype.init = function(cb) {
    var api = this;
    if (api.busy){ 
      return;
    }

    //Callback
    api.cb = cb || angular.noop;
    //Defered
    api.deferred = typeof cb !== 'function' ? $q.defer() : null; 

    api.start = api.skip;
    api.end = api.skip + api.limit;
    
    return api.search(cb);
  }

  /*
   * Infinite Next Page
   * @param Function cb (optional)
   */
  Api.prototype.infinite = function(cb) {
    var api = this;
    if (api.busy){ 
      return;
    }

    //Callback
    api.cb = cb || angular.noop;
    //Defered
    api.deferred = typeof cb !== 'function' ? $q.defer() : null; 

    api.start = 0;
    api.end = api.skip + api.limit;
    
    return api.search(cb);

  }

  /*
   * Previous Page
   * @param Function cb (optional)
   */
  Api.prototype.prevPage = function(cb) {
    var api = this;
    if (api.busy){ 
      return;
    }
    //Callback
    api.cb = cb || angular.noop;
    //Defered
    api.deferred = typeof cb !== 'function' ? $q.defer() : null; 

    api.skip = api.skip - api.limit * 2 >= 0 ? api.skip - api.limit * 2 : 0;
    api.start = api.skip;
    api.end = api.skip + api.limit;

    return api.search(cb);

  }
  
  /*
   * Next Page
   * @param Function cb (optional)
   */
  Api.prototype.nextPage = function(cb) {
    var api = this;
    if (api.busy){ 
      return;
    }
    //Callback
    api.cb = cb || angular.noop;
    //Defered
    api.deferred = typeof cb !== 'function' ? $q.defer() : null; 

    api.start = api.skip;
    api.end = api.skip + api.limit;
    
    return api.search(cb);

  }

  /**
   * Reset the search
   * @param String type [enum: sort, criteria, limit]
   * @param Function cb (optional)
   */
  Api.prototype.reset = function(type, cb) {
    var api = this;
    if(type){
       $location.search(type, api[type]);
    }
    //Callback
    api.cb = cb || angular.noop;
    //Defered
    api.deferred = typeof cb !== 'function' ? $q.defer() : null; 

    this.skip = 0;
    this.init(cb); 
  }

  /*
   * Read model object from the API
   * @param String id
   * @param Function cb (optional)
   */

  Api.prototype.read = function(id, cb) {
    var api = this;
    
    if (api.busy || api.updating){ 
      return;
    }
    api.busy = true;

    //Callback
    api.cb = cb || angular.noop;
    //Defered
    api.deferred = typeof cb !== 'function' ? $q.defer() : null; 

    DS.find(api.resource, id, api.options)
    .then(function(thisApi){
      
      api.selected = thisApi;

      if(api.deferred){
        api.deferred.resolve(api.selected);
      }
      return api.cb(null, api.selected);

    })
    .finally(function () {
      api.busy = false;
    })
    .catch(function(err){
      api.error = err.status;
      api.message = err.data;

      if(api.deferred){
        api.deferred.reject(err);
      }
      return api.cb(err);
    });

    if(api.deferred){
      return api.deferred.promise;
    }
  }

  /*
   * Create model object through API
   * @param {Object} thisApi
   * @param Function cb (optional)
   */

  Api.prototype.create = function(thisApi, cb) {
    var api = this;
    
    if (api.busy || api.updating){ 
      return;
    }

    api.busy = true;
    api.updating = true;

    //Callback
    api.cb = cb || angular.noop;
    //Defered
    api.deferred = typeof cb !== 'function' ? $q.defer() : null; 

    DS.create(api.resource, thisApi)
    .then(function(thisApi){
      api.selected = thisApi;
      utils.alert({location: 'system-alerts', color: 'success', title: api.resource, content: 'Created Successfully', autoclose: 2000});
    
      if(api.deferred){
        api.deferred.resolve(api.selected);
      }
      return api.cb(null, api.selected);

    })
    .finally(function () {
      api.busy = false;
      api.updating = false;
    })
    .catch(function(err){
      api.error = err.status;
      api.message = err.data;
      utils.alert({location: 'system-alerts', color: 'error', title: api.resource, content: 'Error Creating', autoclose: 2000});

      if(api.deferred){
        api.deferred.reject(err);
      }
      return api.cb(err);
    });

    if(api.deferred){
      return api.deferred.promise;
    }
  }

  /*
   * Update model object through API
   * @param {Object} thisApi
   * @param Function cb (optional)
   */

  Api.prototype.update = function(thisApi, cb) {
    var api = this;
    if (api.busy || api.updating){ 
      return;
    }
    api.busy = true;
    api.updating = true;

    //Callback
    api.cb = cb || angular.noop;
    //Defered
    api.deferred = typeof cb !== 'function' ? $q.defer() : null; 

    DS.update(api.resource, thisApi.id, thisApi)
    .then(function(thisApi){
      api.selected = thisApi;
      utils.alert({location: 'system-alerts', color: 'success', title: api.resource, content: 'Updated Successfully', autoclose: 2000});
    
      if(api.deferred){
        api.deferred.resolve(thisApi);
      }
      return api.cb(null, api.selected);

    })
    .finally(function () {
      api.busy = false;
      api.updating = false;
    })
    .catch(function(err){
      api.error = err.status;
      api.message = err.data;
      utils.alert({location: 'system-alerts', color: 'error', title: api.resource, content: 'Error Updating', autoclose: 2000});

      if(api.deferred){
        api.deferred.reject(err);
      }
      return api.cb(err);
    });

    if(api.deferred){
      return api.deferred.promise;
    }
  }

  /*
   * Delete model object through API
   * @param {Object} thisApi
   * @param Function cb (optional)
   */

  Api.prototype.delete = function(thisApi, cb) {

    var api = this;
    if (api.busy || api.updating){ 
      return;
    }
    api.busy = true;
    api.updating = true;

    //Callback
    api.cb = cb || angular.noop;
    //Defered
    api.deferred = typeof cb !== 'function' ? $q.defer() : null; 

    DS.destroy(api.resource, thisApi.id)
    .then(function(thisApi){
      api.selected = {};
      utils.alert({location: 'system-alerts', color: 'success', title: api.resource, content: 'Deleted Successfully', autoclose: 2000});
      
      if(api.deferred){
        api.deferred.resolve(api.selected);
      }
      return api.cb(null, api.selected);
    })
    .finally(function () {
      api.busy = false;
      api.updating = false;
    })
    .catch(function(err){
      api.error = err.status;
      api.message = err.data;
      utils.alert({location: 'system-alerts', color: 'error', title: api.resource, content: 'Error Deleting', autoclose: 2000});

      if(api.deferred){
        api.deferred.reject(err);
      }
      return api.cb(err);
    });

    if(api.deferred){
      return api.deferred.promise;
    }
  }

  /* TODO
   * Add model association object through API
   * @param {Object} thisAssocApi
   * @param Function cb (optional)
   */
  Api.prototype.add = function (thisAssocApi, cb) {

  }

  /* TODO
   * Remove model association object through API
   * @param {Object} thisAssocApi
   * @param Function cb (optional)
   */
  Api.prototype.remove = function (thisAssocApi, cb) {
    
  }

  return Api;

});

})( window, angular );