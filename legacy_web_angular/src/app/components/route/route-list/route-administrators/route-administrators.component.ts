import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {IUser} from "@app/interfaces/i-user";
import {OverlayService} from "@clavisco/overlay";
import {AlertsService, CLModalType, CLToastType, ModalService} from "@clavisco/alerts";
import {catchError, finalize, forkJoin, of, Subscription, throwError} from "rxjs";
import {RouteService} from "@app/services/route.service";
import {RoutesAdministratorsService} from "@app/services/routes-administrators.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {IRouteAdministratorsDialogData} from "@app/interfaces/i-dialog-data";
import {IRouteAdministrator} from "@app/interfaces/i-route";
import {IActionButton} from "@app/interfaces/i-action-button";
import {GetError} from "@clavisco/core";

@Component({
  selector: 'app-route-administrators',
  templateUrl: './route-administrators.component.html',
  styleUrls: ['./route-administrators.component.scss']
})
export class RouteAdministratorsComponent implements OnInit, OnDestroy {
  availableAdmins: IUser[] = [];
  assignedAdmins: IUser[] = [];
  allAdmins: IUser[] = [];
  currentRouteAdmins: IRouteAdministrator[] = [];
  allSubscriptions$: Subscription;

  actionButtons: IActionButton[] = [
    {
      Key: 'SAVE',
      Text: 'Guardar',
      MatColor: 'primary',
      MatIcon: 'save',
    },
    {
      Key: 'CANCEL',
      Text: 'Cancelar',
      MatColor: 'primary',
      MatIcon: 'cancel',
    }
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: IRouteAdministratorsDialogData,
    private overlayService: OverlayService,
    private alertsService: AlertsService,
    private routesService: RouteService,
    private matDialogRef: MatDialogRef<RouteAdministratorsComponent>,
    private routeAdministratorsService: RoutesAdministratorsService,
    private modalService: ModalService
  ) {
    this.allSubscriptions$ = new Subscription();
  }

  ngOnInit(): void {
    this.SetInitialRequest();
  }

  /**
   * Handles the change in route administrators by responding to a CdkDragDrop event.
   * @param event Containing information about the drag-and-drop operation
   * @param _moveType Specifies the type of move operation ('assign' or 'unassign').
   * @constructor
   */
  OnRouteAdminsChange(event: CdkDragDrop<IUser[]>, _moveType: 'assign' | 'unassign'): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  SetInitialRequest(): void
  {
    this.overlayService.OnGet();
    this.allSubscriptions$.add(forkJoin({
      Administrators: this.routeAdministratorsService.Get<IUser[]>(),
      RouteAdministrators: this.routesService.GetRouteAdministrators(this.data.RouteId)
    })
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (responses) => {
          this.allAdmins = responses.Administrators.Data;
          this.currentRouteAdmins = responses.RouteAdministrators.Data;
          this.availableAdmins = this.allAdmins.filter(a => !this.currentRouteAdmins.some(cra => cra.UserId === a.Id));
          this.assignedAdmins = this.allAdmins.filter(a => this.currentRouteAdmins.some(cra => cra.UserId === a.Id));
        },
        error: err => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      }));
  }

  OnClickActionButton(_actionButton: IActionButton): void
  {
    switch (_actionButton.Key)
    {
      case 'SAVE':
        this.UpdataRouteAdministrators();
        break;
      case 'CANCEL':
        this.matDialogRef.close(false);
        break;
    }
  }

  UpdataRouteAdministrators(): void
  {
    let hasPermissions = this.HasPermissions('Routes_List_AssignAdmin');
    if (hasPermissions){
      this.overlayService.OnPost();

      let routeAdmins = this.assignedAdmins.map(a => ({
        RouteId: this.data.RouteId,
        UserId: a.Id
      } as IRouteAdministrator));

      this.routesService.PostRouteAdministrators(routeAdmins, this.data.RouteId)
        .pipe(
          catchError((err) => {
            if (err.status === 404) {
              return of({ success: true });
            }
            return throwError(() => err);
          }),
          finalize(() => this.overlayService.Drop())
        )
        .subscribe({
          next: (response) => {
            this.modalService.Continue({
              title: 'Administradores guardados correctamente',
              type: CLModalType.SUCCESS
            });
            this.matDialogRef.close(true);
          },
          error: (err) => {
            this.modalService.Continue({
              title:  'Se produjo un error guardando los administradores',
              subtitle: GetError(err),
              type: CLModalType.ERROR
            });
          }
        });
    }else{
      this.modalService.Continue({
        title:  'Permisos insuficientes',
        subtitle: 'No tienes los permisos necesarios para asignar administradores a la ruta.',
        type: CLModalType.ERROR
      });
    }
  }
  
  ngOnDestroy() {
    this.allSubscriptions$.unsubscribe();
  }

  HasPermissions(_permissionName:string): boolean{
    return this.data.Permissions.some(p => p.Name === _permissionName);
  }
}
