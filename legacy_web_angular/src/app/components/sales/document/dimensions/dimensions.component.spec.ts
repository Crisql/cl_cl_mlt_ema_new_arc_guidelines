import { ComponentFixture, TestBed } from '@angular/core/testing';
import {OverlayModule} from "@clavisco/overlay";
import {AlertsModule, ModalModule} from "@clavisco/alerts";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {LinkerService} from "@clavisco/linker";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";
import {DimensionsComponent} from "@Component/sales/document/dimensions/dimensions.component";

describe('DimensionsComponent', () => {
    let component: DimensionsComponent;
    let fixture: ComponentFixture<DimensionsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ DimensionsComponent ],
            imports: [OverlayModule, AlertsModule, ModalModule, HttpClientTestingModule, RouterTestingModule],
            providers: [
                {
                    provide: 'LinkerService',
                    useExisting: LinkerService
                },
                { provide: MAT_DIALOG_DATA, useValue: {}},
                { provide: MatDialogRef, useValue: {} }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DimensionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
