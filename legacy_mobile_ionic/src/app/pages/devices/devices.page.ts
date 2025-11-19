import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { BluetoothSerial } from "@ionic-native/bluetooth-serial/ngx";
import { AlertController, LoadingController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { AlertType } from "src/app/common";
import { CommonService, LocalStorageService, Repository } from "src/app/services";
import { LocalStorageVariables } from "src/app/common/enum";

@Component({
  selector: "app-devices",
  templateUrl: "./devices.page.html",
  styleUrls: ["./devices.page.scss"],
})
export class DevicesPage implements OnInit {
  unpairedDevices: any[];
  pairedDevices: any[];
  isConnected: boolean;
  searchingPaired: boolean;
  searchingUnpaired: boolean;
  printingType: FormControl;

  constructor(
    private bluetoothSerial: BluetoothSerial,
    private alertController: AlertController,
    private translateService: TranslateService,
    private loadingCtrl: LoadingController,
    private commonService: CommonService,
    private repositoryConfiguration: Repository.Configuration,
    private storageService: LocalStorageService
  ) {}

  ngOnInit() 
  {
    this.printingType = new FormControl("", Validators.required);
  }

  ionViewDidEnter():void {
    this.repositoryConfiguration.GetConfiguration("PrintingType").then((response) => {
      if (response && response.Json)
        this.printingType.setValue(response.Json);
    });
    this.bluetoothSerial.enable();
    this.ListPairedDevices();
    this.DiscoverDevices();
  }

  async Connect(device: any): Promise<void> {
    this.commonService.Alert(
      AlertType.QUESTION, 
      `¿Conectarse la impresora ${device.name ?? device.address}?`,
      `Connect to the printer ${device.name ?? device.address}?`,
      "Confirmación",
       "Confirmation",
      [
        {
          text: this.commonService.Translate('Cancelar', 'Cancel'),
          role: "cancel",
        },
        {
          text: this.commonService.Translate('Continuar', 'Continue'),
          handler: async () => {
            let loading = await this.loadingCtrl.create();
            loading.present();
            this.bluetoothSerial.connect(device.address).subscribe(
              () => {
                loading.dismiss();
                this.isConnected = true;
                this.storageService.set(LocalStorageVariables.BluetoothPrinter, device.address, true);
              },
              (error) => {
                loading.dismiss();
                this.isConnected = false;
                this.commonService.alert(AlertType.ERROR,  error);
              }
            );
          },
        },
      ],
    );
  }

  async Disconnect(): Promise<void> {
    this.commonService.Alert(
      AlertType.QUESTION,
      "¿Desconectar de la impresora?",
      "Disconnect from the printer?",
      "Confirmación", 
      "Confirmation",
      [
        {
          text: this.commonService.Translate('Cancelar', 'Cancel'),
          role: "cancel",
        },
        {
          text: this.commonService.Translate('Continuar', 'Continue'),
          handler: () => {
            this.bluetoothSerial.disconnect();
            this.isConnected = false;
            this.storageService.Remove(LocalStorageVariables.BluetoothPrinter);
          },
        },
      ],
    );
  }

  ListPairedDevices(): void {
    this.searchingPaired = true;
    this.pairedDevices = [];
    this.bluetoothSerial
      .list()
      .then((success) => {
        this.searchingPaired = false;
        this.pairedDevices = success;
      })
      .catch(() => {
        this.searchingPaired = false;
      });
  }

  DiscoverDevices(): void {
    this.searchingUnpaired = true;
    this.unpairedDevices = [];
    this.bluetoothSerial
      .discoverUnpaired()
      .then((success) => {
        this.searchingUnpaired = false;
        this.unpairedDevices = success;
      })
      .catch(() => {
        this.searchingUnpaired = false;
      });
  }

  OnChangePrintingType(): void {
    this.repositoryConfiguration.DeleteConfigurations("PrintingType").then(() => {
      this.repositoryConfiguration.StoreConfiguration(
        "PrintingType",
        this.printingType.value
      );
    });
  }
}
