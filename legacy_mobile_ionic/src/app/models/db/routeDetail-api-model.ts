export class RouteDetailApiModel {

    constructor(
        public Address: string,
        public Time: string,
        public Date: string,
        public CoordX: number,
        public CoordY: number,
        public CardCode: string,
        public CardName: string,
        public Status: number,
        public SuccessfulVisit: number,
        //        public idRoute:number,

    ) {
    }

}