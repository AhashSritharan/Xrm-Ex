/// <reference path="../build/src/XrmEx.d.ts" />
import { expect, Page, test } from "@playwright/test";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { CRMConfig } from "./auth.setup";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await page.addInitScript({ path: "build/src/XrmEx.js" });
    let env: CRMConfig = process.env.ENV_VAR_JSON
        ? JSON.parse(process.env.ENV_VAR_JSON)
        : loadJson();
    await page.goto(env.CONTACT_RECORD_URL);
    await page.getByLabel("First Name").waitFor({ state: "visible" });
    await getModel(page);
});
test.describe("Test Field Class", () => {
    test("Get and Set Value", async ({ page }) => {
        var response = await page.evaluate(() => {
            model.fields.Firstname.Value = "John";
            return model.fields.Firstname.Value;
        });
        expect(response).toBe("John"); //Test
    });
    test("Hide and Show Field", async ({ page }) => {
        var response = await page.evaluate(() => {
            model.fields.Firstname.setVisible(false);
            let isVisible = false;
            model.fields.Firstname.controls.forEach(
                (c) => (isVisible = c.getVisible())
            );
            return isVisible;
        });
        expect(response).toBe(false);

        var response2 = await page.evaluate(() => {
            model.fields.Firstname.setVisible(true);
            let isVisible = false;
            model.fields.Firstname.controls.forEach(
                (c) => (isVisible = c.getVisible())
            );
            return isVisible;
        });
        expect(response2).toBe(true);
    });
});

type PromiseType<T extends Promise<any>> = T extends Promise<infer U>
    ? U
    : never;
declare global {
    interface Window {
        model: PromiseType<ReturnType<typeof getModel>>;
        XrmEx: typeof XrmEx;
        EventContext: any;
    }
}
var model: PromiseType<ReturnType<typeof getModel>>;
async function getModel(page: Page) {
    return await page.evaluate(() => {
        console.log(window.XrmEx.Form.executionContext);
        XrmEx.Form.executionContext = window.EventContext;
        class Fields {
            Firstname = new XrmEx.Class.TextField("firstname");
            Lastname = new XrmEx.Class.TextField("lastname");
            JobTitle = new XrmEx.Class.TextField("jobtitle");
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
            Customer = new XrmEx.Class.LookupField("parentcustomerid");
            BusinessPhone = new XrmEx.Class.TextField("telephone1");
            Gender = new XrmEx.Class.OptionsetField("gendercode");
            Email = new XrmEx.Class.TextField("emailaddress1");
            MobilePhone = new XrmEx.Class.TextField("mobilephone");
            Owner = new XrmEx.Class.LookupField("ownerid");
            DoNotEmail = new XrmEx.Class.BooleanField("donotemail");
            MaritalStatus = new XrmEx.Class.OptionsetField("familystatuscode");
            SpousePartnerName = new XrmEx.Class.TextField("spousesname");
            Birthday = new XrmEx.Class.DateField("birthdate");
        }
        class Tabs {
            General = new XrmEx.Class.Tab("tab1", {
                Section1: new XrmEx.Class.Section("section1"),
                Section2: new XrmEx.Class.Section("section2"),
            });
            Details = new XrmEx.Class.Tab("tab2", {
                Section1: new XrmEx.Class.Section("section1"),
                Section2: new XrmEx.Class.Section("section2"),
            });
        }
        class Grids {
            ContactSubgrid = new XrmEx.Class.GridControl("Test");
        }
        var model = {
            fields: new Fields(),
            tabs: new Tabs(),
            grids: new Grids(),
        };
        window.model = model;
        return model;
    });
}
function loadJson() {
    try {
        const buffer = fs.readFileSync(
            path.join(__dirname, "../playwright.env.json"),
            { encoding: "utf-8" }
        );
        return JSON.parse(buffer);
    } catch (error) {
        console.error("Could not load JSON", error);
    }
}