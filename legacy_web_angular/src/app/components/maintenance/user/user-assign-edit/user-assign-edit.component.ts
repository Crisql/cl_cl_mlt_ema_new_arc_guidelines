import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {ActivatedRoute} from '@angular/router';
import {
  AlertsService,
  CLModalType,
  CLToastType,
  ModalService,
} from '@clavisco/alerts';
import {CLPrint, GetError, Repository, Structures} from '@clavisco/core';
import {OverlayService} from '@clavisco/overlay';
import {forkJoin, Observable, of, Subscription, switchMap} from 'rxjs';
import {finalize} from 'rxjs/operators';
import {ICompany} from 'src/app/interfaces/i-company';
import {IUserDialogData} from 'src/app/interfaces/i-dialog-data';
import {ILicense} from 'src/app/interfaces/i-license';
import {ISalesPerson} from 'src/app/interfaces/i-sales-person';
import {IUser, IUserAssign} from 'src/app/interfaces/i-user';
import {AssignsService} from 'src/app/services/assigns.service';
import {CompanyService} from 'src/app/services/company.service';
import {LicensesService} from 'src/app/services/licenses.service';
import {UserService} from 'src/app/services/user.service';
import {IWarehouse} from "../../../../interfaces/i-warehouse";
import {IActionButton} from "@app/interfaces/i-action-button";
import {StorageKey} from "@app/enums/e-storage-keys";
import {ISearchModalComponentDialogData, SearchModalComponent} from "@clavisco/search-modal";
import {IBusinessPartner} from "@app/interfaces/i-business-partner";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {BusinessPartnersService} from "@app/services/business-partners.service";
import {SuppliersService} from "@app/services/suppliers.service";

@Component({
  selector: 'app-user-assign-edit',
  templateUrl: './user-assign-edit.component.html',
  styleUrls: ['./user-assign-edit.component.scss']
})
export class UserAssignEditComponent implements OnInit {

  accion: string = '';
  icon: string = '';
  modalTitle!: string;
  allSubscriptions$!: Subscription;
  userForm!: FormGroup;
  userInEdition!: IUserAssign;
  users!: IUser[];
  warehouses!: IWarehouse[];
  companies!: ICompany[];
  salesPersons!: ISalesPerson[];
  licenses!: ILicense[];
  isEditUserAssing = false;
  actionButtons: IActionButton[] = [];
  currentSession!: IUserAssign;

