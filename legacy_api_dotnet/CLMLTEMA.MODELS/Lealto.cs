using System;
using System.Collections.Generic;
using CL.STRUCTURES.ATTRIBUTES;

namespace CLMLTEMA.MODELS
{
    #region INFO DE LOGIN

    /// <summary>
    /// Represents login credentials for Lealto authentication.
    /// </summary>
    public class LealtoLogin
    {
        /// <summary>
        /// Lealto username.
        /// </summary>
        public string username { get; set; }

        /// <summary>
        /// Lealto password.
        /// </summary>
        public string password { get; set; }
    }

    /// <summary>
    /// Response returned after attempting a login.
    /// </summary>
    public class InfoLoginData
    {
        /// <summary>
        /// Indicates whether the login was successful.
        /// </summary>
        public bool valido { get; set; }

        /// <summary>
        /// Contains error information if login fails.
        /// </summary>
        public Error error { get; set; }

        /// <summary>
        /// Contains login result data.
        /// </summary>
        public DataLogin data { get; set; }
    }

    /// <summary>
    /// Contains login session data such as token and branch ID.
    /// </summary>
    public class DataLogin
    {
        /// <summary>
        /// Identifier for the associated branch.
        /// </summary>
        public int id_sucursal { get; set; }

        /// <summary>
        /// Authentication token returned after successful login.
        /// </summary>
        public string token { get; set; }
    }

    #endregion

    #region ERROR

    /// <summary>
    /// Represents an error message returned by the API.
    /// </summary>
    public class Error
    {
        /// <summary>
        /// Error message description.
        /// </summary>
        public string mensaje { get; set; }
    }

    #endregion

    #region FACTURA

    /// <summary>
    /// Base model used for point-related invoice transactions.
    /// </summary>
    public class InvoicePointsBase
    {
        /// <summary>
        /// Identifier of the user who made the transaction.
        /// </summary>
        public int id_usuario { get; set; }

        /// <summary>
        /// Identifier of the branch where the transaction occurred.
        /// </summary>
        public int id_sucursal { get; set; }

        /// <summary>
        /// Total invoice amount.
        /// </summary>
        public decimal monto { get; set; }

        /// <summary>
        /// Invoice number.
        /// </summary>
        public string numero_factura { get; set; }

        /// <summary>
        /// Detailed invoice object.
        /// </summary>
        public FacturaObj factura_obj { get; set; }
    }

    /// <summary>
    /// Represents a detailed invoice including line items and totals.
    /// </summary>
    public class FacturaObj
    {
        public string numero_factura { get; set; }
        public decimal subtotal { get; set; }
        public decimal impuestos { get; set; }
        public decimal total { get; set; }

        /// <summary>
        /// Invoice date (string format).
        /// </summary>
        public string fecha { get; set; }

        /// <summary>
        /// List of invoice line items.
        /// </summary>
        public List<LineasFactura> lineas_factura { get; set; }
    }

    /// <summary>
    /// Represents a single line item in the invoice.
    /// </summary>
    public class LineasFactura
    {
        /// <summary>
        /// Product SKU.
        /// </summary>
        public string sku_producto { get; set; }

        /// <summary>
        /// Name of the product.
        /// </summary>
        public string nombre_producto { get; set; }

        /// <summary>
        /// Product tax amount (integer value).
        /// </summary>
        public int impuestos_producto { get; set; }

        /// <summary>
        /// Unit price of the product.
        /// </summary>
        public decimal precio_producto { get; set; }

        /// <summary>
        /// Quantity purchased.
        /// </summary>
        public int cantidad_producto { get; set; }
    }

    /// <summary>
    /// Invoice used in a redeem point operation.
    /// </summary>
    public class InvoiceRedeemPoint : InvoicePointsBase
    {
        /// <summary>
        /// Optional ID of the redemption request.
        /// </summary>
        public int? id_solicitud_canjeo { get; set; }
    }

    #endregion

    #region REDIMIR PUNTOS

    /// <summary>
    /// Contains information about redeemable points for a specific invoice.
    /// </summary>
    public class InfoRedeemPoints
    {
        public bool valido { get; set; }

