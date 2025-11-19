import { IUdfContext } from "./i-udf";

/**
 * Model for mapping required and non-required UDF lines
 */
export interface IValidateLines {
  Value: boolean;
  Message: string;
  UdfLine?: IUdfContext;
}
