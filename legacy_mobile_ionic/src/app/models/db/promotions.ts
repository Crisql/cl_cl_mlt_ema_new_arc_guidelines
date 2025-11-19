export interface PromotionsModel {
    // identificador de la promocion
    Id: number;
    // nombre de la regla
    Rule: string;
    // cantidad de items de la promocion
    Quantity: number;
    // unidad de medida
    UnitMeasurement: string;
    // codigo del item al que se le aplica la promocion
    ItemCode: string;
    // porcentaje de descuento aplicado
    Discount: number;
    // tipo de descuento
    DiscountType: number;
    // secuencia de las unidades a aplicar la promocion
    Sequence: number;
    // ver la descripcion de la promocion
    UseDescripPromo: boolean;
    // descripcion de la promocion
    DescripPromo: string;
    // identificador de la compañia
    CompanyId: number;
}
