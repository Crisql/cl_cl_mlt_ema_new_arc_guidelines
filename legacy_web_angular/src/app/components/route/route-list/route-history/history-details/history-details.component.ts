import {Component, Inject, OnInit} from '@angular/core';
import {IRouteHistory} from "@app/interfaces/i-route";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-history-details',
  templateUrl: './history-details.component.html',
  styleUrls: ['./history-details.component.scss']
})
export class HistoryDetailsComponent implements OnInit {

  routeHistory!: IRouteHistory;
  constructor(@Inject(MAT_DIALOG_DATA) private data: IRouteHistory) { }

  ngOnInit(): void {
    this.routeHistory = this.data;
  }

}
