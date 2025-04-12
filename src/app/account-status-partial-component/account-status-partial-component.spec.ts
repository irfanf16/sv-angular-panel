import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountStatusPartialComponent } from './account-status-partial-component';

describe('AccountStatusPartialComponentComponent', () => {
  let component: AccountStatusPartialComponent;
  let fixture: ComponentFixture<AccountStatusPartialComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccountStatusPartialComponent]
    });
    fixture = TestBed.createComponent(AccountStatusPartialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
