using System;

namespace CLMLTEMA.MODELS.Filters
{
    /// <summary>
    /// Represents a generic or base filter container (placeholder).
    /// </summary>
    public class Filters
    {
    }

    /// <summary>
    /// Filter by warehouse code.
    /// </summary>
    public class FilterBaseWhsCode
    {
        /// <summary>
        /// Warehouse code.
        /// </summary>
        public string WhsCode { get; set; }
    }

    /// <summary>
    /// Filter by item code.
    /// </summary>
    public class FilterBaseItemCode
    {
        /// <summary>
        /// Item code.
        /// </summary>
        public string ItemCode { get; set; }
    }

    /// <summary>
    /// Filter by item and warehouse code.
    /// </summary>
    public class FilterBaseWhsCodeItemCode
    {
        /// <summary>
        /// Item code.
        /// </summary>
        public string ItemCode { get; set; }

        /// <summary>
        /// Warehouse code.
        /// </summary>
        public string WhsCode { get; set; }
    }

    /// <summary>
    /// Filter by document entry.
    /// </summary>
    public class FilterBaseDocEntry
    {
        /// <summary>
        /// Document entry (internal document ID).
        /// </summary>
        public int DocEntry { get; set; }
    }

    /// <summary>
    /// Filter by document entry and document type.
    /// </summary>
    public class FilterBaseDocEntryAndTipoDoc : FilterBaseDocEntry
    {
        /// <summary>
        /// Document type (e.g., invoice, order).
        /// </summary>
        public string TipoDoc { get; set; }
    }

    /// <summary>
    /// Filter by document number.
    /// </summary>
    public class FilterBaseDocNum
    {
        /// <summary>
        /// Document number (external or user-facing ID).
        /// </summary>
        public int DocNum { get; set; }
    }

    /// <summary>
    /// This class is used to Filter user base
    /// </summary>
    public class FilterUserBase
    {
        /// <summary>
        /// User id
        /// </summary>
        public int UserId { get; set; }
        /// <summary>
        /// Comapny id
        /// </summary>
        public int CompanyId { get; set; }
    }

    /// <summary>
    /// This class is used to filter user assing
    /// </summary>
    public class FilterUserAssing : FilterUserBase
    {
    }

    /// <summary>
    /// This class is used to filter license by user and company
    /// </summary>
    public class FilterLicenseUser : FilterUserBase
    {
    }

    /// <summary>
    /// Filters point-of-sale transactions by company, date range, type, and terminal.
    /// </summary>
    public class FilterPPTransactions
    {
        /// <summary>
        /// Gets or sets the identifier of the company.
        /// </summary>
        public int CompanyId { get; set; }

        /// <summary>
        /// Gets or sets the start date for filtering transactions (YYYY-MM-DD).
        /// </summary>
        public string From { get; set; }

        /// <summary>
        /// Gets or sets the end date for filtering transactions (YYYY-MM-DD).
        /// </summary>
        public string To { get; set; }

        /// <summary>
        /// Gets or sets the type of transaction to filter (e.g., sale, refund).
        /// </summary>
        public string TransactionType { get; set; }

        /// <summary>
        /// Gets or sets the terminal identifier where the transaction occurred.
        /// </summary>
        public string TerminalId { get; set; }
    }

    /// <summary>
    /// Filters and aggregates total point-of-sale transactions by terminal and exchange rate.
    /// </summary>
    public class FilterPPTransactionsTotal
    {
        /// <summary>
        /// Gets or sets the terminal identifier.
        /// </summary>
        public string TerminalId { get; set; }

        /// <summary>
        /// Gets or sets the exchange rate used in the calculation.
        /// </summary>
        public decimal Rate { get; set; }
    }

    /// <summary>
    /// Filters warehouse listings by name.
    /// </summary>
    public class FilterWarehouses
    {
        /// <summary>
        /// Gets or sets the warehouse name to filter by (partial match).
        /// </summary>
        public string FilterWarehouse { get; set; }
    }

    /// <summary>
    /// Base filter for querying documents with common criteria such as salesperson, status, and date range.
    /// </summary>
    public class FilterBaseDocuments
    {
        /// <summary>
        /// Gets or sets the document number.
        /// </summary>
        public int DocNum { get; set; }

        /// <summary>
        /// Gets or sets the salesperson code associated with the document.
        /// </summary>
        public int SlpCode { get; set; }

        /// <summary>
        /// Gets or sets the document status (e.g., Open, Closed).
        /// </summary>
        public string DocStatus { get; set; }

        /// <summary>
        /// Gets or sets the business partner code.
        /// </summary>
        public string CardCode { get; set; }

        /// <summary>
        /// Gets or sets the business partner name.
        /// </summary>
        public string CardName { get; set; }

        /// <summary>
        /// Gets or sets the start date for the document search (YYYY-MM-DD).
        /// </summary>
        public string DateInit { get; set; }

        /// <summary>
        /// Gets or sets the end date for the document search (YYYY-MM-DD).
        /// </summary>
        public string DateEnd { get; set; }

        /// <summary>
        /// Gets or sets the currency code of the document.
        /// </summary>
        public string DocCurrency { get; set; }
    }

    /// <summary>
    /// Base filter for identifying a single document by entry key.
    /// </summary>
    public class FilterBaseDocument
    {
        /// <summary>
        /// Gets or sets the document entry (primary key).
        /// </summary>
        public int DocEntry { get; set; }
    }

    /// <summary>
    /// Filters a single sales order by document entry.
    /// </summary>
    public class FilterOrder : FilterBaseDocument
    {
    }

    /// <summary>
    /// Filters multiple sales orders using base document criteria.
    /// </summary>
    public class FilterOrders : FilterBaseDocuments
    {
    }

    /// <summary>
    /// Filters delivery notes using base document criteria.
    /// </summary>
    public class FilterDeliveryNotes : FilterBaseDocuments
    {
    }

    /// <summary>
    /// This class is used to one document delivery notes
    /// </summary>
    public class FilterOneDeliveryNotes : FilterBaseDocument
    {
    }

