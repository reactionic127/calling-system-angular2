import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { CampaignCallersService, CampaignSettingsService, TranslateService, CampaignService } from '../../../../../services';
import { CampaignCaller, CampaignCallerStatuses, Campaign, CampaignSettings } from '../../../../../models';
import { Logger } from 'angular2-logger/core';
import { ModalRejectCallerComponent } from '../../modals/caller-reject/caller-reject.modal';

@Component({
  selector   : 'campaign-callers',
  templateUrl: './campaign-callers.component.html'
})
export class CampaignCallersComponent implements OnInit {
  selectedCaller: CampaignCaller;
  callers: CampaignCaller[];
  campaign: Campaign;
  campaignSettings: CampaignSettings;

  currentPage: number  = 1;
  itemsPerPage: number = 10;
  nextExists: boolean  = false;
  totalItems: string;

  currentStatus: string = 'All contacts';
  statuses: Object      = CampaignCallerStatuses;
  toBeApproved: Object  = {
    approve: 'Approve',
    reject : 'Reject'
  };

  sorts: any = {
    name        : {
      label   : 'Name',
      selected: false,
      dir     : 'asc',
      param   : 'caller.user.firstName'
    },
    rating      : {
      label   : 'Rating',
      selected: false,
      dir     : 'asc',
      param   : 'rating.rate'
    },
    totalCalls  : {
      label   : 'Tries',
      selected: false,
      dir     : 'asc',
      param   : 'totalCalls'
    },
    talkingCalls: {
      label   : 'Calls answered',
      selected: false,
      dir     : 'asc',
      param   : 'talkingCalls'
    },
    successCalls: {
      label   : 'Script completed',
      selected: false,
      dir     : 'asc',
      param   : 'successCalls'
    }
  };

  @ViewChild(ModalRejectCallerComponent) rejectCallerModal: ModalRejectCallerComponent;

  constructor(private campaignCallersService: CampaignCallersService,
              private route: ActivatedRoute,
              private toastr: ToastsManager,
              private logger: Logger,
              private campaignService: CampaignService,
              private campaignSettingsService: CampaignSettingsService,
              private translateService: TranslateService) {
  }

  ngOnInit(): void {
    this.campaign         = this.route.snapshot.parent.parent.data['campaign'];
    this.campaignSettings = this.campaignSettingsService.getNewModel({campaignId: +this.campaign.id});
    this.getCampaignSettings(this.campaign.id);

    this.updateMainList();
  }

  getCampaignSettings(campaignId: string): void {
    this.campaignService.getItem(campaignId, {
      include: 'campaignSetting'
    }).toPromise()
      .then((campaign: Campaign) => {
          if (campaign.campaignSetting) {
            this.campaignSettings = campaign.campaignSetting;
          }
        }
      );
  }

  updateMainList(autoSelectCaller: boolean = true): void {
    let params = {
      campaignId: this.campaign.id,
      page      : {number: this.currentPage, size: this.itemsPerPage}
    };
    let sort   = Object.keys(this.sorts)
      .filter(k => this.sorts[k].selected)
      .map(k => this.sorts[k].dir === 'asc' ? this.sorts[k].param : '-' + this.sorts[k].param)
      .join(',');

    if (sort) {
      params['sort'] = sort;
    }

    let subs = this.campaignCallersService.getListPaged(params).subscribe(
      (items: any[]) => {
        this.callers    = items[0];
        this.totalItems = items[1];

        if (autoSelectCaller) {
          this.selectedCaller = this.callers[0];
        }
      },
      err => this.logger.error('Error while fetching filtered callers list', err),
      () => subs.unsubscribe()
    );
  }

  selectCaller(caller: CampaignCaller): void {
    this.selectedCaller = caller;
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
    this.updateMainList();
  }

  statusesKeys(): Array<string> {
    return Object.keys(this.statuses);
  }

  updateCampaignSettings(value: boolean): void {
    this.campaignSettings.closeCampaign = value;

    let subs = this.campaignSettingsService.updateItem(this.campaignSettings).subscribe(
      (item: any) => this.toastr.success(this.translateService.translate('Campaign settings saved')),
      err => err,
      () => subs.unsubscribe()
    );
  }

  callerApproval(status: string, caller: CampaignCaller): void {
    if (status === 'reject') {
      this.rejectCallerModal.action = 'reject';
      this.rejectCallerModal.show();
    } else {
      this.updateCaller(status, caller);
    }
  }

  updateCaller(status: string, caller: CampaignCaller, removalReason: string = null, removalOtherReason: string = null): void {
    caller.status             = status;
    caller.removalReason      = removalReason;
    caller.removalOtherReason = removalOtherReason;

    let translatedStatus = this.translateService.translate((status === 'reject') ? 'removed' : 'approved');

    if (removalReason === 'other' && removalOtherReason === '') {
      this.toastr.info(this.translateService.translate('Other reason cannot be blank'));
    } else {
      let subs = this.campaignCallersService.updateStatus(caller, removalReason, removalOtherReason).subscribe(
        (item: any) => {
          // if caller was rejected, select the first caller in the list (this is done in updateMainList)
          let callerRejected = (this.selectedCaller && item.status === 'rejected_by_campaigner');
          this.updateMainList(callerRejected);
          this.toastr.success(
            this.translateService.translate('The Upcaller was successfully %s', {params: [translatedStatus]})
          );
        },
        err => err,
        () => subs.unsubscribe()
      );
    }
  }
}
