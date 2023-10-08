/// <reference path="../node_modules/@types/xrm/index.d.ts" />
export var XrmEx;
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
     * If the environment variable has both a default value and a current value, this function will retrieve the current value.
     * @param {string} environmentVariableSchemaName - The schema name of the environment variable to retrieve.
     * @returns {Promise<string>} - A promise that resolves with the value of the environment variable.
     * @async
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWHJtRXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvWHJtRXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsOERBQThEO0FBa0M5RCxNQUFNLEtBQVcsS0FBSyxDQWc1Q3JCO0FBaDVDRCxXQUFpQixLQUFLO0lBQ3BCOzs7O09BSUc7SUFDSCxTQUFnQixVQUFVLENBQUMsWUFBb0I7UUFDN0MsTUFBTSxJQUFJLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRmUsZ0JBQVUsYUFFekIsQ0FBQTtJQUNEOzs7T0FHRztJQUNILFNBQWdCLGFBQWE7UUFDM0IsSUFBSTtZQUNGLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7WUFDMUIsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUN2RSxNQUFNLG1CQUFtQixHQUN2QixVQUFVLElBQUksVUFBVSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQ25FLE1BQU0saUJBQWlCLEdBQ3JCLG1CQUFtQixFQUFFLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sWUFBWSxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBRW5FLE9BQU8sWUFBWSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxLQUFVLEVBQUU7WUFDbkIsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7U0FDM0Q7SUFDSCxDQUFDO0lBZGUsbUJBQWEsZ0JB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UUFBUSxFQUFFLENBQUM7UUFDckMsQ0FBQztRQUNELFFBQVEsQ0FBQyxLQUFhO1lBQ3BCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUNELFVBQVU7WUFDUixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDdkMsQ0FBQztRQUNELFVBQVUsQ0FBQyxPQUFnQjtZQUN6QixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlDLENBQUM7S0FDRjtJQXpFWSxpQkFBVyxjQXlFdkIsQ0FBQTtBQUNILENBQUMsRUFoNUNnQixLQUFLLEtBQUwsS0FBSyxRQWc1Q3JCIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL25vZGVfbW9kdWxlcy9AdHlwZXMveHJtL2luZGV4LmQudHNcIiAvPlxyXG4vKipcclxuICogUmVwcmVzZW50cyBhIHBhcmFtZXRlciBmb3IgYSByZXF1ZXN0LlxyXG4gKiBAdHlwZSB7T2JqZWN0fSBSZXF1ZXN0UGFyYW1ldGVyXHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBOYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHBhcmFtZXRlci5cclxuICogQHByb3BlcnR5IHsnQm9vbGVhbicgfCAnRGF0ZVRpbWUnIHwgJ0RlY2ltYWwnIHwgJ0VudGl0eScgfCAnRW50aXR5Q29sbGVjdGlvbicgfCAnRW50aXR5UmVmZXJlbmNlJyB8ICdGbG9hdCcgfCAnSW50ZWdlcicgfCAnTW9uZXknIHwgJ1BpY2tsaXN0JyB8ICdTdHJpbmcnfSBUeXBlIC0gVGhlIHR5cGUgb2YgdGhlIHBhcmFtZXRlci5cclxuICogQHByb3BlcnR5IHsqfSBWYWx1ZSAtIFRoZSB2YWx1ZSBvZiB0aGUgcGFyYW1ldGVyLlxyXG4gKi9cclxudHlwZSBSZXF1ZXN0UGFyYW1ldGVyID0ge1xyXG4gIE5hbWU6IHN0cmluZztcclxuICBUeXBlOlxyXG4gIHwgXCJCb29sZWFuXCJcclxuICB8IFwiRGF0ZVRpbWVcIlxyXG4gIHwgXCJEZWNpbWFsXCJcclxuICB8IFwiRW50aXR5XCJcclxuICB8IFwiRW50aXR5Q29sbGVjdGlvblwiXHJcbiAgfCBcIkVudGl0eVJlZmVyZW5jZVwiXHJcbiAgfCBcIkZsb2F0XCJcclxuICB8IFwiSW50ZWdlclwiXHJcbiAgfCBcIk1vbmV5XCJcclxuICB8IFwiUGlja2xpc3RcIlxyXG4gIHwgXCJTdHJpbmdcIjtcclxuICBWYWx1ZTogYW55O1xyXG59O1xyXG4vKipcclxuICogUmVwcmVzZW50cyBhIHJlZmVyZW5jZSB0byBhbiBlbnRpdHkuXHJcbiAqIEB0eXBlXHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBpZCAtIFRoZSBJRCBvZiB0aGUgZW50aXR5LlxyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gZW50aXR5VHlwZSAtIFRoZSB0eXBlIG9mIHRoZSBlbnRpdHkuXHJcbiAqL1xyXG50eXBlIEVudGl0eVJlZmVyZW5jZSA9IHtcclxuICBpZDogc3RyaW5nO1xyXG4gIGVudGl0eVR5cGU6IHN0cmluZztcclxufTtcclxuZXhwb3J0IG5hbWVzcGFjZSBYcm1FeCB7XHJcbiAgLyoqXHJcbiAgICogVGhyb3dzIGFuIGVycm9yIHdpdGggdGhlIGdpdmVuIGVycm9yIG1lc3NhZ2UuXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGVycm9yTWVzc2FnZSAtIFRoZSBlcnJvciBtZXNzYWdlIHRvIHRocm93LlxyXG4gICAqIEB0aHJvd3Mge0Vycm9yfSAtIEFsd2F5cyB0aHJvd3MgYW4gZXJyb3Igd2l0aCB0aGUgZ2l2ZW4gZXJyb3IgbWVzc2FnZS5cclxuICAgKi9cclxuICBleHBvcnQgZnVuY3Rpb24gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2U6IHN0cmluZyk6IG5ldmVyIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBuYW1lIG9mIHRoZSBjYWxsaW5nIGZ1bmN0aW9uLlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gVGhlIG5hbWUgb2YgdGhlIGNhbGxpbmcgZnVuY3Rpb24uXHJcbiAgICovXHJcbiAgZXhwb3J0IGZ1bmN0aW9uIGdldE1ldGhvZE5hbWUoKTogc3RyaW5nIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKCk7XHJcbiAgICAgIGNvbnN0IHN0YWNrVHJhY2UgPSBlcnJvci5zdGFjaz8uc3BsaXQoXCJcXG5cIikubWFwKChsaW5lKSA9PiBsaW5lLnRyaW0oKSk7XHJcbiAgICAgIGNvbnN0IGNhbGxpbmdGdW5jdGlvbkxpbmUgPVxyXG4gICAgICAgIHN0YWNrVHJhY2UgJiYgc3RhY2tUcmFjZS5sZW5ndGggPj0gMyA/IHN0YWNrVHJhY2VbMl0gOiB1bmRlZmluZWQ7XHJcbiAgICAgIGNvbnN0IGZ1bmN0aW9uTmFtZU1hdGNoID1cclxuICAgICAgICBjYWxsaW5nRnVuY3Rpb25MaW5lPy5tYXRjaCgvYXRcXHMrKFteXFxzXSspXFxzK1xcKC8pO1xyXG4gICAgICBjb25zdCBmdW5jdGlvbk5hbWUgPSBmdW5jdGlvbk5hbWVNYXRjaCA/IGZ1bmN0aW9uTmFtZU1hdGNoWzFdIDogXCJcIjtcclxuXHJcbiAgICAgIHJldHVybiBmdW5jdGlvbk5hbWU7XHJcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguZ2V0TWV0aG9kTmFtZTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIERpc3BsYXlzIGEgbm90aWZpY2F0aW9uIGZvciBhbiBhcHAgd2l0aCB0aGUgZ2l2ZW4gbWVzc2FnZSBhbmQgbGV2ZWwsIGFuZCBsZXRzIHlvdSBzcGVjaWZ5IHdoZXRoZXIgdG8gc2hvdyBhIGNsb3NlIGJ1dHRvbi5cclxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIFRoZSBtZXNzYWdlIHRvIGRpc3BsYXkgaW4gdGhlIG5vdGlmaWNhdGlvbi5cclxuICAgKiBAcGFyYW0geydTVUNDRVNTJyB8ICdFUlJPUicgfCAnV0FSTklORycgfCAnSU5GTyd9IGxldmVsIC0gVGhlIGxldmVsIG9mIHRoZSBub3RpZmljYXRpb24uIENhbiBiZSAnU1VDQ0VTUycsICdFUlJPUicsICdXQVJOSU5HJywgb3IgJ0lORk8nLlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3Nob3dDbG9zZUJ1dHRvbj1mYWxzZV0gLSBXaGV0aGVyIHRvIHNob3cgYSBjbG9zZSBidXR0b24gb24gdGhlIG5vdGlmaWNhdGlvbi4gRGVmYXVsdHMgdG8gZmFsc2UuXHJcbiAgICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gLSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBJRCBvZiB0aGUgY3JlYXRlZCBub3RpZmljYXRpb24uXHJcbiAgICovXHJcbiAgZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZEdsb2JhbE5vdGlmaWNhdGlvbihcclxuICAgIG1lc3NhZ2U6IHN0cmluZyxcclxuICAgIGxldmVsOiBcIlNVQ0NFU1NcIiB8IFwiRVJST1JcIiB8IFwiV0FSTklOR1wiIHwgXCJJTkZPXCIsXHJcbiAgICBzaG93Q2xvc2VCdXR0b24gPSBmYWxzZVxyXG4gICk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICBjb25zdCBsZXZlbE1hcCA9IHtcclxuICAgICAgU1VDQ0VTUzogMSxcclxuICAgICAgRVJST1I6IDIsXHJcbiAgICAgIFdBUk5JTkc6IDMsXHJcbiAgICAgIElORk86IDQsXHJcbiAgICB9O1xyXG4gICAgY29uc3QgbWVzc2FnZUxldmVsID0gbGV2ZWxNYXBbbGV2ZWxdIHx8IGxldmVsTWFwLklORk87XHJcbiAgICBjb25zdCBub3RpZmljYXRpb24gPSB7XHJcbiAgICAgIHR5cGU6IDIsXHJcbiAgICAgIGxldmVsOiBtZXNzYWdlTGV2ZWwsXHJcbiAgICAgIG1lc3NhZ2UsXHJcbiAgICAgIHNob3dDbG9zZUJ1dHRvbixcclxuICAgIH07XHJcbiAgICB0cnkge1xyXG4gICAgICByZXR1cm4gYXdhaXQgWHJtLkFwcC5hZGRHbG9iYWxOb3RpZmljYXRpb24obm90aWZpY2F0aW9uKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke2dldE1ldGhvZE5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gICAgfVxyXG4gIH1cclxuICAvKipcclxuICAgKiBDbGVhcnMgYSBub3RpZmljYXRpb24gaW4gdGhlIGFwcCB3aXRoIHRoZSBnaXZlbiB1bmlxdWUgSUQuXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVuaXF1ZUlkIC0gVGhlIHVuaXF1ZSBJRCBvZiB0aGUgbm90aWZpY2F0aW9uIHRvIGNsZWFyLlxyXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IC0gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgbm90aWZpY2F0aW9uIGhhcyBiZWVuIGNsZWFyZWQuXHJcbiAgICovXHJcbiAgZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbW92ZUdsb2JhbE5vdGlmaWNhdGlvbihcclxuICAgIHVuaXF1ZUlkOiBzdHJpbmdcclxuICApOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgcmV0dXJuIGF3YWl0IFhybS5BcHAuY2xlYXJHbG9iYWxOb3RpZmljYXRpb24odW5pcXVlSWQpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7Z2V0TWV0aG9kTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIFJldHJpZXZlcyB0aGUgdmFsdWUgb2YgYW4gZW52aXJvbm1lbnQgdmFyaWFibGUgYnkgdXNpbmcgaXRzIHNjaGVtYSBuYW1lIGFzIGtleS5cclxuICAgKiBJZiB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGUgaGFzIGJvdGggYSBkZWZhdWx0IHZhbHVlIGFuZCBhIGN1cnJlbnQgdmFsdWUsIHRoaXMgZnVuY3Rpb24gd2lsbCByZXRyaWV2ZSB0aGUgY3VycmVudCB2YWx1ZS5cclxuICAgKiBAcGFyYW0ge3N0cmluZ30gZW52aXJvbm1lbnRWYXJpYWJsZVNjaGVtYU5hbWUgLSBUaGUgc2NoZW1hIG5hbWUgb2YgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlIHRvIHJldHJpZXZlLlxyXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IC0gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgdmFsdWUgb2YgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlLlxyXG4gICAqIEBhc3luY1xyXG4gICAqL1xyXG4gIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRFbnZpcm9ubWVudFZhcmlhYmxlVmFsdWUoXHJcbiAgICBlbnZpcm9ubWVudFZhcmlhYmxlU2NoZW1hTmFtZTogc3RyaW5nXHJcbiAgKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgIHJldHVybiBleGVjdXRlRnVuY3Rpb24oXCJSZXRyaWV2ZUVudmlyb25tZW50VmFyaWFibGVWYWx1ZVwiLCBbXHJcbiAgICAgIHtcclxuICAgICAgICBOYW1lOiBcIkRlZmluaXRpb25TY2hlbWFOYW1lXCIsXHJcbiAgICAgICAgVHlwZTogXCJTdHJpbmdcIixcclxuICAgICAgICBWYWx1ZTogZW52aXJvbm1lbnRWYXJpYWJsZVNjaGVtYU5hbWUsXHJcbiAgICAgIH0sXHJcbiAgICBdKTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogQSBtYXAgb2YgQ1JNIGRhdGEgdHlwZXMgdG8gdGhlaXIgY29ycmVzcG9uZGluZyB0eXBlIG5hbWVzLCBzdHJ1Y3R1cmFsIHByb3BlcnRpZXMsIGFuZCBKYXZhU2NyaXB0IHR5cGVzLlxyXG4gICAqIEB0eXBlIHtPYmplY3QuPHN0cmluZywgeyB0eXBlTmFtZTogc3RyaW5nLCBzdHJ1Y3R1cmFsUHJvcGVydHk6IG51bWJlciwganNUeXBlOiBzdHJpbmcgfT59XHJcbiAgICovXHJcbiAgbGV0IHR5cGVNYXAgPSB7XHJcbiAgICBTdHJpbmc6IHsgdHlwZU5hbWU6IFwiRWRtLlN0cmluZ1wiLCBzdHJ1Y3R1cmFsUHJvcGVydHk6IDEsIGpzVHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgSW50ZWdlcjogeyB0eXBlTmFtZTogXCJFZG0uSW50MzJcIiwgc3RydWN0dXJhbFByb3BlcnR5OiAxLCBqc1R5cGU6IFwibnVtYmVyXCIgfSxcclxuICAgIEJvb2xlYW46IHtcclxuICAgICAgdHlwZU5hbWU6IFwiRWRtLkJvb2xlYW5cIixcclxuICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiAxLFxyXG4gICAgICBqc1R5cGU6IFwiYm9vbGVhblwiLFxyXG4gICAgfSxcclxuICAgIERhdGVUaW1lOiB7XHJcbiAgICAgIHR5cGVOYW1lOiBcIkVkbS5EYXRlVGltZU9mZnNldFwiLFxyXG4gICAgICBzdHJ1Y3R1cmFsUHJvcGVydHk6IDEsXHJcbiAgICAgIGpzVHlwZTogXCJvYmplY3RcIixcclxuICAgIH0sXHJcbiAgICBFbnRpdHlSZWZlcmVuY2U6IHtcclxuICAgICAgdHlwZU5hbWU6IFwibXNjcm0uY3JtYmFzZWVudGl0eVwiLFxyXG4gICAgICBzdHJ1Y3R1cmFsUHJvcGVydHk6IDUsXHJcbiAgICAgIGpzVHlwZTogXCJvYmplY3RcIixcclxuICAgIH0sXHJcbiAgICBEZWNpbWFsOiB7XHJcbiAgICAgIHR5cGVOYW1lOiBcIkVkbS5EZWNpbWFsXCIsXHJcbiAgICAgIHN0cnVjdHVyYWxQcm9wZXJ0eTogMSxcclxuICAgICAganNUeXBlOiBcIm51bWJlclwiLFxyXG4gICAgfSxcclxuICAgIEVudGl0eToge1xyXG4gICAgICB0eXBlTmFtZTogXCJtc2NybS5jcm1iYXNlZW50aXR5XCIsXHJcbiAgICAgIHN0cnVjdHVyYWxQcm9wZXJ0eTogNSxcclxuICAgICAganNUeXBlOiBcIm9iamVjdFwiLFxyXG4gICAgfSxcclxuICAgIEVudGl0eUNvbGxlY3Rpb246IHtcclxuICAgICAgdHlwZU5hbWU6IFwiQ29sbGVjdGlvbihtc2NybS5jcm1iYXNlZW50aXR5KVwiLFxyXG4gICAgICBzdHJ1Y3R1cmFsUHJvcGVydHk6IDQsXHJcbiAgICAgIGpzVHlwZTogXCJvYmplY3RcIixcclxuICAgIH0sXHJcbiAgICBGbG9hdDogeyB0eXBlTmFtZTogXCJFZG0uRG91YmxlXCIsIHN0cnVjdHVyYWxQcm9wZXJ0eTogMSwganNUeXBlOiBcIm51bWJlclwiIH0sXHJcbiAgICBNb25leTogeyB0eXBlTmFtZTogXCJFZG0uRGVjaW1hbFwiLCBzdHJ1Y3R1cmFsUHJvcGVydHk6IDEsIGpzVHlwZTogXCJudW1iZXJcIiB9LFxyXG4gICAgUGlja2xpc3Q6IHtcclxuICAgICAgdHlwZU5hbWU6IFwiRWRtLkludDMyXCIsXHJcbiAgICAgIHN0cnVjdHVyYWxQcm9wZXJ0eTogMSxcclxuICAgICAganNUeXBlOiBcIm51bWJlclwiLFxyXG4gICAgfSxcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gcmVxdWVzdCBwYXJhbWV0ZXIgaXMgb2YgYSBzdXBwb3J0ZWQgdHlwZSBhbmQgaGFzIGEgdmFsaWQgdmFsdWUuXHJcbiAgICogQHBhcmFtIHtSZXF1ZXN0UGFyYW1ldGVyfSByZXF1ZXN0UGFyYW1ldGVyIC0gVGhlIHJlcXVlc3QgcGFyYW1ldGVyIHRvIGNoZWNrLlxyXG4gICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAqIEB0aHJvd3Mge0Vycm9yfSAtIFRocm93cyBhbiBlcnJvciBpZiB0aGUgcmVxdWVzdCBwYXJhbWV0ZXIgaXMgbm90IG9mIGEgc3VwcG9ydGVkIHR5cGUgb3IgaGFzIGFuIGludmFsaWQgdmFsdWUuXHJcbiAgICovXHJcbiAgZXhwb3J0IGZ1bmN0aW9uIGNoZWNrUmVxdWVzdFBhcmFtZXRlclR5cGUoXHJcbiAgICByZXF1ZXN0UGFyYW1ldGVyOiBSZXF1ZXN0UGFyYW1ldGVyXHJcbiAgKTogdm9pZCB7XHJcbiAgICBpZiAoIXR5cGVNYXBbcmVxdWVzdFBhcmFtZXRlci5UeXBlXSlcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgIGBUaGUgcHJvcGVydHkgdHlwZSAke3JlcXVlc3RQYXJhbWV0ZXIuVHlwZX0gb2YgdGhlIHByb3BlcnR5ICR7cmVxdWVzdFBhcmFtZXRlci5OYW1lfSBpcyBub3Qgc3VwcG9ydGVkLmBcclxuICAgICAgKTtcclxuICAgIGNvbnN0IGV4cGVjdGVkVHlwZSA9IHR5cGVNYXBbcmVxdWVzdFBhcmFtZXRlci5UeXBlXS5qc1R5cGU7XHJcbiAgICBjb25zdCBhY3R1YWxUeXBlID0gdHlwZW9mIHJlcXVlc3RQYXJhbWV0ZXIuVmFsdWU7XHJcbiAgICBjb25zdCBpbnZhbGlkVHlwZU1lc3NhZ2UgPSBgVGhlIHZhbHVlICR7cmVxdWVzdFBhcmFtZXRlci5WYWx1ZX1cXG5vZiB0aGUgcHJvcGVydHkgJHtyZXF1ZXN0UGFyYW1ldGVyLk5hbWV9XFxuaXMgbm90IG9mIHRoZSBleHBlY3RlZCB0eXBlICR7cmVxdWVzdFBhcmFtZXRlci5UeXBlfS5gO1xyXG4gICAgaWYgKFxyXG4gICAgICByZXF1ZXN0UGFyYW1ldGVyLlR5cGUgPT09IFwiRW50aXR5UmVmZXJlbmNlXCIgfHxcclxuICAgICAgcmVxdWVzdFBhcmFtZXRlci5UeXBlID09PSBcIkVudGl0eVwiXHJcbiAgICApIHtcclxuICAgICAgaWYgKFxyXG4gICAgICAgICFyZXF1ZXN0UGFyYW1ldGVyLlZhbHVlIHx8XHJcbiAgICAgICAgIXJlcXVlc3RQYXJhbWV0ZXIuVmFsdWUuaGFzT3duUHJvcGVydHkoXCJpZFwiKSB8fFxyXG4gICAgICAgICFyZXF1ZXN0UGFyYW1ldGVyLlZhbHVlLmhhc093blByb3BlcnR5KFwiZW50aXR5VHlwZVwiKVxyXG4gICAgICApIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoaW52YWxpZFR5cGVNZXNzYWdlKTtcclxuICAgICAgfVxyXG4gICAgICB0eXBlTWFwW1xyXG4gICAgICAgIHJlcXVlc3RQYXJhbWV0ZXIuVHlwZVxyXG4gICAgICBdLnR5cGVOYW1lID0gYG1zY3JtLiR7cmVxdWVzdFBhcmFtZXRlci5WYWx1ZS5lbnRpdHlUeXBlfWA7XHJcbiAgICB9IGVsc2UgaWYgKHJlcXVlc3RQYXJhbWV0ZXIuVHlwZSA9PT0gXCJFbnRpdHlDb2xsZWN0aW9uXCIpIHtcclxuICAgICAgaWYgKFxyXG4gICAgICAgICFBcnJheS5pc0FycmF5KHJlcXVlc3RQYXJhbWV0ZXIuVmFsdWUpIHx8XHJcbiAgICAgICAgcmVxdWVzdFBhcmFtZXRlci5WYWx1ZS5ldmVyeShcclxuICAgICAgICAgICh2KSA9PlxyXG4gICAgICAgICAgICB0eXBlb2YgdiAhPT0gXCJvYmplY3RcIiB8fFxyXG4gICAgICAgICAgICAhdiB8fFxyXG4gICAgICAgICAgICAhdi5oYXNPd25Qcm9wZXJ0eShcImlkXCIpIHx8XHJcbiAgICAgICAgICAgICF2Lmhhc093blByb3BlcnR5KFwiZW50aXR5VHlwZVwiKVxyXG4gICAgICAgIClcclxuICAgICAgKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGludmFsaWRUeXBlTWVzc2FnZSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAocmVxdWVzdFBhcmFtZXRlci5UeXBlID09PSBcIkRhdGVUaW1lXCIpIHtcclxuICAgICAgaWYgKCEocmVxdWVzdFBhcmFtZXRlci5WYWx1ZSBpbnN0YW5jZW9mIERhdGUpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGludmFsaWRUeXBlTWVzc2FnZSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmIChhY3R1YWxUeXBlICE9PSBleHBlY3RlZFR5cGUpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoaW52YWxpZFR5cGVNZXNzYWdlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICAvKipcclxuICAgKiBFeGVjdXRlcyBhbiBBY3Rpb24uXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFjdGlvbk5hbWUgLSBUaGUgdW5pcXVlIG5hbWUgb2YgdGhlIGFjdGlvbi5cclxuICAgKiBAcGFyYW0ge1JlcXVlc3RQYXJhbWV0ZXJbXX0gcmVxdWVzdFBhcmFtZXRlcnMgLSBBbiBhcnJheSBvZiBvYmplY3RzIHdpdGggdGhlIHBhcmFtZXRlciBuYW1lLCB0eXBlIGFuZCB2YWx1ZS5cclxuICAgKiBAcGFyYW0ge0VudGl0eVJlZmVyZW5jZX0gW2JvdW5kRW50aXR5XSAtIEFuIG9wdGlvbmFsIEVudGl0eVJlZmVyZW5jZSBvZiB0aGUgYm91bmQgZW50aXR5LlxyXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59IC0gQSBQcm9taXNlIHdpdGggdGhlIHJlcXVlc3QgcmVzcG9uc2UuXHJcbiAgICogQHRocm93cyB7RXJyb3J9IC0gVGhyb3dzIGFuIGVycm9yIGlmIHRoZSByZXF1ZXN0IHBhcmFtZXRlciBpcyBub3Qgb2YgYSBzdXBwb3J0ZWQgdHlwZSBvciBoYXMgYW4gaW52YWxpZCB2YWx1ZS5cclxuICAgKi9cclxuICBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUFjdGlvbihcclxuICAgIGFjdGlvbk5hbWU6IHN0cmluZyxcclxuICAgIHJlcXVlc3RQYXJhbWV0ZXJzOiBSZXF1ZXN0UGFyYW1ldGVyW10sXHJcbiAgICBib3VuZEVudGl0eT86IEVudGl0eVJlZmVyZW5jZVxyXG4gICk6IFByb21pc2U8YW55PiB7XHJcbiAgICBjb25zdCBwYXJhbWV0ZXJEZWZpbml0aW9uOiBhbnkgPSB7fTtcclxuICAgIGlmIChib3VuZEVudGl0eSlcclxuICAgICAgcmVxdWVzdFBhcmFtZXRlcnMucHVzaCh7XHJcbiAgICAgICAgTmFtZTogXCJlbnRpdHlcIixcclxuICAgICAgICBWYWx1ZTogYm91bmRFbnRpdHksXHJcbiAgICAgICAgVHlwZTogXCJFbnRpdHlSZWZlcmVuY2VcIixcclxuICAgICAgfSk7XHJcbiAgICBmb3IgKGNvbnN0IHJlcXVlc3RQYXJhbWV0ZXIgb2YgcmVxdWVzdFBhcmFtZXRlcnMpIHtcclxuICAgICAgY2hlY2tSZXF1ZXN0UGFyYW1ldGVyVHlwZShyZXF1ZXN0UGFyYW1ldGVyKTtcclxuICAgICAgcGFyYW1ldGVyRGVmaW5pdGlvbltyZXF1ZXN0UGFyYW1ldGVyLk5hbWVdID0ge1xyXG4gICAgICAgIHR5cGVOYW1lOiB0eXBlTWFwW3JlcXVlc3RQYXJhbWV0ZXIuVHlwZV0udHlwZU5hbWUsXHJcbiAgICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiB0eXBlTWFwW3JlcXVlc3RQYXJhbWV0ZXIuVHlwZV0uc3RydWN0dXJhbFByb3BlcnR5LFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gICAgY29uc3QgcmVxID0gT2JqZWN0LmFzc2lnbihcclxuICAgICAge1xyXG4gICAgICAgIGdldE1ldGFkYXRhOiAoKSA9PiAoe1xyXG4gICAgICAgICAgYm91bmRQYXJhbWV0ZXI6IGJvdW5kRW50aXR5ID8gXCJlbnRpdHlcIiA6IG51bGwsXHJcbiAgICAgICAgICBvcGVyYXRpb25UeXBlOiAwLFxyXG4gICAgICAgICAgb3BlcmF0aW9uTmFtZTogYWN0aW9uTmFtZSxcclxuICAgICAgICAgIHBhcmFtZXRlclR5cGVzOiBwYXJhbWV0ZXJEZWZpbml0aW9uLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICB9LFxyXG4gICAgICAuLi5yZXF1ZXN0UGFyYW1ldGVycy5tYXAoKHApID0+ICh7IFtwLk5hbWVdOiBwLlZhbHVlIH0pKVxyXG4gICAgKTtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgWHJtLldlYkFwaS5vbmxpbmUuZXhlY3V0ZShyZXEpO1xyXG4gICAgaWYgKHJlc3BvbnNlLm9rKSByZXR1cm4gcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+IHJlc3BvbnNlKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEV4ZWN1dGVzIGEgRnVuY3Rpb24uXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZ1bmN0aW9uTmFtZSAtIFRoZSB1bmlxdWUgbmFtZSBvZiB0aGUgZnVuY3Rpb24uXHJcbiAgICogQHBhcmFtIHtSZXF1ZXN0UGFyYW1ldGVyW119IHJlcXVlc3RQYXJhbWV0ZXJzIC0gQW4gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoIHRoZSBwYXJhbWV0ZXIgbmFtZSwgdHlwZSBhbmQgdmFsdWUuXHJcbiAgICogQHBhcmFtIHtFbnRpdHlSZWZlcmVuY2V9IFtib3VuZEVudGl0eV0gLSBBbiBvcHRpb25hbCBFbnRpdHlSZWZlcmVuY2Ugb2YgdGhlIGJvdW5kIGVudGl0eS5cclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fSAtIEEgUHJvbWlzZSB3aXRoIHRoZSByZXF1ZXN0IHJlc3BvbnNlLlxyXG4gICAqIEB0aHJvd3Mge0Vycm9yfSAtIFRocm93cyBhbiBlcnJvciBpZiB0aGUgcmVxdWVzdCBwYXJhbWV0ZXIgaXMgbm90IG9mIGEgc3VwcG9ydGVkIHR5cGUgb3IgaGFzIGFuIGludmFsaWQgdmFsdWUuXHJcbiAgICovXHJcbiAgZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVGdW5jdGlvbihcclxuICAgIGZ1bmN0aW9uTmFtZTogc3RyaW5nLFxyXG4gICAgcmVxdWVzdFBhcmFtZXRlcnM6IFJlcXVlc3RQYXJhbWV0ZXJbXSxcclxuICAgIGJvdW5kRW50aXR5PzogRW50aXR5UmVmZXJlbmNlXHJcbiAgKTogUHJvbWlzZTxhbnk+IHtcclxuICAgIGNvbnN0IHBhcmFtZXRlckRlZmluaXRpb246IGFueSA9IHt9O1xyXG4gICAgaWYgKGJvdW5kRW50aXR5KVxyXG4gICAgICByZXF1ZXN0UGFyYW1ldGVycy5wdXNoKHtcclxuICAgICAgICBOYW1lOiBcImVudGl0eVwiLFxyXG4gICAgICAgIFZhbHVlOiBib3VuZEVudGl0eSxcclxuICAgICAgICBUeXBlOiBcIkVudGl0eVJlZmVyZW5jZVwiLFxyXG4gICAgICB9KTtcclxuICAgIGZvciAoY29uc3QgcmVxdWVzdFBhcmFtZXRlciBvZiByZXF1ZXN0UGFyYW1ldGVycykge1xyXG4gICAgICBjaGVja1JlcXVlc3RQYXJhbWV0ZXJUeXBlKHJlcXVlc3RQYXJhbWV0ZXIpO1xyXG4gICAgICBwYXJhbWV0ZXJEZWZpbml0aW9uW3JlcXVlc3RQYXJhbWV0ZXIuTmFtZV0gPSB7XHJcbiAgICAgICAgdHlwZU5hbWU6IHR5cGVNYXBbcmVxdWVzdFBhcmFtZXRlci5UeXBlXS50eXBlTmFtZSxcclxuICAgICAgICBzdHJ1Y3R1cmFsUHJvcGVydHk6IHR5cGVNYXBbcmVxdWVzdFBhcmFtZXRlci5UeXBlXS5zdHJ1Y3R1cmFsUHJvcGVydHksXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgICBjb25zdCByZXEgPSBPYmplY3QuYXNzaWduKFxyXG4gICAgICB7XHJcbiAgICAgICAgZ2V0TWV0YWRhdGE6ICgpID0+ICh7XHJcbiAgICAgICAgICBib3VuZFBhcmFtZXRlcjogYm91bmRFbnRpdHkgPyBcImVudGl0eVwiIDogbnVsbCxcclxuICAgICAgICAgIG9wZXJhdGlvblR5cGU6IDEsXHJcbiAgICAgICAgICBvcGVyYXRpb25OYW1lOiBmdW5jdGlvbk5hbWUsXHJcbiAgICAgICAgICBwYXJhbWV0ZXJUeXBlczogcGFyYW1ldGVyRGVmaW5pdGlvbixcclxuICAgICAgICB9KSxcclxuICAgICAgfSxcclxuICAgICAgLi4ucmVxdWVzdFBhcmFtZXRlcnMubWFwKChwKSA9PiAoeyBbcC5OYW1lXTogcC5WYWx1ZSB9KSlcclxuICAgICk7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IFhybS5XZWJBcGkub25saW5lLmV4ZWN1dGUocmVxKTtcclxuICAgIGlmIChyZXNwb25zZS5vaykgcmV0dXJuIHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiByZXNwb25zZSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYWtlcyBhIEdVSUQgbG93ZXJjYXNlIGFuZCByZW1vdmVzIGJyYWNrZXRzLlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBndWlkIC0gVGhlIEdVSUQgdG8gbm9ybWFsaXplLlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gVGhlIG5vcm1hbGl6ZWQgR1VJRC5cclxuICAgKi9cclxuICBleHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplR3VpZChndWlkOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgaWYgKHR5cGVvZiBndWlkICE9PSBcInN0cmluZ1wiKVxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4Lm5vcm1hbGl6ZUd1aWQ6XFxuJyR7Z3VpZH0nIGlzIG5vdCBhIHN0cmluZ2ApO1xyXG4gICAgcmV0dXJuIGd1aWQudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9be31dL2csIFwiXCIpO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBPcGVucyBhIGRpYWxvZyB3aXRoIGR5bmFtaWMgaGVpZ2h0IGFuZCB3aWR0aCBiYXNlZCBvbiB0ZXh0IGNvbnRlbnQuXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlIC0gVGhlIHRpdGxlIG9mIHRoZSBkaWFsb2cuXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBUaGUgdGV4dCBjb250ZW50IG9mIHRoZSBkaWFsb2cuXHJcbiAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn0gLSBBIFByb21pc2Ugd2l0aCB0aGUgZGlhbG9nIHJlc3BvbnNlLlxyXG4gICAqL1xyXG4gIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcGVuQWxlcnREaWFsb2coXHJcbiAgICB0aXRsZTogc3RyaW5nLFxyXG4gICAgdGV4dDogc3RyaW5nXHJcbiAgKTogUHJvbWlzZTxhbnk+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJvd3MgPSB0ZXh0LnNwbGl0KC9cXHJcXG58XFxyfFxcbi8pO1xyXG4gICAgICBsZXQgYWRkaXRpb25hbFJvd3MgPSAwO1xyXG4gICAgICByb3dzLmZvckVhY2goKHJvdykgPT4ge1xyXG4gICAgICAgIGxldCB3aWR0aCA9IGdldFRleHRXaWR0aChcclxuICAgICAgICAgIHJvdyxcclxuICAgICAgICAgIFwiMXJlbSBTZWdvZSBVSSBSZWd1bGFyLCBTZWdvZVVJLCBTZWdvZSBVSVwiXHJcbiAgICAgICAgKTtcclxuICAgICAgICBpZiAod2lkdGggPiA5NDApIHtcclxuICAgICAgICAgIGFkZGl0aW9uYWxSb3dzICs9IHdpZHRoIC8gOTQwO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIGNvbnN0IGxvbmdlc3RSb3cgPSByb3dzLnJlZHVjZShcclxuICAgICAgICAoYWNjLCByb3cpID0+IChyb3cubGVuZ3RoID4gYWNjLmxlbmd0aCA/IHJvdyA6IGFjYyksXHJcbiAgICAgICAgXCJcIlxyXG4gICAgICApO1xyXG4gICAgICBjb25zdCB3aWR0aCA9IE1hdGgubWluKFxyXG4gICAgICAgIGdldFRleHRXaWR0aChsb25nZXN0Um93LCBcIjFyZW0gU2Vnb2UgVUkgUmVndWxhciwgU2Vnb2VVSSwgU2Vnb2UgVUlcIiksXHJcbiAgICAgICAgMTAwMFxyXG4gICAgICApO1xyXG4gICAgICBjb25zdCBoZWlnaHQgPSAxMDkgKyAocm93cy5sZW5ndGggKyBhZGRpdGlvbmFsUm93cykgKiAyMDtcclxuICAgICAgcmV0dXJuIGF3YWl0IFhybS5OYXZpZ2F0aW9uLm9wZW5BbGVydERpYWxvZyhcclxuICAgICAgICB7XHJcbiAgICAgICAgICBjb25maXJtQnV0dG9uTGFiZWw6IFwiT2tcIixcclxuICAgICAgICAgIHRleHQsXHJcbiAgICAgICAgICB0aXRsZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGhlaWdodCxcclxuICAgICAgICAgIHdpZHRoLFxyXG4gICAgICAgIH1cclxuICAgICAgKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihlcnJvci5tZXNzYWdlKTtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke2dldE1ldGhvZE5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VzIGNhbnZhcy5tZWFzdXJlVGV4dCB0byBjb21wdXRlIGFuZCByZXR1cm4gdGhlIHdpZHRoIG9mIHRoZSBnaXZlbiB0ZXh0IG9mIGdpdmVuIGZvbnQgaW4gcGl4ZWxzLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0IFRoZSB0ZXh0IHRvIGJlIHJlbmRlcmVkLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGZvbnQgVGhlIGNzcyBmb250IGRlc2NyaXB0b3IgdGhhdCB0ZXh0IGlzIHRvIGJlIHJlbmRlcmVkIHdpdGggKGUuZy4gXCJib2xkIDE0cHggdmVyZGFuYVwiKS5cclxuICAgICAqXHJcbiAgICAgKiBAc2VlIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzExODI0MS9jYWxjdWxhdGUtdGV4dC13aWR0aC13aXRoLWphdmFzY3JpcHQvMjEwMTUzOTMjMjEwMTUzOTNcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZ2V0VGV4dFdpZHRoKHRleHQ6IHN0cmluZywgZm9udDogc3RyaW5nKSB7XHJcbiAgICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICAgIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG4gICAgICBjb250ZXh0LmZvbnQgPSBmb250O1xyXG4gICAgICBjb25zdCBtZXRyaWNzID0gY29udGV4dC5tZWFzdXJlVGV4dCh0ZXh0KTtcclxuICAgICAgcmV0dXJuIG1ldHJpY3Mud2lkdGg7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIFJlcHJlc2VudHMgYSBmb3JtIGluIER5bmFtaWNzIDM2NS5cclxuICAgKi9cclxuICBleHBvcnQgY2xhc3MgRm9ybSB7XHJcbiAgICBwcm90ZWN0ZWQgc3RhdGljIF9mb3JtQ29udGV4dDogWHJtLkZvcm1Db250ZXh0O1xyXG4gICAgcHJvdGVjdGVkIHN0YXRpYyBfZXhlY3V0aW9uQ29udGV4dDogWHJtLkV2ZW50cy5FdmVudENvbnRleHQ7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHsgfVxyXG4gICAgLyoqR2V0cyBhIHJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBmb3JtIGNvbnRleHQqL1xyXG4gICAgc3RhdGljIGdldCBmb3JtQ29udGV4dCgpOiBYcm0uRm9ybUNvbnRleHQge1xyXG4gICAgICByZXR1cm4gdGhpcy5fZm9ybUNvbnRleHQ7XHJcbiAgICB9XHJcbiAgICAvKipHZXRzIGEgcmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IGV4ZWN1dGlvIGNvbnRleHQqL1xyXG4gICAgc3RhdGljIGdldCBleGVjdXRpb25Db250ZXh0KCk6IFhybS5FdmVudHMuRXZlbnRDb250ZXh0IHtcclxuICAgICAgcmV0dXJuIHRoaXMuX2V4ZWN1dGlvbkNvbnRleHQ7XHJcbiAgICB9XHJcbiAgICAvKipHZXRzIGEgbG9va3VwIHZhbHVlIHRoYXQgcmVmZXJlbmNlcyB0aGUgcmVjb3JkLiovXHJcbiAgICBzdGF0aWMgZ2V0IGVudGl0eVJlZmVyZW5jZSgpIHtcclxuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5lbnRpdHkuZ2V0RW50aXR5UmVmZXJlbmNlKCk7XHJcbiAgICB9XHJcbiAgICAvKipTZXRzIGEgcmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IGZvcm0gY29udGV4dCovXHJcbiAgICBzdGF0aWMgc2V0IGZvcm1Db250ZXh0KGNvbnRleHQ6IFhybS5Gb3JtQ29udGV4dCB8IFhybS5FdmVudHMuRXZlbnRDb250ZXh0KSB7XHJcbiAgICAgIGlmIChcImdldEZvcm1Db250ZXh0XCIgaW4gY29udGV4dCkge1xyXG4gICAgICAgIHRoaXMuX2V4ZWN1dGlvbkNvbnRleHQgPSBjb250ZXh0O1xyXG4gICAgICAgIHRoaXMuX2Zvcm1Db250ZXh0ID0gY29udGV4dC5nZXRGb3JtQ29udGV4dCgpO1xyXG4gICAgICB9IGVsc2UgaWYgKFwiZGF0YVwiIGluIGNvbnRleHQpIHRoaXMuX2Zvcm1Db250ZXh0ID0gY29udGV4dDtcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgIGBYcm1FeC5Gb3JtLnNldEZvcm1Db250ZXh0OiBUaGUgZXhlY3V0aW9uQ29udGV4dCBvciBmb3JtQ29udGV4dCB3YXMgbm90IHBhc3NlZCB0byB0aGUgZnVuY3Rpb24uYFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbiAgICAvKipTZXRzIGEgcmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IGV4ZWN1dGlvbiBjb250ZXh0Ki9cclxuICAgIHN0YXRpYyBzZXQgZXhlY3V0aW9uQ29udGV4dChcclxuICAgICAgY29udGV4dDogWHJtLkZvcm1Db250ZXh0IHwgWHJtLkV2ZW50cy5FdmVudENvbnRleHRcclxuICAgICkge1xyXG4gICAgICBpZiAoXCJnZXRGb3JtQ29udGV4dFwiIGluIGNvbnRleHQpIHtcclxuICAgICAgICB0aGlzLl9leGVjdXRpb25Db250ZXh0ID0gY29udGV4dDtcclxuICAgICAgICB0aGlzLl9mb3JtQ29udGV4dCA9IGNvbnRleHQuZ2V0Rm9ybUNvbnRleHQoKTtcclxuICAgICAgfSBlbHNlIGlmIChcImRhdGFcIiBpbiBjb250ZXh0KSB0aGlzLl9mb3JtQ29udGV4dCA9IGNvbnRleHQ7XHJcbiAgICAgIGVsc2VcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICBgWHJtRXguRm9ybS5zZXRFeGVjdXRpb25Db250ZXh0OiBUaGUgZXhlY3V0aW9uQ29udGV4dCBvciBmb3JtQ29udGV4dCB3YXMgbm90IHBhc3NlZCB0byB0aGUgZnVuY3Rpb24uYFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbiAgICAvKipSZXR1cm5zIHRydWUgaWYgZm9ybSBpcyBmcm9tIHR5cGUgY3JlYXRlKi9cclxuICAgIHN0YXRpYyBnZXQgSXNDcmVhdGUoKSB7XHJcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LnVpLmdldEZvcm1UeXBlKCkgPT0gMTtcclxuICAgIH1cclxuICAgIC8qKlJldHVybnMgdHJ1ZSBpZiBmb3JtIGlzIGZyb20gdHlwZSB1cGRhdGUqL1xyXG4gICAgc3RhdGljIGdldCBJc1VwZGF0ZSgpIHtcclxuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQudWkuZ2V0Rm9ybVR5cGUoKSA9PSAyO1xyXG4gICAgfVxyXG4gICAgLyoqUmV0dXJucyB0cnVlIGlmIGZvcm0gaXMgbm90IGZyb20gdHlwZSBjcmVhdGUqL1xyXG4gICAgc3RhdGljIGdldCBJc05vdENyZWF0ZSgpIHtcclxuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQudWkuZ2V0Rm9ybVR5cGUoKSAhPSAxO1xyXG4gICAgfVxyXG4gICAgLyoqUmV0dXJucyB0cnVlIGlmIGZvcm0gaXMgbm90IGZyb20gdHlwZSB1cGRhdGUqL1xyXG4gICAgc3RhdGljIGdldCBJc05vdFVwZGF0ZSgpIHtcclxuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQudWkuZ2V0Rm9ybVR5cGUoKSAhPSAyO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBEaXNwbGF5cyBhIGZvcm0gbGV2ZWwgbm90aWZpY2F0aW9uLiBBbnkgbnVtYmVyIG9mIG5vdGlmaWNhdGlvbnMgY2FuIGJlIGRpc3BsYXllZCBhbmQgd2lsbCByZW1haW4gdW50aWwgcmVtb3ZlZCB1c2luZyBjbGVhckZvcm1Ob3RpZmljYXRpb24uXHJcbiAgICAgKiBUaGUgaGVpZ2h0IG9mIHRoZSBub3RpZmljYXRpb24gYXJlYSBpcyBsaW1pdGVkIHNvIGVhY2ggbmV3IG1lc3NhZ2Ugd2lsbCBiZSBhZGRlZCB0byB0aGUgdG9wLlxyXG4gICAgICogQHBhcmFtIG1lc3NhZ2UgVGhlIHRleHQgb2YgdGhlIG5vdGlmaWNhdGlvbiBtZXNzYWdlLlxyXG4gICAgICogQHBhcmFtIGxldmVsIFRoZSBsZXZlbCBvZiB0aGUgbm90aWZpY2F0aW9uIHdoaWNoIGRlZmluZXMgaG93IHRoZSBtZXNzYWdlIHdpbGwgYmUgZGlzcGxheWVkLCBzdWNoIGFzIHRoZSBpY29uLlxyXG4gICAgICogRVJST1I6IE5vdGlmaWNhdGlvbiB3aWxsIHVzZSB0aGUgc3lzdGVtIGVycm9yIGljb24uXHJcbiAgICAgKiBXQVJOSU5HOiBOb3RpZmljYXRpb24gd2lsbCB1c2UgdGhlIHN5c3RlbSB3YXJuaW5nIGljb24uXHJcbiAgICAgKiBJTkZPOiBOb3RpZmljYXRpb24gd2lsbCB1c2UgdGhlIHN5c3RlbSBpbmZvIGljb24uXHJcbiAgICAgKiBAcGFyYW0gdW5pcXVlSWQgVW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoZSBub3RpZmljYXRpb24gd2hpY2ggaXMgdXNlZCB3aXRoIGNsZWFyRm9ybU5vdGlmaWNhdGlvbiB0byByZW1vdmUgdGhlIG5vdGlmaWNhdGlvbi5cclxuICAgICAqIEByZXR1cm5zIHRydWUgaWYgaXQgc3VjY2VlZHMsIG90aGVyd2lzZSBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFkZEZvcm1Ob3RpZmljYXRpb24oXHJcbiAgICAgIG1lc3NhZ2U6IHN0cmluZyxcclxuICAgICAgbGV2ZWw6IFhybS5Gb3JtTm90aWZpY2F0aW9uTGV2ZWwsXHJcbiAgICAgIHVuaXF1ZUlkOiBzdHJpbmdcclxuICAgICkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LnVpLnNldEZvcm1Ob3RpZmljYXRpb24oXHJcbiAgICAgICAgICBtZXNzYWdlLFxyXG4gICAgICAgICAgbGV2ZWwsXHJcbiAgICAgICAgICB1bmlxdWVJZFxyXG4gICAgICAgICk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7WHJtRXguZ2V0TWV0aG9kTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQ2xlYXJzIHRoZSBmb3JtIG5vdGlmaWNhdGlvbiBkZXNjcmliZWQgYnkgdW5pcXVlSWQuXHJcbiAgICAgKiBAcGFyYW0gdW5pcXVlSWQgVW5pcXVlIGlkZW50aWZpZXIuXHJcbiAgICAgKiBAcmV0dXJucyBUcnVlIGlmIGl0IHN1Y2NlZWRzLCBvdGhlcndpc2UgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyByZW1vdmVGb3JtTm90aWZpY2F0aW9uKHVuaXF1ZUlkOiBzdHJpbmcpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC51aS5jbGVhckZvcm1Ob3RpZmljYXRpb24odW5pcXVlSWQpO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke1hybUV4LmdldE1ldGhvZE5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYSBoYW5kbGVyIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSByZWNvcmQgaXMgc2F2ZWQuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBhZGRPblNhdmVFdmVudEhhbmRsZXIoXHJcbiAgICAgIGhhbmRsZXJzOlxyXG4gICAgICAgIHwgWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlclxyXG4gICAgICAgIHwgWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlcltdXHJcbiAgICApIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoaGFuZGxlcnMpKSB7XHJcbiAgICAgICAgICBoYW5kbGVycyA9IFtoYW5kbGVyc107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhhbmRsZXJzLmZvckVhY2goKGhhbmRsZXIpID0+IHtcclxuICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJyR7aGFuZGxlcn0nIGlzIG5vdCBhIGZ1bmN0aW9uYCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEuZW50aXR5LmFkZE9uU2F2ZShoYW5kbGVyKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguJHtYcm1FeC5nZXRNZXRob2ROYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGEgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIGFmdGVyIHRoZSBPblNhdmUgaXMgY29tcGxldGUuXHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlciBUaGUgaGFuZGxlci5cclxuICAgICAqIEByZW1hcmtzIEFkZGVkIGluIDkuMlxyXG4gICAgICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kb2NzLm1pY3Jvc29mdC5jb20vZW4tdXMvcG93ZXJhcHBzL2RldmVsb3Blci9tb2RlbC1kcml2ZW4tYXBwcy9jbGllbnRhcGkvcmVmZXJlbmNlL2V2ZW50cy9wb3N0c2F2ZSBFeHRlcm5hbCBMaW5rOiBQb3N0U2F2ZSBFdmVudCBEb2N1bWVudGF0aW9ufVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYWRkT25Qb3N0U2F2ZUV2ZW50SGFuZGxlcihcclxuICAgICAgaGFuZGxlcnM6XHJcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyXHJcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyW11cclxuICAgICkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShoYW5kbGVycykpIHtcclxuICAgICAgICAgIGhhbmRsZXJzID0gW2hhbmRsZXJzXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAnJHtoYW5kbGVyfScgaXMgbm90IGEgZnVuY3Rpb25gKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5lbnRpdHkuYWRkT25Qb3N0U2F2ZShoYW5kbGVyKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguJHtYcm1FeC5nZXRNZXRob2ROYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGEgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gZm9ybSBkYXRhIGlzIGxvYWRlZC5cclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFRoZSBmdW5jdGlvbiB0byBiZSBleGVjdXRlZCB3aGVuIHRoZSBmb3JtIGRhdGEgbG9hZHMuIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGFkZGVkIHRvIHRoZSBib3R0b20gb2YgdGhlIGV2ZW50IGhhbmRsZXIgcGlwZWxpbmUuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBhZGRPbkxvYWRFdmVudEhhbmRsZXIoXHJcbiAgICAgIGhhbmRsZXJzOlxyXG4gICAgICAgIHwgWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlclxyXG4gICAgICAgIHwgWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlcltdXHJcbiAgICApIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoaGFuZGxlcnMpKSB7XHJcbiAgICAgICAgICBoYW5kbGVycyA9IFtoYW5kbGVyc107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhhbmRsZXJzLmZvckVhY2goKGhhbmRsZXIpID0+IHtcclxuICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJyR7aGFuZGxlcn0nIGlzIG5vdCBhIGZ1bmN0aW9uYCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEuYWRkT25Mb2FkKGhhbmRsZXIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke1hybUV4LmdldE1ldGhvZE5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYSBoYW5kbGVyIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBhdHRyaWJ1dGUncyB2YWx1ZSBpcyBjaGFuZ2VkLlxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIgVGhlIGZ1bmN0aW9uIHJlZmVyZW5jZS5cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFkZE9uQ2hhbmdlRXZlbnRIYW5kbGVyKFxyXG4gICAgICBmaWVsZHM6IEZpZWxkW10sXHJcbiAgICAgIGhhbmRsZXJzOlxyXG4gICAgICAgIHwgWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlclxyXG4gICAgICAgIHwgWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlcltdLFxyXG4gICAgICBleGVjdXRlPzogYm9vbGVhblxyXG4gICAgKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGhhbmRsZXJzKSkge1xyXG4gICAgICAgICAgaGFuZGxlcnMgPSBbaGFuZGxlcnNdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBoYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XHJcbiAgICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgIT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCcke2hhbmRsZXJ9JyBpcyBub3QgYSBmdW5jdGlvbmApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XHJcbiAgICAgICAgICAgIGZpZWxkLmFkZE9uQ2hhbmdlKGhhbmRsZXIpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKGV4ZWN1dGUpIHtcclxuICAgICAgICAgIGZpZWxkcy5mb3JFYWNoKChmaWVsZCkgPT4ge1xyXG4gICAgICAgICAgICBmaWVsZC5BdHRyaWJ1dGUuZmlyZU9uQ2hhbmdlKCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7WHJtRXguZ2V0TWV0aG9kTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgLyoqXHJcbiAgICogVXNlZCB0byBleGVjdXRlIG1ldGhvZHMgcmVsYXRlZCB0byBhIHNpbmdsZSBBdHRyaWJ1dGVcclxuICAgKi9cclxuICBleHBvcnQgY2xhc3MgRmllbGQgaW1wbGVtZW50cyBYcm0uQXR0cmlidXRlcy5BdHRyaWJ1dGUge1xyXG4gICAgcHVibGljIHN0YXRpYyBhbGxGaWVsZHM6IEZpZWxkW10gPSBbXTtcclxuXHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgTmFtZSE6IHN0cmluZztcclxuICAgIHByb3RlY3RlZCBfYXR0cmlidXRlPzogWHJtLkF0dHJpYnV0ZXMuQXR0cmlidXRlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZU5hbWU6IHN0cmluZykge1xyXG4gICAgICBjb25zdCBleGlzdGluZ0ZpZWxkID0gRmllbGQuYWxsRmllbGRzLmZpbmQoXHJcbiAgICAgICAgKGYpID0+IGYuTmFtZSA9PT0gYXR0cmlidXRlTmFtZVxyXG4gICAgICApO1xyXG4gICAgICBpZiAoZXhpc3RpbmdGaWVsZCkge1xyXG4gICAgICAgIHJldHVybiBleGlzdGluZ0ZpZWxkO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuTmFtZSA9IGF0dHJpYnV0ZU5hbWU7XHJcbiAgICAgIEZpZWxkLmFsbEZpZWxkcy5wdXNoKHRoaXMpO1xyXG4gICAgfVxyXG4gICAgc2V0VmFsdWUodmFsdWU6IGFueSk6IHZvaWQge1xyXG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuc2V0VmFsdWUodmFsdWUpO1xyXG4gICAgfVxyXG4gICAgZ2V0QXR0cmlidXRlVHlwZSgpOiBYcm0uQXR0cmlidXRlcy5BdHRyaWJ1dGVUeXBlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEF0dHJpYnV0ZVR5cGUoKTtcclxuICAgIH1cclxuICAgIGdldEZvcm1hdCgpOiBYcm0uQXR0cmlidXRlcy5BdHRyaWJ1dGVGb3JtYXQge1xyXG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0Rm9ybWF0KCk7XHJcbiAgICB9XHJcbiAgICBnZXRJc0RpcnR5KCk6IGJvb2xlYW4ge1xyXG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0SXNEaXJ0eSgpO1xyXG4gICAgfVxyXG4gICAgZ2V0TmFtZSgpOiBzdHJpbmcge1xyXG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0TmFtZSgpO1xyXG4gICAgfVxyXG4gICAgZ2V0UGFyZW50KCk6IFhybS5FbnRpdHkge1xyXG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0UGFyZW50KCk7XHJcbiAgICB9XHJcbiAgICBnZXRSZXF1aXJlZExldmVsKCk6IFhybS5BdHRyaWJ1dGVzLlJlcXVpcmVtZW50TGV2ZWwge1xyXG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0UmVxdWlyZWRMZXZlbCgpO1xyXG4gICAgfVxyXG4gICAgZ2V0U3VibWl0TW9kZSgpOiBYcm0uU3VibWl0TW9kZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRTdWJtaXRNb2RlKCk7XHJcbiAgICB9XHJcbiAgICBnZXRVc2VyUHJpdmlsZWdlKCk6IFhybS5Qcml2aWxlZ2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0VXNlclByaXZpbGVnZSgpO1xyXG4gICAgfVxyXG4gICAgcmVtb3ZlT25DaGFuZ2UoaGFuZGxlcjogWHJtLkV2ZW50cy5BdHRyaWJ1dGUuQ2hhbmdlRXZlbnRIYW5kbGVyKTogdm9pZCB7XHJcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5yZW1vdmVPbkNoYW5nZShoYW5kbGVyKTtcclxuICAgIH1cclxuICAgIHNldFN1Ym1pdE1vZGUoc3VibWl0TW9kZTogWHJtLlN1Ym1pdE1vZGUpOiB2b2lkIHtcclxuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLnNldFN1Ym1pdE1vZGUoc3VibWl0TW9kZSk7XHJcbiAgICB9XHJcbiAgICBnZXRWYWx1ZSgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFZhbHVlKCk7XHJcbiAgICB9XHJcbiAgICBzZXRJc1ZhbGlkKGlzVmFsaWQ6IGJvb2xlYW4sIG1lc3NhZ2U/OiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLnNldElzVmFsaWQoaXNWYWxpZCwgbWVzc2FnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBBdHRyaWJ1dGUoKTogWHJtLkF0dHJpYnV0ZXMuQXR0cmlidXRlIHtcclxuICAgICAgcmV0dXJuICh0aGlzLl9hdHRyaWJ1dGUgPz89XHJcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUodGhpcy5OYW1lKSA/P1xyXG4gICAgICAgIFhybUV4LnRocm93RXJyb3IoXHJcbiAgICAgICAgICBgVGhlIGF0dHJpYnV0ZSAnJHt0aGlzLk5hbWV9JyB3YXMgbm90IGZvdW5kIG9uIHRoZSBmb3JtLmBcclxuICAgICAgICApKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGNvbnRyb2xzKCk6IFhybS5Db2xsZWN0aW9uLkl0ZW1Db2xsZWN0aW9uPFhybS5Db250cm9scy5TdGFuZGFyZENvbnRyb2w+IHtcclxuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmNvbnRyb2xzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgdmFsdWUuXHJcbiAgICAgKiBAcmV0dXJucyBUaGUgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgVmFsdWUoKTogYW55IHtcclxuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFZhbHVlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBWYWx1ZSh2YWx1ZTogYW55KSB7XHJcbiAgICAgIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKHZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgYSBjb250cm9sLWxvY2FsIG5vdGlmaWNhdGlvbiBtZXNzYWdlLlxyXG4gICAgICogQHBhcmFtIG1lc3NhZ2UgVGhlIG1lc3NhZ2UuXHJcbiAgICAgKiBAcGFyYW0gdW5pcXVlSWQgVW5pcXVlIGlkZW50aWZpZXIuXHJcbiAgICAgKiBAcmV0dXJucyB0cnVlIGlmIGl0IHN1Y2NlZWRzLCBmYWxzZSBpZiBpdCBmYWlscy5cclxuICAgICAqIEByZW1hcmtzICAgICBXaGVuIHRoaXMgbWV0aG9kIGlzIHVzZWQgb24gTWljcm9zb2Z0IER5bmFtaWNzIENSTSBmb3IgdGFibGV0cyBhIHJlZCBcIlhcIiBpY29uXHJcbiAgICAgKiAgICAgICAgICAgICAgYXBwZWFycyBuZXh0IHRvIHRoZSBjb250cm9sLiBUYXBwaW5nIG9uIHRoZSBpY29uIHdpbGwgZGlzcGxheSB0aGUgbWVzc2FnZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldE5vdGlmaWNhdGlvbihtZXNzYWdlOiBzdHJpbmcsIHVuaXF1ZUlkOiBzdHJpbmcpOiB0aGlzIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBpZiAoIW1lc3NhZ2UpIHRocm93IG5ldyBFcnJvcihgbm8gbWVzc2FnZSB3YXMgcHJvdmlkZWQuYCk7XHJcbiAgICAgICAgaWYgKCF1bmlxdWVJZCkgdGhyb3cgbmV3IEVycm9yKGBubyB1bmlxdWVJZCB3YXMgcHJvdmlkZWQuYCk7XHJcbiAgICAgICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PlxyXG4gICAgICAgICAgY29udHJvbC5zZXROb3RpZmljYXRpb24obWVzc2FnZSwgdW5pcXVlSWQpXHJcbiAgICAgICAgKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguJHtYcm1FeC5nZXRNZXRob2ROYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgdmlzaWJpbGl0eSBzdGF0ZS5cclxuICAgICAqIEBwYXJhbSB2aXNpYmxlIHRydWUgdG8gc2hvdywgZmFsc2UgdG8gaGlkZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldFZpc2libGUodmlzaWJsZTogYm9vbGVhbik6IHRoaXMge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHRoaXMuY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT4gY29udHJvbC5zZXRWaXNpYmxlKHZpc2libGUpKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguJHtYcm1FeC5nZXRNZXRob2ROYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgc3RhdGUgb2YgdGhlIGNvbnRyb2wgdG8gZWl0aGVyIGVuYWJsZWQsIG9yIGRpc2FibGVkLlxyXG4gICAgICogQHBhcmFtIGRpc2FibGVkIHRydWUgdG8gZGlzYWJsZSwgZmFsc2UgdG8gZW5hYmxlLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0RGlzYWJsZWQoZGlzYWJsZWQ6IGJvb2xlYW4pOiB0aGlzIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICB0aGlzLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2wpID0+IGNvbnRyb2wuc2V0RGlzYWJsZWQoZGlzYWJsZWQpKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguJHtYcm1FeC5nZXRNZXRob2ROYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgcmVxdWlyZWQgbGV2ZWwuXHJcbiAgICAgKiBAcGFyYW0gcmVxdWlyZW1lbnRMZXZlbCBUaGUgcmVxdWlyZW1lbnQgbGV2ZWwsIGFzIGVpdGhlciBcIm5vbmVcIiwgXCJyZXF1aXJlZFwiLCBvciBcInJlY29tbWVuZGVkXCJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldFJlcXVpcmVkTGV2ZWwoXHJcbiAgICAgIHJlcXVpcmVtZW50TGV2ZWw6IFhybS5BdHRyaWJ1dGVzLlJlcXVpcmVtZW50TGV2ZWxcclxuICAgICk6IHRoaXMge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHRoaXMuQXR0cmlidXRlLnNldFJlcXVpcmVkTGV2ZWwocmVxdWlyZW1lbnRMZXZlbCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7WHJtRXguZ2V0TWV0aG9kTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIHJlcXVpcmVkIGxldmVsLlxyXG4gICAgICogQHBhcmFtIHJlcXVpcmVkIFRoZSByZXF1aXJlbWVudCBsZXZlbCwgYXMgZWl0aGVyIGZhbHNlIGZvciBcIm5vbmVcIiBvciB0cnVlIGZvciBcInJlcXVpcmVkXCJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldFJlcXVpcmVkKHJlcXVpcmVkOiBib29sZWFuKTogdGhpcyB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgdGhpcy5BdHRyaWJ1dGUuc2V0UmVxdWlyZWRMZXZlbChyZXF1aXJlZCA/IFwicmVxdWlyZWRcIiA6IFwibm9uZVwiKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguJHtYcm1FeC5nZXRNZXRob2ROYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKkZpcmUgYWxsIFwib24gY2hhbmdlXCIgZXZlbnQgaGFuZGxlcnMuICovXHJcbiAgICBwdWJsaWMgZmlyZU9uQ2hhbmdlKCk6IHRoaXMge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHRoaXMuQXR0cmlidXRlLmZpcmVPbkNoYW5nZSgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke1hybUV4LmdldE1ldGhvZE5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGEgaGFuZGxlciBvciBhbiBhcnJheSBvZiBoYW5kbGVycyB0byBiZSBjYWxsZWQgd2hlbiB0aGUgYXR0cmlidXRlJ3MgdmFsdWUgaXMgY2hhbmdlZC5cclxuICAgICAqIEBwYXJhbSBoYW5kbGVycyBUaGUgZnVuY3Rpb24gcmVmZXJlbmNlIG9yIGFuIGFycmF5IG9mIGZ1bmN0aW9uIHJlZmVyZW5jZXMuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhZGRPbkNoYW5nZShcclxuICAgICAgaGFuZGxlcnM6XHJcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyXHJcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyW11cclxuICAgICk6IHRoaXMge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGhhbmRsZXJzKSkge1xyXG4gICAgICAgICAgZm9yIChjb25zdCBoYW5kbGVyIG9mIGhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gXCJmdW5jdGlvblwiKVxyXG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJyR7aGFuZGxlcn0nIGlzIG5vdCBhIGZ1bmN0aW9uYCk7XHJcbiAgICAgICAgICAgIHRoaXMuQXR0cmlidXRlLnJlbW92ZU9uQ2hhbmdlKGhhbmRsZXIpO1xyXG4gICAgICAgICAgICB0aGlzLkF0dHJpYnV0ZS5hZGRPbkNoYW5nZShoYW5kbGVyKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVycyAhPT0gXCJmdW5jdGlvblwiKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCcke2hhbmRsZXJzfScgaXMgbm90IGEgZnVuY3Rpb25gKTtcclxuICAgICAgICAgIHRoaXMuQXR0cmlidXRlLnJlbW92ZU9uQ2hhbmdlKGhhbmRsZXJzKTtcclxuICAgICAgICAgIHRoaXMuQXR0cmlidXRlLmFkZE9uQ2hhbmdlKGhhbmRsZXJzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7WHJtRXguZ2V0TWV0aG9kTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERpc3BsYXlzIGFuIGVycm9yIG9yIHJlY29tbWVuZGF0aW9uIG5vdGlmaWNhdGlvbiBmb3IgYSBjb250cm9sLCBhbmQgbGV0cyB5b3Ugc3BlY2lmeSBhY3Rpb25zIHRvIGV4ZWN1dGUgYmFzZWQgb24gdGhlIG5vdGlmaWNhdGlvbi5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGFkZE5vdGlmaWNhdGlvbihcclxuICAgICAgbWVzc2FnZTogc3RyaW5nLFxyXG4gICAgICBub3RpZmljYXRpb25MZXZlbDogXCJFUlJPUlwiIHwgXCJSRUNPTU1FTkRBVElPTlwiLFxyXG4gICAgICB1bmlxdWVJZDogc3RyaW5nLFxyXG4gICAgICBhY3Rpb25zPzogWHJtLkNvbnRyb2xzLkNvbnRyb2xOb3RpZmljYXRpb25BY3Rpb25bXVxyXG4gICAgKTogdGhpcyB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgaWYgKCF1bmlxdWVJZCkgdGhyb3cgbmV3IEVycm9yKGBubyB1bmlxdWVJZCB3YXMgcHJvdmlkZWQuYCk7XHJcbiAgICAgICAgaWYgKGFjdGlvbnMgJiYgIUFycmF5LmlzQXJyYXkoYWN0aW9ucykpXHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICAgIGB0aGUgYWN0aW9uIHBhcmFtZXRlciBpcyBub3QgYW4gYXJyYXkgb2YgQ29udHJvbE5vdGlmaWNhdGlvbkFjdGlvbmBcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PiB7XHJcbiAgICAgICAgICBjb250cm9sLmFkZE5vdGlmaWNhdGlvbih7XHJcbiAgICAgICAgICAgIG1lc3NhZ2VzOiBbbWVzc2FnZV0sXHJcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbkxldmVsOiBub3RpZmljYXRpb25MZXZlbCxcclxuICAgICAgICAgICAgdW5pcXVlSWQ6IHVuaXF1ZUlkLFxyXG4gICAgICAgICAgICBhY3Rpb25zOiBhY3Rpb25zLFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7WHJtRXguZ2V0TWV0aG9kTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQ2xlYXJzIHRoZSBub3RpZmljYXRpb24gaWRlbnRpZmllZCBieSB1bmlxdWVJZC5cclxuICAgICAqIEBwYXJhbSB1bmlxdWVJZCAoT3B0aW9uYWwpIFVuaXF1ZSBpZGVudGlmaWVyLlxyXG4gICAgICogQHJldHVybnMgdHJ1ZSBpZiBpdCBzdWNjZWVkcywgZmFsc2UgaWYgaXQgZmFpbHMuXHJcbiAgICAgKiBAcmVtYXJrcyBJZiB0aGUgdW5pcXVlSWQgcGFyYW1ldGVyIGlzIG5vdCB1c2VkLCB0aGUgY3VycmVudCBub3RpZmljYXRpb24gc2hvd24gd2lsbCBiZSByZW1vdmVkLlxyXG4gICAgICovXHJcbiAgICByZW1vdmVOb3RpZmljYXRpb24odW5pcXVlSWQ6IHN0cmluZyk6IHRoaXMge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHRoaXMuY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT4ge1xyXG4gICAgICAgICAgY29udHJvbC5jbGVhck5vdGlmaWNhdGlvbih1bmlxdWVJZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7WHJtRXguZ2V0TWV0aG9kTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgZXhwb3J0IGNsYXNzIFRleHRGaWVsZFxyXG4gICAgZXh0ZW5kcyBGaWVsZFxyXG4gICAgaW1wbGVtZW50cyBYcm0uQXR0cmlidXRlcy5TdHJpbmdBdHRyaWJ1dGUge1xyXG4gICAgcHJvdGVjdGVkIGRlY2xhcmUgX2F0dHJpYnV0ZTogWHJtLkF0dHJpYnV0ZXMuU3RyaW5nQXR0cmlidXRlO1xyXG4gICAgY29uc3RydWN0b3IoYXR0cmlidXRlOiBzdHJpbmcpIHtcclxuICAgICAgc3VwZXIoYXR0cmlidXRlKTtcclxuICAgIH1cclxuICAgIGdldE1heExlbmd0aCgpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0TWF4TGVuZ3RoKCk7XHJcbiAgICB9XHJcbiAgICBnZXRGb3JtYXQoKTogWHJtLkF0dHJpYnV0ZXMuU3RyaW5nQXR0cmlidXRlRm9ybWF0IHtcclxuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEZvcm1hdCgpIGFzIFhybS5BdHRyaWJ1dGVzLlN0cmluZ0F0dHJpYnV0ZUZvcm1hdDtcclxuICAgIH1cclxuICAgIGdldCBBdHRyaWJ1dGUoKSB7XHJcbiAgICAgIHJldHVybiAodGhpcy5fYXR0cmlidXRlID8/PVxyXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKHRoaXMuTmFtZSkgPz9cclxuICAgICAgICBYcm1FeC50aHJvd0Vycm9yKGBGaWVsZCAnJHt0aGlzLk5hbWV9JyBkb2VzIG5vdCBleGlzdGApKTtcclxuICAgIH1cclxuICAgIGdldCBjb250cm9scygpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmNvbnRyb2xzO1xyXG4gICAgfVxyXG4gICAgZ2V0IFZhbHVlKCk6IHN0cmluZyB7XHJcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRWYWx1ZSgpID8/IG51bGw7XHJcbiAgICB9XHJcbiAgICBzZXQgVmFsdWUodmFsdWU6IHN0cmluZykge1xyXG4gICAgICB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh2YWx1ZSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGV4cG9ydCBjbGFzcyBOdW1iZXJGaWVsZFxyXG4gICAgZXh0ZW5kcyBGaWVsZFxyXG4gICAgaW1wbGVtZW50cyBYcm0uQXR0cmlidXRlcy5OdW1iZXJBdHRyaWJ1dGUge1xyXG4gICAgcHJvdGVjdGVkIGRlY2xhcmUgX2F0dHJpYnV0ZTogWHJtLkF0dHJpYnV0ZXMuTnVtYmVyQXR0cmlidXRlO1xyXG4gICAgY29uc3RydWN0b3IoYXR0cmlidXRlOiBzdHJpbmcpIHtcclxuICAgICAgc3VwZXIoYXR0cmlidXRlKTtcclxuICAgIH1cclxuICAgIGdldEZvcm1hdCgpOiBYcm0uQXR0cmlidXRlcy5JbnRlZ2VyQXR0cmlidXRlRm9ybWF0IHtcclxuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEZvcm1hdCgpIGFzIFhybS5BdHRyaWJ1dGVzLkludGVnZXJBdHRyaWJ1dGVGb3JtYXQ7XHJcbiAgICB9XHJcbiAgICBnZXRNYXgoKTogbnVtYmVyIHtcclxuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldE1heCgpO1xyXG4gICAgfVxyXG4gICAgZ2V0TWluKCk6IG51bWJlciB7XHJcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRNaW4oKTtcclxuICAgIH1cclxuICAgIGdldFByZWNpc2lvbigpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0UHJlY2lzaW9uKCk7XHJcbiAgICB9XHJcbiAgICBzZXRQcmVjaXNpb24ocHJlY2lzaW9uOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLnNldFByZWNpc2lvbihwcmVjaXNpb24pO1xyXG4gICAgfVxyXG4gICAgZ2V0IEF0dHJpYnV0ZSgpIHtcclxuICAgICAgcmV0dXJuICh0aGlzLl9hdHRyaWJ1dGUgPz89XHJcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUodGhpcy5OYW1lKSA/P1xyXG4gICAgICAgIFhybUV4LnRocm93RXJyb3IoYEZpZWxkICcke3RoaXMuTmFtZX0nIGRvZXMgbm90IGV4aXN0YCkpO1xyXG4gICAgfVxyXG4gICAgZ2V0IGNvbnRyb2xzKCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuY29udHJvbHM7XHJcbiAgICB9XHJcbiAgICBnZXQgVmFsdWUoKTogbnVtYmVyIHtcclxuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFZhbHVlKCkgPz8gbnVsbDtcclxuICAgIH1cclxuICAgIHNldCBWYWx1ZSh2YWx1ZTogbnVtYmVyKSB7XHJcbiAgICAgIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKHZhbHVlKTtcclxuICAgIH1cclxuICB9XHJcbiAgZXhwb3J0IGNsYXNzIERhdGVGaWVsZCBleHRlbmRzIEZpZWxkIGltcGxlbWVudHMgWHJtLkF0dHJpYnV0ZXMuRGF0ZUF0dHJpYnV0ZSB7XHJcbiAgICBwcm90ZWN0ZWQgZGVjbGFyZSBfYXR0cmlidXRlOiBYcm0uQXR0cmlidXRlcy5EYXRlQXR0cmlidXRlO1xyXG4gICAgY29uc3RydWN0b3IoYXR0cmlidXRlOiBzdHJpbmcpIHtcclxuICAgICAgc3VwZXIoYXR0cmlidXRlKTtcclxuICAgIH1cclxuICAgIGdldEZvcm1hdCgpOiBYcm0uQXR0cmlidXRlcy5EYXRlQXR0cmlidXRlRm9ybWF0IHtcclxuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEZvcm1hdCgpIGFzIFhybS5BdHRyaWJ1dGVzLkRhdGVBdHRyaWJ1dGVGb3JtYXQ7XHJcbiAgICB9XHJcbiAgICBnZXQgQXR0cmlidXRlKCkge1xyXG4gICAgICByZXR1cm4gKHRoaXMuX2F0dHJpYnV0ZSA/Pz1cclxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZSh0aGlzLk5hbWUpID8/XHJcbiAgICAgICAgWHJtRXgudGhyb3dFcnJvcihgRmllbGQgJyR7dGhpcy5OYW1lfScgZG9lcyBub3QgZXhpc3RgKSk7XHJcbiAgICB9XHJcbiAgICBnZXQgY29udHJvbHMoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5jb250cm9scztcclxuICAgIH1cclxuICAgIGdldCBWYWx1ZSgpOiBEYXRlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFZhbHVlKCkgPz8gbnVsbDtcclxuICAgIH1cclxuICAgIHNldCBWYWx1ZSh2YWx1ZTogRGF0ZSkge1xyXG4gICAgICB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh2YWx1ZSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGV4cG9ydCBjbGFzcyBCb29sZWFuRmllbGRcclxuICAgIGV4dGVuZHMgRmllbGRcclxuICAgIGltcGxlbWVudHMgWHJtLkF0dHJpYnV0ZXMuQm9vbGVhbkF0dHJpYnV0ZSB7XHJcbiAgICBwcm90ZWN0ZWQgZGVjbGFyZSBfYXR0cmlidXRlOiBYcm0uQXR0cmlidXRlcy5Cb29sZWFuQXR0cmlidXRlO1xyXG4gICAgY29uc3RydWN0b3IoYXR0cmlidXRlOiBzdHJpbmcpIHtcclxuICAgICAgc3VwZXIoYXR0cmlidXRlKTtcclxuICAgIH1cclxuICAgIGdldEF0dHJpYnV0ZVR5cGUoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRBdHRyaWJ1dGVUeXBlKCk7XHJcbiAgICB9XHJcbiAgICBnZXRJbml0aWFsVmFsdWUoKTogYm9vbGVhbiB7XHJcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRJbml0aWFsVmFsdWUoKTtcclxuICAgIH1cclxuICAgIGdldCBBdHRyaWJ1dGUoKSB7XHJcbiAgICAgIHJldHVybiAodGhpcy5fYXR0cmlidXRlID8/PVxyXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKHRoaXMuTmFtZSkgPz9cclxuICAgICAgICBYcm1FeC50aHJvd0Vycm9yKGBGaWVsZCAnJHt0aGlzLk5hbWV9JyBkb2VzIG5vdCBleGlzdGApKTtcclxuICAgIH1cclxuICAgIGdldCBjb250cm9scygpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmNvbnRyb2xzO1xyXG4gICAgfVxyXG4gICAgZ2V0IFZhbHVlKCk6IGJvb2xlYW4ge1xyXG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0VmFsdWUoKSA/PyBudWxsO1xyXG4gICAgfVxyXG4gICAgc2V0IFZhbHVlKHZhbHVlOiBib29sZWFuKSB7XHJcbiAgICAgIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKHZhbHVlKTtcclxuICAgIH1cclxuICB9XHJcbiAgZXhwb3J0IGNsYXNzIE11bHRpU2VsZWN0T3B0aW9uU2V0RmllbGQ8T3B0aW9ucyBleHRlbmRzIE9wdGlvblZhbHVlcz5cclxuICAgIGV4dGVuZHMgRmllbGRcclxuICAgIGltcGxlbWVudHMgWHJtLkF0dHJpYnV0ZXMuTXVsdGlTZWxlY3RPcHRpb25TZXRBdHRyaWJ1dGUge1xyXG4gICAgcHJvdGVjdGVkIGRlY2xhcmUgX2F0dHJpYnV0ZTogWHJtLkF0dHJpYnV0ZXMuTXVsdGlTZWxlY3RPcHRpb25TZXRBdHRyaWJ1dGU7XHJcbiAgICBPcHRpb246IE9wdGlvbnM7XHJcbiAgICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsIG9wdGlvbj86IE9wdGlvbnMpIHtcclxuICAgICAgc3VwZXIoYXR0cmlidXRlTmFtZSk7XHJcbiAgICAgIHRoaXMuT3B0aW9uID0gb3B0aW9uO1xyXG4gICAgfVxyXG4gICAgZ2V0Rm9ybWF0KCk6IFhybS5BdHRyaWJ1dGVzLk9wdGlvblNldEF0dHJpYnV0ZUZvcm1hdCB7XHJcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRGb3JtYXQoKSBhcyBYcm0uQXR0cmlidXRlcy5PcHRpb25TZXRBdHRyaWJ1dGVGb3JtYXQ7XHJcbiAgICB9XHJcbiAgICBnZXRPcHRpb24odmFsdWU6IG51bWJlciB8IHN0cmluZyk6IFhybS5PcHRpb25TZXRWYWx1ZSB7XHJcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0T3B0aW9uKHZhbHVlKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0T3B0aW9uKHZhbHVlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0T3B0aW9ucygpOiBYcm0uT3B0aW9uU2V0VmFsdWVbXSB7XHJcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRPcHRpb25zKCk7XHJcbiAgICB9XHJcbiAgICBnZXRTZWxlY3RlZE9wdGlvbigpOiBYcm0uT3B0aW9uU2V0VmFsdWVbXSB7XHJcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRTZWxlY3RlZE9wdGlvbigpO1xyXG4gICAgfVxyXG4gICAgZ2V0VGV4dCgpOiBzdHJpbmdbXSB7XHJcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRUZXh0KCk7XHJcbiAgICB9XHJcbiAgICBnZXRJbml0aWFsVmFsdWUoKTogbnVtYmVyW10ge1xyXG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0SW5pdGlhbFZhbHVlKCk7XHJcbiAgICB9XHJcbiAgICBnZXQgQXR0cmlidXRlKCkge1xyXG4gICAgICByZXR1cm4gKHRoaXMuX2F0dHJpYnV0ZSA/Pz1cclxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZSh0aGlzLk5hbWUpID8/XHJcbiAgICAgICAgWHJtRXgudGhyb3dFcnJvcihgRmllbGQgJyR7dGhpcy5OYW1lfScgZG9lcyBub3QgZXhpc3RgKSk7XHJcbiAgICB9XHJcbiAgICBnZXQgY29udHJvbHMoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5jb250cm9scztcclxuICAgIH1cclxuICAgIGdldCBWYWx1ZSgpOiBudW1iZXJbXSB7XHJcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRWYWx1ZSgpO1xyXG4gICAgfVxyXG4gICAgc2V0IFZhbHVlKHZhbHVlOiAoa2V5b2YgT3B0aW9ucylbXSB8IG51bWJlcltdKSB7XHJcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xyXG4gICAgICAgIGxldCB2YWx1ZXMgPSBbXTtcclxuICAgICAgICB2YWx1ZS5mb3JFYWNoKCh2KSA9PiB7XHJcbiAgICAgICAgICBpZiAodHlwZW9mIHYgPT0gXCJudW1iZXJcIikgdmFsdWVzLnB1c2godik7XHJcbiAgICAgICAgICBlbHNlIHZhbHVlcy5wdXNoKHRoaXMuT3B0aW9uW3ZdKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh2YWx1ZXMpO1xyXG4gICAgICB9IGVsc2UgWHJtRXgudGhyb3dFcnJvcihgRmllbGQgVmFsdWUgJyR7dmFsdWV9JyBpcyBub3QgYW4gQXJyYXlgKTtcclxuICAgIH1cclxuICB9XHJcbiAgZXhwb3J0IGNsYXNzIExvb2t1cEZpZWxkXHJcbiAgICBleHRlbmRzIEZpZWxkXHJcbiAgICBpbXBsZW1lbnRzIFhybS5BdHRyaWJ1dGVzLkxvb2t1cEF0dHJpYnV0ZSB7XHJcbiAgICBwcm90ZWN0ZWQgZGVjbGFyZSBfYXR0cmlidXRlOiBYcm0uQXR0cmlidXRlcy5Mb29rdXBBdHRyaWJ1dGU7XHJcbiAgICBwcm90ZWN0ZWQgX2N1c3RvbUZpbHRlcnM6IGFueSA9IFtdO1xyXG4gICAgY29uc3RydWN0b3IoYXR0cmlidXRlOiBzdHJpbmcpIHtcclxuICAgICAgc3VwZXIoYXR0cmlidXRlKTtcclxuICAgIH1cclxuICAgIGdldElzUGFydHlMaXN0KCk6IGJvb2xlYW4ge1xyXG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0SXNQYXJ0eUxpc3QoKTtcclxuICAgIH1cclxuICAgIGdldCBBdHRyaWJ1dGUoKSB7XHJcbiAgICAgIHJldHVybiAodGhpcy5fYXR0cmlidXRlID8/PVxyXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKHRoaXMuTmFtZSkgPz9cclxuICAgICAgICBYcm1FeC50aHJvd0Vycm9yKGBGaWVsZCAnJHt0aGlzLk5hbWV9JyBkb2VzIG5vdCBleGlzdGApKTtcclxuICAgIH1cclxuICAgIGdldCBjb250cm9scygpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmNvbnRyb2xzO1xyXG4gICAgfVxyXG4gICAgLyoqR2V0cyB0aGUgaWQgb2YgdGhlIGZpcnN0IGxvb2t1cCB2YWx1ZSovXHJcbiAgICBnZXQgSWQoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLlZhbHVlICYmIHRoaXMuVmFsdWUubGVuZ3RoID4gMFxyXG4gICAgICAgID8gWHJtRXgubm9ybWFsaXplR3VpZCh0aGlzLlZhbHVlWzBdLmlkKVxyXG4gICAgICAgIDogbnVsbDtcclxuICAgIH1cclxuICAgIC8qKkdldHMgdGhlIGVudGl0eVR5cGUgb2YgdGhlIGZpcnN0IGxvb2t1cCB2YWx1ZSovXHJcbiAgICBnZXQgRW50aXR5VHlwZSgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuVmFsdWUgJiYgdGhpcy5WYWx1ZS5sZW5ndGggPiAwXHJcbiAgICAgICAgPyB0aGlzLlZhbHVlWzBdLmVudGl0eVR5cGVcclxuICAgICAgICA6IG51bGw7XHJcbiAgICB9XHJcbiAgICAvKipHZXRzIHRoZSBmb3JtYXR0ZWQgdmFsdWUgb2YgdGhlIGZpcnN0IGxvb2t1cCB2YWx1ZSovXHJcbiAgICBnZXQgRm9ybWF0dGVkVmFsdWUoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLlZhbHVlICYmIHRoaXMuVmFsdWUubGVuZ3RoID4gMCA/IHRoaXMuVmFsdWVbMF0ubmFtZSA6IG51bGw7XHJcbiAgICB9XHJcbiAgICBnZXQgVmFsdWUoKTogWHJtLkxvb2t1cFZhbHVlW10ge1xyXG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0VmFsdWUoKSA/PyBudWxsO1xyXG4gICAgfVxyXG4gICAgc2V0IFZhbHVlKHZhbHVlOiBYcm0uTG9va3VwVmFsdWVbXSkge1xyXG4gICAgICB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh2YWx1ZSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIHZhbHVlIG9mIGEgbG9va3VwXHJcbiAgICAgKiBAcGFyYW0gaWQgR3VpZCBvZiB0aGUgcmVjb3JkXHJcbiAgICAgKiBAcGFyYW0gZW50aXR5VHlwZSBsb2dpY2FsbmFtZSBvZiB0aGUgZW50aXR5XHJcbiAgICAgKiBAcGFyYW0gbmFtZSBmb3JtYXR0ZWQgdmFsdWVcclxuICAgICAqIEBwYXJhbSBhcHBlbmQgaWYgdHJ1ZSwgYWRkcyB2YWx1ZSB0byB0aGUgYXJyYXkgaW5zdGVhZCBvZiByZXBsYWNpbmcgaXRcclxuICAgICAqL1xyXG4gICAgc2V0TG9va3VwVmFsdWUoXHJcbiAgICAgIGlkOiBzdHJpbmcsXHJcbiAgICAgIGVudGl0eVR5cGU6IGFueSxcclxuICAgICAgbmFtZTogYW55LFxyXG4gICAgICBhcHBlbmQgPSBmYWxzZVxyXG4gICAgKTogdGhpcyB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgaWYgKCFpZCkgdGhyb3cgbmV3IEVycm9yKGBubyBpZCBwYXJhbWV0ZXIgd2FzIHByb3ZpZGVkLmApO1xyXG4gICAgICAgIGlmICghZW50aXR5VHlwZSlcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgbm8gZW50aXR5VHlwZSBwYXJhbWV0ZXIgd2FzIHByb3ZpZGVkLmApO1xyXG4gICAgICAgIGlkID0gWHJtRXgubm9ybWFsaXplR3VpZChpZCk7XHJcbiAgICAgICAgY29uc3QgbG9va3VwVmFsdWUgPSB7XHJcbiAgICAgICAgICBpZCxcclxuICAgICAgICAgIGVudGl0eVR5cGUsXHJcbiAgICAgICAgICBuYW1lLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5WYWx1ZSA9XHJcbiAgICAgICAgICBhcHBlbmQgJiYgdGhpcy5WYWx1ZSA/IHRoaXMuVmFsdWUuY29uY2F0KGxvb2t1cFZhbHVlKSA6IFtsb29rdXBWYWx1ZV07XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7WHJtRXguZ2V0TWV0aG9kTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0cmlldmVzIGFuIGVudGl0eSByZWNvcmQuXHJcbiAgICAgKiBAcGFyYW0gb3B0aW9ucyAoT3B0aW9uYWwpIE9EYXRhIHN5c3RlbSBxdWVyeSBvcHRpb25zLCAkc2VsZWN0IGFuZCAkZXhwYW5kLCB0byByZXRyaWV2ZSB5b3VyIGRhdGEuXHJcbiAgICAgKiAtIFVzZSB0aGUgJHNlbGVjdCBzeXN0ZW0gcXVlcnkgb3B0aW9uIHRvIGxpbWl0IHRoZSBwcm9wZXJ0aWVzIHJldHVybmVkIGJ5IGluY2x1ZGluZyBhIGNvbW1hLXNlcGFyYXRlZFxyXG4gICAgICogICBsaXN0IG9mIHByb3BlcnR5IG5hbWVzLiBUaGlzIGlzIGFuIGltcG9ydGFudCBwZXJmb3JtYW5jZSBiZXN0IHByYWN0aWNlLiBJZiBwcm9wZXJ0aWVzIGFyZW7igJl0XHJcbiAgICAgKiAgIHNwZWNpZmllZCB1c2luZyAkc2VsZWN0LCBhbGwgcHJvcGVydGllcyB3aWxsIGJlIHJldHVybmVkLlxyXG4gICAgICogLSBVc2UgdGhlICRleHBhbmQgc3lzdGVtIHF1ZXJ5IG9wdGlvbiB0byBjb250cm9sIHdoYXQgZGF0YSBmcm9tIHJlbGF0ZWQgZW50aXRpZXMgaXMgcmV0dXJuZWQuIElmIHlvdVxyXG4gICAgICogICBqdXN0IGluY2x1ZGUgdGhlIG5hbWUgb2YgdGhlIG5hdmlnYXRpb24gcHJvcGVydHksIHlvdeKAmWxsIHJlY2VpdmUgYWxsIHRoZSBwcm9wZXJ0aWVzIGZvciByZWxhdGVkXHJcbiAgICAgKiAgIHJlY29yZHMuIFlvdSBjYW4gbGltaXQgdGhlIHByb3BlcnRpZXMgcmV0dXJuZWQgZm9yIHJlbGF0ZWQgcmVjb3JkcyB1c2luZyB0aGUgJHNlbGVjdCBzeXN0ZW0gcXVlcnlcclxuICAgICAqICAgb3B0aW9uIGluIHBhcmVudGhlc2VzIGFmdGVyIHRoZSBuYXZpZ2F0aW9uIHByb3BlcnR5IG5hbWUuIFVzZSB0aGlzIGZvciBib3RoIHNpbmdsZS12YWx1ZWQgYW5kXHJcbiAgICAgKiAgIGNvbGxlY3Rpb24tdmFsdWVkIG5hdmlnYXRpb24gcHJvcGVydGllcy5cclxuICAgICAqIC0gWW91IGNhbiBhbHNvIHNwZWNpZnkgbXVsdGlwbGUgcXVlcnkgb3B0aW9ucyBieSB1c2luZyAmIHRvIHNlcGFyYXRlIHRoZSBxdWVyeSBvcHRpb25zLlxyXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+b3B0aW9ucyBleGFtcGxlOjwvY2FwdGlvbj5cclxuICAgICAqIG9wdGlvbnM6ICRzZWxlY3Q9bmFtZSYkZXhwYW5kPXByaW1hcnljb250YWN0aWQoJHNlbGVjdD1jb250YWN0aWQsZnVsbG5hbWUpXHJcbiAgICAgKiBAcmV0dXJucyBPbiBzdWNjZXNzLCByZXR1cm5zIGEgcHJvbWlzZSBjb250YWluaW5nIGEgSlNPTiBvYmplY3Qgd2l0aCB0aGUgcmV0cmlldmVkIGF0dHJpYnV0ZXMgYW5kIHRoZWlyIHZhbHVlcy5cclxuICAgICAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZG9jcy5taWNyb3NvZnQuY29tL2VuLXVzL2R5bmFtaWNzMzY1L2N1c3RvbWVyLWVuZ2FnZW1lbnQvZGV2ZWxvcGVyL2NsaWVudGFwaS9yZWZlcmVuY2UveHJtLXdlYmFwaS9yZXRyaWV2ZXJlY29yZCBFeHRlcm5hbCBMaW5rOiByZXRyaWV2ZVJlY29yZCAoQ2xpZW50IEFQSSByZWZlcmVuY2UpfVxyXG4gICAgICovXHJcbiAgICBhc3luYyByZXRyaWV2ZShvcHRpb25zOiBzdHJpbmcpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBpZiAoIXRoaXMuSWQgfHwgIXRoaXMuRW50aXR5VHlwZSkgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgY29uc3QgcmVjb3JkID0gYXdhaXQgWHJtLldlYkFwaS5yZXRyaWV2ZVJlY29yZChcclxuICAgICAgICAgIHRoaXMuRW50aXR5VHlwZSxcclxuICAgICAgICAgIHRoaXMuSWQsXHJcbiAgICAgICAgICBvcHRpb25zXHJcbiAgICAgICAgKTtcclxuICAgICAgICByZXR1cm4gcmVjb3JkO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke1hybUV4LmdldE1ldGhvZE5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYW4gYWRkaXRpb25hbCBjdXN0b20gZmlsdGVyIHRvIHRoZSBsb29rdXAsIHdpdGggdGhlIFwiQU5EXCIgZmlsdGVyIG9wZXJhdG9yLlxyXG4gICAgICogQHBhcmFtIGZpbHRlciBTcGVjaWZpZXMgdGhlIGZpbHRlciwgYXMgYSBzZXJpYWxpemVkIEZldGNoWE1MIFwiZmlsdGVyXCIgbm9kZS5cclxuICAgICAqIEBwYXJhbSBlbnRpdHlMb2dpY2FsTmFtZSAoT3B0aW9uYWwpIFRoZSBsb2dpY2FsIG5hbWUgb2YgdGhlIGVudGl0eS5cclxuICAgICAqIEByZW1hcmtzICAgICBJZiBlbnRpdHlMb2dpY2FsTmFtZSBpcyBub3Qgc3BlY2lmaWVkLCB0aGUgZmlsdGVyIHdpbGwgYmUgYXBwbGllZCB0byBhbGwgZW50aXRpZXNcclxuICAgICAqICAgICAgICAgICAgICB2YWxpZCBmb3IgdGhlIExvb2t1cCBjb250cm9sLlxyXG4gICAgICogQGV4YW1wbGUgICAgIEV4YW1wbGUgZmlsdGVyOiA8ZmlsdGVyIHR5cGU9XCJhbmRcIj5cclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCJhZGRyZXNzMV9jaXR5XCIgb3BlcmF0b3I9XCJlcVwiIHZhbHVlPVwiUmVkbW9uZFwiIC8+XHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZmlsdGVyPlxyXG4gICAgICovXHJcbiAgICBhZGRQcmVGaWx0ZXJUb0xvb2t1cChmaWx0ZXJYbWw6IHN0cmluZywgZW50aXR5TG9naWNhbE5hbWU/OiBzdHJpbmcpOiB0aGlzIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBfYWRkQ3VzdG9tRmlsdGVyLmNvbnRyb2xzID0gdGhpcy5jb250cm9scztcclxuICAgICAgICB0aGlzLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2wpID0+IHtcclxuICAgICAgICAgIGNvbnRyb2wuYWRkUHJlU2VhcmNoKF9hZGRDdXN0b21GaWx0ZXIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX2N1c3RvbUZpbHRlcnMucHVzaChfYWRkQ3VzdG9tRmlsdGVyKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguJHtYcm1FeC5nZXRNZXRob2ROYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gX2FkZEN1c3RvbUZpbHRlcigpIHtcclxuICAgICAgICBfYWRkQ3VzdG9tRmlsdGVyLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2wpID0+IHtcclxuICAgICAgICAgIGNvbnRyb2wuYWRkQ3VzdG9tRmlsdGVyKGZpbHRlclhtbCwgZW50aXR5TG9naWNhbE5hbWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYW4gYWRkaXRpb25hbCBjdXN0b20gZmlsdGVyIHRvIHRoZSBsb29rdXAsIHdpdGggdGhlIFwiQU5EXCIgZmlsdGVyIG9wZXJhdG9yLlxyXG4gICAgICogQHBhcmFtIGVudGl0eUxvZ2ljYWxOYW1lIChPcHRpb25hbCkgVGhlIGxvZ2ljYWwgbmFtZSBvZiB0aGUgZW50aXR5LlxyXG4gICAgICogQHBhcmFtIHByaW1hcnlBdHRyaWJ1dGVJZE5hbWUgKE9wdGlvbmFsKSBUaGUgbG9naWNhbCBuYW1lIG9mIHRoZSBwcmltYXJ5IGtleS5cclxuICAgICAqIEBwYXJhbSBmZXRjaFhtbCBTcGVjaWZpZXMgdGhlIEZldGNoWE1MIHVzZWQgdG8gZmlsdGVyLlxyXG4gICAgICogQHJlbWFya3MgICAgIElmIGVudGl0eUxvZ2ljYWxOYW1lIGlzIG5vdCBzcGVjaWZpZWQsIHRoZSBmaWx0ZXIgd2lsbCBiZSBhcHBsaWVkIHRvIGFsbCBlbnRpdGllc1xyXG4gICAgICogICAgICAgICAgICAgIHZhbGlkIGZvciB0aGUgTG9va3VwIGNvbnRyb2wuXHJcbiAgICAgKiBAZXhhbXBsZSAgICAgRXhhbXBsZSBmZXRjaFhtbDogPGZldGNoPlxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZW50aXR5IG5hbWU9XCJjb250YWN0XCI+XHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZmlsdGVyPlxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCJhZGRyZXNzMV9jaXR5XCIgb3BlcmF0b3I9XCJlcVwiIHZhbHVlPVwiUmVkbW9uZFwiIC8+XHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2ZpbHRlcj5cclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9lbnRpdHk+XHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZmV0Y2g+XHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGFkZFByZUZpbHRlclRvTG9va3VwQWR2YW5jZWQoXHJcbiAgICAgIGVudGl0eUxvZ2ljYWxOYW1lOiBzdHJpbmcsXHJcbiAgICAgIHByaW1hcnlBdHRyaWJ1dGVJZE5hbWU6IHN0cmluZyxcclxuICAgICAgZmV0Y2hYbWw6IHN0cmluZ1xyXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgWHJtLldlYkFwaS5vbmxpbmUucmV0cmlldmVNdWx0aXBsZVJlY29yZHMoXHJcbiAgICAgICAgICBlbnRpdHlMb2dpY2FsTmFtZSxcclxuICAgICAgICAgIFwiP2ZldGNoWG1sPVwiICsgZmV0Y2hYbWxcclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnN0IGRhdGEgPSByZXN1bHQuZW50aXRpZXM7XHJcbiAgICAgICAgbGV0IGZpbHRlcmVkRW50aXRpZXMgPSBcIlwiO1xyXG4gICAgICAgIF9hZGRDdXN0b21GaWx0ZXIuY29udHJvbHMgPSB0aGlzLmNvbnRyb2xzO1xyXG4gICAgICAgIGRhdGEuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgZmlsdGVyZWRFbnRpdGllcyArPSBgPHZhbHVlPiR7aXRlbVtwcmltYXJ5QXR0cmlidXRlSWROYW1lXX08L3ZhbHVlPmA7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZmV0Y2hYbWwgPSBmaWx0ZXJlZEVudGl0aWVzXHJcbiAgICAgICAgICA/IGA8ZmlsdGVyPjxjb25kaXRpb24gYXR0cmlidXRlPScke3ByaW1hcnlBdHRyaWJ1dGVJZE5hbWV9JyBvcGVyYXRvcj0naW4nPiR7ZmlsdGVyZWRFbnRpdGllc308L2NvbmRpdGlvbj48L2ZpbHRlcj5gXHJcbiAgICAgICAgICA6IGA8ZmlsdGVyPjxjb25kaXRpb24gYXR0cmlidXRlPScke3ByaW1hcnlBdHRyaWJ1dGVJZE5hbWV9JyBvcGVyYXRvcj0nbnVsbCcvPjwvZmlsdGVyPmA7XHJcbiAgICAgICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PiB7XHJcbiAgICAgICAgICBjb250cm9sLmFkZFByZVNlYXJjaChfYWRkQ3VzdG9tRmlsdGVyKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9jdXN0b21GaWx0ZXJzLnB1c2goX2FkZEN1c3RvbUZpbHRlcik7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7WHJtRXguZ2V0TWV0aG9kTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICAgIH1cclxuICAgICAgZnVuY3Rpb24gX2FkZEN1c3RvbUZpbHRlcigpIHtcclxuICAgICAgICBfYWRkQ3VzdG9tRmlsdGVyLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2wpID0+IHtcclxuICAgICAgICAgIGNvbnRyb2wuYWRkQ3VzdG9tRmlsdGVyKGZldGNoWG1sLCBlbnRpdHlMb2dpY2FsTmFtZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBhbGwgZmlsdGVycyBzZXQgb24gdGhlIGN1cnJlbnQgbG9va3VwIGF0dHJpYnV0ZSBieSB1c2luZyBhZGRQcmVGaWx0ZXJUb0xvb2t1cCBvciBhZGRQcmVGaWx0ZXJUb0xvb2t1cEFkdmFuY2VkXHJcbiAgICAgKi9cclxuICAgIGNsZWFyUHJlRmlsdGVyRnJvbUxvb2t1cCgpOiB0aGlzIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICB0aGlzLl9jdXN0b21GaWx0ZXJzLmZvckVhY2goXHJcbiAgICAgICAgICAoY3VzdG9tRmlsdGVyOiBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnRyb2wucmVtb3ZlUHJlU2VhcmNoKGN1c3RvbUZpbHRlcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7WHJtRXguZ2V0TWV0aG9kTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgdHlwZSBPcHRpb25WYWx1ZXMgPSB7XHJcbiAgICBba2V5OiBzdHJpbmddOiBudW1iZXI7XHJcbiAgfTtcclxuICBleHBvcnQgY2xhc3MgT3B0aW9uc2V0RmllbGQ8T3B0aW9ucyBleHRlbmRzIE9wdGlvblZhbHVlcz5cclxuICAgIGV4dGVuZHMgRmllbGRcclxuICAgIGltcGxlbWVudHMgWHJtLkF0dHJpYnV0ZXMuT3B0aW9uU2V0QXR0cmlidXRlIHtcclxuICAgIHByb3RlY3RlZCBkZWNsYXJlIF9hdHRyaWJ1dGU6IFhybS5BdHRyaWJ1dGVzLk9wdGlvblNldEF0dHJpYnV0ZTtcclxuICAgIHByb3RlY3RlZCBfY29udHJvbCE6IFhybS5Db250cm9scy5PcHRpb25TZXRDb250cm9sO1xyXG4gICAgT3B0aW9uOiBPcHRpb25zO1xyXG4gICAgY29uc3RydWN0b3IoYXR0cmlidXRlTmFtZTogc3RyaW5nLCBvcHRpb24/OiBPcHRpb25zKSB7XHJcbiAgICAgIHN1cGVyKGF0dHJpYnV0ZU5hbWUpO1xyXG4gICAgICB0aGlzLk9wdGlvbiA9IG9wdGlvbjtcclxuICAgIH1cclxuICAgIGdldEZvcm1hdCgpOiBYcm0uQXR0cmlidXRlcy5PcHRpb25TZXRBdHRyaWJ1dGVGb3JtYXQge1xyXG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0Rm9ybWF0KCkgYXMgWHJtLkF0dHJpYnV0ZXMuT3B0aW9uU2V0QXR0cmlidXRlRm9ybWF0O1xyXG4gICAgfVxyXG4gICAgZ2V0T3B0aW9uKHZhbHVlOiBudW1iZXIgfCBzdHJpbmcpOiBYcm0uT3B0aW9uU2V0VmFsdWUge1xyXG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldE9wdGlvbih2YWx1ZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldE9wdGlvbih2YWx1ZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGdldE9wdGlvbnMoKTogWHJtLk9wdGlvblNldFZhbHVlW10ge1xyXG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0T3B0aW9ucygpO1xyXG4gICAgfVxyXG4gICAgZ2V0U2VsZWN0ZWRPcHRpb24oKTogWHJtLk9wdGlvblNldFZhbHVlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFNlbGVjdGVkT3B0aW9uKCk7XHJcbiAgICB9XHJcbiAgICBnZXRUZXh0KCk6IHN0cmluZyB7XHJcbiAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRUZXh0KCk7XHJcbiAgICB9XHJcbiAgICBnZXRJbml0aWFsVmFsdWUoKTogbnVtYmVyIHtcclxuICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEluaXRpYWxWYWx1ZSgpO1xyXG4gICAgfVxyXG4gICAgZ2V0IEF0dHJpYnV0ZSgpIHtcclxuICAgICAgcmV0dXJuICh0aGlzLl9hdHRyaWJ1dGUgPz89XHJcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUodGhpcy5OYW1lKSA/P1xyXG4gICAgICAgIFhybUV4LnRocm93RXJyb3IoYEZpZWxkICcke3RoaXMuTmFtZX0nIGRvZXMgbm90IGV4aXN0YCkpO1xyXG4gICAgfVxyXG4gICAgZ2V0IGNvbnRyb2xzKCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuY29udHJvbHM7XHJcbiAgICB9XHJcbiAgICBnZXQgY29udHJvbCgpIHtcclxuICAgICAgcmV0dXJuICh0aGlzLl9jb250cm9sID8/PVxyXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZ2V0Q29udHJvbCh0aGlzLk5hbWUpID8/XHJcbiAgICAgICAgWHJtRXgudGhyb3dFcnJvcihgQ29udHJvbCAnJHt0aGlzLk5hbWV9JyBkb2VzIG5vdCBleGlzdGApKTtcclxuICAgIH1cclxuICAgIGdldCBWYWx1ZSgpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0VmFsdWUoKTtcclxuICAgIH1cclxuICAgIHNldCBWYWx1ZSh2YWx1ZToga2V5b2YgT3B0aW9ucyB8IG51bWJlcikge1xyXG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09IFwibnVtYmVyXCIpIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKHZhbHVlKTtcclxuICAgICAgZWxzZSB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh0aGlzLk9wdGlvblt2YWx1ZV0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGFuIG9wdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gdmFsdWVzIGFuIGFycmF5IHdpdGggdGhlIG9wdGlvbiB2YWx1ZXMgdG8gYWRkXHJcbiAgICAgKiBAcGFyYW0gaW5kZXggKE9wdGlvbmFsKSB6ZXJvLWJhc2VkIGluZGV4IG9mIHRoZSBvcHRpb24uXHJcbiAgICAgKlxyXG4gICAgICogQHJlbWFya3MgVGhpcyBtZXRob2QgZG9lcyBub3QgY2hlY2sgdGhhdCB0aGUgdmFsdWVzIHdpdGhpbiB0aGUgb3B0aW9ucyB5b3UgYWRkIGFyZSB2YWxpZC5cclxuICAgICAqICAgICAgICAgIElmIGluZGV4IGlzIG5vdCBwcm92aWRlZCwgdGhlIG5ldyBvcHRpb24gd2lsbCBiZSBhZGRlZCB0byB0aGUgZW5kIG9mIHRoZSBsaXN0LlxyXG4gICAgICovXHJcbiAgICBhZGRPcHRpb24odmFsdWVzOiBudW1iZXJbXSwgaW5kZXg/OiBudW1iZXIpOiB0aGlzIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWVzKSlcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgdmFsdWVzIGlzIG5vdCBhbiBBcnJheTpcXG52YWx1ZXM6ICcke3ZhbHVlc30nYCk7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9uU2V0VmFsdWVzID0gdGhpcy5jb250cm9sLmdldEF0dHJpYnV0ZSgpLmdldE9wdGlvbnMoKSA/PyBbXTtcclxuICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2Ygb3B0aW9uU2V0VmFsdWVzKSB7XHJcbiAgICAgICAgICBpZiAodmFsdWVzLmluY2x1ZGVzKGVsZW1lbnQudmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29udHJvbC5hZGRPcHRpb24oZWxlbWVudCwgaW5kZXgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguJHtYcm1FeC5nZXRNZXRob2ROYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIHRoZSBvcHRpb24gbWF0Y2hpbmcgdGhlIHZhbHVlLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZU9wdGlvbih2YWx1ZXM6IG51bWJlcltdKTogdGhpcyB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlcykpXHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHZhbHVlcyBpcyBub3QgYW4gQXJyYXk6XFxudmFsdWVzOiAnJHt2YWx1ZXN9J2ApO1xyXG4gICAgICAgIGNvbnN0IG9wdGlvblNldFZhbHVlcyA9IHRoaXMuY29udHJvbC5nZXRBdHRyaWJ1dGUoKS5nZXRPcHRpb25zKCkgPz8gW107XHJcbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIG9wdGlvblNldFZhbHVlcykge1xyXG4gICAgICAgICAgaWYgKHZhbHVlcy5pbmNsdWRlcyhlbGVtZW50LnZhbHVlKSkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRyb2wucmVtb3ZlT3B0aW9uKGVsZW1lbnQudmFsdWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguJHtYcm1FeC5nZXRNZXRob2ROYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBDbGVhcnMgYWxsIG9wdGlvbnMuXHJcbiAgICAgKi9cclxuICAgIGNsZWFyT3B0aW9ucygpOiB0aGlzIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICB0aGlzLmNvbnRyb2wuY2xlYXJPcHRpb25zKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7WHJtRXguZ2V0TWV0aG9kTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgZXhwb3J0IGNsYXNzIFNlY3Rpb24gaW1wbGVtZW50cyBYcm0uQ29udHJvbHMuU2VjdGlvbiB7XHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgTmFtZSE6IHN0cmluZztcclxuICAgIHByb3RlY3RlZCBfc2VjdGlvbj86IFhybS5Db250cm9scy5TZWN0aW9uO1xyXG4gICAgcHVibGljIHBhcmVudFRhYj86IFhybS5Db250cm9scy5UYWI7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpIHtcclxuICAgICAgdGhpcy5OYW1lID0gbmFtZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXQgU2VjdGlvbigpOiBYcm0uQ29udHJvbHMuU2VjdGlvbiB7XHJcbiAgICAgIHJldHVybiAodGhpcy5fc2VjdGlvbiA/Pz1cclxuICAgICAgICB0aGlzLnBhcmVudFRhYi5zZWN0aW9ucy5nZXQodGhpcy5OYW1lKSA/P1xyXG4gICAgICAgIFhybUV4LnRocm93RXJyb3IoXHJcbiAgICAgICAgICBgVGhlIHNlY3Rpb24gJyR7dGhpcy5OYW1lfScgd2FzIG5vdCBmb3VuZCBvbiB0aGUgZm9ybS5gXHJcbiAgICAgICAgKSk7XHJcbiAgICB9XHJcbiAgICBnZXROYW1lKCk6IHN0cmluZyB7XHJcbiAgICAgIHJldHVybiB0aGlzLlNlY3Rpb24uZ2V0TmFtZSgpO1xyXG4gICAgfVxyXG4gICAgZ2V0UGFyZW50KCk6IFhybS5Db250cm9scy5UYWIge1xyXG4gICAgICByZXR1cm4gdGhpcy5TZWN0aW9uLmdldFBhcmVudCgpO1xyXG4gICAgfVxyXG4gICAgY29udHJvbHM6IFhybS5Db2xsZWN0aW9uLkl0ZW1Db2xsZWN0aW9uPFhybS5Db250cm9scy5Db250cm9sPjtcclxuICAgIHNldFZpc2libGUodmlzaWJsZTogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICByZXR1cm4gdGhpcy5TZWN0aW9uLnNldFZpc2libGUodmlzaWJsZSk7XHJcbiAgICB9XHJcbiAgICBnZXRWaXNpYmxlKCk6IGJvb2xlYW4ge1xyXG4gICAgICByZXR1cm4gdGhpcy5TZWN0aW9uLmdldFZpc2libGUoKTtcclxuICAgIH1cclxuICAgIGdldExhYmVsKCk6IHN0cmluZyB7XHJcbiAgICAgIHJldHVybiB0aGlzLlNlY3Rpb24uZ2V0TGFiZWwoKTtcclxuICAgIH1cclxuICAgIHNldExhYmVsKGxhYmVsOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgcmV0dXJuIHRoaXMuU2VjdGlvbi5zZXRMYWJlbChsYWJlbCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHR5cGUgVGFiU2VjdGlvbnMgPSB7XHJcbiAgICBba2V5OiBzdHJpbmddOiBTZWN0aW9uO1xyXG4gIH07XHJcbiAgZXhwb3J0IGNsYXNzIFRhYjxTZWN0aW9ucyBleHRlbmRzIFRhYlNlY3Rpb25zPiBpbXBsZW1lbnRzIFhybS5Db250cm9scy5UYWIge1xyXG4gICAgcHVibGljIHJlYWRvbmx5IE5hbWUhOiBzdHJpbmc7XHJcbiAgICBwcm90ZWN0ZWQgX3RhYj86IFhybS5Db250cm9scy5UYWI7XHJcbiAgICBTZWN0aW9uOiBTZWN0aW9ucztcclxuICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgc2VjdGlvbj86IFNlY3Rpb25zKSB7XHJcbiAgICAgIHRoaXMuTmFtZSA9IG5hbWU7XHJcbiAgICAgIHRoaXMuU2VjdGlvbiA9IHNlY3Rpb247XHJcbiAgICAgIGZvciAobGV0IGtleSBpbiBzZWN0aW9uKSB7XHJcbiAgICAgICAgc2VjdGlvbltrZXldLnBhcmVudFRhYiA9IHRoaXM7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHNlY3Rpb25zOiBYcm0uQ29sbGVjdGlvbi5JdGVtQ29sbGVjdGlvbjxYcm0uQ29udHJvbHMuU2VjdGlvbj47XHJcblxyXG4gICAgcHVibGljIGdldCBUYWIoKTogWHJtLkNvbnRyb2xzLlRhYiB7XHJcbiAgICAgIHJldHVybiAodGhpcy5fdGFiID8/PVxyXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQudWkudGFicy5nZXQodGhpcy5OYW1lKSA/P1xyXG4gICAgICAgIFhybUV4LnRocm93RXJyb3IoYFRoZSB0YWIgJyR7dGhpcy5OYW1lfScgd2FzIG5vdCBmb3VuZCBvbiB0aGUgZm9ybS5gKSk7XHJcbiAgICB9XHJcbiAgICBhZGRUYWJTdGF0ZUNoYW5nZShoYW5kbGVyOiBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyKTogdm9pZCB7XHJcbiAgICAgIHJldHVybiB0aGlzLlRhYi5hZGRUYWJTdGF0ZUNoYW5nZShoYW5kbGVyKTtcclxuICAgIH1cclxuICAgIGdldERpc3BsYXlTdGF0ZSgpOiBYcm0uRGlzcGxheVN0YXRlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuVGFiLmdldERpc3BsYXlTdGF0ZSgpO1xyXG4gICAgfVxyXG4gICAgZ2V0TmFtZSgpOiBzdHJpbmcge1xyXG4gICAgICByZXR1cm4gdGhpcy5UYWIuZ2V0TmFtZSgpO1xyXG4gICAgfVxyXG4gICAgZ2V0UGFyZW50KCk6IFhybS5VaSB7XHJcbiAgICAgIHJldHVybiB0aGlzLlRhYi5nZXRQYXJlbnQoKTtcclxuICAgIH1cclxuICAgIHJlbW92ZVRhYlN0YXRlQ2hhbmdlKGhhbmRsZXI6IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXIpOiB2b2lkIHtcclxuICAgICAgcmV0dXJuIHRoaXMuVGFiLnJlbW92ZVRhYlN0YXRlQ2hhbmdlKGhhbmRsZXIpO1xyXG4gICAgfVxyXG4gICAgc2V0RGlzcGxheVN0YXRlKGRpc3BsYXlTdGF0ZTogWHJtLkRpc3BsYXlTdGF0ZSk6IHZvaWQge1xyXG4gICAgICByZXR1cm4gdGhpcy5UYWIuc2V0RGlzcGxheVN0YXRlKGRpc3BsYXlTdGF0ZSk7XHJcbiAgICB9XHJcbiAgICBzZXRWaXNpYmxlKHZpc2libGU6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgcmV0dXJuIHRoaXMuVGFiLnNldFZpc2libGUodmlzaWJsZSk7XHJcbiAgICB9XHJcbiAgICBnZXRWaXNpYmxlKCk6IGJvb2xlYW4ge1xyXG4gICAgICByZXR1cm4gdGhpcy5UYWIuZ2V0VmlzaWJsZSgpO1xyXG4gICAgfVxyXG4gICAgZ2V0TGFiZWwoKTogc3RyaW5nIHtcclxuICAgICAgcmV0dXJuIHRoaXMuVGFiLmdldExhYmVsKCk7XHJcbiAgICB9XHJcbiAgICBzZXRMYWJlbChsYWJlbDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgIHJldHVybiB0aGlzLlRhYi5zZXRMYWJlbChsYWJlbCk7XHJcbiAgICB9XHJcbiAgICBzZXRGb2N1cygpOiB2b2lkIHtcclxuICAgICAgcmV0dXJuIHRoaXMuVGFiLnNldEZvY3VzKCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGV4cG9ydCBjbGFzcyBHcmlkQ29udHJvbCBpbXBsZW1lbnRzIFhybS5Db250cm9scy5HcmlkQ29udHJvbCB7XHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgTmFtZSE6IHN0cmluZztcclxuICAgIHByb3RlY3RlZCBfZ3JpZENvbnRyb2w/OiBYcm0uQ29udHJvbHMuR3JpZENvbnRyb2w7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpIHtcclxuICAgICAgdGhpcy5OYW1lID0gbmFtZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXQgR3JpZENvbnRyb2woKTogWHJtLkNvbnRyb2xzLkdyaWRDb250cm9sIHtcclxuICAgICAgcmV0dXJuIChcclxuICAgICAgICAodGhpcy5fZ3JpZENvbnRyb2wgPz89XHJcbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmdldENvbnRyb2w8WHJtLkNvbnRyb2xzLkdyaWRDb250cm9sPih0aGlzLk5hbWUpKSA/P1xyXG4gICAgICAgIFhybUV4LnRocm93RXJyb3IoYFRoZSBncmlkICcke3RoaXMuTmFtZX0nIHdhcyBub3QgZm91bmQgb24gdGhlIGZvcm0uYClcclxuICAgICAgKTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXQgR3JpZCgpOiBYcm0uQ29udHJvbHMuR3JpZCB7XHJcbiAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmdldEdyaWQoKTtcclxuICAgIH1cclxuICAgIGFkZE9uTG9hZChoYW5kbGVyOiBYcm0uRXZlbnRzLkdyaWRDb250cm9sLkxvYWRFdmVudEhhbmRsZXIpOiB2b2lkIHtcclxuICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuYWRkT25Mb2FkKGhhbmRsZXIpO1xyXG4gICAgfVxyXG4gICAgZ2V0Q29udGV4dFR5cGUoKTogWHJtRW51bS5HcmlkQ29udHJvbENvbnRleHQge1xyXG4gICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRDb250ZXh0VHlwZSgpO1xyXG4gICAgfVxyXG4gICAgZ2V0RW50aXR5TmFtZSgpOiBzdHJpbmcge1xyXG4gICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRFbnRpdHlOYW1lKCk7XHJcbiAgICB9XHJcbiAgICBnZXRGZXRjaFhtbCgpOiBzdHJpbmcge1xyXG4gICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRGZXRjaFhtbCgpO1xyXG4gICAgfVxyXG4gICAgZ2V0R3JpZCgpOiBYcm0uQ29udHJvbHMuR3JpZCB7XHJcbiAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmdldEdyaWQoKTtcclxuICAgIH1cclxuICAgIGdldFJlbGF0aW9uc2hpcCgpOiBYcm0uQ29udHJvbHMuR3JpZFJlbGF0aW9uc2hpcCB7XHJcbiAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmdldFJlbGF0aW9uc2hpcCgpO1xyXG4gICAgfVxyXG4gICAgZ2V0VXJsKGNsaWVudD86IFhybUVudW0uR3JpZENsaWVudCk6IHN0cmluZyB7XHJcbiAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmdldFVybChjbGllbnQpO1xyXG4gICAgfVxyXG4gICAgZ2V0Vmlld1NlbGVjdG9yKCk6IFhybS5Db250cm9scy5WaWV3U2VsZWN0b3Ige1xyXG4gICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRWaWV3U2VsZWN0b3IoKTtcclxuICAgIH1cclxuICAgIG9wZW5SZWxhdGVkR3JpZCgpOiB2b2lkIHtcclxuICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wub3BlblJlbGF0ZWRHcmlkKCk7XHJcbiAgICB9XHJcbiAgICByZWZyZXNoKCk6IHZvaWQge1xyXG4gICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5yZWZyZXNoKCk7XHJcbiAgICB9XHJcbiAgICByZWZyZXNoUmliYm9uKCk6IHZvaWQge1xyXG4gICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5yZWZyZXNoUmliYm9uKCk7XHJcbiAgICB9XHJcbiAgICByZW1vdmVPbkxvYWQoaGFuZGxlcjogKCkgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5yZW1vdmVPbkxvYWQoaGFuZGxlcik7XHJcbiAgICB9XHJcbiAgICBnZXRDb250cm9sVHlwZSgpOiBzdHJpbmcge1xyXG4gICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRDb250cm9sVHlwZSgpO1xyXG4gICAgfVxyXG4gICAgZ2V0TmFtZSgpOiBzdHJpbmcge1xyXG4gICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXROYW1lKCk7XHJcbiAgICB9XHJcbiAgICBnZXRQYXJlbnQoKTogWHJtLkNvbnRyb2xzLlNlY3Rpb24ge1xyXG4gICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRQYXJlbnQoKTtcclxuICAgIH1cclxuICAgIGdldExhYmVsKCk6IHN0cmluZyB7XHJcbiAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmdldExhYmVsKCk7XHJcbiAgICB9XHJcbiAgICBzZXRMYWJlbChsYWJlbDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLnNldExhYmVsKGxhYmVsKTtcclxuICAgIH1cclxuICAgIGdldFZpc2libGUoKTogYm9vbGVhbiB7XHJcbiAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmdldFZpc2libGUoKTtcclxuICAgIH1cclxuICAgIHNldFZpc2libGUodmlzaWJsZTogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5zZXRWaXNpYmxlKHZpc2libGUpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=