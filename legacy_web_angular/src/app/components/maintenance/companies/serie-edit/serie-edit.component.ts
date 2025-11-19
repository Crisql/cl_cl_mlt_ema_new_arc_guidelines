import { Component, OnInit, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {AlertsService, CLNotificationType, NotificationPanelService} from '@clavisco/alerts';
import {GetError, Structures} from '@clavisco/core';
import { OverlayService } from '@clavisco/overlay';
import { finalize, Observable, Subscription } from 'rxjs';
import { IIdDialogData } from 'src/app/interfaces/i-dialog-data';
import { ISerie } from 'src/app/interfaces/i-serie';
import { SeriesService } from 'src/app/services/series.service';

@Component({
  selector: 'app-serie-edit',
  templateUrl: './serie-edit.component.html',
  styleUrls: ['./serie-edit.component.scss']
})
export class SerieEditComponent implements OnInit {
  serieForm!: FormGroup;
  modalTitle!: string;

  constructor(private serieService: SeriesService,
            private overlayService: OverlayService,
            private alertsService: AlertsService,
            @Inject(MAT_DIALOG_DATA) public data: IIdDialogData,
            private matDialogRef: MatDialogRef<SerieEditComponent>,
            private fb: FormBuilder, private activatedRoute: ActivatedRoute,
              private notificationService: NotificationPanelService) { }

  ngOnInit(): void {
    this.GetSerieId();
    this.LoadForm();
    this.modalTitle = this.data.Id ? 'Edición de serie' : 'Creación de serie';
  }


  LoadForm(): void {
    this.serieForm = this.fb.group({
      Id: [null],
      Name: [null, [Validators.required]],
      Serie: [null, [Validators.required]],
      Type: [null, [Validators.required]],
      IsActive: [false, [Validators.required]],
    });
  }

  Save(): void {

    this.overlayService.OnPost();

    let serieValues = this.serieForm.getRawValue() as ISerie;

    let updateOrCreate$: Observable<Structures.Interfaces.ICLResponse<ISerie>> | null = null;

    if (!this.data.Id) {
      //updateOrCreate$ = this.serieService.Post(serieValues);
    }
    else {
      //updateOrCreate$ = this.serieService.Patch(this.data.Id, serieValues);
    }

    /*updateOrCreate$
      .pipe(
        finalize(() => this.overlayService.Drop())
      )
      .subscribe({
        next: (callback) => {
          this.alertsService.ShowAlert({ Response: callback });
          this.matDialogRef.close();
        },
        error: (err) => {
          this.alertsService.ShowAlert({ HttpErrorResponse: err });
        }
      });*/

  }

  GetSerieId(): void {
    this.overlayService.OnGet();

    this.serieService.Get<ISerie>()
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (callback) => {
          this.serieForm.patchValue(callback.Data);
        }
      });
  }

}
