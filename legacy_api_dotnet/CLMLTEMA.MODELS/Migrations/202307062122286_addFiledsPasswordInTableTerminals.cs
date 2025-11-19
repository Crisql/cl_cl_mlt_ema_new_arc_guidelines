namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class addFiledsPasswordInTableTerminals : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Terminals", "Password", c => c.String());
            AddColumn("dbo.TerminalsByUsers", "IsDefault", c => c.Boolean(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.TerminalsByUsers", "IsDefault");
            DropColumn("dbo.Terminals", "Password");
        }
    }
}
