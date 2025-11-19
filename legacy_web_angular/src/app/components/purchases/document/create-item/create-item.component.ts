import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {IItemMasterData, ItemPrice} from "@app/interfaces/i-items";
import {finalize, Observable} from "rxjs";
import {GetError, Structures} from "@clavisco/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SharedService} from "@app/shared/shared.service";
import {LinkerService} from "@clavisco/linker";
import {OverlayService} from "@clavisco/overlay";
import {AlertsService, CLModalType, ModalService} from "@clavisco/alerts";
import {ItemsService} from "@app/services/items.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ItemPriceService} from "@app/services/item-price.service";
import {BarcodesService} from "@app/services/barcodes.service";
import {MasterDataService} from "@app/services/master-data.service";
import {ICreateItemDialogData} from "@app/interfaces/i-dialog-data";
import {IPriceList} from "@app/interfaces/i-price-list";
import {ITaxe} from "@app/interfaces/i-taxe";
import {ItemBarCodeCollection} from "@app/interfaces/i-barcode";
import {IActionButton} from "@app/interfaces/i-action-button";

@Component({
  selector: 'app-create-item',
  templateUrl: './create-item.component.html',
  styleUrls: ['./create-item.component.scss']
})
export class CreateItemComponent implements OnInit, OnDestroy {
  itemForm!: FormGroup;
  isWithBarCode: boolean = true;
  taxes: ITaxe[] = [];
  PriceList!: IPriceList;
  actionButtons: IActionButton[] = [];

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private overlayService: OverlayService,
    private itemService: ItemsService,
    @Inject(MAT_DIALOG_DATA) public data: ICreateItemDialogData,
    private matDialogRef: MatDialogRef<CreateItemComponent>,
    private modalService: ModalService
  ) {
  }

  ngOnInit(): void {
    this.LoadForm();
    this.taxes = this.data.Taxes;
    this.itemForm.patchValue({BarCode: this.data.BarCode});
    this.isWithBarCode = this.data.IsWithBarCode;
    this.PriceList = this.data.PriceList;
    this.actionButtons = [
      {
        Key: 'ADD',
        Text: 'Crear',
        MatIcon: 'save',
        MatColor: 'primary',
        DisabledIf: (_form) => _form?.invalid || false
      },
      {
        Key: 'CANCEL',
        Text: 'Cancelar',
        MatIcon: 'cancel',
        MatColor: 'primary'
      }
    ]

  }

  LoadForm(): void {
    this.itemForm = this.fb.group({
      ItemCode: [''],
      ItemName: ['', [Validators.required]],
      UnitPrice: [''],
      U_IVA: [''],
      ForeignName: [''],
      BarCode: [''],
      PriceList: ['']
    });
  }

  public OnActionButtonClicked(_event: IActionButton): void {
    switch (_event.Key) {
      case 'ADD':
        this.Save();
        break;
      case 'CANCEL':
        this.matDialogRef.close();
        break;
    }
  }

  Save(): void {
    let priceList: ItemPrice[] = [];
    priceList.push({
      Currency: this.PriceList.PrimCurr,
      PriceList: this.PriceList.ListNum,
      Price: +this.itemForm.controls['UnitPrice'].value,
    });

    let barcodeList: ItemBarCodeCollection[] = [];
    barcodeList.push({
      Id: 0,
      Barcode: this.itemForm.controls['BarCode'].value,
      FreeText: this.itemForm.controls['BarCode'].value,
      UoMEntry: -1,
      AbsEntry: -1
    });

    this.overlayService.OnPost();

    let item = this.itemForm.getRawValue() as IItemMasterData;
    item.ItemBarCodeCollection = barcodeList;
    item.ItemPrices = priceList;
    item.BarCode = '';


    this.itemService.Post(item)
      .pipe(
        finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: (callback) => {
        if (callback.Data) {
          this.modalService.Continue({
            type: CLModalType.SUCCESS,
            title: 'Ítem creado correctamente'
          })
          this.matDialogRef.close(callback.Data);
        }
      },
      error: (err) => {
        this.modalService.Continue({
          title: 'Se produjo un error creando el ítem',
          subtitle: GetError(err),
          type: CLModalType.ERROR
        });
      }
    });

  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
  }

}
