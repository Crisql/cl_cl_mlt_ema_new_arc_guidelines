namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Remove_CreationDate_Add_TerminalIdonPPStoredTransactions : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.PPStoredTransactions", "TerminalId", c => c.String());
            DropColumn("dbo.PPStoredTransactions", "CreationDate");
        }
        
        public override void Down()
        {
            AddColumn("dbo.PPStoredTransactions", "CreationDate", c => c.DateTime(nullable: false));
            DropColumn("dbo.PPStoredTransactions", "TerminalId");
        }
    }
}
