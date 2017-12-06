import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CallerProfileRoutingModule } from './caller-profile-routing.module';
import { PaymentsService, CallersService, PayPalAccountService, RatingsService, UpdateUserService } from '../../../services';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        CallerProfileRoutingModule
    ],
    declarations: [
    ],
    providers: [PaymentsService, CallersService, PayPalAccountService, RatingsService, UpdateUserService]
})
export class CallerProfileModule { }
