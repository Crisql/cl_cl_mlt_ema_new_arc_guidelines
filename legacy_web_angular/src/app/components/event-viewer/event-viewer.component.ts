import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {IActionButton} from "@app/interfaces/i-action-button";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {filter, finalize, map, Subscription} from "rxjs";
import {OverlayService} from "@clavisco/overlay";
import {SharedService} from "@app/shared/shared.service";
import {LinkerEvent} from "@app/enums/e-linker-events";
import {CLPrint, Structures} from "@clavisco/core";
import {Event} from "@app/enums/enums";
import {ILogEvent, ILogEventFilter} from "@app/interfaces/i-log-event";
import {LogEventsService} from "@app/services/log-events.service";
import {formatDate} from "@angular/common";
import {CLToastType} from "@clavisco/alerts";

@Component({
  selector: 'app-event-viewer',
  templateUrl: './event-viewer.component.html',
  styleUrls: ['./event-viewer.component.scss']
})
export class EventViewerComponent implements OnInit, OnDestroy {

  /*Observables*/

  /*Lists*/
  permissions: IPermissionbyUser[] = []
  events: {key: string, value: string}[] = Object.keys(Event).map((key: string) => { return {key: key, value: Event[key as keyof typeof Event]}})
  actionButtons: IActionButton[] = [];
  logEvents: ILogEvent[] = [];

  /*Forms*/
  searchForm!: FormGroup;

  /*Table*/
  shouldPaginateRequest:boolean = false;
  logEventsTableId: string = "LOG-EVENTS-TABLE";
  logEventsMappedColumns!: MappedColumns;
  itemsPeerPage: number = 10;
  hasPaginator: boolean = true;
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  allSubscriptions: Subscription;
  logEventsTableColumns: { [key: string]: string } = {
    CreatedDate: 'Fecha',
    CreatedBy: 'Usuario',
    Event: 'Evento',
    View: 'Vista',
    Detail: 'Detalles'
  }
  constructor(
    @Inject('LinkerService') private linkerService: LinkerService,
    private overlayService: OverlayService,
    private sharedService: SharedService,
    private formBuilder: FormBuilder,
    private logEventsService: LogEventsService
  ) {
    this.allSubscriptions = new Subscription();
    this.logEventsMappedColumns = MapDisplayColumns({
      dataSource: this.logEvents,
      renameColumns: this.logEventsTableColumns,
      // iconColumns: ['Event'],
      ignoreColumns: ['DocumentKey', 'Id', 'UpdateDate', 'UpdatedBy', 'IsActive']
    });
  }

  ngOnInit(): void {
    this.OnLoad();
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions.unsubscribe();
  }

  private OnLoad(): void {
    this.InitializeForm();
    this.actionButtons = [
      {
        Key: 'SEARCH',
        MatIcon: 'search',
        Text: 'Buscar',
        MatColor: 'primary',
        DisabledIf: _form => _form!.invalid
      }
    ]

    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.OnActionButtonClicked, this.callbacks);

    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );
  }

  public OnActionButtonClicked(_actionButton: IActionButton): void {

    switch (_actionButton.Key) {
      case 'SEARCH':
        this.SearchLogEvents();
        break;
    }
  }

  private InitializeForm(): void {
    this.searchForm = this.formBuilder.group({
      From: [new Date(), Validators.required],
      To: [new Date(), Validators.required],
      Event: [''],
      Filter: ['']
    });
  }

  private InflateTable(): void {
    const NEW_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 10,
      Records: this.logEvents,
      RecordsCount: this.logEvents.length
    };
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Target: this.logEventsTableId,
      Data: JSON.stringify(NEW_TABLE_STATE)
    } as ICLEvent);
  }

  public SearchLogEvents(): void{
    let searchData = {...this.searchForm.getRawValue(), Skip: 0, Take: 10} as ILogEventFilter;

    this.overlayService.OnGet();
    this.logEventsService.GetFiltered<ILogEvent[]>(searchData.Filter, searchData.Event, searchData.From, searchData.To, searchData.Skip, searchData.Take).pipe(
      filter(res => {
        return !!(res.Data && res.Data.length > 0);
      }),
      map(callback => callback.Data.map(event => {
        return {...event, Event: this.EventDescription(event.Event), CreatedDate: formatDate(event.CreatedDate, 'd/MM/y h:mm:ss a', 'en')}
      })),
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (callback) => {
        this.logEvents = callback;
        this.InflateTable();
      }
    });
  }

  EventIcon(_event: Event): string
  {
    switch(_event)
    {
      case Event.Error:
        return 'cancel';
      case Event.Information:
        return 'error';
      case Event.Success:
        return 'check_circle';
      case Event.Warning:
        return 'warning';
      default:
        return 'lens';
    }
  }

  EventColor(_event: Event): string
  {
    switch(_event)
    {
      case Event.Error:
        return 'error';
      case Event.Information:
        return 'information';
      case Event.Success:
        return 'success';
      case Event.Warning:
        return 'warning';
      default:
        return 'black';
    }
  }

  EventDescription(_event: string): string
  {
    switch(_event)
    {
      case Event.Error:
        return 'Error';
      case Event.Information:
        return 'Información';
      case Event.Success:
        return 'Éxito';
      case Event.Warning:
        return 'Advertencia';
      default:
        return 'Todos';
    }
  }
}
