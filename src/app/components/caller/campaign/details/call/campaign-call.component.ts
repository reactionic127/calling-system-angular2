import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AuthService, CampaignService, CampaignContactService, TwilioCapabilityTokenService, ContactCallService, CallService,
  QuestionResponseService, CampaignFollowUpResponsesService } from '../../../../../services';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Campaign, TwilioCapabilityToken, CampaignContact, FollowUpResponses, Question, QuestionResponse, CampaignCall, CallStatuses, CampaignSettings } from '../../../../../models';
import 'rxjs/add/operator/switchMap';
import '../../../../../../assets/js/twilio.min.js';
import { Subscription, Observable } from 'rxjs';
import moment = require('moment');
import * as _ from 'lodash';
import {ToastsManager} from "ng2-toastr";

declare let Twilio: any;

@Component({
  selector: 'dashboard',
  templateUrl: './campaign-call.component.html',
  styleUrls: ['./campaign-call.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class CampaignCallComponent implements OnInit {
  public loadingFinished: boolean = false;
  public loggedUser: any = {};
  public selectedId: string;
  public campaign: Campaign;
  public name: string;
  public stars: string[] = ['1', '2', '3', '4', '5'];
  public starsUpToTen: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  public campaignContact: CampaignContact;
  public lastCalls: CampaignCall[];
  twilioCapabilityToken: TwilioCapabilityToken;
  isTwilioInitialized: boolean = false;
  public callState: string = 'initial';
  public callDuration: number = 0;
  public callDurationStr: string = '00:00:00';
  public isCallMuted: boolean = false;
  public component: any = this;
  public followUpResponses: FollowUpResponses;
  public statuses: any = CallStatuses;
  public answeredTabActionState = 'default'; //alternative_phone, maybe_later
  private timerSubscription: Subscription;
  private twilioConn: any = null;
  private contactCall: any = null;
  private campaignSettings: CampaignSettings;
  public alternative_phone_data: any = {};
  public call_back_later_data: any = {};
  public isCallAnswerChoosen: boolean = false;
  public selectedTab: string = 'call_not_answered'; //answered


  // tslint:disable-next-line:member-ordering
  debouncedupdateFollowUpResponses: Function = this.debounce(this.updateFollowUpResponses);
  debouncedUpdateQuestionResponse: Function = this.debounce(this.updateQuestionResponse);
  debouncedupdateCallNote: Function = this.debounce(this.updateCallNote);
  constructor(
    private _authService: AuthService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private _campaignService: CampaignService,
    private _campaignContactService: CampaignContactService,
    private _twilioCapabilityTokenService: TwilioCapabilityTokenService,
    private _contactCallService: ContactCallService,
    private _callService: CallService,
    private _followUpResponsesService: CampaignFollowUpResponsesService,
    private _questionResponseService: QuestionResponseService,
    private _toastr: ToastsManager
  ) { }

  debounce(modelFn: Function): Function {
    return _.debounce((...args) => modelFn.apply(this, args), 3000, { trailing: true });
  }

  backToMyCampaigns(): void {
    this.router.navigate(['/myCampaigns']);
  }

  goToCallingProcess(): void {
    this.router.navigate(['/calling']);
  }

  switchCallState(): void {
    if (this.isTwilioInitialized === true) {
      if (this.callState === 'initial') {
        this.call();
      } else if (this.callState === 'failed' && this.isCallAnswerChoosen) {
        this.nextCall();
      }
    }
  };

  call(): void {
    if (this.campaignContact != null) {
      this.callState = 'calling';
      this.isCallMuted = false;
      this.callDuration = 0;
      this.callDurationStr = '00:00:00';
      let isAvailableParams = {
        id: this.campaignContact.id
      };
      let subs = this._campaignContactService.isAvailable(isAvailableParams).subscribe(
        (item: CampaignContact) => {
          if (item.availableForCall == true) {
            let call_params = {
              contactId: this.campaignContact.id,
              currentUserId: this.loggedUser.id,
              callerId: this.loggedUser.caller.id
            };
            this.twilioConn = Twilio.Device.connect(call_params);
          } else {
            this.nextCall();
          }
        },
        err => err,
        () => subs.unsubscribe()
      );
    }
  };

  sendDigit(digit: string): void {
    if (this.twilioConn != null) {
      this.twilioConn.sendDigits(digit);
    }
  }

  updateCallStatus(status: string): void {

    if (this.contactCall != null) {
      let item:any = {
        call_id: this.contactCall.id,
        status: status
      };
      if(status == 'alternative_phone') {
        if (this.alternative_phone_data.callAtDateModel) {
          if (this.alternative_phone_data.callAtHours) {
            this.alternative_phone_data.callAtDateModel.momentObj.add(this.alternative_phone_data.callAtHours, 'h');
          }
          if (this.alternative_phone_data.callAtMinutes) {
            this.alternative_phone_data.callAtDateModel.momentObj.add(this.alternative_phone_data.callAtMinutes, 'm');
          }
          this.alternative_phone_data.callAt = this.alternative_phone_data.callAtDateModel.momentObj.toDate();
        }
        item.attributes = this.alternative_phone_data;
      } else if (status == 'call_back_later') {
        if(this.call_back_later_data.callAtDateModel) {
          if (this.call_back_later_data.callAtHours) {
            this.call_back_later_data.callAtDateModel.momentObj.add(this.call_back_later_data.callAtHours, 'h');
          }
          if (this.call_back_later_data.callAtMinutes) {
            this.call_back_later_data.callAtDateModel.momentObj.add(this.call_back_later_data.callAtMinutes, 'm');
          }
          this.call_back_later_data.callAt = this.call_back_later_data.callAtDateModel.momentObj.toDate();
        }
        item.attributes = this.call_back_later_data;
      }
      this.scrollToTop();
      let subs = this._callService.updateStatus(item).subscribe(
        (item: any) => {
          this.isCallAnswerChoosen = true;
          if (status === 'busy' || status === 'no_answer' || status === 'technical_issue' || status === 'no_service') {
            this.nextCall();
          }
        },
        err => err,
        () => subs.unsubscribe()
      );
    }

  };

  handleAppointmentDatepickerEvent(event: any): void {
    if (event.type === 'dateChanged') {
      this.followUpResponses.appointment = event.data;
    }
  }

  nextCall(): void {
    this.scrollToTop();
    this.clearQuestionResponses();
    this.clearNotes();
    this.call_back_later_data = {};
    this.alternative_phone_data = {};
    this.isCallAnswerChoosen = false;
    this.followUpResponses = this._followUpResponsesService.getNewModel();
    this.selectedTab = 'call_not_answered';
    Twilio.Device.disconnectAll();
    let twilioTokenParams = {
      'filter[type]': 'call'
    };
    let twilioTokenSub = this._twilioCapabilityTokenService.getItemWithParams(null, twilioTokenParams).subscribe(
      (item: TwilioCapabilityToken) => {
        this.twilioCapabilityToken = item;
        let nextNumberParams = {
          id: this.campaign.id
        };
        let subs = this._campaignContactService.getNextNumber(nextNumberParams).subscribe(
          // tslint:disable-next-line:no-shadowed-variable
          (item: CampaignContact) => {
            this.loadingFinished = true;
            this.campaignContact = item;
            if (item === null) {
              this.backToMyCampaigns();
            } else {
              if (item.calls != null) {
                this.lastCalls = _(item.calls.reverse()).take(10).value();
              }
              this.twilioInit();
              this.callState = 'initial';
              this.answeredTabActionState = 'default';
            }
          },
          err => {
            if (err.errors != null && err.errors[0].detail == 'No contacts available for call') {
              this._toastr.error(err.errors[0].detail);
              this.backToMyCampaigns();
            } else if (err.errors != null){
              this._toastr.error(err.errors[0].detail);
            }
          },
          () => subs.unsubscribe()
        );


      },
      err => err,
      () => {
        twilioTokenSub.unsubscribe();
      }
    );
    this.contactCall = null;
  };

  hangUp(): void {
    this.callDisconnected();
  };

  mute(): void {
    if (this.callState === 'busy') {
      if (this.isCallMuted) {
        this.twilioConn.mute(false);
      } else {
        this.twilioConn.mute(true);
      }
      this.isCallMuted = !this.isCallMuted;
    }
  }

  callConnected(conn: any): void {
    this.callState = 'busy';
    let twilioSid = conn.parameters.CallSid;
    let item = {
      contactId: this.campaignContact.id,
      callerId: this.loggedUser.caller.id,
      twilioSid: twilioSid
    };
    let subs = this._contactCallService.updateItem(item).subscribe(
      // tslint:disable-next-line:no-shadowed-variable
      (item: any) => {
        this.contactCall = item;
      },
      err => err,
      () => subs.unsubscribe()
    );
    let timer = Observable.timer(0, 1000);
    this.timerSubscription = timer.subscribe(t => this.tickerFunc(t));
  };

  callDisconnected(): void {
    // this.callDuration = 0;
    // this.callDurationStr = '00:00:00';
    this.callState = 'failed';
    Twilio.Device.disconnectAll();

    if (typeof this.timerSubscription !== 'undefined') {
      this.timerSubscription.unsubscribe();
    }
  };

  // tslint:disable-next-line:typedef
  tickerFunc(tick) {
    this.callDuration = tick;
    this.callDurationStr = moment.utc(this.callDuration * 1000).format('HH:mm:ss');
    if (this.callDuration > 40) {
      this.selectedTab = 'answered';
    }
  }

  updateFollowUpResponses(): void {
    if ( this.contactCall != null) {
      this.followUpResponses.contactId = +this.campaignContact.id;
      if (this.followUpResponses.appointmentDateModel != null) {
        if (this.followUpResponses.appointmentHour != null) {
          let segments   = this.followUpResponses.appointmentHour.split(':');
          if (segments.length == 2) {
            this.followUpResponses.appointmentDateModel.momentObj.add(segments[0], 'h');
            this.followUpResponses.appointmentDateModel.momentObj.add(segments[1], 'm');
          }
          this.followUpResponses.appointment = this.followUpResponses.appointmentDateModel.momentObj.toDate();
        }
      } else {
        this.followUpResponses.appointment = undefined;
      }

      let subs = this._followUpResponsesService.updateItem(this.followUpResponses).subscribe(
        (item: FollowUpResponses) => {
          this.followUpResponses = item;
        },
        err => err,
        () => subs.unsubscribe()
      );
    }
  }

  updateCallNote(): void {
    if (this.contactCall != null) {
      let item:any = {
        call_id: this.contactCall.id,
        attributes: {
          note: this.contactCall.note
        }
      };

      let subs = this._callService.updateNote(item).subscribe(
        (item: any) => {
        },
        err => err,
        () => subs.unsubscribe()
      );
    }
  }

  assignCallNote(): void {
    if(this.contactCall != null) {
      this.contactCall.note = $('#call_notes').val(); //$event.target.value
    }
  }

  clearQuestionResponses(): void {
    if (this.campaign.questions != null) {
      this.campaign.questions.forEach(
        question => {
          question.formValue = '';
          question.extraInstructions = null;
          if (question.questionFields != null) {
            question.questionFields.forEach(
              questionField => {
                questionField.selected = false;
              }
            );
          }
          question.questionResponses = null;
        }
      );
    }
  }

  clearNotes(): void {
    $('#call_notes').val('');
  }

  updateQuestionResponse(question: Question): void {
    let questionResponse: QuestionResponse = null;
    if (question.questionResponses != null && question.questionResponses.length > 0) {
      questionResponse = question.questionResponses[0];
    } else {
      questionResponse = this._questionResponseService.getNewModel();
      question.questionResponses = new Array<QuestionResponse>();
      question.questionResponses.push(questionResponse);
    }
    if (question.questionFields != null && question.questionFields.length > 0) {
      questionResponse.question_field_ids = new Array<string>();
      question.questionFields.forEach(
        questionField => {
          if (questionField.selected) {
            questionResponse.question_field_ids.push(questionField.id);
          }
        }
      );
    }

    questionResponse.contactId = +this.campaignContact.id;
    questionResponse.questionId = +question.id;
    questionResponse.result = question.formValue;
    questionResponse.comment = question.extraInstructions;

    let subs = this._questionResponseService.updateItem(questionResponse).subscribe(
      (item: QuestionResponse) => {
        questionResponse = item;
        question.questionResponses[0] = item;
      },
      err => err,
      () => subs.unsubscribe()
    );
  }

  scrollToTop(): void {
    $('body,html').animate({ scrollTop: 50 }, 600);
  }

  twilioInit(): void {
    Twilio.Device.setup(this.twilioCapabilityToken.token, { debug: true });
    if (!this.isTwilioInitialized) {
      Twilio.Device.ready((device) => {
        this.isTwilioInitialized = true;
        // console.log('Twilio.Device Ready!');
      });

      Twilio.Device.disconnect((conn) => {
        this.callDisconnected();
      });

      Twilio.Device.connect((conn) => {
        this.callConnected(conn);
      });


      Twilio.Device.error((error) => {
        this.callState = 'failed';
        this.isCallAnswerChoosen = true;

        this._toastr.error(error.message);
      });

      Twilio.Device.offline((conn) => {
        this._toastr.error('The call has dropped.');
        this.callDisconnected();
      });
    }
  }
  ngOnInit(): void {
    this.followUpResponses = this._followUpResponsesService.getNewModel();
    this.loadingFinished = true;
    this._authService.waitForCurrentUserData().then((currentUserData) => {
      this.loggedUser = currentUserData;
      let campaignSub = this.route.params
        .switchMap((params: Params) => {
          this.selectedId = params['id'];
          let campaignParams: any = {
            include: 'company,company.picture,company.industry,questions,questionFields,campaignSetting'// ,questionResponses'//,questions.questionsFields',
          };
          return this._campaignService.getItemWithParams(this.selectedId, campaignParams);
        });
      campaignSub.subscribe(
        (item: Campaign) => {
          this.cd.markForCheck();
          this.campaign = item;
          this.name = this.campaign.name;
          this.campaignSettings = item.campaignSetting;
          this.nextCall();
        },
        err => err
      );
    });
    // tslint:disable-next-line:typedef
    $(document).ready(function () {
      let stickyNavTop = $('.sticky-tobe-md-3').offset().top;

      // tslint:disable-next-line:typedef
      let stickyNav = function () {
        let scrollTop = $(window).scrollTop();

        if (scrollTop > stickyNavTop) {
          $('.sticky-tobe-md-3').addClass('sticky-md-3-right');
        } else {
          $('.sticky-tobe-md-3').removeClass('sticky-md-3-right');
        }
      };
      stickyNav();
      // tslint:disable-next-line:typedef
      $(window).scroll(function () {
        stickyNav();
      });
    });
  }
}
