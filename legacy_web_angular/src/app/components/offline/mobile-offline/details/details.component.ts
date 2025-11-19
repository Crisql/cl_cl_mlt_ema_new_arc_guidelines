import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {finalize, Subscription} from "rxjs";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ISyncDocument} from "@app/interfaces/i-sync-document";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "@app/services/user.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ISyncDocumentDialogData} from "@app/interfaces/i-dialog-data";
import {OverlayService} from "@clavisco/overlay";
import {AlertsService} from "@clavisco/alerts";
import {SyncDocumentService} from "@app/services/sync-document.service";
import {DocumentSyncStatus} from "@app/enums/enums";
import {formatDate} from "@angular/common";
import {IActionButton} from "@app/interfaces/i-action-button";
import {SharedService} from "@app/shared/shared.service";
import {SyncDocumentStatusNamePipe} from "@app/pipes/sync-document-status-name.pipe";

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {
  modalTitle!: string;
  // routeQueryParams$!: Subscription;
  syncDocumentForm!: FormGroup;
  syncDocumentInEdition: ISyncDocument | undefined;
  actionButtons: IActionButton[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private syncDocumentService: SyncDocumentService,
    @Inject(MAT_DIALOG_DATA) private data: ISyncDocumentDialogData,
    private overlayService: OverlayService,
    private matDialogRef: MatDialogRef<DetailsComponent>,
    private alertsService: AlertsService,
    private sharedService: SharedService,
    private syncDocumentStatusPipe: SyncDocumentStatusNamePipe
  ) {
  }

  ngOnInit(): void {
    this.InitVariables();
    this.SendInitRequest();
    this.actionButtons = [
      {
        Key: 'CANCEL',
        Text: 'Cancelar',
        MatIcon: 'cancel',
        MatColor: 'primary'
      }
    ];
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    // this.routeQueryParams$.unsubscribe();
  }

  InitVariables(): void {
    this.InitializeForm();
    this.ReadQueryParameters();

  }

  public OnActionButtonClicked(_event: IActionButton): void {
    switch (_event.Key) {
      case 'CANCEL':
        this.matDialogRef.close();
        break;
    }
  }

  InitializeForm(): void {
    this.syncDocumentForm = this.formBuilder.group({
      CreatedDate: [null],
      CreatedBy: [''],
      UpdateDate: [null],
      UpdatedBy: [''],
      OfflineDate: [null],
      TransactionType: [''],
      TransactionStatus: [''],
      TransactionDetail: [''],
      DocEntry: [''],
      DocNum: [''],
      DocumentKey: [''],
      DocumentType: ['']
    });

    this.syncDocumentForm.disable();
  }

  ReadQueryParameters(): void {
    // this.routeQueryParams$ = this.activatedRoute.queryParams.subscribe(params => {
    //
    // });
  }

  SendInitRequest(): void {
    this.overlayService.OnGet();

    this.syncDocumentService.Get<ISyncDocument>(this.data.Id)
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (callback) => {
          this.alertsService.ShowAlert({Response: callback});
          let syncDocumentFormatted = {
            ...callback.Data,
            TransactionStatus: this.syncDocumentStatusPipe.transform(callback.Data.TransactionStatus),
            OfflineDate: formatDate(callback.Data.OfflineDate, "d/MM/y h:mm:ss a", 'en'),
          }
          this.syncDocumentForm.patchValue({
            ...syncDocumentFormatted,
            UpdateDate: syncDocumentFormatted.TransactionStatus === DocumentSyncStatus.Success ? syncDocumentFormatted.UpdateDate : ''
          });
          this.syncDocumentInEdition = callback.Data;
          this.modalTitle = `Número de documento: ${this.syncDocumentInEdition?.DocNum}`;
        },
        error: (err) => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      });
  }

  FormatJSON(_rowDocument: string | undefined): any {
    return JSON.parse(_rowDocument || '{}');
  }
}
