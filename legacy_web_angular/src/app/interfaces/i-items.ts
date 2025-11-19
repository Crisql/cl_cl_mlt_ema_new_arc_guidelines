import {ItemBarCodeCollection} from "./i-barcode";
import {
  IBatchNumbers,
  IBinLocation,
  IDocumentLinesBinAllocations,
  ISerialNumbers
} from "./i-serial-batch";
import {IUoMMasterData} from "./i-uom-masterdata";
import {IUdf} from "@app/interfaces/i-udf";
import {RowColors} from "@clavisco/table";

export interface IItem {
  ItemCode: string;
  ItemName: string;
  TaxRate: number;
  UnitPrice: number;
  ItemClass: string;
  TypeAheadFormat: string;
  UoMEntry: number;
  UoMMasterData: IUoMMasterData[];
}

export interface IValidateInventoryTable {
  Table: string;
  Description: string;
}

export interface IItemMasterData extends IItem {
  ForeignName: string;
  BarCode: string;
  ItemPrices: ItemPrice[];
  Series: number;
  TaxCode: string;
  ItemBarCodeCollection: ItemBarCodeCollection[];
  Udfs: IUdf[];
}

export interface ItemPrice {
  PriceList: number;
  Price: number;
  Currency: string;
}

/**
 * Interfaz que describe una línea de documento.
 */
export interface IDocumentLine extends IItem {
  /**
   * Identificador único de la línea.
   */
  Id: number;

  /**
   * Ítem de inventario.
   */
  InventoryItem: string;

  /**
   * Ítem de compra.
   */
  PurchaseItem: string;

  /**
   * Ítem de venta.
   */
  SalesItem: string;

  /**
   * Entrada de documento.
   */
  DocEntry: string;

  /**
   * Código de almacén.
   */
  WarehouseCode: string;

  /**
   * Cantidad.
   */
  Quantity: number;

  /**
   * Porcentaje de descuento.
   */
  DiscountPercent: number;

  /**
   * Código de costeo.
   */
  CostingCode: string | null;

  /**
   * Total.
   */
  Total: number;

  /**
   * Descripción del ítem.
   */
  ItemDescription: string;

  /**
   * Segundo código de costeo.
   */
  CostingCode2: string | null;

  /**
   * Tercer código de costeo.
   */
  CostingCode3: string | null;

  /**
   * Cuarto código de costeo.
   */
  CostingCode4: string | null;

  /**
   * Quinto código de costeo.
   */
  CostingCode5: string | null;

  /**
   * Nombre de almacén.
   */
  WhsName: string;

  /**
   * Código de impuestos.
   */
  TaxCode: string;

  /**
   * Indica si es solo impuestos.
   */
  TaxOnly: string | boolean;

  /**
   * Precio unitario en moneda extranjera.
   */
  UnitPriceFC: number;

  /**
   * Precio unitario en moneda local.
   */
  UnitPriceCOL: number;

  /**
   * Precio unitario en dólares.
   */
  UnitPriceDOL: number;

  /**
   * Cantidad en mano.
   */
  OnHand: number;

  /**
   * Total de impuestos.
   */
  TotalImp: number;

  /**
   * Total de descuentos.
   */
  TotalDesc: number;

  /**
   * Total de impuestos en moneda extranjera.
   */
  TotalImpFC: number;

  /**
   * Total de descuentos en moneda extranjera.
   */
  TotalDescFC: number;

  /**
   * Total de impuestos en moneda local.
   */
  TotalImpCOL: number;

  /**
   * Total de descuentos en moneda local.
   */
  TotalDescCOL: number;

  /**
   * Total en moneda extranjera.
   */
  TotalFC: number;

  /**
   * Total en moneda local.
   */
  TotalCOL: number;

  /**
   * Número de línea.
   */
  LineNum: number;

  /**
   * Línea base.
   */
  BaseLine: number;

  /**
   * Entrada base.
   */
  BaseEntry: number | null;

  /**
   * Tipo base.
   */
  BaseType: number;

  /**
   * Último precio de compra.
   */
  LastPurchasePrice: number;

  /**
   * Último precio de compra en moneda extranjera.
   */
  LastPurchasePriceFC: number;

  /**
   * Datos maestros de UoM.
   */
  UoMMasterData: IUoMMasterData[];

  /**
   * Entrada de UoM.
   */
  UoMEntry: number;

  /**
   * Asignaciones de bin de líneas de documento.
   */
  DocumentLinesBinAllocations: IDocumentLinesBinAllocations[];

  /**
   * Números de serie.
   */
  SerialNumbers: ISerialNumbers[];

  /**
   * Números de lote.
   */
  BatchNumbers: IBatchNumbers[];

