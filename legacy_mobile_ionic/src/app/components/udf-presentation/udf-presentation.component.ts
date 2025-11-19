import {Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {IUdf, IUdfContext} from '../../interfaces/i-udfs';
import {TranslateService} from '@ngx-translate/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MappingUdfs} from "../../common/function";

@Component({
    selector: 'app-udf-presentation',
    templateUrl: './udf-presentation.component.html',
    styleUrls: ['./udf-presentation.component.scss'],
})
export class UdfPresentationComponent {

    @Input() udfs: IUdfContext[] = [];
    @Input() udfsValues: IUdf[] = [];
    isUdfFormToggled: boolean;
    UDFsForm: FormGroup;

    constructor(
        public translateService: TranslateService,
    ) {
    }

    ngOnChanges(changes: SimpleChanges) {
        this.initUDFForm();
        this.SetValuesUDFs();
    }

    ionViewWillEnter() {
        this.initUDFForm();
    }

    resetUDFs(): void {
        if (this.UDFsForm) {
            this.UDFsForm.reset();
        }
    }

    GetValuesUDFs(): any[] {
        if (!this.UDFsForm || !this.UDFsForm.value) {
            return [];
        }
        return Object.entries(this.UDFsForm.value);
    }


    SetValuesUDFs(): void {
        let udfsConfigured = Object.keys(this.UDFsForm.value);
        let data = this.udfsValues.filter(element => element.Value && udfsConfigured.includes(element.Name));
        if (data && data.length > 0) {
            data.forEach(element => {
                this.UDFsForm.controls[element.Name].setValue(element.Value);
            });
        }
    }

    initUDFForm() {
        const formGroupObj = {};
        if (this.udfs && this.udfs.length > 0) {
            this.udfs.forEach(udf => {
                formGroupObj[udf.Name] = new FormControl('');
            });
        }
        this.UDFsForm = new FormGroup(formGroupObj);
    }

    ToggleUdfForm(): void {
        this.isUdfFormToggled = !this.isUdfFormToggled;
    }
}
