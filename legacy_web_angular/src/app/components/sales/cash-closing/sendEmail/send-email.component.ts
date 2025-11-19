import {Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {CL_CHANNEL, ICLCallbacksInterface, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {IActionButton} from "@app/interfaces/i-action-button";
import {LinkerEvent} from "@app/enums/e-linker-events";
import {CLPrint, GetError, Structures} from "@clavisco/core";
import {finalize, Subscription} from "rxjs";
import {SharedService} from "@app/shared/shared.service";
import {ISendClashClosingReport} from "@app/interfaces/i-PaydeskBalance";
import {CashClosingsService} from "@app/services/cashClosings.service";
import {OverlayService} from "@clavisco/overlay";
import {AlertsService, CLModalType, ModalService} from "@clavisco/alerts";
import {regexEmail} from "@app/interfaces/i-constants";


@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.component.html',
  styleUrls: ['./send-email.component.scss']
})
export class SendEmailComponent implements OnInit, OnDestroy {

  sendForm!: FormGroup;

  actionButtons: IActionButton[] = [];
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  allSubscriptions!: Subscription;

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: string,
    private matDialogRef: MatDialogRef<SendEmailComponent>,
    @Inject('LinkerService') private linkerService: LinkerService,
    private sharedService: SharedService,
    private cashClosingService: CashClosingsService,
    private overlayService: OverlayService,
    private alertsService: AlertsService,
    private modalService: ModalService
  ) {

    this.allSubscriptions = new Subscription();
  }

  ngOnInit(): void {
    this.OnLoad();
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions.unsubscribe();
  }

  private OnLoad(): void {
    this.InitForm();
    this.actionButtons = [
      {
        Key: 'SEND',
        MatIcon: 'send',
        Text: 'Enviar',
        MatColor: 'primary',
        DisabledIf: (_form?: FormGroup) => _form?.invalid || false
      },
      {
        Key: 'CANCELAR',
        MatIcon: 'cancel',
        Text: 'Cancelar',
        MatColor: 'primary'
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
      case 'SEND':

        let form = this.sendForm.getRawValue();

        const data: ISendClashClosingReport = {
          To: form.To,
          Subject: form.Subject,
          Body: form.Body,
          UrlReport: this.data
        }
        this.Send(data);
        break;
      case 'CANCELAR':
        this.matDialogRef.close();
        break;
    }
  }

  private InitForm(): void {
    this.sendForm = this.fb.group({
      To: ['', [Validators.required, Validators.pattern(regexEmail)]],
      Subject: ['', Validators.required],
      Body: ['']
    });
  }

  private Send(_data: ISendClashClosingReport): void {
    this.overlayService.OnPost();
    this.cashClosingService.Send(_data).pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (callback) => {
        this.matDialogRef.close();
        this.modalService.Continue({
          title: 'Email enviado correctamente',
          type: CLModalType.SUCCESS
        })
      },
      error: (err) => {
        this.modalService.Continue({
          title:  'Se produjo un error al enviar el email',
          subtitle: GetError(err),
          type: CLModalType.ERROR
        });
      }
    });


  }


}
