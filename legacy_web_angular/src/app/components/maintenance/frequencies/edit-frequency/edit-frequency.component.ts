import {Component, Inject, OnInit} from '@angular/core';
import {IStructures} from "@app/interfaces/i-structures";
import {IActionButton} from "@app/interfaces/i-action-button";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {RoutesFrequeciesService} from "@app/services/routes-frequecies.service";
import {AlertsService, CLModalType, CLToastType, ModalService, NotificationPanelService} from "@clavisco/alerts";
import {OverlayService} from "@clavisco/overlay";
import {finalize, forkJoin, Observable, of} from "rxjs";
import {IEditFrequencyDialogData} from "@app/interfaces/i-dialog-data";
import {IRouteFrequency} from "@app/interfaces/i-route";
import {GetError, Structures} from "@clavisco/core";
import {DAYS_OF_WEEK} from "@app/interfaces/i-constants";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {IPermissionbyUser} from "@app/interfaces/i-roles";

@Component({
  selector: 'app-edit-frequency',
  templateUrl: './edit-frequency.component.html',
  styleUrls: ['./edit-frequency.component.scss']
})
export class EditFrequencyComponent implements OnInit {

  modalTitle!: 'Edición de frecuencia' | 'Creación de frecuencia';
  frequencyWeeks: IStructures[] = [];
  currentFrequency: IRouteFrequency | undefined;
  frequencyInEdition: IRouteFrequency | null | undefined;
  daysOfWeek: IStructures[] = [];
  frequencyForm!: FormGroup;
  permissions: IPermissionbyUser[] = [];
  actionButtons: IActionButton[] = [];

  constructor(
    private matDialogRef: MatDialogRef<EditFrequencyComponent>,
    private frequenciesService: RoutesFrequeciesService,
    private alertsService: AlertsService,
    private fb: FormBuilder,
    private overlayService: OverlayService,
    @Inject(MAT_DIALOG_DATA) private data: IEditFrequencyDialogData,
    private modalService: ModalService
  ) {
  }

  ngOnInit(): void {
    this.modalTitle = this.data.FrequencyId ? 'Edición de frecuencia' : 'Creación de frecuencia';
    this.daysOfWeek = JSON.parse(JSON.stringify(DAYS_OF_WEEK));
    this.permissions = this.data.Permissions;
    this.LoadForm();
    this.InitialRequest();
  }

  InitialRequest(): void {
    this.overlayService.OnGet();

    forkJoin({
      Weeks: this.frequenciesService.GetRouteFrequenciesWeeks(),
      Frequency: this.data.FrequencyId ? this.frequenciesService.Get<IRouteFrequency>(false, this.data.FrequencyId) : of({
        Data: null,
        Message: ''
      } as Structures.Interfaces.ICLResponse<IRouteFrequency | null>)
    })
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (responses) => {
          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });
          this.frequencyWeeks = responses.Weeks.Data || [];
          this.frequencyInEdition = responses.Frequency.Data;
          if (this.frequencyInEdition) {
            this.frequencyForm.patchValue({
              Description: this.frequencyInEdition.Description,
              Weeks: this.frequencyInEdition.Weeks,
              IsActive: this.frequencyInEdition.IsActive
            });
            this.actionButtons = [
              {
                Key: 'SAVE',
                MatColor: 'primary',
                Text: 'Actualizar',
                MatIcon: 'edit',
                DisabledIf: (_form, _userPermssions) => _form?.invalid || false
              },
              {
                Key: 'CANCEL',
                MatColor: 'primary',
                Text: 'Cancelar',
                MatIcon: 'cancel'
              }
            ];
          } else {
            this.actionButtons = [
              {
                Key: 'SAVE',
                MatColor: 'primary',
                Text: 'Crear',
                MatIcon: 'save',
                DisabledIf: (_form, _userPermssions) => _form?.invalid || false
              },
              {
                Key: 'CANCEL',
                MatColor: 'primary',
                Text: 'Cancelar',
                MatIcon: 'cancel'
              }
            ];
          }
          this.SelectFrequencyDays();
        }
      });
  }

  LoadForm(): void {
    this.frequencyForm = this.fb.group({
      Description: ['', Validators.required],
      Weeks: ['', Validators.required],
      IsActive: [false]
    });

    this.frequencyForm.valueChanges.subscribe({
      next: (value) => {
        this.currentFrequency = {...value};
      }
    });
  }

  GetSelectedDays(): string {
    return this.daysOfWeek.filter(d => d.Prop1 === 'Y' && d.Key !== '-1').map(d => d.Key).join('.');
  }

  SelectFrequencyDays(): void {
    if (!this.frequencyInEdition || !Object.keys(this.frequencyInEdition).length) return;

    let daysKeys: string[] = this.frequencyInEdition.Days.split('.');

    this.daysOfWeek.forEach(d => {
      if (daysKeys.includes(d.Key)) {
        this.OnDayOfWeekSelected(d);
      }
    });
  }

  OnDayOfWeekSelected(_day: IStructures): void {
    _day.Prop1 = _day.Prop1 === 'Y' ? 'N' : 'Y';

    if (_day.Key === '-1') {
      if (_day.Prop1 === 'Y') {
        this.daysOfWeek.forEach(d => d.Prop1 = 'Y');
      } else {
        this.daysOfWeek.forEach(d => d.Prop1 = 'N');
      }
    } else {
      // Si estan todos los dias seleccionados, selecciono la opcion de "Todos"
      let daysNoSelected = this.daysOfWeek.filter(d => d.Prop1 === 'N');

      if (daysNoSelected && daysNoSelected.length === 1 && daysNoSelected[0].Key === '-1') {
        this.daysOfWeek.find(d => d.Key === '-1')!.Prop1 = 'Y';
      } else {
        this.daysOfWeek.find(d => d.Key === '-1')!.Prop1 = 'N';
      }
    }
  }

  OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'SAVE':
        this.SaveFrequency();
        break;
      case 'CANCEL':
        this.matDialogRef.close(false);
        break;
    }
  }

  SaveFrequency(): void {
    if (this.frequencyForm.invalid) {
      this.alertsService.Toast({type: CLToastType.INFO, message: 'Hay campos del formulario inválidos'});
      return;
    }

    let selectedDays = this.GetSelectedDays();

    if (!selectedDays) {
      this.alertsService.Toast({type: CLToastType.INFO, message: 'Debe seleccionar al menos un día de descarga'});
      return;
    }

    let observable$: Observable<Structures.Interfaces.ICLResponse<IRouteFrequency>> | null = null;

    if (this.frequencyInEdition && Object.keys(this.frequencyInEdition).length) {
      let frequency = {...this.frequencyInEdition, ...this.currentFrequency, Days: selectedDays};
      observable$ = this.frequenciesService.Patch(frequency);
    } else {
      let frequency = {...this.currentFrequency!, Days: selectedDays};
      observable$ = this.frequenciesService.Post(frequency);
    }

    this.overlayService.OnPost();
    observable$
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (response) => {
          this.modalService.Continue({
            title: `Frecuencia ${this.frequencyInEdition && Object.keys(this.frequencyInEdition).length? 'actualizada': 'creada'} correctamente`,
            type: CLModalType.SUCCESS
          });
          this.matDialogRef.close(true);
        },
        error: (err) => {
          this.modalService.Continue({
            title:  `Se produjo un error ${this.frequencyInEdition && Object.keys(this.frequencyInEdition).length? 'actualizando': 'creando'} la frecuencia`,
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      });
  }

}
