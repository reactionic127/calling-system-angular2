import { Component, OnInit, Input } from '@angular/core';
import { Campaign } from 'app/models/campaign';
import { CampaignStatusService, CampaignService } from '../../../../../services';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Router } from '@angular/router';
import { Logger } from 'angular2-logger/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import 'rxjs/add/operator/distinctUntilChanged';

@Component({
  selector   : 'campaign-not-pending-header',
  templateUrl: './campaign-not-pending-header.component.html'
})
export class CampaignNotPendingHeaderComponent implements OnInit {
  @Input() campaign: Campaign;

  selectedCampaign: Campaign;
  categoryTypes: any;
  nameControl: FormControl = new FormControl();
  nameSubscription: Subscription;

  constructor(private router: Router,
              private toastr: ToastsManager,
              private logger: Logger,
              private campaignStatusService: CampaignStatusService,
              private campaignService: CampaignService) {
  }

  ngOnInit(): void {
    this.categoryTypes = this.campaign.getSameCategoryTypes();

    this.nameChangesSubscription();
  }

  nameChangesSubscription(): void {
    if (!this.nameSubscription) {
      this.nameSubscription = this.nameControl.valueChanges
        .debounceTime(1000)
        .distinctUntilChanged()
        .subscribe(() => {
          if (this.nameControl.dirty) {
            this.saveCampaign();
          }
        });
    }
  }

  onExportChange(exportValue: string): void {
    if (exportValue === 'CSV') {
      window.open(`https://www.upcall.com/en/campaigns/${this.campaign.id}/calls.csv`);
    } else if (exportValue === 'Zapier') {
      this.router.navigateByUrl(`/campaigns/${this.campaign.id}/settings/contacts/from-crm`);
    }
  }

  onStatusChange(selectedStatus: any): void {
    this.selectedCampaign        = this.campaign;
    this.selectedCampaign.status = selectedStatus;

    this.campaignStatusService.updateStatus(this.selectedCampaign)
      .then((result) => {
        this.toastr.success('The status of Campaign was updated successfully.');
        this.campaign.status = result.status;
      })
      .catch((error) => {
        this.toastr.info('The status of Campaign was not updated unfortunately.');
        this.logger.error(error);
      });
  }

  saveCampaign(): void {
    let subs = this.campaignService.updateItem(this.campaign).subscribe(
      (item: Campaign) => {
        this.campaign = item;
        this.toastr.success('Campaign saved');
      },
      err => {
        this.toastr.error('Campaign not saved');
        this.logger.error(err);
      },
      () => subs.unsubscribe()
    );
  }

  ngOnDestroy(): void {
    if (this.nameSubscription) {
      this.nameSubscription.unsubscribe();
    }
  }
}
