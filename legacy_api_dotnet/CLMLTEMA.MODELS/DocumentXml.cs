namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents an XML-formatted document structure (placeholder for full content).
    /// </summary>
    public class DocumentXml
    { 
    }

    /// <summary>
    /// Represents a detailed line item in an electronic invoice.
    /// </summary>
    public class LineaDetalle
    {
        /// <summary>
        /// Line number.
        /// </summary>
        public string NumeroLinea { get; set; }

        /// <summary>
        /// Product or service code.
        /// </summary>
        public string Codigo { get; set; }

        /// <summary>
        /// Commercial code (e.g., internal or barcode).
        /// </summary>
        public string CodigoComercial { get; set; }

        /// <summary>
        /// Quantity of items.
        /// </summary>
        public string Cantidad { get; set; }

        /// <summary>
        /// Unit of measure (standard).
        /// </summary>
        public string UnidadMedida { get; set; }

        /// <summary>
        /// Commercial unit of measure.
        /// </summary>
        public string UnidadMedidaComercial { get; set; }

        /// <summary>
        /// Description of the item or service.
        /// </summary>
        public string Detalle { get; set; }

        /// <summary>
        /// Unit price without tax.
        /// </summary>
        public string PrecioUnitario { get; set; }

        /// <summary>
        /// Total amount before discount or tax.
        /// </summary>
        public string MontoTotal { get; set; }

        /// <summary>
        /// Discount amount applied.
        /// </summary>
        public string MontoDescuento { get; set; }

        /// <summary>
        /// Reason or nature of the discount.
        /// </summary>
        public string NaturalezaDescuento { get; set; }

        /// <summary>
        /// Amount after discount, before tax.
        /// </summary>
        public string SubTotal { get; set; }

        /// <summary>
        /// Tax rate percentage.
        /// </summary>
        public string Tarifa { get; set; }

        /// <summary>
        /// Net tax amount.
        /// </summary>
        public string ImpuestoNeto { get; set; }

        /// <summary>
        /// Final total amount for the line.
        /// </summary>
        public string MontoTotalLinea { get; set; }

        /// <summary>
        /// Exoneration percentage, if applicable.
        /// </summary>
        public string PorcentajeExoneracion { get; set; }
    }

    /// <summary>
    /// Represents the issuer of the document (e.g., company or seller).
    /// </summary>
    public class Emisor
    {
        /// <summary>
        /// Name of the issuer.
        /// </summary>
        public string Nombre { get; set; }

        /// <summary>
        /// Identification number (e.g., tax ID).
        /// </summary>
        public string Numero { get; set; }
    }
}