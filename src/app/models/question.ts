import { HasMany } from 'angular2-jsonapi';
import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';
import { QuestionField } from './question.field';
import { QuestionResponse } from './question-response';

export type ResponseType = 'multiple_checkbox'
  | 'free_text'
  | 'multiple_radio'
  | 'nps'
  | 'freeform'
  | 'calendar'
  | 'stars';

export const ResponseTypeObj = {
  multipleCheckbox: 'multiple_checkbox',
  freeText        : 'free_text',
  multipleRadio   : 'multiple_radio',
  nps             : 'nps',
  freeform        : 'freeform',
  calendar        : 'calendar',
  stars           : 'stars'
};

@JsonApiModelConfig({
  type: 'questions'
})
export class Question extends BaseModel {
  @Attribute()
  question: string;

  @Attribute()
  responseType: ResponseType;

  @Attribute()
  explanations: string;

  @Attribute()
  comment: boolean;

  @Attribute()
  campaignId: number;

  @Attribute()
  position: number;

  formValue: string = '';
  extraInstructions: string = null;

  @HasMany() questionFields: QuestionField[];
  @HasMany() questionResponses: QuestionResponse[];
}
