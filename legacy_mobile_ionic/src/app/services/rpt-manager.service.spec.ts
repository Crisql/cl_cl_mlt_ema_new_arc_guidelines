import { TestBed } from "@angular/core/testing";

import { RptManagerService } from "./rpt-manager.service";

describe("RptManagerService", () => {
  let service: RptManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RptManagerService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
