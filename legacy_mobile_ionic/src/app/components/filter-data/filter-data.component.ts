import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CustomModalController} from "../../services/custom-modal-controller.service";
import {PopoverController} from "@ionic/angular";

@Component({
  selector: 'app-filter-data',
  templateUrl: './filter-data.component.html',
  styleUrls: ['./filter-data.component.scss'],
})
export class FilterDataComponent<T> implements OnInit {

  @Input() inputData: T[];
  @Input() isPopover: boolean = false;
  @Input() inputTitle: string;
  @Input() inputFilterProperties: (keyof T)[] = []
  
  filteredData: T[];

  searchTerm: string;
  constructor(private modalController: CustomModalController,
              private popoverController: PopoverController) { }

  ngOnInit() {
    this.filteredData = [...this.inputData];
  }

  /**
   * Dismisses the modal and passes the selected item back to the parent component.
   *
   * @param item - The item to be passed back upon dismissal. Defaults to null if no item is provided.
   */
  Dismiss(item: T = null)
  {
    if(this.isPopover){
      this.popoverController.dismiss(item);
      return;
    }
    
    this.modalController.dismiss(item);
  }

  /**
   * Filters the input data based on the search term and updates the filteredData property.
   * The filter checks if any of the specified properties of each item include the search term (case-insensitive).
   *
   * The result is limited to the first 100 items after filtering.
   */
  FilterData() {
    this.filteredData = this.inputData.filter((item: T) =>
        this.inputFilterProperties.some((property) =>
            String(item[property]).toLowerCase().includes(this.searchTerm?.toLowerCase())
        )
    );
  }

}
