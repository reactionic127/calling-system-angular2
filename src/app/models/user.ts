import {
  BaseModel,
  Attribute,
  JsonApiModelConfig,
  BelongsTo
} from '../base.model';
import { Company } from './company';
import { Caller } from './caller';
import { Phone } from './phone';

@JsonApiModelConfig({
  type: 'users'
})
export class User extends BaseModel {
  @Attribute()
  email: string;
  @Attribute()
  firstName: string;
  @Attribute()
  lastName: string;
  @Attribute()
  status: string;
  @Attribute()
  role: string;
  @Attribute()
  timezone: string;
  @Attribute()
  uid: string;

  @Attribute()
  intercomHash: string;

  @Attribute()
  phoneNumber: string;

  @Attribute()
  sendbirdToken: string;

  @Attribute()
  createdAtTimestamp: number;

  get fullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  @BelongsTo()
  company: Company;

  @BelongsTo()
  caller: Caller;

  @BelongsTo()
  phone: Phone;

}
