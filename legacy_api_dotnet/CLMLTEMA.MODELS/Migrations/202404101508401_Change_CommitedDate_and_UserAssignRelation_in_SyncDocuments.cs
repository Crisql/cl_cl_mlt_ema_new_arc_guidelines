namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Change_CommitedDate_and_UserAssignRelation_in_SyncDocuments : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.SyncDocuments", "OfflineDate", c => c.DateTime(nullable: false));
            CreateIndex("dbo.SyncDocuments", "UserAssignId");
            AddForeignKey("dbo.SyncDocuments", "UserAssignId", "dbo.UserAssigns", "Id", cascadeDelete: true);
            DropColumn("dbo.SyncDocuments", "CommittedDate");
        }
        
        public override void Down()
        {
            AddColumn("dbo.SyncDocuments", "CommittedDate", c => c.DateTime(nullable: false));
            DropForeignKey("dbo.SyncDocuments", "UserAssignId", "dbo.UserAssigns");
            DropIndex("dbo.SyncDocuments", new[] { "UserAssignId" });
            DropColumn("dbo.SyncDocuments", "OfflineDate");
        }
    }
}
