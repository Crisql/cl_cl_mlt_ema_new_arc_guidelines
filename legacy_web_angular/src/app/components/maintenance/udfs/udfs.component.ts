import {AfterViewInit, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {environment} from "@Environment/environment";
import {ActivatedRoute} from "@angular/router";
import {ISaleDocumentComponentResolvedData, IUdfResolvedData} from "@app/interfaces/i-resolvers";
import {IUdfGroupSetting} from "@app/interfaces/i-settings";


@Component({
  selector: 'app-udfs',
  templateUrl: './udfs.component.html',
  styleUrls: ['./udfs.component.scss']
})
export class UdfsComponent implements OnInit{
  apiUrl: string = environment.apiUrl;
  configureUdfGroup: boolean = false;
  constructor(private activatedRoute: ActivatedRoute,private changeDetector: ChangeDetectorRef) {

  }

  ngOnInit(): void {
    this.HandleResolvedData();
    this.changeDetector.detectChanges();
  }

  /**
   * Load initial data of resolver
   * @constructor
   */
  private HandleResolvedData(): void {
    this.activatedRoute.data
      .subscribe({
        next: (data) => {

          const resolvedData: IUdfResolvedData = this.activatedRoute.snapshot.data['UdfResolverData'];

          if (resolvedData) {
            this.configureUdfGroup = (JSON.parse(resolvedData.Setting.Json) as IUdfGroupSetting)?.ConfigureGroups;
          }
        }
      });
  }



}
