import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { DocumentSearchPageRoutingModule } from "./document-search-routing.module";

import { DocumentSearchPage } from "./document-search.page";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DocumentSearchPageRoutingModule,
    TranslateModule,
  ],
  declarations: [DocumentSearchPage],
})
export class DocumentSearchPageModule {}
