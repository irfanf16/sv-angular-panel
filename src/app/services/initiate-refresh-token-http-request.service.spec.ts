import { TestBed } from '@angular/core/testing';

import { InitiateRefreshTokenHttpRequestService } from './initiate-refresh-token-http-request.service';

describe('InitiateRefreshTokenHttpRequestService', () => {
  let service: InitiateRefreshTokenHttpRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InitiateRefreshTokenHttpRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
