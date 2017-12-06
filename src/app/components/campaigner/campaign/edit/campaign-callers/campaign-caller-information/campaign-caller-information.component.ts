import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnChanges } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { CampaignCaller, Rating } from '../../../../../../models';
import { CallerReviewService, TranslateService, AuthService } from '../../../../../../services';
import { ModalRejectCallerComponent } from '../../../modals/caller-reject/caller-reject.modal';

@Component({
  selector   : 'campaign-caller-information',
  templateUrl: './campaign-caller-information.component.html',
})
export class CampaignCallerInformationComponent implements OnInit, OnChanges {

  tipsList: number[] = [5, 10, 20];

  rating: Rating;

  @Input() selectedCaller: CampaignCaller;
  @Output() updateCaller: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(ModalRejectCallerComponent) rejectCallerModal: ModalRejectCallerComponent;

  constructor(private toastr: ToastsManager,
              private translateService: TranslateService,
              private callerReviewService: CallerReviewService,
              private _authService: AuthService) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: any): void {
    if (changes.selectedCaller) {
      this.rating = this.selectedCaller.rating ? this.selectedCaller.rating : this.callerReviewService.getNewModel();
    }
  }

  get chanelId(): any {
    if (this._authService.currentUserData && this.selectedCaller.user) {
      return `${this._authService.currentUserData.id},${this.selectedCaller.user.id}`;
    } else {
      return '';
    }
  }

  get loggedUser(): any {
    return this._authService.currentUserData;
  };

  rejectCaller(removalReason: string, removalOtherReason: string = null): void {
    this.updateCaller.emit({
      status            : 'reject',
      caller            : this.selectedCaller,
      removalReason     : removalReason,
      removalOtherReason: removalOtherReason
    });
  }

  rateCaller(): void {
    this.rating.campaignCallerId = +this.selectedCaller.id;

    let subs = this.callerReviewService.updateItem(this.rating).subscribe(
      (item: any) => {
        this.selectedCaller.rating = this.rating = item;
        this.toastr.success(this.translateService.translate('Saved'));
      },
      err => err,
      () => subs.unsubscribe()
    );
  }

  callerApproval(status: string): void {
    if (status === 'reject') {
      this.rejectCallerModal.action = 'reject';
      this.rejectCallerModal.show();
    } else if (status === 'remove') {
      this.rejectCallerModal.action = 'remove';
      this.rejectCallerModal.show();
    } else {
      this.updateCaller.emit({status: status, caller: this.selectedCaller});
    }
  }
}
