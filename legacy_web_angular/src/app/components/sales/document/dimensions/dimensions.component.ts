import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {IActionButton} from "@app/interfaces/i-action-button";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DropdownList, MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {ULineMappedColumns} from "@app/interfaces/i-document-type";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {IDimensions, IDimensionsSelected} from "@app/interfaces/i-dimensions";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {SharedService} from "@app/shared/shared.service";
import {Subscription} from "rxjs";
import {IRowByEvent} from "@clavisco/table/lib/table.space";
import {GetIndexOnPagedTable} from "@app/shared/common-functions";
import {IDistributionRules} from "@app/interfaces/i-distribution-rules";
import {CLPrint, Structures} from "@clavisco/core";

@Component({
  selector: 'app-dimensions',
  templateUrl: './dimensions.component.html',
  styleUrls: ['./dimensions.component.scss']
})
export class DimensionsComponent implements OnInit, OnDestroy {

  /* @clavisco/table*/
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  shouldPaginateRequest: boolean = false;
  dropdownColumns: string[] = ['DistributionRulesList'];
  dropdownDiffList: DropdownList = {};
  dropdownDiffBy: string = 'DimCode';
  lineTableId: string = 'LINE-TABLE-DIMENSIONS-ITEMS';
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  lineMappedColumns: MappedColumns;
  headerTableColumns: { [key: string]: string } = {
    DimCode: 'Codigo de Dimension',
    DimDesc: 'Descripcion',
    DistributionRulesList: 'Regla de Distribucion',
  };
  lineMappedDisplayColumns: ULineMappedColumns<IDimensions, IPermissionbyUser> = {
    dataSource: [] as IDimensions[],
    renameColumns: this.headerTableColumns,
    ignoreColumns: ['DimName', 'DimActive']
  }
  allSubscriptions: Subscription;

  /* Listas */
  lines: IDimensionsSelected[] = [];
  actionButtons: IActionButton[] = [];

  constructor(
    private sharedService: SharedService,
    @Inject('LinkerService') private linkerService: LinkerService,
    public dialogRef: MatDialogRef<DimensionsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDimensions[],
  ) {
    this.allSubscriptions = new Subscription();
    this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions.unsubscribe();
  }

  ngOnInit(): void {
    this.RegisterActionButtons();
    this.RegisterTableEvents();
    this.DefineLines();
    this.InflateTableLines();
    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );
  }

  public RegisterActionButtons(): void {
    this.actionButtons = [
      {
        Key: 'SAVE',
        MatIcon: 'save',
        Text: 'Guardar',
        MatColor: 'primary'
      },
      {
        Key: 'CANCELAR',
        MatIcon: 'cancel',
        Text: 'Cancelar',
        MatColor: 'primary'
      }
    ];
  }

  private RegisterTableEvents(): void {
    Register<CL_CHANNEL>(this.lineTableId, CL_CHANNEL.OUTPUT_3, this.EventColumn, this.callbacks);
  }

  public OnActionButtonClicked(_event: IActionButton): void {
    switch (_event.Key) {
      case 'SAVE':
        this.dialogRef.close(this.lines);
        break;
      case 'CANCELAR':
        this.dialogRef.close(null);
        break;
    }
  }

  private EventColumn = (_event: ICLEvent): void => {
    const ALL_RECORDS = JSON.parse(_event.Data) as IRowByEvent<IDimensionsSelected>;
    let rowSelected = ALL_RECORDS.Row;
    let INDEX = GetIndexOnPagedTable(ALL_RECORDS.ItemsPeerPage, ALL_RECORDS.RowIndex, ALL_RECORDS.CurrentPage + 1);
    if(this.lines[INDEX].DistributionRulesList === rowSelected.DistributionRulesList) {
      this.lines[INDEX].DistributionRulesList = rowSelected.DistributionRulesList;
    }
  }

  private DefineLines(): void {
    if (Array.isArray(this.data)) {
      this.lines = this.data.map((_line: IDimensions) => {
        this.DefineDropdownOptions(_line);
        return {
          DimCode: _line.DimCode,
          DimDesc: _line.DimDesc,
          DistributionRulesList: null
        } as IDimensionsSelected;
      });
    } else {
      console.error('this.data is not an array:', this.data);
      this.lines = [];
    }
  }



  private DefineDropdownOptions(_line: IDimensions): void {
    let options = _line.DistributionRulesList.map((_distributionRule: IDistributionRules) => ({
      key: _distributionRule.OcrCode,
      value: _distributionRule.OcrName,
      by: _line.DimCode
    }))
    if (!this.dropdownDiffList['DistributionRulesList']) {
      this.dropdownDiffList['DistributionRulesList'] = options;
    } else {
      this.dropdownDiffList['DistributionRulesList'] = [...this.dropdownDiffList['DistributionRulesList'], ...options];
    }
  }


  private InflateTableLines(): void {

    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.lines,
      RecordsCount: this.lines.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.lineTableId
    });

  }

}
