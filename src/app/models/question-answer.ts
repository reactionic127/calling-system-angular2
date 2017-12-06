import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';
import { ResponseType, ResponseTypeObj } from './question';
import { HasMany } from 'angular2-jsonapi';
import { QuestionAnswerDetails } from './question-answer-details';

const responseTypeObj = ResponseTypeObj;

@JsonApiModelConfig({
  type: 'questionAnswersOverall'
})
export class QuestionAnswer extends BaseModel {
  @Attribute() campaignId: number;

  @Attribute() question: string;

  @Attribute() responseType: ResponseType;

  @Attribute() position: number;

  @Attribute() distribution: any;

  @Attribute() percentDistribution: any;

  @Attribute() average: number;

  questionAnswerDetails?: QuestionAnswerDetails[];
  totalAnswerDetailsNumber?: number;
  answerDetailsDatesList?: any;

  set totalAnswers(set: number) {
    switch (this.responseType) {
      case responseTypeObj.multipleRadio:
        for (let answersNr of this.distribution) {
          this._totalAnswers += answersNr;
        }
        break;

      default:
        this._totalAnswers = 0;
        break;
    }
  }

  get totalAnswers(): number {
    return this._totalAnswers;
  }

  private _totalAnswers: number = 0;
}
