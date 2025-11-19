import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { LocalStorageVariables } from "src/app/common/enum";
import {
    ApiResponse,
    ICashDeskClosingLine,
    DocumentSearchMobileModel,
    ISearch,
    MobilePayment,
} from "src/app/models";
import { LocalStorageService } from "./local-storage.service";
import {
    IDocumentTypeLabel,
    MobInvoiceWithPayment, DocumentDraftSearchMobileModel
} from "src/app/models/db/Doc-model";
import { ICLResponse } from "../models/responses/response";
import {
    IARInvoice, ICreditNotes,
    IDeliveryNotes,
    IDownInvoiceWithPayment,
    IIncomingPayment,
    ISalesOrder,
    ISalesQuotation
} from "../interfaces/i-documents";
import { IPaymentResult } from "../models/i-payment-result";
import { IPrintPreview } from "../interfaces/i-print";
import { ISearchDocToPayment } from "../interfaces/i-searcDocToPayment";
import { ISalesDocumentSearch } from "../interfaces/i-sales-documentSearch";
import {IOfflineDocument} from "../models/db/i-offline-document";
import {IDownPaymentClosed, IInvoiceOpen} from "../interfaces/i-invoice-payment";
import { IDocumentAttachment } from "../interfaces/i-document-attachment";

@Injectable({
    providedIn: "root",
})
export class DocumentService {
    constructor(
        private http: HttpClient,
        private translateService: TranslateService,
        private localStorageService: LocalStorageService
    ) {
    }

     /**
     * Creates a new sales quotation using the provided document data.
     * @param _document Sales quotation data.
     * @param _attachment Optional attachment metadata.
     * @param _attachmentFiles Optional list of attached files.
     * @returns API response with the created quotation.
     */
    CreateQuotation(_document: ISalesQuotation, _attachment?: IDocumentAttachment, _attachmentFiles?: File[]): Observable<ICLResponse<ISalesQuotation>> {
        let formData = new FormData();
        formData.append('Document', JSON.stringify(_document));
        formData.append('Attachment', JSON.stringify(_attachment));

        _attachmentFiles?.forEach(attF => formData.append(attF.name, attF));

        return this.http.post<ICLResponse<ISalesQuotation>>(`api/Quotations`, formData);
    }

     
    /**
     * Updates an existing sales quotation.
     * @param _document Sales quotation data to update.
     * @param _attachment Optional attachment metadata.
     * @param _attachmentFiles Optional list of attached files.
     * @returns API response with the updated quotation.
     */
    UpdateQuotation(_document: ISalesQuotation, _attachment?: IDocumentAttachment, _attachmentFiles?: File[]): Observable<ICLResponse<ISalesQuotation>> {
        let formData = new FormData();
        formData.append('Document', JSON.stringify(_document));
        formData.append('Attachment', JSON.stringify(_attachment));

        _attachmentFiles?.forEach(attF => formData.append(attF.name, attF));

        return this.http.patch<ICLResponse<ISalesQuotation>>(`api/Quotations`, formData);
    }


    /**
     * Creates a new sales order using the provided document data.
     * @param _document Sales order data.
     * @param _attachment Optional attachment metadata.
     * @param _attachmentFiles Optional list of attached files.
     * @returns API response with the created order.
     */
    CreateOrder(_document: ISalesOrder, _attachment?: IDocumentAttachment, _attachmentFiles?: (File | Blob)[]): Observable<ICLResponse<ISalesOrder>> {
        let formData = new FormData();
        formData.append('Document', JSON.stringify(_document));
        formData.append('Attachment', JSON.stringify(_attachment));

        _attachmentFiles.forEach(file=>{
            if((file instanceof File || Object.prototype.toString.call(file) === '[object File]')){
                formData.append((file as any).name, file);


            }else if((file instanceof Blob || Object.prototype.toString.call(file) === '[object Blob]')){ //las firmas de manejan como blob y para que el archivo lo tome el api se debe de enviar asi
                formData.append("files", file, (file as any).name);
            }
        })
     
        return this.http.post<ICLResponse<ISalesOrder>>(`api/Orders`, formData);
    }

   
    /**
     * Updates an existing sales order.
     * @param _document Sales order data to update.
     * @param _attachment Optional attachment metadata.
     * @param _attachmentFiles Optional list of attached files.
     * @returns API response with the updated order.
     */
    UpdateOrder(_document: ISalesOrder, _attachment?: IDocumentAttachment, _attachmentFiles?: File[]): Observable<ICLResponse<ISalesOrder>> {
        let formData = new FormData();
        formData.append('Document', JSON.stringify(_document));
        formData.append('Attachment', JSON.stringify(_attachment));

        _attachmentFiles?.forEach(attF => formData.append(attF.name, attF));

        return this.http.patch<ICLResponse<ISalesOrder>>(`api/Orders`, formData);
    }

