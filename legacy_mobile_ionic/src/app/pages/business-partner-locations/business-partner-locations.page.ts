import { Component, OnDestroy, OnInit } from "@angular/core";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { IonItemSliding, LoadingController } from "@ionic/angular";
import {
  GoogleMap,
  GoogleMapOptions,
  GoogleMaps,
  GoogleMapsEvent,
  LatLng,
  MyLocation,
} from "@ionic-native/google-maps/ngx";
import { AddressType, AlertType, LogEvent } from "src/app/common";
import {
  CommonService,
  CustomerService,
  LocalStorageService,
  LogManagerService,
  PublisherService,
} from "src/app/services";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { HeadersData, LocalStorageVariables, PublisherVariables } from "src/app/common/enum";
import { environment } from "src/environments/environment";
import { finalize } from "rxjs/operators";
import { IBpAddress } from "../../interfaces/i-bp-address";
import { IBusinessPartners } from "../../interfaces/i-business-partners";
import { Subscription } from "rxjs";


@Component({
  selector: "app-business-partner-locations",
  templateUrl: "./business-partner-locations.page.html",
  styleUrls: ["./business-partner-locations.page.scss"],
})
export class BusinessPartnerLocationsPage implements OnInit, OnDestroy {
  btnSaveText: 'LOCATIONS.ADD' | 'LOCATIONS.MODIFY';
  locationForm: FormGroup;
  latLng: LatLng;
  showMap = false;
  map: GoogleMap;
  Locations: IBpAddress[] = [];
  currentBP: IBusinessPartners;
  page: number = 0;
  recordsCount: number = 0;
  edition: boolean = false;
  currentAddress: IBpAddress = null;