    /// <summary>
    /// Filter for a single sales quotation.
    /// </summary>
    public class FilterQuotation : FilterBaseDocument
    {
    }

    /// <summary>
    /// Filter for a collection of sales quotations.
    /// </summary>
    public class FilterQuotations : FilterBaseDocuments
    {
    }

    /// <summary>
    /// Filter for a collection of accounts receivable down payments.
    /// </summary>
    public class FilterARDownPayments : FilterBaseDocuments
    {
    }

    /// <summary>
    /// Filter for a single accounts receivable down payment.
    /// </summary>
    public class FilterARDownPayment : FilterBaseDocument
    {
    }

    /// <summary>
    /// Filter for a collection of sales invoices.
    /// </summary>
    public class FilterInvoices : FilterBaseDocuments
    {
        public string DStatus { get; set; }
        public string Delivery { get; set; }
    }

    /// <summary>
    /// Filter for a single sales invoice.
    /// </summary>
    public class FilterInvoice : FilterBaseDocument
    {
    }

    /// <summary>
    /// Filter to applied on get approval requests history of and approval model
    /// </summary>
    public class FilterApprovalRequests
    {
        /// <summary>
        /// DrafEntry associated on the current approval model 
        /// </summary>
        public int DraftEntry { get; set; }
        /// <summary>
        /// Current approval status for filter
        /// </summary>
        public string ApprovalStatus { get; set; }
        /// <summary>
        /// Document type defined as a SAP object number
        /// </summary>
        public string DocType { get; set; }
        /// <summary>
        /// Initial date applied to the filter
        /// </summary>
        public string DateInit { get; set; }
        /// <summary>
        /// Ended date applied to the filter
        /// </summary>
        public string DateEnd { get; set; }
    }

    /// <summary>
    /// Filter by approval request code.
    /// </summary>
    public class FilterApprovalRequestByCode
    {
        /// <summary>
        /// Approval request identifier.
        /// </summary>
        public int Code { get; set; }
    }

    /// <summary>
    /// Base filter by business partner code.
    /// </summary>
    public class FilterBaseByCardCode
    {
        /// <summary>
        /// Business partner code (CardCode).
        /// </summary>
        public string CardCode { get; set; }
    }

    /// <summary>
    /// Filter for a specific business partner.
    /// </summary>
    public class FilterBusinessPartner : FilterBaseByCardCode
    {
    }

    /// <summary>
    /// Filter for item prices based on item code and price list.
    /// </summary>
    public class FilterItemPrices
    {
        /// <summary>
        /// Item code.
        /// </summary>
        public string ItemCode { get; set; }

        /// <summary>
        /// Price list identifier.
        /// </summary>
        public int PriceList { get; set; }
    }

    /// <summary>
    /// Filter for barcode-related item master data.
    /// </summary>
    public class FilterBarcodesMasterData
    {
        /// <summary>
        /// Item code.
        /// </summary>
        public string ItemCode { get; set; }
    }

    /// <summary>
    /// Filter for structure data by type.
    /// </summary>
    public class FilterStructures
    {
        /// <summary>
        /// Structure type (e.g., BOM, KIT).
        /// </summary>
        public string StructType { get; set; }
    }

    /// <summary>
    /// Filter for a specific item based on multiple criteria.
    /// </summary>
    public class FilterItem
    {
        /// <summary>
        /// Item code.
        /// </summary>
        public string ItemCode { get; set; }

        /// <summary>
        /// Warehouse code.
        /// </summary>
        public string WhsCode { get; set; }

        /// <summary>
        /// Price list identifier.
        /// </summary>
        public int PriceList { get; set; }

        /// <summary>
        /// Business partner code.
        /// </summary>
        public string CardCode { get; set; }

        /// <summary>
        /// Indicates if it is a purchasing item (Y/N).
        /// </summary>
        public string PrchseItem { get; set; }

        /// <summary>
        /// System number identifier.
        /// </summary>
        public int SysNumber { get; set; }
    }

    /// <summary>
    /// Filter for multiple items by warehouse.
    /// </summary>
    public class FilterItems : FilterBaseWhsCode
    {
    }

    /// <summary>
    /// Filter for paginated item results.
    /// </summary>
    public class FilterItemsPagination
    {
        /// <summary>
        /// Item code.
        /// </summary>
        public string ItemCode { get; set; }

        /// <summary>
        /// Warehouse code.
        /// </summary>
        public string WhsCode { get; set; }
    }

    /// <summary>
    /// Filter master data by item code.
    /// </summary>
    public class FilterMasterDataItem
    {
        /// <summary>
        /// Item code.
        /// </summary>
        public string ItemCode { get; set; }
    }

    /// <summary>
    /// Filter master data by business partner code.
    /// </summary>
    public class FilterMasterDataBusinessPartners
    {
        /// <summary>
        /// Business partner code.
        /// </summary>
        public string CardCode { get; set; }
    }

    /// <summary>
    /// Filter for unit of measure master data.
    /// </summary>
    public class FilterUoMMasterData
    {
        /// <summary>
        /// Item code.
        /// </summary>
        public string ItemCode { get; set; }

        /// <summary>
        /// Price list identifier.
        /// </summary>
        public int PriceList { get; set; }

        /// <summary>
        /// Indicates if the item is for purchasing (Y/N).
        /// </summary>
        public string PrchseItem { get; set; }
    }

    /// <summary>
    /// Filter for document series by user, company, and type.
    /// </summary>
    public class FilterSeries
    {
        /// <summary>
        /// User identifier.
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Company identifier.
        /// </summary>
        public int CompanyId { get; set; }

        /// <summary>
        /// Document type identifier.
        /// </summary>
        public int DocumentType { get; set; }
    }

    /// <summary>
    /// Filter for series by object code.
    /// </summary>
    public class FilterSeriesByObjectCode
    {
        /// <summary>
        /// SAP object code (e.g., 13 for invoice).
        /// </summary>
        public string ObjectCode { get; set; }
    }

