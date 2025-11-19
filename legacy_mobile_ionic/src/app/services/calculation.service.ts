import { Injectable } from '@angular/core';
import {IItem} from "../models/i-item";
import {ICalculatedPrice, IPriceList} from "../models/i-price-list";
import {IMeasurementUnit} from "../models";


/**
 * This service is created to store these functions in order to eliminate circular dependencies between services.
 */
@Injectable({
  providedIn: 'root'
})
export class CalculationService {

  constructor() { }


  /**
   * Used to round an amount with the specified decimals
   * @param _number The amount to round
   * @param _decimalsCount The decimals count. Default value: 2
   * @constructor
   */
  RoundTo(_number: number | string, _decimalsCount: number = 2) : number
  {
    let parsedNumber: number = parseFloat(_number.toString());

    return Number(parsedNumber.toFixed(_decimalsCount));
  }

  /**
   * Try to get price from units of measure, if not from prices, else return 0
   * @param _item The item to get the price
   * @param _itemPrices The item prices list
   * @param _measurementUnits The item measurement units
   * @param _selectedPriceList The number of the price list in use
   * @param _decimalsCount The count of decimal to preserve in the calc
   * @constructor
   */
  CalculateItemPrice(
      _item: IItem,
      _itemPrices: IPriceList[],
      _measurementUnits: IMeasurementUnit[],
      _selectedPriceList: number,
      _decimalsCount: number
  ): ICalculatedPrice {

    if (!_itemPrices || !_itemPrices.length)
    {
      return { Price: 0, Currency: '' };
    }

    if (!(_item.AllowUnits && _measurementUnits && _measurementUnits.length > 0))
    {
      let priceList = _itemPrices.find(price => price.PriceList === _selectedPriceList);

      return {
        Price: this.RoundTo(priceList ? priceList.Price : 0, _decimalsCount),
        Currency: priceList ? priceList.Currency : ''
      };
    }

    if (_item.UoMEntry > 0)
    {
      let differentiatedPrice = _itemPrices.find((price) => price.UomEntry === _item.UoMEntry);

      if (differentiatedPrice)
      {
        return {
          Price: this.RoundTo(differentiatedPrice.Price, _decimalsCount),
          Currency: differentiatedPrice.Currency
        };
      }
    }

    if (_item.UoMEntry < 0)
    {
      _item.UoMEntry = Number(_item.AllowUnits.split(",")[0]);
    }

    let productBaseMeasurementUnit = _measurementUnits.find((mUnit) =>
        mUnit.UgpEntry === _item.UgpEntry &&
        mUnit.UoMEntry === _item.PriceUnit
    );

    let productBasePrice = _itemPrices.find((price) => price.UomEntry === _item.PriceUnit);

    let productSalesMeasurementUnit = _measurementUnits.find((mUnit) =>
        mUnit.UgpEntry === _item.UgpEntry &&
        mUnit.UoMEntry === _item.UoMEntry
    );

    return {
      Price: this.RoundTo(this.RoundTo(productBasePrice.Price / productBaseMeasurementUnit.BaseQty, _decimalsCount) * productSalesMeasurementUnit.BaseQty, _decimalsCount),
      Currency: productBasePrice.Currency
    };
  }


  /**
   * Try to get price for units of measure, else return 0
   * @param _itemPrices The item prices list
   * @param _measurementUnit The measurement unit calculate the price
   * @param _decimalsCount The count of decimal to preserve in the calc
   * @constructor
   */
  CalculateMeasurementUnitPrice(
      _itemPrices: IPriceList[],
      _measurementUnit: IMeasurementUnit,
      _decimalsCount: number
  ): ICalculatedPrice {

    if (!_itemPrices || !_itemPrices.length)
    {
      return { Price: 0, Currency: '' };
    }

    let productBasePrice = _itemPrices.find((price) => price.UomEntry === _measurementUnit.UoMEntry);

    return {
      Price: this.RoundTo(this.RoundTo(productBasePrice.Price / _measurementUnit.BaseQty, _decimalsCount) * _measurementUnit.BaseQty, _decimalsCount),
      Currency: productBasePrice.Currency
    };
  }


  /**
   * Calculates the total value based on a percentage of a given amount.
   *
   * @param pMonto - The base amount to calculate the percentage from.
   * @param pPercent - The percentage to apply to the base amount.
   * @returns The calculated value rounded to the nearest valid unit.
   */
  calculateTotalPercent(pMonto: number, pPercent: number): number {
    return this.RoundTo((pMonto * pPercent) / 100);
  }
}
