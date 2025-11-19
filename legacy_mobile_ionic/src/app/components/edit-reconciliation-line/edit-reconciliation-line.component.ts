import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from "@ionic/angular";
import {IInvoiceOpen} from "../../interfaces/i-invoice-payment";
import {FormControl, FormGroup} from "@angular/forms";
import {CommonService} from "../../services";
import {formatDate} from "@angular/common";

@Component({
  selector: 'app-edit-reconciliation-line',
  templateUrl: './edit-reconciliation-line.component.html',
  styleUrls: ['./edit-reconciliation-line.component.scss'],
})
export class EditReconciliationLineComponent implements OnInit {

  @Input('lineEdit')  lineEdit: IInvoiceOpen;
  @Input('editPay')  editPay: boolean;

  documentForm: FormGroup;
  constructor(private modalController: ModalController,
              private commonService: CommonService) { }

  ngOnInit() {
    this.LoadForm();
    this.LoadInitialData();
  }

  LoadForm(): void {
    this.documentForm = new FormGroup({
      ClientName: new FormControl(''),
      DocumentType: new FormControl(''),
      DocNum: new FormControl(''),
      DocDate: new FormControl(''),
      DocDueDate: new FormControl(''),
      DocCurrency: new FormControl(''),
      TotalShow: new FormControl(0),
      SaldoShow: new FormControl(0),
      Pago: new FormControl(0),
    });
  }

  /**
   * This method is used load initial data
   * @constructor
   * @private
   */
  LoadInitialData() {
    this.documentForm.patchValue({
      ...this.lineEdit,
      ClientName: `${this.lineEdit.CardCode} - ${this.lineEdit.CardName}`,
      DocDate: formatDate(this.lineEdit.DocDate, 'dd/MM/yyyy h:mm a', 'en'),
      DocDueDate: formatDate(this.lineEdit.DocDueDate, 'dd/MM/yyyy h:mm a', 'en')
    })
  }
  
  /**
   * This method validate inputs fields
   * @constructor
   */
  ValidateFields() {
    let docForm : IInvoiceOpen = this.documentForm.getRawValue();
    
    if (docForm.Pago > docForm.SaldoShow) {
      this.commonService.toast(this.commonService.Translate('El monto ingresado no puede ser mayor al saldo del documento', 'The amount entered cannot be greater than the balance of the document'), 'dark', 'bottom');
      return;
    }

    if (docForm.Pago && docForm.Pago > 0) {
      this.lineEdit.Pago = docForm.Pago;
    }
    
    this.Dismiss();
  }

  
  /**
   * This method is used to close modal
   * @constructor
   */
  Dismiss() {
    this.modalController.dismiss(this.lineEdit);
  }


}