    /**
     * Creates a new invoice document.
     * @param _document Invoice data to be created.
     * @param _attachment Optional metadata for file attachments.
     * @param _attachmentFiles Optional list of attached files.
     * @returns API response with the created invoice.
     */
    CreateInvoice(_document: IARInvoice, _attachment?: IDocumentAttachment, _attachmentFiles?: File[]): Observable<ICLResponse<IARInvoice>> {
        let formData = new FormData();
        formData.append('Document', JSON.stringify(_document));
        formData.append('Attachment', JSON.stringify(_attachment));

        _attachmentFiles?.forEach(attF => formData.append(attF.name, attF));

        return this.http.post<ICLResponse<IARInvoice>>(`api/Invoices`, formData);
    }

    /**
     * Creates a new invoice with payment.
     * @param _document Invoice and payment data.
     * @param _attachment Optional metadata for file attachments.
     * @param _attachmentFiles Optional list of attached files.
     * @returns API response with the created invoice and payment.
     */
    CreateInvoiceWithPayment(_document: MobInvoiceWithPayment, _attachment?: IDocumentAttachment, _attachmentFiles?: File[]): Observable<ICLResponse<MobInvoiceWithPayment>> {
        let formData = new FormData();
        formData.append('Document', JSON.stringify(_document));
        formData.append('Attachment', JSON.stringify(_attachment));

        _attachmentFiles?.forEach(attF => formData.append(attF.name, attF));

        return this.http.post<ICLResponse<MobInvoiceWithPayment>>(`api/InvoicesWithPayment`, formData);
    }

    /**
     * Creates a reserve invoice with payment.
     * @param _document Reserve invoice and payment data.
     * @param _attachment Optional metadata for file attachments.
     * @param _attachmentFiles Optional list of attached files.
     * @returns API response with the created reserve invoice and payment.
     */
    CreateReserveInvoiceWithPayment(_document: MobInvoiceWithPayment, _attachment?: IDocumentAttachment, _attachmentFiles?: File[]): Observable<ICLResponse<MobInvoiceWithPayment>> {
        let formData = new FormData();
        formData.append('Document', JSON.stringify(_document));
        formData.append('Attachment', JSON.stringify(_attachment));

        _attachmentFiles?.forEach(attF => formData.append(attF.name, attF));

        return this.http.post<ICLResponse<MobInvoiceWithPayment>>(`api/ReserveInvoiceWithPayment`, formData);
    }

    /**
     * Creates a delivery note document.
     * @param _document Delivery note data to be created.
     * @param _attachment Optional metadata for file attachments.
     * @param _attachmentFiles Optional list of attached files.
     * @returns API response with the created delivery note.
     */
    CreateDelivery(_document: IDeliveryNotes, _attachment?: IDocumentAttachment, _attachmentFiles?: File[]): Observable<ICLResponse<IDeliveryNotes>> {
        let formData = new FormData();
        formData.append('Document', JSON.stringify(_document));
        formData.append('Attachment', JSON.stringify(_attachment));

        _attachmentFiles?.forEach(attF => formData.append(attF.name, attF));

        return this.http.post<ICLResponse<IDeliveryNotes>>(`api/DeliveryNotes`, formData);
    }
    
