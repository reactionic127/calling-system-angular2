import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';

@JsonApiModelConfig({
  type: 'campaignStats'
})
export class CampaignStats extends BaseModel {
  @Attribute() contacts: number;

  @Attribute() emailFollowUp: number;

  @Attribute() phoneFollowUp: number;

  @Attribute() appointmentsFollowUp: number;

  @Attribute() calls: number;

  @Attribute() successCalls: number;

  @Attribute() userCallers: number;

  campaignId?: number;
}
