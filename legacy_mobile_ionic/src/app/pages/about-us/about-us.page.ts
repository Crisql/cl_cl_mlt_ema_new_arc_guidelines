import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-about-us",
  templateUrl: "./about-us.page.html",
  styleUrls: ["./about-us.page.scss"],
})
export class AboutUsPage implements OnInit {
  parag1: string;
  parag2: string;
  description: string;

  constructor(private translateService: TranslateService) {}

  ngOnInit() {
    if (this.translateService.currentLang == "es") {
      this.parag1 =
        "Somos asesores de tecnología, contamos con personal capacitado en la implementación y desarrollo de una amplia gama de soluciones integrales, enfocados en el crecimiento de las compañías que deseen innovar, mejorar y optimizar sus procesos por medio de SAP Business One.";
      this.parag2 =
        "Nos mantenemos direccionados hacia la satisfacción de nuestros clientes, por lo que nuestro enfoque está en los mejores resultados para su compañía.";
    } else {
      this.parag1 =
        "We are technology consultants, we have personnel trained in the implementation and development of a wide range of comprehensive solutions, focused on the growth of companies that wish to innovate, improve and optimize their processes through SAP Business One.";
      this.parag2 =
        "We stay focused on the satisfaction of our customers, so our focus is on the best results for your company";
    }
  }
}
