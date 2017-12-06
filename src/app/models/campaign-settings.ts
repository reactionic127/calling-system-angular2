import {
  BaseModel,
  Attribute,
  JsonApiModelConfig
} from '../base.model';
import { CampaignTime } from './campaign-time';
import { HasMany } from 'angular2-jsonapi';

@JsonApiModelConfig({
  type: 'campaignSettings'
})
export class CampaignSettings extends BaseModel {
  @Attribute() callRecording: boolean;
  @Attribute() emailReplyTo: string;
  @Attribute() emailTitle: string;
  @Attribute() emailMessage: string;
  @Attribute() emailSender: string;
  @Attribute() voicemail: number;
  @Attribute() voicemailScriptText: string;
  @Attribute() vmMessage: string;
  @Attribute() dontCallAfterVoicemail: boolean;
  @Attribute() calendarType: CalendarType;
  @Attribute() calendarUrl: string;
  @Attribute() retries: number;
  @Attribute() callsInterval: number;
  @Attribute() closeCampaign: boolean;
  @Attribute() scrub: boolean;
  @Attribute() autoApprove: boolean;

  @HasMany() campaignTimes: CampaignTime[];

  campaignId?: number;
}

type CalendarType = 'url' | 'google' | 'ical';
