import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertsService, CLModalType, CLToastType, ModalService, NotificationPanelService} from '@clavisco/alerts';
import {GetError, Structures} from '@clavisco/core';
import {OverlayService} from '@clavisco/overlay';
import {finalize, forkJoin, Observable, Subscription} from 'rxjs';
import {IIdDialogData} from 'src/app/interfaces/i-dialog-data';
import {ILicense} from 'src/app/interfaces/i-license';
import {LicensesService} from 'src/app/services/licenses.service';
import {CompanyService} from "../../../../services/company.service";
import {ICompany} from "../../../../interfaces/i-company";
import {IActionButton} from "@app/interfaces/i-action-button";
import {SharedService} from "@app/shared/shared.service";
import {CL_CHANNEL, ICLCallbacksInterface, Register} from "@clavisco/linker";
import {LinkerEvent} from "@app/enums/e-linker-events";

@Component({
  selector: 'app-licenses-edit',
  templateUrl: './licenses-edit.component.html',
  styleUrls: ['./licenses-edit.component.scss']
})
export class LicensesEditComponent implements OnInit {

  actionButtons: IActionButton[] = [];
  accion: string = '';
  icon: string = '';
  modalTitle!: string;
  licenseForm!: FormGroup;
  licenseInEdition: ILicense | undefined;
  passwordInputType!: 'password' | 'text';
  passwordBtnVisibilityIcon!: 'visibility' | 'visibility_off';
  allSubscriptions: Subscription;
  companies!: ICompany[];
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private licenseService: LicensesService,
    private companyService: CompanyService,
    @Inject(MAT_DIALOG_DATA) private data: IIdDialogData,
    private overlayService: OverlayService,
    private matDialogRef: MatDialogRef<LicensesEditComponent>,
    private alertsService: AlertsService,
    private modalService: ModalService
  ) {
    this.allSubscriptions = new Subscription();
  }

  ngOnInit(): void {
    this.InitVariables();
    this.SendInitRequest();
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions.unsubscribe();
  }

  InitVariables(): void {
    this.LoadLicenseForm();

    this.ReadQueryParameters();

    this.passwordInputType = 'password';
    this.passwordBtnVisibilityIcon = 'visibility_off';
    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.OnActionButtonClicked, this.callbacks);
    this.allSubscriptions.add(this.sharedService.OnActionButtonClicked(this.OnActionButtonClicked));
  }

  public OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'ADD':
        this.Save();
        break;
      case 'CANCEL':
        this.Cancel();
        break;
    }
  }

  private Cancel(): void {
    this.matDialogRef.close();
  }

  LoadLicenseForm(): void {
    this.licenseForm = this.fb.group({
      User: [null, [Validators.required]],
      Password: [null, [Validators.required]],
      CompanyId: [null, [Validators.required]],
      IsActive: [false, [Validators.required]]
    });

    if (this.data.Id) {
      this.licenseForm.get('Password')?.clearValidators();
      this.licenseForm.get('Password')?.updateValueAndValidity();
    }
  }

  /**
   * Read query parameters
   */
  ReadQueryParameters(): void {
    this.allSubscriptions.add(this.activatedRoute.queryParams.subscribe(params => {

      let isCreation: boolean = params['dialog'] === 'create';

      if (isCreation) {
        this.modalTitle = 'Creación de licencia';
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
      } else {
        this.modalTitle = 'Modificación de licencia';
        this.actionButtons = [
          {
            Key: 'ADD',
            MatIcon: 'edit',
            Text: 'Actualizar',
            MatColor: 'primary',
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

  SendInitRequest(): void {
    this.overlayService.OnGet();

    this.allSubscriptions.add(
      forkJoin({
        CompaniesRes: this.companyService.Get<ICompany[]>(true),
        LicenseRes: this.licenseService.Get<ILicense>(this.data.Id)
      })
        .pipe(
          finalize(() => this.overlayService.Drop())
        )
        .subscribe({
          next: (callback) => {
            this.alertsService.Toast({
              type: CLToastType.SUCCESS,
              message: 'Componente requeridos obtenidos'
            });
            this.licenseForm.patchValue(callback.LicenseRes.Data);
            this.companies = callback.CompaniesRes.Data;
            this.licenseInEdition = callback.LicenseRes.Data;
          },
          error: err => {
            this.alertsService.ShowAlert({HttpErrorResponse: err});
          }
        })
    );
  }


  Save(): void {
    this.overlayService.OnPost();

    let formValues: ILicense = {...this.licenseInEdition, ...this.licenseForm.value as ILicense};

    let updateOrCreate$: Observable<Structures.Interfaces.ICLResponse<ILicense>> | null = null;

    if (!this.data.Id) {
      updateOrCreate$ = this.licenseService.Post(formValues);
    } else {
      updateOrCreate$ = this.licenseService.Patch(formValues);
    }

    this.allSubscriptions.add(updateOrCreate$
      .pipe(
        finalize(() => this.overlayService.Drop())
      )
      .subscribe({
        next: (callback) => {
          this.modalService.Continue({
            title: `Licencia ${!this.data.Id ? 'creada' : 'actualizada'} correctamente`,
            type: CLModalType.SUCCESS
          });

          this.matDialogRef.close();
        },
        error: (err) => {
          this.modalService.Continue({
            title: `Se produjo un error ${!this.data.Id ? 'creando' : 'actualizando'} la licencia`,
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      }));
  }

  ChangePasswordInputType(): void {
    this.passwordInputType = this.passwordInputType === 'password' ? 'text' : 'password';
    this.passwordBtnVisibilityIcon = this.passwordBtnVisibilityIcon === 'visibility' ? 'visibility_off' : 'visibility';
  }
}
