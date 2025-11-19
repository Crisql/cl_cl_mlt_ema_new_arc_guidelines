import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {
  AlertsService,
  CLModalType,
  CLNotificationType,
  CLToastType,
  ModalService,
  NotificationPanelService
} from '@clavisco/alerts';
import {CLPrint, GetError, Structures} from '@clavisco/core';
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from '@clavisco/linker';
import {OverlayService} from '@clavisco/overlay';
import {ICLTableButton, MapDisplayColumns, MappedColumns} from '@clavisco/table';
import {finalize, forkJoin, Subscription, tap} from 'rxjs';
import {LinkerEvent} from 'src/app/enums/e-linker-events';
import {IActionButton} from 'src/app/interfaces/i-action-button';
import {IIdDialogData} from 'src/app/interfaces/i-dialog-data';
import {
  IPermissionsResolveData,
  IRoleComponentResolvedData,
  IRoleUserComponentResolvedData
} from 'src/app/interfaces/i-resolvers';
import {IPermission, IRole} from 'src/app/interfaces/i-roles';
import {PermissionService} from 'src/app/services/permission.service';
import {RoleService} from 'src/app/services/role.service';
import {SharedService} from 'src/app/shared/shared.service';
import {RoleEditComponent} from './role-edit/role-edit.component';
import {IUser} from 'src/app/interfaces/i-user';
import {ICompany} from 'src/app/interfaces/i-company';
import {UserService} from 'src/app/services/user.service';
import {formatDate} from '@angular/common';

@Component({
  selector: 'app-roles-perms',
  templateUrl: './roles-perms.component.html',
  styleUrls: ['./roles-perms.component.scss']
})

export class RolesPermsComponent implements OnInit {

  /*Formularios*/
  role: FormControl = new FormControl();
  assignRolePermissionsFilterForm!: FormGroup;
  user: FormControl = new FormControl();
  company: FormControl = new FormControl();
  permissionsFilterForm!: FormGroup;

  /*Listas*/
  roles!: IRole[];
  users!: IUser[];
  permissions!: IPermission[];
  filteredPermissions: IPermission[] = [];
  companies!: ICompany[];

  /*Observables*/
  routeQueryParams$!: Subscription;
  allSubscriptions: Subscription;

  /*Variables*/
  index: number = 0;
  //#region @clavisco/table Configuration
  shouldPaginateRequestAssignRol: boolean = false;
  shouldPaginateRequestPermissionRol: boolean = false;
  shouldPaginateRequestRoles: boolean = false;
  shouldPaginateRequestPermission: boolean = false;
  permsByRoleTableId: string = 'PERM-ROL-TABLE';
  roleTableId: string = 'ROL-TABLE';
  permsTableId: string = 'PERM-TABLE';
  rolByUserTableId: string = 'ROL-USER-TABLE';
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  mappedColumns: MappedColumns;
  mappedColumnsPermission: MappedColumns;
  permsByRoleMappedColumns: MappedColumns;
  roleByUserMappedColumns: MappedColumns;
  hasItemsSelection: boolean = false;
  hasItemsSelectionPermsByRole: boolean = true;
  hasItemsSelectionRoleByUser: boolean = true;

