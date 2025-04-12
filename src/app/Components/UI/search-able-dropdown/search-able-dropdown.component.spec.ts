import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchAbleDropdownComponent } from './search-able-dropdown.component';

describe('SearchAbleDropdownComponent', () => {
  let component: SearchAbleDropdownComponent;
  let fixture: ComponentFixture<SearchAbleDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchAbleDropdownComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchAbleDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