    /**
     * Creates a credit note document.
     * @param _document Credit note data to be created.
     * @param _attachment Optional metadata for file attachments.
     * @param _attachmentFiles Optional list of attached files.
     * @returns API response with the created credit note.
     */
    CreateCreditNotes(_document: ICreditNotes, _attachment?: IDocumentAttachment, _attachmentFiles?: File[]): Observable<ICLResponse<ICreditNotes>> {
        let formData = new FormData();
        formData.append('Document', JSON.stringify(_document));
        formData.append('Attachment', JSON.stringify(_attachment));

        _attachmentFiles?.forEach(attF => formData.append(attF.name, attF));

        return this.http.post<ICLResponse<ICreditNotes>>(`api/CreditNotes`, formData);
    }

    /**
     * Creates an incoming payment for invoice cancellation.
     * @param invoicesToCancel Payment details related to invoices.
     * @returns API response with the created incoming payment.
     */
    CreateIncommingPayment(invoicesToCancel: IIncomingPayment): Observable<ICLResponse<IIncomingPayment>> {
        return this.http.post<ICLResponse<IIncomingPayment>>(`api/IncomingPayments`, invoicesToCancel);
    }

    /**
     * Creates an account payment from mobile app.
     * @param payment Mobile payment data.
     * @returns API response with the payment result.
     */
    CreateAccountPayment(payment: MobilePayment): Observable<ICLResponse<IPaymentResult>> {
        return this.http.post<ICLResponse<IPaymentResult>>(`api/IncomingPayments`, payment);
    }

    /**
     * Sends offline documents to the remote server.
     * @param _documents Array of offline documents to sync.
     * @returns API response with synced documents.
     */
    SendOfflineDocuments(_documents: IOfflineDocument[]): Observable<ICLResponse<IOfflineDocument[]>> 
    {
        return this.http.post<ICLResponse<IOfflineDocument[]>>('api/SyncDocuments', _documents);
    }

    /**
     * Retrieves documents available for payment.
     * @param docSearch Search filter for documents.
     * @param _page Pagination page number.
     * @param _pageSize Pagination page size.
     * @returns API response with documents to pay.
     */
    GetDocumentsToPay(docSearch: DocumentSearchMobileModel, _page: number = 0, _pageSize: number = 5): Observable<ICLResponse<ISearchDocToPayment[]>> {
        const headers = new HttpHeaders({
            "Cl-Sl-Pagination-Page": `${_page}`,
            "Cl-Sl-Pagination-Page-Size": `${_pageSize}`
        });
        let endPoint: string = `api/Invoices?CardCode=${docSearch.CardCode}&DocCurrency=${docSearch.DocCur}&DateInit=${docSearch.StartDate}&DateEnd=${docSearch.EndDate}`;
        return this.http.get<ICLResponse<ISearchDocToPayment[]>>(endPoint, { headers });
    }

    /**
     * Retrieves sales documents with filters and pagination.
     * @param docSearch Search filter parameters.
     * @param _endpoint API endpoint name.
     * @param _page Pagination page number.
     * @param _pageSize Pagination page size.
     * @returns API response with matching sales documents.
    */
    GetDocuments(docSearch: DocumentSearchMobileModel, _endpoint: string, _page: number, _pageSize: number): Observable<ICLResponse<ISalesDocumentSearch[]>> {
        const headers = new HttpHeaders({
            'Cl-Sl-Pagination-Page': `${_page}`,
            'Cl-Sl-Pagination-Page-Size': `${_pageSize}`
        });
        let endPoint: string = `api/${_endpoint}?SlpCode=${docSearch.SlpCode}&DateInit=${docSearch.StartDate}&DateEnd=${docSearch.EndDate}&DocNum=${docSearch.DocNum}&DocStatus=${docSearch.DocStatus}&DocCurrency=${docSearch.DocCur}&CardCode=${docSearch.CardCode}&CardName=&Status=${docSearch.Status}&Delivery=${docSearch.Delivery}`;
        return this.http.get<ICLResponse<ISalesDocumentSearch[]>>(endPoint, { headers });
    }


    /**
     * Retrieves a specific document by DocEntry.
     * @param _docEntry Document entry ID.
     * @param _endPoint API endpoint name.
     * @returns API response with the requested document.
     */
    Get<T>(_docEntry: number, _endPoint: string): Observable<ICLResponse<T>> {
        return this.http.get<ICLResponse<T>>(`api/${_endPoint}?DocEntry=${_docEntry}`);
    }

