xrm-ex / [Exports](modules.md)

# Xrm-Ex: Dynamics 365 Xrm Extensions

![NPM](https://img.shields.io/npm/l/xrm-ex)
![NPM](https://img.shields.io/npm/v/xrm-ex)
![GitHub Workflow Status](https://github.com/AhashSritharan/Xrm-Ex/actions/workflows/XrmEx.yml/badge.svg?branch%253Dmain)
![GitHub Workflow Status](https://github.com/AhashSritharan/Xrm-Ex/actions/workflows/playwright.yml/badge.svg?branch%253Dmain)

Welcome to XrmEx, a powerful TypeScript framework designed for Dynamics 365 Client API. This library is intended to ease the usage of the formContext and the Xrm Object, reducing the amount of code you have to write, thus enhancing maintainability and minimizing errors.

With XrmEx, you'll find a set of intuitive and robust TypeScript wrappers that bring the power of Dynamics 365 Client API into the TypeScript ecosystem in a developer-friendly way. This library is designed to boost your productivity, allowing you to focus on what matters most: creating amazing applications.

## Installation
XrmEx can be easily installed via npm:
```shell
npm install xrm-ex
```

## Getting Started
To get started with XrmEx, you'll first need to reference the library in your TypeScript project and create an early bound fields Class.
Create a variable which is going to hold the instance of your fields Class.
Assign the executionContext OnLoad to XrmEx.Form.formContext and create a new instance of your fields class and you're good to go:

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
/**@type {Fields()}*/ var fields;
/**@type {Tabs()}*/ var tabs;
/**@type {Grids()}*/ var grids;
/**
 * @param {Xrm.Events.EventContext} executionContext 
 */
export async function OnLoad(executionContext) {
    fields = new Fields();
    XrmEx.Form.formContext = executionContext;

    if (Form.IsCreate) return;

    fields.Firstname.Value = "Joe";
    fields.Lastname.setVisible(false).setDisabled(false).setRequired(true);
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
