import { Component, OnInit, ViewChild } from '@angular/core';
import { CompanyService, UserService, AuthService, AuthTokenService, CallerIdService } from '../../../services';
import { User, Company, CallerId } from '../../../models';

@Component({
    selector: 'integration-detail',
    templateUrl: './integration-details.component.html'
})
export class IntegrationDetailComponent implements OnInit {

    public user: User;
    public company: Company;
    public existingCompanyCallerIds: Array<CallerId>;

    @ViewChild('apiKey') apiKeyInput: any;

    constructor(private _authService: AuthService,
                private _userService: UserService,
                private _authTokenService: AuthTokenService,
                private _companyService: CompanyService,
                private _callerIdService: CallerIdService) {

    }
    ngOnInit(): void {
        this.user = this._userService.getNewModel();
        this._authService.waitForCurrentUserData().then(user => {
            this.user = user;
            let subs = this._companyService.getItem(user.company.id, {
              include: 'authToken'
            }).subscribe(
                (item: any) => {
                    this.company = item;
                },
                () => subs.unsubscribe()
            );
            let csubs = this._callerIdService.getCallerIdsByCompany(user.company.id).subscribe(
                (callerIds: any) => {
                    this.existingCompanyCallerIds = callerIds;
                },
                () => csubs.unsubscribe()
            );
        });
    }

    selectApiKey(): void {
        this.apiKeyInput.nativeElement.setSelectionRange(0, this.apiKeyInput.nativeElement.value.length);
    }

    refreshToken(): void {
        this._authTokenService.refreshToken({id: this.company.authToken.id}).subscribe(
            (item: any) => {
                this.company.authToken = item;
            }
        );
    }

}
