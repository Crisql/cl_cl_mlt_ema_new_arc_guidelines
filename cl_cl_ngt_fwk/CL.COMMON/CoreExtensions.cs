
namespace CL.COMMON.Extensions
{
    public static class ContextExtensions
    {
        #region Http verbs

        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<T> Post<T>(this CL.STRUCTURES.CLASSES.Rebound.CLContext<T> _context)
        {
            if (_context.Response is System.Object && _context.Response.Data is System.Object)
            {
                _context.Code = System.Net.HttpStatusCode.Created;
            }
            else
            {
                _context.Code = System.Net.HttpStatusCode.NoContent;
            }

            return _context;
        }

        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<T> Patch<T>(this CL.STRUCTURES.CLASSES.Rebound.CLContext<T> _context)
        {
            if (_context.Response is System.Object && _context.Response.Data is System.Object)
            {
                _context.Code = System.Net.HttpStatusCode.OK;
            }
            else
            {
                _context.Code = System.Net.HttpStatusCode.NoContent;
            }

            return _context;
        }

        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<T> Get<T>(this CL.STRUCTURES.CLASSES.Rebound.CLContext<T> _context)
        {
            if (_context.Response is System.Object && _context.Response.Data is System.Object)
            {
                _context.Code = System.Net.HttpStatusCode.OK;
            }
            else
            {
                _context.Code = System.Net.HttpStatusCode.NotFound;
            }

            return _context;
        }

        public static void ClHeadersSetter(this System.Web.Http.Cors.EnableCorsAttribute _corsAttribute)
        {
            System.String[] CL_HEADERS =
            {
                "cl-message"
                , "cl-sl-pagination-records-count"
                , "cl-sl-pagination-next-page"
                , "cl-sl-pagination-page-size"
                , "cl-sl-pagination-pages"
                , "cl-sl-pagination-is-enabled"
            };

            foreach (System.String s in CL_HEADERS)
            {
                _corsAttribute.ExposedHeaders.Add(s);
            }
        }
        #endregion
    }
}