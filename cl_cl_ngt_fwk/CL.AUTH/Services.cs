using System.Linq;
using CL.COMMON.Extensions;

namespace CL.AUTH
{
    public class Services
    {
        public static System.String SendRecoveryEmail(
            System.Collections.Generic.Dictionary<System.String, System.String> claims,
            CL.STRUCTURES.CLASSES.Email.EmailCredential _emailCredential,
            CL.STRUCTURES.CLASSES.Rebound.CLContext<CL.STRUCTURES.CLASSES.LocalEntities.CLSingleValue<System.String>> _emailValidateResponse,
            System.String _recoveryURL
        )
        {

            if (_emailValidateResponse.Response is System.Object && _emailValidateResponse.Response.Data is System.Object && _emailValidateResponse.Response.Data.Value is System.Object)
            {
                System.DateTime date = System.DateTime.Now;

                CL.AUTH.TokenFormat tokenFormat = new TokenFormat();

                #region Register claims

                System.Security.Claims.ClaimsIdentity identity = new System.Security.Claims.ClaimsIdentity("Bearer");

                foreach (System.Collections.Generic.KeyValuePair<System.String, System.String> claim in claims)
                {
                    identity.AddClaim(new System.Security.Claims.Claim(claim.Key, claim.Value));
                }

                identity.AddClaim(new System.Security.Claims.Claim("ExpireTime", date.AddMinutes(10).ToString("yyyy/MM/dd HH:mm:ss")));
                identity.AddClaim(new System.Security.Claims.Claim("Email", _emailValidateResponse.Response.Data.Value));

                #endregion

                Microsoft.Owin.Security.AuthenticationProperties props = new Microsoft.Owin.Security.AuthenticationProperties(claims);

                Microsoft.Owin.Security.AuthenticationTicket ticket = new Microsoft.Owin.Security.AuthenticationTicket(identity, props);

                System.String token = tokenFormat.Protect(ticket);

                CL.STRUCTURES.CLASSES.Email.EmailDetails emailDetails = new CL.STRUCTURES.CLASSES.Email.EmailDetails()
                {
                    EmailsTo = new System.Collections.Generic.List<System.String>() { _emailValidateResponse.Response.Data.Value },
                    Subject = "Recuperación de contraseña",
                    Body = $"<p>Por favor visita el siguiente enlace para recuperar tu contraseña <a href='{_recoveryURL}?token={token}'>[Cambiar mi contraseña]</a></p>"
                };

                CL.COMMON.Core.SendEmail(_emailCredential, emailDetails);

                return token;
            }

            return null;
        }

        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<CL.STRUCTURES.CLASSES.LocalEntities.CLSingleValue<System.String>> ValidateRecovery<T>(System.String _spValidateEmail, System.String _email) where T : System.Data.Entity.DbContext, new()
        {
            CL.COMMON.LogManager.Record($"VALIDATING USER EMAIL STATUS");

            CL.STRUCTURES.CLASSES.Rebound.CLContext<CL.STRUCTURES.CLASSES.LocalEntities.CLSingleValue<System.String>> oClContext
                = CL.DB.Services.Execute<CL.STRUCTURES.CLASSES.LocalEntities.CLSingleValue<System.String>, T, System.String, CL.STRUCTURES.INTERFACES.ICLSingle>(
                    _spValidateEmail, _email).Get();

            CL.COMMON.LogManager.Record($"VALIDATING USER EMAIL COMPLETED");

            return oClContext;
        }

        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<T>>
            ChangePassword<T, U>(System.String _spChangePassword, System.String _token, System.String _newPassword)
            where T : new() where U : System.Data.Entity.DbContext, new()
        {

            Microsoft.Owin.Security.AuthenticationTicket oTicket = new CL.AUTH.TokenFormat().Unprotect(_token);

            if (oTicket is null)
            {
                return new CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<T>>()
                {
                    value = null,
                    Code = System.Net.HttpStatusCode.Unauthorized,
                    Response = new CL.STRUCTURES.CLASSES.Rebound.Response<System.Collections.Generic.IEnumerable<T>>()
                    {
                        Data = null,
                        Message = ""
                    }
                };
            }

            var email = System.Convert.ToString(oTicket.Identity.Claims.Where(c => c.Type.Equals("Email")).FirstOrDefault()?.Value);

            CL.COMMON.LogManager.Record($"CHANGING USER RECOVERED PASSWORD");

            CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<T>> oClContext
                = CL.DB.Services.Execute<CL.STRUCTURES.CLASSES.PresentationEntities.CartesianEntity<System.String, System.String, System.String>, T, U>(
                    _spChangePassword, new CL.STRUCTURES.CLASSES.PresentationEntities.CartesianEntity<System.String, System.String, System.String>()
                    {
                        AKey = _token,
                        BKey = email,
                        CKey = _newPassword
                    }).Patch();

            CL.COMMON.LogManager.Record($"USER RECOVERED PASSWORD COMPLETED");

            return oClContext;
        }

        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<T>>
            ChangePassword<T, U>(System.String _spChangePassword, System.String _email, System.String _oldPassword, System.String _newPassword)
            where T : new() where U : System.Data.Entity.DbContext, new()
        {
            CL.COMMON.LogManager.Record($"CHANGING USER RECOVERED PASSWORD");

            CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<T>> oClContext
                = CL.DB.Services.Execute<CL.STRUCTURES.CLASSES.PresentationEntities.CartesianEntity<System.String, System.String, System.String>, T, U>(
                    _spChangePassword, new CL.STRUCTURES.CLASSES.PresentationEntities.CartesianEntity<System.String, System.String, System.String>()
                    {
                        AKey = _email,
                        BKey = _oldPassword,
                        CKey = _newPassword
                    }).Patch();

            CL.COMMON.LogManager.Record($"USER RECOVERED PASSWORD COMPLETED");

            return oClContext;
        }
    }
}