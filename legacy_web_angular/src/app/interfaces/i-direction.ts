export interface IDirection {
  ProvinceId: string;
  CantonId: string;
  CantonName: string;
  DistrictId: string;
  DistrictName: string;
  NeighborhoodId: string;
  NeighborhoodName: string;

}
export interface IProvince {
  ProvinceId: string;
  ProvinceName: string;
}
export interface ICountry {
  Country: IDirection[];
}

export interface IProvinces {
  Provinces: IProvince[];
}
