import { Component } from '@angular/core';

import { SaveLocation } from '../saveLocation/saveLocation';
import { FindCar } from '../findCar/findCar';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = SaveLocation;
  tab2Root = FindCar;

  constructor() {

  }
}
