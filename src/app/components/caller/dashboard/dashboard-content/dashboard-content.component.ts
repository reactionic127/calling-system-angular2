import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CallerStatsService, AuthService, ClientSatisfactionService, CallRatingsService, LeadersService, CommonDashboardService,
CallerPerformanceService, CallersService, CampaignService, CampaignRevenueStatsService } from '../../../../services';
import { Router } from '@angular/router';
import moment = require('moment');
import { Campaign, CampaignRevenueStats } from '../../../../models';


@Component({
  selector: 'dashboard-content',
  templateUrl: './dashboard-content.component.html',
  styleUrls: ['./dashboard-content.component.css'],
})

export class DashboardContentComponent implements OnInit, AfterViewInit {
  @ViewChild('myChart')
  myChart: ElementRef;
  myChartInstance: any;

  loadingFinished: boolean = false;
  callerStats: any;
  clientSatisfaction: any;
  callRatings: any;
  leaders: any;
  currentTip: string;
  tips: any[];
  currentDate: Date;
  callerId: string;
  callerPerformance: any;
  chartType: string = 'line';
  chartData: any = {
    labels: [],
    datasets: [
      {
        data: [],
        fill: false,
        borderColor: 'rgb(255,123,8)',
        borderWidth: 2
      }
    ]
  };
  options: any = {
    scaleShowVerticalLines: false,
    legend: {
      display: false
    },
    tooltips: {
      backgroundColor: 'rgba(193,13,235, 1)',
      cornerRadius: 10,
      displayColors: false,
      callbacks: {
        // tslint:disable-next-line:typedef
        title: function () {
          return '';
        },
        // tslint:disable-next-line:typedef
        label: function (tooltipItem, chartInstance) {
          if (tooltipItem.yLabel === '') {
            return '0';
          }
          return Math.round(tooltipItem.yLabel).toString();
        },
        // tslint:disable-next-line:typedef
        beforeLabel: function (tooltipItem, chartInstance) {
          return '';
        },
        // tslint:disable-next-line:typedef
        labelColor: function (tooltipItem, chartInstance) {
          return {
            borderColor: 'rgba(255,123,8, 1)', backgroundColor: 'rgba(255,123,8, 1)', fontColor: 'red'
          };
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        gridLines: {
          display: false
        },
        type: 'time',
        time: {
          displayFormats: {
            'millisecond': 'MMM DD',
            'second': 'MMM DD',
            'minute': 'MMM DD',
            'hour': 'ddd DD',
            'day': 'ddd DD',
            'week': 'DD MMM',
            'month': 'MMM YY',
            'quarter': 'MMM DD',
            'year': 'MMM YYYY',
          }
        }
      }],
    }
  };

  selectedCalendarType: string = 'day';
  approvedCampaigns: Campaign[] = [];
  selectedCampaign: Campaign;
  selectedCampaignDate: any = moment();

  callRatingsFilterType: string = 'best';

  campaignRevenueStats: CampaignRevenueStats;

  constructor(
    private router: Router,
    private callerStatsService: CallerStatsService,
    private authService: AuthService,
    private clientSatisfactionService: ClientSatisfactionService,
    private callRatingsService: CallRatingsService,
    private leadersService: LeadersService,
    private commonDashboardService: CommonDashboardService,
    private callerPerformanceService: CallerPerformanceService,
    private callersService: CallersService,
    private campaignService: CampaignService,
    private campaignRevenueStatsService: CampaignRevenueStatsService) { }

  get loggedUser(): any {
    return this.authService.currentUserData;
  };

  getCallerStats(id: string): void {
    let subs = this.callerStatsService.getCallerStats(id).subscribe(
      (data: any) => {
        this.callerStats = data;
        this.callerStats.nextPayment = Math.abs(this.callerStats.nextPayment);
      },
      err => err,
      () => subs.unsubscribe()
    );
  }

  getClientSatisfaction(id: string): void {
    let subs = this.clientSatisfactionService.getClientSatisfaction(id).subscribe(
      (data: any) => {
        this.clientSatisfaction = data;
      },
      err => err,
      () => subs.unsubscribe()
    );
  }

  getNextClientSatisfaction(ratingId: string): void {
    if (ratingId != null) {
      let subs = this.clientSatisfactionService.getNextClientSatisfaction(this.callerId, ratingId).subscribe(
        (data: any) => {
          this.clientSatisfaction = data;
        },
        err => err,
        () => subs.unsubscribe()
      );
    }
  }

  getCallRatings(ratingId: string): void {
    let subs = this.callRatingsService.getCallRatings(this.callerId, ratingId).subscribe(
      (data: any) => {
        this.callRatings = data;
      },
      err => err,
      () => subs.unsubscribe()
    );
  }

  seeAllRatings(): void {
    this.router.navigate(['/caller/ratings']);
  }

  callContacts(): void {
    this.router.navigate(['/myCampaigns']);
  }

