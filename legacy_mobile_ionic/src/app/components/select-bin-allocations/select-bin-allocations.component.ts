import { Component, Input, OnInit } from '@angular/core';
import { IBinRequest } from 'src/app/models/db/i-bin';
import { ISelectBinAllocationsComponentInputData } from 'src/app/models/db/i-modals-data';
import { CommonService, LogManagerService } from 'src/app/services';
import { CustomModalController } from 'src/app/services/custom-modal-controller.service';

@Component({
  selector: 'app-select-bin-allocations',
  templateUrl: './select-bin-allocations.component.html',
  styleUrls: ['./select-bin-allocations.component.scss'],
})
export class SelectBinAllocationsComponent implements OnInit {
  //VARBOX
  @Input("data") data: ISelectBinAllocationsComponentInputData;
  searchTerm: string;
  binAllocations: IBinRequest[];
  filteredBinAllocations: IBinRequest[];
  request: number;

  constructor(
    private modalController: CustomModalController,
    private commonService: CommonService,
    private logManagerService: LogManagerService
  ) { }
  
  // Se elimina temporalmente para evitar que se cierre esta modal al cerrar la otra
  // ngOnDestroy(): void {
  //   this.modalController.dismissAll();
  // }

  ngOnInit() {
    this.request = this.data.Requested
    this.binAllocations = this.data.BinAllocations;
    this.filteredBinAllocations = this.binAllocations;
  }

  async SelectAllocations(): Promise<void> {

    let binAllocationsSelected: IBinRequest[] = this.binAllocations.filter((x) => x.Quantity > 0);

    if(binAllocationsSelected.some((x) => x.Quantity > x.Stock)){
      this.commonService.toast(this.commonService.Translate(`La cantidad de unidades seleccionada excede el stock`, `Selected quantity not allowed`), "dark", "bottom");
      return;
    }

    if(binAllocationsSelected.some(x => x.Quantity < 0)){
      this.commonService.toast(this.commonService.Translate(`No se permiten cantidades negativas`, `Negative amounts not allowed`), 'dark', 'bottom');
      return;
    }

    if(binAllocationsSelected.reduce((acc, cur) => acc + cur.Quantity, 0) > this.request){
      this.commonService.toast(this.commonService.Translate(`Cantidad de unidades solicitada excedida`, `Requested amount exceed`), 'dark', 'bottom');
      return;
    }

    this.dismiss(binAllocationsSelected, 'success');
  }

  async updateBinAllocation(_allocation: IBinRequest) {
      _allocation.Quantity = _allocation.Quantity ? 0 : 1;
  }

  dismiss(_allocations?: IBinRequest[], _role?: string) {
    this.modalController.dismiss(_allocations, _role);
  }

  filterBinAllocations() {
    this.filteredBinAllocations = this.binAllocations.filter(
      (x) =>
        x.BinCode.toUpperCase().search(this.searchTerm.toUpperCase()) > -1 ||
        x.BinCode.toUpperCase().search(this.searchTerm.toUpperCase()) > -1
    ).slice(0, 100);
  }
}
