using System.Linq;
using System.Reflection;

namespace CL.DB
{
    /// <summary>
    /// Contains a set of function to map data from and to your database
    /// </summary>
    public static class Services
    {
        /// <summary>
        /// Generic method that allow us to get records passing it your model and database context class
        /// </summary>
        /// <typeparam name="T">Object prototype to be mapped</typeparam>
        /// <typeparam name="U">Object prototype to be used as a database context</typeparam>
        /// <param name="_dbObjectToken">Token of real database object</param>
        /// <param name="_credentialHolder"></param>
        /// <returns>List of objects</returns>
        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<T>> Execute<T, U>(
            System.String _dbObjectToken, CL.STRUCTURES.CLASSES.PresentationEntities.CLCredentialHolder _credentialHolder = null)
            where T : new() where U : System.Data.Entity.DbContext, new()
        {
            System.Collections.Generic.List<T> tList = null;

            U eDataBaseContext = default;

            System.Net.HttpStatusCode httpStatusCode = System.Net.HttpStatusCode.OK;

            System.String message = null;
            System.String connection = System.String.Empty;
            System.Data.DataTable oDataTable = null;

            try
            {
                eDataBaseContext = new U();

                System.String DB_OBJECT = CL.DB.Core.GetDBResource(_dbObjectToken, eDataBaseContext);

                tList = new System.Collections.Generic.List<T>();

                if (_credentialHolder is System.Object)
                {
                    connection = CL.DB.Internals.ReplaceODBCConnection(_credentialHolder, eDataBaseContext);

                    CL.STRUCTURES.CLASSES.PresentationEntities.CLDbConnectionOptions dbConnectionOptions =
                        new STRUCTURES.CLASSES.PresentationEntities.CLDbConnectionOptions
                        {
                            CommandType = System.Data.CommandType.Text,
                            ConnectionString = connection,
                            DbName = _credentialHolder.DBCode,
                            DbObjectName = DB_OBJECT
                        };

                    oDataTable = CL.DB.Core.GetDataTable(dbConnectionOptions);
                }
                else
                {
                    System.String QUERY = $"SELECT * FROM dbo.{DB_OBJECT}";

                    tList = (System.Collections.Generic.List<T>)CL.DB.Core.GetSet<T, U>(eDataBaseContext, QUERY);
                }

                if (oDataTable is System.Object && oDataTable.Rows is System.Object)
                {
                    System.Int32 RECORDS = oDataTable.Rows.Count;

                    tList = CL.COMMON.Core.InflateList<T>(oDataTable);
                }

                if (tList is System.Object && !tList.Any())
                {
                    httpStatusCode = System.Net.HttpStatusCode.NoContent;
                    message = "No records found";
                }

                return new CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<T>>
                {
                    Response = new STRUCTURES.CLASSES.Rebound.Response<System.Collections.Generic.IEnumerable<T>>
                    {
                        Data = tList.Select(x => x).ToList(),
                        Message = message
                    },
                    Code = httpStatusCode
                };
            }
            catch
            {
                throw;
            }
            finally
            {
                if (tList is System.Object) tList.Clear();

                if (eDataBaseContext is System.Object) eDataBaseContext.Dispose();
            }
        }

        /// <summary>
        /// Generic method that allow us to get records passing it your model and database context class
        /// </summary>
        /// <typeparam name="T">Object prototype to be mapped</typeparam>
        /// <typeparam name="U">Object prototype to be used as a database context</typeparam>
        /// <typeparam name="V">Determinates new object</typeparam>
        /// <param name="_dbObjectToken">Token of real database object</param>
        /// <param name="_credentialHolder">Object which contains Sap credentials</param>
        /// <returns>List of objects</returns>
        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<V>> Execute<T, U, V>(
            System.String _dbObjectToken, CL.STRUCTURES.CLASSES.PresentationEntities.CLCredentialHolder _credentialHolder = null)
            where T : new() where U : System.Data.Entity.DbContext, new() where V : new()
        {
            System.Collections.Generic.List<V> tList = null;

            U eDataBaseContext = default;

            System.Net.HttpStatusCode httpStatusCode = System.Net.HttpStatusCode.OK;

            System.String message = null;
            System.String connection = System.String.Empty;
            System.Data.DataTable oDataTable = null;
            try
            {
                eDataBaseContext = new U();

                System.String DB_OBJECT = CL.DB.Core.GetDBResource(_dbObjectToken, eDataBaseContext);

                tList = new System.Collections.Generic.List<V>();

                if (_credentialHolder is System.Object)
                {
                    connection = CL.DB.Internals.ReplaceODBCConnection(_credentialHolder, eDataBaseContext);

                    CL.STRUCTURES.CLASSES.PresentationEntities.CLDbConnectionOptions dbConnectionOptions =
                        new STRUCTURES.CLASSES.PresentationEntities.CLDbConnectionOptions
                        {
                            CommandType = System.Data.CommandType.Text,
                            ConnectionString = connection,
                            DbName = _credentialHolder.DBCode,
                            DbObjectName = DB_OBJECT
                        };

                    oDataTable = CL.DB.Core.GetDataTable(dbConnectionOptions);
                }
                else
                {
                    System.String QUERY = $"SELECT * FROM dbo.{DB_OBJECT}";

                    tList = (System.Collections.Generic.List<V>)CL.DB.Core.GetSet<V, U>(eDataBaseContext, QUERY);
                }

                if (oDataTable is System.Object && oDataTable.Rows is System.Object)
                {
                    System.Int32 RECORDS = oDataTable.Rows.Count;

                    tList = CL.COMMON.Core.InflateList<V>(oDataTable);
                }

                if (tList is System.Object && tList.Count == 0)
                {
                    httpStatusCode = System.Net.HttpStatusCode.NoContent;
                    message = "No records found";
                }

                return new CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<V>>
                {
                    Response = new STRUCTURES.CLASSES.Rebound.Response<System.Collections.Generic.IEnumerable<V>>
                    {
                        Data = tList.Select(x => x).ToList(),
                        Message = message
                    },
                    Code = httpStatusCode
                };
            }
            catch
            {
                throw;
            }
            finally
            {
                if (tList is System.Object) tList.Clear();

                if (eDataBaseContext is System.Object) eDataBaseContext.Dispose();
            }
        }

