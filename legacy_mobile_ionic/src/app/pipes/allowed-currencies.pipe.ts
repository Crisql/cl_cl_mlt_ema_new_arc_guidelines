import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "allowedCurrencies",
})
export class AllowedCurrenciesPipe implements PipeTransform {
  transform(currencies: any[], customerCurrency: string): unknown {
    return !customerCurrency || customerCurrency === "##"
      ? currencies
      : currencies.filter((x) => x.Id === customerCurrency);
  }
}
