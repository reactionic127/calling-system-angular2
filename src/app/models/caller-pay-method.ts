import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';

@JsonApiModelConfig({
    type: 'callerPayMethods'
})
export class CallerPayMethod extends BaseModel {
    @Attribute() paypalEmail: string;

    @Attribute() updatedAt: Date;

    @Attribute() createdAt: Date;

}
