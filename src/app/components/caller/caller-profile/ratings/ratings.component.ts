import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService, RatingsService } from '../../../../services';
import { Logger } from 'angular2-logger/core';
import { Rating } from '../../../../models';
import { ModalDirective } from 'ng2-bootstrap';

@Component({
  selector: 'dashboard',
  templateUrl: './ratings.component.html',
  styleUrls: ['./ratings.component.css'],
})

export class RatingsComponent implements OnInit {
  loadingFinished: boolean = false;
  ratings: Rating[];
  ascSortingByDate: boolean = false;
  ascSortingByRating: boolean = false;
  public currentPage: number = 1;
  public itemsPerPage: number = 10;
  public totalItems: number = 0;
  public sortColumn: string;
  public ratingReview: string;
  @ViewChild('reviewModal') public modal: ModalDirective;

  constructor(
    private _authService: AuthService,
    private _ratingsService: RatingsService,
    private logger: Logger
  ) { }

  get loggedUser(): any {
    return this._authService.currentUserData;
  };

  getRatingsByPage(params: any): void {
    let subs = this._ratingsService.getCallerRatings(params).subscribe(
      (items: any[]) => {
        this.ratings = items[0];
        this.totalItems = items[4];
      },
      error => this.logger.error(
        'Error while fetching caller ratings for caller ID: ' + this.loggedUser.caller.id,
        error
      ),
      () => subs.unsubscribe()
    );
  }

  updateMainList(): void {
    let params: any = {
      id: this.loggedUser.caller.id,
      page: { number: this.currentPage, size: this.itemsPerPage },
      sort: this.sortColumn
    };
    this.getRatingsByPage(params);
  }

  changePage(navData: any): void {
    this.currentPage = navData.page;
    this.updateMainList();
  }

  // tslint:disable-next-line:typedef
  onSortRequested($event): void {
    if ($event.sortDir === 'desc') {
      this.sortColumn = '-' + $event.field;
    } else {
      this.sortColumn = $event.field;
    }
    this.updateMainList();
  }

  openReviewModal(review: string): void {
    this.ratingReview = review;
    this.modal.show();
  }

  ngOnInit(): void {
  }
}
