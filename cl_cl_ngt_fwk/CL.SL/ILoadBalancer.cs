namespace CL.SL
{
    /// <summary>
    /// 
    /// </summary>
    internal interface ILoadBalancer
    {
        /// <summary>
        /// Generates a temporal node to allow temporal and non locking sessions
        /// </summary>
        /// <param name="_domain"></param>
        /// <returns></returns>
        VirtualNode GetVirtualNode(in System.String _domain);

        /// <summary>
        /// Invokes node's generation, detach and release flows.
        /// Builds a valid sap service layer session
        /// </summary>
        /// <param name="_slRequestObject">Context of the requests to get sap credentials</param>
        /// <returns></returns>
        System.Threading.Tasks.Task<Node> GetNodeAsync(
            CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject _slRequestObject);

        /// <summary>
        /// Builds context of service layer transaction requested using selected node by ILoadBalancer
        /// </summary>
        /// <param name="_sLRequestObject">Transaction details</param>
        /// <returns></returns>
        System.Net.Http.HttpRequestMessage BuildRequest(
            in CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject _sLRequestObject);
    }
}