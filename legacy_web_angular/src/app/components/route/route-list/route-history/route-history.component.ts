import {Component, Inject, OnInit} from '@angular/core';
import {
  IRoute,
  IRouteHistoryGroupedByRouteLine,
  IRouteHistory,
  IRouteLine,
  IRouteLinesGroupedByCustomer
} from "@app/interfaces/i-route";
import {RouteCheckTypes} from "@app/enums/enums";
import {OverlayService} from "@clavisco/overlay";
import {RouteService} from "@app/services/route.service";
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {finalize, forkJoin, interval, of, takeWhile} from "rxjs";
import {GetError, Structures} from "@clavisco/core";
import {AlertsService, CLNotificationType, CLToastType, NotificationPanelService} from "@clavisco/alerts";
import {IHistoryFiltersDialogData, IHistoryFiltersDialogResult, IIdDialogData} from "@app/interfaces/i-dialog-data";
import {StructuresService} from "@app/services/structures.service";
import {IStructures} from "@app/interfaces/i-structures";
import {RouteHistoriesService} from "@app/services/route-histories.service";
import {AgmMap} from "@agm/core";
import {
  HistoryFiltersComponent
} from "@Component/route/route-list/route-history/history-filters/history-filters.component";
import {IBusinessPartner} from "@app/interfaces/i-business-partner";
import {IUser} from "@app/interfaces/i-user";
import {
  HistoryDetailsComponent
} from "@Component/route/route-list/route-history/history-details/history-details.component";
import {A} from "@angular/cdk/keycodes";

@Component({
  selector: 'app-route-history',
  templateUrl: './route-history.component.html',
  styleUrls: ['./route-history.component.scss']
})
export class RouteHistoryComponent implements OnInit {

