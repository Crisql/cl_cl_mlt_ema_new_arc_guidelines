namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddUseSchedulingAndEmailPasswordToUsersTable : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Users", "UseScheduling", c => c.Boolean(nullable: false));
            AddColumn("dbo.Users", "EmailPassword", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Users", "EmailPassword");
            DropColumn("dbo.Users", "UseScheduling");
        }
    }
}
