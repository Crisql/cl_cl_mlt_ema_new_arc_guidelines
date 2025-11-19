import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FrequenciesRoutingModule } from './frequencies-routing.module';
import { FrequenciesComponent } from './frequencies.component';
import {SharedModule} from "@app/shared/shared.module";
import {LinkerService} from "@clavisco/linker";
import {TableModule} from "@clavisco/table";
import { EditFrequencyComponent } from './edit-frequency/edit-frequency.component';


@NgModule({
  declarations: [
    FrequenciesComponent,
    EditFrequencyComponent
  ],
  imports: [
    CommonModule,
    FrequenciesRoutingModule,
    SharedModule,
    TableModule
  ],
  providers: [
    {
      provide: 'LinkerService',
      useExisting: LinkerService
    }
  ]
})
export class FrequenciesModule { }
