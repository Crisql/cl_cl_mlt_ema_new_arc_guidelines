import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {
    GoogleMap,
    GoogleMapOptions, GoogleMaps,
    GoogleMapsEvent,
    LatLng,
    MarkerOptions,
} from "@ionic-native/google-maps/ngx";
import {CommonService, Repository} from "src/app/services";
import {IRouteWithLines} from "../../models/db/route-model";
import {concatMap, finalize, map} from "rxjs/operators";
import {from, of} from "rxjs";
import {AlertType} from "../../common";

@Component({
  selector: "app-route-map",
  templateUrl: "./route-map.page.html",
  styleUrls: ["./route-map.page.scss"],
})
export class RouteMapPage implements OnInit {
  googleMap: GoogleMap;
  route: IRouteWithLines;
  mapOptions: GoogleMapOptions = {
    camera: {
      target: {
        lat: 0,
        lng: 0,
      },
      zoom: 18,
      tilt: 30,
    },
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private repositoryRoute: Repository.Route,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    this.SetUp();
  }

  /**
   * Get the required data and set the required variables to set up the component
   * @constructor
   */
  async SetUp(): Promise<void>
  {
    this.googleMap = GoogleMaps.create("map_canvas", this.mapOptions);
      
    const routeId = Number(this.activatedRoute.snapshot.paramMap.get("routeId"));
    
    let loader: HTMLIonLoadingElement = await this.commonService.Loader();

    loader.present();
    
    this.repositoryRoute.GetRoute(routeId)
        .pipe(
            concatMap(route => {
              this.route = route;
              
              return from(this.googleMap.one(GoogleMapsEvent.MAP_READY))
                  .pipe(
                      concatMap(result => of(route.RouteLines))
                  );
            }),
            concatMap(routeLines => from(this.googleMap.getMyLocation())
                .pipe(
                    concatMap(location => {
                      this.googleMap.moveCamera({
                        target: location.latLng,
                      });
                      
                      this.googleMap.addMarker({
                        title: "Mi Posición",
                        icon: "blue",
                        animation: "DROP",
                        position: location.latLng,
                      });
                      
                      return from(routeLines)
                    })
                )),
            concatMap(routeLine => {
              return from(this.googleMap.addMarker({
                  position: new LatLng(routeLine.Latitude, routeLine.Longitude),
                  title: `${routeLine.CardCode} ${routeLine.CardName}`,
                  icon: { url: "../../../assets/imgs/marker-red.png" },
              }));
            }),
            finalize(() => loader.dismiss())
        )
        .subscribe({
          error: (error) => {
            this.commonService.Alert(AlertType.ERROR, error, error);
          }
        });
  }
}
