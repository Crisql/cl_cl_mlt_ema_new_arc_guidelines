import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DocumentSearchPage } from './document-search.page';

const routes: Routes = [
  {
    path: '',
    component: DocumentSearchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentSearchPageRoutingModule {}
