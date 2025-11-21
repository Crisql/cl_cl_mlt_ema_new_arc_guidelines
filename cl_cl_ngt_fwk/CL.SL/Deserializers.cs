namespace CL.SL
{
    public static class Deserializers
    {
        public delegate T Deserializer<T>(System.Net.Http.HttpResponseMessage content);

        /// <summary>
        /// Default serializer for json objects
        /// </summary>
        /// <param name="_httpResponseMessage"></param>
        /// <returns></returns>
        public static System.String ReadAsJson(System.Net.Http.HttpResponseMessage _httpResponseMessage)
        {
            return _httpResponseMessage.Content
                .ReadAsStringAsync().Result;
        }

        public static System.Byte[] ReadAsBytes(System.Net.Http.HttpResponseMessage _httpResponseMessage)
        {
            System.IO.Stream stream = _httpResponseMessage.Content.ReadAsStreamAsync().Result;

            byte[] mBytes = default;

            if (stream.CanSeek)
            {
                long streamLength = stream.Length;
                if (streamLength <= int.MaxValue)
                {
                    byte[] buffer = new byte[streamLength];
                    int bytesRead = stream.ReadAsync(buffer, 0, (int)streamLength).Result;

                    if (bytesRead != streamLength)
                    {
                        throw new System.SystemException("Cl - Could not read entire stream. Retry request please");
                    }

                    mBytes = buffer;
                }
            }
            else
            {
                // Handle unknown stream length (e.g., read in chunks)
                using (var memoryStream = new System.IO.MemoryStream())
                {
                    byte[] buffer = new byte[4096];
                    int bytesRead;
                    while ((bytesRead = stream.ReadAsync(buffer, 0, buffer.Length).Result) > 0)
                    {
                        memoryStream.Write(buffer, 0, bytesRead);
                    }

                    mBytes = memoryStream.ToArray();
                }
            }

            return mBytes;
        }
    }
}