
import { IBaseEntity } from "./i-base-entity";

export interface IConection extends IBaseEntity {
    Name :string;
    Odbctype :string;
    Server :string;
    User :string;
    Pass :string;
    ServerType :string;
    SLUrl :string;

}
