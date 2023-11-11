import { expect, test } from "@playwright/test";
import { XrmMockGenerator } from "xrm-mock";

import { XrmEx } from "../testBuild/src/XrmEx";

var formContext: Xrm.FormContext;
var fields: Fields;
var tabs: Tabs;
var grids: Grids;
class Fields {
  Firstname = new XrmEx.Class.TextField("firstname");
  Customer = new XrmEx.Class.LookupField("parentcustomerid");
  DoNotEmail = new XrmEx.Class.BooleanField("donotemail");
  Birthday = new XrmEx.Class.DateField("birthdate");
  Weight = new XrmEx.Class.NumberField("weight");
  PreferredContactMethod = new XrmEx.Class.OptionsetField(
    "preferredcontactmethodcode",
    {
      Any: 1,
      Email: 2,
      Phone: 3,
      Fax: 4,
      Mail: 5,
    }
  );
}
class Tabs {
  General = new XrmEx.Class.Tab("tab1", {
    Section1: new XrmEx.Class.Section("section1")
  });
}
class Grids {
  ContactSubgrid = new XrmEx.Class.GridControl("Test");
}

test.describe("Test XrmEx", () => {
  test.beforeEach(() => {
    XrmMockGenerator.initialise();
    XrmMockGenerator.Attribute.createString("firstname", "Joe");
    XrmMockGenerator.Attribute.createDate("birthdate", new Date("2000-01-01"));
    XrmMockGenerator.Attribute.createLookup("parentcustomerid", { entityType: "account", id: "726a2976-5195-4fec-9bb4-523d3fa1a7c7", name: "Company" });
    XrmMockGenerator.Attribute.createNumber("weight", 70);
    XrmMockGenerator.Attribute.createOptionSet("preferredcontactmethodcode", 1, [
      { text: "Any", value: 1 },
      { text: "Email", value: 2 },
      { text: "Phone", value: 3 },
      { text: "Fax", value: 4 },
      { text: "Mail", value: 5 },
    ]);
    XrmMockGenerator.Attribute.createBoolean("donotemail", false);
    let tab1 = XrmMockGenerator.Tab.createTab("tab1", "General");
    XrmMockGenerator.Section.createSection("section1", "Section1", true, tab1);
    XrmMockGenerator.Control.createGrid("Test");
    XrmEx.Form.executionContext = XrmMockGenerator.getEventContext();
    formContext = XrmEx.Form.formContext;
    fields = new Fields();
    tabs = new Tabs();
    grids = new Grids();
  });

  test.describe("Test Field functions", () => {
    test("Value", () => {
      fields.Firstname.Value = "Joe";
      expect(fields.Firstname.Value).toBe("Joe");
      fields.Firstname.Value = "John";
      expect(fields.Firstname.Value).toBe("John");
    })
    test("Visible", () => {
      fields.Firstname.setVisible(false);
      expect(fields.Firstname.controls.get()[0].getVisible()).toBe(false);
      fields.Firstname.setVisible(true);
      expect(fields.Firstname.controls.get()[0].getVisible()).toBe(true);
    })
    test("Disabled", () => {
      fields.Firstname.setDisabled(false);
      expect(fields.Firstname.controls.get()[0].getDisabled()).toBe(false);
      fields.Firstname.setDisabled(true);
      expect(fields.Firstname.controls.get()[0].getDisabled()).toBe(true);
    })
    test("Required", () => {
      fields.Firstname.setRequired(false);
      expect(fields.Firstname.getRequiredLevel()).toBe("none");
      fields.Firstname.setRequired(true);
      expect(fields.Firstname.getRequiredLevel()).toBe("required");
    })
  });
});