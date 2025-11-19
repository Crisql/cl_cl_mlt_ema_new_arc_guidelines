using System.Collections.Generic;
using CL.STRUCTURES.ATTRIBUTES;
using CLMLTEMA.MODELS.SAP;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents a document header with customer information and line items.
    /// </summary>
    public class Document
    {
        /// <summary>
        /// Customer or business partner code.
        /// </summary>
        public string CardCode { get; set; }

        /// <summary>
        /// Document entry identifier (SAP internal key).
        /// </summary>
        public int DocEntry { get; set; }

        /// <summary>
        /// List of document line items.
        /// </summary>
        public List<DocumentLines> DocumentLines { get; set; }
    }

    /// <summary>
    /// Represents a single line item in a document.
    /// </summary>
    public class DocumentLines
    {
        /// <summary>
        /// Code of the item.
        /// </summary>
        public string ItemCode { get; set; }
    }

    /// <summary>
    /// Contains identification details for an issued document.
    /// </summary>
    public class DocInfo
    {
        /// <summary>
        /// Document entry identifier.
        /// </summary>
        public int DocEntry { get; set; }

        /// <summary>
        /// Document number shown to the user.
        /// </summary>
        public int DocNum { get; set; }

        /// <summary>
        /// Electronic invoice number (Número de Factura Electrónica).
        /// </summary>
        public string NumFE { get; set; }

        /// <summary>
        /// Electronic invoice key (Clave de Factura Electrónica).
        /// </summary>
        public string ClaveFE { get; set; }
    }

    /// <summary>
    /// Represent the model of the sync document raw data
    /// </summary>
    /// <typeparam name="T">The type of the document that will be deserialized</typeparam>
    public class DocumentToSync<T> where T : new()
    {
        /// <summary>
        /// Document information
        /// </summary>
        public T Document { get; set; }
        /// <summary>
        /// Document payment information
        /// </summary>
        public IncomingPayment Payment { get; set; }
        /// <summary>
        /// Name of the type of document that will be created
        /// </summary>
        public string TransactionType { get; set; }
    }

    /// <summary>
    /// Represent the model of the SAP attachment
    /// </summary>
    public class DocumentAttachment
    {
        /// <summary>
        /// Unique identifier of the attachment
        /// </summary>
        [MasterKey] 
        public int AbsoluteEntry { get; set; }
        /// <summary>
        /// Collection of attachment lines. Represent the files of this attachment object
        /// </summary>
        public List<Attachments2Line> Attachments2_Lines { get; set; }
    }

    /// <summary>
    /// Represent the interface to identify a document object
    /// </summary>
    public interface IDocument
    {
    }
}
