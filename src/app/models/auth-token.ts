import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';

@JsonApiModelConfig({
  type: 'authTokens'
})
export class AuthToken extends BaseModel {
  @Attribute()
  companyId: number;

  @Attribute()
  createdAt: string;

  @Attribute()
  token: string;

  @Attribute()
  updatedAt: string;

}
