![NPM](https://img.shields.io/npm/l/xrm-ex)
![NPM](https://img.shields.io/npm/v/xrm-ex)
![GitHub Workflow Status](https://github.com/AhashSritharan/Xrm-Ex/actions/workflows/XrmEx.yml/badge.svg?branch%253Dmain)

[![NPM](https://nodei.co/npm/xrm-ex.png)](https://nodei.co/npm/xrm-ex/)

# Xrm-Ex: Dynamics 365 Xrm Extensions

A robust framework tailored for Dynamics 365 Client API. While crafted with TypeScript principles in mind, it's essential to understand that XrmEx is primarily designed for **JavaScript** usage. Our primary goal is to simplify the interaction with the formContext and the Xrm Object. By doing so, we aim to reduce the code you pen down, ensuring your codebase remains maintainable and less prone to errors.

XrmEx offers a comprehensive suite of wrappers that seamlessly integrate the Dynamics 365 Client API, ensuring developers have a smooth experience. Dive into XrmEx and elevate your productivity, channeling your energy into crafting exceptional applications.

## Installation
XrmEx can be easily installed via npm:
```shell
npm install xrm-ex
```

## Documentation
For a comprehensive guide to using XrmEx, please check out the full [documentation](https://xrm-ex.ahash.dev/modules/src_XrmEx.XrmEx.html).

## Getting Started
### Set up Project
https://github.com/AhashSritharan/Xrm-Ex/assets/63707488/750cd578-e174-43b0-8783-149599db3da5

### Deployment
https://github.com/AhashSritharan/Xrm-Ex/assets/63707488/34e2642d-0d73-4964-a5c5-6c035a474773

To get started with XrmEx, use the Template below. Add XrmEx.js from your node_modules to your Dynamics 365 form as a library. Execute the method `YourNamespace.ContactFunctions.OnLoad` in your form and pass the executionContext to that function.
Happy coding!

> **Note:** Although built with TypeScript, this library is distributed as compiled javascript and its TypeScript declaration. This means it can be used in any **javascript** file by just referencing the `XrmEx.d.ts` file. For it to work, you have to add the `XrmEx.js` file to the Form in Dynamics 365.

Use the following Starter Template for your JavaScript:
```js
/// <reference path="node_modules/xrm-ex/src/XrmEx.d.ts" />
var YourNamespace = YourNamespace || {};
YourNamespace.Contact = YourNamespace.Contact || {};
(function (Self) { //Only properties assigned to the Self object will be exposed to the global scope
    class Fields {
        Firstname = new XrmEx.Class.TextField("firstname");
        Customer = new XrmEx.Class.LookupField("parentcustomerid");
        DoNotEmail = new XrmEx.Class.BooleanField("donotemail");
        Birthday = new XrmEx.Class.DateField("birthdate");
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
    /**@type {Xrm.FormContext}*/ var formContext;
    /**@type {Fields}*/ var fields;
    /**@type {Tabs}*/ var tabs;
    /**@type {Grids}*/ var grids;

    /**
     * @param {Xrm.FormContext | Xrm.Events.EventContext} executionContext 
     */
    Self.OnLoad = async function OnLoad(executionContext) {
        await Init(executionContext); //Ensures XrmEx is only accessed after the OnLoad Event
        try {
            fields.Firstname.Value = "Joe";
            fields.Firstname.setVisible(true).setDisabled(true).setRequired(false);
            await XrmEx.openAlertDialog("Success", "Xrm works.");
        } catch (error) {
            console.error(error);
            await XrmEx.openAlertDialog("Error", `Error in ${XrmEx.getFunctionName()}\n` + error.message);
        }
    };
    /**
     * @param {Xrm.FormContext | Xrm.Events.EventContext} executionContext 
     */
    async function Init(executionContext) {
        if (!XrmEx) {
            let errorMessage = "XrmEx is not loaded. Please make sure you have XrmEx.js loaded in your form.";
            console.error(errorMessage);
            await Xrm.Navigation.openAlertDialog({ title: "Error", text: errorMessage, });
            return;
        }
        XrmEx.Form.executionContext = executionContext;
        formContext = XrmEx.Form.formContext;
        fields = new Fields();
        tabs = new Tabs();
        grids = new Grids();
        parent.window.XrmEx = XrmEx;
    }

})(YourNamespace.Contact);
```

## Contribution Guidelines

We welcome contributions from the community! If you're interested in contributing, please follow these steps:

1.  Fork the repository
2.  Create a new branch for your changes
3.  Make your changes
4.  Submit a pull request

For more information, please see our [contribution guide](https://github.com/AhashSritharan/Xrm-Ex/blob/main/CONTRIBUTING.md).

XrmEx is released as an open-source project. We welcome contributions from the developer community. Whether it's a bug report, new feature, or a correction, we greatly appreciate any help you can provide.

Leverage the power of Dynamics 365 Client API with less code and fewer errors. Get started with XrmEx today!

Why Use the XrmEx Library?
==========================

When developing for Dynamics 365, efficiency, clarity, and maintainability are paramount. The XrmEx library is designed to streamline your coding experience, making it more intuitive and less error-prone. Let's delve into some examples to illustrate the transformative power of XrmEx:


1\. Event Handling
------------------

### Without XrmEx:

```js
formContext.data.entity.addOnSave(sample);
```
### With XrmEx:

```js
XrmEx.Form.addOnSave([sample]);
```
The XrmEx approach is more concise and offers a clearer intent, especially when registering multiple functions.

2\. Field Changes and Events
----------------------------

### Without XrmEx:

```js
let firstname = formContext.getAttribute("firstname");
let lastname = formContext.getAttribute("lastname");
firstname.addOnChange(sample);
firstname.fireOnChange();
lastname.fireOnChange();
```
### With XrmEx:

```js
XrmEx.Form.addOnChange(
  [fields.Firstname, fields.Lastname],
  [sample],
  true //fireOnChange
);
```
With XrmEx, you can handle multiple fields and events in a single line, making the code cleaner and more maintainable.

3\. Form Types and Field Requirements
-------------------------------------

### Without XrmEx:

```js
if (formContext.ui.getFormType() != 2) return;
let firstname = formContext.getAttribute("firstname");
if (!firstname.getValue()) {
    firstname.setRequiredLevel("required");
    firstname.controls.forEach((c) =>
      c.setNotification("This property is required", "uniqueId")
    );
}
```
### With XrmEx:

```js
if (XrmEx.Form.IsNotUpdate) return;
if (!fields.Firstname.Value)
    fields.Firstname.setRequired(true).setNotification(
      "This property is required","uniqueId");
```
XrmEx provides intuitive methods that simplify common tasks, like checking form types or setting field requirements. You don't have to use the redundant `forEach` anymore.

4\. Data Retrieval and Setting
------------------------------

### Without XrmEx:

```js
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
```
### With XrmEx:

```js
if (fields.Owner.Value && !fields.Lastname.Value) {
    let user = await fields.Owner.retrieve("?$select=lastname");//Returns null if empty
    fields.Lastname.Value = user.lastname;
    fields.Lastname.setValue(user.lastname);
}
```
XrmEx abstracts away the complexities of data retrieval, making it more straightforward and readable.

5\. Alert Dialogs in Dynamics 365
-----------------------------

### Without XrmEx:

```js
await Xrm.Navigation.openAlertDialog({ text: `Error in ${XrmEx.getFunctionName()}\n` + error.message, title: "Error" }, { height: 120, width: 260 });
```

This method requires manual sizing and is more verbose, making it less efficient for dynamic content.

### With XrmEx:
```js
await XrmEx.openAlertDialog("Error", `Error in ${XrmEx.getFunctionName()}\n` + error.message);
```

The XrmEx approach **automatically sizes the dialog based on content** to avoid scrolling, offering a simplified and concise method.

Advanced Features
-----------------

### 1\. Lookup Filters

#### Without XrmEx:

```js
let filterFunction = function filterFunction(executionContext) {
    let formContext = executionContext.getFormContext();
    let customer = formContext.getAttribute("parentcustomerid");
    customer.controls.forEach((c) => {
        c.addCustomFilter(
            `<filter>
                <condition attribute="lastname" operator="like" value="%Test%" />
            </filter>`
        );
    });
};
let customer = formContext.getAttribute("parentcustomerid");
customer.controls.forEach((c) => c.addPreSearch(filterFunction));
customer.controls.forEach((c) => c.removePreSearch(filterFunction));
```
#### With XrmEx:

```js
fields.Customer.addPreFilterToLookup(
    `<filter>
        <condition attribute="lastname" operator="like" value="%Test%" />
    </filter>`
);
fields.Customer.clearPreFilterFromLookup(); //Removes all filter added with addPreFilterToLookup or addPreFilterToLookupAdvanced
```
### 2\. Advanced Lookup Filter

#### Special with XrmEx: Supports entire FetchXml including Link-Entity!

```js
await fields.Customer.addPreFilterToLookupAdvanced(
    "contact",//entityname
    "contactid",//entity unique identifier name
    `<fetch>
        <entity name="contact">
            <filter>
                <condition attribute="lastname" operator="like" value="%Test%" />
            </filter>
            <link-entity name="account" from="accountid" to="parentcustomerid">
                <filter>
                        <condition attribute="address1_country" operator="eq" value="Switzerland" />
                </filter>
            </link-entity>
        </entity>
    </fetch>`
);
```
### 3\. Execute Bound Action

#### Without XrmEx:

```js
class TestActionContactRequest {
Amount: 0;
Account: null;
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
let response = await Xrm.WebApi.online.execute(testActionContactRequest)
    .then(function (response) {
        if (response.ok) {
            return response.json().catch(() => {
                return response;
            });
        }
    })
    .then((responseBody) => responseBody);
console.log(response);
```
#### With XrmEx:

```js
let response2 = await XrmEx.executeAction(
    "theia_TestActionContact",{
        Amount: 5,
        Account: fields.Customer.Value[0]
    },
    XrmEx.Form.entityReference
);
console.log(response2);
```
### 4\. Retrieve EnvironmentVariableValue

#### Without XrmEx:

```js
class EnvironmentVariableRequest {
DefinitionSchemaName: "";
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
let value = await Xrm.WebApi.online.execute(environmentVariableRequest)
    .then(function (response) {
        if (response.ok) {
            return response.json().catch(() => {
                return response;
            });
        }
    })
    .then((responseBody) => responseBody);
console.log(value);
```
#### With XrmEx:

```js
let value2 = await XrmEx.getEnvironmentVariableValue("theia_Test");
console.log(value2);
```
**In Conclusion:** The advanced features of the XrmEx library further exemplify its power in simplifying and enhancing the Dynamics 365 development experience. By abstracting away the complexities, developers can focus on the core logic and functionality of their applications.
