namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Add_DBResourcesTable : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.DBResources",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(),
                        Description = c.String(),
                        Resource = c.String(),
                        IsActive = c.Boolean(nullable: false),
                        Type = c.String(),
                    })
                .PrimaryKey(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.DBResources");
        }
    }
}
