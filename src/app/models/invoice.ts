import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';

@JsonApiModelConfig({
  type: 'invoices'
})
export class Invoice extends BaseModel {
}
