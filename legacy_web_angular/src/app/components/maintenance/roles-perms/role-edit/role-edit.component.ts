import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {
  AlertsService,
  CLModalType,
  CLNotificationType,
  CLToastType,
  ModalService,
  NotificationPanelService
} from '@clavisco/alerts';
import {OverlayService} from '@clavisco/overlay';
import {finalize, Observable, Subscription} from 'rxjs';
import {IRole, IPermission} from 'src/app/interfaces/i-roles';
import {IIdDialogData} from 'src/app/interfaces/i-dialog-data';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {RoleService} from 'src/app/services/role.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {SharedService} from 'src/app/shared/shared.service';
import {PermissionService} from 'src/app/services/permission.service';
import {IPermissionType} from 'src/app/interfaces/i-permission-type';
import {GetError, Structures} from '@clavisco/core';
import {IActionButton} from "@app/interfaces/i-action-button";


@Component({
  selector: 'app-role-edit',
  templateUrl: './role-edit.component.html',
  styleUrls: ['./role-edit.component.scss']
})

export class RoleEditComponent implements OnInit, OnDestroy {

  actionButtons: IActionButton[] = [];
  accion: string = '';
  icon: string = '';
  modalTitle!: string;
  routeQueryParams$!: Subscription;
  roleForm!: FormGroup;
  permForm!: FormGroup;
  isRole: boolean = true;
  permissionType = [
    {Id: 0, Name: 'Crear'},
    {Id: 1, Name: 'Leer'},
    {Id: 2, Name: 'Actualizar'},
    {Id: 3, Name: 'Eliminar'},
  ] as IPermissionType[];

  constructor(
    private overlayService: OverlayService,
    private alertsService: AlertsService,
    @Inject(MAT_DIALOG_DATA) public data: IIdDialogData,
    private roleService: RoleService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private matDialogRef: MatDialogRef<RoleEditComponent>,
    private sharedService: SharedService,
    private permissionService: PermissionService,
    private modalService: ModalService
  ) {
  }

  ngOnInit(): void {
    this.onload();
  }

  onload(): void {
    switch (this.sharedService.GetCurrentRouteSegment()) {
      case '/maintenance/roles-users/roles':
        this.isRole = true;
        this.GetRoleId();
        break;
      case '/maintenance/roles-users/permission':
        this.isRole = false;
        this.GetPermissionId();
        break;
    }


    this.ReadQueryParameters();
    this.LoadForm();

  }

  GetRoleId(): void {
    this.overlayService.OnGet();

    this.roleService.Get<IRole>(false, this.data.Id)
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (callback) => {
          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });
          this.roleForm.patchValue(callback.Data);
        },
        error: err => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      });
  }

  GetPermissionId(): void {
    this.overlayService.OnGet();

    this.permissionService.Get<IPermission>(this.data.Id)
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (callback) => {
          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });
          this.permForm.patchValue(callback.Data);
        },
        error: err => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      });
  }

  /**
   * Read query parameters
   */
  ReadQueryParameters(): void {
    this.routeQueryParams$ = this.activatedRoute.queryParams.subscribe(params => {

      let Id: number = params['Id'] ? +(params['Id']) : 0;

      if (this.isRole) {
        if (!Id) {
          this.modalTitle = 'Creación de rol';
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
          this.modalTitle = 'Modificación de rol';
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
      } else {
        if (!Id) {
          this.modalTitle = 'Creación de permiso';
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
          this.modalTitle = 'Modificación de permiso';
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

      }

    });
  }


  public OnActionButtonClicked(_event: IActionButton): void {
    switch (_event.Key) {
      case  'ADD':
        this.Save()
        break;
      case  'CANCEL':
        this.matDialogRef.close();
        break;
    }
  }

  LoadForm(): void {
    this.roleForm = this.fb.group({
      Id: [null],
      Name: [null, [Validators.required]],
      Description: [null, [Validators.required]],
      IsActive: [false, [Validators.required]],
    });

    this.permForm = this.fb.group({
      Id: [null],
      Name: [null, [Validators.required]],
      Description: [null, [Validators.required]],
      IsActive: [false, [Validators.required]],
      PermissionType: [null, [Validators.required]]
    });

  }

  Save(): void {

    if (this.isRole) {
      this.overlayService.OnPost();

      let roleValues = this.roleForm.getRawValue() as IRole;

      let updateOrCreate$: Observable<Structures.Interfaces.ICLResponse<IRole>> | null = null;

      if (!this.data.Id) {
        updateOrCreate$ = this.roleService.Post(roleValues);
      } else {
        updateOrCreate$ = this.roleService.Patch(roleValues);
      }

      updateOrCreate$
        .pipe(
          finalize(() => this.overlayService.Drop())
        )
        .subscribe({
          next: (callback) => {
            this.modalService.Continue({
              title: `Rol ${!this.data.Id ? 'creado' : 'actualizado'} correctamente`,
              type: CLModalType.SUCCESS
            });
            this.matDialogRef.close();
          },
          error: (err) => {
            this.modalService.Continue({
              title: `Se produjo un error ${!this.data.Id ? 'creando' : 'actualizando'} el rol`,
              subtitle: GetError(err),
              type: CLModalType.ERROR
            });
          }
        });
    } else {
      this.overlayService.OnPost();

      let permissionValues = this.permForm.getRawValue() as IPermission;

      let updateOrCreate$: Observable<Structures.Interfaces.ICLResponse<IPermission>> | null = null;

      if (!this.data.Id) {
        updateOrCreate$ = this.permissionService.Post(permissionValues);
      } else {
        updateOrCreate$ = this.permissionService.Patch(permissionValues);
      }

      updateOrCreate$
        .pipe(
          finalize(() => this.overlayService.Drop())
        )
        .subscribe({
          next: (callback) => {
            this.modalService.Continue({
              title: `Permiso ${!this.data.Id ? 'creado' : 'actualizado'} correctamente`,
              type: CLModalType.SUCCESS
            });
            this.matDialogRef.close();
          },
          error: (err) => {
            this.modalService.Continue({
              title: `Se produjo un error ${!this.data.Id ? 'creando' : 'actualizando'} el permiso`,
              subtitle: GetError(err),
              type: CLModalType.ERROR
            });
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
  }
}
