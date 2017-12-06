import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';


@JsonApiModelConfig({
  type: 'callerIds'
})
export class CallerId extends BaseModel {
  @Attribute() phoneNumber: string;
  @Attribute() phoneExtension: string;
  @Attribute() status: string;

  formatFullPhoneNumber(): string {
    let result = this.phoneNumber;
    if (this.phoneExtension) {
      result += (' ' + this.phoneExtension);
    }
    return result;
  }
}
