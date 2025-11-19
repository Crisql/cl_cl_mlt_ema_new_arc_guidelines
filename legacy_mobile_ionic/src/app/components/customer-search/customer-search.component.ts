import { Component, OnDestroy, OnInit } from "@angular/core";
import { debounceTime, finalize } from "rxjs/operators";
import { AlertType, LogEvent } from "src/app/common";
import { BusinessPartnerMinified } from "src/app/models";
import { CustomerService, CommonService, LogManagerService, LocalStorageService } from "src/app/services";
import { CustomModalController } from "src/app/services/custom-modal-controller.service";
import {NavParams} from "@ionic/angular";
import { Subject } from "rxjs";
import { HeadersData } from "src/app/common/enum";

@Component({
  selector: "app-customer-search",
  templateUrl: "./customer-search.component.html",
  styleUrls: ["./customer-search.component.scss"],
})
export class CustomerSearchComponent implements OnInit, OnDestroy {
  page: number = 0;
  recordsCount: number = 0;
  pageSize: number = 40;
  itemsInScreen = 0;

  searchTerm: string;

  isViewBps:boolean = false;
  isLoading: boolean = false;
  hasMore: boolean = true;

  customers: BusinessPartnerMinified[];
  filteredCustomers: BusinessPartnerMinified[];

  searchSubject = new Subject<{searchTerm: string; element: any;}>();

  constructor(
    private modalController: CustomModalController,
    private customerService: CustomerService,
    private commonService: CommonService,
    private logManagerService: LogManagerService,
    private navParams: NavParams,
    private localStorageService: LocalStorageService
  ) {}
  ngOnDestroy(): void {
    this.modalController.DismissAll();
  }

  ngOnInit() {
    this.isViewBps = this.navParams.get('data');

    this.searchSubject.pipe(
      debounceTime(500) 
    ).subscribe(({searchTerm, element}) => {
      this.FilterBp(searchTerm).then(()=>element.setFocus());
    });

    this.FilterBp(this.searchTerm);
  }


  /**
   * Closes the modal and optionally returns selected customer data.
   *
   * @param item - (Optional) The selected customer (`BusinessPartnerMinified`). If not provided,
   *               the modal is dismissed without data.
  */
  async Dismiss(item: BusinessPartnerMinified = null) 
  {
    if(!item)
    {
      this.modalController.dismiss(item);
    }
    else
    {
     
      if(this.isViewBps){
        this.modalController.dismiss(item.CardCode);
      }else{
        let loader = await this.commonService.Loader();
        loader.present();
        this.customerService.GetBp(item.CardCode)
            .pipe(
                finalize(()=> loader.dismiss())
            )
            .subscribe({
              next: (callback) => {
                if(callback.Data)
                {
                  this.modalController.dismiss(callback.Data);
                }
                else
                {
                  this.commonService.toast(callback.Message, 'dark', 'bottom');
                }
              },
              error: (err) => {
                this.commonService.Alert(AlertType.ERROR, err, err);
                this.logManagerService.Log(
                  LogEvent.ERROR, 
                  `${err}`
                );
              }
            });
      }
      
    }
  }



  /**
   * Handles user input in the search field.
   *
   * @param event - The input event from the search field.
   *
   */
  OnSearchInput(event: any) {
    this.searchTerm = event.target.value ?? '';
    this.searchSubject.next({
      searchTerm: this.searchTerm,
      element: event.target
    });
  }



  /**
   * Filters items based on the search term and resets the pagination.
   *
   * @param _searchTerm - The string used to filter items.
   * 
   */
  async FilterBp(_searchTerm: string): Promise<void> {
    let loader = await this.commonService.Loader();
    try {
      loader.present();
      
      this.page = 0;
      this.isLoading = false;
      this.hasMore = true;
      this.customerService.GetbyFilter<BusinessPartnerMinified[]>(_searchTerm, this.page, this.pageSize)
      .pipe(
          finalize(() => loader.dismiss())
      ).subscribe(
          {
            next: (callback => {
              this.customers = callback.Data;
              this.filteredCustomers = [...this.customers];

              this.recordsCount = this.localStorageService.data.get(HeadersData.RecordsCount) ? +this.localStorageService.data.get(HeadersData.RecordsCount): this.customers.length;
              this.localStorageService.data.delete(HeadersData.RecordsCount)
            }),
            error: (error)=>{
              this.commonService.alert(AlertType.ERROR, error)
              this.logManagerService.Log(
                  LogEvent.ERROR, 
                  `${error}`
                );
            }
          }
      );
    }catch (error){
      this.commonService.alert(AlertType.ERROR, error);
      this.logManagerService.Log(
        LogEvent.ERROR, 
        `${error}`
      );
      loader.dismiss()
    }
  }


  /**
   * Handles infinite scroll behavior when the user reaches near the bottom of the list.
   * 
   * @param _index - The index of the currently visible item in the list.
   */
  async OnScroll(_index: number) : Promise<void>{

    if (!this.customers?.length || this.isLoading || !this.hasMore || this.customers?.length == this.recordsCount) 
      return;
  
    if (_index < (this.customers.length - this.pageSize)) 
     return;

    this.isLoading = true;

    this.page++;

    let loader = await this.commonService.Loader();
    loader.present();

    this.customerService.GetbyFilter<BusinessPartnerMinified[]>(this.searchTerm, this.page, this.pageSize)
    .pipe(
      finalize(() => loader.dismiss())
    ).subscribe(
        {
          next: (callback => {
            this.customers = [...this.customers, ...callback.Data || []];
            this.filteredCustomers = [...this.customers];

            if (this.customers.length == this.recordsCount) {
              this.hasMore = false;
            }

            this.isLoading = false;
          }),
          error: (error)=>{
            this.commonService.alert(AlertType.ERROR, error)
          }
        }
    );
  }
}
