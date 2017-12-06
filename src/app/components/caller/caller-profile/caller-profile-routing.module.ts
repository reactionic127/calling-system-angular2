import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { USER_ROLE } from '../../../models';
import { PermissionGuard } from '../../../services';
import * as Cmp from '../../';

const appRoutes: Routes = [
    {
        path: 'caller',
        component: Cmp.CallerProfileHomeComponent,
        canActivate: [PermissionGuard],
        data: {
            pageName: 'caller-home',
            isAllowedRole: [USER_ROLE.admin, USER_ROLE.caller]
        },
        children: [
            {
                path: 'profile',
                component: Cmp.ProfileComponent,
                data: {
                    pageName: 'caller-profile',
                    isAllowedRole: [USER_ROLE.admin, USER_ROLE.caller]
                }
            },
            {
                path: 'ratings',
                component: Cmp.RatingsComponent,
                data: {
                    pageName: 'caller-ratings',
                    isAllowedRole: [USER_ROLE.admin, USER_ROLE.caller]
                }
            },
            {
                path: 'payments',
                component: Cmp.PaymentsComponent,
                data: {
                    pageName: 'caller-payments',
                    isAllowedRole: [USER_ROLE.admin, USER_ROLE.caller]
                }
            },
            {
                path: 'account',
                component: Cmp.AccountComponent,
                data: {
                    pageName: 'caller-account',
                    isAllowedRole: [USER_ROLE.admin, USER_ROLE.caller]
                }
            }
        ]
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class CallerProfileRoutingModule { }
