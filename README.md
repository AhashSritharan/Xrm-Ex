# Xrm-Ex: Dynamics 365 Xrm Extensions

![NPM](https://img.shields.io/npm/l/xrm-ex)
![NPM](https://img.shields.io/npm/v/xrm-ex)
![GitHub Workflow Status](https://github.com/AhashSritharan/Xrm-Ex/actions/workflows/XrmEx.yml/badge.svg?branch%253Dmain)
![GitHub Workflow Status](https://github.com/AhashSritharan/Xrm-Ex/actions/workflows/playwright.yml/badge.svg?branch%253Dmain)

A robust framework tailored for Dynamics 365 Client API. While crafted with TypeScript principles in mind, it's essential to understand that XrmEx is primarily designed for **JavaScript** usage. Our primary goal is to simplify the interaction with the formContext and the Xrm Object. By doing so, we aim to reduce the code you pen down, ensuring your codebase remains maintainable and less prone to errors.

XrmEx offers a comprehensive suite of wrappers that seamlessly integrate the Dynamics 365 Client API, ensuring developers have a smooth experience. Dive into XrmEx and elevate your productivity, channeling your energy into crafting exceptional applications.

- [Xrm-Ex: Dynamics 365 Xrm Extensions](#xrm-ex-dynamics-365-xrm-extensions)
  - [Installation](#installation)
  - [Getting Started](#getting-started)
  - [Documentation](#documentation)
  - [Contribution Guidelines](#contribution-guidelines)
- [Why Use the XrmEx Library?](#why-use-the-xrmex-library)
  - [1. Event Handling](#1-event-handling)
    - [Without XrmEx:](#without-xrmex)
    - [With XrmEx:](#with-xrmex)
  - [2. Field Changes and Events](#2-field-changes-and-events)
    - [Without XrmEx:](#without-xrmex-1)
    - [With XrmEx:](#with-xrmex-1)
  - [3. Form Types and Field Requirements](#3-form-types-and-field-requirements)
    - [Without XrmEx:](#without-xrmex-2)
    - [With XrmEx:](#with-xrmex-2)
  - [4. Data Retrieval and Setting](#4-data-retrieval-and-setting)
    - [Without XrmEx:](#without-xrmex-3)
    - [With XrmEx:](#with-xrmex-3)
  - [5. Alert Dialogs in Dynamics 365](#5-alert-dialogs-in-dynamics-365)
    - [Without XrmEx:](#without-xrmex-4)
    - [With XrmEx:](#with-xrmex-4)
  - [Advanced Features](#advanced-features)
    - [1. Lookup Filters](#1-lookup-filters)
      - [Without XrmEx:](#without-xrmex-5)
      - [With XrmEx:](#with-xrmex-5)
    - [2. Advanced Lookup Filter](#2-advanced-lookup-filter)
      - [Special with XrmEx: Supports entire FetchXml including Link-Entity!](#special-with-xrmex-supports-entire-fetchxml-including-link-entity)
    - [3. Execute Bound Action](#3-execute-bound-action)
      - [Without XrmEx:](#without-xrmex-6)
      - [With XrmEx:](#with-xrmex-6)
    - [4. Retrieve EnvironmentVariableValue](#4-retrieve-environmentvariablevalue)
      - [Without XrmEx:](#without-xrmex-7)
      - [With XrmEx:](#with-xrmex-7)


## Installation
XrmEx can be easily installed via npm:
```shell
npm install xrm-ex
```

## Getting Started
To get started with XrmEx, use the Template below. Add XrmEx.js from your node_modules to your Dynamics 365 form as a library. Execute the method `YourNamespace.ContactFunctions.OnLoad` in your form and pass the executionContext to that function.
Happy coding!

> **Note:** Although built with TypeScript, this library is distributed as compiled javascript and its TypeScript declaration. This means it can be used in any **javascript** file by just referencing the `XrmEx.d.ts` file. For it to work, you have to add the `XrmEx.js` file to the Form in Dynamics 365.

Use the following Starter Template for your JavaScript:
```js
/// <reference path="node_modules/xrm-ex/src/XrmEx.d.ts" />
var YourNamespace = YourNamespace || {};
YourNamespace.ContactFunctions = {
    /**@type {Fields()}*/ fields: null,
    /**@type {Tabs()}*/ tabs: null,
    /**@type {Grids()}*/ grids: null,
    Fields: class Fields {
        Firstname = new XrmEx.TextField("firstname");
        Customer = new XrmEx.LookupField("parentcustomerid");
        DoNotEmail = new XrmEx.BooleanField("donotemail");
        Birthday = new XrmEx.DateField("birthdate");
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
    },
    Tabs: class Tabs {
        General = new XrmEx.Tab("tab1", {
            Section1: new XrmEx.Section("section1"),
            Section2: new XrmEx.Section("section2"),
        });
        Details = new XrmEx.Tab("tab2", {
            Section1: new XrmEx.Section("section1"),
            Section2: new XrmEx.Section("section2"),
        });
    },
    Grids: class Grids {
        ContactSubgrid = new XrmEx.GridControl("Test");
    },
    /**
     * @param {Xrm.FormContext | Xrm.Events.EventContext} executionContext 
     */
    OnLoad: async function OnLoad(executionContext) {
        await this.Init(executionContext); //Ensures XrmEx is only accessed after the OnLoad Event
        try {
            fields.Firstname.Value = "Joe";
            fields.Firstname.setVisible(false).setDisabled(false).setRequired(true);
        } catch (error) {
            console.error(error);
            await XrmEx.openAlertDialog("Error", `Error in ${XrmEx.getMethodName()}\n` + error.message);
        }
    },
    /**
     * @param {Xrm.FormContext | Xrm.Events.EventContext} executionContext 
     */
    Init: async function Init(executionContext) {
        if (!XrmEx) {
            let errorMessage = "XrmEx is not loaded. Please make sure you have XrmEx.js loaded in your form.";
            console.error(errorMessage);
            await Xrm.Navigation.openAlertDialog({ title: "Error", text: errorMessage, });
            return;
        }
        XrmEx.Form.formContext = executionContext;
        fields = new this.Fields();
        tabs = new this.Tabs();
        grids = new this.Grids();
    }
};
```
## Documentation
For a comprehensive guide to using XrmEx, please check out the full [documentation](https://github.com/AhashSritharan/Xrm-Ex/blob/main/docs/modules/XrmEx.md).

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
XrmEx.Form.addOnSaveEventHandler([sample]);
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
XrmEx.Form.addOnChangeEventHandler(
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
await Xrm.Navigation.openAlertDialog({ text: `Error in ${XrmEx.getMethodName()}\n` + error.message, title: "Error" }, { height: 120, width: 260 });
```

This method requires manual sizing and is more verbose, making it less efficient for dynamic content.

### With XrmEx:
```js
await XrmEx.openAlertDialog("Error", `Error in ${XrmEx.getMethodName()}\n` + error.message);
```

The XrmEx approach **automatically sizes the dialog based on content** to avoid scrolling, offering a simplified and concise method.

Advanced Features
-----------------

### 1\. Lookup Filters

#### Without XrmEx:

```js
let filterFunction = function filterFunction(executionContext: Xrm.Events.EventContext) {
    let formContext = executionContext.getFormContext();
    let customer: Xrm.Attributes.LookupAttribute = formContext.getAttribute("parentcustomerid");
    customer.controls.forEach((c) => {
        c.addCustomFilter(
            `<filter>
                <condition attribute="lastname" operator="like" value="%Test%" />
            </filter>`
        );
    });
};
let customer: Xrm.Attributes.LookupAttribute = formContext.getAttribute("parentcustomerid");
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