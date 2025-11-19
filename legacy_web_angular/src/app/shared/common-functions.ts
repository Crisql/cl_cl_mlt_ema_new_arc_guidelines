import {IValidateLines} from "@app/interfaces/i-validate-lines";
import {IDocumentLine} from "@app/interfaces/i-items";
import {IUdf, IUdfContext, IUdfDevelopment, UdfInvoke, UdfSourceLine} from "@app/interfaces/i-udf";
import {DropdownElement, IInputColumn} from "@clavisco/table/lib/table.space";
import {IStockTransferRowsSelected} from "@app/interfaces/i-stockTransfer";
import {DocumentType, ListMaterial} from "@app/enums/enums";
import {IActionDocument} from "@app/interfaces/i-document-type";
import {CLToastType} from "@clavisco/alerts";
import {formatDate} from "@angular/common";
import {ACCOUNT_TYPE} from "@clavisco/payment-modal";
import {DropdownList} from "@clavisco/table";
import {DynamicsUdfPresentation} from "@clavisco/dynamics-udfs-presentation";
import IUdfValue = DynamicsUdfPresentation.Structures.Interfaces.IUdfValue;
import {BlanketAgreementDetail, IBlanketAgreements} from "@app/interfaces/i-blanket-agreements.ts";
import { IWithholdingTaxSelected } from "@app/interfaces/i-withholding-tax";

export function ValidateLines(_lines: IDocumentLine[], validateLotes: boolean = false, _validateTax: boolean = true): IValidateLines {

  let data: IValidateLines = {} as IValidateLines;

  if (_lines.length === 0) {
    data.Message = 'No se han ingresado líneas.';
    data.Value = false;
    return data;
  }

  let index;

  if (_validateTax) {
    index = _lines.findIndex(x => !x.TaxCode || x.TaxCode === '');

    if (index >= 0) {
      data.Message = `Ingrese el impuesto en la linea ${(index + 1)} del documento.`;
      data.Value = false;
      return data;
    }
  }


  index = _lines.findIndex(x => x.UnitPrice <= 0 && x.TreeType !== ListMaterial.iSalesTree && x.TreeType !== ListMaterial.iIngredient);

  if (index >= 0) {
    data.Message = `Ingrese el precio en la linea ${(index + 1)} del documento.`;
    data.Value = false;
    return data;
  }

  index = _lines.findIndex(x => x.Quantity <= 0);

  if (index >= 0) {
    data.Message = `Ingrese la cantidad en la linea ${(index + 1)} del documento.`;
    data.Value = false;
    return data;
  }

  if (validateLotes) {

    index = _lines.findIndex((x) => x.ManBtchNum.toUpperCase() === 'Y' && (!x.BatchNumbers || x.BatchNumbers.length === 0));

    if (index >= 0) {
      data.Message = `El item ${_lines[index].ItemCode} en la línea ${(index + 1)} es manejado por lotes, por favor ingrese la cantidad por lote, columna lote.`;
      data.Value = false;
      return data;

    }
  }



  data.Value = true;

  return data;

}

export function CLTofixed(_qtyDecimales: number, _amount: number): number {
  const DECS = (() => +`1${`0`.repeat(_qtyDecimales)}`)();
  const RESULT = Math.round((_amount) * DECS) / DECS;
  return RESULT;
}

/**
 * Maps UDF (User-Defined Fields) lines to table header columns, input columns, and dropdown columns.
 *
 * @param _udfsLines - Array of UDF context objects containing metadata for fields.
 * @param _headerTableColumns - Object mapping column names to their descriptions.
 * @param _inputsColumn - Array to hold input column configurations.
 * @param _dropdownColumns - Optional array to store column names that support dropdown values.
 */
