import { Injectable } from '@angular/core';

export type InteralStateType = {
  [key: string]: any
};

@Injectable()
export class AppState {
  _state: InteralStateType = {};

  constructor() {

  }

  // already return a clone of the current state
  get state(): InteralStateType {
    return this._state = this._clone(this._state);
  }

  // never allow mutation
  set state(value: InteralStateType) {
    throw new Error('do not mutate the `.state` directly');
  }


  get(prop?: any): any {
    // use our state getter for the clone
    const state = this.state;
    return state.hasOwnProperty(prop) ? state[prop] : state;
  }

  set(prop: string, value: any): any {
    // internally mutate our state
    return this._state[prop] = value;
  }


  private _clone(object: InteralStateType): InteralStateType {
    // simple object clone
    return JSON.parse(JSON.stringify(object));
  }
}
