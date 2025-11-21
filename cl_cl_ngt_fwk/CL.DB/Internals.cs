using System.Linq;

namespace CL.DB
{
    internal static class Internals
    {
        public const string HANATODBCConFormat =
            "Driver={#ODBCType#};SERVERNODE=#Server#;UID=#UserId#;PWD=#Password#;";

        //SQL ODBC
        public const string HANAODBCConFormat = "Driver={#ODBCType#};SERVERNODE=#Server#;UID=#UserId#;PWD=#Password#;";

        //SQL ODBC TRUSTED
        public const string SQLTODBCConFormat = "Driver={#ODBCType#}; Server=#Server#;Trusted_Connection=Yes;";

        //SQL ODBC
        public const string SQLODBCConFormat = "Driver={#ODBCType#};Server=#Server#;Uid=#UserId#;Pwd=#Password#;";
        public static System.String ResourceResolver<TDBContext>(
            TDBContext _context
            , System.String _dbObjectKey
            , System.Int32 _companyKey
        )
            where TDBContext : System.Data.Entity.DbContext
        {
            System.String DbObjectName;

            System.String storedProcedureName =
                CL.COMMON.Core.GetConfigKeyValue(System.Reflection.MethodBase.GetCurrentMethod(), "spGetDBResource");

            System.Collections.Generic.List<System.Data.SqlClient.SqlParameter> param = new System.Collections.Generic.List<System.Data.SqlClient.SqlParameter>()
            {
                new System.Data.SqlClient.SqlParameter("@Name", _dbObjectKey),
            };

            System.Boolean isMultiCompany = CL.COMMON.Core.GetConfigKeyValue<System.Boolean>(System.Reflection.MethodBase.GetCurrentMethod(), "isMulticompany");

            if (isMultiCompany)
            {
                param.Add(new System.Data.SqlClient.SqlParameter("@CompanyKey", _companyKey));
            }

            System.String parametersNames = System.String.Join(",", param);

            System.String queryToRun =
                $"EXEC dbo.{storedProcedureName} {parametersNames}";

            DbObjectName = _context.Database
                .SqlQuery<System.String>(
                    queryToRun,
                    param.ToArray()).FirstOrDefault();

            if (System.String.IsNullOrEmpty(DbObjectName))
            {
                throw new System.Exception(
                    $"CL Define [{_context.Database.Connection.Database}].[dbo].[{_dbObjectKey}] token in your database first please");
            }

            return DbObjectName;
        }


        /// <summary>
        /// Generate paramters for query based on SQL Parameters
        /// </summary>
        /// <param name="_parameters">A list of paramters eith SQL Format. The format: @parameter-name</param>
        /// <returns>Formatted parameters</returns>
        public static System.Data.Odbc.OdbcParameter[] GetQueryParameters(
            System.Collections.Generic.IEnumerable<System.Data.Odbc.OdbcParameter> _parameters)
        {
            string queryType =
                CL.COMMON.Core.GetConfigKeyValue(System.Reflection.MethodBase.GetCurrentMethod(), "DatabaseType");

            System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> odbcParameters =
                new System.Collections.Generic.List<System.Data.Odbc.OdbcParameter>();

            if (queryType == "SQL")
            {
                odbcParameters.AddRange(_parameters);
            }
            else
            {
                foreach (System.Data.Odbc.OdbcParameter param in _parameters)
                {
                    param.ParameterName = param.ParameterName.Replace("@", "");

                    odbcParameters.Add(param);
                }
            }

            return odbcParameters.ToArray();
        }

        /// <summary>
        /// Generate the query string
        /// </summary>
        /// <param name="_spName">Name of database object</param>
        /// <param name="_params">List of query parameters</param>
        /// <returns>A query with parameters</returns>
        public static string GetCommandText(string _spName,
            System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> _params)
        {
            string queryType =
                CL.COMMON.Core.GetConfigKeyValue(System.Reflection.MethodBase.GetCurrentMethod(), "DatabaseType");

            string spParams = System.String.Join<string>(",", _params.Select(p => "?"));

            if (queryType == "HANA")
            {
                _spName += System.String.Format("({0})", spParams);
            }
            else
            {
                _spName += System.String.Format(" {0}", spParams);
            }

            return _spName;
        }

