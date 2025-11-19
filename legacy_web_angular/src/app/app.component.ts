import {DOCUMENT} from '@angular/common';
import {Component, Inject, OnInit} from '@angular/core';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router} from '@angular/router';
import {Repository, Structures} from '@clavisco/core';
import {CL_CHANNEL, ICLCallbacksInterface, LinkerService, Register} from '@clavisco/linker';
import {OverlayService} from '@clavisco/overlay';
import {combineLatest} from 'rxjs';
import {delay} from 'rxjs/operators';
import {environment} from 'src/environments/environment';
import {StorageKey} from './enums/e-storage-keys';
import {SharedService} from './shared/shared.service';
import {CLToastType} from "@clavisco/alerts";
import {GoogleService} from "@app/services/google.service";
import {ITableGlobalConfiguration} from "@clavisco/table";
import {DynamicsUdfsConsole} from "@clavisco/dynamics-udfs-console";
import {ServiceLayerService} from "@app/services/service-layer/service-layer.service";
import LogRocket from "logrocket";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'EMA';
  isDuplicated =false;//Evitar duplicar tabs
  constructor(
    private router: Router,
    private overlayService: OverlayService,
    @Inject(DOCUMENT) private _document: Document,
    private sharedService: SharedService,
    private serviceLayerService: ServiceLayerService
  ) {
    if(environment?.production){
      LogRocket.init(environment?.LogRocketId)
    }

    /**
     * This functionality is committed because it is a test of login implementation by SL, its use is not ruled out
     */
    // this.serviceLayerService.Login().then(response => {
    //   if (!response.ok) {
    //     throw new Error(`Error HTTP: ${response.status}`);
    //   }
    //   return response.json();
    // })
    // .then(data => {
    //   console.log('Login exitoso:', data);

    //   this.serviceLayerService.GetExcangeRate(data.SessionId).then(res => {
    //     if (!res.ok) {
    //       throw new Error(`Exchange rate error: ${res.status}`);
    //     }
    //     return res.json();
    //   })
    //   .then(data => {
    //     console.log('Tipo de cambio del día:', data);
    //   })
    //   .catch(err => {
    //     console.error('Error al obtener el TC:', err);
    //   });

    // })
    // .catch(error => {
    //   console.error('Error en login:', error);
    // });
  }

  ngOnInit(): void {
    this.OnLoad();
  }

  private OnLoad(): void {
    this.isDuplicated = false;
    const broadcast = new BroadcastChannel('lock_tab');
    broadcast.postMessage('__lock');

    broadcast.onmessage = (event) => {

      if (event.data === "__lock") {
        broadcast.postMessage(`__blocked`);
        this.isDuplicated = false;
      }

      if (event.data === `__blocked`) {
        this.isDuplicated = true;
      }
    };


    //region Components configurations
    Repository.Behavior.SetTokenConfiguration({
      token: Structures.Enums.TOKENS.ALERTS,
      settings: {
        closeText: 'X', darkMode: false, duration: 6000, horizontalPosition: 'center',
        type: CLToastType.SUCCESS, verticalPosition: 'bottom'
      }, override: true
    });

    Repository.Behavior.SetTokenConfiguration({
      token: 'Shared',
      setting: 'apiUrl',
      value: environment.apiUrl
    });

    Repository.Behavior.SetTokenConfiguration({ token: 'NotificationCenter', setting: 'max', value: '400' });

    Repository.Behavior.SetTokenConfiguration({
      token: Structures.Enums.TOKENS.TABL,
      settings: {
        backgroundTransparent: true
      } as ITableGlobalConfiguration
    });

    Repository.Behavior.SetTokenConfiguration({
      token: Structures.Enums.TOKENS.DYN_UDF_CON,
      settings: {
        isMulticompany: false
      } as DynamicsUdfsConsole.Structures.Interfaces.IDynamicsUdfsConsoleGlobalConfiguration
    });
    //endregion

    this.router.events
      .subscribe({
        next: (callback) => {
          if (callback instanceof NavigationStart) {
            this.overlayService.OnGet();
          }
          if (callback instanceof NavigationEnd) {
            this.overlayService.Drop();
          }
          if (callback instanceof NavigationError || callback instanceof NavigationCancel) {
            if (!['/login', '/'].includes(this.router.url)) this.router.navigate(['home']);
            this.overlayService.Drop();
          }
        }
      });

    this.sharedService.OnPageInit()
      .pipe(delay(0))
      .subscribe({
        next: (result) => {
          let matTabHeader = this._document.querySelector(".mat-tab-header");
          let btnContainer = this._document.querySelector(".actions-container .btn-container");
          let actionButtonsContainer = this._document.querySelector(".actions-container");

          if (matTabHeader) {
            let matTabHeaderHeight = matTabHeader['offsetHeight' as keyof object];
            actionButtonsContainer?.setAttribute('style', `height: ${matTabHeaderHeight}px`);
          }

          let newMatTabHeaderWidth = btnContainer ? btnContainer['offsetWidth' as keyof object] : 0;

          matTabHeader?.setAttribute("style", `width: calc(100% - ${newMatTabHeaderWidth}px);`);
        }
      });
  }
}
