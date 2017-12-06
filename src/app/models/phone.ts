import {
  BaseModel,
  Attribute,
  JsonApiModelConfig
} from '../base.model';
import * as phoneUtil from 'google-libphonenumber';

@JsonApiModelConfig({
  type: 'phones'
})
export class Phone extends BaseModel {
  @Attribute()
  number: string;

  @Attribute()
  areaCode: number;

  @Attribute()
  country: string;

  @Attribute()
  extension: string;

  contactId: string;

  get fullNumber(): string {
    if (this._fullNumber === undefined) {
      this.updateFullNumber();
    }
    return this._fullNumber;
  }

  private _fullNumber: string;

  public updateFullNumber(): void {
    if (!this.number) {
      this._fullNumber = this.extension || '';
      return;
    }
    let phoneUtilInst = phoneUtil.PhoneNumberUtil.getInstance();
    let phoneNumber = phoneUtilInst.parse(this.number, this.country);
    this._fullNumber = (this.number ? phoneUtilInst.format(phoneNumber, phoneUtil.PhoneNumberFormat.INTERNATIONAL) : '') +
      (this.extension && this.number ? ' x ' : '') + (this.extension || '');
  }
}
