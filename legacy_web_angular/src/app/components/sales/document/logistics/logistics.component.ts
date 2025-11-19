import { Overlay } from '@angular/cdk/overlay';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Address } from '@app/enums/enums';
import { IBPAddresses, IBusinessPartner } from '@app/interfaces/i-business-partner';
import { ICountry } from '@app/interfaces/i-country';
import { BusinessPartnersService } from '@app/services/business-partners.service';
import { CountrysService } from '@app/services/countrys.service';
import { AlertsService, CLToastType } from '@clavisco/alerts';
import { OverlayService } from '@clavisco/overlay';
import { finalize, forkJoin, of } from 'rxjs';
import { AddressDatailsComponent } from './address-datails/address-datails.component';

@Component({
  selector: 'app-logistics',
  templateUrl: './logistics.component.html',
  styleUrls: ['./logistics.component.scss']
})
export class LogisticsComponent implements OnInit, OnChanges {

  @Input('businessPartner') businessPartner!: IBusinessPartner | null;
  
  @Input('isPermissionChangeAdressardCode') isPermissionChangeAdress: boolean = false;

  @Input('preloadedShipCode') preloadedShipCode: string = '';

  @Output() selectedAddress: EventEmitter<any> = new EventEmitter<any>();

  adresses: IBPAddresses[] = [];
  addressSeleccted!: IBPAddresses;
  countries: ICountry[] = [];

  constructor(private businessPartnersService: BusinessPartnersService,
              private alertsService: AlertsService,
              private overlayService: OverlayService,
              private countryService: CountrysService,
              private matDialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.LoadInitialData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.addressSeleccted = {} as IBPAddresses;
    this.adresses = [];
    
    const bpChange = changes['businessPartner'];
    if (bpChange?.currentValue && Object.keys(bpChange?.currentValue)?.length > 0  && !bpChange.firstChange && bpChange.currentValue != bpChange.previousValue) {
      this.LoadAddress();
    }
  }

  /**
   * This method loads the initial data required for the component.
   */
  LoadInitialData(): void {
    this.overlayService.OnGet();

    forkJoin({
      adresses: this.businessPartner?.CardCode ? this.businessPartnersService.GetBPDeliveryAddress(this.businessPartner?.CardCode, Address.SHIL): of(null),
      countrys: this.countryService.GetCountrys()
    }).pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (response) => {
          this.adresses = response.adresses?.Data || [];
          this.countries = response.countrys.Data || [];

          let shipToCodeDefault = this.preloadedShipCode || this.businessPartner?.ShipToDefault;

          this.addressSeleccted = this.adresses.find(address => address.AddressName == shipToCodeDefault) as IBPAddresses;
          this.SelectAdress({ value: this.addressSeleccted });
        },
        error: (error) => {
          this.alertsService.Toast({
            type: CLToastType.ERROR,
            message: error
          });
        }
      });

  }

  /**
   * This method fetches the delivery addresses for the business partner and sets the selected address.
   */
  LoadAddress(): void {
    
    if(!this.businessPartner?.CardCode) return;
    this.overlayService.OnGet();
    this.businessPartnersService.GetBPDeliveryAddress(this.businessPartner?.CardCode, Address.SHIL)
      .pipe(finalize(()=> this.overlayService.Drop()) )
      .subscribe({
        next: (response) => {
          this.adresses = response.Data || [];
          this.addressSeleccted = this.adresses.find(address => address.AddressName == this.businessPartner?.ShipToDefault) as IBPAddresses;
          this.SelectAdress({ value: this.addressSeleccted });
        },
        error: (error) => {
          this.alertsService.Toast({
                    type: CLToastType.ERROR,
                    message: error
                  });
        }
      });
  }

  /**
   * Get address details to show in the UI
   * @returns Address details as a formatted string
   */
  GetAdressDetails(): string {
    let country: string = this.countries.find(c => c.Code == this.addressSeleccted?.Country)?.Name || '';
    let zipCode = this.addressSeleccted?.ZipCode ? `${this.addressSeleccted.ZipCode} ` : '';
    return this.addressSeleccted
      ? `${this.addressSeleccted.Street || ''}\n\n${zipCode}${this.addressSeleccted.City||''}\n${country}`
      : '';
  }

  /**
   * Emit select address from the list
   * @param address Select address
   */
  SelectAdress(address: any): void {
    this.addressSeleccted = address.value as IBPAddresses;
    this.selectedAddress.emit(address.value as IBPAddresses);
  }

  /**
   * Open modal with address details
   */
  OpenAddressDetailsModal(): void {

    if(!this.addressSeleccted) return

    this.matDialog.open(AddressDatailsComponent, {
      id: 'address-details-modal',
      height: 'auto',
      minWidth:'30vw',
      disableClose: true,
      autoFocus: false,
      data: {
        ...this.addressSeleccted,
        Country: this.countries.find(c => c.Code == this.addressSeleccted?.Country)?.Name || ''
      } as IBPAddresses
    })

  }
}