        /// <summary>
        /// Generic method that allow us to get records passing it your model and database context class
        /// </summary>
        /// <typeparam name="T">Object prototype to be mapped</typeparam>
        /// <typeparam name="U">Object prototype to be used as a database context</typeparam>
        /// <param name="_dbObjectToken">Token of real database object</param>
        /// <returns>List of objects</returns>
        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<T>> Execute<T, U>(
            System.String _dbObjectToken)
            where T : new() where U : System.Data.Entity.DbContext, new()
        {
            System.Collections.Generic.List<T> tList = null;

            U eDataBaseContext = default;

            System.Net.HttpStatusCode httpStatusCode = System.Net.HttpStatusCode.OK;

            System.String message = null;

            try
            {
                eDataBaseContext = new U();

                System.String DB_OBJECT = CL.DB.Core.GetDBResource(_dbObjectToken, eDataBaseContext);

                System.String QUERY = $"SELECT * FROM dbo.{DB_OBJECT}";

                tList = (System.Collections.Generic.List<T>)CL.DB.Core.GetSet<T, U>(eDataBaseContext, QUERY);

                if (tList is System.Object && tList.Count == 0)
                {
                    httpStatusCode = System.Net.HttpStatusCode.NoContent;
                    message = "No records found";
                }

                return new CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<T>>
                {
                    Response = new STRUCTURES.CLASSES.Rebound.Response<System.Collections.Generic.IEnumerable<T>>
                    {
                        Data = tList.Select(x => x).ToList(),
                        Message = message
                    },
                    Code = httpStatusCode
                };
            }
            catch
            {
                throw;
            }
            finally
            {
                if (tList is System.Object) tList.Clear();

                if (eDataBaseContext is System.Object) eDataBaseContext.Dispose();
            }
        }

