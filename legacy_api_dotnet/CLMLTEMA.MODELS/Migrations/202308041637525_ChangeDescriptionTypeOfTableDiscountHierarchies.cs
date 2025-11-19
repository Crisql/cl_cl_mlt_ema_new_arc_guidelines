namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class ChangeDescriptionTypeOfTableDiscountHierarchies : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.DiscountHierarchies", "Description", c => c.String());
        }
        
        public override void Down()
        {
            AlterColumn("dbo.DiscountHierarchies", "Description", c => c.Int(nullable: false));
        }
    }
}
