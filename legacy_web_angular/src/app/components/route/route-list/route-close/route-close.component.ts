import {Component, Inject, OnInit} from '@angular/core';
import {finalize,Subscription} from "rxjs";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {IRoute} from "@app/interfaces/i-route";
import {IUser} from "@app/interfaces/i-user";
import {IActionButton} from "@app/interfaces/i-action-button";
import {ActivatedRoute} from "@angular/router";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {IRouteCloseDialogData} from "@app/interfaces/i-dialog-data";
import {OverlayService} from "@clavisco/overlay";
import {AlertsService, CLModalType, CLToastType, ModalService} from "@clavisco/alerts";
import {GetError} from "@clavisco/core";
import {RouteService} from "@app/services/route.service";

@Component({
  selector: 'app-route-close',
  templateUrl: './route-close.component.html',
  styleUrls: ['./route-close.component.scss']
})
export class RouteCloseComponent implements OnInit {
  routeQueryParams$!: Subscription;
  routeCloseForm!: FormGroup;
  routeInEditionId: number = 0;
  route!: IRoute;
  users: IUser[] = [];
  actionButtons: IActionButton[] = [];
  allSubscriptions$: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: IRouteCloseDialogData,
    private overlayService: OverlayService,
    private matDialogRef: MatDialogRef<RouteCloseComponent>,
    private alertsService: AlertsService,
    private modalService: ModalService,
    private routeService: RouteService,
  ) {
    this.allSubscriptions$ = new Subscription();
  }

  /**
   * Load component
   */
  ngOnInit(): void {
    this.InitVariables();
    this.SendInitRequest();
  }

  ngOnDestroy(): void {
    this.routeQueryParams$.unsubscribe();
    this.allSubscriptions$.unsubscribe();
  }

  InitVariables(): void {
    this.LoadForm();
    this.ReadQueryParameters();
    this.actionButtons = [
      {
        Key: 'ADD',
        Text: 'Cerrar',
        MatIcon: 'block',
        MatColor: 'primary',
        DisabledIf: (_form?: FormGroup) => _form?.invalid || false
      },
      {
        Key: 'CANCEL',
        Text: 'Cancelar',
        MatIcon: 'cancel',
        MatColor: 'primary'
      }
    ];
  }

  /**
   * Load form
   * @constructor
   */
  LoadForm(): void {
    this.routeCloseForm = this.formBuilder.group({
      CloseDetail: [null, [Validators.required]],
    });
  }

  /**
   * Method to handle button clicks for action buttons.
   * @param _event The event object containing information about the clicked action button.
   */
  public OnActionButtonClicked(_event: IActionButton): void {
    switch (_event.Key) {
      case 'ADD':
        this.CloseRoute();
        break;
      case 'CANCEL':
        this.matDialogRef.close();
        break;
    }
  }

  /**
   * Read query parameters
   */
  ReadQueryParameters(): void {
    this.routeQueryParams$ = this.activatedRoute.queryParams.subscribe(params => {
      this.routeInEditionId = params['routeId'];
    });
  }

  /**
   * Methd to get route to closed
   * @constructor
   */
  SendInitRequest(): void {
    this.overlayService.OnGet();

    this.allSubscriptions$.add(this.routeService.Get<IRoute>(this.data.RouteId)
      .pipe(
        finalize(() => this.overlayService.Drop())
      )
      .subscribe({
        next: (callback) => {
          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });
          this.route = callback.Data;
        },
        error: err => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      }));
  }

  /**
   * Closed route
   * @param _routeId
   * @constructor
   */
  CloseRoute(): void {
    if (!this.HasPermissions('Routes_List_CloseRoute')) {
      this.alertsService.Toast({type: CLToastType.INFO, message: 'No cuentas con permisos para realizar esta acción'});
      return;
    }

    this.route.CloseDetail = this.routeCloseForm.controls['CloseDetail'].value;

    this.overlayService.OnPost();

    this.routeService.CloseRoute(this.route)
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (response) => {
          this.modalService.Continue({
            title: 'Ruta cerrada correctamente',
            type: CLModalType.SUCCESS
          });
          this.matDialogRef.close();
        },
        error: (err) => {
          this.modalService.Continue({
            title: 'Se produjo un error cerrando la ruta',
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      });
  }

  /**
   * Method to check if a permission exists.
   * @param _permissionName The name of the permission to check.
   * @returns A boolean indicating whether the permission exists.
   */
  HasPermissions(_permissionName: string): boolean {
    return this.data.Permissions.some(p => p.Name === _permissionName);
  }
}
