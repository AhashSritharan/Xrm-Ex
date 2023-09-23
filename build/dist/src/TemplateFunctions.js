/// <reference path="XrmEx.ts" />
// eslint-disable-next-line no-unused-vars
var Theia;
(function (Theia) {
    let TemplateFunctions;
    (function (TemplateFunctions) {
        var formContext;
        class Fields {
            Firstname = new XrmEx.TextField("firstname");
            Lastname = new XrmEx.TextField("lastname");
            JobTitle = new XrmEx.TextField("jobtitle");
            PreferredContactMethod = new XrmEx.OptionsetField("preferredcontactmethodcode", {
                Any: 1,
                Email: 2,
                Phone: 3,
                Fax: 4,
                Mail: 5,
            });
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
        var fields;
        var tabs;
        var grids;
        async function Init(executionContext) {
            if (!XrmEx) {
                let errorMessage = "XrmEx is not loaded. Please make sure you have XrmEx.js loaded in your form.";
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
        TemplateFunctions.Init = Init;
        async function OnLoad(executionContext) {
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
                XrmEx.Form.addOnChangeEventHandler([fields.Firstname, fields.Lastname], [sample], true);
            }
            catch (error) {
                console.error(error);
                await XrmEx.openAlertDialog("Error", `Error in Theia.TemplateFunctions.${XrmEx.getMethodName()}\n` +
                    error.message);
            }
            /**
             * This Framework empowers developers to DO MORE by writing LESS CODE 👈(ﾟヮﾟ👈)
             */
            async function sample() {
                try {
                    //Continue only on Update Form
                    if (formContext.ui.getFormType() != 2)
                        return;
                    //BETTER WAY
                    if (XrmEx.Form.IsNotUpdate)
                        return;
                    //If Firstname is empty, make it required and shows notification on the field
                    let firstname = formContext.getAttribute("firstname");
                    if (!firstname.getValue()) {
                        firstname.setRequiredLevel("required");
                        firstname.controls.forEach((c) => c.setNotification("This property is required", "uniqueId"));
                    }
                    //BETTER WAY
                    if (!fields.Lastname.Value)
                        fields.Firstname.setRequired(true).setNotification("This property is required", "uniqueId");
                    //If Owner has Value and Lastname does not, retrieve it's lastname and set it to Lastname
                    let ownerid = formContext.getAttribute("ownerid");
                    let lastname = formContext.getAttribute("lastname");
                    if (ownerid.getValue() && !lastname.getValue()) {
                        let user = await Xrm.WebApi.retrieveRecord(ownerid.getValue()[0].entityType, ownerid.getValue()[0].id, "?$select=lastname");
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
                    let filterFunction = function filterFunction(executionContext) {
                        let formContext = executionContext.getFormContext();
                        let customer = formContext.getAttribute("parentcustomerid");
                        customer.controls.forEach((c) => {
                            c.addCustomFilter(`<filter>
                                <condition attribute="lastname" operator="like" value="%Test%" />
                            </filter>`);
                        });
                    };
                    let customer = formContext.getAttribute("parentcustomerid");
                    customer.controls.forEach((c) => c.addPreSearch(filterFunction));
                    customer.controls.forEach((c) => c.removePreSearch(filterFunction));
                    //BETTER WAY
                    fields.Customer.addPreFilterToLookup(`<filter>
                    <condition attribute="lastname" operator="like" value="%Test%" />
                </filter>`);
                    fields.Customer.clearPreFilterFromLookup();
                    fields.Lastname.setVisible(false)
                        .setDisabled(true)
                        .setRequired(false)
                        .setNotification("This property is required", "uniqueId");
                    //SPECIAL WAY (Go to Definition to see how to achieve this)
                    //Add Advanced Lookup Filter
                    await fields.Customer.addPreFilterToLookupAdvanced("contact", "contactid", `<fetch>
                    <entity name="contact">
                      <filter>
                        <condition attribute="lastname" operator="like" value="%Test%" />
                      </filter>
                    </entity>
                  </fetch>`);
                    //Execute bound Action
                    class TestActionContactRequest {
                        Amount;
                        Account;
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
                    let response2 = await XrmEx.executeAction("theia_TestActionContact", [
                        { Name: "Amount", Type: "Integer", Value: 5 },
                        {
                            Name: "Account",
                            Type: "EntityReference",
                            Value: fields.Customer.Value[0],
                        },
                    ], XrmEx.Form.entityReference);
                    console.log(response2);
                    //Retrieve EnvironmentVariableValue
                    class EnvironmentVariableRequest {
                        DefinitionSchemaName;
                        constructor(definitionSchemaName) {
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
                    let environmentVariableRequest = new EnvironmentVariableRequest("theia_Test");
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
                }
                catch (error) {
                    console.error(error);
                    throw new Error(`.${XrmEx.getMethodName()}:\n${error.message}`);
                }
            }
        }
        TemplateFunctions.OnLoad = OnLoad;
    })(TemplateFunctions = Theia.TemplateFunctions || (Theia.TemplateFunctions = {}));
})(Theia || (Theia = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVtcGxhdGVGdW5jdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvVGVtcGxhdGVGdW5jdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsaUNBQWlDO0FBRWpDLDBDQUEwQztBQUMxQyxJQUFVLEtBQUssQ0EyU2Q7QUEzU0QsV0FBVSxLQUFLO0lBQ2IsSUFBaUIsaUJBQWlCLENBeVNqQztJQXpTRCxXQUFpQixpQkFBaUI7UUFDaEMsSUFBSSxXQUE0QixDQUFDO1FBQ2pDLE1BQU0sTUFBTTtZQUNWLFNBQVMsR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDN0MsUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMzQyxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzNDLHNCQUFzQixHQUFHLElBQUksS0FBSyxDQUFDLGNBQWMsQ0FDL0MsNEJBQTRCLEVBQzVCO2dCQUNFLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxDQUFDO2dCQUNSLEtBQUssRUFBRSxDQUFDO2dCQUNSLEdBQUcsRUFBRSxDQUFDO2dCQUNOLElBQUksRUFBRSxDQUFDO2FBQ1IsQ0FDRixDQUFDO1lBQ0YsUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3JELGFBQWEsR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDbEQsTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNoRCxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzdDLFdBQVcsR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7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ZXJlbmNlIHBhdGg9XCJYcm1FeC50c1wiIC8+XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xubmFtZXNwYWNlIFRoZWlhIHtcbiAgZXhwb3J0IG5hbWVzcGFjZSBUZW1wbGF0ZUZ1bmN0aW9ucyB7XG4gICAgdmFyIGZvcm1Db250ZXh0OiBYcm0uRm9ybUNvbnRleHQ7XG4gICAgY2xhc3MgRmllbGRzIHtcbiAgICAgIEZpcnN0bmFtZSA9IG5ldyBYcm1FeC5UZXh0RmllbGQoXCJmaXJzdG5hbWVcIik7XG4gICAgICBMYXN0bmFtZSA9IG5ldyBYcm1FeC5UZXh0RmllbGQoXCJsYXN0bmFtZVwiKTtcbiAgICAgIEpvYlRpdGxlID0gbmV3IFhybUV4LlRleHRGaWVsZChcImpvYnRpdGxlXCIpO1xuICAgICAgUHJlZmVycmVkQ29udGFjdE1ldGhvZCA9IG5ldyBYcm1FeC5PcHRpb25zZXRGaWVsZChcbiAgICAgICAgXCJwcmVmZXJyZWRjb250YWN0bWV0aG9kY29kZVwiLFxuICAgICAgICB7XG4gICAgICAgICAgQW55OiAxLFxuICAgICAgICAgIEVtYWlsOiAyLFxuICAgICAgICAgIFBob25lOiAzLFxuICAgICAgICAgIEZheDogNCxcbiAgICAgICAgICBNYWlsOiA1LFxuICAgICAgICB9XG4gICAgICApO1xuICAgICAgQ3VzdG9tZXIgPSBuZXcgWHJtRXguTG9va3VwRmllbGQoXCJwYXJlbnRjdXN0b21lcmlkXCIpO1xuICAgICAgQnVzaW5lc3NQaG9uZSA9IG5ldyBYcm1FeC5UZXh0RmllbGQoXCJ0ZWxlcGhvbmUxXCIpO1xuICAgICAgR2VuZGVyID0gbmV3IFhybUV4Lk9wdGlvbnNldEZpZWxkKFwiZ2VuZGVyY29kZVwiKTtcbiAgICAgIEVtYWlsID0gbmV3IFhybUV4LlRleHRGaWVsZChcImVtYWlsYWRkcmVzczFcIik7XG4gICAgICBNb2JpbGVQaG9uZSA9IG5ldyBYcm1FeC5UZXh0RmllbGQoXCJtb2JpbGVwaG9uZVwiKTtcbiAgICAgIE93bmVyID0gbmV3IFhybUV4Lkxvb2t1cEZpZWxkKFwib3duZXJpZFwiKTtcbiAgICAgIERvTm90RW1haWwgPSBuZXcgWHJtRXguQm9vbGVhbkZpZWxkKFwiZG9ub3RlbWFpbFwiKTtcbiAgICAgIE1hcml0YWxTdGF0dXMgPSBuZXcgWHJtRXguT3B0aW9uc2V0RmllbGQoXCJmYW1pbHlzdGF0dXNjb2RlXCIpO1xuICAgICAgU3BvdXNlUGFydG5lck5hbWUgPSBuZXcgWHJtRXguVGV4dEZpZWxkKFwic3BvdXNlc25hbWVcIik7XG4gICAgICBCaXJ0aGRheSA9IG5ldyBYcm1FeC5EYXRlRmllbGQoXCJiaXJ0aGRhdGVcIik7XG4gICAgfVxuICAgIGNsYXNzIFRhYnMge1xuICAgICAgR2VuZXJhbCA9IG5ldyBYcm1FeC5UYWIoXCJ0YWIxXCIsIHtcbiAgICAgICAgU2VjdGlvbjE6IG5ldyBYcm1FeC5TZWN0aW9uKFwic2VjdGlvbjFcIiksXG4gICAgICAgIFNlY3Rpb24yOiBuZXcgWHJtRXguU2VjdGlvbihcInNlY3Rpb24yXCIpLFxuICAgICAgfSk7XG4gICAgICBEZXRhaWxzID0gbmV3IFhybUV4LlRhYihcInRhYjJcIiwge1xuICAgICAgICBTZWN0aW9uMTogbmV3IFhybUV4LlNlY3Rpb24oXCJzZWN0aW9uMVwiKSxcbiAgICAgICAgU2VjdGlvbjI6IG5ldyBYcm1FeC5TZWN0aW9uKFwic2VjdGlvbjJcIiksXG4gICAgICB9KTtcbiAgICB9XG4gICAgY2xhc3MgR3JpZHMge1xuICAgICAgQ29udGFjdFN1YmdyaWQgPSBuZXcgWHJtRXguR3JpZENvbnRyb2woXCJUZXN0XCIpO1xuICAgIH1cbiAgICB2YXIgZmllbGRzOiBGaWVsZHM7XG4gICAgdmFyIHRhYnM6IFRhYnM7XG4gICAgdmFyIGdyaWRzOiBHcmlkcztcbiAgICBleHBvcnQgYXN5bmMgZnVuY3Rpb24gSW5pdChcbiAgICAgIGV4ZWN1dGlvbkNvbnRleHQ6IFhybS5Gb3JtQ29udGV4dCB8IFhybS5FdmVudHMuRXZlbnRDb250ZXh0XG4gICAgKSB7XG4gICAgICBpZiAoIVhybUV4KSB7XG4gICAgICAgIGxldCBlcnJvck1lc3NhZ2UgPVxuICAgICAgICAgIFwiWHJtRXggaXMgbm90IGxvYWRlZC4gUGxlYXNlIG1ha2Ugc3VyZSB5b3UgaGF2ZSBYcm1FeC5qcyBsb2FkZWQgaW4geW91ciBmb3JtLlwiO1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIGF3YWl0IFhybS5OYXZpZ2F0aW9uLm9wZW5BbGVydERpYWxvZyh7XG4gICAgICAgICAgdGl0bGU6IFwiRXJyb3JcIixcbiAgICAgICAgICB0ZXh0OiBlcnJvck1lc3NhZ2UsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBYcm1FeC5Gb3JtLmZvcm1Db250ZXh0ID0gZXhlY3V0aW9uQ29udGV4dDtcbiAgICAgIGZpZWxkcyA9IG5ldyBGaWVsZHMoKTtcbiAgICAgIHRhYnMgPSBuZXcgVGFicygpO1xuICAgICAgZ3JpZHMgPSBuZXcgR3JpZHMoKTtcbiAgICB9XG5cbiAgICBleHBvcnQgYXN5bmMgZnVuY3Rpb24gT25Mb2FkKFxuICAgICAgZXhlY3V0aW9uQ29udGV4dDogWHJtLkZvcm1Db250ZXh0IHwgWHJtLkV2ZW50cy5FdmVudENvbnRleHRcbiAgICApIHtcbiAgICAgIGF3YWl0IEluaXQoZXhlY3V0aW9uQ29udGV4dCk7IC8vRW5zdXJlcyBYcm1FeCBpcyBvbmx5IGFjY2Vzc2VkIGFmdGVyIHRoZSBPbkxvYWQgRXZlbnRcbiAgICAgIHRyeSB7XG4gICAgICAgIHBhcmVudC53aW5kb3cuWHJtRXggPSBYcm1FeDtcbiAgICAgICAgZm9ybUNvbnRleHQgPSBYcm1FeC5Gb3JtLmZvcm1Db250ZXh0O1xuXG4gICAgICAgIGF3YWl0IHNhbXBsZSgpO1xuICAgICAgICAvL1JlZ2lzdGVyIG9uZSBvciBtb3JlIEZ1bmN0aW9ucyB0byBleGVjdXRlIE9uU2F2ZVxuICAgICAgICBmb3JtQ29udGV4dC5kYXRhLmVudGl0eS5hZGRPblNhdmUoc2FtcGxlKTtcbiAgICAgICAgLy9CRVRURVIgV0FZXG4gICAgICAgIFhybUV4LkZvcm0uYWRkT25TYXZlRXZlbnRIYW5kbGVyKFtzYW1wbGVdKTtcbiAgICAgICAgLy9SZWdpc3RlciBvbmUgb3IgbW9yZSBGdW5jdGlvbnMgdG8gZXhlY3V0ZSBPbkNoYW5nZSBvZiBtdWx0aXBsZSBmaWVsZHMgYW5kIGV4ZWN1dGUgaXQgaW1tZWRpYXRlbHlcbiAgICAgICAgbGV0IGZpcnN0bmFtZSA9IGZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZShcImZpcnN0bmFtZVwiKTtcbiAgICAgICAgbGV0IGxhc3RuYW1lID0gZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKFwibGFzdG5hbWVcIik7XG4gICAgICAgIGZpcnN0bmFtZS5hZGRPbkNoYW5nZShzYW1wbGUpO1xuICAgICAgICBmaXJzdG5hbWUuZmlyZU9uQ2hhbmdlKCk7XG4gICAgICAgIGxhc3RuYW1lLmZpcmVPbkNoYW5nZSgpO1xuICAgICAgICAvL0JFVFRFUiBXQVlcbiAgICAgICAgWHJtRXguRm9ybS5hZGRPbkNoYW5nZUV2ZW50SGFuZGxlcihcbiAgICAgICAgICBbZmllbGRzLkZpcnN0bmFtZSwgZmllbGRzLkxhc3RuYW1lXSxcbiAgICAgICAgICBbc2FtcGxlXSxcbiAgICAgICAgICB0cnVlXG4gICAgICAgICk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgYXdhaXQgWHJtRXgub3BlbkFsZXJ0RGlhbG9nKFxuICAgICAgICAgIFwiRXJyb3JcIixcbiAgICAgICAgICBgRXJyb3IgaW4gVGhlaWEuVGVtcGxhdGVGdW5jdGlvbnMuJHtYcm1FeC5nZXRNZXRob2ROYW1lKCl9XFxuYCArXG4gICAgICAgICAgICBlcnJvci5tZXNzYWdlXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICAvKipcbiAgICAgICAqIFRoaXMgRnJhbWV3b3JrIGVtcG93ZXJzIGRldmVsb3BlcnMgdG8gRE8gTU9SRSBieSB3cml0aW5nIExFU1MgQ09ERSDwn5GIKO++n+ODru++n/CfkYgpXG4gICAgICAgKi9cbiAgICAgIGFzeW5jIGZ1bmN0aW9uIHNhbXBsZSgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvL0NvbnRpbnVlIG9ubHkgb24gVXBkYXRlIEZvcm1cbiAgICAgICAgICBpZiAoZm9ybUNvbnRleHQudWkuZ2V0Rm9ybVR5cGUoKSAhPSAyKSByZXR1cm47XG4gICAgICAgICAgLy9CRVRURVIgV0FZXG4gICAgICAgICAgaWYgKFhybUV4LkZvcm0uSXNOb3RVcGRhdGUpIHJldHVybjtcblxuICAgICAgICAgIC8vSWYgRmlyc3RuYW1lIGlzIGVtcHR5LCBtYWtlIGl0IHJlcXVpcmVkIGFuZCBzaG93cyBub3RpZmljYXRpb24gb24gdGhlIGZpZWxkXG4gICAgICAgICAgbGV0IGZpcnN0bmFtZSA9IGZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZShcImZpcnN0bmFtZVwiKTtcbiAgICAgICAgICBpZiAoIWZpcnN0bmFtZS5nZXRWYWx1ZSgpKSB7XG4gICAgICAgICAgICBmaXJzdG5hbWUuc2V0UmVxdWlyZWRMZXZlbChcInJlcXVpcmVkXCIpO1xuICAgICAgICAgICAgZmlyc3RuYW1lLmNvbnRyb2xzLmZvckVhY2goKGMpID0+XG4gICAgICAgICAgICAgIGMuc2V0Tm90aWZpY2F0aW9uKFwiVGhpcyBwcm9wZXJ0eSBpcyByZXF1aXJlZFwiLCBcInVuaXF1ZUlkXCIpXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvL0JFVFRFUiBXQVlcbiAgICAgICAgICBpZiAoIWZpZWxkcy5MYXN0bmFtZS5WYWx1ZSlcbiAgICAgICAgICAgIGZpZWxkcy5GaXJzdG5hbWUuc2V0UmVxdWlyZWQodHJ1ZSkuc2V0Tm90aWZpY2F0aW9uKFxuICAgICAgICAgICAgICBcIlRoaXMgcHJvcGVydHkgaXMgcmVxdWlyZWRcIixcbiAgICAgICAgICAgICAgXCJ1bmlxdWVJZFwiXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgLy9JZiBPd25lciBoYXMgVmFsdWUgYW5kIExhc3RuYW1lIGRvZXMgbm90LCByZXRyaWV2ZSBpdCdzIGxhc3RuYW1lIGFuZCBzZXQgaXQgdG8gTGFzdG5hbWVcbiAgICAgICAgICBsZXQgb3duZXJpZCA9IGZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZShcIm93bmVyaWRcIik7XG4gICAgICAgICAgbGV0IGxhc3RuYW1lID0gZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKFwibGFzdG5hbWVcIik7XG4gICAgICAgICAgaWYgKG93bmVyaWQuZ2V0VmFsdWUoKSAmJiAhbGFzdG5hbWUuZ2V0VmFsdWUoKSkge1xuICAgICAgICAgICAgbGV0IHVzZXIgPSBhd2FpdCBYcm0uV2ViQXBpLnJldHJpZXZlUmVjb3JkKFxuICAgICAgICAgICAgICBvd25lcmlkLmdldFZhbHVlKClbMF0uZW50aXR5VHlwZSxcbiAgICAgICAgICAgICAgb3duZXJpZC5nZXRWYWx1ZSgpWzBdLmlkLFxuICAgICAgICAgICAgICBcIj8kc2VsZWN0PWxhc3RuYW1lXCJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBsYXN0bmFtZS5zZXRWYWx1ZSh1c2VyLmxhc3RuYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy9CRVRURVIgV0FZXG4gICAgICAgICAgaWYgKGZpZWxkcy5Pd25lci5WYWx1ZSAmJiAhZmllbGRzLkxhc3RuYW1lLlZhbHVlKSB7XG4gICAgICAgICAgICBsZXQgdXNlciA9IGF3YWl0IGZpZWxkcy5Pd25lci5yZXRyaWV2ZShcIj8kc2VsZWN0PWxhc3RuYW1lXCIpO1xuICAgICAgICAgICAgZmllbGRzLkxhc3RuYW1lLlZhbHVlID0gdXNlci5sYXN0bmFtZTtcbiAgICAgICAgICAgIGZpZWxkcy5MYXN0bmFtZS5zZXRWYWx1ZSh1c2VyLmxhc3RuYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy9TZXQgT3B0aW9uc2V0IFByZWZlcnJlZENvbnRhY3RNZXRob2QgdG8gRW1haWxcbiAgICAgICAgICBmaWVsZHMuUHJlZmVycmVkQ29udGFjdE1ldGhvZC5WYWx1ZSA9XG4gICAgICAgICAgICBmaWVsZHMuUHJlZmVycmVkQ29udGFjdE1ldGhvZC5PcHRpb24uRW1haWw7XG5cbiAgICAgICAgICAvL0FkZCBMb29rdXAgRmlsdGVyIHRvIEN1c3RvbWVyIGFuZCByZW1vdmUgaXQgbGF0ZXJcbiAgICAgICAgICBsZXQgZmlsdGVyRnVuY3Rpb24gPSBmdW5jdGlvbiBmaWx0ZXJGdW5jdGlvbihcbiAgICAgICAgICAgIGV4ZWN1dGlvbkNvbnRleHQ6IFhybS5FdmVudHMuRXZlbnRDb250ZXh0XG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBsZXQgZm9ybUNvbnRleHQgPSBleGVjdXRpb25Db250ZXh0LmdldEZvcm1Db250ZXh0KCk7XG4gICAgICAgICAgICBsZXQgY3VzdG9tZXI6IFhybS5BdHRyaWJ1dGVzLkxvb2t1cEF0dHJpYnV0ZSA9XG4gICAgICAgICAgICAgIGZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZShcInBhcmVudGN1c3RvbWVyaWRcIik7XG4gICAgICAgICAgICBjdXN0b21lci5jb250cm9scy5mb3JFYWNoKChjKSA9PiB7XG4gICAgICAgICAgICAgIGMuYWRkQ3VzdG9tRmlsdGVyKFxuICAgICAgICAgICAgICAgIGA8ZmlsdGVyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cImxhc3RuYW1lXCIgb3BlcmF0b3I9XCJsaWtlXCIgdmFsdWU9XCIlVGVzdCVcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZmlsdGVyPmBcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH07XG4gICAgICAgICAgbGV0IGN1c3RvbWVyOiBYcm0uQXR0cmlidXRlcy5Mb29rdXBBdHRyaWJ1dGUgPVxuICAgICAgICAgICAgZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKFwicGFyZW50Y3VzdG9tZXJpZFwiKTtcbiAgICAgICAgICBjdXN0b21lci5jb250cm9scy5mb3JFYWNoKChjKSA9PiBjLmFkZFByZVNlYXJjaChmaWx0ZXJGdW5jdGlvbikpO1xuICAgICAgICAgIGN1c3RvbWVyLmNvbnRyb2xzLmZvckVhY2goKGMpID0+IGMucmVtb3ZlUHJlU2VhcmNoKGZpbHRlckZ1bmN0aW9uKSk7XG4gICAgICAgICAgLy9CRVRURVIgV0FZXG4gICAgICAgICAgZmllbGRzLkN1c3RvbWVyLmFkZFByZUZpbHRlclRvTG9va3VwKFxuICAgICAgICAgICAgYDxmaWx0ZXI+XG4gICAgICAgICAgICAgICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwibGFzdG5hbWVcIiBvcGVyYXRvcj1cImxpa2VcIiB2YWx1ZT1cIiVUZXN0JVwiIC8+XG4gICAgICAgICAgICAgICAgPC9maWx0ZXI+YFxuICAgICAgICAgICk7XG4gICAgICAgICAgZmllbGRzLkN1c3RvbWVyLmNsZWFyUHJlRmlsdGVyRnJvbUxvb2t1cCgpO1xuXG4gICAgICAgICAgZmllbGRzLkxhc3RuYW1lLnNldFZpc2libGUoZmFsc2UpXG4gICAgICAgICAgICAuc2V0RGlzYWJsZWQodHJ1ZSlcbiAgICAgICAgICAgIC5zZXRSZXF1aXJlZChmYWxzZSlcbiAgICAgICAgICAgIC5zZXROb3RpZmljYXRpb24oXCJUaGlzIHByb3BlcnR5IGlzIHJlcXVpcmVkXCIsIFwidW5pcXVlSWRcIik7XG5cbiAgICAgICAgICAvL1NQRUNJQUwgV0FZIChHbyB0byBEZWZpbml0aW9uIHRvIHNlZSBob3cgdG8gYWNoaWV2ZSB0aGlzKVxuICAgICAgICAgIC8vQWRkIEFkdmFuY2VkIExvb2t1cCBGaWx0ZXJcbiAgICAgICAgICBhd2FpdCBmaWVsZHMuQ3VzdG9tZXIuYWRkUHJlRmlsdGVyVG9Mb29rdXBBZHZhbmNlZChcbiAgICAgICAgICAgIFwiY29udGFjdFwiLFxuICAgICAgICAgICAgXCJjb250YWN0aWRcIixcbiAgICAgICAgICAgIGA8ZmV0Y2g+XG4gICAgICAgICAgICAgICAgICAgIDxlbnRpdHkgbmFtZT1cImNvbnRhY3RcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZmlsdGVyPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCJsYXN0bmFtZVwiIG9wZXJhdG9yPVwibGlrZVwiIHZhbHVlPVwiJVRlc3QlXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICA8L2ZpbHRlcj5cbiAgICAgICAgICAgICAgICAgICAgPC9lbnRpdHk+XG4gICAgICAgICAgICAgICAgICA8L2ZldGNoPmBcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgLy9FeGVjdXRlIGJvdW5kIEFjdGlvblxuICAgICAgICAgIGNsYXNzIFRlc3RBY3Rpb25Db250YWN0UmVxdWVzdCB7XG4gICAgICAgICAgICBBbW91bnQ6IG51bWJlcjtcbiAgICAgICAgICAgIEFjY291bnQ6IGFueTtcbiAgICAgICAgICAgIGdldE1ldGFkYXRhKCkge1xuICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGJvdW5kUGFyYW1ldGVyOiBcImVudGl0eVwiLFxuICAgICAgICAgICAgICAgIG9wZXJhdGlvblR5cGU6IDAsXG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uTmFtZTogXCJ0aGVpYV9UZXN0QWN0aW9uQ29udGFjdFwiLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlclR5cGVzOiB7XG4gICAgICAgICAgICAgICAgICBBbW91bnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZU5hbWU6IFwiRWRtLkludDMyXCIsXG4gICAgICAgICAgICAgICAgICAgIHN0cnVjdHVyYWxQcm9wZXJ0eTogMSxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICBBY2NvdW50OiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGVOYW1lOiBcIm1zY3JtLmFjY291bnRcIixcbiAgICAgICAgICAgICAgICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiA1LFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIGVudGl0eToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlTmFtZTogXCJtc2NybS5jb250YWN0XCIsXG4gICAgICAgICAgICAgICAgICAgIHN0cnVjdHVyYWxQcm9wZXJ0eTogNSxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgbGV0IHRlc3RBY3Rpb25Db250YWN0UmVxdWVzdCA9IG5ldyBUZXN0QWN0aW9uQ29udGFjdFJlcXVlc3QoKTtcbiAgICAgICAgICB0ZXN0QWN0aW9uQ29udGFjdFJlcXVlc3QuQW1vdW50ID0gNTtcbiAgICAgICAgICB0ZXN0QWN0aW9uQ29udGFjdFJlcXVlc3QuQWNjb3VudCA9IGN1c3RvbWVyLmdldFZhbHVlKClbMF07XG4gICAgICAgICAgdGVzdEFjdGlvbkNvbnRhY3RSZXF1ZXN0W1wiZW50aXR5XCJdID1cbiAgICAgICAgICAgIGZvcm1Db250ZXh0LmRhdGEuZW50aXR5LmdldEVudGl0eVJlZmVyZW5jZSgpO1xuICAgICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IFhybS5XZWJBcGkub25saW5lXG4gICAgICAgICAgICAuZXhlY3V0ZSh0ZXN0QWN0aW9uQ29udGFjdFJlcXVlc3QpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigocmVzcG9uc2VCb2R5KSA9PiByZXNwb25zZUJvZHkpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcblxuICAgICAgICAgIC8vQkVUVEVSIFdBWVxuICAgICAgICAgIGxldCByZXNwb25zZTIgPSBhd2FpdCBYcm1FeC5leGVjdXRlQWN0aW9uKFxuICAgICAgICAgICAgXCJ0aGVpYV9UZXN0QWN0aW9uQ29udGFjdFwiLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICB7IE5hbWU6IFwiQW1vdW50XCIsIFR5cGU6IFwiSW50ZWdlclwiLCBWYWx1ZTogNSB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgTmFtZTogXCJBY2NvdW50XCIsXG4gICAgICAgICAgICAgICAgVHlwZTogXCJFbnRpdHlSZWZlcmVuY2VcIixcbiAgICAgICAgICAgICAgICBWYWx1ZTogZmllbGRzLkN1c3RvbWVyLlZhbHVlWzBdLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFhybUV4LkZvcm0uZW50aXR5UmVmZXJlbmNlXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZTIpO1xuXG4gICAgICAgICAgLy9SZXRyaWV2ZSBFbnZpcm9ubWVudFZhcmlhYmxlVmFsdWVcbiAgICAgICAgICBjbGFzcyBFbnZpcm9ubWVudFZhcmlhYmxlUmVxdWVzdCB7XG4gICAgICAgICAgICBEZWZpbml0aW9uU2NoZW1hTmFtZTogc3RyaW5nO1xuICAgICAgICAgICAgY29uc3RydWN0b3IoZGVmaW5pdGlvblNjaGVtYU5hbWU6IHN0cmluZykge1xuICAgICAgICAgICAgICB0aGlzLkRlZmluaXRpb25TY2hlbWFOYW1lID0gZGVmaW5pdGlvblNjaGVtYU5hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnZXRNZXRhZGF0YSgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBib3VuZFBhcmFtZXRlcjogbnVsbCxcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25UeXBlOiAxLFxuICAgICAgICAgICAgICAgIG9wZXJhdGlvbk5hbWU6IFwiUmV0cmlldmVFbnZpcm9ubWVudFZhcmlhYmxlVmFsdWVcIixcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJUeXBlczoge1xuICAgICAgICAgICAgICAgICAgRGVmaW5pdGlvblNjaGVtYU5hbWU6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZU5hbWU6IFwiRWRtLlN0cmluZ1wiLFxuICAgICAgICAgICAgICAgICAgICBzdHJ1Y3R1cmFsUHJvcGVydHk6IDEsXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCBlbnZpcm9ubWVudFZhcmlhYmxlUmVxdWVzdCA9IG5ldyBFbnZpcm9ubWVudFZhcmlhYmxlUmVxdWVzdChcbiAgICAgICAgICAgIFwidGhlaWFfVGVzdFwiXG4gICAgICAgICAgKTtcbiAgICAgICAgICBsZXQgdmFsdWUgPSBhd2FpdCBYcm0uV2ViQXBpLm9ubGluZVxuICAgICAgICAgICAgLmV4ZWN1dGUoZW52aXJvbm1lbnRWYXJpYWJsZVJlcXVlc3QpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigocmVzcG9uc2VCb2R5KSA9PiByZXNwb25zZUJvZHkpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKHZhbHVlKTtcbiAgICAgICAgICAvL0JFVFRFUiBXQVlcbiAgICAgICAgICBsZXQgdmFsdWUyID0gYXdhaXQgWHJtRXguZ2V0RW52aXJvbm1lbnRWYXJpYWJsZVZhbHVlKFwidGhlaWFfVGVzdFwiKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyh2YWx1ZTIpO1xuXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogSG93IHRvIGFjY2VzcyBQcm9wb2VydGllcyBkZXNjcmliZWQgaW4gTWljcm9zb2Z0cyBEb2N1bWVudGF0aW9uXG4gICAgICAgICAgICovXG4gICAgICAgICAgLyoqIFlvdSBjYW4gYWNjZXNzIGFsbCBGb3JtIENvbnRleHQgRnVuY3Rpb25zIGhlcmU6IEBzZWUgaHR0cHM6Ly9kb2NzLm1pY3Jvc29mdC5jb20vZW4tdXMvcG93ZXItYXBwcy9kZXZlbG9wZXIvbW9kZWwtZHJpdmVuLWFwcHMvY2xpZW50YXBpL2NsaWVudGFwaS1mb3JtLWNvbnRleHQqL1xuICAgICAgICAgIFhybUV4LkZvcm0uZm9ybUNvbnRleHQuZGF0YS5pc1ZhbGlkKCk7XG5cbiAgICAgICAgICAvKiogWW91IGNhbiBhY2Nlc3MgYWxsIENvbHVtbiBGdW5jdGlvbnMgaGVyZTogQHNlZSBodHRwczovL2RvY3MubWljcm9zb2Z0LmNvbS9lbi11cy9wb3dlci1hcHBzL2RldmVsb3Blci9tb2RlbC1kcml2ZW4tYXBwcy9jbGllbnRhcGkvcmVmZXJlbmNlL2F0dHJpYnV0ZXMqL1xuICAgICAgICAgIGZpZWxkcy5CaXJ0aGRheS5BdHRyaWJ1dGUuZ2V0SXNEaXJ0eSgpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgLiR7WHJtRXguZ2V0TWV0aG9kTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==