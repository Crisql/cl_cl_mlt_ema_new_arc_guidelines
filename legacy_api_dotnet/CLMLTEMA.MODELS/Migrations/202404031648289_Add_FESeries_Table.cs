namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Add_FESeries_Table : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.FESeries",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        SerieName = c.String(),
                        BranchOffice = c.Int(nullable: false),
                        Terminal = c.Int(nullable: false),
                        NextNumber = c.Int(nullable: false),
                        SeriesByUserId = c.Int(nullable: false),
                        CreatedDate = c.DateTime(nullable: false),
                        CreatedBy = c.String(),
                        UpdateDate = c.DateTime(),
                        UpdatedBy = c.String(),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.SeriesByUsers", t => t.SeriesByUserId, cascadeDelete: true)
                .Index(t => t.SeriesByUserId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.FESeries", "SeriesByUserId", "dbo.SeriesByUsers");
            DropIndex("dbo.FESeries", new[] { "SeriesByUserId" });
            DropTable("dbo.FESeries");
        }
    }
}
