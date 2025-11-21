namespace CL.STRUCTURES.INTERFACES
{
    #region Apdater interfaces

    public interface ICLContext
    {
    }

    public interface ICLMaster
    {
    }

    public interface ICLSeed
    {
    }

    public interface ICLDBProvider
    {
    }

    public interface ICLCredentialHolder
    {
    }

    public interface ICLSLTransaction
    {
    }

    #endregion

    #region Constraints

    public interface ICLInclude : ICLMaster
    {
    }

    public interface ICLExclude : ICLMaster
    {
    }

    public interface ICLSingle : ICLMaster
    {
    }

    public interface ICLSap : ICLDBProvider
    {
    }

    public interface ICLDba : ICLDBProvider
    {
    }

    public interface ICLPost : ICLSLTransaction
    {
    }

    public interface ICLPatch : ICLSLTransaction
    {
    }

    public interface ICLGetT : ICLSLTransaction
    {
    }

    public interface ICLGet
    {
    }

    public interface IClDatabaseServices
    {
    }

    #endregion

    #region Storage

    /// <summary>
    /// Interface for handling storage operations, designed for Azure.
    /// </summary>
    public interface IStorageHandler
    {
        /// <summary>
        /// This function should be used to upload files to azure
        /// </summary>
        /// <param name="_file">Received an object containing the required data for file upload, including the name, storage path, and stream.</param>
        /// <returns></returns>
        System.Threading.Tasks.Task<System.String> UploadFile(CL.STRUCTURES.CLASSES.Azure.AzureFile _file);

        /// <summary>
        /// Method to upload  a list of files. 
        /// </summary>
        /// <param name="_file">List of objects containing the necessary information for uploading the files</param>
        /// <returns>Returns the list of the files in the order received</returns>
        System.Threading.Tasks.Task<System.Collections.Generic.List<System.String>> UploadFiles(
            System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Azure.AzureFile> _files);
        /// <summary>
        ///  Method to download a file with the given URL as a base64 string
        /// </summary>
        /// <param name="_filePath">URL of the file in the container</param>
        /// <returns>Returns the file base64</returns>
        System.String DownLoadFileAsBase64(System.String _filePath);

        /// <summary>
        /// Method to download a file with the given URL as stream
        /// </summary>
        /// <param name="_filePath">URL of the file in the container</param>
        /// <returns>Returns the file base64</returns>
        System.Threading.Tasks.Task<System.IO.MemoryStream> DownLoadFileAsStream(System.String _filePath);

        /// <summary>
        ///  Method to download a  list of file with the given URL as a stream
        /// </summary>
        /// <param name="_paths">URL of the file in the container</param>
        /// <returns>Returns the file base64</returns>
        System.Threading.Tasks.Task<System.Collections.Generic.List<System.IO.MemoryStream>> DownloadFilesAsStream(
            System.Collections.Generic.List<System.String> _paths); // this function should be used to download a list of files as a stream

        /// <summary>
        /// Method for downloading a list of files as Streams from a given set of URLs as a Base64.
        /// </summary>
        /// <param name="_paths">List of  url's as string</param>
        /// <returns>List of the base64 strings</returns>
        System.Threading.Tasks.Task<System.Collections.Generic.List<System.String>> DownloadFilesAsBase64(
            System.Collections.Generic.List<System.String> _paths); // this function should be used to download  a list of files as a base64

        /// <summary>
        /// Deletes a file from Azure 
        /// </summary>
        /// <param name="_path">he file path to delete.</param>
        /// <returns>Returns true if the file was deleted successfully; otherwise, returns false.</returns>
        System.Threading.Tasks.Task<System.Boolean> DeleteFile(System.String _path); //  this function should be used to delete a file in azure


        /// <summary>
        /// Method for deleting multiple files
        /// </summary>
        /// <param name="_path">Received a list of files to delete</param>

        System.Threading.Tasks.Task<System.Boolean> DeleteFiles(System.Collections.Generic.List<System.String> _path);//  this function should be used to delete a  list of files in azure
    }

    #endregion
}



namespace CL.STRUCTURES.INTERFACES.ServiceLayer
{
    public interface ISlInternals
    {
        void ValidateUserContext(CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext _userContext);

        System.String ServiceLayerUrlPatcher<TObject>(TObject _target, System.String _resource);

        CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject ServiceLayerWriter<TObject>(
            CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext _userContext
            , System.String _method
            , TObject _target = default
            , System.String _fieldsToRemoveInHeaders = null
            , System.String _fieldsToRemoveInLines = null
            , System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.Udf> _headerUdfs = null
            , System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.Udf> _lineUdfs = null
            , System.String _lineObjectName = null
            // Business implementation start
            , System.Collections.Generic.Dictionary<System.String,
                System.Func<Newtonsoft.Json.Linq.JProperty, System.Boolean>> _headerFlushConditions = null
            , System.Collections.Generic.Dictionary<System.String,
                System.Func<Newtonsoft.Json.Linq.JProperty, System.Boolean>> _lineFlushConditions = null
        // Business implementation end
        );

        TObject QueryStringReader<TObject>();

        CL.STRUCTURES.CLASSES.Rebound.CLContext<TObject> SlResolve<TObject>(
            System.Net.Http.HttpResponseMessage _httpResponseMessage
            , System.Reflection.MethodBase _invoker
            , System.String _method)
            where TObject : new();

        CL.STRUCTURES.CLASSES.Rebound.CLContext<T> SlResolve<T>(
            System.Reflection.MethodBase _invoker
            , System.Net.Http.HttpResponseMessage _httpResponseMessage)
            where T : new();

        CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject BuildWithoutQueryString( // this function should be used with queryExposerExtension
                CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext _clUserContext
            );

        CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject BuildFromQueryString<TObject>( // this function should be used with queryExposerExtension
                CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext _clUserContext
                , TObject _target
            )
            where TObject : new();

        void CheckUserContext(CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext _userContext);

        Newtonsoft.Json.Linq.JObject BuildServiceLayerObject<TObject>(
            TObject _slDocument
            , System.String[] _propertiesToFlushOnHeader
            , System.String[] _propertiesToFlushOnLines
            , System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.Udf> _headerUdfs
            , System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.Udf> _lineUdfs
            , System.String _lineObjectName = null
            // Business implementation start
            , System.Collections.Generic.Dictionary<System.String,
                System.Func<Newtonsoft.Json.Linq.JProperty, System.Boolean>> _headerFlushConditions = null
            , System.Collections.Generic.Dictionary<System.String, System.Func<Newtonsoft.Json.Linq.JProperty, System.Boolean>> _lineFlushConditions = null
        // Business implementation end
        );

        System.Threading.Tasks.Task<CL.STRUCTURES.CLASSES.Rebound.CLContext<TObject>>
            LocalExecutor<TObject>(
                CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject _slRequestObject
                , System.String _method = null
                , CL.STRUCTURES.CLASSES.ServiceLayer.CookieResponse _cookie = null)
            where TObject : new();
    }
}



namespace CL.STRUCTURES.INTERFACES.SchemaValidator
{
    /// <summary>
    /// Used to enable an extension method.
    /// </summary>
    public interface ISchemaValidator
    {
    }
}