    /**
     * Retrieves a document preview for printing.
     * @param _docEntry Document entry ID.
     * @param _controller API controller to use for the report.
     * @returns API response with the print preview data.
     */
    DocumentPreview(_docEntry: number, _controller: string): Observable<ICLResponse<IPrintPreview>> {
        return this.http.get<ICLResponse<IPrintPreview>>(`api/Reports/${_controller}/${_docEntry}/Print`);
    }

    /**
     * Retrieves the cash desk closing lines for the current user.
     * @param _baseSearch Search filters.
     * @returns API response with cash desk closing data.
     */
    GetCashDeskClosing(_baseSearch: ISearch): Observable<ApiResponse<ICashDeskClosingLine[]>> {
        _baseSearch.UserMapId = +this.localStorageService.data.get(LocalStorageVariables.Session).userMappId;
        return this.http.post<ApiResponse<ICashDeskClosingLine[]>>(`api/Documents/GetCashDeskClosing`, _baseSearch);
    }

    /**
     * Retrieves available document type labels for printing.
     * @returns API response with document type label list.
     */
    GetDocumentTypesLabels(): Observable<ICLResponse<IDocumentTypeLabel[]>> 
    {
        return this.http.get<ICLResponse<IDocumentTypeLabel[]>>(`api/Mobile/PrintDocTypeLabels`, {
            headers: new HttpHeaders().set("cl-offline-function-to-run", 'GetDocumentTypeLabels'),
        });
    }

    /**
     * Retrieves documents for internal reconciliation.
     * @param _cardCode Business partner code.
     * @param _docCurrency Document currency.
     * @param _dateInit Start date filter.
     * @param _dateEnd End date filter.
     * @param _controller API controller name.
     * @param _page Pagination page.
     * @param _pageSize Pagination page size.
     * @returns API response with open invoice list.
     */
    GetDocumentsForInternalReconciliation(_cardCode: string, _docCurrency: string, _dateInit: string, _dateEnd: string, _controller: string, _page: number, _pageSize: number): Observable<ICLResponse<IInvoiceOpen[]>> {
        const headers = new HttpHeaders({
            'Cl-Sl-Pagination-Page': `${_page}`,
            'Cl-Sl-Pagination-Page-Size': `${_pageSize}`
        });
        return this.http.get<ICLResponse<IInvoiceOpen[]>>( `api/${_controller}`,{
            params:{
                CardCode: _cardCode,
                DocCurrency: _docCurrency,
                DateInit: _dateInit,
                DateEnd: _dateEnd,
            },
            headers: headers
        });
    }

    /**
     * Creates a draft sales order.
     * @param _document Sales order document data.
     * @param _attachment Optional document attachment.
     * @param _attachmentFiles Optional list of attached files.
     * @returns API response with the created draft order.
     */
    CreateOrderDraft(_document: ISalesOrder, _attachment?: IDocumentAttachment, _attachmentFiles?: File[]): Observable<ICLResponse<ISalesOrder>> {
        let formData = new FormData();
        formData.append('Document', JSON.stringify(_document));
        formData.append('Attachment', JSON.stringify(_attachment));

        _attachmentFiles?.forEach(attF => formData.append(attF.name, attF));
        
        return this.http.post<ICLResponse<ISalesOrder>>(`api/Orders/PostDocumentsDrafts`, formData);
    }

    /**
     * Updates an existing draft sales order.
     * @param _document Updated sales order data.
     * @param _attachment Optional document attachment.
     * @param _attachmentFiles Optional list of attached files.
     * @returns API response with the updated draft order.
     */
    UpdateOrderDraft(_document: ISalesOrder, _attachment?: IDocumentAttachment, _attachmentFiles?: File[]): Observable<ICLResponse<ISalesOrder>> {
        let formData = new FormData();
        formData.append('Document', JSON.stringify(_document));
        formData.append('Attachment', JSON.stringify(_attachment));

        _attachmentFiles?.forEach(attF => formData.append(attF.name, attF));
        
        return this.http.post<ICLResponse<ISalesOrder>>(`api/Orders/PatchDocumentsDrafts`, formData);
    }

