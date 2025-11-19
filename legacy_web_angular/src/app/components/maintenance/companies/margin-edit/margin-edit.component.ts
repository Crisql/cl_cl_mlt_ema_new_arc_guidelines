import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {OverlayService} from "@clavisco/overlay";
import {AlertsService} from "@clavisco/alerts";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {IMargin} from "../../../../interfaces/i-settings";

@Component({
  selector: 'app-margin-edit',
  templateUrl: './margin-edit.component.html',
  styleUrls: ['./margin-edit.component.scss']
})
export class MarginEditComponent implements OnInit {
  marginForm!: FormGroup;
  modalTitle!: string;
  constructor(private overlayService: OverlayService,
              private alertsService: AlertsService,
              @Inject(MAT_DIALOG_DATA) public data: IMargin,
              private fb: FormBuilder,
              private matDialogRef: MatDialogRef<MarginEditComponent>) { }

  ngOnInit(): void {
    this.modalTitle = 'Configuración de márgenes';
    this.LoadForm();
    this.marginForm.patchValue(this.data);
  }
  LoadForm(): void {
    this.marginForm = this.fb.group({
      Table: [null],
      Description: [null],
      Margin: [null],
    });

  }

  Save(): void{
    this.matDialogRef.close(this.marginForm.value);
  }

}
