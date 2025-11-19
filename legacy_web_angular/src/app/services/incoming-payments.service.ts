import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {IPaymentForCancel} from "../interfaces/i-payment-for-cancel";
import {formatDate} from "@angular/common";
import {IIncomingPaymentDetail} from "../interfaces/i-payment-detail";
import {IIncomingPayment} from "../interfaces/i-incoming-payment";
import {DefineDescriptionHeader} from "@app/shared/shared.service";


@Injectable({
  providedIn: 'root'
})
export class IncomingPaymentsService {

  private readonly CONTROLLER: string = 'api/IncomingPayments';

  constructor(private http: HttpClient) {

  }

  GetDocForCancel(_cardCode: string, DateFrom: Date, DateTo: Date, _currency:string="", _docType:string=""): Observable<ICLResponse<IPaymentForCancel[]>> {
    let from = formatDate(DateFrom, 'yyyy-MM-dd', 'en');
    let to = formatDate(DateTo, 'yyyy-MM-dd', 'en');
    return this.http.get<ICLResponse<IPaymentForCancel[]>>(`${this.CONTROLLER}?DateFrom=${from}&DateTo=${to}&currency=${encodeURIComponent(_currency)}&type=${encodeURIComponent(_docType)}&CardCode=${encodeURIComponent(_cardCode)}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Documentos a cancelar obtenidos',
          OnError: 'No se pudo obtener los documentos a cancelar'
        })});
  }

  Cancel(_docEntry: number): Observable<ICLResponse<any>> {
    return this.http.post<ICLResponse<any>>(`${this.CONTROLLER}?DocEntry=${_docEntry}`, null);
  }

  GetPayDetail(_docEntry: number):Observable<ICLResponse<IIncomingPaymentDetail>>{
    return this.http.get<ICLResponse<IIncomingPaymentDetail>>(`${this.CONTROLLER}?DocEntry=${_docEntry}`,
      {headers: DefineDescriptionHeader({
          OnError: 'No se pudo obtener el detalle del pago',
          OnSuccess: 'Detalle de pago obtenido'
        })});

  }

  Post(_incomingPayment: IIncomingPayment): Observable<ICLResponse<IIncomingPayment>>{
    return this.http.post<ICLResponse<IIncomingPayment>>(`${this.CONTROLLER}`, _incomingPayment);
  }

}