        /// <summary>
        /// Total points currently available.
        /// </summary>
        public decimal puntos_disponibles { get; set; }

        /// <summary>
        /// Points currently blocked or pending.
        /// </summary>
        public decimal puntos_bloqueados { get; set; }

        /// <summary>
        /// Available points excluding blocked ones.
        /// </summary>
        public decimal puntos_disponibles_sin_bloqueo { get; set; }

        /// <summary>
        /// Invoice number used in the query.
        /// </summary>
        public int numero_factura { get; set; }

        public Error error { get; set; }
    }

    #endregion

    #region INFO USER

    /// <summary>
    /// Represents a Lealto user's basic identity info.
    /// </summary>
    public class InfoUser
    {
        public int id { get; set; }
        public string identificacion { get; set; }
        public string nombre { get; set; }
        public string apellidos { get; set; }
    }

    /// <summary>
    /// API response containing a list of user info.
    /// </summary>
    public class InfoUserData
    {
        public bool valido { get; set; }
        public List<InfoUser> data { get; set; }
        public Error error { get; set; }
    }

    #endregion

    #region SALDO PUNTOS

    /// <summary>
    /// Response containing user points and related data.
    /// </summary>
    public class InfoPointsData
    {
        public bool valido { get; set; }
        public InfoPoints data { get; set; }
        public Error error { get; set; }
    }

    /// <summary>
    /// Detailed user point data.
    /// </summary>
    public class InfoPoints
    {
        public UserData userData { get; set; }

        /// <summary>
        /// Type of account or points.
        /// </summary>
        public string type { get; set; }
    }

    /// <summary>
    /// Point accumulation level details.
    /// </summary>
    public class PresentLevel
    {
        public int porc_acumulacion_puntos { get; set; }
    }

    /// <summary>
    /// All detailed user data for points and awards.
    /// </summary>
    public class UserData
    {
        public object awardsAvailable { get; set; }
        public decimal pointsAvailable { get; set; }
        public decimal pointsRetain { get; set; }
        public decimal pointsToRedemptionFloor { get; set; }
        public PresentLevel presentLevel { get; set; }
    }

    #endregion

    #region ACUMULACION DE PUNTOS

    /// <summary>
    /// Current level and bonus information for the user.
    /// </summary>
    public class NivelActual
    {
        public int porc_acumulacion_puntos { get; set; }
        public object id_premio { get; set; }
        public int bonus_puntos { get; set; }
    }

    /// <summary>
    /// Response containing accumulated points data for an invoice.
    /// </summary>
    public class InfoAccumulatedPointsData
    {
        public bool valido { get; set; }
        public decimal puntos_disponibles { get; set; }
        public int numero_factura { get; set; }
        public NivelActual nivel_actual { get; set; }
        public Error error { get; set; }
    }

    #endregion

    #region CONFIG DE LA COMPANY EN LEALTO

    /// <summary>
    /// Cashback configuration per company.
    /// </summary>
    public class Cashback
    {
        public int RedemptionFloor { get; set; }
    }

    /// <summary>
    /// Complete configuration info for a Lealto-integrated company.
    /// </summary>
    public class InfoCompany
    {
        public Cashback cashback { get; set; }
        public GeneralConfiguration generalConfiguration { get; set; }
    }

    /// <summary>
    /// Wrapper for general configuration.
    /// </summary>
    public class GeneralConfiguration
    {
        public GeneralData general { get; set; }
    }

    /// <summary>
    /// Basic company-wide data such as coin settings.
    /// </summary>
    public class GeneralData
    {
        public string coinName { get; set; }
        public string coinSymbolSelling { get; set; }
    }

    /// <summary>
    /// Response containing company configuration data.
    /// </summary>
    public class InfoCompanyData
    {
        public bool valido { get; set; }
        public InfoCompany data { get; set; }
        public Error error { get; set; }
    }

    #endregion

    #region CANCELAR UNA TRANSACCION

