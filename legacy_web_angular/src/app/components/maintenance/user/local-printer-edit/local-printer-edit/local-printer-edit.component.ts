import {Component, Inject, OnInit} from '@angular/core';
import {Observable, Subscription} from "rxjs";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {IActionButton} from "@app/interfaces/i-action-button";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {OverlayService} from "@clavisco/overlay";
import {AlertsService, CLModalType, CLToastType, ModalService} from "@clavisco/alerts";
import {finalize} from "rxjs/operators";
import {GetError, Structures} from "@clavisco/core";
import {ILocalPrinter} from "@app/interfaces/i-local-printer";
import {LocalPrinterService} from "@app/services/local-printer.service";
import {IUserAssingDialogData} from "@app/interfaces/i-dialog-data";

@Component({
  selector: 'app-local-printer-edit',
  templateUrl: './local-printer-edit.component.html',
  styleUrls: ['./local-printer-edit.component.scss']
})
export class LocalPrinterEditComponent implements OnInit {


  accion: string = '';
  icon: string = '';
  modalTitle!: string;
  allSubscriptions$!: Subscription;
  localPrinterForm!: FormGroup;

  isEditUserLocalPrinter = false;
  actionButtons: IActionButton[] = [];


  constructor(
    private fb: FormBuilder,
    private localPrinterService: LocalPrinterService,
    @Inject(MAT_DIALOG_DATA) private data: IUserAssingDialogData,
    private overlayService: OverlayService,
    private matDialogRef: MatDialogRef<LocalPrinterEditComponent>,
    private alertsService: AlertsService,
    private modalService: ModalService
  ) {
    this.allSubscriptions$ = new Subscription();
  }


  ngOnInit(): void {
    this.InitVariables();
    this.SendInitRequest();
  }

  ngOnDestroy(): void {
    this.allSubscriptions$.unsubscribe();
  }

  InitVariables(): void {
    this.LoadForm();
    this.modalTitle = 'Configuración impresión';
    this.actionButtons = [
      {
        Key: 'ADD',
        Text: 'Guardar',
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
    ];
  }

  LoadForm(): void {
    this.localPrinterForm = this.fb.group({
      UserAssingId: [this.data.UserAssingId],
      UseLocalPrint: [false, [Validators.required]],
      PortServicePrintMethod: [null],
      PrinterName: [null],
    });
  }


  SendInitRequest(): void {
    this.overlayService.OnGet();

    this.allSubscriptions$.add(
      this.localPrinterService.Get<ILocalPrinter>(this.data.UserAssingId).pipe(
        finalize(() => this.overlayService.Drop())
      ).subscribe({
          next: (callback) => {
            if(callback && callback.Data) {
              this.localPrinterForm.patchValue(callback?.Data);
              this.isEditUserLocalPrinter = callback.Data?.UserAssingId > 0;
            }
            this.alertsService.Toast({
              type: CLToastType.SUCCESS,
              message: 'Componentes requeridos obtenidos'
            });
          },
          error: err => {
            this.alertsService.ShowAlert({HttpErrorResponse: err});
          }
        })
    );

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
  public OnSlideToggleChangePrintMethod(): void {

    if (!this.localPrinterForm.get('UseLocalPrint')?.value) {
      this.localPrinterForm.controls['PrinterName'].setValue(null);
      this.localPrinterForm.controls['PortServicePrintMethod'].setValue(null);
    }
  }

  Save(): void {

    if (this.localPrinterForm.get('UseLocalPrint')?.value && !this.localPrinterForm.controls['PortServicePrintMethod'].value) {
      this.alertsService.Toast({
        message: `Seleccione URL del servicio de impresora local`,
        type: CLToastType.INFO
      });
      return;
    }

    this.overlayService.OnPost();

    let updateOrCreate$: Observable<Structures.Interfaces.ICLResponse<ILocalPrinter>> | null = null;

    if (!this.isEditUserLocalPrinter) {
      updateOrCreate$ = this.localPrinterService.Post(this.localPrinterForm.getRawValue());
    } else {
      updateOrCreate$ = this.localPrinterService.Patch(this.localPrinterForm.getRawValue());
    }

    this.allSubscriptions$.add(updateOrCreate$
      .pipe(
        finalize(() => this.overlayService.Drop())
      )
      .subscribe({
        next: (callback) => {
          this.modalService.Continue({
            title: `Configuración impresoras ${!this.isEditUserLocalPrinter ? 'creada' : 'actualizada'} correctamente`,
            type: CLModalType.SUCCESS
          });

          this.matDialogRef.close();
        },
        error: (err) => {
          this.modalService.Continue({
            title: `Se produjo un error ${!this.isEditUserLocalPrinter ? 'creando' : 'actualizando'} la configuración de impresoras`,
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      }));
  }

}
