import {Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {SettingsService} from "@app/services/settings.service";
import {MatDialogRef} from "@angular/material/dialog";
import {CL_CHANNEL, ICLCallbacksInterface, LinkerService, Register} from "@clavisco/linker";
import {IActionButton} from "@app/interfaces/i-action-button";
import {finalize, Subscription} from "rxjs";
import {LinkerEvent} from "@app/enums/e-linker-events";
import {SharedService} from "@app/shared/shared.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {IShorcuts} from "@app/interfaces/i-shorcuts";
import {AlertsService, CLNotificationType, NotificationPanelService} from "@clavisco/alerts";
import {OverlayService} from "@clavisco/overlay";
import {GetError} from "@clavisco/core";


@Component({
  selector: 'app-shorcuts',
  templateUrl: './shorcuts.component.html',
  styleUrls: ['./shorcuts.component.scss']
})
export class ShorcutsComponent implements OnInit, OnDestroy {

  documentForm!: FormGroup;

  listShorcuts: IShorcuts[] = [];

  actionButtons!: IActionButton[];
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  allSubscriptions!: Subscription;

  constructor(
    private settingService: SettingsService,
    private matDialogRef: MatDialogRef<ShorcutsComponent>,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private overlayService: OverlayService,
  ) {
    this.allSubscriptions = new Subscription();
  }

  ngOnDestroy(): void {
    this.allSubscriptions.unsubscribe();
  }

  ngOnInit(): void {
    this.onLoad();
  }

  private onLoad(): void {
    this.initForm();
    this.actionButtons = [
      {
        Key: 'CANCELAR',
        MatIcon: 'cancel',
        Text: 'Cancelar',
        MatColor: 'primary'
      },
      {
        Key: 'ADD',
        MatIcon: 'save',
        Text: 'Crear',
        MatColor: 'primary',
        DisabledIf: (_form?: FormGroup) => _form?.invalid || false
      }
    ];
    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.onActionButtonClicked, this.callbacks);
    this.allSubscriptions.add(this.sharedService.OnActionButtonClicked(this.onActionButtonClicked));
    this.loadInitialData();
  }

  private initForm(): void {
    this.documentForm = this.fb.group({
      Description: ['', [Validators.required]],
      Ruta: ['', [Validators.required]]
    })
  }

  public onActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'CANCELAR':
        this.matDialogRef.close(null);
        break;
      case 'ADD':
        this.saveChanges();
        break;
    }
  }

  public saveChanges(): void {
    let data: IShorcuts = this.documentForm.value;
    let value = this.listShorcuts.find(x => x.Ruta === data.Ruta);
    if (value) {
      data.Nombre = value.Nombre;
      data.Icon = value.Icon;
    }
    this.matDialogRef.close(data);
  }

  private loadInitialData(): void {
    this.overlayService.OnGet();
    this.settingService.GetShorcuts().pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (callback) => {
        this.listShorcuts = callback.Data;
      }
    });
  }


}