    /// <summary>
    /// Filter for purchase documents by user, dates, and status.
    /// </summary>
    public class FilterPurchaseDocuments
    {
        /// <summary>
        /// Salesperson code.
        /// </summary>
        public int SlpCode { get; set; }

        /// <summary>
        /// Start date for filtering (YYYY-MM-DD).
        /// </summary>
        public string DateFrom { get; set; }

        /// <summary>
        /// End date for filtering (YYYY-MM-DD).
        /// </summary>
        public string DateTo { get; set; }

        /// <summary>
        /// Document number.
        /// </summary>
        public int DocNum { get; set; }

        /// <summary>
        /// Document status (e.g., O, C).
        /// </summary>
        public string DocStatus { get; set; }

        /// <summary>
        /// Business partner code.
        /// </summary>
        public string CardCode { get; set; }

        /// <summary>
        /// Business partner name.
        /// </summary>
        public string CardName { get; set; }
    }

    /// <summary>
    /// Filter for a specific purchase order.
    /// </summary>
    public class FilterPurchaseOrder
    {
        /// <summary>
        /// Document entry identifier.
        /// </summary>
        public int DocEntry { get; set; }
    }

    /// <summary>
    /// Filter user permissions by user and company.
    /// </summary>
    public class FilterPermissionByUser
    {
        /// <summary>
        /// User identifier.
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Company identifier.
        /// </summary>
        public int CompanyId { get; set; }
    }

    /// <summary>
    /// Filter for open invoices eligible for payment.
    /// </summary>
    public class FilterInvoiceOpenForPayReceived
    {
        /// <summary>
        /// Business partner code.
        /// </summary>
        public string CardCode { get; set; }

        /// <summary>
        /// Document currency (e.g., USD, CRC).
        /// </summary>
        public string DocCurrency { get; set; }

        /// <summary>
        /// Start date for filtering.
        /// </summary>
        public string DateInit { get; set; }

        /// <summary>
        /// End date for filtering.
        /// </summary>
        public string DateEnd { get; set; }
    }

    /// <summary>
    /// Filter terminals by ID.
    /// </summary>
    public class FilterTerminalsById
    {
        /// <summary>
        /// Terminal ID.
        /// </summary>
        public int Id { get; set; }
    }

    /// <summary>
    /// Filter terminals by user and company.
    /// </summary>
    public class FilterTermByUserIdAndCompanyId
    {
        /// <summary>
        /// Company identifier.
        /// </summary>
        public int CompanyId { get; set; }

        /// <summary>
        /// User identifier.
        /// </summary>
        public int UserId { get; set; }
    }

    /// <summary>
    /// Filter for test license records.
    /// </summary>
    public class FilterTestLicense
    {
        /// <summary>
        /// License ID.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Company identifier.
        /// </summary>
        public int CompanyId { get; set; }
    }

    /// <summary>
    /// Filter user-defined fields (UDFs) by category and company.
    /// </summary>
    public class FilterUdfs
    {
        /// <summary>
        /// UDF category.
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// Company identifier.
        /// </summary>
        public int CompanyId { get; set; }
    }

    /// <summary>
    /// Filter UDFs by table identifier.
    /// </summary>
    public class FilterUdfsByTableId
    {
        /// <summary>
        /// Table ID in SAP (e.g., OCRD).
        /// </summary>
        public string TableID { get; set; }
    }

    /// <summary>
    /// Filter for UDFs by data source and context.
    /// </summary>
    public class FilterUdfsDBO
    {
        /// <summary>
        /// Data source name.
        /// </summary>
        public string DataSource { get; set; }

        /// <summary>
        /// Type of the DBO (e.g., Query, View).
        /// </summary>
        public string DboType { get; set; }

        /// <summary>
        /// Filter value.
        /// </summary>
        public string Value { get; set; }

        /// <summary>
        /// Company identifier.
        /// </summary>
        public int CompanyId { get; set; }

        /// <summary>
        /// User identifier.
        /// </summary>
        public int UserId { get; set; }
    }

    /// <summary>
    /// Filter for a payment document to cancel.
    /// </summary>
    public class FilterPaymentForCancel
    {
        /// <summary>
        /// Document entry to cancel.
        /// </summary>
        public int DocEntry { get; set; }
    }

    /// <summary>
    /// Filter for SAP users by user code.
    /// </summary>
    public class FilterUserSAP
    {
        /// <summary>
        /// SAP user code.
        /// </summary>
        public string UserCode { get; set; }
    }

    /// <summary>
    /// Filter stock availability by item and warehouse.
    /// </summary>
    public class FilterStockInWarehouses
    {
        /// <summary>
        /// Item code.
        /// </summary>
        public string ItemCode { get; set; }

        /// <summary>
        /// Warehouse code.
        /// </summary>
        public string Warehouse { get; set; }
    }

    /// <summary>
    /// This class is used filter data in queryString of service ayer
    /// </summary>
    public class FilterStockAvailable
    {
        /// <summary>
        /// Item Code
        /// </summary>
        public string ItemCode { get; set; }
        /// <summary>
        /// Warehouse code
        /// </summary>
        public string WhsCode { get; set; }
    }

    /// <summary>
    /// Filter for cash closing reports.
    /// </summary>
    public class FilterCashClosing
    {
        /// <summary>
        /// Company identifier.
        /// </summary>
        public int CompanyId { get; set; }

        /// <summary>
        /// Start date for filtering.
        /// </summary>
        public DateTime DateFrom { get; set; }

        /// <summary>
        /// End date for filtering.
        /// </summary>
        public DateTime DateTo { get; set; }

        /// <summary>
        /// User who performed the closing.
        /// </summary>
        public string User { get; set; }
    }

    /// <summary>
    /// Filter for locating payment documents eligible for cancellation.
    /// </summary>
    public class FilterPaymentsForCancel
    {
        /// <summary>
        /// Start date for filtering.
        /// </summary>
        public string DateFrom { get; set; }

        /// <summary>
        /// End date for filtering.
        /// </summary>
        public string DateTo { get; set; }

        /// <summary>
        /// Business partner code.
        /// </summary>
        public string CardCode { get; set; }
    }

