import { Component, OnInit } from '@angular/core';
import { AuthService, CallersService } from '../../../../services';
import { Caller } from '../../../../models';
import * as moment from 'moment-timezone';
import * as Languages from 'language-list';

@Component({
  selector: 'dashboard',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})

export class ProfileComponent implements OnInit {
  public loadingFinished: boolean = false;
  caller: Caller;
  averageRating: number;
  localTime: string;
  languages: any = Languages();
  hasIndustryShowLimit: boolean = true;
  industryShowLimit: number = 10;
  isEditMode: boolean = false;
  newAboutInfo: string;

  get loggedUser(): any {
    return this._authService.currentUserData;
  };

  constructor(
    private _authService: AuthService,
    private _callersService: CallersService) { }

  getCaller(): void {
    let requestParams: any = {
      include: 'picture,address,industries,ratings,user,phone'
    };
    let subs = this._callersService.getItemWithParams(this.loggedUser.caller.id, requestParams).subscribe(
      (item: Caller) => {
        this.caller = item;
        this.localTime = this.getLocalTime();
        this.averageRating = this.caller.getAverageRating();
        this.loadingFinished = true;
      },
      err => err,
      () => subs.unsubscribe()
    );
  }

  getLocalTime(): string {
    let timezone = '';
    if (this.caller) {
      timezone = moment().tz(this.caller.timezone).format('h:mm a');
    }
    return timezone;
  }

  onClickShowMoreOrLessIndustries(): void {
    this.hasIndustryShowLimit = !this.hasIndustryShowLimit;
  }

  saveCallerAboutInfo(newAboutInfo: string): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.newAboutInfo = this.caller.about;
    } else {
      this.caller.about = newAboutInfo;
      this.updateCallerInfo();
    }
  }

  updateCallerInfo(): void {
    let subs = this._callersService.updateItem(this.caller).subscribe(
      (item: Caller) => {
        this.caller = item;
        this.localTime = this.getLocalTime();
        this.averageRating = this.caller.getAverageRating();
      },
      err => err,
      () => subs.unsubscribe()
    );
  }

  ngOnInit(): void {
    this.loadingFinished = true;
    this.getCaller();
  }
}
