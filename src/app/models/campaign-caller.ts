import { BelongsTo } from 'angular2-jsonapi';
import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';
import { Rating } from './rating';
import { User } from './user';
import { Caller } from './caller';
import { Picture } from './picture';

@JsonApiModelConfig({
  type: 'campaignCallers'
})
export class CampaignCaller extends BaseModel {
  @Attribute() status: string;

  @Attribute() campaignId: number;

  @Attribute() callerId: number;

  @Attribute() totalCalls: number;

  @Attribute() talkingCalls: number;

  @Attribute() successCalls: number;

  @Attribute() removalReason: string;

  @Attribute() removalOtherReason: string;

  @BelongsTo() caller: Caller;

  @BelongsTo() user: User;

  @BelongsTo() rating: Rating;

  @BelongsTo() picture: Picture;
}

export const CampaignCallerStatuses: any = {
  approved: 'Approved',
  pending : 'Pending',
  rejected: 'Rejected'
};
