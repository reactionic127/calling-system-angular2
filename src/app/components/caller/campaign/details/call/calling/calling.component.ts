import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../../../services';

@Component({
  selector: 'dashboard',
  templateUrl: './calling.component.html',
  styleUrls: ['./calling.component.css'],
})

export class CallingComponent implements OnInit {
  public loadingFinished: boolean = false;
  public loggedUser: {};

  constructor(private _authService: AuthService) { }

  ngOnInit(): void {
    this.loadingFinished = true;

    this._authService.waitForCurrentUserData().then((currentUserData) => {
      this.loggedUser = currentUserData;
    });
  }
}
