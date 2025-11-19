import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {ActivitiesService} from "@app/services/activities.service";
import {FormatDate, ZoneDate} from "@app/shared/common-functions";
import {IActionButton} from "@app/interfaces/i-action-button";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {ICLTableButton, MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {CLPrint, Structures} from "@clavisco/core";
import {catchError, finalize, map, of, Subscription, switchMap} from "rxjs";
import {ISearchDocumentsActivity} from "@app/interfaces/i-activities";
import {IBusinessPartner} from "@app/interfaces/i-business-partner";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {OverlayService} from "@clavisco/overlay";
import {BusinessPartnersService} from "@app/services/business-partners.service";
import {ISearchModalComponentDialogData, SearchModalComponent} from "@clavisco/search-modal";
import {MatDialog} from "@angular/material/dialog";
import CL_ACTIONS = Structures.Enums.CL_ACTIONS;
import {Router} from "@angular/router";
import {ISearchDocumentsActivitiesFilter} from "@app/interfaces/i-document-type";
import {PreloadedDocumentActions} from "@app/enums/enums";
import {SharedService} from "@app/shared/shared.service";

@Component({
  selector: 'app-search-activities',
  templateUrl: './search-activities.component.html',
  styleUrls: ['./search-activities.component.scss']
})
export class SearchActivitiesComponent implements OnInit, OnDestroy {

  //#region FORMULARIOS
  documentForm!: FormGroup;
  //#endregion

  //#region TABLA
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  docTbColumns: { [key: string]: string } = {
    ActivityCode: 'Número de actividad',
    CardName: 'Cliente',
    CreateDate: 'Fecha de creación'
  }
  docTbMappedColumns!: MappedColumns;
  //#endregion

  //#region VARIABLES STRING
  searchModalId = 'searchModalActivitiesId';
  documentsTableId: string = 'DOCS-SEARCH-ACTIVITY-TABLE';
  //#endregion

  //#region VARIABLES BOLEANAS
  shouldPaginateRequest: boolean = true;
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  hasItemsSelection: boolean = false;
  //#endregion

  //#region LISTAS
  customers: IBusinessPartner[] = [];
  documents: ISearchDocumentsActivity[] = [];
  actionButtons: IActionButton[] = [{
    Key: 'SEARCH',
    MatColor: 'primary',
    MatIcon: 'search',
    Text: 'Buscar',
    DisabledIf: _form => _form?.invalid || false
  },
    {
      Key: 'CLEAN',
      MatIcon: 'mop',
      Text: 'Limpiar'
    }
  ];
  tableButtons: ICLTableButton[] = [
    {
      Title: `Editar`,
      Action: Structures.Enums.CL_ACTIONS.UPDATE,
      Icon: `edit`,
      Color: `primary`,
      Data: ''
    },
    {
      Title: `Duplicar`,
      Action: Structures.Enums.CL_ACTIONS.OPTION_1,
      Icon: `note_add`,
      Color: `primary`,
      Data: ''
    }
  ];
  //#endregion

  //#region OBSERVABLES
  allSubscriptions$!: Subscription;

  //#endregion

  //#region OBJETOS
  customer!: IBusinessPartner | null;
  //#endregion

  constructor(
    private fb: FormBuilder,
    private activityService: ActivitiesService,
    @Inject('LinkerService') private linkerService: LinkerService,
    private overlayService: OverlayService,
    private alertsService: AlertsService,
    private businessPartnerService: BusinessPartnersService,
    private matDialog: MatDialog,
    private router: Router,
    private sharedService:SharedService
  ) {
    this.allSubscriptions$ = new Subscription();
    this.docTbMappedColumns = MapDisplayColumns({
      dataSource: [],
      renameColumns: this.docTbColumns,
      ignoreColumns:['CardCode'],
      stickyColumns: [
        {Name: 'Options', FixOn: 'right'},
      ]
    });
  }

  ngOnInit(): void {
    this.OnLoad();
  }

  ngOnDestroy(): void {
    this.allSubscriptions$?.unsubscribe();
  }

  /**
   * This method is used to load initial data
   * @constructor
   * @private
   */
  private OnLoad(): void {

    this.InitForm();

    Register<CL_CHANNEL>(this.documentsTableId, CL_CHANNEL.OUTPUT, this.OnTableButtonClicked, this.callbacks);
    Register<CL_CHANNEL>(this.documentsTableId, CL_CHANNEL.REQUEST_RECORDS, this.GetDocuments, this.callbacks);
    Register<CL_CHANNEL>(this.searchModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalRequestRecords, this.callbacks);

    this.allSubscriptions$.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );
  }

  private InitForm(): void{
    this.documentForm = this.fb.group({
      CardName: [''],
      Code: [''],
      DateFrom: [new Date(ZoneDate())],
      DateTo: [new Date(ZoneDate())]
    });

    this.documentForm.get('CardName')!.valueChanges.pipe(
      map((value: string) => {
        if (value !== this.getDisplayValue(this.customer as IBusinessPartner)) {
          this.customer = null;
          this.documentForm.patchValue({ CardName: '' });
        }
      })
    ).subscribe();


  }

  private getDisplayValue(value: IBusinessPartner): string {
    return value ? `${value.CardName}` : '';
  }


  /**
   * Show business partner search modal
   * @constructor
   */
  public ShowModalSearchBusinnesPartner(): void {
    this.matDialog.open(SearchModalComponent, {
      width: '65%',
      height: "80%",
      data: {
        Id: this.searchModalId,
        ModalTitle: 'Lista de socios de negocios',
        MinInputCharacters: 3,
        InputDebounceTime: 200,
        ShouldPaginateRequest: true,
        TableMappedColumns: {
          IgnoreColumns: ['Id', 'Vendedor', 'GroupCode', 'CardType', 'Phone1', 'PayTermsGrpCode', 'DiscountPercent', 'MaxCommitment', 'FederalTaxID', 'PriceListNum', 'SalesPersonCode', 'Currency', 'EmailAddress', 'Series', 'CashCustomer',
            'TypeAheadFormat', 'TypeIdentification', 'Provincia', 'Canton', 'Distrito', 'Barrio', 'Direccion', 'Frozen', 'Valid', 'FatherType', 'FatherCard', 'ConfigurableFields', 'BPAddresses', 'Udfs', 'IsCompanyDirection', 'ShipToDefault', 'BilltoDefault', 'AttachmentEntry'
            , 'CreateDate', 'Device'
          ],
          RenameColumns: {
            CardName: 'Nombre',
            CardCode: 'Codigo',
          }
        }
      } as ISearchModalComponentDialogData<IBusinessPartner>
    }).afterClosed().pipe(
    ).subscribe({
      next: (value: IBusinessPartner) => {
        if (value) {
          this.customer = value;
          this.documentForm.controls['CardName'].setValue(value.CardName);
        }
      }
    });
  }

  /**
   * This method is used to listen event buttons
   * @param _actionButton model events
   * @constructor
   */
  public OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'SEARCH':
        this.linkerService.Publish({
          CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
          Target: this.documentsTableId,
          Data: ''
        });
        break;
      case 'CLEAN':
        this.Clear();
        break;
    }
  }

  /**
   * This method is used to clear data
   * @constructor
   * @private
   */
  private Clear():void{
    this.InitForm();
    this.documents = [];
    this.customer = null;
    this.InflateTableDocuments();
  }

  /**
   * Send information to search-modal component
   * @constructor
   * @private
   */
  private InflateTableBusinnesPartner(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.customers,
      RecordsCount: this.customers.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.searchModalId
    });
  }

  /**
   * Listening event of component search-modal
   * @param _event - Event gets data from modal
   * @constructor
   */
  public OnModalRequestRecords = (_event: ICLEvent): void => {
    const VALUE = JSON.parse(_event.Data);
    this.overlayService.OnGet();
    this.businessPartnerService.GetbyFilter<IBusinessPartner[]>(VALUE?.SearchValue)
      .pipe(finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: (callback) => {
        this.customers = callback.Data;
        this.InflateTableBusinnesPartner();
        this.alertsService.Toast({
          type: CLToastType.SUCCESS,
          message: 'Componentes requeridos obtenidos'
        });
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });
  }
    /**
     * Method to define the resulting events for the table buttons
     * @param _event - Event emitted in the table button when selecting a document
     * @constructor
     */
    public OnTableButtonClicked = (_event: ICLEvent): void => {
      const clickedButton = JSON.parse(_event.Data) as ICLTableButton;
      const data = JSON.parse(clickedButton.Data || '') as ISearchDocumentsActivity;
      switch (clickedButton.Action) {
        case CL_ACTIONS.UPDATE:
          this.sharedService.SetCurrentPage('Actividad');
          this.router.navigate(['activities', 'create'], {
            queryParams: {
              Action: PreloadedDocumentActions.EDIT,
              Code: data?.ActivityCode
            }
          });
          break;
        case CL_ACTIONS.OPTION_1:
          this.sharedService.SetCurrentPage('Actividad');
          this.router.navigate(['activities', 'create'], {
            queryParams: {
              Action: PreloadedDocumentActions.DUPLICATE,
              Code: data?.ActivityCode
            }
          });
          break;
      }
    }

  /**
   * Method to obtain documents
   * @constructor
   */
  private GetDocuments = (): void => {
    let filter = this.documentForm.value as ISearchDocumentsActivitiesFilter;
    this.overlayService.OnGet();
    this.allSubscriptions$.add(
      this.activityService.GetDocuments(FormatDate(filter.DateFrom), FormatDate(filter.DateTo), filter?.Code || 0, this.customer?.CardCode ?? '')
        .pipe(finalize(() => this.overlayService.Drop()))
        .subscribe({
          next: (callback) => {
            this.documents = callback.Data;
            this.InflateTableDocuments();
          }
        })
    );
  }

  /**
   * This method is used to display documento data
   * @constructor
   * @private
   */
  private InflateTableDocuments(): void {
    const NEW_TABLE_STATE = {
      Records: this.documents,
      RecordsCount: this.documents.length
    };
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Target: this.documentsTableId,
      Data: JSON.stringify(NEW_TABLE_STATE)
    });
  }


}