export function MappingUdfsLines(
  _udfsLines: IUdfContext[],
  _headerTableColumns: { [key: string]: string },
  _inputsColumn: IInputColumn[],
  _dropdownColumns?: string[]
) {

  // Function to get the field type (FieldType)
  const getFieldType = (fieldType: string): 'number' | 'text' => {
    switch (fieldType) {
      case 'Int32':
        return 'number';

      case 'String':
      case 'Double':
      case 'DateTime':
        return 'text';
      default:
        return 'text';
    }
  };

  _udfsLines.map(item => {
    _headerTableColumns[item.Name] = item.Description;

    // Add column name to dropdown columns if it has values
    if (_dropdownColumns && (JSON.parse(item.Values) as UdfInvoke[])?.length) {
      if(!_dropdownColumns?.includes(item.Name)){
        _dropdownColumns.push(item.Name);
      }
    }else {
      const inputColumn: IInputColumn = {
        ColumnName: item.Name,
        FieldType: getFieldType(item.FieldType)
      };
      if(!_inputsColumn.some(input=> input.ColumnName == inputColumn.ColumnName && input.FieldType ==inputColumn.FieldType)){
        _inputsColumn.push(inputColumn);
      }
    }
  });
}

/**
 * Maps default (empty string) values to all user-defined fields (UDFs)
 * 
 * @param _value - The target object (such as a document line or selected row) where UDF values will be set.
 * @param _udfsLines - An array of user-defined field metadata to determine which properties to initialize.
 */
export function MappingDefaultValueUdfsLines(_value: IDocumentLine | IStockTransferRowsSelected | IWithholdingTaxSelected, _udfsLines: IUdfContext[]) {
  _udfsLines.forEach(element => {
    _value[element.Name] = '';
  });
}

export function GetUdfsLines(_value: any, _udfsLines: IUdfContext[]): IUdf[] {

  let udfs: IUdf[] = [];

  if (_udfsLines && _udfsLines.length > 0) {

    _udfsLines.forEach(element => {
      udfs.push({
        Name: element.Name,
        FieldType: element.FieldType,
        Value: _value[element.Name]
      } as IUdf);
    });

  }

  return udfs;
}

export function ValidateUdfsLines(_lines: any[], _udfsLines: IUdfContext[]): IValidateLines {
  let data: IValidateLines = {} as IValidateLines;
  data.Value = true;

  if (_lines && _lines.length > 0 && _udfsLines && _udfsLines.length > 0) {

    let i = -1;
    let prop: string = '';
    let data: IValidateLines = {} as IValidateLines;
    let columns = Object.keys(_lines[0])
      .filter(x => _udfsLines
        .some(y => y.Name === x));


    for (let index = 0; index < _lines.length; index++) {
      if (!_lines[index].TreeType || _lines[index].TreeType === '' || _lines[index].TreeType !== ListMaterial.iSalesTree) {
        for (let property of columns) {

          let value = _udfsLines.find(value => value.Name === property);

          if (value) {
            if (value.IsRequired && (!_lines[index][property] || _lines[index][property] === '')) {
              i = index;
              prop = property
              break;
            }
          }
        }
      }

    }

    let udfLine = _udfsLines.find(udf=> udf.Name == prop);

    if (i >= 0) {
      data.Message = `Ingrese el valor de ${udfLine?.Description} en la línea ${(i + 1)} del documento.`;
      data.Value = false;
      data.UdfLine = udfLine;
      return data;
    }
    data.Value = true;

  }
  return data;

}

export function MappingUdfsDevelopment<T>(_data: T, _udfs: IUdf[], _udfsDevelopment: IUdfDevelopment[]) {

  if (_udfsDevelopment && _udfsDevelopment.length > 0) {

    let properties = Object.entries(_data)
      .filter(([clave, valor]) => _udfsDevelopment.some(x => x.Key === clave && valor));

    if (properties && properties.length > 0) {

      for (const [clave, valor] of properties) {

        let udf = _udfsDevelopment.find(x => x.Key === clave);

        if (udf && !_udfs.some(x => x.Name === udf?.Name)) {
          _udfs.push({
            Name: udf.Name,
            FieldType: udf.FieldType,
            Value: valor
          } as IUdf)
        } else {
          let index = _udfs.findIndex(x => x.Name === udf?.Name);

          if (index >= 0) {
            _udfs[index] = {
              Name: udf?.Name,
              FieldType: udf?.FieldType,
              Value: valor
            } as IUdf;
          }
        }
      }

    }


  }
}

