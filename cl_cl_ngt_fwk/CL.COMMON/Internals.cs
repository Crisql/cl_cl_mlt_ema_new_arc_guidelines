namespace CL.COMMON
{
    internal static class Internals
    {
        public static void AddItemsToBuildedFilter<T>(System.Reflection.PropertyInfo oPropertyInfo,
            System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> paramters, T _object)
        {
            try
            {
                System.Object inVariable = null;

                if (oPropertyInfo.GetValue(_object) is System.Object)
                {
                    switch (System.Type.GetTypeCode(oPropertyInfo.GetValue(_object).GetType()))
                    {
                        case System.TypeCode.DateTime:
                            inVariable =
                                System.Convert.ToDateTime(
                                    oPropertyInfo
                                        .GetValue(
                                            _object)); // Is possible that we need this format .ToString("yyyy-MM-dd hh:mm:ss")
                            break;
                        case System.TypeCode.Int32:
                            inVariable = System.Convert.ToInt32(oPropertyInfo.GetValue(_object));
                            break;
                        case System.TypeCode.String:
                            inVariable = oPropertyInfo.GetValue(_object).ToString();
                            break;
                        case System.TypeCode.Single:
                            inVariable = System.Convert.ToSingle(oPropertyInfo.GetValue(_object));
                            break;
                        case System.TypeCode.Decimal:
                            inVariable = System.Convert.ToDecimal(oPropertyInfo.GetValue(_object));
                            break;
                        case System.TypeCode.Double:
                            inVariable = System.Convert.ToDouble(oPropertyInfo.GetValue(_object));
                            break;
                        case System.TypeCode.Char:
                            inVariable = System.Convert.ToChar(oPropertyInfo.GetValue(_object));
                            break;
                        case System.TypeCode.Boolean:
                            inVariable = System.Convert.ToInt32(oPropertyInfo.GetValue(_object));
                            break;
                        default:
                            if (oPropertyInfo.GetValue(_object).GetType().IsEnum)
                            {
                                inVariable = System.Convert.ToInt32(oPropertyInfo.GetValue(_object));
                            }
                            else
                            {
                                throw new System.Exception(
                                    $"CL We don't have requested type mapped '{System.Type.GetTypeCode(oPropertyInfo.GetValue(_object).GetType())}', please ticket this error.");
                            }

                            break;
                    }
                }
                else
                {
                    inVariable = oPropertyInfo.GetValue(_object);
                }

                paramters.Add(new System.Data.Odbc.OdbcParameter($"@{oPropertyInfo.Name}", inVariable));
            }
            catch (System.Exception e)
            {
                throw new System.Exception($"{oPropertyInfo.Name} - {oPropertyInfo.GetValue(_object)}. {e.Message}");
            }
        }

        /// <summary>
        /// Used to build an objecto from a database result set
        /// </summary>
        /// <param name="_invoker">Used to determinate which rutine is calling current method in a exception case System.String</param>
        /// <param name="_oDataRow">Result set to be mapped System.Data.DataRow</param>
        /// <param name="_columns">Todas las columnas que devuelve la consulta System.Data.DataColumnCollection</param>
        public static T FillObject<T>(System.String _invoker, System.Data.DataRow _oDataRow,
            System.Data.DataColumnCollection _columns) where T : new()
        {
            T _object = new T();

            foreach (System.Reflection.PropertyInfo prop in _object.GetType().GetProperties())
            {
                try
                {
                    System.Type type = System.Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType;
                    if (_columns.Contains(prop.Name))
                    {
                        if (!_oDataRow.IsNull(prop.Name) && !System.DBNull.Value.Equals(_oDataRow[prop.Name]) &&
                            _oDataRow[prop.Name] != null)
                        {
                            prop.SetValue(_object, _oDataRow[prop.Name]);
                        }
                    }
                }
                catch (System.Exception ex)
                {
                    throw new System.Exception(
                        $"Invoker={_invoker}* Checkout <{prop.Name}> ? <{_oDataRow[prop.Name]}> {ex.Message}");
                }
            }

            return _object;
        }

        public static System.String ParseMessage(System.String _message)
        {
            try
            {
                return _message.Replace(">d__9`1[TObject].MoveNext On", " invoking to").Replace("+<", ".")
                    .Replace(". On ", ". Caused by ").Replace("\n", "")
                                                                     .Replace("\r", ""); ;
            }
            catch
            {
                return _message;
            }
        }
    }
}