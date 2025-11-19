/**
 * Class representing an object in SAP.
 */
export interface IObjectSap {
  /**
   * Unique code of the object.
   */
  ObjectCode: string;

  /**
   * Name of the table associated with the object.
   */
  TableName: string;

  /**
   * Description of the table associated with the object.
   */
  TableDescription: string
}

export interface IDocumentSerie extends  IObjectSap{
  Document: string,
  Type: string,
  Serie: string
}
