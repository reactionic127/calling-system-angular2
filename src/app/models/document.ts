import { BaseModel, Attribute, JsonApiModelConfig, BelongsTo } from '../base.model';
import { Company } from './company';

@JsonApiModelConfig({
    type: 'documents'
})
export class Document extends BaseModel {
    @Attribute() documentUrl: string;

    @Attribute() updatedAt: Date;

    @Attribute() createdAt: Date;

    @BelongsTo() company: Company;

    companyId?: string;
}
