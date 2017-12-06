import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ViewChild } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { CampaignContact, CampaignContactStatuses, Rating } from '../../../../../../models';
import { CampaignContactService, CallReviewService, TranslateService } from '../../../../../../services';
import { CONTACT_LIST_TABS } from '../contact-list.component';
import { Logger } from 'angular2-logger/core';
import { ModalConfirmationComponent } from '../../../modals/confirmation/confirmation.modal';

@Component({
  selector   : 'user-information',
  templateUrl: './user-information.component.html',
})
export class UserInformationComponent implements OnInit, OnChanges {

  @Input() selectedContact: CampaignContact;
  @Output() chgOpenTab: EventEmitter<any>    = new EventEmitter();
  @Output() updateContact: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteContact: EventEmitter<any> = new EventEmitter<any>();

  statuses: any = {
    incompleted: {
      class: 'incompleted',
      label: 'Call Back'
    },
    dnc        : {
      class: 'dnc',
      label: 'Do Not Call'
    },
    failed     : {
      class: 'failed',
      label: 'No Result'
    },
    completed  : {
      class: 'completed',
      label: 'Completed'
    },
    untried    : {
      class: 'untried',
      label: 'Untried'
    },
    voicemail  : {
      class: 'voicemail',
      label: 'Voicemail'
    },
    outdated  : {
      class     : 'untried',
      label     : 'Number changed',
      phoneClass: 'untried'
    }
  };

  tipsList: number[]          = [5, 10, 20];
  tabs: any                   = CONTACT_LIST_TABS;
  statusIds: string[]          = Object.keys(this.statuses);
  callReview: Rating;
  confirmationMessage: string = '';

  @ViewChild(ModalConfirmationComponent) confirmationModal: ModalConfirmationComponent;

  constructor(private toastr: ToastsManager,
              private service: CampaignContactService,
              private callReviewService: CallReviewService,
              private translateService: TranslateService,
              private logger: Logger) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: any): void {
    if (changes.selectedContact) {
      if (this.selectedContact.lastCall) {
        this.callReview = this.selectedContact.lastCall.rating;
        if (!this.callReview && this.selectedContact.triedCall) {
          this.callReview = this.callReviewService.getNewModel();
        }
      } else {
        this.callReview = null;
      }
    }
  }

  setOpenTab(tab: string): void {
    this.chgOpenTab.emit(tab);
  }

  onChangeContactStatus(newStatus: CampaignContactStatuses): void {
    this.selectedContact.status = newStatus;
    let subs                    = this.service.updateItem(this.selectedContact).subscribe(
      (item: CampaignContact) => {
        this.selectedContact = item;
        this.updateContact.emit(this.selectedContact);
      },
      err => err,
      () => subs.unsubscribe()
    );
  }

  onDeleteContact(): void {
    let subs = this.service.deleteItem(this.selectedContact)
      .subscribe(
        () => {
          this.toastr.success(this.translateService.translate('Contact removed'));
          this.deleteContact.emit(this.selectedContact);
        },
        error => {
          this.toastr.error(this.translateService.translate('Contact not removed'));
          this.logger.error('Error while removing contact ID:' + this.selectedContact.id, error);
        },
        () => subs.unsubscribe()
      );
  }

  setRateCall(rateVal: number): void {
    this.callReview.rate = rateVal;
  }

  rateCall(): void {
    this.callReview.callId = this.selectedContact.lastCall.id;
    let subs               = this.callReviewService.updateItem(this.callReview).subscribe(
      (item: any) => {
        this.callReview                      = item;
        this.selectedContact.lastCall.rating = item;
        this.toastr.success(this.translateService.translate('Saved'));
      },
      err => err,
      () => subs.unsubscribe()
    );
  }

  confirmDeleteContact(contact: CampaignContact): void {
    this.confirmationMessage = 'Are you sure you want to remove contact ' + contact.fullName + '?';
    this.confirmationModal.show();
  }
}
