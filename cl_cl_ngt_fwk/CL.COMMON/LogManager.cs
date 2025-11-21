using Serilog;
using System.Linq;
using System.Web;

namespace CL.COMMON
{
    /// <summary>
    /// Allows to log into a external media like .log file and separate pipe context by user
    /// </summary>
    public static class LogManager
    {
        #region Internals

        private static string recorder = System.String.Empty;

        /// <summary>
        /// Reserva espacio en el contexto del pipe para poder almacenar los logs
        /// </summary>
        /// <param name="_recorder">Cola de logs en formato string</param>
        private static void AddRecorder(System.String _recorder)
        {
            if (HttpContext.Current == null)
            {
                LogManager.recorder += _recorder;
            }
            else
            {
                if (!HttpContext.Current.Items.Contains("recorder"))
                {
                    HttpContext.Current.Items["recorder"] = System.String.Empty;
                }
                HttpContext.Current.Items["recorder"] += _recorder;
            }
        }

        /// <summary>
        /// Agrega
        /// </summary>
        /// <param name="_recorder"></param>
        private static void SetRecorder(System.String _recorder)
        {
            if (HttpContext.Current == null)
            {
                LogManager.recorder = _recorder;
            }
            else
            {
                HttpContext.Current.Items["recorder"] = _recorder;
            }
        }

        private static string GetRecorder()
        {
            if (HttpContext.Current == null)
            {
                return LogManager.recorder;
            }
            else
            {
                if (!HttpContext.Current.Items.Contains("recorder"))
                {
                    HttpContext.Current.Items["recorder"] = System.String.Empty;
                }
                return HttpContext.Current.Items["recorder"].ToString();
            }
        }

