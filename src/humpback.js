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
  'humpback.core.input',
  'humpback.core.paging',
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
})

/**
 * @ngDoc directive
 * @name ng.directive:ng-cms
 *
 * @description
 * A directive that caches content from routes into
 * $templateCache and then compiles it to use the parent
 * scope
 *
 * @element A
 *
 */
.directive("ngCms", function ($compile, $templateCache) {
    return {  
      restrict: 'A',
      replace: true,
      terminal: true,
      priority: 1000,
      scope: {
          cms: '=ngCms',
      },
        
      link: function (scope, elem, attrs, ctrl) {
          //console.log(scope.cms);

        scope.$watch("cms", function(newVal){
          if(typeof scope.cms.id !== 'undefined'){
            
            var templateUrl = scope.cms.id+'.html';

            $templateCache.put(templateUrl, scope.cms.content);
            
            if ($templateCache.get(templateUrl)) {
              // template is on the page
              //console.log(templateUrl + ' success!', scope.cms.content);
                
              var element = angular.element(elem);
              var html = '<div ng-include src="\''+templateUrl+'\'"></div>';  
              element.empty().append($compile(html)(scope.$parent));

            }
          }
        });
      }
    };
});


/**
 * @ngDoc directive
 * @name ng.directive:paging
 *
 * @description
 * A directive to aid in paging large datasets
 * while requiring a small amount of page
 * information.
 *
 * @element EA
 *
 */
