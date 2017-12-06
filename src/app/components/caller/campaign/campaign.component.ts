import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services';

@Component({
  selector: 'dashboard',
  templateUrl: './campaign.component.html',
  styleUrls: ['./campaign.component.css'],
})

export class MyCampaignsHomeComponent implements OnInit {
  public loggedUser: {};

  constructor(private _authService: AuthService) { }

  ngOnInit(): void {
    this._authService.waitForCurrentUserData().then((currentUserData) => {
      this.loggedUser = currentUserData;
    });
  }
}
