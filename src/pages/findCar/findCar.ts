import { Component } from '@angular/core';
import { NavController, Platform, LoadingController, AlertController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

import { SettingsProvider } from '../../providers/settings';
import { LocalStorageProvider } from '../../providers/localStorage';

import L from 'leaflet';
import * as PouchDB from 'pouchdb';
import * as PouchSQLite from 'pouchdb-adapter-cordova-sqlite';

@Component({
  selector: 'page-findCar',
  templateUrl: 'findCar.html'
})
export class FindCar {
  map: any;
  userLat: number;
  userLng: number;
  userLatLng: any;
  userMarker: any;
  userIcon: any;
  carLat: number;
  carLng: number;
  carLatLng: any;
  carMarker: any;
  carIcon: any;
  maxZoom: number;
  zoom: number;
  minZoom: number;
  tileOptions: string;
  mapAttribution: string;
  mapAccessToken: string;
  versionNumber: string;
  pouch: any;
  rendered: boolean = false;
  centreBounds: any;
  distance: number;

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public localStorageProvider: LocalStorageProvider,
    public settingsProvider: SettingsProvider,
    public platform: Platform,
    public geolocation: Geolocation
  ) {
    this.maxZoom = settingsProvider.maxZoom;
    this.zoom = settingsProvider.zoom;
    this.minZoom = settingsProvider.minZoom;
    this.tileOptions = settingsProvider.tileOptions;
    this.mapAttribution = settingsProvider.mapAttribution;
    this.mapAccessToken = settingsProvider.mapAccessToken;
    this.versionNumber = settingsProvider.versionNumber;
    if (!this.platform.is('cordova')) {  // Browser
      this.pouch = new PouchDB('geoFind', { adapter: 'websql' });
    } else {    // Mobile
      PouchDB.plugin(PouchSQLite);
      this.pouch = new PouchDB('geoFind', { adapter: 'cordova-sqlite', location: 'default' });
    }
  }

  ionViewDidEnter() {
    let locationNotSavedAlert = this.alertCtrl.create({
      title: 'Car location not saved',
      subTitle: 'Return to "Save Location" screen to save one',
      buttons: [
        {
          text: 'OK',
        }
      ]
    });
    // get location from pouch
    this.pouch.get('carLocation')
      .then(doc => {
        this.carLat = doc.value.lat;
        this.carLng = doc.value.lng;
        this.carLatLng = L.latLng(this.carLat, this.carLng);
        this.buildMap();
      })
      .catch(err => {
        if (err.status === 404) { // Not There
          locationNotSavedAlert.present();
        } else {
          this.localStorageProvider.localStorageError('carLocation', err);
        }
      }
    )
  }

  buildMap() {
    let buildingMapSpinner = this.loadingCtrl.create({
      content: "Building map. Please wait..."
    });
    let noGeoLocationAlert = this.alertCtrl.create({
      title: 'No Geolocation available!',
      subTitle: 'Please check and re-run app.',
      buttons: [
        {
          text: 'OK',
        }
      ]
    });

    if ("geolocation" in navigator) {
      buildingMapSpinner.present();
      this.geolocation.getCurrentPosition({enableHighAccuracy: true}).then((position) => {
        this.userLat = position.coords.latitude;
        this.userLng = position.coords.longitude;
        this.userLatLng = L.latLng(this.userLat, this.userLng);
        /** Remove the old map if it's already there i.e. this page is revisited  */
        if (typeof(this.map) !== 'undefined') {
          this.map.remove();
        }
        this.map = L.map('findCarMap', {
          center: this.userLatLng,
          zoom: this.zoom,
          minZoom: this.minZoom,
          maxZoom: this.maxZoom,
        });
        let copyrightLayer =
          L.tileLayer(this.tileOptions, {
            attribution: this.mapAttribution + " | This App Version - " + this.versionNumber,
            accessToken: this.mapAccessToken
          })
          .addTo(this.map);
        this.userIcon = L.icon({
            iconUrl: 'assets/icon/pin_red.png',
            iconSize: [25, 45],
            iconAnchor: [12, 45]
        });
        this.userMarker = L.marker(this.userLatLng, {icon: this.userIcon})
          // .addTo(this.map)
          .bindPopup('Present location')
// console.log('lat -', this.carLat)
// console.log('lng -', this.carLng)
// console.log('car location -', this.carLatLng)
        // if the car location was not saved, display error but do not process any further
        // place marker on map
        this.carIcon = L.icon({
            iconUrl: 'assets/icon/car_pin.png',
            iconSize: [45, 45],
            iconAnchor: [23, 45]
        });
        this.carMarker = L.marker(this.carLatLng, {icon: this.carIcon})
          // .addTo(this.map)
          .bindPopup('Your car is here!')
        // draw line fron car to user and measure the distance
        let polyline = L.polyline([this.carLatLng, this.userLatLng])
          .addTo(this.map);
        this.distance = this.carLatLng.distanceTo(this.userLatLng).toFixed(2);
// console.log('distance -', this.distance)
        // put markers in a feature group
        let markerGroup = L.featureGroup([this.carMarker, this.userMarker])
          .addTo(this.map);
        this.centreBounds = markerGroup.getBounds();
        this.rendered = true;
        buildingMapSpinner.dismiss();
      });
    } else {
      noGeoLocationAlert.present();
    }
  }

  centreMap() {
    this.map.fitBounds(this.centreBounds);
  }

}
