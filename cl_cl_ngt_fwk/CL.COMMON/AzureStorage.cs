using System.Linq;

namespace CL.COMMON
{
    /// <summary>
    /// General class to manipulate azure file storage.
    /// Includes functions to upload, download and delete files
    /// </summary>
    public class AzureStorage : CL.STRUCTURES.INTERFACES.IStorageHandler
    {
        /// <summary>
        /// Object storage the azure credentials
        /// </summary>
        private CL.STRUCTURES.CLASSES.Azure.AzureCredentials _azureCredentials;


        /// <summary>
        /// Base url to connect with the azure container
        /// </summary>
        private System.String _baseUrl;

        /// <summary>
        /// Allow to overwrite the files with the same name in the container
        /// </summary>
        private System.Boolean _overwrite;

        /// <summary>
        /// Azure Shared keys credentials 
        /// </summary>

        private readonly Azure.Storage.StorageSharedKeyCredential _storageCredentials;

        public AzureStorage(CL.STRUCTURES.CLASSES.Azure.AzureCredentials _credentials,
            System.Boolean _overwriteFiles = true)
        {
            this._overwrite = _overwriteFiles;
            this._azureCredentials =
                _credentials ?? throw new System.Exception("CL Credentials can not be null");
            this._baseUrl =
                $"https://{_azureCredentials.Account}.blob.core.windows.net/{_azureCredentials.Container}/{_azureCredentials.Root}/";

            this._storageCredentials =
                new Azure.Storage.StorageSharedKeyCredential(_azureCredentials.Account,
                    _azureCredentials.AccessKey);
        }

        /// <summary>
        /// Method to upload files to azure
        /// </summary>
        /// <param name="_file">Received an object containing the required data for file upload, including the name, storage path, and stream. </param>
        /// <returns>Returns the URL of the file stored in Azure; this URL is used to download the file</returns>
        public async System.Threading.Tasks.Task<System.String> UploadFile(CL.STRUCTURES.CLASSES.Azure.AzureFile _file)
        {
            if (_file is null)
                throw new System.ArgumentNullException(nameof(_file));

            System.String url = !System.String.IsNullOrEmpty(_file.StoragePath)
                ? $"{_baseUrl}{_file.StoragePath}/{_file.Name}"
                : $"{_baseUrl}{_file.Name}";

            System.Uri blobUri = new System.Uri(url);

            Azure.Storage.Blobs.BlobClient
                blobClient = new Azure.Storage.Blobs.BlobClient(blobUri, _storageCredentials);

            await blobClient.UploadAsync(_file.Stream, _overwrite);

            System.String fileUrl = blobClient.Uri.AbsoluteUri;

            return fileUrl;
        }

        /// <summary>
        /// Method to upload  a list of files. 
        /// </summary>
        /// <param name="_files">List of objects containing the necessary information for uploading the files</param>
        /// <returns>Returns the list of the files in the order received </returns>

        public async System.Threading.Tasks.Task<System.Collections.Generic.List<System.String>> UploadFiles(
            System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Azure.AzureFile> _files)
        {
            if (_files is null)
                throw new System.ArgumentNullException(nameof(_files));

            System.Collections.Generic.List<System.String>
                azureTransferAttPath = new System.Collections.Generic.List<System.String>();

            foreach (CL.STRUCTURES.CLASSES.Azure.AzureFile item in _files)
            {
                azureTransferAttPath.Add(await this.UploadFile(item));
            }

            return azureTransferAttPath;


        }

        /// <summary>
        /// Method to download a file with the given URL as a base64 string
        /// </summary>
        /// <param name="_filePath">URL of the file in the container</param>
        /// <returns>Returns the file base64</returns>


        public System.String DownLoadFileAsBase64(System.String _filePath)
        {
            if (System.String.IsNullOrEmpty(_filePath))
                throw new System.ArgumentNullException(nameof(_filePath));

            System.Threading.Tasks.Task<Azure.Response<Azure.Storage.Blobs.Models.BlobDownloadResult>> downloadResult =
                new Azure.Storage.Blobs.BlobClient(new System.Uri(_filePath), _storageCredentials)
                    .DownloadContentAsync();
            return System.Convert.ToBase64String(downloadResult.Result.Value.Content.ToArray());
        }

        /// <summary>
        ///Method for downloading a list of files as Streams from a given set of URLs.
        /// </summary>
        /// <param name="_filePath">List of  url's as string</param>
        /// <returns>List of the streams</returns>
        /// <exception cref="NullReferenceException"></exception>

