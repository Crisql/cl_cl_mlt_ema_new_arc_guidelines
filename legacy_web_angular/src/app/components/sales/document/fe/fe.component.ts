import {Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {OverlayService} from "@clavisco/overlay";
import {AlertsService, CLToastType, NotificationPanelService} from "@clavisco/alerts";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {regexEmail} from "@app/interfaces/i-constants";
import {finalize, Subscription} from "rxjs";
import {IFeData, IPadron} from "@app/interfaces/i-padron";
import {PadronService} from "@app/services/padron.service";
import {CL_CHANNEL, ICLCallbacksInterface, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {LinkerEvent} from "@app/enums/e-linker-events";
import {CLPrint, Structures} from "@clavisco/core";
import {IActionButton} from "@app/interfaces/i-action-button";
import {SharedService} from "@app/shared/shared.service";
import {IStructures} from "@app/interfaces/i-structures";
import {StructuresService} from "@app/services/structures.service";


@Component({
  selector: 'app-fe',
  templateUrl: './fe.component.html',
  styleUrls: ['./fe.component.scss']
})
export class FeComponent implements OnInit, OnDestroy {

  /*FORMULARIOS*/
  feForm!: FormGroup;

  /*Objects*/
  feData!: IFeData;
  dataPadron!: IPadron;


  TypeIdentification: IStructures[] = [];
  actionButtons: IActionButton[] = [];
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  allSubscriptions!: Subscription;

  constructor(
    private fb: FormBuilder,
    private overlayService: OverlayService,
    private alertsService: AlertsService,
    private matDialogRef: MatDialogRef<FeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IFeData,
    private padronService: PadronService,
    private sharedService: SharedService,
    private structuresService: StructuresService,
    private notificationService: NotificationPanelService,
    @Inject('LinkerService') private linkerService: LinkerService,
  ) {
    this.allSubscriptions = new Subscription();
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions.unsubscribe();
  }

  ngOnInit(): void {
    this.OnLoad();
  }

  private OnLoad(): void {
    this.InitForm();
    this.LoadInitialData();

    if (this.data) {
      this.feData = this.data;
      this.feForm.patchValue(this.data);
    }

    this.actionButtons = [
      {
        Key: 'ACEPTAR',
        MatIcon: 'check_circle',
        Text: 'Aceptar',
        MatColor: 'primary',
        DisabledIf: (_form?: FormGroup) => _form?.invalid || false
      },
      {
        Key: 'CANCELAR',
        MatIcon: 'cancel',
        Text: 'Cancelar',
        MatColor: 'primary'
      }
    ];

    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.OnActionButtonClicked, this.callbacks);

    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );
  }

  private LoadInitialData(): void {
    this.overlayService.OnGet();
    this.structuresService.Get('TypeIdentification').pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: callback => {
        this.TypeIdentification = callback.Data;
        if (!this.feData) {
          this.feForm.controls['IdType'].setValue(this.TypeIdentification.find(ds => ds.Default)?.Key || '');
        }

        this.alertsService.Toast({
          type: CLToastType.SUCCESS,
          message: 'Componentes requeridos obtenidos'
        });
      },
      error: err => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });
  }

  public OnActionButtonClicked(_actionButton: IActionButton): void {

    switch (_actionButton.Key) {
      case 'ACEPTAR':
        this.SaveChanges();
        break;
      case 'CANCELAR':
        this.matDialogRef.close();
        break;
    }
  }

  private InitForm(): void {
    this.feForm = this.fb.group({
      IdType: ['', [Validators.required]],
      Identification: ['', [Validators.required]],
      Email: ['', [Validators.required, Validators.pattern(regexEmail)]]
    });
  }

  public GetPadron(): void {
    if(this.feData.EditDocument){ return;}
    if (!this.data.ConsultFE){
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'Consulta FE deshabilitada.'
      });
      return;
    }

    let identificacion: number = this.feForm.controls['Identification'].value;

    if (!identificacion) {
      this.alertsService.ShowAlert({closeText: ''});
      return;
    }

    this.overlayService.OnGet();
    this.padronService.Get<string>(identificacion)
      .pipe(
        finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: callback => {

          if (callback) {

            this.dataPadron = callback as IPadron;

            if (this.dataPadron) {

              this.feForm.controls['IdType'].setValue(this.dataPadron.tipoIdentificacion);
              let valueForm = this.feForm.value;
              this.feData = {
                IdType: valueForm.IdType,
                Identification: valueForm.Identification,
                Email: valueForm.Email,
                Nombre: this.dataPadron.nombre
              } as IFeData;

              if (this.feForm.valid) {
                this.matDialogRef.close(this.feData);
              }
            }
          }

          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });
        },
        error: err => {
          this.alertsService.ShowAlert({
            HttpErrorResponse: err
          });
        }
      });
  }

  private SaveChanges(): void {
    let valueForm = this.feForm.value;
    if (!this.dataPadron && this.feData) {
      this.feData.IdType = valueForm.IdType;
      this.feData.Identification = valueForm.Identification;
      this.feData.Email = valueForm.Email;
    } else {
      this.feData = {
        IdType: valueForm.IdType,
        Identification: valueForm.Identification,
        Email: valueForm.Email,
        Nombre: this.dataPadron.nombre
      }as IFeData;
    }
    this.matDialogRef.close(this.feData);
  }


}