export function SetDataUdfsLines(_lines: IDocumentLine[] | IStockTransferRowsSelected[], _udfsSourceLines: UdfSourceLine[], _headerTableColumns: {
  [key: string]: string
}): void {

  if (_lines && _lines.length > 0 && _udfsSourceLines && _udfsSourceLines.length > 0) {

    _udfsSourceLines.forEach(udf => {
      let columns = Object.keys(_headerTableColumns)
        .filter(x => udf.Udf
          .some(y => y.Name === x));

      for (let property of columns) {
        const value = udf.Udf.find(value => value.Name === property);

        if (value) {
          _lines[+udf.Index][property] = value.Values;

        }
      }

    });
  }
}


export function ActionDocument(_controllerRequest: string, _isCopy = false): IActionDocument {

  let Action = {} as IActionDocument;
  if (!_isCopy) {
    switch (_controllerRequest) {
      case 'quotations':
        Action.typeDocument = DocumentType.Quotations;
        Action.controllerToSendRequest = 'Quotations';
        break;
      case 'orders':
        Action.typeDocument = DocumentType.Orders;
        Action.controllerToSendRequest = 'Orders';
        break;
      case 'invoices':
        Action.typeDocument = DocumentType.Invoices;
        Action.controllerToSendRequest = 'Invoices';
        break;
      case 'down-payments':
        Action.typeDocument = DocumentType.ArDownPayments;
        Action.controllerToSendRequest = 'DownPayments';
        break;
      case 'reserve-invoice':
        Action.typeDocument = DocumentType.Invoices;
        Action.controllerToSendRequest = 'Invoices';
        break;
      case 'delivery':
        Action.typeDocument = DocumentType.DeliveryNotes;
        Action.controllerToSendRequest = 'DeliveryNotes';
        break;
    }
  } else {
    Action.controllerToSendRequest = _controllerRequest;
    switch (_controllerRequest) {
      case 'Quotations':
        Action.typeDocument = DocumentType.Quotations;
        break;
      case 'Orders':
        Action.typeDocument = DocumentType.Orders;
        break;
      case 'Invoices':
        Action.typeDocument = DocumentType.Invoices;
        break;
      case 'reserve-invoice':
        Action.typeDocument = DocumentType.Invoices;
        break;
      case 'delivery':
        Action.typeDocument = DocumentType.DeliveryNotes;
    }

  }

  return Action;


}

export function GetIndexOnPagedTable(_itemsPeerPage: number, _currentIndex: number, _currentPage: number, _shouldPaginateRequest: boolean = false) {
  if (_shouldPaginateRequest) {
    return _currentIndex;
  }
  return _currentIndex + (_itemsPeerPage * _currentPage) - _itemsPeerPage;
}

