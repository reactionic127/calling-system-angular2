import { BelongsTo } from 'angular2-jsonapi';
import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';
import { Caller } from './caller';

@JsonApiModelConfig({
  type: 'earnings'
})
export class Earning extends BaseModel {
  @Attribute() name: string;

  @Attribute() rate: number;

  @Attribute() tip: number;

  @Attribute() calledAt: string;

  @Attribute() duration: number;

  @Attribute() callerCommission: string;

  @Attribute() earnedPerMinute: string;

  @BelongsTo() caller: Caller;

}
