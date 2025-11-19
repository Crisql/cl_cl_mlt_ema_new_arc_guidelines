import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {IStructures} from "@app/interfaces/i-structures";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {IApprovalRequest} from "@app/interfaces/i-approval-request";
import {ISalesPerson} from "@app/interfaces/i-sales-person";
import {finalize, forkJoin, Observable, of, Subscription, switchMap} from "rxjs";
import {IActionButton} from "@app/interfaces/i-action-button";
import {DropdownList, ICLTableButton, MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {CLPrint, GetError, Structures} from "@clavisco/core";
import {DropdownElement, IInputColumn} from "@clavisco/table/lib/table.space";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {SalesDocumentService} from "@app/services/sales-document.service";
import {OverlayService} from "@clavisco/overlay";
import {AlertsService, CLModalType, CLToastType, ModalService} from "@clavisco/alerts";
import {SharedService} from "@app/shared/shared.service";
import {MatDialog} from "@angular/material/dialog";
import {SalesPersonService} from "@app/services/sales-person.service";
import {StructuresService} from "@app/services/structures.service";
import {IApprovalDocumentsResolvedData, ISearchApprovalDocumentsResolvedData} from "@app/interfaces/i-resolvers";
import {map} from "rxjs/operators";
import {IApprovalSearchFilter} from "@app/interfaces/i-document-type";
import {formatDate} from "@angular/common";
import {DocPreviewComponent} from "@Component/sales/search-docs/doc-preview/doc-preview.component";
import {ControllerName, DocumentTypeCode, Payterm} from "@app/enums/enums";
import {IPreviewDocumentDialogData} from "@app/interfaces/i-dialog-data";
import CL_ACTIONS = Structures.Enums.CL_ACTIONS;
import {IPayTerms} from "@app/interfaces/i-pay-terms";
import {IDraft} from "@app/interfaces/i-draft";
import {DraftService} from "@app/services/draft.service";

@Component({
  selector: 'app-purchases-approvals',
  templateUrl: './purchases-approvals.component.html',
  styleUrls: ['./purchases-approvals.component.scss']
})
export class PurchasesApprovalsComponent implements OnInit,OnDestroy, AfterViewInit {


  documentTypes!: IStructures[];
  approvalStates!: IStructures[];
  decisionStates!: IStructures[];
  payTerms!: IPayTerms[];
  draft!: IDraft | null;
  searchForm!: FormGroup;
  documents!: IApprovalRequest[];
  actionButtons!: IActionButton[];
  shouldPaginateRequest:boolean = true;
  documentsTableId: string = 'DOCS-REQUEST-TABLE';
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  docTbMappedColumns!: MappedColumns;
  hasItemsSelection: boolean = false;
  buttons: ICLTableButton[] = [
    {
      Title: `Previsualizar`,
      Action: Structures.Enums.CL_ACTIONS.OPTION_1,
      Icon: `info`,
      Color: `primary`
    },
    {
      Title: `Guardar`,
      Action: Structures.Enums.CL_ACTIONS.CONTINUE,
      Icon: `save`,
      Color: `primary`
    }
  ];
  docTbColumns: { [key: string]: string } = {
    Code: 'Número aprobación',
    DraftEntry: 'Número borrador',
    Status: 'Estado',
    DocDateFormatted: "Fecha",
    DecisionRemarks: 'Comentarios'
  }
  InputColumns: IInputColumn[] = [
    {ColumnName: 'DecisionRemarks', FieldType: 'text'}
  ];
  dropdownColumns: string[] = ['Status'];
  dropdownList!: DropdownList;
  //#endregion

  controllerToSendRequest: string = 'ApprovalRequests';

  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  allSubscriptions: Subscription;
  tableButtons: ICLTableButton[] = [
    {
      Title: `Guardar`,
      Action: Structures.Enums.CL_ACTIONS.UPDATE,
      Icon: `save`,
      Color: `primary`
    }
  ];
  previousUrl:string='';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private salesService: SalesDocumentService,
    private overlayService: OverlayService,
    private alertsService: AlertsService,
    private sharedService: SharedService,
    private dialog: MatDialog,
    @Inject("LinkerService") private linkerService: LinkerService,
    private salesPersonsService: SalesPersonService,
    private structuresService: StructuresService,
    private modalService: ModalService,
    private draftService: DraftService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.allSubscriptions = new Subscription();
    this.docTbMappedColumns = MapDisplayColumns({
      dataSource: this.documents,
      inputColumns: this.InputColumns,
      renameColumns: this.docTbColumns,
      stickyColumns: [
        {Name: 'Options', FixOn: 'right'}
      ]
    });
  }

  ngOnInit(): void {
    this.InitVariables();
    this.HandleResolvedData();
  }
  ngAfterViewInit(): void {
    this.searchForm.get('DocType')?.setValue(this.documentTypes.find(dt => dt.Default)?.Key || '');
    this.searchForm.get('ApprovalStatus')?.setValue(this.approvalStates.find(ds => ds.Default)?.Key || '');
    this.OnChangeDocumentType();
    this.changeDetector.detectChanges();
  }

  HandleResolvedData(): void {
    this.allSubscriptions.add(
      this.activatedRoute.data.subscribe({
        next: (data) => {
          const resolvedData = data['resolvedData'] as IApprovalDocumentsResolvedData;
          if (resolvedData) {
            this.documentTypes = resolvedData.DocTypes;
            this.approvalStates = resolvedData.ApprovalStates;
            this.decisionStates = resolvedData.DecisionStates;
            this.payTerms = resolvedData.PayTerms || [];

            this.ConfigDropdownInTable();
            if(this.previousUrl==this.sharedService.GetCurrentRouteSegment()){this.SetFormDefaultValues();}
          }
        }
      })
    );
  }

  InitVariables(): void {
    Register<CL_CHANNEL>(this.documentsTableId, CL_CHANNEL.OUTPUT, this.OnTableButtonClicked, this.callbacks);
    Register<CL_CHANNEL>(this.documentsTableId, CL_CHANNEL.REQUEST_RECORDS, this.GetDocuments, this.callbacks);
    this.documentTypes = [];
    this.approvalStates = [];
    this.decisionStates = [];
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
    this.documents = [];
    this.LoadForm();


    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );

    this.allSubscriptions.add(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.previousUrl = this.router.url;
        }
      })
    );
    this.ReadQueryParameters();
  }

  LoadForm(): void {
    this.searchForm = this.fb.group({
      DraftEntry: [null],
      ApprovalStatus: [null,Validators.required],
      DateFrom: [new Date(), Validators.required],
      DateTo: [new Date(), Validators.required],
      DocType: ['', Validators.required]
    });
  }

  SetFormDefaultValues(): void {
    this.OnChangeDocumentType();
  }



  OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'SEARCH':
        // Emito un evento para que tabla establezca todos los datos de paginacion
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

  private Clear(): void {

    this.overlayService.OnGet();
    forkJoin({
      DocTypes: this.structuresService.Get('DocTypesForPurchasesApprovals'),
      ApprovalStates: this.structuresService.Get('ApprovalStates'),
      DecisionStates: this.structuresService.Get('DecisionStates')
    })
      .pipe(
        finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: callback => {
        this.documentTypes = callback.DocTypes.Data;
        this.approvalStates = callback.ApprovalStates.Data;
        this.decisionStates = callback.DecisionStates.Data;
        this.ResetDocument();

        this.alertsService.Toast({type: CLToastType.SUCCESS, message: 'Componentes requeridos obtenidos'});
      },
      error: err => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });
  }

  private ResetDocument(): void {
    this.ResetTable();
    this.searchForm = this.fb.group({
      DraftEntry: [null],
      ApprovalStatus: [null,Validators.required],
      DateFrom: [new Date(), Validators.required],
      DateTo: [new Date(), Validators.required],
      DocType: ['', Validators.required]
    });
    this.searchForm.get('DocType')?.setValue(this.documentTypes.find(dt => dt.Default)?.Key || '');
    this.searchForm.get('ApprovalStatus')?.setValue(this.approvalStates.find(ds => ds.Default)?.Key || '');
  }

  /**
   * Method to authorize a document
   * @param _event - Event emitted in the table button when selecting a document
   * @constructor
   */
  OnTableButtonClicked = (_event: ICLEvent) : void => {
    const clickedButton = JSON.parse(_event.Data) as ICLTableButton;
    const row = JSON.parse(clickedButton.Data!) as IApprovalRequest;

    const approvalRequest: IApprovalRequest = this.documents.find(d => d.Code === row.Code)!;

    approvalRequest.ApprovalRequestDecisions = [
      {
        Remarks: row.DecisionRemarks,
        Status: row.Status
      }
    ];

    switch (clickedButton.Action) {
      case CL_ACTIONS.CONTINUE:
        this.overlayService.OnPost();
        this.salesService.PatchApprovalRequests(this.controllerToSendRequest, approvalRequest).pipe
        (
          switchMap(res=>{
            if(!res.Data){
              return of(null)
            }
            return this.draftService.Get(res.Data.DraftEntry)
          }),
          switchMap(res=>{
            this.draft = res?.Data || null
            let payTermType = this.payTerms.find(payTerm=> payTerm.GroupNum == this.draft?.PaymentGroupCode)?.Type
            if(payTermType == Payterm.Counted && this.draft?.Approval_Status == 'arsApproved'&& (approvalRequest.ObjectType!=DocumentTypeCode.PurchaseOrder.toString())){
              return this.modalService.Continue({
                title: 'Documento aprobado correctamente, es necesario completar el pago del documento',
                type: CLModalType.INFO
              })
            }
            return this.modalService.Continue({
              title: 'Autorización completada correctamente',
              type: CLModalType.SUCCESS
            })
          }),
          finalize(() => this.overlayService.Drop())
        ).subscribe({next: (callback) => {
            this.linkerService.Publish({
              CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
              Target: this.documentsTableId,
              Data: ''
            });
          },
          error: (err) => {
            this.modalService.Continue({
              title: 'Se produjo un error al autorizar el documento',
              subtitle: GetError(err),
              type: CLModalType.ERROR
            });
          }});
        break;
      case CL_ACTIONS.OPTION_1:
        this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {
          relativeTo: this.activatedRoute,
          queryParams: {
            dialog: 'preview',
            docEntry: approvalRequest.DraftEntry,
            controller: this.controllerToSendRequest
          }
        });
        break;
    }
  }

  OnChangeDocumentType(_event?: any): void {
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
      Target: this.documentsTableId,
      Data: ''
    });
  }

  /**
   * Method to obtain documents for authorization
   * @constructor
   */
  GetDocuments = () :void => {
    let filter: IApprovalSearchFilter = this.searchForm.value as IApprovalSearchFilter;
    this.overlayService.OnGet();
    this.allSubscriptions.add(
      this.salesService.GetApprovalRequests(this.controllerToSendRequest, filter.DateFrom, filter.DateTo, filter.DraftEntry, filter.ApprovalStatus, filter.DocType)
        .pipe(finalize(() => this.overlayService.Drop()))
        .subscribe({
          next: (callback) => {

            let listCodes:number[]=[];
            this.documents = callback.Data;
            if(callback.Data.length>0){
              callback.Data.forEach(value => {listCodes.push(value.DraftEntry)});
              this.salesService.GetApprovalsCodesRequests(this.controllerToSendRequest,listCodes)
                .pipe(finalize(() => {
                  this.overlayService.Drop();
                  const NEW_TABLE_STATE = {
                    Records: this.documents.map(d => this.sharedService.MapTableColumns({
                      ...d,
                      Status: this.FormatApprovalStatus(d.Status),
                      DocDateFormatted: formatDate(`${d.CreationDate}`.replace('00:00:00', d.CreationTime).replace('Z', ''), 'MMMM d, y hh:mm a', 'en'),
                      DecisionRemarks: ''
                    }, Object.keys(this.docTbColumns))),
                  };

                  this.linkerService.Publish({
                    CallBack: CL_CHANNEL.INFLATE,
                    Target: this.documentsTableId,
                    Data: JSON.stringify(NEW_TABLE_STATE)
                  });
                }))
                .subscribe({
                  next: (data) => {
                    this.documents.forEach(value => {
                      const approval = data.Data.find(approval => approval.Code === value.Code);
                      if(approval!=undefined) {
                        value.ApprovalRequestLines = approval?.ApprovalRequestLines;
                        value.ApprovalRequestDecisions = approval?.ApprovalRequestDecisions;
                        value.ApprovalTemplatesID=approval.ApprovalTemplatesID;
                        value.CreationDate=approval.CreationDate;
                        value.CreationTime=approval.CreationTime;
                        value.CurrentStage=approval.CurrentStage;
                        value.DraftEntry = approval?.DraftEntry;
                        value.DraftType=approval.DraftType;
                        value.IsDraft=approval.IsDraft;
                        value.ObjectEntry=approval.ObjectEntry;
                        value.ObjectType=approval.ObjectType;
                        value.OriginatorID = approval?.OriginatorID;
                        value.DecisionRemarks = approval?.DecisionRemarks;
                        value.Status = approval?.Status;
                        value.Remarks=approval.Remarks;
                        value.ApprovedType=value.ApprovedType;
                      }
                    });
                  }
                })
            }else{
              this.documents=[];
              const NEW_TABLE_STATE = {
                Records: this.documents.map(d => this.sharedService.MapTableColumns({
                  ...d,
                  Status: this.FormatApprovalStatus(d.Status),
                  DocDateFormatted: formatDate(`${d.CreationDate}`.replace('00:00:00', d.CreationTime).replace('Z', ''), 'MMMM d, y hh:mm a', 'en'),
                  DecisionRemarks: ''
                }, Object.keys(this.docTbColumns))),
              };

              this.linkerService.Publish({
                CallBack: CL_CHANNEL.INFLATE,
                Target: this.documentsTableId,
                Data: JSON.stringify(NEW_TABLE_STATE)
              });
              this.overlayService.Drop();
            }
          }
        }));
  }

  ResetTable(): void {
    this.documents = [];
    const EMPTY_TABLE_STATE = {
      Records: [],
      RecordsCount: 0
    }
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Target: this.documentsTableId,
      Data: JSON.stringify(EMPTY_TABLE_STATE)
    });
  }

  /**
   * Method to get draft docuement
   * @constructor
   */
  ReadQueryParameters(): void {
    this.allSubscriptions.add(
      this.activatedRoute.queryParams.subscribe({
        next: (params) => {
          let dialog = params['dialog'];

          if (dialog) {
            let documentEntry = (params['docEntry']);

            if (isNaN(documentEntry)) {
              this.alertsService.Toast({
                type: CLToastType.ERROR,
                message: 'Número de documento con formato incorrecto'
              });
            }

            if (dialog === 'preview' && !isNaN(documentEntry)) {
              this.OpenPreviewDocumentDialog(documentEntry);
            }
          }
        }
      })
    );
  }

  /**
   * Method to load modal preview document
   * @param _docEntry DocEntry document to show
   * @constructor
   */
  OpenPreviewDocumentDialog(_docEntry: number): void {
    this.dialog.open(DocPreviewComponent, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      minWidth: '50vw',
      minHeight: '50vh',
      disableClose: true,
      data: {
        DocEntry: _docEntry,
        Controller: ControllerName.Draft
      } as IPreviewDocumentDialogData
    })
      .afterClosed()
      .subscribe({
        next: (result) => {
          this.router.navigate([this.sharedService.GetCurrentRouteSegment()]);
        }
      });
  }

  private ConfigDropdownInTable(): void {
    let dropStatus: DropdownElement[] = [];
    this.decisionStates.forEach(x => {
      let value = {
        key: x.Key,
        value: x.Description,
        by: ''
      }
      dropStatus.push(value);
    });

    this.dropdownList = {
      Status: dropStatus as DropdownElement[]
    };
  }

  ngOnDestroy(): void {
    this.allSubscriptions.unsubscribe();
  }

  FormatApprovalStatus(_status: string): string {
    return _status.replace('ars','ard');
  }
}
