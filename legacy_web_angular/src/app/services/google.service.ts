import {Injectable} from '@angular/core';
import {SettingsService} from "@app/services/settings.service";
import {CLPrint, Structures} from "@clavisco/core";
import {ISettings} from "@app/interfaces/i-settings";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import CL_DISPLAY = Structures.Enums.CL_DISPLAY;
import {Loader} from "@googlemaps/js-api-loader";

@Injectable({
  providedIn: 'root'
})
export class GoogleService {

  apiKey: string = '';

  constructor(private settingsService: SettingsService,
              private alertsService: AlertsService) {
  }

  LoadGoogleMapsScript(): void {
    if (document.getElementById("GoogleScript")) {
      CLPrint('Google maps script is already loaded', CL_DISPLAY.INFORMATION);
    } else {
      this.settingsService.Get<ISettings>('GoogleApiKey').subscribe({
        next: (response) => {

          this.apiKey = response.Data.Json;

          if (this.apiKey) {
            let googleMapsScript = document.createElement("script");
            googleMapsScript.id = "GoogleScript";
            googleMapsScript.type = "text/javascript";
            googleMapsScript.async = true;
            googleMapsScript.defer = true;
            googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}`;
            document.head.appendChild(googleMapsScript);
          } else {
            this.alertsService.Toast({message: 'Google maps API key no definida', type: CLToastType.ERROR});
          }
        },
        error: (err) => {
          CLPrint({data: err, cldisplay: CL_DISPLAY.ERROR});
        }
      });
    }
  }

}
