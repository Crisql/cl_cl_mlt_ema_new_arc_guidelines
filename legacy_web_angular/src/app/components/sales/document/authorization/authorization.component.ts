import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SharedService} from "@app/shared/shared.service";
import {CL_CHANNEL, ICLCallbacksInterface, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {Subscription} from "rxjs";
import {IDocumentApprovalRequest} from "@app/interfaces/i-document-approval-request";
import {LinkerEvent} from "@app/enums/e-linker-events";
import {CLPrint, Structures} from "@clavisco/core";
import {IActionButton} from "@app/interfaces/i-action-button";

@Component({
  selector: 'app-authorization',
  templateUrl: './authorization.component.html',
  styleUrls: ['./authorization.component.scss']
})
export class AuthorizationComponent implements OnInit {

  /*FORMULARIOS*/
  authorizarionForm!: FormGroup;

  actionButtons: IActionButton[] = [];
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };

  allSubscriptions!: Subscription;

  constructor(
    private fb: FormBuilder,
    private matDialogRef: MatDialogRef<AuthorizationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDocumentApprovalRequest,
    private sharedService: SharedService,
    @Inject('LinkerService') private linkerService: LinkerService
  ) {
    this.allSubscriptions = new Subscription();
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions.unsubscribe();
  }

  ngOnInit(): void {
    this.OnLoad();
  }

  private OnLoad(): void {
    this.InitForm();

    this.actionButtons = [
      {
        Key: 'ACEPTAR',
        MatIcon: 'check_circle',
        Text: 'Aceptar',
        MatColor: 'primary',
        DisabledIf: (_form?: FormGroup) => _form?.invalid || false
      }
    ];

    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.OnActionButtonClicked, this.callbacks);

    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );
  }

  public OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'ACEPTAR':
        let valueForm = this.authorizarionForm.value;
        this.matDialogRef.close(valueForm);
        break;
    }
  }

  private InitForm(): void {
    this.authorizarionForm = this.fb.group({
      AbleRemarks: [false],
      Remarks: [{value: '', disabled: true}]
    });
  }

  OnChangeAbleRemarks(_ableRemarks: boolean) {
    if(_ableRemarks){
      this.authorizarionForm.controls['Remarks'].enable();
    } else {
      this.authorizarionForm.controls['Remarks'].setValue('');
      this.authorizarionForm.controls['Remarks'].disable();
    }
  }
}
