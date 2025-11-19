namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddTableUdf : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.CompanyUdfs",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        CompanyId = c.Int(nullable: false),
                        TableId = c.String(),
                        Udfs = c.String(),
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
            DropTable("dbo.CompanyUdfs");
        }
    }
}