    /**
     * Creates a draft sales quotation.
     * @param _document Sales quotation document data.
     * @param _attachment Optional document attachment.
     * @param _attachmentFiles Optional list of attached files.
     * @returns API response with the created draft quotation.
     */
    CreateQuotationDraft(_document: ISalesQuotation, _attachment?: IDocumentAttachment, _attachmentFiles?: File[]): Observable<ICLResponse<ISalesQuotation>> {
        let formData = new FormData();
        formData.append('Document', JSON.stringify(_document));
        formData.append('Attachment', JSON.stringify(_attachment));

        _attachmentFiles?.forEach(attF => formData.append(attF.name, attF));
        
        return this.http.post<ICLResponse<ISalesQuotation>>(`api/Quotations/PostDocumentsDrafts`, formData);
    }

    /**
     * Updates an existing draft quotation with the provided sales quotation data.
     * @param _document Sales quotation document data to update.
     * @param _attachment Optional attachment metadata.
     * @param _attachmentFiles Optional list of attached files.
     * @returns API response with the updated draft quotation.
     */
    UpdateQuotationDraft(_document: ISalesQuotation, _attachment?: IDocumentAttachment, _attachmentFiles?: File[]): Observable<ICLResponse<ISalesQuotation>> {
        let formData = new FormData();
        formData.append('Document', JSON.stringify(_document));
        formData.append('Attachment', JSON.stringify(_attachment));

        _attachmentFiles?.forEach(attF => formData.append(attF.name, attF));
        
        return this.http.post<ICLResponse<ISalesQuotation>>(`api/Quotations/PatchDocumentsDrafts`, formData);
    }

    /**
     * Creates a draft invoice using the provided AR invoice document.
     * @param _document AR invoice data to be used.
     * @param _attachment Optional attachment metadata.
     * @param _attachmentFiles Optional list of attached files.
     * @returns API response with the created draft invoice.
     */
    CreateInvoiceDraft(_document: IARInvoice, _attachment?: IDocumentAttachment, _attachmentFiles?: File[]): Observable<ICLResponse<IARInvoice>> {
        let formData = new FormData();
        formData.append('Document', JSON.stringify(_document));
        formData.append('Attachment', JSON.stringify(_attachment));

        _attachmentFiles?.forEach(attF => formData.append(attF.name, attF));
        
        return this.http.post<ICLResponse<IARInvoice>>(`api/Invoices/PostDocumentsDrafts`, formData);
    }

    /**
     * Updates an existing draft invoice with new AR invoice data.
     * @param _document AR invoice data to update.
     * @param _attachment Optional attachment metadata.
     * @param _attachmentFiles Optional list of attached files.
     * @returns API response with the updated draft invoice.
     */
    UpdateInvoiceDraft(_document: IARInvoice, _attachment?: IDocumentAttachment, _attachmentFiles?: File[]): Observable<ICLResponse<IARInvoice>> {
        let formData = new FormData();
        formData.append('Document', JSON.stringify(_document));
        formData.append('Attachment', JSON.stringify(_attachment));

        _attachmentFiles?.forEach(attF => formData.append(attF.name, attF));
        
        return this.http.post<ICLResponse<IARInvoice>>(`api/Invoices/PatchDocumentsDrafts`, formData);
    }

    /**
     * Retrieves a list of draft documents matching the provided search filters.
     * @param docSearch Document search filter model.
     * @param _endpoint API endpoint name.
     * @param _page Current page number for pagination.
     * @param _pageSize Number of items per page.
     * @returns API response with a list of draft documents.
     */
    GetDocumentsDrafts(docSearch: DocumentDraftSearchMobileModel, _endpoint: string, _page: number, _pageSize: number): Observable<ICLResponse<ISalesDocumentSearch[]>> {
        const headers = new HttpHeaders({
            'Cl-Sl-Pagination-Page': `${_page}`,
            'Cl-Sl-Pagination-Page-Size': `${_pageSize}`
        });
        let endPoint: string = `api/${_endpoint}?SlpCode=${docSearch.SlpCode}&DateInit=${docSearch.StartDate}&DateEnd=${docSearch.EndDate}&DocNum=${docSearch.DocNum}&DocStatus=${docSearch.DocStatus}&DocCurrency=${docSearch.DocCur}&CardCode=${docSearch.CardCode}&CardName=${''}&ViewType=${docSearch.ViewType}&ObjType=${docSearch.ObjType}`;
        return this.http.get<ICLResponse<ISalesDocumentSearch[]>>(endPoint, { headers });
    }

