using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Data.Odbc;
using System.Data.SqlClient;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Mail;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using CL.COMMON;
using CLMLTEMA.MODELS;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace CLMLTEMA.COMMON
{
    public class Common
    {
        #region Security

        /// <summary>
        /// Encripta el dato ingresado
        /// </summary>
        /// <param name="data">Dato</param>
        /// <returns>El dato encriptado</returns>
        public static string Encrypt(string data)
        {
            // Create a SHA256   
            using (SHA256 sha256Hash = SHA256.Create())
            {
                // ComputeHash - returns byte array  
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(data));

                // Convert byte array to a string   
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }

                return builder.ToString();
            }
        }

        #endregion

        #region Peticiones HTTP

        /// <summary>
        /// Sends an HTTP request using <see cref="HttpClient"/>, supporting GET and POST methods with optional JSON body and headers.
        /// </summary>
        /// <param name="_method">
        /// The HTTP method as an integer corresponding to <see cref="Constants.MethodHttp"/> (e.g. GET or POST).
        /// </param>
        /// <param name="_ulr">
        /// The request URL to which the HTTP call will be made.
        /// </param>
        /// <param name="_body">
        /// The JSON‐serialized request body for POST requests; ignored for GET.
        /// </param>
        /// <param name="_headers">
        /// A dictionary of additional headers to include in the request; may be null.
        /// </param>
        /// <returns>
        /// A task that returns the <see cref="HttpResponseMessage"/> from the server, or null if the method is unsupported.
        /// </returns>
        public static async Task<HttpResponseMessage> ExecuteHttpAsync(int _method,
            string _ulr, string _body = null, Dictionary<string, string> _headers = null)
        {
            try
            {
                ServicePointManager.SecurityProtocol =
                    SecurityProtocolType.Ssl3 | SecurityProtocolType.Tls | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls12;

                using (HttpClient http = new HttpClient())
                {
                    http.Timeout = TimeSpan.FromSeconds(120);
                    http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    if (_headers is object)
                    {
                        foreach (KeyValuePair<string, string> header in _headers)
                        {
                            http.DefaultRequestHeaders.Add(header.Key, header.Value);
                        }
                    }

                    if (_method == (int)Constants.MethodHttp.POST)
                    {
                        StringContent content = new StringContent(_body, Encoding.UTF8,"application/json");
                        content.Headers.ContentType = new MediaTypeWithQualityHeaderValue("application/json");

                        return await http.PostAsync($"{_ulr}", content);
                    }
                    else if (_method == (int)Constants.MethodHttp.GET)
                    {
                        return await http.GetAsync($"{_ulr}");
                    }
                    else
                    {
                        return null;
                    }
                }
            }
            catch
            {
                throw;
            }
        }

        #endregion

        #region Descargar archivos de internet

        /// <summary>
        /// Downloads the data from the specified URL and returns it as a Base64‐encoded string.
        /// </summary>
        /// <param name="url">The URL of the resource to download.</param>
        /// <returns>
        /// A task that resolves to the Base64 representation of the downloaded data.
        /// </returns>
        public static async Task<string> Download(string url)
        {
            return await Task.Run(() =>
            {
                using (var client = new WebClient())
                {
                    var bytes = client.DownloadData(url);
                    var base64String = Convert.ToBase64String(bytes);
                    return base64String;
                }
            });
        }

        #endregion

        /// <summary>
        /// Generic wrapper for a single value returned from various services or queries.
        /// </summary>
        /// <typeparam name="T">The type of the wrapped value.</typeparam>
        public class SingleValue<T>
        {
            public T Value { get; set; }
        }
        
        /// <summary>
        /// This method is used to set values in header context
        /// </summary>
        /// <param name="_key">property key in the dictionary</param>
        /// <param name="_value">property value in the dictionary</param>
        public static void SetHeaderContext(string _key, object _value)
        {
            HttpContext.Current.Items.Add((object) _key, _value);
        }

        /// <summary>
        /// This method is used to get values in header context
        /// </summary>
        /// <param name="_key">property key in the dictionary</param>
        /// <returns></returns>
        public static object GetHeaderContext(string _key)
        {
            return HttpContext.Current.Items[_key];
        }

        /// <summary>
        /// Get the document type based on the document SAP table
        /// </summary>
        /// <param name="pSapTable">SAP Table of the document</param>
        /// <returns>The document type</returns>
        public static Constants.DocumentType GetDocumentTypeFromSapTable(string pSapTable)
        {
            switch (pSapTable)
            {
                case SapDocumenType.Quotation:
                    return Constants.DocumentType.SalesQuotations;
                case SapDocumenType.ArInvoice:
                    return Constants.DocumentType.InvoicesFE;
                case SapDocumenType.SaleOrder:
                    return Constants.DocumentType.SalesOrders;
                case SapDocumenType.ArDownPayment:
                    return Constants.DocumentType.ArDownPayment;
                case SapDocumenType.ApDownPayment:
                    return Constants.DocumentType.ApDownPayment;
                case SapDocumenType.CreditNotes:
                    return Constants.DocumentType.CreditNotes;
                case SapDocumenType.Delivery:
                    return Constants.DocumentType.Delivery;
                default:
                    throw new Exception($"The SAP table '{pSapTable}' is not configured to retrieve a corresponding document type.");
            }
        }
        
        #region ODBC
        
        /// <summary>
        /// Executes a query against a SAP view using an ODBC context and specified parameters.
        /// </summary>
        /// <param name="_contextODBC">The ODBC context for the query</param>
        /// <param name="parameters">Query parameters as key-value pairs</param>
        /// <returns>A list of <typeparamref name="T"/> with the query results.</returns>
        public static List<T> ResolveSAPViewODBC<T>(ClUserContextODBC _contextODBC, Dictionary<String, object> parameters = null)
        {
            List<T> sapObjectList = new List<T>();
            
            string replacedConnectionString = ReplaceConectODBC(_contextODBC);

            Enum.TryParse(_contextODBC.ServerType, true, out Constants.ServerType serverType);

            string query = "";

            switch (serverType)
            {
                case Constants.ServerType.SQLSERVER:
                case Constants.ServerType.SQLSERVERT:   
                    query = $"SELECT * FROM {_contextODBC.DBCode}.dbo.{_contextODBC.Resource}";
                    break;
                case Constants.ServerType.HANASERVER:
                case Constants.ServerType.HANASERVERT:
                    query = $"SELECT * FROM {_contextODBC.DBCode}.{_contextODBC.Resource}";
                    break;
            }
            
            if (!(parameters is null))
            {
                foreach (var parameter in parameters)
                {
                    query = query.Replace(parameter.Key, $"{parameter.Value}");
                }
            }

            if (HttpContext.Current is object && HttpContext.Current.Items["cl-sl-pagination-is-enabled"] is object && (bool) HttpContext.Current.Items["cl-sl-pagination-is-enabled"])
            {
                int pageSize = (int) HttpContext.Current.Items["cl-sl-pagination-page-size"];
                int offset = (int) HttpContext.Current.Items["cl-sl-pagination-page"] * pageSize;
                // Patron de expresión regular para encontrar la parte ORDER BY
                string pattern = @"ORDER BY.*$";

                // Remover la parte ORDER BY de la consulta SQL
                string sqlQuerySinOrderBy = Regex.Replace(query, pattern, "", RegexOptions.IgnoreCase);
                DataTable dtc = QueryToTable(replacedConnectionString, sqlQuerySinOrderBy.Replace("*", "COUNT(*) As Count"));

                int count = 0;
                
                if (dtc.Rows.Count > 0)
                {
                    count = Convert.ToInt32(dtc.Rows[0]["Count"]);
                }
                
                HttpContext.Current.Items.Add("cl-sl-pagination-records-count", $"{count}");
                
                switch (serverType)
                {
                    case Constants.ServerType.SQLSERVER:
                    case Constants.ServerType.SQLSERVERT:   
                        query = $"{query} OFFSET {offset} ROWS FETCH NEXT {pageSize} ROWS ONLY";
                        break;
                    case Constants.ServerType.HANASERVER:
                    case Constants.ServerType.HANASERVERT:
                        query = $"{query} LIMIT {pageSize} OFFSET {offset}";
                        break;
                }
            }
            
            LogManager.Record($"QUERY: {query}");
            
            DataTable dt = QueryToTable(replacedConnectionString, query);
            
            foreach (DataRow row in dt.Rows)
            {
                T obj = Activator.CreateInstance<T>(); // Create an instance of the generic type
                if (typeof(T) == typeof(JObject))
                {
                    JObject jObject = new JObject();
                    foreach (DataColumn column in dt.Columns)
                    {
                        object value = row[column.ColumnName];
                        jObject[column.ColumnName] = value != DBNull.Value ? JToken.FromObject(value) : JValue.CreateNull();
                    }
                    sapObjectList.Add((T)(object)jObject);
                }
                else
                {
                    foreach (var property in typeof(T).GetProperties())
                    {
                        if (dt.Columns.Contains(property.Name) && row[property.Name] != DBNull.Value)
                        {
                            Type propertyType = property.PropertyType;

                            // Check if the property is a Nullable type
                            Type underlyingType = Nullable.GetUnderlyingType(propertyType) ?? propertyType;

                            // Convert the value to the appropriate type
                            object value = Convert.ChangeType(row[property.Name], underlyingType);

                            property.SetValue(obj, value);
                        }
                    }
                    sapObjectList.Add(obj);
                }
            }
        
            return sapObjectList;
        }

        /// <summary>
        /// Executes a stored procedure or call against SAP via ODBC and maps the result set into a list of <typeparamref name="T"/>.
        /// </summary>
        /// <typeparam name="T">
        /// The target type for mapping each row:
        /// - If <typeparamref name="T"/> is <see cref="JObject"/>, each row is converted into a JSON object.
        /// - Otherwise, each column is mapped to the matching property on <typeparamref name="T"/> via reflection.
        /// </typeparam>
        /// <param name="_contextODBC">
        /// The ODBC user context containing connection details (DBCode, Resource name, ServerType, etc.).
        /// </param>
        /// <param name="parameters">
        /// Optional dictionary of SQL parameter placeholders (e.g. "@ParamName") to their values.  
        /// Each placeholder in the generated query string is replaced with its corresponding value.
        /// </param>
        /// <returns>
        /// A list of <typeparamref name="T"/> instances representing each row returned by the procedure.
        /// </returns>
        /// <remarks>
        /// - Constructs the call syntax based on <see cref="Constants.ServerType"/> (EXEC for SQL Server, CALL for HANA).  
        /// - Logs the final query before execution.
        /// - Converts the resulting <see cref="DataTable"/> into objects by matching column names to property names.
        /// </remarks>
        public static List<T> ResolveSAPProcedureODBC<T>(ClUserContextODBC _contextODBC, Dictionary<String, object> parameters = null)
        {
            List<T> sapObjectList = new List<T>();
            
            string replacedConnectionString = ReplaceConectODBC(_contextODBC);

            Enum.TryParse(_contextODBC.ServerType, true, out Constants.ServerType serverType);

            string query = "";

            switch (serverType)
            {
                case Constants.ServerType.SQLSERVER:
                case Constants.ServerType.SQLSERVERT:   
                    query = $"EXEC {_contextODBC.DBCode}.dbo.{_contextODBC.Resource}";
                    break;
                case Constants.ServerType.HANASERVER:
                case Constants.ServerType.HANASERVERT:
                    query = $"CALL {_contextODBC.DBCode}.{_contextODBC.Resource}";
                    break;
            }
            
            if (!(parameters is null))
            {
                foreach (var parameter in parameters)
                {
                    query = query.Replace(parameter.Key, $"{parameter.Value}");
                }
            }
            
            LogManager.Record($"QUERY: {query}");
            
            DataTable dt = QueryToTable(replacedConnectionString, query);
            
            foreach (DataRow row in dt.Rows)
            {
                T obj = Activator.CreateInstance<T>(); // Create an instance of the generic type
                if (typeof(T) == typeof(JObject))
                {
                    JObject jObject = new JObject();
                    foreach (DataColumn column in dt.Columns)
                    {
                        object value = row[column.ColumnName];
                        jObject[column.ColumnName] = value != DBNull.Value ? JToken.FromObject(value) : JValue.CreateNull();
                    }
                    sapObjectList.Add((T)(object)jObject);
                }
                else
                {
                    foreach (var property in typeof(T).GetProperties())
                    {
                        if (dt.Columns.Contains(property.Name) && row[property.Name] != DBNull.Value)
                        {
                            Type propertyType = property.PropertyType;

                            // Check if the property is a Nullable type
                            Type underlyingType = Nullable.GetUnderlyingType(propertyType) ?? propertyType;

                            // Convert the value to the appropriate type
                            object value = Convert.ChangeType(row[property.Name], underlyingType);

                            property.SetValue(obj, value);
                        }
                    }
                    sapObjectList.Add(obj);
                }
            }
        
            return sapObjectList;
        }
        
        /// <summary>
        /// Replace the data on the ODBC connections
        /// </summary>
        /// <param name="_contextODBC"></param>
        /// <returns></returns>
        public static string ReplaceConectODBC(ClUserContextODBC _contextODBC)
        {
            string Connection = string.Empty;
            string companyName = _contextODBC.DBCode;
            string odbctype = _contextODBC.ODBCType;
            string Server = _contextODBC.Server;
            string User = _contextODBC.ODBCUser;
            string Pass = _contextODBC.ODBCPass;

            switch (_contextODBC.ServerType.ToUpper())
            {
                case "SQLSERVERT":
                    Connection = Constants.SQLTODBCConFormat.Replace("#ODBCType#", odbctype)
                        .Replace("#Server#", Server);
                    break;
                case "SQLSERVER":
                    Connection = Constants.SQLODBCConFormat.Replace("#ODBCType#", odbctype).Replace("#Server#", Server)
                        .Replace("#UserId#", User).Replace("#Password#", Pass);
                    break;
                case "HANASERVERT":
                    Connection = Constants.HANATODBCConFormat.Replace("#ODBCType#", odbctype)
                        .Replace("#Server#", Server).Replace("#UserId#", User).Replace("#Password#", Pass);
                    break;
                case "HANASERVER":
                    Connection = Constants.HANAODBCConFormat.Replace("#ODBCType#", odbctype).Replace("#Server#", Server)
                        .Replace("#UserId#", User).Replace("#Password#", Pass);
                    break;
            }

            Connection += $"Application Name={companyName};";
            
            return Connection;
        }
        
        /// <summary>
        /// 
        /// </summary>
        /// <param name="connectionString"></param>
        /// <param name="_query"></param>
        /// <returns></returns>
        public static DataTable QueryToTable(string connectionString, string _query)
        {
            DataTable dt = new DataTable();

            using (OdbcConnection conn = new OdbcConnection(connectionString))
            {
                using (OdbcCommand cmd = new OdbcCommand(_query, conn))
                {
                    using (OdbcDataAdapter da = new OdbcDataAdapter(cmd))
                    {
                        dt.Clear();
                        da.SelectCommand.CommandTimeout = 0;
                        da.Fill(dt);
                    }
                }

                conn.Close();
            }

            return dt;
        }
        
        #endregion
    }
}