import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MyCampaignsRoutingModule } from './campaign-routing.module';
import { JoinCampaignService, TwilioCapabilityTokenService } from '../../../services';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MyCampaignsRoutingModule
    ],
    declarations: [],
    providers: [
        JoinCampaignService,
        TwilioCapabilityTokenService
    ]
})
export class MyCampaignsModule { }
