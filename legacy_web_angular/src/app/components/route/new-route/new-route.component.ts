import {AfterViewInit, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {IBusinessPartner} from "@app/interfaces/i-business-partner";
import {
  IRoute,
  IRouteFrequency,
  IRouteLine,
  IRouteLinesGroupedByCustomer,
  IRouteWithLines
} from "@app/interfaces/i-route";
import {IStructures} from "@app/interfaces/i-structures";
import {IActionButton} from "@app/interfaces/i-action-button";
import {AgmMap} from "@agm/core";
import {ActivatedRoute, Router} from "@angular/router";
import {finalize, interval, Observable, Subscription, takeWhile} from "rxjs";
import {INewRouteResolveData} from "@app/interfaces/i-resolvers";
import {MatDialog} from "@angular/material/dialog";
import {
  CustomerLocationsModalComponent
} from "@Component/route/new-route/customer-locations-modal/customer-locations-modal.component";
import {ICustomerLocationsDialogData} from "@app/interfaces/i-dialog-data";
import {AlertsService, CLModalType, CLToastType, ModalService} from "@clavisco/alerts";
import {RouteService} from "@app/services/route.service";
import {OverlayService} from "@clavisco/overlay";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {CLPrint, GetError, Structures} from "@clavisco/core";
import {SharedService} from "@app/shared/shared.service";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {RouteCalculationService} from "@app/services/route-calculation.service";
import {RouteCalculationsPipe} from "@app/pipes/route-calculations.pipe";
import Validation from "@app/custom-validation/custom-validators";
import {ISearchModalComponentDialogData, SearchModalComponent} from "@clavisco/search-modal";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {BusinessPartnersService} from "@app/services/business-partners.service";

@Component({
  selector: 'app-new-route',
  templateUrl: './new-route.component.html',
  styleUrls: ['./new-route.component.scss']
})
export class NewRouteComponent implements OnInit, OnDestroy, AfterViewInit {

  routeForm!: FormGroup;
  businessPartners: IBusinessPartner[] = [];
  frequencies: IRouteFrequency[] = [];
  routeTypes: IStructures[] = [];
  permissions: IPermissionbyUser[] = [];
  route!: IRoute;
  routeInEdition: IRoute | undefined;
  routesCalculationPipe: RouteCalculationsPipe = new RouteCalculationsPipe();
  actionButtons: IActionButton[] = [];

  mapLatitude: number = 9.7154591;
  mapLongitude: number = -84.2066289;
  mapZoom: number = 9;

  routeLines: IRouteLine[] = [];
  routeLinesGroupedByCustomer: IRouteLinesGroupedByCustomer<IRouteLine>[] = [];
  googleMap!: AgmMap;

  lastRouteType: string = '';
  currenAction: string = 'creada'
  currenActionError: string = 'creando'
  //#region component search
  searchModalId = "searchModalId";
  //#endregion

  allSubscriptions$: Subscription;
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private matDialog: MatDialog,
    private alertsService: AlertsService,
    private router: Router,
    private routeService: RouteService,
    private modalService: ModalService,
    private sharedService: SharedService,
    private routeCalculationService: RouteCalculationService,
    private overlayService: OverlayService,
    private businessPartnerService: BusinessPartnersService,
    @Inject('LinkerService') private linkerService: LinkerService,
  ) {
    this.allSubscriptions$ = new Subscription();
  }

  ngOnInit(): void {
    this.OnLoad();

  }

  ngAfterViewInit() {
  }

  /**
   * Method to load component
   * @constructor
   */
  OnLoad(){
    this.LoadForm();
    this.HandleResolvedData();
    this.SetValidatorAutoComplete();

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

  HandleResolvedData(): void {
    this.allSubscriptions$.add(this.activatedRoute.data.subscribe({
      next: (data) => {
        const resolvedData = data['resolvedData'] as INewRouteResolveData;

        if (resolvedData) {
          this.frequencies = resolvedData.Frequencies;
          this.routeTypes = resolvedData.Types;
          this.permissions = resolvedData.Permissions;
          if (Object.keys(resolvedData.Route || {}).length) {
            this.routeInEdition = resolvedData.Route;
            this.lastRouteType = this.routeInEdition?.Type.toString() || '';
            this.routeLines = resolvedData.RouteLines || [];
            this.routeForm.patchValue({
              ...this.routeInEdition,
              Type: this.routeInEdition?.Type.toString() || 0
            });

            this.GroupRouteLinesByCustomer();
            this.actionButtons = [
              {
                Key: 'ESTIMATE_CALCS',
                MatIcon: 'monitoring',
                Text: 'Estimar calculos',
                MatColor: 'primary'
              },
              {

                Key: 'SAVE',
                MatIcon: 'edit',
                Text: 'Actualizar',
                MatColor: 'primary'
              }
            ];
          }else{
            this.actionButtons = [
              {
                Key: 'ESTIMATE_CALCS',
                MatIcon: 'monitoring',
                Text: 'Estimar calculos',
                MatColor: 'primary'
              },
              {

                Key: 'SAVE',
                MatIcon: 'save',
                Text: 'Crear',
                MatColor: 'primary'
              }
            ];
          }
        }
      }
    }));
  }

  /**
   * Show business partner search modal
   * @constructor
   */
  ShowModalSearchBusinnesPartner(): void
  {
    this.matDialog.open(SearchModalComponent, {
      width: '65%',
      height: "80%",
      data: {
        Id: this.searchModalId,
        ModalTitle: 'Lista de socios de negocios',
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
            
            let lastGroupNum = this.routeLines?.reduce((acc, i) => (i.LineGroupNum > acc.LineGroupNum ? i : acc), { LineGroupNum: 0 }).LineGroupNum || 0;
   
            this.matDialog.open(CustomerLocationsModalComponent, {
              data: {
                RouteType: this.routeForm.get("Type")?.value,
                RoutesTypes: this.routeTypes,
                Customer: value,
                LineGroupNum: lastGroupNum + 1
              } as ICustomerLocationsDialogData,
              minWidth: '50%',
              minHeight: '40%',
              maxHeight: 'calc(100% - 20px)',
              maxWidth: 'calc(100% - 20px)'
            })
              .afterClosed()
              .subscribe({
                next: (result: IRouteLine[]) => {
                  this.SetRouteLines(result);
                }
              });
            // Se resetea el valor de campo
            this.routeForm.get("Customer")?.reset('');

          }
        }
      });
  }
  /**
   * Listening event of component search-modal
   * @param _event - Event gets data from modal
   * @constructor
   */
  OnModalRequestRecords = (_event: ICLEvent): void => {
    const VALUE = JSON.parse(_event.Data);
    this.overlayService.OnGet();
    this.businessPartnerService.GetbyFilter<IBusinessPartner[]>(VALUE?.SearchValue)
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
   * Send information to search-modal component
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


  LoadForm(): void {
    this.routeForm = this.fb.group({
      Customer: [''],
      Name: ['', Validators.required],
      RouteFrequencyId: [0, Validators.required],
      Type: [0, Validators.required],
      ExpirationDate: [new Date(), Validators.required]
    });

    this.routeForm.valueChanges.subscribe({next: (val) => this.route = {...val}});

    this.routeForm.get('Customer')?.disable();

    this.routeForm.get('Type')?.valueChanges.subscribe({
      next: (routeType) => {
        this.routeForm.get('Customer')?.enable();
        if (this.routeLines.length && routeType && routeType !== this.lastRouteType) {
          this.modalService.Question({
            title: '¿Desea cambiar el tipo de la ruta?',
            subtitle: 'Al cambiar el tipo de la ruta se eliminarán las líneas'
          }).subscribe({
            next: (result) => {
              if (result) {
                this.routeLines = [];
                this.routeLinesGroupedByCustomer = [];
                this.lastRouteType = routeType;
              } else {
                this.routeForm.get('Type')?.setValue(this.lastRouteType);
              }
            }
          });
        }
      }
    });
  }

  /**
   * Sets a custom validator on the 'Customer' field to ensure a value is selected from the autocomplete list.
   */
  SetValidatorAutoComplete(): void{
    this.routeForm.get('Customer')?.addValidators(Validation.validateValueAutoComplete(this.businessPartners));
  }

  /**
   * Subscribes to value changes in the 'Customer' autocomplete field.
   * 
   * If a valid customer (object) is selected, opens a modal dialog to configure
   * customer locations and adds new route lines. If the input is a string, it's ignored.
   */
  ListenCustomerAutocompleteChanges(): void {
    this.routeForm.get("Customer")?.valueChanges.subscribe({
      next: (customer: IBusinessPartner | string) => {

        // Si es un socio es porque seleccionaron de la lista, si es un string es porque estan escribiendo algo
        if (customer) {
          if (typeof customer !== "string") {

            let lastGroupNum = this.routeLines?.reduce((acc, i) => (i.LineGroupNum > acc.LineGroupNum ? i : acc), { LineGroupNum: 0 })?.LineGroupNum || 0;

            this.matDialog.open(CustomerLocationsModalComponent, {
              data: {
                RouteType: this.routeForm.get("Type")?.value,
                RoutesTypes: this.routeTypes,
                Customer: customer,
                LineGroupNum: lastGroupNum + 1
              } as ICustomerLocationsDialogData,
              minWidth: '50%',
              minHeight: '40%',
              maxHeight: 'calc(100% - 20px)',
              maxWidth: 'calc(100% - 20px)'
            })
              .afterClosed()
              .subscribe({
                next: (result: IRouteLine[]) => {
                  this.SetRouteLines(result);
                }
              });

            this.routeForm.get("Customer")?.reset('');
          } 
        }
      }
    });
  }

  OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'ESTIMATE_CALCS':
        this.EstimateRouteCalculationsDetails();
        break;
      case 'SAVE':
        this.OnClickSaveRoute();
        break;
    }
  }

  /**
   * To perform route calculations
   * @constructor
   */
  async EstimateRouteCalculationsDetails(): Promise<void> {
    let routeLinesOrdered = this.routeLinesGroupedByCustomer.reduce((result: IRouteLine[], rgc) => {
      result.push(...rgc.RouteLines);
      return result;
    }, []);

    if (!routeLinesOrdered || !routeLinesOrdered.length) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'Para realizar los cálculos de ruta debe haber una ubicación almenos'
      });
      return;
    }

    let result = await this.routeCalculationService.CalculateRoute(routeLinesOrdered);

    this.route.TotalEstimatedDistance = 0;
    this.route.TotalEstimatedDuration = 0;

    result.forEach(matrix => {
      if (matrix.rows) {
        matrix.rows.forEach(row => {
          row.elements.forEach(element => {
            if (element.status === 'OK') {
              this.route.TotalEstimatedDistance += element.distance.value;
              this.route.TotalEstimatedDuration += element.duration.value;
            }
          });
        });
      }
    });

    this.modalService.Continue({
      type: CLModalType.INFO,
      title: 'Cálculos de ruta',
      subtitle: `Distancia: ${this.routesCalculationPipe.transform(this.route.TotalEstimatedDistance, 'distance')}  |  Duración: ${this.routesCalculationPipe.transform(this.route.TotalEstimatedDuration, 'time')}`
    });
  }

  OnClickSaveRoute(): void {
    if (!this.routeForm.get('Name')?.value) {
      this.alertsService.Toast({type: CLToastType.ERROR, message: 'Debe ingresar el nombre de la ruta'});
      return;
    }

    if (!this.routeForm.get('RouteFrequencyId')?.value) {
      this.alertsService.Toast({type: CLToastType.ERROR, message: 'Debe seleccionar la frecuencia de la ruta'});
      return;
    }

    if (!this.routeForm.get('Type')?.value) {
      this.alertsService.Toast({type: CLToastType.ERROR, message: "Debe seleccionar el tipo de la ruta"});
      return;
    }

    if (!this.routeForm.get('ExpirationDate')?.value) {
      this.alertsService.Toast({type: CLToastType.ERROR, message: "Debe ingresar una fecha de expiración"});
      return;
    }

    if (new Date(this.routeForm.get('ExpirationDate')?.value) <= new Date()) {
      this.alertsService.Toast({
        type: CLToastType.ERROR,
        message: "La fecha de expiración debe ser mayor que la fecha actual"
      });
      return;
    }

    if (!this.routeLines.length) {
      this.alertsService.Toast({
        type: CLToastType.ERROR,
        message: "Debe haber al menos una ubicación de cliente seleccionada"
      });
      return;
    }


    this.routeLines = this.routeLinesGroupedByCustomer.reduce((result: IRouteLine[], rgc) => {
      result.push(...rgc.RouteLines);
      return result;
    }, []);

    let routeWithLines: IRouteWithLines = {
      Route: {...(this.routeInEdition ?? {}), ...this.route},
      RouteLines: this.routeLines
    };

    let observable$: Observable<Structures.Interfaces.ICLResponse<IRouteWithLines>> | null = null;

    this.overlayService.OnPost();

    if (!this.routeInEdition && !Object.keys(this.routeInEdition ?? {}).length) {

      observable$ = this.routeService.Post(routeWithLines);
      this.currenAction = 'creada';
      this.currenActionError = 'creando';
    } else {

      observable$ = this.routeService.Patch(routeWithLines);
      this.currenAction = 'actualizada';
      this.currenActionError = 'actualizando';
    }

    observable$
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (response) => {

          this.modalService.Continue({
            title: `Ruta ${this.currenAction} correctamente`,
            type: CLModalType.SUCCESS
          });

          this.routeForm.reset('');
          this.routeLines = [];
          this.routeLinesGroupedByCustomer = [];

          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {relativeTo: this.activatedRoute});
        },
        error: (err) => {
          this.modalService.Continue({
            title:  `Se produjo un error ${this.currenActionError} la ruta`,
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      });
  }

  OnMapReady(_event: any): void {
    this.googleMap = _event;
  }

  ZoomToMarker(_line: IRouteLine): void {
    this.mapLatitude = _line.Latitude;
    this.mapLongitude = _line.Longitude;

    interval(200)
      .pipe(
        takeWhile(() => this.mapZoom !== 20)
      )
      .subscribe(() => {
        this.mapZoom++;
      });
  }

  /**
   * Groups the current route lines by customer and line group number.
   */
  GroupRouteLinesByCustomer(): void {
    this.routeLinesGroupedByCustomer = this.routeLines.reduce((routeLinesByCustomer: IRouteLinesGroupedByCustomer<IRouteLine>[], item) => {
      if (!routeLinesByCustomer.some(rbc => rbc.CardCode === item.CardCode && rbc.LineGroupNum === item.LineGroupNum)) {
        routeLinesByCustomer.push({
          CardCode: item.CardCode,
          CardName: item.CardName,
          RouteLines: [item],
          LineGroupNum: item.LineGroupNum
        });
      } else {
        routeLinesByCustomer.find(rbc => rbc.CardCode === item.CardCode && rbc.LineGroupNum === item.LineGroupNum)?.RouteLines.push(item);
      }
      return routeLinesByCustomer;
    }, []);
  }

  /**
 * Adds new route lines to the current list, avoiding duplicates based on CardCode, AddressLineId, and LineGroupNum.
 * 
 * @param _newRouteLines - The new route lines to be added.
 */
  SetRouteLines(_newRouteLines: IRouteLine[]): void {
    if (_newRouteLines.some(nrl => this.routeLines.some(rl => rl.CardCode === nrl.CardCode && rl.AddressLineId === nrl.AddressLineId && rl.LineGroupNum === nrl.LineGroupNum))) {
      this.alertsService.Toast({
        message: 'Ya existen ubicaciones de este socio agregadas, se agregaran las nuevas',
        type: CLToastType.INFO
      });
      this.routeLines.push(..._newRouteLines.filter(nrl => !this.routeLines.some(rl => rl.CardCode === nrl.CardCode && rl.AddressLineId === nrl.AddressLineId && rl.LineGroupNum === nrl.LineGroupNum)));
    } else {
      this.routeLines.push(..._newRouteLines);
    }

    this.GroupRouteLinesByCustomer();
  }

  /**
   * Opens a modal to add new locations for the given customer and group.
   * After the modal closes, the selected route lines are added to the route list.
   * 
   * @param _route - The grouped route lines by customer for which a new location will be added.
   */
  AddNewCustomerLocation(_route: IRouteLinesGroupedByCustomer<IRouteLine>): void {
    this.matDialog.open(CustomerLocationsModalComponent, {
      data: {
        RouteType: this.routeForm.get("Type")?.value,
        RoutesTypes: this.routeTypes,
        Customer: {CardCode: _route.CardCode},
        LineGroupNum: _route.LineGroupNum
      } as ICustomerLocationsDialogData,
      minWidth: '50%',
      minHeight: '40%',
      maxHeight: 'calc(100% - 20px)',
      maxWidth: 'calc(100% - 20px)'
    })
      .afterClosed()
      .subscribe({
        next: (result: IRouteLine[]) => {
          this.SetRouteLines(result);
        }
      });
  }

  OnGroupedRouteLinesPositionChange(_event: CdkDragDrop<IRouteLinesGroupedByCustomer<IRouteLine>[]>): void {
    moveItemInArray(this.routeLinesGroupedByCustomer, _event.previousIndex, _event.currentIndex);
  }

  OnRouteLinePositionChange(_event: CdkDragDrop<IRouteLine[]>, _cardCode: string): void {
    moveItemInArray(this.routeLinesGroupedByCustomer.find(rgc => rgc.CardCode === _cardCode)!.RouteLines, _event.previousIndex, _event.currentIndex);
  }

  OnDeleteRouteLine(_routeLine: IRouteLine): void {
    let index = this.routeLines.findIndex(r => JSON.stringify(r) === JSON.stringify(_routeLine));

    this.routeLines.splice(index, 1);

    this.GroupRouteLinesByCustomer();
  }

  /**
   * Deletes all route lines associated with the specified customer and group number.
   * 
   * @param _route - The grouped customer route lines to be removed.
   */
  DeleteCustomerRouteLines(_route: IRouteLinesGroupedByCustomer<IRouteLine>): void {
    this.routeLines = this.routeLines.filter( rl => !(rl.CardCode === _route.CardCode && rl.LineGroupNum === _route.LineGroupNum));
    this.GroupRouteLinesByCustomer();
  }

  ngOnDestroy(): void {
    this.allSubscriptions$.unsubscribe();
  }

  HasPermission(_permissionName: string): boolean {
    return this.permissions.some(p => p.Name === _permissionName);
  }
}
