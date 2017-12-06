import { BelongsTo, HasMany } from 'angular2-jsonapi';
import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';
import { Caller } from './caller';
import { CallRecording } from './call-recording';
import { Rating } from './rating';
import { CampaignCaller } from './campaign-caller';

@JsonApiModelConfig({
  type: 'calls'
})
export class CampaignCall extends BaseModel {
  @Attribute()
  callerId: number;

  @Attribute()
  note: string;

  @Attribute()
  status: string;

  @Attribute()
  duration: number;

  @Attribute()
  calledAt: string;

  @Attribute()
  cost: string;

  @Attribute()
  costUnit: string;

  @Attribute()
  callerCost: string;

  @Attribute()
  twilioSid: string;

  @Attribute()
  campaignerCost: number;

  set _campaignerCost(set: number) {
    this.__campaignerCost = +set;
  }

  get _campaignerCost(): number {
    return this.__campaignerCost;
  }

  @Attribute()
  priceId: number;

  @Attribute()
  callerCommission: string;

  @HasMany()
  set callRecordings(set: CallRecording[]) {
    this._callRecordings = set;
    if (!set || !set.length) {
      this.lastCallRecordingUrl = null;
      return;
    }
    this.lastCallRecordingUrl = set[set.length - 1].recordingUrl;
  }

  get callRecordings(): CallRecording[] {
    return this._callRecordings;
  }

  @BelongsTo()
  caller: Caller;

  @BelongsTo()
  campaignCaller: CampaignCaller;

  @BelongsTo()
  rating: Rating;

  lastCallRecordingUrl: string;
  private _callRecordings: CallRecording[];
  private __campaignerCost: number;
}

export let CallStatuses: any = {
  completed         : {
    class: 'completed',
    label: 'btn_status_completed',
    title: 'Completed'
  },
  voicemail         : {
    class: 'voicemail',
    label: 'btn_status_voicemail',
    title: 'Voicemail'

  },
  call_back_later   : {
    class: 'voicemail',
    label: 'btn_status_call_back_later',
    title: 'Call Back Later'
  },
  busy              : {
    class: 'voicemail',
    label: 'btn_status_busy',
    title: 'Busy'
  },
  no_answer         : {
    class: 'untried',
    label: 'btn_status_no_answer',
    title: 'No Answer'
  },
  wrong_number      : {
    class: 'untried',
    label: 'btn_status_wrong_number',
    title: 'Wrong Number'
  },
  no_service        : {
    class: 'untried',
    label: 'btn_status_no_service',
    title: 'No Service'
  },
  technical_issue   : {
    class: 'untried',
    label: 'btn_status_technical_issue',
    title: 'Technical issue'
  },
  untried           : {
    class: 'untried',
    label: 'btn_status_untried',
    title: 'Untried'
  },
  hungup            : {
    class: 'dnc',
    label: 'btn_status_dnc',
    title: 'Hangup'
  },
  not_interested    : {
    class: 'dnc',
    label: 'btn_status_not_interested',
    title: 'Not Interested'
  },
  dnc               : {
    class: 'dnc',
    label: 'btn_status_dnc',
    title: 'Dnc'
  },
  completed_fu_email: {
    class: 'completed',
    label: 'btn_status_completed',
    title: 'Completed'
  },
  completed_fu_call: {
    class: 'completed',
    label: 'btn_status_completed',
    title: 'Completed'
  },
  speaking: {
    class: 'untried',
    label: 'speaking',
    title: 'Speaking'
  }
};
