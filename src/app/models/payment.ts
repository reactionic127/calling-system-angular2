import { BaseModel, Attribute, JsonApiModelConfig, BelongsTo } from '../base.model';
// import { CallerPayMethod } from './caller-pay-method';
import { Caller } from './caller';

@JsonApiModelConfig({
  type: 'payment'
})
export class Payment extends BaseModel {
  @Attribute()
  tips: number;

  @Attribute()
  commission: number;

  @Attribute()
  amount: number;

  @Attribute()
  callerUserId: number;

  @Attribute()
  date: Date;

  @Attribute()
  earnedPerMinute: number;

  @BelongsTo() callerUser: Caller;
}
