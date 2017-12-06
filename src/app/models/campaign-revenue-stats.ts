import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';


@JsonApiModelConfig({
  type: 'campaignRevenueStats'
})
export class CampaignRevenueStats extends BaseModel {
  @Attribute() callsTime: number;

  @Attribute() callsEarning: number;

  @Attribute() commission: number;

  @Attribute() tips: number;
}
