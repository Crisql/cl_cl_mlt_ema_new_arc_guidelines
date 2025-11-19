import {Component, Inject, OnInit} from '@angular/core';
import {IProcessedRoute} from "@app/interfaces/i-route";
import {OverlayService} from "@clavisco/overlay";
import {
  CLPrint,
  DownloadBase64File,
  GetError,
  Miscellaneous,
  PrintBase64File,
  Repository,
  Structures
} from "@clavisco/core";
import {RouteCalculationService} from "@app/services/route-calculation.service";
import {catchError, concatMap, finalize, from, of, Subject, Subscription} from "rxjs";
import {AlertsService, CLModalType, CLToastType, ModalService} from "@clavisco/alerts";
import {RouteService} from "@app/services/route.service";
import {IActionButton} from "@app/interfaces/i-action-button";
import {MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FilesService} from "@app/services/files.service";
import {CL_CHANNEL, ICLCallbacksInterface, LinkerService, Run, StepDown} from "@clavisco/linker";
import CL_DISPLAY = Structures.Enums.CL_DISPLAY;
import {delay} from "rxjs/operators";
import {IRouteLoadsDialogData} from "@app/interfaces/i-dialog-data";

@Component({
  selector: 'app-route-loads',
  templateUrl: './route-loads.component.html',
  styleUrls: ['./route-loads.component.scss']
})
export class RouteLoadsComponent implements OnInit {

  processedRoutes: IProcessedRoute[] = [];
  estimatingCounter: number = 0;
  private estimating$ = new Subject<number>();
  file: File | undefined;

  fileSpaceText: string = "Arrastrar y soltar o dar click";

  actionButtons: IActionButton[] = [
    {
      Key: 'DOWNLOAD_TEMPLATE',
      MatIcon: 'cloud_download',
      MatColor: 'primary',
      Text: 'Descargar plantilla'
    },
    {
      Key: 'CREATE',
      MatIcon: 'add_circle',
      MatColor: 'primary',
      Text: 'Crear rutas'
    },
    {
      Key: 'CANCEL',
      MatIcon: 'cancel',
      MatColor: 'primary',
      Text: 'Cancelar'
    },
  ];

