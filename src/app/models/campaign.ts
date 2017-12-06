import { BaseModel, Attribute, HasMany, BelongsTo, JsonApiModelConfig } from '../base.model';
import { Question } from './question';
import { FollowUpActions } from './follow-up-actions';
import { CampaignSettings } from './campaign-settings';
import { CampaignBudget } from './campaign-budget';
import { CampaignCallerId } from './campaign-caller-id';
import { CallerId } from './caller-id';
import { Company } from './company';
import * as moment from 'moment';
import { SocialLinks } from './social-links';

export interface ICampaignCategory {
  label: string;
  description: string;
  types: Object;
}

export const CampaignTypes: Object = {
  lead_gen          : 'lead_gen',
  inform_product    : 'inform_product',
  appt_setting      : 'appt_setting',
  lead_qual         : 'lead_qual',
  confirm_attendance: 'confirm_attendance',
  alert_users       : 'alert_users',
  debt_collection   : 'debt_collection',
  feedback          : 'feedback',
  mystery_shopping  : 'mystery_shopping',
  market_research   : 'market_research',
  polls             : 'polls',
  inquire_biz       : 'inquire_biz',
  verify_info       : 'verify_info',
  other             : 'other'
};

export let CampaignTypesByCategory: Array<ICampaignCategory> = [
  {
    label      : 'Sales',
    description: 'sales description',
    types      : {
      [(CampaignTypes as any).lead_gen]      : 'Generate leads',
      //[(CampaignTypes as any).inform_product]: 'Increase product awareness',
      [(CampaignTypes as any).appt_setting]  : 'Set appointments',
      [(CampaignTypes as any).lead_qual]     : 'Qualify leads',
      [(CampaignTypes as any).other]     : 'Other'
    }
  },
  /*{
    label      : 'Engage with clients',
    description: 'inform clients description',
    types      : {
      [(CampaignTypes as any).confirm_attendance]: 'Confirm attendance',
      [(CampaignTypes as any).alert_users]       : 'Alert existing users',
      [(CampaignTypes as any).debt_collection]   : 'Debt collection'
    }
  },
  {
    label      : 'Feedback & survey',
    description: 'feedback and survey description',
    types      : {
      [(CampaignTypes as any).feedback]        : 'Collect client feedback',
      [(CampaignTypes as any).mystery_shopping]: 'Mystery shopping',
      [(CampaignTypes as any).market_research] : 'Market research',
      [(CampaignTypes as any).polls]           : 'Polls'
    }
  },
  {
    label      : 'Data collection',
    description: 'data collection description',
    types      : {
      [(CampaignTypes as any).inquire_biz]: 'Collect business information',
      [(CampaignTypes as any).verify_info]: 'Validate data'
    }
  },
  {
    label      : 'Other',
    description: 'other description',
    types      : {
      [(CampaignTypes as any).other]: 'Other'
    }
  }*/
];

export const CampaignStatus = {
  draft     : 'draft',
  pending   : 'pending',
  ready     : 'ready',
  pause     : 'pause',
  low_credit: 'low_credit',
  completed : 'completed',
  archived  : 'archived',
  run       : 'run'
};

@JsonApiModelConfig({
  type: 'campaigns'
})
export class Campaign extends BaseModel {
  @BelongsTo()
  followUpAction: FollowUpActions;

  @BelongsTo()
  campaignSetting: CampaignSettings;

  @HasMany()
  questions: Question[];

  @BelongsTo()
  campaignBudget: CampaignBudget;

  @BelongsTo()
  campaignCallerId: CampaignCallerId;

  @BelongsTo()
  company: Company;

  @BelongsTo()
  socialLinks: SocialLinks;

  @Attribute()
  companyId: string;

  @BelongsTo()
  callerId: CallerId;

  @Attribute()
  fromCallerId: string;

  @Attribute()
  name: string;

  @Attribute()
  createdAt: string;

  @Attribute()
  updatedAt: Date;

  @Attribute()
  startDate: string;

  @Attribute()
  endDate: string;

  @Attribute()
  fromNumber: number;

  @Attribute()
  cost: number;

  @Attribute()
  costType: string;

  @Attribute()
  language: string;

  @Attribute()
  status: string;

  @Attribute()
  progress: number;

  @Attribute()
  kind: string;

  @Attribute()
  alwaysOpen: boolean;

  @Attribute()
  instructions: string;

  @Attribute()
  extraInstructions: string;

  @Attribute()
  pitch: string;

  @Attribute()
  numberOfQuestions: number;

  @Attribute()
  numberOfContacts: number;

  @Attribute()
  callerLeaveCampaignId: string;

  @Attribute()
  noOfSeats: number;

  getLastActivityInDays(): number {
    let now = moment(new Date());
    let end = moment(this.updatedAt);
    let duration = moment.duration(now.diff(end));
    let days = duration.asDays();

    return Math.round(days);
  }

  getFollowUpAction(): FollowUpActions {
    return this.followUpAction;
  }

  getSettings(): CampaignSettings {
    return this.campaignSetting;
  }

  getQuestions(): Question[] {
    return this.questions;
  }

  getSameCategoryTypes(): any {
    let sameTypes = {};

    CampaignTypesByCategory.map(
      category => {
        for (let type of Object.keys(category.types)) {
          if (type === this.kind) {
            sameTypes = category.types;

            break;
          }
        }
      }
    );

    return sameTypes;
  }
}
