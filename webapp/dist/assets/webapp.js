"use strict";



define('webapp/app', ['exports', 'webapp/resolver', 'ember-load-initializers', 'webapp/config/environment'], function (exports, _resolver, _emberLoadInitializers, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var App = Ember.Application.extend({
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix,
    Resolver: _resolver.default
  });

  (0, _emberLoadInitializers.default)(App, _environment.default.modulePrefix);

  exports.default = App;
});
define('webapp/components/moving-map', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({

    classNames: ['moving-map'],

    lat: null,
    lng: null,
    last_added_point_ts: 0,
    INTERVAL: 5 * 60,

    lat_lng_change: Ember.observer('lat', 'lng', function () {
      var _getProperties = this.getProperties('lat', 'lng'),
          lat = _getProperties.lat,
          lng = _getProperties.lng;

      var pos = new google.maps.LatLng(lat, lng);
      var marker = this.get('marker');
      var map = this.get('map');

      if (marker) {
        marker.setPosition(pos);
      } else {
        var _marker = new google.maps.Marker({
          position: pos,
          map: this.get('map') });
        this.set('marker', _marker);
        map.setCenter(pos);
        map.setZoom(8);
      }

      var path = this.get('path');
      var coords = path.getPath();

      var timestamp = new Date().getTime() / 1000;
      if (coords.getLength() <= 1 || timestamp - this.get('last_added_point_ts') > this.get('INTERVAL')) {
        coords.push(pos);
        this.set('last_added_point_ts', timestamp);
      } else {
        coords.setAt(coords.getLength() - 1, pos);
      }
    }),

    didInsertElement: function didInsertElement() {
      var map = new google.maps.Map(this.element, {
        center: new google.maps.LatLng(0, 0),
        zoom: 1,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });
      var path = new google.maps.Polyline({
        path: [],
        editable: true,
        strokeColor: 'black',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: map
      });

      this.set('map', map);
      this.set('path', path);
    }
  });
});
define('webapp/components/welcome-page', ['exports', 'ember-welcome-page/components/welcome-page'], function (exports, _welcomePage) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _welcomePage.default;
    }
  });
});
define('webapp/controllers/index', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({
    send_action: function send_action(action) {

      Ember.$.ajax({
        type: 'POST',
        url: '/command',
        contentType: 'json',
        data: JSON.stringify({ command: action })
      });
    },


    actions: {
      airbrakes_up: function airbrakes_up() {
        this.send_action('sim/flight_controls/speed_brakes_up_one');
      },
      airbrakes_down: function airbrakes_down() {
        this.send_action('sim/flight_controls/speed_brakes_down_one');
      }
    }
  });
});
define('webapp/helpers/app-version', ['exports', 'webapp/config/environment', 'ember-cli-app-version/utils/regexp'], function (exports, _environment, _regexp) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.appVersion = appVersion;
  var version = _environment.default.APP.version;
  function appVersion(_) {
    var hash = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (hash.hideSha) {
      return version.match(_regexp.versionRegExp)[0];
    }

    if (hash.hideVersion) {
      return version.match(_regexp.shaRegExp)[0];
    }

    return version;
  }

  exports.default = Ember.Helper.helper(appVersion);
});
define('webapp/helpers/cancel-all', ['exports', 'ember-concurrency/-helpers'], function (exports, _helpers) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.cancelHelper = cancelHelper;


  var CANCEL_REASON = "the 'cancel-all' template helper was invoked";

  function cancelHelper(args) {
    var cancelable = args[0];
    if (!cancelable || typeof cancelable.cancelAll !== 'function') {
      Ember.assert('The first argument passed to the `cancel-all` helper should be a Task or TaskGroup (without quotes); you passed ' + cancelable, false);
    }

    return (0, _helpers.taskHelperClosure)('cancelAll', [cancelable, CANCEL_REASON]);
  }

  exports.default = Ember.Helper.helper(cancelHelper);
});
define('webapp/helpers/perform', ['exports', 'ember-concurrency/-helpers'], function (exports, _helpers) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.performHelper = performHelper;
  function performHelper(args, hash) {
    return (0, _helpers.taskHelperClosure)('perform', args, hash);
  }

  exports.default = Ember.Helper.helper(performHelper);
});
define('webapp/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _pluralize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _pluralize.default;
});
define('webapp/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _singularize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _singularize.default;
});
define('webapp/helpers/task', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  function _toArray(arr) {
    return Array.isArray(arr) ? arr : Array.from(arr);
  }

  function taskHelper(_ref) {
    var _ref2 = _toArray(_ref),
        task = _ref2[0],
        args = _ref2.slice(1);

    return task._curry.apply(task, _toConsumableArray(args));
  }

  exports.default = Ember.Helper.helper(taskHelper);
});
define('webapp/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'webapp/config/environment'], function (exports, _initializerFactory, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _config$APP = _environment.default.APP,
      name = _config$APP.name,
      version = _config$APP.version;
  exports.default = {
    name: 'App Version',
    initialize: (0, _initializerFactory.default)(name, version)
  };
});
define('webapp/initializers/component-styles', ['exports', 'ember-component-css/pod-names', 'webapp/mixins/style-namespacing-extras'], function (exports, _podNames, _styleNamespacingExtras) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.initialize = initialize;
  var Component = Ember.Component,
      ComponentLookup = Ember.ComponentLookup,
      computed = Ember.computed,
      getOwner = Ember.getOwner;


  ComponentLookup.reopen({
    componentFor: function componentFor(name, owner) {
      owner = owner.hasRegistration ? owner : getOwner(this);

      if (_podNames.default[name] && !owner.hasRegistration('component:' + name)) {
        owner.register('component:' + name, Component);
      }
      return this._super.apply(this, arguments);
    }
  });

  Component.reopen(_styleNamespacingExtras.default, {
    componentCssClassName: computed({
      get: function get() {
        return _podNames.default[this.get('_componentIdentifier')] || '';
      }
    }),

    init: function init() {
      this._super.apply(this, arguments);

      if (this.get('_shouldAddNamespacedClassName')) {
        this.classNames = this.classNames.concat(this.get('componentCssClassName'));
      }
    }
  });

  function initialize() {}

  exports.default = {
    name: 'component-styles',
    initialize: initialize
  };
});
define('webapp/initializers/container-debug-adapter', ['exports', 'ember-resolver/resolvers/classic/container-debug-adapter'], function (exports, _containerDebugAdapter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _containerDebugAdapter.default);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define('webapp/initializers/data-adapter', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'data-adapter',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('webapp/initializers/ember-concurrency', ['exports', 'ember-concurrency'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'ember-concurrency',
    initialize: function initialize() {}
  };
});
define('webapp/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data'], function (exports, _setupContainer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'ember-data',
    initialize: _setupContainer.default
  };
});
define('webapp/initializers/export-application-global', ['exports', 'webapp/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.initialize = initialize;
  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_environment.default.exportApplicationGlobal !== false) {
      var theGlobal;
      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _environment.default.exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember.String.classify(_environment.default.modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports.default = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('webapp/initializers/injectStore', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'injectStore',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('webapp/initializers/store', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'store',
    after: 'ember-data',
    initialize: function initialize() {}
  };
});
define('webapp/initializers/transforms', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'transforms',
    before: 'store',
    initialize: function initialize() {}
  };
});
define("webapp/instance-initializers/ember-data", ["exports", "ember-data/instance-initializers/initialize-store-service"], function (exports, _initializeStoreService) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: "ember-data",
    initialize: _initializeStoreService.default
  };
});
define('webapp/mixins/style-namespacing-extras', ['exports', 'ember-component-css/mixins/style-namespacing-extras'], function (exports, _styleNamespacingExtras) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _styleNamespacingExtras.default;
    }
  });
});
define('webapp/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberResolver.default;
});
define('webapp/router', ['exports', 'webapp/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var Router = Ember.Router.extend({
    location: _environment.default.locationType,
    rootURL: _environment.default.rootURL
  });

  Router.map(function () {});

  exports.default = Router;
});
define('webapp/routes/index', ['exports', 'ember-concurrency'], function (exports, _emberConcurrency) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({

    INTERVAL_SECONDS: 1,

    refresh_loop: (0, _emberConcurrency.task)( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var self, callback;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              self = this;

              callback = function callback() {
                self.refresh();
              };

            case 2:
              _context.next = 4;
              return (0, _emberConcurrency.timeout)(self.get("INTERVAL_SECONDS") * 1000);

            case 4:
              Ember.run.once(callback);

            case 5:
              _context.next = 2;
              break;

            case 7:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    })).on("init"),

    model: function model() {
      return Ember.$.ajax({
        type: 'GET',
        url: '/status'
      }).then(function (data) {

        data['ias'] = data['ias'].toFixed(2);
        return data;
      });
    }
  });
});
define('webapp/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _ajax) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _ajax.default;
    }
  });
});
define("webapp/templates/application", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "Y+z5vxO7", "block": "{\"symbols\":[],\"statements\":[[1,[18,\"outlet\"],false],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "webapp/templates/application.hbs" } });
});
define("webapp/templates/components/moving-map", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "n8tkKPnl", "block": "{\"symbols\":[\"&default\"],\"statements\":[[11,1]],\"hasEval\":false}", "meta": { "moduleName": "webapp/templates/components/moving-map.hbs" } });
});
define("webapp/templates/index", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "Q/K2TLfb", "block": "{\"symbols\":[],\"statements\":[[6,\"div\"],[9,\"class\",\"container mt-5\"],[7],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"col\"],[7],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n        \"],[6,\"div\"],[9,\"class\",\"col\"],[7],[6,\"h3\"],[7],[0,\"Controls\"],[8],[8],[0,\"\\n      \"],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"row mb-5\"],[7],[0,\"\\n        \"],[6,\"div\"],[9,\"class\",\"col\"],[7],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n            \"],[6,\"div\"],[9,\"class\",\"col\"],[7],[0,\"Airbrakes\"],[8],[0,\"\\n            \"],[6,\"div\"],[9,\"class\",\"col\"],[7],[0,\"\\n              \"],[6,\"button\"],[9,\"type\",\"button\"],[9,\"class\",\"btn btn-danger\"],[3,\"action\",[[19,0,[]],\"airbrakes_down\"]],[7],[0,\"Dep\"],[8],[0,\"\\n              \"],[6,\"button\"],[9,\"type\",\"button\"],[9,\"class\",\"btn btn-primary\"],[3,\"action\",[[19,0,[]],\"airbrakes_up\"]],[7],[0,\"Rel\"],[8],[0,\"\\n            \"],[8],[0,\"\\n          \"],[8],[0,\"\\n\\n\\n        \"],[8],[0,\"\\n      \"],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n        \"],[6,\"div\"],[9,\"class\",\"col\"],[7],[0,\"\\n\\n          \"],[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n            \"],[6,\"div\"],[9,\"class\",\"col\"],[7],[0,\"\\n              \"],[6,\"canvas\"],[9,\"data-type\",\"radial-gauge\"],[9,\"data-width\",\"300\"],[9,\"data-height\",\"250\"],[9,\"data-major-ticks\",\"0,60,80,270,380\"],[10,\"data-value\",[26,[[20,[\"model\",\"ias\"]]]]],[9,\"data-units\",\"Knots\"],[7],[8],[0,\"\\n            \"],[8],[0,\"\\n          \"],[8],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n            \"],[6,\"div\"],[9,\"class\",\"col text-center\"],[7],[0,\"\\n            \"],[8],[0,\"\\n          \"],[8],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n            \"],[6,\"div\"],[9,\"class\",\"col\"],[7],[0,\"\\n\\n\"],[4,\"if\",[[19,0,[\"model\",\"speedbrakes\"]]],null,{\"statements\":[[0,\"                \"],[6,\"div\"],[9,\"class\",\"alert alert-danger\"],[9,\"role\",\"alert\"],[7],[0,\"\\n                  SPEEDBRAKES\\n                \"],[8],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"            \"],[8],[0,\"\\n          \"],[8],[0,\"\\n\\n        \"],[8],[0,\"\\n      \"],[8],[0,\"\\n\\n    \"],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"col\"],[7],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n        \"],[6,\"div\"],[9,\"class\",\"col\"],[7],[0,\"\\n          Alt: \"],[1,[20,[\"model\",\"altitude\"]],false],[0,\"\\n        \"],[8],[0,\"\\n      \"],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n        \"],[6,\"div\"],[9,\"class\",\"col\"],[7],[0,\"\\n          \"],[1,[20,[\"model\",\"lat\"]],false],[0,\"/\"],[1,[20,[\"model\",\"lng\"]],false],[0,\"\\n        \"],[8],[0,\"\\n      \"],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"row\"],[7],[0,\"\\n        \"],[6,\"div\"],[9,\"class\",\"col\"],[7],[0,\"\\n          \"],[1,[25,\"moving-map\",null,[[\"lat\",\"lng\"],[[19,0,[\"model\",\"lat\"]],[19,0,[\"model\",\"lng\"]]]]],false],[0,\"\\n        \"],[8],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "webapp/templates/index.hbs" } });
});


define('webapp/config/environment', ['ember'], function(Ember) {
  var prefix = 'webapp';
try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

});

if (!runningTests) {
  require("webapp/app")["default"].create({"name":"webapp","version":"0.0.0+f9aa928a"});
}
//# sourceMappingURL=webapp.map
