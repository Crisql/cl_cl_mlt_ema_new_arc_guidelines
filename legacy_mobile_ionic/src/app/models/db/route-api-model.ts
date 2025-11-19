import { RouteDetailApiModel } from "./routeDetail-api-model";

export class RouteApiModel {

    constructor(
        public Name: string,
        public User: string,
        public DB: string,
        public DateStart: string,
        public DateEnd: string,
        public Status: number,
        public V_RouteLines: Array<RouteDetailApiModel>
    ) {
    }

}
