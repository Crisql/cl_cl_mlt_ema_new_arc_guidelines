import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IBPAddresses } from '@app/interfaces/i-business-partner';

@Component({
  selector: 'app-address-datails',
  templateUrl: './address-datails.component.html',
  styleUrls: ['./address-datails.component.scss']
})
export class AddressDatailsComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: IBPAddresses,
    private dialogRef: MatDialogRef<AddressDatailsComponent>) { }

  ngOnInit(): void {
  }

  /**
   * This method is used to close the dialog
   */
  CloseDialog(): void {
    this.dialogRef.close();
  }
}
