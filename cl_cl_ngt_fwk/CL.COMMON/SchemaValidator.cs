namespace CL.COMMON
{
    public static class SchemaValidator
    {
        /// <summary>
        /// Method in charge of validating a model against an xsd
        /// </summary>
        /// <param name="_schemaValidator">ISchemaValidator interface that defines this method as an extension</param>
        public static void ValidateSchema(
            this CL.STRUCTURES.INTERFACES.SchemaValidator.ISchemaValidator _schemaValidator)
        {
            System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Schema.SchemaContext> schemas = SchemaLoader.Instance.GetSchemas();

            if (schemas == null || schemas.Count == 0)
                return;

            System.String nameModel = _schemaValidator.GetType().Name;
            System.Type schemaType = _schemaValidator.GetType();
            CL.STRUCTURES.CLASSES.Schema.SchemaContext schemaContext = schemas.Find(s => s.Name.Equals(nameModel));

            if (schemaContext == null)
                return;

            System.Xml.Serialization.XmlSerializer xmlSerializer =
                new System.Xml.Serialization.XmlSerializer(schemaType);

            System.String serializedXml;
            using (System.IO.StringWriter stringWriter = new System.IO.StringWriter())
            {
                xmlSerializer.Serialize(stringWriter, _schemaValidator);
                serializedXml = stringWriter.ToString();
            }

            System.Xml.XmlReaderSettings xmlReaderSettings = new System.Xml.XmlReaderSettings
            {
                Schemas = schemaContext.Schema,
                ValidationType = System.Xml.ValidationType.Schema
            };

            xmlReaderSettings.ValidationEventHandler += ValidationCallBack;

            using (System.Xml.XmlReader reader =
                   System.Xml.XmlReader.Create(new System.IO.StringReader(serializedXml), xmlReaderSettings))
            {
                while (reader.Read())
                {
                }
            }
        }

        private static void ValidationCallBack(System.Object sender,
            System.Xml.Schema.ValidationEventArgs _validationEventArgs)
        {
            throw _validationEventArgs.Exception;
        }
    }
}