import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Campaign, CampaignStats, QuestionAnswer, ResponseTypeObj, FollowUpResponses, QuestionAnswerDetails } from '../../../../../models';
import { Logger } from 'angular2-logger/core';
import { CampaignStatsService, QuestionAnswersService, FollowUpResponsesService, QuestionAnswerDetailsService } from '../../../../../services';
import * as moment from 'moment';

@Component({
  selector   : 'campaign-results',
  templateUrl: './campaign-results.component.html'
})
export class CampaignResultsComponent implements OnInit {
  campaign: Campaign;
  answers: QuestionAnswer[];
  campaignStats: CampaignStats;
  leftSideAnswers: QuestionAnswer[]      = [];
  rightSideAnswers: QuestionAnswer[]     = [];
  followUpResponses: any                 = [];
  questionResponseTypes: any             = ResponseTypeObj;
  fakeModel: any;
  datepickerAppointmentDatesClass: any[] = [];
  scrollToElem: any;
  timestamp: any;

  constructor(private questionAnswersService: QuestionAnswersService,
              private questionAnswerDetailsService: QuestionAnswerDetailsService,
              private route: ActivatedRoute,
              private logger: Logger,
              private campaignStatsService: CampaignStatsService,
              private followUpResponsesService: FollowUpResponsesService) {
  }

  ngOnInit(): void {
    this.campaign = this.route.snapshot.parent.data['campaign'];

    this.getQuestionAnswers(+this.campaign.id);
    this.getCampaignStats(+this.campaign.id);
    this.getFollowUpResponses(+this.campaign.id);
  }

  getQuestionAnswers(campaignId: number): void {
    let subs = this.questionAnswersService.getList({
      campaignId: campaignId
    }).subscribe(
      (items: any[]) => {
        items.forEach((item: QuestionAnswer) => {
          if (item.responseType === this.questionResponseTypes.freeform) {
            this.getAnswerDetails(item);
          }
        });
        this.splitAnswers(items);
      },
      err => this.logger.error('There was an error while fetching campaign questions => ', err),
      () => subs.unsubscribe()
    );
  }

  getCampaignStats(campaignId: number): void {
    let subs = this.campaignStatsService.getForCampaign(campaignId).subscribe(
      (item: any) => this.campaignStats = item,
      err => this.logger.error('There was an error while fetching campaign stats => ', err),
      () => subs.unsubscribe()
    );
  }

  getFollowUpResponses(campaignId: number): void {
    let subs = this.followUpResponsesService.getList({
      campaignId: campaignId,
      include   : 'contact'
    }).subscribe(
      (items: any[]) => this.followUpResponses = this.getAppointmentsPreparedForDisplay(items),
      err => this.logger.error('There was an error while fetching campaign follow up responses => ', err),
      () => subs.unsubscribe()
    );
  }

  getAppointmentsPreparedForDisplay(responses: FollowUpResponses[]): any[] {
    let responsesCollector   = [];
    let datesWithAppointment = [];

    responses.forEach((response: FollowUpResponses) => {
      let responseDate = this.getYMDDate(response.appointment);

      if (!responsesCollector[responseDate]) {
        responsesCollector[responseDate] = [];
        datesWithAppointment.push({
          date : moment(response.appointment).startOf('day'),
          mode : 'day',
          clazz: 'appointment'
        });
      }

      responsesCollector[responseDate].push(response);
    });

    this.datepickerAppointmentDatesClass = datesWithAppointment;

    return this.getAsSortedArrayByKeys(responsesCollector);
  }

  getYMDDate(date: any): string {
    return moment(date).format('YYYY-MM-DD');
  }

  splitAnswers(answers: QuestionAnswer[]): void {
    answers.forEach(
      (answer: QuestionAnswer) => {
        if (answer.responseType === this.questionResponseTypes.freeform) {
          this.rightSideAnswers.push(answer);
        } else {
          this.leftSideAnswers.push(answer);
        }
      }
    );
  }

  scrollToAppointment(selectedDate: Date): void {
    const date = this.getYMDDate(selectedDate);

    this.scrollToElem = '#' + date;
    this.timestamp    = Date.now();
  }

  getAsSortedArrayByKeys(responses: any): any[] {
    let result: any[] = [];

    // sort appointments in descending order by date
    Object.keys(responses)
      .sort()
      .reverse()
      .forEach((date) => {
        result.push({[date]: responses[date]});
      });

    return result;
  }

  getAnswerDetails(answer: QuestionAnswer, searchTerm: string = undefined, filterByDate: string = undefined): void {
    let params: any = {
      campaignId: answer.campaignId,
      answerId  : +answer.id
    };

    if (searchTerm) {
      params.q = searchTerm;
    }

    if (filterByDate) {
      params.filter = filterByDate;
    }

    let subs = this.questionAnswerDetailsService.getListPaged(params).subscribe(
      (items: any) => {
        answer.questionAnswerDetails    = items[0];
        answer.totalAnswerDetailsNumber = items[1];
        answer.answerDetailsDatesList   = this.getAnswerDetailsDates(answer.questionAnswerDetails);
      },
      err => this.logger.error('There was an error while fetching answer ID: ' + answer.id, err),
      () => subs.unsubscribe()
    );
  }

  filterAnswerDetailsByDate(answer: QuestionAnswer, date: string): void {
    this.getAnswerDetails(answer, undefined, date);
  }

  private getAnswerDetailsDates(questionAnswerDetails: QuestionAnswerDetails[]): any {
    let dates = {};

    questionAnswerDetails.forEach((item: QuestionAnswerDetails) => {
      let date = this.getYMDDate(item.createdAt);

      if (!dates[date]) {
        dates[date] = item.createdAt;
      }
    });

    return dates;
  }
}
