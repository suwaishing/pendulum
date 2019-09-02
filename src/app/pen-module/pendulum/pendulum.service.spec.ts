import { TestBed } from '@angular/core/testing';

import { PendulumService } from './pendulum.service';

describe('PendulumService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PendulumService = TestBed.get(PendulumService);
    expect(service).toBeTruthy();
  });
});
