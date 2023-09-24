# Xrm-Ex: Dynamics 365 Xrm Extensions

![NPM](https://img.shields.io/npm/l/xrm-ex)
![NPM](https://img.shields.io/npm/v/xrm-ex)
![GitHub Workflow Status](https://github.com/AhashSritharan/Xrm-Ex/actions/workflows/XrmEx.yml/badge.svg?branch%253Dmain)
![GitHub Workflow Status](https://github.com/AhashSritharan/Xrm-Ex/actions/workflows/playwright.yml/badge.svg?branch%253Dmain)

A robust framework tailored for Dynamics 365 Client API. While crafted with TypeScript principles in mind, it's essential to understand that XrmEx is primarily designed for **JavaScript** usage. Our primary goal is to simplify the interaction with the formContext and the Xrm Object. By doing so, we aim to reduce the code you pen down, ensuring your codebase remains maintainable and less prone to errors.

XrmEx offers a comprehensive suite of wrappers that seamlessly integrate the Dynamics 365 Client API, ensuring developers have a smooth experience. Dive into XrmEx and elevate your productivity, channeling your energy into crafting exceptional applications.

## Installation
XrmEx can be easily installed via npm:
```shell
npm install xrm-ex
```

## Getting Started
To get started with XrmEx, you'll first need to reference the library in your **JavaScript** project and create an early bound fields Class. Create a variable which is going to hold the instance of your fields Class. Assign the executionContext OnLoad to XrmEx.Form.formContext and create a new instance of your fields class and you're good to go:

> **Note:** Although built with TypeScript, this library is distributed as compiled javascript and its TypeScript declaration. This means it can be used in any **javascript** file by just referencing the `XrmEx.d.ts` file. For it to work, you have to add the `XrmEx.js` file to the Form in Dynamics 365.

Use the following Starter Template for your JavaScript:
```js
/// <reference path="node_modules/xrm-ex/src/XrmEx.d.ts" />
class Fields {
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
/**
 * @param {Xrm.FormContext | Xrm.Events.EventContext} executionContext 
 */
export async function Init(executionContext) {
    if (!XrmEx) {
        let errorMessage = "XrmEx is not loaded. Please make sure you have XrmEx.js loaded in your form.";
        console.error(errorMessage);
        await Xrm.Navigation.openAlertDialog({ title: "Error", text: errorMessage, });
        return;
    }
    XrmEx.Form.formContext = executionContext;
    fields = new Fields();
    tabs = new Tabs();
    grids = new Grids();
}
/**@type {Fields()}*/ var fields;
/**@type {Tabs()}*/ var tabs;
/**@type {Grids()}*/ var grids;
/**
 * @param {Xrm.FormContext | Xrm.Events.EventContext} executionContext 
 */
export async function OnLoad(executionContext) {
    await Init(executionContext); //Ensures XrmEx is available by only accessing it after the OnLoad Event
    try {
        fields.Firstname.Value = "Joe";
        fields.Firstname.setVisible(false).setDisabled(false).setRequired(true);
    } catch (error) {
        console.error(error);
        await XrmEx.openAlertDialog("Error", `Error in ${XrmEx.getMethodName()}\n` + error.message);
    }
}
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