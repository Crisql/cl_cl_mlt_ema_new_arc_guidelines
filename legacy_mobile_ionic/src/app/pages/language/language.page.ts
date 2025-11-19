import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { LocalStorageVariables } from "src/app/common/enum";
import { LocalStorageService } from "src/app/services";

@Component({
  selector: "app-language",
  templateUrl: "./language.page.html",
  styleUrls: ["./language.page.scss"],
})
export class LanguagePage implements OnInit {
  language: string;

  constructor(private translateService: TranslateService,
              private localStorageService: LocalStorageService) {}

  ngOnInit() {
    this.language = this.translateService.currentLang;
  }

  OnLangChange($event: any): void {
    this.localStorageService.set(LocalStorageVariables.Lang, $event.target.value, true);
    this.translateService.use($event.target.value);
  }
}
