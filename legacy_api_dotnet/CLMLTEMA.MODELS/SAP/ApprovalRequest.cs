using System;
using System.Collections.Generic;
using CL.STRUCTURES.ATTRIBUTES;

namespace CLMLTEMA.MODELS.SAP
{
    public class ApprovalRequest
    {
        [MasterKey] public int Code { get; set; }
        public int ApprovalTemplatesID { get; set; }
        public string ObjectType { get; set; }
        public string IsDraft { get; set; }
        public int? ObjectEntry { get; set; }
        public string Status { get; set; }
        public string Remarks { get; set; }
        public int CurrentStage { get; set; }
        public int OriginatorID { get; set; }
        public DateTime CreationDate { get; set; }
        public string CreationTime { get; set; }
        public int DraftEntry { get; set; }
        public string DraftType { get; set; }
        public string ApprovedType { get; set; }
        public List<ApprovalRequestLine> ApprovalRequestLines { get; set; }
        public List<ApprovalRequestDecision> ApprovalRequestDecisions { get; set; }
    }

    public class ApprovalRequestLine
    {
        public int StageCode { get; set; }
        public int UserID { get; set; }
        public string Status { get; set; }
        public string Remarks { get; set; }
        public DateTime? UpdateDate { get; set; } 
        public string UpdateTime { get; set; }
        public DateTime CreationDate { get; set; }
        public string CreationTime { get; set; }
    }

    public class ApprovalRequestDecision
    {
        public string Status { get; set; }
        public string Remarks { get; set; }
    }

    public class ApprovedDraft
    {
        public Draft Document { get; set; }
    }
}