export function FormatSalesAmount(_salesAmount: number): string {
  return _salesAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function CurrentDate(): string {
  return formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss a', 'en');
}

export function FormatDate(_date: string | Date): string {
  if (_date) {
    return formatDate(_date, 'yyyy-MM-dd', 'en');
  } else {
    return formatDate(new Date(), 'yyyy-MM-dd', 'en');
  }

}

/**
 * Function to map account type
 * @param _type
 * @constructor
 */
export function MapAccountType(_type: number): string {
  switch (_type) {
    case 1:
      return ACCOUNT_TYPE.CASH;
    case 2:
      return ACCOUNT_TYPE.CARD;
    case 3:
      return ACCOUNT_TYPE.TRANSFER;
    default:
      return ''
  }
}

export function ZoneDate(): string {
  return new Date().toLocaleString('en-US', {timeZone: 'America/Costa_Rica'})
}

/**
 * Function to add months to a date
 * @param fecha parameter date
 * @param months parameter months
 * @constructor
 */
export function AddMonths(_months: number) {
  let newDate = new Date();
  newDate.setMonth(newDate.getMonth() + _months);
  return newDate;
}

/**
 * Function to add days to a date
 * @param _fecha parameter date
 * @param _dias parameter days
 * @constructor
 */
export function AddDays(_dias: number) {
  let newDate = new Date();
  newDate.setDate(newDate.getDate() + _dias);
  return newDate;
}

/**
 * Maps UDF (User-Defined Fields) line values to a dropdown list structure.
 *
 * @param _udfsLines - Array of UDF context objects containing metadata and values for fields.
 * @param _item - Document line object containing details like identifier for differentiation.
 * @param _dropdownDiffList - Object to store dropdown values keyed by UDF field names.
 * @param _isStockTransfer - Indicates if is isStockTransfer
 */
export function SetUdfsLineValues(_udfsLines: IUdfContext[] , _item: IDocumentLine | IStockTransferRowsSelected | IWithholdingTaxSelected, _dropdownDiffList: DropdownList, _isStockTransfer: boolean = false ) {

  _udfsLines?.forEach(udfLine=>{
    if(udfLine.Values?.length){
      let mappedValues = JSON.parse(udfLine.Values) as UdfInvoke[];

      const dropdownElement = mappedValues.map(mappedValue => ({
        value: mappedValue.Description,
        key: mappedValue.Value,
        by: _isStockTransfer && 'IdBinLocation' in _item ? _item.IdBinLocation : _item.IdDiffBy,
      } as DropdownElement));

      _dropdownDiffList[udfLine.Name] = _dropdownDiffList[udfLine.Name] ? [..._dropdownDiffList[udfLine.Name], ...dropdownElement] : dropdownElement;

    }
  })

}


/**
 * Applies blanket agreements to a document line item, adjusting its pricing and discount based on predefined agreements.
 *
 * @param _blanketList - An array of blanket agreements to be applied. Each agreement contains methods and lines that define pricing rules.
 * @param _item - The document line item to which the blanket agreements will be applied. This includes properties like item code and currency.
 * @param _localCurrency - The local currency code used to determine if currency conversion is necessary.
 * @param _rate - The exchange rate used for currency conversion if the item's currency differs from the local currency.
 * @param _DecimalTotalDocument - The number of decimal places to use when rounding the calculated unit price.
 */
export function ApplyBlanketAgreements(
  _blanketList: IBlanketAgreements[],
  _item: IDocumentLine,
  _localCurrency: string,
  _rate: number,
  _DecimalTotalDocument: number
) {
  /**
   * Lista para acuerdos por articulo
   */
  const iBlanketAgreementItem:IBlanketAgreements[] = _blanketList.filter(value => value.Method === 'I');
  /**
   * Lista de acuerdos para tipo monetario
   */
  const iBlanketAgreementMoney:IBlanketAgreements[] = _blanketList.filter(value => value.Method === 'M');

  // #region Blanket Agreement Item Processing
  for (const _blanket of iBlanketAgreementItem) {
    if (_blanket.Lines.some(value => value.ItemCode === _item.ItemCode) && _blanket.Type === 'S') {
      const item:BlanketAgreementDetail |undefined = _blanket.Lines.find(value => value.ItemCode === _item.ItemCode);
      if (item) {
        const unitPrice = _localCurrency === (_item.Currency ?? '')
          ? item.UnitPrice : CLTofixed(_DecimalTotalDocument, item.UnitPrice * _rate);
        const unitPriceFC = _localCurrency !== _item.Currency
          ? item.UnitPrice : CLTofixed(_DecimalTotalDocument, item.UnitPrice / _rate);
        _item.UnitPrice = unitPrice;
        _item.UnitPriceFC = unitPriceFC;
        _item.UnitPriceCOL = unitPrice;
        _item.UnitPriceDOL = unitPriceFC;
        _item.DiscountPercent = 0;
        return;
      }
    }
  }
  // #endregion

  // #region Blanket Agreement Money Processing
  for (const _blanket of iBlanketAgreementMoney) {
    if (_blanket.Lines.some(value => _blanket.Type === 'S')) {
      _item.DiscountPercent = _item.UnitPrice !== 0 ? _blanket.Lines[0].Discount : 0;
      return;
    }
  }
  // #endregion
}


