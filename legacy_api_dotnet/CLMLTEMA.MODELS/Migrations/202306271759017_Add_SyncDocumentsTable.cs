namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Add_SyncDocumentsTable : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.SyncDocuments",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        UserAssignId = c.Int(nullable: false),
                        CommittedDate = c.DateTime(nullable: false),
                        BackupsRequestAmount = c.Int(nullable: false),
                        TransactionType = c.String(),
                        TransactionStatus = c.String(),
                        TransactionDetail = c.String(),
                        DocEntry = c.Int(nullable: false),
                        DocNum = c.Int(nullable: false),
                        DocumentKey = c.String(),
                        DocumentType = c.String(),
                        RawDocument = c.String(),
                        CreatedDate = c.DateTime(nullable: false),
                        CreatedBy = c.String(),
                        UpdateDate = c.DateTime(),
                        UpdatedBy = c.String(),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.SyncDocuments");
        }
    }
}
