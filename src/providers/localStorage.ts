import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';

@Injectable()
export class LocalStorageProvider {

  constructor(
    public alertCtrl: AlertController,
  )
  {
  }

  localStorageError(document, err) {
    let localStorageErrorAlert = this.alertCtrl.create({
      title: 'Whoops! Something went wrong.',
      subTitle: 'Local storage error - ' + document + " - " + err.message,
      buttons: [
        {
          text: 'OK',
        }
      ]
    })

    localStorageErrorAlert.present();
    console.log('Local storage error - ', document, err.message);
  }

}
