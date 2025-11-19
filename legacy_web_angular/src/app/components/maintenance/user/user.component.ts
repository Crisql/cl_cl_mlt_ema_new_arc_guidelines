import {ComponentType} from '@angular/cdk/portal';
import {AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertsService, CLToastType} from '@clavisco/alerts';
import {CLPrint, Structures} from '@clavisco/core';
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from '@clavisco/linker';
import {ICLTableButton, MapDisplayColumns, MappedColumns} from '@clavisco/table';
import {Subscription} from 'rxjs';
import {LinkerEvent} from 'src/app/enums/e-linker-events';
import {UserPageTabIndexes} from 'src/app/enums/enums';
import {IActionButton} from 'src/app/interfaces/i-action-button';
import {ICompany} from 'src/app/interfaces/i-company';
import {IUserAssingDialogData, IUserDialogData} from 'src/app/interfaces/i-dialog-data';
import {ILicense} from 'src/app/interfaces/i-license';
import {IUserComponentResolvedData} from 'src/app/interfaces/i-resolvers';
import {IUser} from 'src/app/interfaces/i-user';
import {SharedService} from 'src/app/shared/shared.service';
import {IUserAssign} from '../../../interfaces/i-user';
import {UserAssignEditComponent} from './user-assign-edit/user-assign-edit.component';
import {UserEditComponent} from './user-edit/user-edit.component';
import {ISettings} from "@app/interfaces/i-settings";
import {SeriesEditComponent} from "@Component/maintenance/user/series-edit/series-edit.component";
import {
  LocalPrinterEditComponent
} from "@Component/maintenance/user/local-printer-edit/local-printer-edit/local-printer-edit.component";

