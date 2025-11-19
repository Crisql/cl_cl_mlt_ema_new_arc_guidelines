namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Add_Table_LocalPrinters : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.LocalPrinters",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        UserAssingId = c.Int(nullable: false),
                        UseLocalPrint = c.Boolean(nullable: false),
                        PortServicePrintMethod = c.String(),
                        PrinterName = c.String(),
                        CreatedDate = c.DateTime(nullable: false),
                        CreatedBy = c.String(),
                        UpdateDate = c.DateTime(),
                        UpdatedBy = c.String(),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.UserAssigns", t => t.UserAssingId, cascadeDelete: true)
                .Index(t => t.UserAssingId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.LocalPrinters", "UserAssingId", "dbo.UserAssigns");
            DropIndex("dbo.LocalPrinters", new[] { "UserAssingId" });
            DropTable("dbo.LocalPrinters");
        }
    }
}