  salesBusinessPartnerSearchModalId: string = "salesBusinessPartnerSearchModalId";
  businessPartners: IBusinessPartner[] = [];
  purchasingPartnerSearchModalId: string = "purchasingPartnerSearchModalId";
  purchasingBusinessPartners: IBusinessPartner[] = [];

  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };

  constructor(
    @Inject('LinkerService') private linkerService: LinkerService,
    @Inject(MAT_DIALOG_DATA) private data: IUserDialogData,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private userService: UserService,
    private companyService: CompanyService,
    private assignService: AssignsService,
    private licensesService: LicensesService,
    private overlayService: OverlayService,
    private matDialog: MatDialog,
    private matDialogRef: MatDialogRef<UserAssignEditComponent>,
    private alertsService: AlertsService,
    private modalService: ModalService,
    private businessPartnersService: BusinessPartnersService,
    private suppliersService: SuppliersService,
  ) {
    this.allSubscriptions$ = new Subscription();
  }


  ngOnInit(): void {
    this.RegisterTableEvents();
    this.InitVariables();
    this.SendInitRequest();
    this.allSubscriptions$.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );
  }

  ngOnDestroy(): void {
    this.allSubscriptions$.unsubscribe();
  }

  InitVariables(): void {
    this.users = [];
    this.companies = [];
    this.licenses = [];
    this.salesPersons = [];
    this.warehouses = [];
    this.LoadUserForm();
    this.ReadQueryParameters();
  }

  LoadUserForm(): void {
    this.userForm = this.fb.group({
      SlpCode: [null, [Validators.required]],
      CenterCost: [null],
      WhsCode: [null, [Validators.required]],
      Discount: [0, [Validators.required, Validators.max(100), Validators.min(0)]],
      CompanyId: [null, [Validators.required]],
      UserId: [null, [Validators.required]],
      LicenseId: [null, [Validators.required]],
      SellerName: [null],
      SellerCode: [null],
      BuyerName: [null],
      BuyerCode: [null],
      IsActive: [false, [Validators.required]]
    });
  }

  /**
   * Method to register table events
   * @constructor
   * @private
   */
  private RegisterTableEvents(): void {
    Register<CL_CHANNEL>(this.salesBusinessPartnerSearchModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalRequestCustomerRecords, this.callbacks);
    Register<CL_CHANNEL>(this.purchasingPartnerSearchModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalRequestPurchasingPartnerRecords, this.callbacks);
  }

  /**
   * Read query parameters
   */
  ReadQueryParameters(): void {
    this.currentSession = Repository.Behavior.GetStorageObject<IUserAssign>(StorageKey.CurrentUserAssign) as IUserAssign;
    this.allSubscriptions$.add(this.activatedRoute.queryParams.subscribe(params => {

      let isCreation: boolean = params['dialog'] === 'create';

      if (isCreation) {
        this.modalTitle = 'Creación de asignación';
        this.actionButtons = [
          {
            Key: 'ADD',
            Text: 'Crear',
            MatIcon: 'save',
            MatColor: 'primary',
            DisabledIf: (_form) => _form?.invalid || false
          },
          {
            Key: 'CANCEL',
            Text: 'Cancelar',
            MatIcon: 'cancel',
            MatColor: 'primary'
          }
        ];
      } else {
        this.modalTitle = 'Modificación de asignación';
        this.actionButtons = [
          {
            Key: 'ADD',
            Text: 'Actualizar',
            MatIcon: 'edit',
            MatColor: 'primary',
            DisabledIf: (_form) => _form?.invalid || false
          },
          {
            Key: 'CANCEL',
            Text: 'Cancelar',
            MatIcon: 'cancel',
            MatColor: 'primary'
          }
        ];
      }
    }));
  }

  SendInitRequest(): void {
    this.overlayService.OnGet();

    this.isEditUserAssing = this.data.UserId > 0;
    this.allSubscriptions$.add(
      this.assignService.Get<IUserAssign>(this.data.UserId).pipe(
        switchMap(userAssignResponse => {
          return forkJoin({
            UserAssign: of(userAssignResponse),
            Users: this.userService.Get<IUser[]>(true),
            Licenses: this.licensesService.Get<ILicense[]>(),
            Warehouses: this.data.UserId > 0 ? this.companyService.GetWarehouses(userAssignResponse.Data.CompanyId ? userAssignResponse.Data.CompanyId : -1, this.currentSession.LicenseId ?? 0) : of(null),
            Companies: this.companyService.Get<ICompany[]>(true),
            SalesPersons: this.data.UserId > 0 ? this.companyService.GetSalesMen(userAssignResponse.Data.CompanyId ? userAssignResponse.Data.CompanyId : -1, this.currentSession.LicenseId ?? 0) : of(null),
          });
        }),
        finalize(() => this.overlayService.Drop())
      )
        .subscribe({
          next: (callback) => {
            this.alertsService.Toast({
              type: CLToastType.SUCCESS,
              message: 'Componentes requeridos obtenidos'
            });

            this.licenses = (callback?.Licenses.Data || []).filter(x => x.IsActive);

            if (callback?.Warehouses) {
              this.warehouses = callback.Warehouses.Data || [];
            }
            if (callback?.SalesPersons) {
              this.salesPersons = callback.SalesPersons.Data || [];
            }
            this.companies = callback?.Companies.Data || [];

            this.users = callback?.Users.Data || [];


            if (callback?.UserAssign.Data) {
              this.userInEdition = callback?.UserAssign.Data;
              this.userInEdition.SlpCode = +this.userInEdition.SlpCode;

              this.userInEdition.SellerCode && this.GetSalesBusinessPartnerInfo(this.userInEdition.SellerCode);
              this.userInEdition.BuyerCode  && this.GetPurchaseBusinessPartnerInfo(this.userInEdition.BuyerCode);

              this.userForm.patchValue(this.userInEdition);
            }
          },
          error: err => {
            this.alertsService.ShowAlert({HttpErrorResponse: err});
          }
        })
    );


  }

  ChangeCompany(): void {
    if (!this.userForm.controls['LicenseId'].value) {

      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'Seleccione licencia para obtener vendedor y almacén.'
      });

      this.userForm.patchValue({CompanyId: null});
      return;
    }
    this.warehouses = [];
    this.salesPersons = [];

    this.userForm.patchValue({
      SlpCode: null,
      WhsCode: null
    });

    this.overlayService.OnGet();

    forkJoin({
      Warehouses: this.companyService.GetWarehouses(this.userForm.controls['CompanyId'].value, this.userForm.controls['LicenseId'].value),
      salesPersons: this.companyService.GetSalesMen(this.userForm.controls['CompanyId'].value, this.userForm.controls['LicenseId'].value),
    }).pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (callback) => {
          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });
          this.warehouses = callback.Warehouses.Data || [];
          this.salesPersons = callback.salesPersons.Data || [];
        },
        error: err => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      });
  }

  public OnActionButtonClicked(_event: IActionButton): void {
    switch (_event.Key) {
      case 'ADD':
        this.SaveUser();
        break;
      case 'CANCEL':
        this.matDialogRef.close();
        break;
    }
  }

  ChangeLicense(): void {
    this.overlayService.OnGet();
    this.companyService.GetWarehouses(
      this.currentSession.CompanyId,
      this.userForm.controls['LicenseId'].value
    ).pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (callback) => {
          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });
        },
        error: err => {
          this.modalService.NextWarning({
            title: 'Licencia Invalida',
            subtitle: 'La Licencia seleccionada no es válida o posiblemente no se encuentra activa. Se recomienda seleccionar una licencia válida.',
            disableClose: false
          });
        }
      });
  }

  SaveUser(): void {
    this.overlayService.OnPost();

    let formUser: IUserAssign = {...this.userInEdition, ...this.userForm.value as IUserAssign};

    let updateOrCreate$: Observable<Structures.Interfaces.ICLResponse<IUserAssign>> | null = null;

    if (!this.data.UserId) {
      updateOrCreate$ = this.assignService.Post(formUser);
    } else {
      updateOrCreate$ = this.assignService.Patch(formUser);
    }

    this.allSubscriptions$.add(updateOrCreate$
      .pipe(
        finalize(() => this.overlayService.Drop())
      )
      .subscribe({
        next: (callback) => {
          this.modalService.Continue({
            title: `Asignación ${!this.data.UserId ? 'creada' : 'actualizada'} correctamente`,
            type: CLModalType.SUCCESS
          });

          this.matDialogRef.close();
        },
        error: (err) => {
          this.modalService.Continue({
            title: `Se produjo un error ${!this.data.UserId ? 'creando' : 'actualizando'} la asignación`,
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      }));
  }

  /**
   * Send information to the Seller Business Partners search modal component
   * @constructor
   * @private
   */
  private InflateTableCustomers(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.businessPartners,
      RecordsCount: this.businessPartners.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.salesBusinessPartnerSearchModalId
    });
  }

  /**
   * LSearch-modal component listener event for seller business partners
   * @param _event - Event gets data from modal
   * @constructor
   */
  OnModalRequestCustomerRecords = (_event: ICLEvent): void => {
    const VALUE = JSON.parse(_event.Data);
    this.overlayService.OnGet();
    this.businessPartnersService.GetbyFilter<IBusinessPartner[]>(VALUE?.SearchValue)
      .pipe(finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: (callback) => {
        this.businessPartners = callback.Data;

        this.InflateTableCustomers();
        this.alertsService.Toast({
          type: CLToastType.SUCCESS,
          message: 'Componentes requeridos obtenidos'
        });
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    })
  }

  /**
   * Show sales business partner search modal
   * @constructor
   */
  ShowSalesBusinessPartnerSearchModal(): void {
    this.matDialog.open(SearchModalComponent, {
      width: '65%',
      height: "80%",
      data: {
        Id: this.salesBusinessPartnerSearchModalId,
        ModalTitle: 'Lista de socios de negocios de ventas',
        MinInputCharacters: 2,
        InputDebounceTime: 200,
        ShouldPaginateRequest : true,
        TableMappedColumns: {
          IgnoreColumns: ['Id','Vendedor','GroupCode','CardType','Phone1','PayTermsGrpCode','DiscountPercent','MaxCommitment','FederalTaxID','PriceListNum','SalesPersonCode','Currency','EmailAddress','Series','CashCustomer',
            'TypeAheadFormat','TypeIdentification','Provincia','Canton','Distrito','Barrio','Direccion','Frozen','Valid','FatherType','FatherCard','ConfigurableFields','BPAddresses','Udfs','IsCompanyDirection','ShipToDefault','BilltoDefault','AttachmentEntry','CreateDate','Device'],
          RenameColumns: {
            CardCode: 'Codigo',
            CardName: 'Nombre',
          }
        }
      } as ISearchModalComponentDialogData<IBusinessPartner>
    }).afterClosed()
      .subscribe({
        next: (value: IBusinessPartner) => {
          if(value){
            this.userForm.patchValue({
              SellerName: value.CardName,
              SellerCode: value.CardCode
            });
          }
        }
      });
  }

  /**
   * Send information to the Purchasing Business Partners search modal component
   * @constructor
   * @private
   */
  private InflateTablePurchasers(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.purchasingBusinessPartners,
      RecordsCount: this.purchasingBusinessPartners.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.purchasingPartnerSearchModalId
    });
  }

  /**
   * LSearch-modal component listener event for Purchasing Business Partners
   * @param _event - Event gets data from modal
   * @constructor
   */
  OnModalRequestPurchasingPartnerRecords = (_event: ICLEvent): void => {
    const VALUE = JSON.parse(_event.Data);
    this.overlayService.OnGet();
    this.suppliersService.GetbyFilter<IBusinessPartner[]>(VALUE?.SearchValue)
      .pipe(finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: (callback) => {
        this.purchasingBusinessPartners = callback.Data;

        this.InflateTablePurchasers();
        this.alertsService.Toast({
          type: CLToastType.SUCCESS,
          message: 'Componentes requeridos obtenidos'
        });
      },
      error: (err) => {
        this.alertsService.ShowAlert({ HttpErrorResponse: err });
      }
    })
  };


  /**
   * Show purchasing partner search modal
   * @constructor
   */
  ShowPurchasingPartnerSearchModal(): void {
    this.matDialog.open(SearchModalComponent, {
      width: '65%',
      height: "80%",
      data: {
        Id: this.purchasingPartnerSearchModalId,
        ModalTitle: 'Lista de socios de negocios de compras',
        MinInputCharacters: 2,
        InputDebounceTime: 200,
        ShouldPaginateRequest : true,
        TableMappedColumns: {
          IgnoreColumns: ['Id','Vendedor','GroupCode','CardType','Phone1','PayTermsGrpCode','DiscountPercent','MaxCommitment','FederalTaxID','PriceListNum','SalesPersonCode','Currency','EmailAddress','Series','CashCustomer',
            'TypeAheadFormat','TypeIdentification','Provincia','Canton','Distrito','Barrio','Direccion','Frozen','Valid','FatherType','FatherCard','ConfigurableFields','BPAddresses','Udfs','IsCompanyDirection','ShipToDefault','BilltoDefault','AttachmentEntry','CreateDate','Device'],
          RenameColumns: {
            CardCode: 'Codigo',
            CardName: 'Nombre',
          }
        }
      } as ISearchModalComponentDialogData<IBusinessPartner>
    }).afterClosed()
      .subscribe({
        next: (value) => {
          if(value){
            this.userForm.patchValue({
              BuyerName: value.CardName,
              BuyerCode: value.CardCode
            });
          }
        }
      });
  }

  /**
   * Method to obtain the information of a sales business partner by their CardCode
   * @param _cardCode - Unique card code of the sales business partner
   * @constructor
   */
  GetSalesBusinessPartnerInfo(_cardCode: string): void {
    this.overlayService.OnGet();
    this.businessPartnersService.Get<IBusinessPartner>(_cardCode)
      .pipe(finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: (callback) => {
        const salesBusinessPartnerInfo: IBusinessPartner = callback.Data;
        this.userForm.patchValue({ SellerName: salesBusinessPartnerInfo.CardName });
      },
      error: (err) =>  this.alertsService.ShowAlert({HttpErrorResponse: err})
    });
  };

  /**
   * Method for obtaining information from a purchasing business partner
   * @param _cardCode - Unique card code of the purchasing business partner
   * @constructor
   */
  GetPurchaseBusinessPartnerInfo(_cardCode: string): void {
    this.overlayService.OnGet();
    this.suppliersService.Get<IBusinessPartner>(_cardCode).pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (callback) => {
        const purchasingBusinessPartnerInfo: IBusinessPartner = callback.Data;
        this.userForm.patchValue({ BuyerName: purchasingBusinessPartnerInfo.CardName });
      },
      error: (err) => this.alertsService.ShowAlert({ HttpErrorResponse: err })
    });
  };
}
