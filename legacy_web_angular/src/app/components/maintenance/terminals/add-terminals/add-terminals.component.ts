import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ITerminalsDialogData} from "../../../../interfaces/i-dialog-data";
import {ITerminals} from "../../../../interfaces/i-terminals";
import {ActivatedRoute, Router} from "@angular/router";
import {finalize, Observable, Subscription} from "rxjs";
import {OverlayService} from "@clavisco/overlay";
import {TerminalsService} from "../../../../services/terminals.service";
import {AlertsService, CLModalType, CLToastType, ModalService} from "@clavisco/alerts";
import {CLPrint, GetError, Structures} from "@clavisco/core";
import {ICurrencies} from "@app/interfaces/i-currencies";
import {IActionButton} from "@app/interfaces/i-action-button";
import {CL_CHANNEL, ICLCallbacksInterface, Register, Run, StepDown} from "@clavisco/linker";
import {LinkerEvent} from "@app/enums/e-linker-events";
import {SharedService} from "@app/shared/shared.service";

@Component({
  selector: 'app-add-terminals',
  templateUrl: './add-terminals.component.html',
  styleUrls: ['./add-terminals.component.scss']
})
export class AddTerminalsComponent implements OnInit, OnDestroy {

  /*formularios*/
  frmTerminals!: FormGroup;

  /*string*/
  modalTitle: string = 'Agregar terminal';
  accion: string = '';
  icon: string = '';

  /*Observables*/
  allSubscriptions: Subscription;

  /*Modelos*/
  terminal!: ITerminals;

  /*listas*/
  currencies: ICurrencies[] = [];
  actionButtons: IActionButton[] = [];

  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddTerminalsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ITerminalsDialogData,
    private overlayService: OverlayService,
    private terminalService: TerminalsService,
    private alertsService: AlertsService,
    private modalService: ModalService,
    private sharedService: SharedService
  ) {
    this.allSubscriptions = new Subscription();
    this.currencies = this.data.Currencies;
  }

  ngOnInit(): void {
    this.OnLoad();
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions.unsubscribe();
  }

  /**
   * SE EJECUTA AL INICIAR EL COMPONENTE
   * @private
   */
  private OnLoad(): void {
    this.initForm();
    this.readQueryParameters();
    this.SendInitRequest();
    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.OnActionButtonClicked, this.callbacks);
    this.allSubscriptions.add(this.sharedService.OnActionButtonClicked(this.OnActionButtonClicked));
  }

  /**
   * INICIALIZA EL FORMULARIO
   * @private
   */
  private initForm(): void {
    this.frmTerminals = this.fb.group({
      TerminalCode: ['', [Validators.required]],
      Description: ['', [Validators.required]],
      Currency: ['', [Validators.required]],
      QuickPayAmount: [0, [Validators.required]],
      Password: [''],
      IsActive: [false]
    })
  }

  public OnActionButtonClicked(_event: IActionButton): void {
    switch (_event.Key) {
      case 'ADD':
        this.Save();
        break;
      case 'CANCEL':
        this.Cancel();
        break;
    }
  }

  /**
   * GUARDA O ACTUALIZA LOS DATOS
   */
  public Save(): void {
    this.overlayService.OnPost();

    let formValues: ITerminals = {...this.terminal, ...this.frmTerminals.value as ITerminals};

    let updateOrCreate$: Observable<Structures.Interfaces.ICLResponse<ITerminals>> | null = null;

    if (!this.data.Id) {
      updateOrCreate$ = this.terminalService.Post(formValues);
    } else {
      updateOrCreate$ = this.terminalService.Patch(formValues);
    }

    this.allSubscriptions.add(updateOrCreate$
      .pipe(
        finalize(() => this.overlayService.Drop())
      )
      .subscribe({
        next: (callback) => {
          this.modalService.Continue({
            title: `Terminal ${!this.data.Id ? 'creada' : 'actualizada'} correctamente`,
            type: CLModalType.SUCCESS
          });
          this.dialogRef.close();
        },
        error: (err) => {
          this.modalService.Continue({
            title: `Se produjo un error ${!this.data.Id ? 'creando' : 'actualizando'} la terminal`,
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      }));
  }

  /**
   * CIERRA EL MODAL
   */
  public Cancel(): void {
    this.dialogRef.close();
  }

  /**
   * REDIRECCIONAR
   * @private
   */
  private readQueryParameters(): void {
    this.allSubscriptions.add(this.activatedRoute.queryParams.subscribe(params => {

      let isCreation: boolean = params['dialog'] === 'create';

      if (isCreation) {
        this.modalTitle = 'Creación de terminal';
        this.actionButtons = [
          {
            Key: 'ADD',
            MatIcon: 'save',
            Text: 'Crear',
            MatColor: 'primary',
            DisabledIf: (_form?: FormGroup) => _form?.invalid || false
          },
          {
            Key: 'CANCEL',
            MatIcon: 'cancel',
            Text: 'Cancelar',
            MatColor: 'primary'
          }
        ]
        const passwordControl = this.frmTerminals.get('Password');
        passwordControl?.setValidators([Validators.required]);
        passwordControl?.updateValueAndValidity();
      } else {
        this.modalTitle = 'Modificación de terminal';
        this.actionButtons = [
          {
            Key: 'ADD',
            MatIcon: 'edit',
            Text: 'Actualizar',
            MatColor: 'primary',
            DisabledIf: (_form?: FormGroup) => _form?.invalid || false
          },
          {
            Key: 'CANCEL',
            MatIcon: 'cancel',
            Text: 'Cancelar',
            MatColor: 'primary'
          }
        ]
      }
    }));
  }

  /**
   * CARGA INICIAL DE LOS DATOS
   * @private
   */
  private SendInitRequest(): void {

    if (this.data.Id > 0) {

      this.overlayService.OnGet();

      this.allSubscriptions.add(this.terminalService.Get<ITerminals>(this.data.Id)
        .pipe(finalize(() => this.overlayService.Drop()))
        .subscribe({
          next: (callback) => {
            this.alertsService.Toast({
              type: CLToastType.SUCCESS,
              message: 'Componentes requeridos obtenidos'
            });
            this.frmTerminals.patchValue(callback.Data);
            this.terminal = callback.Data;
          },
          error: err => {
            this.alertsService.ShowAlert({HttpErrorResponse: err});
          }
        }));
    }
  }


}