  goToCallerProfilePage(): void {
    this.router.navigate(['/caller/profile']);
  }
  joinCampaign(): void {
    this.router.navigate(['/myCampaigns/join']);
  }

  goOnPaymentsScreen(): void {
    this.router.navigate(['/caller/payments']);
  }

  changeTipOfTheDay(tipId: number): void {
    for (let i = 0; i < this.tips.length; i++) {
      if (tipId === this.tips.length) {
        this.currentTip = this.tips[0];
      } else {
        this.currentTip = this.tips[tipId];
      }
    }
  }

  getLeaders(): void {
    let subs = this.leadersService.getList().subscribe(
      (data: any) => {
        this.leaders = data;
      },
      err => err,
      () => subs.unsubscribe()
    );
  }

  // tslint:disable-next-line:typedef
  setSelectedFilterForRevenuesChart(type: string) {
    this.selectedCalendarType = type;
    this.getCallerCampaignRevenuesForChart();
  }

  // tslint:disable-next-line:typedef
  setSelectedCampaign(campaign: Campaign) {
    this.selectedCampaign = campaign;
    this.getCallerCampaignRevenuesForChart();
  }

  // tslint:disable-next-line:typedef
  setNextCampaignDate(direction: string) {
    let increaseValue: number = 1;
    if (direction === 'previous') {
      increaseValue = -1;
    }
    if (this.selectedCalendarType === 'day') {
      this.selectedCampaignDate = this.selectedCampaignDate.add(increaseValue, 'd');
    }
    // tslint:disable-next-line:one-line
    else if (this.selectedCalendarType === 'week') {
      this.selectedCampaignDate = this.selectedCampaignDate.add(increaseValue, 'w');
    }
    // tslint:disable-next-line:one-line
    else if (this.selectedCalendarType === 'month') {
      this.selectedCampaignDate = this.selectedCampaignDate.add(increaseValue, 'M');
    }
    this.getCallerCampaignRevenuesForChart();
  }

  getCallerCampaignRevenuesForChart(): void {
    let id = this.loggedUser.caller.id;

    let params: any = {
      callerId: id,
      calendarType: this.selectedCalendarType,
      date: moment(this.selectedCampaignDate).format('YYYY-MM-DD')
    };

    if (this.selectedCampaign != null) {
      params.campaignId = this.selectedCampaign.id;
    } else {
      params.campaignId = null;
    }

    let subs = this.callersService.getCampaignRevenues(params).subscribe(
      (data: any) => {
        let labels = [];
        let chartData = [];
        // tslint:disable-next-line:forin
        for (let name in data.revenues) {
          labels.push(moment(name, 'YYYYMMDD'));
          chartData.push(data.revenues[name]);
        }
        this.chartData.labels = labels;
        this.chartData.datasets[0].data = chartData;
        this.myChartInstance.destroy();
        this.myChartInstance = new Chart(this.myChart.nativeElement, {
          data: this.chartData,
          type: this.chartType,
          options: this.options
        });
      },
      err => err,
      () => subs.unsubscribe()
    );

    this.getCampaignRevenueStatsData();
  };

  getCampaignRevenueStatsData(): void {
    let campaignId = null;
    if (this.selectedCampaign != null) {
      campaignId = this.selectedCampaign.id;
    }
    let params = {
      id: this.loggedUser.caller.id,
      campaignId: campaignId
    };

    let subs = this.campaignRevenueStatsService.getCampaignRevenuesStats(params).subscribe(
      (data: any) => {
        this.campaignRevenueStats = data;
      },
      err => err,
      () => subs.unsubscribe()
    );
  }


  getApprovedCampaigns(): void {
    let params = {
      id: this.loggedUser.caller.id,
      include: 'company'
    };
    let subs = this.campaignService.getApprovedCampaigns(params).subscribe(
      (data: any) => {
        this.approvedCampaigns = data;
      },
      err => err,
      () => subs.unsubscribe()
    );
  }

  getCallerPeformances(id: string): void {
    let subs = this.callerPerformanceService.getCallerPerformances(id).subscribe(
      (data: any) => {
        this.callerPerformance = data;
      },
      err => err,
      () => subs.unsubscribe()
    );
  }


  ngOnInit(): void {
    this.loadingFinished = true;
    this.tips = this.commonDashboardService.getTipsOfTheDay();
    this.currentTip = this.tips[0];
    this.currentDate = this.commonDashboardService.getCurrentDateTime();
    this.callerId = this.loggedUser.caller.id;
    this.getCallerStats(this.callerId);
    this.getClientSatisfaction(this.callerId);
    this.getCallRatings(null);
    this.getCallerPeformances(this.callerId);
    this.getLeaders();
    this.getApprovedCampaigns();
    this.getCallerCampaignRevenuesForChart();
    this.getCampaignRevenueStatsData();
  }

  ngAfterViewInit(): void {
    this.myChartInstance = new Chart(this.myChart.nativeElement, { data: this.chartData, type: this.chartType, options: this.options });
  }
}
