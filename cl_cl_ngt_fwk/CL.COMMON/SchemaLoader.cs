namespace CL.COMMON
{
    public sealed class SchemaLoader
    {
        private static readonly System.Lazy<SchemaLoader> lazy =
            new System.Lazy<SchemaLoader>(() => new SchemaLoader(),
                System.Threading.LazyThreadSafetyMode.ExecutionAndPublication);

        public static SchemaLoader Instance
        {
            get { return lazy.Value; }
        }

        private System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Schema.SchemaContext> schemas;

        private SchemaLoader()
        {
        }

        /// <summary>
        /// Method that is responsible for loading the xsd found in the SchemasPath key path of the Web.config
        /// </summary>
        /// <param name="_methodBase">Parameter used to get the name of the method and class where LoadSchemas is invoked</param>
        public void LoadSchemas(in System.Reflection.MethodBase _methodBase)
        {
            System.String currentMethodFullName = $"{_methodBase.DeclaringType.FullName}.{_methodBase.Name}";

            if (!currentMethodFullName.Contains("WebApiApplication.Application_Start"))
            {
                throw new System.Exception(
                    "The LoadSchemas method must be invoked in the Application_Start method of the WebApiApplication class, this in the Global.asax.cs file");
            }

            schemas = new System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Schema.SchemaContext>();
            System.String directoryPath =
                CL.COMMON.Core.GetConfigKeyValue<string>(System.Reflection.MethodBase.GetCurrentMethod(),
                    "SchemasPath");

            if (!System.IO.Directory.Exists(directoryPath))
            {
                LogManager.Record($"Directory not found: {directoryPath}");
                return;
            }

            foreach (System.String xsdFile in System.IO.Directory.GetFiles(directoryPath, "*.xsd"))
            {
                try
                {
                    System.Xml.Schema.XmlSchemaSet schemaSet = new System.Xml.Schema.XmlSchemaSet();
                    schemaSet.Add(null, xsdFile);

                    schemas.Add(new CL.STRUCTURES.CLASSES.Schema.SchemaContext()
                    {
                        Name = System.IO.Path.GetFileNameWithoutExtension(xsdFile),
                        Schema = schemaSet
                    });
                }
                catch (System.Exception ex)
                {
                    LogManager.Record($"Error loading schema from file {xsdFile}: {CL.COMMON.Core.GetException(ex)}");
                }
            }
        }

        /// <summary>
        /// Returns the list of loaded xsd files.
        /// </summary>
        /// <returns>loaded xsd files</returns>
        public System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Schema.SchemaContext> GetSchemas()
        {
            return schemas;
        }
    }
}