  /**
   * Número de lote manual.
   */
  ManBtchNum: string;

  /**
   * Número de serie manual.
   */
  ManSerNum: string;

  /**
   * Número de distribución.
   */
  DistNumber: string;

  /**
   * Código de bin.
   */
  BinCode: string;

  /**
   * Código de almacén de origen.
   */
  FromWarehouseCode: string;

  /**
   * Nombre de almacén de origen.
   */
  FromWhsName: string;

  /**
   * Ubicación de bin de origen.
   */
  BinLocationOrigin?: IBinLocation[];

  /**
   * Ubicación de bin de destino.
   */
  BinLocationDestino?: IBinLocation[];

  /**
   * Número de sistema.
   */
  SysNumber: number;

  /**
   * Identificador diferente por.
   */
  IdDiffBy: number;

  /**
   * Descripción de ítem Xml.
   */
  U_DescriptionItemXml: string;

  /**
   * Campos definidos por el usuario.
   */
  Udfs: IUdf[];

  /**
   * Tipo de árbol.
   */
  TreeType?: string;

  /**
   * Lista de materiales.
   */
  BillOfMaterial?: BillOfMaterial[];

  /**
   * Indica si está enfocado.
   */
  IsFocused?: boolean;

  /**
   * Código de cuenta.
   */
  AccountCode: string;

  /**
   * Ubicación de bin manual.
   */
  ManBinLocation?: string;

  /**
   * Color de fila.
   */
  RowColor?: string;

  /**
   * Código de padre.
   */
  FatherCode?: string;

  /**
   * Estado de la línea.
   */
  LineStatus: string;

  /**
   * Otras propiedades dinámicas.
   */
  [key: string]: any;

  /**
   * Moneda.
   */
  Currency?: string;

  /**
   * ID de moneda.
   */
  IdCurrency?: string;

  /**
   * Mensaje de fila.
   */
  RowMessage?: string;

  /**
   * Precio unitario bloqueado.
   */
  LockedUnitPrice: number;

  /**
   * Lista de monedas de líneas.
   */
  LinesCurrenciesList: ILinesCurrencies[];

  /**
   * Indica si la moneda no está definida.
   */
  CurrNotDefined?: boolean;

  /**
   * Cantidad original.
   */
  QuantityOriginal: number;

  /**
   * Ocultar componente.
   */
  HideComp?: string;

  /**
   * Tiene grupo.
   */
  HasGroup?: string;

  /**
   * Indica si se aplicó descuento.
   */
  HasDiscountApplied?: boolean;

  /**
   * Sujeto a IVA.
   */
  VATLiable?: string|number;

  /**
   * Represents the code of the ship to address
   */
  ShipToCode?: string;
}

export interface BillOfMaterial extends IDocumentLine {

}


export interface ItemsTransfer {
  ItemCode: string;
  ItemName: string;
  Barcode: string;
  ManSerNum: string;
  ManBtchNum: string;
  SysNumber: number;
  DistNumber: string;
  Stock: string;
  Typehead: string;
}

export interface ItemDetail {
  DocDate: Date;
  ItemCode: string;
  ItemDescription: string;
  TaxCode: string;
  WhsName: string;
  OnHand: number;
  Available: number;
  LastPurPrc: number;
  Comments: string;
  DocTotal: number;
  Price: number;
  Quantity: number;
  CardName: string;
  CardCode: string;

}


export interface IItemDataForInvoiceGoodReceipt {
  ItemCode: string;
  AVGPrice: number;
  LastPrice: number;
  DeviationStatus: number;
  Message: string;

}

export interface ILinesGoodReceip extends IDocumentLine {
  AVGPrice: number;
  DeviationStatus: number;
  Solicited: number;
  Message: string;
  BinAbsEntry : number;
}



export interface IWhInfoItem {
  OnHand: number;
}

export interface ILinesCurrencies {
  Id: string;
  DocCurrency: string;
  Description: string;
  Price: number;
}

export interface IValidateAttachmentsTable {
  Table: string;
  Description: string;
}

/**
 * Represents a table used for automatic printing validation.
 */
export interface IValidateAutomaticPrintingTable {
  /**
   * The name of the table to be validated for automatic printing.
   */
  Table: string;

  /**
   * A description of the table or its validation purpose.
   */
  Description: string;
}

export interface ItemSearchScan {
  ItemCode: string;
  ItemName: string;
  BarCode: string;
  TypeAheadFormat: string;
  DistNumberSerie: string;
  ManBtchNum: string;
  ManSerNum: string;
  SysNumber: number;
  DistNumberLote: string;
  BinCode: string;
  AbsEntry?: number;
  OnHand : number;
  DefaultWarehouse?: string;
}
