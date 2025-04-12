import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubModulesRecursiveComponent } from './sub-modules-recursive.component';

describe('SubModulesRecursiveComponent', () => {
  let component: SubModulesRecursiveComponent;
  let fixture: ComponentFixture<SubModulesRecursiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubModulesRecursiveComponent]
    });
    fixture = TestBed.createComponent(SubModulesRecursiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
