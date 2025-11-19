namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddEmailTypeInUsersTable : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Users", "EmailType", c => c.Int(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Users", "EmailType");
        }
    }
}
