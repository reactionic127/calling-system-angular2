import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { CallersEarningsService, CallerStatsService, ClientSatisfactionService, CallRatingsService, LeadersService, CommonDashboardService,
CallerPerformanceService, CampaignRevenueStatsService } from '../../../services';
import { ChartModule } from 'angular2-chartjs';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        DashboardRoutingModule,
        ChartModule
    ],
    declarations: [
    ],
    providers: [
        CallerStatsService,
        ClientSatisfactionService,
        CallRatingsService,
        CallersEarningsService,
        LeadersService,
        CommonDashboardService,
        CallerPerformanceService,
        CampaignRevenueStatsService
    ]
})
export class DashboardModule { }
