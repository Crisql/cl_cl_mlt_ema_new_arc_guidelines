using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CLMLTEMA.COMMON
{
    public class Constants
    {
        #region PINPAD

        /// <summary>
        /// Contains constant values representing different types of transaction requests 
        /// typically used in payment or communication protocols.
        /// </summary>
        public static class RequestType
        {
            /// <summary>
            /// Represents a standard sales transaction request.
            /// </summary>
            public const string Sale = "SALE";

            /// <summary>
            /// Represents a request to cancel a previously made transaction.
            /// </summary>
            public const string Cancel = "VOID";

            /// <summary>
            /// Represents a request to reverse a transaction.
            /// </summary>
            public const string Reverse = "REVERSE";

            /// <summary>
            /// Represents a preliminary balance inquiry request.
            /// Used to validate or preview a transaction batch before settlement.
            /// </summary>
            public static string PBalance = "BATCH_INQUIRY";

            /// <summary>
            /// Represents a request to settle a transaction batch.
            /// </summary>
            public static string Balance = "BATCH_SETTLEMENT";

            /// <summary>
            /// Represents a connectivity test request to validate system communication.
            /// </summary>
            public static string TestConnect = "ECHO_TEST";

            /// <summary>
            /// Represents a request to create a new record or transaction.
            /// </summary>
            public const string Create = "CREATE";

            /// <summary>
            /// Represents a request to cancel a registration process or record.
            /// </summary>
            public const string CancelRegister = "CANCELREGIS";

            /// <summary>
            /// Represents a request to reverse a registration process or record.
            /// </summary>
            public const string ReverseRegister = "REVERSEREGIS";
        }

        /// <summary>
        /// Specifies the types of financial transactions that can be performed.
        /// </summary>
        public enum TypeTransaction
        {
            /// <summary>
            /// Represents a preliminary balance inquiry transaction.
            /// Typically used to verify available funds or simulate settlement.
            /// </summary>
            PRE_BALANCE,

            /// <summary>
            /// Represents an actual balance transaction.
            /// Used to perform final settlement or posting of financial data.
            /// </summary>
            BALANCE
        }

        /// <summary>
        /// Represents the SAP document types with their corresponding internal identifiers.
        /// These values are typically used for transaction identification and processing logic.
        /// </summary>
        public enum DocumentType
        {
            /// <summary>Incoming Payments (document ID: 24).</summary>
            IncomingPayments = 24,

            /// <summary>Credit Notes (document ID: 14).</summary>
            CreditNotes = 14,

            /// <summary>Electronic Invoices (Facturas FE) (document ID: 13).</summary>
            InvoicesFE = 13,

            /// <summary>Technical Invoices (Facturas TE) (custom/internal ID: -13).</summary>
            InvoicesTE = -13,

            /// <summary>Items / Articles (document ID: 4).</summary>
            Items = 4,

            /// <summary>Sales Orders (document ID: 17).</summary>
            SalesOrders = 17,

            /// <summary>Sales Quotations (document ID: 23).</summary>
            SalesQuotations = 23,

            /// <summary>Business Partners (Customers) (document ID: 2).</summary>
            BusinessPartners = 2,

            /// <summary>Suppliers (custom/internal ID: -2).</summary>
            Supplier = -2,

            /// <summary>Purchase Invoices (document ID: 18).</summary>
            PurchaseInvoice = 18,

            /// <summary>Outgoing Payments (document ID: 46).</summary>
            OutgoingPayment = 46,

            /// <summary>Goods Receipt Purchase Orders (document ID: 20).</summary>
            GoodReceiptPO = 20,

            /// <summary>Goods Returns (document ID: 21).</summary>
            GoodReturn = 21,

            /// <summary>Inventory Goods Receipt (document ID: 59).</summary>
            GoodReceipt = 59,

            /// <summary>Inventory Goods Issue (document ID: 60).</summary>
            GoodIssue = 60,

            /// <summary>Deliveries (document ID: 15).</summary>
            Delivery = 15,

            /// <summary>Purchase Orders (document ID: 22).</summary>
            PurchaseOrder = 22,

            /// <summary>Customer Down Payments (document ID: 203).</summary>
            ArDownPayment = 203,

            /// <summary>Supplier Down Payments (document ID: 204).</summary>
            ApDownPayment = 204,

            /// <summary>Draft documents (document ID: 112).</summary>
            Drafts = 112,

            /// <summary>Inventory Transfer Requests (custom document ID: 1250000001).</summary>
            InventoryTransferRequest = 1250000001,

            /// <summary>Inventory Transfers (document ID: 67).</summary>
            InventoryTransfer = 67
        }

        /// <summary>
        /// Contains constant message strings that represent different document types used in the system.
        /// These strings are typically used for display purposes (e.g., UI labels, logs, messages).
        /// </summary>
        public static class DocumentTypeMessage
        {
            /// <summary>Represents Incoming Payments.</summary>
            public const string IncomingPayments = "Pagos Recibidos";

            /// <summary>Represents Credit Notes.</summary>
            public const string CreditNotes = "Notas de crédito";

            /// <summary>Represents Electronic Invoices (Facturas FE).</summary>
            public const string InvoicesFE = "Facturas FE";

            /// <summary>Represents Technical Invoices (Facturas TE).</summary>
            public const string InvoicesTE = "FacturasTE";

            /// <summary>Represents Items.</summary>
            public const string Items = "Artículos";

            /// <summary>Represents Sales Orders.</summary>
            public const string SalesOrders = "Orden de venta";

            /// <summary>Represents Sales Quotations.</summary>
            public const string SalesQuotations = "Cotizaciones";

            /// <summary>Represents Business Partners.</summary>
            public const string BusinessPartners = "Socios de Negocios";

            /// <summary>Represents Suppliers.</summary>
            public const string Supplier = "Proovedores";

            /// <summary>Represents Purchase Invoices.</summary>
            public const string PurchaseInvoice = "Factura Provedores";

            /// <summary>Represents Outgoing Payments.</summary>
            public const string OutgoingPayment = "Pagos efectuados";

            /// <summary>Represents Goods Receipt Purchase Orders.</summary>
            public const string GoodReceiptPO = "Entrada de mercancías";

            /// <summary>Represents Goods Returns.</summary>
            public const string GoodReturn = "Devolución de mercancías";

            /// <summary>Represents Inventory Goods Receipt.</summary>
            public const string GoodReceipt = "Entrada de inventario";

            /// <summary>Represents Inventory Goods Issue.</summary>
            public const string GoodIssue = "Salida de inventario";

            /// <summary>Represents Deliveries.</summary>
            public const string Delivery = "Entregas";

            /// <summary>Represents Purchase Orders.</summary>
            public const string PurchaseOrder = "Ordenes de compra";

            /// <summary>Represents Customer Down Payments.</summary>
            public const string ArDownPayment = "Anticipos clientes";

            /// <summary>Represents Supplier Down Payments.</summary>
            public const string ApDownPayment = "Anticipos proveedores";

            /// <summary>Represents Draft documents.</summary>
            public const string Drafts = "Preliminares";

            /// <summary>Represents Inventory Transfer Requests.</summary>
            public const string InventoryTransferRequest = "Solicitud de Traslado";

            /// <summary>Represents Inventory Transfers.</summary>
            public const string InventoryTransfer = "Transferencia de Stock";
        }

        /// <summary>
        /// This enum is used identificate the current view on the UI
        /// </summary>
        public enum ViewType
        {
            /// <summary>
            /// Credit invoice
            /// </summary>
            CreditInvoice = 1,
            /// <summary>
            /// Account payment
            /// </summary>
            AccountPayment = 2,
            /// <summary>
            /// Reserve Invoice
            /// </summary>
            ReserveInvoice = 3,
            /// <summary>
            /// Sale Order
            /// </summary>
            SaleOrder = 4,
            /// <summary>
            /// Invoice
            /// </summary>
            CashInvoice = 5,
            /// <summary>
            /// Payment
            /// </summary>
            IncommingPayment = 6,
            /// <summary>
            /// Sale offter
            /// </summary>
            SaleOffer = 8,
            /// <summary>
            /// Business partner
            /// </summary>
            BusinessPartner = 9,
            /// <summary>
            /// Delivery
            /// </summary>
            Delivery = 10,
            /// <summary>
            /// Credit Note
            /// </summary>
            CreditNote = 12,
            /// <summary>
            /// Transfer Request
            /// </summary>
            TransferRequest = 13,
            /// <summary>
            /// Stock Transfer
            /// </summary>
            StockTransfer = 14,
            /// <summary>
            /// Cash Reserve Invoice
            /// </summary>
            CashReserveInvoice = 15,
            /// <summary>
            /// Draft documents
            /// </summary>
            Draft = 16,
            /// <summary>
            /// Cash Down Invoice
            /// </summary>
            CashDownInvoice = 17,
            /// <summary>
            /// Credi tDown Invoice
            /// </summary>
            CreditDownInvoice = 18,
        }

        /// <summary>
        /// Specifies the type of business partner.
        /// </summary>
        public enum CardType
        {
            /// <summary>
            /// Represents a customer (Cliente).
            /// </summary>
            Clientes = 1,

            /// <summary>
            /// Represents a supplier or vendor (Proveedor).
            /// </summary>
            Proveedores = 2
        }

        #endregion

        /// <summary>
        /// Defines the available HTTP methods used for requests.
        /// </summary>
        public enum MethodHttp
        {
            /// <summary>
            /// Represents an HTTP POST method.
            /// </summary>
            POST = 1,

            /// <summary>
            /// Represents an HTTP GET method.
            /// </summary>
            GET = 2
        }

        /// <summary>
        /// Specifies the type of database server being used.
        /// </summary>
        public enum ServerType
        {
            /// <summary>
            /// Represents a standard SQL Server instance.
            /// </summary>
            SQLSERVER,

            /// <summary>
            /// Represents a test or temporary SQL Server instance.
            /// </summary>
            SQLSERVERT,

            /// <summary>
            /// Represents a standard SAP HANA Server instance.
            /// </summary>
            HANASERVER,

            /// <summary>
            /// Represents a test or temporary SAP HANA Server instance.
            /// </summary>
            HANASERVERT
        }

        /// <summary>
        /// The value of the property of the setting defined here will be empty, the Key is the Code of the setting and the Value is the name of the property that should be cleaned
        /// </summary>
        public static List<KeyValuePair<string,string>> SettingsSpecifyPropertyToClean = new List<KeyValuePair<string,string>>()
        {
            new KeyValuePair<string, string>("Account", "Password"),
            new KeyValuePair<string, string>("SchedulingConfiguration", "GmailServiceAccountPassword"),
            new KeyValuePair<string, string>("Points", "Lealto:LealtoConfigs:Password")
        };

        /// <summary>
        /// HANA ODBC connection string format using credentials.
        /// Replaces placeholders: #ODBCType#, #Server#, #UserId#, #Password#.
        /// </summary>
        public const string HANATODBCConFormat = "Driver={#ODBCType#};SERVERNODE=#Server#;UID=#UserId#;PWD=#Password#;";

        /// <summary>
        /// HANA ODBC connection string format using credentials.
        /// Replaces placeholders: #ODBCType#, #Server#, #UserId#, #Password#.
        /// (Note: duplicate format string as <c>HANATODBCConFormat</c> – ensure distinction if necessary.)
        /// </summary>
        public const string HANAODBCConFormat = "Driver={#ODBCType#};SERVERNODE=#Server#;UID=#UserId#;PWD=#Password#;";

        /// <summary>
        /// SQL Server ODBC connection string format using Windows Authentication (trusted connection).
        /// Replaces placeholders: #ODBCType#, #Server#.
        /// </summary>
        public const string SQLTODBCConFormat = "Driver={#ODBCType#}; Server=#Server#;Trusted_Connection=Yes;";

        /// <summary>
        /// SQL Server ODBC connection string format using SQL Authentication.
        /// Replaces placeholders: #ODBCType#, #Server#, #UserId#, #Password#.
        /// </summary>
        public const string SQLODBCConFormat = "Driver={#ODBCType#};Server=#Server#;Uid=#UserId#;Pwd=#Password#;";
    }

    /// <summary>
    /// Custom user identity claims used throughout the application.
    /// </summary>
    public static class CustomClaims
    {
        /// <summary>
        /// Claim key for the user's email.
        /// </summary>
        public static string UserEmail = "UserEmail";

        /// <summary>
        /// Claim key for the user's full name.
        /// </summary>
        public static string UserName = "UserName";

        /// <summary>
        /// Claim key for the user's MAPP identifier.
        /// </summary>
        public static string UserMappId = "UserMappId";
    }

    /// <summary>
    /// Holds constants representing various application configuration setting codes.
    /// </summary>
    public static class SettingCode
    {
        /// <summary>Account configuration setting key.</summary>
        public static string Account = "Account";

        /// <summary>Points system configuration setting key.</summary>
        public static string Points = "Points";

        /// <summary>Typeahead pattern configuration key.</summary>
        public static string PatternTypeahead = "PatternTypeahead";

        /// <summary>Document print format configuration key.</summary>
        public static string PrintFormat = "PrintFormat";

        /// <summary>Fields displayed in invoices configuration key.</summary>
        public static string FieldsInvoice = "FieldsInvoice";

        /// <summary>Shared folder path configuration key.</summary>
        public static string ShareFolder = "ShareFolder";

        /// <summary>Default email credentials configuration key.</summary>
        public static string DefaultSendEmailCredentials = "DefaultSendEmailCredentials";

        /// <summary>Google reCAPTCHA integration key.</summary>
        public static string Recaptcha = "Recaptcha";
    }

    /// <summary>
    /// Defines the allowed actions that can be performed on preloaded documents.
    /// </summary>
    public static class PreloadedDocumentActions
    {
        /// <summary>Represents an edit action.</summary>
        public static string EDIT = "edit";

        /// <summary>Represents a copy action.</summary>
        public static string COPY = "copy";
    }

    /// <summary>
    /// Defines the status values used for Business Partners.
    /// </summary>
    public static class StatusBP
    {
        /// <summary>Indicates an inactive business partner.</summary>
        public const string TNO = "tNO";

        /// <summary>Indicates an active business partner.</summary>
        public const string TYES = "tYES";
    }

    /// <summary>
    /// Represents the synchronization status of a mobile document.
    /// </summary>
    public static class DocumentSyncStatus
    {
        /// <summary>Document is queued for processing.</summary>
        public const string InQueue = "Q";

        /// <summary>Document is being processed.</summary>
        public const string Processing = "P";

        /// <summary>An error occurred while processing the document.</summary>
        public const string Errors = "E";

        /// <summary>Document processed successfully.</summary>
        public const string Success = "S";

        /// <summary>Document has not been synchronized.</summary>
        public const string NotSynchronized = "N";
    }

    /// <summary>
    /// Represents the different types of documents that can be synchronized.
    /// </summary>
    public static class DocumentSyncTypes
    {
        /// <summary>Sales order document.</summary>
        public const string SaleOrder = "OR";

        /// <summary>Sales quotation document.</summary>
        public const string SaleQuotation = "OF";

        /// <summary>Invoice document.</summary>
        public const string Invoice = "IV";

        /// <summary>Invoice with payment document.</summary>
        public const string InvoiceWithPayment = "IP";

        /// <summary>Incoming payment document.</summary>
        public const string IncomingPayment = "PA";
    }

    /// <summary>
    /// Represents the types of information that can be changed or synchronized from mobile clients.
    /// </summary>
    public static class MobileChangeInformationType
    {
        /// <summary>Business Partners.</summary>
        public const string BusinessPartners = "BusinessPartners";

        /// <summary>Item catalog.</summary>
        public const string Items = "Items";

        /// <summary>Item prices.</summary>
        public const string Prices = "Prices";

        /// <summary>Discount information.</summary>
        public const string Discounts = "Discounts";

        /// <summary>Commercial agreements.</summary>
        public const string Agreements = "Agreements";

        /// <summary>Price lists.</summary>
        public const string PriceLists = "PriceLists";

        /// <summary>Bill of Materials (BOM).</summary>
        public const string BillOfMaterials = "BillOfMaterials";
    }

    /// <summary>
    /// Represents the status of a line item in a document.
    /// </summary>
    public static class LineStatus
    {
        /// <summary>The line is closed.</summary>
        public static string bost_Close = "bost_Close";

        /// <summary>The line is open.</summary>
        public static string bost_Open = "bost_Open";
    }

    /// <summary>
    /// Represent status of draft document
    /// </summary>
    public static class StatusDraft
    {
        /// <summary>
        /// Status aproved
        /// </summary>
        public const string Approved = "Y";
        /// <summary>
        /// Status declined
        /// </summary>
        public const string Rejected = "N";
    }

    /// <summary>
    /// Model to represent type of document
    /// </summary>
    public static class SapDocumenType
    {
        /// <summary>
        /// Represent invoice
        /// </summary>
        public const string ArInvoice = "OINV";
        /// <summary>
        /// Represent sale order
        /// </summary>
        public const string SaleOrder = "ORDR";  
        /// <summary>
        /// Represent quotation
        /// </summary>
        public const string Quotation = "OQUT";  
        /// <summary>
        /// Represent draft
        /// </summary>
        public const string Draft = "ODRF";  
        /// <summary>
        /// Represent purchase invoice
        /// </summary>
        public const string ApInvoice = "OPCH";  
        /// <summary>
        /// Represent sales advance downpayment
        /// </summary>
        public const string ApDownPayment = "ODPO"; 
        /// <summary>
        /// Represent purchase advance downpayment
        /// </summary>
        public const string ArDownPayment = "ODPI"; 
        /// <summary>
        /// Represent purchase order
        /// </summary>
        public const string PurchaseOrder = "OPOR"; 
        
        /// <summary>
        /// Represent Good Receipt PO
        /// </summary>
        public const string GoodReceiptPO = "OPDN";
        
        /// <summary>
        /// Represent Good Receipt PO
        /// </summary>
        public const string GoodReturn = "ORPD";

        /// <summary>
        /// Represent the credit notes SAP table
        /// </summary>
        public const string CreditNotes = "ORIN";

        /// <summary>
        /// Represent the deliveries SAP table
        /// </summary>
        public const string Delivery = "ODLN";

        /// <summary>
        /// Represent the Incoming Payment SAP table
        /// </summary>
        public const string IncomingPayment = "ORCT";

        /// <summary>
        /// Represent the Outgoing Payment SAP table
        /// </summary>
        public const string OutgoingPayment = "OVPM";

        /// <summary>
        /// Represent the Inventory Ouput SAP table
        /// </summary>
        public const string InventoryOuput = "OIGE";

        /// <summary>
        /// Represent the Transfers Request SAP table
        /// </summary>
        public const string TransfersRequest = "OWTQ";

        /// <summary>
        /// Represent the Stock Transfer SAP table
        /// </summary>
        public const string StockTransfer = "OWTR";

        /// <summary>
        /// Represent the Inventory Entry SAP table
        /// </summary>
        public const string InventoryEntry = "OIGN";




    }
    
    /// <summary>
    /// Represent values of udf to authozitation simuled
    /// </summary>
    public static class Approval_Status
    {
        /// <summary>
        /// Status aproved
        /// </summary>
        public const string Approved = "arsApproved";
        /// <summary>
        /// Status declined
        /// </summary>
        public const string Rejected = "arsNotApproved";
        
        /// <summary>
        /// Status pending
        /// </summary>
        public const string Pending = "arsPending";
    }

    /// <summary>
    /// This class is used to popertys pagination
    /// </summary>
    public static class PaginationRecords
    {
        /// <summary>
        /// Number page
        /// </summary>
        public const string Page = "cl-sl-pagination-page";
        /// <summary>
        /// Page size
        /// </summary>
        public const string PageSize = "cl-sl-pagination-page-size";
        /// <summary>
        /// Records count
        /// </summary>
        public const string RecodrsCount = "cl-sl-pagination-records-count";
    }
    
    /// <summary>
    /// Represents filter values per view.
    /// </summary>
    public static class ItemsFilterType
    {
        /// <summary>
        /// Inventory view
        /// </summary>
        public const string InvntItem = "InvntItem";
        /// <summary>
        /// Sales view
        /// </summary>
        public const string SellItem = "SellItem";
        
        /// <summary>
        /// Purchases view 
        /// </summary>
        public const string PrchseItem = "PrchseItem";
    }
    
    /// <summary>
    /// Represents of the differences types of data sets 
    /// </summary>
    public static class DataSetsTypes
    {
        /// <summary>
        /// Indicates whether the dataset is from SAP
        /// </summary>
        public const string SapDataSet = "QS";
        
        /// <summary>
        /// Indicates whether the dataset is from local data base
        /// </summary>
        public const string LocalDataSet = "V";
    }
    
    /// <summary>
    /// Represent type of view sales or purchase
    /// </summary>
    public static class ViewType
    {
        /// <summary>
        /// Indicates sales view
        /// </summary>
        public const string Sales = "Sales";
        
        /// <summary>
        /// Indicates purchaseView
        /// </summary>
        public const string Purchase = "Purchase";
    }

    /// <summary>
    /// Contains constant keys for application settings used across the system.
    /// These settings are typically retrieved from a configuration store or database.
    /// </summary>
    public static class SettingsEnum
    {
        /// <summary>
        /// Setting key for enabling or configuring authorization-related notifications.
        /// </summary>
        public const string AuthorizationNotifications = "AuthorizationNotifications";

        /// <summary>
        /// Setting key for configuring the email used in authorization workflows.
        /// </summary>
        public const string EmailAuthoritation = "EmailAuthoritation";

        /// <summary>
        /// Setting key that defines filter conditions for approval queries.
        /// </summary>
        public const string ApprovalQueriesFilterConditions = "ApprovalQueriesFilterConditions";

        /// <summary>
        /// Setting key that specifies which document properties are used in approval queries.
        /// </summary>
        public const string ApprovalQueriesDocumentProperties = "ApprovalQueriesDocumentProperties";
    }

    /// <summary>
    /// Represent the type of filter available to use in the approval queries conditions filter
    /// </summary>
    public static class ApprovalQueriesFilterConditionType
    {
        /// <summary>
        /// Indicates that the value of property of the document must be equal to the value returned by the condition
        /// </summary>
        public const string Equality = "=";
        /// <summary>
        /// Indicates that the value of property of the document must be greater than the value returned by the condition
        /// </summary>
        public const string GreaterThan = ">";
        /// <summary>
        /// Indicates that the value of property of the document must be less than the value returned by the condition
        /// </summary>
        public const string LessThan = "<";
        /// <summary>
        /// Indicates that the value of property of the document must be differed of the value returned by the condition
        /// </summary>
        public const string Different = "!=";
        /// <summary>
        /// Indicates that the value of property of the document must be greater or equal of the value returned by the condition
        /// </summary>
        public const string GreaterOrEqual = ">=";
        /// <summary>
        /// Indicates that the value of property of the document must be less or equal of the value returned by the condition
        /// </summary>
        public const string LessOrEqual = "<=";
    }

    /// <summary>
    /// Represents the possible outcomes when evaluating approval query conditions.
    /// These results control the flow of the document approval process.
    /// </summary>
    public enum ApprovalQueriesConditionsResults
    {
        /// <summary>
        /// Indicates that the authorization process will be skipped and any subsequent conditions will be ignored.
        /// </summary>
        IgnoreNextConditions,

        /// <summary>
        /// Indicates that the current condition is met and the authorization process must be applied.
        /// </summary>
        ApplyAuthorizationProcess,

        /// <summary>
        /// Indicates that the current condition was not met; evaluation should continue with the next condition.
        /// </summary>
        CheckNextCondition
    }


    /// <summary>
    /// Defines constants for SAP connection types.
    /// </summary>
    public static class SapConnectionType
    {
        /// <summary>
        /// ODBC connection type
        /// </summary>
        public static string ODBC = "ODBC";
        /// <summary>
        /// Service Layer connection type
        /// </summary>
        public static string ServiceLayer = "SL";
    }

    /// <summary>
    /// Defines the supported database types for ODBC and Service Layer connections.
    /// </summary>
    public static class DBType
    {
        /// <summary>
        /// Identifier for Microsoft SQL Server connections.
        /// </summary>
        public static string SQL = "SQL";

        /// <summary>
        /// Identifier for SAP HANA connections.
        /// </summary>
        public static string HANA = "HANA";
    }


    /// <summary>
    /// Constants representing SAP Business One yes/no text flags.
    /// </summary>
    public static class BoYesNo
    {
        /// <summary>
        /// "No" flag (tNO).
        /// </summary>
        public const string TNO = "tNO";

        /// <summary>
        /// "Yes" flag (tYES).
        /// </summary>
        public const string TYES = "tYES";
    }

}
