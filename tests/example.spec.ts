import { expect, Page, test } from '@playwright/test';

import { CRMConfig } from './auth.setup';

test.beforeEach(async ({ page }) => {
  test.setTimeout(60000);
  await page.addInitScript({ path: 'build/src/XrmEx.js' });
  var env: CRMConfig = JSON.parse(process.env.ENV_VAR_JSON);
  await page.goto(env.CONTACT_RECORD_URL);
  await page.getByLabel('First Name').waitFor({ state: 'visible' });
  await getModel(page);
});
test.describe('Test Field Class', () => {
  test('Get and Set Value', async ({ page }) => {
    var response = await page.evaluate(() => {
      model.fields.Firstname.Value = 'John';
      return model.fields.Firstname.Value;
    });
    expect(response).toBe('John');//Test
  });
  test('Hide and Show Field', async ({ page }) => {
    var response = await page.evaluate(() => {
      model.fields.Firstname.setVisible(false);
      let isVisible: boolean;
      model.fields.Firstname.controls.forEach(c => isVisible = c.getVisible())
      return isVisible;
    });
    expect(response).toBe(false);

    var response2 = await page.evaluate(() => {
      model.fields.Firstname.setVisible(true);
      let isVisible: boolean;
      model.fields.Firstname.controls.forEach(c => isVisible = c.getVisible())
      return isVisible;
    });
    expect(response2).toBe(true);
  });
});

type PromiseType<T extends Promise<any>> = T extends Promise<infer U> ? U : never;
declare global {
  interface Window {
    model: PromiseType<ReturnType<typeof getModel>>;
  }
}
var model: PromiseType<ReturnType<typeof getModel>>;
async function getModel(page: Page) {
  return await page.evaluate(() => {
    XrmEx.Form.formContext = window.XrmEx.Form.executionContext;
    class Fields {
      Firstname = new XrmEx.TextField("firstname");
      Lastname = new XrmEx.TextField("lastname");
      JobTitle = new XrmEx.TextField("jobtitle");
      PreferredContactMethod = new XrmEx.OptionsetField(
        "preferredcontactmethodcode",
        {
          Any: 1,
          Email: 2,
          Phone: 3,
          Fax: 4,
          Mail: 5,
        }
      );
      Customer = new XrmEx.LookupField("parentcustomerid");
      BusinessPhone = new XrmEx.TextField("telephone1");
      Gender = new XrmEx.OptionsetField("gendercode");
      Email = new XrmEx.TextField("emailaddress1");
      MobilePhone = new XrmEx.TextField("mobilephone");
      Owner = new XrmEx.LookupField("ownerid");
      DoNotEmail = new XrmEx.BooleanField("donotemail");
      MaritalStatus = new XrmEx.OptionsetField("familystatuscode");
      SpousePartnerName = new XrmEx.TextField("spousesname");
      Birthday = new XrmEx.DateField("birthdate");
    }
    class Tabs {
      General = new XrmEx.Tab("tab1", {
        Section1: new XrmEx.Section("section1"),
        Section2: new XrmEx.Section("section2"),
      });
      Details = new XrmEx.Tab("tab2", {
        Section1: new XrmEx.Section("section1"),
        Section2: new XrmEx.Section("section2"),
      });
    }
    class Grids {
      ContactSubgrid = new XrmEx.GridControl("Test");
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