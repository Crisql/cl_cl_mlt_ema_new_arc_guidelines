using System;
using System.Collections.Generic;
using System.Net.Http.Headers;
using System.Net.Http;
using CL.STRUCTURES.CLASSES.LocalEntities;
using CL.STRUCTURES.INTERFACES;
using CLMLTEMA.MODELS.SAP;
using System.IO;
using CL.STRUCTURES.CLASSES.ServiceLayer;

namespace CLMLTEMA.MODELS
{
    public class Otros
    {
    }

    public class ValidateInventoryTable
    {
        public string Table { get; set; }
        public string Description { get; set; }
    }
    public class ValidateAttachmnetsTable
    {
        public string Table { get; set; }
        public string Description { get; set; }
    }
    
    /// <summary>
    /// Represents the configuration for validating automatic table printing.
    /// </summary>
    public class ValidateAutomaticPrintingTable
    {
        /// <summary>
        /// The name of the table to be validated for automatic printing.
        /// </summary>
        public string Table { get; set; }
        
        /// <summary>
        /// A description of the table or the purpose of the validation.
        /// </summary>
        public string Description { get; set; }
    }

    public class InvoiceOpen
    {
        public int DocEntry { get; set; }
        public int DocNum { get; set; }
        public string DocumentType { get; set; }
        public string CardCode { get; set; }
        public string CardName { get; set; }
        public string NumAtCard { get; set; }
        public string DocCurrency { get; set; }
        public decimal Total { get; set; }
        public decimal Saldo { get; set; }
        public DateTime DocDate { get; set; }
        public DateTime DocDueDate { get; set; }
        public int InstlmntID { get; set; }
        public int TransId { get; set; }
        public decimal TotalUSD { get; set; }
        public decimal SaldoUSD { get; set; }
        public string ObjType { get; set; }
        
    }

    public class PermissionByUser
    {
        public string Name { get; set; }
    }

    public class DownloadBase64
    {
        public string Base64 { get; set; }
        public string FileName { get; set; }
        public string BlobType { get; set; }
        public string FileExtension { get; set; }
    }
    
    public class TestLicence
    {
        public string DBCode { get; set; }
        public string Password { get; set; }
        public string SLUrl { get; set; }
    }

    public class StockInWarehouses
    {
        public decimal OnHand { get; set; }
        public decimal IsCommited { get; set; }
        public decimal OnOrder { get; set; }
        public string WhsCode { get; set; }
        public string WhsName { get; set; }
        public string BinActivat { get; set; }
    }

    public class SendClashClosingReport
    {
        public string To { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
        public string UrlReport { get; set; }
    }

    public class PaymentForCancel
    {
        public int DocNumOinv { get; set; }
        public int DocEntryOinv { get; set; }
        public string DocStatus { get; set; }
        public int DocEntryPay { get; set; }
        public int DocNumPay { get; set; }
        public string DocCurrency { get; set; }
        public decimal DocTotal { get; set; }
        public decimal DocTotalFC { get; set; }
        public DateTime DocDate { get; set; }
        public string DocumentKey { get; set; }
    }

    public class OneIncomingPayment
    {
        public int DocEntryPay { get; set; }
    }

    public class IncomingPaymentDetail
    {
        public decimal CashSum { get; set; }
        public decimal CashSumFC { get; set; }
        public decimal TrsfrSum { get; set; }
        public decimal TrsfrSumFC { get; set; }
        public List<CreditVouchersDetail> CreditCards { get; set; }
    }

    public class CreditVouchersDetail
    {
        public int Id { get; set; }
        public int CreditCard { get; set; }
        public string VoucherNum { get; set; }
        public decimal CreditSum { get; set; }
        public DateTime CardValid { get; set; }
        public DateTime CollectionDate { get; set; }
        public string Account { get; set; }
        public bool IsManualEntry { get; set; }
    }

    public class FieldsBusinessPartner
    {
        public string Description { get; set; }
        public string Id { get; set; }
    }
    
