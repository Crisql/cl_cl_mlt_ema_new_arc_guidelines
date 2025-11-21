using System.Web.Http.Controllers;

namespace CL.COMMON.ActionFilters
{
    /// <summary>
    /// This class should be used to expose string values to a mapper service
    /// </summary>
    public class QueryStringExposer : System.Web.Http.Filters.ActionFilterAttribute
    {
        public override void OnActionExecuting(HttpActionContext _httpActionContext)
        {
            System.String currentQueryString = _httpActionContext.Request.RequestUri.Query;
            if (System.String.IsNullOrEmpty(currentQueryString))
                throw new System.Exception("CL Query string can't be null or empty");
            System.Web.HttpContext.Current.Items.Add("qs-injector", currentQueryString);
            base.OnActionExecuting(_httpActionContext);
        }
    }
}

namespace CL.COMMON.ActionFilters.ServiceLayer
{
    /// <summary>
    /// This annotation should be used to implement a service layer pagination
    /// </summary>
    public class EnablePagination : System.Web.Http.Filters.ActionFilterAttribute
    {
        public override void OnActionExecuting(HttpActionContext _httpActionContext)
        {
            int pageSize = CL.COMMON.Core.GetHeaderValue<int>(_httpActionContext.Request, "cl-sl-pagination-page-size");
            int page = CL.COMMON.Core.GetHeaderValue<int>(_httpActionContext.Request, "cl-sl-pagination-page");

            if (pageSize == 0)
            {
                System.Net.Http.HttpResponseMessage response =
                    new System.Net.Http.HttpResponseMessage(System.Net.HttpStatusCode.BadRequest) { };
                response.Headers.Add("cl-message", "CL Please provide a page size greater than 0");
                throw new System.Web.Http.HttpResponseException(response);
            }

            System.Web.HttpContext.Current.Items.Add("cl-sl-pagination-page-size", pageSize);
            System.Web.HttpContext.Current.Items.Add("cl-sl-pagination-page", page);
            System.Web.HttpContext.Current.Items.Add("cl-sl-pagination-is-enabled", true);

            base.OnActionExecuting(_httpActionContext);
        }
    }
}