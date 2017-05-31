import { Component } from '@angular/core';
import { AlertController, LoadingController, Platform, ToastController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

import { SettingsProvider } from '../../providers/settings';
import { LocalStorageProvider } from '../../providers/localStorage';

import L from 'leaflet';
import * as PouchDB from 'pouchdb';
import * as PouchSQLite from 'pouchdb-adapter-cordova-sqlite';

@Component({
  selector: 'page-saveLocation',
  templateUrl: 'saveLocation.html'
})
export class SaveLocation {
  map: any;
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

  constructor(
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
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
        this.carLat = position.coords.latitude;
        this.carLng = position.coords.longitude;
        this.carLatLng = L.latLng(this.carLat, this.carLng);
        /** Remove the old map if it's already there i.e. this page is revisited  */
        if (typeof(this.map) !== 'undefined') {
          this.map.remove();
        }
        this.map = L.map('saveLocationMap', {
          center: this.carLatLng,
          zoom: 16,
          zoomControl: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          dragging: false,
          tap: false
        });
        let copyrightLayer =
          L.tileLayer(this.tileOptions, {
            attribution: this.mapAttribution + " | This App Version - " + this.versionNumber,
            accessToken: this.mapAccessToken
          })
          .addTo(this.map);
        this.carIcon = L.icon({
            iconUrl: 'assets/icon/pin_red.png',
            iconSize: [25, 45],
            iconAnchor: [12, 45]
        });
        this.carMarker = L.marker(this.carLatLng, {icon: this.carIcon})
          .addTo(this.map)
          .bindPopup('Tap the button below to save this location')
        this.map.dragging.disable; /** Effectively disables zoom and stuff on mobiles too */
        buildingMapSpinner.dismiss();
      });
    } else {
      noGeoLocationAlert.present();
    }
  }

  saveLocation() {
    let savedLocationToast: any = this.toastCtrl.create({
      message: 'Location Saved',
      duration: 3000,
      position: 'bottom',
      cssClass: 'toast'
    });
    this.pouch.get('carLocation')
      .then(doc => {
        this.pouch.put({
          _id: 'carLocation',
          _rev: doc._rev,
          value: this.carLatLng
        });
        savedLocationToast.present();
      })
      .catch(err => {
        if (err.status === 404) { // Not There
          this.pouch.put({
            _id: 'carLocation',
            value: this.carLatLng
          });
          savedLocationToast.present();
        } else {
          this.localStorageProvider.localStorageError('carLocation', err);
        }
      }
    )
  }

}
