import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';

@JsonApiModelConfig({
  type: 'leaders'
})
export class Leader extends BaseModel {
  @Attribute()
  firstName: string;

  @Attribute()
  lastName: string;

  @Attribute()
  signedIn: boolean;

  @Attribute()
  goals: number;

  @Attribute()
  earned: number;

  @Attribute()
  calls: number;
}
