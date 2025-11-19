import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertsService, CLModalType, CLToastType, ModalService, NotificationPanelService } from '@clavisco/alerts';
import { GetError, Structures } from '@clavisco/core';
import { OverlayService } from '@clavisco/overlay';
import { finalize, forkJoin, Observable, of } from 'rxjs';
import { IDBResource, IDBResourceType, IDBResourceWithCompany } from 'src/app/interfaces/i-db-resource';
import { ICompanyDialogData } from 'src/app/interfaces/i-dialog-data';
import { DbResourcesService } from 'src/app/services/db-resources.service';
import { IActionButton } from "@app/interfaces/i-action-button";
import { SharedService } from "@app/shared/shared.service";

@Component({
  selector: 'app-db-resources-edit',
  templateUrl: './db-resources-edit.component.html',
  styleUrls: ['./db-resources-edit.component.scss']
})
export class DbResourcesEditComponent implements OnInit {

  accion = 'Actualizar';
  icon = 'edit';
  modalTitle = 'Edición de recurso';
  dbResourcesForm!: FormGroup;
  dbResourceTypes!: IDBResourceType[];
  dbResourceInEdition: IDBResource | undefined;
  actionButtons: IActionButton[] = [];

  constructor(
    private fb: FormBuilder,
    private dbResourcesService: DbResourcesService,
    private overlayService: OverlayService,
    private alertsService: AlertsService,
    private matDialogRef: MatDialogRef<DbResourcesEditComponent>,
    @Inject(MAT_DIALOG_DATA) private data: ICompanyDialogData,
    private modalService: ModalService,
    private sharedService: SharedService
  ) {
  }

  ngOnInit(): void {
    this.InitVariables();
    this.SendInitRequests();
    this.sharedService.SetActionButtons([]);
  }

  public InitVariables(): void {
    this.dbResourceTypes = [];
    this.LoadForm();
    this.actionButtons = [
      {
        Key: 'ADD',
        Text: 'Actualizar',
        MatIcon: 'edit',
        MatColor: 'primary',
        DisabledIf: (_form) => _form?.invalid || false
      },
      {
        Key: 'CANCEL',
        Text: 'Cancelar',
        MatIcon: 'cancel',
        MatColor: 'primary'
      }
    ];
  }

  private LoadForm(): void {
    this.dbResourcesForm = this.fb.group({
      Code: [null, Validators.required],
      Description: [null],
      DBObject: [null, Validators.required],
      Type: [null, Validators.required],
      QueryString: [null],
      PageSize: [0, Validators.min(0)],
      IsActive: [false]
    });
  }

  public OnActionButtonClicked(_event: IActionButton): void {
    switch (_event.Key) {
      case 'ADD':
        this.Save();
        break;
      case 'CANCEL':
        this.matDialogRef.close();
        break;
    }
  }

  public SendInitRequests(): void {
    this.overlayService.OnGet();

    forkJoin({
      dbResource: this.data.RecordId ? this.dbResourcesService.GetResourceByCompany(this.data.RecordId, this.data.CompanyId) : of(null),
      dbResourceTypes: this.dbResourcesService.GetTypes()
    })
      .pipe(
        finalize(() => this.overlayService.Drop())
      )
      .subscribe({
        next: (callback) => {
          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });
          if (callback.dbResource) {
            this.dbResourceInEdition = callback.dbResource.Data;
            this.dbResourcesForm.patchValue(this.dbResourceInEdition);
          }

          this.dbResourceTypes = callback.dbResourceTypes.Data || [];
        },
        error: err => {
          this.alertsService.ShowAlert({ HttpErrorResponse: err });
        }
      });
  }

  public Save(): void {
    this.overlayService.OnPost();

    let formDbResource: IDBResourceWithCompany = {
      ...this.dbResourceInEdition,
      ...this.dbResourcesForm.value,
      CompanyId: this.data.CompanyId
    } || of();
    
    let patchOrPostDbResource$: Observable<Structures.Interfaces.ICLResponse<IDBResource>> = this.data.CompanyId > 0 ?
      this.SaveResourcesByCompany(formDbResource) :
      this.SaveResourcesById(formDbResource);    

    patchOrPostDbResource$
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (callback) => {
          this.modalService.Continue({
            title: `Objeto DB ${this.data.RecordId ? 'actualizado' : 'creado'} correctamente`,
            type: CLModalType.SUCCESS
          });
          this.matDialogRef.close();
        },
        error: (err) => {
          this.modalService.Continue({
            title: `Se produjo un error ${this.data.RecordId ? 'actualizando' : 'creando'} el objeto DB`,
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      });
  }

  SaveResourcesByCompany(formDbResource: IDBResourceWithCompany): Observable<Structures.Interfaces.ICLResponse<IDBResource>> {
    return this.data.RecordId
      ? this.dbResourcesService.Patch(formDbResource)
      : this.dbResourcesService.Post(formDbResource);
  }

  SaveResourcesById(formDbResource: IDBResourceWithCompany): Observable<Structures.Interfaces.ICLResponse<IDBResource>> {
    return this.data.RecordId
      ? this.dbResourcesService.PatchDBResource(formDbResource)
      : this.dbResourcesService.PostDBResource(formDbResource);
  }
}
