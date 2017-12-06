import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['../dashboard.component.css'],
})

export class DashboardHomeComponent implements OnInit {
  public loadingFinished: boolean = false;
  public loggedUser: {};

  constructor(private router: Router) { }

  sign(): void {
    this.router.navigate(['/dashboard/dashboardContent']);
  }

  ngOnInit(): void {
    this.loadingFinished = true;
  }
}