    /// <summary>
    /// Represents a filter used to retrieve or cancel payment records, 
    /// including filtering by currency and type.
    /// Inherits from <see cref="FilterPaymentsForCancel"/>.
    /// </summary>
    public class FilterPayments : FilterPaymentsForCancel
    {
        /// <summary>
        /// Gets or sets the currency used to filter payments (e.g., "USD", "EUR").
        /// </summary>
        public string Currency { get; set; }

        /// <summary>
        /// Gets or sets the type of payment to filter (e.g., "Cash", "Transfer").
        /// </summary>
        public string Type { get; set; }
    }

    /// <summary>
    /// Filter for payment processor transactions using DocEntry.
    /// </summary>
    public class FilterPPTransactionDocEntry : FilterBaseDocEntry
    {
    }

    /// <summary>
    /// Filter for voided payment processor transactions.
    /// </summary>
    public class FilterPPVoidTransaction
    {
        /// <summary>
        /// Start date for filtering.
        /// </summary>
        public string DateFrom { get; set; }

        /// <summary>
        /// End date for filtering.
        /// </summary>
        public string DateTo { get; set; }

        /// <summary>
        /// User email address.
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// Company identifier.
        /// </summary>
        public int CompanyId { get; set; }

        /// <summary>
        /// Terminal identifier.
        /// </summary>
        public string Terminal { get; set; }
    }

    /// <summary>
    /// Filter for payment processor transactions by document key.
    /// </summary>
    public class FilterPPTransactionDocumentKey
    {
        /// <summary>
        /// Unique document key.
        /// </summary>
        public string DocumentKey { get; set; }
    }

    /// <summary>
    /// Filter for available batches for item transfers.
    /// </summary>
    public class FilterBatchesForTransfer
    {
        /// <summary>
        /// Item code.
        /// </summary>
        public string ItemCode { get; set; }

        /// <summary>
        /// Warehouse code.
        /// </summary>
        public string WhsCode { get; set; }

        /// <summary>
        /// Bin location identifier.
        /// </summary>
        public int BinAbs { get; set; }
    }

    /// <summary>
    /// Filter for available items for transfer.
    /// </summary>
    public class FilterItemsForTransfer
    {
        /// <summary>
        /// Warehouse code.
        /// </summary>
        public string WhsCode { get; set; } = string.Empty;

        /// <summary>
        /// Bin location identifier.
        /// </summary>
        public int BinAbs { get; set; }

        /// <summary>
        /// Default warehouse code.
        /// </summary>
        public string WarehouseDefault { get; set; } = string.Empty;
    }

    /// <summary>
    /// Filter for items available for transfer with pagination.
    /// </summary>
    public class FilterItemsForTransferPagination
    {
        /// <summary>
        /// Warehouse code.
        /// </summary>
        public string WhsCode { get; set; } = string.Empty;

        /// <summary>
        /// Bin location identifier.
        /// </summary>
        public int BinAbs { get; set; }

        /// <summary>
        /// Default warehouse code.
        /// </summary>
        public string WarehouseDefault { get; set; } = string.Empty;

        /// <summary>
        /// Item code.
        /// </summary>
        public string ItemCode { get; set; } = string.Empty;
    }

    /// <summary>
    /// Filter for transfer request items by warehouse.
    /// </summary>
    public class FilterItemsForTransferRequest : FilterBaseWhsCode
    {
    }

    /// <summary>
    /// Filter for transfer request items with pagination.
    /// </summary>
    public class FilterItemsForTransferRequestPagination : FilterBaseWhsCode
    {
        /// <summary>
        /// Item code.
        /// </summary>
        public string ItemCode { get; set; } = string.Empty;
    }

    /// <summary>
    /// Filter for warehouse locations involved in transfers.
    /// </summary>
    public class FilterLocationForTransfer : FilterBaseWhsCode
    {
    }

    /// <summary>
    /// Filter for warehouse locations with pagination.
    /// </summary>
    public class FilterLocationForTransferPagination : FilterBaseWhsCode
    {
        /// <summary>
        /// Location code or name.
        /// </summary>
        public string Location { get; set; }
    }

    /// <summary>
    /// Filter for business partner addresses.
    /// </summary>
    public class BusinessPartnerLocationFilter
    {
        /// <summary>
        /// Business partner code.
        /// </summary>
        public string CardCode { get; set; }

        /// <summary>
        /// Address type identifier (e.g., bill-to, ship-to).
        /// </summary>
        public int AddressType { get; set; }

        /// <summary>
        /// Address ID or alias.
        /// </summary>
        public string AddressId { get; set; }
    }

    /// <summary>
    /// Filter for transfer request documents.
    /// </summary>
    public class FilterTransferRequests
    {
        /// <summary>
        /// Document number.
        /// </summary>
        public int DocNum { get; set; }

        /// <summary>
        /// Start date for filtering.
        /// </summary>
        public string DateInit { get; set; }

        /// <summary>
        /// End date for filtering.
        /// </summary>
        public string DateEnd { get; set; }

        /// <summary>
        /// Salesperson code.
        /// </summary>
        public int SlpCode { get; set; }

        /// <summary>
        /// Document status (e.g., Open, Closed).
        /// </summary>
        public string DocStatus { get; set; }
    }

    /// <summary>
    /// Filter for series used in transfer copy operations.
    /// </summary>
    public class FilterSeriesForTransferCopy : FilterBaseWhsCodeItemCode
    {
    }

    /// <summary>
    /// Filter for retrieving geo-location configuration per user.
    /// </summary>
    public class FilterGeoConfigByUser
    {
        /// <summary>
        /// User identifier.
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Company identifier.
        /// </summary>
        public int CompanyId { get; set; }
    }

    /// <summary>
    /// Filter for route configuration.
    /// </summary>
    public class RouteFilter
    {
        /// <summary>
        /// Route identifier.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Company identifier.
        /// </summary>
        public int CompanyId { get; set; }
    }

    /// <summary>
    /// Filter for a business partner by tax ID.
    /// </summary>
    public class BusinessPartnerFilter
    {
        /// <summary>
        /// Tax identification number.
        /// </summary>
        public string LicTradNum { get; set; }
    }

