import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {catchError, finalize, forkJoin, Observable, of, Subscription, throwError} from "rxjs";
import {IUser, IUserAssign} from "@app/interfaces/i-user";
import {UserService} from "@app/services/user.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {IRouteAssignmentDialogData} from "@app/interfaces/i-dialog-data";
import {OverlayService} from "@clavisco/overlay";
import {AlertsService, CLModalType, CLToastType, ModalService} from "@clavisco/alerts";
import {GetError} from "@clavisco/core";
import {RouteAssignmentService} from "@app/services/route-assignment.service";
import {IRouteAssignment} from "@app/interfaces/i-route";
import {AssignsService} from "@app/services/assigns.service";
import {IActionButton} from "@app/interfaces/i-action-button";
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { RouteService } from '@app/services/route.service';

@Component({
  selector: 'app-route-assignment',
  templateUrl: './route-assignment.component.html',
  styleUrls: ['./route-assignment.component.scss']
})
export class RouteAssignmentComponent implements OnInit, OnDestroy {
  availableUsers: IUser[] = [];
  assignedUsers: IUser[] = [];
  allUsers: IUser[] = [];
  allUserAssigns: IUserAssign[] = [];
  currentRouteUsers: IUserAssign[] = [];
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
    @Inject(MAT_DIALOG_DATA) private data: IRouteAssignmentDialogData,
    private routeAssignmentService: RouteAssignmentService,
    private overlayService: OverlayService,
    private matDialogRef: MatDialogRef<RouteAssignmentComponent>,
    private alertsService: AlertsService,
    private routesService: RouteService,
    private assignsService: AssignsService,
    private usersService: UserService,
    private modalService: ModalService
  ) {
    this.allSubscriptions$ = new Subscription();
  }

  ngOnInit(): void {
    this.SetInitialRequest();
  }

  /**
   * Handles the change in route users by responding to a CdkDragDrop event.
   * @param event Containing information about the drag-and-drop operation
   * @param _moveType Specifies the type of move operation ('assign' or 'unassign').
   * @constructor
   */
  OnRouteUsersChange(event: CdkDragDrop<IUser[]>, _moveType: 'assign' | 'unassign'): void {
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
      Users: this.usersService.GetUserByCompany(),
      UserAssings: this.assignsService.Get<IUserAssign[]>(),
      RouteUserAssignments: this.routeAssignmentService.Get<IRouteAssignment[]>(this.data.RouteId)
    })
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (responses) => {
          this.allUsers = responses.Users.Data;
          this.allUserAssigns = responses.UserAssings.Data;

          if(!responses.RouteUserAssignments.Data || responses.RouteUserAssignments.Data.length === 0)
          {
            this.currentRouteUsers = [];
          } else {
            this.currentRouteUsers = responses.UserAssings.Data.filter(a => responses.RouteUserAssignments.Data.some(rua => rua.UserAssignId === a.Id));
          }

          this.availableUsers = this.allUsers.filter(a => !this.currentRouteUsers.some(cra => cra.UserId === a.Id));
          this.assignedUsers = this.allUsers.filter(a => this.currentRouteUsers.some(cra => cra.UserId === a.Id));
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
        this.UpdataRouteUsers();
        break;
      case 'CANCEL':
        this.matDialogRef.close(false);
        break;
    }
  }

  UpdataRouteUsers(): void {
    if (!this.HasPermissions('Routes_List_AssignRoute')) {
      this.alertsService.Toast({type: CLToastType.INFO, message: 'No cuentas con permisos para realizar esta acción'});
      return;
    }

    this.overlayService.OnPost();

    let routeAssignedUsers = this.assignedUsers.map(a => (
      {
        RouteId: this.data.RouteId,
        UserAssignId: this.allUserAssigns.find(u => u.UserId === a.Id)?.Id
      } as IRouteAssignment
    ));

    this.routesService.PostRouteAssignments(routeAssignedUsers, this.data.RouteId)
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
            title: 'Usuarios asignados guardados correctamente',
            type: CLModalType.SUCCESS
          });
          this.matDialogRef.close(true);
        },
        error: (err) => {
          this.modalService.Continue({
            title:  'Se produjo un error guardando los usuarios asignados',
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.allSubscriptions$.unsubscribe();
  }

  HasPermissions(_permissionName: string): boolean {
    return this.data.Permissions.some(p => p.Name === _permissionName);
  }

}