        public async System.Threading.Tasks.Task<System.IO.MemoryStream> DownLoadFileAsStream(System.String _filePath)
        {

            if (System.String.IsNullOrEmpty(_filePath))
                throw new System.ArgumentNullException(nameof(_filePath));

            System.IO.MemoryStream stream;

            using (System.IO.MemoryStream memoryStream = new System.IO.MemoryStream())
            {
                await new Azure.Storage.Blobs.BlobClient(new System.Uri(_filePath), _storageCredentials)
                    .DownloadToAsync(memoryStream);

                stream = memoryStream;
            }

            return stream;

        }

        /// <summary>
        /// Method for downloading a list of files as base64 from a given set of URLs.
        /// </summary>
        /// <param name="_paths">List of  url's as string</param>
        /// <returns>List of base64-encoded files as strings.</returns>
        /// <exception cref="NullReferenceException"></exception>
        public async System.Threading.Tasks.Task<System.Collections.Generic.List<System.String>> DownloadFilesAsBase64(
            System.Collections.Generic.List<System.String> _paths)
        {
            if (_paths is null)
                throw new System.ArgumentNullException(nameof(_paths));

            System.Collections.Generic.List<System.String> azureBase64Files =
                new System.Collections.Generic.List<System.String>();

            foreach (System.String path in _paths)
            {
                if (System.String.IsNullOrEmpty(path))
                {
                    throw new System.SystemException("CL some path on the list is empty or null");
                }
                azureBase64Files.Add(DownLoadFileAsBase64(path));
            }

            return azureBase64Files;


        }

        /// <summary>
        /// Method for downloading a list of files as stream from a given set of URLs.
        /// </summary>
        /// <param name="_paths">List of  url's as string</param>
        /// <returns>returns a list of streams in the order of the given list of URLs</returns>
        /// <exception cref="NullReferenceException"></exception>

        public async System.Threading.Tasks.Task<System.Collections.Generic.List<System.IO.MemoryStream>>
            DownloadFilesAsStream(System.Collections.Generic.List<System.String> _paths)
        {
            if (_paths is null)
                throw new System.ArgumentNullException(nameof(_paths));

            System.Collections.Generic.List<System.IO.MemoryStream> azureStreams =
                new System.Collections.Generic.List<System.IO.MemoryStream>();

            foreach (System.String path in _paths)
            {
                if (System.String.IsNullOrEmpty(path))
                {
                    throw new System.SystemException("CL Some path on the list is empty or null");
                }

                azureStreams.Add(await DownLoadFileAsStream(path));
            }

            return azureStreams;


        }

        /// <summary>
        /// Delete a file from Azure 
        /// </summary>
        /// <param name="_path">The file path to delete.</param>
        /// <returns>Returns true if the file was deleted successfully; otherwise, returns false.</returns>
        public async System.Threading.Tasks.Task<System.Boolean> DeleteFile(System.String _path)
        {
            if (_path is null)
                throw new System.ArgumentNullException(nameof(_path));

            Azure.Storage.Blobs.BlobClient
                blobClient = new Azure.Storage.Blobs.BlobClient(new System.Uri(_path), _storageCredentials);

            System.Boolean response = await blobClient.DeleteIfExistsAsync();

            if (!response)
            {
                throw new System.Exception("CL File to delete not exist");
            }

            return response;

        }

        /// <summary>
        /// Method for deleting multiple files
        /// </summary>
        /// <param name="_path">Received a list of files to delete</param>
        public async System.Threading.Tasks.Task<System.Boolean> DeleteFiles(System.Collections.Generic.List<System.String> _paths)
        {
            if (_paths is null)
                throw new System.ArgumentNullException(nameof(_paths));


            System.Collections.Generic.List<System.String> filesWithError =
                new System.Collections.Generic.List<System.String>();

            foreach (System.String path in _paths)
            {
                try
                {
                    if (System.String.IsNullOrEmpty(path))
                    {
                        throw new System.SystemException("CL Path of file to delete is empty or null");
                    }

                    await DeleteFile(path);
                }
                catch
                {
                    filesWithError.Add(path);
                }

            }

            if (filesWithError.Any())
            {
                throw new System.Exception($"CL Some files were not deleted because they did not exist");
            }

            return true;

        }
    }




}
