import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {CL_CHANNEL, ICLCallbacksInterface, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {SharedService} from "@app/shared/shared.service";
import {OverlayService} from "@clavisco/overlay";
import {AlertsService, CLModalType, ModalService} from "@clavisco/alerts";
import {finalize, Subscription, switchMap} from "rxjs";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {IActionButton} from "@app/interfaces/i-action-button";
import {LinkerEvent} from "@app/enums/e-linker-events";
import {CLPrint, GetError, Repository, Structures} from "@clavisco/core";
import {ActivatedRoute, Router} from "@angular/router";
import {CashFlowService} from "@app/services/cash-flow.service";
import {IUserToken} from "@app/interfaces/i-token";
import {StorageKey} from "@app/enums/e-storage-keys";
import {IStructures} from "@app/interfaces/i-structures";
import {IUser} from "@app/interfaces/i-user";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {ICashFlowResolverData} from "@app/interfaces/i-resolvers";
import {ICashFlow} from "@app/interfaces/i-cash-flow";

@Component({
  selector: 'app-cash-flow',
  templateUrl: './cash-flow.component.html',
  styleUrls: ['./cash-flow.component.scss']
})
export class CashFlowComponent implements OnInit, OnDestroy {

  /*Objects*/
  currentUser!: IUserToken | null;


  /*Observables*/
  allSubscriptions!: Subscription;


  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };

  /*Formularios*/
  documentForm!: FormGroup;


  /*Listas*/
  actionButtons: IActionButton[] = [];
  reasons: IStructures[] = [];
  typesFlow: IStructures[] = [];
  permissions: IPermissionbyUser[] = [];

  maxCharacteres: number = 0;

  constructor(
    private sharedService: SharedService,
    @Inject('LinkerService') private linkerService: LinkerService,
    private overlayService: OverlayService,
    private alertsService: AlertsService,
    private fb: FormBuilder,
    private router: Router,
    private cashFlowService: CashFlowService,
    private modalService: ModalService,
    private activatedRoute: ActivatedRoute,
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

    this.currentUser = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session);

    this.InitForm();
    this.LoadInitialData();

    this.actionButtons = [
      {
        Key: 'ADD',
        MatIcon: 'save',
        Text: 'Crear',
        MatColor: 'primary',
        DisabledIf: (_form?: FormGroup) => _form?.invalid || false
      },
      {
        Key: 'CLEAN',
        MatIcon: 'mop',
        Text: 'Limpiar'
      }
    ];

    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.OnActionButtonClicked, this.callbacks);

    this.allSubscriptions.add(this.sharedService.OnActionButtonClicked(this.OnActionButtonClicked));
    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );

  }

  private LoadInitialData(): void {
    this.activatedRoute.data.subscribe({
      next: (res) => {
        const resolvedData = res['resolvedData'] as ICashFlowResolverData;

        if (resolvedData) {
          this.typesFlow = resolvedData.TypesFlow;
          this.reasons = resolvedData.Reasons;
        }
      }
    });
  }

  private InitForm(): void {
    this.documentForm = this.fb.group({
      User: [{value: this.currentUser?.UserEmail, disabled: true}, [Validators.required]],
      Amount: [null, [Validators.required]],
      Type: [null, [Validators.required]],
      Reason: [null, [Validators.required]],
      Details: [null, [Validators.maxLength(250)]]
    })
  }

  public OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'ADD':
        this.SaveChanges();
        break;
      case 'CLEAN':
        this.Clear();
        break;

    }
  }

  private Clear(): void {
    this.router.navigateByUrl('/').then(() => {
      this.router.navigate(['sales', 'cash-flow']);
    });
  }

  private SaveChanges(): void {

    let frmValue = this.documentForm.getRawValue();

    let data = {
      Code: '',
      Name: '',
      U_INTERNAL_K: 0,
      U_CreationDate: '',
      U_Amount: frmValue.Amount,
      U_Type: frmValue.Type,
      U_Reason: frmValue.Reason,
      U_Details: frmValue.Details
    } as ICashFlow

    this.overlayService.OnPost();
    this.cashFlowService.Post(data).pipe(
      switchMap(res => {
        this.overlayService.Drop();
        return this.modalService.Continue({
        type: CLModalType.SUCCESS,
        title: 'Movimiento creado correctamente'
      })}),
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (callback) => {
        this.Reset()
      },
      error: (err) => {
        this.modalService.Continue({
          title:  'Se produjo un error creando el movimiento',
          subtitle: GetError(err),
          type: CLModalType.ERROR
        });
      }
    })
  }

  private Reset(): void {
    this.documentForm.reset();
    this.documentForm.controls['User'].setValue(this.currentUser?.UserEmail);
    this.maxCharacteres = 0;
  }

  public Characteres(): void {
    if(this.documentForm.controls['Details'].value){
      this.maxCharacteres = this.documentForm.controls['Details'].value?.length;
    }else{
      this.maxCharacteres = 0;
    }
  }


}
