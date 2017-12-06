import 'rxjs/add/operator/toPromise';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { CampaignService, CampaignSettingsService, FollowUpActionsService, QuestionService, QuestionFieldsService, TranslateService,
UtilsService, CampaignBudgetService } from '../../../../../services';
import { Campaign, CampaignTypes, CampaignSettings, FollowUpActions, Question, ResponseTypeObj, QuestionField, CampaignBudget } from '../../../../../models';
import { Logger } from 'angular2-logger/core';
import { JSONAPIBase } from '../../../../../services/json-api.base';

import * as _ from 'lodash';

@Component({
  selector   : 'campaign-edit',
  templateUrl: './scripts-edit.component.html'
})
export class ScriptsEditComponent implements OnInit {
  campaign: Campaign;
  questions: Question[];
  settings: CampaignSettings;
  followUpActions: FollowUpActions;
  budget: CampaignBudget;
  importLink: string;
  closeLink: string;
  defaultPitch: string;

  componentChanges: boolean = false;

  questionTypes: any = ResponseTypeObj;

  responseTypes: any = [
    {
      type : this.questionTypes.multipleCheckbox,
      label: 'Multi',
      class: 'streamline-icon-check-box-2'
    },
    {
      type : this.questionTypes.multipleRadio,
      label: 'Unique',
      class: 'streamline-icon-unchecked-circle'
    },
    {
      type : this.questionTypes.stars,
      label: 'Rate',
      class: 'streamline-icon-star-full'
    },
    {
      type : this.questionTypes.freeform,
      label: 'Free text',
      class: 'streamline-icon-free-text'
    },
    {
      type : this.questionTypes.nps,
      label: 'NPS',
      class: 'streamline-icon-thumbs-up-1'
    }
  ];

  // used for translation
  instructionLabels: Object = {
    [(CampaignTypes as any).lead_gen]          : 'lead_generation_script',
    [(CampaignTypes as any).inform_product]    : 'increase_prod_awareness_script',
    [(CampaignTypes as any).appt_setting]      : 'appointment_setting_script',
    [(CampaignTypes as any).lead_qual]         : 'inbound_lead_qualification_script',
    [(CampaignTypes as any).confirm_attendance]: 'confirm_attendance_script',
    [(CampaignTypes as any).alert_users]       : 'alert_existing_users_script',
    [(CampaignTypes as any).debt_collection]   : 'debt_collection_script',
    [(CampaignTypes as any).feedback]          : 'collect_client_feedback_script',
    [(CampaignTypes as any).mystery_shopping]  : 'mystery_shopping_script',
    [(CampaignTypes as any).market_research]   : 'market_research_script',
    [(CampaignTypes as any).polls]             : 'polls_script',
    [(CampaignTypes as any).inquire_biz]       : 'collect_business_info_script',
    [(CampaignTypes as any).verify_info]       : 'validate_data_script',
    [(CampaignTypes as any).other]             : 'other_script'
  };

  defaultTitle: string = 'Scripts / Instructions';
  defaultInfo: string  = 'side_help.general-information';
  contextualInfo: string;
  contextualTitle: string;

  constructor(private questionService: QuestionService,
              private campaignService: CampaignService,
              private questionFieldsService: QuestionFieldsService,
              private campaignSettingsService: CampaignSettingsService,
              private followUpActionsService: FollowUpActionsService,
              private utilsService: UtilsService,
              private route: ActivatedRoute,
              private toastr: ToastsManager,
              private router: Router,
              private translateService: TranslateService,
              private logger: Logger,
              private budgetService: CampaignBudgetService) {
  }