  shouldPaginateRequest: boolean = false;
  tableId: string = 'PROCESSED_ROUTE_TB_ID';
  mappedColumns!: MappedColumns;

  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: []
  };

  allSubscriptions$: Subscription;
  routesCreated: boolean = false;

  constructor(
    private overlayService: OverlayService,
    private alertsService: AlertsService,
    private routeService: RouteService,
    private matDialogRef: MatDialogRef<RouteLoadsComponent>,
    private filesService: FilesService,
    @Inject(MAT_DIALOG_DATA) private data: IRouteLoadsDialogData,
    @Inject('LinkerService') private linkerService: LinkerService,
    private routeCalculationService: RouteCalculationService,
    private modalService: ModalService
  ) {
    this.allSubscriptions$ = new Subscription();
    this.mappedColumns = MapDisplayColumns({
      dataSource: this.processedRoutes,
      renameColumns: {
        Index: '#',
        Name: 'Nombre',
        StrEstimate: 'Estimate',
        Locations: 'Ubicaciones',
        Result: 'Detalles'
      },
      ignoreColumns: ['Route', 'RouteLines', 'UserAssigned', 'Estimate', 'EstimateJson', 'Status'],
      stickyColumns: [
        {
          Name: 'Index',
          FixOn: 'left'
        },
        {
          Name: 'Name',
          FixOn: 'left'
        },
        {
          Name: 'StrEstimate',
          FixOn: 'left'
        },
        {
          Name: 'Locations',
          FixOn: 'left'
        }
      ]
    })
  }

  ngOnInit(): void {

    this.allSubscriptions$.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );

    //Acciones al finalizar estimaciones
    this.allSubscriptions$.add(this.estimating$
      .pipe(delay(0))
      .subscribe(counter => {
        this.estimatingCounter += counter;

        if (this.processedRoutes.length > 0) {
          if (this.estimatingCounter >= this.processedRoutes.length) {
            this.overlayService.Drop();
            this.CreateRoutes();
          }
        }
      }));
  }

  /**
   * Method to estimate route calculations
   * @constructor
   */
  EstimateRouteCalculationDetails(): void {
    try {
      this.overlayService.OnPost();

      for (let processedRoute of this.processedRoutes) {
        if (processedRoute.Estimate) {
          this.EstimatedRoute(processedRoute)
            .then(result => {
              this.estimating$.next(1);
            }).catch(error => {
            processedRoute.Result = error;
            this.estimating$.next(1);
          });
        } else {
          this.estimating$.next(1);
        }
      }
    } catch (exception) {
      this.overlayService.Drop();
      CLPrint(exception, CL_DISPLAY.ERROR);
    }
  }

  async EstimatedRoute(processedRoute: IProcessedRoute): Promise<IProcessedRoute> {
    processedRoute.Route.TotalEstimatedDistance = 0;
    processedRoute.Route.TotalEstimatedDuration = 0;

    try {
      let result = await this.routeCalculationService.CalculateRoute(processedRoute.RouteLines);

      result.forEach(matrix => {
        if (matrix.rows) {
          matrix.rows.forEach(row => {
            row.elements.forEach(element => {
              if (element.status === 'OK') {
                processedRoute.Route.TotalEstimatedDistance += element.distance.value;
                processedRoute.Route.TotalEstimatedDuration += element.duration.value;
              }
            });
          });
        }
      });

      processedRoute.EstimateJson = JSON.stringify(result);
    } catch (exception) {
      CLPrint(exception, CL_DISPLAY.ERROR);
    } finally {
      return processedRoute;
    }
  }

  PrepareFilesList(files: File[]): void {
    try {
      this.routesCreated = false;

      if (['XLS', 'XLSX', 'CSV'].includes(files[0]?.name.split('.').pop()?.toUpperCase() || '0')) {
        this.file = files[0];
      } else {
        this.alertsService.Toast({type: CLToastType.INFO, message: 'Solo se permiten archivos .xls, .xlsx o .csv'});
      }

      (<HTMLInputElement>document.getElementById('fileID')).value = '';

      this.ProcessRouteTemplate();

    } catch (exception) {
      console.log(exception);
    }
  }

  ProcessRouteTemplate(): void {
    const formData = new FormData();

    this.processedRoutes = [];

    if (!this.file) {
      this.alertsService.Toast({type: CLToastType.INFO, message: 'Debe agregar una plantilla'});
      return;
    }

    formData.append('file', this.file!);

    this.overlayService.OnPost();

    this.filesService.ProcessRouteTemplate(formData)
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (response) => {
          this.alertsService.ShowAlert({Response: response});
          this.processedRoutes = response.Data || [];
          this.InflateTable();
        },
        error: (err) => {
          this.modalService.Continue({
            title: 'Se produjo un error al cargar la plantilla',
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      });
  }

  DownloadRouteTemplate(): void {
    this.overlayService.OnGet();

    this.filesService.DownloadRouteTemplate()
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (response) => {
          this.alertsService.ShowAlert({Response: response});
          if (response.Data) DownloadBase64File(response.Data.Base64, response.Data.FileName, response.Data.BlobType, response.Data.FileExtension);
        },
        error: (err) => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      });
  }

  OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'CREATE':
        if (!this.processedRoutes.length) {
          this.alertsService.Toast({type: CLToastType.INFO, message: 'No hay rutas por crear'});
          break;
        }

        if (this.processedRoutes.every(x => !x.Status)) {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: 'Todas las rutas presentan errores, corríjalos y vuelva a intentar'
          });
          break;
        }

        this.EstimateRouteCalculationDetails();
        break;
      case 'DOWNLOAD_TEMPLATE':
        this.DownloadRouteTemplate();
        break;
      case 'CANCEL':
        this.matDialogRef.close(false);
        break;
    }
  }

  /**
   * Load template of routes
   * @param _event - File to load
   * @constructor
   */
  OnAttachTemplate(_event: any): void {
    this.fileSpaceText = _event.target.files[0].name;
    this.PrepareFilesList(_event.target.files);
  }

  InflateTable(): void {
    const NEW_TABLE_STATE = {
      Records: this.processedRoutes.map((x, index) => ({
        ...x,
        Index: (index + 1),
        Name: x.Route?.Name,
        Locations: x.RouteLines?.length,
        StrEstimate: x.Estimate ? 'Sí' : 'No'
      })),
      RecordsCount: this.processedRoutes.length
    };

    this.linkerService.Publish({
      Data: JSON.stringify(NEW_TABLE_STATE),
      Target: this.tableId,
      CallBack: CL_CHANNEL.INFLATE
    });
  }

  CreateRoutes(): void {
    let processedRoutesFiltered = this.processedRoutes.filter(r => r.Status);

    this.overlayService.OnPost();

    this.routeService.CreateProcessedRoutes(processedRoutesFiltered)
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe(
        {
          next: response => {
            this.modalService.Continue({
              title: 'Rutas creadas correctamente',
              type: CLModalType.SUCCESS
            });
            this.file = undefined;
            this.processedRoutes = response.Data || [];
            this.InflateTable();
          },
          error: err => {
            this.modalService.Continue({
              title: 'Se produjo un error creando las rutas',
              subtitle: GetError(err),
              type: CLModalType.ERROR
            });
          }
        }
      );
  }
}
