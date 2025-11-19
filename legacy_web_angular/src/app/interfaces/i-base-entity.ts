export interface IBaseEntity {
    Id: number;
    CreatedDate: Date  | string;
    CreatedBy: string;
    UpdateDate: Date  | string;
    UpdatedBy: string;
    IsActive: boolean;
    Active: string;
}
