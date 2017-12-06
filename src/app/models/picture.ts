import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';
import { APP_CONFIG } from '../environment';
import { sprintf } from 'sprintf-js';

@JsonApiModelConfig({
  type: 'pictures'
})
export class Picture extends BaseModel {
  @Attribute()
  set imageFileName(set: string) {
    this._imageFileName = set;
    this.url = sprintf(APP_CONFIG.oldApp.pictureUrlFormat, this.id, this.imageFileName);
  }

  get imageFileName(): string {
    return this._imageFileName;
  }

  @Attribute()
  imageContentType: string;

  @Attribute()
  imageFileSize: string;

  @Attribute()
  imageUrlBase: string;

  @Attribute()
  imageUrlMedium: string;

  @Attribute()
  imageUrlThumb: string;

  @Attribute()
  imageUrlThumbnail: string;

  @Attribute()
  updatedAt: string;

  @Attribute()
  createdAt: string;

  url: string;
  companyId?: string;

  private _imageFileName: string;
}