  suscription$ = new Subscription();

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private geolocation: Geolocation,
    private loadingController: LoadingController,
    private commonService: CommonService,
    private localStorageService: LocalStorageService,
    private publisherService: PublisherService,
    private customerService: CustomerService,
    private logManagerService: LogManagerService
  ) { }

  ngOnInit() {
    this.locationForm = this.formBuilder.group({
      locationName: ['', Validators.required],
      otherSigns: [''],
      Type: [AddressType.BillTo.toString(), Validators.required],
    });
    this.currentBP = this.localStorageService.data.get(LocalStorageVariables.BusinessPartner);
    this.localStorageService.data.delete(LocalStorageVariables.BusinessPartner);
    this.InitPage();
    this.SendInitialData();
  }

  ngOnDestroy() {
    this.suscription$?.unsubscribe();
  }


  /**
   * This method is used to get Address
   * @constructor
   * @private
   */
  private async SendInitialData(): Promise<void> {
    let loader = await this.commonService.Loader();
    loader.present();

    this.suscription$.add(this.customerService.GetAddress(this.currentBP.CardCode).pipe(
      finalize(() => loader.dismiss())
    ).subscribe({
      next: (callback) => {
        if (callback.Data && callback.Data.length > 0) {
          this.Locations = callback.Data.map(element => { return { ...element, InDB: true } });
          this.recordsCount = +this.localStorageService.data.get(HeadersData.RecordsCount);
          this.localStorageService.data.delete(HeadersData.RecordsCount);
        }
      },
      error: (error) => {
        this.commonService.alert(AlertType.ERROR, error);
        this.logManagerService.Log(LogEvent.ERROR, error);
      }
    }));
  }

  InitPage(): void {
    this.latLng = undefined;
    this.showMap = false;
    this.btnSaveText = 'LOCATIONS.ADD';
    this.locationForm.reset({
      locationName: '',
      otherSigns: '',
      Type: AddressType.BillTo,
    });
  }

  /**
   * This method is used to add addrress
   * @returns 
   */
  AddNewLocation(): void {

    try {
      if (this.Locations.some((x) => x.AddressName.toLocaleLowerCase() === this.locationForm.get('locationName').value.toLocaleLowerCase())) {
        this.commonService.Alert(AlertType.WARNING,
          'Existe una dirección con el mismo nombre',
          'There is an address with the same name'
        );
        return;
      }

      if (this.edition) {
        this.currentAddress.StreetNo = this.latLng.lat?.toString();
        this.currentAddress.BuildingFloorRoom = this.latLng.lng?.toString();
        this.currentAddress.AddressName = this.locationForm.get('locationName').value;
        this.currentAddress.AddressType = this.locationForm.get('Type').value;
        this.currentAddress.IsEdit = true;
        this.commonService.Alert(AlertType.INFO, 'Editada', 'Edited');
      } else {
        let data = {
          StreetNo: this.latLng.lat?.toString(),
          BuildingFloorRoom: this.latLng.lng?.toString(),
          AddressName: this.locationForm.get('locationName').value,
          AddressType: this.locationForm.get('Type').value,
          InDB: false
        } as IBpAddress
        this.Locations.push(data);
        this.commonService.Alert(AlertType.INFO, 'Agregada', 'Added');
      }

      this.edition = false;
      this.currentAddress = null;

      this.InitPage();
    } catch (error) {
      this.commonService.alert(AlertType.ERROR, error);
      this.logManagerService.Log(LogEvent.ERROR, error);
    }


  }

  /**
   * This method is used to load in form address
   * @param _locToEdit model address
   */
  LoadLocationInfo(_locToEdit: IBpAddress): void {
    this.edition = true;
    this.currentAddress = _locToEdit;
    this.btnSaveText = 'LOCATIONS.MODIFY';
    this.locationForm.reset({
      locationName: _locToEdit.AddressName,
      Type: _locToEdit.AddressType,
    });
    this.latLng = new LatLng(+_locToEdit.StreetNo, +_locToEdit.BuildingFloorRoom);
  }

  async SetAsDefault(_locToDefault: IBpAddress, _index: number, _slidingLocation: IonItemSliding): Promise<void> {

    let slidingRatio: number = await _slidingLocation.getSlidingRatio();

    if (slidingRatio <= -1) {
      _slidingLocation.close();

      if (_locToDefault.IsDefault) return;

      if (_locToDefault.AddressType === AddressType.ShipTo) {
        this.currentBP.ShipToDefault = _locToDefault.AddressName;
      }

      if (_locToDefault.AddressType === AddressType.BillTo) {
        this.currentBP.BilltoDefault = _locToDefault.AddressName;
      }

      this.Locations.forEach((l) => {
        l.IsDefault = false;
      });
      _locToDefault.IsDefault = true;
    }

  }


  /**
   * This method is used to delete address
   * @param locToDelete modelo address
   * @param index index
   * @param slidingLocation event
   * @returns 
   */
  async LocDeletionConfirmation(locToDelete: IBpAddress, index: number, slidingLocation: IonItemSliding): Promise<void> {
    let slidingRatio: number = await slidingLocation.getSlidingRatio();

    if (slidingRatio < 1) return;

    slidingLocation.close();


    if (locToDelete.InDB) {
      this.commonService.Alert(AlertType.INFO, 'No se puede eliminar esta dirección porque ya existe en SAP.', 'This address cannot be deleted because it already exists in SAP');
      return;
    }

    this.commonService.Alert(
      AlertType.QUESTION,
      '¿Eliminar ubicación?',
      'Delete location?',
      'Confirmación',
      'Confirmation',
      [
        {
          text: this.commonService.Translate('Cancelar', 'Cancel'),
          role: 'cancel',
        },
        {
          text: this.commonService.Translate('Eliminar', 'Delete'),
          handler: () => {
            this.Locations.splice(index, 1);
          }
        },
      ]
    );
  }

  async GetCurrentCoords(): Promise<void> {
    if (this.showMap) {
      this.HandleMapVisibility();
    }
    let loader = await this.loadingController.create();
    loader.present();

    this.geolocation
      .getCurrentPosition({ timeout: environment.getCurrentPositionTimeout })
      .then((resp) => {
        loader.dismiss();

        this.latLng = new LatLng(resp.coords.latitude, resp.coords.longitude);
      })
      .catch((error) => {
        loader.dismiss();
        this.commonService.Alert(
          AlertType.WARNING,
          'Habilite los servicios de ubicación por favor',
          'Enable location services please'
        );
        console.log(error);
      });
  }

  async OnClickCurrentPosition(): Promise<void> {
    this.commonService.Alert(
      AlertType.QUESTION,
      '¿Desea actualizar la latitud y longuitud por la posicion actual?',
      'Do you want to update the latitude and longitude by the current position?',
      'Confirmación',
      'Confirmation',
      [
        {
          text: this.commonService.Translate('Cancelar', 'Cancel'),
          role: 'cancel',
        },
        {
          text: this.commonService.Translate('Continuar', 'Continue'),
          handler: () => {
            this.GetCurrentCoords();
          },
        },
      ],
    );
  }

  HandleMapVisibility(): void {
    this.showMap = !this.showMap;
    if (this.showMap) {
      this.LoadMap();
    }
  }

  LoadMap(): void {
    let mapOptions: GoogleMapOptions = {
      camera: {
        target: {
          lat: 9.373258,
          lng: -83.702695,
        },
        zoom: 18,
        tilt: 30,
      },
    };

    this.map = GoogleMaps.create("map_canvas", mapOptions);

    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      this.GetCurrentPosition();
    });
  }

  GetCurrentPosition(): void {
    this.map.getMyLocation().then((response) => {
      this.map.moveCamera({
        target: response.latLng,
      });

      this.LoadPositionMarker(response);
    }).catch(error => {
      if (error && !error.status) {
        this.commonService.Alert(
          AlertType.WARNING,
          'Habilite los servicios de ubicación por favor',
          'Enable location services please'
        );
      }
      console.log(error);
    });
  }

  LoadPositionMarker(location: MyLocation): void {

    if (this.edition) {
      this.latLng = new LatLng(
        +this.currentAddress.StreetNo,
        +this.currentAddress.BuildingFloorRoom
      );
      this.map.setCameraTarget(this.latLng);
    } else {
      this.latLng = location.latLng;
    }
    this.map
      .addMarker({
        map: this.map,
        title: 'Mi Posición',
        icon: 'red',
        animation: 'DROP',
        position: this.latLng,
        visible: false,
      })
      .then((marker) => {
        this.AddMappDragListener(marker);
      });
  }

  AddMappDragListener(marker: any): void {
    this.map.on(GoogleMapsEvent.CAMERA_MOVE).subscribe(() => {
      let centerMap = this.map.getCameraTarget();
      this.latLng.lat = centerMap.lat;
      this.latLng.lng = centerMap.lng;
    });
  }

  /**
   * This method is used to save address
   * @constructor
   */
  async SaveAddress(): Promise<void> {
    let loader = await this.commonService.Loader();
    loader.present();

    let addresses = this.Locations.filter(x => !x.InDB || x.IsEdit);

    let data = {
      CardCode: this.currentBP.CardCode,
      BPAddresses: addresses
    } as IBusinessPartners;

    this.suscription$.add(this.customerService.CreateBPAddress(data).pipe(
      finalize(() => loader.dismiss())
    ).subscribe({
      next: (callback) => {
        this.commonService.Alert(AlertType.INFO, 'Direcciones actualizadas con éxito', 'Addresses updated successfully');
        this.publisherService.publish({
          Target: PublisherVariables.BusinessPartnerMasterData,
          Data: this.currentBP,
        });
        this.router.navigate(['business-partner-master-data'], {
          replaceUrl: true,
        });
      },
      error: (error) => {
        this.commonService.alert(AlertType.ERROR, error);
        this.logManagerService.Log(LogEvent.ERROR, error);
      }
    }));
  }

  /**
   * This method is used to close modal address
   * @constructor
   */
  Dismiss(): void {
    this.publisherService.publish({
      Target: PublisherVariables.BusinessPartnerMasterData,
      Data: null
    });
    this.router.navigate(['business-partner-master-data'], {
      replaceUrl: true,
    });
  }

  /**
   * This method is used to check row with of difference color
   * @param _location model Address
   * @constructor
   */
  public GetColor(_location: IBpAddress): string {

    if (_location.AddressName === this.currentBP?.ShipToDefault || _location.AddressName === this.currentBP?.BilltoDefault) {
      return 'warning';
    }

    return 'light';
  }

  /**
   * This method is used to more records
   * @param _event model _event 
   * @returns 
   */
  public GetMoreAddress(_event: CustomEvent): void {

    if (this.recordsCount === this.Locations.filter(element=> element.InDB)?.length) {
      (_event.target as HTMLIonInfiniteScrollElement).disabled = true;
      return;
    }


    this.page++;
    this.suscription$.add(this.customerService.GetAddress(this.currentBP.CardCode, this.page).pipe(
      finalize(() => (_event.target as HTMLIonInfiniteScrollElement).complete())
    ).subscribe({
      next: (callback) => {
        if (callback.Data && callback.Data.length > 0) {
          this.Locations.push(...callback.Data.map(element => { return { ...element, InDB: true } }));
        }
      },
      error: (error) => {
        this.commonService.alert(AlertType.ERROR, error);
        this.logManagerService.Log(LogEvent.ERROR, error);
      }
    }))
  }
}
