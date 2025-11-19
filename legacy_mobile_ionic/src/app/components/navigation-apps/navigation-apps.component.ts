import { Component, Input, OnInit } from "@angular/core";
import { LaunchNavigator } from "@ionic-native/launch-navigator/ngx";
import { PopoverController } from "@ionic/angular";
import { NavigationModel, IRouteLine } from "src/app/models";
import { INavigationAppsComponentInputData } from "src/app/models/db/i-modals-data";

@Component({
  selector: "app-navigation-apps",
  templateUrl: "./navigation-apps.component.html",
  styleUrls: ["./navigation-apps.component.scss"],
})
export class NavigationAppsComponent implements OnInit {
  @Input() data: INavigationAppsComponentInputData;
  availableMapApps: NavigationModel[];

  constructor(
    private launchNavigator: LaunchNavigator,
    private popoverController: PopoverController
  ) {}

  ngOnInit() {
    
  }

  ionViewWillEnter(){
    this.GetAvailableApps();
  }

  /**
   * Retrieves the available navigation apps on the device and filters for "Waze" and "Google Maps". 
   */
  GetAvailableApps() {
    this.availableMapApps = [];
     this.launchNavigator.availableApps().then((data) => {
      for (let app in data) {
        if (data[app] && (app === "waze" || app === "google_maps")) {
          this.availableMapApps.push(
            new NavigationModel(
              app === "waze" ? "Waze" : "Google Maps",
              "assets/imgs/" + app + ".png"
            )
          );
        }
      }
    });
  }

  /**
   * Opens the selected navigation app (Waze or Google Maps) to navigate
   * to the specified destination coordinates.
   *
   * @param item - The selected navigation app model.
   */
  OpenNavigationApp(item: NavigationModel) {
    this.launchNavigator.navigate(
      [
        this.data.RouteDestination.Latitude,
        this.data.RouteDestination.Longitude,
      ],
      {
        app:
          item.Name === "Waze"
            ? this.launchNavigator.APP.WAZE
            : this.launchNavigator.APP.GOOGLE_MAPS,
      }
    );

    this.popoverController.dismiss();
  }
}