  ngOnInit(): void {
    this.campaign = this.route.snapshot.parent.parent.data['campaign'];
    this.initializeEmptyModels();
    this.getCampaignRelations(this.campaign.id);
    this.buildInternalLinks();

    // tslint:disable-next-line:typedef
    $(document).ready(function () {
      let stickyNavTop = $('.create-campaign-layout-sidebar').offset().top;
      let width = $('.create-campaign-layout-sidebar').width();

      // tslint:disable-next-line:typedef
      let stickyNav = function () {
        let scrollTop = $(window).scrollTop();

        if (scrollTop > stickyNavTop) {
          $('.create-campaign-layout-sidebar').addClass('sticky-md-3-right');
          $('.create-campaign-layout-sidebar').width(width);
        } else {
          $('.create-campaign-layout-sidebar').removeClass('sticky-md-3-right');
          $('.create-campaign-layout-sidebar').width('unset');
        }
      };
      stickyNav();
      // tslint:disable-next-line:typedef
      $(window).scroll(function () {
        stickyNav();
      });
    });
  }

  initializeEmptyModels(): void {
    this.settings        = this.campaignSettingsService.getNewModel({campaignId: +this.campaign.id});
    this.followUpActions = this.followUpActionsService.getNewModel({campaignId: +this.campaign.id});
    this.budget          = this.budgetService.getNewModel({campaignId: +this.campaign.id});
  }

  getCampaignRelations(id: string): void {
    let subs = this.campaignService.getItem(id, {
      include: 'questions,followUpAction,campaignSetting,campaignBudget,questionFields'
    }).subscribe(
      campaign => {
        this.questions = campaign.questions || [];

        if (campaign.followUpAction) {
          this.followUpActions = campaign.followUpAction;
        }
        if (campaign.campaignSetting) {
          this.settings = campaign.campaignSetting;
        }
        if (campaign.campaignBudget) {
          this.budget = campaign.campaignBudget;
        }
        this.settings.voicemail = this.settings.voicemail ? 1 : 0;

        this.setDefaultCampaignPitch();

        if (this.questions.length) {
          this.sortQuestions();
        }
      },
      err => this.logger.error('Error fetching campaign ID:' + id + '. ' + err.detail),
      () => subs.unsubscribe()
    );
  }

  sortQuestions(): void {
    this.questions = this.questions.sort((a, b) => a.position - b.position);
  }

  recomputePositions(): void {
    let pos = 1;
    this.sortQuestions();

    for (let q of this.questions) {
      q.position = pos;
      pos++;
    }
  }

  setDefaultCampaignPitch(): void {
    if (!this.campaign.pitch) {
      this.campaign.pitch = this.instructionLabels.hasOwnProperty(this.campaign.kind)
        ? this.translateService.translate(this.instructionLabels[this.campaign.kind]) : '';
    }
  }

  saveAndGoToUrl(url: string): void {
    this.setDefaultCampaignPitch(); // if user deleted campaign pitch, save default one

    // when you save the campaign before question it overwrites this.questions
    this.saveQuestions()
      .then(() => {
        this.campaignService.updateItem(this.campaign).toPromise()
          .then((item: Campaign) => {
            this.campaign = item;

            return Promise.all([
              this.saveSettings(),
              this.saveFollowUpActions(),
              this.saveCampaignBudget()
            ]);
          });
      })
      .then(() => {
        this.toastr.success(this.translateService.translate('Campaign saved!'));
        this.goToUrl(url);
      })
      .catch(errors => this.toastr.error(this.translateService.translate(this.utilsService.getApiErrors(errors))));
  }

  saveCampaignBudget(): Promise<any> {
    return this.budgetService.updateItem(this.budget).toPromise()
      .then((item: CampaignBudget) => this.campaign.campaignBudget = item);
  }

  saveSettings(): Promise<any> {
    return this.campaignSettingsService.updateItem(this.settings).toPromise()
      .then((item: CampaignSettings) => this.campaign.campaignSetting = item);
  }

  saveFollowUpActions(): Promise<any> {
    return this.followUpActionsService.updateItem(this.followUpActions).toPromise()
      .then((item: FollowUpActions) => this.campaign.followUpAction = item);
  }

  saveQuestions(): Promise<any[]> {
    let promises = [];

    for (let q of this.questions) {
      promises.push(this.saveQuestion(q));
    }

    return Promise.all(promises);
  }

  saveQuestion(question: Question): Promise<any> {
    return this.questionService.updateItemAdvanced(question).toPromise()
      .then((item: Question) => {
        question.id = item.id;
        return this.saveQuestionFields(question);
      });
  }

