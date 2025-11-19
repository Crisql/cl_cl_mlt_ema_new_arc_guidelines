using CL.COMMON;
using CLMLTEMA.PROCESS;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON.ActionFilters;
using CL.COMMON.ActionFilters.ServiceLayer;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.MODELS.SAP;
using Item = CL.STRUCTURES.CLASSES.SAP.Item;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class ItemsController : ApiController
    {
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(string WhsCode, string ViewType)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<ItemSearch>> oCLContext = await Process.GetItems(WhsCode, ViewType);

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

        [EnablePagination]
        public async Task<HttpResponseMessage> Get(string ItemCode, string WhsCode, string ViewType)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                CLContext<List<ItemSearch>> oCLContext = await Process.GetItemsWithFilters(ItemCode, WhsCode, ViewType);
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
        /// Retrieves information based on the specified parameters.
        /// </summary>
        /// <param name="ItemCode">The item code used for retrieval.</param>
        /// <param name="WhsCode">The warehouse code used for retrieval.</param>
        /// <param name="PriceList">The price list used for retrieval.</param>
        /// <param name="CardCode">The card code used for retrieval.</param>
        /// <param name="PrchseItem">The purchase item used for retrieval.</param>
        /// <param name="SysNumber">The system number used for retrieval.</param>
        /// <param name="ViewType">The view type used for retrieval.</param>
        /// <returns>An asynchronous task that returns an HttpResponseMessage with the requested information.</returns>
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(string ItemCode, string WhsCode, int PriceList, string CardCode,
            string PrchseItem,int SysNumber, string ViewType)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<ItemsModelSap> cLContext = await Process.GetItem( ItemCode,  WhsCode,  PriceList,  CardCode,
                     PrchseItem, SysNumber,  ViewType);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(cLContext);
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
        /// Retrieves the stock availability of a specific item in each warehouse.
        /// </summary>
        /// <param name="ItemCode">The unique code of the item to query stock for.</param>
        /// <returns>
        /// A <see cref="HttpResponseMessage"/> containing a list of <see cref="StockInWarehouses"/> objects 
        /// wrapped in a custom context response.
        /// </returns>
        [Route("~/api/Items/{ItemCode}/WarehouseAvailability")]
        [HttpGet]
        [QueryStringExposer]
        public async Task<HttpResponseMessage> GetItemWarehouseAvailability(string ItemCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<StockInWarehouses>> oCLContext = await Process.GetItemWarehouseAvailability(ItemCode);

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

        public async Task<HttpResponseMessage> Post(ItemsModel Item)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<ItemModel> oCLContext = await Process.CreateItem(Item);

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

        public async Task<HttpResponseMessage> Patch(ItemsModel Item)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");


                CLContext<ItemModel> oCLContext = await Process.UpdateItem(Item);


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
        /// Handles a GET request to retrieve items available for stock transfer.
        /// </summary>
        /// <param name="WhsCode">The warehouse code to filter items.</param>
        /// <param name="BinAbs">The bin location identifier.</param>
        /// <param name="WarehouseDefault">The default warehouse name.</param>
        /// <returns>An HttpResponseMessage with the result of the transfer items retrieval.</returns>
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(string WhsCode, int BinAbs, string WarehouseDefault)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<ItemsForTransferStock>> cLContext = await Process.GetItemsForTansfers(WhsCode, BinAbs, WarehouseDefault);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(cLContext);
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
        /// Handles a GET request to retrieve items available for stock transfer with pagination.
        /// </summary>
        /// <param name="WhsCode">The warehouse code to filter items.</param>
        /// <param name="BinAbs">The bin location identifier.</param>
        /// <param name="WarehouseDefault">The default warehouse name.</param>
        /// <param name="ItemCode">The item code to filter items.</param>
        /// <returns>An HttpResponseMessage with the result of the transfer items retrieval.</returns>

        [EnablePagination]
        [QueryStringExposer]
        public async Task<HttpResponseMessage> GetTransferRequest(string WhsCode, int BinAbs, string WarehouseDefault, string ItemCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<ItemsForTransferStock>> cLContext = await Process.GetItemsForTansfersPagination(WhsCode, BinAbs, WarehouseDefault, ItemCode);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(cLContext);
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
        /// Handles a GET request to retrieve items available for stock transfer from the specified warehouse.
        /// </summary>
        /// <param name="WhsCode">The warehouse code to filter items.</param>
        /// <returns>An HttpResponseMessage containing the result of the transfer items retrieval.</returns>
        [Route("api/Items/TransferRequest")]
        [HttpGet]
        [QueryStringExposer]
        public async Task<HttpResponseMessage> GetItemsForTansfersRequest(string WhsCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<ItemsForTransferStock>> cLContext = await Process.GetItemsForTansfersRequest(WhsCode);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(cLContext);
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
        /// Handles a GET request to retrieve items available for stock transfer with pagination.
        /// </summary>
        /// <param name="WhsCode">The warehouse code to filter items.</param>
        /// <param name="ItemCode">The item code to filter items.</param>
        /// <returns>An HttpResponseMessage with the result of the transfer items retrieval.</returns>
        [Route("api/Items/TransferRequest")]
        [HttpGet]
        [QueryStringExposer]
        [EnablePagination]
        public async Task<HttpResponseMessage> GetItemsForTansfersRequest(string WhsCode, string ItemCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<ItemsForTransferStock>> cLContext = await Process.GetItemsForTansfersRequestPagination(WhsCode, ItemCode);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(cLContext);
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
        
        // <summary>
        /// Retrieves item details based on the provided item code and document type.
        /// </summary>
        /// <param name="ItemCode">The code of the item to retrieve details for.</param>
        /// <param name="DocType">The type of document to filter the details.</param>
        /// <returns>An HTTP response message containing the item details.</returns>
        [Route("~/api/Items/ItemDetails")]
        [HttpGet]
        [EnablePagination]
        [QueryStringExposer]
        public async Task<HttpResponseMessage> GetItemDetails(string ItemCode, string DocType)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<ItemDetail>> oCLContext = await Process.GetItemDetails(ItemCode, DocType);

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
        /// Handles the HTTP POST request to retrieve data for a Good Receipt Invoice, including the last purchase price,
        /// average price, and deviation status for a list of item codes.
        /// </summary>
        /// <param name="ItemCodes">A list of item codes to retrieve data for.</param>
        /// <returns>An HttpResponseMessage containing the invoice data or an error response.</returns>
        [Route("~/api/Items/GetDataForGoodReceiptInvoice")]
        [HttpPost]
        public async Task<HttpResponseMessage> GetDataForGoodReceiptInvoice(List<string> ItemCodes)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<ItemDataForInvoiceGoodReceipt>> oCLContext = await Process.GetDataForGoodReceiptInvoice(ItemCodes);

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
        /// Retrieves the list of serial numbers for a specific item and warehouse through an HTTP GET request.
        /// </summary>
        /// <param name="ItemCode">The code of the item to retrieve serial numbers for.</param>
        /// <param name="WhsCode">The code of the warehouse where the item is stored.</param>
        /// <returns>An HTTP response message containing the list of serial numbers.</returns>
        [Route("api/Items/{ItemCode}/Warehouse/{WhsCode}/Series")]
        [HttpGet]
        [QueryStringExposer]
        public async Task<HttpResponseMessage> GetItemSeriesByWarehouse(string ItemCode, string WhsCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<SerialNumbers>> oCLContext = await Process.GetItemSeriesByWarehouse(ItemCode, WhsCode);

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
        /// This endpoint is used obtained stock available of item for warehouse
        /// </summary>
        /// <param name="ItemCode">Item Code</param>
        /// <param name="WhsCode">Warehouse code</param>
        /// <returns></returns>
        [QueryStringExposer]
        [Route("~/api/Items/StockAvailable")]
        [HttpGet]
       
        public async Task<HttpResponseMessage> GetStockAvailable(string ItemCode, string WhsCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<StockInWarehouses> oCLContext = await Process.GetStockAvailable(ItemCode, WhsCode);

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
        /// Method to get availability warehouses
        /// </summary>
        /// <param name="ItemCode">Item to search</param>
        /// <param name="FilterWarehouse">Warehouse to search</param>
        /// <returns></returns>
        [EnablePagination]
        [QueryStringExposer]
        [Route("api/Items/WarehouseAvailabilityByFilter")]
        [HttpGet]
        public async Task<HttpResponseMessage> WarehouseAvailabilityByFilter(string ItemCode, string FilterWarehouse)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<StockInWarehouses>> oCLContext = await Process.WarehouseAvailabilityByFilter(ItemCode,FilterWarehouse);

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
        
        [Route("api/Items/GetByScan")]
        [QueryStringExposer]
        [HttpGet]
        public async Task<HttpResponseMessage> GetByScan(string ItemCode, string WhsCode, string ViewType)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                CLContext<List<ItemSearch>> oCLContext = await Process.GetItemByScan(ItemCode, WhsCode, ViewType);
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
        /// Handles a GET request to retrieve items available for stock transfer via scan.
        /// </summary>
        /// <param name="WhsCode">The warehouse code to filter items.</param>
        /// <param name="ItemCode">The item code to filter items.</param>
        /// <returns>An HttpResponseMessage with the result of the transfer items retrieval.</returns>
        [Route("api/Items/TransfersRequestScan")]
        [HttpGet]
        public async Task<HttpResponseMessage> GetItemsForTansfersRequestScan(string WhsCode, string ItemCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<ItemsForTransferStock>> cLContext = await Process.GetItemsForTansfersRequestPagination(WhsCode, ItemCode);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(cLContext);
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
        /// Handles a GET request to retrieve items available for stock transfer using scan data.
        /// </summary>
        /// <param name="WhsCode">The warehouse code to filter items.</param>
        /// <param name="BinAbs">The bin location identifier.</param>
        /// <param name="WarehouseDefault">The default warehouse name.</param>
        /// <param name="ItemCode">The item code to filter items.</param>
        /// <returns>An HttpResponseMessage with the result of the transfer items retrieval based on scan data.</returns>

        [Route("api/Items/GetTransfersRequestScan")]
        [HttpGet]
        public async Task<HttpResponseMessage> GetTransferRequestScan(string WhsCode, int BinAbs, string WarehouseDefault, string ItemCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<ItemsForTransferStock>> cLContext = await Process.GetItemsForTansfersPagination(WhsCode, BinAbs, WarehouseDefault, ItemCode);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(cLContext);
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
        /// Retrieves all items for inventory entry filtered by warehouse with typeahead formatting.
        /// </summary>
        /// <param name="WhsCode">The warehouse code filter.</param>
        /// <param name="ViewType">The view type filter (e.g., InvntItem).</param>
        /// <returns>
        /// HTTP 200 with a serialized <see cref="CLContext{T}"/> containing
        /// <see cref="List{ItemSearch}"/> (with typeahead formatting) on success; an error response otherwise.
        /// </returns>
        [Route("api/Items/GetItemsEntryInventory")]
        [HttpGet]
        public async Task<HttpResponseMessage> GetItemsEntryInventory(string WhsCode, string ViewType)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<ItemSearch>> oCLContext = await Process.GetItemsInventoryEntry(WhsCode, ViewType);

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
        /// Retrieves a list of items for inventory entry modal with pagination and typeahead formatting.
        /// Pagination enabled via <c>[EnablePagination]</c>.
        /// </summary>
        /// <param name="ItemCode">The item code filter.</param>
        /// <param name="WhsCode">The warehouse code filter.</param>
        /// <param name="ViewType">The view type filter (e.g., InvntItem).</param>
        /// <returns>
        /// HTTP 200 with a serialized <see cref="CLContext{T}"/> containing
        /// <see cref="List{ItemSearch}"/> (paginated with typeahead formatting) on success; an error response otherwise.
        /// </returns>
        [Route("api/Items/GetItemsEntryInventoryPagination")]
        [HttpGet]
        [EnablePagination]
        public async Task<HttpResponseMessage> GetItemsEntryInventoryPagination(string ItemCode, string WhsCode, string ViewType)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<ItemSearch>> oCLContext = await Process.GetItemsEntryForInventoryModal(ItemCode, WhsCode, ViewType);

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
        /// Calculate the freight base on a list of items
        /// </summary>
        /// <param name="DocCurrecy"></param>
        /// <param name="ItemsToFreight"></param>
        /// <returns></returns>
        [Route("api/Items/CalculateFreight")]
        [HttpPost]
        public async Task<HttpResponseMessage> CalculateFreight(string DocCurrency, [FromBody] List<ItemToFreight> ItemsToFreight)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                
                CLContext<List<ItemToFreight>> oCLContext = await Process.CalculateFreight(DocCurrency, ItemsToFreight);
                
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