import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ICLResponse } from "../models/responses/response";
import { LocalStorageService } from "./local-storage.service";
import { LocalStorageVariables } from "../common/enum";
import { ICompany } from "../models/db/companys";
import { IFormatDocument } from "../interfaces/i-format-document";
import { IPrintFormatZPLOffline, IPrintFormatZPLOfflineToSync } from "../interfaces/i-print";


@Injectable({
    providedIn: 'root'
})
export class PrintFormatService {

    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService
    ) {
    }

    /**
     * This is used to obtained the format to print
     * @param _docEntry
     * @constructor
     */
    GetPrintFormatPayment(_docEntry: number): Observable<ICLResponse<IFormatDocument>> {
        let company: ICompany = this.localStorageService.get(LocalStorageVariables.SelectedCompany);
        let companyId = company?.Id ?? 0;
        let baseUrl = this.localStorageService.get(LocalStorageVariables.ApiURL);
        return this.http.get<ICLResponse<IFormatDocument>>(`${baseUrl}api/PrintFormats/${companyId}/paymentReceivedToPrint?DocEntry=${_docEntry}`);
    }

    /**
     * This method is used to obtained the format to print document
     * @param _docEntry represent internal number
     * @param preliminarEntry represent prelimniary number
     * @param _documentType represent type document
     * @param _payTotal represent el payment total
     * @param _clave represent this clave FE
     * @constructor
     */
    GetDocumentPrintFormat(_docEntry: number, preliminarEntry: number, _documentType: number, _payTotal: number, _clave: string): Observable<ICLResponse<IFormatDocument>> {
        let baseUrl = this.localStorageService.get(LocalStorageVariables.ApiURL);
        return this.http.get<ICLResponse<IFormatDocument>>(`${baseUrl}api/PrintFormats/DocumentToPrint?docEntry=${_docEntry}&preliminarEntry=${preliminarEntry}&documentType=${_documentType}&clave=${_clave}&payTotal=${_payTotal}`);
    }

    /**
     * This method is used to get format ZPL cash closing
     * @param _id 
     * @returns 
     */
    GetCashClosingPrint(_id: number): Observable<ICLResponse<IFormatDocument>> {
        let baseUrl = this.localStorageService.get(LocalStorageVariables.ApiURL);
        return this.http.get<ICLResponse<IFormatDocument>>(`${baseUrl}api/PrintFormats/CashClosingToPrint?id=${_id}`);
    }

     /**
     * This method is used to obtained the format to print document offline 
     * @constructor
     */
    GetPrintFormatZPLOffline(): Observable<ICLResponse<IPrintFormatZPLOfflineToSync>> {
        let baseUrl = this.localStorageService.get(LocalStorageVariables.ApiURL);
        return this.http.get<ICLResponse<IPrintFormatZPLOfflineToSync>>(`${baseUrl}api/PrintFormats/PrintFormatZPLOffline`);
    }
}