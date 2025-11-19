import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { InventoryDetails } from 'src/app/interfaces/i-inventory-details';
import { IItemMasterData } from 'src/app/interfaces/i-item';
import { CommonService } from 'src/app/services';
import { ItemMasterDataService } from 'src/app/services/item-master-data.service';


@Component({
  selector: 'app-inventory-details',
  templateUrl: './inventory-details.component.html',
  styleUrls: ['./inventory-details.component.scss'],
})
export class InventoryDetailsComponent {

  @Input('itemData') itemData: IItemMasterData;

  filterType = 'all';

  totalStock = 0;
  totalAvailable = 0;
  criticalItems = 0;

  inventoryDetails: InventoryDetails[] = [];
  filteredInventory: InventoryDetails[] = [];

  constructor(
    private modalController: ModalController,
    private commonService: CommonService,
    private itemMastarDataService: ItemMasterDataService,
  ) { }

  ionViewWillEnter() {
    this.LoadInitialData();
  }

  /**
   * Loads initial data required for item setup
   * 
   */
  async LoadInitialData() : Promise<void>{
    let loader = await this.commonService.Loader();
    loader.present();

    this.itemMastarDataService.GetItemInventoryDetails(this.itemData.ItemCode).pipe(
      finalize(() => loader.dismiss())
    ).subscribe({
      next: (callback) => {
        this.inventoryDetails = callback.Data;
        this.ApplyFilter();
      }
    });
  }


  /**
  * Filters the inventory based on the current search term.
  * If no search term is provided, returns all items.
  * Updates the filtered inventory and calculates totals.
  */

  FilterInventory(event: any) {
    const value = event.target.value?.toLowerCase() ?? '';
    if (!value) {
      this.filteredInventory = [...this.inventoryDetails];
    } else {
      this.filteredInventory = this.inventoryDetails.filter(item =>
        item.WhsName?.toLowerCase().includes(value)
      );
    }
    this.CalculateTotals();
  }


  /**
  * Dismisses the current modal dialog.
  */
  Dismiss() {
    this.modalController.dismiss();
  }

  /**
   * Calculates the total stock quantity across all inventory items.
   * @returns {number} The sum of all stock values in the mock inventory data.
   */

  GetTotalStock(): number {
    return this.inventoryDetails.reduce((sum, item) => sum + item.OnHand, 0);
  }

  /**
  * Calculates the total available quantity across all inventory items.
  * @returns {number} The sum of all available values in the mock inventory data.
  */
  GetTotalAvailable(): number {
    return this.inventoryDetails.reduce((sum, item) => sum + item.Available, 0);
  }

  /**
   * Toggles the expanded state of an inventory item.
   * @param {InventoryDetails} item The inventory item to toggle.
   */
  ToggleExpand(item: InventoryDetails) {
    item.Expanded = !item.Expanded;
  }

  /**
  * Applies the current filter type to the inventory data.
  */
  ApplyFilter() {
    this.filteredInventory = this.inventoryDetails.filter(item => {
      if (this.filterType === 'all') return true;
      if (this.filterType === 'low') return item.Available < 20;
      if (this.filterType === 'critical') return item.Available < 5;
      return true;
    });

    this.CalculateTotals();
  }

  /**
  * Calculates and updates the total stock, total available items,
  * and count of critical items (available < 5) for the current filtered inventory.
  */
  CalculateTotals() {
    this.totalStock = this.filteredInventory.reduce((sum, item) => sum + item.OnHand, 0);
    this.totalAvailable = this.filteredInventory.reduce((sum, item) => sum + item.Available, 0);
    this.criticalItems = this.filteredInventory.filter(item => item.Available < 5).length;
  }

  /**
  * Determines the CSS class for an inventory item based on its availability.
  * @param {any} item The inventory item to evaluate.
  * @returns {string} The appropriate CSS class: 'availability-critical', 'availability-low', or 'availability-normal'.
  */
  GetItemClass(item: InventoryDetails): string {
    if (item.Available < 0) return 'availability-critical';
    if (item.Available < 5) return 'availability-critical';
    if (item.Available < 20) return 'availability-low';
    return 'availability-normal';
  }


  /**
   * Determines the color to use for displaying availability information.
   * @param {number} available The available quantity to evaluate.
   * @returns {string} The color name: 'danger', 'warning', or 'primary'.
   */
  GetAvailabilityColor(available: number): string {
    if (available < 0) return 'danger';
    if (available < 5) return 'danger';
    if (available < 20) return 'warning';
    return 'primary';
  }

}       