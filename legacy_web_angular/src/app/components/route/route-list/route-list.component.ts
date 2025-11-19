import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {IRoute, IRouteFilter, IRouteFrequency} from "@app/interfaces/i-route";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {IUser} from "@app/interfaces/i-user";
import {IActionButton} from "@app/interfaces/i-action-button";
import {ICLTableButton, MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {CLPrint, GetError, Structures} from "@clavisco/core";
import {finalize, Subscription} from "rxjs";
import {IRouteListResolveData} from "@app/interfaces/i-resolvers";
import {IStructures} from "@app/interfaces/i-structures";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {formatDate} from "@angular/common";
import {SharedService} from "@app/shared/shared.service";
import {
  IIdDialogData,
  IRouteAdministratorsDialogData,
  IRouteAssignmentDialogData, IRouteCloseDialogData,
  IRouteLoadsDialogData
} from "@app/interfaces/i-dialog-data";
import {AlertsService, CLModalType, CLToastType, ModalService, NotificationPanelService} from "@clavisco/alerts";
import {RouteAssignmentComponent} from "@Component/route/route-list/route-assignment/route-assignment.component";
import {MatDialog} from "@angular/material/dialog";
import CL_ACTIONS = Structures.Enums.CL_ACTIONS;
import {
  RouteAdministratorsComponent
} from "@Component/route/route-list/route-administrators/route-administrators.component";
import {RouteHistoryComponent} from "@Component/route/route-list/route-history/route-history.component";
import {OverlayService} from "@clavisco/overlay";
import {RouteService} from "@app/services/route.service";
import {RouteLoadsComponent} from "@Component/route/route-list/route-loads/route-loads.component";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import Validation from "@app/custom-validation/custom-validators";
import {IDocumentSearchFilter} from "@app/interfaces/i-document-type";
import {RouteCloseComponent} from "@Component/route/route-list/route-close/route-close.component";
import {RouteStatus} from "@app/enums/enums";

@Component({
  selector: 'app-route-list',
  templateUrl: './route-list.component.html',
  styleUrls: ['./route-list.component.scss']
})
export class RouteListComponent implements OnInit, OnDestroy {

  routes: IRoute[] = [];
  filteredRoutes: IRoute[] = [];
  users: IUser[] = [];
  filteredUsers: IUser[] = [];
  filterForm!: FormGroup;
  permissions: IPermissionbyUser[] = [];

  routeStatus: IStructures[] = [];
  routeTypes: IStructures[] = [];
  routeFrequencies: IRouteFrequency[] = [];

  actionButtons: IActionButton[] = [
    {
      Key: 'SEARCH',
      MatIcon: 'search',
      Text: 'Buscar',
      MatColor: 'primary',
      DisabledIf: _form => _form!.invalid
    },
    {
      Key: 'NEW',
      MatColor: 'primary',
      Text: 'Nueva ruta',
      MatIcon: 'add'
    },
    {
      Key: 'UPLOAD_TEMPLATE',
      MatColor: 'primary',
      Text: 'Cargar plantilla',
      MatIcon: 'upload_file'
    },
  ];

  shouldPaginateRequest: boolean = true;
  tableId: string = 'ROUTES_TABLE_ID';
  mappedColumns!: MappedColumns;
  tableButtons: ICLTableButton[] = [
    {
      Action: CL_ACTIONS.OPTION_1,
      Title: 'Opciones',
      Icon: 'list',
      Color: 'primary',
      Options: [
        {
          Action: CL_ACTIONS.UPDATE,
          Title: 'Editar',
          Icon: 'edit',
          Color: ''
        },
        {
          Action: CL_ACTIONS.OPTION_4,
          Title: 'Asignar',
          Icon: 'person_add',
          Color: '',
        },
        {
          Action: CL_ACTIONS.OPTION_5,
          Title: 'Administradores',
          Icon: 'admin_panel_settings',
          Color: '',
        },
        {
          Action: CL_ACTIONS.OPTION_2,
          Title: 'Historial',
          Icon: 'history',
          Color: ''
        },
        {
          Action: CL_ACTIONS.OPTION_3,
          Title: 'Cerrar',
          Icon: 'block',
          Color: ''
        }
      ]
    }
  ];

  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Tracks: [],
    Callbacks: {}
  };

  allSubscriptions$: Subscription;

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    @Inject("LinkerService") private linkerService: LinkerService,
    private matDialog: MatDialog,
    private router: Router,
    private sharedService: SharedService,
    private alertsService: AlertsService,
    private overlayService: OverlayService,
    private routeService: RouteService,
    private modalService: ModalService
  ) {
    this.allSubscriptions$ = new Subscription();
    this.mappedColumns = MapDisplayColumns({
      dataSource: this.filteredRoutes,
      renameColumns: {
        Id: 'ID',
        Name: 'Nombre',
        TypeName: 'Tipo',
        FrequencyName: 'Frecuencia',
        CreatedDateFmt: 'Fecha creación',
        CreatedBy: 'Creada por',
        RouteAssignment: 'Asignada',
        ExpirationDateFmt: 'Fecha expiración',
        StatusName: 'Estado'
      },
      stickyColumns: [
        {Name: 'Options', FixOn: 'right'}
      ],
      ignoreColumns: ['Status', 'Type', 'ActivationDate', 'TotalDistance', 'TotalDuration', 'CloseDetail', 'CloseUser',
        'CloseDate', 'TotalEstimatedDistance', 'TotalEstimatedDuration', 'CompanyId', 'RouteFrequencyId', 'RouteAssignmentId',
        'UpdateDate', 'UpdatedBy', 'Active', 'IsActive', 'CreatedDate', 'RouteFrequency', 'Company', 'ExpirationDate',
        'RouteAssignmentUserId', 'RouteWasDownloaded']
    });
  }

  ngOnInit(): void {
    Register<CL_CHANNEL>(this.tableId, CL_CHANNEL.OUTPUT, this.OnTableButtonClicked, this.callbacks);
    Register<CL_CHANNEL>(this.tableId, CL_CHANNEL.REQUEST_RECORDS, this.GetDocuments, this.callbacks);
    this.LoadForm();
    this.HandleResolvedData();

    this.ReadQueryParameters();
    this.SetValidatorAutoComplete();

    this.allSubscriptions$.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );
  }

  LoadForm(): void {
    this.filterForm = this.fb.group({
      RouteName: [''],
      UserId: [0],
      DateFrom: [new Date((new Date()).setDate((new Date()).getDate() - 30)), Validators.required],
      DateTo: [new Date(), Validators.required],
      Status: ['-1']
    });
    this.ListenUsersAutocompleteChanges();
  }

  SetValidatorAutoComplete(): void {
    this.filterForm.get('UserId')?.addValidators(Validation.validateValueAutoComplete(this.users));
  }

  HandleResolvedData(): void {
    this.allSubscriptions$.add(this.activatedRoute.data.subscribe({
      next: (data) => {
        const resolvedData = data['resolvedData'] as IRouteListResolveData;
        if (resolvedData) {
          this.users = resolvedData.Users;
          this.filteredUsers = [...this.users];
          this.routeStatus = resolvedData.States;
          this.routeTypes = resolvedData.RouteTypes;
          this.routeFrequencies = resolvedData.Frequencies;
          this.permissions = resolvedData.Permissions;
        }
      }
    }))
  }

  /**
   * This method execute event buttons
   * @param _actionButton
   * @constructor
   */
  OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'SEARCH':
       this.SearchRoutes();
        break;
      case 'NEW':
        if (!this.HasPermission('Routes_New_Access')) {
          this.alertsService.Toast({type: CLToastType.INFO, message: 'No cuentas con permisos para crear rutas'});
          return;
        }
        this.router.navigate(['/', 'route', 'new']);
        break;
      case 'UPLOAD_TEMPLATE':
        this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {
          relativeTo: this.activatedRoute, queryParams: {
            dialog: 'upload-routes'
          }
        });
        break;
    }
  }

  /**
   * This method get routes
   * @constructor
   */
  GetDocuments = (): void => {
    let filter = this.filterForm.value as IRouteFilter;

    let dateFrom = formatDate(filter.DateFrom, 'yyyy-MM-dd', 'en');
    let dateTo = formatDate(filter.DateTo, 'yyyy-MM-dd', 'en');
    let userAssing: number = 0;
    if (filter.UserId) {
      userAssing = filter.UserId.Id;
    }

    this.overlayService.OnGet();
      this.routeService.GetRoutes(dateFrom, dateTo, filter.Status, userAssing, filter.RouteName ?? '')
        .pipe(finalize(() => this.overlayService.Drop()))
        .subscribe({
          next: (callback) => {
            this.routes = callback.Data;
            this.InflateTable();
          }
        });
  }

  ListenUsersAutocompleteChanges(): void {
    this.filterForm.get('UserId')?.valueChanges.subscribe({
      next: (value) => {
        if (typeof value === "string") {
          this.filteredUsers = this.users.filter(u => (`${u.Id} - ${u.Name} ${u.LastName}`).toLowerCase().includes(value.toLowerCase()));
        }
      }
    });
  }

  /**
   * Filter users
   * @param _user -Autocomplete of the users to search
   * @constructor
   */
  UserAssingAutocompleteDisplayWith = (_user: IUser | string): string => {
    if (typeof _user === "string") return _user;

    if (!_user) return '';

    return `${_user.Id} - ${_user.Name} ${_user.LastName}`;
  }

  /**
   * This method is used to inflate table
   * @constructor
   */
  InflateTable(): void {

    this.routes = this.routes.map(r => {
      return {
        ...r,
        RouteAssignment: r.RouteAssignmentId ? this.users.find(u => u.Id === r.RouteAssignmentUserId)?.Email : 'No asignada',
        CreatedDateFmt: formatDate(r.CreatedDate, 'M/d/yy, h:mm a', 'en'),
        FrequencyName: this.routeFrequencies.find(rf => rf.Id === r.RouteFrequencyId)?.Description || '-',
        ExpirationDateFmt: formatDate(r.ExpirationDate, 'M/d/yy, h:mm a', 'en'),
        TypeName: this.routeTypes.find(rt => +(rt.Key) === r.Type)?.Description || '-',
        StatusName: this.routeStatus.find(st => +(st.Key) === r.Status)?.Description || '-'
      }
    });

    const NEW_TABLE_STATE = {
      Records: this.routes
    };

    this.linkerService.Publish({
      Data: JSON.stringify(NEW_TABLE_STATE),
      Target: this.tableId,
      CallBack: CL_CHANNEL.INFLATE
    });
  }

  /**
   * Method to define the resulting events for the table buttons
   * @param _event - Event emitted in the table button when selecting a route
   * @constructor
   */
  OnTableButtonClicked = (_event: ICLEvent): void => {
    if (_event) {
      let buttonClicked: ICLTableButton = JSON.parse(_event.Data) as ICLTableButton;

      let buttonData: IRoute = JSON.parse(buttonClicked.Data!) as IRoute;


      switch (buttonClicked.Action) {
        case CL_ACTIONS.UPDATE:

          if (buttonData.Status == RouteStatus.CLOSED) {
            this.alertsService.Toast({type: CLToastType.INFO, message: 'Ruta estado cerrada'});
            return;
          }

          if (!this.HasPermission('Routes_New_Access')) {
            this.alertsService.Toast({type: CLToastType.INFO, message: 'No cuentas con permisos para editar rutas'});
            return;
          }

          this.router.navigate(['/', 'route', 'new'], {
            queryParams: {
              routeId: buttonData.Id
            }
          });
          break;
        case CL_ACTIONS.OPTION_4:
          if (buttonData.Status == RouteStatus.CLOSED) {
            this.alertsService.Toast({type: CLToastType.INFO, message: 'Ruta estado cerrada'});
            return;
          }

          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {
            relativeTo: this.activatedRoute, queryParams: {
              dialog: 'assign',
              recordId: buttonData.RouteAssignmentId,
              routeId: buttonData.Id
            }
          });
          break;
        case CL_ACTIONS.OPTION_5:
          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {
            relativeTo: this.activatedRoute, queryParams: {
              dialog: 'admins',
              routeId: buttonData.Id
            }
          });
          break;
        case CL_ACTIONS.OPTION_2:
          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {
            relativeTo: this.activatedRoute, queryParams: {
              dialog: 'history',
              routeId: buttonData.Id
            }
          });
          break;
        case CL_ACTIONS.OPTION_3:

          if (buttonData.Status == RouteStatus.CLOSED) {
            this.alertsService.Toast({type: CLToastType.INFO, message: 'Ruta estado cerrada'});
            return;
          }

          if (!this.HasPermission('Routes_List_CloseRoute')) {
            this.alertsService.Toast({type: CLToastType.INFO, message: 'No cuentas con permisos para cerrar rutas'});
            return;
          }
          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {
            relativeTo: this.activatedRoute, queryParams: {
              dialog: 'close-route',
              routeId: buttonData.Id
            }
          });

          break;
      }
    }
  }

  /**
   * Thsi method is used to activated search route
   * @constructor
   */
  SearchRoutes(): void {
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
      Target: this.tableId,
      Data: ''
    });
  }



  /**
   * Methos to load dialog to close route
   * @param _routeId
   * @constructor
   */
  OpenCloseRouteDialog(_routeId: number): void {
    this.matDialog.open(RouteCloseComponent, {
      maxWidth: '100vw',
      minWidth: '40vw',
      maxHeight: 'calc(100vh - 20px)',
      disableClose: true,
      autoFocus: false,
      data: {
        RouteId: _routeId,
        Permissions: [...this.permissions]
      } as IRouteCloseDialogData
    })
      .afterClosed()
      .subscribe({
        next: (result) => {
          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {relativeTo: this.activatedRoute});
          this.SearchRoutes();
        }
      });
  }
  OpenRouteAssigmentDialog(_routeId: number): void {
    this.matDialog.open(RouteAssignmentComponent, {
      maxWidth: '100vw',
      minWidth: '40vw',
      maxHeight: 'calc(100vh - 20px)',
      disableClose: true,
      autoFocus: false,
      data: {
        RouteId: _routeId,
        Permissions: [...this.permissions]
      } as IRouteAssignmentDialogData
    })
      .afterClosed()
      .subscribe({
        next: (result) => {
          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {relativeTo: this.activatedRoute});
          this.SearchRoutes();
        }
      });
  }

  OpenRouteAdministratorsDialog(_routeId: number): void {
    this.matDialog.open(RouteAdministratorsComponent, {
      maxWidth: '100vw',
      minWidth: '40vw',
      minHeight: '35vh',
      maxHeight: 'calc(100vh - 20px)',
      autoFocus: false,
      data: {
        RouteId: _routeId,
        Permissions: [...this.permissions]
      } as IRouteAdministratorsDialogData
    })
      .afterClosed()
      .subscribe({
        next: (result) => {
          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {relativeTo: this.activatedRoute});
        }
      });
  }

  OpenRouteHistoryDialog(_routeId: number): void {
    this.matDialog.open(RouteHistoryComponent, {
      maxWidth: 'calc(100vw - 100px)',
      minWidth: '80vw',
      minHeight: '80vh',
      maxHeight: 'calc(100vh - 100px)',
      autoFocus: false,
      data: {
        Id: _routeId,
      } as IIdDialogData
    })
      .afterClosed()
      .subscribe({
        next: (result) => {
          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {relativeTo: this.activatedRoute});
        }
      });
  }

  OpenUploadRoutesDialog(): void {
    this.matDialog.open(RouteLoadsComponent, {
      maxWidth: 'calc(100vw - 100px)',
      minWidth: '60vw',
      minHeight: '50vh',
      maxHeight: 'calc(100vh - 100px)',
      data: {
        Permissions: [...this.permissions]
      } as IRouteLoadsDialogData
    })
      .afterClosed()
      .subscribe({
        next: (result) => {
          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {relativeTo: this.activatedRoute});
        }
      });
  }

  ReadQueryParameters(): void {
    this.allSubscriptions$.add(this.activatedRoute.queryParams.subscribe(params => {
      if (params['dialog']) {
        let routeId: number = params['routeId'] ? +(params['routeId']) : 0;

        if (params['dialog'] === 'assign' && this.HasPermission('Routes_List_AssignRoute')) {
          if (!routeId) {
            this.alertsService.Toast({
              type: CLToastType.ERROR,
              message: 'Debe enviar el parametro "routeId"'
            });
          } else {
            this.OpenRouteAssigmentDialog(routeId);
          }
        } else if (params['dialog'] === 'admins' && this.HasPermission('Routes_List_SeeRouteAdmins')) {
          if (!routeId) {
            this.alertsService.Toast({type: CLToastType.ERROR, message: 'Debe enviar el parametro "routeId"'});
          } else {
            this.OpenRouteAdministratorsDialog(routeId);
          }
        } else if (params['dialog'] === 'history' && this.HasPermission('Routes_List_SeeRouteHistory')) {
          if (!routeId) {
            this.alertsService.Toast({type: CLToastType.ERROR, message: 'Debe enviar el parametro "routeId"'});
          } else {
            this.OpenRouteHistoryDialog(routeId);
          }
        } else if (params['dialog'] === 'upload-routes' && this.HasPermission('Routes_List_UploadTemplates')) {
          this.OpenUploadRoutesDialog();
        } else if(params['dialog'] === 'close-route' && this.HasPermission('Routes_List_CloseRoute')){
          if (!routeId) {
            this.alertsService.Toast({type: CLToastType.ERROR, message: 'Debe enviar el parametro "routeId"'});
          } else {
            this.OpenCloseRouteDialog(routeId);
          }
        }else {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: 'No cuentas con permisos para acceder a esta vista'
          });
        }
      }
    }));
  }

  ngOnDestroy(): void {
    this.allSubscriptions$.unsubscribe();
  }

  HasPermission(_permissionName: string): boolean {
    return this.permissions.some(p => p.Name === _permissionName);
  }
}
