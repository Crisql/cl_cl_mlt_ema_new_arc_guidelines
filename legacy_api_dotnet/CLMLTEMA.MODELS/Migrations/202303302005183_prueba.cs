namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class prueba : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Licenses", "x", c => c.Int(nullable: false));
            AddColumn("dbo.Licenses", "CompanyDB", c => c.String());
            AddColumn("dbo.Licenses", "Discriminator", c => c.String(nullable: false, maxLength: 128));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Licenses", "Discriminator");
            DropColumn("dbo.Licenses", "CompanyDB");
            DropColumn("dbo.Licenses", "x");
        }
    }
}
