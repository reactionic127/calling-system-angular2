import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';
import { BelongsTo, HasMany } from 'angular2-jsonapi';
import { Question } from './question';
import { QuestionField } from './question.field';
import { CampaignContact } from './campaign-contact';
@JsonApiModelConfig({
  type: 'questionResponses'
})
export class QuestionResponse extends BaseModel {

  @Attribute()
  questionId: number;

  @Attribute()
  contactId: number;

  @Attribute()
  result: string;

  @Attribute()
  comment: string;

  @Attribute()
  question_field_ids: string[];

  @BelongsTo() question: Question;
  @BelongsTo() contact: CampaignContact;
  @HasMany() questionFields: QuestionField[];

}
