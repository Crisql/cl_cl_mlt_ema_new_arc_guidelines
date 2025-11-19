import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {StorageKey} from 'src/app/enums/e-storage-keys';
import {SharedService} from 'src/app/shared/shared.service';
import {Repository} from '@clavisco/core'
import {filter, finalize, Subscription, switchMap} from "rxjs";
import {OverlayService} from "@clavisco/overlay";
import {AlertsService} from "@clavisco/alerts";
import {IShorcuts} from "@app/interfaces/i-shorcuts";
import {ActivatedRoute, Router} from "@angular/router";
import {ShorcutsComponent} from "@Component/home/shorcuts/shorcuts.component";
import {IChart} from "@app/interfaces/i-chart";
import {Chart, registerables} from "chart.js";
import {ChartsService} from "@app/services/charts.service";
import {ICurrentCompany} from "@app/interfaces/i-localStorage";
import { ServiceLayerService } from '@app/services/service-layer/service-layer.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewChecked {

  listShorcuts: IShorcuts[] = [];

  allSubscriptions: Subscription = new Subscription();

  chartData: IChart[] = [];

  chartsCreated: boolean = false;


  @ViewChildren('canvas') chart!: QueryList<ElementRef>;


  constructor(
    private matDialog: MatDialog,
    private sharedService: SharedService,
    private router: Router,
    private chartService: ChartsService,
    private overlayService: OverlayService,
    private alertsService: AlertsService,
    private serviceLayerService: ServiceLayerService
  ) {
  }

  ngOnInit(): void {
    this.onLoad();
    this.LoadChartsAfterReload();
  }

  ngOnDestroy(): void {
    this.allSubscriptions.unsubscribe();
  }

  ngAfterViewChecked(): void {
    if (this.chart.length > 0 && !this.chartsCreated) {
      this.CreateChart();
      this.chartsCreated = true;
    }
  }

  public openDialogShorcuts(): void {
    this.matDialog.open(ShorcutsComponent, {
      width: '98%',
      maxWidth: '700px',
      height: '300px',
      disableClose: true,
      autoFocus: false
    }).afterClosed().pipe(
      filter(res => res),
    ).subscribe({
      next: (callback) => {
        this.addShorcuts(callback);
      },
    })
  }

  private addShorcuts(_data: IShorcuts): void {
    let shorcuts = Repository.Behavior.GetStorageObject<IShorcuts[]>(StorageKey.Shorcuts);
    if (shorcuts) {
      this.listShorcuts = shorcuts;
    }
    this.listShorcuts.push(_data);
    Repository.Behavior.SetStorage<IShorcuts[]>(this.listShorcuts, StorageKey.Shorcuts);
  }

  private onLoad(): void {
    let data = Repository.Behavior.GetStorageObject<IShorcuts[]>(StorageKey.Shorcuts);

    if (data) {
      this.listShorcuts = data;
    }

    //Get data from the chart after the company is selected

    this.sharedService.getCharts$.pipe(
      filter((value: IChart[]) => {
        return (value && value !== []);
      })
    ).subscribe({
      next: (callback => {
        this.chartData = callback || [];
      }),
      error: (error) => {
        this.alertsService.ShowAlert({HttpErrorResponse: error});
      }
    })
  }

  //You get the charts when you reload the page and when the company has been selected
  LoadChartsAfterReload(): void{
    let currenCompany = Repository.Behavior.GetStorageObject<ICurrentCompany>(StorageKey.CurrentCompany);
    if(currenCompany){
      this.overlayService.OnGet();
      this.chartService.GetCharts()
        .pipe(finalize(()=>this.overlayService.Drop()))
        .subscribe({
          next: ((callback)=>{
            this.chartData = callback.Data || []
          }),
          error: ((error)=>  this.alertsService.ShowAlert({HttpErrorResponse: error}))
        })
    }
  }

  public redirect(_ruta: IShorcuts): void {
    this.sharedService.SetCurrentPage(_ruta?.Nombre)
    let arrRoute = _ruta?.Ruta.split('/');
    this.router.navigate(arrRoute);
  }

  public deleteShorcuts(_index: number): void {
    this.listShorcuts.splice(_index, 1);
    Repository.Behavior.SetStorage<IShorcuts[]>(this.listShorcuts, StorageKey.Shorcuts);
  }


  /**
   * Create dynamics charts to render in the view
   */
  CreateChart(): void {
    let elementRef: any;
    this.chart.forEach((canva, index) => {
      elementRef = canva.nativeElement.getContext('2d');

     Chart.register(...registerables);

      new Chart(elementRef, {
        ...this.chartData[index],
        options: {
          aspectRatio: 2,
          maintainAspectRatio: false,
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: this.chartData[index].Title
            }
          }
        }
      });
    })
  }



}
