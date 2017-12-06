import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { USER_ROLE } from '../../../models';
import { PermissionGuard } from '../../../services';
import * as Cmp from '../../';

const appRoutes: Routes = [
    {
        path: 'dashboard',
        component: Cmp.DashboardComponent,
        canActivate: [PermissionGuard],
        data: {
            pageName: 'dashboard',
            isAllowedRole: [USER_ROLE.admin, USER_ROLE.caller]
        },
        children: [
            {
                path: 'dashboardContent',
                component: Cmp.DashboardContentComponent,
                data: {
                    pageName: 'dashboard-dashboardContent',
                    isAllowedRole: [USER_ROLE.admin, USER_ROLE.caller]

                }
            },
            {
                path: 'earnings',
                component: Cmp.DashboardEarningsComponent,
                data: {
                    pageName: 'dashboard-earnings',
                    isAllowedRole: [USER_ROLE.admin, USER_ROLE.caller]

                }
            },
            {
                path: 'guidelines',
                component: Cmp.DashboardHomeComponent,
                data: {
                    pageName: 'dashboard-guidelines',
                    isAllowedRole: [USER_ROLE.admin, USER_ROLE.caller]
                }
            },
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
export class DashboardRoutingModule { }
