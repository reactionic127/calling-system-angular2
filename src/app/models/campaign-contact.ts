import { HasMany, BelongsTo } from 'angular2-jsonapi';
import {
  BaseModel,
  Attribute,
  JsonApiModelConfig
} from '../base.model';
import { CampaignCall } from './campaign-call';
import { Phone } from './phone';
import { Address } from './address';
import { SocialLinks } from './social-links';
import { KeyValues } from './key-values';
import { FollowUpResponses } from './follow-up-responses';
import { QuestionResponse } from './question-response';
import { CampaignCaller } from './campaign-caller';

export type CampaignContactStatuses = 'dnc'
  | 'failed'
  | 'incompleted'
  | 'completed'
  | 'deleted'
  | 'outdated'
  | 'voicemail';

@JsonApiModelConfig({
  type: 'contacts'
})

export class CampaignContact extends BaseModel {
  @Attribute()
  callAt: string;

  @Attribute()
  campaignId: string;

  @Attribute()
  email: string;

  @Attribute()
  firstName: string;

  @Attribute()
  lastName: string;

  get fullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  @Attribute()
  info: string;

  @Attribute()
  title: string;

  @Attribute()
  company: string;

  @Attribute()
  hints: string;

  @Attribute()
  status: any;

  @Attribute()
  availableForCall: boolean;

  set _status(set: CampaignContactStatuses) {
    this.__status  = set;
    this.triedCall = ['voicemail', 'completed', 'failed'].indexOf(this.__status) !== -1;
    this.cssColor  = ({
      completed  : 'green',
      voicemail  : 'orange',
      incompleted: 'green',
      dnc        : 'red',
      failed     : 'red',
      untried    : 'gray',
    })[set];
  }

  get _status(): CampaignContactStatuses {
    return this.__status;
  }

  @BelongsTo() address: Address;
  @HasMany() calls: CampaignCall[];
  @BelongsTo() followUpResponse: FollowUpResponses;
  @HasMany() keyvalues: KeyValues[];
  @BelongsTo() lastCall: CampaignCall;
  @BelongsTo() lastCampaignCaller: CampaignCaller;
  @BelongsTo() phone: Phone;
  @HasMany() questionResponses: QuestionResponse[];
  @BelongsTo() socialLink: SocialLinks;

  triedCall: boolean;
  cssColor: string;
  private __status: CampaignContactStatuses;
}
