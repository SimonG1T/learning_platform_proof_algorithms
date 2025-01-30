import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatexViewerComponent } from './latex-viewer.component';

describe('LatexViewerComponent', () => {
    let component: LatexViewerComponent;
    let fixture: ComponentFixture<LatexViewerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LatexViewerComponent]
        })
        .compileComponents();
        
        fixture = TestBed.createComponent(LatexViewerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