    /// <summary>
    /// Represents a request to cancel a loyalty transaction.
    /// </summary>
    public class LoyaltyTransactionsCancel
    {
        /// <summary>
        /// Unique identifier of the loyalty transaction to be canceled.
        /// </summary>
        public string id_transaccion { get; set; }
    }

    /// <summary>
    /// Response wrapper for loyalty transaction cancellation or query.
    /// </summary>
    public class InfoLoyaltyTransactionsData
    {
        /// <summary>
        /// Indicates whether the operation was successful.
        /// </summary>
        public bool valido { get; set; }

        /// <summary>
        /// Contains detailed transaction information if successful.
        /// </summary>
        public InfoLoyaltyTransactions data { get; set; }

        /// <summary>
        /// Contains error details if the operation failed.
        /// </summary>
        public Error error { get; set; }
    }

    /// <summary>
    /// Represents detailed information about a loyalty transaction.
    /// </summary>
    public class InfoLoyaltyTransactions
    {
        /// <summary>
        /// Unique identifier of the transaction.
        /// </summary>
        public int id { get; set; }

        /// <summary>
        /// Invoice number associated with the transaction.
        /// </summary>
        public string num_factura { get; set; }

        /// <summary>
        /// Identifier of the user who performed the transaction.
        /// </summary>
        public int id_usuario { get; set; }

        /// <summary>
        /// Internal identifier of the invoice document.
        /// </summary>
        public int id_factura { get; set; }

        /// <summary>
        /// Identifier of the admin who processed the transaction.
        /// </summary>
        public int id_admin { get; set; }

        /// <summary>
        /// Original transaction amount.
        /// </summary>
        public int monto { get; set; }

        /// <summary>
        /// Final effective amount processed after any adjustments.
        /// </summary>
        public int monto_real { get; set; }

        /// <summary>
        /// Remaining available balance after transaction.
        /// </summary>
        public double saldo_disponible { get; set; }

        /// <summary>
        /// Transaction type (e.g., accumulation, redemption).
        /// </summary>
        public int tipo { get; set; }

        /// <summary>
        /// Identifier of the branch where the transaction occurred.
        /// </summary>
        public int id_sucursal { get; set; }

        /// <summary>
        /// Indicates whether the transaction has been canceled.
        /// </summary>
        public bool cancelada { get; set; }

        /// <summary>
        /// Timestamp when the transaction was created.
        /// </summary>
        public DateTime created_at { get; set; }

        /// <summary>
        /// Title or summary of the transaction.
        /// </summary>
        public string titulo { get; set; }

        /// <summary>
        /// Description or comments related to the transaction.
        /// </summary>
        public string descripcion { get; set; }
    }

    #endregion

    #region MODELO QUE SE DEVUELVE AL UI CUANDO SE CONSULTA LOS PUNTOS

    /// <summary>
    /// Model returned to the UI when querying user points.
    /// </summary>
    public class InfoUserDataUI
    {
        /// <summary>
        /// User identification number or national ID.
        /// </summary>
        public string identificacion { get; set; }

        /// <summary>
        /// User's first name.
        /// </summary>
        public string nombre { get; set; }

        /// <summary>
        /// User's last name(s).
        /// </summary>
        public string apellidos { get; set; }

        /// <summary>
        /// Percentage applied to accumulate points.
        /// </summary>
        public string porc_acumulacion_puntos { get; set; }

        /// <summary>
        /// Minimum amount required to redeem points.
        /// </summary>
        public int RedemptionFloor { get; set; }

        /// <summary>
        /// Internal user ID.
        /// </summary>
        public int id_usuario { get; set; }

        /// <summary>
        /// Branch ID the user is associated with.
        /// </summary>
        public int id_sucursal { get; set; }

        /// <summary>
        /// Total available points for the user.
        /// </summary>
        public decimal pointsAvailable { get; set; }
    }

    #endregion

    #region MODELO QUE SE DEVUELVE EN EL UI CUANDO SE ACUMULAN PUNTOS

    /// <summary>
    /// Model returned to the UI after accumulating points.
    /// </summary>
    public class InfoAccumulatedPointsDataUI
    {
        /// <summary>
        /// Updated number of available points.
        /// </summary>
        public decimal puntos_disponibles { get; set; }
    }

