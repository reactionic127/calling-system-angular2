import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService, CampaignService, CampaignCallersService, TranslateService } from '../../../../services';
import { Router } from '@angular/router';
import { Campaign } from '../../../../models';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { ModalDirective } from 'ng2-bootstrap';

@Component({
  selector: 'dashboard',
  templateUrl: './campaign-main.component.html',
  styleUrls: ['./campaign-main.component.css'],
})

export class MyCampaignsMainComponent implements OnInit {
  public loadingFinished: boolean = false;
  public loggedUser: any = {};
  public items: Campaign[];
  public sortList: any = [
    { id: 'name', name: 'Name' },
    { id: 'status', name: 'Status' },
    { id: 'kind', name: 'Kind' },
    { id: 'startDate', name: 'Start Date' }
  ];
  public removalReason: string;
  public removalOtherReason: string;
  public otherLeaveReason: string;
  public selectedSort: any = this.sortList[0];
  public selectedCampaign: any;
  public leaveReasonList: any[] = [{ id: 'not_interesting', name: 'Not an interesting campaign' }, { id: 'no_time', name: 'No more time to work on it' }, { id: 'other', name: 'Other' }];
  public selectedLeaveReason: any = this.leaveReasonList[0];
  @ViewChild('leaveCampaignModal') public modal: ModalDirective;


  constructor(
    private _authService: AuthService,
    private router: Router,
    private _campaignService: CampaignService,
    private _campaignCallersService: CampaignCallersService,
    private toastr: ToastsManager,
    private translateService: TranslateService,
  ) { }

  joinCampaign(): void {
    this.router.navigate(['/myCampaigns/join']);
  }

  goToCampaignDetails(campaign: Campaign): void {
    this.router.navigate(['/myCampaigns/', campaign.id, 'information']);
  }

  leaveCampaign(): void {
    if (this.selectedLeaveReason.id !== 'other') {
      this.removalReason = this.selectedLeaveReason.name;
    } else {
      this.removalReason = this.otherLeaveReason;
    }
    this.selectedCampaign.status = 'reject';
    let subs = this._campaignCallersService.leaveCampaign(this.selectedCampaign, this.removalReason).subscribe(
      (items: any) => {
        this.toastr.success(this.translateService.translate('Successfully left the campaign'));
        this.getList();
      },
      err =>
        this.toastr.error(this.translateService.translate('Error during leaving a campaign' + err.detail)),
      () => subs.unsubscribe(),
    );
    this.modal.hide();
  }

  getList(): void {
    let requestParams = {
      id: this.loggedUser.caller.id,
      include: 'company,company.picture,company.industry',
      sort: this.selectedSort.id
    };
    let subs = this._campaignService.getApprovedCampaigns(requestParams).subscribe(
      (items: Campaign[]) => {
        this.items = items;
        this.loadingFinished = true;
      },
      err => err,
      () => subs.unsubscribe()
    );
  }

  ngOnInit(): void {
    this._authService.waitForCurrentUserData().then((currentUserData) => {
      this.loggedUser = currentUserData;

      this.getList();
    });
  }
}
