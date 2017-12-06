import { BelongsTo } from 'angular2-jsonapi';
import { BaseModel, Attribute, JsonApiModelConfig, HasMany } from '../base.model';
import { Rating } from './rating';
import { Picture } from './picture';
import { Address } from './address';
import { Industry } from './industry';
import { Earning } from './earning';
import { CallerPayMethod } from './caller-pay-method';
import { User } from './user';
import { Phone } from './phone';

@JsonApiModelConfig({
  type: 'callers'
})
export class Caller extends BaseModel {
  @Attribute() about: string;

  @Attribute() level: string;

  @Attribute() language: Array<string>;

  @Attribute() status: string;

  @Attribute() userId: number;

  @Attribute() kind: Array<string>;

  @Attribute() yearsExpertise: string;

  @Attribute() recordingUrl: string;

  @Attribute() weeklyHoursAvailable: number;

  @Attribute() minutesCalled: number;

  @Attribute() campaignsWorkedOn: number;

  @Attribute() timezone: string;

  @Attribute() ratingCache: number;

  @BelongsTo() picture: Picture;

  @HasMany() ratings: Rating[];

  @BelongsTo() address: Address;

  @HasMany() industries: Industry[];

  @HasMany() earnings: Earning[];

  @BelongsTo() callerPayMethod: CallerPayMethod;

  @BelongsTo() user: User;

  @BelongsTo() phone: Phone;

  getAverageRating(): number {
    let ratings: number = 0;
    let result: number = undefined;

    if (this.ratings) {
      this.ratings.map(item => ratings += item.rate);

      result = +((ratings / this.ratings.length).toFixed(2));
    }
    return result;
  }
}
