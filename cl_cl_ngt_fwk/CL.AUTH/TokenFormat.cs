namespace CL.AUTH
{
    public class TokenFormat : Microsoft.Owin.Security.ISecureDataFormat<Microsoft.Owin.Security.AuthenticationTicket>
    {
        public System.String Protect(Microsoft.Owin.Security.AuthenticationTicket data)
        {
            System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
            Microsoft.IdentityModel.Tokens.SecurityToken token = tokenHandler.CreateToken(new Microsoft.IdentityModel.Tokens.SecurityTokenDescriptor
            {
                Subject = data.Identity,
                Expires = System.DateTime.UtcNow.AddMinutes(10),
                Issuer = "YourIssuer",
                Audience = "YourAudience",
                SigningCredentials = new Microsoft.IdentityModel.Tokens.SigningCredentials(new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.ASCII.GetBytes("CRyZ9MG5rxv/qAR5T/J5Ex9knqftvYn+7hQifkliNQg=")), Microsoft.IdentityModel.Tokens.SecurityAlgorithms.HmacSha256Signature)
            });
            return tokenHandler.WriteToken(token);
        }

        public Microsoft.Owin.Security.AuthenticationTicket Unprotect(string protectedText)
        {
            System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();

            Microsoft.IdentityModel.Tokens.TokenValidationParameters validationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidIssuer = "YourIssuer",
                ValidateAudience = false,
                ValidAudience = "YourAudience",
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.ASCII.GetBytes("CRyZ9MG5rxv/qAR5T/J5Ex9knqftvYn+7hQifkliNQg=")),
                ValidateLifetime = true,
                ClockSkew = System.TimeSpan.Zero
            };

            try
            {
                System.Security.Claims.ClaimsPrincipal claimsPrincipal = tokenHandler.ValidateToken(protectedText, validationParameters, out Microsoft.IdentityModel.Tokens.SecurityToken _);

                if (claimsPrincipal.Identity is System.Security.Claims.ClaimsIdentity claimsIdentity)
                {
                    Microsoft.Owin.Security.AuthenticationTicket ticket = new Microsoft.Owin.Security.AuthenticationTicket(claimsIdentity, new Microsoft.Owin.Security.AuthenticationProperties());
                    return ticket;
                }
            }
            catch (Microsoft.IdentityModel.Tokens.SecurityTokenException)
            {
                return null;
            }

            return null;
        }
    }
}