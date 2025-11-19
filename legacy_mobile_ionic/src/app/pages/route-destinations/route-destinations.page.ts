import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {IonItemSliding, LoadingController, MenuController, PopoverController,} from "@ionic/angular";
import {AlertType, CheckType, Geoconfigs, RouteStatus,} from "src/app/common";
import {LocalStorageVariables} from "src/app/common/enum";
import {CheckComponent, NavigationAppsComponent} from "src/app/components";
import {ICheckComponentInputData, INavigationAppsComponentInputData} from "src/app/models/db/i-modals-data";
import {CommonService, GeoconfigService, LocalStorageService, Repository} from "src/app/services";
import {IRouteWithLines, IRouteLine} from "../../models/db/route-model";
import {finalize} from "rxjs/operators";
import {forkJoin} from "rxjs";

@Component({
  selector: "app-route-destinations",
  templateUrl: "./route-destinations.page.html",
  styleUrls: ["./route-destinations.page.scss"],
})
export class RouteDestinationsPage implements OnInit {
  route: IRouteWithLines;
  isRouteActive = false;
  availableMapApps: any[];
  multipleChecks: boolean;
  documentCheck: boolean;
  reorder = false;

  constructor(
    private loadingController: LoadingController,
    private menuController: MenuController,
    private popoverController: PopoverController,
    private activatedRoute: ActivatedRoute,
    private repositoryRoute: Repository.Route,
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private geoconfigService: GeoconfigService
  ) {}

  ngOnInit(): void {
  }

  ionViewWillEnter(){
    this.SendInitialRequests();
  }

  /**
   * Retrieves the required data to set up the component
   * @constructor
   */
  async SendInitialRequests(): Promise<void> {
    const routeId = Number(this.activatedRoute.snapshot.paramMap.get("routeId"));

    let loader = await this.loadingController.create();
    loader.present();

    forkJoin([
      this.repositoryRoute.GetRoute(routeId),
      this.geoconfigService.GetGeoConfigurations()
    ])
      .pipe(
          finalize(() => loader.dismiss())
      )
      .subscribe({
        next: (responses) => {
          if (responses[1].Data)
          {
            this.multipleChecks = !!responses[1].Data.find((x) => x.Key == Geoconfigs.MultipleChecks)
            this.documentCheck = !!responses[1].Data.find((x) => x.Key == Geoconfigs.DocumentCheck)
          }
          
          this.route = responses[0];

          if(this.route)
          {
            if (Number(this.route.Route.Status) === RouteStatus.Active)
            {
              this.isRouteActive = true;
            }
          }
          else
          {
            this.commonService.Alert(AlertType.INFO, "La ruta seleccionada no fue encontrada", "Selected route not found");
          }
        },
        error: (err) => {
          this.commonService.Alert(AlertType.ERROR, err, err);
        }
      });
  }

  /**
   * Open the menu to selected the document linked to the route
   * @param _routeDestination Represent the route line active
   * @param _itemSliding Represent the button element of ionic
   * @constructor
   */
  async OnClickDocumentCheck(_routeDestination: IRouteLine, _itemSliding: IonItemSliding): Promise<void> {
      let itemSlidingRatio: number = await _itemSliding.getSlidingRatio();

      if(itemSlidingRatio <= -1)//Si es -1 significa que esta completamente abierto
      {
        _itemSliding.close();
        
        if (_routeDestination.CheckStatus !== CheckType.CheckIn) return;
        
        this.localStorageService.data.set(LocalStorageVariables.PreselectedCustomerCardCode, _routeDestination.CardCode);

        const menuElement = await this.menuController.get('mainMenu');

        if (menuElement) {
          await menuElement.toggle(true);
        }
    }
  }

  /**
   * Validates if the user can create the selected check type
   * @param _checkType Selected check type
   * @constructor
   */
  CanCreateCheck(_checkType: number): boolean 
  {
      if (_checkType !== CheckType.CheckIn) 
      {
          return true;
      } 
      else
      {
          if (this.route.RouteLines.some((x) => x.CheckStatus === CheckType.CheckIn)) 
          {
              this.commonService.Alert(
                  AlertType.WARNING,
                  'Hay un punto con check in activo',
                  'There is a way point with an active check in'
              );

              return false;
          }

          return true;
      }
  }

