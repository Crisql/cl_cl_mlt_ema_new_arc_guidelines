namespace CL.SL
{
    /// <summary>
    /// Defines an interface to avoid miss callings to Release method on SemaphoreSlim.
    /// </summary>
    internal interface ISlimLock
    {
        /// <summary>
        /// Invokes SemaphoreSlim awaiting and locks any future call of Release method on SemaphoreSlim
        /// </summary>
        System.Threading.Tasks.Task Enter();
        /// <summary>
        /// Invokes SemaphoreSlim releasing checking is current SemaphoreSlim has been Released
        /// </summary>
        void Exit();
    }
}