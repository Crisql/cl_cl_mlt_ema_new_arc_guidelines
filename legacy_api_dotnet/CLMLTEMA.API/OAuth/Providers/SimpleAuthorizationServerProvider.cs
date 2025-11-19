using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.OAuth;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using CL.COMMON.Extensions;
using CL.STRUCTURES.CLASSES.LogManager;
using Microsoft.Owin;

namespace CLMLTEMA.API
{
    public class SimpleAuthorizationServerProvider : OAuthAuthorizationServerProvider
    {
        //Overriding to  OAuthAuthorizationServerProvider classes ValidateClientAuthentication method.
        public override async Task ValidateClientAuthentication(OAuthValidateClientAuthenticationContext context)
        {
            context.Validated();
        }

        //Overriding to  OAuthAuthorizationServerProvider classes GrantResourceOwnerCredentials method.
        public override async Task GrantResourceOwnerCredentials(OAuthGrantResourceOwnerCredentialsContext context)
        {
            try
            {
                DateTime date = DateTime.Now;

                #region Validate user access and Get user information

                User user = Process.GetUserByCredentials(context.UserName, context.Password);

                #region Validacion de recaptcha
                 
                   string reCaptchaToken = context.Request.Headers["Cl-Recaptcha-Token"];
                  
                   await Process.ValidRecatcha(reCaptchaToken);
                
                 #endregion

                #endregion

                #region Register claims

                ClaimsIdentity identity = new ClaimsIdentity(context.Options.AuthenticationType);
                identity.AddClaim(new Claim("ClientId", context.UserName));
                identity.AddClaim(new Claim("UserId", user.Id.ToString()));
                identity.AddClaim(new Claim("UserEmail", user.Email));

                #endregion

                #region Validate Resources

                // Resource validation is discussed because it is not yet fully implemented.
                // Process.ValidateResourcesVersions();

                #endregion

                AuthenticationProperties props = new AuthenticationProperties(new Dictionary<string, string>
                {
                    { "UserEmail", user.Email },
                    { "UserId", user.Id.ToString() },
                    { "ExpireTime", date.AddDays(1).ToString("yyyy/MM/dd HH:mm:ss") }
                });

                AuthenticationTicket ticket = new AuthenticationTicket(identity, props);
                context.Validated(ticket);
            }
            catch (Exception ex)
            {
                string errMsg = ex.InnerException != null
                    ? ex.InnerException.InnerException != null
                        ? ex.InnerException.InnerException.InnerException != null
                            ? ex.InnerException.InnerException.InnerException.Message
                            : ex.InnerException.InnerException.Message
                        : ex.InnerException.Message
                    : ex.Message;

                CL.COMMON.LogManager.Record($"ERROR: {errMsg}");

                context.SetError("error", errMsg);
            }
            finally
            {
                new List<ClLogManagerOption>()
                {
                    new ClLogManagerOption()
                    {
                        Key = "LogPath",
                        Value = CL.COMMON.Core.GetConfigKeyValue(System.Reflection.MethodBase.GetCurrentMethod(),
                            "LogPath")
                    },
                    new ClLogManagerOption() { Key = "FileName", Value = "AUTH" },
                    new ClLogManagerOption() { Key = "User", Value = context.UserName },
                }.Ctor().Build().Dtor();

                CL.COMMON.LogManager.Commit();
                CL.COMMON.LogManager.FlushSettings();
            }
        }

        public override Task TokenEndpoint(OAuthTokenEndpointContext context)
        {
            foreach (KeyValuePair<string, string> property in context.Properties.Dictionary)
            {
                context.AdditionalResponseParameters.Add(property.Key, property.Value);
            }

            return Task.FromResult<object>(null);
        }
    }
}