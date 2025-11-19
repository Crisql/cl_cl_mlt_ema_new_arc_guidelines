import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttachmentFilesComponent } from './attachment-files.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [AttachmentFilesComponent],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    FormsModule
  ],
  exports: [AttachmentFilesComponent]
})
export class AttachmentFilesModule { }
