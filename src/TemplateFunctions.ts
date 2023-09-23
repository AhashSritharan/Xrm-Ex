/// <reference path="XrmEx.ts" />

// eslint-disable-next-line no-unused-vars
namespace Theia {
  export namespace TemplateFunctions {
    var formContext: Xrm.FormContext;
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
    var fields: Fields;
    var tabs: Tabs;
    var grids: Grids;
    export async function Init(
      executionContext: Xrm.FormContext | Xrm.Events.EventContext
    ) {
      if (!XrmEx) {
        let errorMessage =
          "XrmEx is not loaded. Please make sure you have XrmEx.js loaded in your form.";
        console.error(errorMessage);
        await Xrm.Navigation.openAlertDialog({
          title: "Error",
          text: errorMessage,
        });
        return;
      }
      XrmEx.Form.formContext = executionContext;
      fields = new Fields();
      tabs = new Tabs();
      grids = new Grids();
    }

    export async function OnLoad(
      executionContext: Xrm.FormContext | Xrm.Events.EventContext
    ) {
      await Init(executionContext); //Ensures XrmEx is only accessed after the OnLoad Event
      try {
        parent.window.XrmEx = XrmEx;
        formContext = XrmEx.Form.formContext;

        await sample();
        //Register one or more Functions to execute OnSave
        formContext.data.entity.addOnSave(sample);
        //BETTER WAY
        XrmEx.Form.addOnSaveEventHandler([sample]);
        //Register one or more Functions to execute OnChange of multiple fields and execute it immediately
        let firstname = formContext.getAttribute("firstname");
        let lastname = formContext.getAttribute("lastname");
        firstname.addOnChange(sample);
        firstname.fireOnChange();
        lastname.fireOnChange();
        //BETTER WAY
        XrmEx.Form.addOnChangeEventHandler(
          [fields.Firstname, fields.Lastname],
          [sample],
          true
        );
      } catch (error) {
        console.error(error);
        await XrmEx.openAlertDialog(
          "Error",
          `Error in Theia.TemplateFunctions.${XrmEx.getMethodName()}\n` +
            error.message
        );
      }
      /**
       * This Framework empowers developers to DO MORE by writing LESS CODE 👈(ﾟヮﾟ👈)
       */
      async function sample() {
        try {
          //Continue only on Update Form
          if (formContext.ui.getFormType() != 2) return;
          //BETTER WAY
          if (XrmEx.Form.IsNotUpdate) return;

          //If Firstname is empty, make it required and shows notification on the field
          let firstname = formContext.getAttribute("firstname");
          if (!firstname.getValue()) {
            firstname.setRequiredLevel("required");
            firstname.controls.forEach((c) =>
              c.setNotification("This property is required", "uniqueId")
            );
          }
          //BETTER WAY
          if (!fields.Lastname.Value)
            fields.Firstname.setRequired(true).setNotification(
              "This property is required",
              "uniqueId"
            );

          //If Owner has Value and Lastname does not, retrieve it's lastname and set it to Lastname
          let ownerid = formContext.getAttribute("ownerid");
          let lastname = formContext.getAttribute("lastname");
          if (ownerid.getValue() && !lastname.getValue()) {
            let user = await Xrm.WebApi.retrieveRecord(
              ownerid.getValue()[0].entityType,
              ownerid.getValue()[0].id,
              "?$select=lastname"
            );
            lastname.setValue(user.lastname);
          }
          //BETTER WAY
          if (fields.Owner.Value && !fields.Lastname.Value) {
            let user = await fields.Owner.retrieve("?$select=lastname");
            fields.Lastname.Value = user.lastname;
            fields.Lastname.setValue(user.lastname);
          }
          //Set Optionset PreferredContactMethod to Email
          fields.PreferredContactMethod.Value =
            fields.PreferredContactMethod.Option.Email;

          //Add Lookup Filter to Customer and remove it later
          let filterFunction = function filterFunction(
            executionContext: Xrm.Events.EventContext
          ) {
            let formContext = executionContext.getFormContext();
            let customer: Xrm.Attributes.LookupAttribute =
              formContext.getAttribute("parentcustomerid");
            customer.controls.forEach((c) => {
              c.addCustomFilter(
                `<filter>
                                <condition attribute="lastname" operator="like" value="%Test%" />
                            </filter>`
              );
            });
          };
          let customer: Xrm.Attributes.LookupAttribute =
            formContext.getAttribute("parentcustomerid");
          customer.controls.forEach((c) => c.addPreSearch(filterFunction));
          customer.controls.forEach((c) => c.removePreSearch(filterFunction));
          //BETTER WAY
          fields.Customer.addPreFilterToLookup(
            `<filter>
                    <condition attribute="lastname" operator="like" value="%Test%" />
                </filter>`
          );
          fields.Customer.clearPreFilterFromLookup();

          fields.Lastname.setVisible(false)
            .setDisabled(true)
            .setRequired(false)
            .setNotification("This property is required", "uniqueId");

          //SPECIAL WAY (Go to Definition to see how to achieve this)
          //Add Advanced Lookup Filter
          await fields.Customer.addPreFilterToLookupAdvanced(
            "contact",
            "contactid",
            `<fetch>
                    <entity name="contact">
                      <filter>
                        <condition attribute="lastname" operator="like" value="%Test%" />
                      </filter>
                    </entity>
                  </fetch>`
          );

          //Execute bound Action
          class TestActionContactRequest {
            Amount: number;
            Account: any;
            getMetadata() {
              return {
                boundParameter: "entity",
                operationType: 0,
                operationName: "theia_TestActionContact",
                parameterTypes: {
                  Amount: {
                    typeName: "Edm.Int32",
                    structuralProperty: 1,
                  },
                  Account: {
                    typeName: "mscrm.account",
                    structuralProperty: 5,
                  },
                  entity: {
                    typeName: "mscrm.contact",
                    structuralProperty: 5,
                  },
                },
              };
            }
          }
          let testActionContactRequest = new TestActionContactRequest();
          testActionContactRequest.Amount = 5;
          testActionContactRequest.Account = customer.getValue()[0];
          testActionContactRequest["entity"] =
            formContext.data.entity.getEntityReference();
          let response = await Xrm.WebApi.online
            .execute(testActionContactRequest)
            .then(function (response) {
              if (response.ok) {
                return response.json().catch(() => {
                  return response;
                });
              }
            })
            .then((responseBody) => responseBody);
          console.log(response);

          //BETTER WAY
          let response2 = await XrmEx.executeAction(
            "theia_TestActionContact",
            [
              { Name: "Amount", Type: "Integer", Value: 5 },
              {
                Name: "Account",
                Type: "EntityReference",
                Value: fields.Customer.Value[0],
              },
            ],
            XrmEx.Form.entityReference
          );
          console.log(response2);

          //Retrieve EnvironmentVariableValue
          class EnvironmentVariableRequest {
            DefinitionSchemaName: string;
            constructor(definitionSchemaName: string) {
              this.DefinitionSchemaName = definitionSchemaName;
            }
            getMetadata() {
              return {
                boundParameter: null,
                operationType: 1,
                operationName: "RetrieveEnvironmentVariableValue",
                parameterTypes: {
                  DefinitionSchemaName: {
                    typeName: "Edm.String",
                    structuralProperty: 1,
                  },
                },
              };
            }
          }
          let environmentVariableRequest = new EnvironmentVariableRequest(
            "theia_Test"
          );
          let value = await Xrm.WebApi.online
            .execute(environmentVariableRequest)
            .then(function (response) {
              if (response.ok) {
                return response.json().catch(() => {
                  return response;
                });
              }
            })
            .then((responseBody) => responseBody);
          console.log(value);
          //BETTER WAY
          let value2 = await XrmEx.getEnvironmentVariableValue("theia_Test");
          console.log(value2);

          /**
           * How to access Propoerties described in Microsofts Documentation
           */
          /** You can access all Form Context Functions here: @see https://docs.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/clientapi-form-context*/
          XrmEx.Form.formContext.data.isValid();

          /** You can access all Column Functions here: @see https://docs.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/attributes*/
          fields.Birthday.Attribute.getIsDirty();
        } catch (error) {
          console.error(error);
          throw new Error(`.${XrmEx.getMethodName()}:\n${error.message}`);
        }
      }
    }
  }
}
