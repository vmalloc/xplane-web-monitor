import Ember from 'ember';

/* global google */

export default Ember.Component.extend({

  classNames: ['moving-map'],

  lat: null,
  lng: null,
  last_added_point_ts: 0,
  INTERVAL: 5 * 60,



  lat_lng_change: Ember.observer('lat', 'lng', function() {
    let {lat, lng} = this.getProperties('lat', 'lng');
    let pos = new google.maps.LatLng(lat, lng);
    let marker = this.get('marker');
    let map = this.get('map');

    if (marker) {
      marker.setPosition(pos);
    } else {
      let marker = new google.maps.Marker({
        position: pos,
        map: this.get('map')});
      this.set('marker', marker);
      map.setCenter(pos);
      map.setZoom(8);
    }

    let path = this.get('path');
    let coords = path.getPath();

    let timestamp = (new Date()).getTime() / 1000;
    if (coords.getLength() <= 1 || timestamp - this.get('last_added_point_ts') > this.get('INTERVAL')) {
      coords.push(pos);
      this.set('last_added_point_ts', timestamp);
    }
    else {
      coords.setAt(coords.getLength() - 1, pos);
    }
  }),

  didInsertElement() {
    let map = new google.maps.Map(this.element, {
      center: new google.maps.LatLng(0, 0),
      zoom: 1,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    let path = new google.maps.Polyline({
      path: [],
      editable: true,
      strokeColor: 'black',
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map: map
    });

    this.set('map', map);
    this.set('path', path);

  },
});
