import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';
import { BelongsTo } from 'angular2-jsonapi';
import { CampaignContact } from './campaign-contact';

@JsonApiModelConfig({
  type: 'questionAnswersDetails'
})
export class QuestionAnswerDetails extends BaseModel {
  @Attribute() createdAt: string;

  @Attribute() result: string;

  @BelongsTo() contact: CampaignContact;

  campaignId?: number;
  answerId?: number;
}