    /// <summary>
    /// Filter for searching items by XML name.
    /// </summary>
    public class ItemXmlFilter
    {
        /// <summary>
        /// Item name used in XML documents.
        /// </summary>
        public string ItemNameXml { get; set; }
    }

    /// <summary>
    /// Filter for locating tax configurations by rate.
    /// </summary>
    public class TaxeFilter
    {
        /// <summary>
        /// Tax rate percentage.
        /// </summary>
        public double Rate { get; set; }
    }

    /// <summary>
    /// Filter for item detail lookup based on document type.
    /// </summary>
    public class FilterItemDetail
    {
        /// <summary>
        /// Item code.
        /// </summary>
        public string ItemCode { get; set; }

        /// <summary>
        /// Document type (e.g., quotation, order).
        /// </summary>
        public string DocType { get; set; }
    }

    /// <summary>
    /// Filter for UDFs by table names (multiple).
    /// </summary>
    public class FilterUdfsByTable
    {
        /// <summary>
        /// Comma-separated list of table names.
        /// </summary>
        public string Tables { get; set; }
    }

    /// <summary>
    /// Filter for retrieving UDF (user-defined field) data based on document context.
    /// </summary>
    public class FilterKeyUdf
    {
        /// <summary>
        /// Internal document identifier (DocEntry).
        /// </summary>
        public int DocEntry { get; set; }

        /// <summary>
        /// Line number of the document.
        /// </summary>
        public int LineNum { get; set; }

        /// <summary>
        /// Business partner code associated with the document.
        /// </summary>
        public string CardCode { get; set; }

        /// <summary>
        /// Item code referenced in the document.
        /// </summary>
        public string ItemCode { get; set; }

        /// <summary>
        /// Document type (e.g., Invoice, Quotation).
        /// </summary>
        public string TypeDocument { get; set; }

        /// <summary>
        /// Draft type to determine the configured fields.
        /// </summary>
        public string DraftType { get; set; }
    }

    /// <summary>
    /// Filter for locating a record by unique document key and table.
    /// </summary>
    public class FilterUniqueId
    {
        /// <summary>
        /// Unique document key (usually from a UDF).
        /// </summary>
        public string U_DocumentKey { get; set; }

        /// <summary>
        /// Table name where the document is stored.
        /// </summary>
        public string Table { get; set; }
    }

    /// <summary>
    /// Filter for retrieving document series assigned to a specific user and company.
    /// </summary>
    public class SerieByUserFilter
    {
        /// <summary>
        /// User assignment identifier.
        /// </summary>
        public int UserAssingId { get; set; }

        /// <summary>
        /// Company identifier.
        /// </summary>
        public int CompanyId { get; set; }
    }

    /// <summary>
    /// The class is used to map the values to be replaced in the queryString that is used to filter in the service layer
    /// </summary>
    public class SerialFilter
    {
        /// <summary>
        /// Current company ID
        /// </summary>
        public int CompanyId { get; set; }
        /// <summary>
        /// Document object number in sap
        /// </summary>
        public int DocumentType { get; set; }
        /// <summary>
        /// User ID assigned to licenses and companies
        /// </summary>
        public int UserAssingId { get; set; }
    }

    /// <summary>
    /// Filter for identifying item price deviations.
    /// </summary>
    public class ItemDeviationFilter
    {
        /// <summary>
        /// Average price of the item.
        /// </summary>
        public double AVGPrice { get; set; }

        /// <summary>
        /// Last recorded price of the item.
        /// </summary>
        public double LastPrice { get; set; }

        /// <summary>
        /// Item code.
        /// </summary>
        public string ItemCode { get; set; }
    }

    /// <summary>
    /// Filter for searching user permissions.
    /// </summary>
    public class PermissionsFilter
    {
        /// <summary>
        /// Search string or keyword.
        /// </summary>
        public string SearchCriteria { get; set; }

        /// <summary>
        /// Indicates whether the permission should be active.
        /// </summary>
        public bool ShouldBeActive { get; set; }
    }

    /// <summary>
    /// Filter for calculating transaction totals.
    /// </summary>
    public class FilterTransactionTotal
    {
        /// <summary>
        /// Local currency code.
        /// </summary>
        public string LocalCurrency { get; set; }

        /// <summary>
        /// Terminal identifier.
        /// </summary>
        public string TerminalId { get; set; }

        /// <summary>
        /// Currency exchange rate.
        /// </summary>
        public decimal Rate { get; set; }
    }

    /// <summary>
    /// Filter for checking if a barcode exists.
    /// </summary>
    public class FilterExistsBarcode
    {
        /// <summary>
        /// Barcode to search for.
        /// </summary>
        public string BarCode { get; set; }
    }

    /// <summary>
    /// Filter for retrieving blanket agreements by business partner.
    /// </summary>
    public class FilterBlanketAgreement : FilterBaseByCardCode
    {
    }

    /// <summary>
    /// Filter for retrieving available mobile batches by item and warehouse.
    /// </summary>
    public class MobileBatchesFilter
    {
        /// <summary>
        /// Item code.
        /// </summary>
        public string ItemCode { get; set; }

        /// <summary>
        /// Warehouse code.
        /// </summary>
        public string WhsCode { get; set; }
    }

    /// <summary>
    /// Filter for batch allocations in mobile scenarios.
    /// </summary>
    public class MobileBatchesAllocationsFilter
    {
        /// <summary>
        /// Item code.
        /// </summary>
        public string ItemCode { get; set; }

        /// <summary>
        /// Warehouse code.
        /// </summary>
        public string WhsCode { get; set; }

        /// <summary>
        /// Batch number.
        /// </summary>
        public string BatchNumber { get; set; }
    }

    /// <summary>
    /// Filter for retrieving tax code determination values.
    /// </summary>
    public class FilterTaxCodeDeterMination
    {
        /// <summary>
        /// Value taken from the item master (OITM).
        /// </summary>
        public string OITMValue { get; set; }
    }

