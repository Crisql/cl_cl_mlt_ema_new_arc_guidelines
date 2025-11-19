import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventViewerComponent } from './event-viewer.component';
import {AuthGuard} from "@app/guards/auth.guard";

export const routes: Routes = [
  {
    path: '',
    component: EventViewerComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventViewerRoutingModule { }
