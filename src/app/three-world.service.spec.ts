import { TestBed } from '@angular/core/testing';

import { ThreeWorldService } from './three-world.service';

describe('ThreeWorldService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ThreeWorldService = TestBed.get(ThreeWorldService);
    expect(service).toBeTruthy();
  });
});
