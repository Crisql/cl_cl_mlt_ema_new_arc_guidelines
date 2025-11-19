namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Add_Group_Field_To_CompanyUdfs_Entity : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.CompanyUdfs", "Groups", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.CompanyUdfs", "Groups");
        }
    }
}