        /// <summary>
        /// Generic method that allow us to get records passing it your model and database context class filtering by a key
        /// </summary>
        /// <typeparam name="T">Object prototype of your model</typeparam>
        /// <typeparam name="U">Object prototype of database context</typeparam>
        /// <typeparam name="V">Object prototype of your filtering key</typeparam>
        /// <param name="_dbObjectToken">Token of your database object</param>
        /// <param name="_index">Key to be used to filter in your database object, by dafault set @Key as the name of parameter</param>
        /// <returns>List of objects filtered by a key</returns>
        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<T>> Execute<T, U, V>(
            System.String _dbObjectToken, V _index)
            where T : new() where U : System.Data.Entity.DbContext, new()
        {
            System.Collections.Generic.List<T> tList = null;

            U uDataBaseContext = default;

            System.Net.HttpStatusCode httpStatusCode = System.Net.HttpStatusCode.OK;

            System.String message = null;

            try
            {
                uDataBaseContext = new U();

                System.String DB_OBJECT = CL.DB.Core.GetDBResource(_dbObjectToken, uDataBaseContext);

                System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> odbcParameters =
                    new System.Collections.Generic.List<System.Data.Odbc.OdbcParameter>();

                odbcParameters.Add(new System.Data.Odbc.OdbcParameter("@Key", _index));

                System.String QUERY = $"EXEC dbo.{DB_OBJECT} @Key";

                tList = (System.Collections.Generic.List<T>)CL.DB.Core.GetSet<T, U>(uDataBaseContext, QUERY,
                    odbcParameters);

                if (tList is System.Object && tList.Count == 0)
                {
                    httpStatusCode = System.Net.HttpStatusCode.NoContent;
                    message = "No records found";
                }

                return new CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<T>>
                {
                    Response = new STRUCTURES.CLASSES.Rebound.Response<System.Collections.Generic.IEnumerable<T>>
                    {
                        Data = tList.Select(x => x).ToList(),
                        Message = message
                    },
                    Code = httpStatusCode
                };
            }
            catch
            {
                throw;
            }
            finally
            {
                if (tList is System.Object) tList.Clear();

                if (uDataBaseContext is System.Object) uDataBaseContext.Dispose();
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <typeparam name="U"></typeparam>
        /// <typeparam name="V"></typeparam>
        /// <param name="_dbObjectToken"></param>
        /// <param name="_index"></param>
        /// <param name="_indexKey"></param>
        /// <returns></returns>
        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<T>> Execute<T, U, V>(
            System.String _dbObjectToken, V _index, System.String _indexKey)
            where T : new() where U : System.Data.Entity.DbContext, new()
        {
            System.Collections.Generic.List<T> tList = null;

            U uDataBaseContext = default;

            System.Net.HttpStatusCode httpStatusCode = System.Net.HttpStatusCode.OK;

            System.String message = null;

            try
            {
                uDataBaseContext = new U();

                System.String DB_OBJECT = CL.DB.Core.GetDBResource(_dbObjectToken, uDataBaseContext);

                System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> odbcParameters =
                    new System.Collections.Generic.List<System.Data.Odbc.OdbcParameter>();

                odbcParameters.Add(new System.Data.Odbc.OdbcParameter(_indexKey, _index));

                System.String QUERY = $"EXEC dbo.{DB_OBJECT} {_indexKey}";

                tList = (System.Collections.Generic.List<T>)CL.DB.Core.GetSet<T, U>(uDataBaseContext, QUERY,
                    odbcParameters);

                if (tList is System.Object && tList.Count == 0)
                {
                    httpStatusCode = System.Net.HttpStatusCode.NoContent;
                    message = "No records found";
                }

                return new CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<T>>
                {
                    Response = new STRUCTURES.CLASSES.Rebound.Response<System.Collections.Generic.IEnumerable<T>>
                    {
                        Data = tList.Select(x => x).ToList(),
                        Message = message
                    },
                    Code = httpStatusCode
                };
            }
            catch
            {
                throw;
            }
            finally
            {
                if (tList is System.Object) tList.Clear();

                if (uDataBaseContext is System.Object) uDataBaseContext.Dispose();
            }
        }

        /// <summary>
        /// Generic method that allow us to get a single record filtering by its key
        /// </summary>
        /// <typeparam name="T">Object prototype of your model</typeparam>
        /// <typeparam name="U">Object prototype of database context</typeparam>
        /// <typeparam name="V">Object prototype of your filtering key</typeparam>
        /// <param name="_dbObjectToken">Token of your database object</param>
        /// <param name="_index">Key to be used to filter in your database object</param>
        /// <param name="_credentialHolder"></param>
        /// <returns>Single record filtered by a key</returns>
        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<T>> Execute<T, U, V>(
            System.String _dbObjectToken, V _index, CL.STRUCTURES.CLASSES.PresentationEntities.CLCredentialHolder _credentialHolder)
            where T : new() where U : System.Data.Entity.DbContext, new()
        {
            System.Collections.Generic.List<T> tList = null;

            System.Data.DataTable oDataTable = null;

            System.String connection = System.String.Empty;

            U uDataBaseContext = default;

            System.Net.HttpStatusCode httpStatusCode = System.Net.HttpStatusCode.OK;

            System.String message = null;

            try
            {
                uDataBaseContext = new U();

                System.String DB_OBJECT = CL.DB.Core.GetDBResource(_dbObjectToken, uDataBaseContext);

                System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> odbcParameters =
                    new System.Collections.Generic.List<System.Data.Odbc.OdbcParameter>();

                odbcParameters.Add(new System.Data.Odbc.OdbcParameter("@Key", _index));

                tList = new System.Collections.Generic.List<T>();

                if (_credentialHolder is System.Object)
                {
                    connection = CL.DB.Internals.ReplaceODBCConnection(_credentialHolder, uDataBaseContext);

                    CL.STRUCTURES.CLASSES.PresentationEntities.CLDbConnectionOptions dbConnectionOptions =
                        new STRUCTURES.CLASSES.PresentationEntities.CLDbConnectionOptions
                        {
                            CommandType = (odbcParameters != null && odbcParameters.Any())
                                ? System.Data.CommandType.StoredProcedure
                                : System.Data.CommandType.Text,
                            ConnectionString = connection,
                            DbName = _credentialHolder.DBCode,
                            DbObjectName = DB_OBJECT,
                            Parameters = odbcParameters
                        };

                    oDataTable = CL.DB.Core.GetDataTable(dbConnectionOptions);
                }
                else
                {
                    System.String QUERY = $"EXEC dbo.{DB_OBJECT} @Key";

                    tList = (System.Collections.Generic.List<T>)CL.DB.Core.GetSet<T, U>(uDataBaseContext, QUERY);
                }

                if (oDataTable is System.Object && oDataTable.Rows is System.Object)
                {
                    tList = CL.COMMON.Core.InflateList<T>(oDataTable);
                }

                if (tList is null || tList.Count == 0)
                {
                    httpStatusCode = System.Net.HttpStatusCode.NoContent;
                    message = "No record found";
                }

                return new CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<T>>
                {
                    Response = new STRUCTURES.CLASSES.Rebound.Response<System.Collections.Generic.IEnumerable<T>>
                    {
                        Data = tList.Select(x => x).ToList(),
                        Message = message
                    },
                    Code = httpStatusCode
                };
            }
            catch
            {
                throw;
            }
            finally
            {
                if (tList is System.Object) tList.Clear();

                if (uDataBaseContext is System.Object) uDataBaseContext.Dispose();
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <typeparam name="U"></typeparam>
        /// <typeparam name="V"></typeparam>
        /// <param name="_dbObjectToken"></param>
        /// <param name="_index"></param>
        /// <param name="_indexKey"></param>
        /// <param name="_credentialHolder"></param>
        /// <returns></returns>
        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<T>> Execute<T, U, V>(
            System.String _dbObjectToken, V _index, System.String _indexKey,
            CL.STRUCTURES.CLASSES.PresentationEntities.CLCredentialHolder _credentialHolder)
            where T : new() where U : System.Data.Entity.DbContext, new()
        {
            System.Collections.Generic.List<T> tList = null;

            System.Data.DataTable oDataTable = null;

            System.String connection = System.String.Empty;

            U uDataBaseContext = default;

            System.Net.HttpStatusCode httpStatusCode = System.Net.HttpStatusCode.OK;

            System.String message = null;

            try
            {
                uDataBaseContext = new U();

                System.String DB_OBJECT = CL.DB.Core.GetDBResource(_dbObjectToken, uDataBaseContext);

                System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> odbcParameters =
                    new System.Collections.Generic.List<System.Data.Odbc.OdbcParameter>();

                odbcParameters.Add(new System.Data.Odbc.OdbcParameter(_indexKey, _index));

                tList = new System.Collections.Generic.List<T>();

                if (_credentialHolder is System.Object)
                {
                    connection = CL.DB.Internals.ReplaceODBCConnection(_credentialHolder, uDataBaseContext);

                    CL.STRUCTURES.CLASSES.PresentationEntities.CLDbConnectionOptions dbConnectionOptions =
                        new STRUCTURES.CLASSES.PresentationEntities.CLDbConnectionOptions
                        {
                            CommandType = (odbcParameters != null && odbcParameters.Any())
                                ? System.Data.CommandType.StoredProcedure
                                : System.Data.CommandType.Text,
                            ConnectionString = connection,
                            DbName = _credentialHolder.DBCode,
                            DbObjectName = DB_OBJECT,
                            Parameters = odbcParameters
                        };

                    oDataTable = CL.DB.Core.GetDataTable(dbConnectionOptions);
                }
                else
                {
                    System.String QUERY = $"EXEC dbo.{DB_OBJECT} {_indexKey}";

                    tList = (System.Collections.Generic.List<T>)CL.DB.Core.GetSet<T, U>(uDataBaseContext, QUERY);
                }

                if (oDataTable is System.Object && oDataTable.Rows is System.Object)
                {
                    tList = CL.COMMON.Core.InflateList<T>(oDataTable);
                }

                if (tList is null || tList.Count == 0)
                {
                    httpStatusCode = System.Net.HttpStatusCode.NoContent;
                    message = "No record found";
                }

                return new CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<T>>
                {
                    Response = new STRUCTURES.CLASSES.Rebound.Response<System.Collections.Generic.IEnumerable<T>>
                    {
                        Data = tList.Select(x => x).ToList(),
                        Message = message
                    },
                    Code = httpStatusCode
                };
            }
            catch
            {
                throw;
            }
            finally
            {
                if (tList is System.Object) tList.Clear();

                if (uDataBaseContext is System.Object) uDataBaseContext.Dispose();
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <typeparam name="U"></typeparam>
        /// <typeparam name="V"></typeparam>
        /// <typeparam name="W"></typeparam>
        /// <param name="_dbObjectToken"></param>
        /// <param name="_index"></param>
        /// <param name="_credentialHolder"></param>
        /// <returns></returns>
        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<T> Execute<T, U, V, W>(System.String _dbObjectToken, V _index,
            CL.STRUCTURES.CLASSES.PresentationEntities.CLCredentialHolder _credentialHolder = null)
            where T : new() where U : System.Data.Entity.DbContext, new() where W : CL.STRUCTURES.INTERFACES.ICLSingle
        {
            System.Data.DataTable oDataTable = null;

            System.String connection = System.String.Empty;

            U uDataBaseContext = default;

            T oT = default;

            System.Net.HttpStatusCode httpStatusCode = System.Net.HttpStatusCode.OK;

            System.String message = null;

            try
            {
                uDataBaseContext = new U();

                System.String DB_OBJECT = CL.DB.Core.GetDBResource(_dbObjectToken, uDataBaseContext);

                System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> odbcParameters =
                    new System.Collections.Generic.List<System.Data.Odbc.OdbcParameter>();

                odbcParameters.Add(new System.Data.Odbc.OdbcParameter("@Key", _index));

                if (_credentialHolder is System.Object)
                {
                    connection = CL.DB.Internals.ReplaceODBCConnection(_credentialHolder, uDataBaseContext);

                    CL.STRUCTURES.CLASSES.PresentationEntities.CLDbConnectionOptions dbConnectionOptions =
                        new STRUCTURES.CLASSES.PresentationEntities.CLDbConnectionOptions
                        {
                            CommandType = (odbcParameters != null && odbcParameters.Any())
                                ? System.Data.CommandType.StoredProcedure
                                : System.Data.CommandType.Text,
                            ConnectionString = connection,
                            DbName = _credentialHolder.DBCode,
                            DbObjectName = DB_OBJECT,
                            Parameters = odbcParameters
                        };

                    oDataTable = CL.DB.Core.GetDataTable(dbConnectionOptions);
                }
                else
                {
                    System.String QUERY = $"EXEC dbo.{DB_OBJECT} @key";

                    oT = CL.DB.Core.GetSet<T, U, CL.STRUCTURES.INTERFACES.ICLSingle>(uDataBaseContext, QUERY);
                }

                if (oDataTable is System.Object && oDataTable.Rows is System.Object)
                {
                    oT = CL.COMMON.Core.InflateObject<T>(oDataTable);
                }

                if (!(oT is System.Object))
                {
                    httpStatusCode = System.Net.HttpStatusCode.NotFound;
                    message = "No record found";
                }

                return new CL.STRUCTURES.CLASSES.Rebound.CLContext<T>
                {
                    Response = new STRUCTURES.CLASSES.Rebound.Response<T>
                    {
                        Data = oT,
                        Message = message
                    },
                    Code = httpStatusCode
                };
            }
            catch
            {
                throw;
            }
            finally
            {
                if (uDataBaseContext is System.Object) uDataBaseContext.Dispose();
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <typeparam name="U"></typeparam>
        /// <typeparam name="V"></typeparam>
        /// <typeparam name="W"></typeparam>
        /// <param name="_dbObjectToken"></param>
        /// <param name="_index"></param>
        /// <param name="_indexKey"></param>
        /// <param name="_credentialHolder"></param>
        /// <returns></returns>
        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<T> Execute<T, U, V, W>(System.String _dbObjectToken, V _index,
            System.String _indexKey, CL.STRUCTURES.CLASSES.PresentationEntities.CLCredentialHolder _credentialHolder = null)
            where T : new() where U : System.Data.Entity.DbContext, new() where W : CL.STRUCTURES.INTERFACES.ICLSingle
        {
            System.Data.DataTable oDataTable = null;

            System.String connection = System.String.Empty;

            U uDataBaseContext = default;

            T oT = default;

            System.Net.HttpStatusCode httpStatusCode = System.Net.HttpStatusCode.OK;

            System.String message = null;

            try
            {
                uDataBaseContext = new U();

                System.String DB_OBJECT = CL.DB.Core.GetDBResource(_dbObjectToken, uDataBaseContext);

                System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> odbcParameters =
                    new System.Collections.Generic.List<System.Data.Odbc.OdbcParameter>();

                odbcParameters.Add(new System.Data.Odbc.OdbcParameter(_indexKey, _index));

                if (_credentialHolder is System.Object)
                {
                    connection = CL.DB.Internals.ReplaceODBCConnection(_credentialHolder, uDataBaseContext);

                    CL.STRUCTURES.CLASSES.PresentationEntities.CLDbConnectionOptions dbConnectionOptions =
                        new STRUCTURES.CLASSES.PresentationEntities.CLDbConnectionOptions
                        {
                            CommandType = (odbcParameters != null && odbcParameters.Any())
                                ? System.Data.CommandType.StoredProcedure
                                : System.Data.CommandType.Text,
                            ConnectionString = connection,
                            DbName = _credentialHolder.DBCode,
                            DbObjectName = DB_OBJECT,
                            Parameters = odbcParameters
                        };

                    oDataTable = CL.DB.Core.GetDataTable(dbConnectionOptions);
                }
                else
                {
                    System.String QUERY = $"EXEC dbo.{DB_OBJECT} {_indexKey}";

                    oT = CL.DB.Core.GetSet<T, U, CL.STRUCTURES.INTERFACES.ICLSingle>(uDataBaseContext, QUERY);
                }

                if (oDataTable is System.Object && oDataTable.Rows is System.Object)
                {
                    oT = CL.COMMON.Core.InflateObject<T>(oDataTable);
                }

                if (!(oT is System.Object))
                {
                    httpStatusCode = System.Net.HttpStatusCode.NotFound;
                    message = "No record found";
                }

                return new CL.STRUCTURES.CLASSES.Rebound.CLContext<T>
                {
                    Response = new STRUCTURES.CLASSES.Rebound.Response<T>
                    {
                        Data = oT,
                        Message = message
                    },
                    Code = httpStatusCode
                };
            }
            catch
            {
                throw;
            }
            finally
            {
                if (uDataBaseContext is System.Object) uDataBaseContext.Dispose();
            }
        }

        /// <summary>
        /// To retrieve a S object from T object as filter
        /// </summary>
        /// <typeparam name="S"></typeparam>
        /// <typeparam name="T"></typeparam>
        /// <typeparam name="U"></typeparam>
        /// <typeparam name="V"></typeparam>
        /// <typeparam name="W"></typeparam>
        /// <param name="_dbObjectToken"></param>
        /// <param name="_index"></param>
        /// <param name="_indexKey"></param>
        /// <param name="_credentialHolder"></param>
        /// <returns></returns>
        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<S> Execute<S, T, U, V, W>(System.String _dbObjectToken, V _index,
            System.String _indexKey, CL.STRUCTURES.CLASSES.PresentationEntities.CLCredentialHolder _credentialHolder = null)
            where S : new() where U : System.Data.Entity.DbContext, new() where W : CL.STRUCTURES.INTERFACES.ICLSingle
        {
            System.Data.DataTable oDataTable = null;

            System.String connection = System.String.Empty;

            U uDataBaseContext = default;

            S oS = default;

            System.Net.HttpStatusCode httpStatusCode = System.Net.HttpStatusCode.OK;

            System.String message = null;

            try
            {
                uDataBaseContext = new U();

                System.String DB_OBJECT = CL.DB.Core.GetDBResource(_dbObjectToken, uDataBaseContext);

                System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> odbcParameters =
                    new System.Collections.Generic.List<System.Data.Odbc.OdbcParameter>();

                odbcParameters.Add(new System.Data.Odbc.OdbcParameter(_indexKey, _index));

                if (_credentialHolder is System.Object)
                {
                    connection = CL.DB.Internals.ReplaceODBCConnection(_credentialHolder, uDataBaseContext);

                    CL.STRUCTURES.CLASSES.PresentationEntities.CLDbConnectionOptions dbConnectionOptions =
                        new STRUCTURES.CLASSES.PresentationEntities.CLDbConnectionOptions
                        {
                            CommandType = (odbcParameters != null && odbcParameters.Any())
                                ? System.Data.CommandType.StoredProcedure
                                : System.Data.CommandType.Text,
                            ConnectionString = connection,
                            DbName = _credentialHolder.DBCode,
                            DbObjectName = DB_OBJECT,
                            Parameters = odbcParameters
                        };

                    oDataTable = CL.DB.Core.GetDataTable(dbConnectionOptions);
                }
                else
                {
                    System.String QUERY = $"EXEC dbo.{DB_OBJECT} {_indexKey}";

                    oS = CL.DB.Core.GetSet<S, U, CL.STRUCTURES.INTERFACES.ICLSingle>(uDataBaseContext, QUERY);
                }

                if (oDataTable is System.Object && oDataTable.Rows is System.Object)
                {
                    oS = CL.COMMON.Core.InflateObject<S>(oDataTable);
                }

                if (!(oS is System.Object))
                {
                    httpStatusCode = System.Net.HttpStatusCode.NotFound;
                    message = "No record found";
                }

                return new CL.STRUCTURES.CLASSES.Rebound.CLContext<S>
                {
                    Response = new STRUCTURES.CLASSES.Rebound.Response<S>
                    {
                        Data = oS,
                        Message = message
                    },
                    Code = httpStatusCode
                };
            }
            catch
            {
                throw;
            }
            finally
            {
                if (uDataBaseContext is System.Object) uDataBaseContext.Dispose();
            }
        }

        /// <summary>
        /// To retrieve a S object list from T object as filter
        /// </summary>
        /// <typeparam name="S"></typeparam>
        /// <typeparam name="T"></typeparam>
        /// <typeparam name="U"></typeparam>
        /// <typeparam name="V"></typeparam>
        /// <param name="_dbObjectToken"></param>
        /// <param name="_index"></param>
        /// <param name="_indexKey"></param>
        /// <param name="_credentialHolder"></param>
        /// <returns></returns>
        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<S>> Execute<S, T, U, V>(
            System.String _dbObjectToken, V _index, System.String _indexKey,
            CL.STRUCTURES.CLASSES.PresentationEntities.CLCredentialHolder _credentialHolder = null)
            where S : new() where U : System.Data.Entity.DbContext, new()
        {
            System.Data.DataTable oDataTable = null;

            System.String connection = System.String.Empty;

            U uDataBaseContext = default;

            System.Collections.Generic.List<S> tList = new System.Collections.Generic.List<S>();

            System.Net.HttpStatusCode httpStatusCode = System.Net.HttpStatusCode.OK;

            System.String message = null;

            try
            {
                uDataBaseContext = new U();

                System.String DB_OBJECT = CL.DB.Core.GetDBResource(_dbObjectToken, uDataBaseContext);

                System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> odbcParameters =
                    new System.Collections.Generic.List<System.Data.Odbc.OdbcParameter>();

                odbcParameters.Add(new System.Data.Odbc.OdbcParameter(_indexKey, _index));

                if (_credentialHolder is System.Object)
                {
                    connection = CL.DB.Internals.ReplaceODBCConnection(_credentialHolder, uDataBaseContext);

                    CL.STRUCTURES.CLASSES.PresentationEntities.CLDbConnectionOptions dbConnectionOptions =
                        new STRUCTURES.CLASSES.PresentationEntities.CLDbConnectionOptions
                        {
                            CommandType = (odbcParameters != null && odbcParameters.Any())
                                ? System.Data.CommandType.StoredProcedure
                                : System.Data.CommandType.Text,
                            ConnectionString = connection,
                            DbName = _credentialHolder.DBCode,
                            DbObjectName = DB_OBJECT,
                            Parameters = odbcParameters
                        };

                    oDataTable = CL.DB.Core.GetDataTable(dbConnectionOptions);
                }
                else
                {
                    System.String QUERY = $"EXEC dbo.{DB_OBJECT} {_indexKey}";

                    tList = (System.Collections.Generic.List<S>)CL.DB.Core.GetSet<S, U>(uDataBaseContext, QUERY);
                }

                if (oDataTable is System.Object && oDataTable.Rows is System.Object)
                {
                    tList = CL.COMMON.Core.InflateList<S>(oDataTable);
                }

                if (!(tList is System.Object) || tList.Count == 0)
                {
                    httpStatusCode = System.Net.HttpStatusCode.NoContent;
                    message = "No records found";
                }

                return new CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<S>>
                {
                    Response = new STRUCTURES.CLASSES.Rebound.Response<System.Collections.Generic.IEnumerable<S>>
                    {
                        Data = tList.Select(x => x).ToList(),
                        Message = message
                    },
                    Code = httpStatusCode
                };
            }
            catch
            {
                throw;
            }
            finally
            {
                if (tList is System.Object) tList.Clear();

                if (uDataBaseContext is System.Object) uDataBaseContext.Dispose();
            }
        }

        /// <summary>
        /// Generic method that allow us to get a single record filtering by its key
        /// </summary>
        /// <typeparam name="T">Object prototype of your model</typeparam>
        /// <typeparam name="U">Object prototype of database context</typeparam>
        /// <typeparam name="V">Object prototype of your filtering key</typeparam>
        /// <typeparam name="W">Interface to indicate that we are requesting a single record</typeparam>
        /// <param name="_dbObjectToken">Token of your database object</param>
        /// <param name="_index">Key to be used to filter in your database object</param>
        /// <returns>Single record filtered by a key</returns>
        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<T> Execute<T, U, V, W>(System.String _dbObjectToken, V _index)
            where T : new() where U : System.Data.Entity.DbContext, new() where W : CL.STRUCTURES.INTERFACES.ICLSingle
        {
            U uDataBaseContext = default;

            T oT = default;

            System.Net.HttpStatusCode httpStatusCode = System.Net.HttpStatusCode.OK;

            System.String message = null;

            try
            {
                uDataBaseContext = new U();

                System.String DB_OBJECT = CL.DB.Core.GetDBResource(_dbObjectToken, uDataBaseContext);

                System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> odbcParameters =
                    new System.Collections.Generic.List<System.Data.Odbc.OdbcParameter>();

                odbcParameters.Add(new System.Data.Odbc.OdbcParameter("@Key", _index));

                System.String QUERY = $"EXEC dbo.{DB_OBJECT} @Key";

                oT = CL.DB.Core.GetSet<T, U, CL.STRUCTURES.INTERFACES.ICLSingle>(uDataBaseContext, QUERY,
                    odbcParameters);

                if (!(oT is System.Object))
                {
                    httpStatusCode = System.Net.HttpStatusCode.NotFound;
                    message = "No record found";
                }

                return new CL.STRUCTURES.CLASSES.Rebound.CLContext<T>
                {
                    Response = new STRUCTURES.CLASSES.Rebound.Response<T>
                    {
                        Data = oT,
                        Message = message
                    },
                    Code = httpStatusCode
                };
            }
            catch
            {
                throw;
            }
            finally
            {
                if (uDataBaseContext is System.Object) uDataBaseContext.Dispose();
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <typeparam name="U"></typeparam>
        /// <typeparam name="V"></typeparam>
        /// <typeparam name="W"></typeparam>
        /// <param name="_dbObjectToken"></param>
        /// <param name="_index"></param>
        /// <param name="_indexKey"></param>
        /// <returns></returns>
        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<T> Execute<T, U, V, W>(System.String _dbObjectToken, V _index,
            System.String _indexKey)
            where T : new() where U : System.Data.Entity.DbContext, new() where W : CL.STRUCTURES.INTERFACES.ICLSingle
        {
            U uDataBaseContext = default;

            T oT = default;

            System.Net.HttpStatusCode httpStatusCode = System.Net.HttpStatusCode.OK;

            System.String message = null;

            try
            {
                uDataBaseContext = new U();

                System.String DB_OBJECT = CL.DB.Core.GetDBResource(_dbObjectToken, uDataBaseContext);

                System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> odbcParameters =
                    new System.Collections.Generic.List<System.Data.Odbc.OdbcParameter>();

                odbcParameters.Add(new System.Data.Odbc.OdbcParameter(_indexKey, _index));

                System.String QUERY = $"EXEC dbo.{DB_OBJECT} {_indexKey}";

                oT = CL.DB.Core.GetSet<T, U, CL.STRUCTURES.INTERFACES.ICLSingle>(uDataBaseContext, QUERY,
                    odbcParameters);

                if (!(oT is System.Object))
                {
                    httpStatusCode = System.Net.HttpStatusCode.NotFound;
                    message = "No record found";
                }

                return new CL.STRUCTURES.CLASSES.Rebound.CLContext<T>
                {
                    Response = new STRUCTURES.CLASSES.Rebound.Response<T>
                    {
                        Data = oT,
                        Message = message
                    },
                    Code = httpStatusCode
                };
            }
            catch
            {
                throw;
            }
            finally
            {
                if (uDataBaseContext is System.Object) uDataBaseContext.Dispose();
            }
        }


        /// <summary>
        /// Returns a single record. Accept user and return user
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <typeparam name="U"></typeparam>
        /// <typeparam name="V"></typeparam>
        /// <typeparam name="W"></typeparam>
        /// <param name="_dbObjectToken"></param>
        /// <param name="_object"></param>
        /// <param name="_toIgnore"></param>
        /// <returns></returns>
        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<T> Execute<T, U, V, W>(System.String _dbObjectToken, T _object,
            params System.String[] _toIgnore)
            where T : new()
            where U : System.Data.Entity.DbContext, new()
            where V : CL.STRUCTURES.INTERFACES.ICLMaster
            where W : CL.STRUCTURES.INTERFACES.ICLSingle
        {
            T oT = default;

            U uDataBaseContext = default;

            System.Net.HttpStatusCode httpStatusCode = System.Net.HttpStatusCode.OK;

            System.String message = null;

            try
            {
                uDataBaseContext = new U();

                if (_object == null)
                {
                    throw new System.Exception(
                        "CL You are trying to build a query filter with a null object. Please provide an instance of an object");
                }

                System.String DB_OBJECT = CL.DB.Core.GetDBResource(_dbObjectToken, uDataBaseContext);

                System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> odbcParameters =
                    CL.COMMON.Core.ParametersBuilder<T, V>(System.Reflection.MethodBase.GetCurrentMethod().Name,
                        _object, _toIgnore);

                System.String STRING_PARAMETERS = System.String.Join(",", odbcParameters);

                System.String QUERY = $"EXEC dbo.{DB_OBJECT} {STRING_PARAMETERS}";

                oT = CL.DB.Core.GetSet<T, U, CL.STRUCTURES.INTERFACES.ICLSingle>(uDataBaseContext, QUERY,
                    odbcParameters);

                if (!(oT is System.Object))
                {
                    httpStatusCode = System.Net.HttpStatusCode.NotFound;
                    message = "No record found";
                }

                return new CL.STRUCTURES.CLASSES.Rebound.CLContext<T>
                {
                    Code = httpStatusCode,
                    Response = new STRUCTURES.CLASSES.Rebound.Response<T>()
                    {
                        Data = oT,
                        Message = message
                    }
                };
            }
            catch
            {
                throw;
            }
            finally
            {
                if (uDataBaseContext is System.Object) uDataBaseContext.Dispose();
            }
        }


        /// <summary>
        /// Returns a single record. Accept user and return user
        /// </summary>
        /// <typeparam name="S">Prototype to target</typeparam>
        /// <typeparam name="T">Prototype to use</typeparam>
        /// <typeparam name="U">Database context</typeparam>
        /// <typeparam name="W">Indicates if you want a list or a single record</typeparam>
        /// <param name="_dbObjectToken"></param>
        /// <param name="_object"></param>
        /// <returns></returns>
        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<S> Execute<S, T, U, W>(System.String _dbObjectToken, T _object)
            where S : new()
            where T : new()
            where U : System.Data.Entity.DbContext, new()
            where W : CL.STRUCTURES.INTERFACES.ICLSingle
        {
            S oS = default;

            U uDataBaseContext = default;

            System.Net.HttpStatusCode httpStatusCode = System.Net.HttpStatusCode.OK;

            System.String message = null;

            try
            {
                uDataBaseContext = new U();

                if (_object == null)
                {
                    throw new System.Exception(
                        "CL You are trying to build a query filter with a null object. Please provide an instance of an object");
                }

                System.String DB_OBJECT = CL.DB.Core.GetDBResource(_dbObjectToken, uDataBaseContext);

                System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> odbcParameters =
                    CL.COMMON.Core.ParametersBuilder<T, CL.STRUCTURES.INTERFACES.ICLMaster>(
                        System.Reflection.MethodBase.GetCurrentMethod().Name, _object, null);

                System.String STRING_PARAMETERS = System.String.Join(",", odbcParameters);

                System.String QUERY = $"EXEC dbo.{DB_OBJECT} {STRING_PARAMETERS}";

                oS = CL.DB.Core.GetSet<S, U, CL.STRUCTURES.INTERFACES.ICLSingle>(uDataBaseContext, QUERY,
                    odbcParameters);

                if (!(oS is System.Object))
                {
                    httpStatusCode = System.Net.HttpStatusCode.NotFound;
                    message = "No record found";
                }

                return new CL.STRUCTURES.CLASSES.Rebound.CLContext<S>
                {
                    Code = httpStatusCode,
                    Response = new STRUCTURES.CLASSES.Rebound.Response<S>()
                    {
                        Data = oS,
                        Message = message
                    }
                };
            }
            catch
            {
                throw;
            }
            finally
            {
                if (uDataBaseContext is System.Object) uDataBaseContext.Dispose();
            }
        }

        /// <summary>
        /// Generic method that allows you to get records by applying a set of filters based on an object with an optional list of string to ignore some properties
        /// </summary>
        /// <typeparam name="T">Object prototype to be used as a filter and as a final map</typeparam>
        /// <typeparam name="U">Object prototype of database context</typeparam>
        /// <typeparam name="V">Object prototype of database context</typeparam>
        /// <param name="_dbObjectToken">Token of your database object</param>
        /// <param name="_object"></param>
        /// <param name="_toIgnore">Optional list of string with the properties to be ignored in your model</param>
        /// <returns>List of object type T</returns>
        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<T>> Execute<T, U, V>(
            System.String _dbObjectToken, T _object, params System.String[] _toIgnore)
            where T : new() where U : System.Data.Entity.DbContext, new() where V : CL.STRUCTURES.INTERFACES.ICLMaster
        {
            System.Collections.Generic.List<T> tList = null;

            U uDataBaseContext = default;

            System.Net.HttpStatusCode httpStatusCode = System.Net.HttpStatusCode.OK;

            System.String message = null;

            try
            {
                uDataBaseContext = new U();

                if (_object == null)
                {
                    throw new System.Exception(
                        "CL You are trying to build a query filter with a null object. Please provide an instance of an object");
                }

                System.String DB_OBJECT = CL.DB.Core.GetDBResource(_dbObjectToken, uDataBaseContext);

                System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> odbcParameters =
                    CL.COMMON.Core.ParametersBuilder<T, V>(System.Reflection.MethodBase.GetCurrentMethod().Name,
                        _object, _toIgnore);

                System.String STRING_PARAMETERS = System.String.Join(",", odbcParameters);

                System.String QUERY = $"EXEC dbo.{DB_OBJECT} {STRING_PARAMETERS}";

                tList = (System.Collections.Generic.List<T>)CL.DB.Core.GetSet<T, U>(uDataBaseContext, QUERY,
                    odbcParameters);

                if (tList is System.Object && tList.Count == 0)
                {
                    httpStatusCode = System.Net.HttpStatusCode.NoContent;
                    message = "No records found";
                }

                return new CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<T>>
                {
                    Code = httpStatusCode,
                    Response = new STRUCTURES.CLASSES.Rebound.Response<System.Collections.Generic.IEnumerable<T>>()
                    {
                        Data = tList.Select(x => x).ToList(),
                        Message = message
                    }
                };
            }
            catch
            {
                throw;
            }
            finally
            {
                if (tList is System.Object) tList.Clear();
                if (tList is System.Object) uDataBaseContext.Dispose();
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <typeparam name="V"></typeparam>
        /// <param name="_dbObjectToken"></param>
        /// <param name="_object"></param>
        /// <returns></returns>
        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<T> Execute<T, V>(System.String _dbObjectToken, T _object)
            where T : new() where V : System.Data.Entity.DbContext, new()
        {
            if (!(_object is System.Object))
                throw new System.Exception(
                    "CL You are trying to build a query filter with a null object. Please provide an instance of an object");

            V uDataBaseContext = default;

            T oU = default;

            System.Net.HttpStatusCode httpStatusCode = System.Net.HttpStatusCode.OK;

            System.String message = null;

            try
            {
                uDataBaseContext = new V();

                System.String DB_OBJECT = CL.DB.Core.GetDBResource(_dbObjectToken, uDataBaseContext);

                System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> odbcParameters =
                    CL.COMMON.Core.ParametersBuilder<T>(System.Reflection.MethodBase.GetCurrentMethod().Name, _object);

                System.String STRING_PARAMETERS = System.String.Join(",", odbcParameters);

                System.String QUERY = $"EXEC dbo.{DB_OBJECT} {STRING_PARAMETERS}";

                oU = CL.DB.Core.GetSet<T, V, CL.STRUCTURES.INTERFACES.ICLSingle>(uDataBaseContext, QUERY,
                    odbcParameters);

                if (!(oU is System.Object))
                {
                    httpStatusCode = System.Net.HttpStatusCode.NotFound;
                    message = "No records found";
                }

                return new CL.STRUCTURES.CLASSES.Rebound.CLContext<T>
                {
                    Code = httpStatusCode,
                    Response = new STRUCTURES.CLASSES.Rebound.Response<T>()
                    {
                        Data = oU,
                        Message = message
                    }
                };
            }
            catch
            {
                throw;
            }
            finally
            {
                if (uDataBaseContext is System.Object) uDataBaseContext.Dispose();
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <typeparam name="U"></typeparam>
        /// <typeparam name="V"></typeparam>
        /// <param name="_dbObjectToken"></param>
        /// <param name="_object"></param>
        /// <returns></returns>
        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<U>> Execute<T, U, V>(
            System.String _dbObjectToken, T _object)
            where T : new() where U : new() where V : System.Data.Entity.DbContext, new()
        {
            // if (!(_object is object)) throw new System.Exception("CL - You are trying to build a query filter with a null object. Please provide an instance of an object");

            System.Collections.Generic.List<U> tList = null;

            V uDataBaseContext = default;

            System.Net.HttpStatusCode httpStatusCode = System.Net.HttpStatusCode.OK;

            System.String message = null;

            try
            {
                uDataBaseContext = new V();

                if (_object == null)
                {
                    throw new System.Exception(
                        "CL You are trying to build a query filter with a null object. Please provide an instance of an object");
                }

                System.String DB_OBJECT = CL.DB.Core.GetDBResource(_dbObjectToken, uDataBaseContext);

                System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> odbcParameters =
                    CL.COMMON.Core.ParametersBuilder<T>(System.Reflection.MethodBase.GetCurrentMethod().Name, _object);

                System.String STRING_PARAMETERS = System.String.Join(",", odbcParameters);

                System.String QUERY = $"EXEC dbo.{DB_OBJECT} {STRING_PARAMETERS}";

                tList = (System.Collections.Generic.List<U>)CL.DB.Core.GetSet<U, V>(uDataBaseContext, QUERY,
                    odbcParameters);

                if (tList is System.Object && tList.Count == 0)
                {
                    httpStatusCode = System.Net.HttpStatusCode.NoContent;
                    message = "No records found";
                }

                return new CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<U>>
                {
                    Code = httpStatusCode,
                    Response = new STRUCTURES.CLASSES.Rebound.Response<System.Collections.Generic.IEnumerable<U>>()
                    {
                        Data = tList.Select(x => x).ToList(),
                        Message = message
                    }
                };
            }
            catch
            {
                throw;
            }
            finally
            {
                if (tList is System.Object) tList.Clear();
                if (tList is System.Object) uDataBaseContext.Dispose();
            }
        }

        public static
            CL.STRUCTURES.CLASSES.Rebound.CLContext<
                System.Collections.Generic.List<System.Collections.Generic.List<System.Object>>>
            Execute<T, U, Tb1, Tb2>(System.String _dbObjectToken,
                CL.STRUCTURES.CLASSES.PresentationEntities.CLCredentialHolder _credentialHolder)
            where T : new() where U : System.Data.Entity.DbContext, new() where Tb1 : new() where Tb2 : new()
        {
            System.Collections.Generic.List<System.Collections.Generic.List<System.Object>> tList = null;

            U eDataBaseContext = default;

            System.Net.HttpStatusCode httpStatusCode = System.Net.HttpStatusCode.OK;

            System.String message = null;

            System.String connection = System.String.Empty;

            System.Data.DataTableCollection oDataTableCollection = null;

            System.Collections.Generic.List<System.Type> types = new System.Collections.Generic.List<System.Type>()
            {
                typeof(Tb1),
                typeof(Tb2)
            };

            try
            {
                eDataBaseContext = new U();

                System.String DB_OBJECT = CL.DB.Core.GetDBResource(_dbObjectToken, eDataBaseContext);

                tList = new System.Collections.Generic.List<System.Collections.Generic.List<System.Object>>();

                connection = CL.DB.Internals.ReplaceODBCConnection(_credentialHolder, eDataBaseContext);

                CL.STRUCTURES.CLASSES.PresentationEntities.CLDbConnectionOptions dbConnectionOptions =
                    new STRUCTURES.CLASSES.PresentationEntities.CLDbConnectionOptions
                    {
                        CommandType = System.Data.CommandType.StoredProcedure,
                        ConnectionString = connection,
                        DbName = _credentialHolder.DBCode,
                        DbObjectName = DB_OBJECT
                    };

                oDataTableCollection = CL.DB.Core.GetDataTables(dbConnectionOptions);

                if (oDataTableCollection is System.Object)
                {
                    foreach (System.Data.DataTable table in oDataTableCollection)
                    {
                        System.Collections.Generic.List<System.Object> tListResult =
                            new System.Collections.Generic.List<System.Object>();

                        MethodInfo method = typeof(CL.COMMON.Core).GetMethod(nameof(CL.COMMON.Core.InflateList));

                        if (!types.Any()) throw new System.Exception("CL There are not more types to convert table results");

                        System.Type currentType = types.First();

                        MethodInfo generic = method.MakeGenericMethod(currentType);

                        tListResult =
                            (System.Collections.Generic.List<System.Object>)generic.Invoke(null,
                                new System.Object[] { table });

                        types.RemoveAt(0);

                        tList.Add(tListResult);
                    }
                }

                if (tList is System.Object && tList.Count == 0)
                {
                    httpStatusCode = System.Net.HttpStatusCode.NoContent;
                    message = "No records found";
                }

                return new CL.STRUCTURES.CLASSES.Rebound.CLContext<
                    System.Collections.Generic.List<System.Collections.Generic.List<System.Object>>>
                {
                    Response =
                        new STRUCTURES.CLASSES.Rebound.Response<System.Collections.Generic.List<
                            System.Collections.Generic.List<System.Object>>>
                        {
                            Data = tList.Select(x => x).ToList(),
                            Message = message
                        },
                    Code = httpStatusCode
                };
            }
            catch
            {
                throw;
            }
            finally
            {
                if (tList is System.Object) tList.Clear();

                if (eDataBaseContext is System.Object) eDataBaseContext.Dispose();
            }
        }

        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<U> Execute<T, U, V, W, X>(System.String _dbObjectToken, T _object,
            params System.String[] _toIgnore)
            where T : new()
            where U : new()
            where V : System.Data.Entity.DbContext, new()
            where W : CL.STRUCTURES.INTERFACES.ICLMaster
            where X : CL.STRUCTURES.INTERFACES.ICLSingle
        {
            U oU = default;

            V uDataBaseContext = default;

            System.Net.HttpStatusCode httpStatusCode = System.Net.HttpStatusCode.OK;

            System.String message = null;

            try
            {
                uDataBaseContext = new V();

                if (_object == null)
                {
                    throw new System.Exception(
                        "CL You are trying to build a query filter with a null object. Please provide an instance of an object");
                }

                System.String DB_OBJECT = CL.DB.Core.GetDBResource(_dbObjectToken, uDataBaseContext);

                System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> odbcParameters =
                    CL.COMMON.Core.ParametersBuilder<T, W>(System.Reflection.MethodBase.GetCurrentMethod().Name,
                        _object, _toIgnore);

                System.String STRING_PARAMETERS = System.String.Join(",", odbcParameters);

                System.String QUERY = $"EXEC dbo.{DB_OBJECT} {STRING_PARAMETERS}";

                oU = CL.DB.Core.GetSet<U, V, CL.STRUCTURES.INTERFACES.ICLSingle>(uDataBaseContext, QUERY,
                    odbcParameters);

                if (!(oU is System.Object))
                {
                    httpStatusCode = System.Net.HttpStatusCode.NotFound;
                    message = "No record found";
                }

                return new CL.STRUCTURES.CLASSES.Rebound.CLContext<U>
                {
                    Code = httpStatusCode,
                    Response = new STRUCTURES.CLASSES.Rebound.Response<U>()
                    {
                        Data = oU,
                        Message = message
                    }
                };
            }
            catch
            {
                throw;
            }
            finally
            {
                if (uDataBaseContext is System.Object) uDataBaseContext.Dispose();
            }
        }
    }
}