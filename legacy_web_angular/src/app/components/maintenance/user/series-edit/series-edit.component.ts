import {Component, Inject, OnInit} from '@angular/core';
import {ObjectSapService} from "@app/services/object-sap.service";
import {OverlayService} from "@clavisco/overlay";
import {finalize, map} from "rxjs/operators";
import {
  AlertsService,
  CLModalType,
  CLToastType,
  ModalService,
} from "@clavisco/alerts";
import {IObjectSap} from "@app/interfaces/i-object-sap";
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {filter, forkJoin, Observable, of, startWith, Subscription} from "rxjs";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {IUserDialogData} from "@app/interfaces/i-dialog-data";
import {IUser, IUserAssign} from "@app/interfaces/i-user";
import {ICompany} from "@app/interfaces/i-company";
import {AssignsService} from "@app/services/assigns.service";
import {UserService} from "@app/services/user.service";
import {CompanyService} from "@app/services/company.service";
import {SeriesService} from "@app/services/series.service";
import {IFESerie, ISerie, ISerieAssing, ISerieAssingWithFESerie} from "@app/interfaces/i-serie";
import {ICLTableButton, MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {CLPrint, GetError, Structures} from "@clavisco/core";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {AddValidatorAutoComplete, SharedService} from "@app/shared/shared.service";
import {IStructures} from "@app/interfaces/i-structures";
import {StructuresService} from "@app/services/structures.service";
import {IActionButton} from "@app/interfaces/i-action-button";
import {ISettings} from "@app/interfaces/i-settings";
import {SerieTypes, SettingCode} from "@app/enums/enums";
import {SettingsService} from "@app/services/settings.service";

@Component({
  selector: 'app-series-edit',
  templateUrl: './series-edit.component.html',
  styleUrls: ['./series-edit.component.scss']
})
export class SeriesEditComponent implements OnInit {
  serieForm!: FormGroup;
  typesDocuments: IObjectSap[] = [];
  actionButtons: IActionButton[] = [];
  actionButtonsAdd: IActionButton[] = [];
  filteredtypesDocuments$!: Observable<IObjectSap[]>;
  typesSeries: ISerie[] = [];
  filteredtypesSeries$!: Observable<ISerie[]>;
  allSubscriptions$!: Subscription;
  seriesTypes: IStructures[] = [];
  /**
   * Array to store offline documents of type IStructures.
   */
  docOffline: IStructures[] = [];
  seriesGenerationTypes: IStructures[] = [];
  company!: ICompany;
  user!: IUser;
  userAssin!: IUserAssign;
  modalTitle!: string;
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  feSeriesDocuments: IObjectSap[] = [];
  fieldsFormToValidate : string[] = ['SerieName', 'BranchOffice', 'Terminal', 'NextNumber'];

  validatorSerie: ValidatorFn = Validators.nullValidator;

  /*** Tabla ***/
  shouldPaginateRequest: boolean = false;
  dataSource: ISerieAssing[] = [];
  seriesTableId: string = 'SERIES-ASSING-TABLE';
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  seriesMappedColumns: MappedColumns;
  hasItemsSelection: boolean = false;
  seriesTableColumns: { [key: string]: string } = {
    Id: 'Id',
    Serie: 'Serie',
    DocumentName: 'Documento',
    Type: 'Tipo',
    Serial: 'Tipo de serie'
  };

  buttons: ICLTableButton[] = [
    {
      Title: `Desasignar serie`,
      Action: Structures.Enums.CL_ACTIONS.UPDATE,
      Icon: `delete`,
      Color: `primary`,
      Data: ''
    }
  ]

  constructor(
    private fb: FormBuilder,
    private objectSapService: ObjectSapService,
    private sharedService: SharedService,
    private seriesService: SeriesService,
    private overlayService: OverlayService,
    private alertsService: AlertsService,
    private assignService: AssignsService,
    private structuresService: StructuresService,
    private userService: UserService,
    private matDialogRef: MatDialogRef<SeriesEditComponent>,
    private companyService: CompanyService,
    @Inject(MAT_DIALOG_DATA) private data: IUserDialogData,
    @Inject('LinkerService') private linkerService: LinkerService,
    private modalService: ModalService,
    private settingService: SettingsService
  ) {

    this.allSubscriptions$ = new Subscription();
    this.seriesMappedColumns = MapDisplayColumns(
      {
        dataSource: [] as ISerieAssing[],
        renameColumns: this.seriesTableColumns,
        ignoreColumns: ['CreatedDate', 'CreatedBy', 'UpdateDate', 'UpdatedBy', 'IsActive', 'Active', 'UserAssingId', 'CompanyId']
      }
    );
  }

  ngOnInit(): void {

    this.RegisterTableEvents();
    this.actionButtons = [
      {
        Key: 'CANCEL',
        Text: 'Cancelar',
        MatIcon: 'cancel',
        MatColor: 'primary'
      }
    ];
    this.actionButtonsAdd = [
      {
        Key: 'ADD',
        Text: 'Agregar',
        MatIcon: 'add',
        MatColor: 'primary',
        DisabledIf: (_form) => _form?.invalid || false
      }
    ];

    this.allSubscriptions$.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );

    this.LoadSerieForm();
    this.SendInitRequest();


  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions$?.unsubscribe();
  }

  /**
   * Loads the Serie form.
   * This method is used to load the Serie form for data entry or display.
   */
  LoadSerieForm(): void {
    this.serieForm = this.fb.group({
      Document: [null, [Validators.required]],
      Serie: [{value: '', disabled: true}, [Validators.required]],
      TypeSerie: [null, [Validators.required]],
      Type: [null, [Validators.required]],
      SerieName: [null],
      BranchOffice: [null],
      Terminal: [null],
      NextNumber: [null],
    });

    this.listenToDocumentFieldChanges();

    this.serieForm.get('Document')!.valueChanges.pipe(
      startWith(''),
      filter(value => value),
      map((value: string | IObjectSap) => {
        this.filteredtypesDocuments$ = of(this.FilterDocuments(value))
      })
    ).subscribe();

    this.serieForm.get('Serie')!.valueChanges.pipe(
      startWith(''),
      filter(value => value),
      map((value: string | ISerie) => {
        this.filteredtypesSeries$ = of(this.FilterSeries(value))
      })
    ).subscribe();

    this.serieForm.get('Type')?.valueChanges.subscribe(value => {
      const validators = +value == SerieTypes.Offline ? [Validators.required] : [];
      let control : AbstractControl | null;

      this.fieldsFormToValidate.forEach(field => {
        control = this.serieForm.get(field);
        if (control && this.docOffline.some(document => document.Key == this.serieForm.get('Document')?.value?.ObjectCode)) {
          control.setValidators(validators);
          control.updateValueAndValidity();
          control.reset();
        }
      });
    });
  }

  public OnActionButtonClicked(_event: IActionButton): void {
    switch (_event.Key) {
      case 'CANCEL':
        this.matDialogRef.close();
        break;
      case 'ADD':
        this.SaveChanges();
        break;
    }
  }

  private ResetDocument(): void {
    this.serieForm.get('Serie')?.reset();
    this.serieForm.get('TypeSerie')?.reset();
    this.serieForm.get('Type')?.reset();
  }

  /**
   * Listens to changes in the 'Document' field of the serieForm FormGroup
   * and enables or disables the 'Serie' field based on the presence of a value.
   * @private
   */
  private listenToDocumentFieldChanges(): void {
    this.serieForm.get('Document')?.valueChanges.subscribe(value => {
      if (value) {
        this.serieForm.get('Serie')?.enable();
      } else {
        this.serieForm.get('Serie')?.disable();
      }
    });
  }

  RegisterTableEvents(): void {
    Register<CL_CHANNEL>(this.seriesTableId, CL_CHANNEL.OUTPUT, this.OnUserTableActionActivated, this.callbacks);
  }

  /**
   *Method to select a serie
   * @param _event - Event emitted in the table button when selecting a serie
   * @constructor
   */
  OnUserTableActionActivated = (_event: ICLEvent): void => {
    this.modalService.CancelAndContinue({
      type: CLModalType.QUESTION,
      title: `Está seguro de que desea desasignar la serie seleccionada?`,
    }).pipe(
      filter(res => res),
    ).subscribe({
      next: () => {
        const clickedButton = JSON.parse(_event.Data) as ICLTableButton;
        const serie = JSON.parse(clickedButton.Data!) as ISerieAssing;
        this.DeleteSerie(serie);
      }
    });


  }

  /**
   * Method that deletes a configured series
   * @param _serie Serie to delete
   * @constructor
   */
  DeleteSerie(_serie: ISerieAssing): void{
    this.overlayService.OnPost()
    this.seriesService.Patch(_serie?.Id)
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: callback => {
          this.modalService.Continue({
            title: 'Serie desasignada correctamente',
            type: CLModalType.SUCCESS
          })
          this.LoadSeriesAssing();
        },
        error: err => {
          this.modalService.Continue({
            title: 'Se produjo un error desasignando la serie',
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      })
  }

  FilterDocuments(_value: string | IObjectSap): IObjectSap[] {
    if (typeof _value !== 'string') {
      return this.typesDocuments.filter(bp => bp.ObjectCode === _value?.ObjectCode);
    }
    return this.typesDocuments.filter(bp => (`${bp.ObjectCode}${bp.TableDescription}`).toLowerCase().includes(_value.toLowerCase()))
  }

  FilterSeries(_value: string | ISerie): ISerie[] {
    if (typeof _value !== 'string') {
      return this.typesSeries.filter(bp => bp.Serie === _value?.Serie);
    }
    return this.typesSeries.filter(bp => (`${bp.Serie} ${bp.SerieName}`).toLowerCase().includes(_value.toLowerCase()))
  }

  DisplayTypesDocuments(_typeDocument: IObjectSap): string {
    return _typeDocument && Object.keys(_typeDocument).length ? `${_typeDocument.TableDescription}` : '';
  }

  DisplayTypesSeries(_typeDocument: ISerie): string {
    return _typeDocument && Object.keys(_typeDocument).length ? `${_typeDocument.Serie} - ${_typeDocument.SerieName}` : '';
  }

  /**
   * Load the required initial data into the view
   * @constructor
   */
  SendInitRequest(): void {
    this.overlayService.OnGet();
    this.allSubscriptions$.add(forkJoin({
      UserAssing: this.assignService.Get<IUserAssign>(this.data.UserId),
      Users: this.userService.Get<IUser[]>(),
      Companies: this.companyService.Get<ICompany[]>(true),
      Documents: this.objectSapService.Get<IObjectSap[]>(),
      SeriesGenerationTypes: this.structuresService.Get('SeriesGenerationTypes'),
      SeriesTypes: this.structuresService.Get('SeriesTypes'),
      Setting: this.settingService.Get<ISettings>(SettingCode.FESerieDocument),
      DocOffline: this.structuresService.Get('DocTypesOffline')
    })
      .pipe(
        finalize(() => this.overlayService.Drop())
      )
      .subscribe({
        next: (callback) => {
          AddValidatorAutoComplete(this.serieForm, callback?.Documents.Data, 'Document');
          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });

          this.userAssin = callback?.UserAssing.Data;

          this.seriesTypes = callback.SeriesTypes.Data || [];
          this.docOffline = callback.DocOffline.Data || [];

          this.seriesGenerationTypes = callback.SeriesGenerationTypes.Data || [];

          this.user = (callback.Users.Data || []).find(x => x.Id == callback.UserAssing.Data.UserId) as IUser;

          this.company = (callback.Companies.Data || []).find(x => x.Id == callback.UserAssing.Data.CompanyId) as ICompany;

          this.typesDocuments = callback.Documents.Data;
          this.filteredtypesDocuments$ = of(this.typesDocuments)

          this.modalTitle = 'Compañía: ' + this.company?.Name + ' - Usuario: ' + this.user?.Email;

          this.feSeriesDocuments = JSON.parse(callback.Setting.Data.Json) as IObjectSap[] || [];

          this.LoadSeriesAssing();
        },
        error: err => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      }));
  }

  loadTableData(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.dataSource,
      RecordsCount: this.dataSource.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.seriesTableId
    });
  }

  LoadSeries(_code: string): void {
    this.overlayService.OnGet();
    this.seriesService.Get<ISerie[]>(_code, this.company?.Id)
      .pipe(
        finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (response) => {
          this.validatorSerie = AddValidatorAutoComplete(this.serieForm, response?.Data, 'Serie', this.validatorSerie)
          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });
          this.typesSeries = response.Data;
          this.filteredtypesSeries$ = of(this.typesSeries)
        },
        error: err => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      })
  }

  LoadSeriesAssing(): void {
    this.overlayService.OnGet();
    this.seriesService.GetSeriesByUser<ISerieAssing[]>(this.userAssin.Id, this.company.Id)
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: response => {
          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });

          this.dataSource = (response.Data || []).map(x => this.sharedService.MapTableColumns({
            ...x,
            Serie: x.NoSerie + " - " + x.SerieDescription,
            DocumentName: this.typesDocuments.find(d => d.ObjectCode == x.DocumentType)?.TableDescription || '-',
            Type: this.seriesTypes.find(s => s.Key === x.SerieType.toString())?.Description || '-',
            Serial: x.IsSerial ? (this.seriesGenerationTypes.find(x => x.Key === 'Auto')?.Description || '-') : (this.seriesGenerationTypes.find(x => x.Key === 'Manual')?.Description || '-')
          }, Object.keys(this.seriesTableColumns)));

          this.loadTableData();
        },
        error: err => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      })
  }

  /**
   * Method to obtain series of the selected document
   * @param option - Objet of docuement selected
   */
  onOptionSelected(option: IObjectSap): void {
    this.LoadSeries(option.ObjectCode.toString());
    this.ResetDocument();
  }

  /**
   * Method that saves the configured series
   * @constructor
   */
  SaveChanges(): void {
    this.overlayService.OnPost();


    let serieAssingWithFESerie= {
      SeriesByUser : {
                      UserAssingId: this.userAssin.Id,
                      CompanyId: this.company.Id,
                      NoSerie: this.serieForm.get('Serie')?.value.Serie,
                      DocumentType: this.serieForm.get('Document')?.value.ObjectCode,
                      SerieType: +this.serieForm.get('Type')?.value,
                      IsSerial: this.serieForm.get('TypeSerie')?.value == "Auto",
                      SerieDescription: this.serieForm.get('Serie')?.value.SerieName
                    } as ISerieAssing
    } as  ISerieAssingWithFESerie

    if(this.ShowFESeriesSection()){
      serieAssingWithFESerie.FESerie ={
          SerieName: this.serieForm.get('SerieName')?.value,
          BranchOffice: this.serieForm.get('BranchOffice')?.value,
          Terminal: this.serieForm.get('Terminal')?.value,
          NextNumber: this.serieForm.get('NextNumber')?.value
        } as IFESerie

    }

    this.seriesService.Post(serieAssingWithFESerie)
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: callback => {
          this.modalService.Continue({
            title: 'Serie agregada correctamente',
            type: CLModalType.SUCCESS
          });

          this.LoadSeriesAssing();
          this.serieForm.reset();
        },
        error: err => {
          this.modalService.Continue({
            title: 'Se produjo un error agregando la serie',
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      })

  }

  /**
   * function for validity if the FE series section is to be displayed
   * @constructor
   */
  ShowFESeriesSection(): boolean{
     return  (this.feSeriesDocuments.some(document => document.ObjectCode == this.serieForm.get('Document')?.value?.ObjectCode)
              &&  +this.serieForm.get('Type')?.value == SerieTypes.Offline)
  }

}
