import {Component, Inject, OnInit} from '@angular/core';
import {IActionButton} from "@app/interfaces/i-action-button";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {IEditGeoRoleDialogData} from "@app/interfaces/i-dialog-data";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {GeoRoleService} from "@app/services/geo-role.service";
import {IGeoRole} from "@app/interfaces/i-geo-role";
import {finalize, Observable} from "rxjs";
import {GetError, Structures} from "@clavisco/core";
import {AlertsService, CLModalType, CLToastType, ModalService, NotificationPanelService} from "@clavisco/alerts";
import {OverlayService} from "@clavisco/overlay";

@Component({
  selector: 'app-geo-role-edit',
  templateUrl: './geo-role-edit.component.html',
  styleUrls: ['./geo-role-edit.component.scss']
})
export class GeoRoleEditComponent implements OnInit {

  title!: 'Creación de geo rol' | 'Edición de geo rol';
  actionButtons: IActionButton[] = [
    {
      Key: 'CANCEL',
      Text: 'Cancelar',
      MatIcon: 'cancel',
      MatColor: 'primary',

    }
  ];
  geoRoleForm!: FormGroup;
  geoRoleInEdition: IGeoRole | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: IEditGeoRoleDialogData,
    private fb: FormBuilder,
    private geoRoleService: GeoRoleService,
    private alertService: AlertsService,
    private overlayService: OverlayService,
    private matDialogRef: MatDialogRef<GeoRoleEditComponent>,
    private modalService: ModalService
  ) {
  }


  ngOnInit(): void {
    this.GetGeoRoleInEdition();
    this.InitVariables();
  }

  InitVariables(): void {
    this.title = this.dialogData.GeoRoleId ? 'Edición de geo rol' : 'Creación de geo rol';

    this.actionButtons.unshift({
      Key: 'SAVE',
      MatIcon: this.dialogData.GeoRoleId ? 'edit' : 'save',
      Text: this.dialogData.GeoRoleId ? 'Actualizar' : 'Crear',
      MatColor: 'primary',
      DisabledIf: _form => _form!.invalid
    });

    this.geoRoleForm = this.fb.group({
      Name: ['', Validators.required],
      IsActive: [false]
    });
  }

  GetGeoRoleInEdition(): void {
    this.overlayService.OnGet();
    this.geoRoleService.Get<IGeoRole>(false, this.dialogData.GeoRoleId)
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (callback) => {
          this.alertService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          })
          this.geoRoleInEdition = callback.Data;
          if (this.geoRoleInEdition) this.geoRoleForm.setValue({
            Name: this.geoRoleInEdition.Name,
            IsActive: this.geoRoleInEdition.IsActive
          });
        },
        error: err => {
          this.alertService.ShowAlert({HttpErrorResponse: err});
        }
      });
  }

  OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'SAVE':
        this.OnSaveGeoRole();
        break;
      case 'CANCEL':
        this.matDialogRef.close();
        break;
    }
  }

  OnSaveGeoRole(): void {
    let geoRole = {...this.geoRoleInEdition, ...this.geoRoleForm.value} as IGeoRole;

    let observable$: Observable<Structures.Interfaces.ICLResponse<IGeoRole>> | null = null;

    if (this.dialogData.GeoRoleId) {
      observable$ = this.geoRoleService.Patch(geoRole);
    } else {
      observable$ = this.geoRoleService.Post(geoRole);
    }

    this.overlayService.OnPost();

    observable$
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (callback) => {
          this.modalService.Continue({
            title: `Geo rol ${this.dialogData.GeoRoleId ? 'actualizado' : 'creado'} correctamente`,
            type: CLModalType.SUCCESS
          });
          this.matDialogRef.close();
        },
        error: (err) => {
          this.modalService.Continue({
            title: `Se produjo un error ${this.dialogData.GeoRoleId ? 'actualizando' : 'creando'} el geo rol`,
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      });
  }
}