        private static void WriteLog(System.String _message, System.String _method)
        {
            if (System.String.IsNullOrEmpty(_method)) throw new System.Exception("CL Method name can not be null or empty");

            System.String LogPath = GetLogManagerSetting("LogPath") ?? System.Configuration.ConfigurationManager.AppSettings["LogPath"];

            if (System.String.IsNullOrEmpty(LogPath)) throw new System.Exception("CL You must create a key in .config  file with key name \"LogPath\" or add LogManagerOption configuration with same name");

            LogPath += $"/{_method}_.log";

            System.String stringedRollingInterval = System.Configuration.ConfigurationManager.AppSettings["SeriLogRollingInterval"];

            RollingInterval rollingInterval = RollingInterval.Day;

            if (!System.String.IsNullOrEmpty(stringedRollingInterval))
            {
                try
                {
                    rollingInterval = (RollingInterval)System.Enum.Parse(typeof(RollingInterval), stringedRollingInterval);
                }
                catch
                {

                }
            }

            Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Debug()
            .WriteTo.Async(
            config => config.File(LogPath, rollingInterval: rollingInterval, shared: true, outputTemplate: "{Message:lj}")
            )
            .CreateLogger();

            try
            {
                Log.Information(_message);
            }
            catch (System.Exception ex)
            {
                Log.Error(ex, "Something went wrong");
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }

        private static System.String GetLogManagerSetting(System.String _settingKey)
        {
            if (System.String.IsNullOrEmpty(_settingKey)) throw new System.Exception($"CL Requested key is empty or null, please provide a valid key.");

            System.String xmlPath = System.IO.Path.GetDirectoryName(
                System.Reflection.Assembly.GetExecutingAssembly().Location) + @"\LogManagerSettings.xml";

            if (!System.IO.File.Exists(xmlPath)) return null;

            System.String keyValue = null;

            System.Xml.Linq.XElement xelement = System.Xml.Linq.XElement.Load(xmlPath);

            System.Collections.Generic.IEnumerable<System.Xml.Linq.XElement> nodes = xelement.Elements();

            foreach (System.Xml.Linq.XElement node in nodes)
            {
                if (node.Name.LocalName.ToUpper().Equals(_settingKey.ToUpper()))
                {
                    keyValue = node.Value;
                }
            }

            return keyValue;
        }

        #endregion

        #region Interfaces 

        /// <summary>
        /// Creates an carret return into the external media
        /// </summary>
        public static void Enter()
        {
            LogManager.AddRecorder("\n");
        }

        /// <summary>
        /// Adds a message to the messages queue to eventually be recorded in an external media.
        /// </summary>
        /// <param name="_message">Message to record in the message queue</param>
        public static void Record(System.String _message)
        {
            LogManager.AddRecorder($"{System.DateTime.Now.ToString("yyyy-MM-dd hh:mm:ss.fff")} > {_message}\n");
        }

        /// <summary>
        /// Adds a message to the messages queue with a level tabulation to eventually be recorded in an external media.
        /// </summary>
        /// <param name="_message">Message to record in the message queue</param>
        /// <param name="_tabLevel">Amount of tabs to give in current message.  CL.STRUCTURES.TabLevel</param>
        public static void Record(string _message, CL.STRUCTURES.TabLevel _tabLevel)
        {
            LogManager.AddRecorder($"{System.DateTime.Now.ToString("yyyy-MM-dd hh:mm:ss.fff")} > {System.String.Join("    ", new System.String[(int)_tabLevel])}{_message}\n");
        }

        /// <summary>
        /// Writes the messages queue in the selected external media. If no user is supplied by default is 'no_user_found'.
        /// If you want to log ui request time stamp you should add a header call 'UIRequestTimestamp' in the ui interceptor.
        /// </summary>
        /// <param name="_httpRequestMessage">Context of the request</param>
        /// <param name="_user">User which runs into current pipe. By default LogManager will try to get the user from the context by a Claim call 'UserEmail.</param>
        public static void Commit(System.Net.Http.HttpRequestMessage _httpRequestMessage, System.String _user = null)
        {
            System.String path = System.String.Empty;
            System.String query = "No query found";
            System.String assemblyVersion = System.String.Empty;
            System.String message = System.String.Empty;
            System.String verb = "UNDEFINED";
            System.String uiRequestTimeStamp = System.String.Empty;
            System.String headers = System.String.Empty;

            if (_httpRequestMessage is object)
            {
                verb = _httpRequestMessage.Method?.ToString();

                if (_httpRequestMessage.RequestUri is object)
                {

                    path = _httpRequestMessage.RequestUri.AbsolutePath;

                    if (!System.String.IsNullOrEmpty(_httpRequestMessage.RequestUri.Query))
                    {
                        query = _httpRequestMessage.RequestUri.Query;
                    }
                }

                try
                {
                    _httpRequestMessage.Headers.Where(x => x.Key.ToUpper().Contains("CL-"))?.ToList().ForEach(x =>
                    {
                        try
                        {
                            headers += $"* {x.Key}: {_httpRequestMessage.Headers.GetValues(x.Key).FirstOrDefault()}\n";
                        }
                        catch { /*There is no catch handle cause only the sandbox is required*/ }
                    });

                    if (!System.String.IsNullOrEmpty(headers))
                    {
                        headers = System.String.Concat("\n>>> HEADERS\n", headers);
                    }
                }
                catch { /*There is no catch handle cause only the sandbox is required*/ }
            }
            System.String tentativePath = System.String.Empty;

            try
            {
                tentativePath = $"{System.AppDomain.CurrentDomain.BaseDirectory + "/bin/"}CL.COMMON.dll";
                if (System.IO.File.Exists(tentativePath))
                {
                    assemblyVersion = System.Reflection.Assembly.LoadFile(tentativePath).GetName().Version.ToString();
                }

                tentativePath = $"{System.AppDomain.CurrentDomain.BaseDirectory + "/"}CL.COMMON.dll";

                if (System.IO.File.Exists(tentativePath))
                {
                    assemblyVersion = System.Reflection.Assembly.LoadFile(tentativePath).GetName().Version.ToString();
                }

            }
            catch (System.Exception _exception)
            {
                assemblyVersion = $"CL {tentativePath} Can not get LogManager version. {CL.COMMON.Core.GetException(_exception)}";
            }

            if (System.String.IsNullOrEmpty(_user))
            {
                _user = CL.COMMON.Core.GetPipeValue("UserEmail");

                if (System.String.IsNullOrEmpty(_user)) _user = GetLogManagerSetting("User") ?? "no_user_found";
            }

            message = $"\n-------- BEGIN TRACE--------\n>>> CONTEXT\n* USR: {_user}\n";

            if (!System.String.IsNullOrEmpty(path)) message += $"* PTH: {path}\n";

            if (!System.String.IsNullOrEmpty(query)) message += $"* QRS: {query}\n";

            if (!System.String.IsNullOrEmpty(verb)) message += $"* VRB: {verb}\n";

            if (!System.String.IsNullOrEmpty(assemblyVersion)) message += $"* AYV: {assemblyVersion}\n";

            if (!System.String.IsNullOrEmpty(headers)) message += $"{headers}";

            message += $"\n>>> CONTENT\n{LogManager.GetRecorder()}-------- END TRACE --------";

            LogManager.SetRecorder(message);

            LogManager.Enter();
            LogManager.WriteLog(LogManager.GetRecorder(), verb);

            LogManager.SetRecorder(System.String.Empty);
        }

        /// <summary>
        /// Writes the messages queue in the selected external media, usually used in a post method. If no user is supplied by default is 'no_user_found'.
        /// If you want to log ui request time stamp you should add a header call 'UIRequestTimestamp' in the ui interceptor.
        /// </summary>
        /// <param name="_httpRequestMessage">Context of the request</param>
        /// <param name="_user">User which runs into current pipe. By default LogManager will try to get the user from the context by a Claim call 'UserEmail.</param>
        /// <param name="_oT">Object prototype to be serialized</param>
        public static void Commit<T>(System.Net.Http.HttpRequestMessage _httpRequestMessage, T _oT = default, System.String _user = null)
        {
            System.String path = System.String.Empty;
            System.String query = "No query found";
            System.String model = System.String.Empty;
            System.String assemblyVersion = System.String.Empty;
            System.String message = System.String.Empty;
            System.String verb = System.String.Empty;
            System.String headers = System.String.Empty;

            if (_httpRequestMessage is object)
            {
                verb = _httpRequestMessage.Method?.ToString();

                if (_httpRequestMessage.RequestUri is object)
                {

                    path = _httpRequestMessage.RequestUri.AbsolutePath;

                    if (!System.String.IsNullOrEmpty(_httpRequestMessage.RequestUri.Query))
                    {
                        query = _httpRequestMessage.RequestUri.Query;
                    }
                }

                try
                {
                    _httpRequestMessage.Headers.Where(x => x.Key.ToUpper().Contains("CL-"))?.ToList().ForEach(x =>
                    {
                        try
                        {
                            headers += $"* {x.Key}: {_httpRequestMessage.Headers.GetValues(x.Key).FirstOrDefault()}\n";
                        }
                        catch { /*There is no catch handle cause only the sandbox is required*/ }
                    });

                    if (!System.String.IsNullOrEmpty(headers))
                    {
                        headers = System.String.Concat("\n>>> HEADERS\n", headers);
                    }
                }
                catch { }
            }

            if (_oT is object)
            {
                try
                {
                    model = Newtonsoft.Json.JsonConvert.SerializeObject(_oT);
                }
                catch (System.Exception _exception)
                {
                    model = $"CL Your model can not be serialized. {CL.COMMON.Core.GetException(_exception)} ";
                }
            }

            System.String tentativePath = System.String.Empty;

            try
            {
                tentativePath = $"{System.AppDomain.CurrentDomain.BaseDirectory + "/bin/"}CL.COMMON.dll";
                if (System.IO.File.Exists(tentativePath))
                {
                    assemblyVersion = System.Reflection.Assembly.LoadFile(tentativePath).GetName().Version.ToString();
                }

                tentativePath = $"{System.AppDomain.CurrentDomain.BaseDirectory + "/"}CL.COMMON.dll";

                if (System.IO.File.Exists(tentativePath))
                {
                    assemblyVersion = System.Reflection.Assembly.LoadFile(tentativePath).GetName().Version.ToString();
                }

            }
            catch (System.Exception _exception)
            {
                assemblyVersion = $"CL {tentativePath} Can not get LogManager version. {CL.COMMON.Core.GetException(_exception)}";
            }

            // Dummy validations
            if (System.String.IsNullOrEmpty(_user))
            {
                _user = CL.COMMON.Core.GetPipeValue("UserEmail");

                if (System.String.IsNullOrEmpty(_user)) _user = GetLogManagerSetting("User") ?? "no_user_found";
            }

            message = $"\n-------- BEGIN TRACE--------\n>>> CONTEXT\n* USR: {_user}\n";

            if (!System.String.IsNullOrEmpty(path)) message += $"* PTH: {path}\n";

            if (!System.String.IsNullOrEmpty(query)) message += $"* QRS: {query}\n";

            if (!System.String.IsNullOrEmpty(verb)) message += $"* VRB: {verb}\n";

            if (!System.String.IsNullOrEmpty(assemblyVersion)) message += $"* AYV: {assemblyVersion}\n";

            if (!System.String.IsNullOrEmpty(model)) message += $"* MDL: {model}\n";

            if (!System.String.IsNullOrEmpty(headers)) message += $"{headers}";

            message += $"\n>>> CONTENT\n {LogManager.GetRecorder()}-------- END TRACE --------";

            LogManager.SetRecorder(message);

            LogManager.Enter();
            LogManager.WriteLog(LogManager.GetRecorder(), verb);

            LogManager.SetRecorder(System.String.Empty);
        }

        /// <summary>
        /// Writes the messages queue in the selected external media. If no user is supplied by default is 'no_user_found'.
        /// </summary>
        /// <param name="_fileName">Http verb(Get, Post, etc..). You can use any clasification but we recommend to separetes pipes by http verb.</param>
        /// <param name="_user">User which runs into current pipe. By default LogManager will try to get the user from the context by a Claim call 'UserEmail.</param>
        public static void Commit(System.String _fileName = "UNDEFINED", System.String _user = null)
        {
            if (System.Web.HttpContext.Current is object) throw new System.Exception("CL This function of LogManager.Commit cant be used in a web context. Please read docs https://www.nuget.org/packages/CL.COMMON");

            System.String assemblyVersion = System.String.Empty;

            if (System.String.IsNullOrEmpty(_user))
            {
                _user = CL.COMMON.Core.GetPipeValue("UserEmail");

                if (System.String.IsNullOrEmpty(_user)) _user = GetLogManagerSetting("User") ?? "no_user_found";
            }

            System.String message = $"\n-------- BEGIN TRACE--------\n>>> CONTEXT\n* USR: {_user}\n";

            System.String tentativePath = System.String.Empty;

            try
            {
                tentativePath = $"{System.AppDomain.CurrentDomain.BaseDirectory + "/bin/"}CL.COMMON.dll";
                if (System.IO.File.Exists(tentativePath))
                {
                    assemblyVersion = System.Reflection.Assembly.LoadFile(tentativePath).GetName().Version.ToString();
                }

                tentativePath = $"{System.AppDomain.CurrentDomain.BaseDirectory + "/"}CL.COMMON.dll";

                if (System.IO.File.Exists(tentativePath))
                {
                    assemblyVersion = System.Reflection.Assembly.LoadFile(tentativePath).GetName().Version.ToString();
                }

            }
            catch (System.Exception _exception)
            {
                assemblyVersion = $"CL {tentativePath} Can not get LogManager version. {CL.COMMON.Core.GetException(_exception)}";
            }

            if (!System.String.IsNullOrEmpty(assemblyVersion)) message += $"* AYV: {assemblyVersion}\n\n>>> CONTENT\n";

            message += $"{LogManager.GetRecorder()}-------- END TRACE --------";

            LogManager.SetRecorder(message);

            LogManager.Enter();
            LogManager.WriteLog(LogManager.GetRecorder(), _fileName);

            LogManager.SetRecorder(System.String.Empty);
        }

        /// <summary>
        /// Writes the messages queue in the selected external media. If no user is supplied by default is 'no_user_found'.
        /// </summary>
        /// <param name="_user">User which runs into current pipe. By default LogManager will try to get the user from the context by a Claim call 'UserEmail.</param>
        public static void Commit(System.String _user = null)
        {
            System.String filePrefixOption = GetLogManagerSetting("FilePrefix");
            System.String fileNameOption = GetLogManagerSetting("FileName");

            System.String fileName = !System.String.IsNullOrEmpty(filePrefixOption) ? filePrefixOption : !System.String.IsNullOrEmpty(fileNameOption) ? fileNameOption : "GENERAL";

            bool isUsingFileNameOption = !System.String.IsNullOrEmpty(fileNameOption);

            if (isUsingFileNameOption)
            {
                LogManager.Record("CL 'FileName' LogManager setting option will be removed. Please use 'FilePrefix' instead");
            }

            bool hasBothOptions = !System.String.IsNullOrEmpty(fileNameOption) &&
                                  !System.String.IsNullOrEmpty(filePrefixOption);

            if (hasBothOptions)
            {
                LogManager.Record("CL You can't use both LogManager settings 'FileName' and 'FilePrefix'. The value of 'FilePrefix will be used'");
            }

            System.String assemblyVersion = System.String.Empty;

            if (System.String.IsNullOrEmpty(_user))
            {
                _user = CL.COMMON.Core.GetPipeValue("UserEmail");

                if (System.String.IsNullOrEmpty(_user)) _user = GetLogManagerSetting("User") ?? "no_user_found";
            }

            System.String message = $"\n-------- BEGIN TRACE--------\n>>> CONTEXT\n* USR: {_user}\n";

            System.String tentativePath = System.String.Empty;

            try
            {
                tentativePath = $"{System.AppDomain.CurrentDomain.BaseDirectory + "/bin/"}CL.COMMON.dll";
                if (System.IO.File.Exists(tentativePath))
                {
                    assemblyVersion = System.Reflection.Assembly.LoadFile(tentativePath).GetName().Version.ToString();
                }

                tentativePath = $"{System.AppDomain.CurrentDomain.BaseDirectory + "/"}CL.COMMON.dll";

                if (System.IO.File.Exists(tentativePath))
                {
                    assemblyVersion = System.Reflection.Assembly.LoadFile(tentativePath).GetName().Version.ToString();
                }

            }
            catch (System.Exception _exception)
            {
                assemblyVersion = $"CL {tentativePath} Can not get LogManager version. {CL.COMMON.Core.GetException(_exception)}";
            }

            if (!System.String.IsNullOrEmpty(assemblyVersion)) message += $"* AYV: {assemblyVersion}\n\n>>> CONTENT\n";

            message += $"{LogManager.GetRecorder()}-------- END TRACE --------";

            LogManager.SetRecorder(message);

            LogManager.Enter();
            LogManager.WriteLog(LogManager.GetRecorder(), fileName);
            LogManager.SetRecorder(System.String.Empty);
        }

        public static void Commit()
        {
            System.String assemblyVersion = System.String.Empty;
            System.String message = System.String.Empty;

            System.String tentativePath = System.String.Empty;

            System.String filePrefixOption = GetLogManagerSetting("FilePrefix");
            System.String fileNameOption = GetLogManagerSetting("FileName");

            System.String fileName = !System.String.IsNullOrEmpty(filePrefixOption) ? filePrefixOption : !System.String.IsNullOrEmpty(fileNameOption) ? fileNameOption : "GENERAL";

            bool isUsingFileNameOption = !System.String.IsNullOrEmpty(fileNameOption);

            if (isUsingFileNameOption)
            {
                LogManager.Record("CL 'FileName' LogManager setting option will be removed. Please use 'FilePrefix' instead");
            }

            bool hasBothOptions = !System.String.IsNullOrEmpty(fileNameOption) &&
                                  !System.String.IsNullOrEmpty(filePrefixOption);

            if (hasBothOptions)
            {
                LogManager.Record("CL You can't use both LogManager settings 'FileName' and 'FilePrefix'. The value of 'FilePrefix will be used'");
            }

            System.String user = GetLogManagerSetting("User") ?? "no_user_found";

            try
            {
                tentativePath = $"{System.AppDomain.CurrentDomain.BaseDirectory + "/bin/"}CL.COMMON.dll";
                if (System.IO.File.Exists(tentativePath))
                {
                    assemblyVersion = System.Reflection.Assembly.LoadFile(tentativePath).GetName().Version.ToString();
                }

                tentativePath = $"{System.AppDomain.CurrentDomain.BaseDirectory + "/"}CL.COMMON.dll";

                if (System.IO.File.Exists(tentativePath))
                {
                    assemblyVersion = System.Reflection.Assembly.LoadFile(tentativePath).GetName().Version.ToString();
                }

            }
            catch (System.Exception _exception)
            {
                assemblyVersion = $"CL {tentativePath} Can not get LogManager version. {CL.COMMON.Core.GetException(_exception)}";
            }


            message = $"\n-------- BEGIN TRACE--------\n>>> CONTEXT\n* USR: {user}\n";

            if (!System.String.IsNullOrEmpty(assemblyVersion)) message += $"* AYV: {assemblyVersion}\n";

            message += $"\n>>> CONTENT\n{LogManager.GetRecorder()}-------- END TRACE --------";

            LogManager.SetRecorder(message);

            LogManager.Enter();
            LogManager.WriteLog(LogManager.GetRecorder(), fileName);

            LogManager.SetRecorder(System.String.Empty);
        }

        public static void FlushSettings()
        {
            System.String xmlPath = System.IO.Path.GetDirectoryName(
                System.Reflection.Assembly.GetExecutingAssembly().Location) + @"\LogManagerSettings.xml";

            if (System.IO.File.Exists(xmlPath))
            {
                try
                {
                    System.IO.File.Delete(xmlPath);
                }
                catch
                {

                }
            }
        }

        #endregion
    }
}