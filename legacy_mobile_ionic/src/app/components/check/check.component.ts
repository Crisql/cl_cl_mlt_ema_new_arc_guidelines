import {Component, Input, OnInit} from "@angular/core";
import {PhotoViewer} from "@ionic-native/photo-viewer/ngx";
import {PopoverController} from "@ionic/angular";
import {TranslateService} from "@ngx-translate/core";

import {AlertType, CheckType} from "src/app/common";
import {ICheckComponentInputData} from "src/app/models/db/i-modals-data";
import {CameraService, CheckRouteService, CommonService, LocalStorageService} from "src/app/services";
import {finalize} from "rxjs/operators";

@Component({
  selector: "app-check",
  templateUrl: "./check.component.html",
  styleUrls: ["./check.component.scss"],
})
export class CheckComponent implements OnInit {
  @Input("data") data: ICheckComponentInputData;
  photo: string;
  checkComment: string;
  newCheckType: string;
  selectForCheckOutTypes: boolean;

  constructor(
    private translateService: TranslateService,
    private popoverController: PopoverController,
    private photoViewer: PhotoViewer,
    private checkRouteService: CheckRouteService,
    private cameraService: CameraService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    if (this.data.CheckType === CheckType.CheckOut) 
    {
      this.selectForCheckOutTypes = true;
      this.newCheckType = CheckType.CheckOutSuccess.toString();
    } 
    else 
    {
      this.newCheckType = this.data.CheckType.toString();
    }
  }

  /**
   * Take a photo with the mobile
   * @constructor
   */
  async TakePhoto() {
    this.photo = await this.cameraService.TakePhoto();
  }

  /**
   * Show a modal with the image
   * @constructor
   */
  PreviewImage() {
    if (!this.photo) return;

    this.photoViewer.show(
      `data:image/jpeg;base64,${this.photo}`,
      this.translateService.currentLang === "es"
        ? "Imagen para adjuntar"
        : "Image to attach",
      { share: false }
    );
  }

  /**
   * Create a route history
   * @constructor
   */
  async CreateRouteHistory(): Promise<void> 
  {
    let loader: HTMLIonLoadingElement = await this.commonService.Loader();
    
    loader.present();
    
    this.checkRouteService.CreateRouteHistory(+this.newCheckType, this.data.RouteId, this.checkComment, this.data.CardCode, this.data.CardName, this.data.Address, this.data.AddressType, this.data.RouteLineId, this.photo)
        .pipe(
            finalize(() => loader.dismiss())
        )
        .subscribe({
          next: (response) => {
            if (!response)
            {
              this.commonService.alert(
                  AlertType.INFO,
                  this.commonService.Translate("Verifique que los servicios de ubicación esten activos", "Check if location services are enable")
              );
            }
            else
            {
              this.dismiss(+this.newCheckType);
            }
          },
          error: (error) => {
            this.commonService.Alert(AlertType.ERROR, error, error);
          }
        });
  }

  dismiss(result: number = null) {
    this.popoverController.dismiss(result);
  }
}
