import {Component, Input, OnInit} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {IDiscountHierarchy} from "@app/interfaces/i-discount-hierarchy";
import {ActivatedRoute, Router} from "@angular/router";
import {IDiscountHierarchiesResolvedData} from "@app/interfaces/i-resolvers";
import {IActionButton} from "@app/interfaces/i-action-button";

@Component({
  selector: 'app-discount-hierarchies',
  templateUrl: './discount-hierarchies.component.html',
  styleUrls: ['./discount-hierarchies.component.scss']
})
export class DiscountHierarchiesComponent implements OnInit {

  @Input()
  discountHierarchies: IDiscountHierarchy[] = [];
  constructor() { }

  ngOnInit(): void {
  }

  /**
   * Handles the drop event when dragging and dropping an item within the discount hierarchy
   * @param event - Object containing information about the drag-and-drop
   * @constructor
   */
  OnDropHierarchyDiscount(event: CdkDragDrop<IDiscountHierarchy>): void {
    moveItemInArray(this.discountHierarchies, event.previousIndex, event.currentIndex);
    this.discountHierarchies.forEach((d, i) => {
      d.Hierarchy = i+1;
    });
  }
  OnActivateHierarchyDiscount(_discount: IDiscountHierarchy): void {
    _discount.IsActive = !_discount.IsActive;
  }
}