    /**
     * Retrieves a paginated list of closed down payments based on the given filters.
     * @param _cardCode Business partner code.
     * @param _docCurrency Document currency code.
     * @param _dateFrom Start date (ISO string).
     * @param _dateTo End date (ISO string).
     * @param _docNum Specific document number filter.
     * @param _page Page number.
     * @param _pageSize Number of records per page.
     * @returns API response with a list of closed down payments.
     */
    GetDownPayemts(_cardCode: string, _docCurrency: string, _dateFrom: string, _dateTo: string, _docNum: number, _page: number, _pageSize: number):  Observable<ICLResponse<IDownPaymentClosed[]>> {
        const headers = new HttpHeaders({
            'Cl-Sl-Pagination-Page': `${_page}`,
            'Cl-Sl-Pagination-Page-Size': `${_pageSize}`
        });
        return this.http.get<ICLResponse<IDownPaymentClosed[]>>( `api/DownPayments/GetARDownPaymentsClosed?CardCode=${_cardCode}&DocCurrency=${_docCurrency}&DateInit=${_dateFrom}&DateEnd=${_dateTo}&DocNum=${_docNum}`,{
            headers: headers
        });
    }

    /**
     * Creates a down payment invoice using the provided document data.
     * @param _document Down invoice and payment data.
     * @param _attachment Optional attachment metadata.
     * @param _attachmentFiles Optional attached files.
     * @returns API response with the created down invoice.
     */
    CreateDownInvoice(_document: IDownInvoiceWithPayment, _attachment?: IDocumentAttachment, _attachmentFiles?: File[]): Observable<ICLResponse<IDownInvoiceWithPayment>> {
        let formData = new FormData();
        formData.append('Document', JSON.stringify(_document));
        formData.append('Attachment', JSON.stringify(_attachment));

        _attachmentFiles?.forEach(attF => formData.append(attF.name, attF));
        
        return this.http.post<ICLResponse<IDownInvoiceWithPayment>>(`api/DownPayments`, formData);
    }


    /**
     * Updates an existing A/R invoice via PATCH request.
     * @param _document Invoice data to update.
     * @param _attachment Optional attachment metadata.
     * @param _attachmentFiles Optional attached files.
     * @returns API response with the updated invoice.
     */
    UpdateInvoice(_document: IARInvoice, _attachment?: IDocumentAttachment, _attachmentFiles?: File[]): Observable<ICLResponse<IARInvoice>> {
        let formData = new FormData();
        formData.append('Document', JSON.stringify(_document));
        formData.append('Attachment', JSON.stringify(_attachment));

        _attachmentFiles?.forEach(attF => formData.append(attF.name, attF));
        
        return this.http.patch<ICLResponse<IARInvoice>>(`api/Invoices`, formData);
    }

    /**
     * Updates an existing down invoice via PATCH request.
     * @param _document Down invoice data to update.
     * @param _attachment Optional attachment metadata.
     * @param _attachmentFiles Optional attached files.
     * @returns API response with the updated down invoice.
     */
    UpdateDownInvoice(_document: IDownInvoiceWithPayment, _attachment?: IDocumentAttachment, _attachmentFiles?: File[]): Observable<ICLResponse<IDownInvoiceWithPayment>> {
        let formData = new FormData();
        formData.append('Document', JSON.stringify(_document));
        formData.append('Attachment', JSON.stringify(_attachment));

        _attachmentFiles?.forEach(attF => formData.append(attF.name, attF));
        
        return this.http.patch<ICLResponse<IDownInvoiceWithPayment>>(`api/DownPayments`, formData);
    }
}
