namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Add_TransactionTypeFieldOnPPStoredTransactions : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.PPStoredTransactions", "TransactionType", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.PPStoredTransactions", "TransactionType");
        }
    }
}
