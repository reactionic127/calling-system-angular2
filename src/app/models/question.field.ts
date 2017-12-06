import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';
import { HasMany } from 'angular2-jsonapi';
import { QuestionResponse } from './question-response';

@JsonApiModelConfig({
  type: 'questionFields'
})
export class QuestionField extends BaseModel {
  @Attribute()
  field: string;

  @Attribute()
  questionId: number;

  @HasMany() questionResponses: QuestionResponse[];

  selected: boolean;
}
