import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';

@JsonApiModelConfig({
  type: 'campaignCallerIds'
})
export class CampaignCallerId extends BaseModel {
  @Attribute() callerIdId: string;

  @Attribute() campaignId: string;

  @Attribute() createdAt: string;

  @Attribute() updatedAt: string;

}
