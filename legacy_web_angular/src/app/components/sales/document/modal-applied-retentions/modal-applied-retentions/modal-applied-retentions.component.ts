import {Component, Inject, OnInit} from '@angular/core';
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {DropdownList, IInputColumn, IRowByEvent, MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {ULineMappedColumns} from "@app/interfaces/i-document-type";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {IWithholdingTax, IWithholdingTaxSelected} from "@app/interfaces/i-withholding-tax";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Subscription} from "rxjs";
import {CLPrint, Structures} from "@clavisco/core";
import {IActionButton} from "@app/interfaces/i-action-button";
import {SharedService} from "@app/shared/shared.service";
import {CheckboxColumnSelection} from "@app/interfaces/i-table-data";
import {GetIndexOnPagedTable, MappingDefaultValueUdfsLines, MappingUdfsLines, SetUdfsLineValues, ValidateUdfsLines} from "@app/shared/common-functions";
import { IWithholdingTaxDialogData } from '@app/interfaces/i-dialog-data';
import { AlertsService, CLToastType } from '@clavisco/alerts';

@Component({
  selector: 'app-modal-applied-retentions',
  templateUrl: './modal-applied-retentions.component.html',
  styleUrls: ['./modal-applied-retentions.component.scss']
})
export class ModalAppliedRetentionsComponent implements OnInit {
  //#region Table Retentions
  appliedRetentionsTableId: string = 'APPLIED-RETENTIONS-TABLE-ID';
  shouldPaginateRequest: boolean = false;
  checkboxColumns: string[] = ['Selected'];
  dropdownDiffBy: string = 'IdDiffBy';
  dropdownDiffList: DropdownList = {};
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };

  lineMappedColumns: MappedColumns;

  headerTableColumns: { [key: string]: string } = {
    Selected: 'Seleccionar',
    WTCode: 'Código',
    WTName: 'Descripción',
    Rate: 'Tasa',
    PrctBsAmnt: '% Importe base'
  };

  inputColumns: IInputColumn[] = [];

  dropdownColumns: string[] = [];

  lineMappedDisplayColumns: ULineMappedColumns<IWithholdingTax, IPermissionbyUser> = {
    dataSource: [] as IWithholdingTax[],
    renameColumns: this.headerTableColumns,
    ignoreColumns: ["BaseType","IdDiffBy","WithholdingType"],
    inputColumns: this.inputColumns
  };

  //#endregion

  allSubscriptions: Subscription;

  /* Lists */
  linesWithholdingTax: IWithholdingTaxSelected[] = [];
  linesWithholdingTaxSelected: IWithholdingTaxSelected[] = [];
  actionButtons: IActionButton[] = [
    {
      Key: 'SAVE',
      MatIcon: 'save',
      Text: 'Continuar',
      MatColor: 'primary'
    },
    {
      Key: 'CLOSE',
      MatIcon: 'cancel',
      Text: 'Cancelar',
      MatColor: 'primary'
    }
  ];

  constructor(
    @Inject('LinkerService') private linkerService: LinkerService,
    @Inject(MAT_DIALOG_DATA) public data: IWithholdingTaxDialogData,
    public dialogRef: MatDialogRef<ModalAppliedRetentionsComponent>,
    private sharedService: SharedService,
    private alertsService: AlertsService
  ) {
    this.allSubscriptions = new Subscription();
    this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
  };

  ngOnInit(): void {
    Register<CL_CHANNEL>(this.appliedRetentionsTableId, CL_CHANNEL.OUTPUT_3, this.OnTableItemActivated, this.callbacks);
    
    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );

    this.DefineLines();
    this.InflateTableLines();
  };

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions.unsubscribe();
  };

  /**
   * This method sets or identifies the logic to be performed after interacting with a modal button.
   * */
  public OnActionButtonClicked(_event: IActionButton): void {
    switch (_event.Key) {
      case 'SAVE':
        if(!this.ValidateUdfsLines()) return

        this.dialogRef.close(this.linesWithholdingTaxSelected);
        break;
      case 'CLOSE':
        this.dialogRef.close(null);
        break;
    }
  };

  /**
   * This method establishes or sets the value of the tax withholding lines.
   * */
  private DefineLines(): void {
    if (Array.isArray(this.data?.AvailableWithholdingTax)) {
      this.linesWithholdingTax = this.data?.AvailableWithholdingTax.map((_line: IWithholdingTax, index: number) => {
        const selectedWithholding = this.data.SelectedWithholdingTax?.find(sel => sel.WTCode === _line.WTCode);
        let line = {
          ...selectedWithholding,
          Selected: selectedWithholding?.Selected ?? false,
          WTCode: _line?.WTCode,
          WTName: _line?.WTName,
          BaseType: _line.BaseType,
          Rate: _line?.Rate,
          PrctBsAmnt: _line?.PrctBsAmnt,
          IdDiffBy: index,
          WithholdingType: _line.WithholdingType
        } as IWithholdingTaxSelected;

        if (this.data.UdfsWithholding?.length) {
          SetUdfsLineValues(this.data.UdfsWithholding, line, this.dropdownDiffList);

          //If it does not correspond to a selected retention, the UDFs are initialized.
          if(!selectedWithholding){
            MappingDefaultValueUdfsLines(line, this.data.UdfsWithholding);
          }
        }

        if(line.Selected){
          this.linesWithholdingTaxSelected.push(line);
        }

        return line;
      });
    } else {
      this.linesWithholdingTax = [];
    }


    // Load udfs fields in table
    if (this.data.UdfsWithholding?.length > 0) {
        MappingUdfsLines(this.data.UdfsWithholding, this.headerTableColumns, this.inputColumns, this.dropdownColumns);
        this.lineMappedDisplayColumns.renameColumns = this.headerTableColumns;
        this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
      }

  };

  /**
   * This method sets or updates the value of the tax withholding lines in the table.
   * */
  private InflateTableLines(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.linesWithholdingTax,
      RecordsCount: this.linesWithholdingTax.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.appliedRetentionsTableId
    });
  };


  /**
   * This method handles events on the table fields
   * @param _event 
   */

  public OnTableItemActivated = (_event: ICLEvent): void => {
      try {
        let data = JSON.parse(_event.Data) as IRowByEvent<IWithholdingTaxSelected>;

        let INDEX = GetIndexOnPagedTable(data.ItemsPeerPage, data.RowIndex, data.CurrentPage + 1, this.shouldPaginateRequest);

        /**They are commented out because the events are not used but could be implemented.*/
        /*switch (data.EventName) {
          case 'Checkbox':
            
            break;
          case 'Dropdown':

            break;
          case 'InputField':
  
            break;
        }*/

        this.linesWithholdingTax[INDEX] = data.Row;

        this.linesWithholdingTaxSelected = this.linesWithholdingTax
              .filter(withholding => withholding.Selected);
        this.InflateTableLines();

      } catch (error) {

      }
    }


    /**
     * Validate values of udfs required
     * @returns 
     */
    private ValidateUdfsLines(): boolean {
    
        let data = ValidateUdfsLines(this.linesWithholdingTaxSelected, this.data.UdfsWithholding);
    
        if (!data.Value) {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: `Ingrese el valor del campo ${data.UdfLine?.Description || '--'} para continuar`
          });
          return false;
        }
    
        return true;
      }
}
