using System.Collections.Generic;

namespace CLMLTEMA.MODELS
{
    public class SettingTypeaheadFormat
    {
        public int CompanyId { get; set; }  
        public string ItemPattern { get; set; }
        public string BusinessPattern { get; set; }
    }
    
    public class SettingUrlFormat
    {
        public int CompanyId { get; set; }
        public string PortServiceLocal { get; set; }
        public string PortServicePinpad { get; set; }
        public string PortServiceLayer { get; set; }
        public string PortServiceHacienda { get; set; }
        public string MessageServiceLayer { get; set; }
    }
    
    public class EmailCredential
    {
        public int CompanyId { get; set; }
        public string Subject { get; set; }
        public string Account { get; set; }
        public string User { get; set; }
        public string Host { get; set; }
        public string Password { get; set; }
        public int Port { get; set; }
        public bool Ssl { get; set; }
    }

    /// <summary>
    /// Represents the configuration of print formats for different 
    /// business documents in a company. 
    /// It stores paths and references to report templates used in printing.
    /// </summary>
    public class PrintFormat
    {
        /// <summary>
        /// Identifier of the company.
        /// </summary>
        public int CompanyId { get; set; }

        /// <summary>
        /// Indicates whether the print format is active.
        /// </summary>
        public bool Active { get; set; }

        /// <summary>
        /// Name of the remote server where report files are stored.
        /// </summary>
        public string RemoteServer { get; set; }

        /// <summary>
        /// Base path to the report templates.
        /// </summary>
        public string Path { get; set; }

        /// <summary>
        /// Report template path for sales offers.
        /// </summary>
        public string SaleOffer { get; set; }

        /// <summary>
        /// Report template path for sales orders.
        /// </summary>
        public string SaleOrder { get; set; }

        /// <summary>
        /// Report template path for voucher cancellation.
        /// </summary>
        public string VoucherCancellation { get; set; }

        /// <summary>
        /// Report template path for invoices.
        /// </summary>
        public string Invoices { get; set; }

        /// <summary>
        /// Report template path for invoices with PinPad integration.
        /// </summary>
        public string PinPadInvoices { get; set; }

        /// <summary>
        /// Report template path for credit notes.
        /// </summary>
        public string CreditNote { get; set; }

        /// <summary>
        /// Report template path for received payments.
        /// </summary>
        public string ReceivedPayment { get; set; }

        /// <summary>
        /// Report template path for cash closing reports.
        /// </summary>
        public string CashClosing { get; set; }

        /// <summary>
        /// Report template path for reprinting sales offers.
        /// </summary>
        public string ReprintSaleOffers { get; set; }

        /// <summary>
        /// Report template path for reprinting invoices.
        /// </summary>
        public string ReprintInvoices { get; set; }

        /// <summary>
        /// Report template path for reprinting sales orders.
        /// </summary>
        public string ReprintSaleOrders { get; set; }

        /// <summary>
        /// Report template path for goods receipt documents.
        /// </summary>
        public string GoodsReceipt { get; set; }

        /// <summary>
        /// Report template path for goods issue documents.
        /// </summary>
        public string GoodsIssue { get; set; }

        /// <summary>
        /// Report template path for purchase order goods receipt.
        /// </summary>
        public string GoodsReceiptPO { get; set; }

        /// <summary>
        /// Report template path for goods return documents.
        /// </summary>
        public string GoodsReturn { get; set; }

        /// <summary>
        /// Report template path for purchase orders.
        /// </summary>
        public string PurchaseOrder { get; set; }

        /// <summary>
        /// Report template path for accounts payable invoices (AP Invoice).
        /// </summary>
        public string APInvoice { get; set; }

        /// <summary>
        /// Report template path for inventory transfer requests.
        /// </summary>
        public string InventoryTransferRequest { get; set; }

        /// <summary>
        /// Report template path for inventory transfers.
        /// </summary>
        public string InventoryTransfer { get; set; }

