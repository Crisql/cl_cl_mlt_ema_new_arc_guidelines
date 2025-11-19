import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertsService, CLToastType} from '@clavisco/alerts';
import {CLPrint, Structures} from '@clavisco/core';
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from '@clavisco/linker';
import {ICLTableButton, MapDisplayColumns, MappedColumns} from '@clavisco/table';
import {Subscription} from 'rxjs';
import {IActionButton} from 'src/app/interfaces/i-action-button';
import {IIdDialogData} from 'src/app/interfaces/i-dialog-data';
import {ILicense} from 'src/app/interfaces/i-license';
import {ILicensesComponentResolvedData} from 'src/app/interfaces/i-resolvers';
import {SharedService} from 'src/app/shared/shared.service';
import {LicensesEditComponent} from './licenses-edit/licenses-edit.component';
import {ICompany} from "@app/interfaces/i-company";

@Component({
  selector: 'app-licenses',
  templateUrl: './licenses.component.html',
  styleUrls: ['./licenses.component.scss']
})
export class LicensesComponent implements OnInit, OnDestroy {

  licenses!: ILicense[];
  companies!: ICompany[];
  tableId: string = "LICENSES-TABLE";
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  tableMappedColumns!: MappedColumns;
  hasItemsSelection: boolean = false;
  tableColumns: { [key: string]: string } = {Id: 'ID', User: 'Usuario', Company: 'Compañía', Active: 'Activo'};
  buttons: ICLTableButton[] = [
    {
      Title: `Editar`,
      Action: Structures.Enums.CL_ACTIONS.UPDATE,
      Icon: `edit`,
      Color: `primary`,
      Data: ''
    }
  ];

  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  allSubscriptions: Subscription;

  actionButtons!: IActionButton[];

  constructor(
    @Inject('LinkerService') private linkerService: LinkerService,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private alertsService: AlertsService,
    private matDialog: MatDialog,
    private router: Router,

  ) {
    this.tableMappedColumns = MapDisplayColumns(
      {
        dataSource: this.licenses,
        renameColumns: this.tableColumns,
        stickyColumns: [
          {Name: 'Options', FixOn: 'right'}
        ],
        ignoreColumns: ['Password']
      }
    );
    this.allSubscriptions = new Subscription();
  }

  ngOnInit(): void {
    this.InitVariables();
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions.unsubscribe();
  }

  InitVariables(): void {
    this.licenses = [];

    this.actionButtons = [
      {
        Key: 'ADD',
        MatIcon: 'add',
        Text: 'Agregar',
        MatColor: 'primary'
      }
    ];

    this.RegisterTableEvents();

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

  HandleResolvedData(): void {
    this.allSubscriptions.add(this.activatedRoute.data.subscribe({
      next: (data) => {
        const resolvedData = data['resolvedData'] as ILicensesComponentResolvedData;

        if (resolvedData) {

          this.companies = resolvedData.Companies;

          this.licenses = (resolvedData.Licenses || []).map(x => this.sharedService.MapTableColumns({
            ...x,
            Company: this.companies.find(c => c.Id === x.CompanyId)?.Name || "-",
            Active: x.IsActive ? 'Sí' : 'No'
          }, Object.keys(this.tableColumns)));

          const NEXT_TABLE_STATE = {
            CurrentPage: 0,
            ItemsPeerPage: 5,
            Records: this.licenses,
            RecordsCount: this.licenses.length,
          };

          this.linkerService.Publish({
            CallBack: CL_CHANNEL.INFLATE,
            Data: JSON.stringify(NEXT_TABLE_STATE),
            Target: this.tableId
          });
        }
      }
    }));
  }

  RegisterTableEvents(): void {
    Register<CL_CHANNEL>(this.tableId, CL_CHANNEL.OUTPUT, this.OnUserTableActionActivated, this.callbacks);
  }

  /**
   *Method to select a license
   * @param _event - Event emitted in the table button when selecting a license
   * @constructor
   */
  OnUserTableActionActivated = (_event: ICLEvent): void => {
    if (_event.Data) {
      const BUTTON_EVENT = JSON.parse(_event.Data);
      const ACTION_LICENSE = JSON.parse(BUTTON_EVENT.Data) as ILicense;

      switch (BUTTON_EVENT.Action) {
        case Structures.Enums.CL_ACTIONS.UPDATE:
          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {
            relativeTo: this.activatedRoute, queryParams: {
              dialog: 'update',
              recordId: ACTION_LICENSE.Id
            }
          });
          break;
      }
    }
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

  OpenEditDialog(_licenseId: number): void {
    this.matDialog.open(LicensesEditComponent, {
      maxWidth: '100vw',
      minWidth: '40vw',
      maxHeight: 'calc(100vh - 20px)',
      disableClose: true,
      data: {
        Id: _licenseId
      } as IIdDialogData
    })
      .afterClosed()
      .subscribe({
        next: (result) => {
          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {relativeTo: this.activatedRoute});
        }
      });
  }

  ReadQueryParameters(): void {
    this.allSubscriptions.add(this.activatedRoute.queryParams.subscribe(params => {
      if (params['dialog']) {
        let recordId: number = params['recordId'] ? +(params['recordId']) : 0;

        if (params['dialog'] === 'update' && !recordId) {
          this.alertsService.Toast({type: CLToastType.ERROR, message: 'Debe enviar el parametro "recordId"'});
        } else {
          this.OpenEditDialog(recordId);
        }
      }
    }));
  }



}