  mapLatitude: number = 9.7154591;
  mapLongitude: number = -84.2066289;
  mapZoom: number = 9;
  route!: IRoute;
  routeLines: IRouteLine[] = [];
  filteredRouteLines: IRouteLine[] = [];
  routeHistories: IRouteHistory[] = [];
  filteredRouteHistories: IRouteHistory[] = [];
  otherPoints: IRouteHistory[] = [];
  routeTypes: IStructures[] = [];
  routeLinesGroupedByCustomer: IRouteLinesGroupedByCustomer<IRouteHistoryGroupedByRouteLine>[] = [];
  googleMap!: AgmMap;
  routeCheckTypes: IStructures[] = [];
  visibleRouteCheckTypes: IStructures[] = [];
  selectedCustomerOnFilters: IBusinessPartner | undefined;
  selectedUserAssignOnFilters: IUser | undefined;
  routeAssignedUsers: IUser[] = [];
  onlyChecksFrom!: Date;
  onlyChecksUntil: Date = new Date();
  constructor(private overlayService: OverlayService,
              private routeService: RouteService,
              private structuresService: StructuresService,
              private routeHistoriesService: RouteHistoriesService,
              private matDialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) private data: IIdDialogData,
              private alertsService: AlertsService) { }

  ngOnInit(): void {
    this.routeHistories.push({
      CheckType: RouteCheckTypes.ROUTE_START,
      CreatedDate: new Date()
    } as IRouteHistory);
    this.InitialRequests();
  }

  /**
   * Load initial data
   * @constructor
   */
  InitialRequests(): void
  {
    this.overlayService.OnGet();

    forkJoin({
      Route: this.routeService.Get<IRoute>(this.data.Id),
      RouteLines: this.routeService.GetRouteLines(this.data.Id),
      RouteHistories: this.routeHistoriesService.Get<IRouteHistory[]>(this.data.Id),
      RouteTypes: this.structuresService.Get('RouteTypes'),
      RouteCheckTypes: this.structuresService.Get('RouteCheckTypes'),
      RouteAssignedUsers: this.routeService.GetRouteAssignedUsers(this.data.Id)
    })
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (responses) => {
          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });
          this.route = responses.Route.Data;
          this.routeLines = responses.RouteLines.Data ?? [];
          this.filteredRouteLines = [...this.routeLines];
          this.routeTypes = responses.RouteTypes.Data ?? [];
          this.routeHistories = responses.RouteHistories.Data ?? [];
          this.filteredRouteHistories = [...this.routeHistories];
          this.routeCheckTypes = responses.RouteCheckTypes.Data ?? [];
          this.visibleRouteCheckTypes = [...this.routeCheckTypes];
          this.onlyChecksFrom = new Date(this.route.CreatedDate);
          this.routeAssignedUsers = responses.RouteAssignedUsers.Data ?? [];
          this.GroupRouteLinesByCustomer();
          this.FilterRouteChecks();
        },
        error: err => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      });
  }

  GetRouteTypeName(_routeType: number): string
  {
    return this.routeTypes.find(rt => rt.Key == _routeType.toString())?.Description || '-';
  }

  GroupRouteLinesByCustomer(): void
  {
    this.routeLinesGroupedByCustomer = this.routeLines.reduce((routeLinesByCustomer: IRouteLinesGroupedByCustomer<IRouteHistoryGroupedByRouteLine>[], item) => {
      if (!routeLinesByCustomer.some(rbc => rbc.CardCode === item.CardCode))
      {
        routeLinesByCustomer.push({
          CardCode: item.CardCode,
          CardName: item.CardName,
          RouteLines: this.GroupRouteHistoryByRouteLine([{...item} as IRouteHistoryGroupedByRouteLine]),
          LineGroupNum: item.LineGroupNum
        });
      }
      else
      {
        let groupedRouteLine = routeLinesByCustomer.find(rbc => rbc.CardCode === item.CardCode);
        if(groupedRouteLine)
        {
          groupedRouteLine.RouteLines.push({...item} as IRouteHistoryGroupedByRouteLine);
          groupedRouteLine.RouteLines = this.GroupRouteHistoryByRouteLine(groupedRouteLine.RouteLines);
        }
      }
      return routeLinesByCustomer;
    }, []);
  }

  GroupRouteHistoryByRouteLine(_routeLines: IRouteHistoryGroupedByRouteLine[]): IRouteHistoryGroupedByRouteLine[]
  {
    return _routeLines.reduce((acc, val) => {
      if(!val.RouteHistories) val.RouteHistories = [];

      if(!val.RouteHistories.length)
      {
        val.RouteHistories.push(...this.routeHistories.filter(frh => frh.RouteLineId === val.Id))
      }

      acc.push(val);

      return acc;
    }, [] as IRouteHistoryGroupedByRouteLine[]);
  }

  OnMapReady(_event: any): void
  {
    this.googleMap = _event;
  }

  ZoomToMarker(_point: IRouteHistory | IRouteLine): void
  {
    this.mapLatitude = _point.Latitude;
    this.mapLongitude = _point.Longitude;

    interval(200)
      .pipe(
        takeWhile(() => this.mapZoom !== 20)
      )
      .subscribe(() => {
        this.mapZoom++;
      });
  }

  GetRouteCheckTypePropertyValue(_checkType: number, _prop: string): string
  {
    let checkType = this.routeCheckTypes.find(ct => ct.Key === _checkType.toString());

    if(!checkType) return '';

    return checkType[_prop as keyof object];
  }

  /**
   * Show route history
   * @constructor
   */
  OpenFiltersModal(): void
  {
    this.matDialog.open(HistoryFiltersComponent, {
      maxHeight: '100vh',
      minHeight: '10vh',
      maxWidth: '100vw',
      minWidth: '50vh',
      data: {
        RouteCheckTypes: this.routeCheckTypes,
        VisibleRouteCheckTypes: this.visibleRouteCheckTypes,
        RouteCustomers: this.routeLinesGroupedByCustomer.map(x => ({CardCode: x.CardCode, CardName: x.CardName} as IBusinessPartner)),
        RouteAssignedUsers: this.routeAssignedUsers,
        DateFrom: this.onlyChecksFrom,
        DateTo: this.onlyChecksUntil,
        SelectedCustomer: this.selectedCustomerOnFilters,
        SelectedUser: this.selectedUserAssignOnFilters
      } as IHistoryFiltersDialogData
    }).afterClosed()
      .subscribe({
        next: (result: IHistoryFiltersDialogResult) => {
          if(result)
          {
            this.visibleRouteCheckTypes = result.VisibleRouteCheckTypes;
            this.selectedCustomerOnFilters = result.SelectedCustomer;
            this.selectedUserAssignOnFilters = result.SelectedUserAssign;
            this.onlyChecksUntil = result.DateTo;
            this.onlyChecksFrom = result.DateFrom;
          }

          this.FilterRouteChecks();
        }
      });
  }
  FilterRouteChecks(): void
  {
    this.filteredRouteHistories = this.routeHistories.filter(rh => {
      return this.RouteHistoryIsVisible(rh)
    });

    this.filteredRouteLines = this.routeLines.filter(rl => {
      return this.CheckIsVisible(0) &&
        (!this.selectedCustomerOnFilters || rl.CardCode === this.selectedCustomerOnFilters?.CardCode)
    });

    this.otherPoints = this.routeHistories.filter(rh => !rh.RouteLineId);
  }

  OnClickRemoveCheckType(_check: IStructures): void
  {
    let indexOfCheck = this.visibleRouteCheckTypes.findIndex(x => x.Key === _check.Key);

    if(indexOfCheck != -1)
    {
      this.visibleRouteCheckTypes.splice(indexOfCheck, 1);
    }

    this.FilterRouteChecks();
  }

  RouteHistoryIsVisible(_routeHistory: IRouteHistory): boolean
  {
    return this.CheckIsVisible(_routeHistory.CheckType) &&
    (!this.selectedCustomerOnFilters || _routeHistory.CardCode === this.selectedCustomerOnFilters?.CardCode) &&
    (!this.selectedUserAssignOnFilters || _routeHistory.CreatedBy === this.selectedUserAssignOnFilters.Email) &&
    (new Date(_routeHistory.CreatedDate) >= this.onlyChecksFrom && new Date(_routeHistory.CreatedDate) <= this.onlyChecksUntil)
  }
  CheckIsVisible(_checkType: number): boolean
  {
    return this.visibleRouteCheckTypes.some(ch => ch.Key === _checkType.toString())
  }

  OpenHistoryDetailsModal(_routeHistory: IRouteHistory): void{
    this.matDialog.open(HistoryDetailsComponent, {
      maxHeight: '90vh',
      minHeight: '40vh',
      maxWidth: '100vw',
      minWidth: '50vh',
      data: _routeHistory
    }).afterClosed()
      .subscribe();
  }

  /**
   *Method to add animation to history marker
   * @param _marker - marker to add animation
   * @constructor
   */
  AddBounceAnimationToHistoryMarker(_marker: IRouteHistory): void {
    let history = this.routeHistories.find(rl => rl.Id === _marker.Id)!;
    if (!history.Animation || history.Animation === 'DROP')
    {
      history.Animation = 'BOUNCE';
    }
    else
    {
      history.Animation = 'DROP';
    }
  }

  /**
   * Method to add animation to line marker
   * @param _marker - marker to add animation
   * @constructor
   */
  AddBounceAnimationToLineMarker(_marker: IRouteLine): void {
    let routeLine = this.routeLines.find(rl => rl.Id === _marker.Id)!;
    if (!routeLine.Animation || routeLine.Animation === 'DROP')
    {
      routeLine.Animation = 'BOUNCE';
    }
    else
    {
      routeLine.Animation = 'DROP';
    }
  }
}
