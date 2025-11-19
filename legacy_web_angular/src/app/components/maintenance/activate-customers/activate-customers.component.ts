import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ICLTableButton, MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {IActionButton} from "@app/interfaces/i-action-button";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {finalize, Subscription, switchMap} from "rxjs";
import {CLPrint, GetError, Structures} from "@clavisco/core";
import {IActivateBusinessPartner, IBusinessPartner} from "@app/interfaces/i-business-partner";
import {OverlayService} from "@clavisco/overlay";
import {AlertsService, CLModalType, ModalService} from "@clavisco/alerts";
import {SharedService} from "@app/shared/shared.service";
import {IBusinessPartnerSearchFilter} from "@app/interfaces/i-document-type";
import {MasterDataBusinessPartnersService} from "@app/services/master-data-business-partners.service";
import {formatDate} from "@angular/common";

@Component({
  selector: 'app-activate-customers',
  templateUrl: './activate-customers.component.html',
  styleUrls: ['./activate-customers.component.scss']
})
export class ActivateCustomersComponent implements OnInit {
  searchForm!: FormGroup;
  actionButtons!: IActionButton[];
  businessPartnerTableId: string = 'BUSINESSPARTNER-TABLE';
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  docTbMappedColumns!: MappedColumns;
  hasItemsSelection: boolean = false;
  tableButtons: ICLTableButton[] = [];
  businessPartners!: IBusinessPartner[];
  shouldPaginateRequest: boolean = true;
  docTbColumns: { [key: string]: string } = {
    CardCode: 'Código',
    CardName: 'Nombre',
    FederalTaxID:'Identificación',
    EmailAddress: 'Correo',
    DocDateFormatted: "Creado",
  }
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  allSubscriptions: Subscription;

  constructor(private formBuilder: FormBuilder,
              private overlayService: OverlayService,
              private sharedService: SharedService,
              @Inject("LinkerService") private linkerService: LinkerService,
              private masterDataBusinessPartnersService: MasterDataBusinessPartnersService,
              private modalService: ModalService) {
    this.allSubscriptions = new Subscription();
    this.docTbMappedColumns = MapDisplayColumns({
      dataSource: [],
      renameColumns: this.docTbColumns,
      ignoreColumns: ['GroupCode', 'CardType','Phone1','PayTermsGrpCode','DiscountPercent','MaxCommitment','PriceListNum','SalesPersonCode',
      'Currency','Series','CashCustomer','TypeAheadFormat','TypeIdentification','Provincia','Canton','Distrito','Barrio','Direccion',
      'Frozen','Valid','FatherType','FatherCard','ConfigurableFields','BPAddresses','Udfs','IsCompanyDirection','ShipToDefault','BilltoDefault','AttachmentEntry','Device'],
      stickyColumns: [
        {Name: 'Options', FixOn: 'right'},
      ]
    });
  }

  ngOnInit(): void {
    this.InitVariables();
  }
  InitVariables(): void {
    Register<CL_CHANNEL>(this.businessPartnerTableId, CL_CHANNEL.OUTPUT, this.OnTableButtonClicked, this.callbacks);
    Register<CL_CHANNEL>(this.businessPartnerTableId, CL_CHANNEL.REQUEST_RECORDS, this.GetBusinessPartner, this.callbacks);

    this.actionButtons = [
      {
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

    this.tableButtons = [
      {
        Title: `Activar cliente`,
        Action: Structures.Enums.CL_ACTIONS.OPTION_1,
        Icon: `check_small`,
        Color: `primary`,
        Data: ''
      }
    ];
    this.businessPartners = [];

    this.LoadForm();


    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );
  }

  LoadForm(): void {
    this.searchForm = this.formBuilder.group({
      Customer: [''],
      DateFrom: [new Date(), Validators.required],
      DateTo: [new Date(), Validators.required],
    });
  }

  ngOnDestroy(): void {
    this.allSubscriptions.unsubscribe();
  }

  /**
   *
   * @param _actionButton
   * @constructor
   */
  OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'SEARCH':
        // Emito un evento para que tabla establezca todos los datos de paginacion
        this.linkerService.Publish({
          CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
          Target: this.businessPartnerTableId,
          Data: ''
        });
        break;
      case 'CLEAN':
        this.Clear();
        break;
    }
  }

  /**
   * Method to reset table business partner
   * @constructor
   */
  ResetTable(): void {
    this.businessPartners = [];
    const EMPTY_TABLE_STATE = {
      Records: [],
      RecordsCount: 0
    }
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Target: this.businessPartnerTableId,
      Data: JSON.stringify(EMPTY_TABLE_STATE)
    });
  }

  /**
   * Method to clean niew
   * @constructor
   * @private
   */
  public Clear(): void {
    this.LoadForm();
    this.ResetTable();

  }
  /**
   * Method to define the resulting events for the table buttons
   * @param _event - Event emitted in the table button when selecting a document
   * @constructor
   */
  OnTableButtonClicked = (_event: ICLEvent): void => {
    const clickedButton = JSON.parse(_event.Data) as ICLTableButton;
    const BUSINESSPARTNER = JSON.parse(clickedButton.Data!) as IBusinessPartner;

    let activateBusinessPartner = {
      CardCode: BUSINESSPARTNER.CardCode
    } as IActivateBusinessPartner;

    this.overlayService.OnPost();
    this.masterDataBusinessPartnersService.Post(activateBusinessPartner)
      .pipe(
        switchMap(res => {
          this.overlayService.Drop();
          return this.modalService.Continue({
            title: 'Cliente activado correctamente',
            type: CLModalType.SUCCESS
          })
        }),
        finalize(() =>this.overlayService.Drop())
      ).subscribe({
      next: (callback) => {
      this.Clear();
      },
      error: (err) => {
        this.modalService.Continue({
          title: 'Se produjo un error activando el cliente',
          subtitle: GetError(err),
          type: CLModalType.ERROR
        });
      }
    });

  }

  /**
   * Method to obtain business partner to activate
   * @constructor
   */
  GetBusinessPartner = (): void => {
    let filter: IBusinessPartnerSearchFilter = this.searchForm.value as IBusinessPartnerSearchFilter;
    this.overlayService.OnGet();
    this.allSubscriptions.add(
      this.masterDataBusinessPartnersService.GetBusinessPartnerToActivate(filter.Customer,filter.DateFrom, filter.DateTo)
        .pipe(finalize(() => this.overlayService.Drop()))
        .subscribe({
          next: (callback) => {
            this.businessPartners = callback.Data;

            const NEW_TABLE_STATE = {
              Records: this.businessPartners.map(d => this.sharedService.MapTableColumns({
                ...d,
                CardName: `${d.CardCode} - ${d.CardName}`,
                DocDateFormatted: formatDate(d.CreateDate, 'MMMM d, y hh:mm a', 'en'),
              }, Object.keys(this.docTbColumns))),
            };

            this.linkerService.Publish({
              CallBack: CL_CHANNEL.INFLATE,
              Target: this.businessPartnerTableId,
              Data: JSON.stringify(NEW_TABLE_STATE)
            });
          }
        }));
  }
}