    #endregion

    #region MODELO A DEVOLVER AL UI CUANDO SE REDIMEN PUNTOS

    /// <summary>
    /// Model returned to the UI after redeeming points.
    /// </summary>
    public class InfoRedeemPointsUI
    {
        /// <summary>
        /// Redeemable points available, excluding blocked ones.
        /// </summary>
        public decimal puntos_disponibles_sin_bloqueo { get; set; }
    }

    #endregion

    /// <summary>
    /// Configuration model for Lealto integration per company.
    /// </summary>
    public class LealtoConfig
    {
        /// <summary>
        /// Identifier of the associated company.
        /// </summary>
        public int CompanyId { get; set; }

        /// <summary>
        /// Indicates if the Lealto integration is active.
        /// </summary>
        public bool Active { get; set; }

        /// <summary>
        /// API key used for authentication with Lealto.
        /// </summary>
        public string ApiKey { get; set; }

        /// <summary>
        /// Username for authenticating with the Lealto service.
        /// </summary>
        public string User { get; set; }

        /// <summary>
        /// Password for authenticating with the Lealto service.
        /// </summary>
        public string Password { get; set; }

        /// <summary>
        /// Token issued after login to Lealto API.
        /// </summary>
        public string Token { get; set; }

        /// <summary>
        /// Identifier of the associated branch (sucursal).
        /// </summary>
        public int IdSucursal { get; set; }

        /// <summary>
        /// Environment type (e.g., "Production", "Staging").
        /// </summary>
        public string Ambiente { get; set; }

        /// <summary>
        /// Plan card details assigned to the company.
        /// </summary>
        public PlanCard Card { get; set; }
    }

    /// <summary>
    /// Base configuration for Lealto services, including endpoint URLs and per-company configs.
    /// </summary>
    public class LealtoConfigBase
    {
        /// <summary>
        /// Base URL for all Lealto API requests.
        /// </summary>
        public string UrlBase { get; set; }

        /// <summary>
        /// Endpoint URL for login operations.
        /// </summary>
        public string UrlLogin { get; set; }

        /// <summary>
        /// Endpoint URL for retrieving company configuration.
        /// </summary>
        public string UrlConfigCompany { get; set; }

        /// <summary>
        /// Endpoint URL for point balance operations.
        /// </summary>
        public string UrlPoints { get; set; }

        /// <summary>
        /// Endpoint URL for user information retrieval.
        /// </summary>
        public string UrlUser { get; set; }

        /// <summary>
        /// Endpoint URL for point accumulation transactions.
        /// </summary>
        public string UrlAccumulationPoints { get; set; }

        /// <summary>
        /// Endpoint URL for point redemption transactions.
        /// </summary>
        public string UrlRedimirPoints { get; set; }

        /// <summary>
        /// Endpoint URL to cancel loyalty transactions.
        /// </summary>
        public string UrlCancelarTransaccion { get; set; }

        /// <summary>
        /// List of Lealto configuration records for each company.
        /// </summary>
        public List<LealtoConfig> LealtoConfigs { get; set; }
    }

    /// <summary>
    /// SAP AR Invoice extension for tracking Lealto accumulation transaction.
    /// </summary>
    public class ARInvoiceAccumulate
    {
        /// <summary>
        /// Unique document entry identifier.
        /// </summary>
        [MasterKey]
        public int DocEntry { get; set; }

        /// <summary>
        /// Transaction number used to accumulate points in Lealto.
        /// </summary>
        public string U_EMA_numTransaccion_acumular { get; set; }
    }

    /// <summary>
    /// SAP AR Invoice extension for tracking Lealto redemption transaction.
    /// </summary>
    public class ARInvoiceRedeem
    {
        /// <summary>
        /// Unique document entry identifier.
        /// </summary>
        [MasterKey]
        public int DocEntry { get; set; }

        /// <summary>
        /// Transaction number used to redeem points in Lealto.
        /// </summary>
        public string U_EMA_numTransaccion_redimir { get; set; }
    }
}