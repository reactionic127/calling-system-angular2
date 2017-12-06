import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';

@JsonApiModelConfig({
  type: 'faqs'
})
export class Faq extends BaseModel {
  @Attribute() title: string;
  @Attribute() content: string;
  @Attribute() createdAt: string;
  @Attribute() updatedAt: string;

  companyId?: string;
}
