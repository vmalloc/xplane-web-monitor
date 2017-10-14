import Ember from 'ember';

export default Ember.Controller.extend({

  send_action(action) {

    Ember.$.ajax({
      type: 'POST',
      url: '/command',
      contentType: 'json',
      data: JSON.stringify({command: action}),
    });
  },

  actions: {

    airbrakes_up() {
      this.send_action('sim/flight_controls/speed_brakes_up_one');
    },

    airbrakes_down() {
      this.send_action('sim/flight_controls/speed_brakes_down_one');
    },
  }
});
