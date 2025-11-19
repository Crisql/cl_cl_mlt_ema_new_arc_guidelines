import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {IActionButton} from "@app/interfaces/i-action-button";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {LinkerEvent} from "@app/enums/e-linker-events";
import {
  BoYesNo,
  EndType,
  ObjectSAP, PreloadedDocumentActions,
  RecurrenceDayOfWeek,
  RecurrencePattern,
  RecurrenceSequenceSpecifier,
  SubOption
} from "@app/enums/enums";
import {ISearchModalComponentDialogData, SearchModalComponent} from "@clavisco/search-modal";
import {IBPAddresses, IBusinessPartner} from "@app/interfaces/i-business-partner";
import {MatDialog} from "@angular/material/dialog";
import {MasterDataBusinessPartnersService} from "@app/services/master-data-business-partners.service";
import {SAPUsersService} from "@app/services/sapusers.service";
import {OverlayService} from "@clavisco/overlay";
import {catchError, filter, finalize, forkJoin, map, Observable, of, Subscription, switchMap} from "rxjs";
import {AlertsService, CLModalType, CLToastType, ModalService} from "@clavisco/alerts";
import {CLPrint, Structures} from "@clavisco/core";
import {ActivitiesService} from "@app/services/activities.service";
import {ActivatedRoute, Router} from "@angular/router";
import {IActivitiesComponentResolvedData} from "@app/interfaces/i-resolvers";
import {
  IActivities, IActivityStates, IBPAndContact, IBPAndContactAndDirections,
  IContactPersonActivities, ICountriesActivity,
  IDayOfWeekActivities,
  IDocumentsActivities,
  IItemsActivities,
  ILocationActivities,
  IMonthActivities,
  IObjectSAPActivities,
  IOptionActivities,
  IPriority,
  IRecurrenceActivities, IStatesCountriesActivity,
  ISubjectActivities,
  ITypeActivities,
  IWeekActivities
} from "@app/interfaces/i-activities";
import {formatDate} from "@angular/common";
import {FormatDate, ZoneDate} from "@app/shared/common-functions";
import {ISAPUsers} from "@app/interfaces/i-SAP-Users";
import {IStructures} from "@app/interfaces/i-structures";

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss']
})
export class ActivitiesComponent implements OnInit, OnDestroy {

  //#region FORMUALARIOS
  documentForm!: FormGroup;
  dailyForm!: FormGroup;
  monthForm!: FormGroup;
  weekForm!: FormGroup;
  annuallyForm!: FormGroup;
  intervalForm!: FormGroup;
  generalForm!: FormGroup;
  docVinculateForm!: FormGroup;
  footerGeneralForm!: FormGroup;
  //#endregion

  //#region LISTAS
  typeActivities: ITypeActivities[] = [];
  subjectActivities: ISubjectActivities[] = [];
  priorityActivities: IPriority[] = [];
  locationActivities: ILocationActivities[] = [];
  bpAddressActivities: IBPAddresses[] = [];
  recurrenceActivities: IRecurrenceActivities[] = [];
  optionActivities: IOptionActivities[] = [];
  contactPerson: IContactPersonActivities[] = [];
  dayOfWeekActivities: IDayOfWeekActivities[] = [];
  weekActivities: IWeekActivities[] = [];
  monthActivities: IMonthActivities[] = [];
  objectSAPActivities: IObjectSAPActivities[] = [];
  activities = [{Code: '', Name: 'Prueba'}]
  actionButtons: IActionButton[] = [];
  businessPartners: IBusinessPartner[] = [];
  documents: IDocumentsActivities[] = [];
  items: IItemsActivities[] = [];
  SAPUsers: ISAPUsers[] = [];
  typesActivityReminders: IStructures[] = [];
  activityStates: IActivityStates[] = [];
  countriesActivity: ICountriesActivity[] = [];
  statesCountries: IStatesCountriesActivity[] = [];
  //#endregion

  countrySelected!: ICountriesActivity | null;


  //#region OBJETOS
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  businessPartner!: IBusinessPartner;

  //#endregion

  //#region VARIABLES BOOLEAN
  rpDaily: boolean = false;
  rpWeekly: boolean = false;
  rpMonthly: boolean = false;
  rpAnnually: boolean = false;
  rpNone: boolean = true;
  activateSearchBtn = true;
  drafSelected: boolean = false;
  isMeetingActivity: boolean = false;
  isTaskActivity: boolean = false;
  isNoteActivity: boolean = false;
  isOtherActivity: boolean = false;
  //#endregion

  //#region VARIABLES STRING
  searchModalId = 'searchBpModalId';
  searchDocumentsModalId = 'searchDocumentsModalId';
  searchItemsModalId = 'searchItemsModalId';
  searchCountriesModalId = 'searchCountriesModalId';
  docEntry: string = '';
  activityCode: number = 0;
  action: string = '';
  //#endregion


  //#region OBSERVABLES
  allSubscriptions = new Subscription();

  //#endregion

  isAddressSN: boolean = false;

  constructor(
    private fb: FormBuilder,
    private matDialog: MatDialog,
    private masterDataBusinessPartnersService: MasterDataBusinessPartnersService,
    private overlayService: OverlayService,
    private alertsService: AlertsService,
    @Inject('LinkerService') private linkerService: LinkerService,
    private activitiesService: ActivitiesService,
    private activitiesRoute: ActivatedRoute,
    private modalService: ModalService,
    private SAPUsersService: SAPUsersService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.action = this.activitiesRoute.snapshot.queryParamMap.get('Action') ?? '';
    Register<CL_CHANNEL>(this.searchModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalRequestRecords, this.callbacks);
    Register<CL_CHANNEL>(this.searchDocumentsModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalRequestDocumentsRecords, this.callbacks);
    Register<CL_CHANNEL>(this.searchItemsModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalRequestItemsRecords, this.callbacks);
    Register<CL_CHANNEL>(this.searchCountriesModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalRequestCountriesRecords, this.callbacks);
    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.OnActionButtonClicked, this.callbacks);

    this.actionButtons = [
      {
        Key: 'CLEAN',
        MatIcon: 'mop',
        Text: 'Limpiar'
      }
    ];

    if (this.action && this.action === PreloadedDocumentActions.EDIT) {
      this.actionButtons.unshift({
        Key: 'ADD',
        MatIcon: 'edit',
        Text: 'Actualizar',
        MatColor: 'primary',
        DisabledIf: (_form?: FormGroup) => _form?.invalid || false
      });
    } else {
      this.actionButtons.unshift({
        Key: 'ADD',
        MatIcon: 'save',
        Text: 'Crear',
        MatColor: 'primary',
        DisabledIf: (_form?: FormGroup) => _form?.invalid || false
      });
    }

