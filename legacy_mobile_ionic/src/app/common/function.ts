import { formatDate } from "@angular/common";
import { IUdf, IUdfDevelopment } from "../interfaces/i-udfs";

/**
 * This function is for format date
 * @returns
 */
export function FormatDate(_date: Date | string = null): string {
    if(_date){
        return formatDate(new Date(_date), 'yyyy-MM-dd', 'en');
    }else{
        return formatDate(new Date(), 'yyyy-MM-dd', 'en');
    }
}

/**
 * Returns current date and time in the 'America/Costa_Rica' time zone as a string
 * @constructor
 */
export function ZoneDate(): string {
    return new Date().toLocaleString('en-US', {timeZone: 'America/Costa_Rica'})
}

/**
 * Function to add months to a date
 * @param _months parameter months
 * @constructor
 */
export function AddMonths(_months: number) {
    let newDate = new Date();
    newDate.setMonth(newDate.getMonth() + _months);
    return newDate;
}

/**
 * Function to add days to a date
 * @param _days parameter days
 * @constructor
 */
export function AddDays(_days: number) {
    let newDate = new Date();
    newDate.setDate(newDate.getDate() + _days);
    return newDate;
}

/**
 * This function is for mapping udfs development
 * @param _data
 * @param _udfsDevelopment
 * @constructor
 */
export function MappingUdfsDevelopment<T>(_data: T, _udfsDevelopment: IUdfDevelopment[]): IUdf[] {

    let udfsDevelopment: IUdf[] = [];

    if (!_data) {
        return udfsDevelopment;
    }

    if (_udfsDevelopment && _udfsDevelopment.length > 0) {

        let properties = Object.entries(_data)
            .filter(([clave, valor]) => _udfsDevelopment.some(x => x.Key === clave && valor));

        if (properties && properties.length > 0) {

            properties.forEach(([key, value]) => {
                let udf = _udfsDevelopment.find(x => x.Key === key);

                udfsDevelopment.push({
                    Name: udf.Name,
                    FieldType: udf.FieldType,
                    Value: value
                } as IUdf)
            })


        }

    }

    return udfsDevelopment;
}

/**
 * This Methos is for mapping udfs
 * @param _data
 * @param _udfs
 * @constructor
 */
export function MappingUdfs<T>(_data: T, _udfs: IUdf[]): IUdf[] {

    let UDFList: IUdf[] = [];

    if (!_data || (!_udfs || _udfs.length === 0)) {
        return UDFList;
    }

    const udfMap: Record<string, string> = _udfs.reduce((map, udf) => {
        map[udf.Name] = udf.FieldType;
        return map;
    }, {});

    UDFList = Object.entries(_data)
        .filter(([key, value]) => value)
        .map(([key, value]) => {
            return {
                Name: key,
                FieldType: udfMap[key] ?? '',
                Value: value
            } as IUdf
        });


    return UDFList;
}

/**
 * Take a decimal number and preserve only the quantity of decimals specified. Default quantity of decimals is 2
 * @param _qtyDecimales Quantity of decimals to preserve in the result value
 * @param _amount The amount to round
 * @returns 
 */
export function CLMathRound(_qtyDecimales: number = 2, _amount: number): number {
    const DECS = (() => +`1${`0`.repeat(_qtyDecimales)}`)();
    const RESULT = Math.round((_amount) * DECS) / DECS;
    return RESULT;
}