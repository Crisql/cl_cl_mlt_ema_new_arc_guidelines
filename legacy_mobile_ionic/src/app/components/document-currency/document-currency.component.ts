import { Component, Input, OnInit } from "@angular/core";
import { PopoverController } from "@ionic/angular";
import {filter, finalize} from "rxjs/operators";
import { PublisherVariables } from "src/app/common/enum";
import { PermissionsSelectedModel } from "src/app/models";
import { IDocumentCurrencyComponentInputData } from "src/app/models/db/i-modals-data";
import { PermissionService, PriceListService, CommonService, PublisherService } from "src/app/services";
import { IPriceListInfo } from '../../models/db/i-price-list-info';

@Component({
  selector: "app-document-currency",
  templateUrl: "./document-currency.component.html",
  styleUrls: ["./document-currency.component.scss"],
})
export class DocumentCurrencyComponent implements OnInit {
  permissions: PermissionsSelectedModel[];
  G_ChangeDocPriceList: boolean;
  @Input("data") data: IDocumentCurrencyComponentInputData;
  priceListInfo: IPriceListInfo[];

  constructor(
    private popoverController: PopoverController,
    private priceListService: PriceListService,
    private permissionService: PermissionService,
    private commonService: CommonService,
    private publisherService: PublisherService,
  ) {}

  ngOnInit() {
    this.GetPermissions();
    this.priceListInfo = [];
    this.GetPriceListCurr();
  }

  SetPermissionVariables(): void
  {
    this.G_ChangeDocPriceList = this.permissions.some(p => p.Name === 'M_Sales_Documents_EditPriceList');
  }
  
  async GetPermissions()
  {
    
    const storagePermissions = [...this.permissionService.Permissions];//this.localStorageService.get(LocalStorageVariables.PermList);

    if(!storagePermissions) 
    {
      this.permissions = [];
      return;
    }

    this.permissions = storagePermissions as PermissionsSelectedModel[];

    this.SetPermissionVariables();
    
    this.publisherService.getObservable()
    .pipe(
      filter(p => p.Target === PublisherVariables.Permissions),
    )
    .subscribe({
      next: (callback) => {
        if(callback)
        {
          this.permissions = [...this.permissionService.Permissions];
          this.SetPermissionVariables();
        } 
      }
    });
  }

  async GetPriceListCurr() {
    let loader = await this.commonService.Loader();
    loader.present();
    this.priceListService
    .GetPriceListsInfo()
        .pipe(finalize(()=> loader.dismiss()))
      .subscribe(next => {
        if (next.Data) {
          this.priceListInfo = next.Data;
        } else {
          console.error(next.Message);
        }
      }, error => {
        console.error(error);
      })
  }

  PriceListSelected(_priceListInfo: IPriceListInfo){
    if(!this.G_ChangeDocPriceList && _priceListInfo.ListNum !== this.data.listNum)
    {
      let message = this.commonService.Translate('No tienes permisos para cambiar la lista de precios del documento','You do not have permissions to change the price list of the document')
      this.commonService.toast(message, 'dark', 'bottom');
      return;
    }
    this.popoverController.dismiss(_priceListInfo);
  }
}
