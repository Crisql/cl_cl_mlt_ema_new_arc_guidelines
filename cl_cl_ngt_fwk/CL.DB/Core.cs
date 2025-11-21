using System.Linq;

namespace CL.DB
{
    /// <summary>
    /// Set of functions to map database access
    /// </summary>
    public class Core
    {
        /// <summary>
        /// Used to retrieve data from data
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <typeparam name="U"></typeparam>
        /// <typeparam name="W"></typeparam>
        /// <param name="_context"></param>
        /// <param name="_query"></param>
        /// <param name="_parameters"></param>
        /// <returns></returns>
        public static T GetSet<T, U, W>(U _context, System.String _query,
            System.Collections.Generic.IEnumerable<System.Data.Odbc.OdbcParameter> _parameters = null)
            where U : System.Data.Entity.DbContext, new() where W : CL.STRUCTURES.INTERFACES.ICLSingle
        {
            T oRecord = default;

            System.Collections.Generic.IEnumerable<System.Data.SqlClient.SqlParameter> sqlParameters =
                Internals.OdbcParamsToSqlParameters(_parameters);

            _context.Database.Connection.Open();
            using (var command = _context.Database.Connection.CreateCommand())
            {
                command.CommandText = _query;
                command.CommandType = System.Data.CommandType.Text;
                if (sqlParameters is object) command.Parameters.AddRange(sqlParameters.ToArray());

                using (var result = command.ExecuteReader())
                {
                    if (result.HasRows && result.Read())
                    {
                        System.Type oType = typeof(T);
                        oRecord = (T)System.Activator.CreateInstance(oType);
                        for (int i = 0; i < result.FieldCount; i++)
                        {
                            if (result.IsDBNull(i)) continue;

                            System.Reflection.PropertyInfo property = oType.GetProperty(result.GetName(i));

                            if (property is null || result[i] is null) continue;

                            if (property.PropertyType.Name.Equals("Nullable`1"))
                            {
                                property.SetValue(oRecord, result[i]);
                            }
                            else
                            {
                                property.SetValue(oRecord,
                                    System.Convert.ChangeType(result[i].ToString(),
                                        property.PropertyType.IsEnum
                                            ? typeof(System.Int32)
                                            : CL.COMMON.Core.GetType(property.PropertyType)));
                            }
                        }
                    }
                }
            }

            _context.Database.Connection.Close();

            return oRecord;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <typeparam name="U"></typeparam>
        /// <param name="_context"></param>
        /// <param name="_query"></param>
        /// <param name="_parameters"></param>
        /// <returns></returns>
        public static System.Collections.Generic.IEnumerable<T> GetSet<T, U>(U _context, string _query,
            System.Collections.Generic.IEnumerable<System.Data.Odbc.OdbcParameter> _parameters = null)
            where U : System.Data.Entity.DbContext, new() where T : new()
        {
            System.Collections.Generic.List<T> oRecords = new System.Collections.Generic.List<T>();

            System.Collections.Generic.IEnumerable<System.Data.SqlClient.SqlParameter> sqlParameters =
                Internals.OdbcParamsToSqlParameters(_parameters);

            // oRecords = _context.Database.SqlQuery<T>(_query, sqlParameters.ToArray()).ToList();
            var entities = new System.Collections.Generic.List<T>();
            _context.Database.Connection.Open();
            using (var command = _context.Database.Connection.CreateCommand())
            {
                command.CommandText = _query;
                command.CommandType = System.Data.CommandType.Text;
                if (sqlParameters is object) command.Parameters.AddRange(sqlParameters.ToArray());

                using (var result = command.ExecuteReader())
                {
                    while (result.HasRows && result.Read())
                    {
                        System.Type oType = typeof(T);
                        T oRecord = (T)System.Activator.CreateInstance(oType);
                        for (int i = 0; i < result.FieldCount; i++)
                        {
                            if (result.IsDBNull(i)) continue;

                            System.Reflection.PropertyInfo property = oType.GetProperty(result.GetName(i));

                            if (property is null || result[i] is null) continue;

                            if (property.PropertyType.Name.Equals("Nullable`1"))
                            {
                                property.SetValue(oRecord, result[i]);
                            }
                            else
                            {
                                property.SetValue(oRecord,
                                    System.Convert.ChangeType(result[i].ToString(),
                                        property.PropertyType.IsEnum
                                            ? typeof(System.Int32)
                                            : CL.COMMON.Core.GetType(property.PropertyType)));
                            }
                        }

                        oRecords.Add(oRecord);
                    }
                }
            }

            _context.Database.Connection.Close();

            return oRecords;
        }

        /// <summary>
        /// Usado para obtener resultados de la base de datos sap
        /// Used to get full
        /// </summary>
        /// <param name="_stringConnection">Datos de la conexión</param>
        /// <param name="_query">Query que va a ser ejecutado</param>
        /// <param name="_parameters">List of parameter to be set in the querry</param>
        /// <returns>DataTable con el resultado del query</returns>
        public static System.Data.DataSet GetDataSet(System.String _stringConnection, System.String _query,
            System.Collections.Generic.IEnumerable<System.Data.Odbc.OdbcParameter> _parameters = null)
        {
            System.Data.DataSet oDataSet = null;
            System.Data.Odbc.OdbcConnection oOdbcConnection = null;
            System.Data.Odbc.OdbcCommand oOdbcCommand = null;
            System.Data.Odbc.OdbcDataAdapter oOdbcDataAdapter = null;

            try
            {
                oDataSet = new System.Data.DataSet();

                using (oOdbcConnection = new System.Data.Odbc.OdbcConnection(_stringConnection))
                {
                    oOdbcCommand = new System.Data.Odbc.OdbcCommand(_query, oOdbcConnection);

                    if (_parameters != null && _parameters.Any())
                        oOdbcCommand.Parameters.AddRange(_parameters.ToArray());

                    oOdbcDataAdapter = new System.Data.Odbc.OdbcDataAdapter(oOdbcCommand);

                    oOdbcConnection.Open();

                    oOdbcDataAdapter.SelectCommand.CommandTimeout = 0;

                    oOdbcDataAdapter.Fill(oDataSet);

                    oOdbcConnection.Close();
                }

                if (oDataSet is object && oDataSet.Tables is object && oDataSet.Tables.Count == 0)
                {
                    throw new System.Exception("No table returned from query");
                }

                return oDataSet;
            }
            finally
            {
                if (oOdbcDataAdapter is object) oOdbcDataAdapter.Dispose();

                if (oOdbcDataAdapter is object) oOdbcCommand?.Dispose();

                if (oDataSet is object) oDataSet.Dispose();

                if (oOdbcConnection is object && oOdbcConnection.State == System.Data.ConnectionState.Open)
                {
                    oOdbcConnection.Close();
                }
            }
        }

        /// <summary>
        /// Allows to get the real database object name(Sp, view, fuction) by a token
        /// </summary>
        /// <typeparam name="T">Prototype object which should inheritance from System.Data.Entity.DbContext</typeparam>
        /// <param name="_dbObjectKey">Token of database object System.String</param>
        /// <param name="_context">Database context T</param>
        /// <param name="_shouldReleaseContext">Used to release database context System.Bool</param>
        /// <returns>Name of data base object name</returns>
        public static System.String GetDBResource<T>(
            System.String _dbObjectKey
            , T _context
            , System.Boolean _shouldReleaseContext = false
        )
            where T : System.Data.Entity.DbContext
        {
            int companyKey = -1;

            try
            {
                companyKey = System.Convert.ToInt32(CL.COMMON.Core.GetHttpContextItem(CL.STRUCTURES.HttpContextItems.CompanyKey));
            }
            catch { }

            System.String resource =
                Internals.ResourceResolver(_context, _dbObjectKey, companyKey);

            if (_shouldReleaseContext && _context is object) _context.Dispose();

            return resource;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="connectionString"></param>
        /// <param name="_query"></param>
        /// <param name="_parameters"></param>
        /// <returns></returns>
        public static System.Data.DataTable GetDataTable(
            CL.STRUCTURES.CLASSES.PresentationEntities.CLDbConnectionOptions _dbConnectionOptions)
        {
            return Internals.GetFilledDataSet(_dbConnectionOptions).Tables[0];
        }

        public static System.Data.DataTableCollection GetDataTables(
            CL.STRUCTURES.CLASSES.PresentationEntities.CLDbConnectionOptions _dbConnectionOptions)
        {
            return Internals.GetFilledDataSet(_dbConnectionOptions).Tables;
        }

        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<T> SingleExecutor<T, U, V, W>(
            T _model
            , System.String _dbObjectToken
            , System.Net.HttpStatusCode _defaultCodeType
            , params System.String[] _fields)
            where T : CL.STRUCTURES.INTERFACES.IClDatabaseServices, new()
            where U : System.Data.Entity.DbContext, new()
            where V : CL.STRUCTURES.INTERFACES.ICLMaster
            where W : CL.STRUCTURES.INTERFACES.ICLSingle
        {
            T oT;

            U uDataBaseContext = default;

            System.String message = null;

            try
            {
                uDataBaseContext = new U();

                if (_model == null)
                {
                    throw new System.Exception(
                        "CL You are trying to build a query filter with a null object. Please provide an instance of an object");
                }

                System.String DB_OBJECT = CL.DB.Core.GetDBResource(_dbObjectToken, uDataBaseContext);

                System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> odbcParameters =
                    CL.COMMON.Core.ParametersBuilder<T, V>(System.Reflection.MethodBase.GetCurrentMethod().Name, _model,
                        _fields);

                System.String STRING_PARAMETERS = System.String.Join(",", odbcParameters);

                System.String QUERY = $"EXEC dbo.{DB_OBJECT} {STRING_PARAMETERS}";

                oT = CL.DB.Core.GetSet<T, U, CL.STRUCTURES.INTERFACES.ICLSingle>(uDataBaseContext, QUERY,
                    odbcParameters);

                if (!(oT is object))
                {
                    message = "No record found";
                    _defaultCodeType = System.Net.HttpStatusCode.NoContent;
                }

                return new CL.STRUCTURES.CLASSES.Rebound.CLContext<T>
                {
                    Code = _defaultCodeType,
                    Response = new CL.STRUCTURES.CLASSES.Rebound.Response<T>()
                    {
                        Data = oT,
                        Message = message
                    }
                };
            }
            finally
            {
                if (uDataBaseContext is object) uDataBaseContext.Dispose();
            }
        }
    }
}