@Component({
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, OnDestroy, AfterViewInit {

  users!: IUser[];
  usersAssigns!: IUserAssign[];
  companies!: ICompany[];
  licenses!: ILicense[];
  selectedTabIndex: number = 0;
  routeQueryParams$!: Subscription;
  //#region @clavisco/table Configuration
  shouldPaginateRequest: boolean = false;
  userTableId: string = 'USERS-TABLE';
  userAssignTableId: string = 'USERS-ASSING-TABLE';
  currentTableId!: string;
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  userMappedColumns!: MappedColumns;
  userAssignMappedColumns!: MappedColumns;
  hasItemsSelection: boolean = false;
  userAssignTableColumns!: { [key: string]: string };
  userTableColumns!: { [key: string]: string };
  buttonsUser: ICLTableButton[] = [
    {
      Title: `Editar`,
      Action: Structures.Enums.CL_ACTIONS.UPDATE,
      Icon: `edit`,
      Color: `primary`,
      Data: ''
    }
  ]

  buttonsAssignUser: ICLTableButton[] = [
    {
      Title: `Editar`,
      Action: Structures.Enums.CL_ACTIONS.UPDATE,
      Icon: `edit`,
      Color: `primary`,
      Data: ''
    },
    {
      Title: `Editar series`,
      Action: Structures.Enums.CL_ACTIONS.OPTION_1,
      Icon: `123`,
      Color: `primary`,
      Data: ''
    },
    {
      Title: `Editar impresoras`,
      Action: Structures.Enums.CL_ACTIONS.OPTION_2,
      Icon: `print`,
      Color: `primary`,
      Data: ''
    }
  ]

  //#endregion

  actionButtons!: IActionButton[];
  schedulingSetting: ISettings | undefined;

  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };

  allSubscriptions: Subscription;
  @ViewChild('actionButtonsComp') actionButtonsComp!: ElementRef;
  @ViewChild('usersTab') usersTab!: ElementRef;

  constructor(
    @Inject('LinkerService') private linkerService: LinkerService,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService,
    private matDialog: MatDialog,
    private router: Router,
    private alertsService: AlertsService
  ) {

    this.userTableColumns = {Id: 'ID', Name: 'Nombre', LastName: 'Apellido', Email: 'Correo', Active: 'Activo'};
    this.userMappedColumns = MapDisplayColumns(
      {
        dataSource: this.users as IUser[],
        renameColumns: this.userTableColumns,
        stickyColumns: [
          {Name: 'Options', FixOn: 'right'}
        ],
        ignoreColumns: ['Password']
      }
    );
    this.userAssignTableColumns = {
      Id: 'ID',
      CompanyName: 'Compañía',
      UserEmail: 'Usuario',
      LicenseUser: 'Licencia',
      SlpCode: 'Cod. Vendedor',
      CenterCost: 'Centro de costos',
      WhsCode: 'Cod. Almacén',
      Discount: 'Descuento',
      Active: 'Activo'
    };
    this.userAssignMappedColumns = MapDisplayColumns(
      {
        dataSource: this.usersAssigns as IUserAssign[],
        stickyColumns: [
          {Name: 'Options', FixOn: 'right'}
        ],
        renameColumns: this.userAssignTableColumns,
      }
    );
    this.allSubscriptions = new Subscription();
  }

  /**
   * Method is executed after Angular initializes the component views
   */
  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.RegisterTableEvents();
    this.RegisterActionButtonsEvents();
    this.InitVariables();
    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );

    this.HandleResolvedData();

    this.ReadQueryParameters();
  }

  ngOnDestroy(): void {
    this.allSubscriptions.unsubscribe();
  }

  RegisterTableEvents(): void {
    Register<CL_CHANNEL>(this.userTableId, CL_CHANNEL.OUTPUT, this.OnUserTableActionActivated, this.callbacks);
    Register<CL_CHANNEL>(this.userAssignTableId, CL_CHANNEL.OUTPUT, this.OnUserTableActionActivated, this.callbacks);
  }

  RegisterActionButtonsEvents(): void {
    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.OnActionButtonClicked, this.callbacks);
  }

  /**
   *Method to select a user
   * @param _event - Event emitted in the table button when selecting a user
   * @constructor
   */
  OnUserTableActionActivated = (_event: ICLEvent): void => {
    if (_event.Data) {
      const BUTTON_EVENT = JSON.parse(_event.Data);
      const ACTION_USER = JSON.parse(BUTTON_EVENT.Data) as IUser;

      switch (BUTTON_EVENT.Action) {
        case Structures.Enums.CL_ACTIONS.UPDATE:
          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {
            relativeTo: this.activatedRoute, queryParams: {
              dialog: 'update',
              recordId: ACTION_USER.Id
            }
          });
          break;
        //agregue
        case Structures.Enums.CL_ACTIONS.OPTION_1:
          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {
            relativeTo: this.activatedRoute, queryParams: {
              dialog: 'updateSerie',
              recordId: ACTION_USER.Id
            }
          });
          break;
        case Structures.Enums.CL_ACTIONS.OPTION_2:
          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {
            relativeTo: this.activatedRoute, queryParams: {
              dialog: 'localPrint',
              recordId: ACTION_USER.Id
            }
          });
          break;
      }
    }
  }

  InitVariables(): void {
    this.users = [];
    this.usersAssigns = [];
    this.companies = [];
    this.licenses = [];

    this.actionButtons = [
      {
        Key: 'ADD',
        MatIcon: 'add',
        Text: 'Agregar',
        MatColor: 'primary'
      }
    ];

    this.allSubscriptions.add(this.sharedService.OnActionButtonClicked(this.OnActionButtonClicked));
  }

  HandleResolvedData(): void {
    this.activatedRoute.data.subscribe({
      next: (data) => {
        const resolvedData = data['resolvedData'] as IUserComponentResolvedData;

        if (resolvedData) {
          let listToSet: IUser[] | IUserAssign[] = [];

          let tableIdToInflate: string = '';

          if (resolvedData.UsersAssigns) {
            this.companies = resolvedData.Companies || [];

            this.users = resolvedData.Users || [];

            this.licenses = resolvedData.Licenses || [];


            // Mapeo el nombre de usuario, compañía, licencia
            this.usersAssigns = listToSet = (resolvedData.UsersAssigns || [])
              .map(x => this.sharedService.MapTableColumns({
                ...x,
                Active: x.IsActive ? 'Sí' : 'No',
                UserEmail: this.users.find(u => u.Id == x.UserId)?.Email || '-',
                CompanyName: this.companies.find(c => c.Id == x.CompanyId)?.Name || '-',
                LicenseUser: this.licenses.find(l => l.Id == x.LicenseId)?.User || '-',
              }, Object.keys(this.userAssignTableColumns)));

            tableIdToInflate = this.userAssignTableId;

            this.selectedTabIndex = 1;
          } else if (resolvedData.Users) {
            this.schedulingSetting = resolvedData.SchedulingSetting;

            this.users = listToSet = (resolvedData.Users || []).map(x => this.sharedService.MapTableColumns({
              ...x,
              Active: x.IsActive ? 'Sí' : 'No'
            }, Object.keys(this.userTableColumns)));

            tableIdToInflate = this.userTableId;

            this.selectedTabIndex = 0;
          }

          this.currentTableId = tableIdToInflate;

          const NEXT_TABLE_STATE = {
            CurrentPage: 0,
            ItemsPeerPage: 5,
            Records: listToSet,
            RecordsCount: listToSet.length,
          };

          this.linkerService.Publish({
            CallBack: CL_CHANNEL.INFLATE,
            Data: JSON.stringify(NEXT_TABLE_STATE),
            Target: tableIdToInflate
          });
        }
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
    }
  }

  OpenEditDialog(_userId: number, _editSerie: boolean): void {
    let minWidth: string = '';
    let component: ComponentType<UserAssignEditComponent | UserEditComponent | SeriesEditComponent>;
    let modalId = '';


    if (this.selectedTabIndex == UserPageTabIndexes.UserAssign) {
      if (_editSerie) {
        minWidth = '75vw';
        component = SeriesEditComponent;
        modalId = 'serie-modal';
      } else {
        minWidth = '75vw';
        component = UserAssignEditComponent;
        modalId = 'assing-modal';
      }

    } else {
      minWidth = '40vw';
      component = UserEditComponent;
      modalId = 'user-modal';
    }

    this.matDialog.open(component, {
      id: modalId,
      maxWidth: '90vw',
      minWidth,
      maxHeight: 'calc(100vh - 20px)',
      disableClose: true,
      autoFocus: !_editSerie,
      data: {
        UserId: _userId,
        SchedulingSetting: this.schedulingSetting
      } as IUserDialogData
    })
      .afterClosed()
      .subscribe({
        next: (result) => {
          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {relativeTo: this.activatedRoute});
        }
      });
  }

  OpenEditLocalPrintDialog(_userId: number): void {

    this.matDialog.open(LocalPrinterEditComponent, {
      id: 'local-print-modal',
      width: '20%',
      maxWidth: '100px',
      height: 'auto',
      maxHeight: '20%',
      minWidth:'40vw',
      disableClose: true,
      data: {
        UserAssingId: _userId,
      } as IUserAssingDialogData
    })
      .afterClosed()
      .subscribe({
        next: (result) => {
          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {relativeTo: this.activatedRoute});
        }
      });
  }

  /**
   * Read query parameters to show dialog
   */
  ReadQueryParameters(): void {
    this.allSubscriptions.add(this.activatedRoute.queryParams.subscribe(params => {
      if (params['dialog']) {
        let recordId: number = params['recordId'] ? +(params['recordId']) : 0;

        if (params['dialog'] === 'update' || params['dialog'] === 'updateSerie' && !recordId) {
          this.alertsService.Toast({type: CLToastType.ERROR, message: 'Debe enviar el parametro "recordId"'});
        }

        if (params['dialog'] === 'updateSerie') {
          this.OpenEditDialog(recordId, true);
        } else if(params['dialog'] === 'localPrint'){
          this.OpenEditLocalPrintDialog(recordId)
        }else{
          this.OpenEditDialog(recordId, false);
        }
      }
    }));
  }

  OnTabIndexChange(_tapIndex: any): void {
    this.selectedTabIndex = _tapIndex;

    let path: string[] = [];

    switch (this.selectedTabIndex) {
      case UserPageTabIndexes.User:
        path = ['/maintenance', 'users'];
        break;
      case UserPageTabIndexes.UserAssign:
        path = ['/maintenance', 'users', 'assigns'];
        break;
    }

    this.router.navigate(path);
  }

  EmitActionButtonClickEvent(_actionButton: IActionButton): void {
    this.sharedService.EmitActionButtonClickEvent(_actionButton);
  }
}
