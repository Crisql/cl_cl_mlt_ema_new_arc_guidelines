import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {
  AlertsService, CLModalType,
  CLNotificationType, CLToastType, ModalService,
  NotificationPanelService
} from '@clavisco/alerts';
import {GetError, Structures} from '@clavisco/core';
import {OverlayService} from '@clavisco/overlay';
import {finalize, forkJoin, Observable, of, Subscription} from 'rxjs';
import {IUserDialogData} from 'src/app/interfaces/i-dialog-data';
import {IUser} from 'src/app/interfaces/i-user';
import {UserService} from 'src/app/services/user.service';
import {IStructures} from "@app/interfaces/i-structures";
import {StructuresService} from "@app/services/structures.service";
import {animate, state, style, transition, trigger} from '@angular/animations';
import {IActionButton} from "@app/interfaces/i-action-button";
import {SharedService} from "@app/shared/shared.service";

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
  animations: [
    trigger('slideIn', [
      state('*', style({'overflow-y': 'hidden'})),
      state('void', style({'overflow-y': 'hidden'})),
      transition('* => void', [
        style({height: '*'}),
        animate(250, style({height: 0}))
      ]),
      transition('void => *', [
        style({height: '0'}),
        animate(250, style({height: '*'}))
      ])
    ])
  ]
})

export class UserEditComponent implements OnInit, OnDestroy {

  accion: string = '';
  icon: string = '';
  modalTitle!: string;
  routeQueryParams$!: Subscription;
  userForm!: FormGroup;
  userInEdition: IUser | undefined;
  passwordInputType!: 'password' | 'text';
  passwordBtnVisibilityIcon!: 'visibility' | 'visibility_off';
  emailPasswordInputType!: 'password' | 'text';
  emailPasswordBtnVisibilityIcon!: 'visibility' | 'visibility_off';
  emailsTypes: IStructures[] = [];
  actionButtons: IActionButton[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private userService: UserService,
    private structuresService: StructuresService,
    @Inject(MAT_DIALOG_DATA) private data: IUserDialogData,
    private overlayService: OverlayService,
    private matDialogRef: MatDialogRef<UserEditComponent>,
    private alertsService: AlertsService,
    private modalService: ModalService,
    private sharedService: SharedService
  ) {
  }

  ngOnInit(): void {
    this.InitVariables();
    this.SendInitRequest();
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.routeQueryParams$.unsubscribe();
  }

  public InitVariables(): void {
    this.LoadUserForm();

    this.ReadQueryParameters();

    this.passwordInputType = 'password';
    this.passwordBtnVisibilityIcon = 'visibility_off';
    this.emailPasswordInputType = 'password';
    this.emailPasswordBtnVisibilityIcon = 'visibility_off';
  }

  public LoadUserForm(): void {
    this.userForm = this.fb.group({
      Name: [null, [Validators.required, Validators.maxLength(70)]],
      LastName: [null, [Validators.required, Validators.maxLength(70)]],
      Email: [null, [Validators.required, Validators.maxLength(150), Validators.email]],
      Password: [null, [Validators.required, Validators.minLength(8), Validators.maxLength(150)]],
      IsActive: [false, [Validators.required]],
      EmailType: [''],
      UseScheduling: [false],
      SchedulingEmail: [''],
      EmailPassword: ['']
    });

    this.userForm.get('UseScheduling')?.valueChanges
      .subscribe({
        next: (value) => {
          if (value) {
            this.userForm.get('EmailPassword')?.clearValidators();

            if (!this.data.UserId) {
              this.userForm.get('EmailType')?.clearValidators();

              this.userForm.get('EmailPassword')?.addValidators(Validators.required);
              this.userForm.get('EmailType')?.addValidators(Validators.required);
              this.userForm.get('SchedulingEmail')?.addValidators(Validators.required);

              this.userForm.get('EmailPassword')?.updateValueAndValidity();
              this.userForm.get('EmailType')?.updateValueAndValidity();
              this.userForm.get('SchedulingEmail')?.updateValueAndValidity();
            }
          } else {
            if (!this.data.UserId) {
              this.userForm.get('EmailPassword')?.clearValidators();
              this.userForm.get('EmailType')?.clearValidators();
              this.userForm.get('SchedulingEmail')?.clearValidators();

              this.userForm.get('EmailPassword')?.updateValueAndValidity();
              this.userForm.get('EmailType')?.updateValueAndValidity();
              this.userForm.get('SchedulingEmail')?.updateValueAndValidity();
            }
          }
        }
      });

    if (this.data.UserId) {
      this.userForm.get('Password')?.clearValidators();
      this.userForm.get('Password')?.addValidators(Validators.maxLength(150));
      this.userForm.get('Password')?.addValidators(Validators.minLength(8));
      this.userForm.get('Password')?.updateValueAndValidity();
    }
  }