angular.module('humpback.core.paging', [])
.directive('paging', function () {

    /**
    * The angular return value required for the directive
    * Feel free to tweak / fork values for your application
    */ 
    return {

        // Restrict to elements and attributes
        restrict: 'EA',
        
        // Assign the angular link function
        link: fieldLink,
        
        // Assign the angular scope attribute formatting
        scope: {
            page: '=',
            pageSize: '=',
            total: '=',
            dots: '@',
            hideIfEmpty: '@',
            ulClass: '@',
            activeClass: '@',
            disabledClass: '@',
            adjacent: '@',
            scrollTop: '@',
            showPrevNext: '@',
            pagingAction: '&'
        },

        // Assign the angular directive template HTML
        template: 
            '<ul ng-hide="Hide" ng-class="ulClass"> ' +
                '<li ' +
                    'ng-repeat="Item in List"> ' +
                        '<a ' + 
                          'ng-class="Item.liClass" '+
                          'title="{{Item.title}}" '+
                          'ng-click="Item.action()">'+
                            '<span ng-bind="Item.value"></span>'+
                        '</a>' +
                '</li>' +
            '</ul>'
    };
    
    
    /**
    * Link the directive to enable our scope watch values
    * 
    * @param {object} scope - Angular link scope
    * @param {object} el - Angular link element
    * @param {object} attrs - Angular link attribute 
    */
    function fieldLink (scope, el, attrs) {
            
        // Hook in our watched items 
        scope.$watchCollection('[page,pageSize,total]', function () {
            build(scope, attrs);
        });
    }
    
    
    /**
    * Assign default scope values from settings
    * Feel free to tweak / fork these for your application
    *
    * @param {Object} scope - The local directive scope object
    * @param {Object} attrs - The local directive attribute object
    */ 
    function setScopeValues(scope, attrs) {

        scope.List = [];
        scope.Hide = false;
        scope.dots = scope.dots || '...';
        scope.page = parseInt(scope.page) || 1;
        scope.total = parseInt(scope.total) || 0;
        scope.ulClass = scope.ulClass || 'pagination';
        scope.adjacent = parseInt(scope.adjacent) || 2;
        scope.activeClass = scope.activeClass || 'active';
        scope.disabledClass = scope.disabledClass || 'disabled';

        scope.scrollTop = scope.$eval(attrs.scrollTop);
        scope.hideIfEmpty = scope.$eval(attrs.hideIfEmpty);
        scope.showPrevNext = scope.$eval(attrs.showPrevNext);
    }


    /**
    * Validate and clean up any scope values
    * This happens after we have set the scope values
    *
    * @param {Object} scope - The local directive scope object
    * @param {int} pageCount - The last page number or total page count 
    */
    function validateScopeValues(scope, pageCount) {

        // Block where the page is larger than the pageCount
        if (scope.page > pageCount) {
            scope.page = pageCount;
        }

        // Block where the page is less than 0
        if (scope.page <= 0) {
            scope.page = 1;
        }

        // Block where adjacent value is 0 or below
        if (scope.adjacent <= 0) {
            scope.adjacent = 2;
        }

        // Hide from page if we have 1 or less pages
        // if directed to hide empty
        if (pageCount <= 1) {
            scope.Hide = scope.hideIfEmpty;
        }
    }


    /**
    * Assign the method action to take when a page is clicked
    *
    * @param {Object} scope - The local directive scope object
    * @param {int} page - The current page of interest
    */
    function internalAction(scope, page) {

        // Block clicks we try to load the active page
        if (scope.page == page) { return; }

        // Update the page in scope 
        scope.page = page;

        // Pass our parameters to the paging action
        scope.pagingAction({
            page: scope.page,
            pageSize: scope.pageSize,
            total: scope.total
        });

        // If allowed scroll up to the top of the page
        if (scope.scrollTop) {
            scrollTo(0, 0);
        }
    }


    /**
    * Add the first, previous, next, and last buttons if desired   
    * The logic is defined by the mode of interest
    * This method will simply return if the scope.showPrevNext is false
    * This method will simply return if there are no pages to display
    *
    * @param {Object} scope - The local directive scope object
    * @param {int} pageCount - The last page number or total page count
    * @param {string} mode - The mode of interest either prev or last 
    */
    function addPrevNext(scope, pageCount, mode){
        
        // Ignore if we are not showing
        // or there are no pages to display
        if (!scope.showPrevNext || pageCount < 1) { return; }

        // Local variables to help determine logic
        var disabled, alpha, beta;


        // Determine logic based on the mode of interest
        // Calculate the previous / next page and if the click actions are allowed
        if(mode === 'prev') {
            
            disabled = scope.page - 1 <= 0;
            var prevPage = scope.page - 1 <= 0 ? 1 : scope.page - 1;
            
            alpha = { value : "<<", title: 'First Page', page: 1 };
            beta = { value: "<", title: 'Previous Page', page: prevPage };
             
        } else {
            
            disabled = scope.page + 1 > pageCount;
            var nextPage = scope.page + 1 >= pageCount ? pageCount : scope.page + 1;
            
            alpha = { value : ">", title: 'Next Page', page: nextPage };
            beta = { value: ">>", title: 'Last Page', page: pageCount };
        }

        // Create the Add Item Function
        var addItem = function(item, disabled){           
            scope.List.push({
                value: item.value,
                title: item.title,
                liClass: disabled ? scope.disabledClass : '',
                action: function(){
                    if(!disabled) {
                        internalAction(scope, item.page);
                    }
                }
            });
        };

        // Add our items
        addItem(alpha, disabled);
        addItem(beta, disabled);
    }


    /**
    * Adds a range of numbers to our list 
    * The range is dependent on the start and finish parameters
    *
    * @param {int} start - The start of the range to add to the paging list
    * @param {int} finish - The end of the range to add to the paging list 
    * @param {Object} scope - The local directive scope object
    */
    function addRange(start, finish, scope) {

        var i = 0;
        for (i = start; i <= finish; i++) {

            var item = {
                value: i,
                title: 'Page ' + i,
                liClass: scope.page == i ? scope.activeClass : '',
                action: function () {
                    internalAction(scope, this.value);
                }
            };

            scope.List.push(item);
        }
    }


    /**
    * Add Dots ie: 1 2 [...] 10 11 12 [...] 56 57
    * This is my favorite function not going to lie
    *
    * @param {Object} scope - The local directive scope object
    */
    function addDots(scope) {
        scope.List.push({
            value: scope.dots
        });
    }


    /**
    * Add the first or beginning items in our paging list  
    * We leverage the 'next' parameter to determine if the dots are required
    *
    * @param {Object} scope - The local directive scope object
    * @param {int} next - the next page number in the paging sequence
    */
    function addFirst(scope, next) {
        
        addRange(1, 2, scope);

        // We ignore dots if the next value is 3
        // ie: 1 2 [...] 3 4 5 becomes just 1 2 3 4 5 
        if(next != 3){
            addDots(scope);
        }
    }


    /**
    * Add the last or end items in our paging list  
    * We leverage the 'prev' parameter to determine if the dots are required
    *
    * @param {int} pageCount - The last page number or total page count 
    * @param {Object} scope - The local directive scope object
    * @param {int} prev - the previous page number in the paging sequence
    */
    // Add Last Pages
    function addLast(pageCount, scope, prev) {

        // We ignore dots if the previous value is one less that our start range
        // ie: 1 2 3 4 [...] 5 6  becomes just 1 2 3 4 5 6 
        if(prev != pageCount - 2){
            addDots(scope);
        }

        addRange(pageCount - 1, pageCount, scope);
    }



    /**
    * The main build function used to determine the paging logic
    * Feel free to tweak / fork values for your application
    *
    * @param {Object} scope - The local directive scope object
    * @param {Object} attrs - The local directive attribute object
    */ 
    function build(scope, attrs) {

        // Block divide by 0 and empty page size
        if (!scope.pageSize || scope.pageSize <= 0) { scope.pageSize = 1; }

        // Determine the last page or total page count
        var pageCount = Math.ceil(scope.total / scope.pageSize);

        // Set the default scope values where needed
        setScopeValues(scope, attrs);

        // Validate the scope values to protect against strange states
        validateScopeValues(scope, pageCount);

        // Create the beginning and end page values 
        var start, finish;

        // Calculate the full adjacency value 
        var fullAdjacentSize = (scope.adjacent * 2) + 2;


        // Add the Next and Previous buttons to our list
        addPrevNext(scope, pageCount, 'prev');

        // If the page count is less than the full adjacnet size
        // Then we simply display all the pages, Otherwise we calculate the proper paging display
        if (pageCount <= (fullAdjacentSize + 2)) {

            start = 1;
            addRange(start, pageCount, scope);

        } else {

            // Determine if we are showing the beginning of the paging list 
            // We know it is the beginning if the page - adjacent is <= 2
            if (scope.page - scope.adjacent <= 2) {

                start = 1;
                finish = 1 + fullAdjacentSize;

                addRange(start, finish, scope);
                addLast(pageCount, scope, finish);
            } 

            // Determine if we are showing the middle of the paging list
            // We know we are either in the middle or at the end since the beginning is ruled out above
            // So we simply check if we are not at the end 
            // Again 2 is hard coded as we always display two pages after the dots
            else if (scope.page < pageCount - (scope.adjacent + 2)) {

                start = scope.page - scope.adjacent;
                finish = scope.page + scope.adjacent;

                addFirst(scope, start);
                addRange(start, finish, scope);
                addLast(pageCount, scope, finish);
            } 

            // If nothing else we conclude we are at the end of the paging list
            // We know this since we have already ruled out the beginning and middle above
            else {

                start = pageCount - fullAdjacentSize;
                finish = pageCount;

                addFirst(scope, start);
                addRange(start, finish, scope);
            }
        }

        // Add the next and last buttons to our paging list
        addPrevNext(scope, pageCount, 'next');
    }

});

