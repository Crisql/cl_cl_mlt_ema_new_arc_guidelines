export class Customer {

    constructor(
        public CardCode: string,
        public CardName: string,
        public Currency: string,
        public ShipToDef: string,
        public TaxCode: string,
        public CreditLine: string,
        public Balance: string,
        public Phone1: string,
        public Cellular: string,
        public E_mail: string,
        public Discount: number,
        public PriceListNum: number,
        public PayTermsCode: number,
        public BPGroup: number,
        public U_MaxDiscBP: number,
        public U_Lat: string,
        public U_Lng: string,
        public ContactPerson: string,
        public U_TipoIdentificacion: string,
        public LicTradNum: string,
        public U_provincia: string,
        public U_canton: string,
        public U_distrito: string,
        public U_barrio: string,
        public U_direccion: string,
        public SubTipo: string,
        public id: number,
        public HeaderDiscount: number
    ) { }


}