  /**
   * Read query parameters
   */
  public ReadQueryParameters(): void {
    this.routeQueryParams$ = this.activatedRoute.queryParams.subscribe(params => {

      let isCreation: boolean = params['dialog'] === 'create';

      if (isCreation) {
        this.modalTitle = 'Creación de usuario';
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
        ];
      } else {
        this.modalTitle = 'Modificación de usuario';
        this.actionButtons = [
          {
            Key: 'ADD',
            Text: 'Actualizar',
            MatIcon: 'edit',
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
    });
  }

  public SendInitRequest(): void {
    this.overlayService.OnGet();

    forkJoin({
      EmailTypes: this.structuresService.Get('EmailTypes'),
      User: this.data.UserId ? this.userService.Get<IUser>(false, this.data.UserId) : of({} as Structures.Interfaces.ICLResponse<IUser>)
    }).pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (responses) => {
          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });
          this.emailsTypes = responses.EmailTypes.Data;
          this.userInEdition = responses.User.Data;

          if (this.userInEdition)
            this.userForm.patchValue({...this.userInEdition, EmailType: this.userInEdition.EmailType.toString()});
        },
        error: err => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      });
  }

  public OnActionButtonClicked(_event: IActionButton): void {
    switch (_event.Key) {
      case 'ADD':
        this.SaveUser();
        break;
      case 'CANCEL':
        this.matDialogRef.close();
        break;
    }
  }

  private SaveUser(): void {
    this.overlayService.OnPost();

    let formUser: IUser = {...this.userInEdition, ...this.userForm.value as IUser};

    let updateOrCreate$: Observable<Structures.Interfaces.ICLResponse<IUser>> | null = null;

    if (!this.data.UserId) {
      updateOrCreate$ = this.userService.Post(formUser);
    } else {
      updateOrCreate$ = this.userService.Patch(formUser);
    }

    updateOrCreate$
      .pipe(
        finalize(() => this.overlayService.Drop())
      )
      .subscribe({
        next: (callback) => {
          this.modalService.Continue({
            title: `Usuario ${!this.data.UserId ? 'creado' : 'actualizado'} correctamente`,
            type: CLModalType.SUCCESS
          });
          this.matDialogRef.close();
        },
        error: (err) => {
          this.modalService.Continue({
            title: `Se produjo un error ${!this.data.UserId ? 'creando' : 'actualizando'} el usuario`,
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      });
  }

  public ChangePasswordInputType(): void {
    this.passwordInputType = this.passwordInputType === 'password' ? 'text' : 'password';
    this.passwordBtnVisibilityIcon = this.passwordBtnVisibilityIcon === 'visibility' ? 'visibility_off' : 'visibility';
  }

  public ChangeEmailPasswordInputType(): void {
    this.emailPasswordInputType = this.emailPasswordInputType === 'password' ? 'text' : 'password';
    this.emailPasswordBtnVisibilityIcon = this.emailPasswordBtnVisibilityIcon === 'visibility' ? 'visibility_off' : 'visibility';
  }

}
