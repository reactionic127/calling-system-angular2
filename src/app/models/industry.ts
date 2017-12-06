import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';

@JsonApiModelConfig({
  type: 'industries'
})
export class Industry extends BaseModel {
  @Attribute() name: string;

  @Attribute() language: string;
}
