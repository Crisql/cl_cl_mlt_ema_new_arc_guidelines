using CL.COMMON;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON.ActionFilters;
using CL.COMMON.ActionFilters.ServiceLayer;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS.SAP;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class IncomingPaymentsController : ApiController
    {
       
        public async Task<HttpResponseMessage> Post([FromUri]int DocEntry)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IncomingPayment> oCLContext =  await Process.CancelIncomingPayments(DocEntry);

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
        
        public async Task<HttpResponseMessage> Get(int DocEntry)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IncomingPaymentDetail> oCLContext =  await Process.GetPayment(DocEntry);

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
        /// Retrieves a list of payments based on the specified criteria.
        /// </summary>
        /// <param name="DateFrom">The start date for filtering payments.</param>
        /// <param name="DateTo">The end date for filtering payments.</param>
        /// <param name="currency">The currency type to filter the payments.</param>
        /// <param name="type">The type of payment to filter.</param>
        /// <param name="CardCode">The card code associated with the payments.</param>
        /// <returns>A <see cref="HttpResponseMessage"/> containing the list of payments that match the specified criteria.</returns>
        [QueryStringExposer]
        [EnablePagination]
        public async Task<HttpResponseMessage> Get(string DateFrom, string DateTo,string currency, string type, string CardCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<PaymentForCancel>> oCLContext = await Process.GetPayments( DateFrom,  DateTo, CardCode , currency, type);

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
        /// EndPoint para realizar pagos a facturas de clientes
        /// </summary>
        /// <param name="incomingPayment"></param>
        /// <returns></returns>
        public async Task<HttpResponseMessage> Post(IncomingPayment incomingPayment)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IncomingPayment> oCLContext = await Process.PostIncomingPayments(incomingPayment);

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
        /// Retrieves a list of payments for mobile applications based on the specified criteria.
        /// </summary>
        /// <param name="DateFrom">The start date for filtering payments.</param>
        /// <param name="DateTo">The end date for filtering payments.</param>
        /// <param name="CardCode">The card code associated with the payments. Defaults to an empty string if not provided.</param>
        /// <returns>A <see cref="HttpResponseMessage"/> containing the list of payments that match the specified criteria.</returns>
        [QueryStringExposer]
        [EnablePagination]
        public async Task<HttpResponseMessage> Get(string DateFrom, string DateTo, string CardCode="")
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<PaymentForCancel>> oCLContext = await Process.GetPaymentsMobile( DateFrom,  DateTo, CardCode);

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
    }
}
