namespace CLMLTEMA.MODELS
{
    public class RecoveryPassword
    {
        public string Token { get; set; }
        public string Email { get; set; }
    }
    
    public class ChangePassword
    {
        
        public string Email { get; set; }
        public string NewPassword { get; set; }
        public string OldPassword { get; set; }
    }
}