  saveQuestionFields(question: Question): Promise<any[]> {
    question.questionFields = question.questionFields || [];
    let promises            = [];

    question.questionFields.forEach((field: QuestionField) => {
      field.questionId = +question.id; // for newly created fields

      promises.push(
        this.questionFieldsService.updateItemAdvanced(field).toPromise()
          .then((item: QuestionField) => JSONAPIBase.updateStorageWith(field, item))
      );
    });

    return Promise.all(promises);
  }

  addQuestionField(question: Question): void {
    this.changesDetected();

    question.questionFields.push(
      this.questionFieldsService.getNewModel({
        questionId: +question.id,
        field     : ''
      })
    );
  }

  removeQuestionField(option: any, question: any): void {
    this.changesDetected();
    if (option.id) {
      let subs = this.questionFieldsService.deleteItem(option).subscribe(
        () => {
        },
        err => this.logger.error(err.detail),
        () => subs.unsubscribe()
      );
    }

    question.questionFields = question.questionFields.filter(field => !(field === option));

    this.toastr.success(this.translateService.translate('Option removed successfully!'));
  }

  addQuestion(): void {
    this.changesDetected();
    let length = this.questions.length || 0;

    this.questions.push(
      this.questionService.getNewModel({
        question      : '',
        responseType  : 'multiple_checkbox',
        explanations  : '',
        comment       : '',
        campaignId    : +this.campaign.id,
        position      : length + 1,
        questionFields: [],
      })
    );

    // Add one option
    this.addQuestionField(this.questions[this.questions.length - 1]);
  }

  removeQuestion(question: any): void {
    if (question.id) {
      let subs = this.questionService.deleteItem(question).subscribe(
        () => this.campaign.numberOfQuestions--,
        err => this.logger.error(err.detail),
        () => subs.unsubscribe()
      );
    }

    // remove question from questions array and also campaign.questions
    this.questions = this.questions.filter(q => {
      return !(q.position === question.position);
    });

    this.campaign.questions = this.questions;

    // recompute positions
    this.recomputePositions();

    this.toastr.success(this.translateService.translate('Question removed successfully!'));
  }

  // insert the duplicated question immediately after the original one
  duplicateQuestion(question: any): void {
    let duplicate = this.questionService.getNewModel({
      question      : question.question,
      responseType  : question.responseType,
      explanations  : question.explanations,
      comment       : question.comment,
      campaignId    : question.campaignId,
      position      : question.position,
      questionFields: [],
    });

    for (let qf of question.questionFields) {
      duplicate.questionFields.push(
        this.questionFieldsService.getNewModel({
          questionId: question.id,
          field     : qf.field,
          position  : qf.position,
        })
      );
    }

    this.questions = this.questions.map(q => {
      if (q.position > duplicate.position) {
        q.position++;
      }
      return q;
    });
    duplicate.position++;

    this.questions.push(duplicate);
    this.sortQuestions();
  }

  moveUp(question: any): void {
    this.questions = this.questions.map(q => {
      if (q.position === question.position - 1) {
        q.position++;
      }
      return q;
    });
    question.position--;

    this.recomputePositions();
  }

  moveDown(question: any): void {
    this.questions = this.questions.map(q => {
      if (q.position === question.position + 1) {
        q.position--;
      }
      return q;
    });
    question.position++;

    this.recomputePositions();
  }

  changeType(responseType: any, question: any): void {
    question.responseType = responseType;
    this.changesDetected();
  }

  buildInternalLinks(): void {
    let segmentedUrl = this.utilsService.getUrlByFirstSegments(this.router.url, 3);

    this.importLink = `${segmentedUrl}/contacts/import`;
    this.closeLink  = segmentedUrl;
  }

  changesDetected(): void {
    this.componentChanges = true;
  }

  goToUrl(url: string): void {
    this.router.navigateByUrl(url);
  }

  countWords(str: any): number {
    var res = str ? str.split(/\s+/) : 0;
    return res ? res.length : 0;
  }
}
