/// <reference path="../node_modules/@types/xrm/index.d.ts" />
var XrmEx;
(function (XrmEx) {
    /**
     * Throws an error with the given error message.
     * @param {string} errorMessage - The error message to throw.
     * @throws {Error} - Always throws an error with the given error message.
     */
    function throwError(errorMessage) {
        throw new Error(errorMessage);
    }
    XrmEx.throwError = throwError;
    /**
     * Returns the name of the calling function.
     * @returns {string} - The name of the calling function.
     */
    function getMethodName() {
        try {
            const error = new Error();
            const stackTrace = error.stack?.split("\n").map((line) => line.trim());
            const callingFunctionLine = stackTrace && stackTrace.length >= 3 ? stackTrace[2] : undefined;
            const functionNameMatch = callingFunctionLine?.match(/at\s+([^\s]+)\s+\(/);
            const functionName = functionNameMatch ? functionNameMatch[1] : "";
            return functionName;
        }
        catch (error) {
            throw new Error(`XrmEx.getMethodName:\n${error.message}`);
        }
    }
    XrmEx.getMethodName = getMethodName;
    /**
     * Displays a notification for an app with the given message and level, and lets you specify whether to show a close button.
     * @param {string} message - The message to display in the notification.
     * @param {'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO'} level - The level of the notification. Can be 'SUCCESS', 'ERROR', 'WARNING', or 'INFO'.
     * @param {boolean} [showCloseButton=false] - Whether to show a close button on the notification. Defaults to false.
     * @returns {Promise<string>} - A promise that resolves with the ID of the created notification.
     */
    async function addGlobalNotification(message, level, showCloseButton = false) {
        const levelMap = {
            SUCCESS: 1,
            ERROR: 2,
            WARNING: 3,
            INFO: 4,
        };
        const messageLevel = levelMap[level] || levelMap.INFO;
        const notification = {
            type: 2,
            level: messageLevel,
            message,
            showCloseButton,
        };
        try {
            return await Xrm.App.addGlobalNotification(notification);
        }
        catch (error) {
            throw new Error(`XrmEx.${getMethodName()}:\n${error.message}`);
        }
    }
    XrmEx.addGlobalNotification = addGlobalNotification;
    /**
     * Clears a notification in the app with the given unique ID.
     * @param {string} uniqueId - The unique ID of the notification to clear.
     * @returns {Promise<string>} - A promise that resolves when the notification has been cleared.
     */
    async function removeGlobalNotification(uniqueId) {
        try {
            return await Xrm.App.clearGlobalNotification(uniqueId);
        }
        catch (error) {
            throw new Error(`XrmEx.${getMethodName()}:\n${error.message}`);
        }
    }
    XrmEx.removeGlobalNotification = removeGlobalNotification;
    /**
     * Retrieves the value of an environment variable by using its schema name as key.
     * @param {string} environmentVariableSchemaName - The schema name of the environment variable to retrieve.
     * @returns {Promise<string>} - A promise that resolves with the value of the environment variable.
     */
    async function getEnvironmentVariableValue(environmentVariableSchemaName) {
        return executeFunction("RetrieveEnvironmentVariableValue", [
            {
                Name: "DefinitionSchemaName",
                Type: "String",
                Value: environmentVariableSchemaName,
            },
        ]);
    }
    XrmEx.getEnvironmentVariableValue = getEnvironmentVariableValue;
    /**
     * A map of CRM data types to their corresponding type names, structural properties, and JavaScript types.
     * @type {Object.<string, { typeName: string, structuralProperty: number, jsType: string }>}
     */
    let typeMap = {
        String: { typeName: "Edm.String", structuralProperty: 1, jsType: "string" },
        Integer: { typeName: "Edm.Int32", structuralProperty: 1, jsType: "number" },
        Boolean: {
            typeName: "Edm.Boolean",
            structuralProperty: 1,
            jsType: "boolean",
        },
        DateTime: {
            typeName: "Edm.DateTimeOffset",
            structuralProperty: 1,
            jsType: "object",
        },
        EntityReference: {
            typeName: "mscrm.crmbaseentity",
            structuralProperty: 5,
            jsType: "object",
        },
        Decimal: {
            typeName: "Edm.Decimal",
            structuralProperty: 1,
            jsType: "number",
        },
        Entity: {
            typeName: "mscrm.crmbaseentity",
            structuralProperty: 5,
            jsType: "object",
        },
        EntityCollection: {
            typeName: "Collection(mscrm.crmbaseentity)",
            structuralProperty: 4,
            jsType: "object",
        },
        Float: { typeName: "Edm.Double", structuralProperty: 1, jsType: "number" },
        Money: { typeName: "Edm.Decimal", structuralProperty: 1, jsType: "number" },
        Picklist: {
            typeName: "Edm.Int32",
            structuralProperty: 1,
            jsType: "number",
        },
    };
    /**
     * Checks if the given request parameter is of a supported type and has a valid value.
     * @param {RequestParameter} requestParameter - The request parameter to check.
     * @returns {void}
     * @throws {Error} - Throws an error if the request parameter is not of a supported type or has an invalid value.
     */
    function checkRequestParameterType(requestParameter) {
        if (!typeMap[requestParameter.Type])
            throw new Error(`The property type ${requestParameter.Type} of the property ${requestParameter.Name} is not supported.`);
        const expectedType = typeMap[requestParameter.Type].jsType;
        const actualType = typeof requestParameter.Value;
        const invalidTypeMessage = `The value ${requestParameter.Value}\nof the property ${requestParameter.Name}\nis not of the expected type ${requestParameter.Type}.`;
        if (requestParameter.Type === "EntityReference" ||
            requestParameter.Type === "Entity") {
            if (!requestParameter.Value ||
                !requestParameter.Value.hasOwnProperty("id") ||
                !requestParameter.Value.hasOwnProperty("entityType")) {
                throw new Error(invalidTypeMessage);
            }
            typeMap[requestParameter.Type].typeName = `mscrm.${requestParameter.Value.entityType}`;
        }
        else if (requestParameter.Type === "EntityCollection") {
            if (!Array.isArray(requestParameter.Value) ||
                requestParameter.Value.every((v) => typeof v !== "object" ||
                    !v ||
                    !v.hasOwnProperty("id") ||
                    !v.hasOwnProperty("entityType"))) {
                throw new Error(invalidTypeMessage);
            }
        }
        else if (requestParameter.Type === "DateTime") {
            if (!(requestParameter.Value instanceof Date)) {
                throw new Error(invalidTypeMessage);
            }
        }
        else {
            if (actualType !== expectedType) {
                throw new Error(invalidTypeMessage);
            }
        }
    }
    XrmEx.checkRequestParameterType = checkRequestParameterType;
    /**
     * Executes an Action.
     * @param {string} actionName - The unique name of the action.
     * @param {RequestParameter[]} requestParameters - An array of objects with the parameter name, type and value.
     * @param {EntityReference} [boundEntity] - An optional EntityReference of the bound entity.
     * @returns {Promise<any>} - A Promise with the request response.
     * @throws {Error} - Throws an error if the request parameter is not of a supported type or has an invalid value.
     */
    async function executeAction(actionName, requestParameters, boundEntity) {
        const parameterDefinition = {};
        if (boundEntity)
            requestParameters.push({
                Name: "entity",
                Value: boundEntity,
                Type: "EntityReference",
            });
        for (const requestParameter of requestParameters) {
            checkRequestParameterType(requestParameter);
            parameterDefinition[requestParameter.Name] = {
                typeName: typeMap[requestParameter.Type].typeName,
                structuralProperty: typeMap[requestParameter.Type].structuralProperty,
            };
        }
        const req = Object.assign({
            getMetadata: () => ({
                boundParameter: boundEntity ? "entity" : null,
                operationType: 0,
                operationName: actionName,
                parameterTypes: parameterDefinition,
            }),
        }, ...requestParameters.map((p) => ({ [p.Name]: p.Value })));
        const response = await Xrm.WebApi.online.execute(req);
        if (response.ok)
            return response.json().catch(() => response);
    }
    XrmEx.executeAction = executeAction;
    /**
     * Executes a Function.
     * @param {string} functionName - The unique name of the function.
     * @param {RequestParameter[]} requestParameters - An array of objects with the parameter name, type and value.
     * @param {EntityReference} [boundEntity] - An optional EntityReference of the bound entity.
     * @returns {Promise<any>} - A Promise with the request response.
     * @throws {Error} - Throws an error if the request parameter is not of a supported type or has an invalid value.
     */
    async function executeFunction(functionName, requestParameters, boundEntity) {
        const parameterDefinition = {};
        if (boundEntity)
            requestParameters.push({
                Name: "entity",
                Value: boundEntity,
                Type: "EntityReference",
            });
        for (const requestParameter of requestParameters) {
            checkRequestParameterType(requestParameter);
            parameterDefinition[requestParameter.Name] = {
                typeName: typeMap[requestParameter.Type].typeName,
                structuralProperty: typeMap[requestParameter.Type].structuralProperty,
            };
        }
        const req = Object.assign({
            getMetadata: () => ({
                boundParameter: boundEntity ? "entity" : null,
                operationType: 1,
                operationName: functionName,
                parameterTypes: parameterDefinition,
            }),
        }, ...requestParameters.map((p) => ({ [p.Name]: p.Value })));
        const response = await Xrm.WebApi.online.execute(req);
        if (response.ok)
            return response.json().catch(() => response);
    }
    XrmEx.executeFunction = executeFunction;
    /**
     * Makes a GUID lowercase and removes brackets.
     * @param {string} guid - The GUID to normalize.
     * @returns {string} - The normalized GUID.
     */
    function normalizeGuid(guid) {
        if (typeof guid !== "string")
            throw new Error(`XrmEx.normalizeGuid:\n'${guid}' is not a string`);
        return guid.toLowerCase().replace(/[{}]/g, "");
    }
    XrmEx.normalizeGuid = normalizeGuid;
    /**
     * Opens a dialog with dynamic height and width based on text content.
     * @param {string} title - The title of the dialog.
     * @param {string} text - The text content of the dialog.
     * @returns {Promise<any>} - A Promise with the dialog response.
     */
    async function openAlertDialog(title, text) {
        try {
            const rows = text.split(/\r\n|\r|\n/);
            let additionalRows = 0;
            rows.forEach((row) => {
                let width = getTextWidth(row, "1rem Segoe UI Regular, SegoeUI, Segoe UI");
                if (width > 940) {
                    additionalRows += width / 940;
                }
            });
            const longestRow = rows.reduce((acc, row) => (row.length > acc.length ? row : acc), "");
            const width = Math.min(getTextWidth(longestRow, "1rem Segoe UI Regular, SegoeUI, Segoe UI"), 1000);
            const height = 109 + (rows.length + additionalRows) * 20;
            return await Xrm.Navigation.openAlertDialog({
                confirmButtonLabel: "Ok",
                text,
                title,
            }, {
                height,
                width,
            });
        }
        catch (error) {
            console.error(error.message);
            throw new Error(`XrmEx.${getMethodName()}:\n${error.message}`);
        }
        /**
         * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
         *
         * @param {String} text The text to be rendered.
         * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
         *
         * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
         */
        function getTextWidth(text, font) {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            context.font = font;
            const metrics = context.measureText(text);
            return metrics.width;
        }
    }
    XrmEx.openAlertDialog = openAlertDialog;
    /**
     * Represents a form in Dynamics 365.
     */
    class Form {
        static _formContext;
        static _executionContext;
        constructor() { }
        /**Gets a reference to the current form context*/
        static get formContext() {
            return this._formContext;
        }
        /**Gets a reference to the current executio context*/
        static get executionContext() {
            return this._executionContext;
        }
        /**Gets a lookup value that references the record.*/
        static get entityReference() {
            return Form.formContext.data.entity.getEntityReference();
        }
        /**Sets a reference to the current form context*/
        static set formContext(context) {
            if ("getFormContext" in context) {
                this._executionContext = context;
                this._formContext = context.getFormContext();
            }
            else if ("data" in context)
                this._formContext = context;
            else
                throw new Error(`XrmEx.Form.setFormContext: The executionContext or formContext was not passed to the function.`);
        }
        /**Sets a reference to the current execution context*/
        static set executionContext(context) {
            if ("getFormContext" in context) {
                this._executionContext = context;
                this._formContext = context.getFormContext();
            }
            else if ("data" in context)
                this._formContext = context;
            else
                throw new Error(`XrmEx.Form.setExecutionContext: The executionContext or formContext was not passed to the function.`);
        }
        /**Returns true if form is from type create*/
        static get IsCreate() {
            return Form.formContext.ui.getFormType() == 1;
        }
        /**Returns true if form is from type update*/
        static get IsUpdate() {
            return Form.formContext.ui.getFormType() == 2;
        }
        /**Returns true if form is not from type create*/
        static get IsNotCreate() {
            return Form.formContext.ui.getFormType() != 1;
        }
        /**Returns true if form is not from type update*/
        static get IsNotUpdate() {
            return Form.formContext.ui.getFormType() != 2;
        }
        /**
         * Displays a form level notification. Any number of notifications can be displayed and will remain until removed using clearFormNotification.
         * The height of the notification area is limited so each new message will be added to the top.
         * @param message The text of the notification message.
         * @param level The level of the notification which defines how the message will be displayed, such as the icon.
         * ERROR: Notification will use the system error icon.
         * WARNING: Notification will use the system warning icon.
         * INFO: Notification will use the system info icon.
         * @param uniqueId Unique identifier for the notification which is used with clearFormNotification to remove the notification.
         * @returns true if it succeeds, otherwise false.
         */
        static addFormNotification(message, level, uniqueId) {
            try {
                return Form.formContext.ui.setFormNotification(message, level, uniqueId);
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getMethodName()}:\n${error.message}`);
            }
        }
        /**
         * Clears the form notification described by uniqueId.
         * @param uniqueId Unique identifier.
         * @returns True if it succeeds, otherwise false.
         */
        static removeFormNotification(uniqueId) {
            try {
                return Form.formContext.ui.clearFormNotification(uniqueId);
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getMethodName()}:\n${error.message}`);
            }
        }
        /**
         * Adds a handler to be called when the record is saved.
         */
        static addOnSaveEventHandler(handlers) {
            try {
                if (!Array.isArray(handlers)) {
                    handlers = [handlers];
                }
                handlers.forEach((handler) => {
                    if (typeof handler !== "function") {
                        throw new Error(`'${handler}' is not a function`);
                    }
                    Form.formContext.data.entity.addOnSave(handler);
                });
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getMethodName()}:\n${error.message}`);
            }
        }
        /**
         * Adds a function to be called after the OnSave is complete.
         * @param handler The handler.
         * @remarks Added in 9.2
         * @see {@link https://docs.microsoft.com/en-us/powerapps/developer/model-driven-apps/clientapi/reference/events/postsave External Link: PostSave Event Documentation}
         */
        static addOnPostSaveEventHandler(handlers) {
            try {
                if (!Array.isArray(handlers)) {
                    handlers = [handlers];
                }
                handlers.forEach((handler) => {
                    if (typeof handler !== "function") {
                        throw new Error(`'${handler}' is not a function`);
                    }
                    Form.formContext.data.entity.addOnPostSave(handler);
                });
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getMethodName()}:\n${error.message}`);
            }
        }
        /**
         * Adds a function to be called when form data is loaded.
         * @param handler The function to be executed when the form data loads. The function will be added to the bottom of the event handler pipeline.
         */
        static addOnLoadEventHandler(handlers) {
            try {
                if (!Array.isArray(handlers)) {
                    handlers = [handlers];
                }
                handlers.forEach((handler) => {
                    if (typeof handler !== "function") {
                        throw new Error(`'${handler}' is not a function`);
                    }
                    Form.formContext.data.addOnLoad(handler);
                });
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getMethodName()}:\n${error.message}`);
            }
        }
        /**
         * Adds a handler to be called when the attribute's value is changed.
         * @param handler The function reference.
         */
        static addOnChangeEventHandler(fields, handlers, execute) {
            try {
                if (!Array.isArray(handlers)) {
                    handlers = [handlers];
                }
                handlers.forEach((handler) => {
                    if (typeof handler !== "function") {
                        throw new Error(`'${handler}' is not a function`);
                    }
                    fields.forEach((field) => {
                        field.addOnChange(handler);
                    });
                });
                if (execute) {
                    fields.forEach((field) => {
                        field.Attribute.fireOnChange();
                    });
                }
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getMethodName()}:\n${error.message}`);
            }
        }
    }
    XrmEx.Form = Form;
    /**
     * Used to execute methods related to a single Attribute
     */
    class Field {
        static allFields = [];
        Name;
        _attribute;
        constructor(attributeName) {
            const existingField = Field.allFields.find((f) => f.Name === attributeName);
            if (existingField) {
                return existingField;
            }
            this.Name = attributeName;
            Field.allFields.push(this);
        }
        setValue(value) {
            return this.Attribute.setValue(value);
        }
        getAttributeType() {
            return this.Attribute.getAttributeType();
        }
        getFormat() {
            return this.Attribute.getFormat();
        }
        getIsDirty() {
            return this.Attribute.getIsDirty();
        }
        getName() {
            return this.Attribute.getName();
        }
        getParent() {
            return this.Attribute.getParent();
        }
        getRequiredLevel() {
            return this.Attribute.getRequiredLevel();
        }
        getSubmitMode() {
            return this.Attribute.getSubmitMode();
        }
        getUserPrivilege() {
            return this.Attribute.getUserPrivilege();
        }
        removeOnChange(handler) {
            return this.Attribute.removeOnChange(handler);
        }
        setSubmitMode(submitMode) {
            return this.Attribute.setSubmitMode(submitMode);
        }
        getValue() {
            return this.Attribute.getValue();
        }
        setIsValid(isValid, message) {
            return this.Attribute.setIsValid(isValid, message);
        }
        get Attribute() {
            return (this._attribute ??=
                Form.formContext.getAttribute(this.Name) ??
                    XrmEx.throwError(`The attribute '${this.Name}' was not found on the form.`));
        }
        get controls() {
            return this.Attribute.controls;
        }
        /**
         * Gets the value.
         * @returns The value.
         */
        get Value() {
            return this.Attribute.getValue();
        }
        set Value(value) {
            this.Attribute.setValue(value);
        }
        /**
         * Sets a control-local notification message.
         * @param message The message.
         * @param uniqueId Unique identifier.
         * @returns true if it succeeds, false if it fails.
         * @remarks     When this method is used on Microsoft Dynamics CRM for tablets a red "X" icon
         *              appears next to the control. Tapping on the icon will display the message.
         */
        setNotification(message, uniqueId) {
            try {
                if (!message)
                    throw new Error(`no message was provided.`);
                if (!uniqueId)
                    throw new Error(`no uniqueId was provided.`);
                this.controls.forEach((control) => control.setNotification(message, uniqueId));
                return this;
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getMethodName()}:\n${error.message}`);
            }
        }
        /**
         * Sets the visibility state.
         * @param visible true to show, false to hide.
         */
        setVisible(visible) {
            try {
                this.controls.forEach((control) => control.setVisible(visible));
                return this;
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getMethodName()}:\n${error.message}`);
            }
        }
        /**
         * Sets the state of the control to either enabled, or disabled.
         * @param disabled true to disable, false to enable.
         */
        setDisabled(disabled) {
            try {
                this.controls.forEach((control) => control.setDisabled(disabled));
                return this;
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getMethodName()}:\n${error.message}`);
            }
        }
        /**
         * Sets the required level.
         * @param requirementLevel The requirement level, as either "none", "required", or "recommended"
         */
        setRequiredLevel(requirementLevel) {
            try {
                this.Attribute.setRequiredLevel(requirementLevel);
                return this;
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getMethodName()}:\n${error.message}`);
            }
        }
        /**
         * Sets the required level.
         * @param required The requirement level, as either false for "none" or true for "required"
         */
        setRequired(required) {
            try {
                this.Attribute.setRequiredLevel(required ? "required" : "none");
                return this;
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getMethodName()}:\n${error.message}`);
            }
        }
        /**Fire all "on change" event handlers. */
        fireOnChange() {
            try {
                this.Attribute.fireOnChange();
                return this;
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getMethodName()}:\n${error.message}`);
            }
        }
        /**
         * Adds a handler or an array of handlers to be called when the attribute's value is changed.
         * @param handlers The function reference or an array of function references.
         */
        addOnChange(handlers) {
            try {
                if (Array.isArray(handlers)) {
                    for (const handler of handlers) {
                        if (typeof handler !== "function")
                            throw new Error(`'${handler}' is not a function`);
                        this.Attribute.removeOnChange(handler);
                        this.Attribute.addOnChange(handler);
                    }
                }
                else {
                    if (typeof handlers !== "function")
                        throw new Error(`'${handlers}' is not a function`);
                    this.Attribute.removeOnChange(handlers);
                    this.Attribute.addOnChange(handlers);
                }
                return this;
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getMethodName()}:\n${error.message}`);
            }
        }
        /**
         * Displays an error or recommendation notification for a control, and lets you specify actions to execute based on the notification.
         */
        addNotification(message, notificationLevel, uniqueId, actions) {
            try {
                if (!uniqueId)
                    throw new Error(`no uniqueId was provided.`);
                if (actions && !Array.isArray(actions))
                    throw new Error(`the action parameter is not an array of ControlNotificationAction`);
                this.controls.forEach((control) => {
                    control.addNotification({
                        messages: [message],
                        notificationLevel: notificationLevel,
                        uniqueId: uniqueId,
                        actions: actions,
                    });
                });
                return this;
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getMethodName()}:\n${error.message}`);
            }
        }
        /**
         * Clears the notification identified by uniqueId.
         * @param uniqueId (Optional) Unique identifier.
         * @returns true if it succeeds, false if it fails.
         * @remarks If the uniqueId parameter is not used, the current notification shown will be removed.
         */
        removeNotification(uniqueId) {
            try {
                this.controls.forEach((control) => {
                    control.clearNotification(uniqueId);
                });
                return this;
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getMethodName()}:\n${error.message}`);
            }
        }
    }
    XrmEx.Field = Field;
    class TextField extends Field {
        constructor(attribute) {
            super(attribute);
        }
        getMaxLength() {
            return this.Attribute.getMaxLength();
        }
        getFormat() {
            return this.Attribute.getFormat();
        }
        get Attribute() {
            return (this._attribute ??=
                Form.formContext.getAttribute(this.Name) ??
                    XrmEx.throwError(`Field '${this.Name}' does not exist`));
        }
        get controls() {
            return this.Attribute.controls;
        }
        get Value() {
            return this.Attribute.getValue() ?? null;
        }
        set Value(value) {
            this.Attribute.setValue(value);
        }
    }
    XrmEx.TextField = TextField;
    class NumberField extends Field {
        constructor(attribute) {
            super(attribute);
        }
        getFormat() {
            return this.Attribute.getFormat();
        }
        getMax() {
            return this.Attribute.getMax();
        }
        getMin() {
            return this.Attribute.getMin();
        }
        getPrecision() {
            return this.Attribute.getPrecision();
        }
        setPrecision(precision) {
            return this.Attribute.setPrecision(precision);
        }
        get Attribute() {
            return (this._attribute ??=
                Form.formContext.getAttribute(this.Name) ??
                    XrmEx.throwError(`Field '${this.Name}' does not exist`));
        }
        get controls() {
            return this.Attribute.controls;
        }
        get Value() {
            return this.Attribute.getValue() ?? null;
        }
        set Value(value) {
            this.Attribute.setValue(value);
        }
    }
    XrmEx.NumberField = NumberField;
    class DateField extends Field {
        constructor(attribute) {
            super(attribute);
        }
        getFormat() {
            return this.Attribute.getFormat();
        }
        get Attribute() {
            return (this._attribute ??=
                Form.formContext.getAttribute(this.Name) ??
                    XrmEx.throwError(`Field '${this.Name}' does not exist`));
        }
        get controls() {
            return this.Attribute.controls;
        }
        get Value() {
            return this.Attribute.getValue() ?? null;
        }
        set Value(value) {
            this.Attribute.setValue(value);
        }
    }
    XrmEx.DateField = DateField;
    class BooleanField extends Field {
        constructor(attribute) {
            super(attribute);
        }
        getAttributeType() {
            return this.Attribute.getAttributeType();
        }
        getInitialValue() {
            return this.Attribute.getInitialValue();
        }
        get Attribute() {
            return (this._attribute ??=
                Form.formContext.getAttribute(this.Name) ??
                    XrmEx.throwError(`Field '${this.Name}' does not exist`));
        }
        get controls() {
            return this.Attribute.controls;
        }
        get Value() {
            return this.Attribute.getValue() ?? null;
        }
        set Value(value) {
            this.Attribute.setValue(value);
        }
    }
    XrmEx.BooleanField = BooleanField;
    class MultiSelectOptionSetField extends Field {
        Option;
        constructor(attributeName, option) {
            super(attributeName);
            this.Option = option;
        }
        getFormat() {
            return this.Attribute.getFormat();
        }
        getOption(value) {
            if (typeof value === "number") {
                return this.Attribute.getOption(value);
            }
            else {
                return this.Attribute.getOption(value);
            }
        }
        getOptions() {
            return this.Attribute.getOptions();
        }
        getSelectedOption() {
            return this.Attribute.getSelectedOption();
        }
        getText() {
            return this.Attribute.getText();
        }
        getInitialValue() {
            return this.Attribute.getInitialValue();
        }
        get Attribute() {
            return (this._attribute ??=
                Form.formContext.getAttribute(this.Name) ??
                    XrmEx.throwError(`Field '${this.Name}' does not exist`));
        }
        get controls() {
            return this.Attribute.controls;
        }
        get Value() {
            return this.Attribute.getValue();
        }
        set Value(value) {
            if (Array.isArray(value)) {
                let values = [];
                value.forEach((v) => {
                    if (typeof v == "number")
                        values.push(v);
                    else
                        values.push(this.Option[v]);
                });
                this.Attribute.setValue(values);
            }
            else
                XrmEx.throwError(`Field Value '${value}' is not an Array`);
        }
    }
    XrmEx.MultiSelectOptionSetField = MultiSelectOptionSetField;
    class LookupField extends Field {
        _customFilters = [];
        constructor(attribute) {
            super(attribute);
        }
        getIsPartyList() {
            return this.Attribute.getIsPartyList();
        }
        get Attribute() {
            return (this._attribute ??=
                Form.formContext.getAttribute(this.Name) ??
                    XrmEx.throwError(`Field '${this.Name}' does not exist`));
        }
        get controls() {
            return this.Attribute.controls;
        }
        /**Gets the id of the first lookup value*/
        get Id() {
            return this.Value && this.Value.length > 0
                ? XrmEx.normalizeGuid(this.Value[0].id)
                : null;
        }
        /**Gets the entityType of the first lookup value*/
        get EntityType() {
            return this.Value && this.Value.length > 0
                ? this.Value[0].entityType
                : null;
        }
        /**Gets the formatted value of the first lookup value*/
        get FormattedValue() {
            return this.Value && this.Value.length > 0 ? this.Value[0].name : null;
        }
        get Value() {
            return this.Attribute.getValue() ?? null;
        }
        set Value(value) {
            this.Attribute.setValue(value);
        }
        /**
         * Sets the value of a lookup
         * @param id Guid of the record
         * @param entityType logicalname of the entity
         * @param name formatted value
         * @param append if true, adds value to the array instead of replacing it
         */
        setLookupValue(id, entityType, name, append = false) {
            try {
                if (!id)
                    throw new Error(`no id parameter was provided.`);
                if (!entityType)
                    throw new Error(`no entityType parameter was provided.`);
                id = XrmEx.normalizeGuid(id);
                const lookupValue = {
                    id,
                    entityType,
                    name,
                };
                this.Value =
                    append && this.Value ? this.Value.concat(lookupValue) : [lookupValue];
                return this;
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getMethodName()}:\n${error.message}`);
            }
        }
        /**
         * Retrieves an entity record.
         * @param options (Optional) OData system query options, $select and $expand, to retrieve your data.
         * - Use the $select system query option to limit the properties returned by including a comma-separated
         *   list of property names. This is an important performance best practice. If properties aren’t
         *   specified using $select, all properties will be returned.
         * - Use the $expand system query option to control what data from related entities is returned. If you
         *   just include the name of the navigation property, you’ll receive all the properties for related
         *   records. You can limit the properties returned for related records using the $select system query
         *   option in parentheses after the navigation property name. Use this for both single-valued and
         *   collection-valued navigation properties.
         * - You can also specify multiple query options by using & to separate the query options.
         * @example <caption>options example:</caption>
         * options: $select=name&$expand=primarycontactid($select=contactid,fullname)
         * @returns On success, returns a promise containing a JSON object with the retrieved attributes and their values.
         * @see {@link https://docs.microsoft.com/en-us/dynamics365/customer-engagement/developer/clientapi/reference/xrm-webapi/retrieverecord External Link: retrieveRecord (Client API reference)}
         */
        async retrieve(options) {
            try {
                if (!this.Id || !this.EntityType)
                    return null;
                const record = await Xrm.WebApi.retrieveRecord(this.EntityType, this.Id, options);
                return record;
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getMethodName()}:\n${error.message}`);
            }
        }
        /**
         * Adds an additional custom filter to the lookup, with the "AND" filter operator.
         * @param filter Specifies the filter, as a serialized FetchXML "filter" node.
         * @param entityLogicalName (Optional) The logical name of the entity.
         * @remarks     If entityLogicalName is not specified, the filter will be applied to all entities
         *              valid for the Lookup control.
         * @example     Example filter: <filter type="and">
         *                              <condition attribute="address1_city" operator="eq" value="Redmond" />
         *                              </filter>
         */
        addPreFilterToLookup(filterXml, entityLogicalName) {
            try {
                _addCustomFilter.controls = this.controls;
                this.controls.forEach((control) => {
                    control.addPreSearch(_addCustomFilter);
                });
                this._customFilters.push(_addCustomFilter);
                return this;
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getMethodName()}:\n${error.message}`);
            }
            function _addCustomFilter() {
                _addCustomFilter.controls.forEach((control) => {
                    control.addCustomFilter(filterXml, entityLogicalName);
                });
            }
        }
        /**
         * Adds an additional custom filter to the lookup, with the "AND" filter operator.
         * @param entityLogicalName (Optional) The logical name of the entity.
         * @param primaryAttributeIdName (Optional) The logical name of the primary key.
         * @param fetchXml Specifies the FetchXML used to filter.
         * @remarks     If entityLogicalName is not specified, the filter will be applied to all entities
         *              valid for the Lookup control.
         * @example     Example fetchXml: <fetch>
         *                              <entity name="contact">
         *                                  <filter>
         *                                  <condition attribute="address1_city" operator="eq" value="Redmond" />
         *                                  </filter>
         *                              </entity>
         *                              </fetch>
         */
        async addPreFilterToLookupAdvanced(entityLogicalName, primaryAttributeIdName, fetchXml) {
            try {
                const result = await Xrm.WebApi.online.retrieveMultipleRecords(entityLogicalName, "?fetchXml=" + fetchXml);
                const data = result.entities;
                let filteredEntities = "";
                _addCustomFilter.controls = this.controls;
                data.forEach((item) => {
                    filteredEntities += `<value>${item[primaryAttributeIdName]}</value>`;
                });
                fetchXml = filteredEntities
                    ? `<filter><condition attribute='${primaryAttributeIdName}' operator='in'>${filteredEntities}</condition></filter>`
                    : `<filter><condition attribute='${primaryAttributeIdName}' operator='null'/></filter>`;
                this.controls.forEach((control) => {
                    control.addPreSearch(_addCustomFilter);
                });
                this._customFilters.push(_addCustomFilter);
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getMethodName()}:\n${error.message}`);
            }
            function _addCustomFilter() {
                _addCustomFilter.controls.forEach((control) => {
                    control.addCustomFilter(fetchXml, entityLogicalName);
                });
            }
        }
        /**
         * Removes all filters set on the current lookup attribute by using addPreFilterToLookup or addPreFilterToLookupAdvanced
         */
        clearPreFilterFromLookup() {
            try {
                this._customFilters.forEach((customFilter) => {
                    this.controls.forEach((control) => {
                        control.removePreSearch(customFilter);
                    });
                });
                return this;
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getMethodName()}:\n${error.message}`);
            }
        }
    }
    XrmEx.LookupField = LookupField;
    class OptionsetField extends Field {
        _control;
        Option;
        constructor(attributeName, option) {
            super(attributeName);
            this.Option = option;
        }
        getFormat() {
            return this.Attribute.getFormat();
        }
        getOption(value) {
            if (typeof value === "number") {
                return this.Attribute.getOption(value);
            }
            else {
                return this.Attribute.getOption(value);
            }
        }
        getOptions() {
            return this.Attribute.getOptions();
        }
        getSelectedOption() {
            return this.Attribute.getSelectedOption();
        }
        getText() {
            return this.Attribute.getText();
        }
        getInitialValue() {
            return this.Attribute.getInitialValue();
        }
        get Attribute() {
            return (this._attribute ??=
                Form.formContext.getAttribute(this.Name) ??
                    XrmEx.throwError(`Field '${this.Name}' does not exist`));
        }
        get controls() {
            return this.Attribute.controls;
        }
        get control() {
            return (this._control ??=
                Form.formContext.getControl(this.Name) ??
                    XrmEx.throwError(`Control '${this.Name}' does not exist`));
        }
        get Value() {
            return this.Attribute.getValue();
        }
        set Value(value) {
            if (typeof value == "number")
                this.Attribute.setValue(value);
            else
                this.Attribute.setValue(this.Option[value]);
        }
        /**
         * Adds an option.
         *
         * @param values an array with the option values to add
         * @param index (Optional) zero-based index of the option.
         *
         * @remarks This method does not check that the values within the options you add are valid.
         *          If index is not provided, the new option will be added to the end of the list.
         */
        addOption(values, index) {
            try {
                if (!Array.isArray(values))
                    throw new Error(`values is not an Array:\nvalues: '${values}'`);
                const optionSetValues = this.control.getAttribute().getOptions() ?? [];
                for (const element of optionSetValues) {
                    if (values.includes(element.value)) {
                        this.control.addOption(element, index);
                    }
                }
                return this;
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getMethodName()}:\n${error.message}`);
            }
        }
        /**
         * Removes the option matching the value.
         *
         * @param value The value.
         */
        removeOption(values) {
            try {
                if (!Array.isArray(values))
                    throw new Error(`values is not an Array:\nvalues: '${values}'`);
                const optionSetValues = this.control.getAttribute().getOptions() ?? [];
                for (const element of optionSetValues) {
                    if (values.includes(element.value)) {
                        this.control.removeOption(element.value);
                    }
                }
                return this;
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getMethodName()}:\n${error.message}`);
            }
        }
        /**
         * Clears all options.
         */
        clearOptions() {
            try {
                this.control.clearOptions();
                return this;
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getMethodName()}:\n${error.message}`);
            }
        }
    }
    XrmEx.OptionsetField = OptionsetField;
    class Section {
        Name;
        _section;
        parentTab;
        constructor(name) {
            this.Name = name;
        }
        get Section() {
            return (this._section ??=
                this.parentTab.sections.get(this.Name) ??
                    XrmEx.throwError(`The section '${this.Name}' was not found on the form.`));
        }
        getName() {
            return this.Section.getName();
        }
        getParent() {
            return this.Section.getParent();
        }
        controls;
        setVisible(visible) {
            return this.Section.setVisible(visible);
        }
        getVisible() {
            return this.Section.getVisible();
        }
        getLabel() {
            return this.Section.getLabel();
        }
        setLabel(label) {
            return this.Section.setLabel(label);
        }
    }
    XrmEx.Section = Section;
    class Tab {
        Name;
        _tab;
        Section;
        constructor(name, section) {
            this.Name = name;
            this.Section = section;
            for (let key in section) {
                section[key].parentTab = this;
            }
        }
        sections;
        get Tab() {
            return (this._tab ??=
                Form.formContext.ui.tabs.get(this.Name) ??
                    XrmEx.throwError(`The tab '${this.Name}' was not found on the form.`));
        }
        addTabStateChange(handler) {
            return this.Tab.addTabStateChange(handler);
        }
        getDisplayState() {
            return this.Tab.getDisplayState();
        }
        getName() {
            return this.Tab.getName();
        }
        getParent() {
            return this.Tab.getParent();
        }
        removeTabStateChange(handler) {
            return this.Tab.removeTabStateChange(handler);
        }
        setDisplayState(displayState) {
            return this.Tab.setDisplayState(displayState);
        }
        setVisible(visible) {
            return this.Tab.setVisible(visible);
        }
        getVisible() {
            return this.Tab.getVisible();
        }
        getLabel() {
            return this.Tab.getLabel();
        }
        setLabel(label) {
            return this.Tab.setLabel(label);
        }
        setFocus() {
            return this.Tab.setFocus();
        }
    }
    XrmEx.Tab = Tab;
    class GridControl {
        Name;
        _gridControl;
        constructor(name) {
            this.Name = name;
        }
        get GridControl() {
            return ((this._gridControl ??=
                Form.formContext.getControl(this.Name)) ??
                XrmEx.throwError(`The grid '${this.Name}' was not found on the form.`));
        }
        get Grid() {
            return this.GridControl.getGrid();
        }
        addOnLoad(handler) {
            return this.GridControl.addOnLoad(handler);
        }
        getContextType() {
            return this.GridControl.getContextType();
        }
        getEntityName() {
            return this.GridControl.getEntityName();
        }
        getFetchXml() {
            return this.GridControl.getFetchXml();
        }
        getGrid() {
            return this.GridControl.getGrid();
        }
        getRelationship() {
            return this.GridControl.getRelationship();
        }
        getUrl(client) {
            return this.GridControl.getUrl(client);
        }
        getViewSelector() {
            return this.GridControl.getViewSelector();
        }
        openRelatedGrid() {
            return this.GridControl.openRelatedGrid();
        }
        refresh() {
            return this.GridControl.refresh();
        }
        refreshRibbon() {
            return this.GridControl.refreshRibbon();
        }
        removeOnLoad(handler) {
            return this.GridControl.removeOnLoad(handler);
        }
        getControlType() {
            return this.GridControl.getControlType();
        }
        getName() {
            return this.GridControl.getName();
        }
        getParent() {
            return this.GridControl.getParent();
        }
        getLabel() {
            return this.GridControl.getLabel();
        }
        setLabel(label) {
            return this.GridControl.setLabel(label);
        }
        getVisible() {
            return this.GridControl.getVisible();
        }
        setVisible(visible) {
            return this.GridControl.setVisible(visible);
        }
    }
    XrmEx.GridControl = GridControl;
})(XrmEx || (XrmEx = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWHJtRXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvWHJtRXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsOERBQThEO0FBa0M5RCxJQUFVLEtBQUssQ0FvNUNkO0FBcDVDRCxXQUFVLEtBQUs7SUFDYjs7OztPQUlHO0lBQ0gsU0FBZ0IsVUFBVSxDQUFDLFlBQW9CO1FBQzdDLE1BQU0sSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUZlLGdCQUFVLGFBRXpCLENBQUE7SUFDRDs7O09BR0c7SUFDSCxTQUFnQixhQUFhO1FBQzNCLElBQUk7WUFDRixNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQzFCLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDdkUsTUFBTSxtQkFBbUIsR0FDdkIsVUFBVSxJQUFJLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUNuRSxNQUFNLGlCQUFpQixHQUNyQixtQkFBbUIsRUFBRSxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUNuRCxNQUFNLFlBQVksR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUVuRSxPQUFPLFlBQVksQ0FBQztTQUNyQjtRQUFDLE9BQU8sS0FBVSxFQUFFO1lBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1NBQzNEO0lBQ0gsQ0FBQztJQWRlLG1CQUFhLGdCQWM1QixD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RSxDQUFDO1FBQ3JDLENBQUM7UUFDRCxRQUFRLENBQUMsS0FBYTtZQUNwQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFDRCxVQUFVO1lBQ1IsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3ZDLENBQUM7UUFDRCxVQUFVLENBQUMsT0FBZ0I7WUFDekIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM5QyxDQUFDO0tBQ0Y7SUF6RVksaUJBQVcsY0F5RXZCLENBQUE7QUFDSCxDQUFDLEVBcDVDUyxLQUFLLEtBQUwsS0FBSyxRQW81Q2QiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vbm9kZV9tb2R1bGVzL0B0eXBlcy94cm0vaW5kZXguZC50c1wiIC8+XG4vKipcbiAqIFJlcHJlc2VudHMgYSBwYXJhbWV0ZXIgZm9yIGEgcmVxdWVzdC5cbiAqIEB0eXBlIHtPYmplY3R9IFJlcXVlc3RQYXJhbWV0ZXJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBOYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHBhcmFtZXRlci5cbiAqIEBwcm9wZXJ0eSB7J0Jvb2xlYW4nIHwgJ0RhdGVUaW1lJyB8ICdEZWNpbWFsJyB8ICdFbnRpdHknIHwgJ0VudGl0eUNvbGxlY3Rpb24nIHwgJ0VudGl0eVJlZmVyZW5jZScgfCAnRmxvYXQnIHwgJ0ludGVnZXInIHwgJ01vbmV5JyB8ICdQaWNrbGlzdCcgfCAnU3RyaW5nJ30gVHlwZSAtIFRoZSB0eXBlIG9mIHRoZSBwYXJhbWV0ZXIuXG4gKiBAcHJvcGVydHkgeyp9IFZhbHVlIC0gVGhlIHZhbHVlIG9mIHRoZSBwYXJhbWV0ZXIuXG4gKi9cbnR5cGUgUmVxdWVzdFBhcmFtZXRlciA9IHtcbiAgTmFtZTogc3RyaW5nO1xuICBUeXBlOlxuICAgIHwgXCJCb29sZWFuXCJcbiAgICB8IFwiRGF0ZVRpbWVcIlxuICAgIHwgXCJEZWNpbWFsXCJcbiAgICB8IFwiRW50aXR5XCJcbiAgICB8IFwiRW50aXR5Q29sbGVjdGlvblwiXG4gICAgfCBcIkVudGl0eVJlZmVyZW5jZVwiXG4gICAgfCBcIkZsb2F0XCJcbiAgICB8IFwiSW50ZWdlclwiXG4gICAgfCBcIk1vbmV5XCJcbiAgICB8IFwiUGlja2xpc3RcIlxuICAgIHwgXCJTdHJpbmdcIjtcbiAgVmFsdWU6IGFueTtcbn07XG4vKipcbiAqIFJlcHJlc2VudHMgYSByZWZlcmVuY2UgdG8gYW4gZW50aXR5LlxuICogQHR5cGVcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBpZCAtIFRoZSBJRCBvZiB0aGUgZW50aXR5LlxuICogQHByb3BlcnR5IHtzdHJpbmd9IGVudGl0eVR5cGUgLSBUaGUgdHlwZSBvZiB0aGUgZW50aXR5LlxuICovXG50eXBlIEVudGl0eVJlZmVyZW5jZSA9IHtcbiAgaWQ6IHN0cmluZztcbiAgZW50aXR5VHlwZTogc3RyaW5nO1xufTtcbm5hbWVzcGFjZSBYcm1FeCB7XG4gIC8qKlxuICAgKiBUaHJvd3MgYW4gZXJyb3Igd2l0aCB0aGUgZ2l2ZW4gZXJyb3IgbWVzc2FnZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGVycm9yTWVzc2FnZSAtIFRoZSBlcnJvciBtZXNzYWdlIHRvIHRocm93LlxuICAgKiBAdGhyb3dzIHtFcnJvcn0gLSBBbHdheXMgdGhyb3dzIGFuIGVycm9yIHdpdGggdGhlIGdpdmVuIGVycm9yIG1lc3NhZ2UuXG4gICAqL1xuICBleHBvcnQgZnVuY3Rpb24gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2U6IHN0cmluZyk6IG5ldmVyIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgfVxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbmFtZSBvZiB0aGUgY2FsbGluZyBmdW5jdGlvbi5cbiAgICogQHJldHVybnMge3N0cmluZ30gLSBUaGUgbmFtZSBvZiB0aGUgY2FsbGluZyBmdW5jdGlvbi5cbiAgICovXG4gIGV4cG9ydCBmdW5jdGlvbiBnZXRNZXRob2ROYW1lKCk6IHN0cmluZyB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKCk7XG4gICAgICBjb25zdCBzdGFja1RyYWNlID0gZXJyb3Iuc3RhY2s/LnNwbGl0KFwiXFxuXCIpLm1hcCgobGluZSkgPT4gbGluZS50cmltKCkpO1xuICAgICAgY29uc3QgY2FsbGluZ0Z1bmN0aW9uTGluZSA9XG4gICAgICAgIHN0YWNrVHJhY2UgJiYgc3RhY2tUcmFjZS5sZW5ndGggPj0gMyA/IHN0YWNrVHJhY2VbMl0gOiB1bmRlZmluZWQ7XG4gICAgICBjb25zdCBmdW5jdGlvbk5hbWVNYXRjaCA9XG4gICAgICAgIGNhbGxpbmdGdW5jdGlvbkxpbmU/Lm1hdGNoKC9hdFxccysoW15cXHNdKylcXHMrXFwoLyk7XG4gICAgICBjb25zdCBmdW5jdGlvbk5hbWUgPSBmdW5jdGlvbk5hbWVNYXRjaCA/IGZ1bmN0aW9uTmFtZU1hdGNoWzFdIDogXCJcIjtcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uTmFtZTtcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LmdldE1ldGhvZE5hbWU6XFxuJHtlcnJvci5tZXNzYWdlfWApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogRGlzcGxheXMgYSBub3RpZmljYXRpb24gZm9yIGFuIGFwcCB3aXRoIHRoZSBnaXZlbiBtZXNzYWdlIGFuZCBsZXZlbCwgYW5kIGxldHMgeW91IHNwZWNpZnkgd2hldGhlciB0byBzaG93IGEgY2xvc2UgYnV0dG9uLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIFRoZSBtZXNzYWdlIHRvIGRpc3BsYXkgaW4gdGhlIG5vdGlmaWNhdGlvbi5cbiAgICogQHBhcmFtIHsnU1VDQ0VTUycgfCAnRVJST1InIHwgJ1dBUk5JTkcnIHwgJ0lORk8nfSBsZXZlbCAtIFRoZSBsZXZlbCBvZiB0aGUgbm90aWZpY2F0aW9uLiBDYW4gYmUgJ1NVQ0NFU1MnLCAnRVJST1InLCAnV0FSTklORycsIG9yICdJTkZPJy5cbiAgICogQHBhcmFtIHtib29sZWFufSBbc2hvd0Nsb3NlQnV0dG9uPWZhbHNlXSAtIFdoZXRoZXIgdG8gc2hvdyBhIGNsb3NlIGJ1dHRvbiBvbiB0aGUgbm90aWZpY2F0aW9uLiBEZWZhdWx0cyB0byBmYWxzZS5cbiAgICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gLSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBJRCBvZiB0aGUgY3JlYXRlZCBub3RpZmljYXRpb24uXG4gICAqL1xuICBleHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkR2xvYmFsTm90aWZpY2F0aW9uKFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICBsZXZlbDogXCJTVUNDRVNTXCIgfCBcIkVSUk9SXCIgfCBcIldBUk5JTkdcIiB8IFwiSU5GT1wiLFxuICAgIHNob3dDbG9zZUJ1dHRvbiA9IGZhbHNlXG4gICk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgbGV2ZWxNYXAgPSB7XG4gICAgICBTVUNDRVNTOiAxLFxuICAgICAgRVJST1I6IDIsXG4gICAgICBXQVJOSU5HOiAzLFxuICAgICAgSU5GTzogNCxcbiAgICB9O1xuICAgIGNvbnN0IG1lc3NhZ2VMZXZlbCA9IGxldmVsTWFwW2xldmVsXSB8fCBsZXZlbE1hcC5JTkZPO1xuICAgIGNvbnN0IG5vdGlmaWNhdGlvbiA9IHtcbiAgICAgIHR5cGU6IDIsXG4gICAgICBsZXZlbDogbWVzc2FnZUxldmVsLFxuICAgICAgbWVzc2FnZSxcbiAgICAgIHNob3dDbG9zZUJ1dHRvbixcbiAgICB9O1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgWHJtLkFwcC5hZGRHbG9iYWxOb3RpZmljYXRpb24obm90aWZpY2F0aW9uKTtcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7Z2V0TWV0aG9kTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBDbGVhcnMgYSBub3RpZmljYXRpb24gaW4gdGhlIGFwcCB3aXRoIHRoZSBnaXZlbiB1bmlxdWUgSUQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1bmlxdWVJZCAtIFRoZSB1bmlxdWUgSUQgb2YgdGhlIG5vdGlmaWNhdGlvbiB0byBjbGVhci5cbiAgICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gLSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBub3RpZmljYXRpb24gaGFzIGJlZW4gY2xlYXJlZC5cbiAgICovXG4gIGV4cG9ydCBhc3luYyBmdW5jdGlvbiByZW1vdmVHbG9iYWxOb3RpZmljYXRpb24oXG4gICAgdW5pcXVlSWQ6IHN0cmluZ1xuICApOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgWHJtLkFwcC5jbGVhckdsb2JhbE5vdGlmaWNhdGlvbih1bmlxdWVJZCk7XG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke2dldE1ldGhvZE5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSB2YWx1ZSBvZiBhbiBlbnZpcm9ubWVudCB2YXJpYWJsZSBieSB1c2luZyBpdHMgc2NoZW1hIG5hbWUgYXMga2V5LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZW52aXJvbm1lbnRWYXJpYWJsZVNjaGVtYU5hbWUgLSBUaGUgc2NoZW1hIG5hbWUgb2YgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlIHRvIHJldHJpZXZlLlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSAtIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIHZhbHVlIG9mIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZS5cbiAgICovXG4gIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRFbnZpcm9ubWVudFZhcmlhYmxlVmFsdWUoXG4gICAgZW52aXJvbm1lbnRWYXJpYWJsZVNjaGVtYU5hbWU6IHN0cmluZ1xuICApOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiBleGVjdXRlRnVuY3Rpb24oXCJSZXRyaWV2ZUVudmlyb25tZW50VmFyaWFibGVWYWx1ZVwiLCBbXG4gICAgICB7XG4gICAgICAgIE5hbWU6IFwiRGVmaW5pdGlvblNjaGVtYU5hbWVcIixcbiAgICAgICAgVHlwZTogXCJTdHJpbmdcIixcbiAgICAgICAgVmFsdWU6IGVudmlyb25tZW50VmFyaWFibGVTY2hlbWFOYW1lLFxuICAgICAgfSxcbiAgICBdKTtcbiAgfVxuICAvKipcbiAgICogQSBtYXAgb2YgQ1JNIGRhdGEgdHlwZXMgdG8gdGhlaXIgY29ycmVzcG9uZGluZyB0eXBlIG5hbWVzLCBzdHJ1Y3R1cmFsIHByb3BlcnRpZXMsIGFuZCBKYXZhU2NyaXB0IHR5cGVzLlxuICAgKiBAdHlwZSB7T2JqZWN0LjxzdHJpbmcsIHsgdHlwZU5hbWU6IHN0cmluZywgc3RydWN0dXJhbFByb3BlcnR5OiBudW1iZXIsIGpzVHlwZTogc3RyaW5nIH0+fVxuICAgKi9cbiAgbGV0IHR5cGVNYXAgPSB7XG4gICAgU3RyaW5nOiB7IHR5cGVOYW1lOiBcIkVkbS5TdHJpbmdcIiwgc3RydWN0dXJhbFByb3BlcnR5OiAxLCBqc1R5cGU6IFwic3RyaW5nXCIgfSxcbiAgICBJbnRlZ2VyOiB7IHR5cGVOYW1lOiBcIkVkbS5JbnQzMlwiLCBzdHJ1Y3R1cmFsUHJvcGVydHk6IDEsIGpzVHlwZTogXCJudW1iZXJcIiB9LFxuICAgIEJvb2xlYW46IHtcbiAgICAgIHR5cGVOYW1lOiBcIkVkbS5Cb29sZWFuXCIsXG4gICAgICBzdHJ1Y3R1cmFsUHJvcGVydHk6IDEsXG4gICAgICBqc1R5cGU6IFwiYm9vbGVhblwiLFxuICAgIH0sXG4gICAgRGF0ZVRpbWU6IHtcbiAgICAgIHR5cGVOYW1lOiBcIkVkbS5EYXRlVGltZU9mZnNldFwiLFxuICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiAxLFxuICAgICAganNUeXBlOiBcIm9iamVjdFwiLFxuICAgIH0sXG4gICAgRW50aXR5UmVmZXJlbmNlOiB7XG4gICAgICB0eXBlTmFtZTogXCJtc2NybS5jcm1iYXNlZW50aXR5XCIsXG4gICAgICBzdHJ1Y3R1cmFsUHJvcGVydHk6IDUsXG4gICAgICBqc1R5cGU6IFwib2JqZWN0XCIsXG4gICAgfSxcbiAgICBEZWNpbWFsOiB7XG4gICAgICB0eXBlTmFtZTogXCJFZG0uRGVjaW1hbFwiLFxuICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiAxLFxuICAgICAganNUeXBlOiBcIm51bWJlclwiLFxuICAgIH0sXG4gICAgRW50aXR5OiB7XG4gICAgICB0eXBlTmFtZTogXCJtc2NybS5jcm1iYXNlZW50aXR5XCIsXG4gICAgICBzdHJ1Y3R1cmFsUHJvcGVydHk6IDUsXG4gICAgICBqc1R5cGU6IFwib2JqZWN0XCIsXG4gICAgfSxcbiAgICBFbnRpdHlDb2xsZWN0aW9uOiB7XG4gICAgICB0eXBlTmFtZTogXCJDb2xsZWN0aW9uKG1zY3JtLmNybWJhc2VlbnRpdHkpXCIsXG4gICAgICBzdHJ1Y3R1cmFsUHJvcGVydHk6IDQsXG4gICAgICBqc1R5cGU6IFwib2JqZWN0XCIsXG4gICAgfSxcbiAgICBGbG9hdDogeyB0eXBlTmFtZTogXCJFZG0uRG91YmxlXCIsIHN0cnVjdHVyYWxQcm9wZXJ0eTogMSwganNUeXBlOiBcIm51bWJlclwiIH0sXG4gICAgTW9uZXk6IHsgdHlwZU5hbWU6IFwiRWRtLkRlY2ltYWxcIiwgc3RydWN0dXJhbFByb3BlcnR5OiAxLCBqc1R5cGU6IFwibnVtYmVyXCIgfSxcbiAgICBQaWNrbGlzdDoge1xuICAgICAgdHlwZU5hbWU6IFwiRWRtLkludDMyXCIsXG4gICAgICBzdHJ1Y3R1cmFsUHJvcGVydHk6IDEsXG4gICAgICBqc1R5cGU6IFwibnVtYmVyXCIsXG4gICAgfSxcbiAgfTtcbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gcmVxdWVzdCBwYXJhbWV0ZXIgaXMgb2YgYSBzdXBwb3J0ZWQgdHlwZSBhbmQgaGFzIGEgdmFsaWQgdmFsdWUuXG4gICAqIEBwYXJhbSB7UmVxdWVzdFBhcmFtZXRlcn0gcmVxdWVzdFBhcmFtZXRlciAtIFRoZSByZXF1ZXN0IHBhcmFtZXRlciB0byBjaGVjay5cbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqIEB0aHJvd3Mge0Vycm9yfSAtIFRocm93cyBhbiBlcnJvciBpZiB0aGUgcmVxdWVzdCBwYXJhbWV0ZXIgaXMgbm90IG9mIGEgc3VwcG9ydGVkIHR5cGUgb3IgaGFzIGFuIGludmFsaWQgdmFsdWUuXG4gICAqL1xuICBleHBvcnQgZnVuY3Rpb24gY2hlY2tSZXF1ZXN0UGFyYW1ldGVyVHlwZShcbiAgICByZXF1ZXN0UGFyYW1ldGVyOiBSZXF1ZXN0UGFyYW1ldGVyXG4gICk6IHZvaWQge1xuICAgIGlmICghdHlwZU1hcFtyZXF1ZXN0UGFyYW1ldGVyLlR5cGVdKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgVGhlIHByb3BlcnR5IHR5cGUgJHtyZXF1ZXN0UGFyYW1ldGVyLlR5cGV9IG9mIHRoZSBwcm9wZXJ0eSAke3JlcXVlc3RQYXJhbWV0ZXIuTmFtZX0gaXMgbm90IHN1cHBvcnRlZC5gXG4gICAgICApO1xuICAgIGNvbnN0IGV4cGVjdGVkVHlwZSA9IHR5cGVNYXBbcmVxdWVzdFBhcmFtZXRlci5UeXBlXS5qc1R5cGU7XG4gICAgY29uc3QgYWN0dWFsVHlwZSA9IHR5cGVvZiByZXF1ZXN0UGFyYW1ldGVyLlZhbHVlO1xuICAgIGNvbnN0IGludmFsaWRUeXBlTWVzc2FnZSA9IGBUaGUgdmFsdWUgJHtyZXF1ZXN0UGFyYW1ldGVyLlZhbHVlfVxcbm9mIHRoZSBwcm9wZXJ0eSAke3JlcXVlc3RQYXJhbWV0ZXIuTmFtZX1cXG5pcyBub3Qgb2YgdGhlIGV4cGVjdGVkIHR5cGUgJHtyZXF1ZXN0UGFyYW1ldGVyLlR5cGV9LmA7XG4gICAgaWYgKFxuICAgICAgcmVxdWVzdFBhcmFtZXRlci5UeXBlID09PSBcIkVudGl0eVJlZmVyZW5jZVwiIHx8XG4gICAgICByZXF1ZXN0UGFyYW1ldGVyLlR5cGUgPT09IFwiRW50aXR5XCJcbiAgICApIHtcbiAgICAgIGlmIChcbiAgICAgICAgIXJlcXVlc3RQYXJhbWV0ZXIuVmFsdWUgfHxcbiAgICAgICAgIXJlcXVlc3RQYXJhbWV0ZXIuVmFsdWUuaGFzT3duUHJvcGVydHkoXCJpZFwiKSB8fFxuICAgICAgICAhcmVxdWVzdFBhcmFtZXRlci5WYWx1ZS5oYXNPd25Qcm9wZXJ0eShcImVudGl0eVR5cGVcIilcbiAgICAgICkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoaW52YWxpZFR5cGVNZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIHR5cGVNYXBbXG4gICAgICAgIHJlcXVlc3RQYXJhbWV0ZXIuVHlwZVxuICAgICAgXS50eXBlTmFtZSA9IGBtc2NybS4ke3JlcXVlc3RQYXJhbWV0ZXIuVmFsdWUuZW50aXR5VHlwZX1gO1xuICAgIH0gZWxzZSBpZiAocmVxdWVzdFBhcmFtZXRlci5UeXBlID09PSBcIkVudGl0eUNvbGxlY3Rpb25cIikge1xuICAgICAgaWYgKFxuICAgICAgICAhQXJyYXkuaXNBcnJheShyZXF1ZXN0UGFyYW1ldGVyLlZhbHVlKSB8fFxuICAgICAgICByZXF1ZXN0UGFyYW1ldGVyLlZhbHVlLmV2ZXJ5KFxuICAgICAgICAgICh2KSA9PlxuICAgICAgICAgICAgdHlwZW9mIHYgIT09IFwib2JqZWN0XCIgfHxcbiAgICAgICAgICAgICF2IHx8XG4gICAgICAgICAgICAhdi5oYXNPd25Qcm9wZXJ0eShcImlkXCIpIHx8XG4gICAgICAgICAgICAhdi5oYXNPd25Qcm9wZXJ0eShcImVudGl0eVR5cGVcIilcbiAgICAgICAgKVxuICAgICAgKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihpbnZhbGlkVHlwZU1lc3NhZ2UpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAocmVxdWVzdFBhcmFtZXRlci5UeXBlID09PSBcIkRhdGVUaW1lXCIpIHtcbiAgICAgIGlmICghKHJlcXVlc3RQYXJhbWV0ZXIuVmFsdWUgaW5zdGFuY2VvZiBEYXRlKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoaW52YWxpZFR5cGVNZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGFjdHVhbFR5cGUgIT09IGV4cGVjdGVkVHlwZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoaW52YWxpZFR5cGVNZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIEV4ZWN1dGVzIGFuIEFjdGlvbi5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGFjdGlvbk5hbWUgLSBUaGUgdW5pcXVlIG5hbWUgb2YgdGhlIGFjdGlvbi5cbiAgICogQHBhcmFtIHtSZXF1ZXN0UGFyYW1ldGVyW119IHJlcXVlc3RQYXJhbWV0ZXJzIC0gQW4gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoIHRoZSBwYXJhbWV0ZXIgbmFtZSwgdHlwZSBhbmQgdmFsdWUuXG4gICAqIEBwYXJhbSB7RW50aXR5UmVmZXJlbmNlfSBbYm91bmRFbnRpdHldIC0gQW4gb3B0aW9uYWwgRW50aXR5UmVmZXJlbmNlIG9mIHRoZSBib3VuZCBlbnRpdHkuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59IC0gQSBQcm9taXNlIHdpdGggdGhlIHJlcXVlc3QgcmVzcG9uc2UuXG4gICAqIEB0aHJvd3Mge0Vycm9yfSAtIFRocm93cyBhbiBlcnJvciBpZiB0aGUgcmVxdWVzdCBwYXJhbWV0ZXIgaXMgbm90IG9mIGEgc3VwcG9ydGVkIHR5cGUgb3IgaGFzIGFuIGludmFsaWQgdmFsdWUuXG4gICAqL1xuICBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUFjdGlvbihcbiAgICBhY3Rpb25OYW1lOiBzdHJpbmcsXG4gICAgcmVxdWVzdFBhcmFtZXRlcnM6IFJlcXVlc3RQYXJhbWV0ZXJbXSxcbiAgICBib3VuZEVudGl0eT86IEVudGl0eVJlZmVyZW5jZVxuICApOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IHBhcmFtZXRlckRlZmluaXRpb246IGFueSA9IHt9O1xuICAgIGlmIChib3VuZEVudGl0eSlcbiAgICAgIHJlcXVlc3RQYXJhbWV0ZXJzLnB1c2goe1xuICAgICAgICBOYW1lOiBcImVudGl0eVwiLFxuICAgICAgICBWYWx1ZTogYm91bmRFbnRpdHksXG4gICAgICAgIFR5cGU6IFwiRW50aXR5UmVmZXJlbmNlXCIsXG4gICAgICB9KTtcbiAgICBmb3IgKGNvbnN0IHJlcXVlc3RQYXJhbWV0ZXIgb2YgcmVxdWVzdFBhcmFtZXRlcnMpIHtcbiAgICAgIGNoZWNrUmVxdWVzdFBhcmFtZXRlclR5cGUocmVxdWVzdFBhcmFtZXRlcik7XG4gICAgICBwYXJhbWV0ZXJEZWZpbml0aW9uW3JlcXVlc3RQYXJhbWV0ZXIuTmFtZV0gPSB7XG4gICAgICAgIHR5cGVOYW1lOiB0eXBlTWFwW3JlcXVlc3RQYXJhbWV0ZXIuVHlwZV0udHlwZU5hbWUsXG4gICAgICAgIHN0cnVjdHVyYWxQcm9wZXJ0eTogdHlwZU1hcFtyZXF1ZXN0UGFyYW1ldGVyLlR5cGVdLnN0cnVjdHVyYWxQcm9wZXJ0eSxcbiAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IHJlcSA9IE9iamVjdC5hc3NpZ24oXG4gICAgICB7XG4gICAgICAgIGdldE1ldGFkYXRhOiAoKSA9PiAoe1xuICAgICAgICAgIGJvdW5kUGFyYW1ldGVyOiBib3VuZEVudGl0eSA/IFwiZW50aXR5XCIgOiBudWxsLFxuICAgICAgICAgIG9wZXJhdGlvblR5cGU6IDAsXG4gICAgICAgICAgb3BlcmF0aW9uTmFtZTogYWN0aW9uTmFtZSxcbiAgICAgICAgICBwYXJhbWV0ZXJUeXBlczogcGFyYW1ldGVyRGVmaW5pdGlvbixcbiAgICAgICAgfSksXG4gICAgICB9LFxuICAgICAgLi4ucmVxdWVzdFBhcmFtZXRlcnMubWFwKChwKSA9PiAoeyBbcC5OYW1lXTogcC5WYWx1ZSB9KSlcbiAgICApO1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgWHJtLldlYkFwaS5vbmxpbmUuZXhlY3V0ZShyZXEpO1xuICAgIGlmIChyZXNwb25zZS5vaykgcmV0dXJuIHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiByZXNwb25zZSk7XG4gIH1cblxuICAvKipcbiAgICogRXhlY3V0ZXMgYSBGdW5jdGlvbi5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGZ1bmN0aW9uTmFtZSAtIFRoZSB1bmlxdWUgbmFtZSBvZiB0aGUgZnVuY3Rpb24uXG4gICAqIEBwYXJhbSB7UmVxdWVzdFBhcmFtZXRlcltdfSByZXF1ZXN0UGFyYW1ldGVycyAtIEFuIGFycmF5IG9mIG9iamVjdHMgd2l0aCB0aGUgcGFyYW1ldGVyIG5hbWUsIHR5cGUgYW5kIHZhbHVlLlxuICAgKiBAcGFyYW0ge0VudGl0eVJlZmVyZW5jZX0gW2JvdW5kRW50aXR5XSAtIEFuIG9wdGlvbmFsIEVudGl0eVJlZmVyZW5jZSBvZiB0aGUgYm91bmQgZW50aXR5LlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fSAtIEEgUHJvbWlzZSB3aXRoIHRoZSByZXF1ZXN0IHJlc3BvbnNlLlxuICAgKiBAdGhyb3dzIHtFcnJvcn0gLSBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlIHJlcXVlc3QgcGFyYW1ldGVyIGlzIG5vdCBvZiBhIHN1cHBvcnRlZCB0eXBlIG9yIGhhcyBhbiBpbnZhbGlkIHZhbHVlLlxuICAgKi9cbiAgZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVGdW5jdGlvbihcbiAgICBmdW5jdGlvbk5hbWU6IHN0cmluZyxcbiAgICByZXF1ZXN0UGFyYW1ldGVyczogUmVxdWVzdFBhcmFtZXRlcltdLFxuICAgIGJvdW5kRW50aXR5PzogRW50aXR5UmVmZXJlbmNlXG4gICk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgcGFyYW1ldGVyRGVmaW5pdGlvbjogYW55ID0ge307XG4gICAgaWYgKGJvdW5kRW50aXR5KVxuICAgICAgcmVxdWVzdFBhcmFtZXRlcnMucHVzaCh7XG4gICAgICAgIE5hbWU6IFwiZW50aXR5XCIsXG4gICAgICAgIFZhbHVlOiBib3VuZEVudGl0eSxcbiAgICAgICAgVHlwZTogXCJFbnRpdHlSZWZlcmVuY2VcIixcbiAgICAgIH0pO1xuICAgIGZvciAoY29uc3QgcmVxdWVzdFBhcmFtZXRlciBvZiByZXF1ZXN0UGFyYW1ldGVycykge1xuICAgICAgY2hlY2tSZXF1ZXN0UGFyYW1ldGVyVHlwZShyZXF1ZXN0UGFyYW1ldGVyKTtcbiAgICAgIHBhcmFtZXRlckRlZmluaXRpb25bcmVxdWVzdFBhcmFtZXRlci5OYW1lXSA9IHtcbiAgICAgICAgdHlwZU5hbWU6IHR5cGVNYXBbcmVxdWVzdFBhcmFtZXRlci5UeXBlXS50eXBlTmFtZSxcbiAgICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiB0eXBlTWFwW3JlcXVlc3RQYXJhbWV0ZXIuVHlwZV0uc3RydWN0dXJhbFByb3BlcnR5LFxuICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgcmVxID0gT2JqZWN0LmFzc2lnbihcbiAgICAgIHtcbiAgICAgICAgZ2V0TWV0YWRhdGE6ICgpID0+ICh7XG4gICAgICAgICAgYm91bmRQYXJhbWV0ZXI6IGJvdW5kRW50aXR5ID8gXCJlbnRpdHlcIiA6IG51bGwsXG4gICAgICAgICAgb3BlcmF0aW9uVHlwZTogMSxcbiAgICAgICAgICBvcGVyYXRpb25OYW1lOiBmdW5jdGlvbk5hbWUsXG4gICAgICAgICAgcGFyYW1ldGVyVHlwZXM6IHBhcmFtZXRlckRlZmluaXRpb24sXG4gICAgICAgIH0pLFxuICAgICAgfSxcbiAgICAgIC4uLnJlcXVlc3RQYXJhbWV0ZXJzLm1hcCgocCkgPT4gKHsgW3AuTmFtZV06IHAuVmFsdWUgfSkpXG4gICAgKTtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IFhybS5XZWJBcGkub25saW5lLmV4ZWN1dGUocmVxKTtcbiAgICBpZiAocmVzcG9uc2Uub2spIHJldHVybiByZXNwb25zZS5qc29uKCkuY2F0Y2goKCkgPT4gcmVzcG9uc2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ha2VzIGEgR1VJRCBsb3dlcmNhc2UgYW5kIHJlbW92ZXMgYnJhY2tldHMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBndWlkIC0gVGhlIEdVSUQgdG8gbm9ybWFsaXplLlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIFRoZSBub3JtYWxpemVkIEdVSUQuXG4gICAqL1xuICBleHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplR3VpZChndWlkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICh0eXBlb2YgZ3VpZCAhPT0gXCJzdHJpbmdcIilcbiAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXgubm9ybWFsaXplR3VpZDpcXG4nJHtndWlkfScgaXMgbm90IGEgc3RyaW5nYCk7XG4gICAgcmV0dXJuIGd1aWQudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9be31dL2csIFwiXCIpO1xuICB9XG4gIC8qKlxuICAgKiBPcGVucyBhIGRpYWxvZyB3aXRoIGR5bmFtaWMgaGVpZ2h0IGFuZCB3aWR0aCBiYXNlZCBvbiB0ZXh0IGNvbnRlbnQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZSAtIFRoZSB0aXRsZSBvZiB0aGUgZGlhbG9nLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIFRoZSB0ZXh0IGNvbnRlbnQgb2YgdGhlIGRpYWxvZy5cbiAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn0gLSBBIFByb21pc2Ugd2l0aCB0aGUgZGlhbG9nIHJlc3BvbnNlLlxuICAgKi9cbiAgZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9wZW5BbGVydERpYWxvZyhcbiAgICB0aXRsZTogc3RyaW5nLFxuICAgIHRleHQ6IHN0cmluZ1xuICApOiBQcm9taXNlPGFueT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByb3dzID0gdGV4dC5zcGxpdCgvXFxyXFxufFxccnxcXG4vKTtcbiAgICAgIGxldCBhZGRpdGlvbmFsUm93cyA9IDA7XG4gICAgICByb3dzLmZvckVhY2goKHJvdykgPT4ge1xuICAgICAgICBsZXQgd2lkdGggPSBnZXRUZXh0V2lkdGgoXG4gICAgICAgICAgcm93LFxuICAgICAgICAgIFwiMXJlbSBTZWdvZSBVSSBSZWd1bGFyLCBTZWdvZVVJLCBTZWdvZSBVSVwiXG4gICAgICAgICk7XG4gICAgICAgIGlmICh3aWR0aCA+IDk0MCkge1xuICAgICAgICAgIGFkZGl0aW9uYWxSb3dzICs9IHdpZHRoIC8gOTQwO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGxvbmdlc3RSb3cgPSByb3dzLnJlZHVjZShcbiAgICAgICAgKGFjYywgcm93KSA9PiAocm93Lmxlbmd0aCA+IGFjYy5sZW5ndGggPyByb3cgOiBhY2MpLFxuICAgICAgICBcIlwiXG4gICAgICApO1xuICAgICAgY29uc3Qgd2lkdGggPSBNYXRoLm1pbihcbiAgICAgICAgZ2V0VGV4dFdpZHRoKGxvbmdlc3RSb3csIFwiMXJlbSBTZWdvZSBVSSBSZWd1bGFyLCBTZWdvZVVJLCBTZWdvZSBVSVwiKSxcbiAgICAgICAgMTAwMFxuICAgICAgKTtcbiAgICAgIGNvbnN0IGhlaWdodCA9IDEwOSArIChyb3dzLmxlbmd0aCArIGFkZGl0aW9uYWxSb3dzKSAqIDIwO1xuICAgICAgcmV0dXJuIGF3YWl0IFhybS5OYXZpZ2F0aW9uLm9wZW5BbGVydERpYWxvZyhcbiAgICAgICAge1xuICAgICAgICAgIGNvbmZpcm1CdXR0b25MYWJlbDogXCJPa1wiLFxuICAgICAgICAgIHRleHQsXG4gICAgICAgICAgdGl0bGUsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgd2lkdGgsXG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgY29uc29sZS5lcnJvcihlcnJvci5tZXNzYWdlKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguJHtnZXRNZXRob2ROYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXNlcyBjYW52YXMubWVhc3VyZVRleHQgdG8gY29tcHV0ZSBhbmQgcmV0dXJuIHRoZSB3aWR0aCBvZiB0aGUgZ2l2ZW4gdGV4dCBvZiBnaXZlbiBmb250IGluIHBpeGVscy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0IFRoZSB0ZXh0IHRvIGJlIHJlbmRlcmVkLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBmb250IFRoZSBjc3MgZm9udCBkZXNjcmlwdG9yIHRoYXQgdGV4dCBpcyB0byBiZSByZW5kZXJlZCB3aXRoIChlLmcuIFwiYm9sZCAxNHB4IHZlcmRhbmFcIikuXG4gICAgICpcbiAgICAgKiBAc2VlIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzExODI0MS9jYWxjdWxhdGUtdGV4dC13aWR0aC13aXRoLWphdmFzY3JpcHQvMjEwMTUzOTMjMjEwMTUzOTNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBnZXRUZXh0V2lkdGgodGV4dDogc3RyaW5nLCBmb250OiBzdHJpbmcpIHtcbiAgICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG4gICAgICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgIGNvbnRleHQuZm9udCA9IGZvbnQ7XG4gICAgICBjb25zdCBtZXRyaWNzID0gY29udGV4dC5tZWFzdXJlVGV4dCh0ZXh0KTtcbiAgICAgIHJldHVybiBtZXRyaWNzLndpZHRoO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogUmVwcmVzZW50cyBhIGZvcm0gaW4gRHluYW1pY3MgMzY1LlxuICAgKi9cbiAgZXhwb3J0IGNsYXNzIEZvcm0ge1xuICAgIHByb3RlY3RlZCBzdGF0aWMgX2Zvcm1Db250ZXh0OiBYcm0uRm9ybUNvbnRleHQ7XG4gICAgcHJvdGVjdGVkIHN0YXRpYyBfZXhlY3V0aW9uQ29udGV4dDogWHJtLkV2ZW50cy5FdmVudENvbnRleHQ7XG4gICAgY29uc3RydWN0b3IoKSB7fVxuICAgIC8qKkdldHMgYSByZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgZm9ybSBjb250ZXh0Ki9cbiAgICBzdGF0aWMgZ2V0IGZvcm1Db250ZXh0KCk6IFhybS5Gb3JtQ29udGV4dCB7XG4gICAgICByZXR1cm4gdGhpcy5fZm9ybUNvbnRleHQ7XG4gICAgfVxuICAgIC8qKkdldHMgYSByZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgZXhlY3V0aW8gY29udGV4dCovXG4gICAgc3RhdGljIGdldCBleGVjdXRpb25Db250ZXh0KCk6IFhybS5FdmVudHMuRXZlbnRDb250ZXh0IHtcbiAgICAgIHJldHVybiB0aGlzLl9leGVjdXRpb25Db250ZXh0O1xuICAgIH1cbiAgICAvKipHZXRzIGEgbG9va3VwIHZhbHVlIHRoYXQgcmVmZXJlbmNlcyB0aGUgcmVjb3JkLiovXG4gICAgc3RhdGljIGdldCBlbnRpdHlSZWZlcmVuY2UoKSB7XG4gICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC5kYXRhLmVudGl0eS5nZXRFbnRpdHlSZWZlcmVuY2UoKTtcbiAgICB9XG4gICAgLyoqU2V0cyBhIHJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBmb3JtIGNvbnRleHQqL1xuICAgIHN0YXRpYyBzZXQgZm9ybUNvbnRleHQoY29udGV4dDogWHJtLkZvcm1Db250ZXh0IHwgWHJtLkV2ZW50cy5FdmVudENvbnRleHQpIHtcbiAgICAgIGlmIChcImdldEZvcm1Db250ZXh0XCIgaW4gY29udGV4dCkge1xuICAgICAgICB0aGlzLl9leGVjdXRpb25Db250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgdGhpcy5fZm9ybUNvbnRleHQgPSBjb250ZXh0LmdldEZvcm1Db250ZXh0KCk7XG4gICAgICB9IGVsc2UgaWYgKFwiZGF0YVwiIGluIGNvbnRleHQpIHRoaXMuX2Zvcm1Db250ZXh0ID0gY29udGV4dDtcbiAgICAgIGVsc2VcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBUaGVpYUZ4LkZvcm0uc2V0Rm9ybUNvbnRleHQ6IFRoZSBleGVjdXRpb25Db250ZXh0IG9yIGZvcm1Db250ZXh0IHdhcyBub3QgcGFzc2VkIHRvIHRoZSBmdW5jdGlvbi5gXG4gICAgICAgICk7XG4gICAgfVxuICAgIC8qKlNldHMgYSByZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgZXhlY3V0aW9uIGNvbnRleHQqL1xuICAgIHN0YXRpYyBzZXQgZXhlY3V0aW9uQ29udGV4dChcbiAgICAgIGNvbnRleHQ6IFhybS5Gb3JtQ29udGV4dCB8IFhybS5FdmVudHMuRXZlbnRDb250ZXh0XG4gICAgKSB7XG4gICAgICBpZiAoXCJnZXRGb3JtQ29udGV4dFwiIGluIGNvbnRleHQpIHtcbiAgICAgICAgdGhpcy5fZXhlY3V0aW9uQ29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgIHRoaXMuX2Zvcm1Db250ZXh0ID0gY29udGV4dC5nZXRGb3JtQ29udGV4dCgpO1xuICAgICAgfSBlbHNlIGlmIChcImRhdGFcIiBpbiBjb250ZXh0KSB0aGlzLl9mb3JtQ29udGV4dCA9IGNvbnRleHQ7XG4gICAgICBlbHNlXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVGhlaWFGeC5Gb3JtLnNldEV4ZWN1dGlvbkNvbnRleHQ6IFRoZSBleGVjdXRpb25Db250ZXh0IG9yIGZvcm1Db250ZXh0IHdhcyBub3QgcGFzc2VkIHRvIHRoZSBmdW5jdGlvbi5gXG4gICAgICAgICk7XG4gICAgfVxuICAgIC8qKlJldHVybnMgdHJ1ZSBpZiBmb3JtIGlzIGZyb20gdHlwZSBjcmVhdGUqL1xuICAgIHN0YXRpYyBnZXQgSXNDcmVhdGUoKSB7XG4gICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC51aS5nZXRGb3JtVHlwZSgpID09IDE7XG4gICAgfVxuICAgIC8qKlJldHVybnMgdHJ1ZSBpZiBmb3JtIGlzIGZyb20gdHlwZSB1cGRhdGUqL1xuICAgIHN0YXRpYyBnZXQgSXNVcGRhdGUoKSB7XG4gICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC51aS5nZXRGb3JtVHlwZSgpID09IDI7XG4gICAgfVxuICAgIC8qKlJldHVybnMgdHJ1ZSBpZiBmb3JtIGlzIG5vdCBmcm9tIHR5cGUgY3JlYXRlKi9cbiAgICBzdGF0aWMgZ2V0IElzTm90Q3JlYXRlKCkge1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQudWkuZ2V0Rm9ybVR5cGUoKSAhPSAxO1xuICAgIH1cbiAgICAvKipSZXR1cm5zIHRydWUgaWYgZm9ybSBpcyBub3QgZnJvbSB0eXBlIHVwZGF0ZSovXG4gICAgc3RhdGljIGdldCBJc05vdFVwZGF0ZSgpIHtcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LnVpLmdldEZvcm1UeXBlKCkgIT0gMjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGlzcGxheXMgYSBmb3JtIGxldmVsIG5vdGlmaWNhdGlvbi4gQW55IG51bWJlciBvZiBub3RpZmljYXRpb25zIGNhbiBiZSBkaXNwbGF5ZWQgYW5kIHdpbGwgcmVtYWluIHVudGlsIHJlbW92ZWQgdXNpbmcgY2xlYXJGb3JtTm90aWZpY2F0aW9uLlxuICAgICAqIFRoZSBoZWlnaHQgb2YgdGhlIG5vdGlmaWNhdGlvbiBhcmVhIGlzIGxpbWl0ZWQgc28gZWFjaCBuZXcgbWVzc2FnZSB3aWxsIGJlIGFkZGVkIHRvIHRoZSB0b3AuXG4gICAgICogQHBhcmFtIG1lc3NhZ2UgVGhlIHRleHQgb2YgdGhlIG5vdGlmaWNhdGlvbiBtZXNzYWdlLlxuICAgICAqIEBwYXJhbSBsZXZlbCBUaGUgbGV2ZWwgb2YgdGhlIG5vdGlmaWNhdGlvbiB3aGljaCBkZWZpbmVzIGhvdyB0aGUgbWVzc2FnZSB3aWxsIGJlIGRpc3BsYXllZCwgc3VjaCBhcyB0aGUgaWNvbi5cbiAgICAgKiBFUlJPUjogTm90aWZpY2F0aW9uIHdpbGwgdXNlIHRoZSBzeXN0ZW0gZXJyb3IgaWNvbi5cbiAgICAgKiBXQVJOSU5HOiBOb3RpZmljYXRpb24gd2lsbCB1c2UgdGhlIHN5c3RlbSB3YXJuaW5nIGljb24uXG4gICAgICogSU5GTzogTm90aWZpY2F0aW9uIHdpbGwgdXNlIHRoZSBzeXN0ZW0gaW5mbyBpY29uLlxuICAgICAqIEBwYXJhbSB1bmlxdWVJZCBVbmlxdWUgaWRlbnRpZmllciBmb3IgdGhlIG5vdGlmaWNhdGlvbiB3aGljaCBpcyB1c2VkIHdpdGggY2xlYXJGb3JtTm90aWZpY2F0aW9uIHRvIHJlbW92ZSB0aGUgbm90aWZpY2F0aW9uLlxuICAgICAqIEByZXR1cm5zIHRydWUgaWYgaXQgc3VjY2VlZHMsIG90aGVyd2lzZSBmYWxzZS5cbiAgICAgKi9cbiAgICBzdGF0aWMgYWRkRm9ybU5vdGlmaWNhdGlvbihcbiAgICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICAgIGxldmVsOiBYcm0uRm9ybU5vdGlmaWNhdGlvbkxldmVsLFxuICAgICAgdW5pcXVlSWQ6IHN0cmluZ1xuICAgICkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQudWkuc2V0Rm9ybU5vdGlmaWNhdGlvbihcbiAgICAgICAgICBtZXNzYWdlLFxuICAgICAgICAgIGxldmVsLFxuICAgICAgICAgIHVuaXF1ZUlkXG4gICAgICAgICk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlaWFGeC4ke1hybUV4LmdldE1ldGhvZE5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDbGVhcnMgdGhlIGZvcm0gbm90aWZpY2F0aW9uIGRlc2NyaWJlZCBieSB1bmlxdWVJZC5cbiAgICAgKiBAcGFyYW0gdW5pcXVlSWQgVW5pcXVlIGlkZW50aWZpZXIuXG4gICAgICogQHJldHVybnMgVHJ1ZSBpZiBpdCBzdWNjZWVkcywgb3RoZXJ3aXNlIGZhbHNlLlxuICAgICAqL1xuICAgIHN0YXRpYyByZW1vdmVGb3JtTm90aWZpY2F0aW9uKHVuaXF1ZUlkOiBzdHJpbmcpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LnVpLmNsZWFyRm9ybU5vdGlmaWNhdGlvbih1bmlxdWVJZCk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlaWFGeC4ke1hybUV4LmdldE1ldGhvZE5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgaGFuZGxlciB0byBiZSBjYWxsZWQgd2hlbiB0aGUgcmVjb3JkIGlzIHNhdmVkLlxuICAgICAqL1xuICAgIHN0YXRpYyBhZGRPblNhdmVFdmVudEhhbmRsZXIoXG4gICAgICBoYW5kbGVyczpcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyXG4gICAgICAgIHwgWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlcltdXG4gICAgKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoaGFuZGxlcnMpKSB7XG4gICAgICAgICAgaGFuZGxlcnMgPSBbaGFuZGxlcnNdO1xuICAgICAgICB9XG4gICAgICAgIGhhbmRsZXJzLmZvckVhY2goKGhhbmRsZXIpID0+IHtcbiAgICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAnJHtoYW5kbGVyfScgaXMgbm90IGEgZnVuY3Rpb25gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLmVudGl0eS5hZGRPblNhdmUoaGFuZGxlcik7XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZWlhRnguJHtYcm1FeC5nZXRNZXRob2ROYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBhZnRlciB0aGUgT25TYXZlIGlzIGNvbXBsZXRlLlxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFRoZSBoYW5kbGVyLlxuICAgICAqIEByZW1hcmtzIEFkZGVkIGluIDkuMlxuICAgICAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZG9jcy5taWNyb3NvZnQuY29tL2VuLXVzL3Bvd2VyYXBwcy9kZXZlbG9wZXIvbW9kZWwtZHJpdmVuLWFwcHMvY2xpZW50YXBpL3JlZmVyZW5jZS9ldmVudHMvcG9zdHNhdmUgRXh0ZXJuYWwgTGluazogUG9zdFNhdmUgRXZlbnQgRG9jdW1lbnRhdGlvbn1cbiAgICAgKi9cbiAgICBzdGF0aWMgYWRkT25Qb3N0U2F2ZUV2ZW50SGFuZGxlcihcbiAgICAgIGhhbmRsZXJzOlxuICAgICAgICB8IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXJcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyW11cbiAgICApIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShoYW5kbGVycykpIHtcbiAgICAgICAgICBoYW5kbGVycyA9IFtoYW5kbGVyc107XG4gICAgICAgIH1cbiAgICAgICAgaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCcke2hhbmRsZXJ9JyBpcyBub3QgYSBmdW5jdGlvbmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEuZW50aXR5LmFkZE9uUG9zdFNhdmUoaGFuZGxlcik7XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZWlhRnguJHtYcm1FeC5nZXRNZXRob2ROYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIGZvcm0gZGF0YSBpcyBsb2FkZWQuXG4gICAgICogQHBhcmFtIGhhbmRsZXIgVGhlIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIGZvcm0gZGF0YSBsb2Fkcy4gVGhlIGZ1bmN0aW9uIHdpbGwgYmUgYWRkZWQgdG8gdGhlIGJvdHRvbSBvZiB0aGUgZXZlbnQgaGFuZGxlciBwaXBlbGluZS5cbiAgICAgKi9cbiAgICBzdGF0aWMgYWRkT25Mb2FkRXZlbnRIYW5kbGVyKFxuICAgICAgaGFuZGxlcnM6XG4gICAgICAgIHwgWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlclxuICAgICAgICB8IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXJbXVxuICAgICkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGhhbmRsZXJzKSkge1xuICAgICAgICAgIGhhbmRsZXJzID0gW2hhbmRsZXJzXTtcbiAgICAgICAgfVxuICAgICAgICBoYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJyR7aGFuZGxlcn0nIGlzIG5vdCBhIGZ1bmN0aW9uYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5hZGRPbkxvYWQoaGFuZGxlcik7XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZWlhRnguJHtYcm1FeC5nZXRNZXRob2ROYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhIGhhbmRsZXIgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGF0dHJpYnV0ZSdzIHZhbHVlIGlzIGNoYW5nZWQuXG4gICAgICogQHBhcmFtIGhhbmRsZXIgVGhlIGZ1bmN0aW9uIHJlZmVyZW5jZS5cbiAgICAgKi9cbiAgICBzdGF0aWMgYWRkT25DaGFuZ2VFdmVudEhhbmRsZXIoXG4gICAgICBmaWVsZHM6IEZpZWxkW10sXG4gICAgICBoYW5kbGVyczpcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyXG4gICAgICAgIHwgWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlcltdLFxuICAgICAgZXhlY3V0ZT86IGJvb2xlYW5cbiAgICApIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShoYW5kbGVycykpIHtcbiAgICAgICAgICBoYW5kbGVycyA9IFtoYW5kbGVyc107XG4gICAgICAgIH1cbiAgICAgICAgaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCcke2hhbmRsZXJ9JyBpcyBub3QgYSBmdW5jdGlvbmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgICAgIGZpZWxkLmFkZE9uQ2hhbmdlKGhhbmRsZXIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGV4ZWN1dGUpIHtcbiAgICAgICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgICAgIGZpZWxkLkF0dHJpYnV0ZS5maXJlT25DaGFuZ2UoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZWlhRnguJHtYcm1FeC5nZXRNZXRob2ROYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIFVzZWQgdG8gZXhlY3V0ZSBtZXRob2RzIHJlbGF0ZWQgdG8gYSBzaW5nbGUgQXR0cmlidXRlXG4gICAqL1xuICBleHBvcnQgY2xhc3MgRmllbGQgaW1wbGVtZW50cyBYcm0uQXR0cmlidXRlcy5BdHRyaWJ1dGUge1xuICAgIHB1YmxpYyBzdGF0aWMgYWxsRmllbGRzOiBGaWVsZFtdID0gW107XG5cbiAgICBwdWJsaWMgcmVhZG9ubHkgTmFtZSE6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgX2F0dHJpYnV0ZT86IFhybS5BdHRyaWJ1dGVzLkF0dHJpYnV0ZTtcblxuICAgIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZU5hbWU6IHN0cmluZykge1xuICAgICAgY29uc3QgZXhpc3RpbmdGaWVsZCA9IEZpZWxkLmFsbEZpZWxkcy5maW5kKFxuICAgICAgICAoZikgPT4gZi5OYW1lID09PSBhdHRyaWJ1dGVOYW1lXG4gICAgICApO1xuICAgICAgaWYgKGV4aXN0aW5nRmllbGQpIHtcbiAgICAgICAgcmV0dXJuIGV4aXN0aW5nRmllbGQ7XG4gICAgICB9XG4gICAgICB0aGlzLk5hbWUgPSBhdHRyaWJ1dGVOYW1lO1xuICAgICAgRmllbGQuYWxsRmllbGRzLnB1c2godGhpcyk7XG4gICAgfVxuICAgIHNldFZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgfVxuICAgIGdldEF0dHJpYnV0ZVR5cGUoKTogWHJtLkF0dHJpYnV0ZXMuQXR0cmlidXRlVHlwZSB7XG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0QXR0cmlidXRlVHlwZSgpO1xuICAgIH1cbiAgICBnZXRGb3JtYXQoKTogWHJtLkF0dHJpYnV0ZXMuQXR0cmlidXRlRm9ybWF0IHtcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRGb3JtYXQoKTtcbiAgICB9XG4gICAgZ2V0SXNEaXJ0eSgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRJc0RpcnR5KCk7XG4gICAgfVxuICAgIGdldE5hbWUoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXROYW1lKCk7XG4gICAgfVxuICAgIGdldFBhcmVudCgpOiBYcm0uRW50aXR5IHtcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRQYXJlbnQoKTtcbiAgICB9XG4gICAgZ2V0UmVxdWlyZWRMZXZlbCgpOiBYcm0uQXR0cmlidXRlcy5SZXF1aXJlbWVudExldmVsIHtcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRSZXF1aXJlZExldmVsKCk7XG4gICAgfVxuICAgIGdldFN1Ym1pdE1vZGUoKTogWHJtLlN1Ym1pdE1vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFN1Ym1pdE1vZGUoKTtcbiAgICB9XG4gICAgZ2V0VXNlclByaXZpbGVnZSgpOiBYcm0uUHJpdmlsZWdlIHtcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRVc2VyUHJpdmlsZWdlKCk7XG4gICAgfVxuICAgIHJlbW92ZU9uQ2hhbmdlKGhhbmRsZXI6IFhybS5FdmVudHMuQXR0cmlidXRlLkNoYW5nZUV2ZW50SGFuZGxlcik6IHZvaWQge1xuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLnJlbW92ZU9uQ2hhbmdlKGhhbmRsZXIpO1xuICAgIH1cbiAgICBzZXRTdWJtaXRNb2RlKHN1Ym1pdE1vZGU6IFhybS5TdWJtaXRNb2RlKTogdm9pZCB7XG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuc2V0U3VibWl0TW9kZShzdWJtaXRNb2RlKTtcbiAgICB9XG4gICAgZ2V0VmFsdWUoKSB7XG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0VmFsdWUoKTtcbiAgICB9XG4gICAgc2V0SXNWYWxpZChpc1ZhbGlkOiBib29sZWFuLCBtZXNzYWdlPzogc3RyaW5nKTogdm9pZCB7XG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuc2V0SXNWYWxpZChpc1ZhbGlkLCBtZXNzYWdlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IEF0dHJpYnV0ZSgpOiBYcm0uQXR0cmlidXRlcy5BdHRyaWJ1dGUge1xuICAgICAgcmV0dXJuICh0aGlzLl9hdHRyaWJ1dGUgPz89XG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKHRoaXMuTmFtZSkgPz9cbiAgICAgICAgWHJtRXgudGhyb3dFcnJvcihcbiAgICAgICAgICBgVGhlIGF0dHJpYnV0ZSAnJHt0aGlzLk5hbWV9JyB3YXMgbm90IGZvdW5kIG9uIHRoZSBmb3JtLmBcbiAgICAgICAgKSk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBjb250cm9scygpOiBYcm0uQ29sbGVjdGlvbi5JdGVtQ29sbGVjdGlvbjxYcm0uQ29udHJvbHMuU3RhbmRhcmRDb250cm9sPiB7XG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuY29udHJvbHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgdmFsdWUuXG4gICAgICogQHJldHVybnMgVGhlIHZhbHVlLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgVmFsdWUoKTogYW55IHtcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRWYWx1ZSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgVmFsdWUodmFsdWU6IGFueSkge1xuICAgICAgdGhpcy5BdHRyaWJ1dGUuc2V0VmFsdWUodmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgYSBjb250cm9sLWxvY2FsIG5vdGlmaWNhdGlvbiBtZXNzYWdlLlxuICAgICAqIEBwYXJhbSBtZXNzYWdlIFRoZSBtZXNzYWdlLlxuICAgICAqIEBwYXJhbSB1bmlxdWVJZCBVbmlxdWUgaWRlbnRpZmllci5cbiAgICAgKiBAcmV0dXJucyB0cnVlIGlmIGl0IHN1Y2NlZWRzLCBmYWxzZSBpZiBpdCBmYWlscy5cbiAgICAgKiBAcmVtYXJrcyAgICAgV2hlbiB0aGlzIG1ldGhvZCBpcyB1c2VkIG9uIE1pY3Jvc29mdCBEeW5hbWljcyBDUk0gZm9yIHRhYmxldHMgYSByZWQgXCJYXCIgaWNvblxuICAgICAqICAgICAgICAgICAgICBhcHBlYXJzIG5leHQgdG8gdGhlIGNvbnRyb2wuIFRhcHBpbmcgb24gdGhlIGljb24gd2lsbCBkaXNwbGF5IHRoZSBtZXNzYWdlLlxuICAgICAqL1xuICAgIHB1YmxpYyBzZXROb3RpZmljYXRpb24obWVzc2FnZTogc3RyaW5nLCB1bmlxdWVJZDogc3RyaW5nKTogdGhpcyB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIW1lc3NhZ2UpIHRocm93IG5ldyBFcnJvcihgbm8gbWVzc2FnZSB3YXMgcHJvdmlkZWQuYCk7XG4gICAgICAgIGlmICghdW5pcXVlSWQpIHRocm93IG5ldyBFcnJvcihgbm8gdW5pcXVlSWQgd2FzIHByb3ZpZGVkLmApO1xuICAgICAgICB0aGlzLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2wpID0+XG4gICAgICAgICAgY29udHJvbC5zZXROb3RpZmljYXRpb24obWVzc2FnZSwgdW5pcXVlSWQpXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZWlhRnguJHtYcm1FeC5nZXRNZXRob2ROYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSB2aXNpYmlsaXR5IHN0YXRlLlxuICAgICAqIEBwYXJhbSB2aXNpYmxlIHRydWUgdG8gc2hvdywgZmFsc2UgdG8gaGlkZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0VmlzaWJsZSh2aXNpYmxlOiBib29sZWFuKTogdGhpcyB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2wpID0+IGNvbnRyb2wuc2V0VmlzaWJsZSh2aXNpYmxlKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZWlhRnguJHtYcm1FeC5nZXRNZXRob2ROYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBzdGF0ZSBvZiB0aGUgY29udHJvbCB0byBlaXRoZXIgZW5hYmxlZCwgb3IgZGlzYWJsZWQuXG4gICAgICogQHBhcmFtIGRpc2FibGVkIHRydWUgdG8gZGlzYWJsZSwgZmFsc2UgdG8gZW5hYmxlLlxuICAgICAqL1xuICAgIHB1YmxpYyBzZXREaXNhYmxlZChkaXNhYmxlZDogYm9vbGVhbik6IHRoaXMge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PiBjb250cm9sLnNldERpc2FibGVkKGRpc2FibGVkKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZWlhRnguJHtYcm1FeC5nZXRNZXRob2ROYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSByZXF1aXJlZCBsZXZlbC5cbiAgICAgKiBAcGFyYW0gcmVxdWlyZW1lbnRMZXZlbCBUaGUgcmVxdWlyZW1lbnQgbGV2ZWwsIGFzIGVpdGhlciBcIm5vbmVcIiwgXCJyZXF1aXJlZFwiLCBvciBcInJlY29tbWVuZGVkXCJcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0UmVxdWlyZWRMZXZlbChcbiAgICAgIHJlcXVpcmVtZW50TGV2ZWw6IFhybS5BdHRyaWJ1dGVzLlJlcXVpcmVtZW50TGV2ZWxcbiAgICApOiB0aGlzIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuQXR0cmlidXRlLnNldFJlcXVpcmVkTGV2ZWwocmVxdWlyZW1lbnRMZXZlbCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZWlhRnguJHtYcm1FeC5nZXRNZXRob2ROYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSByZXF1aXJlZCBsZXZlbC5cbiAgICAgKiBAcGFyYW0gcmVxdWlyZWQgVGhlIHJlcXVpcmVtZW50IGxldmVsLCBhcyBlaXRoZXIgZmFsc2UgZm9yIFwibm9uZVwiIG9yIHRydWUgZm9yIFwicmVxdWlyZWRcIlxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRSZXF1aXJlZChyZXF1aXJlZDogYm9vbGVhbik6IHRoaXMge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5BdHRyaWJ1dGUuc2V0UmVxdWlyZWRMZXZlbChyZXF1aXJlZCA/IFwicmVxdWlyZWRcIiA6IFwibm9uZVwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlaWFGeC4ke1hybUV4LmdldE1ldGhvZE5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKkZpcmUgYWxsIFwib24gY2hhbmdlXCIgZXZlbnQgaGFuZGxlcnMuICovXG4gICAgcHVibGljIGZpcmVPbkNoYW5nZSgpOiB0aGlzIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuQXR0cmlidXRlLmZpcmVPbkNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGVpYUZ4LiR7WHJtRXguZ2V0TWV0aG9kTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGhhbmRsZXIgb3IgYW4gYXJyYXkgb2YgaGFuZGxlcnMgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGF0dHJpYnV0ZSdzIHZhbHVlIGlzIGNoYW5nZWQuXG4gICAgICogQHBhcmFtIGhhbmRsZXJzIFRoZSBmdW5jdGlvbiByZWZlcmVuY2Ugb3IgYW4gYXJyYXkgb2YgZnVuY3Rpb24gcmVmZXJlbmNlcy5cbiAgICAgKi9cbiAgICBwdWJsaWMgYWRkT25DaGFuZ2UoXG4gICAgICBoYW5kbGVyczpcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyXG4gICAgICAgIHwgWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlcltdXG4gICAgKTogdGhpcyB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShoYW5kbGVycykpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGhhbmRsZXIgb2YgaGFuZGxlcnMpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gXCJmdW5jdGlvblwiKVxuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCcke2hhbmRsZXJ9JyBpcyBub3QgYSBmdW5jdGlvbmApO1xuICAgICAgICAgICAgdGhpcy5BdHRyaWJ1dGUucmVtb3ZlT25DaGFuZ2UoaGFuZGxlcik7XG4gICAgICAgICAgICB0aGlzLkF0dHJpYnV0ZS5hZGRPbkNoYW5nZShoYW5kbGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVycyAhPT0gXCJmdW5jdGlvblwiKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAnJHtoYW5kbGVyc30nIGlzIG5vdCBhIGZ1bmN0aW9uYCk7XG4gICAgICAgICAgdGhpcy5BdHRyaWJ1dGUucmVtb3ZlT25DaGFuZ2UoaGFuZGxlcnMpO1xuICAgICAgICAgIHRoaXMuQXR0cmlidXRlLmFkZE9uQ2hhbmdlKGhhbmRsZXJzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGVpYUZ4LiR7WHJtRXguZ2V0TWV0aG9kTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGlzcGxheXMgYW4gZXJyb3Igb3IgcmVjb21tZW5kYXRpb24gbm90aWZpY2F0aW9uIGZvciBhIGNvbnRyb2wsIGFuZCBsZXRzIHlvdSBzcGVjaWZ5IGFjdGlvbnMgdG8gZXhlY3V0ZSBiYXNlZCBvbiB0aGUgbm90aWZpY2F0aW9uLlxuICAgICAqL1xuICAgIHB1YmxpYyBhZGROb3RpZmljYXRpb24oXG4gICAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgICBub3RpZmljYXRpb25MZXZlbDogXCJFUlJPUlwiIHwgXCJSRUNPTU1FTkRBVElPTlwiLFxuICAgICAgdW5pcXVlSWQ6IHN0cmluZyxcbiAgICAgIGFjdGlvbnM/OiBYcm0uQ29udHJvbHMuQ29udHJvbE5vdGlmaWNhdGlvbkFjdGlvbltdXG4gICAgKTogdGhpcyB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXVuaXF1ZUlkKSB0aHJvdyBuZXcgRXJyb3IoYG5vIHVuaXF1ZUlkIHdhcyBwcm92aWRlZC5gKTtcbiAgICAgICAgaWYgKGFjdGlvbnMgJiYgIUFycmF5LmlzQXJyYXkoYWN0aW9ucykpXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYHRoZSBhY3Rpb24gcGFyYW1ldGVyIGlzIG5vdCBhbiBhcnJheSBvZiBDb250cm9sTm90aWZpY2F0aW9uQWN0aW9uYFxuICAgICAgICAgICk7XG4gICAgICAgIHRoaXMuY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT4ge1xuICAgICAgICAgIGNvbnRyb2wuYWRkTm90aWZpY2F0aW9uKHtcbiAgICAgICAgICAgIG1lc3NhZ2VzOiBbbWVzc2FnZV0sXG4gICAgICAgICAgICBub3RpZmljYXRpb25MZXZlbDogbm90aWZpY2F0aW9uTGV2ZWwsXG4gICAgICAgICAgICB1bmlxdWVJZDogdW5pcXVlSWQsXG4gICAgICAgICAgICBhY3Rpb25zOiBhY3Rpb25zLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlaWFGeC4ke1hybUV4LmdldE1ldGhvZE5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDbGVhcnMgdGhlIG5vdGlmaWNhdGlvbiBpZGVudGlmaWVkIGJ5IHVuaXF1ZUlkLlxuICAgICAqIEBwYXJhbSB1bmlxdWVJZCAoT3B0aW9uYWwpIFVuaXF1ZSBpZGVudGlmaWVyLlxuICAgICAqIEByZXR1cm5zIHRydWUgaWYgaXQgc3VjY2VlZHMsIGZhbHNlIGlmIGl0IGZhaWxzLlxuICAgICAqIEByZW1hcmtzIElmIHRoZSB1bmlxdWVJZCBwYXJhbWV0ZXIgaXMgbm90IHVzZWQsIHRoZSBjdXJyZW50IG5vdGlmaWNhdGlvbiBzaG93biB3aWxsIGJlIHJlbW92ZWQuXG4gICAgICovXG4gICAgcmVtb3ZlTm90aWZpY2F0aW9uKHVuaXF1ZUlkOiBzdHJpbmcpOiB0aGlzIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT4ge1xuICAgICAgICAgIGNvbnRyb2wuY2xlYXJOb3RpZmljYXRpb24odW5pcXVlSWQpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlaWFGeC4ke1hybUV4LmdldE1ldGhvZE5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBleHBvcnQgY2xhc3MgVGV4dEZpZWxkXG4gICAgZXh0ZW5kcyBGaWVsZFxuICAgIGltcGxlbWVudHMgWHJtLkF0dHJpYnV0ZXMuU3RyaW5nQXR0cmlidXRlXG4gIHtcbiAgICBwcm90ZWN0ZWQgZGVjbGFyZSBfYXR0cmlidXRlOiBYcm0uQXR0cmlidXRlcy5TdHJpbmdBdHRyaWJ1dGU7XG4gICAgY29uc3RydWN0b3IoYXR0cmlidXRlOiBzdHJpbmcpIHtcbiAgICAgIHN1cGVyKGF0dHJpYnV0ZSk7XG4gICAgfVxuICAgIGdldE1heExlbmd0aCgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldE1heExlbmd0aCgpO1xuICAgIH1cbiAgICBnZXRGb3JtYXQoKTogWHJtLkF0dHJpYnV0ZXMuU3RyaW5nQXR0cmlidXRlRm9ybWF0IHtcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRGb3JtYXQoKSBhcyBYcm0uQXR0cmlidXRlcy5TdHJpbmdBdHRyaWJ1dGVGb3JtYXQ7XG4gICAgfVxuICAgIGdldCBBdHRyaWJ1dGUoKSB7XG4gICAgICByZXR1cm4gKHRoaXMuX2F0dHJpYnV0ZSA/Pz1cbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUodGhpcy5OYW1lKSA/P1xuICAgICAgICBYcm1FeC50aHJvd0Vycm9yKGBGaWVsZCAnJHt0aGlzLk5hbWV9JyBkb2VzIG5vdCBleGlzdGApKTtcbiAgICB9XG4gICAgZ2V0IGNvbnRyb2xzKCkge1xuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmNvbnRyb2xzO1xuICAgIH1cbiAgICBnZXQgVmFsdWUoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRWYWx1ZSgpID8/IG51bGw7XG4gICAgfVxuICAgIHNldCBWYWx1ZSh2YWx1ZTogc3RyaW5nKSB7XG4gICAgICB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgfVxuICB9XG4gIGV4cG9ydCBjbGFzcyBOdW1iZXJGaWVsZFxuICAgIGV4dGVuZHMgRmllbGRcbiAgICBpbXBsZW1lbnRzIFhybS5BdHRyaWJ1dGVzLk51bWJlckF0dHJpYnV0ZVxuICB7XG4gICAgcHJvdGVjdGVkIGRlY2xhcmUgX2F0dHJpYnV0ZTogWHJtLkF0dHJpYnV0ZXMuTnVtYmVyQXR0cmlidXRlO1xuICAgIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZTogc3RyaW5nKSB7XG4gICAgICBzdXBlcihhdHRyaWJ1dGUpO1xuICAgIH1cbiAgICBnZXRGb3JtYXQoKTogWHJtLkF0dHJpYnV0ZXMuSW50ZWdlckF0dHJpYnV0ZUZvcm1hdCB7XG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0Rm9ybWF0KCkgYXMgWHJtLkF0dHJpYnV0ZXMuSW50ZWdlckF0dHJpYnV0ZUZvcm1hdDtcbiAgICB9XG4gICAgZ2V0TWF4KCk6IG51bWJlciB7XG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0TWF4KCk7XG4gICAgfVxuICAgIGdldE1pbigpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldE1pbigpO1xuICAgIH1cbiAgICBnZXRQcmVjaXNpb24oKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRQcmVjaXNpb24oKTtcbiAgICB9XG4gICAgc2V0UHJlY2lzaW9uKHByZWNpc2lvbjogbnVtYmVyKTogdm9pZCB7XG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuc2V0UHJlY2lzaW9uKHByZWNpc2lvbik7XG4gICAgfVxuICAgIGdldCBBdHRyaWJ1dGUoKSB7XG4gICAgICByZXR1cm4gKHRoaXMuX2F0dHJpYnV0ZSA/Pz1cbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUodGhpcy5OYW1lKSA/P1xuICAgICAgICBYcm1FeC50aHJvd0Vycm9yKGBGaWVsZCAnJHt0aGlzLk5hbWV9JyBkb2VzIG5vdCBleGlzdGApKTtcbiAgICB9XG4gICAgZ2V0IGNvbnRyb2xzKCkge1xuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmNvbnRyb2xzO1xuICAgIH1cbiAgICBnZXQgVmFsdWUoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRWYWx1ZSgpID8/IG51bGw7XG4gICAgfVxuICAgIHNldCBWYWx1ZSh2YWx1ZTogbnVtYmVyKSB7XG4gICAgICB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgfVxuICB9XG4gIGV4cG9ydCBjbGFzcyBEYXRlRmllbGQgZXh0ZW5kcyBGaWVsZCBpbXBsZW1lbnRzIFhybS5BdHRyaWJ1dGVzLkRhdGVBdHRyaWJ1dGUge1xuICAgIHByb3RlY3RlZCBkZWNsYXJlIF9hdHRyaWJ1dGU6IFhybS5BdHRyaWJ1dGVzLkRhdGVBdHRyaWJ1dGU7XG4gICAgY29uc3RydWN0b3IoYXR0cmlidXRlOiBzdHJpbmcpIHtcbiAgICAgIHN1cGVyKGF0dHJpYnV0ZSk7XG4gICAgfVxuICAgIGdldEZvcm1hdCgpOiBYcm0uQXR0cmlidXRlcy5EYXRlQXR0cmlidXRlRm9ybWF0IHtcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRGb3JtYXQoKSBhcyBYcm0uQXR0cmlidXRlcy5EYXRlQXR0cmlidXRlRm9ybWF0O1xuICAgIH1cbiAgICBnZXQgQXR0cmlidXRlKCkge1xuICAgICAgcmV0dXJuICh0aGlzLl9hdHRyaWJ1dGUgPz89XG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKHRoaXMuTmFtZSkgPz9cbiAgICAgICAgWHJtRXgudGhyb3dFcnJvcihgRmllbGQgJyR7dGhpcy5OYW1lfScgZG9lcyBub3QgZXhpc3RgKSk7XG4gICAgfVxuICAgIGdldCBjb250cm9scygpIHtcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5jb250cm9scztcbiAgICB9XG4gICAgZ2V0IFZhbHVlKCk6IERhdGUge1xuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFZhbHVlKCkgPz8gbnVsbDtcbiAgICB9XG4gICAgc2V0IFZhbHVlKHZhbHVlOiBEYXRlKSB7XG4gICAgICB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgfVxuICB9XG4gIGV4cG9ydCBjbGFzcyBCb29sZWFuRmllbGRcbiAgICBleHRlbmRzIEZpZWxkXG4gICAgaW1wbGVtZW50cyBYcm0uQXR0cmlidXRlcy5Cb29sZWFuQXR0cmlidXRlXG4gIHtcbiAgICBwcm90ZWN0ZWQgZGVjbGFyZSBfYXR0cmlidXRlOiBYcm0uQXR0cmlidXRlcy5Cb29sZWFuQXR0cmlidXRlO1xuICAgIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZTogc3RyaW5nKSB7XG4gICAgICBzdXBlcihhdHRyaWJ1dGUpO1xuICAgIH1cbiAgICBnZXRBdHRyaWJ1dGVUeXBlKCkge1xuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEF0dHJpYnV0ZVR5cGUoKTtcbiAgICB9XG4gICAgZ2V0SW5pdGlhbFZhbHVlKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEluaXRpYWxWYWx1ZSgpO1xuICAgIH1cbiAgICBnZXQgQXR0cmlidXRlKCkge1xuICAgICAgcmV0dXJuICh0aGlzLl9hdHRyaWJ1dGUgPz89XG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKHRoaXMuTmFtZSkgPz9cbiAgICAgICAgWHJtRXgudGhyb3dFcnJvcihgRmllbGQgJyR7dGhpcy5OYW1lfScgZG9lcyBub3QgZXhpc3RgKSk7XG4gICAgfVxuICAgIGdldCBjb250cm9scygpIHtcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5jb250cm9scztcbiAgICB9XG4gICAgZ2V0IFZhbHVlKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFZhbHVlKCkgPz8gbnVsbDtcbiAgICB9XG4gICAgc2V0IFZhbHVlKHZhbHVlOiBib29sZWFuKSB7XG4gICAgICB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgfVxuICB9XG4gIGV4cG9ydCBjbGFzcyBNdWx0aVNlbGVjdE9wdGlvblNldEZpZWxkPE9wdGlvbnMgZXh0ZW5kcyBPcHRpb25WYWx1ZXM+XG4gICAgZXh0ZW5kcyBGaWVsZFxuICAgIGltcGxlbWVudHMgWHJtLkF0dHJpYnV0ZXMuTXVsdGlTZWxlY3RPcHRpb25TZXRBdHRyaWJ1dGVcbiAge1xuICAgIHByb3RlY3RlZCBkZWNsYXJlIF9hdHRyaWJ1dGU6IFhybS5BdHRyaWJ1dGVzLk11bHRpU2VsZWN0T3B0aW9uU2V0QXR0cmlidXRlO1xuICAgIE9wdGlvbjogT3B0aW9ucztcbiAgICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsIG9wdGlvbj86IE9wdGlvbnMpIHtcbiAgICAgIHN1cGVyKGF0dHJpYnV0ZU5hbWUpO1xuICAgICAgdGhpcy5PcHRpb24gPSBvcHRpb247XG4gICAgfVxuICAgIGdldEZvcm1hdCgpOiBYcm0uQXR0cmlidXRlcy5PcHRpb25TZXRBdHRyaWJ1dGVGb3JtYXQge1xuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEZvcm1hdCgpIGFzIFhybS5BdHRyaWJ1dGVzLk9wdGlvblNldEF0dHJpYnV0ZUZvcm1hdDtcbiAgICB9XG4gICAgZ2V0T3B0aW9uKHZhbHVlOiBudW1iZXIgfCBzdHJpbmcpOiBYcm0uT3B0aW9uU2V0VmFsdWUge1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0T3B0aW9uKHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRPcHRpb24odmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBnZXRPcHRpb25zKCk6IFhybS5PcHRpb25TZXRWYWx1ZVtdIHtcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRPcHRpb25zKCk7XG4gICAgfVxuICAgIGdldFNlbGVjdGVkT3B0aW9uKCk6IFhybS5PcHRpb25TZXRWYWx1ZVtdIHtcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRTZWxlY3RlZE9wdGlvbigpO1xuICAgIH1cbiAgICBnZXRUZXh0KCk6IHN0cmluZ1tdIHtcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRUZXh0KCk7XG4gICAgfVxuICAgIGdldEluaXRpYWxWYWx1ZSgpOiBudW1iZXJbXSB7XG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0SW5pdGlhbFZhbHVlKCk7XG4gICAgfVxuICAgIGdldCBBdHRyaWJ1dGUoKSB7XG4gICAgICByZXR1cm4gKHRoaXMuX2F0dHJpYnV0ZSA/Pz1cbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUodGhpcy5OYW1lKSA/P1xuICAgICAgICBYcm1FeC50aHJvd0Vycm9yKGBGaWVsZCAnJHt0aGlzLk5hbWV9JyBkb2VzIG5vdCBleGlzdGApKTtcbiAgICB9XG4gICAgZ2V0IGNvbnRyb2xzKCkge1xuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmNvbnRyb2xzO1xuICAgIH1cbiAgICBnZXQgVmFsdWUoKTogbnVtYmVyW10ge1xuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFZhbHVlKCk7XG4gICAgfVxuICAgIHNldCBWYWx1ZSh2YWx1ZTogKGtleW9mIE9wdGlvbnMpW10gfCBudW1iZXJbXSkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIGxldCB2YWx1ZXMgPSBbXTtcbiAgICAgICAgdmFsdWUuZm9yRWFjaCgodikgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgdiA9PSBcIm51bWJlclwiKSB2YWx1ZXMucHVzaCh2KTtcbiAgICAgICAgICBlbHNlIHZhbHVlcy5wdXNoKHRoaXMuT3B0aW9uW3ZdKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKHZhbHVlcyk7XG4gICAgICB9IGVsc2UgWHJtRXgudGhyb3dFcnJvcihgRmllbGQgVmFsdWUgJyR7dmFsdWV9JyBpcyBub3QgYW4gQXJyYXlgKTtcbiAgICB9XG4gIH1cbiAgZXhwb3J0IGNsYXNzIExvb2t1cEZpZWxkXG4gICAgZXh0ZW5kcyBGaWVsZFxuICAgIGltcGxlbWVudHMgWHJtLkF0dHJpYnV0ZXMuTG9va3VwQXR0cmlidXRlXG4gIHtcbiAgICBwcm90ZWN0ZWQgZGVjbGFyZSBfYXR0cmlidXRlOiBYcm0uQXR0cmlidXRlcy5Mb29rdXBBdHRyaWJ1dGU7XG4gICAgcHJvdGVjdGVkIF9jdXN0b21GaWx0ZXJzOiBhbnkgPSBbXTtcbiAgICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGU6IHN0cmluZykge1xuICAgICAgc3VwZXIoYXR0cmlidXRlKTtcbiAgICB9XG4gICAgZ2V0SXNQYXJ0eUxpc3QoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0SXNQYXJ0eUxpc3QoKTtcbiAgICB9XG4gICAgZ2V0IEF0dHJpYnV0ZSgpIHtcbiAgICAgIHJldHVybiAodGhpcy5fYXR0cmlidXRlID8/PVxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZSh0aGlzLk5hbWUpID8/XG4gICAgICAgIFhybUV4LnRocm93RXJyb3IoYEZpZWxkICcke3RoaXMuTmFtZX0nIGRvZXMgbm90IGV4aXN0YCkpO1xuICAgIH1cbiAgICBnZXQgY29udHJvbHMoKSB7XG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuY29udHJvbHM7XG4gICAgfVxuICAgIC8qKkdldHMgdGhlIGlkIG9mIHRoZSBmaXJzdCBsb29rdXAgdmFsdWUqL1xuICAgIGdldCBJZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLlZhbHVlICYmIHRoaXMuVmFsdWUubGVuZ3RoID4gMFxuICAgICAgICA/IFhybUV4Lm5vcm1hbGl6ZUd1aWQodGhpcy5WYWx1ZVswXS5pZClcbiAgICAgICAgOiBudWxsO1xuICAgIH1cbiAgICAvKipHZXRzIHRoZSBlbnRpdHlUeXBlIG9mIHRoZSBmaXJzdCBsb29rdXAgdmFsdWUqL1xuICAgIGdldCBFbnRpdHlUeXBlKCkge1xuICAgICAgcmV0dXJuIHRoaXMuVmFsdWUgJiYgdGhpcy5WYWx1ZS5sZW5ndGggPiAwXG4gICAgICAgID8gdGhpcy5WYWx1ZVswXS5lbnRpdHlUeXBlXG4gICAgICAgIDogbnVsbDtcbiAgICB9XG4gICAgLyoqR2V0cyB0aGUgZm9ybWF0dGVkIHZhbHVlIG9mIHRoZSBmaXJzdCBsb29rdXAgdmFsdWUqL1xuICAgIGdldCBGb3JtYXR0ZWRWYWx1ZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLlZhbHVlICYmIHRoaXMuVmFsdWUubGVuZ3RoID4gMCA/IHRoaXMuVmFsdWVbMF0ubmFtZSA6IG51bGw7XG4gICAgfVxuICAgIGdldCBWYWx1ZSgpOiBYcm0uTG9va3VwVmFsdWVbXSB7XG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0VmFsdWUoKSA/PyBudWxsO1xuICAgIH1cbiAgICBzZXQgVmFsdWUodmFsdWU6IFhybS5Mb29rdXBWYWx1ZVtdKSB7XG4gICAgICB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHZhbHVlIG9mIGEgbG9va3VwXG4gICAgICogQHBhcmFtIGlkIEd1aWQgb2YgdGhlIHJlY29yZFxuICAgICAqIEBwYXJhbSBlbnRpdHlUeXBlIGxvZ2ljYWxuYW1lIG9mIHRoZSBlbnRpdHlcbiAgICAgKiBAcGFyYW0gbmFtZSBmb3JtYXR0ZWQgdmFsdWVcbiAgICAgKiBAcGFyYW0gYXBwZW5kIGlmIHRydWUsIGFkZHMgdmFsdWUgdG8gdGhlIGFycmF5IGluc3RlYWQgb2YgcmVwbGFjaW5nIGl0XG4gICAgICovXG4gICAgc2V0TG9va3VwVmFsdWUoXG4gICAgICBpZDogc3RyaW5nLFxuICAgICAgZW50aXR5VHlwZTogYW55LFxuICAgICAgbmFtZTogYW55LFxuICAgICAgYXBwZW5kID0gZmFsc2VcbiAgICApOiB0aGlzIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghaWQpIHRocm93IG5ldyBFcnJvcihgbm8gaWQgcGFyYW1ldGVyIHdhcyBwcm92aWRlZC5gKTtcbiAgICAgICAgaWYgKCFlbnRpdHlUeXBlKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgbm8gZW50aXR5VHlwZSBwYXJhbWV0ZXIgd2FzIHByb3ZpZGVkLmApO1xuICAgICAgICBpZCA9IFhybUV4Lm5vcm1hbGl6ZUd1aWQoaWQpO1xuICAgICAgICBjb25zdCBsb29rdXBWYWx1ZSA9IHtcbiAgICAgICAgICBpZCxcbiAgICAgICAgICBlbnRpdHlUeXBlLFxuICAgICAgICAgIG5hbWUsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuVmFsdWUgPVxuICAgICAgICAgIGFwcGVuZCAmJiB0aGlzLlZhbHVlID8gdGhpcy5WYWx1ZS5jb25jYXQobG9va3VwVmFsdWUpIDogW2xvb2t1cFZhbHVlXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlaWFGeC4ke1hybUV4LmdldE1ldGhvZE5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZXMgYW4gZW50aXR5IHJlY29yZC5cbiAgICAgKiBAcGFyYW0gb3B0aW9ucyAoT3B0aW9uYWwpIE9EYXRhIHN5c3RlbSBxdWVyeSBvcHRpb25zLCAkc2VsZWN0IGFuZCAkZXhwYW5kLCB0byByZXRyaWV2ZSB5b3VyIGRhdGEuXG4gICAgICogLSBVc2UgdGhlICRzZWxlY3Qgc3lzdGVtIHF1ZXJ5IG9wdGlvbiB0byBsaW1pdCB0aGUgcHJvcGVydGllcyByZXR1cm5lZCBieSBpbmNsdWRpbmcgYSBjb21tYS1zZXBhcmF0ZWRcbiAgICAgKiAgIGxpc3Qgb2YgcHJvcGVydHkgbmFtZXMuIFRoaXMgaXMgYW4gaW1wb3J0YW50IHBlcmZvcm1hbmNlIGJlc3QgcHJhY3RpY2UuIElmIHByb3BlcnRpZXMgYXJlbuKAmXRcbiAgICAgKiAgIHNwZWNpZmllZCB1c2luZyAkc2VsZWN0LCBhbGwgcHJvcGVydGllcyB3aWxsIGJlIHJldHVybmVkLlxuICAgICAqIC0gVXNlIHRoZSAkZXhwYW5kIHN5c3RlbSBxdWVyeSBvcHRpb24gdG8gY29udHJvbCB3aGF0IGRhdGEgZnJvbSByZWxhdGVkIGVudGl0aWVzIGlzIHJldHVybmVkLiBJZiB5b3VcbiAgICAgKiAgIGp1c3QgaW5jbHVkZSB0aGUgbmFtZSBvZiB0aGUgbmF2aWdhdGlvbiBwcm9wZXJ0eSwgeW914oCZbGwgcmVjZWl2ZSBhbGwgdGhlIHByb3BlcnRpZXMgZm9yIHJlbGF0ZWRcbiAgICAgKiAgIHJlY29yZHMuIFlvdSBjYW4gbGltaXQgdGhlIHByb3BlcnRpZXMgcmV0dXJuZWQgZm9yIHJlbGF0ZWQgcmVjb3JkcyB1c2luZyB0aGUgJHNlbGVjdCBzeXN0ZW0gcXVlcnlcbiAgICAgKiAgIG9wdGlvbiBpbiBwYXJlbnRoZXNlcyBhZnRlciB0aGUgbmF2aWdhdGlvbiBwcm9wZXJ0eSBuYW1lLiBVc2UgdGhpcyBmb3IgYm90aCBzaW5nbGUtdmFsdWVkIGFuZFxuICAgICAqICAgY29sbGVjdGlvbi12YWx1ZWQgbmF2aWdhdGlvbiBwcm9wZXJ0aWVzLlxuICAgICAqIC0gWW91IGNhbiBhbHNvIHNwZWNpZnkgbXVsdGlwbGUgcXVlcnkgb3B0aW9ucyBieSB1c2luZyAmIHRvIHNlcGFyYXRlIHRoZSBxdWVyeSBvcHRpb25zLlxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPm9wdGlvbnMgZXhhbXBsZTo8L2NhcHRpb24+XG4gICAgICogb3B0aW9uczogJHNlbGVjdD1uYW1lJiRleHBhbmQ9cHJpbWFyeWNvbnRhY3RpZCgkc2VsZWN0PWNvbnRhY3RpZCxmdWxsbmFtZSlcbiAgICAgKiBAcmV0dXJucyBPbiBzdWNjZXNzLCByZXR1cm5zIGEgcHJvbWlzZSBjb250YWluaW5nIGEgSlNPTiBvYmplY3Qgd2l0aCB0aGUgcmV0cmlldmVkIGF0dHJpYnV0ZXMgYW5kIHRoZWlyIHZhbHVlcy5cbiAgICAgKiBAc2VlIHtAbGluayBodHRwczovL2RvY3MubWljcm9zb2Z0LmNvbS9lbi11cy9keW5hbWljczM2NS9jdXN0b21lci1lbmdhZ2VtZW50L2RldmVsb3Blci9jbGllbnRhcGkvcmVmZXJlbmNlL3hybS13ZWJhcGkvcmV0cmlldmVyZWNvcmQgRXh0ZXJuYWwgTGluazogcmV0cmlldmVSZWNvcmQgKENsaWVudCBBUEkgcmVmZXJlbmNlKX1cbiAgICAgKi9cbiAgICBhc3luYyByZXRyaWV2ZShvcHRpb25zOiBzdHJpbmcpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdGhpcy5JZCB8fCAhdGhpcy5FbnRpdHlUeXBlKSByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgcmVjb3JkID0gYXdhaXQgWHJtLldlYkFwaS5yZXRyaWV2ZVJlY29yZChcbiAgICAgICAgICB0aGlzLkVudGl0eVR5cGUsXG4gICAgICAgICAgdGhpcy5JZCxcbiAgICAgICAgICBvcHRpb25zXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZWNvcmQ7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlaWFGeC4ke1hybUV4LmdldE1ldGhvZE5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGFuIGFkZGl0aW9uYWwgY3VzdG9tIGZpbHRlciB0byB0aGUgbG9va3VwLCB3aXRoIHRoZSBcIkFORFwiIGZpbHRlciBvcGVyYXRvci5cbiAgICAgKiBAcGFyYW0gZmlsdGVyIFNwZWNpZmllcyB0aGUgZmlsdGVyLCBhcyBhIHNlcmlhbGl6ZWQgRmV0Y2hYTUwgXCJmaWx0ZXJcIiBub2RlLlxuICAgICAqIEBwYXJhbSBlbnRpdHlMb2dpY2FsTmFtZSAoT3B0aW9uYWwpIFRoZSBsb2dpY2FsIG5hbWUgb2YgdGhlIGVudGl0eS5cbiAgICAgKiBAcmVtYXJrcyAgICAgSWYgZW50aXR5TG9naWNhbE5hbWUgaXMgbm90IHNwZWNpZmllZCwgdGhlIGZpbHRlciB3aWxsIGJlIGFwcGxpZWQgdG8gYWxsIGVudGl0aWVzXG4gICAgICogICAgICAgICAgICAgIHZhbGlkIGZvciB0aGUgTG9va3VwIGNvbnRyb2wuXG4gICAgICogQGV4YW1wbGUgICAgIEV4YW1wbGUgZmlsdGVyOiA8ZmlsdGVyIHR5cGU9XCJhbmRcIj5cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwiYWRkcmVzczFfY2l0eVwiIG9wZXJhdG9yPVwiZXFcIiB2YWx1ZT1cIlJlZG1vbmRcIiAvPlxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9maWx0ZXI+XG4gICAgICovXG4gICAgYWRkUHJlRmlsdGVyVG9Mb29rdXAoZmlsdGVyWG1sOiBzdHJpbmcsIGVudGl0eUxvZ2ljYWxOYW1lPzogc3RyaW5nKTogdGhpcyB7XG4gICAgICB0cnkge1xuICAgICAgICBfYWRkQ3VzdG9tRmlsdGVyLmNvbnRyb2xzID0gdGhpcy5jb250cm9scztcbiAgICAgICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PiB7XG4gICAgICAgICAgY29udHJvbC5hZGRQcmVTZWFyY2goX2FkZEN1c3RvbUZpbHRlcik7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9jdXN0b21GaWx0ZXJzLnB1c2goX2FkZEN1c3RvbUZpbHRlcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZWlhRnguJHtYcm1FeC5nZXRNZXRob2ROYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gX2FkZEN1c3RvbUZpbHRlcigpIHtcbiAgICAgICAgX2FkZEN1c3RvbUZpbHRlci5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PiB7XG4gICAgICAgICAgY29udHJvbC5hZGRDdXN0b21GaWx0ZXIoZmlsdGVyWG1sLCBlbnRpdHlMb2dpY2FsTmFtZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGFuIGFkZGl0aW9uYWwgY3VzdG9tIGZpbHRlciB0byB0aGUgbG9va3VwLCB3aXRoIHRoZSBcIkFORFwiIGZpbHRlciBvcGVyYXRvci5cbiAgICAgKiBAcGFyYW0gZW50aXR5TG9naWNhbE5hbWUgKE9wdGlvbmFsKSBUaGUgbG9naWNhbCBuYW1lIG9mIHRoZSBlbnRpdHkuXG4gICAgICogQHBhcmFtIHByaW1hcnlBdHRyaWJ1dGVJZE5hbWUgKE9wdGlvbmFsKSBUaGUgbG9naWNhbCBuYW1lIG9mIHRoZSBwcmltYXJ5IGtleS5cbiAgICAgKiBAcGFyYW0gZmV0Y2hYbWwgU3BlY2lmaWVzIHRoZSBGZXRjaFhNTCB1c2VkIHRvIGZpbHRlci5cbiAgICAgKiBAcmVtYXJrcyAgICAgSWYgZW50aXR5TG9naWNhbE5hbWUgaXMgbm90IHNwZWNpZmllZCwgdGhlIGZpbHRlciB3aWxsIGJlIGFwcGxpZWQgdG8gYWxsIGVudGl0aWVzXG4gICAgICogICAgICAgICAgICAgIHZhbGlkIGZvciB0aGUgTG9va3VwIGNvbnRyb2wuXG4gICAgICogQGV4YW1wbGUgICAgIEV4YW1wbGUgZmV0Y2hYbWw6IDxmZXRjaD5cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxlbnRpdHkgbmFtZT1cImNvbnRhY3RcIj5cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZmlsdGVyPlxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwiYWRkcmVzczFfY2l0eVwiIG9wZXJhdG9yPVwiZXFcIiB2YWx1ZT1cIlJlZG1vbmRcIiAvPlxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZmlsdGVyPlxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9lbnRpdHk+XG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2ZldGNoPlxuICAgICAqL1xuICAgIGFzeW5jIGFkZFByZUZpbHRlclRvTG9va3VwQWR2YW5jZWQoXG4gICAgICBlbnRpdHlMb2dpY2FsTmFtZTogc3RyaW5nLFxuICAgICAgcHJpbWFyeUF0dHJpYnV0ZUlkTmFtZTogc3RyaW5nLFxuICAgICAgZmV0Y2hYbWw6IHN0cmluZ1xuICAgICk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgWHJtLldlYkFwaS5vbmxpbmUucmV0cmlldmVNdWx0aXBsZVJlY29yZHMoXG4gICAgICAgICAgZW50aXR5TG9naWNhbE5hbWUsXG4gICAgICAgICAgXCI/ZmV0Y2hYbWw9XCIgKyBmZXRjaFhtbFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBkYXRhID0gcmVzdWx0LmVudGl0aWVzO1xuICAgICAgICBsZXQgZmlsdGVyZWRFbnRpdGllcyA9IFwiXCI7XG4gICAgICAgIF9hZGRDdXN0b21GaWx0ZXIuY29udHJvbHMgPSB0aGlzLmNvbnRyb2xzO1xuICAgICAgICBkYXRhLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICBmaWx0ZXJlZEVudGl0aWVzICs9IGA8dmFsdWU+JHtpdGVtW3ByaW1hcnlBdHRyaWJ1dGVJZE5hbWVdfTwvdmFsdWU+YDtcbiAgICAgICAgfSk7XG4gICAgICAgIGZldGNoWG1sID0gZmlsdGVyZWRFbnRpdGllc1xuICAgICAgICAgID8gYDxmaWx0ZXI+PGNvbmRpdGlvbiBhdHRyaWJ1dGU9JyR7cHJpbWFyeUF0dHJpYnV0ZUlkTmFtZX0nIG9wZXJhdG9yPSdpbic+JHtmaWx0ZXJlZEVudGl0aWVzfTwvY29uZGl0aW9uPjwvZmlsdGVyPmBcbiAgICAgICAgICA6IGA8ZmlsdGVyPjxjb25kaXRpb24gYXR0cmlidXRlPScke3ByaW1hcnlBdHRyaWJ1dGVJZE5hbWV9JyBvcGVyYXRvcj0nbnVsbCcvPjwvZmlsdGVyPmA7XG4gICAgICAgIHRoaXMuY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT4ge1xuICAgICAgICAgIGNvbnRyb2wuYWRkUHJlU2VhcmNoKF9hZGRDdXN0b21GaWx0ZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fY3VzdG9tRmlsdGVycy5wdXNoKF9hZGRDdXN0b21GaWx0ZXIpO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZWlhRnguJHtYcm1FeC5nZXRNZXRob2ROYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIF9hZGRDdXN0b21GaWx0ZXIoKSB7XG4gICAgICAgIF9hZGRDdXN0b21GaWx0ZXIuY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT4ge1xuICAgICAgICAgIGNvbnRyb2wuYWRkQ3VzdG9tRmlsdGVyKGZldGNoWG1sLCBlbnRpdHlMb2dpY2FsTmFtZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCBmaWx0ZXJzIHNldCBvbiB0aGUgY3VycmVudCBsb29rdXAgYXR0cmlidXRlIGJ5IHVzaW5nIGFkZFByZUZpbHRlclRvTG9va3VwIG9yIGFkZFByZUZpbHRlclRvTG9va3VwQWR2YW5jZWRcbiAgICAgKi9cbiAgICBjbGVhclByZUZpbHRlckZyb21Mb29rdXAoKTogdGhpcyB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLl9jdXN0b21GaWx0ZXJzLmZvckVhY2goXG4gICAgICAgICAgKGN1c3RvbUZpbHRlcjogWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlcikgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnRyb2wucmVtb3ZlUHJlU2VhcmNoKGN1c3RvbUZpbHRlcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZWlhRnguJHtYcm1FeC5nZXRNZXRob2ROYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgdHlwZSBPcHRpb25WYWx1ZXMgPSB7XG4gICAgW2tleTogc3RyaW5nXTogbnVtYmVyO1xuICB9O1xuICBleHBvcnQgY2xhc3MgT3B0aW9uc2V0RmllbGQ8T3B0aW9ucyBleHRlbmRzIE9wdGlvblZhbHVlcz5cbiAgICBleHRlbmRzIEZpZWxkXG4gICAgaW1wbGVtZW50cyBYcm0uQXR0cmlidXRlcy5PcHRpb25TZXRBdHRyaWJ1dGVcbiAge1xuICAgIHByb3RlY3RlZCBkZWNsYXJlIF9hdHRyaWJ1dGU6IFhybS5BdHRyaWJ1dGVzLk9wdGlvblNldEF0dHJpYnV0ZTtcbiAgICBwcm90ZWN0ZWQgX2NvbnRyb2whOiBYcm0uQ29udHJvbHMuT3B0aW9uU2V0Q29udHJvbDtcbiAgICBPcHRpb246IE9wdGlvbnM7XG4gICAgY29uc3RydWN0b3IoYXR0cmlidXRlTmFtZTogc3RyaW5nLCBvcHRpb24/OiBPcHRpb25zKSB7XG4gICAgICBzdXBlcihhdHRyaWJ1dGVOYW1lKTtcbiAgICAgIHRoaXMuT3B0aW9uID0gb3B0aW9uO1xuICAgIH1cbiAgICBnZXRGb3JtYXQoKTogWHJtLkF0dHJpYnV0ZXMuT3B0aW9uU2V0QXR0cmlidXRlRm9ybWF0IHtcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRGb3JtYXQoKSBhcyBYcm0uQXR0cmlidXRlcy5PcHRpb25TZXRBdHRyaWJ1dGVGb3JtYXQ7XG4gICAgfVxuICAgIGdldE9wdGlvbih2YWx1ZTogbnVtYmVyIHwgc3RyaW5nKTogWHJtLk9wdGlvblNldFZhbHVlIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldE9wdGlvbih2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0T3B0aW9uKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZ2V0T3B0aW9ucygpOiBYcm0uT3B0aW9uU2V0VmFsdWVbXSB7XG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0T3B0aW9ucygpO1xuICAgIH1cbiAgICBnZXRTZWxlY3RlZE9wdGlvbigpOiBYcm0uT3B0aW9uU2V0VmFsdWUge1xuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFNlbGVjdGVkT3B0aW9uKCk7XG4gICAgfVxuICAgIGdldFRleHQoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRUZXh0KCk7XG4gICAgfVxuICAgIGdldEluaXRpYWxWYWx1ZSgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEluaXRpYWxWYWx1ZSgpO1xuICAgIH1cbiAgICBnZXQgQXR0cmlidXRlKCkge1xuICAgICAgcmV0dXJuICh0aGlzLl9hdHRyaWJ1dGUgPz89XG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKHRoaXMuTmFtZSkgPz9cbiAgICAgICAgWHJtRXgudGhyb3dFcnJvcihgRmllbGQgJyR7dGhpcy5OYW1lfScgZG9lcyBub3QgZXhpc3RgKSk7XG4gICAgfVxuICAgIGdldCBjb250cm9scygpIHtcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5jb250cm9scztcbiAgICB9XG4gICAgZ2V0IGNvbnRyb2woKSB7XG4gICAgICByZXR1cm4gKHRoaXMuX2NvbnRyb2wgPz89XG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZ2V0Q29udHJvbCh0aGlzLk5hbWUpID8/XG4gICAgICAgIFhybUV4LnRocm93RXJyb3IoYENvbnRyb2wgJyR7dGhpcy5OYW1lfScgZG9lcyBub3QgZXhpc3RgKSk7XG4gICAgfVxuICAgIGdldCBWYWx1ZSgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFZhbHVlKCk7XG4gICAgfVxuICAgIHNldCBWYWx1ZSh2YWx1ZToga2V5b2YgT3B0aW9ucyB8IG51bWJlcikge1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PSBcIm51bWJlclwiKSB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgICBlbHNlIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKHRoaXMuT3B0aW9uW3ZhbHVlXSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgYW4gb3B0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIHZhbHVlcyBhbiBhcnJheSB3aXRoIHRoZSBvcHRpb24gdmFsdWVzIHRvIGFkZFxuICAgICAqIEBwYXJhbSBpbmRleCAoT3B0aW9uYWwpIHplcm8tYmFzZWQgaW5kZXggb2YgdGhlIG9wdGlvbi5cbiAgICAgKlxuICAgICAqIEByZW1hcmtzIFRoaXMgbWV0aG9kIGRvZXMgbm90IGNoZWNrIHRoYXQgdGhlIHZhbHVlcyB3aXRoaW4gdGhlIG9wdGlvbnMgeW91IGFkZCBhcmUgdmFsaWQuXG4gICAgICogICAgICAgICAgSWYgaW5kZXggaXMgbm90IHByb3ZpZGVkLCB0aGUgbmV3IG9wdGlvbiB3aWxsIGJlIGFkZGVkIHRvIHRoZSBlbmQgb2YgdGhlIGxpc3QuXG4gICAgICovXG4gICAgYWRkT3B0aW9uKHZhbHVlczogbnVtYmVyW10sIGluZGV4PzogbnVtYmVyKTogdGhpcyB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWVzKSlcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHZhbHVlcyBpcyBub3QgYW4gQXJyYXk6XFxudmFsdWVzOiAnJHt2YWx1ZXN9J2ApO1xuICAgICAgICBjb25zdCBvcHRpb25TZXRWYWx1ZXMgPSB0aGlzLmNvbnRyb2wuZ2V0QXR0cmlidXRlKCkuZ2V0T3B0aW9ucygpID8/IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2Ygb3B0aW9uU2V0VmFsdWVzKSB7XG4gICAgICAgICAgaWYgKHZhbHVlcy5pbmNsdWRlcyhlbGVtZW50LnZhbHVlKSkge1xuICAgICAgICAgICAgdGhpcy5jb250cm9sLmFkZE9wdGlvbihlbGVtZW50LCBpbmRleCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZWlhRnguJHtYcm1FeC5nZXRNZXRob2ROYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgb3B0aW9uIG1hdGNoaW5nIHRoZSB2YWx1ZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUuXG4gICAgICovXG4gICAgcmVtb3ZlT3B0aW9uKHZhbHVlczogbnVtYmVyW10pOiB0aGlzIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZXMpKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgdmFsdWVzIGlzIG5vdCBhbiBBcnJheTpcXG52YWx1ZXM6ICcke3ZhbHVlc30nYCk7XG4gICAgICAgIGNvbnN0IG9wdGlvblNldFZhbHVlcyA9IHRoaXMuY29udHJvbC5nZXRBdHRyaWJ1dGUoKS5nZXRPcHRpb25zKCkgPz8gW107XG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBvcHRpb25TZXRWYWx1ZXMpIHtcbiAgICAgICAgICBpZiAodmFsdWVzLmluY2x1ZGVzKGVsZW1lbnQudmFsdWUpKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2wucmVtb3ZlT3B0aW9uKGVsZW1lbnQudmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGVpYUZ4LiR7WHJtRXguZ2V0TWV0aG9kTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENsZWFycyBhbGwgb3B0aW9ucy5cbiAgICAgKi9cbiAgICBjbGVhck9wdGlvbnMoKTogdGhpcyB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLmNvbnRyb2wuY2xlYXJPcHRpb25zKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZWlhRnguJHtYcm1FeC5nZXRNZXRob2ROYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZXhwb3J0IGNsYXNzIFNlY3Rpb24gaW1wbGVtZW50cyBYcm0uQ29udHJvbHMuU2VjdGlvbiB7XG4gICAgcHVibGljIHJlYWRvbmx5IE5hbWUhOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIF9zZWN0aW9uPzogWHJtLkNvbnRyb2xzLlNlY3Rpb247XG4gICAgcHVibGljIHBhcmVudFRhYj86IFhybS5Db250cm9scy5UYWI7XG4gICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgICB0aGlzLk5hbWUgPSBuYW1lO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0IFNlY3Rpb24oKTogWHJtLkNvbnRyb2xzLlNlY3Rpb24ge1xuICAgICAgcmV0dXJuICh0aGlzLl9zZWN0aW9uID8/PVxuICAgICAgICB0aGlzLnBhcmVudFRhYi5zZWN0aW9ucy5nZXQodGhpcy5OYW1lKSA/P1xuICAgICAgICBYcm1FeC50aHJvd0Vycm9yKFxuICAgICAgICAgIGBUaGUgc2VjdGlvbiAnJHt0aGlzLk5hbWV9JyB3YXMgbm90IGZvdW5kIG9uIHRoZSBmb3JtLmBcbiAgICAgICAgKSk7XG4gICAgfVxuICAgIGdldE5hbWUoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiB0aGlzLlNlY3Rpb24uZ2V0TmFtZSgpO1xuICAgIH1cbiAgICBnZXRQYXJlbnQoKTogWHJtLkNvbnRyb2xzLlRhYiB7XG4gICAgICByZXR1cm4gdGhpcy5TZWN0aW9uLmdldFBhcmVudCgpO1xuICAgIH1cbiAgICBjb250cm9sczogWHJtLkNvbGxlY3Rpb24uSXRlbUNvbGxlY3Rpb248WHJtLkNvbnRyb2xzLkNvbnRyb2w+O1xuICAgIHNldFZpc2libGUodmlzaWJsZTogYm9vbGVhbik6IHZvaWQge1xuICAgICAgcmV0dXJuIHRoaXMuU2VjdGlvbi5zZXRWaXNpYmxlKHZpc2libGUpO1xuICAgIH1cbiAgICBnZXRWaXNpYmxlKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuU2VjdGlvbi5nZXRWaXNpYmxlKCk7XG4gICAgfVxuICAgIGdldExhYmVsKCk6IHN0cmluZyB7XG4gICAgICByZXR1cm4gdGhpcy5TZWN0aW9uLmdldExhYmVsKCk7XG4gICAgfVxuICAgIHNldExhYmVsKGxhYmVsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgIHJldHVybiB0aGlzLlNlY3Rpb24uc2V0TGFiZWwobGFiZWwpO1xuICAgIH1cbiAgfVxuICB0eXBlIFRhYlNlY3Rpb25zID0ge1xuICAgIFtrZXk6IHN0cmluZ106IFNlY3Rpb247XG4gIH07XG4gIGV4cG9ydCBjbGFzcyBUYWI8U2VjdGlvbnMgZXh0ZW5kcyBUYWJTZWN0aW9ucz4gaW1wbGVtZW50cyBYcm0uQ29udHJvbHMuVGFiIHtcbiAgICBwdWJsaWMgcmVhZG9ubHkgTmFtZSE6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgX3RhYj86IFhybS5Db250cm9scy5UYWI7XG4gICAgU2VjdGlvbjogU2VjdGlvbnM7XG4gICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCBzZWN0aW9uPzogU2VjdGlvbnMpIHtcbiAgICAgIHRoaXMuTmFtZSA9IG5hbWU7XG4gICAgICB0aGlzLlNlY3Rpb24gPSBzZWN0aW9uO1xuICAgICAgZm9yIChsZXQga2V5IGluIHNlY3Rpb24pIHtcbiAgICAgICAgc2VjdGlvbltrZXldLnBhcmVudFRhYiA9IHRoaXM7XG4gICAgICB9XG4gICAgfVxuICAgIHNlY3Rpb25zOiBYcm0uQ29sbGVjdGlvbi5JdGVtQ29sbGVjdGlvbjxYcm0uQ29udHJvbHMuU2VjdGlvbj47XG5cbiAgICBwdWJsaWMgZ2V0IFRhYigpOiBYcm0uQ29udHJvbHMuVGFiIHtcbiAgICAgIHJldHVybiAodGhpcy5fdGFiID8/PVxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LnVpLnRhYnMuZ2V0KHRoaXMuTmFtZSkgPz9cbiAgICAgICAgWHJtRXgudGhyb3dFcnJvcihgVGhlIHRhYiAnJHt0aGlzLk5hbWV9JyB3YXMgbm90IGZvdW5kIG9uIHRoZSBmb3JtLmApKTtcbiAgICB9XG4gICAgYWRkVGFiU3RhdGVDaGFuZ2UoaGFuZGxlcjogWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlcik6IHZvaWQge1xuICAgICAgcmV0dXJuIHRoaXMuVGFiLmFkZFRhYlN0YXRlQ2hhbmdlKGhhbmRsZXIpO1xuICAgIH1cbiAgICBnZXREaXNwbGF5U3RhdGUoKTogWHJtLkRpc3BsYXlTdGF0ZSB7XG4gICAgICByZXR1cm4gdGhpcy5UYWIuZ2V0RGlzcGxheVN0YXRlKCk7XG4gICAgfVxuICAgIGdldE5hbWUoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiB0aGlzLlRhYi5nZXROYW1lKCk7XG4gICAgfVxuICAgIGdldFBhcmVudCgpOiBYcm0uVWkge1xuICAgICAgcmV0dXJuIHRoaXMuVGFiLmdldFBhcmVudCgpO1xuICAgIH1cbiAgICByZW1vdmVUYWJTdGF0ZUNoYW5nZShoYW5kbGVyOiBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyKTogdm9pZCB7XG4gICAgICByZXR1cm4gdGhpcy5UYWIucmVtb3ZlVGFiU3RhdGVDaGFuZ2UoaGFuZGxlcik7XG4gICAgfVxuICAgIHNldERpc3BsYXlTdGF0ZShkaXNwbGF5U3RhdGU6IFhybS5EaXNwbGF5U3RhdGUpOiB2b2lkIHtcbiAgICAgIHJldHVybiB0aGlzLlRhYi5zZXREaXNwbGF5U3RhdGUoZGlzcGxheVN0YXRlKTtcbiAgICB9XG4gICAgc2V0VmlzaWJsZSh2aXNpYmxlOiBib29sZWFuKTogdm9pZCB7XG4gICAgICByZXR1cm4gdGhpcy5UYWIuc2V0VmlzaWJsZSh2aXNpYmxlKTtcbiAgICB9XG4gICAgZ2V0VmlzaWJsZSgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLlRhYi5nZXRWaXNpYmxlKCk7XG4gICAgfVxuICAgIGdldExhYmVsKCk6IHN0cmluZyB7XG4gICAgICByZXR1cm4gdGhpcy5UYWIuZ2V0TGFiZWwoKTtcbiAgICB9XG4gICAgc2V0TGFiZWwobGFiZWw6IHN0cmluZyk6IHZvaWQge1xuICAgICAgcmV0dXJuIHRoaXMuVGFiLnNldExhYmVsKGxhYmVsKTtcbiAgICB9XG4gICAgc2V0Rm9jdXMoKTogdm9pZCB7XG4gICAgICByZXR1cm4gdGhpcy5UYWIuc2V0Rm9jdXMoKTtcbiAgICB9XG4gIH1cbiAgZXhwb3J0IGNsYXNzIEdyaWRDb250cm9sIGltcGxlbWVudHMgWHJtLkNvbnRyb2xzLkdyaWRDb250cm9sIHtcbiAgICBwdWJsaWMgcmVhZG9ubHkgTmFtZSE6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgX2dyaWRDb250cm9sPzogWHJtLkNvbnRyb2xzLkdyaWRDb250cm9sO1xuICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xuICAgICAgdGhpcy5OYW1lID0gbmFtZTtcbiAgICB9XG4gICAgcHVibGljIGdldCBHcmlkQ29udHJvbCgpOiBYcm0uQ29udHJvbHMuR3JpZENvbnRyb2wge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgKHRoaXMuX2dyaWRDb250cm9sID8/PVxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZ2V0Q29udHJvbDxYcm0uQ29udHJvbHMuR3JpZENvbnRyb2w+KHRoaXMuTmFtZSkpID8/XG4gICAgICAgIFhybUV4LnRocm93RXJyb3IoYFRoZSBncmlkICcke3RoaXMuTmFtZX0nIHdhcyBub3QgZm91bmQgb24gdGhlIGZvcm0uYClcbiAgICAgICk7XG4gICAgfVxuICAgIHB1YmxpYyBnZXQgR3JpZCgpOiBYcm0uQ29udHJvbHMuR3JpZCB7XG4gICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRHcmlkKCk7XG4gICAgfVxuICAgIGFkZE9uTG9hZChoYW5kbGVyOiBYcm0uRXZlbnRzLkdyaWRDb250cm9sLkxvYWRFdmVudEhhbmRsZXIpOiB2b2lkIHtcbiAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmFkZE9uTG9hZChoYW5kbGVyKTtcbiAgICB9XG4gICAgZ2V0Q29udGV4dFR5cGUoKTogWHJtRW51bS5HcmlkQ29udHJvbENvbnRleHQge1xuICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0Q29udGV4dFR5cGUoKTtcbiAgICB9XG4gICAgZ2V0RW50aXR5TmFtZSgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0RW50aXR5TmFtZSgpO1xuICAgIH1cbiAgICBnZXRGZXRjaFhtbCgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0RmV0Y2hYbWwoKTtcbiAgICB9XG4gICAgZ2V0R3JpZCgpOiBYcm0uQ29udHJvbHMuR3JpZCB7XG4gICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRHcmlkKCk7XG4gICAgfVxuICAgIGdldFJlbGF0aW9uc2hpcCgpOiBYcm0uQ29udHJvbHMuR3JpZFJlbGF0aW9uc2hpcCB7XG4gICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRSZWxhdGlvbnNoaXAoKTtcbiAgICB9XG4gICAgZ2V0VXJsKGNsaWVudD86IFhybUVudW0uR3JpZENsaWVudCk6IHN0cmluZyB7XG4gICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRVcmwoY2xpZW50KTtcbiAgICB9XG4gICAgZ2V0Vmlld1NlbGVjdG9yKCk6IFhybS5Db250cm9scy5WaWV3U2VsZWN0b3Ige1xuICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0Vmlld1NlbGVjdG9yKCk7XG4gICAgfVxuICAgIG9wZW5SZWxhdGVkR3JpZCgpOiB2b2lkIHtcbiAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLm9wZW5SZWxhdGVkR3JpZCgpO1xuICAgIH1cbiAgICByZWZyZXNoKCk6IHZvaWQge1xuICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wucmVmcmVzaCgpO1xuICAgIH1cbiAgICByZWZyZXNoUmliYm9uKCk6IHZvaWQge1xuICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wucmVmcmVzaFJpYmJvbigpO1xuICAgIH1cbiAgICByZW1vdmVPbkxvYWQoaGFuZGxlcjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wucmVtb3ZlT25Mb2FkKGhhbmRsZXIpO1xuICAgIH1cbiAgICBnZXRDb250cm9sVHlwZSgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0Q29udHJvbFR5cGUoKTtcbiAgICB9XG4gICAgZ2V0TmFtZSgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0TmFtZSgpO1xuICAgIH1cbiAgICBnZXRQYXJlbnQoKTogWHJtLkNvbnRyb2xzLlNlY3Rpb24ge1xuICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0UGFyZW50KCk7XG4gICAgfVxuICAgIGdldExhYmVsKCk6IHN0cmluZyB7XG4gICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRMYWJlbCgpO1xuICAgIH1cbiAgICBzZXRMYWJlbChsYWJlbDogc3RyaW5nKTogdm9pZCB7XG4gICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5zZXRMYWJlbChsYWJlbCk7XG4gICAgfVxuICAgIGdldFZpc2libGUoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRWaXNpYmxlKCk7XG4gICAgfVxuICAgIHNldFZpc2libGUodmlzaWJsZTogYm9vbGVhbik6IHZvaWQge1xuICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuc2V0VmlzaWJsZSh2aXNpYmxlKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==