import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveInactiveTabsComponent } from './active-inactive-tabs.component';

describe('ActiveInactiveTabsComponent', () => {
  let component: ActiveInactiveTabsComponent;
  let fixture: ComponentFixture<ActiveInactiveTabsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ActiveInactiveTabsComponent]
    });
    fixture = TestBed.createComponent(ActiveInactiveTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
