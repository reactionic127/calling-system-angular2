import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';

@JsonApiModelConfig({
  type: 'keyvalues'
})
export class KeyValues extends BaseModel {
  @Attribute() key: string;
  @Attribute() value: string;
  contactId: string;
}
