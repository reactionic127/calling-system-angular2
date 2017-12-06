import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';
import { CampaignContact } from './campaign-contact';
import { BelongsTo } from 'angular2-jsonapi';

@JsonApiModelConfig({
  type: 'followUpResponses'
})
export class FollowUpResponses extends BaseModel {

  @Attribute()
  email: string;

  @Attribute()
  callBack: Date;

  @Attribute()
  appointment: Date;

  @Attribute()
  contactId: number;

  @Attribute()
  createdAt: Date;

  @Attribute()
  updatedAt: string;

  callbackChecked: boolean;

  get emailChecked(): boolean {
    return this.email != null && this.email !== '';
  }

  // tslint:disable-next-line:typedef
  set emailChecked(value) {

  }

  get appointmentChecked(): boolean {
    return this.appointment != null && this.appointment.toString() !== '';
  }

  // tslint:disable-next-line:typedef
  set appointmentChecked(value) {

  }

  appointmentHour: string;
  appointmentDateModel: any;

  @BelongsTo() contact: CampaignContact;

  campaignId?: number;
}
