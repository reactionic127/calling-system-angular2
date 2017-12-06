import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';

@JsonApiModelConfig({
  type: 'campaignBudgets'
})
export class CampaignBudget extends BaseModel {
  @Attribute() maxExpenseType: Type;

  @Attribute() maxExpense: number;
  
  @Attribute() monthlyContactsVolume: number;

  @Attribute() commission: number;

  @Attribute() campaignId: string;
}

type Type = 'no_limit' | 'max_per_week' | 'max_per_day' | 'max_contacts_per_month';

export const BudgetExpenseType = {
  no_limit    : 'No limit',
  max_per_week: 'Per week',
  max_per_day : 'Per day',
  max_contacts_per_month : 'Per month'
};
