import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchableMultiselectDropdownComponent } from './searchable-multiselect-dropdown.component';

describe('SearchableMultiselectDropdownComponent', () => {
  let component: SearchableMultiselectDropdownComponent;
  let fixture: ComponentFixture<SearchableMultiselectDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchableMultiselectDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchableMultiselectDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
