import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';
import * as CountryList from 'country-list';

@JsonApiModelConfig({
  type: 'addresses'
})
export class Address extends BaseModel {
  static countryListService: any = new CountryList();

  @Attribute()
  recipient: string;

  @Attribute()
  line1: string;

  @Attribute()
  line2: string;

  @Attribute()
  city: string;

  @Attribute()
  postalCode: number;

  @Attribute()
  region: string;

  @Attribute()
  country: string;

  // set country(set: string) {
  //   this._country     = set;
  //   this._countryName = undefined;
  // }

  // get country(): string {
  //   return this._country;
  // }

  contactId?: string;

  companyId?: string;
  private _country: string;
  private _countryName: string;

  get countryName(): string {
    if (!this._countryName) {
      this._countryName = Address.countryListService.getName(this.country);
    }
    return this._countryName;
  }
}
