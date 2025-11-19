import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AlertsService, CLToastType, NotificationPanelService} from '@clavisco/alerts';
import {CLPrint, Repository, Structures} from '@clavisco/core';
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from '@clavisco/linker';
import {OverlayService} from '@clavisco/overlay';
import {ICLTableButton, MapDisplayColumns, MappedColumns} from '@clavisco/table';
import {finalize, forkJoin, Subscription} from 'rxjs';
import {StorageKey} from 'src/app/enums/e-storage-keys';
import {ICompany} from 'src/app/interfaces/i-company';
import {IUserToken} from 'src/app/interfaces/i-token';
import {UserService} from 'src/app/services/user.service';
import {SharedService} from '../../shared/shared.service';
import {IActionButton} from "../../interfaces/i-action-button";
import {LinkerEvent} from "../../enums/e-linker-events";

@Component({
  templateUrl: './company-selection.component.html',
  styleUrls: ['./company-selection.component.scss']
})
export class CompanySelectionComponent implements OnInit,OnDestroy {

  companies!: ICompany[];

  //#region @clavisco/table Configuration
  shouldPaginateRequest:boolean = false;
  tableId: string = 'COMPANIES-TABLE';
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  mappedColumns: MappedColumns;
  hasItemsSelection: boolean = false;
  companySelectionTableColumns: { [key: string]: string } = {
    Id: 'ID',
    Name: 'Nombre de compañía',
    DatabaseCode: 'Base de datos',
    ConnectionId: 'Identificador conección'
  };
  buttons: ICLTableButton[] = [
    {
      Title: `Seleccionar`,
      Action: Structures.Enums.CL_ACTIONS.CONTINUE,
      Icon: `arrow_forward`,
      Color: `primary`,
      Data: ''
    }
  ]
  //#endregion
  actionButtons!: IActionButton[];
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  allSubscriptions!: Subscription;

  constructor(
    private userService: UserService,
    private alertsService: AlertsService,
    private overlayService: OverlayService,
    private sharedService: SharedService,
    private matDialogRef: MatDialogRef<CompanySelectionComponent>,
    @Inject('LinkerService') private linkerService: LinkerService,
    @Inject(MAT_DIALOG_DATA) public data: boolean
  ) {
    this.allSubscriptions = new Subscription();
    this.mappedColumns = MapDisplayColumns(
      {
        dataSource: [] as ICompany[],
        renameColumns: this.companySelectionTableColumns,
        ignoreColumns: ['Id','ConnectionId'],
        stickyColumns: [
          {Name: 'Options', FixOn: 'right'}
        ]
      }
    );
  }

  ngOnDestroy(): void {
    this.allSubscriptions.unsubscribe();
  }

  ngOnInit(): void {
    this.InitVariables();
    this.SetInitialRequest();
    this.TableEvents();

    this.actionButtons = [
      {
        Key: 'CANCELAR',
        MatIcon: 'cancel',
        Text: 'Cancelar',
        MatColor: 'primary'
      }
    ];

    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.onActionButtonClicked, this.callbacks);

    this.allSubscriptions.add(this.sharedService.OnActionButtonClicked(this.onActionButtonClicked));
    this.linkerService.Flow()?.pipe(
      StepDown<CL_CHANNEL>(this.callbacks),
    ).subscribe({
      next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
      error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
    });
  }

  public onActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'CANCELAR':
        this.matDialogRef.close(null);
        break;

    }
  }

  public TableEvents(): void {
    Register<CL_CHANNEL>(this.tableId, CL_CHANNEL.OUTPUT, this.OnCompanySelected, this.callbacks);
  }

  /**
   * Method to select a company
   * @param _event - Event emitted in the table button when selecting a company
   * @constructor
   */
  public OnCompanySelected = (_event: ICLEvent): void => {
    if (_event.Data) {
      const BUTTON_EVENT = JSON.parse(_event.Data);
      const SELECTED_COMPANY = JSON.parse(BUTTON_EVENT.Data) as ICompany;

      switch (BUTTON_EVENT.Action) {
        case Structures.Enums.CL_ACTIONS.CONTINUE:
          this.matDialogRef.close(SELECTED_COMPANY);
          break;
      }
    }
  }

  private InitVariables(): void {
    this.companies = [];
  }

  /**
   * Method that obtains required requests from the component
   * @constructor
   */
  public SetInitialRequest(): void {
    this.overlayService.OnGet();

    let userId: number = +(Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session)?.UserId || 0) ;

    forkJoin({
      Companies: this.userService.GetUserCompanies(userId)
    })
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (callback) => {
          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });

          this.companies = callback.Companies.Data ?? [];

          const NEXT_TABLE_STATE = {
            CurrentPage: 0,
            ItemsPeerPage: 5,
            Records: this.companies.map(x => this.sharedService.MapTableColumns(x, Object.keys(this.companySelectionTableColumns))),
            RecordsCount: this.companies.length,
          };

          this.linkerService.Publish({
            CallBack: CL_CHANNEL.INFLATE,
            Data: JSON.stringify(NEXT_TABLE_STATE),
            Target: this.tableId
          });
        },
        error: (err)=> {
          this.alertsService.ShowAlert({
            HttpErrorResponse: err
          });
        }
      });
  }

}