/**
 * @ngDoc directive
 * @name ng.directive:ngApiInput
 *
 * @description
 * A directive to aid deciphering model attributes for the correct input
 *
 * @element EA
 *
 */
angular.module('humpback.core.input', [])
.directive('ngApiInput', ['$compile', function ($compile) {
    var getTemplate = function(model, type, collection) {
      
      var required = '', 
          disabled='',
          unique='';

      if(collection.required){
        required = ' required';
      }
      if(collection.unique){
        unique = 'unique';
      }
      if(type === 'string' && collection.enum){
        type = type + '-enum';
      }

      switch (type) {
        
        case 'string': 
          return    '<label for="{{apiLabel}}">{{ apiLabel }}</label>'
                  + '<input id="{{apiLabel}}" type="text" ng-model="apiInput"'+required+'>';

        case 'text': 
          return    '<label for="{{apiLabel}}">{{ apiLabel }}</label>'
                  + '<input id="{{apiLabel}}" type="text" ng-model="apiInput"'+required+'>';    

        case 'string-enum': 
          return    '<label for="{{apiLabel}}">{{ apiLabel }}</label>'
                  + '<input id="{{apiLabel}}" type="text" ng-model="apiInput"'+required+'>';

        case 'integer': 
          return    '<label for="{{apiLabel}}">{{ apiLabel }}</label>'
                  + '<input id="{{apiLabel}}" type="number" ng-model="apiInput"'+required+'>';

        case 'float': 
          return    '<label for="{{apiLabel}}">{{ apiLabel }}</label>'
                  + '<input id="{{apiLabel}}" type="float" ng-model="apiInput"'+required+'>';
        
        case 'email': 
          return    '<label for="{{apiLabel}}">{{ apiLabel }}</label>'
                  + '<input id="{{apiLabel}}" type="email" ng-model="apiInput"'+required+'>';

        case 'boolean': 
          return    '<label for="{{apiLabel}}">{{ apiLabel }}</label>'
                  + '<select id="{{apiLabel}}" ng-model="apiInput">'
                  +   '<option value="true">True</option>'
                  +   '<option value="false">False</option>'
                  + '</select>';

        case 'date': 
          return    '<label for="{{apiLabel}}">{{ apiLabel }}</label>';

        case 'datetime': 
          return    '<label for="{{apiLabel}}">{{ apiLabel }}</label>';

        case 'binary': 
          return    '<label for="{{apiLabel}}">{{ apiLabel }}</label>';

        case 'array': 
          return    '<label for="{{apiLabel}}">{{ apiLabel }}</label>';

        case 'json': 
          return    '<label for="{{apiLabel}}">{{ apiLabel }}</label>';

        case 'model': 
          return    '<label>{{ apiLabel }}</label>'
                  + '<div ng-api-populate="ngApiInput.model" populate-id="apiInput">{{ ngApiInput.model }} Model {{ apiInput }}</div>';

        case 'collection': 
          return    '<label>{{ apiLabel }}</label>'
                  + '<div ng-api-collection="{{ ngApiInput.collection }}">{{ ngApiInput.collection }} Collection via {{ ngApiInput.via }}</div>';

        default:  
          return    '<label>{{ apiLabel }}</label>'
                  + '<input type="text" ng-model="apiInput"'+required+'>';
      }
    }

    return {
      restrict: 'AE',
      transclude: true,
      scope: {
          ngApiInput: '=',
          apiModel: '=',
          apiLabel: '=',
          apiInput: '='
      },

      link: function(scope, element, attrs) {
           
        var type = 'string', 
            collection = {},
            model = {};

        if(scope.ngApiInput.collection){
          type = 'collection';
          collection = scope.ngApiInput;
        }
        else if(scope.ngApiInput.model){
          type = 'model';
          collection = scope.ngApiInput;
        }
        else{
          type = scope.ngApiInput.type;
          collection = scope.ngApiInput;
        }
        model = scope.apiModel;

        var el = $compile(getTemplate(model, type, collection))(scope);
        element.replaceWith(el);

      }
    };
}])
/*
.directive('ngApiPopulate', ['$compile','Api', function ($compile, Api) {
  return {
    restrict: 'AE',
    transclude: true,
    scope: {
        ngApiPopulate: '=',
        populateId: '='
    },
    link: function(scope, element, attrs) {
      
      console.log(scope.ngApiPopulate, scope.populateId);
      
      scope.model = new Api(scope.ngApiPopulate);
      
      scope.model.read(scope.populateId)
      .then(function(thismodel){
        console.log(thismodel);

        var el = $compile(thismodel)(scope);
        element.replaceWith(el);
      });

    }
  };
}])
*/
;

