import { Injectable } from '@angular/core';
// import 'rxjs/add/operator/map';

@Injectable()
export class SettingsProvider {
  /** Map settings */
  maxZoom: number = 18;
  zoom: number = 16;
  minZoom: number = 14;
  tileOptions: string = 'https://api.tiles.mapbox.com/v4/mapbox.streets-basic/{z}/{x}/{y}.png?access_token={accessToken}';
  mapAttribution: string = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>';
  mapAccessToken: string = 'pk.eyJ1IjoiZGFubWF0dGhld3MiLCJhIjoiY2lpZDk3bDl1MDAwd3dibTB2cWh6dHJhcCJ9.RT6G6JSjVZ2z1ZXoEfmMaA';

  /** Other settings */

  // Development stuff
  versionNumber: string = '0.0.1';

  constructor() {
  }

}
