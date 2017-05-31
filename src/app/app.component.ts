import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import * as PouchDB from 'pouchdb';
import * as PouchSQLite from 'pouchdb-adapter-cordova-sqlite';

import { SettingsProvider } from '../providers/settings';
import { LocalStorageProvider } from '../providers/localStorage';

import { TabsPage } from '../pages/tabs/tabs';

@Component({
  templateUrl: 'app.html',
  providers: [
    SettingsProvider,
    LocalStorageProvider
  ]

})
export class MyApp {
  rootPage:any = TabsPage;
  pouch: any;

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      window["PouchDB"] = PouchDB;
      if (!platform.is('cordova')) {  // Browser
        this.pouch = new PouchDB('geoFind', { adapter: 'websql' });
      } else {    // Mobile
         PouchDB.plugin(PouchSQLite);
         this.pouch = new PouchDB('geoFind', { adapter: 'cordova-sqlite', location: 'default' });
      }
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}
