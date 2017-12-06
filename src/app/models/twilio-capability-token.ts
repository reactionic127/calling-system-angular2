import {
  BaseModel,
  Attribute,
  JsonApiModelConfig
} from '../base.model';

@JsonApiModelConfig({
  type: 'twilio'
})
export class TwilioCapabilityToken extends BaseModel {
  @Attribute()
  token: string;
}