    /// <summary>
    /// Filter for tax code determination based on item and partner.
    /// </summary>
    public class FilterConditionTaxCodeDeterMination
    {
        /// <summary>
        /// Item code.
        /// </summary>
        public string ItemCode { get; set; }

        /// <summary>
        /// Business partner code.
        /// </summary>
        public string CardCode { get; set; }
    }

    /// <summary>
    /// Filter for listing material items.
    /// </summary>
    public class FilterListMaterial
    {
        /// <summary>
        /// Item code.
        /// </summary>
        public string ItemCode { get; set; }

        /// <summary>
        /// Warehouse code.
        /// </summary>
        public string WhsCode { get; set; }

        /// <summary>
        /// Price list identifier.
        /// </summary>
        public int PriceList { get; set; }
    }

    /// <summary>
    /// Filter for SAP item series.
    /// </summary>
    public class FilterSeriesSap
    {
        /// <summary>
        /// Item code.
        /// </summary>
        public string ItemCode { get; set; }

        /// <summary>
        /// Warehouse code.
        /// </summary>
        public string WhsCode { get; set; }
    }

    /// <summary>
    /// Filter for partner addresses with optional pattern matching.
    /// </summary>
    public class FilterAddress : FilterBaseByCardCode
    {
        /// <summary>
        /// Optional address pattern to search by.
        /// </summary>
        public string Pattern { get; set; }
    }

    /// <summary>
    /// Filter for retrieving stored transactions from payment processor.
    /// </summary>
    public class FilterPPStoredTransaction
    {
        /// <summary>
        /// Sync user who performed the transaction.
        /// </summary>
        public string SyncUser { get; set; }

        /// <summary>
        /// Company identifier.
        /// </summary>
        public int CompanyId { get; set; }

        /// <summary>
        /// Terminal identifier.
        /// </summary>
        public string TerminalId { get; set; }

        /// <summary>
        /// Start date for filtering.
        /// </summary>
        public string DateInit { get; set; }

        /// <summary>
        /// End date for filtering.
        /// </summary>
        public string DateEnd { get; set; }
    }

    /// <summary>
    /// Filter for retrieving item price list lines in different currencies.
    /// </summary>
    public class FilterLinesCurrencies
    {
        /// <summary>
        /// Item code.
        /// </summary>
        public string ItemCode { get; set; }

        /// <summary>
        /// Price list identifier.
        /// </summary>
        public int PriceList { get; set; }
    }

    /// <summary>
    /// Filter for retrieving business partners via mobile app sync.
    /// </summary>
    public class FilterBusinessPartnersMobile
    {
        /// <summary>
        /// Salesperson code.
        /// </summary>
        public int SlpCode { get; set; }

        /// <summary>
        /// Last update timestamp or ID used for incremental sync.
        /// </summary>
        public int LastUpdate { get; set; }
    }

    /// <summary>
    /// Used to filter prices request
    /// </summary>
    public class PricesFilter
    {
        /// <summary>
        /// Date of the last synchronization in the mobile
        /// </summary>
        public int LastUpdate { get; set; }
    }

    /// <summary>
    /// Used to filter items request
    /// </summary>
    public class ItemsSyncFilter
    {
        /// <summary>
        /// Date of the last synchronization in the mobile
        /// </summary>
        public int LastUpdate { get; set; }
    }
    
    /// <summary>
    /// Used to filter blanket agreement request
    /// </summary>
    public class BlanketAgreementSyncFilter
    {
        /// <summary>
        /// Date of the last synchronization in the mobile
        /// </summary>
        public int LastUpdate { get; set; }
    }
    
    /// <summary>
    /// Used to filter blanket agreement request
    /// </summary>
    public class BlanketAgreementsFilter
    {
        /// <summary>
        /// Cardcode of client
        /// </summary>
        public string CardCode { get; set; }
        
        /// <summary>
        /// Date of the last synchronization in the mobile
        /// </summary>
        public DateTime  Date { get; set; }
    }
    
    /// <summary>
    /// Used to filter discount groupds request
    /// </summary>
    public class DiscountGroupSyncFilter
    {
        /// <summary>
        /// Date of the last synchronization in the mobile
        /// </summary>
        public int LastUpdate { get; set; }
    }
    
    /// <summary>
    /// Used to filter price lists request
    /// </summary>
    public class PriceListsSyncFilter
    {
        /// <summary>
        /// Date of the last synchronization in the mobile
        /// </summary>
        public int LastUpdate { get; set; }
    }
    
    /// <summary>
    /// Used to filter bill of materials request
    /// </summary>
    public class BillOfMaterialsSyncFilter
    {
        /// <summary>
        /// Date of the last synchronization in the mobile
        /// </summary>
        public int LastUpdate { get; set; }
    }

    /// <summary>
    /// Filter for retrieving authorization data for a specific document.
    /// </summary>
    public class FilterAuthorizationDocument
    {
        /// <summary>
        /// Type of the document (e.g., Invoice, Quotation).
        /// </summary>
        public string DocumentType { get; set; }

        /// <summary>
        /// Unique key identifying the document.
        /// </summary>
        public string DocumentKey { get; set; }
    }

    /// <summary>
    /// Filter for retrieving business partner groups by group type.
    /// </summary>
    public class FilterBpGroups
    {
        /// <summary>
        /// Type of the group (e.g., Customer, Vendor).
        /// </summary>
        public string GroupType { get; set; }
    }

    /// <summary>
    /// Filter for consolidating business partners by card type and currency.
    /// </summary>
    public class FilterConsolidationBusinessPartner
    {
        /// <summary>
        /// Card type (e.g., C for Customer, S for Supplier).
        /// </summary>
        public string CardType { get; set; }

        /// <summary>
        /// Currency code (e.g., USD, CRC).
        /// </summary>
        public string Currency { get; set; }
    }

    /// <summary>
    /// Filter for consolidating business partners using two currencies.
    /// </summary>
    public class FilterConsolidationBusinessPartnerByTwoCurrency
    {
        /// <summary>
        /// Card type (e.g., Customer or Supplier).
        /// </summary>
        public string CardType { get; set; }

