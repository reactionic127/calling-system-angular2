import { Component, OnInit, OnChanges, Output, EventEmitter, Input } from '@angular/core';
import { CONTACT_LIST_TABS } from '../contact-list.component';
import { CampaignCall, CallStatuses, CampaignContact } from '../../../../../../models';
import * as moment from 'moment';

@Component({
  selector: 'contact-call-history',
  templateUrl: './contact-call-history.component.html'
})
export class ContactCallHistoryComponent implements OnInit, OnChanges {
  // todo: move to pipe
  moment: any = moment;
  @Input() contact: CampaignContact;
  @Input() calls: CampaignCall;
  @Input() openTab: CONTACT_LIST_TABS;
  @Output() chgOpenTab: EventEmitter<any> = new EventEmitter();
  tabs: any = CONTACT_LIST_TABS;


  public statuses: any = CallStatuses;

  getStatusLabel(statValue: any): string {
    return 'btn_' + statValue;
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: any): void {
  }

  setOpenTab(tab: string): void {
    this.chgOpenTab.emit(tab);
  }

}