angular.module('humpback.core.api', [])
.factory('Api', function(DS, utils, $location, $q) {

  /*
   * Api
   * @param {String} resource
   * @param {Object} init
   * @param {Function} cb
   */
  var Api = function(resource, init, cb) {
    
    init = typeof init !== 'undefined' ? init : {}; 
    //Holds the models displayed
    this.visible = [];
    
    //Holds all models
    this.api = [];

    //is selected model new?
    this.isNew = false;

    //Show a site-alert when model is created, updated, or deleted?
    this.showAlert = true;

    //A single Selected model
    this.selected = {};
    
    //Type of model
    this.resource = resource;

    //Store the model;
    this.model = {};

    //Callback
    this.cb = cb || angular.noop;

    this.deferred = typeof cb !== 'function' ? $q.defer() : null; 

    //If api busy
    this.busy = false;
    
    //If api updating
    this.updating = false;

    //If api updating
    this.deleting = false;
    
    //Amount of models to skip
    this.skip = 0;

    //Amount of models to return 
    this.limit = 10;

    //Total amount of models in collection (Auto Resolves)
    this.total = 0;

    //Total amount of pages collection / limit (Auto Resolves)
    this.page = 1;

    //Index of this.api to start adding models to this.visible (Auto Resolves)
    this.start = 0;
    
    //Index of this.api to stop adding models to this.visible (Auto Resolves)
    this.end = 10;

    //If this is triggered by infinite scrolling
    this.infinite = false;
    
    //Criteria to search for 
    this.criteria = {};

    //Model Api options
    this.options = {};

    //Filter for Search
    this.filter = ['',''];

    //Sort this.visible
    this.sort = 'createdAt ASC';
    
    //Angular sort this.visible (Auto Resolves)
    this.angularSort = '-createdAt';

    //Api error codes
    this.error = null;

    //Api error message
    this.message = null;

    for(var i in init){
      this[i] = init[i];
    }

    if(init.page){
      this.skip = this.limit * init.page - this.limit;
      this.start = this.skip;
      this.end = this.start + this.limit;
    }

  };

  /*
   * Convert Sorting for Angular vs Sails/Js-data
   */
  Api.prototype._handleSort = function(){
      var api = this, part1 = null, part2 = null;
      var sortPieces = this.sort.split(' ');

      part1 = sortPieces[0];
      if(sortPieces[1] === 'DESC'){
        part2 = '';
      }else if (sortPieces[1] === 'ASC'){
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
    .then(function (list) { 

      //console.log(DS.model(api.resource));
      //console.log(DS.definitions[api.resource].meta.contentCount);

      api.api = _.union(api.api, list);
      if(api.options.useFilter || !api.infinite){
        api.visible = list;
      }else{
        api.visible = _.slice(api.api, api.start, api.end);  
      }
      
      api.skip = api.skip + api.limit;
      api.page =  Math.ceil(api.start / api.limit) + 1;
    
      if(DS.definitions[api.resource]){
        api.total = DS.definitions[api.resource].meta.contentCount;
      }

      api.error = null;
      api.message = null;

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
      api.message = utils.handleError(err);
      
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
    api.page =  Math.ceil(api.start / api.limit) + 1;
    
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

    api.infinite = true;
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
    api.page = api.page - 1 > 0 ? api.page - 1 : 1;

    $location.search('page', api.page);

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
    api.page = api.page + 1;

    $location.search('page', api.page);
    
    return api.search(cb);

  }

  /*
   * Paging 
   * @param {String} text
   * @param {Integer} page
   * @param {Integer} pageSize
   * @param {Integer} total
   * @param {Function} cb (optional)
   */
  Api.prototype.paging = function(text, page, pageSize, total, cb){
    
    var api = this;
    if (api.busy){ 
      return;
    }
    //Callback
    api.cb = cb || angular.noop;
    //Defered
    api.deferred = typeof cb !== 'function' ? $q.defer() : null; 

    //if(page > api.page){
    api.skip = page * api.limit - api.limit;
    api.start = api.skip;
    api.end = api.start + api.limit;
    
    $location.search('page', page);

    return api.search(api.cb);
  };

  /**
   * Reset the search
   * @param String type [enum: sort, criteria, limit]
   * @param Function cb (optional)
   */
  Api.prototype.reset = function(type, cb) {
    var api = this;
    if(type){
      //api[type] = typeof api[type] === 'object' ? JSON.stringify(api[type]) : api[type];
      $location.search(type, api[type]);
    }
    //Callback
    api.cb = cb || angular.noop;
    //Defered
    api.deferred = typeof cb !== 'function' ? $q.defer() : null; 
    api.skip = 0;
    api.init(cb); 
  }

  /**
   * Apply the filter from api.filter
   */
  Api.prototype.addFilter = function(){
    var api = this;
    
    api.options = _.merge({}, api.options, {bypassCache: true, useFilter: true});

    if(api.filter[0] !== '' && api.filter[1] !== ''){
      api.criteria = api.criteria ? api.criteria : {};
      api.criteria[api.filter[0]] = { 
        'contains' : api.filter[1] 
      };
    }

    return api.reset();
  }

  /**
   * Remove a filter
   * @param {String} filter 
   */
  Api.prototype.removeFilter = function(filter){
    var api = this;
    api.options = _.merge({}, api.options, {bypassCache: true, useFilter: true});
    
    delete api.criteria[filter];

    return api.reset();
  }

  /**
   * Clear all filters in api.criteria
   */
  Api.prototype.clearFilters = function(){
    
    var api = this;
    api.options = _.merge({}, api.options, {bypassCache: true, useFilter: true});
    
    api.filter = ['','']; 
    api.criteria = {};

    return api.reset();
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
      //Set selected Model
      api.selected = thisApi;

      //If is a promise
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
      api.message = utils.handleError(err);

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

    DS.create(api.resource, thisApi, api.options)
    .then(function(thisApi){
      //Set the selected model
      api.selected = thisApi;
      
      //Show site-alert
      if(api.showAlert){
        utils.alert({location: 'system-alerts', color: 'success', title: api.resource, content: 'Created Successfully', autoclose: 2000});
      }

      //Reset error and message to null
      api.error = null;
      api.message = null;

      //if is a promise
      if(api.deferred){
        api.deferred.resolve(api.selected);
      }
      //if is a callback
      return api.cb(null, api.selected);

    })
    .finally(function () {
      //reset loading states
      api.busy = false;
      api.updating = false;
    })
    .catch(function(err){
      //set error
      api.error = err.status;
      api.message = utils.handleError(err);
      
      //show site-alert
      if(api.showAlert){
        utils.alert({location: 'system-alerts', color: 'error', title: api.resource, content: 'Error Creating', autoclose: 2000});
      }
      //If is a promise
      if(api.deferred){
        api.deferred.reject(err);
      }
      //if is a callback
      return api.cb(err);
    });

    //if is a promise
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
    if (api.busy || api.updating || api.deleting){ 
      return;
    }
    api.busy = true;
    api.updating = true;

    //Callback
    api.cb = cb || angular.noop;
    //Defered
    api.deferred = typeof cb !== 'function' ? $q.defer() : null; 

    DS.update(api.resource, thisApi.id, thisApi, api.options)
    .then(function(thisApi){

      //Set the selected model
      api.selected = thisApi;
      
      //show site-alert
      if(api.showAlert){
        utils.alert({location: 'system-alerts', color: 'success', title: api.resource, content: 'Updated Successfully', autoclose: 2000});
      }

      //reset error and message to null
      api.error = null;
      api.message = null;

      //If is a promise
      if(api.deferred){
        api.deferred.resolve(thisApi);
      }
      //If is a callback
      return api.cb(null, api.selected);

    })
    .finally(function () {
      //Reset the loading state
      api.busy = false;
      api.updating = false;
    })
    .catch(function(err){
      //Set error
      api.error = err.status;
      api.message = utils.handleError(err);
      
      //Show site-alert
      if(api.showAlert){
        utils.alert({location: 'system-alerts', color: 'error', title: api.resource, content: 'Error Updating', autoclose: 2000});
      }
      //If is a promise
      if(api.deferred){
        api.deferred.reject(err);
      }
      //If is a callback
      return api.cb(err);
    });

    //If is a promise
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
    if (api.busy || api.updating || api.deleting){ 
      return;
    }
    //Set loading states
    api.busy = true;
    api.deleting = true;

    //Callback
    api.cb = cb || angular.noop;
    //Defered
    api.deferred = typeof cb !== 'function' ? $q.defer() : null; 

    DS.destroy(api.resource, thisApi.id, api.options)
    .then(function(thisApi){
      //Unset selected model
      api.selected = {};
      
      //Show site-alert
      if(api.showAlert){
        utils.alert({location: 'system-alerts', color: 'success', title: api.resource, content: 'Deleted Successfully', autoclose: 2000});
      }
      //Reset error and message to null
      api.error = null;
      api.message = null;

      //If is a promise
      if(api.deferred){
        api.deferred.resolve(api.selected);
      }
      //If is a callback
      return api.cb(null, api.selected);
    })
    .finally(function () {
      //Reset loading states
      api.busy = false;
      api.deleting = false;
    })
    .catch(function(err){
      //Set error
      api.error = err.status;
      api.message = utils.handleError(err);
      
      //Show site-alert
      if(api.showAlert){
        utils.alert({location: 'system-alerts', color: 'error', title: api.resource, content: 'Error Deleting', autoclose: 2000});
      }
      //If is a promise
      if(api.deferred){
        api.deferred.reject(err);
      }
      //If is a callback
      return api.cb(err);
    });

    //If is a promise
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