import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { QuestionService, CampaignContactService, UtilsService } from '../../../../../services';
import { Campaign, Question, CampaignContact } from '../../../../../models';
import * as _ from 'lodash';

export enum CONTACT_LIST_TABS {
  USER_INFO,
  CONV_OUTCOME,
  PROF_DET,
  CALL_HIST
}

@Component({
  selector   : 'contact-list',
  templateUrl: './contact-list.component.html'
})
export class ContactListComponent implements OnInit {

  contactsImportLink: string = '';

  public selectedContact: CampaignContact;
  public contacts: CampaignContact[];
  public totalItems: string;
  public tabs: any                 = CONTACT_LIST_TABS;
  public statuses: any             = {
    incompleted: {
      class     : 'incompleted',
      label     : 'Call Back',
      phoneClass: 'incompleted'
    },
    dnc        : {
      class     : 'dnc',
      label     : 'Do Not Call',
      phoneClass: 'dnc'
    },
    failed     : {
      class     : 'failed',
      label     : 'No Result',
      phoneClass: 'failed'
    },
    completed  : {
      class     : 'completed',
      label     : 'Completed',
      phoneClass: 'completed'
    },
    untried    : {
      class     : 'untried',
      label     : 'Untried',
      phoneClass: 'untried'
    },
    voicemail  : {
      class     : 'voicemail',
      label     : 'Voicemail',
      phoneClass: 'voicemail'
    },
    outdated  : {
      class     : 'untried',
      label     : 'Number changed',
      phoneClass: 'untried'
    }
  };
  public currentPage: number       = 1;
  public itemsPerPage: number      = 10;
  public nextExists: boolean       = false;
  public currentStatus: string     = 'All statuses';
  public currentOutcome: string    = 'All outcomes';
  public filters: any              = {
    outcome: '',
    fieldId: ''
  };
  public sorts: any                = {
    name        : {
      label   : 'Name',
      selected: false,
      dir     : 'asc',
      param   : 'firstName'
    },
    company     : {
      label   : 'Company',
      selected: false,
      dir     : 'asc',
      param   : 'company'
    },
    outcome     : {
      label   : 'Outcome',
      selected: false,
      dir     : 'asc',
      param   : 'calls.status'
    },
    caller      : {
      label   : 'Caller',
      selected: false,
      dir     : 'asc',
      param   : 'calls.caller.user.firstName'
    },
    last_call_at: {
      label   : 'Last Call At',
      selected: false,
      dir     : 'asc',
      param   : 'calls.calledAt'
    }
  };
  public key: string               = '';
  public selectedQuestion: Question;
  public currentRouteChild: string = 'contact-list';
  public openTab: number;
  public statusIds: string[]       = Object.keys(this.statuses);
  private campaign: Campaign;
  private questions: Question[];
  private allQuestions: Question[];

  constructor(private service: CampaignContactService,
              private questionService: QuestionService,
              private utilsService: UtilsService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit(): void {
    this.campaign = this.route.snapshot.parent.parent.data['campaign'];
    this.updateMainList();
    this.getQuestionList(this.campaign.id);
    this.buildContactsImportLink();
  }

  updateMainList(): void {
    // this.selectContact(null);
    let params = {
      campaignId: this.campaign.id,
      page      : {number: this.currentPage, size: this.itemsPerPage},
      filter    : {
        status : this.filters.outcome,
        fieldId: this.filters.fieldId,
        name   : this.key
      }
    };
    let sort   = Object.keys(this.sorts)
      .filter(k => this.sorts[k].selected)
      .map(k => this.sorts[k].dir === 'asc' ? this.sorts[k].param : '-' + this.sorts[k].param)
      .join(',');
    if (sort) {
      params['sort'] = sort;
    }
    let subs = this.service.getListPaged(params).subscribe(
      (items: any[]) => {
        this.contacts = items[0];
        if (this.contacts.length > 0) {
          this.selectContact(this.contacts[0]);
        }
        this.totalItems = items[1];
      },
      err => err,
      () => subs.unsubscribe()
    );
  }

  getQuestionList(campaignId: string): void {
    let subs = this.questionService.getList({id: campaignId}).subscribe(
      (questions: any[]) => {
        this.allQuestions = questions
          .sort((a, b) => a.position - b.position);
        this.questions    = this.allQuestions
          .filter(q => ['multiple_checkbox', 'multiple_radio'].indexOf(q.responseType) !== -1);
      },
      err => err,
      () => subs.unsubscribe()
    );
  }

  selectContact(contact: CampaignContact): void {
    this.selectedContact = contact;
    if (contact) {
      this.setOpenTab(CONTACT_LIST_TABS.USER_INFO);
    }
  }

  setOpenTab(tab: number): void {
    switch (tab) {
      case CONTACT_LIST_TABS.USER_INFO:
      case CONTACT_LIST_TABS.PROF_DET:
        this.openTab = tab;
        break;

      case CONTACT_LIST_TABS.CONV_OUTCOME:
      case CONTACT_LIST_TABS.CALL_HIST:
        if (this.selectedContact.calls) {
          this.openTab = tab;
        }
        break;

      default:
        this.openTab         = null;
        this.selectedContact = null;
        break;
    }
  }

  onChangeContact(contact: any): void {
    this.updateMainList();
  }

  onDeleteContact(contact: CampaignContact): void {
    let idxContact = _.findIndex(this.contacts, {'id': contact.id});
    this.contacts.splice(idxContact, 1);
    this.selectContact(this.contacts[idxContact]);
  }

  filterByOutcome(outcome: string): void {
    if (!outcome) {
      this.currentOutcome  = 'All outcomes';
      this.filters.outcome = '';
    } else {
      this.currentOutcome  = this.statuses[outcome].label;
      this.filters.outcome = outcome;
    }
    this.changePage({page: 1});
  }

  filterByQuestion(questionId: string): void {
    [this.selectedQuestion] = this.questions.filter(q => q.id === questionId);
    if (+questionId === 0) {
      this.filters.fieldId = '';
      this.updateMainList();
    }
  }

  filterByQuestionField(fieldId: string): void {
    this.filters.fieldId = fieldId ? fieldId : '';
    this.changePage({page: 1});
    this.updateMainList();
  }

  changePage(navData: any): void {
    this.currentPage  = navData.page;
    this.itemsPerPage = navData.itemsPerPage || this.itemsPerPage;
    this.updateMainList();
  }

  sortBy(sortObj: any): void {
    if (sortObj.selected) {
      // sort asc
      // sort desc
      // remove sorting
      if (sortObj.dir === 'asc') {
        sortObj.dir = 'desc';
      } else {
        sortObj.dir      = 'asc';
        sortObj.selected = false;
      }
    } else {
      sortObj.selected = true;
    }
    this.currentPage = 1;
    this.updateMainList();
  }

  buildContactsImportLink(): void {
    let segmentedUrl = this.utilsService.getUrlByFirstSegments(this.router.url, 3);

    this.contactsImportLink = `${segmentedUrl}/settings/contacts/import`;
  }

  searchContact(event: any): void {
    this.currentPage = 1;
    if (this.key !== event.target.value) {
      this.key = event.target.value;
      this.updateMainList();
    }
  }
}
