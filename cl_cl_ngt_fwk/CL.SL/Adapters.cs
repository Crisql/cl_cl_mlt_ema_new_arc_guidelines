namespace CL.SL.ADAPTERS
{
    internal class SLMessage
    {
        public System.String lang { get; set; }
        public System.String value { get; set; }
    }

    internal class SLError
    {
        public System.Int32 code { get; set; }
        public SLMessage message { get; set; }
    }

    internal class SLResponse
    {
        public SLError error { get; set; }
    }
}