        /// <summary>
        /// First currency code.
        /// </summary>
        public string CurrencyOne { get; set; }

        /// <summary>
        /// Second currency code.
        /// </summary>
        public string CurrencyTwo { get; set; }
    }

    /// <summary>
    /// Filter for retrieving discounts applied to a specific item and business partner.
    /// </summary>
    public class FilterDiscountByItem
    {
        /// <summary>
        /// Business partner code.
        /// </summary>
        public string CardCode { get; set; }

        /// <summary>
        /// Item code.
        /// </summary>
        public string ItemCode { get; set; }
    }

    /// <summary>
    /// Filter for retrieving multiple discounts applied to an item, including group type.
    /// </summary>
    public class FilterDiscountsByItem : FilterDiscountByItem
    {
        /// <summary>
        /// Group type for discount rules (e.g., customer group, item group).
        /// </summary>
        public string GroupType { get; set; }
    }

    /// <summary>
    /// Filter for simulated approval queries
    /// </summary>
    public class FilterApprovalQuery
    {
        /// <summary>
        /// CardCode of the current approval document
        /// </summary>
        public string CardCode { get; set; }
        /// <summary>
        /// DocumentType applied
        /// </summary>
        public int DocType { get; set; }
        /// <summary>
        /// Current SAP license used on process
        /// </summary>
        public string SapLicense { get; set; }
    }

    /// <summary>
    /// Filter for retrieving states or provinces by country.
    /// </summary>
    public class FilterStates
    {
        /// <summary>
        /// Country code (e.g., US, CR, MX).
        /// </summary>
        public string Country { get; set; }
    }

    /// <summary>
    /// Filter to get documents drafts
    /// </summary>
    public class FilterDrafts : FilterBaseDocuments
    {
        public string ObjType { get; set; }
    }
    /// <summary>
    /// Filter to get document draft
    /// </summary>
    public class FilterDraft : FilterBaseDocument
    {
    }
    
    /// <summary>
    /// Filter to find business partner matches
    /// </summary>
    public class FilterSearchMasterDataBusinessPartner
    {
        /// <summary>
        /// Represents value to look for in business partners
        /// </summary>
        public string FilterBusinessPartner { get; set; }
    }

    /// <summary>
    /// This class is used to filter routes
    /// </summary>
    public class FilterRoutes
    {
        /// <summary>
        /// This property is company id
        /// </summary>
        public int CompanyId { get; set; }
        /// <summary>
        /// This property is end date
        /// </summary>
        public DateTime EndDate { get; set; }
        /// <summary>
        /// This property is name route
        /// </summary>
        public string Name { get; set; }
        /// <summary>
        /// This property is skip records
        /// </summary>
        public int Skip { get; set; }
        /// <summary>
        /// This property is start date
        /// </summary>
        public DateTime StartDate { get; set; }
        /// <summary>
        /// This property is state
        /// </summary>
        public int State { get; set; }
        /// <summary>
        /// This property is take records
        /// </summary>
        public int Take { get; set; }
        /// <summary>
        /// This property is user assing
        /// </summary>
        public int UserAssing { get; set; }
    }

    /// <summary>
    /// Filter to find business partner matches
    /// </summary>
    public class FilterSearchMasterDataItem
    {
        /// <summary>
        /// Represents value to look for in business partners
        /// </summary>
        public string FilterItem { get; set; }
    }

    /// <summary>
    /// This class is used filter print zpl to cash closing
    /// </summary>
    public class FilterPrintCashClosing : FilterUserBase
    {
        public int Id { get; set; }

    }

    /// <summary>
    /// Filter to find business partner to activate
    /// </summary>
    public class FilterBusinessPartnerToActivate
    {
        public string DateFrom { get; set; }
        public string DateTo { get; set; }
        public string Customer { get; set; }
    }

    /// <summary>
    /// Used to filter price list request
    /// </summary>
    public class PriceListInfoFilter
    {
        /// <summary>
        /// The number of the price list
        /// </summary>
        public int PriceListNum { get; set; }
    }

    /// <summary>
    /// This class is used to model queryString
    /// </summary>
    public class FilterContactPerson
    {
        /// <summary>
        /// This property represent card code in query string
        /// </summary>
        public string CardCode { get; set; }
    }

    /// <summary>
    /// This class is used to filter documents
    /// </summary>
    public class FilterDocumentActivities
    {
        /// <summary>
        /// Number Documents
        /// </summary>
        public int DocNum { get; set; }
    }

    /// <summary>
    /// Filter credit note 
    /// </summary>
    public class FilterCreditNote : FilterBaseDocument
    {
    }

    /// <summary>
    ///  Filter credit notes
    /// </summary>
    public class FilterCreditNotes : FilterBaseDocuments
    {
    }

    /// <summary>
    /// This class is used to represent the queryString filter
    /// </summary>
    public class FilterItemsActivities
    {
        /// <summary>
        /// property description
        /// </summary>
        public string Description { get; set; }
    }
    
    /// <summary>
    /// This class is used to mapper querstring
    /// </summary>
    public class FilterSearchActivities
    {
        /// <summary>
        /// property DateFrom
        /// </summary>
        public string DateFrom { get; set; }
        /// <summary>
        /// property DateTo
        /// </summary>
        public string DateTo { get; set; }

        /// <summary>
        /// property Code
        /// </summary>
        public int ActivityCode { get; set; }
        /// <summary>
        /// property CardCode
        /// </summary>
        public string CardCode { get; set; }
    }

    /// <summary>
    /// This class is used to mapper querstring
    /// </summary>
    public class FilterDetailActivity
    {
        /// <summary>
        /// property Code
        /// </summary>
        public int ActivityCode { get; set; }
    }

    /// <summary>
    /// Represent the properties to filter the attachment request
    /// </summary>
    public class AttachmentFilter
    {
        /// <summary>
        /// Unique identifier of the attachment
        /// </summary>
        public int AttachmentEntry { get; set; }
    }
    
