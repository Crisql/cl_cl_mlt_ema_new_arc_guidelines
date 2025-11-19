import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {IActionButton} from "@app/interfaces/i-action-button";
import {IRouteFrequency} from "@app/interfaces/i-route";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {ICLTableButton, MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {CLPrint, Structures} from "@clavisco/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {MatDialog} from "@angular/material/dialog";
import {EditFrequencyComponent} from "@Component/maintenance/frequencies/edit-frequency/edit-frequency.component";
import {IEditFrequencyDialogData} from "@app/interfaces/i-dialog-data";
import {SharedService} from "@app/shared/shared.service";
import {IRouteFrequenciesResolvedData} from "@app/interfaces/i-resolvers";
import {IStructures} from "@app/interfaces/i-structures";
import {DAYS_OF_WEEK} from "@app/interfaces/i-constants";
import {formatDate} from "@angular/common";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import CL_ACTIONS = Structures.Enums.CL_ACTIONS;

@Component({
  selector: 'app-frequencies',
  templateUrl: './frequencies.component.html',
  styleUrls: ['./frequencies.component.scss']
})
export class FrequenciesComponent implements OnInit, OnDestroy {

  actionButtons: IActionButton[] = [
    {
      Key: 'ADD',
      Text: 'Agregar',
      MatIcon: 'add',
      MatColor: 'primary'
    }
  ];
  daysOfWeek: IStructures[] = [...DAYS_OF_WEEK];
  frequencies: IRouteFrequency[] = [];
  frequenciesWeeks: IStructures[] = [];
  permissions: IPermissionbyUser[] = [];
  shouldPaginateRequest: boolean = false;
  tableId: string = "ROUTE_FREQ_TABLE_ID";
  tableButtons: ICLTableButton[] = [
    {
      Title: 'Editar',
      Action: CL_ACTIONS.UPDATE,
      Icon: 'edit',
      Color: 'primary'
    }
  ];
  mappedColumns: MappedColumns;

  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: []
  };
  allSubscriptions: Subscription;

  constructor(
    @Inject('LinkerService') private linkerService: LinkerService,
    private matDialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService,
    private alertsService: AlertsService
  ) {
    this.allSubscriptions = new Subscription();
    this.mappedColumns = MapDisplayColumns({
      dataSource: this.frequencies,
      stickyColumns: [
        {Name: 'Options', FixOn: 'right'}
      ],
      renameColumns: {
        Id: 'ID',
        Description: 'Descripción',
        DaysFtm: 'Días',
        WeeksFtm: 'Semanas',
        CreatedDateFtm: 'Fecha de creación',
        CreatedBy: 'Creada por',
        IsActiveFtm: 'Activa',
      },
      ignoreColumns: ['Active', 'IsActive', 'UpdatedBy', 'UpdateDate', 'Weeks', 'Days', 'CreatedDate']
    });
  }

  ngOnDestroy(): void {
    this.allSubscriptions.unsubscribe();
  }

  ngOnInit(): void {
    Register<CL_CHANNEL>(this.tableId, CL_CHANNEL.OUTPUT, this.OnTableButtonClicked, this.callbacks);
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
    this.activatedRoute.data.subscribe({
      next: (data) => {
        const resolvedData = data['resolvedData'] as IRouteFrequenciesResolvedData;
        if (resolvedData) {
          this.frequencies = resolvedData.Frequencies ?? [];
          this.frequenciesWeeks = resolvedData.FrequenciesWeeks;
          this.permissions = resolvedData.Permissions;
          this.InflateTable();
        }
      }
    })
  }

  /**
   * Method to define the resulting events for the table buttons
   * @param _event - Event emitted in the table button when selecting a frequency
   * @constructor
   */
  OnTableButtonClicked = (_event: ICLEvent): void => {
    if (_event && _event.Data) {
      let clickedButton = JSON.parse(_event.Data) as ICLTableButton;
      let clickedFrequency = JSON.parse(clickedButton.Data!) as IRouteFrequency;

      switch (clickedButton.Action) {
        case Structures.Enums.CL_ACTIONS.UPDATE:
          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {
            relativeTo: this.activatedRoute, queryParams: {
              dialog: 'update',
              recordId: clickedFrequency.Id
            }
          });
          break;
      }
    }
  }

  /**
   * Method to handle the click event of an action button and perform corresponding actions.
   * @param _actionButton The action button object containing information about the button.
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
    }
  }

  ReadQueryParameters(): void {
    this.allSubscriptions.add(this.activatedRoute.queryParams.subscribe({
      next: (params) => {
        let dialogType = params['dialog'];

        if (dialogType === 'create') {
          this.OpenEditFrequeciesDialog(0);
        } else if (dialogType === 'update') {
          let recordId = +(params['recordId']);

          if (!recordId || isNaN(recordId)) {
            this.alertsService.Toast({
              type: CLToastType.INFO,
              message: 'El parámetro "recordId" no fue definido o no tiene el formato correcto'
            });
          } else {
            this.OpenEditFrequeciesDialog(recordId);
          }
        }
      }
    }));
  }

  OpenEditFrequeciesDialog(_recordId: number): void {
    this.matDialog.open(EditFrequencyComponent, {
      maxWidth: 'calc(100vw - 100px)',
      maxHeight: 'calc(100vh - 100px)',
      minWidth: '50vw',
      minHeight: '20vh',
      data: {
        FrequencyId: _recordId,
        Permissions: [...this.permissions]
      } as IEditFrequencyDialogData
    })
      .afterClosed()
      .subscribe({
        next: (result) => {
          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {relativeTo: this.activatedRoute});
        }
      });
  }

  InflateTable(): void {
    this.frequencies = this.frequencies.map(rf => ({
      ...rf,
      DaysFtm: this.daysOfWeek.filter(d => rf.Days.includes(d.Key)).map(d => d.Description).join(', '),
      CreatedDateFtm: formatDate(rf.CreatedDate, 'M/d/yy, h:mm a', 'en'),
      IsActiveFtm: rf.IsActive ? 'Sí' : 'No',
      WeeksFtm: this.frequenciesWeeks.find(fw => fw.Key === rf.Weeks)?.Description || '-'
    }));
    const NEW_TABLE_STATE = {
      Records: this.frequencies,
      RecordsCount: this.frequencies.length
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEW_TABLE_STATE),
      Target: this.tableId
    });
  }

  // HasPermission(_permName: string): boolean {
  //   return this.permissions.some(p => p.Name === _permName);
  // }
}
