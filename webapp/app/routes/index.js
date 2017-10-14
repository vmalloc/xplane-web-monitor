import Ember from 'ember';
import {task, timeout} from 'ember-concurrency';

export default Ember.Route.extend({

  INTERVAL_SECONDS: 1,

  refresh_loop: task(function*() {
    let self = this;

    let callback = function() {
      self.refresh();
    };

    for (;;) {
      yield timeout(self.get("INTERVAL_SECONDS") * 1000);
      Ember.run.once(callback);
    }
  }).on("init"),

  model() {
    return Ember.$.ajax({
      type: 'GET',
      url: '/status',
    }).then(function(data) {

      data['ias'] = data['ias'].toFixed(2);
      return data;
    });
  }
});
