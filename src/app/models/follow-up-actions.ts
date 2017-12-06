import { BaseModel, Attribute, JsonApiModelConfig, BelongsTo } from '../base.model';
import { Campaign } from './campaign';

@JsonApiModelConfig({
  type: 'followUpActions'
})
export class FollowUpActions extends BaseModel {
  @BelongsTo()
  campaign: Campaign;

  @Attribute()
  email: number;

  @Attribute()
  callBack: number;

  @Attribute()
  appointment: number;

  @Attribute()
  campaignId: number;
}
