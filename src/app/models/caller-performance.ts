import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';

@JsonApiModelConfig({
    type: 'callerUserPerformances'
})
export class CallerPerformance extends BaseModel {
    @Attribute()
    performanceRatingPercentage: number;

    @Attribute()
    performanceNoOfCalls: number;

    @Attribute()
    performanceGoalReached: number;
}