        /// <summary>
        /// Generate and execute a query based on DbConnectionOptions
        /// </summary>
        /// <param name="_dbConnectionOptions">Options to generate and execute queries</param>
        /// <returns>DataSet with all tables and records</returns>
        public static System.Data.DataSet GetFilledDataSet(
            CL.STRUCTURES.CLASSES.PresentationEntities.CLDbConnectionOptions _dbConnectionOptions)
        {
            string queryType =
                CL.COMMON.Core.GetConfigKeyValue(System.Reflection.MethodBase.GetCurrentMethod(), "DatabaseType");

            System.Data.DataSet dataSet = new System.Data.DataSet();

            string commandTypeName = string.Empty;

            using (System.Data.Odbc.OdbcConnection conn =
                   new System.Data.Odbc.OdbcConnection(_dbConnectionOptions.ConnectionString))
            {
                using (System.Data.Odbc.OdbcCommand cmd = new System.Data.Odbc.OdbcCommand())
                {
                    cmd.Connection = conn;

                    if (_dbConnectionOptions.CommandType == System.Data.CommandType.StoredProcedure)
                    {
                        commandTypeName = "stored procedure";

                        if (_dbConnectionOptions.Parameters != null && _dbConnectionOptions.Parameters.Any())
                            cmd.Parameters.AddRange(GetQueryParameters(_dbConnectionOptions.Parameters));

                        if (queryType == "HANA")
                        {
                            cmd.CommandText = System.String.Format("CALL {0}.", _dbConnectionOptions.DbName);
                        }
                        else
                        {
                            cmd.CommandText = $"{_dbConnectionOptions.DbName}.dbo.";
                        }

                        cmd.CommandText +=
                            _dbConnectionOptions.Parameters != null && _dbConnectionOptions.Parameters.Any()
                                ? GetCommandText(_dbConnectionOptions.DbObjectName, _dbConnectionOptions.Parameters)
                                : _dbConnectionOptions.DbObjectName;
                    }
                    else
                    {
                        commandTypeName = "view";

                        if (System.String.IsNullOrEmpty(_dbConnectionOptions.CommandText) ||
                            System.String.IsNullOrWhiteSpace(_dbConnectionOptions.CommandText))
                        {
                            _dbConnectionOptions.CommandText = "SELECT * FROM";
                        }

                        if (queryType == "HANA")
                        {
                            _dbConnectionOptions.CommandText = System.String.Format("{2} {0}.{1}",
                                _dbConnectionOptions.DbName, _dbConnectionOptions.DbObjectName,
                                _dbConnectionOptions.CommandText);
                        }
                        else
                        {
                            _dbConnectionOptions.CommandText = System.String.Format("{2} {0}.dbo.{1}",
                                _dbConnectionOptions.DbName, _dbConnectionOptions.DbObjectName,
                                _dbConnectionOptions.CommandText);
                        }

                        cmd.CommandText += _dbConnectionOptions.CommandText;
                    }

                    using (System.Data.Odbc.OdbcDataAdapter da = new System.Data.Odbc.OdbcDataAdapter(cmd))
                    {
                        dataSet.Clear();

                        da.SelectCommand.CommandTimeout = 0;

                        da.Fill(dataSet);
                    }
                }
            }

            //Si devuelve 0 tablas es que el script se cayo en tiempo de ejecucion
            if (dataSet.Tables.Count == 0)
                throw new System.Exception(
                    $"CL No tables was obtained when execute {commandTypeName} {_dbConnectionOptions.DbObjectName}");

            return dataSet;
        }

        /// <summary>
        /// </summary>
        /// <param name="_odbcParameters">List of parameters to be mapped</param>
        /// <returns>A list of System.Data.SqlClient.SqlParameter</returns>
        public static System.Collections.Generic.IEnumerable<System.Data.SqlClient.SqlParameter>
            OdbcParamsToSqlParameters(
                System.Collections.Generic.IEnumerable<System.Data.Odbc.OdbcParameter> _odbcParameters)
        {
            System.Collections.Generic.List<System.Data.SqlClient.SqlParameter> sqlParameters =
                new System.Collections.Generic.List<System.Data.SqlClient.SqlParameter>();

            if (_odbcParameters == null)
            {
                return sqlParameters;
            }

            foreach (System.Data.Odbc.OdbcParameter odbcParameter in _odbcParameters)
            {
                sqlParameters.Add(
                    new System.Data.SqlClient.SqlParameter(odbcParameter.ParameterName, odbcParameter.Value));
            }

            return sqlParameters;
        }

        /// <summary>
        /// Creates a string with saps conection
        /// </summary>
        /// <param name="_credentialHolder">Object which contains credentials to sap login</param>
        /// <param name="_dbContext">Context of database to get app name</param>
        /// <returns>Formatted string with server type selected</returns>
        public static System.String ReplaceODBCConnection(
            CL.STRUCTURES.CLASSES.PresentationEntities.CLCredentialHolder _credentialHolder,
            System.Data.Entity.DbContext _dbContext)
        {
            //     string companyName = GetDBObjectByKey(MethodBase.GetCurrentMethod(), "CompanyName");
            System.String connection = string.Empty;
            System.String odbctype = _credentialHolder.ODBCType;
            System.String Server = _credentialHolder.Server;
            System.String User = _credentialHolder.ODBCUser;
            System.String Pass = _credentialHolder.ODBCPass;

            switch (_credentialHolder.ServerType.ToUpper())
            {
                case "SQLSERVERT":
                    connection = Internals.SQLTODBCConFormat.Replace("#ODBCType#", odbctype).Replace("#Server#", Server);
                    break;
                case "SQLSERVER":
                    connection = Internals.SQLODBCConFormat.Replace("#ODBCType#", odbctype).Replace("#Server#", Server)
                        .Replace("#UserId#", User).Replace("#Password#", Pass);
                    break;
                case "HANASERVERT":
                    connection = Internals.HANATODBCConFormat.Replace("#ODBCType#", odbctype).Replace("#Server#", Server)
                        .Replace("#UserId#", User).Replace("#Password#", Pass);
                    break;
                case "HANASERVER":
                    connection = Internals.HANAODBCConFormat.Replace("#ODBCType#", odbctype).Replace("#Server#", Server)
                        .Replace("#UserId#", User).Replace("#Password#", Pass);
                    break;
            }

            connection += $"Application Name={_dbContext.Database.Connection.Database}";

            return connection;
        }
    }
}