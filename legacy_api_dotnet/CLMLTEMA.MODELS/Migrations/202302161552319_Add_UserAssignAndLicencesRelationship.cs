namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Add_UserAssignAndLicencesRelationship : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Licenses",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        User = c.String(),
                        Password = c.String(),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            AddColumn("dbo.UserAssigns", "LicenseId", c => c.Int(nullable: false));
            CreateIndex("dbo.UserAssigns", "LicenseId");
            AddForeignKey("dbo.UserAssigns", "LicenseId", "dbo.Licenses", "Id", cascadeDelete: true);
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.UserAssigns", "LicenseId", "dbo.Licenses");
            DropIndex("dbo.UserAssigns", new[] { "LicenseId" });
            DropColumn("dbo.UserAssigns", "LicenseId");
            DropTable("dbo.Licenses");
        }
    }
}
