import { TestBed } from '@angular/core/testing';

import { AppendRolePermissionsService } from './append-role-permissions.service';

describe('AppendRolePermissionsService', () => {
  let service: AppendRolePermissionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppendRolePermissionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
