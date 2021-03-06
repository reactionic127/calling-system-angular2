import {
  inject,
  TestBed
} from '@angular/core/testing';

// Load the implementations that should be tested
import { App } from './app.component';
import { AppState } from '../app.service';

describe('App', () => {
  // provide our implementations or mocks to the dependency injector
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      AppState,
      App
    ]
  }));

  it('should have a name', inject([App], (app: App) => {
    expect(app.name).toContain('Angular 2 Upcall App');
  }));

});
