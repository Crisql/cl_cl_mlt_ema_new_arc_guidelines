using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON;
using CL.COMMON.ActionFilters;
using CL.COMMON.ActionFilters.ServiceLayer;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS.SAP;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class DraftController : ApiController
    {
        /// <summary>
        /// Endpoint to get preliminary documents by filters
        /// </summary>
        /// <param name="SlpCode">Salesperson code for filtering.</param>
        /// <param name="DateInit">Start date for filtering the documents.</param>
        /// <param name="DateEnd">End date for filtering the documents.</param>
        /// <param name="DocNum">Document number for filtering.</param>
        /// <param name="DocStatus">Document status for filtering.</param>
        /// <param name="CardCode">Customer code for additional filtering (default is empty).</param>
        /// <param name="CardName">Customer name for additional filtering (default is empty).</param>
        /// <returns>Returns an HTTP response message containing the preliminary documents based on the specified filters.</returns>
        [QueryStringExposer]
        [EnablePagination]
        public async Task<HttpResponseMessage> Get(int SlpCode, string DateInit,
            string DateEnd, int DocNum, string DocStatus, string DocCurrency = "", string CardCode = "", string CardName = "", string ViewType="", string ObjType = "") 
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<Drafts>> oCLContext = await Process.GetDrafts( SlpCode,  DateInit,
                     DateEnd,  DocNum,  DocStatus,  DocCurrency ,  CardCode,  CardName,  ViewType,  ObjType );

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request);
            }
        }
        
        /// <summary>
        ///  Endpoint to get preliminary document by DocEntry
        /// </summary>
        /// <param name="DocEntry">Parameter to obtain document</param>
        /// <returns></returns>
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(int DocEntry)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Drafts> oCLContext = await Process.GetDraft(DocEntry);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request);
            }
        }

        /// <summary>
        /// Handles HTTP DELETE requests to cancel a sales order by its document entry.
        /// </summary>
        /// <param name="DocEntry">
        /// The unique identifier (document entry) of the sales order to be canceled.
        /// </param>
        /// <returns>
        /// An <see cref="HttpResponseMessage"/> containing the result of the cancel operation:
        /// either the canceled <see cref="SalesOrder"/> context or an error response.
        /// </returns>
        [HttpDelete]
        public async Task<HttpResponseMessage> Delete(int DocEntry)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Drafts> oCLContext = await Process.CancelDrafts(DocEntry);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, DocEntry);
            }
        }
    }
}