/// <reference path="../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../node_modules/@types/chai/index.d.ts" />
const expect = chai.expect;
describe("my suite", function () {
  let XrmEx = parent.window.XrmEx;
  let Form = XrmEx.Form;
  let fields = {
    Firstname: new XrmEx.TextField("firstname"),
    Lastname: new XrmEx.TextField("lastname"),
    Jobtitle: new XrmEx.TextField("jobtitle"),
    Customer: new XrmEx.LookupField("parentcustomerid"),
  };
  it(`Test setting Field`, function () {
    fields.Firstname.Value = "Ahash";
    expect(fields.Firstname.Value).to.equal("Ahash");
  });
  it(`Test Action`, async function () {
    let response = await XrmEx.executeAction(
      "theia_TestActionContact",
      [
        { Name: "Amount", Type: "Integer", Value: 5 },
        {
          Name: "Account",
          Type: "EntityReference",
          Value: fields.Customer.Value[0],
        },
      ],
      Form.entityReference
    );
    expect(response).to.have.property("Result").that.equals("Success");
  });
  it(`Test Notification`, async function () {
    let uniqueId = await XrmEx.addGlobalNotification("Test", "SUCCESS", true);
    expect(uniqueId).to.not.be.empty;
  });
  it(`Test AlertDialog`, async function () {
    let uniqueId = await XrmEx.openAlertDialog("Test", "Test message");
    expect(uniqueId).to.not.be.empty;
  });
});
