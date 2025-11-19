namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Rm_DbObjectNamesTable : DbMigration
    {
        public override void Up()
        {
            DropTable("dbo.DbObjectNames");
        }
        
        public override void Down()
        {
            CreateTable(
                "dbo.DbObjectNames",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(),
                        Description = c.String(),
                        DbObject = c.String(),
                        Type = c.String(),
                    })
                .PrimaryKey(t => t.Id);
            
        }
    }
}
