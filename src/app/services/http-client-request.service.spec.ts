import { TestBed } from '@angular/core/testing';

import { HttpClientRequestService } from './http-client-request.service';

describe('HttpClientRequestService', () => {
  let service: HttpClientRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpClientRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
