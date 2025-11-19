import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, Validators, } from "@angular/forms";
import { Router } from "@angular/router";
import { LoadingController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { catchError, filter, finalize, first, map, switchMap } from "rxjs/operators";
import {CustomerSearchComponent, UdfPresentationComponent} from "src/app/components";
import {
    AlertType, BoObjectTypes, Frozen,
    Geoconfigs,
    LocalStorageVariables,
    PublisherVariables,
    SettingCodes, TypeDevice,
    UdfsCategory
} from "../../../common/enum";
import {
    BusinessPartnerLocations,
    CompanyModel,
    Events, IGeoConfig,
    ICurrency,
    IdentificationType,
    IGroupCodeModel,
    ISetting,
    Location,
    PermissionsSelectedModel,
    UDFModel2,
} from "src/app/models";
import {
    CardGroupService,
    CommonService,
    CompanyService,
    CustomerService, GeoconfigService,
    JsonService,
    LocalStorageService,
    PermissionService,
    PublisherService,
    Repository, SeriesService,
} from "../../../services";
import { IPlace } from "src/app/models/db/i-places";
import { CustomModalController } from "src/app/services/custom-modal-controller.service";
import { IInputOptions } from "src/app/models/i-input-options";
import { EMPTY, forkJoin, of } from "rxjs";
import { IBusinessPartners } from "../../../interfaces/i-business-partners";
import { SettingsService } from "../../../services/settings.service";
import { ICompanyFieldsConfigured, IFieldsBusinesPartner } from "../../../interfaces/i-company-fields-configured";
import { UdfsService } from "../../../services/udfs.service";
import {IFilterKeyUdf, IUdf, IUdfContext, IUdfDevelopment} from "../../../interfaces/i-udfs";
import { ICLResponse } from "../../../models/responses/response";
import {IUserAssign} from "../../../models/db/user-model";
import { FEIdentificationType } from "src/app/common";
import { AttachmentFilesComponent } from "src/app/components/attachment-files/attachment-files.component";
import { AttachmentsService } from "src/app/services/attachments.service";
import { IAttachments2 } from "src/app/interfaces/i-document-attachment";

@Component({
    selector: "app-business-partner-master-data",
    templateUrl: "./business-partner-master-data.page.html",
    styleUrls: ["./business-partner-master-data.page.css"],
})
export class BusinessPartnerMasterDataPage implements OnInit, OnDestroy {
    // Components
    @ViewChild(UdfPresentationComponent, { static: false }) udfPresentationComponent: UdfPresentationComponent;
    @ViewChild(AttachmentFilesComponent, { static: false }) attachmentFilesComponent: AttachmentFilesComponent;
    //varbox
    G_EditCustomer: boolean;
    districInput: string = "";
    cantonInput: string = "";
    neighborhoodInput: string = "";
    provinceInput: string = "";
    groupInput: string = "";
    inputsOptions: { [key: string]: IInputOptions };
    isOnCustomerEdition: boolean = false;
    TipoIdentificacionList = FEIdentificationType;
    bpForm: FormGroup;
    company: CompanyModel;
    GroupCodeList: IGroupCodeModel[];
    udfs: IUdfContext[] = [];
    udfsValues: IUdf[] = [];
    customerLocations: Location[];
    currencyList: ICurrency[] = [];
    placesList: IPlace[];
    provinceList: IPlace[];
    cantonList: IPlace[];
    districtList: IPlace[];
    neighborhoodList: IPlace[];
    ideMinLength: number;
    ideMaxLength: number;
    customer: IBusinessPartners;
    permissionList: PermissionsSelectedModel[];
    settings: ISetting[] = [];
    fieldBusinessPartnerCompany: ICompanyFieldsConfigured[] = [];
    fieldsBusinessPartner: IFieldsBusinesPartner[] = [];
    IsCompanyDirection: boolean = false;
    geoConfigs: IGeoConfig[] = [];
    udfsDevelopment: IUdfDevelopment[] = [];
    userAssignment: IUserAssign;
    isSerial: boolean = false;

    constructor(
        private loadingController: LoadingController,
        private modalController: CustomModalController,
        private formBuilder: FormBuilder,
        public translateService: TranslateService,
        private router: Router,
        private repositoryCustomer: Repository.Customer,
        private customerService: CustomerService,
        private cardGroupService: CardGroupService,
        private companyService: CompanyService,
        private localStorageService: LocalStorageService,
        private jsonService: JsonService,
        private commonService: CommonService,
        private publisherService: PublisherService,
        private permissionService: PermissionService,
        private settingsService: SettingsService,
        private udfsService: UdfsService,
        private geoconfigService: GeoconfigService,
        private seriesService: SeriesService,
        private attachmentService: AttachmentsService,
    ) {
    }

    ngOnInit(): void {
        this.inputsOptions = {}
        this.permissionList = [...this.permissionService.Permissions];
        this.SetPermissionsVariables();
        this.userAssignment = this.localStorageService.get(LocalStorageVariables.UserAssignment);

        this.publisherService.getObservable()
            .pipe(
                filter(p => p.Target === PublisherVariables.Permissions)
            )
            .subscribe({
                next: (callback) => {
                    if (callback) {
                        this.permissionList = [...callback.Data];
                        this.SetPermissionsVariables();
                    }
                }
            });

        this.InitFrom();
    }

    ionViewWillEnter(): void {
        this.InitFrom();
        this.InitializePage();
        this.SendInitialRequests();
    }

    ngOnDestroy(): void {
        this.modalController.DismissAll();
    }

    /**
     * The form is defined with its initial values
     * @constructor
     */
    InitFrom (){
        this.bpForm = this.formBuilder.group({
            CardCode: [""],
            CardName: ["", Validators.required],
            GroupCode: [""],
            Currency: ["", Validators.required],
            FederalTaxID: ["", Validators.required],
            Phone1: ["", [Validators.maxLength(13), Validators.minLength(8)]],
            Cellular: [""],
            EmailAddress: [
                "",
                Validators.compose([
                    Validators.minLength(1),
                    Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$"),
                ]),
            ],
            IntrntSite: [""],
            Notes: [""],
            DiscountPercent: [
                0.0,
                Validators.compose([
                    Validators.required,
                    Validators.min(0.0),
                    Validators.max(100.0),
                ]),
            ],
            U_TipoIdentificacion: ["", Validators.required],
        });
    }
    

    /**
     * This method is used to get initial data
     * @constructor
     */
    async SendInitialRequests(): Promise<void> {
        let loader = await this.commonService.Loader();
        loader.present();

        forkJoin({
            Groups: this.cardGroupService.GetCardGroup().pipe(catchError(error => of(null))),
            GeoConfigs: this.geoconfigService.GetGeoConfigurations().pipe(catchError(error => of({
                Message: error,
                Data: []
            } as ICLResponse<IGeoConfig[]>))),
            Settings: this.settingsService.GetSettingByCode(SettingCodes.FieldsConfiguredSAP),
            UDFs: this.udfsService.Get(UdfsCategory.OCRD).pipe(
                map(response => response.Data),
                catchError(error => {
                    return of([])
                })),
            UDFsDevelopment: this.udfsService.GetUdfsDevelopment('OCRD').pipe(catchError(error => of(null))),
            Currencies: this.companyService.GetCurrencies(true).pipe(catchError(error => of(null))),
            Places: this.jsonService.getJSONPlaces(),
            IsSerial: this.seriesService.GetIsSerial(this.userAssignment.Id, BoObjectTypes.BusinessPartnerCustomer, this.userAssignment.CompanyId).pipe(catchError(error => of(null)))
        }).pipe(finalize(() => loader.dismiss()))
            .subscribe({
                next: (callbacks) => {

                    //#region CONFIGURE FIELDS
                    if (callbacks.Settings && callbacks.Settings.Data) {
                        this.fieldBusinessPartnerCompany = JSON.parse(callbacks.Settings.Data?.Json || '');
                        let dataFieldBusinessPartnerCompany = this.fieldBusinessPartnerCompany.find(x => x.CompanyId === this.userAssignment?.CompanyId) as ICompanyFieldsConfigured;
                        if (dataFieldBusinessPartnerCompany) {
                            this.fieldsBusinessPartner = dataFieldBusinessPartnerCompany.Fields;
                            this.IsCompanyDirection = dataFieldBusinessPartnerCompany.IsCompanyDirection;
                        }
                    }
                    //#endregion

                    //#region GEO CONFIGS
                    this.geoConfigs = callbacks.GeoConfigs.Data ?? [];
                    //#endregion

                    //#region UDFS
                    if (callbacks.UDFs && callbacks.UDFs.length > 0) {
                        this.udfs = (callbacks.UDFs as IUdfContext[]);
                    }
                    //#endregion
                    
                    //#region UDF DESARROLLO
                    if (callbacks.UDFsDevelopment && callbacks.UDFsDevelopment.Data && callbacks.UDFsDevelopment.Data.length > 0) {
                        this.udfsDevelopment = callbacks.UDFsDevelopment.Data;
                    }
                    //#endregion
                    
                    this.isSerial = callbacks.IsSerial.Data?.IsSerial ?? false;
                    
                    this.UpdateValidators();

                    this.GroupCodeList = this.commonService.CLMapSubscriptionValue(callbacks.Groups, []);
                    this.inputsOptions['Groups'] = {
                        ActionSheetHeader: this.commonService.Translate('Grupos', "Groups"),
                        DataPropsNames: ['Code'],
                        DataPropsSepartor: "",
                        DescriptionPropName: 'Name',
                        List: this.GroupCodeList,
                    };
                    this.currencyList = callbacks.Currencies?.Data ?? [];
                    this.placesList = callbacks.Places.Places;
                    this.GetProvinces();
                },
                error: (error) => {
                    this.commonService.Alert(AlertType.ERROR, error, error);
                }
            });
    }

    GetValidators() {
        return !this.isSerial && !this.isOnCustomerEdition ? [Validators.required] : [];
    }

    UpdateValidators() {
        const control = this.bpForm.get('CardCode');
        if (control) {
            control.setValidators(this.GetValidators());
            control.updateValueAndValidity();
        }
    }

    SetPermissionsVariables(): void {
        this.G_EditCustomer = this.permissionList.some(p => p.Name === 'M_BusinessPartner_EditBP');
    }


    //#region Modals
    async EditCustomerLocations(): Promise<void> {
        this.localStorageService.data.set(LocalStorageVariables.BusinessPartner, this.customer);
        await this.router.navigateByUrl('business-partner-locations');
        this.publisherService
            .getObservable()
            .pipe(first((x: Events) => x.Target === PublisherVariables.BusinessPartnerMasterData))
            .subscribe((data) => {
                if (data.Data) this.customer = data.Data;
            });
    }

    async SearchCustomer(): Promise<void> {
        this.isOnCustomerEdition = false;
        let chooseModal = await this.modalController.create({
            component: CustomerSearchComponent,
            componentProps: {
                data: true
            }
        });
        chooseModal.present();
        chooseModal.onDidDismiss().then(async (carcode) => {
            if (carcode) {
                this.InitializePage();
                this.isOnCustomerEdition = true;
                await this.GetCustomer(carcode.data);
            }
            this.UpdateValidators();
        });
    }

    //#endregion

    /**
     * This method is used to set udf
     * @param _key
     * @param _value
     * @constructor
     * @private
     */
    private SetValueUDF(_key: string, _value): void {
        let index = this.fieldsBusinessPartner.findIndex(x => x.Id === _key);
        if (index >= 0) {
            this.fieldsBusinessPartner[index].Value = _value;
        }
    }

    /**
     * This method prepare the form data to send the files to the backend
     */
    async CreateCustomer(): Promise<void> {
        let customer = this.GetObjectCustomer();

        let loading = await this.commonService.Loader();
        loading.present();

        this.customerService
            .CreateCustomer(customer)
            .pipe(
            switchMap((callback) => {
                if (callback && callback.Data) {

                    this.commonService.Alert(
                        AlertType.SUCCESS,
                        'Socio de negocios creado exitosamente',
                        'Business partner successfully created'
                    );

                    
                    if (this.attachmentFilesComponent.GetattachmentFiles()?.length) {
                        return this.attachmentService.Post(this.PrepareFilesFormData());
                    }
                    return EMPTY;

                } else {
                    this.commonService.Alert(
                        AlertType.ERROR,
                        `Error guardando el cliente ${callback.Message}`,
                        `Error saving the customer ${callback.Message}`
                    );
                    return EMPTY; // cortar el flujo si hay error
                }
            }),
            finalize(() => loading.dismiss())
            )
            .subscribe({
            next: (res) => {
                this.InitializePage();
                this.isOnCustomerEdition = false;
            },
            error: (error) => {
                this.commonService.Alert(AlertType.ERROR, error, error);
            },
            });
        }

    /**
     * This method get customer
     * @param CardCode
     * @constructor
     */
    async GetCustomer(CardCode: string): Promise<void> {
        let loader = await this.loadingController.create();
        loader.present();

        this.customerService.GetBp(CardCode).pipe(
            switchMap(bp => this.udfsService.GetUdfsData({
                CardCode: CardCode,
                TypeDocument: UdfsCategory.OCRD
            } as IFilterKeyUdf).pipe(
                map(udfsData => {
                    this.udfsValues = udfsData.Data;
                    const excluded: string[] = ['U_provincia', 'U_canton', 'U_distrito', 'U_barrio', 'U_TipoIdentificacion'];
                    return { Bp: bp.Data, Data: udfsData.Data.filter(x => !excluded.includes(x.Name)) }
                }),
                catchError(error => {
                    return of({ Bp: bp.Data, Data: [] as IUdf[] });
                })
            )),
            finalize(() => loader.dismiss())
        ).subscribe(
            (callback) => {
                if (callback.Bp) {

                    this.customer = callback.Bp;

                    this.bpForm.patchValue({
                        CardCode: callback.Bp.CardCode,
                        CardName: callback.Bp.CardName,
                        GroupCode: callback.Bp.GroupCode,
                        Currency: callback.Bp.Currency,
                        FederalTaxID: callback.Bp.FederalTaxID,
                        Phone1: callback.Bp.Phone1,
                        EmailAddress: callback.Bp.EmailAddress,
                        DiscountPercent: callback.Bp.DiscountPercent,
                        U_TipoIdentificacion: callback.Bp.TypeIdentification,
                    });


                    let provinciaId = callback.Bp.Provincia?.split('-')[0] ?? '';
                    let cantonId = callback.Bp.Canton?.split('-')[0] ?? '';
                    let distritoId = callback.Bp.Distrito?.split('-')[0] ?? '';
                    let barrioId = callback.Bp.Barrio?.split('-')[0] ?? '';
                    this.cantonList = this.placesList.filter(x => x.ProvinceId === provinciaId);
                    this.districtList = this.placesList.filter(x => x.CantonId === cantonId);
                    this.neighborhoodList = this.placesList.filter(x => x.DistrictId === distritoId);

                    this.groupInput = this.GroupCodeList?.find((g) => g.Code === callback.Bp.GroupCode)?.Name ?? '';
                    this.provinceInput = this.provinceList?.find((g) => g.ProvinceId === provinciaId)?.ProvinceName ?? '';
                    this.cantonInput = this.cantonList?.find((g) => g.CantonId === cantonId)?.CantonName ?? '';
                    this.districInput = this.districtList?.find((g) => g.DistrictId === distritoId)?.DistrictName ?? '';
                    this.neighborhoodInput = this.neighborhoodList?.find((g) => g.NeighborhoodId === barrioId)?.NeighborhoodName ?? '';
                }
                if (callback.Data) {
                    callback.Data.forEach(element => {
                        if (this.bpForm.get(element.Name)) {
                            this.bpForm.controls[element.Name].setValue(element.Value);
                        }
                    });
                }
            },
            (err) => {
                this.commonService.alert(AlertType.ERROR, err);
            }
        );
    }

    GetProvinces(): void {
        this.provinceList = [];
        this.provinceList = this.Unique(
            this.placesList.filter((x) => x),
            "ProvinceId"
        );

        this.inputsOptions["Provinces"] = {
            ActionSheetHeader: this.commonService.Translate(
                "Provincias",
                "Provinces"
            ),
            DataPropsNames: ["ProvinceId", "ProvinceName"],
            DataPropsSepartor: "-",
            DescriptionPropName: "ProvinceName",
            List: this.provinceList,
        };
    }

    GetCantons(_province: string): void {
        let provincia = this.bpForm.value.U_provincia || _province;
        if (provincia) {
            let provinceId = provincia.split("-")[0];
            this.cantonList = this.Unique(
                this.placesList.filter((x) => x.ProvinceId === provinceId),
                "CantonId"
            );
        }
        this.bpForm.controls["U_canton"].setValue("");

        this.cantonInput = this.districInput = this.neighborhoodInput = "";

        this.inputsOptions["Cantons"] = {
            ActionSheetHeader: this.commonService.Translate("Cantónes", "Cantons"),
            DataPropsNames: ["CantonId", "CantonName"],
            DataPropsSepartor: "-",
            DescriptionPropName: "CantonName",
            List: this.cantonList,
        };
    }

    GetDistricts(_canton: string): void {
        let canton = this.bpForm.value.U_canton || _canton;
        if (this.bpForm.value.U_provincia && canton) {
            let provinceId = this.bpForm.value.U_provincia.split("-")[0];
            let cantonId = canton.split("-")[0];
            this.districtList = this.Unique(
                this.placesList.filter(
                    (x) => x.ProvinceId === provinceId && x.CantonId === cantonId
                ),
                "DistrictId"
            );
        }
        this.bpForm.controls["U_distrito"].setValue("");

        this.districInput = this.neighborhoodInput = "";

        this.inputsOptions["Districts"] = {
            ActionSheetHeader: this.commonService.Translate("Distritos", "Districts"),
            DataPropsNames: ["DistrictId", "DistrictName"],
            DataPropsSepartor: "-",
            DescriptionPropName: "DistrictName",
            List: this.districtList,
        };
        // if (!this.bpForm.value.U_canton || this.bpForm.value.U_canton.split("-").lenght === 0) return;
        // let cantonId = this.bpForm.value.U_canton.split("-")[0];
        // let provinceId = this.bpForm.value.U_provincia.split("-")[0];
        // this.districtList = this.unique(
        //   this.placesList.filter(
        //     (x) => x.ProvinceId === provinceId && x.CantonId === cantonId
        //   ),
        //   "DistrictId"
        // );
        // if (this.bpForm.value.U_distrito) {
        //   this.getNeighborhood();
        //   this.bpForm.controls['U_distrito'].setValue('');
        // }
    }

    GetNeighborhood(_district: string): void {
        let distrito = this.bpForm.value.U_distrito || _district;
        if (
            this.bpForm.value.U_provincia &&
            this.bpForm.value.U_canton &&
            distrito
        ) {
            let provinceId = this.bpForm.value.U_provincia.split("-")[0];
            let cantonId = this.bpForm.value.U_canton.split("-")[0];
            let districtId = distrito.split("-")[0];
            this.neighborhoodList = this.Unique(
                this.placesList.filter(
                    (x) =>
                        x.ProvinceId === provinceId &&
                        x.CantonId === cantonId &&
                        x.DistrictId === districtId
                ),
                "NeighborhoodId"
            );
        }
        this.bpForm.controls["U_barrio"].setValue("");

        this.neighborhoodInput = "";

        this.inputsOptions["Neighborhoods"] = {
            ActionSheetHeader: this.commonService.Translate(
                "Barrios",
                "NeighborhoodId"
            ),
            DataPropsNames: ["NeighborhoodId", "NeighborhoodName"],
            DataPropsSepartor: "-",
            DescriptionPropName: "NeighborhoodName",
            List: this.neighborhoodList,
        };
    }

    IdentificationTypeChange(_event: CustomEvent | string): void {
        let value: string =
            typeof _event === "string" ? _event : _event.detail.value;

        if (value === "01") {
            this.ideMinLength = 9;
            this.ideMaxLength = 9;
        } else if (value === "02" || value === "04") {
            this.ideMinLength = 10;
            this.ideMaxLength = 10;
        } else if (value === "03") {
            this.ideMinLength = 11;
            this.ideMaxLength = 12;
        }

        this.bpForm.controls["FederalTaxID"].setValidators([
            Validators.required,
            Validators.minLength(this.ideMinLength),
            Validators.maxLength(this.ideMaxLength),
        ]);
        this.bpForm.controls["FederalTaxID"].updateValueAndValidity();
    }

    /**
     * This method is used to get data udfs
     * @constructor
     */
    GetUDFs(): IUdf[] {
        let UDFList: IUdf[] = [];
        
        const valuesUDFs = this.udfPresentationComponent?.GetValuesUDFs() || [];

        if (Array.isArray(valuesUDFs)) {
            UDFList = valuesUDFs
                .map(([key, value]) => ({ Name: key, FieldType: '', Value: value } as IUdf));
        }
        
        if(!this.isOnCustomerEdition){
            if(this.udfsDevelopment && this.udfsDevelopment.length > 0){
                this.udfsDevelopment.forEach(element => {
                    UDFList.push({ Name: element.Name, FieldType: '', Value: TypeDevice.MOVIL } as IUdf);
                })
            }
        }

        return UDFList;
    }

    GetDirectionLenght(): number {
        let currentValue: string = this.bpForm.get("U_direccion").value;
        if (!currentValue) return 0;

        return Number(currentValue.length);
    }

    Unique(array, propertyName) {
        return array.filter(
            (e, i) =>
                array.findIndex((a) => a[propertyName] === e[propertyName]) === i
        );
    }

    InitializePage(): void {
        this.isOnCustomerEdition = false;
        this.customer = null;
        this.customerLocations = [];
        this.ResetForm();
        this.udfPresentationComponent?.resetUDFs();
        
        this.ideMaxLength = 9;
        this.ideMinLength = 9;
        this.placesList = [];
        this.GroupCodeList = [];
        this.attachmentFilesComponent.ResetDocumentAttachment();
    }

    ResetForm(): void {
        this.bpForm?.reset()
        this.provinceInput = "";
        this.cantonInput = "";
        this.districInput = "";
        this.neighborhoodInput = "";
        this.groupInput = "";
    }

    //#region Edit customer
    FederalTaxIDValidity(customer: any, UIValidity: boolean): void {
        if (UIValidity) {
            switch (customer.U_TipoIdentificacion) {
                case "01": {
                    customer.FederalTaxID = customer.FederalTaxID.substring(0, 9);
                    break;
                }
                case "02":
                case "04": {
                    customer.FederalTaxID = customer.FederalTaxID.substring(0, 10);
                    break;
                }
            }
        } else {
            switch (customer.U_TipoIdentificacion) {
                case "01": {
                    customer.FederalTaxID = customer.FederalTaxID.concat("000");
                    break;
                }
                case "02":
                case "04": {
                    customer.FederalTaxID = customer.FederalTaxID.concat("00");
                    break;
                }
            }
        }
    }

    async LoadCustomerAddress(customer: BusinessPartnerLocations): Promise<void> {
        let bpProvinceId: string = customer.U_provincia?.split("-")[0].trim();
        let bpCantonId: string = customer.U_canton?.split("-")[0].trim();
        let bpDistrictId: string = customer.U_distrito?.split("-")[0].trim();
        let bpNeighborhoodId: string = customer.U_barrio?.split("-")[0].trim();

        if (!bpProvinceId) return;

        let province: IPlace = this.provinceList.find(
            (p) => Number(p.ProvinceId) == Number(bpProvinceId)
        );

        if (!province) return;

        this.bpForm.controls["U_provincia"].setValue(
            `${province.ProvinceId}-${province.ProvinceName}`
        );
        this.provinceInput = province.ProvinceName;

        if (!bpCantonId) return;

        this.GetCantons(province.ProvinceId);

        let canton: IPlace = this.cantonList.find(
            (c) => Number(c.CantonId) == Number(bpCantonId)
        );

        if (!canton) return;

        this.bpForm.controls["U_canton"].setValue(
            `${canton.CantonId}-${canton.CantonName}`
        );
        this.cantonInput = canton.CantonName;

        if (!bpDistrictId) return;

        this.GetDistricts(canton.CantonId);

        let district: IPlace = this.districtList.find(
            (d) => Number(d.DistrictId) == Number(bpDistrictId)
        );

        if (!district) return;

        this.bpForm.controls["U_distrito"].setValue(
            `${district.DistrictId}-${district.DistrictName}`
        );
        this.districInput = district.DistrictName;

        if (!bpNeighborhoodId) return;

        this.GetNeighborhood(district.DistrictId);

        let neighborhood: IPlace = this.neighborhoodList.find(
            (n) => Number(n.NeighborhoodId) == Number(bpNeighborhoodId)
        );

        if (!neighborhood) return;

        this.bpForm.controls["U_barrio"].setValue(
            `${neighborhood.NeighborhoodId}-${neighborhood.NeighborhoodName}`
        );
        this.neighborhoodInput = neighborhood.NeighborhoodName;
    }

    LoadCustomUDFs(UDFs: UDFModel2[]): void {
        if (UDFs) {
            UDFs.forEach((x) => {
                this.bpForm.get(x.Description).setValue(x.Value);
            });
        }
    }

  
    async UpdateCustomer(): Promise<void> {
        if (!this.G_EditCustomer) {
            let message = this.commonService.Translate(
            'No tienes permisos para realizar esta acción',
            'You do not have permissions to performs this action'
            );
            this.commonService.toast(message, 'dark', 'bottom');
            return;
        }

        let customer = this.GetObjectCustomer();

        let loading = await this.loadingController.create({
            message: this.commonService.Translate('Procesando', 'Processing')
        });
        loading.present();

        this.customerService
            .UpdateCustomer(customer)
            .pipe(
            switchMap((callback) => {

                this.commonService.Alert(
                AlertType.SUCCESS,
                'Datos editados correctamente',
                'Correctly edited data'
                );

                if (this.attachmentFilesComponent.GetattachmentFiles()?.length) {
                    return this.attachmentService.Post(this.PrepareFilesFormData());
                }

                return EMPTY;
            }),
            finalize(() => loading.dismiss())
            )
            .subscribe({
            next: (res) => {
                this.isOnCustomerEdition = false;
                this.InitializePage();
            },
            error: (error) => {
                this.commonService.Alert(AlertType.ERROR, error, error);
            },
            });
        }

    //#endregion

    /**
     * This method is create object customer
     * @constructor
     * @private
     */
    private GetObjectCustomer(): IBusinessPartners {
        let form = this.bpForm.value;

        this.SetValueUDF('TipoIdentificacion', form.U_TipoIdentificacion);
        this.SetValueUDF('Cedula', form.FederalTaxID);
        this.SetValueUDF('Email', form.EmailAddress);

        return {
            CardCode: this.bpForm.value.CardCode,
            CardName: this.bpForm.value.CardName,
            CardType: 'cCustomer',
            GroupCode: this.bpForm.value.GroupCode,
            Currency: this.bpForm.value.Currency,
            FederalTaxID: this.bpForm.value.FederalTaxID,
            Phone1: this.bpForm.value.Phone1,
            EmailAddress: this.bpForm.value.EmailAddress,
            TypeIdentification: this.bpForm.value.U_TipoIdentificacion,
            PayTermsGrpCode: 0,
            PriceListNum: 1,
            Frozen: this.isOnCustomerEdition ? this.customer.Frozen : (this.geoConfigs?.some(element => element.Key === Geoconfigs.CreateBPActive) ? Frozen.No : Frozen.Yes),
            ShipToDefault: this.customer?.ShipToDefault,
            BilltoDefault: this.customer?.BilltoDefault,
            ConfigurableFields: this.fieldsBusinessPartner,
            UDFs: this.GetUDFs()
        } as IBusinessPartners;
    }

    async ShowInputOptions(
        _formControl: AbstractControl,
        _variableName: string,
        _options: IInputOptions,
        _icon: string,
        _func?: (p: any) => any
    ): Promise<void> {
        let returnedValue = await this.commonService.ShowInputOptions(
            _formControl,
            _options,
            _icon
        );

        if (returnedValue && this[_variableName] !== returnedValue) {
            this[_variableName] = returnedValue;

            if (_func) {
                _func.call(this, _formControl.value);
            }
        }
    }

    /**
     * Prepares the FormData object with the files and data to save in SAP.
     * @returns FormData with files and data to save in SAP
     */
    private PrepareFilesFormData(): FormData {
        let files: FormData = new FormData();

        this.attachmentFilesComponent.GetattachmentFiles()?.forEach(file => {
            files.append(file.name, file);
        });

        let data: IAttachments2 = {
            CardCode: this.customer?.CardCode ?? '',
            AbsoluteEntry: this.attachmentFilesComponent.GetDocumentAttachment()?.AbsoluteEntry,
            Attachments2_Lines: this.attachmentFilesComponent.GetDocumentAttachment()?.Attachments2_Lines
        };

        files.append('FILES', JSON.stringify(data));
        return files;
    }


    
}
