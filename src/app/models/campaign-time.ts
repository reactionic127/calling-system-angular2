import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';

@JsonApiModelConfig({
  type: 'campaignTimes'
})
export class CampaignTime extends BaseModel {
  @Attribute() startTime: number;

  @Attribute() endTime: number;

  campaignSettingId?: number;
}
