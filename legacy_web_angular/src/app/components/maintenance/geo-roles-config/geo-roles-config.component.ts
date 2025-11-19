import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {IPermission, IRole} from "@app/interfaces/i-roles";
import {IUser} from "@app/interfaces/i-user";
import {ICompany} from "@app/interfaces/i-company";
import {finalize, Subscription} from "rxjs";
import {ICLTableButton, MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {CLPrint, GetError, Structures} from "@clavisco/core";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {IActionButton} from "@app/interfaces/i-action-button";
import {IGeoRole} from "@app/interfaces/i-geo-role";
import {IGeoConfig} from "@app/interfaces/i-geo-config";
import {ActivatedRoute, Router} from "@angular/router";
import {OverlayService} from "@clavisco/overlay";
import {
  AlertsService,
  CLModalType,
  CLNotificationType,
  CLToastType,
  ModalService,
  NotificationPanelService
} from "@clavisco/alerts";
import {SharedService} from "@app/shared/shared.service";
import {MatDialog} from "@angular/material/dialog";
import {UserService} from "@app/services/user.service";
import {GeoRoleService} from "@app/services/geo-role.service";
import {LinkerEvent} from "@app/enums/e-linker-events";
import {IGeoRoleComponentResolvedData, IGeoRoleUserComponentResolvedData} from "@app/interfaces/i-resolvers";
import {formatDate} from "@angular/common";
import {IEditGeoRoleDialogData, IIdDialogData} from "@app/interfaces/i-dialog-data";
import {GeoRoleEditComponent} from "@Component/maintenance/geo-roles-config/geo-role-edit/geo-role-edit.component";

@Component({
  selector: 'app-geo-roles-config',
  templateUrl: './geo-roles-config.component.html',
  styleUrls: ['./geo-roles-config.component.scss']
})
export class GeoRolesConfigComponent implements OnInit, OnDestroy {
  geoRole: FormControl = new FormControl();
  geoRoles!: IGeoRole[];
  geoRolesToShowInTable: IGeoRole[] = [];
  user: FormControl = new FormControl();
  users!: IUser[];
  company: FormControl = new FormControl();
  companys!: ICompany[];
  routeQueryParams$!: Subscription;
  allSubscriptions: Subscription;
  index: number = 0;
  geoConfigs!: IGeoConfig[];
  geoConfigsToShowInTable: IGeoConfig[] = [];

  //#region @clavisco/table Configuration
  shouldPaginateRequestGeoRol: boolean = false;
  shouldPaginateRequestCompany: boolean = false;
  geoConfigsByGeoRoleTableId: string = 'GEO-CONFIG-ROLE-TABLE';
  geoRoleTableId: string = 'GEO-ROLE-TABLE';
  geoConfigsTableId: string = 'GEO-CONFIG-TABLE';
  geoRoleByUserTableId: string = 'GEO-ROLE-USER-TABLE';
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  mappedColumns: MappedColumns;
  mappedColumnsGeoConfigs: MappedColumns;
  geoConfigsByGeoRoleMappedColumns: MappedColumns;
  geoRoleByUserMappedColumns: MappedColumns;
  hasItemsSelection: boolean = false;
  hasItemsSelectionGeoConfigsByRole: boolean = true;
  hasItemsSelectionGeoRoleByUser: boolean = true;

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

  constructor(
    @Inject('LinkerService') private linkerService: LinkerService,
    private activatedRoute: ActivatedRoute,
    private overlayService: OverlayService,
    private geoRoleService: GeoRoleService,
    private alertsService: AlertsService,
    private router: Router,
    private sharedService: SharedService,
    private matDialog: MatDialog,
    private userService: UserService,
    private modalService: ModalService
  ) {
    this.mappedColumns = MapDisplayColumns(
      {
        dataSource: [] as IRole[],
        renameColumns: {
          Id: 'ID',
          Name: 'Nombre',
          Active: 'Activo',
          CreatedDate: 'Fecha de creación',
          CreatedBy: 'Creador por',
          UpdateDate: 'Fecha de actualización',
          UpdatedBy: 'Modificado por'
        },
        ignoreColumns: ['IsActive']
      }
    );

    this.mappedColumnsGeoConfigs = MapDisplayColumns(
      {
        dataSource: [] as IPermission[],
        renameColumns: {
          Id: 'ID',
          Key: 'Llave',
          Name: 'Nombre',
          IsActive: 'Activo',
          CreatedDate: 'Fecha creación',
          CreatedBy: 'Creado por',
          UpdateDate: 'Fecha actualización',
          UpdatedBy: 'Actualizado por'
        },
      }
    );

    this.geoConfigsByGeoRoleMappedColumns = MapDisplayColumns(
      {
        dataSource: [] as IRole[],
        renameColumns: {
          Id: 'ID',
          Name: 'Nombre configuración',
          CreatedDate: 'Fecha creación',
          CreatedBy: 'Creado por',
          UpdateDate: 'Fecha actualización',
          UpdatedBy: 'Actualizado por'
        },
        ignoreColumns: ['IsActive', 'Key'],
        propToLinkWithSelectColumn: 'IsActive',
      }
    );

    this.geoRoleByUserMappedColumns = MapDisplayColumns(
      {
        dataSource: [] as IRole[],
        renameColumns: {
          Id: 'ID',
          Name: 'Nombre geo rol',
          CreatedDate: 'Fecha creación',
          CreatedBy: 'Creado por',
          UpdateDate: 'Fecha actualización',
          UpdatedBy: 'Actualizado por'
        },
        ignoreColumns: ['IsActive'],
        propToLinkWithSelectColumn: 'IsActive'
      }
    );

    this.allSubscriptions = new Subscription();

  }

  ngOnInit(): void {

    this.OnLoad();

  }

  ngOnDestroy(): void {
    this.routeQueryParams$.unsubscribe();
    this.allSubscriptions.unsubscribe();
  }

  OnLoad(): void {
    this.geoConfigs = [];
    this.geoRoles = [];
    this.users = [];
    this.companys = [];

    this.actionButtons = [
      {
        Key: 'ADD',
        MatIcon: 'add',
        Text: 'Agregar',
        MatColor: 'primary'
      }
    ];

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
    Register<CL_CHANNEL>(this.geoRoleTableId, CL_CHANNEL.OUTPUT, this.OnTableActionActivated, this.callbacks);
    Register<CL_CHANNEL>(this.geoConfigsTableId, CL_CHANNEL.OUTPUT, this.OnTableActionActivated, this.callbacks);
    Register<CL_CHANNEL>(this.geoRoleByUserTableId, CL_CHANNEL.DATA_LINE_1, this.OnRequestUserSelectedRoles, this.callbacks);
    Register<CL_CHANNEL>(this.geoConfigsByGeoRoleTableId, CL_CHANNEL.DATA_LINE_1, this.OnTableConfigRole, this.callbacks);
  }

  RegisterActionButtonsEvents(): void {
    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.OnActionButtonClicked, this.callbacks);
  }

  /**
   * Method to define the resulting events for the table buttons
   * @param _event - Event emitted in the table button when selecting a geo-role
   * @constructor
   */
  OnTableActionActivated = (_event: ICLEvent): void => {
    if (_event.Data) {
      const BUTTON_EVENT = JSON.parse(_event.Data);
      const ACTION_GEO_ROLE = JSON.parse(BUTTON_EVENT.Data) as IGeoRole;
      switch (BUTTON_EVENT.Action) {
        case Structures.Enums.CL_ACTIONS.UPDATE:

          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {
            relativeTo: this.activatedRoute, queryParams: {
              dialog: 'update',
              Id: ACTION_GEO_ROLE.Id
            }
          });
          break;
      }
    }
  }

  /**
   * Method to obtain the selected elements from the role assignment table.
   * @param _event -Elements selected in the table
   * @constructor
   */
  OnRequestUserSelectedRoles = (_event: ICLEvent): void => {
    let geoRoles = JSON.parse(_event.Data) as IRole[];
    this.overlayService.OnGet();

    this.userService.PatchGeoRoleByUser(+this.user.value, +this.company.value, geoRoles)
      .pipe(
        finalize(() => this.overlayService.Drop())
      )
      .subscribe({
        next: (callback) => {
          this.modalService.Continue({
            title: 'Asignación de geo roles guardada correctamente',
            type: CLModalType.SUCCESS
          });
        },
        error: (err) => {
          this.modalService.Continue({
            title:  'Se produjo un error guardando la asignación de geo roles ',
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      });
  }

  /**
   * Method to obtain the selected elements from the role configuration table.
   * @param _event - Elements selected in the table
   * @constructor
   */
  OnTableConfigRole = (_event: ICLEvent): void => {

    const DATA = JSON.parse(_event.Data) as IGeoConfig[];

    if (DATA && DATA.length > 0) {
      this.geoConfigs.forEach(x => {
        x.IsActive = DATA.some(element => element.Id === x.Id);
      });
    } else {
      this.geoConfigs = this.geoConfigs.map(x => {
        return {...x, IsActive: false}
      });
    }

    if (!this.geoRole?.value) {
      this.alertsService.Toast({type: CLToastType.INFO, message: 'Debe seleccionar un rol'});
      return;
    }


    this.overlayService.OnGet();
    this.geoRoleService.PatchGeoConfigsByGeoRole(this.geoRole.value, this.geoConfigs)
      .pipe(
        finalize(() => this.overlayService.Drop())
      )
      .subscribe({
        next: (callback) => {
          this.modalService.Continue({
            title: 'Configuración del geo rol guardada correctamente',
            type: CLModalType.SUCCESS
          });
        },
        error: (err) => {
          this.modalService.Continue({
            title: 'Se produjo un error guardando la configuración del geo rol',
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      });
  }

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
          Target: this.geoConfigsByGeoRoleTableId
        });
        break;

      case 'UPDATEROL':

        this.linkerService.Publish({
          CallBack: CL_CHANNEL.DATA_LINE_2,
          Data: '',
          Target: this.geoRoleByUserTableId
        });
        break;
    }
  }

  HandleResolvedData(): void {
    this.allSubscriptions.add(this.activatedRoute.data.subscribe({
      next: (data) => {
        const resolvedDataGeoRoles = data['resolvedDataGeoRoles'] as IGeoRoleComponentResolvedData;

        //TAB GEO ROLES
        if (resolvedDataGeoRoles) {

          if (resolvedDataGeoRoles.GeoRoles) {
            this.index = 2;

            if (resolvedDataGeoRoles.GeoRoles.length > 0) {
              this.geoRoles = resolvedDataGeoRoles.GeoRoles;
              this.geoRoles.forEach(x => {
                x.Active = x.IsActive ? 'Si' : 'No';
              });

              const NEXT_TABLE_STATE = {
                CurrentPage: 0,
                ItemsPeerPage: 5,
                Records: this.geoRoles,
                RecordsCount: this.geoRoles.length,
              };

              this.linkerService.Publish({
                CallBack: CL_CHANNEL.INFLATE,
                Data: JSON.stringify(NEXT_TABLE_STATE),
                Target: this.geoRoleTableId
              });
            }
          }
        }

        const resolvedDataGeoConfigsByGeoRole: IGeoRoleComponentResolvedData = this.activatedRoute.snapshot.data['resolvedDataGeoConfigsByGeoRole'];

        //TAB CONFIGURACIONES DEL GEO ROL
        if (resolvedDataGeoConfigsByGeoRole) {
          this.index = 1;

          if (resolvedDataGeoConfigsByGeoRole.GeoConfigs) {
            this.geoConfigs = resolvedDataGeoConfigsByGeoRole.GeoConfigs;
            this.geoConfigs.forEach(x => {
              x.CreatedDate = formatDate(x.CreatedDate, 'dd-MM-yyyy hh:mm:ss a', 'en');
              x.UpdateDate = formatDate(x.UpdateDate, 'dd-MM-yyyy hh:mm:ss a', 'en');
              x.IsActive = false;
            });
            this.linkerService.Publish({
              CallBack: CL_CHANNEL.INFLATE,
              Data: JSON.stringify({Records: [], RecordsCount: 0}),
              Target: this.geoConfigsByGeoRoleTableId
            })
          }

          if (resolvedDataGeoConfigsByGeoRole.GeoRoles) {
            this.geoRoles = resolvedDataGeoConfigsByGeoRole.GeoRoles;
          }

          this.actionButtons = [
            {
              Key: 'UPDATE',
              MatIcon: 'edit',
              Text: 'Actualizar',
              MatColor: 'primary'
            }
          ];
        }

        const resolvedDataGeoRolesUser: IGeoRoleUserComponentResolvedData = this.activatedRoute.snapshot.data['resolvedDataGeoRolesUser'];

        //TAB ASIGNACIONES DE GEO ROL
        if (resolvedDataGeoRolesUser) {
          this.index = 0;

          if (resolvedDataGeoRolesUser.Companys) {
            this.companys = resolvedDataGeoRolesUser.Companys;
          }

          if (resolvedDataGeoRolesUser.Users) {
            this.users = resolvedDataGeoRolesUser.Users;
          }

          if (resolvedDataGeoRolesUser.GeoRoles) {
            this.geoRoles = resolvedDataGeoRolesUser.GeoRoles;
            this.geoRoles.forEach(x => {
              x.CreatedDate = formatDate(x.CreatedDate, 'dd-MM-yyyy hh:mm:ss a', 'en');
              x.UpdateDate = formatDate(x.UpdateDate, 'dd-MM-yyyy hh:mm:ss a', 'en');
              x.IsActive = false;
            });
            this.linkerService.Publish({
              CallBack: CL_CHANNEL.INFLATE,
              Data: JSON.stringify({Records: [], RecordsCount: 0}),
              Target: this.geoRoleByUserTableId
            });
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
      }
    }));
  }

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

  OpenEditDialog(_id: number): void {
    this.matDialog.open(GeoRoleEditComponent, {
      maxWidth: '100vw',
      minWidth: '40vw',
      maxHeight: 'calc(100vh - 20px)',
      minHeight: 'auto',
      disableClose: true,
      data: {
        GeoRoleId: _id,
      } as IEditGeoRoleDialogData
    })
      .afterClosed()
      .subscribe({
        next: (result) => {
          this.router.navigate(['.'], {relativeTo: this.activatedRoute});
        }
      });
  }

  GetGeoConfigsByGeoRole(): void {

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.FLUSH,
      Data: '',
      Target: this.geoConfigsByGeoRoleTableId
    });

    this.overlayService.OnGet();
    this.geoRoleService.GetGeoConfigsByGeoRole<IGeoConfig[]>(+this.geoRole.value)
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (callback) => {
          this.geoConfigsToShowInTable = [...this.geoConfigs];
          this.geoConfigsToShowInTable.forEach(element => {
            element.IsActive = callback.Data.some((x) => x.Id === element.Id);
          });

          this.InflateTableGeoConfigLines();

        }
      });
  }

  GetGeoRoleByUsers(): void {

    if (!this.user.value || !this.company.value) return;

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.FLUSH,
      Data: '',
      Target: this.geoRoleByUserTableId
    });

    this.overlayService.OnGet();
    this.userService.GetGeoRoleByUser(+this.user.value, +this.company.value)
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (callback) => {
          this.geoRolesToShowInTable = [...this.geoRoles];
          this.geoRolesToShowInTable.forEach(element => {
            element.IsActive = callback.Data.some((x) => x.Id === element.Id);
          });

          this.InflateTableGeoRoleLines();
        }
      });
  }

  tabChanged(tabChangeEvent: any): void {
    this.index = tabChangeEvent;

    switch (this.index) {
      case 0:
        this.router.navigate(['/maintenance', 'geo-roles-users']);
        break;
      case 1:
        this.router.navigate(['/maintenance', 'geo-roles-users', 'geo-configs-by-geo-role']);

        break;
      case 2:
        this.router.navigate(['/maintenance', 'geo-roles-users', 'geo-roles']);
        break;
      case 3:
        this.router.navigate(['/maintenance', 'geo-roles-users', 'geo-config']);
        break;
    }
  }

  //#endregion
  InflateTableGeoConfigLines(): void {

    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.geoConfigsToShowInTable,
      RecordsCount: this.geoConfigsToShowInTable.length
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.geoConfigsByGeoRoleTableId
    })
  }

  InflateTableGeoRoleLines(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.geoRolesToShowInTable,
      RecordsCount: this.geoRolesToShowInTable.length
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.geoRoleByUserTableId
    });
  }

  EmitActionButtonClickEvent(_actionButton: IActionButton): void {
    this.sharedService.EmitActionButtonClickEvent(_actionButton);
  }
}
