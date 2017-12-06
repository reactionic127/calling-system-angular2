import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';

@JsonApiModelConfig({
  type: 'callerUserStats'
})
export class CallerStats extends BaseModel {
  @Attribute()
  completedCampaigns: number;

  @Attribute()
  followUp: number;

  @Attribute()
  rating: number;

  @Attribute()
  earnedToday: number;

  @Attribute()
  balance: number;

  @Attribute()
  nextPayment: number;
}