  buttons: ICLTableButton[] = [
    {
      Title: `Editar`,
      Action: Structures.Enums.CL_ACTIONS.UPDATE,
      Icon: `edit`,
      Color: `primary`,
      Data: ''
    }
  ]
  //#endregion

  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };

  actionButtons!: IActionButton[];
  actionButtonsFilter!: IActionButton[];

  constructor(
    private activatedRoute: ActivatedRoute,
    @Inject('LinkerService') private linkerService: LinkerService,
    private overlayService: OverlayService,
    private roleService: RoleService,
    private alertsService: AlertsService,
    private router: Router,
    private sharedService: SharedService,
    private matDialog: MatDialog,
    private userService: UserService,
    private permissionsService: PermissionService,
    private fb: FormBuilder,
    private modalService: ModalService
  ) {
    this.mappedColumns = MapDisplayColumns(
      {
        dataSource: [] as IRole[],
        renameColumns: {Id: 'ID', Name: 'Nombre', Description: 'Descripción', Active: 'Activo'},
        stickyColumns: [
          {Name: 'Options', FixOn: 'right'}
        ],
        ignoreColumns: ['IsActive'],
      }
    );

    this.mappedColumnsPermission = MapDisplayColumns(
      {
        dataSource: [] as IPermission[],
        renameColumns: {
          Id: 'ID',
          Name: 'Código',
          Description: 'Descripción',
          Active: 'Activo',
          PermissionType: 'Tipo permiso',
          CreatedDate: 'Fecha creación',
          CreatedBy: 'Creado por',
          UpdateDate: 'Fecha actualización',
          UpdatedBy: 'Actualizado por'
        },
        stickyColumns: [
          {Name: 'Options', FixOn: 'right'}
        ],
        ignoreColumns: ['IsActive'],
      }
    );

    this.permsByRoleMappedColumns = MapDisplayColumns(
      {
        dataSource: [] as IRole[],
        renameColumns: {
          Id: 'ID',
          Description: 'Nombre permiso',
          CreatedDate: 'Fecha creación',
          CreatedBy: 'Creado por',
          UpdateDate: 'Fecha actualización',
          UpdatedBy: 'Actualizado por'
        },
        propToLinkWithSelectColumn: 'IsActive',
        ignoreColumns: ['IsActive', 'PermissionType', 'Name']
        //markAsCheckedValidation: (_tableRow, _itemToMarkAsChecked) => _tableRow.IsActive && _tableRow.Id === _itemToMarkAsChecked.Id
      }
    );

    this.roleByUserMappedColumns = MapDisplayColumns(
      {
        dataSource: [] as IRole[],
        renameColumns: {
          Id: 'ID',
          Name: 'Nombre rol',
          CreatedDate: 'Fecha creación',
          CreatedBy: 'Creado por',
          UpdateDate: 'Fecha actualización',
          UpdatedBy: 'Actualizado por'
        },
        propToLinkWithSelectColumn: 'IsActive',
        ignoreColumns: ['IsActive', 'Description'],
        // markAsCheckedValidation: (_tableRow, _itemToMarkAsChecked) => _tableRow.IsActive
      }
    );

    this.allSubscriptions = new Subscription();

  }


  ngOnInit(): void {
    this.onLoad();
  }

  ngOnDestroy(): void {
    this.routeQueryParams$.unsubscribe();
    this.allSubscriptions.unsubscribe();
  }

  onLoad(): void {
    this.permissions = [];
    this.roles = [];
    this.users = [];
    this.companies = [];

    this.actionButtons = [
      {
        Key: 'ADD',
        MatIcon: 'add',
        Text: 'Agregar',
        MatColor: 'primary'
      }
    ];

    this.actionButtonsFilter = [
      {
        Key: 'SEARCH',
        MatIcon: 'search',
        Text: 'Buscar',
        MatColor: 'primary',
        DisabledIf: (_form?: FormGroup) => _form?.invalid || false
      }
    ];

    this.permissionsFilterForm = this.fb.group({
      searchCriteria: ['']
    });

    this.assignRolePermissionsFilterForm = this.fb.group({
      searchCriteria: [''],
      roleId: ['', Validators.required]
    });

    this.RegisterTableEvents();
    this.RegisterActionButtonsEvents();

    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );

    this.ReadQueryParameters();

    this.HandleResolvedData();

  }

  RegisterTableEvents(): void {
    Register<CL_CHANNEL>(this.roleTableId, CL_CHANNEL.OUTPUT, this.OnTableActionActivated, this.callbacks);
    Register<CL_CHANNEL>(this.permsTableId, CL_CHANNEL.OUTPUT, this.OnTableActionActivated, this.callbacks);
    Register<CL_CHANNEL>(this.rolByUserTableId, CL_CHANNEL.DATA_LINE_1, this.OnRequestUserSelectedRoles, this.callbacks);
    Register<CL_CHANNEL>(this.permsByRoleTableId, CL_CHANNEL.DATA_LINE_1, this.OnRequestRoleSelectedPermissions, this.callbacks);

  }

  RegisterActionButtonsEvents(): void {
    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.OnActionButtonClicked, this.callbacks);
  }

  /**
   *Method to select a role
   * @param _event - Event emitted in the table button when selecting a role
   * @constructor
   */
  OnTableActionActivated = (_event: ICLEvent): void => {
    if (_event.Data) {
      const BUTTON_EVENT = JSON.parse(_event.Data);
      const ACTION_ROLE = JSON.parse(BUTTON_EVENT.Data) as IRole;
      switch (BUTTON_EVENT.Action) {
        case Structures.Enums.CL_ACTIONS.UPDATE:

          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {
            relativeTo: this.activatedRoute, queryParams: {
              dialog: 'update',
              Id: ACTION_ROLE.Id
            }
          });
          break;
      }
    }
  }

  /**
   * Method to obtain the selected elements from the role by user assignment table.
   * @param _event -Elements selected in the table
   * @constructor
   */
  OnRequestUserSelectedRoles = (_event: ICLEvent): void => {
    let roles = JSON.parse(_event.Data) as IRole[];

    this.overlayService.OnGet();

    this.userService.PatchRoleByUser(+this.user.value, +this.company.value, roles)
      .pipe(
        finalize(() => this.overlayService.Drop())
      )
      .subscribe({
        next: (callback) => {
          this.modalService.Continue({
            title: 'Asignación de roles guardada correctamente',
            type: CLModalType.SUCCESS
          });
        },
        error: (err) => {
          this.modalService.Continue({
            title:  'Se produjo un error guardando la asignación de roles',
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      });
  }

  /**
   * Method to obtain the selected elements from the permission by role assignment table.
   * @param _event -Elements selected in the table
   * @constructor
   */
  OnRequestRoleSelectedPermissions = (_event: ICLEvent): void => {
    if (this.filteredPermissions && this.filteredPermissions.length) {

      let {roleId} = this.assignRolePermissionsFilterForm.value;

      this.overlayService.OnGet();
      this.roleService.UpdateRolePermissions(+roleId, this.filteredPermissions)
        .pipe(
          finalize(() => this.overlayService.Drop())
        )
        .subscribe({
          next: (callback) => {
            this.modalService.Continue({
              title: 'Permisos del rol actualizados correctamente',
              type: CLModalType.SUCCESS
            });
          },
          error: (err) => {
            this.modalService.Continue({
              title:  'Se produjo un error actualizando los permisos del rol',
              subtitle: GetError(err),
              type: CLModalType.ERROR
            });
          }
        });
    } else {
      this.alertsService.Toast({type: CLToastType.INFO, message: 'No existen registros'});
    }
  }

  public GetFilteredPermissionsIfSearchCriteriaIsEmpty(_event: KeyboardEvent): void {

    if (_event.key === 'Tab' || _event.key === 'Enter' || _event.key === 'CapsLock') return;

    let searchCriteria = this.permissionsFilterForm.get('searchCriteria')?.value;

    if (!searchCriteria) {
      this.GetFilteredPermissions();
    }
  }

  GetFilteredPermissionsByRoleIfSearchCriteriaIsEmpty(_event: KeyboardEvent): void {

    if (_event.key === 'Tab' || _event.key === 'Enter' || _event.key === 'CapsLock' || this.assignRolePermissionsFilterForm.invalid) return;

    let searchCriteria = this.assignRolePermissionsFilterForm.get('searchCriteria')?.value;

    if (!searchCriteria) {
      this.GetPermissionsByRole();
    }
  }

  public GetFilteredPermissions(): void {

    let searchCriteria = this.permissionsFilterForm.get('searchCriteria')?.value;

    this.overlayService.OnGet();
    this.permissionsService.GetFilteredPermissions(searchCriteria).pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (callback) => {
        this.permissions = callback.Data;
        this.InflateTablePermissions();
      }
    });
  }

  /**
   *
   * @param _actionButton
   */
  OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'ADD':
        this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {
          relativeTo: this.activatedRoute, queryParams: {
            dialog: 'create'
          }
        });
        break;
      case 'UPDATE':

        this.linkerService.Publish({
          CallBack: CL_CHANNEL.DATA_LINE_2,
          Data: '',
          Target: this.permsByRoleTableId
        });

        break;

      case 'UPDATEROL':

        this.linkerService.Publish({
          CallBack: CL_CHANNEL.DATA_LINE_2,
          Data: '',
          Target: this.rolByUserTableId
        });

        break;
      case 'SEARCH':
        this.GetFilteredPermissions();
        break;
      case 'ASSIGN_PERM_ROLE_SEARCH':
        this.GetPermissionsByRole();
        break;
    }
  }

  /**
   * Iniitial data
   */
  HandleResolvedData(): void {
    this.allSubscriptions.add(this.activatedRoute.data.subscribe({
      next: (data) => {
        const resolvedData = data['resolvedData'] as IRoleComponentResolvedData;

        this.index = 3;

        /**tap roles and permissions */
        if (resolvedData) {

          if (resolvedData.Roles) {
            this.index = 2;

            if (resolvedData.Roles.length > 0) {
              this.roles = resolvedData.Roles;
              this.roles.forEach(x => {
                x.Active = x.IsActive ? 'Si' : 'No';
              });

              const NEXT_TABLE_STATE = {
                CurrentPage: 0,
                ItemsPeerPage: 5,
                Records: this.roles,
                RecordsCount: this.roles.length,
              };

              this.linkerService.Publish({
                CallBack: CL_CHANNEL.INFLATE,
                Data: JSON.stringify(NEXT_TABLE_STATE),
                Target: this.roleTableId
              });
            }
          }

        }

        const resolvedDataPermsRol: IRoleComponentResolvedData = this.activatedRoute.snapshot.data['resolvedDataPermsRol'];

        /**tap permissions by rol */
        if (resolvedDataPermsRol) {
          this.index = 1;

          this.roles = resolvedDataPermsRol.Roles || [];
          this.permissions = resolvedDataPermsRol.Permissions || [];

          this.actionButtons = [
            {
              Key: 'UPDATE',
              MatIcon: 'edit',
              Text: 'Actualizar',
              MatColor: 'primary'
            }
          ];

          this.actionButtonsFilter = [
            {
              Key: 'ASSIGN_PERM_ROLE_SEARCH',
              MatIcon: 'search',
              Text: 'Buscar',
              MatColor: 'primary',
              DisabledIf: _form => !!_form?.invalid
            }
          ];
        }

        const resolvedDataCompanyUserRol: IRoleUserComponentResolvedData = this.activatedRoute.snapshot.data['resolvedDataUser'];

        /**tap assings rols */
        if (resolvedDataCompanyUserRol) {
          this.index = 0;

          if (resolvedDataCompanyUserRol.Companys) {
            this.companies = resolvedDataCompanyUserRol.Companys;

          }

          if (resolvedDataCompanyUserRol.Users) {
            this.users = resolvedDataCompanyUserRol.Users;
          }

          this.actionButtons = [
            {
              Key: 'UPDATEROL',
              MatIcon: 'edit',
              Text: 'Actualizar',
              MatColor: 'primary'
            }
          ];

        }

        //tap permisos
        const resolvedDataPermissions: IPermissionsResolveData = this.activatedRoute.snapshot.data['resolvedPermissions'];

        if (resolvedDataPermissions) {
          this.permissions = resolvedDataPermissions.Permissions;
          this.InflateTablePermissions();
        }


      }
    }));
  }

  private InflateTablePermissions(): void {
    if (this.permissions) {

      this.permissions = this.permissions.map(x => {
        return {
          ...x,
          PermissionType: x.PermissionType === 0 ? 'Crear' : x.PermissionType === 1 ? 'Leer' : x.PermissionType === 2 ? 'Actualizar' : x.PermissionType === 3 ? 'Eliminar' : x.PermissionType,
          Active: x.IsActive ? 'Si' : 'No'
        }
      });

      const NEXT_TABLE_STATE = {
        CurrentPage: 0,
        ItemsPeerPage: 5,
        Records: this.permissions,
        RecordsCount: this.permissions.length,
      };

      this.linkerService.Publish({
        CallBack: CL_CHANNEL.INFLATE,
        Data: JSON.stringify(NEXT_TABLE_STATE),
        Target: this.permsTableId
      });

    }
  }

  /**
   * Read query parameters to show dialog
   */
  ReadQueryParameters(): void {
    this.routeQueryParams$ = this.activatedRoute.queryParams.subscribe(params => {
      if (params['dialog']) {
        let Id: number = params['Id'] ? +(params['Id']) : 0;

        if (params['dialog'] === 'update' && !Id) {
          this.alertsService.Toast({type: CLToastType.ERROR, message: 'Debe enviar el parametro "Id"'});
        } else {
          this.OpenEditDialog(Id);
        }
      }
    });
  }

  /**
   * Open edit modal of roles or permissions.
   * @param _id
   */
  OpenEditDialog(_id: number): void {
    this.matDialog.open(RoleEditComponent, {
      maxWidth: '100vw',
      minWidth: '40vw',
      maxHeight: 'calc(100vh - 20px)',
      disableClose: true,
      data: {
        Id: _id,
      } as IIdDialogData
    })
      .afterClosed()
      .subscribe({
        next: (result) => {
          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {relativeTo: this.activatedRoute});
        }
      });
  }


  GetPermissionsByRole(): void {
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.FLUSH,
      Data: '',
      Target: this.permsByRoleTableId
    });

    let {roleId, searchCriteria} = this.assignRolePermissionsFilterForm.value;

    this.overlayService.OnGet();

    forkJoin([
      this.permissionsService.GetFilteredPermissions(searchCriteria, true),
      this.roleService.GetPermissionsByRole(+roleId)
    ]).pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (callback) => {
          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });
          this.permissions = callback[1].Data;
          this.filteredPermissions = callback[0].Data.map(x => ({
            ...x,
            IsActive: this.permissions.some((y) => y.Id === x.Id),
            CreatedDate: formatDate(x.CreatedDate, 'dd-MM-yyyy hh:mm:ss a', 'en'),
            UpdateDate: formatDate(x.UpdateDate, 'dd-MM-yyyy hh:mm:ss a', 'en')
          }));


          // this.permissions.forEach(x => {
          //   x.IsActive = callback[1].Data.some((y) => y.Id === x.Id)
          // });

          this.InflateRolePermissionsTable();
        },
        error: err => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      });
  }


  /**
   * Get all rol.
   */

  GetRolesByUsers(): void {

    if (!this.user.value || !this.company.value) return;
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.FLUSH,
      Data: '',
      Target: this.rolByUserTableId
    });

    this.overlayService.OnGet();

    forkJoin([
      this.roleService.Get<IRole[]>(true),
      this.userService.GetRoleByUser(+this.user.value, +this.company.value)
    ]).pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (callback) => {
          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });
          this.roles = callback[0].Data.map(x => ({
            ...x,
            IsActive: callback[1].Data.some((y) => y.Id === x.Id),
            CreatedDate: formatDate(x.CreatedDate, 'dd-MM-yyyy hh:mm:ss a', 'en'),
            UpdateDate: formatDate(x.UpdateDate, 'dd-MM-yyyy hh:mm:ss a', 'en')
          }));
          this.InflateTableRolLines();
        },
        error: err => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      });
  }


  /**
   * mat-tap
   * @param tabChangeEvent
   */
  OnTabChange(tabChangeEvent: any): void {
    this.index = tabChangeEvent;

    switch (this.index) {
      case 0:
        this.router.navigate(['/maintenance', 'roles-users']);
        break;
      case 1:
        this.router.navigate(['/maintenance', 'roles-users', 'perms-by-rol']);

        break;
      case 2:
        this.router.navigate(['/maintenance', 'roles-users', 'roles']);
        break;
      case 3:
        this.router.navigate(['/maintenance', 'roles-users', 'permission']);
        break;
    }

  }


  //#endregion
  InflateRolePermissionsTable(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.filteredPermissions,
      RecordsCount: this.filteredPermissions.length,
      //ItemsToMarkAsChecked: this.filteredPermissions
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.permsByRoleTableId
    })
  }

  InflateTableRolLines(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.roles,
      RecordsCount: this.roles.length
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.rolByUserTableId
    });

  }

  OnClickAssignAllPerms(): void {
    //this.permissions.forEach(p => p.IsActive = true);
    this.filteredPermissions.forEach(p => p.IsActive = true);
    this.InflateRolePermissionsTable();
  }

  OnClickUnassignAllPerms(): void {
    //this.permissions.forEach(p => p.IsActive = false);
    this.filteredPermissions.forEach(p => p.IsActive = false);
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.FLUSH,
      Data: '',
      Target: this.permsByRoleTableId
    });
    this.InflateRolePermissionsTable();
  }
}
