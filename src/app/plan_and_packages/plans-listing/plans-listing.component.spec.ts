import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlansListingComponent } from './plans-listing.component';

describe('PlansListingComponent', () => {
  let component: PlansListingComponent;
  let fixture: ComponentFixture<PlansListingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlansListingComponent]
    });
    fixture = TestBed.createComponent(PlansListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
