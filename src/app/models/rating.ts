import { BaseModel, Attribute, JsonApiModelConfig, BelongsTo } from '../base.model';
import { ClientSatisfaction } from './client-satisfaction';
import { Caller } from './caller';

@JsonApiModelConfig({
  type: 'ratings'
})
export class Rating extends BaseModel {
  @Attribute() rate: number;
  @Attribute() review: string;
  @Attribute() tip: string;
  @Attribute() campaignName: string;
  @Attribute() companyName: string;
  @Attribute() scoringType: string;

  campaignCallerId?: number;
  callId?: string;

  @BelongsTo() callerClientRating: ClientSatisfaction;
  @BelongsTo() callers: Caller;
}