    public class ItemsForTransferStock
    {
        public string ItemCode { get; set; }
        public string ItemName { get; set; }
        public string Barcode { get; set; }
        public string ManBtchNum { get; set; }
        public string ManSerNum { get; set; }
        public int SysNumber { get; set; }
        public string DistNumber { get; set; }
        public string Stock { get; set; }
        public string Typehead { get; set; }
    }

    public class TransfersRequests
    {
        public int DocEntry { get; set; }
        public int DocNum { get; set; }
        public string DocStatus { get; set; }
        public DateTime DocDate { get; set; }
        public int SlpCode { get; set; }
        public string SlpName { get; set; }
    }
    
    public class WarehouseBinLocation
    {
        public decimal OnHandQty { get; set; }
        public int AbsEntry { get; set; }
        public string BinCode { get; set; }
    }
    
    public class GeoConfigByUser
    {
        public string Key { get; set; }
        public string Name { get; set; }
    }

    public class SeriesForNC
    {
        public int SysNumber { get; set; }
        public string DistNumber { get; set; }
        public string ItemCode { get; set; }
    }

    public class BatchsForNC
    {
        public int SysNumber { get; set; }
        public string DistNumber { get; set; }
        public string ItemCode { get; set; }
        public decimal Quantity { get; set; }
    }

    public class UniqueId
    {
        public int DocEntry { get; set; }
        public int DocNum { get; set; }
    }
    
    public class SendEmailAutoritathionModel
    {
        public string To { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
    }
    
    public class SapLicencesDrafts
    {
        public string SapLicense { get; set; }
        public int DocEntry { get; set; }
        public string Email { get; set; }
    }
    
    public class UserLicences
    {
        public string Email { get; set; }
        public string Name { get; set; }
        public int CompanyId { get; set; }
        public string SapLicense { get; set; }
    }
    
    public class NotificationsDraftsSetting {
        /**
         * Id of the company where this values will be applied
         */
        public int CompanyId  { get; set; }
        /**
         * Indicates send email notifications
         */
        public bool ActiveNotifications { get; set; }
    }
    public class NotificationsBodySetting {
        /**
         * Indicate Subject
         */
        public string Subject  { get; set; }
        /**
         * Indicates body
         */
        public string Body { get; set; }
        /**
         * Indicates company
         */
        public int CompanyId { get; set; }
    }

    /// <summary>
    /// Represents a minimal resource identifier, typically used for lightweight queries.
    /// </summary>
    public class MinifiedResource
    {
        /// <summary>
        /// Gets or sets the database object identifier or name.
        /// </summary>
        public string DBObject { get; set; }
    }

    /// <summary>
    /// Represents the version information of a specific resource.
    /// </summary>
    public class ResourceVersion
    {
        /// <summary>
        /// Gets or sets the version identifier (e.g., "1.0.0") of the resource.
        /// </summary>
        public string Version { get; set; }
    }


    #region Attachment
    /// <summary>
    /// Represents a dictionary that maps file extensions to their corresponding MIME types.
    /// </summary>
    public class MimeTypeDictionary
    {
        private readonly Dictionary<string, string> mimeTypes;

        public MimeTypeDictionary()
        {
            mimeTypes = new Dictionary<string, string>
            {
                { ".pdf", "application/pdf" },
                { ".doc", "application/msword" },
                { ".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
                { ".jpg", "image/jpeg" },
                { ".jpeg", "image/jpeg" },
                { ".png", "image/png" },
                { ".txt", "text/plain" },
                { ".xls", "application/vnd.ms-excel" },
                { ".ppt", "application/vnd.ms-powerpoint" },
                { ".xml", "application/xml" }
            };
        }

        public string GetMimeType(string extension)
        {
            string mimeType;
            if (mimeTypes.TryGetValue(extension, out mimeType))
            {
                return mimeType;
            }
            throw new KeyNotFoundException(
                string.Format("MIME type for extension '{0}' not found.", extension));
        }
    }

    #endregion


}