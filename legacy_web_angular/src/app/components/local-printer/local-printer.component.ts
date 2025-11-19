import {Component, Inject, OnInit} from '@angular/core';
import {ILocalPrinterComponentResolvedData} from "@app/interfaces/i-resolvers";
import {ActivatedRoute} from "@angular/router";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {IPrinter} from "@app/interfaces/i-printer-worker";
import {ILocalPrinter} from "@app/interfaces/i-local-printer";
import {MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {SharedService} from "@app/shared/shared.service";
import {CLPrint, GetError, Structures} from "@clavisco/core";
import {finalize, Observable, Subscription} from "rxjs";
import {AlertsService, CLModalType, CLToastType, ModalService} from "@clavisco/alerts";
import {OverlayService} from "@clavisco/overlay";
import {PrinterWorkerService} from "@app/services/printer-worker.service";
import {IActionButton} from "@app/interfaces/i-action-button";
import {LinkerEvent} from "@app/enums/e-linker-events";
import {IRowByEvent} from "@clavisco/table/lib/table.space";
import {LocalPrinterService} from "@app/services/local-printer.service";

@Component({
  selector: 'app-local-printer',
  templateUrl: './local-printer.component.html',
  styleUrls: ['./local-printer.component.scss']
})
export class LocalPrinterComponent implements OnInit {
  allSubscriptions: Subscription;
  userAssingLocalPrinter!: ILocalPrinter;

  //printers
  printerWorkerTableId: string = "PRINTER-WORKER-TABLE";
  printerWorkerMappedColumns: MappedColumns;
  printerWorkerCheckboxColumns: string[] = ['Assigned'];
  hasItemsSelectionPrintWorker: boolean = false;
  printerWorkers: IPrinter[] = [];
  tablePrinterWorkerColumns = {
    Assigned: 'Seleccionar',
    Name: 'Nombre'
  }
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };

  actionButtons!: IActionButton[];

  constructor(private activatedRoute: ActivatedRoute,
              private sharedService: SharedService,
              @Inject('LinkerService') private linkerService: LinkerService,
              private overlayService: OverlayService,
              private alertsService: AlertsService,
              private printerWorkerService: PrinterWorkerService,
              private localPrinterService: LocalPrinterService,
              private modalService: ModalService) {
    this.printerWorkerMappedColumns = MapDisplayColumns(
      {
        dataSource: this.printerWorkers,
        renameColumns: this.tablePrinterWorkerColumns,
      }
    );

    this.allSubscriptions = new Subscription();
  }
  ngOnDestroy(): void {
    this.allSubscriptions.unsubscribe();
  }
  ngOnInit(): void {
    this.OnLoad();
  }
  private OnLoad(): void {
    this.InitVariables();
    this.RegisterActionButtonsEvents();
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
  }

  InitVariables(): void {
    this.printerWorkers = [];
    this.actionButtons = [
      {
        Key: 'SEARCH',
        MatIcon: 'search',
        Text: 'Buscar',
        MatColor: 'primary'
      },
      {
        Key: 'SAVE',
        MatIcon: 'save',
        Text: 'Guardar',
        MatColor: 'primary'
      }
    ];

    this.allSubscriptions.add(this.sharedService.OnActionButtonClicked(this.OnActionButtonClicked));
  }

  RegisterActionButtonsEvents(): void {
    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.OnActionButtonClicked, this.callbacks);
  }
  RegisterTableEvents(): void {
    Register<CL_CHANNEL>(this.printerWorkerTableId, CL_CHANNEL.OUTPUT_3, this.EventColumnTablePrinterWorker, this.callbacks);
  }

  /**
   * Method to update a table record
   * @param _event - Event emitted from the table to edit
   * @constructor
   */
  private EventColumnTablePrinterWorker = (_event: ICLEvent): void => {

    let data: IRowByEvent<IPrinter> = JSON.parse(_event.Data);
    this.printerWorkers.forEach(p => p.Assigned = false);

    if (data.Row.Assigned) {
      this.printerWorkers[data.RowIndex].Assigned = true;

    }
    this.userAssingLocalPrinter.PrinterName = this.printerWorkers.find(x=>x.Assigned)?.Name || '';

    this.InflatePrinterWorkerTable();
  }
  OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'SEARCH':
        this.FindPrinter();
        break;
        case 'SAVE':
        this.Save();
        break;
    }
  }
  HandleResolvedData(): void {
    this.activatedRoute.data.subscribe({
      next: (data) => {
        const resolvedData = data['resolvedData'] as ILocalPrinterComponentResolvedData;

        if (resolvedData) {
          this.userAssingLocalPrinter = resolvedData.LocalPriter;

          if(resolvedData.Printers){
            this.printerWorkers = (resolvedData.Printers || []).map(x => this.sharedService.MapTableColumns({
              ...x,
              Assigned: x.Name === this.userAssingLocalPrinter.PrinterName,
            }, Object.keys(this.tablePrinterWorkerColumns)));
            this.userAssingLocalPrinter.PrinterName = this.printerWorkers.find(x=>x.Assigned)?.Name || '';
            this.InflatePrinterWorkerTable();
          }

        }
      }
    });
  }

  InflatePrinterWorkerTable(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.printerWorkers,
      RecordsCount: this.printerWorkers.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.printerWorkerTableId
    })
  }

  ngAfterViewInit(): void {
    this.sharedService.PageInit();
  }

  public FindPrinter(): void {
    if(this.userAssingLocalPrinter?.UseLocalPrint) {

      if (!this.userAssingLocalPrinter.PortServicePrintMethod) {
        this.alertsService.Toast({
          message: `Seleccione URL para el servicio de impresora local`,
          type: CLToastType.INFO
        });
        return;
      }
      this.printerWorkers = [];
      this.InflatePrinterWorkerTable();

      this.overlayService.OnPost();
      this.printerWorkerService.Get(this.userAssingLocalPrinter.PortServicePrintMethod)
        .pipe(finalize(() => this.overlayService.Drop()))
        .subscribe({
          next: (callback) => {
            this.printerWorkers = (callback.Data || []).map(x => this.sharedService.MapTableColumns({
              ...x,
              Assigned: x.Name === this.userAssingLocalPrinter.PrinterName,
            }, Object.keys(this.tablePrinterWorkerColumns)));

            this.InflatePrinterWorkerTable();
          },
          error: (err) => {
            console.log(err);
          }
        });
    }

  }

  Save(): void {



    if (this.userAssingLocalPrinter.UseLocalPrint && !this.userAssingLocalPrinter.PrinterName) {
      this.alertsService.Toast({
        message: `Seleccione impresora local`,
        type: CLToastType.INFO
      });
      return;
    }


    this.overlayService.OnPost();

    this.localPrinterService.PatchPrinterName(this.userAssingLocalPrinter)
      .pipe(
        finalize(() => this.overlayService.Drop())
      )
      .subscribe({
        next: (callback) => {
          this.modalService.Continue({
            title: `Configuración impresoras actualizada correctamente`,
            type: CLModalType.SUCCESS
          });

        },
        error: (err) => {
          this.modalService.Continue({
            title: `Se produjo un error actualizando la configuración de impresoras`,
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      });
  }
}