  /**
   * Handles the navigation app popover display when sliding an item.
   *
   * This method checks the sliding ratio of the given `IonItemSliding`. 
   * If the ratio indicates a full slide to the left (≤ -1), it opens a popover 
   * (`NavigationAppsComponent`) allowing the user to select a navigation app 
   * for the specified route destination.
   *
   * @param _routeDestination Route destination data to be passed into the navigation apps component.
   * @param $event Click event that triggered the action, used to anchor the popover.
   * @param _itemSliding The IonItemSliding element being interacted with.
   *
   * @returns A Promise that resolves once the popover is presented.
   */
  async OnClickNavigationApps(
    _routeDestination: IRouteLine,
    $event: any,
    _itemSliding: IonItemSliding
  ): Promise<void> {
    let slidingRatio: number = await _itemSliding.getSlidingRatio();

    if(slidingRatio <= -1)
    {
      let popoverMaps = await this.popoverController.create({
        component: NavigationAppsComponent,
        componentProps: {
          data: {
            RouteDestination: _routeDestination
          } as INavigationAppsComponentInputData,
        },
        event: $event,
      });

      popoverMaps.present();
    }
  }

  /**
   * Validate if the user can create checks, then show a modal
   * @param _checkType Type of the check
   * @param _checkName Name of the check
   * @param _routeLine Selected route line
   * @param _itemSliding Represent the button element of ionic
   * @constructor
   */
  async OnClickCreateCheck(_checkType: CheckType, _checkName: 'Check in' | 'Check out' | 'Check cancel', _routeLine: IRouteLine, _itemSliding: IonItemSliding): Promise<void> {
    let slidingRatio: number = await _itemSliding.getSlidingRatio();

    if((_checkName === 'Check in' && slidingRatio <= -1) || ((_checkName === 'Check out' || _checkName === 'Check cancel') && slidingRatio >= 1))
    {
      _itemSliding.close();

      if (!this.CanCreateCheck(_checkType)) return;

      this.ShowModalCreateCheck(_checkName, _checkType, _routeLine);
    }
  }

  /**
   * Set up a modal to create the a route check
   * @param _checkName Name of the check
   * @param _checkType Type of the check
   * @param _routeLine Selected route line
   * @constructor
   */
  async ShowModalCreateCheck(_checkName: string, _checkType: number, _routeLine: IRouteLine): Promise<void> 
  {
    let popover: HTMLIonPopoverElement = await this.popoverController.create({
      component: CheckComponent,
      componentProps: {
        data: {
          CardCode: _routeLine.CardCode,
          CardName: _routeLine.CardName,
          RouteId: this.route.Route.Id,
          CheckType: _checkType,
          Address: _routeLine.Address,
          RouteLineId: _routeLine.Id,
          AddressType: _routeLine.AddressType,
          CheckName: _checkName,
        } as ICheckComponentInputData,
      },
    });
    
    popover.present();
    popover.onDidDismiss().then((result) => {
      if (result.data >= 0) 
      {
        _routeLine.CheckStatus = result.data;
      }
    });
  }

  /**
   * Enables or disables reorder mode.
   */
  toggleReorder(): void {
    this.reorder = !this.reorder;
  }

  /**
   * Reorders items in memory and completes the drag event.
   */
  handleReorder(ev: CustomEvent): void {
    const from = (ev as any).detail.from as number;
    const to = (ev as any).detail.to as number;

    // reubicar en memoria
    const moved = this.route.RouteLines.splice(from, 1)[0];
    this.route.RouteLines.splice(to, 0, moved);

    // completar el gesto
    (ev as any).detail.complete();
  }
  
  /**
   * Updates line order numbers and saves the route.
   */
  async saveNewOrder(): Promise<void> {
    await this.route.RouteLines.forEach((line, index) => {
      line.OrderNum = index + 1;
    });
    this.repositoryRoute.UpdateRoute(this.route).then(() => {
      this.reorder = false;
      this.commonService.Alert(AlertType.SUCCESS, "Guardado", "Saved");
    }).catch((err) => {
      this.commonService.Alert(AlertType.ERROR, err, err);
    });
  }
}