    this.InitForm();
    if (!this.action) {
      this.GetCurrentHour();
      this.CalculateDuration();
    }
    this.HandleResolveData();

    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );
  }

  ngOnDestroy() {
    this.allSubscriptions?.unsubscribe();
  }

  /**
   *
   * @constructor
   * @private
   */
  private HandleResolveData(): void {
    this.activatedRoute.data
      .subscribe({
        next: (data) => {
          const resolvedData: IActivitiesComponentResolvedData = data['resolvedData'];
          if (this.action && (this.action === PreloadedDocumentActions.EDIT || this.action === PreloadedDocumentActions.DUPLICATE)) {
            if (resolvedData) {
              this.typeActivities = resolvedData.TypeActivities;
              this.subjectActivities = resolvedData.SubjectActivities;
              this.locationActivities = resolvedData.LocationActivities;
              this.bpAddressActivities = resolvedData.BusinessPartnersAddress;
              this.priorityActivities = resolvedData.PriorityActivities;
              this.recurrenceActivities = resolvedData.RecurrenceActivities;
              this.optionActivities = resolvedData.OptionActivities;
              this.dayOfWeekActivities = resolvedData.DayOfWeekActivities;
              this.weekActivities = resolvedData.WeekActivities;
              this.monthActivities = resolvedData.MonthActivities;
              this.objectSAPActivities = resolvedData.ObjectSAPActivities;
              this.SAPUsers = resolvedData.SAPUsers;
              this.typesActivityReminders = resolvedData.TypeActivityReminders;
              this.contactPerson = resolvedData.ContactPerson
              this.activityStates = resolvedData.ActivityStates;

              if (resolvedData.DetailActivity) {

                this.ValidatesTypesActivities(resolvedData.DetailActivity.Activity);
                if(this.action === PreloadedDocumentActions.EDIT ){
                  this.docEntry = resolvedData.DetailActivity.DocEntry;
                  this.activityCode = resolvedData.DetailActivity.ActivityCode;
                }

                this.documentForm.patchValue(resolvedData.DetailActivity);
                this.documentForm.controls['ActivityType'].setValue(resolvedData.DetailActivity.ActivityType?.toString());
                this.documentForm.controls['Subject'].setValue(resolvedData.DetailActivity.Subject?.toString());

                this.documentForm.controls['ContactPersonCode'].setValue(resolvedData.DetailActivity.ContactPersonCode?.toString());


                this.generalForm.patchValue(resolvedData.DetailActivity);
                this.generalForm.controls['Priority'].setValue(+resolvedData.DetailActivity.Priority);
                this.generalForm.controls['Location'].setValue(resolvedData.DetailActivity.Location?.toString());
                this.generalForm.controls['Room'].setValue(resolvedData.DetailActivity.Room?.toString());
                this.generalForm.controls['StartTime'].setValue(this.ConvertToFormatTime(+resolvedData.DetailActivity.StartTime));
                this.generalForm.controls['EndTime'].setValue(this.ConvertToFormatTime(resolvedData?.DetailActivity?.EndTime ? +resolvedData?.DetailActivity?.EndTime : null));

                this.dailyForm.patchValue(resolvedData.DetailActivity);

                this.weekForm.patchValue(resolvedData.DetailActivity);
                this.weekForm.controls['Monday'].setValue(resolvedData.DetailActivity.Monday === BoYesNo.tYES);
                this.weekForm.controls['Tuesday'].setValue(resolvedData.DetailActivity.Tuesday === BoYesNo.tYES);
                this.weekForm.controls['Wednesday'].setValue(resolvedData.DetailActivity.Wednesday === BoYesNo.tYES);
                this.weekForm.controls['Thursday'].setValue(resolvedData.DetailActivity.Thursday === BoYesNo.tYES);
                this.weekForm.controls['Friday'].setValue(resolvedData.DetailActivity.Friday === BoYesNo.tYES);
                this.weekForm.controls['Saturday'].setValue(resolvedData.DetailActivity.Saturday === BoYesNo.tYES);
                this.weekForm.controls['Sunday'].setValue(resolvedData.DetailActivity.Sunday === BoYesNo.tYES);


                this.monthForm.patchValue(resolvedData.DetailActivity);

                this.annuallyForm.patchValue(resolvedData.DetailActivity);

                this.intervalForm.patchValue(resolvedData.DetailActivity);

                this.footerGeneralForm.patchValue(resolvedData.DetailActivity);
                this.footerGeneralForm.controls['InactiveFlag'].setValue(resolvedData.DetailActivity.InactiveFlag === BoYesNo.tYES);
                this.footerGeneralForm.controls['Closed'].setValue(resolvedData.DetailActivity.Closed === BoYesNo.tYES);
                this.footerGeneralForm.controls['Reminder'].setValue(resolvedData.DetailActivity.Reminder === BoYesNo.tYES);
                //Se carga el valor en minutos
                this.footerGeneralForm.controls['ReminderPeriod'].setValue(resolvedData.DetailActivity.ReminderPeriod / 60);


                this.docVinculateForm.patchValue(resolvedData.DetailActivity);
                this.docVinculateForm.controls['DocType'].setValue(+resolvedData.DetailActivity.DocType);

                if (resolvedData.DetailActivity?.Country && resolvedData.CountryActivity) {
                  this.countrySelected = resolvedData.CountryActivity;
                  this.statesCountries = resolvedData.StatesCountryActivity || [];
                  this.generalForm.controls['Country'].setValue(this.countrySelected.Name);
                }

                if (resolvedData.DetailActivity?.ContactPersonCode != 0 || resolvedData.DetailActivity?.ContactPersonCode != null && resolvedData.DetailActivity?.Phone == null) {
                  this.SetContactPerson(String(resolvedData.DetailActivity?.ContactPersonCode));

                } else if (resolvedData.DetailActivity?.ContactPersonCode != null && resolvedData.DetailActivity?.Phone != null) {
                  this.documentForm.controls['Phone'].setValue(resolvedData.DetailActivity?.Phone);
                } else {
                  this.documentForm.controls['Phone'].setValue(resolvedData.DetailActivity?.Phone);
                }

                if(resolvedData.DetailActivity.Location?.toString()=='-2'){
                  this.isAddressSN=true
                }else{
                  this.isAddressSN=false;
                }

                switch (resolvedData.DetailActivity.RecurrencePattern) {
                  case RecurrencePattern.rpDaily:
                    this.rpDaily = true;
                    break;
                  case RecurrencePattern.rpWeekly:
                    this.rpWeekly = true;
                    break;
                  case RecurrencePattern.rpMonthly:
                    this.rpMonthly = true;
                    break;
                  case RecurrencePattern.rpAnnually:
                    this.rpAnnually = true;
                    break;
                  case RecurrencePattern.rpNone:
                    this.rpNone = true;
                    break;
                }
                this.CalculateDuration();
              }else{
                this.typeActivities = resolvedData.TypeActivities;
                this.subjectActivities = resolvedData.SubjectActivities;
                this.locationActivities = resolvedData.LocationActivities;
                this.bpAddressActivities = resolvedData.BusinessPartnersAddress;
                this.priorityActivities = resolvedData.PriorityActivities;
                this.recurrenceActivities = resolvedData.RecurrenceActivities;
                this.optionActivities = resolvedData.OptionActivities;
                this.dayOfWeekActivities = resolvedData.DayOfWeekActivities;
                this.weekActivities = resolvedData.WeekActivities;
                this.monthActivities = resolvedData.MonthActivities;
                this.objectSAPActivities = resolvedData.ObjectSAPActivities;
                this.SAPUsers = resolvedData.SAPUsers;
                this.typesActivityReminders = resolvedData.TypeActivityReminders;
                this.activityStates = resolvedData.ActivityStates;
                this.action = '';
                this.Reset();
                let data = this.actionButtons.find(x=>x.Key === 'ADD');
                if (data) {
                  data.MatIcon = 'save';
                  data.Text = 'Crear';
                }
              }
              this.footerGeneralForm.controls['ReminderType'].setValue(this.typesActivityReminders.find(type => type.Default)?.Key);
            }
          } else {
            this.typeActivities = resolvedData.TypeActivities;
            this.subjectActivities = resolvedData.SubjectActivities;
            this.locationActivities = resolvedData.LocationActivities;
            this.bpAddressActivities = resolvedData.BusinessPartnersAddress;
            this.priorityActivities = resolvedData.PriorityActivities;
            this.recurrenceActivities = resolvedData.RecurrenceActivities;
            this.optionActivities = resolvedData.OptionActivities;
            this.dayOfWeekActivities = resolvedData.DayOfWeekActivities;
            this.weekActivities = resolvedData.WeekActivities;
            this.monthActivities = resolvedData.MonthActivities;
            this.objectSAPActivities = resolvedData.ObjectSAPActivities;
            this.SAPUsers = resolvedData.SAPUsers;
            this.typesActivityReminders = resolvedData.TypeActivityReminders;
            this.activityStates = resolvedData.ActivityStates;
          }
        }
        })


  }


  ValidatesTypesActivities(_activityCode: string){
    this.isMeetingActivity = _activityCode == 'cn_Meeting';

    this.isNoteActivity = _activityCode == 'cn_Note'

    this.isTaskActivity = _activityCode == 'cn_Task';

    this.isOtherActivity = _activityCode == 'cn_Other'
  }

  /**
   * Converts an integer number into a time format.
   * @param numero parameter number time
   * @constructor
   * @private
   */
  private ConvertToFormatTime(numero: number | null) {

    if(!numero){
      return null
    }
    // Extraer las partes de la hora y los minutos
    var horas = Math.floor(numero / 100);
    var minutos = numero % 100;

    // Asegurarse de que haya dos dígitos en las horas y los minutos
    var horasStr = horas < 10 ? '0' + horas : horas.toString();
    var minutosStr = minutos < 10 ? '0' + minutos : minutos.toString();

    // Concatenar las partes con ":"
    var horaFormato = horasStr + ':' + minutosStr;

    return horaFormato;
  }

  /**
   * This method is used to initialize form
   * @constructor
   * @private
   */
  private InitForm(): void {
    this.documentForm = this.fb.group({
      Activity: ['cn_Conversation', [Validators.required]],
      ActivityType: ['-1', [Validators.required]],
      Phone: [null],
      CardCode: [{value: null, disabled: true}, [Validators.required]],
      CardName: [null, [Validators.required]],
      Subject: ['-1'],
      HandledBy: [null, Validators.required],
      ContactPersonCode: [null]
    });

    this.footerGeneralForm = this.fb.group({
      ReminderPeriod: [15],
      Closed: [null],
      InactiveFlag: [null],
      Reminder: [null],
      ReminderType: [null]
    });

    this.generalForm = this.fb.group({
      Details: [null],
      StartDate: [new Date(), [Validators.required]],
      StartTime: [null, [Validators.required]],
      EndDueDate: [new Date(), [Validators.required]],
      EndTime: [null, [Validators.required]],
      Duration: [null, [Validators.required]],
      Priority: [1, [Validators.required]],
      Location: ['-2', [Validators.required]],
      RecurrencePattern: ['rpNone', Validators.required],
      Street: [null],
      City: [null],
      Room: [null],
      Country: [null],
      State: [null],
      Status: [null],
      AddressBP: [null],
    });

    this.dailyForm = this.fb.group({
      Interval: [1],
      RepeatOption: [null],
    });

    this.weekForm = this.fb.group({
      Interval: [1],
      Monday: [false],
      Tuesday: [false],
      Wednesday: [false],
      Thursday: [false],
      Friday: [false],
      Saturday: [false],
      Sunday: [false],
    });

    this.monthForm = this.fb.group({
      Interval: [1],
      RepeatOption: [null],
      RecurrenceDayInMonth: [null],
      RecurrenceSequenceSpecifier: [null],
      RecurrenceDayOfWeek: [null]
    });

    this.annuallyForm = this.fb.group({
      Interval: [1],
      RepeatOption: [null],
      RecurrenceDayInMonth: [null],
      RecurrenceSequenceSpecifier: [null],
      RecurrenceDayOfWeek: [null],
      RecurrenceMonth: [null],
      RecurrenceMonthAnnually: [null],
    });

    this.intervalForm = this.fb.group({
      Interval: [null],
      SeriesStartDate: [{value: new Date(), disabled: true}],
      SeriesEndDate: [{value: null, disabled: true}],
      EndType: [null],
      MaxOccurrence: [null],
    });

    this.docVinculateForm = this.fb.group({
      DocType: ['-1'],
      DocNum: [{value: 0, disabled: true}]
    });
  }

  /**
   * This method is used to get new data
   * @constructor
   * @private
   */
  private Clear() {

    this.modalService.CancelAndContinue({
      type: CLModalType.QUESTION,
      title: `Está seguro de que desea limpiar campos?`,
    }).pipe(
      filter(res => res),
      switchMap(response => {
        this.overlayService.OnGet();
        return this.RefreshData();
      }),
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (data => {

        if (data) {
          this.typeActivities = data.TypeActivities;
          this.subjectActivities = data.SubjectActivities;
          this.locationActivities = data.LocationActivities;
          this.bpAddressActivities = data.BusinessPartnersAddress;
          this.priorityActivities = data.PriorityActivities;
          this.recurrenceActivities = data.RecurrenceActivities;
          this.optionActivities = data.OptionActivities;
          this.dayOfWeekActivities = data.DayOfWeekActivities;
          this.weekActivities = data.WeekActivities;
          this.monthActivities = data.MonthActivities;
          this.objectSAPActivities = data.ObjectSAPActivities;
          this.SAPUsers = data.SAPUsers;
        }
        this.Reset();
      }),
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });
  }

  /**
   * This method is used to reset data
   * @constructor
   * @private
   */
  private Reset(): void {

    this.documentForm.reset();
    this.documentForm.patchValue({
      Activity: 'cn_Conversation',
      ActivityType: '-1',
      Subject: '-1',
      DocType: '-1'
    });

    this.ValidatesTypesActivities(this.documentForm.controls['Activity'].value);

    this.generalForm.reset();
    this.generalForm.patchValue({
      StartDate: new Date(ZoneDate()),
      EndDueDate: new Date(ZoneDate()),
      Priority: 1,
      Location: '-2',
      RecurrencePattern: 'rpNone',
    });

    this.footerGeneralForm.reset();
    this.footerGeneralForm.get('ReminderPeriod')?.patchValue(15);
    this.footerGeneralForm.controls['ReminderType'].setValue(this.typesActivityReminders.find(type=> type.Default)?.Key);
    this.intervalForm.reset();
    this.dailyForm.reset();
    this.weekForm.reset();
    this.monthForm.reset();
    this.annuallyForm.reset();
    this.docVinculateForm.reset();

    this.dailyForm.controls['Interval'].setValue(1);
    this.weekForm.controls['Interval'].setValue(1);
    this.monthForm.controls['Interval'].setValue(1);
    this.annuallyForm.controls['Interval'].setValue(1);

    this.docEntry = '';
    this.activateSearchBtn = true;
    this.rpDaily = false;
    this.rpWeekly = false;
    this.rpMonthly = false;
    this.rpAnnually = false;
    this.rpNone = true;
    this.drafSelected = false;
    this.contactPerson = [];
    this.countrySelected = null;
    this.docVinculateForm.controls['DocNum'].disable();
    this.GetCurrentHour();
    this.CalculateDuration();

    if (this.action) {
      this.action = '';
      this.router.navigate(['activities', 'create']);
      let data = this.actionButtons.find(x=>x.Key === 'ADD');
      if (data) {
        data.MatIcon = 'save';
        data.Text = 'Crear';
      }
    }
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
      switchMap((response: IBusinessPartner) => {
        if (response) {
          this.overlayService.OnGet();
          return this.activitiesService.GetContactPerson(response.CardCode).pipe(
            map(callback => {
              return {
                BP: response,
                ContactPerson: callback?.Data || []
              } as IBPAndContact;
            }),
            switchMap((contactPersonResponse :IBPAndContact) => {
              // Realiza la segunda consulta al backend usando los datos de la primera consulta
              return this.activitiesService.GetBPAddress(response.CardCode,'').pipe(
                map(callback => {
                  // Mapea los resultados de la segunda consulta
                  return {
                    BP: response,
                    ContactPerson: contactPersonResponse.ContactPerson?? [],
                    BPAddresses: callback?.Data || []
                  }as IBPAndContactAndDirections;
                }),
                catchError(error => {
                  // Maneja los errores de la segunda consulta
                  return of({
                    BP: response,
                    ContactPerson: contactPersonResponse.ContactPerson??[],
                    BPAddresses: null
                  });
                })
              );
            }),
            catchError(error => {
              // Maneja los errores de la primera consulta
              return of({
                BP: response,
                ContactPerson: null,
                BPAddresses: null
              });
            })
          )
        } else {
          return of({
            BP: response,
            ContactPerson: null,
            BPAddresses: null
          })
        }

      }),
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (value) => {
        if (value.BP) {
          this.documentForm.controls['CardCode'].setValue(value.BP.CardCode);
          this.documentForm.controls['CardName'].setValue(value.BP.CardName);
        }

        this.contactPerson = value.ContactPerson || [];
        this.bpAddressActivities = value.BPAddresses || [];
        this.documentForm.controls['ContactPersonCode'].setValue(null);
        this.documentForm.controls['Phone'].setValue(null);

        if (value.ContactPerson && value.ContactPerson.length > 0) {
          let firstResult = this.contactPerson[0];
          this.documentForm.controls['ContactPersonCode'].setValue(firstResult.ContactCode);
          this.documentForm.controls['Phone'].setValue(firstResult.Phone);
        }
        if (value.BPAddresses && value.BPAddresses.length > 0) {
          let firstResult = this.bpAddressActivities[0];
          this.SetDirections(firstResult.AddressName);
          this.isAddressSN=true
        }
      }
    });
  }


  /**
   * Show search mode for countries of activity
   * @constructor
   */
  public ShowSearchModalCountriesActivity(): void {
    this.matDialog.open(SearchModalComponent, {
      width: '65%',
      height: "60%",
      data: {
        Id: this.searchCountriesModalId,
        ModalTitle: 'Lista de países',
        MinInputCharacters: 2,
        InputDebounceTime: 200,
        ShouldPaginateRequest: true,
        TableMappedColumns: {
          IgnoreColumns: [],
          RenameColumns: {
            Code: 'Código',
            Name: 'País',
          }
        }
      } as ISearchModalComponentDialogData<ICountriesActivity>
    }).afterClosed().pipe(
      switchMap((response: ICountriesActivity) => {
        if (response) {
          this.overlayService.OnGet();
          return this.activitiesService.GetStatesCountriesActivity(response.Code).pipe(
            map(callback => {
              return {
                Country: response,
                States: callback?.Data || []
              }
            }),
            catchError(error => {
              return of({
                Country: response,
                States: null
              })
            })
          )
        } else {
          return of({
            Country: response,
            States: null
          })
        }

      }),
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (value) => {

        if (value.Country) {
          this.countrySelected = value.Country.Code ? value.Country : null;
          this.generalForm.controls['Country'].setValue(value.Country?.Name || null);
        }

        if(value.States){
          this.generalForm.controls['State'].setValue(null);
          this.statesCountries = value.States || [];
        }

      }
    });
  }
  /**
   * This method is used to show modal
   * @constructor
   */
  public ShowModal(): void {

    if (this.drafSelected && +this.docVinculateForm.controls['DocType'].value === ObjectSAP.OITM) {
      return;
    }

    if (+this.docVinculateForm.controls['DocType'].value === ObjectSAP.OITM) {
      this.ShowModalSearchItems()
    } else {
      this.ShowModalSearchDocuments();
    }
  }

  /**
   * Show business partner search modal
   * @constructor
   */
  public ShowModalSearchDocuments(): void {
    this.matDialog.open(SearchModalComponent, {
      width: '65%',
      height: "80%",
      data: {
        Id: this.searchDocumentsModalId,
        ModalTitle: 'Lista de documentos',
        MinInputCharacters: 1,
        InputDebounceTime: 200,
        ShouldPaginateRequest: true,
        TableMappedColumns: {
          IgnoreColumns: [
            'DocDate',
            'DocEntry'
          ],
          RenameColumns: {
            DocNum: '#',
            DocDateFormatted: 'Fecha',
            CardName: 'Nombre',
            Comments: 'Comentario'
          }
        }
      } as ISearchModalComponentDialogData<IDocumentsActivities>
    }).afterClosed()
      .subscribe({
        next: (value: IDocumentsActivities) => {
          if (value) {
            this.docVinculateForm.controls['DocNum'].setValue(value.DocNum);
            this.docEntry = value.DocEntry.toString();
          }
        }
      });
  }

  /**
   * Show business partner search modal
   * @constructor
   */
  public ShowModalSearchItems(): void {
    this.matDialog.open(SearchModalComponent, {
      width: '65%',
      height: "80%",
      data: {
        Id: this.searchItemsModalId,
        ModalTitle: 'Lista de artículos',
        MinInputCharacters: 1,
        InputDebounceTime: 200,
        ShouldPaginateRequest: true,
        TableMappedColumns: {
          IgnoreColumns: [],
          RenameColumns: {
            Codigo: 'Código',
            Description: 'Descripción',
            OnHand: 'Disponible'
          }
        }
      } as ISearchModalComponentDialogData<IItemsActivities>
    }).afterClosed()
      .subscribe({
        next: (value: IItemsActivities) => {
          if (value) {
            if (value) {
              this.docVinculateForm.controls['DocNum'].setValue(value.Codigo);
              this.docEntry = value.Codigo;
            }
          }
        }
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
    this.masterDataBusinessPartnersService.GetbyFilter<IBusinessPartner[]>(VALUE?.SearchValue)
      .pipe(finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: (callback) => {
        this.businessPartners = callback.Data;
        this.InflateTableBusinnesPartner();
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
   * Listening event of component search-modal
   * @param _event - Event gets data from modal
   * @constructor
   */
  public OnModalRequestDocumentsRecords = (_event: ICLEvent): void => {
    const VALUE = JSON.parse(_event.Data);

    let docType = this.drafSelected ? ObjectSAP.ODRF : +this.docVinculateForm.controls['DocType'].value;

    this.overlayService.OnGet();
    this.activitiesService.GetDocumentsActivities(docType, VALUE?.SearchValue || 0)
      .pipe(finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: (callback) => {
        if (callback.Data && callback.Data.length > 0) {
          this.documents = callback.Data.map(element => {
            return {
              ...element,
              DocDateFormatted: formatDate(element.DocDate, 'MMMM d, y hh:mm a', 'en'),
            }
          }) ?? [];
          this.InflateTableDocuments();
          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });
        } else {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: 'No se obtuvieron registros.'
          });
        }
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    })

  }

  /**
   * Listening event of component search-modal
   * @param _event - Event gets data from modal
   * @constructor
   */
  public OnModalRequestItemsRecords = (_event: ICLEvent): void => {
    const VALUE = JSON.parse(_event.Data);

    this.overlayService.OnGet();
    this.activitiesService.GetItemsActivities((VALUE?.SearchValue?.toUpperCase()) || '')
      .pipe(finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: (callback) => {
        if (callback.Data && callback.Data.length > 0) {
          this.items = callback.Data;
          this.InflateTableItems();
          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });
        } else {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: 'No se obtuvieron registros.'
          });
        }
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    })

  }

  /**
   * Listening event of component search-modal
   * @param _event - Event gets data from modal
   * @constructor
   */
  public OnModalRequestCountriesRecords = (_event: ICLEvent): void => {
    const VALUE = JSON.parse(_event.Data);

    this.overlayService.OnGet();
    this.activitiesService.GetCountriesActivity((VALUE?.SearchValue?.toUpperCase()) || '')
      .pipe(finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: (callback) => {
        if (callback.Data && callback.Data.length > 0) {
          this.countriesActivity = callback.Data;
          this.InflateTableCountriesActivity();
          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });
        } else {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: 'No se obtuvieron registros.'
          });
        }
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    })

  }

  /**
   * Upload the contact of the selected contact person
   * @param _contactPersonCode
   * @constructor
   */
  SetContactPerson(_contactPersonCode: string): void{
    let phone = this.contactPerson.find(contact => contact.ContactCode == _contactPersonCode)?.Phone || null;
    this.documentForm.controls['Phone'].setValue(phone);
  }

  /**
   * This method is used to inflate table business partners
   * @constructor
   * @private
   */
  private InflateTableBusinnesPartner(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.businessPartners,
      RecordsCount: this.businessPartners.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.searchModalId
    });
  }

  /**
   * This method is used to inflate table documents
   * @constructor
   * @private
   */
  private InflateTableDocuments(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.documents,
      RecordsCount: this.documents.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.searchDocumentsModalId
    });
  }

  /**
   * This method is used to inflate table documents
   * @constructor
   * @private
   */
  private InflateTableItems(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.items,
      RecordsCount: this.items.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.searchItemsModalId
    });
  }

  /**
   * This method is used to inflate table documents
   * @constructor
   * @private
   */
  private InflateTableCountriesActivity(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.countriesActivity,
      RecordsCount: this.countriesActivity.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.searchCountriesModalId
    });
  }

  /**
   * This method is used to listen event buttons
   * @param _actionButton model events
   * @constructor
   */
  public OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'ADD':
        this.SaveActivity();
        break;
      case 'CLEAN':
        this.Clear();
        break;
    }
  }

  /**
   * This method is used to listen event of the filed date
   * @param _event model event
   * @constructor
   */
  public CalculateDuration(): void {

    const StartDate = FormatDate(this.generalForm.controls['StartDate'].value);
    const StartTime = this.generalForm.controls['StartTime'].value;
    const EndDueDate = FormatDate(this.generalForm.controls['EndDueDate'].value);
    const EndTime = this.generalForm.controls['EndTime'].value;

    if (!StartDate || !StartTime || !EndDueDate || !EndTime) {
      return;
    }

    if (StartDate > EndDueDate) {
      return;
    }

    const StartDateTime = new Date(StartDate + ' ' + StartTime);
    const EndDateTime = new Date(EndDueDate + ' ' + EndTime);

    const diferencia = EndDateTime.getTime() - StartDateTime.getTime();
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));

    let resultado = '';
    if (dias > 0) {
      resultado += dias + (dias === 1 ? ' día, ' : ' días, ');
    }
    if (horas > 0) {
      resultado += horas + (horas === 1 ? 'hora, ' : 'horas, ');
    }
    if (minutos > 0) {
      resultado += minutos + (minutos === 1 ? ' minuto' : ' minutos');
    }


    this.generalForm.controls['Duration'].setValue(resultado);
    this.intervalForm.controls['SeriesStartDate'].setValue(StartDateTime);

  }

  /**
   * Reminder time is calculated in seconds
   * @param _time time of reminder
   * @param _reminderType type of reminder
   * @constructor
   */
 CalculateReminder(_time: number, _reminderType: string): number {
    switch (_reminderType) {
      case '0':
        return _time * 60;
      case '1':
        return _time * 3600;
      case '2':
        return _time * 86400;
      default:
        return _time
    }
  }

  /**
   * This method is used to save activity
   * @constructor
   * @private
   */
  private SaveActivity(): void {

    let data = {
      ...this.footerGeneralForm.getRawValue(),
      ...this.documentForm.getRawValue(),
      ...this.intervalForm.getRawValue(),
      ...this.generalForm.getRawValue(),
      ...this.weekForm.getRawValue(),
      ...this.dailyForm.getRawValue(),
      ...this.monthForm.getRawValue(),
      ...this.annuallyForm.getRawValue(),
      ...this.docVinculateForm.getRawValue()
    } as IActivities


    data.Reminder = data.Reminder ? BoYesNo.tYES : BoYesNo.tNO;
    data.ReminderPeriod = this.CalculateReminder(this.footerGeneralForm.get('ReminderPeriod')?.value, this.footerGeneralForm.get('ReminderType')?.value);
    data.Closed = data.Closed ? BoYesNo.tYES : BoYesNo.tNO;
    data.InactiveFlag = data.InactiveFlag ? BoYesNo.tYES : BoYesNo.tNO;

    if (data.RecurrencePattern === RecurrencePattern.rpDaily) {
      data.RepeatOption = this.dailyForm.controls['RepeatOption'].value;
      data.Interval = this.dailyForm.controls['Interval'].value;
    }

    if (data.RecurrencePattern === RecurrencePattern.rpWeekly) {
      data.Interval = this.weekForm.controls['Interval'].value;
    }

    if (data.RecurrencePattern === RecurrencePattern.rpMonthly) {
      data.RepeatOption = this.monthForm.controls['RepeatOption'].value;
      data.Interval = this.monthForm.controls['Interval'].value;
      data.RecurrenceSequenceSpecifier = this.monthForm.controls['RecurrenceSequenceSpecifier'].value;
      data.RecurrenceDayOfWeek = this.monthForm.controls['RecurrenceDayOfWeek'].value;
      data.RecurrenceDayInMonth = this.monthForm.controls['RecurrenceDayInMonth'].value;
      data.RecurrenceMonth = new Date(data.SeriesStartDate).getMonth() + 1;
    }

    if (data.RecurrencePattern === RecurrencePattern.rpAnnually) {
      data.RepeatOption = this.annuallyForm.controls['RepeatOption'].value;
      data.Interval = this.annuallyForm.controls['Interval'].value;
      data.RecurrenceSequenceSpecifier = this.annuallyForm.controls['RecurrenceSequenceSpecifier'].value;
      data.RecurrenceDayOfWeek = this.annuallyForm.controls['RecurrenceDayOfWeek'].value;
      data.RecurrenceDayInMonth = this.annuallyForm.controls['RecurrenceDayInMonth'].value;
      data.RecurrenceMonth = this.annuallyForm.controls['RecurrenceMonth'].value;
      if (data.RecurrencePattern === RecurrencePattern.rpAnnually && data.RepeatOption === SubOption.roByWeekDay) {
        data.RecurrenceMonth = this.annuallyForm.controls['RecurrenceMonthAnnually'].value;
      }
    }

    if (!data.Interval) {
      data.Interval = 1;
    }

    data.Monday = data.Monday ? BoYesNo.tYES : BoYesNo.tNO;
    data.Tuesday = data.Tuesday ? BoYesNo.tYES : BoYesNo.tNO;
    data.Wednesday = data.Wednesday ? BoYesNo.tYES : BoYesNo.tNO;
    data.Thursday = data.Thursday ? BoYesNo.tYES : BoYesNo.tNO;
    data.Friday = data.Friday ? BoYesNo.tYES : BoYesNo.tNO;
    data.Saturday = data.Saturday ? BoYesNo.tYES : BoYesNo.tNO;
    data.Sunday = data.Sunday ? BoYesNo.tYES : BoYesNo.tNO;
    data.StartDate = FormatDate(data.StartDate);
    data.EndDueDate = FormatDate(data.EndDueDate || '')
    data.Duration = this.GetSeconds();
    data.DurationType = 'du_Seconds';
    data.ReminderType = 'S';
    data.DocType = this.drafSelected ? ObjectSAP.ODRF.toString() : data.DocType;
    data.DocEntry = this.docEntry;
    data.SeriesStartDate = data.SeriesStartDate ? FormatDate(data.SeriesStartDate) : data.SeriesStartDate;
    data.SeriesEndDate = data.SeriesEndDate ? FormatDate(data.SeriesEndDate) : data.SeriesEndDate;
    data.ActivityCode = this.activityCode;
    data.Country = this.countrySelected?.Code || null;

    if (!this.ValidInputFields(data)) {
      return;
    }

    let request$;
    if (this.action && this.action === PreloadedDocumentActions.EDIT) {
      request$ = this.activitiesService.Patch(data);
    } else {
      request$ = this.activitiesService.Post(data);
    }

    if(data.Activity != 'cn_Meeting'){
      data.Country = null;
      data.State = null;
      data.Room = null;
      data.Street = null;
      data.City = null;
    }

    if(data.Activity != 'cn_Task'){
      data.Status = null;
    }

    if(data.Activity == 'cn_Note'){
      data.Location = null;
      data.EndTime = null;
      data.Duration = null;
      data.ContactPersonCode = null;
      data.EndDueDate = null;
    }

    if(data.Activity == 'cn_Note' || data.Activity == 'cn_Other') {
      data.RecurrencePattern = 'rpNone'
    }

    this.overlayService.OnPost();
    request$?.pipe(
      switchMap(response => {
        this.overlayService.Drop();
        return this.modalService.Continue({
          type: CLModalType.SUCCESS,
          title: this.GetTitle(response.Data?.ActivityCode),
          subtitle: this.GetSubTitle()
        });
      }),
      switchMap(response => {
        this.overlayService.OnGet();
        return this.RefreshData();
      }),
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (callback) => {
        if (callback) {
          this.typeActivities = callback.TypeActivities;
          this.subjectActivities = callback.SubjectActivities;
          this.locationActivities = callback.LocationActivities;
          this.bpAddressActivities = callback.BusinessPartnersAddress;
          this.priorityActivities = callback.PriorityActivities;
          this.recurrenceActivities = callback.RecurrenceActivities;
          this.optionActivities = callback.OptionActivities;
          this.dayOfWeekActivities = callback.DayOfWeekActivities;
          this.weekActivities = callback.WeekActivities;
          this.monthActivities = callback.MonthActivities;
          this.objectSAPActivities = callback.ObjectSAPActivities;
          this.SAPUsers = callback.SAPUsers;
        }
        this.Reset();
      },
      error: (error) => {
        this.alertsService.ShowAlert({HttpErrorResponse: error});
      }
    });
  }

  /**
   * This method is used to get title message
   * @param _code parameter code of the activity
   * @constructor
   * @private
   */
  private GetTitle(_code: number): string {
    if (this.action && this.action === PreloadedDocumentActions.EDIT) {
      return `Actividad #: ${this.activityCode}`;
    } else {
      return `Actividad #: ${_code}`
    }
  }

  /**
   * This method is used to get subtitle message
   * @constructor
   * @private
   */
  private GetSubTitle(): string {
    if (this.action && this.action === PreloadedDocumentActions.EDIT) {
      return 'Actualizada con éxito';
    } else {
      return 'Creada con éxito';
    }
  }

  /**
   * This method is used to display type recurrence pathern
   * @param _value property value
   * @constructor
   */
  public DisplayRecurrencePattern(_value: string): void {

    this.rpDaily = false;
    this.rpWeekly = false;
    this.rpMonthly = false;
    this.rpAnnually = false;
    this.rpNone = false;


    this.intervalForm.reset();
    this.intervalForm.controls['SeriesStartDate'].setValue(this.generalForm.controls['StartDate'].value);
    this.dailyForm.reset();
    this.weekForm.reset();
    this.monthForm.reset();
    this.annuallyForm.reset();

    this.dailyForm.controls['Interval'].setValue(1);
    this.weekForm.controls['Interval'].setValue(1);
    this.monthForm.controls['Interval'].setValue(1);
    this.annuallyForm.controls['Interval'].setValue(1);

    switch (_value) {
      case RecurrencePattern.rpDaily:
        this.rpDaily = true;
        break;
      case RecurrencePattern.rpWeekly:
        this.rpWeekly = true;
        break;
      case RecurrencePattern.rpMonthly:
        this.rpMonthly = true;
        break;
      case RecurrencePattern.rpAnnually:
        this.rpAnnually = true;
        break;
      case RecurrencePattern.rpNone:
        this.rpNone = true;
        break;
    }
  }

  /**
   * Enable input doc num
   * @constructor
   */
  public EnableDocNum(_option: number) {
    //This option is valid because it refers to the empty option
    if(_option != 0){
      this.docVinculateForm.controls['DocNum'].enable();
      this.activateSearchBtn = false;
    }else{
      this.docVinculateForm.controls['DocNum'].disable();
      this.activateSearchBtn = true;
    }

  }


  /**
   * Sections are shown or hidden depending on the activity
   * @param _activityCode
   * @constructor
   */
  OnSelectActivity(_activityCode: string): void {
    this.ValidatesTypesActivities(_activityCode);

    if(this.isTaskActivity){
      this.isAddressSN=true;
      this.generalForm.controls['Status'].setValue(this.activityStates.find(state=> state.StatusId == -2)?.StatusId);
    }else{
      this.generalForm.controls['Status'].setValue(null);
    }

  }

  /**
   * This method is used to set current houer
   * @constructor
   */
  private GetCurrentHour(): void {
    console.log(ZoneDate());
    const horaActual: Date = new Date();
    const horaCon15MinutosMas: Date = new Date(horaActual.getTime() + 15 * 60000);
    const hora: number = horaActual.getHours();
    const minutos: number = horaActual.getMinutes();
    const horaCon15: number = horaCon15MinutosMas.getHours();
    const minutosCon15: number = horaCon15MinutosMas.getMinutes();

    const horaActualFormateada: string = this.PadLeft(hora.toString(), '0', 2) + ':' + this.PadLeft(minutos.toString(), '0', 2) + ':00';
    const horaCon15MinutosMasFormateada: string = this.PadLeft(horaCon15.toString(), '0', 2) + ':' + this.PadLeft(minutosCon15.toString(), '0', 2) + ':00';

    this.generalForm.controls['StartTime'].setValue(horaActualFormateada);
    this.generalForm.controls['EndTime'].setValue(horaCon15MinutosMasFormateada);
  }

  /**
   *  function seems to be a helper function used to pad a string with additional characters on the left until it reaches a specified length
   * @param value It's the value of the string that you want to pad with additional characters on the left.
   * @param character It's the character that will be used to pad the string.
   * @param length It's the total length you want the string to be after padding it with additional characters.
   * @private
   */
  private PadLeft(value: string, character: string, length: number): string {
    return (character.repeat(length) + value).slice(-length);
  }

  /**
   * This method is used to get seconds
   * @constructor
   * @private
   */
  private GetSeconds(): number {
    let seconds = 0;
    try {
      const StartDate = FormatDate(this.generalForm.controls['StartDate'].value);
      const StartTime = this.generalForm.controls['StartTime'].value;
      const EndDueDate = FormatDate(this.generalForm.controls['EndDueDate'].value);
      const EndTime = this.generalForm.controls['EndTime'].value;

      const StartDateTime = new Date(StartDate + ' ' + StartTime);
      const EndDateTime = new Date(EndDueDate + ' ' + EndTime);

      const diferenciaMilisegundos = EndDateTime.getTime() - StartDateTime.getTime();
      seconds = diferenciaMilisegundos / 1000;
    } catch (error) {
      this.alertsService.Toast({type: CLToastType.ERROR, message: `Error ${error}`});
    }

    return seconds;

  }

  /**
   * This method is used to select drafts
   * @param _value parameter value
   * @constructor
   */
  public ChangeDrafs(_value: boolean): void {
    this.drafSelected = _value;
  }

  /**
   * This method is used to enable or disable input form
   * @param _value
   */
  public ChangeEndType(_value: string): void {

    if (_value === EndType.etByCounter) {
      this.intervalForm.controls['MaxOccurrence'].enable();
    } else {
      this.intervalForm.controls['MaxOccurrence'].disable();
    }

    if (_value === EndType.etByDate) {
      this.intervalForm.controls['SeriesEndDate'].enable();
    } else {
      this.intervalForm.controls['SeriesEndDate'].disable();
    }

  }

  /**
   * This method is used to validate input fields
   * @param _data parameter model data activities
   * @constructor
   * @private
   */
  private ValidInputFields(_data: IActivities): boolean {

    if(this.isNoteActivity){
      return true
    }

    if (!_data.Duration || _data.Duration <= 0) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'Verifique el rango de fechas y hora de la actividad a crear.'
      })
      return false;
    }

    if (_data.RecurrencePattern !== RecurrencePattern.rpNone) {


      if (!_data.Interval) {
        this.alertsService.Toast({type: CLToastType.INFO, message: 'Ingrese el intervalo repetir cada.'});
        return false;
      }

      if (!_data.RepeatOption && _data.RecurrencePattern !== RecurrencePattern.rpWeekly) {
        this.alertsService.Toast({type: CLToastType.INFO, message: 'Seleccione la opción de repetir cada.'});
        return false;
      }

      if (_data.RecurrencePattern === RecurrencePattern.rpWeekly) {
        if (
          (!_data.Monday || _data.Monday === BoYesNo.tNO)
          && (!_data.Tuesday || _data.Tuesday === BoYesNo.tNO)
          && (!_data.Wednesday || _data.Wednesday === BoYesNo.tNO)
          && (!_data.Thursday || _data.Thursday === BoYesNo.tNO)
          && (!_data.Friday || _data.Friday === BoYesNo.tNO)
          && (!_data.Saturday || _data.Saturday === BoYesNo.tNO)
          && (!_data.Sunday || _data.Sunday === BoYesNo.tNO
          )
        ) {
          this.alertsService.Toast({type: CLToastType.INFO, message: 'Chekee un día de la semana.'});
          return false;
        }
      }


      if (_data.RepeatOption === SubOption.roByWeekDay
        && (_data.RecurrencePattern === RecurrencePattern.rpMonthly || _data.RecurrencePattern === RecurrencePattern.rpAnnually)
        && !_data.RecurrenceSequenceSpecifier
      ) {
        this.alertsService.Toast({type: CLToastType.INFO, message: 'Ingrese el ordinal de repetir el.'});
        return false;
      }


      if (_data.RepeatOption === SubOption.roByDate
        && (_data.RecurrencePattern === RecurrencePattern.rpMonthly || _data.RecurrencePattern === RecurrencePattern.rpAnnually)
        && !_data.RecurrenceDayInMonth
      ) {
        this.alertsService.Toast({type: CLToastType.INFO, message: 'Ingrese el dia del mes.'});
        return false;
      }

      if (_data.RepeatOption === SubOption.roByWeekDay
        && (_data.RecurrencePattern === RecurrencePattern.rpMonthly || _data.RecurrencePattern === RecurrencePattern.rpAnnually)
        && !_data.RecurrenceDayOfWeek
      ) {
        this.alertsService.Toast({type: CLToastType.INFO, message: 'Ingrese el día de repetir el.'});
        return false;
      }

      if (_data.RecurrencePattern === RecurrencePattern.rpAnnually && !_data.RecurrenceMonth) {
        this.alertsService.Toast({type: CLToastType.INFO, message: 'Ingrese el mes.'});
        return false;
      }


      if (!_data.EndType) {
        this.alertsService.Toast({type: CLToastType.INFO, message: 'Seleccione el intervalo.'});
        return false;
      }

      if (_data.EndType === EndType.etByDate && !_data.SeriesEndDate) {
        this.alertsService.Toast({type: CLToastType.INFO, message: 'Ingrese la fecha antes de.'});
        return false;
      }

      if (_data.EndType === EndType.etByCounter && !_data.MaxOccurrence) {
        this.alertsService.Toast({type: CLToastType.INFO, message: 'Ingrese el valor despues de.'});
        return false;
      }

      if (_data.EndType === EndType.etByDate && FormatDate(_data.SeriesStartDate) > FormatDate(_data.SeriesEndDate)) {
        this.alertsService.Toast({type: CLToastType.INFO, message: 'El intervalo de fechas no es válido.'});
        return false;
      }

      if (!_data.DocNum && _data.DocType !== '-1') {
        this.alertsService.Toast({type: CLToastType.INFO, message: 'Ingrese el número de documento'});
        return false;
      }

    }

    return true;
  }

  /**
   * This method is used to calculate neew Date
   * @constructor
   */
  public CalculateDateMonthly(): void {

    const dayOfWeek = this.monthForm.controls['RecurrenceDayOfWeek'].value;
    const ordinal = this.monthForm.controls['RecurrenceSequenceSpecifier'].value;

    //Validamos que sea de domingo a sabado ya que este calculo del switch solo aplica para los dias de la semana
    if (dayOfWeek && ordinal) {

      let currentDate = new Date(ZoneDate());
      let currentYear = currentDate.getFullYear();
      let currentMonth = currentDate.getMonth() + 1;

      const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
      const targetDayOfWeek = +RecurrenceDayOfWeek[dayOfWeek];

      let targetDay: number = 0;

      //#region CUANDO LA OPCION ES DE LUNES A DOMINGO

      if (targetDayOfWeek < RecurrenceDayOfWeek.rdowDay) {
        switch (ordinal) {
          case RecurrenceSequenceSpecifier.rsFirst:
            targetDay = 1 + (targetDayOfWeek - firstDayOfMonth + 7) % 7;
            break;
          case RecurrenceSequenceSpecifier.rsSecond:
            targetDay = 8 + (targetDayOfWeek - firstDayOfMonth + 7) % 7;
            break;
          case RecurrenceSequenceSpecifier.rsThird:
            targetDay = 15 + (targetDayOfWeek - firstDayOfMonth + 7) % 7;
            break;
          case RecurrenceSequenceSpecifier.rsFourth:
            targetDay = 22 + (targetDayOfWeek - firstDayOfMonth + 7) % 7;
            break;
          case RecurrenceSequenceSpecifier.rsLast:
            const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
            let lastDayOfMonthDay = new Date(currentYear, currentMonth - 1, lastDayOfMonth).getDay();
            targetDay = lastDayOfMonth - (lastDayOfMonthDay - targetDayOfWeek + 7) % 7;
            break;
        }
      }

      //#endregion

      //#region CUANDO LA OPCION ES DIA, DIA DE LA SEMANA, DIA DE FIN DE SEMANA

      switch (+RecurrenceDayOfWeek[dayOfWeek]) {
        case RecurrenceDayOfWeek.rdowDay:
        case RecurrenceDayOfWeek.rdowWeekDay:
          switch (ordinal) {
            case RecurrenceSequenceSpecifier.rsFirst:
              targetDay = 1;
              break;
            case RecurrenceSequenceSpecifier.rsSecond:
              targetDay = 2;
              break;
            case RecurrenceSequenceSpecifier.rsThird:
              targetDay = 3;
              break;
            case RecurrenceSequenceSpecifier.rsFourth:
              targetDay = 4;
              break;
            case RecurrenceSequenceSpecifier.rsLast:
              targetDay = new Date(currentYear, currentMonth, 0).getDate();
              break;
          }
          break;
        case RecurrenceDayOfWeek.rdowWeekendDay:

          const days = new Date(currentYear, currentMonth - 1, 0).getDate();
          const weekDays: number[] = [];
          for (let day = 1; day <= days; day++) {
            const dayWeek = new Date(currentYear, currentMonth - 1, day).getDay();
            if (dayWeek === RecurrenceDayOfWeek.rdowSun || dayWeek === RecurrenceDayOfWeek.rdowSat) {
              weekDays.push(day);
            }
          }

          switch (ordinal) {
            case RecurrenceSequenceSpecifier.rsFirst:
              targetDay = weekDays[0];
              break;
            case RecurrenceSequenceSpecifier.rsSecond:
              targetDay = weekDays[1];
              break;
            case RecurrenceSequenceSpecifier.rsThird:
              targetDay = weekDays[2];
              break;
            case RecurrenceSequenceSpecifier.rsFourth:
              targetDay = weekDays[3];
              break;
            case RecurrenceSequenceSpecifier.rsLast:
              targetDay = weekDays[weekDays.length - 1];
              break;
          }

          break;
      }

      //#endregion

      let newDate = new Date(currentYear, currentMonth - 1, targetDay);
      let formatNewDate = FormatDate(newDate);
      let formatCurrentDate = FormatDate(new Date());

      //Si la fecha calculada es menor que la fecha actual vamos hacia el siguiente mes
      if (formatNewDate < formatCurrentDate) {

        currentMonth++;
        if (currentMonth > 12) {
          currentMonth = 1;
          currentYear++;
        }
        const firstDayOfNextMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
        targetDay = 1 + (targetDayOfWeek - firstDayOfNextMonth + 7) % 7;
      }

      newDate = new Date(currentYear, currentMonth - 1, targetDay);
      this.intervalForm.controls['SeriesStartDate'].setValue(newDate);
      this.monthForm.controls['RecurrenceDayInMonth'].setValue(newDate.getDate());

    }

  }

  /**
   * This method is used to calculate neew Date
   * @constructor
   */
  public CalculateDateAnnually(): void {

    const dayOfWeek = this.annuallyForm.controls['RecurrenceDayOfWeek'].value;
    const ordinal = this.annuallyForm.controls['RecurrenceSequenceSpecifier'].value;
    const month = this.annuallyForm.controls['RecurrenceMonthAnnually'].value;

    //Validamos que sea de domingo a sabado ya que este calculo del switch solo aplica para los dias de la semana
    if (dayOfWeek && ordinal && month) {

      let currentDate = new Date(ZoneDate());
      let currentYear = currentDate.getFullYear();
      let currentMonth = month;

      const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
      const targetDayOfWeek = +RecurrenceDayOfWeek[dayOfWeek];

      let targetDay: number = 0;

      if (targetDayOfWeek < RecurrenceDayOfWeek.rdowDay) {
        switch (ordinal) {
          case RecurrenceSequenceSpecifier.rsFirst:
            targetDay = 1 + (targetDayOfWeek - firstDayOfMonth + 7) % 7;
            break;
          case RecurrenceSequenceSpecifier.rsSecond:
            targetDay = 8 + (targetDayOfWeek - firstDayOfMonth + 7) % 7;
            break;
          case RecurrenceSequenceSpecifier.rsThird:
            targetDay = 15 + (targetDayOfWeek - firstDayOfMonth + 7) % 7;
            break;
          case RecurrenceSequenceSpecifier.rsFourth:
            targetDay = 22 + (targetDayOfWeek - firstDayOfMonth + 7) % 7;
            break;
          case RecurrenceSequenceSpecifier.rsLast:
            const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
            let lastDayOfMonthDay = new Date(currentYear, currentMonth - 1, lastDayOfMonth).getDay();
            targetDay = lastDayOfMonth - (lastDayOfMonthDay - targetDayOfWeek + 7) % 7;
            break;
        }
      }

      //#region CUANDO LA OPCION ES DIA, DIA DE LA SEMANA, DIA DE FIN DE SEMANA

      switch (+RecurrenceDayOfWeek[dayOfWeek]) {
        case RecurrenceDayOfWeek.rdowDay:
        case RecurrenceDayOfWeek.rdowWeekDay:
          switch (ordinal) {
            case RecurrenceSequenceSpecifier.rsFirst:
              targetDay = 1;
              break;
            case RecurrenceSequenceSpecifier.rsSecond:
              targetDay = 2;
              break;
            case RecurrenceSequenceSpecifier.rsThird:
              targetDay = 3;
              break;
            case RecurrenceSequenceSpecifier.rsFourth:
              targetDay = 4;
              break;
            case RecurrenceSequenceSpecifier.rsLast:
              targetDay = new Date(currentYear, currentMonth, 0).getDate();
              break;
          }
          break;
        case RecurrenceDayOfWeek.rdowWeekendDay:

          const days = new Date(currentYear, currentMonth - 1, 0).getDate();
          const weekDays: number[] = [];
          for (let day = 1; day <= days; day++) {
            const dayWeek = new Date(currentYear, currentMonth - 1, day).getDay();
            if (dayWeek === RecurrenceDayOfWeek.rdowSun || dayWeek === RecurrenceDayOfWeek.rdowSat) {
              weekDays.push(day);
            }
          }

          switch (ordinal) {
            case RecurrenceSequenceSpecifier.rsFirst:
              targetDay = weekDays[0];
              break;
            case RecurrenceSequenceSpecifier.rsSecond:
              targetDay = weekDays[1];
              break;
            case RecurrenceSequenceSpecifier.rsThird:
              targetDay = weekDays[2];
              break;
            case RecurrenceSequenceSpecifier.rsFourth:
              targetDay = weekDays[3];
              break;
            case RecurrenceSequenceSpecifier.rsLast:
              targetDay = weekDays[weekDays.length - 1];
              break;
          }

          break;
      }

      //#endregion

      let newDate = new Date(currentYear, currentMonth - 1, targetDay);
      let formatNewDate = FormatDate(newDate);
      let formatCurrentDate = FormatDate(new Date());

      //Si la fecha calculada es menor que la fecha actual vamos hacia el siguiente mes
      if (formatNewDate < formatCurrentDate) {
        currentYear++;
        const firstDayOfNextMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
        targetDay = 1 + (targetDayOfWeek - firstDayOfNextMonth + 7) % 7;
      }

      newDate = new Date(currentYear, currentMonth - 1, targetDay);
      this.intervalForm.controls['SeriesStartDate'].setValue(newDate);
      this.annuallyForm.controls['RecurrenceDayInMonth'].setValue(newDate.getDate());

    }
  }

  /**
   * This method is used when calculating the date in the day of the month input change event.
   * @constructor
   */
  public CalculateDateInMonth(): void {
    const RecurrenceMonth = this.annuallyForm.controls['RecurrenceMonth'].value;
    const RecurrenceDayInMonth = this.annuallyForm.controls['RecurrenceDayInMonth'].value;

    if (RecurrenceMonth && RecurrenceDayInMonth) {
      let currentDate = new Date(ZoneDate());
      let currentYear = currentDate.getFullYear();
      let newDate = new Date(currentYear, RecurrenceMonth - 1, RecurrenceDayInMonth);
      this.intervalForm.controls['SeriesStartDate'].setValue(newDate);
    }
  }

  /**
   * This method is used to calculate date to day
   * @constructor
   */
  public CalculateDay(): void {
    const RecurrenceDayInMonth = +this.monthForm.controls['RecurrenceDayInMonth'].value;
    let currentDate = new Date(ZoneDate());
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth() + 1;
    let newDate = new Date(currentYear, currentMonth - 1, RecurrenceDayInMonth);

    let formatNewDate = FormatDate(newDate);
    let formatCurrentDate = FormatDate(new Date());

    if (formatNewDate < formatCurrentDate) {

      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    newDate = new Date(currentYear, currentMonth - 1, RecurrenceDayInMonth);

    this.intervalForm.controls['SeriesStartDate'].setValue(newDate);
  }

  /**
   * This method is used to disable option
   * @param _value parameter option
   * @constructor
   */
  public DisableOptionMonthly(_value: string) {
    if (_value === SubOption.roByDate) {
      this.monthForm.controls['RecurrenceDayInMonth'].enable();
    } else {
      this.monthForm.controls['RecurrenceDayInMonth'].disable();
    }

    if (_value === SubOption.roByWeekDay) {
      this.monthForm.controls['RecurrenceSequenceSpecifier'].enable();
      this.monthForm.controls['RecurrenceDayOfWeek'].enable();
    } else {
      this.monthForm.controls['RecurrenceSequenceSpecifier'].disable();
      this.monthForm.controls['RecurrenceDayOfWeek'].disable();
    }
  }

  /**
   * This method is used to refresh data
   * @constructor
   * @private
   */
  private RefreshData(): Observable<IActivitiesComponentResolvedData | null> {
    return forkJoin({
      TypeActivities: this.activitiesService.GetTypeActivities().pipe(catchError(error => of(null))),
      SubjectActivities: this.activitiesService.GetSubjectActivities().pipe(catchError(error => of(null))),
      PriorityActivities: this.activitiesService.GetPriorityActivities().pipe(catchError(error => of(null))),
      RecurrenceActivities: this.activitiesService.GetRecurrenceActivities().pipe(catchError(error => of(null))),
      LocationActivities: this.activitiesService.GetLocationActivities().pipe(catchError(error => of(null))),
      OptionActivities: this.activitiesService.GetOptionActivities().pipe(catchError(error => of(null))),
      DayOfWeekActivities: this.activitiesService.GetDayOfWeekActivities().pipe(catchError(error => of(null))),
      WeekActivities: this.activitiesService.GetWeekActivities().pipe(catchError(error => of(null))),
      MonthActivities: this.activitiesService.GetMonthActivities().pipe(catchError(error => of(null))),
      ObjectSAPActivities: this.activitiesService.GetObjectSAPActivities().pipe(catchError(error => of(null))),
      SAPUsers: this.SAPUsersService.GetSAPUsers().pipe(catchError(error => of(null)))
    }).pipe(
      map(response => {
        return {
          TypeActivities: response?.TypeActivities?.Data ?? [],
          SubjectActivities: response?.SubjectActivities?.Data ?? [],
          PriorityActivities: response?.PriorityActivities?.Data ?? [],
          RecurrenceActivities: response?.RecurrenceActivities?.Data ?? [],
          LocationActivities: response?.LocationActivities?.Data ?? [],
          OptionActivities: response?.OptionActivities?.Data ?? [],
          DayOfWeekActivities: response?.DayOfWeekActivities?.Data ?? [],
          WeekActivities: response?.WeekActivities?.Data ?? [],
          MonthActivities: response?.MonthActivities?.Data ?? [],
          ObjectSAPActivities: response?.ObjectSAPActivities?.Data ?? [],
          SAPUsers: response?.SAPUsers?.Data ?? []
        } as IActivitiesComponentResolvedData
      })
    )
  }

  /**
   * This method is used to disable option
   * @param _value parameter option
   * @constructor
   */
  public DisableOptionAnnually(_value: string) {
    if (_value === SubOption.roByDate) {
      this.annuallyForm.controls['RecurrenceDayInMonth'].enable();
      this.annuallyForm.controls['RecurrenceMonth'].enable();
    } else {
      this.annuallyForm.controls['RecurrenceDayInMonth'].disable();
      this.annuallyForm.controls['RecurrenceMonth'].disable();
    }

    if (_value === SubOption.roByWeekDay) {
      this.annuallyForm.controls['RecurrenceSequenceSpecifier'].enable();
      this.annuallyForm.controls['RecurrenceDayOfWeek'].enable();
      this.annuallyForm.controls['RecurrenceMonthAnnually'].enable();
    } else {
      this.annuallyForm.controls['RecurrenceSequenceSpecifier'].disable();
      this.annuallyForm.controls['RecurrenceDayOfWeek'].disable();
      this.annuallyForm.controls['RecurrenceMonthAnnually'].disable();
    }
  }

  /**
   * Upload the directions of the selected bussines parterns
   * @param _addresName
   * @constructor
   */
  SetDirections(_addresName: string): void{
    let addres:IBPAddresses|null = this.bpAddressActivities.find(contact => contact.AddressName == _addresName) || null;
    this.generalForm.controls['AddressBP'].setValue(addres?.AddressName);
    this.generalForm.controls['Street'].setValue(addres?.Street || null);
    this.generalForm.controls['City'].setValue(addres?.City || null);

    this.activitiesService.GetCountriesActivities(addres?.Country).pipe().subscribe({
      next: (value) => {

        if (value.Data) {
          this.countrySelected = value.Data.find(country=>country.Code == addres?.Country ) || null;
          this.generalForm.controls['Country'].setValue(this.countrySelected?.Name || null);
          if(addres!=null){
            this.activitiesService.GetStatesCountriesActivity(addres.Country).pipe().subscribe({
              next:(state)=>{
                if(state.Data){
                  this.statesCountries=state.Data;
                }
              }
            })
          }
        }
      }
    });

    if (this.statesCountries.length>0) {
      let code:string|undefined=this.statesCountries.find(state=>String(state.Code)==String(addres?.State))?.Code;
      this.generalForm.controls['State'].setValue(code || null);
    }
  }
  /**
   * Change value variable isAddressSN
   * @param _location
   * @constructor
   */
  ChangeLocation(_location: string): void{
    if(_location=='-2'){
      this.isAddressSN=true;
    }else{
      this.isAddressSN=false;
    }
  }

}
