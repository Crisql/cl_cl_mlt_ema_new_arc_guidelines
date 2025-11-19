import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { forkJoin, Subscription } from "rxjs";
import {filter, finalize} from "rxjs/operators";
import { AlertType } from "src/app/common";
import {
    LocalStorageVariables,
    PublisherVariables
} from "src/app/common/enum";
import {
    PermissionsSelectedModel
} from "src/app/models";
import {
    PermissionService,
    CommonService,
    LocalStorageService,
    PublisherService, 
} from "src/app/services";
import {IStructures} from "../../interfaces/i-structures";
import {StructuresService} from "../../services/structures.service";
import {ICashFlow} from "../../interfaces/i-cash-flow";
import {CashFlowService} from "../../services/cash-flow.service";

@Component({
    selector: "app-cash-flow",
    templateUrl: "./cash-flow.page.html",
    styleUrls: ["./cash-flow.page.scss"],
})
export class CashFlowPage  {
    
    /**
     * Array containing the selected permissions models.
     */
    permissionList: PermissionsSelectedModel[];

    /**
     * Subscription to manage subscriptions.
     */
    subscriptions: Subscription = new Subscription();

    /**
     * Array containing the structures related to reasons.
     */
    reasons: IStructures[] = [];

    /**
     * Array containing the structures related to types of flow.
     */
    typesFlow: IStructures[] = [];

    /**
     * The user's email retrieved from local storage.
     */
    User: string = this.localStorageService.get(LocalStorageVariables.Session).UserEmail;

    /**
     * The amount for the cash flow.
     */
    Amount: number;

    /**
     * The type of the cash flow.
     */
    Type: any;

    /**
     * The reason for the cash flow.
     */
    Reason: any;

    /**
     * Additional details for the cash flow.
     */
    Details: string;
    

    constructor(
        private translateService: TranslateService,
        private localStorageService: LocalStorageService,
        private commonService: CommonService,
        private permissionService: PermissionService,
        private publisherService: PublisherService,
        private structuresService: StructuresService,
        private cashFlowService: CashFlowService,
       
    ) {
    }

    /**
     * Lifecycle method triggered when the page is about to enter and become active.
     * - Copies the permissions from the permission service to the permissionList array.
     * - Invokes the SendInitialRequests method to fetch initial data.
     */
    ionViewWillEnter() {
        this.permissionList = [...this.permissionService.Permissions];
        this.SendInitialRequests();
    }


    /**
     * Asynchronous method that sends initial requests to fetch necessary data.
     * - Retrieves a loader from the common service and presents it.
     * - Uses forkJoin to make parallel requests to fetch 'TypeFlow' and 'Reasons' data.
     * - Dismisses the loader after the requests are complete.
     * - Handles the response data by updating the 'reasons' and 'typesFlow' arrays.
     * - Displays an error alert if there is an error during the requests.
     */
    async SendInitialRequests(): Promise<void> {
        let loader = await this.commonService.Loader();
        loader.present();

        forkJoin({
            TypeFlow: this.structuresService.Get('TypeFlow'),
            Reasons: this.structuresService.Get('Reasons'),
            
        }).pipe(finalize(() => loader.dismiss()))
        .subscribe({
            next: (callbacks) => {
                this.reasons = callbacks.Reasons?.Data ?? [];
                this.typesFlow = callbacks.TypeFlow?.Data ?? [];
            },
            error: (error) => {
                this.commonService.Alert(AlertType.ERROR, error, error);
            }
        });
    }

    /**
     * Lifecycle method triggered when the page has fully entered and is now active.
     * - Initializes a new subscription to manage subscriptions.
     * - Subscribes to the publisherService observable to watch for permission changes.
     *   - Filters the observable to handle only changes related to permissions.
     *   - Updates the permissionList with the latest permissions when changes occur.
     */
    ionViewDidEnter(): void {
        this.subscriptions = new Subscription();

        //Subscripcion para observar el cambio de permisos
        this.subscriptions.add(this.publisherService.getObservable()
            .pipe(
                filter(p => p.Target === PublisherVariables.Permissions)
            )
            .subscribe({
                next: (callback) => {
                    if (callback) {
                        this.permissionList = [...this.permissionService.Permissions];
                    }
                }
            }));
    }

    /**
     * Asynchronous method that creates a new cash flow entry.
     * - Retrieves a loader from the common service.
     * - Constructs a data object with the provided values for a cash flow entry.
     * - Presents the loader.
     * - Posts the cash flow data using the cashFlowService.
     * - Dismisses the loader after the posting is complete.
     * - Handles success and error scenarios accordingly.
     * - If the cash flow creation is successful, displays a success alert and resets the data fields.
     */
    async CreateFlow(): Promise<void> {
        
        let loader = await this.commonService.Loader();
        let data = {
            Code: '',
            Name: '',
            U_INTERNAL_K: 0,
            U_CreationDate: '',
            U_Amount: this.Amount,
            U_Type:this.Type,
            U_Reason: this.Reason,
            U_Details: this.Details
        } as ICashFlow
        loader.present();

        this.cashFlowService.Post(data).pipe(
            finalize(() => {
                loader.dismiss()
            })
        ).subscribe({
            next: async (callback) => {
                if (callback.Data)
                {
                    this.commonService.alert(AlertType.SUCCESS, this.commonService.Translate("Movimiento de dinero creado", "Cash flow created"),this.commonService.Translate("Movimiento de dinero", "Cash flow"));
                }
                this.ResetData();
            },
            error: (error: any) => {
                this.commonService.alert(AlertType.ERROR, error);
            },
        });
     
    }

    /**
     * Method that resets the data fields to their initial values and triggers the sending of initial requests.
     * - Resets the following fields to their initial values:
     *   - Amount
     *   - Type
     *   - Reason
     *   - Details
     * - Triggers the sending of initial requests after resetting the data.
     */
    ResetData(): void {
        
        this.Amount=null;
        this.Type= null;
        this.Reason= null;
        this.Details="";
        this.SendInitialRequests();
    }

    /**
     * Method that checks whether the creation button should be disabled.
     * The button is disabled if any of the following fields are empty or zero:
     * - Amount
     * - Type
     * - Reason
     * @returns Returns true if the button should be disabled, otherwise returns false.
     */
    DisableCreationButton(): boolean {
       if(this.Amount==null || this.Amount==0 || this.Type==null || this.Reason==null){
           return true;
       }
       return false;
    }
    
}