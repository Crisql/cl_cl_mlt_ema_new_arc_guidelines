namespace CL.SL
{
    /// <summary>
    /// Stores a temporal node which does not have an stored session o request context 
    /// </summary>
    internal class VirtualNode : ISlimLock
    {
        /// <summary>
        /// Allows to lock tread while is looking for a valid node
        /// </summary>
        private readonly System.Threading.SemaphoreSlim _domainLock;

        /// <summary>
        ///  Locks an accidental call to System.Threading.SemaphoreSlim.Release method
        /// </summary>
        private System.Boolean _isSemaphoreAcquired;

        /// <summary>
        /// Allows to create temporal node just to allow enqueue by domain
        /// </summary>
        public System.String Domain { get; }

        /// <summary>
        /// Initializes virtual node context
        /// </summary>
        /// <param name="_domain"></param>
        /// <param name="_semaphoreSlim"></param>
        public VirtualNode(System.String _domain, System.Threading.SemaphoreSlim _semaphoreSlim)
        {
            Domain = _domain;
            _domainLock = _semaphoreSlim;
        }

        /// <inheritdoc />
        public async System.Threading.Tasks.Task Enter()
        {
            await _domainLock.WaitAsync();
            _isSemaphoreAcquired = true;
        }

        /// <inheritdoc />
        public void Exit()
        {
            if (!_isSemaphoreAcquired) return;
            _domainLock.Release();
            _isSemaphoreAcquired = false;
        }
    }
}