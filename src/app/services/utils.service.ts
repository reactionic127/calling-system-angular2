import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';

@Injectable()
export class UtilsService {
  constructor(private _route: ActivatedRoute,
              private _router: Router) {
  }

  replaceArrayVal(arr: Array<any>, newVal: Array<any>): void {
    arr.splice.apply(arr, [0, arr.length].concat(newVal));
  }

  emptyObject(obj: any): void {
    Object.keys(obj).forEach((key) => delete obj[key]);
  }

  // todo: refactor & move in to magic form validator helper directive
  extractApiErrors(errStore: any): any {
    return (e: any): any => {
      this.emptyObject(errStore);

      if (typeof e === 'string' && e.slice(0, 1) === '4') {
        errStore['general'] = 'Bad request';
      } else if (typeof e === 'object') {
        if ('errors' in e) {
          for (let i in e.errors) {
            if (e.errors.hasOwnProperty(i)) {
              if (typeof e.errors[i] === 'object' && e.errors[i].source) {
                let fieldName       = e.errors[i].source.pointer.split('/').pop();
                errStore[fieldName] = e.errors[i].detail;
              } else {
                errStore[i] = _.has(e.errors[i], 'message') ? e.errors[i].message : e.errors[i];
              }
            }
          }
        } else if ('error' in e) {
          if (typeof e.error === 'string') {
            errStore['general'] = e.error;
          }
        }
      }
    };
  }

  getApiErrors(errors: any): string {
    let result = {};
    this.extractApiErrors(result)(errors);

    return _.values(result).join('<br>');
  }

  getCloserRouteData(dataKey: string): any {
    let dataHierarchy  = [];
    let currentRoute   = this._route.root;
    let hasChildRoutes = false;
    do {
      let childrenRoutes = currentRoute.children;
      hasChildRoutes     = false;
      childrenRoutes.forEach(route => {
        if (route.outlet === 'primary') {
          if (route.snapshot && route.snapshot.data) {
            dataHierarchy.push(route.snapshot.data[dataKey]);
          }
          currentRoute   = route;
          hasChildRoutes = true;
        }
      });
    } while (hasChildRoutes);
    return dataHierarchy.pop();
  }

  getUrlByFirstSegments(url: string, nrSegments: number): string {
    let urlTree         = this._router.parseUrl(url);
    let urlSegmentGroup = (urlTree.root.children as any).primary;
    let segmentedUrl    = '';

    for (let nr = 0; nr < nrSegments; nr++) {
      segmentedUrl += `/${urlSegmentGroup.segments[nr]}`;
    }

    return segmentedUrl;
  }

  getStateCodeFromISO_3166_2Code(iso_3166_2_code: string): string {
    return (iso_3166_2_code || '').split('-')[1];
  }
}
