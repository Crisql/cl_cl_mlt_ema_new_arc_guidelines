import { NgModule } from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatDialogModule} from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatCardModule} from '@angular/material/card';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatExpansionModule} from '@angular/material/expansion';
import { ActionButtonsComponent } from './action-buttons/action-buttons.component';
import { MatChipsModule  } from '@angular/material/chips';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatRadioModule} from '@angular/material/radio';
import {MatDividerModule} from '@angular/material/divider';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatMenuModule} from "@angular/material/menu";
import {MatNativeDateModule} from "@angular/material/core";
import {AgmCoreModule} from "@agm/core";
import {HourFormatPipe} from "@app/pipes/hour-format.pipe";
import {RouteCalculationsPipe} from "@app/pipes/route-calculations.pipe";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {NotificationCenterModule} from "@clavisco/notification-center";
import {SyncDocumentStatusNamePipe} from "@app/pipes/sync-document-status-name.pipe";

@NgModule({
  declarations: [
    ActionButtonsComponent,
    HourFormatPipe,
    RouteCalculationsPipe,
    SyncDocumentStatusNamePipe
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatListModule,
    MatToolbarModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTabsModule,
    MatGridListModule,
    DragDropModule,
    MatCardModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatChipsModule,
    MatDatepickerModule,
    MatRadioModule,
    MatDividerModule,
    MatTooltipModule,
    MatMenuModule,
    MatNativeDateModule,
    AgmCoreModule.forRoot(),
    NotificationCenterModule
  ],
  exports: [
    MatDialogModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatListModule,
    MatToolbarModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTabsModule,
    MatGridListModule,
    DragDropModule,
    MatCardModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatChipsModule,
    MatDatepickerModule,
    MatRadioModule,
    MatDividerModule,
    MatTooltipModule,
    MatMenuModule,
    MatNativeDateModule,
    ActionButtonsComponent,
    AgmCoreModule,
    HourFormatPipe,
    RouteCalculationsPipe,
    ScrollingModule,
    NotificationCenterModule,
    SyncDocumentStatusNamePipe
  ]
})
export class SharedModule { }
