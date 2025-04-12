import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgIconComponentComponent } from './svg-icon-component.component';

describe('SvgIconComponentComponent', () => {
  let component: SvgIconComponentComponent;
  let fixture: ComponentFixture<SvgIconComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SvgIconComponentComponent]
    });
    fixture = TestBed.createComponent(SvgIconComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
