import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CONTACT_LIST_TABS } from '../contact-list.component';
import { CampaignCall, QuestionResponse, Question } from '../../../../../../models';
import * as _ from 'lodash';

@Component({
  selector   : 'contact-conversation-outcome',
  templateUrl: './contact-conversation-outcome.component.html'
})
export class ContactConversationOutcomeComponent implements OnInit {

  @Input() questions: Question[];
  @Input() questionResponses: QuestionResponse[];
  @Input() call: CampaignCall;
  @Input() openTab: CONTACT_LIST_TABS;
  @Output() chgOpenTab: EventEmitter<any> = new EventEmitter();
           tabs: any                      = CONTACT_LIST_TABS;
           responsesByQIds: any;

  setOpenTab(tab: string): void {
    this.chgOpenTab.emit(tab);
  }

  ngOnInit(): void {
    this.responsesByQIds = _.keyBy(this.questionResponses, r => {
      if (r.question) {
        return r.question.id;
      } else {
        return -1;
      }
    });
  }

}
