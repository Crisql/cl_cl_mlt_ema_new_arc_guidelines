import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import { ModalController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { of, Subject, Subscription } from 'rxjs';
import { finalize, switchMap, tap } from 'rxjs/operators';
import { AlertType, LogEvent } from 'src/app/common';
;import { CommonService, LogManagerService } from 'src/app/services';

@Component({
  selector: 'app-simple-scanner',
  templateUrl: './simple-scanner.component.html',
  styleUrls: ['./simple-scanner.component.scss'],
})
export class SimpleScannerComponent implements OnInit, OnDestroy{
  
  @Input() isDisabled: boolean = false;

  @Output() scanStatus = new EventEmitter<boolean>();

  @Output() scannedValue = new EventEmitter<string>();

  private onScanCode$ = new Subject<string>();
  
  scannedCode: string = '';

  requestingItem: boolean = false;

  searchTerm: string;
  table: string = '';

  currency: string;
  expanded = false;

  scanSub: Subscription;

  backButtonSubscription: Subscription;

  constructor(private qrScannerService: QRScanner,
              private commonService: CommonService,
              private logManagerService: LogManagerService,
              private translateService: TranslateService,
              private platform: Platform,
              private modalController: ModalController) {}

  ngOnInit() {
    //An event is recorded to listen for the mobile back action
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10, () => {
      this.scanStatus.emit(false)
      this.qrScannerService.hide();
      this.qrScannerService.destroy();
    });
    
    this.ListenScan();
  }

  ngOnDestroy() {
    this.backButtonSubscription?.unsubscribe();
    this.scanSub?.unsubscribe();
    this.qrScannerService?.hide();
    this.qrScannerService?.destroy();
    this.onScanCode$?.complete();
  }

  
  /**
   * Handles keyboard input events for scanning purposes.
   * 
   * @param _event KeyboardEvent triggered by a key press.
   */
  @HostListener('window:keydown', ['$event'])
  async HandleScannerInput(_event: KeyboardEvent): Promise<void> {

    if(this.requestingItem){
      return;
    }
    
    if(this.isDisabled){
      return;
    }
    if(await this.modalController.getTop())
    {
      return;
    }

    if (_event.key === 'Enter') {
      this.onScanCode$.next(this.scannedCode);
      this.scannedCode = '';
    }
    else if (_event.key.length === 1) {
      this.scannedCode += _event.key;
    }
  }

  /**
   * Listens for scan events and processes scanned codes. For each scanned code:
   */
  async ListenScan() {
    let loader: HTMLIonLoadingElement;
    this.onScanCode$
        .pipe(
          switchMap(async (scannedCode) =>{
            loader = await this.commonService.Loader();
            loader.present();
            return scannedCode
          }),
          finalize(()=>loader?.dismiss())
        )
        .subscribe({
          next: (scannedCode)=>{
            this.scannedValue.emit(scannedCode);
            
          },
          error: (error)=>{
            this.requestingItem = false;
            this.commonService.alert(AlertType.ERROR, error);
            return of(null)
          }
        });
  }


  /**
   * Opens the QR scanner to scan an item and retrieves its details.
   * It requests camera permissions, handles scanning, and processes the scanned item.
   */
 async OpenScanner(): Promise<void> {
    let loader: HTMLIonLoadingElement;
    // Request permissions and show the camera to scan
    this.qrScannerService.prepare().then((status: QRScannerStatus) => {
      if (status.authorized) {
        this.scanStatus.emit(true)

        this.qrScannerService.show()


        this.scanSub = this.qrScannerService.scan()
            .pipe(
                switchMap(async (scannedCode) =>{
                  loader = await this.commonService.Loader();
                  loader.present();

                  return scannedCode
                }),
                finalize(()=>{
                  
                  this.scanStatus.emit(false)
                  this.qrScannerService.hide();
                  this.qrScannerService.destroy();
                  loader.dismiss();
                })
            )
            .subscribe({
                next: (scannedCode) => {
                    try
                    {
                      this.scannedValue.emit(scannedCode);
                      this.scanSub.unsubscribe();
                    }
                    catch (error)
                    {
                      this.logManagerService.Log(LogEvent.ERROR, `${error.message || error}`);
          
                      this.commonService.alert(AlertType.ERROR, `Error: ${error}`);

                      this.scanSub.unsubscribe();
                      
                    }
                  },
                    error: (error) => {
                      this.logManagerService.Log(LogEvent.ERROR, error);
            
                      this.commonService.alert(AlertType.ERROR, `Error: ${error}`);

                      this.scanSub.unsubscribe();
                   }
            });

           
      } else if (status.denied) {
        this.AssignCameraPermissions()
      } 
    }).catch((err: Error) =>{
      if(err?.name == "CAMERA_ACCESS_DENIED"){
        this.AssignCameraPermissions()
      }else{
        this.commonService.alert(AlertType.ERROR, err.message);
      }
    }
    );
  }

  /**
   * Displays a confirmation dialog to request camera access permissions.
   * 
   * @constructor
   */
  AssignCameraPermissions(){
    this.commonService.Alert(
        AlertType.QUESTION,
        'Esta aplicación necesita acceso a la cámara para el escaneo.\n' +
        '\n' +
        '¿Quieres ir a la configuración de tu dispositivo para habilitarlo manualmente?',
        'This app needs camera access for scanning'+
        '\n' +
        'Would you like to go to your device settings to enable it manually?',
        'Permiso de cámara requerido',
        'Camera Permission Required',
        [
          {
            text: this.translateService.currentLang == "es" ? 'Cancelar' : 'Cancel',
            role: "cancel",
          },
          {
            text: this.translateService.currentLang == "es" ? 'Ir a configuración' : 'Go to Settings',
            handler: () => {
              // Redirects to settings
              this.qrScannerService.openSettings();
            },
          },
        ],
    );
  }

}
