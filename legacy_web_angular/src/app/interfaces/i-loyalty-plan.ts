export interface ILoyaltyPlan {
  Lealto: ILealtoConfigBase;
  Tapp: ITappConfigBase;
}


export interface ILealtoConfig {
  Ambiente: string;
  CompanyId: number;
  Active: boolean;
  ApiKey: string;
  User: string;
  Password: string;
  Token: string;
  IdSucursal: number;
  Card: IPlanCard;
}

export interface ILealtoConfigBase {
  UrlBase: string;
  UrlLogin: string;
  UrlConfigCompany: string;
  UrlPoints: string;
  UrlUser: string;
  UrlAccumulationPoints: string;
  UrlRedimirPoints: string;
  UrlCancelarTransaccion: string;
  LealtoConfigs: ILealtoConfig[];
}

export interface IPlanCard {
  Id: number;
  CardNumber: number;
  Valid: string;
  Account: string;
  Voucher: number;
  Owner: number;
}

export interface ITappConfigBase {
  Url: string;
  TappConfigs: ITappConfig[];
}

export interface ITappConfig {
  CompanyId: number;
  Active: boolean;
  Token: string;
  Register: string;
  Store: string;
  Card: IPlanCard;
}

export interface IInfoRedeemPointsUI {
  puntos_disponibles_sin_bloqueo: number;
}

export interface IInfoAccumulatedPointsDataUI {
  puntos_disponibles: number;
}

/*MODELO A ENVIAR AL API CUANDO SE ACUMULAN PUNTOS*/
export interface IInvoicePointsBase {
  id_usuario: number;
  id_sucursal: number;
  monto: number;
  numero_factura: string;
  factura_obj: IFacturaObj;
}

export interface IFacturaObj {
  numero_factura: string;
  subtotal: number;
  impuestos: number;
  total: number;
  fecha: string;
  lineas_factura: ILineasFactura[];
}

export interface ILineasFactura {
  sku_producto: string;
  nombre_producto: string;
  impuestos_producto: number;
  precio_producto: number;
  cantidad_producto: number;
}

/*MODELO A E ENVIAR AL API CUANDO SE REDIMEN PUNTOS*/
export interface IInvoiceRedeemPoint extends IInvoicePointsBase {
  id_solicitud_canjeo: number | null;
}

/*ENVIAR A TAPP*/
export interface ITappCloseInvoice {

  tapp_bridge_id: string;
  invoice_id: string;
  invoiceDate: string;
  pos_user_id: string;
  invoice_amount: number;
  redeemed_points: number;
  products: IProductsTapp[];
  rewards_given: number[];
}

export interface IProductsTapp{
  product_code: string;
  product_description: string;
  quantity: number;
  subtotal: number;
}

export interface ITappResponse {
  pos_process: any;
  pos_session: any;
  message: string;
  error_code: number;
  tapp_customer_points: number;
  tapp_given_points: number;
}
