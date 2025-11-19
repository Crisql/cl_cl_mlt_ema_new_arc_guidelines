import { Injectable } from '@angular/core';
import { ActionSheetController, AlertController, ModalController, ModalOptions, NavController, PopoverController } from '@ionic/angular';
import { ComponentRef } from '@ionic/core';

@Injectable({
  providedIn: 'root'
})
export class CustomModalController {
  constructor(private modalController: ModalController,
              private actionSheetController: ActionSheetController,
              private alertController: AlertController,
              private popoverController: PopoverController) {
  }

  async create(_options: ModalOptions<ComponentRef>): Promise<HTMLIonModalElement>{
    return await this.modalController.create(_options);
  }

  dismiss(_data?: any, _role?: string): void
  {
    this.modalController.dismiss(_data, _role);
  }

  async DismissAll(): Promise<void>
  {
    if(await this.actionSheetController.getTop()) this.actionSheetController.dismiss(null);
    
    if(await this.popoverController.getTop()) this.popoverController.dismiss(null);
    
    if(await this.alertController.getTop()) this.alertController.dismiss(null);
    
    if(await this.modalController.getTop()) this.modalController.dismiss(null);
  }
}