    /// <summary>
    /// Filter to find countries activity matches
    /// </summary>
    public class FilterCountriesActivity
    {
        /// <summary>
        /// Represents value to look for in Countries activity
        /// </summary>
        public string FilterCountry { get; set; }
    }
    
    /// <summary>
    /// Filter to find states countries activity matches
    /// </summary>
    public class FilterStatesCountriesActivity
    {
        /// <summary>
        /// Represents value to look for in states Countries activity
        /// </summary>
        public string CountryCode { get; set; }
    }

    /// <summary>
    /// Filter for retrieving a stock transfer request by document entry.
    /// </summary>
    public class FilterStockTransferRequestByDocEntry
    {
        /// <summary>
        /// Document entry identifier.
        /// </summary>
        public int DocEntry { get; set; }
    }

    /// <summary>
    /// Represents a filter used to identify specific draft documents for approval processes
    /// </summary>
    public class FilterApproveDRafts
    {
        /// <summary>
        /// Gets or sets the internal identifier of the draft document (DocEntry).
        /// </summary>
        public int DocEntry { get; set; }

        /// <summary>
        /// Gets or sets the WtmCode associated with the draft document.
        /// </summary>
        public int WtmCode { get; set; }
    }

    /// <summary>
    /// Filter for retrieving license information assigned to a user within a company.
    /// </summary>
    public class FilterUserLicense
    {
        /// <summary>
        /// Company identifier.
        /// </summary>
        public int CompanyId { get; set; }

        /// <summary>
        /// Username or login identifier.
        /// </summary>
        public string User { get; set; }
    }

    /// <summary>
    /// Filter for retrieving distribution rules by dimension code.
    /// </summary>
    public class FilterDistributionRulesByDimension
    {
        /// <summary>
        /// Dimension code (e.g., 1 for cost center, 2 for project).
        /// </summary>
        public int DimCode { get; set; }
    }

    /// <summary>
    /// Represents a filter model used to retrieve tax withholding information based on business partner criteria.
    /// </summary>
    public class FilterWithholdingTax
    {
        /// <summary>
        /// The unique code of the business partner used as a filter for tax withholding queries.
        /// </summary>
        public string CardCode { get; set; }
    }

    /// <summary>
    /// Represents a filter used to query business partners by salesperson code.
    /// </summary>
    public class FilterBusinessPartnerSlpCode
    {
        /// <summary>
        /// Gets or sets the salesperson code used for filtering.
        /// </summary>
        public int SlpCode { get; set; }
    }

    /// <summary>
    /// Represents a filter used to query data by store identifier or name.
    /// </summary>
    public class FilterStore
    {
        /// <summary>
        /// The store code or name used as a filter.
        /// </summary>
        public string Store { get; set; }
    }

    /// <summary>
    /// Represents a filter used to search or retrieve data by account code.
    /// </summary>
    public class FilterAcctCode
    {
        /// <summary>
        /// The account code used for filtering results.
        /// </summary>
        public string AcctCode { get; set; }
    }

    /// <summary>
    /// Represents a filter used to retrieve business partners based on search criteria and salesperson code.
    /// </summary>
    public class FilterBusinessPartners
    {
        /// <summary>
        /// The search term or identifier used to filter business partners (e.g., name or code).
        /// </summary>
        public string FilterBusinessPartner { get; set; }

        /// <summary>
        /// The code of the assigned salesperson, used to further narrow down the business partners.
        /// </summary>
        public string SlpCode { get; set; }
    }

    /// <summary>
    /// Filter used to retrieve UDF (User Defined Fields) data for a specific document line.
    /// </summary>
    public class FilterUdfsLines
    {
        /// <summary>
        /// Unique identifier of the document.
        /// </summary>
        public int DocEntry { get; set; }

        /// <summary>
        /// Line number within the document.
        /// </summary>
        public int LineNum { get; set; }
    }

    /// <summary>
    /// Represents a filter to retrieve distribution rules by dimension.
    /// </summary>
    public class FilterDimension
    {
        /// <summary>
        /// Dimension code used for filtering.
        /// </summary>
        public int DimCode { get; set; }
    }

    /// <summary>
    /// Represents filter criteria for querying bank records.
    /// </summary>
    public class FilterBank
    {
        /// <summary>
        /// Gets or sets the bank code used for filtering.
        /// </summary>
        public string BankCode { get; set; }

        /// <summary>
        /// Gets or sets the bank name used for filtering.
        /// </summary>
        public string BankName { get; set; }
    }

    /// <summary>
    /// Filter for business partner addresses.
    /// </summary>
    public class BusinessPartnerLocationdsFilter
    {
        /// <summary>
        /// Business partner code.
        /// </summary>
        public string CardCode { get; set; }

        /// <summary>
        /// Address type identifier (e.g., bill-to, ship-to).
        /// </summary>
        public int AddressType { get; set; }
    }

    /// <summary>
    /// Represents the filter criteria used to query open credit notes.
    /// </summary>
    public class FilterCreditNotesOpen
    {
        /// <summary>
        /// Gets or sets the business partner code used for filtering.
        /// </summary>
        public string CardCode { get; set; }

        /// <summary>
        /// Gets or sets the document currency used for filtering.
        /// </summary>
        public string DocCurrency { get; set; }

        /// <summary>
        /// Gets or sets the start date for the filtering range (inclusive).
        /// </summary>
        public string DateInit { get; set; }

        /// <summary>
        /// Gets or sets the end date for the filtering range (inclusive).
        /// </summary>
        public string DateEnd { get; set; }
    }

    /// <summary>
    /// Filter to search for an invoice by document number (DocNum)
    /// </summary>
    public class FilterInvoiceByDocNum
    {
        /// <summary>
        /// Gets or sets the document number
        /// </summary>
        public int DocNum { get; set; }

        /// <summary>
        /// Gets or sets the document type
        /// </summary>
        public string TipoDoc { get; set; }
    }

    /// <summary>
    /// Represents the filter BP delivery address
    /// </summary>
    public class FilterDeliveryAddress : FilterBaseByCardCode
    {
        /// <summary>
        /// Address type to filtee
        /// </summary>
        public string AddressType { get; set; }
    }
}