        /// <summary>
        /// Report template path for outgoing payments.
        /// </summary>
        public string OutgoingPayment { get; set; }

        /// <summary>
        /// Report template path for payment cancellations.
        /// </summary>
        public string CancelPayment { get; set; }

        /// <summary>
        /// Report template path for AR down payments.
        /// </summary>
        public string ArDownPayment { get; set; }

        /// <summary>
        /// Report template path for AR down payments with PinPad integration.
        /// </summary>
        public string PinpadDownPayment { get; set; }

        /// <summary>
        /// Report template path for reprinting AR down payments.
        /// </summary>
        public string ReprintArDownPayment { get; set; }

        /// <summary>
        /// Report template path for reprinting reserve invoices.
        /// </summary>
        public string ReprintReserveInvoice { get; set; }

        /// <summary>
        /// Report template path for reserve invoices.
        /// </summary>
        public string ReserveInvoice { get; set; }

        /// <summary>
        /// Report template path for delivery notes.
        /// </summary>
        public string DeliveryNotes { get; set; }

        /// <summary>
        /// Report template path for preliminary documents.
        /// </summary>
        public string Preliminary { get; set; }

        /// <summary>
        /// Report template path for reprinting preliminary documents.
        /// </summary>
        public string ReprintPreliminary { get; set; }

        /// <summary>
        /// Report template path for reprinting delivery notes.
        /// </summary>
        public string ReprintDeliveryNotes { get; set; }

        /// <summary>
        /// Report template path for AP down payments.
        /// </summary>
        public string ApDownPayment { get; set; }

        /// <summary>
        /// Report template path for AP down payments with PinPad integration.
        /// </summary>
        public string PinpadApDownPayment { get; set; }

        /// <summary>
        /// Report template path for reprinting AP down payments.
        /// </summary>
        public string ReprintApDownPayment { get; set; }

        /// <summary>
        /// Report template path for AP invoices with PinPad integration.
        /// </summary>
        public string PinpadAPInvoice { get; set; }

        /// <summary>
        /// Report template path for reprinting credit notes.
        /// </summary>
        public string ReprintCreditNotes { get; set; }

        /// <summary>
        /// Report template path for reprinting transfer requests.
        /// </summary>
        public string ReprintTransferRequest { get; set; }

        /// <summary>
        /// Report template path for reprinting purchase orders.
        /// </summary>
        public string ReprintPurchaseOrder { get; set; }
    }

    public class SettingFieldsInvoice
    {
        public int CompanyId { get; set; }  
        public bool DisplayTypeInvoice { get; set; }
        public bool NumFactura { get; set; }
        public bool SetAddressBusinessPartner { get; set; }
        public bool ChangeCurrencyLine { get; set; }
    }

    public class RecaptchaSetting
    {
        public string Url { get; set; }
        public string SecretKey { get; set; }
        public int CompanyId { get; set; }
    }


    /// <summary>
    /// This class is used to identify print format zpl offl
    /// </summary>
    public class PrintFormatZPLOfflineSerialice
    {
        /// <summary>
        /// This property handles the serialized model
        /// </summary>
        public string FormatZPLOffline { get; set; }
    }

    /// <summary>
    /// Represents the offline ZPL print format structure.
    /// </summary>
    public class PrintFormatZPLOffline
    {
        /// <summary>
        /// The header section of the print format, used for general documents.
        /// </summary>
        public string Header { get; set; }

        /// <summary>
        /// The header section specific to invoice documents.
        /// </summary>
        public string HeaderInvoice { get; set; }

        /// <summary>
        /// The body section of the print format containing line item structure.
        /// </summary>
        public string Body { get; set; }

        /// <summary>
        /// The footer section of the print format, used for general documents.
        /// </summary>
        public string Footer { get; set; }

        /// <summary>
        /// The footer section specific to invoice documents.
        /// </summary>
        public string FooterInvoice { get; set; }

        /// <summary>
        /// A list of invoice document identifiers or data used for offline printing.
        /// </summary>
        public string DocumentsInvoice { get; set; }
    }

}