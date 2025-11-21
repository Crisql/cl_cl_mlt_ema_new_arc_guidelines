namespace CL.SL
{
    /// <summary>
    /// Contains requests queues syncs by its own semaphore
    /// </summary>
    public class Node
    {
        /// <summary>
        /// Represents time in minutes where session can be reused
        /// </summary>
        private const System.Int32 SessionTime = 25;

        /// <summary>
        /// Used to check if SessionId must be singed out
        /// </summary>
        private const System.Int32 TimeToDetach = 25;

        /// <summary>
        /// If a SessionId has been singed out
        /// </summary>
        public System.Boolean HasBeenDetached { get; set; }

        /// <summary>
        /// Requests queue
        /// </summary>
        public readonly System.Collections.Concurrent.ConcurrentQueue<System.Threading.Tasks.TaskCompletionSource<System.Boolean>>
            Queue = new System.Collections.Concurrent.ConcurrentQueue<System.Threading.Tasks.TaskCompletionSource<System.Boolean>>();

        /// <summary>
        /// Syncs all Sl requests to enqueue by company and license
        /// </summary>
        public readonly System.Threading.SemaphoreSlim Semaphore = new System.Threading.SemaphoreSlim(1, 1);

        /// <summary>
        /// Makes requests to service layer
        /// </summary>
        public System.Net.Http.HttpClient HttpClient { get; set; }

        /// <summary>
        /// Stores saps license
        /// </summary>
        public System.String License { get; set; }

        /// <summary>
        /// Company to get logged in
        /// </summary>
        public System.String Company { get; set; }

        /// <summary>
        /// Host to make any transaction
        /// </summary>
        public System.String BaseAddress { get; set; }

        /// <summary>
        /// Cookie to be attached on any request
        /// </summary>
        public System.String SessionId { get; set; }

        /// <summary>
        /// When session is stored in node
        /// </summary>
        public System.DateTime PushTime { get; set; }

        /// <summary>
        /// Checks if service layer cookie expiration time (A valid session has less than 25 minutes in memory)
        /// </summary>
        public System.Boolean IsNodeValid
        {
            get
            {
                // Calculate the time difference in minutes
                System.TimeSpan timeDifference = System.DateTime.Now - PushTime;
                System.Int32 minutesDifference = (System.Int32)timeDifference.TotalMinutes;

                // Return true if more than 25 minutes have passed
                return minutesDifference < SessionTime;
            }
        }

        /// <summary>
        /// Used to check dequeue a node. If node has more than 25 minutes in memory 
        /// </summary>
        public System.Boolean MustBeDetach
        {
            get
            {
                // Calculate the time difference in minutes
                System.TimeSpan timeDifference = System.DateTime.Now - PushTime;
                System.Int32 minutesDifference = (System.Int32)timeDifference.TotalMinutes;

                // Return true if more than TimetoDetach variable
                return minutesDifference > TimeToDetach;
            }
        }
    }
}