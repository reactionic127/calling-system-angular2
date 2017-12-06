import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';

@JsonApiModelConfig({
  type: 'creditCards'
})
export class CreditCards extends BaseModel {
}
