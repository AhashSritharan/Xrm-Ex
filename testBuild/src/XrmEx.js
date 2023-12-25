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
    function getFunctionName() {
        try {
            const error = new Error();
            const stackTrace = error.stack?.split("\n").map((line) => line.trim());
            const callingFunctionLine = stackTrace && stackTrace.length >= 3 ? stackTrace[2] : undefined;
            const functionNameMatch = callingFunctionLine?.match(/at\s+([^\s]+)\s+\(/) ||
                callingFunctionLine?.match(/at\s+([^\s]+)/);
            const functionName = functionNameMatch ? functionNameMatch[1] : "";
            return functionName;
        }
        catch (error) {
            throw new Error(`XrmEx.getFunctionName:\n${error.message}`);
        }
    }
    XrmEx.getFunctionName = getFunctionName;
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
            throw new Error(`XrmEx.${getFunctionName()}:\n${error.message}`);
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
            throw new Error(`XrmEx.${getFunctionName()}:\n${error.message}`);
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
     * Wraps a function that takes a callback as its last parameter and returns a Promise.
     * @param {Function} fn the function to wrap
     * @param context the parent property of the function f.e. formContext.data.process for formContext.data.process.getEnabledProcesses
     * @param args the arguments to pass to the function
     * @returns {Promise<any>} a Promise that resolves with the callback response
     */
    function asPromise(fn, context, ...args) {
        return new Promise((resolve, reject) => {
            const callback = (response) => {
                resolve(response);
            };
            try {
                // Call the function with the arguments and the callback at the end
                fn.call(context, ...args, callback);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    XrmEx.asPromise = asPromise;
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
            throw new Error(`XrmEx.${getFunctionName()}:\n${error.message}`);
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
    class Process {
        static get data() {
            return Form.formContext.data.process;
        }
        static get ui() {
            return Form.formContext.ui.process;
        }
        /**
         * Use this to add a function as an event handler for the OnPreProcessStatusChange event so that it will be called before the
         * business process flow status changes.
         * @param handler The function will be added to the bottom of the event
         *                handler pipeline. The execution context is automatically
         *                set to be the first parameter passed to the event handler.
         *                Use a reference to a named function rather than an
         *                anonymous function if you may later want to remove the
         *                event handler.
         */
        static addOnPreProcessStatusChange(handler) {
            Form.formContext.data.process.removeOnPreProcessStatusChange(handler);
            return Form.formContext.data.process.addOnPreProcessStatusChange(handler);
        }
        /**
         * Use this to add a function as an event handler for the OnPreStageChange event so that it will be called before the
         * business process flow stage changes.
         * @param handler The function will be added to the bottom of the event
         *                handler pipeline. The execution context is automatically
         *                set to be the first parameter passed to the event handler.
         *                Use a reference to a named function rather than an
         *                anonymous function if you may later want to remove the
         *                event handler.
         */
        static addOnPreStageChange(handler) {
            Form.formContext.data.process.removeOnPreStageChange(handler);
            return Form.formContext.data.process.addOnPreStageChange(handler);
        }
        /**
         * Use this to add a function as an event handler for the OnPreProcessStatusChange event so that it will be called when the
         * business process flow status changes.
         * @param handler The function will be added to the bottom of the event
         *                handler pipeline. The execution context is automatically
         *                set to be the first parameter passed to the event handler.
         *                Use a reference to a named function rather than an
         *                anonymous function if you may later want to remove the
         *                event handler.
         */
        static addOnProcessStatusChange(handler) {
            Form.formContext.data.process.removeOnProcessStatusChange(handler);
            return Form.formContext.data.process.addOnProcessStatusChange(handler);
        }
        /**
         * Use this to add a function as an event handler for the OnStageChange event so that it will be called when the
         * business process flow stage changes.
         * @param handler The function will be added to the bottom of the event
         *                handler pipeline. The execution context is automatically
         *                set to be the first parameter passed to the event handler.
         *                Use a reference to a named function rather than an
         *                anonymous function if you may later want to remove the
         *                event handler.
         */
        static addOnStageChange(handler) {
            Form.formContext.data.process.removeOnStageChange(handler);
            return Form.formContext.data.process.addOnStageChange(handler);
        }
        /**
         * Use this to add a function as an event handler for the OnStageSelected event so that it will be called
         * when a business process flow stage is selected.
         * @param handler The function will be added to the bottom of the event
         *                handler pipeline. The execution context is automatically
         *                set to be the first parameter passed to the event handler.
         *                Use a reference to a named function rather than an
         *                anonymous function if you may later want to remove the
         *                event handler.
         */
        static addOnStageSelected(handler) {
            Form.formContext.data.process.removeOnStageSelected(handler);
            return Form.formContext.data.process.addOnStageSelected(handler);
        }
        /**
         * Use this to remove a function as an event handler for the OnPreProcessStatusChange event.
         * @param handler If an anonymous function is set using the addOnPreProcessStatusChange method it
         *                cannot be removed using this method.
         */
        static removeOnPreProcessStatusChange(handler) {
            return Form.formContext.data.process.removeOnPreProcessStatusChange(handler);
        }
        /**
         * Use this to remove a function as an event handler for the OnPreStageChange event.
         * @param handler If an anonymous function is set using the addOnPreStageChange method it
         *                cannot be removed using this method.
         */
        static removeOnPreStageChange(handler) {
            return Form.formContext.data.process.removeOnPreStageChange(handler);
        }
        /**
         * Use this to remove a function as an event handler for the OnProcessStatusChange event.
         * @param handler If an anonymous function is set using the addOnProcessStatusChange method it
         *                cannot be removed using this method.
         */
        static removeOnProcessStatusChange(handler) {
            return Form.formContext.data.process.removeOnProcessStatusChange(handler);
        }
        /**
         * Use this to remove a function as an event handler for the OnStageChange event.
         * @param handler If an anonymous function is set using the addOnStageChange method it
         *                cannot be removed using this method.
         */
        static removeOnStageChange(handler) {
            return Form.formContext.data.process.removeOnStageChange(handler);
        }
        /**
         * Use this to remove a function as an event handler for the OnStageChange event.
         * @param handler If an anonymous function is set using the addOnStageChange method it
         *                cannot be removed using this method.
         */
        static removeOnStageSelected(handler) {
            return Form.formContext.data.process.removeOnStageSelected(handler);
        }
        /**
         * Use this method to asynchronously retrieve the enabled business process flows that the user can switch to for an entity.
         * @returns returns callback response as Promise
         */
        static getEnabledProcesses() {
            return asPromise(Form.formContext.data.process.getEnabledProcesses, Form.formContext.data.process);
        }
        /**
         * Returns all process instances for the entity record that the calling user has access to.
         * @returns returns callback response as Promise
         */
        static getProcessInstances() {
            return asPromise(Form.formContext.data.process.getProcessInstances, Form.formContext.data.process);
        }
        /**
         * Progresses to the next stage.
         * @returns returns callback response as Promise
         */
        static moveNext() {
            return asPromise(Form.formContext.data.process.moveNext, Form.formContext.data.process);
        }
        /**
         * Moves to the previous stage.
         * @returns returns callback response as Promise
         */
        static movePrevious() {
            return asPromise(Form.formContext.data.process.movePrevious, Form.formContext.data.process);
        }
        /**
         * Set a Process as the active process.
         * @param processId The Id of the process to make the active process.
         * @returns returns callback response as Promise
         */
        static setActiveProcess(processId) {
            return asPromise(Form.formContext.data.process.setActiveProcess, Form.formContext.data.process, processId);
        }
        /**
         * Sets a process instance as the active instance
         * @param processInstanceId The Id of the process instance to make the active instance.
         * @returns returns callback response as Promise
         */
        static setActiveProcessInstance(processInstanceId) {
            return asPromise(Form.formContext.data.process.setActiveProcessInstance, Form.formContext.data.process, processInstanceId);
        }
        /**
         * Set a stage as the active stage.
         * @param stageId the Id of the stage to make the active stage.
         * @returns returns callback response as Promise
         */
        static setActiveStage(stageId) {
            return asPromise(Form.formContext.data.process.setActiveStage, Form.formContext.data.process, stageId);
        }
        /**
         * Use this method to set the current status of the process instance
         * @param status The new status for the process
         * @returns returns callback response as Promise
         */
        static setStatus(status) {
            return asPromise(Form.formContext.data.process.setStatus, Form.formContext.data.process, status);
        }
    }
    XrmEx.Process = Process;
    class Fields {
        /**
         * Adds a handler or an array of handlers to be called when the attribute's value is changed.
         * @param fields An array of fields to on which this method should be applied.
         * @param handlers The function reference or an array of function references.
         */
        static addOnChange(fields, handler) {
            fields.forEach((field) => {
                field.addOnChange(handler);
            });
        }
        /**
         * Fire all "on change" event handlers.
         * @param fields An array of fields to on which this method should be applied.
         */
        static fireOnChange(fields) {
            fields.forEach((field) => {
                field.fireOnChange();
            });
        }
        /**
         * Removes the handler from the "on change" event.
         * @param fields An array of fields to on which this method should be applied.
         * @param handler The handler.
         */
        static removeOnChange(fields, handler) {
            fields.forEach((field) => {
                field.removeOnChange(handler);
            });
        }
        /**
         * Sets the required level.
         * @param fields An array of fields to on which this method should be applied.
         * @param requirementLevel The requirement level, as either "none", "required", or "recommended"
         */
        static setRequiredLevel(fields, requirementLevel) {
            fields.forEach((field) => {
                field.setRequiredLevel(requirementLevel);
            });
        }
        /**
         * Sets the submit mode.
         * @param fields An array of fields to on which this method should be applied.
         * @param submitMode The submit mode, as either "always", "never", or "dirty".
         * @default submitMode "dirty"
         * @see {@link XrmEnum.AttributeRequirementLevel}
         */
        static setSubmitMode(fields, submitMode) {
            fields.forEach((field) => {
                field.setSubmitMode(submitMode);
            });
        }
        /**
         * Sets the value.
         * @param fields An array of fields to on which this method should be applied.
         * @param value The value.
         * @remarks Attributes on Quick Create Forms will not save values set with this method.
         */
        static setValue(fields, value) {
            fields.forEach((field) => {
                field.setValue(value);
            });
        }
        /**
         * Sets a value for a column to determine whether it is valid or invalid with a message
         * @param fields An array of fields to on which this method should be applied.
         * @param isValid Specify false to set the column value to invalid and true to set the value to valid.
         * @param message The message to display.
         * @see {@link https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/attributes/setisvalid External Link: setIsValid (Client API reference)}
         */
        static setIsValid(fields, isValid, message) {
            fields.forEach((field) => {
                field.setIsValid(isValid, message);
            });
        }
        /**
         * Sets the required level.
         * @param fields An array of fields to on which this method should be applied.
         * @param required The requirement level, as either false for "none" or true for "required"
         */
        static setRequired(fields, required) {
            fields.forEach((field) => {
                field.setRequired(required);
            });
        }
        /**
         * Sets the state of the control to either enabled, or disabled.
         * @param fields An array of fields to on which this method should be applied.
         * @param disabled true to disable, false to enable.
         */
        static setDisabled(fields, disabled) {
            fields.forEach((field) => {
                field.setDisabled(disabled);
            });
        }
        /**
         * Sets the visibility state.
         * @param fields An array of fields to on which this method should be applied.
         * @param visible true to show, false to hide.
         */
        static setVisible(fields, visible) {
            fields.forEach((field) => {
                field.setVisible(visible);
            });
        }
        /**
         * Sets a control-local notification message.
         * @param fields An array of fields to on which this method should be applied.
         * @param message The message.
         * @param uniqueId Unique identifier.
         * @returns true if it succeeds, false if it fails.
         * @remarks     When this method is used on Microsoft Dynamics CRM for tablets a red "X" icon
         *              appears next to the control. Tapping on the icon will display the message.
         */
        static setNotification(fields, message, uniqueId) {
            fields.forEach((field) => {
                field.setNotification(message, uniqueId);
            });
        }
        /**
         * Displays an error or recommendation notification for a control, and lets you specify actions to execute based on the notification.
         * @param fields An array of fields to on which this method should be applied.
         */
        static addNotification(fields, message, notificationLevel, uniqueId, actions) {
            fields.forEach((field) => {
                field.addNotification(message, notificationLevel, uniqueId, actions);
            });
        }
        /**
         * Clears the notification identified by uniqueId.
         * @param fields An array of fields to on which this method should be applied.
         * @param uniqueId (Optional) Unique identifier.
         * @returns true if it succeeds, false if it fails.
         * @remarks If the uniqueId parameter is not used, the current notification shown will be removed.
         */
        static removeNotification(fields, uniqueId) {
            fields.forEach((field) => {
                field.removeNotification(uniqueId);
            });
        }
    }
    XrmEx.Fields = Fields;
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
            if (!context)
                throw new Error(`XrmEx.Form.setFormContext: The executionContext or formContext was not passed to the function.`);
            if ("getFormContext" in context) {
                this._executionContext = context;
                this._formContext = context.getFormContext();
            }
            else if ("data" in context)
                this._formContext = context;
            else
                throw new Error(`XrmEx.Form.setFormContext: The passed context is not an executionContext or formContext.`);
        }
        /**Sets a reference to the current execution context*/
        static set executionContext(context) {
            if (!context)
                throw new Error(`XrmEx.Form.setExecutionContext: The executionContext or formContext was not passed to the function.`);
            if ("getFormContext" in context) {
                this._executionContext = context;
                this._formContext = context.getFormContext();
            }
            else if ("data" in context)
                this._formContext = context;
            else
                throw new Error(`XrmEx.Form.setExecutionContext: The passed context is not an executionContext or formContext.`);
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
         * @returns true if it succeeds, othenprwise false.
         */
        static addFormNotification(message, level, uniqueId) {
            try {
                return Form.formContext.ui.setFormNotification(message, level, uniqueId);
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
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
                throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
            }
        }
        /**
         * Adds a handler to be called when the record is saved.
         */
        static addOnSave(handlers) {
            try {
                if (!Array.isArray(handlers)) {
                    handlers = [handlers];
                }
                handlers.forEach((handler) => {
                    if (typeof handler !== "function") {
                        throw new Error(`'${handler}' is not a function`);
                    }
                    Form.formContext.data.entity.removeOnSave(handler);
                    Form.formContext.data.entity.addOnSave(handler);
                });
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
            }
        }
        /**
         * Adds a function to be called after the OnSave is complete.
         * @param handler The handler.
         * @remarks Added in 9.2
         * @see {@link https://docs.microsoft.com/en-us/powerapps/developer/model-driven-apps/clientapi/reference/events/postsave External Link: PostSave Event Documentation}
         */
        static addOnPostSave(handlers) {
            try {
                if (!Array.isArray(handlers)) {
                    handlers = [handlers];
                }
                handlers.forEach((handler) => {
                    if (typeof handler !== "function") {
                        throw new Error(`'${handler}' is not a function`);
                    }
                    Form.formContext.data.entity.removeOnPostSave(handler);
                    Form.formContext.data.entity.addOnPostSave(handler);
                });
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
            }
        }
        /**
         * Adds a function to be called when form data is loaded.
         * @param handler The function to be executed when the form data loads. The function will be added to the bottom of the event handler pipeline.
         */
        static addOnLoad(handlers) {
            try {
                if (!Array.isArray(handlers)) {
                    handlers = [handlers];
                }
                handlers.forEach((handler) => {
                    if (typeof handler !== "function") {
                        throw new Error(`'${handler}' is not a function`);
                    }
                    Form.formContext.data.removeOnLoad(handler);
                    Form.formContext.data.addOnLoad(handler);
                });
            }
            catch (error) {
                throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
            }
        }
        /**
         * Adds a handler to be called when the attribute's value is changed.
         * @param handler The function reference.
         */
        static addOnChange(fields, handlers, execute) {
            try {
                if (!Array.isArray(handlers)) {
                    handlers = [handlers];
                }
                handlers.forEach((handler) => {
                    if (typeof handler !== "function") {
                        throw new Error(`'${handler}' is not a function`);
                    }
                    fields.forEach((field) => {
                        field.removeOnChange(handler);
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
                throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
            }
        }
    }
    XrmEx.Form = Form;
    let Class;
    (function (Class) {
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
                    throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
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
                    throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
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
                    throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
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
                    throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
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
                    throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
                }
            }
            /**Fire all "on change" event handlers. */
            fireOnChange() {
                try {
                    this.Attribute.fireOnChange();
                    return this;
                }
                catch (error) {
                    throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
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
                    throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
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
                    throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
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
                    throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
                }
            }
        }
        Class.Field = Field;
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
        Class.TextField = TextField;
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
        Class.NumberField = NumberField;
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
        Class.DateField = DateField;
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
        Class.BooleanField = BooleanField;
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
        Class.MultiSelectOptionSetField = MultiSelectOptionSetField;
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
                        append && this.Value
                            ? this.Value.concat(lookupValue)
                            : [lookupValue];
                    return this;
                }
                catch (error) {
                    throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
                }
            }
            /**
             * Sets a lookup with a lookup from the retrieved record.
             * @param selectName
             * @param retrievedRecord
             * @example
             * var contact = await fields.Contact.retrieve('?$select=_parentcustomerid_value');
             * fields.Account.setLookupFromRetrieve('_parentcustomerid_value', contact);
             * //Alternate
             * fields.Account.setLookupFromRetrieve('parentcustomerid', contact);
             */
            setLookupFromRetrieve(selectName, retrievedRecord) {
                if (!selectName.endsWith("_value"))
                    selectName = `_${selectName}_value`;
                if (!retrievedRecord || !retrievedRecord[`${selectName}`]) {
                    this.Value = null;
                    return;
                }
                this.Value = [
                    {
                        id: retrievedRecord[`${selectName}`],
                        entityType: retrievedRecord[`${selectName}@Microsoft.Dynamics.CRM.lookuplogicalname`],
                        name: retrievedRecord[`${selectName}@OData.Community.Display.V1.FormattedValue`],
                    },
                ];
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
                    throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
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
                    throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
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
                    throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
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
                    throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
                }
            }
        }
        Class.LookupField = LookupField;
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
                    throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
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
                    throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
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
                    throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
                }
            }
        }
        Class.OptionsetField = OptionsetField;
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
        Class.Section = Section;
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
        Class.Tab = Tab;
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
                this.GridControl.removeOnLoad(handler);
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
        Class.GridControl = GridControl;
    })(Class = XrmEx.Class || (XrmEx.Class = {}));
})(XrmEx || (XrmEx = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWHJtRXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvWHJtRXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsOERBQThEO0FBa0M5RCxNQUFNLEtBQVcsS0FBSyxDQTg0RHJCO0FBOTRERCxXQUFpQixLQUFLO0lBQ3BCOzs7O09BSUc7SUFDSCxTQUFnQixVQUFVLENBQUMsWUFBb0I7UUFDN0MsTUFBTSxJQUFJLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRmUsZ0JBQVUsYUFFekIsQ0FBQTtJQUNEOzs7T0FHRztJQUNILFNBQWdCLGVBQWU7UUFDN0IsSUFBSTtZQUNGLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7WUFDMUIsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUN2RSxNQUFNLG1CQUFtQixHQUN2QixVQUFVLElBQUksVUFBVSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQ25FLE1BQU0saUJBQWlCLEdBQ3JCLG1CQUFtQixFQUFFLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQztnQkFDaEQsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzlDLE1BQU0sWUFBWSxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBRW5FLE9BQU8sWUFBWSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxLQUFVLEVBQUU7WUFDbkIsTUFBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsS0FBSyxDQUFDLE9BQU8sRUFBRSxD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TyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3BDLENBQUM7WUFDRCxTQUFTO2dCQUNQLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUN0QyxDQUFDO1lBQ0QsUUFBUTtnQkFDTixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDckMsQ0FBQztZQUNELFFBQVEsQ0FBQyxLQUFhO2dCQUNwQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzFDLENBQUM7WUFDRCxVQUFVO2dCQUNSLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN2QyxDQUFDO1lBQ0QsVUFBVSxDQUFDLE9BQWdCO2dCQUN6QixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzlDLENBQUM7U0FDRjtRQTFFWSxpQkFBVyxjQTBFdkIsQ0FBQTtJQUNILENBQUMsRUFyOEJnQixLQUFLLEdBQUwsV0FBSyxLQUFMLFdBQUssUUFxOEJyQjtBQUNILENBQUMsRUE5NERnQixLQUFLLEtBQUwsS0FBSyxRQTg0RHJCIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL25vZGVfbW9kdWxlcy9AdHlwZXMveHJtL2luZGV4LmQudHNcIiAvPlxuLyoqXG4gKiBSZXByZXNlbnRzIGEgcGFyYW1ldGVyIGZvciBhIHJlcXVlc3QuXG4gKiBAdHlwZSB7T2JqZWN0fSBSZXF1ZXN0UGFyYW1ldGVyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBwYXJhbWV0ZXIuXG4gKiBAcHJvcGVydHkgeydCb29sZWFuJyB8ICdEYXRlVGltZScgfCAnRGVjaW1hbCcgfCAnRW50aXR5JyB8ICdFbnRpdHlDb2xsZWN0aW9uJyB8ICdFbnRpdHlSZWZlcmVuY2UnIHwgJ0Zsb2F0JyB8ICdJbnRlZ2VyJyB8ICdNb25leScgfCAnUGlja2xpc3QnIHwgJ1N0cmluZyd9IFR5cGUgLSBUaGUgdHlwZSBvZiB0aGUgcGFyYW1ldGVyLlxuICogQHByb3BlcnR5IHsqfSBWYWx1ZSAtIFRoZSB2YWx1ZSBvZiB0aGUgcGFyYW1ldGVyLlxuICovXG50eXBlIFJlcXVlc3RQYXJhbWV0ZXIgPSB7XG4gIE5hbWU6IHN0cmluZztcbiAgVHlwZTpcbiAgICB8IFwiQm9vbGVhblwiXG4gICAgfCBcIkRhdGVUaW1lXCJcbiAgICB8IFwiRGVjaW1hbFwiXG4gICAgfCBcIkVudGl0eVwiXG4gICAgfCBcIkVudGl0eUNvbGxlY3Rpb25cIlxuICAgIHwgXCJFbnRpdHlSZWZlcmVuY2VcIlxuICAgIHwgXCJGbG9hdFwiXG4gICAgfCBcIkludGVnZXJcIlxuICAgIHwgXCJNb25leVwiXG4gICAgfCBcIlBpY2tsaXN0XCJcbiAgICB8IFwiU3RyaW5nXCI7XG4gIFZhbHVlOiBhbnk7XG59O1xuLyoqXG4gKiBSZXByZXNlbnRzIGEgcmVmZXJlbmNlIHRvIGFuIGVudGl0eS5cbiAqIEB0eXBlXG4gKiBAcHJvcGVydHkge3N0cmluZ30gaWQgLSBUaGUgSUQgb2YgdGhlIGVudGl0eS5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBlbnRpdHlUeXBlIC0gVGhlIHR5cGUgb2YgdGhlIGVudGl0eS5cbiAqL1xudHlwZSBFbnRpdHlSZWZlcmVuY2UgPSB7XG4gIGlkOiBzdHJpbmc7XG4gIGVudGl0eVR5cGU6IHN0cmluZztcbn07XG5leHBvcnQgbmFtZXNwYWNlIFhybUV4IHtcbiAgLyoqXG4gICAqIFRocm93cyBhbiBlcnJvciB3aXRoIHRoZSBnaXZlbiBlcnJvciBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXJyb3JNZXNzYWdlIC0gVGhlIGVycm9yIG1lc3NhZ2UgdG8gdGhyb3cuXG4gICAqIEB0aHJvd3Mge0Vycm9yfSAtIEFsd2F5cyB0aHJvd3MgYW4gZXJyb3Igd2l0aCB0aGUgZ2l2ZW4gZXJyb3IgbWVzc2FnZS5cbiAgICovXG4gIGV4cG9ydCBmdW5jdGlvbiB0aHJvd0Vycm9yKGVycm9yTWVzc2FnZTogc3RyaW5nKTogbmV2ZXIge1xuICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpO1xuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBuYW1lIG9mIHRoZSBjYWxsaW5nIGZ1bmN0aW9uLlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIFRoZSBuYW1lIG9mIHRoZSBjYWxsaW5nIGZ1bmN0aW9uLlxuICAgKi9cbiAgZXhwb3J0IGZ1bmN0aW9uIGdldEZ1bmN0aW9uTmFtZSgpOiBzdHJpbmcge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcigpO1xuICAgICAgY29uc3Qgc3RhY2tUcmFjZSA9IGVycm9yLnN0YWNrPy5zcGxpdChcIlxcblwiKS5tYXAoKGxpbmUpID0+IGxpbmUudHJpbSgpKTtcbiAgICAgIGNvbnN0IGNhbGxpbmdGdW5jdGlvbkxpbmUgPVxuICAgICAgICBzdGFja1RyYWNlICYmIHN0YWNrVHJhY2UubGVuZ3RoID49IDMgPyBzdGFja1RyYWNlWzJdIDogdW5kZWZpbmVkO1xuICAgICAgY29uc3QgZnVuY3Rpb25OYW1lTWF0Y2ggPVxuICAgICAgICBjYWxsaW5nRnVuY3Rpb25MaW5lPy5tYXRjaCgvYXRcXHMrKFteXFxzXSspXFxzK1xcKC8pIHx8XG4gICAgICAgIGNhbGxpbmdGdW5jdGlvbkxpbmU/Lm1hdGNoKC9hdFxccysoW15cXHNdKykvKTtcbiAgICAgIGNvbnN0IGZ1bmN0aW9uTmFtZSA9IGZ1bmN0aW9uTmFtZU1hdGNoID8gZnVuY3Rpb25OYW1lTWF0Y2hbMV0gOiBcIlwiO1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb25OYW1lO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguZ2V0RnVuY3Rpb25OYW1lOlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIERpc3BsYXlzIGEgbm90aWZpY2F0aW9uIGZvciBhbiBhcHAgd2l0aCB0aGUgZ2l2ZW4gbWVzc2FnZSBhbmQgbGV2ZWwsIGFuZCBsZXRzIHlvdSBzcGVjaWZ5IHdoZXRoZXIgdG8gc2hvdyBhIGNsb3NlIGJ1dHRvbi5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSBUaGUgbWVzc2FnZSB0byBkaXNwbGF5IGluIHRoZSBub3RpZmljYXRpb24uXG4gICAqIEBwYXJhbSB7J1NVQ0NFU1MnIHwgJ0VSUk9SJyB8ICdXQVJOSU5HJyB8ICdJTkZPJ30gbGV2ZWwgLSBUaGUgbGV2ZWwgb2YgdGhlIG5vdGlmaWNhdGlvbi4gQ2FuIGJlICdTVUNDRVNTJywgJ0VSUk9SJywgJ1dBUk5JTkcnLCBvciAnSU5GTycuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3Nob3dDbG9zZUJ1dHRvbj1mYWxzZV0gLSBXaGV0aGVyIHRvIHNob3cgYSBjbG9zZSBidXR0b24gb24gdGhlIG5vdGlmaWNhdGlvbi4gRGVmYXVsdHMgdG8gZmFsc2UuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IC0gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgSUQgb2YgdGhlIGNyZWF0ZWQgbm90aWZpY2F0aW9uLlxuICAgKi9cbiAgZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZEdsb2JhbE5vdGlmaWNhdGlvbihcbiAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgbGV2ZWw6IFwiU1VDQ0VTU1wiIHwgXCJFUlJPUlwiIHwgXCJXQVJOSU5HXCIgfCBcIklORk9cIixcbiAgICBzaG93Q2xvc2VCdXR0b24gPSBmYWxzZVxuICApOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGxldmVsTWFwID0ge1xuICAgICAgU1VDQ0VTUzogMSxcbiAgICAgIEVSUk9SOiAyLFxuICAgICAgV0FSTklORzogMyxcbiAgICAgIElORk86IDQsXG4gICAgfTtcbiAgICBjb25zdCBtZXNzYWdlTGV2ZWwgPSBsZXZlbE1hcFtsZXZlbF0gfHwgbGV2ZWxNYXAuSU5GTztcbiAgICBjb25zdCBub3RpZmljYXRpb24gPSB7XG4gICAgICB0eXBlOiAyLFxuICAgICAgbGV2ZWw6IG1lc3NhZ2VMZXZlbCxcbiAgICAgIG1lc3NhZ2UsXG4gICAgICBzaG93Q2xvc2VCdXR0b24sXG4gICAgfTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IFhybS5BcHAuYWRkR2xvYmFsTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbik7XG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke2dldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBDbGVhcnMgYSBub3RpZmljYXRpb24gaW4gdGhlIGFwcCB3aXRoIHRoZSBnaXZlbiB1bmlxdWUgSUQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1bmlxdWVJZCAtIFRoZSB1bmlxdWUgSUQgb2YgdGhlIG5vdGlmaWNhdGlvbiB0byBjbGVhci5cbiAgICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gLSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBub3RpZmljYXRpb24gaGFzIGJlZW4gY2xlYXJlZC5cbiAgICovXG4gIGV4cG9ydCBhc3luYyBmdW5jdGlvbiByZW1vdmVHbG9iYWxOb3RpZmljYXRpb24oXG4gICAgdW5pcXVlSWQ6IHN0cmluZ1xuICApOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgWHJtLkFwcC5jbGVhckdsb2JhbE5vdGlmaWNhdGlvbih1bmlxdWVJZCk7XG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke2dldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIHZhbHVlIG9mIGFuIGVudmlyb25tZW50IHZhcmlhYmxlIGJ5IHVzaW5nIGl0cyBzY2hlbWEgbmFtZSBhcyBrZXkuXG4gICAqIElmIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZSBoYXMgYm90aCBhIGRlZmF1bHQgdmFsdWUgYW5kIGEgY3VycmVudCB2YWx1ZSwgdGhpcyBmdW5jdGlvbiB3aWxsIHJldHJpZXZlIHRoZSBjdXJyZW50IHZhbHVlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZW52aXJvbm1lbnRWYXJpYWJsZVNjaGVtYU5hbWUgLSBUaGUgc2NoZW1hIG5hbWUgb2YgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlIHRvIHJldHJpZXZlLlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSAtIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIHZhbHVlIG9mIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZS5cbiAgICogQGFzeW5jXG4gICAqL1xuICBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RW52aXJvbm1lbnRWYXJpYWJsZVZhbHVlKFxuICAgIGVudmlyb25tZW50VmFyaWFibGVTY2hlbWFOYW1lOiBzdHJpbmdcbiAgKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gZXhlY3V0ZUZ1bmN0aW9uKFwiUmV0cmlldmVFbnZpcm9ubWVudFZhcmlhYmxlVmFsdWVcIiwgW1xuICAgICAge1xuICAgICAgICBOYW1lOiBcIkRlZmluaXRpb25TY2hlbWFOYW1lXCIsXG4gICAgICAgIFR5cGU6IFwiU3RyaW5nXCIsXG4gICAgICAgIFZhbHVlOiBlbnZpcm9ubWVudFZhcmlhYmxlU2NoZW1hTmFtZSxcbiAgICAgIH0sXG4gICAgXSk7XG4gIH1cbiAgLyoqXG4gICAqIEEgbWFwIG9mIENSTSBkYXRhIHR5cGVzIHRvIHRoZWlyIGNvcnJlc3BvbmRpbmcgdHlwZSBuYW1lcywgc3RydWN0dXJhbCBwcm9wZXJ0aWVzLCBhbmQgSmF2YVNjcmlwdCB0eXBlcy5cbiAgICogQHR5cGUge09iamVjdC48c3RyaW5nLCB7IHR5cGVOYW1lOiBzdHJpbmcsIHN0cnVjdHVyYWxQcm9wZXJ0eTogbnVtYmVyLCBqc1R5cGU6IHN0cmluZyB9Pn1cbiAgICovXG4gIGxldCB0eXBlTWFwID0ge1xuICAgIFN0cmluZzogeyB0eXBlTmFtZTogXCJFZG0uU3RyaW5nXCIsIHN0cnVjdHVyYWxQcm9wZXJ0eTogMSwganNUeXBlOiBcInN0cmluZ1wiIH0sXG4gICAgSW50ZWdlcjogeyB0eXBlTmFtZTogXCJFZG0uSW50MzJcIiwgc3RydWN0dXJhbFByb3BlcnR5OiAxLCBqc1R5cGU6IFwibnVtYmVyXCIgfSxcbiAgICBCb29sZWFuOiB7XG4gICAgICB0eXBlTmFtZTogXCJFZG0uQm9vbGVhblwiLFxuICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiAxLFxuICAgICAganNUeXBlOiBcImJvb2xlYW5cIixcbiAgICB9LFxuICAgIERhdGVUaW1lOiB7XG4gICAgICB0eXBlTmFtZTogXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIixcbiAgICAgIHN0cnVjdHVyYWxQcm9wZXJ0eTogMSxcbiAgICAgIGpzVHlwZTogXCJvYmplY3RcIixcbiAgICB9LFxuICAgIEVudGl0eVJlZmVyZW5jZToge1xuICAgICAgdHlwZU5hbWU6IFwibXNjcm0uY3JtYmFzZWVudGl0eVwiLFxuICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiA1LFxuICAgICAganNUeXBlOiBcIm9iamVjdFwiLFxuICAgIH0sXG4gICAgRGVjaW1hbDoge1xuICAgICAgdHlwZU5hbWU6IFwiRWRtLkRlY2ltYWxcIixcbiAgICAgIHN0cnVjdHVyYWxQcm9wZXJ0eTogMSxcbiAgICAgIGpzVHlwZTogXCJudW1iZXJcIixcbiAgICB9LFxuICAgIEVudGl0eToge1xuICAgICAgdHlwZU5hbWU6IFwibXNjcm0uY3JtYmFzZWVudGl0eVwiLFxuICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiA1LFxuICAgICAganNUeXBlOiBcIm9iamVjdFwiLFxuICAgIH0sXG4gICAgRW50aXR5Q29sbGVjdGlvbjoge1xuICAgICAgdHlwZU5hbWU6IFwiQ29sbGVjdGlvbihtc2NybS5jcm1iYXNlZW50aXR5KVwiLFxuICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiA0LFxuICAgICAganNUeXBlOiBcIm9iamVjdFwiLFxuICAgIH0sXG4gICAgRmxvYXQ6IHsgdHlwZU5hbWU6IFwiRWRtLkRvdWJsZVwiLCBzdHJ1Y3R1cmFsUHJvcGVydHk6IDEsIGpzVHlwZTogXCJudW1iZXJcIiB9LFxuICAgIE1vbmV5OiB7IHR5cGVOYW1lOiBcIkVkbS5EZWNpbWFsXCIsIHN0cnVjdHVyYWxQcm9wZXJ0eTogMSwganNUeXBlOiBcIm51bWJlclwiIH0sXG4gICAgUGlja2xpc3Q6IHtcbiAgICAgIHR5cGVOYW1lOiBcIkVkbS5JbnQzMlwiLFxuICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiAxLFxuICAgICAganNUeXBlOiBcIm51bWJlclwiLFxuICAgIH0sXG4gIH07XG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIGdpdmVuIHJlcXVlc3QgcGFyYW1ldGVyIGlzIG9mIGEgc3VwcG9ydGVkIHR5cGUgYW5kIGhhcyBhIHZhbGlkIHZhbHVlLlxuICAgKiBAcGFyYW0ge1JlcXVlc3RQYXJhbWV0ZXJ9IHJlcXVlc3RQYXJhbWV0ZXIgLSBUaGUgcmVxdWVzdCBwYXJhbWV0ZXIgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIHt2b2lkfVxuICAgKiBAdGhyb3dzIHtFcnJvcn0gLSBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlIHJlcXVlc3QgcGFyYW1ldGVyIGlzIG5vdCBvZiBhIHN1cHBvcnRlZCB0eXBlIG9yIGhhcyBhbiBpbnZhbGlkIHZhbHVlLlxuICAgKi9cbiAgZXhwb3J0IGZ1bmN0aW9uIGNoZWNrUmVxdWVzdFBhcmFtZXRlclR5cGUoXG4gICAgcmVxdWVzdFBhcmFtZXRlcjogUmVxdWVzdFBhcmFtZXRlclxuICApOiB2b2lkIHtcbiAgICBpZiAoIXR5cGVNYXBbcmVxdWVzdFBhcmFtZXRlci5UeXBlXSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFRoZSBwcm9wZXJ0eSB0eXBlICR7cmVxdWVzdFBhcmFtZXRlci5UeXBlfSBvZiB0aGUgcHJvcGVydHkgJHtyZXF1ZXN0UGFyYW1ldGVyLk5hbWV9IGlzIG5vdCBzdXBwb3J0ZWQuYFxuICAgICAgKTtcbiAgICBjb25zdCBleHBlY3RlZFR5cGUgPSB0eXBlTWFwW3JlcXVlc3RQYXJhbWV0ZXIuVHlwZV0uanNUeXBlO1xuICAgIGNvbnN0IGFjdHVhbFR5cGUgPSB0eXBlb2YgcmVxdWVzdFBhcmFtZXRlci5WYWx1ZTtcbiAgICBjb25zdCBpbnZhbGlkVHlwZU1lc3NhZ2UgPSBgVGhlIHZhbHVlICR7cmVxdWVzdFBhcmFtZXRlci5WYWx1ZX1cXG5vZiB0aGUgcHJvcGVydHkgJHtyZXF1ZXN0UGFyYW1ldGVyLk5hbWV9XFxuaXMgbm90IG9mIHRoZSBleHBlY3RlZCB0eXBlICR7cmVxdWVzdFBhcmFtZXRlci5UeXBlfS5gO1xuICAgIGlmIChcbiAgICAgIHJlcXVlc3RQYXJhbWV0ZXIuVHlwZSA9PT0gXCJFbnRpdHlSZWZlcmVuY2VcIiB8fFxuICAgICAgcmVxdWVzdFBhcmFtZXRlci5UeXBlID09PSBcIkVudGl0eVwiXG4gICAgKSB7XG4gICAgICBpZiAoXG4gICAgICAgICFyZXF1ZXN0UGFyYW1ldGVyLlZhbHVlIHx8XG4gICAgICAgICFyZXF1ZXN0UGFyYW1ldGVyLlZhbHVlLmhhc093blByb3BlcnR5KFwiaWRcIikgfHxcbiAgICAgICAgIXJlcXVlc3RQYXJhbWV0ZXIuVmFsdWUuaGFzT3duUHJvcGVydHkoXCJlbnRpdHlUeXBlXCIpXG4gICAgICApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGludmFsaWRUeXBlTWVzc2FnZSk7XG4gICAgICB9XG4gICAgICB0eXBlTWFwW1xuICAgICAgICByZXF1ZXN0UGFyYW1ldGVyLlR5cGVcbiAgICAgIF0udHlwZU5hbWUgPSBgbXNjcm0uJHtyZXF1ZXN0UGFyYW1ldGVyLlZhbHVlLmVudGl0eVR5cGV9YDtcbiAgICB9IGVsc2UgaWYgKHJlcXVlc3RQYXJhbWV0ZXIuVHlwZSA9PT0gXCJFbnRpdHlDb2xsZWN0aW9uXCIpIHtcbiAgICAgIGlmIChcbiAgICAgICAgIUFycmF5LmlzQXJyYXkocmVxdWVzdFBhcmFtZXRlci5WYWx1ZSkgfHxcbiAgICAgICAgcmVxdWVzdFBhcmFtZXRlci5WYWx1ZS5ldmVyeShcbiAgICAgICAgICAodikgPT5cbiAgICAgICAgICAgIHR5cGVvZiB2ICE9PSBcIm9iamVjdFwiIHx8XG4gICAgICAgICAgICAhdiB8fFxuICAgICAgICAgICAgIXYuaGFzT3duUHJvcGVydHkoXCJpZFwiKSB8fFxuICAgICAgICAgICAgIXYuaGFzT3duUHJvcGVydHkoXCJlbnRpdHlUeXBlXCIpXG4gICAgICAgIClcbiAgICAgICkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoaW52YWxpZFR5cGVNZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHJlcXVlc3RQYXJhbWV0ZXIuVHlwZSA9PT0gXCJEYXRlVGltZVwiKSB7XG4gICAgICBpZiAoIShyZXF1ZXN0UGFyYW1ldGVyLlZhbHVlIGluc3RhbmNlb2YgRGF0ZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGludmFsaWRUeXBlTWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChhY3R1YWxUeXBlICE9PSBleHBlY3RlZFR5cGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGludmFsaWRUeXBlTWVzc2FnZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBFeGVjdXRlcyBhbiBBY3Rpb24uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhY3Rpb25OYW1lIC0gVGhlIHVuaXF1ZSBuYW1lIG9mIHRoZSBhY3Rpb24uXG4gICAqIEBwYXJhbSB7UmVxdWVzdFBhcmFtZXRlcltdfSByZXF1ZXN0UGFyYW1ldGVycyAtIEFuIGFycmF5IG9mIG9iamVjdHMgd2l0aCB0aGUgcGFyYW1ldGVyIG5hbWUsIHR5cGUgYW5kIHZhbHVlLlxuICAgKiBAcGFyYW0ge0VudGl0eVJlZmVyZW5jZX0gW2JvdW5kRW50aXR5XSAtIEFuIG9wdGlvbmFsIEVudGl0eVJlZmVyZW5jZSBvZiB0aGUgYm91bmQgZW50aXR5LlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fSAtIEEgUHJvbWlzZSB3aXRoIHRoZSByZXF1ZXN0IHJlc3BvbnNlLlxuICAgKiBAdGhyb3dzIHtFcnJvcn0gLSBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlIHJlcXVlc3QgcGFyYW1ldGVyIGlzIG5vdCBvZiBhIHN1cHBvcnRlZCB0eXBlIG9yIGhhcyBhbiBpbnZhbGlkIHZhbHVlLlxuICAgKi9cbiAgZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVBY3Rpb24oXG4gICAgYWN0aW9uTmFtZTogc3RyaW5nLFxuICAgIHJlcXVlc3RQYXJhbWV0ZXJzOiBSZXF1ZXN0UGFyYW1ldGVyW10sXG4gICAgYm91bmRFbnRpdHk/OiBFbnRpdHlSZWZlcmVuY2VcbiAgKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCBwYXJhbWV0ZXJEZWZpbml0aW9uOiBhbnkgPSB7fTtcbiAgICBpZiAoYm91bmRFbnRpdHkpXG4gICAgICByZXF1ZXN0UGFyYW1ldGVycy5wdXNoKHtcbiAgICAgICAgTmFtZTogXCJlbnRpdHlcIixcbiAgICAgICAgVmFsdWU6IGJvdW5kRW50aXR5LFxuICAgICAgICBUeXBlOiBcIkVudGl0eVJlZmVyZW5jZVwiLFxuICAgICAgfSk7XG4gICAgZm9yIChjb25zdCByZXF1ZXN0UGFyYW1ldGVyIG9mIHJlcXVlc3RQYXJhbWV0ZXJzKSB7XG4gICAgICBjaGVja1JlcXVlc3RQYXJhbWV0ZXJUeXBlKHJlcXVlc3RQYXJhbWV0ZXIpO1xuICAgICAgcGFyYW1ldGVyRGVmaW5pdGlvbltyZXF1ZXN0UGFyYW1ldGVyLk5hbWVdID0ge1xuICAgICAgICB0eXBlTmFtZTogdHlwZU1hcFtyZXF1ZXN0UGFyYW1ldGVyLlR5cGVdLnR5cGVOYW1lLFxuICAgICAgICBzdHJ1Y3R1cmFsUHJvcGVydHk6IHR5cGVNYXBbcmVxdWVzdFBhcmFtZXRlci5UeXBlXS5zdHJ1Y3R1cmFsUHJvcGVydHksXG4gICAgICB9O1xuICAgIH1cbiAgICBjb25zdCByZXEgPSBPYmplY3QuYXNzaWduKFxuICAgICAge1xuICAgICAgICBnZXRNZXRhZGF0YTogKCkgPT4gKHtcbiAgICAgICAgICBib3VuZFBhcmFtZXRlcjogYm91bmRFbnRpdHkgPyBcImVudGl0eVwiIDogbnVsbCxcbiAgICAgICAgICBvcGVyYXRpb25UeXBlOiAwLFxuICAgICAgICAgIG9wZXJhdGlvbk5hbWU6IGFjdGlvbk5hbWUsXG4gICAgICAgICAgcGFyYW1ldGVyVHlwZXM6IHBhcmFtZXRlckRlZmluaXRpb24sXG4gICAgICAgIH0pLFxuICAgICAgfSxcbiAgICAgIC4uLnJlcXVlc3RQYXJhbWV0ZXJzLm1hcCgocCkgPT4gKHsgW3AuTmFtZV06IHAuVmFsdWUgfSkpXG4gICAgKTtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IFhybS5XZWJBcGkub25saW5lLmV4ZWN1dGUocmVxKTtcbiAgICBpZiAocmVzcG9uc2Uub2spIHJldHVybiByZXNwb25zZS5qc29uKCkuY2F0Y2goKCkgPT4gcmVzcG9uc2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGVzIGEgRnVuY3Rpb24uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmdW5jdGlvbk5hbWUgLSBUaGUgdW5pcXVlIG5hbWUgb2YgdGhlIGZ1bmN0aW9uLlxuICAgKiBAcGFyYW0ge1JlcXVlc3RQYXJhbWV0ZXJbXX0gcmVxdWVzdFBhcmFtZXRlcnMgLSBBbiBhcnJheSBvZiBvYmplY3RzIHdpdGggdGhlIHBhcmFtZXRlciBuYW1lLCB0eXBlIGFuZCB2YWx1ZS5cbiAgICogQHBhcmFtIHtFbnRpdHlSZWZlcmVuY2V9IFtib3VuZEVudGl0eV0gLSBBbiBvcHRpb25hbCBFbnRpdHlSZWZlcmVuY2Ugb2YgdGhlIGJvdW5kIGVudGl0eS5cbiAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn0gLSBBIFByb21pc2Ugd2l0aCB0aGUgcmVxdWVzdCByZXNwb25zZS5cbiAgICogQHRocm93cyB7RXJyb3J9IC0gVGhyb3dzIGFuIGVycm9yIGlmIHRoZSByZXF1ZXN0IHBhcmFtZXRlciBpcyBub3Qgb2YgYSBzdXBwb3J0ZWQgdHlwZSBvciBoYXMgYW4gaW52YWxpZCB2YWx1ZS5cbiAgICovXG4gIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBleGVjdXRlRnVuY3Rpb24oXG4gICAgZnVuY3Rpb25OYW1lOiBzdHJpbmcsXG4gICAgcmVxdWVzdFBhcmFtZXRlcnM6IFJlcXVlc3RQYXJhbWV0ZXJbXSxcbiAgICBib3VuZEVudGl0eT86IEVudGl0eVJlZmVyZW5jZVxuICApOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IHBhcmFtZXRlckRlZmluaXRpb246IGFueSA9IHt9O1xuICAgIGlmIChib3VuZEVudGl0eSlcbiAgICAgIHJlcXVlc3RQYXJhbWV0ZXJzLnB1c2goe1xuICAgICAgICBOYW1lOiBcImVudGl0eVwiLFxuICAgICAgICBWYWx1ZTogYm91bmRFbnRpdHksXG4gICAgICAgIFR5cGU6IFwiRW50aXR5UmVmZXJlbmNlXCIsXG4gICAgICB9KTtcbiAgICBmb3IgKGNvbnN0IHJlcXVlc3RQYXJhbWV0ZXIgb2YgcmVxdWVzdFBhcmFtZXRlcnMpIHtcbiAgICAgIGNoZWNrUmVxdWVzdFBhcmFtZXRlclR5cGUocmVxdWVzdFBhcmFtZXRlcik7XG4gICAgICBwYXJhbWV0ZXJEZWZpbml0aW9uW3JlcXVlc3RQYXJhbWV0ZXIuTmFtZV0gPSB7XG4gICAgICAgIHR5cGVOYW1lOiB0eXBlTWFwW3JlcXVlc3RQYXJhbWV0ZXIuVHlwZV0udHlwZU5hbWUsXG4gICAgICAgIHN0cnVjdHVyYWxQcm9wZXJ0eTogdHlwZU1hcFtyZXF1ZXN0UGFyYW1ldGVyLlR5cGVdLnN0cnVjdHVyYWxQcm9wZXJ0eSxcbiAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IHJlcSA9IE9iamVjdC5hc3NpZ24oXG4gICAgICB7XG4gICAgICAgIGdldE1ldGFkYXRhOiAoKSA9PiAoe1xuICAgICAgICAgIGJvdW5kUGFyYW1ldGVyOiBib3VuZEVudGl0eSA/IFwiZW50aXR5XCIgOiBudWxsLFxuICAgICAgICAgIG9wZXJhdGlvblR5cGU6IDEsXG4gICAgICAgICAgb3BlcmF0aW9uTmFtZTogZnVuY3Rpb25OYW1lLFxuICAgICAgICAgIHBhcmFtZXRlclR5cGVzOiBwYXJhbWV0ZXJEZWZpbml0aW9uLFxuICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgICAuLi5yZXF1ZXN0UGFyYW1ldGVycy5tYXAoKHApID0+ICh7IFtwLk5hbWVdOiBwLlZhbHVlIH0pKVxuICAgICk7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBYcm0uV2ViQXBpLm9ubGluZS5leGVjdXRlKHJlcSk7XG4gICAgaWYgKHJlc3BvbnNlLm9rKSByZXR1cm4gcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+IHJlc3BvbnNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYWtlcyBhIEdVSUQgbG93ZXJjYXNlIGFuZCByZW1vdmVzIGJyYWNrZXRzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZ3VpZCAtIFRoZSBHVUlEIHRvIG5vcm1hbGl6ZS5cbiAgICogQHJldHVybnMge3N0cmluZ30gLSBUaGUgbm9ybWFsaXplZCBHVUlELlxuICAgKi9cbiAgZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZUd1aWQoZ3VpZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAodHlwZW9mIGd1aWQgIT09IFwic3RyaW5nXCIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4Lm5vcm1hbGl6ZUd1aWQ6XFxuJyR7Z3VpZH0nIGlzIG5vdCBhIHN0cmluZ2ApO1xuICAgIHJldHVybiBndWlkLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW3t9XS9nLCBcIlwiKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXcmFwcyBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYSBjYWxsYmFjayBhcyBpdHMgbGFzdCBwYXJhbWV0ZXIgYW5kIHJldHVybnMgYSBQcm9taXNlLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiB0aGUgZnVuY3Rpb24gdG8gd3JhcFxuICAgKiBAcGFyYW0gY29udGV4dCB0aGUgcGFyZW50IHByb3BlcnR5IG9mIHRoZSBmdW5jdGlvbiBmLmUuIGZvcm1Db250ZXh0LmRhdGEucHJvY2VzcyBmb3IgZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLmdldEVuYWJsZWRQcm9jZXNzZXNcbiAgICogQHBhcmFtIGFyZ3MgdGhlIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBmdW5jdGlvblxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fSBhIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBjYWxsYmFjayByZXNwb25zZVxuICAgKi9cbiAgZXhwb3J0IGZ1bmN0aW9uIGFzUHJvbWlzZTxUPihmbjogRnVuY3Rpb24sIGNvbnRleHQsIC4uLmFyZ3MpOiBQcm9taXNlPFQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgY2FsbGJhY2sgPSAocmVzcG9uc2U6IFQpID0+IHtcbiAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICB9O1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQ2FsbCB0aGUgZnVuY3Rpb24gd2l0aCB0aGUgYXJndW1lbnRzIGFuZCB0aGUgY2FsbGJhY2sgYXQgdGhlIGVuZFxuICAgICAgICBmbi5jYWxsKGNvbnRleHQsIC4uLmFyZ3MsIGNhbGxiYWNrKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgLyoqXG4gICAqIE9wZW5zIGEgZGlhbG9nIHdpdGggZHluYW1pYyBoZWlnaHQgYW5kIHdpZHRoIGJhc2VkIG9uIHRleHQgY29udGVudC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlIC0gVGhlIHRpdGxlIG9mIHRoZSBkaWFsb2cuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gVGhlIHRleHQgY29udGVudCBvZiB0aGUgZGlhbG9nLlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fSAtIEEgUHJvbWlzZSB3aXRoIHRoZSBkaWFsb2cgcmVzcG9uc2UuXG4gICAqL1xuICBleHBvcnQgYXN5bmMgZnVuY3Rpb24gb3BlbkFsZXJ0RGlhbG9nKFxuICAgIHRpdGxlOiBzdHJpbmcsXG4gICAgdGV4dDogc3RyaW5nXG4gICk6IFByb21pc2U8YW55PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJvd3MgPSB0ZXh0LnNwbGl0KC9cXHJcXG58XFxyfFxcbi8pO1xuICAgICAgbGV0IGFkZGl0aW9uYWxSb3dzID0gMDtcbiAgICAgIHJvd3MuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgICAgIGxldCB3aWR0aCA9IGdldFRleHRXaWR0aChcbiAgICAgICAgICByb3csXG4gICAgICAgICAgXCIxcmVtIFNlZ29lIFVJIFJlZ3VsYXIsIFNlZ29lVUksIFNlZ29lIFVJXCJcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHdpZHRoID4gOTQwKSB7XG4gICAgICAgICAgYWRkaXRpb25hbFJvd3MgKz0gd2lkdGggLyA5NDA7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgY29uc3QgbG9uZ2VzdFJvdyA9IHJvd3MucmVkdWNlKFxuICAgICAgICAoYWNjLCByb3cpID0+IChyb3cubGVuZ3RoID4gYWNjLmxlbmd0aCA/IHJvdyA6IGFjYyksXG4gICAgICAgIFwiXCJcbiAgICAgICk7XG4gICAgICBjb25zdCB3aWR0aCA9IE1hdGgubWluKFxuICAgICAgICBnZXRUZXh0V2lkdGgobG9uZ2VzdFJvdywgXCIxcmVtIFNlZ29lIFVJIFJlZ3VsYXIsIFNlZ29lVUksIFNlZ29lIFVJXCIpLFxuICAgICAgICAxMDAwXG4gICAgICApO1xuICAgICAgY29uc3QgaGVpZ2h0ID0gMTA5ICsgKHJvd3MubGVuZ3RoICsgYWRkaXRpb25hbFJvd3MpICogMjA7XG4gICAgICByZXR1cm4gYXdhaXQgWHJtLk5hdmlnYXRpb24ub3BlbkFsZXJ0RGlhbG9nKFxuICAgICAgICB7XG4gICAgICAgICAgY29uZmlybUJ1dHRvbkxhYmVsOiBcIk9rXCIsXG4gICAgICAgICAgdGV4dCxcbiAgICAgICAgICB0aXRsZSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICB3aWR0aCxcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycm9yLm1lc3NhZ2UpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke2dldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVzZXMgY2FudmFzLm1lYXN1cmVUZXh0IHRvIGNvbXB1dGUgYW5kIHJldHVybiB0aGUgd2lkdGggb2YgdGhlIGdpdmVuIHRleHQgb2YgZ2l2ZW4gZm9udCBpbiBwaXhlbHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdGV4dCBUaGUgdGV4dCB0byBiZSByZW5kZXJlZC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZm9udCBUaGUgY3NzIGZvbnQgZGVzY3JpcHRvciB0aGF0IHRleHQgaXMgdG8gYmUgcmVuZGVyZWQgd2l0aCAoZS5nLiBcImJvbGQgMTRweCB2ZXJkYW5hXCIpLlxuICAgICAqXG4gICAgICogQHNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMTgyNDEvY2FsY3VsYXRlLXRleHQtd2lkdGgtd2l0aC1qYXZhc2NyaXB0LzIxMDE1MzkzIzIxMDE1MzkzXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0VGV4dFdpZHRoKHRleHQ6IHN0cmluZywgZm9udDogc3RyaW5nKSB7XG4gICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICBjb250ZXh0LmZvbnQgPSBmb250O1xuICAgICAgY29uc3QgbWV0cmljcyA9IGNvbnRleHQubWVhc3VyZVRleHQodGV4dCk7XG4gICAgICByZXR1cm4gbWV0cmljcy53aWR0aDtcbiAgICB9XG4gIH1cblxuICBleHBvcnQgY2xhc3MgUHJvY2VzcyB7XG4gICAgc3RhdGljIGdldCBkYXRhKCkge1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzO1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0IHVpKCkge1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQudWkucHJvY2VzcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXNlIHRoaXMgdG8gYWRkIGEgZnVuY3Rpb24gYXMgYW4gZXZlbnQgaGFuZGxlciBmb3IgdGhlIE9uUHJlUHJvY2Vzc1N0YXR1c0NoYW5nZSBldmVudCBzbyB0aGF0IGl0IHdpbGwgYmUgY2FsbGVkIGJlZm9yZSB0aGVcbiAgICAgKiBidXNpbmVzcyBwcm9jZXNzIGZsb3cgc3RhdHVzIGNoYW5nZXMuXG4gICAgICogQHBhcmFtIGhhbmRsZXIgVGhlIGZ1bmN0aW9uIHdpbGwgYmUgYWRkZWQgdG8gdGhlIGJvdHRvbSBvZiB0aGUgZXZlbnRcbiAgICAgKiAgICAgICAgICAgICAgICBoYW5kbGVyIHBpcGVsaW5lLiBUaGUgZXhlY3V0aW9uIGNvbnRleHQgaXMgYXV0b21hdGljYWxseVxuICAgICAqICAgICAgICAgICAgICAgIHNldCB0byBiZSB0aGUgZmlyc3QgcGFyYW1ldGVyIHBhc3NlZCB0byB0aGUgZXZlbnQgaGFuZGxlci5cbiAgICAgKiAgICAgICAgICAgICAgICBVc2UgYSByZWZlcmVuY2UgdG8gYSBuYW1lZCBmdW5jdGlvbiByYXRoZXIgdGhhbiBhblxuICAgICAqICAgICAgICAgICAgICAgIGFub255bW91cyBmdW5jdGlvbiBpZiB5b3UgbWF5IGxhdGVyIHdhbnQgdG8gcmVtb3ZlIHRoZVxuICAgICAqICAgICAgICAgICAgICAgIGV2ZW50IGhhbmRsZXIuXG4gICAgICovXG4gICAgc3RhdGljIGFkZE9uUHJlUHJvY2Vzc1N0YXR1c0NoYW5nZShcbiAgICAgIGhhbmRsZXI6IFhybS5FdmVudHMuUHJvY2Vzc1N0YXR1c0NoYW5nZUhhbmRsZXJcbiAgICApIHtcbiAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLnJlbW92ZU9uUHJlUHJvY2Vzc1N0YXR1c0NoYW5nZShoYW5kbGVyKTtcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5hZGRPblByZVByb2Nlc3NTdGF0dXNDaGFuZ2UoaGFuZGxlcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVzZSB0aGlzIHRvIGFkZCBhIGZ1bmN0aW9uIGFzIGFuIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBPblByZVN0YWdlQ2hhbmdlIGV2ZW50IHNvIHRoYXQgaXQgd2lsbCBiZSBjYWxsZWQgYmVmb3JlIHRoZVxuICAgICAqIGJ1c2luZXNzIHByb2Nlc3MgZmxvdyBzdGFnZSBjaGFuZ2VzLlxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGFkZGVkIHRvIHRoZSBib3R0b20gb2YgdGhlIGV2ZW50XG4gICAgICogICAgICAgICAgICAgICAgaGFuZGxlciBwaXBlbGluZS4gVGhlIGV4ZWN1dGlvbiBjb250ZXh0IGlzIGF1dG9tYXRpY2FsbHlcbiAgICAgKiAgICAgICAgICAgICAgICBzZXQgdG8gYmUgdGhlIGZpcnN0IHBhcmFtZXRlciBwYXNzZWQgdG8gdGhlIGV2ZW50IGhhbmRsZXIuXG4gICAgICogICAgICAgICAgICAgICAgVXNlIGEgcmVmZXJlbmNlIHRvIGEgbmFtZWQgZnVuY3Rpb24gcmF0aGVyIHRoYW4gYW5cbiAgICAgKiAgICAgICAgICAgICAgICBhbm9ueW1vdXMgZnVuY3Rpb24gaWYgeW91IG1heSBsYXRlciB3YW50IHRvIHJlbW92ZSB0aGVcbiAgICAgKiAgICAgICAgICAgICAgICBldmVudCBoYW5kbGVyLlxuICAgICAqL1xuICAgIHN0YXRpYyBhZGRPblByZVN0YWdlQ2hhbmdlKGhhbmRsZXI6IFhybS5FdmVudHMuU3RhZ2VDaGFuZ2VFdmVudEhhbmRsZXIpIHtcbiAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLnJlbW92ZU9uUHJlU3RhZ2VDaGFuZ2UoaGFuZGxlcik7XG4gICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MuYWRkT25QcmVTdGFnZUNoYW5nZShoYW5kbGVyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXNlIHRoaXMgdG8gYWRkIGEgZnVuY3Rpb24gYXMgYW4gZXZlbnQgaGFuZGxlciBmb3IgdGhlIE9uUHJlUHJvY2Vzc1N0YXR1c0NoYW5nZSBldmVudCBzbyB0aGF0IGl0IHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhlXG4gICAgICogYnVzaW5lc3MgcHJvY2VzcyBmbG93IHN0YXR1cyBjaGFuZ2VzLlxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGFkZGVkIHRvIHRoZSBib3R0b20gb2YgdGhlIGV2ZW50XG4gICAgICogICAgICAgICAgICAgICAgaGFuZGxlciBwaXBlbGluZS4gVGhlIGV4ZWN1dGlvbiBjb250ZXh0IGlzIGF1dG9tYXRpY2FsbHlcbiAgICAgKiAgICAgICAgICAgICAgICBzZXQgdG8gYmUgdGhlIGZpcnN0IHBhcmFtZXRlciBwYXNzZWQgdG8gdGhlIGV2ZW50IGhhbmRsZXIuXG4gICAgICogICAgICAgICAgICAgICAgVXNlIGEgcmVmZXJlbmNlIHRvIGEgbmFtZWQgZnVuY3Rpb24gcmF0aGVyIHRoYW4gYW5cbiAgICAgKiAgICAgICAgICAgICAgICBhbm9ueW1vdXMgZnVuY3Rpb24gaWYgeW91IG1heSBsYXRlciB3YW50IHRvIHJlbW92ZSB0aGVcbiAgICAgKiAgICAgICAgICAgICAgICBldmVudCBoYW5kbGVyLlxuICAgICAqL1xuICAgIHN0YXRpYyBhZGRPblByb2Nlc3NTdGF0dXNDaGFuZ2UoXG4gICAgICBoYW5kbGVyOiBYcm0uRXZlbnRzLlByb2Nlc3NTdGF0dXNDaGFuZ2VIYW5kbGVyXG4gICAgKSB7XG4gICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5yZW1vdmVPblByb2Nlc3NTdGF0dXNDaGFuZ2UoaGFuZGxlcik7XG4gICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MuYWRkT25Qcm9jZXNzU3RhdHVzQ2hhbmdlKGhhbmRsZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVc2UgdGhpcyB0byBhZGQgYSBmdW5jdGlvbiBhcyBhbiBldmVudCBoYW5kbGVyIGZvciB0aGUgT25TdGFnZUNoYW5nZSBldmVudCBzbyB0aGF0IGl0IHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhlXG4gICAgICogYnVzaW5lc3MgcHJvY2VzcyBmbG93IHN0YWdlIGNoYW5nZXMuXG4gICAgICogQHBhcmFtIGhhbmRsZXIgVGhlIGZ1bmN0aW9uIHdpbGwgYmUgYWRkZWQgdG8gdGhlIGJvdHRvbSBvZiB0aGUgZXZlbnRcbiAgICAgKiAgICAgICAgICAgICAgICBoYW5kbGVyIHBpcGVsaW5lLiBUaGUgZXhlY3V0aW9uIGNvbnRleHQgaXMgYXV0b21hdGljYWxseVxuICAgICAqICAgICAgICAgICAgICAgIHNldCB0byBiZSB0aGUgZmlyc3QgcGFyYW1ldGVyIHBhc3NlZCB0byB0aGUgZXZlbnQgaGFuZGxlci5cbiAgICAgKiAgICAgICAgICAgICAgICBVc2UgYSByZWZlcmVuY2UgdG8gYSBuYW1lZCBmdW5jdGlvbiByYXRoZXIgdGhhbiBhblxuICAgICAqICAgICAgICAgICAgICAgIGFub255bW91cyBmdW5jdGlvbiBpZiB5b3UgbWF5IGxhdGVyIHdhbnQgdG8gcmVtb3ZlIHRoZVxuICAgICAqICAgICAgICAgICAgICAgIGV2ZW50IGhhbmRsZXIuXG4gICAgICovXG4gICAgc3RhdGljIGFkZE9uU3RhZ2VDaGFuZ2UoaGFuZGxlcjogWHJtLkV2ZW50cy5TdGFnZUNoYW5nZUV2ZW50SGFuZGxlcikge1xuICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MucmVtb3ZlT25TdGFnZUNoYW5nZShoYW5kbGVyKTtcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5hZGRPblN0YWdlQ2hhbmdlKGhhbmRsZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVc2UgdGhpcyB0byBhZGQgYSBmdW5jdGlvbiBhcyBhbiBldmVudCBoYW5kbGVyIGZvciB0aGUgT25TdGFnZVNlbGVjdGVkIGV2ZW50IHNvIHRoYXQgaXQgd2lsbCBiZSBjYWxsZWRcbiAgICAgKiB3aGVuIGEgYnVzaW5lc3MgcHJvY2VzcyBmbG93IHN0YWdlIGlzIHNlbGVjdGVkLlxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGFkZGVkIHRvIHRoZSBib3R0b20gb2YgdGhlIGV2ZW50XG4gICAgICogICAgICAgICAgICAgICAgaGFuZGxlciBwaXBlbGluZS4gVGhlIGV4ZWN1dGlvbiBjb250ZXh0IGlzIGF1dG9tYXRpY2FsbHlcbiAgICAgKiAgICAgICAgICAgICAgICBzZXQgdG8gYmUgdGhlIGZpcnN0IHBhcmFtZXRlciBwYXNzZWQgdG8gdGhlIGV2ZW50IGhhbmRsZXIuXG4gICAgICogICAgICAgICAgICAgICAgVXNlIGEgcmVmZXJlbmNlIHRvIGEgbmFtZWQgZnVuY3Rpb24gcmF0aGVyIHRoYW4gYW5cbiAgICAgKiAgICAgICAgICAgICAgICBhbm9ueW1vdXMgZnVuY3Rpb24gaWYgeW91IG1heSBsYXRlciB3YW50IHRvIHJlbW92ZSB0aGVcbiAgICAgKiAgICAgICAgICAgICAgICBldmVudCBoYW5kbGVyLlxuICAgICAqL1xuICAgIHN0YXRpYyBhZGRPblN0YWdlU2VsZWN0ZWQoaGFuZGxlcjogWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlcikge1xuICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MucmVtb3ZlT25TdGFnZVNlbGVjdGVkKGhhbmRsZXIpO1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLmFkZE9uU3RhZ2VTZWxlY3RlZChoYW5kbGVyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXNlIHRoaXMgdG8gcmVtb3ZlIGEgZnVuY3Rpb24gYXMgYW4gZXZlbnQgaGFuZGxlciBmb3IgdGhlIE9uUHJlUHJvY2Vzc1N0YXR1c0NoYW5nZSBldmVudC5cbiAgICAgKiBAcGFyYW0gaGFuZGxlciBJZiBhbiBhbm9ueW1vdXMgZnVuY3Rpb24gaXMgc2V0IHVzaW5nIHRoZSBhZGRPblByZVByb2Nlc3NTdGF0dXNDaGFuZ2UgbWV0aG9kIGl0XG4gICAgICogICAgICAgICAgICAgICAgY2Fubm90IGJlIHJlbW92ZWQgdXNpbmcgdGhpcyBtZXRob2QuXG4gICAgICovXG4gICAgc3RhdGljIHJlbW92ZU9uUHJlUHJvY2Vzc1N0YXR1c0NoYW5nZShcbiAgICAgIGhhbmRsZXI6IFhybS5FdmVudHMuUHJvY2Vzc1N0YXR1c0NoYW5nZUhhbmRsZXJcbiAgICApIHtcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5yZW1vdmVPblByZVByb2Nlc3NTdGF0dXNDaGFuZ2UoXG4gICAgICAgIGhhbmRsZXJcbiAgICAgICk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVzZSB0aGlzIHRvIHJlbW92ZSBhIGZ1bmN0aW9uIGFzIGFuIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBPblByZVN0YWdlQ2hhbmdlIGV2ZW50LlxuICAgICAqIEBwYXJhbSBoYW5kbGVyIElmIGFuIGFub255bW91cyBmdW5jdGlvbiBpcyBzZXQgdXNpbmcgdGhlIGFkZE9uUHJlU3RhZ2VDaGFuZ2UgbWV0aG9kIGl0XG4gICAgICogICAgICAgICAgICAgICAgY2Fubm90IGJlIHJlbW92ZWQgdXNpbmcgdGhpcyBtZXRob2QuXG4gICAgICovXG4gICAgc3RhdGljIHJlbW92ZU9uUHJlU3RhZ2VDaGFuZ2UoaGFuZGxlcjogWHJtLkV2ZW50cy5TdGFnZUNoYW5nZUV2ZW50SGFuZGxlcikge1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLnJlbW92ZU9uUHJlU3RhZ2VDaGFuZ2UoaGFuZGxlcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVzZSB0aGlzIHRvIHJlbW92ZSBhIGZ1bmN0aW9uIGFzIGFuIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBPblByb2Nlc3NTdGF0dXNDaGFuZ2UgZXZlbnQuXG4gICAgICogQHBhcmFtIGhhbmRsZXIgSWYgYW4gYW5vbnltb3VzIGZ1bmN0aW9uIGlzIHNldCB1c2luZyB0aGUgYWRkT25Qcm9jZXNzU3RhdHVzQ2hhbmdlIG1ldGhvZCBpdFxuICAgICAqICAgICAgICAgICAgICAgIGNhbm5vdCBiZSByZW1vdmVkIHVzaW5nIHRoaXMgbWV0aG9kLlxuICAgICAqL1xuICAgIHN0YXRpYyByZW1vdmVPblByb2Nlc3NTdGF0dXNDaGFuZ2UoXG4gICAgICBoYW5kbGVyOiBYcm0uRXZlbnRzLlByb2Nlc3NTdGF0dXNDaGFuZ2VIYW5kbGVyXG4gICAgKSB7XG4gICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MucmVtb3ZlT25Qcm9jZXNzU3RhdHVzQ2hhbmdlKGhhbmRsZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVc2UgdGhpcyB0byByZW1vdmUgYSBmdW5jdGlvbiBhcyBhbiBldmVudCBoYW5kbGVyIGZvciB0aGUgT25TdGFnZUNoYW5nZSBldmVudC5cbiAgICAgKiBAcGFyYW0gaGFuZGxlciBJZiBhbiBhbm9ueW1vdXMgZnVuY3Rpb24gaXMgc2V0IHVzaW5nIHRoZSBhZGRPblN0YWdlQ2hhbmdlIG1ldGhvZCBpdFxuICAgICAqICAgICAgICAgICAgICAgIGNhbm5vdCBiZSByZW1vdmVkIHVzaW5nIHRoaXMgbWV0aG9kLlxuICAgICAqL1xuICAgIHN0YXRpYyByZW1vdmVPblN0YWdlQ2hhbmdlKGhhbmRsZXI6IFhybS5FdmVudHMuU3RhZ2VDaGFuZ2VFdmVudEhhbmRsZXIpIHtcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5yZW1vdmVPblN0YWdlQ2hhbmdlKGhhbmRsZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVc2UgdGhpcyB0byByZW1vdmUgYSBmdW5jdGlvbiBhcyBhbiBldmVudCBoYW5kbGVyIGZvciB0aGUgT25TdGFnZUNoYW5nZSBldmVudC5cbiAgICAgKiBAcGFyYW0gaGFuZGxlciBJZiBhbiBhbm9ueW1vdXMgZnVuY3Rpb24gaXMgc2V0IHVzaW5nIHRoZSBhZGRPblN0YWdlQ2hhbmdlIG1ldGhvZCBpdFxuICAgICAqICAgICAgICAgICAgICAgIGNhbm5vdCBiZSByZW1vdmVkIHVzaW5nIHRoaXMgbWV0aG9kLlxuICAgICAqL1xuICAgIHN0YXRpYyByZW1vdmVPblN0YWdlU2VsZWN0ZWQoaGFuZGxlcjogWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlcikge1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLnJlbW92ZU9uU3RhZ2VTZWxlY3RlZChoYW5kbGVyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVc2UgdGhpcyBtZXRob2QgdG8gYXN5bmNocm9ub3VzbHkgcmV0cmlldmUgdGhlIGVuYWJsZWQgYnVzaW5lc3MgcHJvY2VzcyBmbG93cyB0aGF0IHRoZSB1c2VyIGNhbiBzd2l0Y2ggdG8gZm9yIGFuIGVudGl0eS5cbiAgICAgKiBAcmV0dXJucyByZXR1cm5zIGNhbGxiYWNrIHJlc3BvbnNlIGFzIFByb21pc2VcbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0RW5hYmxlZFByb2Nlc3NlcygpIHtcbiAgICAgIHJldHVybiBhc1Byb21pc2U8WHJtLlByb2Nlc3NGbG93LlByb2Nlc3NEaWN0aW9uYXJ5PihcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MuZ2V0RW5hYmxlZFByb2Nlc3NlcyxcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3NcbiAgICAgICk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYWxsIHByb2Nlc3MgaW5zdGFuY2VzIGZvciB0aGUgZW50aXR5IHJlY29yZCB0aGF0IHRoZSBjYWxsaW5nIHVzZXIgaGFzIGFjY2VzcyB0by5cbiAgICAgKiBAcmV0dXJucyByZXR1cm5zIGNhbGxiYWNrIHJlc3BvbnNlIGFzIFByb21pc2VcbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0UHJvY2Vzc0luc3RhbmNlcygpIHtcbiAgICAgIHJldHVybiBhc1Byb21pc2U8WHJtLlByb2Nlc3NGbG93LkdldFByb2Nlc3NJbnN0YW5jZXNEZWxlZ2F0ZT4oXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLmdldFByb2Nlc3NJbnN0YW5jZXMsXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzXG4gICAgICApO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQcm9ncmVzc2VzIHRvIHRoZSBuZXh0IHN0YWdlLlxuICAgICAqIEByZXR1cm5zIHJldHVybnMgY2FsbGJhY2sgcmVzcG9uc2UgYXMgUHJvbWlzZVxuICAgICAqL1xuICAgIHN0YXRpYyBtb3ZlTmV4dCgpIHtcbiAgICAgIHJldHVybiBhc1Byb21pc2U8WHJtLlByb2Nlc3NGbG93LlByb2Nlc3NDYWxsYmFja0RlbGVnYXRlPihcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MubW92ZU5leHQsXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzXG4gICAgICApO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBNb3ZlcyB0byB0aGUgcHJldmlvdXMgc3RhZ2UuXG4gICAgICogQHJldHVybnMgcmV0dXJucyBjYWxsYmFjayByZXNwb25zZSBhcyBQcm9taXNlXG4gICAgICovXG4gICAgc3RhdGljIG1vdmVQcmV2aW91cygpIHtcbiAgICAgIHJldHVybiBhc1Byb21pc2U8WHJtLlByb2Nlc3NGbG93LlByb2Nlc3NDYWxsYmFja0RlbGVnYXRlPihcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MubW92ZVByZXZpb3VzLFxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzc1xuICAgICAgKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0IGEgUHJvY2VzcyBhcyB0aGUgYWN0aXZlIHByb2Nlc3MuXG4gICAgICogQHBhcmFtIHByb2Nlc3NJZCBUaGUgSWQgb2YgdGhlIHByb2Nlc3MgdG8gbWFrZSB0aGUgYWN0aXZlIHByb2Nlc3MuXG4gICAgICogQHJldHVybnMgcmV0dXJucyBjYWxsYmFjayByZXNwb25zZSBhcyBQcm9taXNlXG4gICAgICovXG4gICAgc3RhdGljIHNldEFjdGl2ZVByb2Nlc3MocHJvY2Vzc0lkOiBzdHJpbmcpIHtcbiAgICAgIHJldHVybiBhc1Byb21pc2U8WHJtLlByb2Nlc3NGbG93LlByb2Nlc3NDYWxsYmFja0RlbGVnYXRlPihcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3Muc2V0QWN0aXZlUHJvY2VzcyxcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MsXG4gICAgICAgIHByb2Nlc3NJZFxuICAgICAgKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyBhIHByb2Nlc3MgaW5zdGFuY2UgYXMgdGhlIGFjdGl2ZSBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSBwcm9jZXNzSW5zdGFuY2VJZCBUaGUgSWQgb2YgdGhlIHByb2Nlc3MgaW5zdGFuY2UgdG8gbWFrZSB0aGUgYWN0aXZlIGluc3RhbmNlLlxuICAgICAqIEByZXR1cm5zIHJldHVybnMgY2FsbGJhY2sgcmVzcG9uc2UgYXMgUHJvbWlzZVxuICAgICAqL1xuICAgIHN0YXRpYyBzZXRBY3RpdmVQcm9jZXNzSW5zdGFuY2UocHJvY2Vzc0luc3RhbmNlSWQ6IHN0cmluZykge1xuICAgICAgcmV0dXJuIGFzUHJvbWlzZTxYcm0uUHJvY2Vzc0Zsb3cuU2V0UHJvY2Vzc0luc3RhbmNlRGVsZWdhdGU+KFxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5zZXRBY3RpdmVQcm9jZXNzSW5zdGFuY2UsXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLFxuICAgICAgICBwcm9jZXNzSW5zdGFuY2VJZFxuICAgICAgKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0IGEgc3RhZ2UgYXMgdGhlIGFjdGl2ZSBzdGFnZS5cbiAgICAgKiBAcGFyYW0gc3RhZ2VJZCB0aGUgSWQgb2YgdGhlIHN0YWdlIHRvIG1ha2UgdGhlIGFjdGl2ZSBzdGFnZS5cbiAgICAgKiBAcmV0dXJucyByZXR1cm5zIGNhbGxiYWNrIHJlc3BvbnNlIGFzIFByb21pc2VcbiAgICAgKi9cbiAgICBzdGF0aWMgc2V0QWN0aXZlU3RhZ2Uoc3RhZ2VJZDogc3RyaW5nKSB7XG4gICAgICByZXR1cm4gYXNQcm9taXNlPFhybS5Qcm9jZXNzRmxvdy5TZXRQcm9jZXNzSW5zdGFuY2VEZWxlZ2F0ZT4oXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLnNldEFjdGl2ZVN0YWdlLFxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2VzcyxcbiAgICAgICAgc3RhZ2VJZFxuICAgICAgKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXNlIHRoaXMgbWV0aG9kIHRvIHNldCB0aGUgY3VycmVudCBzdGF0dXMgb2YgdGhlIHByb2Nlc3MgaW5zdGFuY2VcbiAgICAgKiBAcGFyYW0gc3RhdHVzIFRoZSBuZXcgc3RhdHVzIGZvciB0aGUgcHJvY2Vzc1xuICAgICAqIEByZXR1cm5zIHJldHVybnMgY2FsbGJhY2sgcmVzcG9uc2UgYXMgUHJvbWlzZVxuICAgICAqL1xuICAgIHN0YXRpYyBzZXRTdGF0dXMoc3RhdHVzOiBYcm0uUHJvY2Vzc0Zsb3cuUHJvY2Vzc1N0YXR1cykge1xuICAgICAgcmV0dXJuIGFzUHJvbWlzZTxYcm0uUHJvY2Vzc0Zsb3cuU2V0UHJvY2Vzc0luc3RhbmNlRGVsZWdhdGU+KFxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5zZXRTdGF0dXMsXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLFxuICAgICAgICBzdGF0dXNcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGNsYXNzIEZpZWxkcyB7XG4gICAgLyoqXG4gICAgICogQWRkcyBhIGhhbmRsZXIgb3IgYW4gYXJyYXkgb2YgaGFuZGxlcnMgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGF0dHJpYnV0ZSdzIHZhbHVlIGlzIGNoYW5nZWQuXG4gICAgICogQHBhcmFtIGZpZWxkcyBBbiBhcnJheSBvZiBmaWVsZHMgdG8gb24gd2hpY2ggdGhpcyBtZXRob2Qgc2hvdWxkIGJlIGFwcGxpZWQuXG4gICAgICogQHBhcmFtIGhhbmRsZXJzIFRoZSBmdW5jdGlvbiByZWZlcmVuY2Ugb3IgYW4gYXJyYXkgb2YgZnVuY3Rpb24gcmVmZXJlbmNlcy5cbiAgICAgKi9cbiAgICBzdGF0aWMgYWRkT25DaGFuZ2UoXG4gICAgICBmaWVsZHM6IENsYXNzLkZpZWxkW10sXG4gICAgICBoYW5kbGVyOiBYcm0uRXZlbnRzLkF0dHJpYnV0ZS5DaGFuZ2VFdmVudEhhbmRsZXJcbiAgICApOiB2b2lkIHtcbiAgICAgIGZpZWxkcy5mb3JFYWNoKChmaWVsZCkgPT4ge1xuICAgICAgICBmaWVsZC5hZGRPbkNoYW5nZShoYW5kbGVyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBGaXJlIGFsbCBcIm9uIGNoYW5nZVwiIGV2ZW50IGhhbmRsZXJzLlxuICAgICAqIEBwYXJhbSBmaWVsZHMgQW4gYXJyYXkgb2YgZmllbGRzIHRvIG9uIHdoaWNoIHRoaXMgbWV0aG9kIHNob3VsZCBiZSBhcHBsaWVkLlxuICAgICAqL1xuICAgIHN0YXRpYyBmaXJlT25DaGFuZ2UoZmllbGRzOiBDbGFzcy5GaWVsZFtdKTogdm9pZCB7XG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgZmllbGQuZmlyZU9uQ2hhbmdlKCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgaGFuZGxlciBmcm9tIHRoZSBcIm9uIGNoYW5nZVwiIGV2ZW50LlxuICAgICAqIEBwYXJhbSBmaWVsZHMgQW4gYXJyYXkgb2YgZmllbGRzIHRvIG9uIHdoaWNoIHRoaXMgbWV0aG9kIHNob3VsZCBiZSBhcHBsaWVkLlxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFRoZSBoYW5kbGVyLlxuICAgICAqL1xuICAgIHN0YXRpYyByZW1vdmVPbkNoYW5nZShcbiAgICAgIGZpZWxkczogQ2xhc3MuRmllbGRbXSxcbiAgICAgIGhhbmRsZXI6IFhybS5FdmVudHMuQXR0cmlidXRlLkNoYW5nZUV2ZW50SGFuZGxlclxuICAgICk6IHZvaWQge1xuICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgIGZpZWxkLnJlbW92ZU9uQ2hhbmdlKGhhbmRsZXIpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHJlcXVpcmVkIGxldmVsLlxuICAgICAqIEBwYXJhbSBmaWVsZHMgQW4gYXJyYXkgb2YgZmllbGRzIHRvIG9uIHdoaWNoIHRoaXMgbWV0aG9kIHNob3VsZCBiZSBhcHBsaWVkLlxuICAgICAqIEBwYXJhbSByZXF1aXJlbWVudExldmVsIFRoZSByZXF1aXJlbWVudCBsZXZlbCwgYXMgZWl0aGVyIFwibm9uZVwiLCBcInJlcXVpcmVkXCIsIG9yIFwicmVjb21tZW5kZWRcIlxuICAgICAqL1xuICAgIHN0YXRpYyBzZXRSZXF1aXJlZExldmVsKFxuICAgICAgZmllbGRzOiBDbGFzcy5GaWVsZFtdLFxuICAgICAgcmVxdWlyZW1lbnRMZXZlbDogWHJtLkF0dHJpYnV0ZXMuUmVxdWlyZW1lbnRMZXZlbFxuICAgICk6IHZvaWQge1xuICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgIGZpZWxkLnNldFJlcXVpcmVkTGV2ZWwocmVxdWlyZW1lbnRMZXZlbCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgc3VibWl0IG1vZGUuXG4gICAgICogQHBhcmFtIGZpZWxkcyBBbiBhcnJheSBvZiBmaWVsZHMgdG8gb24gd2hpY2ggdGhpcyBtZXRob2Qgc2hvdWxkIGJlIGFwcGxpZWQuXG4gICAgICogQHBhcmFtIHN1Ym1pdE1vZGUgVGhlIHN1Ym1pdCBtb2RlLCBhcyBlaXRoZXIgXCJhbHdheXNcIiwgXCJuZXZlclwiLCBvciBcImRpcnR5XCIuXG4gICAgICogQGRlZmF1bHQgc3VibWl0TW9kZSBcImRpcnR5XCJcbiAgICAgKiBAc2VlIHtAbGluayBYcm1FbnVtLkF0dHJpYnV0ZVJlcXVpcmVtZW50TGV2ZWx9XG4gICAgICovXG4gICAgc3RhdGljIHNldFN1Ym1pdE1vZGUoXG4gICAgICBmaWVsZHM6IENsYXNzLkZpZWxkW10sXG4gICAgICBzdWJtaXRNb2RlOiBYcm0uU3VibWl0TW9kZVxuICAgICk6IHZvaWQge1xuICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgIGZpZWxkLnNldFN1Ym1pdE1vZGUoc3VibWl0TW9kZSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgdmFsdWUuXG4gICAgICogQHBhcmFtIGZpZWxkcyBBbiBhcnJheSBvZiBmaWVsZHMgdG8gb24gd2hpY2ggdGhpcyBtZXRob2Qgc2hvdWxkIGJlIGFwcGxpZWQuXG4gICAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZS5cbiAgICAgKiBAcmVtYXJrcyBBdHRyaWJ1dGVzIG9uIFF1aWNrIENyZWF0ZSBGb3JtcyB3aWxsIG5vdCBzYXZlIHZhbHVlcyBzZXQgd2l0aCB0aGlzIG1ldGhvZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgc2V0VmFsdWUoZmllbGRzOiBDbGFzcy5GaWVsZFtdLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgZmllbGQuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgYSB2YWx1ZSBmb3IgYSBjb2x1bW4gdG8gZGV0ZXJtaW5lIHdoZXRoZXIgaXQgaXMgdmFsaWQgb3IgaW52YWxpZCB3aXRoIGEgbWVzc2FnZVxuICAgICAqIEBwYXJhbSBmaWVsZHMgQW4gYXJyYXkgb2YgZmllbGRzIHRvIG9uIHdoaWNoIHRoaXMgbWV0aG9kIHNob3VsZCBiZSBhcHBsaWVkLlxuICAgICAqIEBwYXJhbSBpc1ZhbGlkIFNwZWNpZnkgZmFsc2UgdG8gc2V0IHRoZSBjb2x1bW4gdmFsdWUgdG8gaW52YWxpZCBhbmQgdHJ1ZSB0byBzZXQgdGhlIHZhbHVlIHRvIHZhbGlkLlxuICAgICAqIEBwYXJhbSBtZXNzYWdlIFRoZSBtZXNzYWdlIHRvIGRpc3BsYXkuXG4gICAgICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9sZWFybi5taWNyb3NvZnQuY29tL2VuLXVzL3Bvd2VyLWFwcHMvZGV2ZWxvcGVyL21vZGVsLWRyaXZlbi1hcHBzL2NsaWVudGFwaS9yZWZlcmVuY2UvYXR0cmlidXRlcy9zZXRpc3ZhbGlkIEV4dGVybmFsIExpbms6IHNldElzVmFsaWQgKENsaWVudCBBUEkgcmVmZXJlbmNlKX1cbiAgICAgKi9cbiAgICBzdGF0aWMgc2V0SXNWYWxpZChcbiAgICAgIGZpZWxkczogQ2xhc3MuRmllbGRbXSxcbiAgICAgIGlzVmFsaWQ6IGJvb2xlYW4sXG4gICAgICBtZXNzYWdlPzogc3RyaW5nXG4gICAgKTogdm9pZCB7XG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgZmllbGQuc2V0SXNWYWxpZChpc1ZhbGlkLCBtZXNzYWdlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSByZXF1aXJlZCBsZXZlbC5cbiAgICAgKiBAcGFyYW0gZmllbGRzIEFuIGFycmF5IG9mIGZpZWxkcyB0byBvbiB3aGljaCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgYXBwbGllZC5cbiAgICAgKiBAcGFyYW0gcmVxdWlyZWQgVGhlIHJlcXVpcmVtZW50IGxldmVsLCBhcyBlaXRoZXIgZmFsc2UgZm9yIFwibm9uZVwiIG9yIHRydWUgZm9yIFwicmVxdWlyZWRcIlxuICAgICAqL1xuICAgIHN0YXRpYyBzZXRSZXF1aXJlZChmaWVsZHM6IENsYXNzLkZpZWxkW10sIHJlcXVpcmVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgZmllbGQuc2V0UmVxdWlyZWQocmVxdWlyZWQpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHN0YXRlIG9mIHRoZSBjb250cm9sIHRvIGVpdGhlciBlbmFibGVkLCBvciBkaXNhYmxlZC5cbiAgICAgKiBAcGFyYW0gZmllbGRzIEFuIGFycmF5IG9mIGZpZWxkcyB0byBvbiB3aGljaCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgYXBwbGllZC5cbiAgICAgKiBAcGFyYW0gZGlzYWJsZWQgdHJ1ZSB0byBkaXNhYmxlLCBmYWxzZSB0byBlbmFibGUuXG4gICAgICovXG4gICAgc3RhdGljIHNldERpc2FibGVkKGZpZWxkczogQ2xhc3MuRmllbGRbXSwgZGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgIGZpZWxkcy5mb3JFYWNoKChmaWVsZCkgPT4ge1xuICAgICAgICBmaWVsZC5zZXREaXNhYmxlZChkaXNhYmxlZCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgdmlzaWJpbGl0eSBzdGF0ZS5cbiAgICAgKiBAcGFyYW0gZmllbGRzIEFuIGFycmF5IG9mIGZpZWxkcyB0byBvbiB3aGljaCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgYXBwbGllZC5cbiAgICAgKiBAcGFyYW0gdmlzaWJsZSB0cnVlIHRvIHNob3csIGZhbHNlIHRvIGhpZGUuXG4gICAgICovXG4gICAgc3RhdGljIHNldFZpc2libGUoZmllbGRzOiBDbGFzcy5GaWVsZFtdLCB2aXNpYmxlOiBib29sZWFuKTogdm9pZCB7XG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgZmllbGQuc2V0VmlzaWJsZSh2aXNpYmxlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIGEgY29udHJvbC1sb2NhbCBub3RpZmljYXRpb24gbWVzc2FnZS5cbiAgICAgKiBAcGFyYW0gZmllbGRzIEFuIGFycmF5IG9mIGZpZWxkcyB0byBvbiB3aGljaCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgYXBwbGllZC5cbiAgICAgKiBAcGFyYW0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAgICAgKiBAcGFyYW0gdW5pcXVlSWQgVW5pcXVlIGlkZW50aWZpZXIuXG4gICAgICogQHJldHVybnMgdHJ1ZSBpZiBpdCBzdWNjZWVkcywgZmFsc2UgaWYgaXQgZmFpbHMuXG4gICAgICogQHJlbWFya3MgICAgIFdoZW4gdGhpcyBtZXRob2QgaXMgdXNlZCBvbiBNaWNyb3NvZnQgRHluYW1pY3MgQ1JNIGZvciB0YWJsZXRzIGEgcmVkIFwiWFwiIGljb25cbiAgICAgKiAgICAgICAgICAgICAgYXBwZWFycyBuZXh0IHRvIHRoZSBjb250cm9sLiBUYXBwaW5nIG9uIHRoZSBpY29uIHdpbGwgZGlzcGxheSB0aGUgbWVzc2FnZS5cbiAgICAgKi9cbiAgICBzdGF0aWMgc2V0Tm90aWZpY2F0aW9uKFxuICAgICAgZmllbGRzOiBDbGFzcy5GaWVsZFtdLFxuICAgICAgbWVzc2FnZTogc3RyaW5nLFxuICAgICAgdW5pcXVlSWQ6IHN0cmluZ1xuICAgICk6IHZvaWQge1xuICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgIGZpZWxkLnNldE5vdGlmaWNhdGlvbihtZXNzYWdlLCB1bmlxdWVJZCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGlzcGxheXMgYW4gZXJyb3Igb3IgcmVjb21tZW5kYXRpb24gbm90aWZpY2F0aW9uIGZvciBhIGNvbnRyb2wsIGFuZCBsZXRzIHlvdSBzcGVjaWZ5IGFjdGlvbnMgdG8gZXhlY3V0ZSBiYXNlZCBvbiB0aGUgbm90aWZpY2F0aW9uLlxuICAgICAqIEBwYXJhbSBmaWVsZHMgQW4gYXJyYXkgb2YgZmllbGRzIHRvIG9uIHdoaWNoIHRoaXMgbWV0aG9kIHNob3VsZCBiZSBhcHBsaWVkLlxuICAgICAqL1xuICAgIHN0YXRpYyBhZGROb3RpZmljYXRpb24oXG4gICAgICBmaWVsZHM6IENsYXNzLkZpZWxkW10sXG4gICAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgICBub3RpZmljYXRpb25MZXZlbDogXCJFUlJPUlwiIHwgXCJSRUNPTU1FTkRBVElPTlwiLFxuICAgICAgdW5pcXVlSWQ6IHN0cmluZyxcbiAgICAgIGFjdGlvbnM/OiBYcm0uQ29udHJvbHMuQ29udHJvbE5vdGlmaWNhdGlvbkFjdGlvbltdXG4gICAgKTogdm9pZCB7XG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgZmllbGQuYWRkTm90aWZpY2F0aW9uKG1lc3NhZ2UsIG5vdGlmaWNhdGlvbkxldmVsLCB1bmlxdWVJZCwgYWN0aW9ucyk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2xlYXJzIHRoZSBub3RpZmljYXRpb24gaWRlbnRpZmllZCBieSB1bmlxdWVJZC5cbiAgICAgKiBAcGFyYW0gZmllbGRzIEFuIGFycmF5IG9mIGZpZWxkcyB0byBvbiB3aGljaCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgYXBwbGllZC5cbiAgICAgKiBAcGFyYW0gdW5pcXVlSWQgKE9wdGlvbmFsKSBVbmlxdWUgaWRlbnRpZmllci5cbiAgICAgKiBAcmV0dXJucyB0cnVlIGlmIGl0IHN1Y2NlZWRzLCBmYWxzZSBpZiBpdCBmYWlscy5cbiAgICAgKiBAcmVtYXJrcyBJZiB0aGUgdW5pcXVlSWQgcGFyYW1ldGVyIGlzIG5vdCB1c2VkLCB0aGUgY3VycmVudCBub3RpZmljYXRpb24gc2hvd24gd2lsbCBiZSByZW1vdmVkLlxuICAgICAqL1xuICAgIHN0YXRpYyByZW1vdmVOb3RpZmljYXRpb24oZmllbGRzOiBDbGFzcy5GaWVsZFtdLCB1bmlxdWVJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgZmllbGQucmVtb3ZlTm90aWZpY2F0aW9uKHVuaXF1ZUlkKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXByZXNlbnRzIGEgZm9ybSBpbiBEeW5hbWljcyAzNjUuXG4gICAqL1xuICBleHBvcnQgY2xhc3MgRm9ybSB7XG4gICAgcHJvdGVjdGVkIHN0YXRpYyBfZm9ybUNvbnRleHQ6IFhybS5Gb3JtQ29udGV4dDtcbiAgICBwcm90ZWN0ZWQgc3RhdGljIF9leGVjdXRpb25Db250ZXh0OiBYcm0uRXZlbnRzLkV2ZW50Q29udGV4dDtcbiAgICBjb25zdHJ1Y3RvcigpIHt9XG4gICAgLyoqR2V0cyBhIHJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBmb3JtIGNvbnRleHQqL1xuICAgIHN0YXRpYyBnZXQgZm9ybUNvbnRleHQoKTogWHJtLkZvcm1Db250ZXh0IHtcbiAgICAgIHJldHVybiB0aGlzLl9mb3JtQ29udGV4dDtcbiAgICB9XG4gICAgLyoqR2V0cyBhIHJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBleGVjdXRpbyBjb250ZXh0Ki9cbiAgICBzdGF0aWMgZ2V0IGV4ZWN1dGlvbkNvbnRleHQoKTogWHJtLkV2ZW50cy5FdmVudENvbnRleHQge1xuICAgICAgcmV0dXJuIHRoaXMuX2V4ZWN1dGlvbkNvbnRleHQ7XG4gICAgfVxuICAgIC8qKkdldHMgYSBsb29rdXAgdmFsdWUgdGhhdCByZWZlcmVuY2VzIHRoZSByZWNvcmQuKi9cbiAgICBzdGF0aWMgZ2V0IGVudGl0eVJlZmVyZW5jZSgpIHtcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LmRhdGEuZW50aXR5LmdldEVudGl0eVJlZmVyZW5jZSgpO1xuICAgIH1cbiAgICAvKipTZXRzIGEgcmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IGZvcm0gY29udGV4dCovXG4gICAgc3RhdGljIHNldCBmb3JtQ29udGV4dChjb250ZXh0OiBYcm0uRm9ybUNvbnRleHQgfCBYcm0uRXZlbnRzLkV2ZW50Q29udGV4dCkge1xuICAgICAgaWYgKCFjb250ZXh0KVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFhybUV4LkZvcm0uc2V0Rm9ybUNvbnRleHQ6IFRoZSBleGVjdXRpb25Db250ZXh0IG9yIGZvcm1Db250ZXh0IHdhcyBub3QgcGFzc2VkIHRvIHRoZSBmdW5jdGlvbi5gXG4gICAgICAgICk7XG4gICAgICBpZiAoXCJnZXRGb3JtQ29udGV4dFwiIGluIGNvbnRleHQpIHtcbiAgICAgICAgdGhpcy5fZXhlY3V0aW9uQ29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgIHRoaXMuX2Zvcm1Db250ZXh0ID0gY29udGV4dC5nZXRGb3JtQ29udGV4dCgpO1xuICAgICAgfSBlbHNlIGlmIChcImRhdGFcIiBpbiBjb250ZXh0KSB0aGlzLl9mb3JtQ29udGV4dCA9IGNvbnRleHQ7XG4gICAgICBlbHNlXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgWHJtRXguRm9ybS5zZXRGb3JtQ29udGV4dDogVGhlIHBhc3NlZCBjb250ZXh0IGlzIG5vdCBhbiBleGVjdXRpb25Db250ZXh0IG9yIGZvcm1Db250ZXh0LmBcbiAgICAgICAgKTtcbiAgICB9XG4gICAgLyoqU2V0cyBhIHJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBleGVjdXRpb24gY29udGV4dCovXG4gICAgc3RhdGljIHNldCBleGVjdXRpb25Db250ZXh0KFxuICAgICAgY29udGV4dDogWHJtLkZvcm1Db250ZXh0IHwgWHJtLkV2ZW50cy5FdmVudENvbnRleHRcbiAgICApIHtcbiAgICAgIGlmICghY29udGV4dClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBYcm1FeC5Gb3JtLnNldEV4ZWN1dGlvbkNvbnRleHQ6IFRoZSBleGVjdXRpb25Db250ZXh0IG9yIGZvcm1Db250ZXh0IHdhcyBub3QgcGFzc2VkIHRvIHRoZSBmdW5jdGlvbi5gXG4gICAgICAgICk7XG4gICAgICBpZiAoXCJnZXRGb3JtQ29udGV4dFwiIGluIGNvbnRleHQpIHtcbiAgICAgICAgdGhpcy5fZXhlY3V0aW9uQ29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgIHRoaXMuX2Zvcm1Db250ZXh0ID0gY29udGV4dC5nZXRGb3JtQ29udGV4dCgpO1xuICAgICAgfSBlbHNlIGlmIChcImRhdGFcIiBpbiBjb250ZXh0KSB0aGlzLl9mb3JtQ29udGV4dCA9IGNvbnRleHQ7XG4gICAgICBlbHNlXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgWHJtRXguRm9ybS5zZXRFeGVjdXRpb25Db250ZXh0OiBUaGUgcGFzc2VkIGNvbnRleHQgaXMgbm90IGFuIGV4ZWN1dGlvbkNvbnRleHQgb3IgZm9ybUNvbnRleHQuYFxuICAgICAgICApO1xuICAgIH1cbiAgICAvKipSZXR1cm5zIHRydWUgaWYgZm9ybSBpcyBmcm9tIHR5cGUgY3JlYXRlKi9cbiAgICBzdGF0aWMgZ2V0IElzQ3JlYXRlKCkge1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQudWkuZ2V0Rm9ybVR5cGUoKSA9PSAxO1xuICAgIH1cbiAgICAvKipSZXR1cm5zIHRydWUgaWYgZm9ybSBpcyBmcm9tIHR5cGUgdXBkYXRlKi9cbiAgICBzdGF0aWMgZ2V0IElzVXBkYXRlKCkge1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQudWkuZ2V0Rm9ybVR5cGUoKSA9PSAyO1xuICAgIH1cbiAgICAvKipSZXR1cm5zIHRydWUgaWYgZm9ybSBpcyBub3QgZnJvbSB0eXBlIGNyZWF0ZSovXG4gICAgc3RhdGljIGdldCBJc05vdENyZWF0ZSgpIHtcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LnVpLmdldEZvcm1UeXBlKCkgIT0gMTtcbiAgICB9XG4gICAgLyoqUmV0dXJucyB0cnVlIGlmIGZvcm0gaXMgbm90IGZyb20gdHlwZSB1cGRhdGUqL1xuICAgIHN0YXRpYyBnZXQgSXNOb3RVcGRhdGUoKSB7XG4gICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC51aS5nZXRGb3JtVHlwZSgpICE9IDI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGlzcGxheXMgYSBmb3JtIGxldmVsIG5vdGlmaWNhdGlvbi4gQW55IG51bWJlciBvZiBub3RpZmljYXRpb25zIGNhbiBiZSBkaXNwbGF5ZWQgYW5kIHdpbGwgcmVtYWluIHVudGlsIHJlbW92ZWQgdXNpbmcgY2xlYXJGb3JtTm90aWZpY2F0aW9uLlxuICAgICAqIFRoZSBoZWlnaHQgb2YgdGhlIG5vdGlmaWNhdGlvbiBhcmVhIGlzIGxpbWl0ZWQgc28gZWFjaCBuZXcgbWVzc2FnZSB3aWxsIGJlIGFkZGVkIHRvIHRoZSB0b3AuXG4gICAgICogQHBhcmFtIG1lc3NhZ2UgVGhlIHRleHQgb2YgdGhlIG5vdGlmaWNhdGlvbiBtZXNzYWdlLlxuICAgICAqIEBwYXJhbSBsZXZlbCBUaGUgbGV2ZWwgb2YgdGhlIG5vdGlmaWNhdGlvbiB3aGljaCBkZWZpbmVzIGhvdyB0aGUgbWVzc2FnZSB3aWxsIGJlIGRpc3BsYXllZCwgc3VjaCBhcyB0aGUgaWNvbi5cbiAgICAgKiBFUlJPUjogTm90aWZpY2F0aW9uIHdpbGwgdXNlIHRoZSBzeXN0ZW0gZXJyb3IgaWNvbi5cbiAgICAgKiBXQVJOSU5HOiBOb3RpZmljYXRpb24gd2lsbCB1c2UgdGhlIHN5c3RlbSB3YXJuaW5nIGljb24uXG4gICAgICogSU5GTzogTm90aWZpY2F0aW9uIHdpbGwgdXNlIHRoZSBzeXN0ZW0gaW5mbyBpY29uLlxuICAgICAqIEBwYXJhbSB1bmlxdWVJZCBVbmlxdWUgaWRlbnRpZmllciBmb3IgdGhlIG5vdGlmaWNhdGlvbiB3aGljaCBpcyB1c2VkIHdpdGggY2xlYXJGb3JtTm90aWZpY2F0aW9uIHRvIHJlbW92ZSB0aGUgbm90aWZpY2F0aW9uLlxuICAgICAqIEByZXR1cm5zIHRydWUgaWYgaXQgc3VjY2VlZHMsIG90aGVucHJ3aXNlIGZhbHNlLlxuICAgICAqL1xuICAgIHN0YXRpYyBhZGRGb3JtTm90aWZpY2F0aW9uKFxuICAgICAgbWVzc2FnZTogc3RyaW5nLFxuICAgICAgbGV2ZWw6IFhybS5Gb3JtTm90aWZpY2F0aW9uTGV2ZWwsXG4gICAgICB1bmlxdWVJZDogc3RyaW5nXG4gICAgKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC51aS5zZXRGb3JtTm90aWZpY2F0aW9uKFxuICAgICAgICAgIG1lc3NhZ2UsXG4gICAgICAgICAgbGV2ZWwsXG4gICAgICAgICAgdW5pcXVlSWRcbiAgICAgICAgKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENsZWFycyB0aGUgZm9ybSBub3RpZmljYXRpb24gZGVzY3JpYmVkIGJ5IHVuaXF1ZUlkLlxuICAgICAqIEBwYXJhbSB1bmlxdWVJZCBVbmlxdWUgaWRlbnRpZmllci5cbiAgICAgKiBAcmV0dXJucyBUcnVlIGlmIGl0IHN1Y2NlZWRzLCBvdGhlcndpc2UgZmFsc2UuXG4gICAgICovXG4gICAgc3RhdGljIHJlbW92ZUZvcm1Ob3RpZmljYXRpb24odW5pcXVlSWQ6IHN0cmluZykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQudWkuY2xlYXJGb3JtTm90aWZpY2F0aW9uKHVuaXF1ZUlkKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBoYW5kbGVyIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSByZWNvcmQgaXMgc2F2ZWQuXG4gICAgICovXG4gICAgc3RhdGljIGFkZE9uU2F2ZShcbiAgICAgIGhhbmRsZXJzOlxuICAgICAgICB8IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXJcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyW11cbiAgICApIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShoYW5kbGVycykpIHtcbiAgICAgICAgICBoYW5kbGVycyA9IFtoYW5kbGVyc107XG4gICAgICAgIH1cbiAgICAgICAgaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCcke2hhbmRsZXJ9JyBpcyBub3QgYSBmdW5jdGlvbmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEuZW50aXR5LnJlbW92ZU9uU2F2ZShoYW5kbGVyKTtcbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEuZW50aXR5LmFkZE9uU2F2ZShoYW5kbGVyKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIGFmdGVyIHRoZSBPblNhdmUgaXMgY29tcGxldGUuXG4gICAgICogQHBhcmFtIGhhbmRsZXIgVGhlIGhhbmRsZXIuXG4gICAgICogQHJlbWFya3MgQWRkZWQgaW4gOS4yXG4gICAgICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kb2NzLm1pY3Jvc29mdC5jb20vZW4tdXMvcG93ZXJhcHBzL2RldmVsb3Blci9tb2RlbC1kcml2ZW4tYXBwcy9jbGllbnRhcGkvcmVmZXJlbmNlL2V2ZW50cy9wb3N0c2F2ZSBFeHRlcm5hbCBMaW5rOiBQb3N0U2F2ZSBFdmVudCBEb2N1bWVudGF0aW9ufVxuICAgICAqL1xuICAgIHN0YXRpYyBhZGRPblBvc3RTYXZlKFxuICAgICAgaGFuZGxlcnM6XG4gICAgICAgIHwgWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlclxuICAgICAgICB8IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXJbXVxuICAgICkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGhhbmRsZXJzKSkge1xuICAgICAgICAgIGhhbmRsZXJzID0gW2hhbmRsZXJzXTtcbiAgICAgICAgfVxuICAgICAgICBoYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJyR7aGFuZGxlcn0nIGlzIG5vdCBhIGZ1bmN0aW9uYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5lbnRpdHkucmVtb3ZlT25Qb3N0U2F2ZShoYW5kbGVyKTtcbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEuZW50aXR5LmFkZE9uUG9zdFNhdmUoaGFuZGxlcik7XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIGZvcm0gZGF0YSBpcyBsb2FkZWQuXG4gICAgICogQHBhcmFtIGhhbmRsZXIgVGhlIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIGZvcm0gZGF0YSBsb2Fkcy4gVGhlIGZ1bmN0aW9uIHdpbGwgYmUgYWRkZWQgdG8gdGhlIGJvdHRvbSBvZiB0aGUgZXZlbnQgaGFuZGxlciBwaXBlbGluZS5cbiAgICAgKi9cbiAgICBzdGF0aWMgYWRkT25Mb2FkKFxuICAgICAgaGFuZGxlcnM6XG4gICAgICAgIHwgWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlclxuICAgICAgICB8IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXJbXVxuICAgICkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGhhbmRsZXJzKSkge1xuICAgICAgICAgIGhhbmRsZXJzID0gW2hhbmRsZXJzXTtcbiAgICAgICAgfVxuICAgICAgICBoYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJyR7aGFuZGxlcn0nIGlzIG5vdCBhIGZ1bmN0aW9uYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5yZW1vdmVPbkxvYWQoaGFuZGxlcik7XG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLmFkZE9uTG9hZChoYW5kbGVyKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgaGFuZGxlciB0byBiZSBjYWxsZWQgd2hlbiB0aGUgYXR0cmlidXRlJ3MgdmFsdWUgaXMgY2hhbmdlZC5cbiAgICAgKiBAcGFyYW0gaGFuZGxlciBUaGUgZnVuY3Rpb24gcmVmZXJlbmNlLlxuICAgICAqL1xuICAgIHN0YXRpYyBhZGRPbkNoYW5nZShcbiAgICAgIGZpZWxkczogQ2xhc3MuRmllbGRbXSxcbiAgICAgIGhhbmRsZXJzOlxuICAgICAgICB8IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXJcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyW10sXG4gICAgICBleGVjdXRlPzogYm9vbGVhblxuICAgICkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGhhbmRsZXJzKSkge1xuICAgICAgICAgIGhhbmRsZXJzID0gW2hhbmRsZXJzXTtcbiAgICAgICAgfVxuICAgICAgICBoYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJyR7aGFuZGxlcn0nIGlzIG5vdCBhIGZ1bmN0aW9uYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZpZWxkcy5mb3JFYWNoKChmaWVsZCkgPT4ge1xuICAgICAgICAgICAgZmllbGQucmVtb3ZlT25DaGFuZ2UoaGFuZGxlcik7XG4gICAgICAgICAgICBmaWVsZC5hZGRPbkNoYW5nZShoYW5kbGVyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChleGVjdXRlKSB7XG4gICAgICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgICAgICBmaWVsZC5BdHRyaWJ1dGUuZmlyZU9uQ2hhbmdlKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IG5hbWVzcGFjZSBDbGFzcyB7XG4gICAgLyoqXG4gICAgICogVXNlZCB0byBleGVjdXRlIG1ldGhvZHMgcmVsYXRlZCB0byBhIHNpbmdsZSBBdHRyaWJ1dGVcbiAgICAgKi9cbiAgICBleHBvcnQgY2xhc3MgRmllbGQgaW1wbGVtZW50cyBYcm0uQXR0cmlidXRlcy5BdHRyaWJ1dGUge1xuICAgICAgcHVibGljIHN0YXRpYyBhbGxGaWVsZHM6IEZpZWxkW10gPSBbXTtcblxuICAgICAgcHVibGljIHJlYWRvbmx5IE5hbWUhOiBzdHJpbmc7XG4gICAgICBwcm90ZWN0ZWQgX2F0dHJpYnV0ZT86IFhybS5BdHRyaWJ1dGVzLkF0dHJpYnV0ZTtcblxuICAgICAgY29uc3RydWN0b3IoYXR0cmlidXRlTmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nRmllbGQgPSBGaWVsZC5hbGxGaWVsZHMuZmluZChcbiAgICAgICAgICAoZikgPT4gZi5OYW1lID09PSBhdHRyaWJ1dGVOYW1lXG4gICAgICAgICk7XG4gICAgICAgIGlmIChleGlzdGluZ0ZpZWxkKSB7XG4gICAgICAgICAgcmV0dXJuIGV4aXN0aW5nRmllbGQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5OYW1lID0gYXR0cmlidXRlTmFtZTtcbiAgICAgICAgRmllbGQuYWxsRmllbGRzLnB1c2godGhpcyk7XG4gICAgICB9XG4gICAgICBzZXRWYWx1ZSh2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgICBnZXRBdHRyaWJ1dGVUeXBlKCk6IFhybS5BdHRyaWJ1dGVzLkF0dHJpYnV0ZVR5cGUge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0QXR0cmlidXRlVHlwZSgpO1xuICAgICAgfVxuICAgICAgZ2V0Rm9ybWF0KCk6IFhybS5BdHRyaWJ1dGVzLkF0dHJpYnV0ZUZvcm1hdCB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRGb3JtYXQoKTtcbiAgICAgIH1cbiAgICAgIGdldElzRGlydHkoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRJc0RpcnR5KCk7XG4gICAgICB9XG4gICAgICBnZXROYW1lKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXROYW1lKCk7XG4gICAgICB9XG4gICAgICBnZXRQYXJlbnQoKTogWHJtLkVudGl0eSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRQYXJlbnQoKTtcbiAgICAgIH1cbiAgICAgIGdldFJlcXVpcmVkTGV2ZWwoKTogWHJtLkF0dHJpYnV0ZXMuUmVxdWlyZW1lbnRMZXZlbCB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRSZXF1aXJlZExldmVsKCk7XG4gICAgICB9XG4gICAgICBnZXRTdWJtaXRNb2RlKCk6IFhybS5TdWJtaXRNb2RlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFN1Ym1pdE1vZGUoKTtcbiAgICAgIH1cbiAgICAgIGdldFVzZXJQcml2aWxlZ2UoKTogWHJtLlByaXZpbGVnZSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRVc2VyUHJpdmlsZWdlKCk7XG4gICAgICB9XG4gICAgICByZW1vdmVPbkNoYW5nZShoYW5kbGVyOiBYcm0uRXZlbnRzLkF0dHJpYnV0ZS5DaGFuZ2VFdmVudEhhbmRsZXIpOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLnJlbW92ZU9uQ2hhbmdlKGhhbmRsZXIpO1xuICAgICAgfVxuICAgICAgc2V0U3VibWl0TW9kZShzdWJtaXRNb2RlOiBYcm0uU3VibWl0TW9kZSk6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuc2V0U3VibWl0TW9kZShzdWJtaXRNb2RlKTtcbiAgICAgIH1cbiAgICAgIGdldFZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0VmFsdWUoKTtcbiAgICAgIH1cbiAgICAgIHNldElzVmFsaWQoaXNWYWxpZDogYm9vbGVhbiwgbWVzc2FnZT86IHN0cmluZyk6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuc2V0SXNWYWxpZChpc1ZhbGlkLCBtZXNzYWdlKTtcbiAgICAgIH1cblxuICAgICAgcHVibGljIGdldCBBdHRyaWJ1dGUoKTogWHJtLkF0dHJpYnV0ZXMuQXR0cmlidXRlIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl9hdHRyaWJ1dGUgPz89XG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUodGhpcy5OYW1lKSA/P1xuICAgICAgICAgIFhybUV4LnRocm93RXJyb3IoXG4gICAgICAgICAgICBgVGhlIGF0dHJpYnV0ZSAnJHt0aGlzLk5hbWV9JyB3YXMgbm90IGZvdW5kIG9uIHRoZSBmb3JtLmBcbiAgICAgICAgICApKTtcbiAgICAgIH1cblxuICAgICAgcHVibGljIGdldCBjb250cm9scygpOiBYcm0uQ29sbGVjdGlvbi5JdGVtQ29sbGVjdGlvbjxYcm0uQ29udHJvbHMuU3RhbmRhcmRDb250cm9sPiB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5jb250cm9scztcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBHZXRzIHRoZSB2YWx1ZS5cbiAgICAgICAqIEByZXR1cm5zIFRoZSB2YWx1ZS5cbiAgICAgICAqL1xuICAgICAgcHVibGljIGdldCBWYWx1ZSgpOiBhbnkge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0VmFsdWUoKTtcbiAgICAgIH1cblxuICAgICAgcHVibGljIHNldCBWYWx1ZSh2YWx1ZTogYW55KSB7XG4gICAgICAgIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBTZXRzIGEgY29udHJvbC1sb2NhbCBub3RpZmljYXRpb24gbWVzc2FnZS5cbiAgICAgICAqIEBwYXJhbSBtZXNzYWdlIFRoZSBtZXNzYWdlLlxuICAgICAgICogQHBhcmFtIHVuaXF1ZUlkIFVuaXF1ZSBpZGVudGlmaWVyLlxuICAgICAgICogQHJldHVybnMgdHJ1ZSBpZiBpdCBzdWNjZWVkcywgZmFsc2UgaWYgaXQgZmFpbHMuXG4gICAgICAgKiBAcmVtYXJrcyAgICAgV2hlbiB0aGlzIG1ldGhvZCBpcyB1c2VkIG9uIE1pY3Jvc29mdCBEeW5hbWljcyBDUk0gZm9yIHRhYmxldHMgYSByZWQgXCJYXCIgaWNvblxuICAgICAgICogICAgICAgICAgICAgIGFwcGVhcnMgbmV4dCB0byB0aGUgY29udHJvbC4gVGFwcGluZyBvbiB0aGUgaWNvbiB3aWxsIGRpc3BsYXkgdGhlIG1lc3NhZ2UuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBzZXROb3RpZmljYXRpb24obWVzc2FnZTogc3RyaW5nLCB1bmlxdWVJZDogc3RyaW5nKTogdGhpcyB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCFtZXNzYWdlKSB0aHJvdyBuZXcgRXJyb3IoYG5vIG1lc3NhZ2Ugd2FzIHByb3ZpZGVkLmApO1xuICAgICAgICAgIGlmICghdW5pcXVlSWQpIHRocm93IG5ldyBFcnJvcihgbm8gdW5pcXVlSWQgd2FzIHByb3ZpZGVkLmApO1xuICAgICAgICAgIHRoaXMuY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT5cbiAgICAgICAgICAgIGNvbnRyb2wuc2V0Tm90aWZpY2F0aW9uKG1lc3NhZ2UsIHVuaXF1ZUlkKVxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogU2V0cyB0aGUgdmlzaWJpbGl0eSBzdGF0ZS5cbiAgICAgICAqIEBwYXJhbSB2aXNpYmxlIHRydWUgdG8gc2hvdywgZmFsc2UgdG8gaGlkZS5cbiAgICAgICAqL1xuICAgICAgcHVibGljIHNldFZpc2libGUodmlzaWJsZTogYm9vbGVhbik6IHRoaXMge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMuY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT4gY29udHJvbC5zZXRWaXNpYmxlKHZpc2libGUpKTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBTZXRzIHRoZSBzdGF0ZSBvZiB0aGUgY29udHJvbCB0byBlaXRoZXIgZW5hYmxlZCwgb3IgZGlzYWJsZWQuXG4gICAgICAgKiBAcGFyYW0gZGlzYWJsZWQgdHJ1ZSB0byBkaXNhYmxlLCBmYWxzZSB0byBlbmFibGUuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBzZXREaXNhYmxlZChkaXNhYmxlZDogYm9vbGVhbik6IHRoaXMge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMuY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT4gY29udHJvbC5zZXREaXNhYmxlZChkaXNhYmxlZCkpO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFNldHMgdGhlIHJlcXVpcmVkIGxldmVsLlxuICAgICAgICogQHBhcmFtIHJlcXVpcmVtZW50TGV2ZWwgVGhlIHJlcXVpcmVtZW50IGxldmVsLCBhcyBlaXRoZXIgXCJub25lXCIsIFwicmVxdWlyZWRcIiwgb3IgXCJyZWNvbW1lbmRlZFwiXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBzZXRSZXF1aXJlZExldmVsKFxuICAgICAgICByZXF1aXJlbWVudExldmVsOiBYcm0uQXR0cmlidXRlcy5SZXF1aXJlbWVudExldmVsXG4gICAgICApOiB0aGlzIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLkF0dHJpYnV0ZS5zZXRSZXF1aXJlZExldmVsKHJlcXVpcmVtZW50TGV2ZWwpO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFNldHMgdGhlIHJlcXVpcmVkIGxldmVsLlxuICAgICAgICogQHBhcmFtIHJlcXVpcmVkIFRoZSByZXF1aXJlbWVudCBsZXZlbCwgYXMgZWl0aGVyIGZhbHNlIGZvciBcIm5vbmVcIiBvciB0cnVlIGZvciBcInJlcXVpcmVkXCJcbiAgICAgICAqL1xuICAgICAgcHVibGljIHNldFJlcXVpcmVkKHJlcXVpcmVkOiBib29sZWFuKTogdGhpcyB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5BdHRyaWJ1dGUuc2V0UmVxdWlyZWRMZXZlbChyZXF1aXJlZCA/IFwicmVxdWlyZWRcIiA6IFwibm9uZVwiKTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqRmlyZSBhbGwgXCJvbiBjaGFuZ2VcIiBldmVudCBoYW5kbGVycy4gKi9cbiAgICAgIHB1YmxpYyBmaXJlT25DaGFuZ2UoKTogdGhpcyB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5BdHRyaWJ1dGUuZmlyZU9uQ2hhbmdlKCk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQWRkcyBhIGhhbmRsZXIgb3IgYW4gYXJyYXkgb2YgaGFuZGxlcnMgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGF0dHJpYnV0ZSdzIHZhbHVlIGlzIGNoYW5nZWQuXG4gICAgICAgKiBAcGFyYW0gaGFuZGxlcnMgVGhlIGZ1bmN0aW9uIHJlZmVyZW5jZSBvciBhbiBhcnJheSBvZiBmdW5jdGlvbiByZWZlcmVuY2VzLlxuICAgICAgICovXG4gICAgICBwdWJsaWMgYWRkT25DaGFuZ2UoXG4gICAgICAgIGhhbmRsZXJzOlxuICAgICAgICAgIHwgWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlclxuICAgICAgICAgIHwgWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlcltdXG4gICAgICApOiB0aGlzIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShoYW5kbGVycykpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgaGFuZGxlciBvZiBoYW5kbGVycykge1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgIT09IFwiZnVuY3Rpb25cIilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCcke2hhbmRsZXJ9JyBpcyBub3QgYSBmdW5jdGlvbmApO1xuICAgICAgICAgICAgICB0aGlzLkF0dHJpYnV0ZS5yZW1vdmVPbkNoYW5nZShoYW5kbGVyKTtcbiAgICAgICAgICAgICAgdGhpcy5BdHRyaWJ1dGUuYWRkT25DaGFuZ2UoaGFuZGxlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlcnMgIT09IFwiZnVuY3Rpb25cIilcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAnJHtoYW5kbGVyc30nIGlzIG5vdCBhIGZ1bmN0aW9uYCk7XG4gICAgICAgICAgICB0aGlzLkF0dHJpYnV0ZS5yZW1vdmVPbkNoYW5nZShoYW5kbGVycyk7XG4gICAgICAgICAgICB0aGlzLkF0dHJpYnV0ZS5hZGRPbkNoYW5nZShoYW5kbGVycyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIERpc3BsYXlzIGFuIGVycm9yIG9yIHJlY29tbWVuZGF0aW9uIG5vdGlmaWNhdGlvbiBmb3IgYSBjb250cm9sLCBhbmQgbGV0cyB5b3Ugc3BlY2lmeSBhY3Rpb25zIHRvIGV4ZWN1dGUgYmFzZWQgb24gdGhlIG5vdGlmaWNhdGlvbi5cbiAgICAgICAqL1xuICAgICAgcHVibGljIGFkZE5vdGlmaWNhdGlvbihcbiAgICAgICAgbWVzc2FnZTogc3RyaW5nLFxuICAgICAgICBub3RpZmljYXRpb25MZXZlbDogXCJFUlJPUlwiIHwgXCJSRUNPTU1FTkRBVElPTlwiLFxuICAgICAgICB1bmlxdWVJZDogc3RyaW5nLFxuICAgICAgICBhY3Rpb25zPzogWHJtLkNvbnRyb2xzLkNvbnRyb2xOb3RpZmljYXRpb25BY3Rpb25bXVxuICAgICAgKTogdGhpcyB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCF1bmlxdWVJZCkgdGhyb3cgbmV3IEVycm9yKGBubyB1bmlxdWVJZCB3YXMgcHJvdmlkZWQuYCk7XG4gICAgICAgICAgaWYgKGFjdGlvbnMgJiYgIUFycmF5LmlzQXJyYXkoYWN0aW9ucykpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgIGB0aGUgYWN0aW9uIHBhcmFtZXRlciBpcyBub3QgYW4gYXJyYXkgb2YgQ29udHJvbE5vdGlmaWNhdGlvbkFjdGlvbmBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PiB7XG4gICAgICAgICAgICBjb250cm9sLmFkZE5vdGlmaWNhdGlvbih7XG4gICAgICAgICAgICAgIG1lc3NhZ2VzOiBbbWVzc2FnZV0sXG4gICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkxldmVsOiBub3RpZmljYXRpb25MZXZlbCxcbiAgICAgICAgICAgICAgdW5pcXVlSWQ6IHVuaXF1ZUlkLFxuICAgICAgICAgICAgICBhY3Rpb25zOiBhY3Rpb25zLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvKipcbiAgICAgICAqIENsZWFycyB0aGUgbm90aWZpY2F0aW9uIGlkZW50aWZpZWQgYnkgdW5pcXVlSWQuXG4gICAgICAgKiBAcGFyYW0gdW5pcXVlSWQgKE9wdGlvbmFsKSBVbmlxdWUgaWRlbnRpZmllci5cbiAgICAgICAqIEByZXR1cm5zIHRydWUgaWYgaXQgc3VjY2VlZHMsIGZhbHNlIGlmIGl0IGZhaWxzLlxuICAgICAgICogQHJlbWFya3MgSWYgdGhlIHVuaXF1ZUlkIHBhcmFtZXRlciBpcyBub3QgdXNlZCwgdGhlIGN1cnJlbnQgbm90aWZpY2F0aW9uIHNob3duIHdpbGwgYmUgcmVtb3ZlZC5cbiAgICAgICAqL1xuICAgICAgcmVtb3ZlTm90aWZpY2F0aW9uKHVuaXF1ZUlkOiBzdHJpbmcpOiB0aGlzIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2wpID0+IHtcbiAgICAgICAgICAgIGNvbnRyb2wuY2xlYXJOb3RpZmljYXRpb24odW5pcXVlSWQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBleHBvcnQgY2xhc3MgVGV4dEZpZWxkXG4gICAgICBleHRlbmRzIEZpZWxkXG4gICAgICBpbXBsZW1lbnRzIFhybS5BdHRyaWJ1dGVzLlN0cmluZ0F0dHJpYnV0ZVxuICAgIHtcbiAgICAgIHByb3RlY3RlZCBkZWNsYXJlIF9hdHRyaWJ1dGU6IFhybS5BdHRyaWJ1dGVzLlN0cmluZ0F0dHJpYnV0ZTtcbiAgICAgIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZTogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKGF0dHJpYnV0ZSk7XG4gICAgICB9XG4gICAgICBnZXRNYXhMZW5ndGgoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldE1heExlbmd0aCgpO1xuICAgICAgfVxuICAgICAgZ2V0Rm9ybWF0KCk6IFhybS5BdHRyaWJ1dGVzLlN0cmluZ0F0dHJpYnV0ZUZvcm1hdCB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRGb3JtYXQoKSBhcyBYcm0uQXR0cmlidXRlcy5TdHJpbmdBdHRyaWJ1dGVGb3JtYXQ7XG4gICAgICB9XG4gICAgICBnZXQgQXR0cmlidXRlKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuX2F0dHJpYnV0ZSA/Pz1cbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZSh0aGlzLk5hbWUpID8/XG4gICAgICAgICAgWHJtRXgudGhyb3dFcnJvcihgRmllbGQgJyR7dGhpcy5OYW1lfScgZG9lcyBub3QgZXhpc3RgKSk7XG4gICAgICB9XG4gICAgICBnZXQgY29udHJvbHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5jb250cm9scztcbiAgICAgIH1cbiAgICAgIGdldCBWYWx1ZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0VmFsdWUoKSA/PyBudWxsO1xuICAgICAgfVxuICAgICAgc2V0IFZhbHVlKHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5BdHRyaWJ1dGUuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBleHBvcnQgY2xhc3MgTnVtYmVyRmllbGRcbiAgICAgIGV4dGVuZHMgRmllbGRcbiAgICAgIGltcGxlbWVudHMgWHJtLkF0dHJpYnV0ZXMuTnVtYmVyQXR0cmlidXRlXG4gICAge1xuICAgICAgcHJvdGVjdGVkIGRlY2xhcmUgX2F0dHJpYnV0ZTogWHJtLkF0dHJpYnV0ZXMuTnVtYmVyQXR0cmlidXRlO1xuICAgICAgY29uc3RydWN0b3IoYXR0cmlidXRlOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoYXR0cmlidXRlKTtcbiAgICAgIH1cbiAgICAgIGdldEZvcm1hdCgpOiBYcm0uQXR0cmlidXRlcy5JbnRlZ2VyQXR0cmlidXRlRm9ybWF0IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEZvcm1hdCgpIGFzIFhybS5BdHRyaWJ1dGVzLkludGVnZXJBdHRyaWJ1dGVGb3JtYXQ7XG4gICAgICB9XG4gICAgICBnZXRNYXgoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldE1heCgpO1xuICAgICAgfVxuICAgICAgZ2V0TWluKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRNaW4oKTtcbiAgICAgIH1cbiAgICAgIGdldFByZWNpc2lvbigpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0UHJlY2lzaW9uKCk7XG4gICAgICB9XG4gICAgICBzZXRQcmVjaXNpb24ocHJlY2lzaW9uOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLnNldFByZWNpc2lvbihwcmVjaXNpb24pO1xuICAgICAgfVxuICAgICAgZ2V0IEF0dHJpYnV0ZSgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl9hdHRyaWJ1dGUgPz89XG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUodGhpcy5OYW1lKSA/P1xuICAgICAgICAgIFhybUV4LnRocm93RXJyb3IoYEZpZWxkICcke3RoaXMuTmFtZX0nIGRvZXMgbm90IGV4aXN0YCkpO1xuICAgICAgfVxuICAgICAgZ2V0IGNvbnRyb2xzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuY29udHJvbHM7XG4gICAgICB9XG4gICAgICBnZXQgVmFsdWUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFZhbHVlKCkgPz8gbnVsbDtcbiAgICAgIH1cbiAgICAgIHNldCBWYWx1ZSh2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZXhwb3J0IGNsYXNzIERhdGVGaWVsZFxuICAgICAgZXh0ZW5kcyBGaWVsZFxuICAgICAgaW1wbGVtZW50cyBYcm0uQXR0cmlidXRlcy5EYXRlQXR0cmlidXRlXG4gICAge1xuICAgICAgcHJvdGVjdGVkIGRlY2xhcmUgX2F0dHJpYnV0ZTogWHJtLkF0dHJpYnV0ZXMuRGF0ZUF0dHJpYnV0ZTtcbiAgICAgIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZTogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKGF0dHJpYnV0ZSk7XG4gICAgICB9XG4gICAgICBnZXRGb3JtYXQoKTogWHJtLkF0dHJpYnV0ZXMuRGF0ZUF0dHJpYnV0ZUZvcm1hdCB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRGb3JtYXQoKSBhcyBYcm0uQXR0cmlidXRlcy5EYXRlQXR0cmlidXRlRm9ybWF0O1xuICAgICAgfVxuICAgICAgZ2V0IEF0dHJpYnV0ZSgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl9hdHRyaWJ1dGUgPz89XG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUodGhpcy5OYW1lKSA/P1xuICAgICAgICAgIFhybUV4LnRocm93RXJyb3IoYEZpZWxkICcke3RoaXMuTmFtZX0nIGRvZXMgbm90IGV4aXN0YCkpO1xuICAgICAgfVxuICAgICAgZ2V0IGNvbnRyb2xzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuY29udHJvbHM7XG4gICAgICB9XG4gICAgICBnZXQgVmFsdWUoKTogRGF0ZSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRWYWx1ZSgpID8/IG51bGw7XG4gICAgICB9XG4gICAgICBzZXQgVmFsdWUodmFsdWU6IERhdGUpIHtcbiAgICAgICAgdGhpcy5BdHRyaWJ1dGUuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBleHBvcnQgY2xhc3MgQm9vbGVhbkZpZWxkXG4gICAgICBleHRlbmRzIEZpZWxkXG4gICAgICBpbXBsZW1lbnRzIFhybS5BdHRyaWJ1dGVzLkJvb2xlYW5BdHRyaWJ1dGVcbiAgICB7XG4gICAgICBwcm90ZWN0ZWQgZGVjbGFyZSBfYXR0cmlidXRlOiBYcm0uQXR0cmlidXRlcy5Cb29sZWFuQXR0cmlidXRlO1xuICAgICAgY29uc3RydWN0b3IoYXR0cmlidXRlOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoYXR0cmlidXRlKTtcbiAgICAgIH1cbiAgICAgIGdldEF0dHJpYnV0ZVR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRBdHRyaWJ1dGVUeXBlKCk7XG4gICAgICB9XG4gICAgICBnZXRJbml0aWFsVmFsdWUoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRJbml0aWFsVmFsdWUoKTtcbiAgICAgIH1cbiAgICAgIGdldCBBdHRyaWJ1dGUoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5fYXR0cmlidXRlID8/PVxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKHRoaXMuTmFtZSkgPz9cbiAgICAgICAgICBYcm1FeC50aHJvd0Vycm9yKGBGaWVsZCAnJHt0aGlzLk5hbWV9JyBkb2VzIG5vdCBleGlzdGApKTtcbiAgICAgIH1cbiAgICAgIGdldCBjb250cm9scygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmNvbnRyb2xzO1xuICAgICAgfVxuICAgICAgZ2V0IFZhbHVlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0VmFsdWUoKSA/PyBudWxsO1xuICAgICAgfVxuICAgICAgc2V0IFZhbHVlKHZhbHVlOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZXhwb3J0IGNsYXNzIE11bHRpU2VsZWN0T3B0aW9uU2V0RmllbGQ8T3B0aW9ucyBleHRlbmRzIE9wdGlvblZhbHVlcz5cbiAgICAgIGV4dGVuZHMgRmllbGRcbiAgICAgIGltcGxlbWVudHMgWHJtLkF0dHJpYnV0ZXMuTXVsdGlTZWxlY3RPcHRpb25TZXRBdHRyaWJ1dGVcbiAgICB7XG4gICAgICBwcm90ZWN0ZWQgZGVjbGFyZSBfYXR0cmlidXRlOiBYcm0uQXR0cmlidXRlcy5NdWx0aVNlbGVjdE9wdGlvblNldEF0dHJpYnV0ZTtcbiAgICAgIE9wdGlvbjogT3B0aW9ucztcbiAgICAgIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgb3B0aW9uPzogT3B0aW9ucykge1xuICAgICAgICBzdXBlcihhdHRyaWJ1dGVOYW1lKTtcbiAgICAgICAgdGhpcy5PcHRpb24gPSBvcHRpb247XG4gICAgICB9XG4gICAgICBnZXRGb3JtYXQoKTogWHJtLkF0dHJpYnV0ZXMuT3B0aW9uU2V0QXR0cmlidXRlRm9ybWF0IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEZvcm1hdCgpIGFzIFhybS5BdHRyaWJ1dGVzLk9wdGlvblNldEF0dHJpYnV0ZUZvcm1hdDtcbiAgICAgIH1cbiAgICAgIGdldE9wdGlvbih2YWx1ZTogbnVtYmVyIHwgc3RyaW5nKTogWHJtLk9wdGlvblNldFZhbHVlIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRPcHRpb24odmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRPcHRpb24odmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBnZXRPcHRpb25zKCk6IFhybS5PcHRpb25TZXRWYWx1ZVtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldE9wdGlvbnMoKTtcbiAgICAgIH1cbiAgICAgIGdldFNlbGVjdGVkT3B0aW9uKCk6IFhybS5PcHRpb25TZXRWYWx1ZVtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFNlbGVjdGVkT3B0aW9uKCk7XG4gICAgICB9XG4gICAgICBnZXRUZXh0KCk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFRleHQoKTtcbiAgICAgIH1cbiAgICAgIGdldEluaXRpYWxWYWx1ZSgpOiBudW1iZXJbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRJbml0aWFsVmFsdWUoKTtcbiAgICAgIH1cbiAgICAgIGdldCBBdHRyaWJ1dGUoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5fYXR0cmlidXRlID8/PVxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKHRoaXMuTmFtZSkgPz9cbiAgICAgICAgICBYcm1FeC50aHJvd0Vycm9yKGBGaWVsZCAnJHt0aGlzLk5hbWV9JyBkb2VzIG5vdCBleGlzdGApKTtcbiAgICAgIH1cbiAgICAgIGdldCBjb250cm9scygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmNvbnRyb2xzO1xuICAgICAgfVxuICAgICAgZ2V0IFZhbHVlKCk6IG51bWJlcltdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFZhbHVlKCk7XG4gICAgICB9XG4gICAgICBzZXQgVmFsdWUodmFsdWU6IChrZXlvZiBPcHRpb25zKVtdIHwgbnVtYmVyW10pIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgbGV0IHZhbHVlcyA9IFtdO1xuICAgICAgICAgIHZhbHVlLmZvckVhY2goKHYpID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdiA9PSBcIm51bWJlclwiKSB2YWx1ZXMucHVzaCh2KTtcbiAgICAgICAgICAgIGVsc2UgdmFsdWVzLnB1c2godGhpcy5PcHRpb25bdl0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKHZhbHVlcyk7XG4gICAgICAgIH0gZWxzZSBYcm1FeC50aHJvd0Vycm9yKGBGaWVsZCBWYWx1ZSAnJHt2YWx1ZX0nIGlzIG5vdCBhbiBBcnJheWApO1xuICAgICAgfVxuICAgIH1cbiAgICBleHBvcnQgY2xhc3MgTG9va3VwRmllbGRcbiAgICAgIGV4dGVuZHMgRmllbGRcbiAgICAgIGltcGxlbWVudHMgWHJtLkF0dHJpYnV0ZXMuTG9va3VwQXR0cmlidXRlXG4gICAge1xuICAgICAgcHJvdGVjdGVkIGRlY2xhcmUgX2F0dHJpYnV0ZTogWHJtLkF0dHJpYnV0ZXMuTG9va3VwQXR0cmlidXRlO1xuICAgICAgcHJvdGVjdGVkIF9jdXN0b21GaWx0ZXJzOiBhbnkgPSBbXTtcbiAgICAgIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZTogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKGF0dHJpYnV0ZSk7XG4gICAgICB9XG4gICAgICBnZXRJc1BhcnR5TGlzdCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldElzUGFydHlMaXN0KCk7XG4gICAgICB9XG4gICAgICBnZXQgQXR0cmlidXRlKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuX2F0dHJpYnV0ZSA/Pz1cbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZSh0aGlzLk5hbWUpID8/XG4gICAgICAgICAgWHJtRXgudGhyb3dFcnJvcihgRmllbGQgJyR7dGhpcy5OYW1lfScgZG9lcyBub3QgZXhpc3RgKSk7XG4gICAgICB9XG4gICAgICBnZXQgY29udHJvbHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5jb250cm9scztcbiAgICAgIH1cbiAgICAgIC8qKkdldHMgdGhlIGlkIG9mIHRoZSBmaXJzdCBsb29rdXAgdmFsdWUqL1xuICAgICAgZ2V0IElkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5WYWx1ZSAmJiB0aGlzLlZhbHVlLmxlbmd0aCA+IDBcbiAgICAgICAgICA/IFhybUV4Lm5vcm1hbGl6ZUd1aWQodGhpcy5WYWx1ZVswXS5pZClcbiAgICAgICAgICA6IG51bGw7XG4gICAgICB9XG4gICAgICAvKipHZXRzIHRoZSBlbnRpdHlUeXBlIG9mIHRoZSBmaXJzdCBsb29rdXAgdmFsdWUqL1xuICAgICAgZ2V0IEVudGl0eVR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLlZhbHVlICYmIHRoaXMuVmFsdWUubGVuZ3RoID4gMFxuICAgICAgICAgID8gdGhpcy5WYWx1ZVswXS5lbnRpdHlUeXBlXG4gICAgICAgICAgOiBudWxsO1xuICAgICAgfVxuICAgICAgLyoqR2V0cyB0aGUgZm9ybWF0dGVkIHZhbHVlIG9mIHRoZSBmaXJzdCBsb29rdXAgdmFsdWUqL1xuICAgICAgZ2V0IEZvcm1hdHRlZFZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5WYWx1ZSAmJiB0aGlzLlZhbHVlLmxlbmd0aCA+IDAgPyB0aGlzLlZhbHVlWzBdLm5hbWUgOiBudWxsO1xuICAgICAgfVxuICAgICAgZ2V0IFZhbHVlKCk6IFhybS5Mb29rdXBWYWx1ZVtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFZhbHVlKCkgPz8gbnVsbDtcbiAgICAgIH1cbiAgICAgIHNldCBWYWx1ZSh2YWx1ZTogWHJtLkxvb2t1cFZhbHVlW10pIHtcbiAgICAgICAgdGhpcy5BdHRyaWJ1dGUuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgfVxuICAgICAgLyoqXG4gICAgICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiBhIGxvb2t1cFxuICAgICAgICogQHBhcmFtIGlkIEd1aWQgb2YgdGhlIHJlY29yZFxuICAgICAgICogQHBhcmFtIGVudGl0eVR5cGUgbG9naWNhbG5hbWUgb2YgdGhlIGVudGl0eVxuICAgICAgICogQHBhcmFtIG5hbWUgZm9ybWF0dGVkIHZhbHVlXG4gICAgICAgKiBAcGFyYW0gYXBwZW5kIGlmIHRydWUsIGFkZHMgdmFsdWUgdG8gdGhlIGFycmF5IGluc3RlYWQgb2YgcmVwbGFjaW5nIGl0XG4gICAgICAgKi9cbiAgICAgIHNldExvb2t1cFZhbHVlKFxuICAgICAgICBpZDogc3RyaW5nLFxuICAgICAgICBlbnRpdHlUeXBlOiBhbnksXG4gICAgICAgIG5hbWU6IGFueSxcbiAgICAgICAgYXBwZW5kID0gZmFsc2VcbiAgICAgICk6IHRoaXMge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghaWQpIHRocm93IG5ldyBFcnJvcihgbm8gaWQgcGFyYW1ldGVyIHdhcyBwcm92aWRlZC5gKTtcbiAgICAgICAgICBpZiAoIWVudGl0eVR5cGUpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYG5vIGVudGl0eVR5cGUgcGFyYW1ldGVyIHdhcyBwcm92aWRlZC5gKTtcbiAgICAgICAgICBpZCA9IFhybUV4Lm5vcm1hbGl6ZUd1aWQoaWQpO1xuICAgICAgICAgIGNvbnN0IGxvb2t1cFZhbHVlID0ge1xuICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICBlbnRpdHlUeXBlLFxuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICB9O1xuICAgICAgICAgIHRoaXMuVmFsdWUgPVxuICAgICAgICAgICAgYXBwZW5kICYmIHRoaXMuVmFsdWVcbiAgICAgICAgICAgICAgPyB0aGlzLlZhbHVlLmNvbmNhdChsb29rdXBWYWx1ZSlcbiAgICAgICAgICAgICAgOiBbbG9va3VwVmFsdWVdO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLyoqXG4gICAgICAgKiBTZXRzIGEgbG9va3VwIHdpdGggYSBsb29rdXAgZnJvbSB0aGUgcmV0cmlldmVkIHJlY29yZC5cbiAgICAgICAqIEBwYXJhbSBzZWxlY3ROYW1lXG4gICAgICAgKiBAcGFyYW0gcmV0cmlldmVkUmVjb3JkXG4gICAgICAgKiBAZXhhbXBsZVxuICAgICAgICogdmFyIGNvbnRhY3QgPSBhd2FpdCBmaWVsZHMuQ29udGFjdC5yZXRyaWV2ZSgnPyRzZWxlY3Q9X3BhcmVudGN1c3RvbWVyaWRfdmFsdWUnKTtcbiAgICAgICAqIGZpZWxkcy5BY2NvdW50LnNldExvb2t1cEZyb21SZXRyaWV2ZSgnX3BhcmVudGN1c3RvbWVyaWRfdmFsdWUnLCBjb250YWN0KTtcbiAgICAgICAqIC8vQWx0ZXJuYXRlXG4gICAgICAgKiBmaWVsZHMuQWNjb3VudC5zZXRMb29rdXBGcm9tUmV0cmlldmUoJ3BhcmVudGN1c3RvbWVyaWQnLCBjb250YWN0KTtcbiAgICAgICAqL1xuICAgICAgc2V0TG9va3VwRnJvbVJldHJpZXZlKFxuICAgICAgICBzZWxlY3ROYW1lOiBzdHJpbmcsXG4gICAgICAgIHJldHJpZXZlZFJlY29yZDogeyBbeDogc3RyaW5nXTogYW55IH1cbiAgICAgICkge1xuICAgICAgICBpZiAoIXNlbGVjdE5hbWUuZW5kc1dpdGgoXCJfdmFsdWVcIikpIHNlbGVjdE5hbWUgPSBgXyR7c2VsZWN0TmFtZX1fdmFsdWVgO1xuICAgICAgICBpZiAoIXJldHJpZXZlZFJlY29yZCB8fCAhcmV0cmlldmVkUmVjb3JkW2Ake3NlbGVjdE5hbWV9YF0pIHtcbiAgICAgICAgICB0aGlzLlZhbHVlID0gbnVsbDtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5WYWx1ZSA9IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBpZDogcmV0cmlldmVkUmVjb3JkW2Ake3NlbGVjdE5hbWV9YF0sXG4gICAgICAgICAgICBlbnRpdHlUeXBlOlxuICAgICAgICAgICAgICByZXRyaWV2ZWRSZWNvcmRbXG4gICAgICAgICAgICAgICAgYCR7c2VsZWN0TmFtZX1ATWljcm9zb2Z0LkR5bmFtaWNzLkNSTS5sb29rdXBsb2dpY2FsbmFtZWBcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5hbWU6IHJldHJpZXZlZFJlY29yZFtcbiAgICAgICAgICAgICAgYCR7c2VsZWN0TmFtZX1AT0RhdGEuQ29tbXVuaXR5LkRpc3BsYXkuVjEuRm9ybWF0dGVkVmFsdWVgXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgIF07XG4gICAgICB9XG4gICAgICAvKipcbiAgICAgICAqIFJldHJpZXZlcyBhbiBlbnRpdHkgcmVjb3JkLlxuICAgICAgICogQHBhcmFtIG9wdGlvbnMgKE9wdGlvbmFsKSBPRGF0YSBzeXN0ZW0gcXVlcnkgb3B0aW9ucywgJHNlbGVjdCBhbmQgJGV4cGFuZCwgdG8gcmV0cmlldmUgeW91ciBkYXRhLlxuICAgICAgICogLSBVc2UgdGhlICRzZWxlY3Qgc3lzdGVtIHF1ZXJ5IG9wdGlvbiB0byBsaW1pdCB0aGUgcHJvcGVydGllcyByZXR1cm5lZCBieSBpbmNsdWRpbmcgYSBjb21tYS1zZXBhcmF0ZWRcbiAgICAgICAqICAgbGlzdCBvZiBwcm9wZXJ0eSBuYW1lcy4gVGhpcyBpcyBhbiBpbXBvcnRhbnQgcGVyZm9ybWFuY2UgYmVzdCBwcmFjdGljZS4gSWYgcHJvcGVydGllcyBhcmVu4oCZdFxuICAgICAgICogICBzcGVjaWZpZWQgdXNpbmcgJHNlbGVjdCwgYWxsIHByb3BlcnRpZXMgd2lsbCBiZSByZXR1cm5lZC5cbiAgICAgICAqIC0gVXNlIHRoZSAkZXhwYW5kIHN5c3RlbSBxdWVyeSBvcHRpb24gdG8gY29udHJvbCB3aGF0IGRhdGEgZnJvbSByZWxhdGVkIGVudGl0aWVzIGlzIHJldHVybmVkLiBJZiB5b3VcbiAgICAgICAqICAganVzdCBpbmNsdWRlIHRoZSBuYW1lIG9mIHRoZSBuYXZpZ2F0aW9uIHByb3BlcnR5LCB5b3XigJlsbCByZWNlaXZlIGFsbCB0aGUgcHJvcGVydGllcyBmb3IgcmVsYXRlZFxuICAgICAgICogICByZWNvcmRzLiBZb3UgY2FuIGxpbWl0IHRoZSBwcm9wZXJ0aWVzIHJldHVybmVkIGZvciByZWxhdGVkIHJlY29yZHMgdXNpbmcgdGhlICRzZWxlY3Qgc3lzdGVtIHF1ZXJ5XG4gICAgICAgKiAgIG9wdGlvbiBpbiBwYXJlbnRoZXNlcyBhZnRlciB0aGUgbmF2aWdhdGlvbiBwcm9wZXJ0eSBuYW1lLiBVc2UgdGhpcyBmb3IgYm90aCBzaW5nbGUtdmFsdWVkIGFuZFxuICAgICAgICogICBjb2xsZWN0aW9uLXZhbHVlZCBuYXZpZ2F0aW9uIHByb3BlcnRpZXMuXG4gICAgICAgKiAtIFlvdSBjYW4gYWxzbyBzcGVjaWZ5IG11bHRpcGxlIHF1ZXJ5IG9wdGlvbnMgYnkgdXNpbmcgJiB0byBzZXBhcmF0ZSB0aGUgcXVlcnkgb3B0aW9ucy5cbiAgICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPm9wdGlvbnMgZXhhbXBsZTo8L2NhcHRpb24+XG4gICAgICAgKiBvcHRpb25zOiAkc2VsZWN0PW5hbWUmJGV4cGFuZD1wcmltYXJ5Y29udGFjdGlkKCRzZWxlY3Q9Y29udGFjdGlkLGZ1bGxuYW1lKVxuICAgICAgICogQHJldHVybnMgT24gc3VjY2VzcywgcmV0dXJucyBhIHByb21pc2UgY29udGFpbmluZyBhIEpTT04gb2JqZWN0IHdpdGggdGhlIHJldHJpZXZlZCBhdHRyaWJ1dGVzIGFuZCB0aGVpciB2YWx1ZXMuXG4gICAgICAgKiBAc2VlIHtAbGluayBodHRwczovL2RvY3MubWljcm9zb2Z0LmNvbS9lbi11cy9keW5hbWljczM2NS9jdXN0b21lci1lbmdhZ2VtZW50L2RldmVsb3Blci9jbGllbnRhcGkvcmVmZXJlbmNlL3hybS13ZWJhcGkvcmV0cmlldmVyZWNvcmQgRXh0ZXJuYWwgTGluazogcmV0cmlldmVSZWNvcmQgKENsaWVudCBBUEkgcmVmZXJlbmNlKX1cbiAgICAgICAqL1xuICAgICAgYXN5bmMgcmV0cmlldmUob3B0aW9uczogc3RyaW5nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCF0aGlzLklkIHx8ICF0aGlzLkVudGl0eVR5cGUpIHJldHVybiBudWxsO1xuICAgICAgICAgIGNvbnN0IHJlY29yZCA9IGF3YWl0IFhybS5XZWJBcGkucmV0cmlldmVSZWNvcmQoXG4gICAgICAgICAgICB0aGlzLkVudGl0eVR5cGUsXG4gICAgICAgICAgICB0aGlzLklkLFxuICAgICAgICAgICAgb3B0aW9uc1xuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIHJlY29yZDtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICogQWRkcyBhbiBhZGRpdGlvbmFsIGN1c3RvbSBmaWx0ZXIgdG8gdGhlIGxvb2t1cCwgd2l0aCB0aGUgXCJBTkRcIiBmaWx0ZXIgb3BlcmF0b3IuXG4gICAgICAgKiBAcGFyYW0gZmlsdGVyIFNwZWNpZmllcyB0aGUgZmlsdGVyLCBhcyBhIHNlcmlhbGl6ZWQgRmV0Y2hYTUwgXCJmaWx0ZXJcIiBub2RlLlxuICAgICAgICogQHBhcmFtIGVudGl0eUxvZ2ljYWxOYW1lIChPcHRpb25hbCkgVGhlIGxvZ2ljYWwgbmFtZSBvZiB0aGUgZW50aXR5LlxuICAgICAgICogQHJlbWFya3MgICAgIElmIGVudGl0eUxvZ2ljYWxOYW1lIGlzIG5vdCBzcGVjaWZpZWQsIHRoZSBmaWx0ZXIgd2lsbCBiZSBhcHBsaWVkIHRvIGFsbCBlbnRpdGllc1xuICAgICAgICogICAgICAgICAgICAgIHZhbGlkIGZvciB0aGUgTG9va3VwIGNvbnRyb2wuXG4gICAgICAgKiBAZXhhbXBsZSAgICAgRXhhbXBsZSBmaWx0ZXI6IDxmaWx0ZXIgdHlwZT1cImFuZFwiPlxuICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cImFkZHJlc3MxX2NpdHlcIiBvcGVyYXRvcj1cImVxXCIgdmFsdWU9XCJSZWRtb25kXCIgLz5cbiAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9maWx0ZXI+XG4gICAgICAgKi9cbiAgICAgIGFkZFByZUZpbHRlclRvTG9va3VwKFxuICAgICAgICBmaWx0ZXJYbWw6IHN0cmluZyxcbiAgICAgICAgZW50aXR5TG9naWNhbE5hbWU/OiBzdHJpbmdcbiAgICAgICk6IHRoaXMge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIF9hZGRDdXN0b21GaWx0ZXIuY29udHJvbHMgPSB0aGlzLmNvbnRyb2xzO1xuICAgICAgICAgIHRoaXMuY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT4ge1xuICAgICAgICAgICAgY29udHJvbC5hZGRQcmVTZWFyY2goX2FkZEN1c3RvbUZpbHRlcik7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5fY3VzdG9tRmlsdGVycy5wdXNoKF9hZGRDdXN0b21GaWx0ZXIpO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIF9hZGRDdXN0b21GaWx0ZXIoKSB7XG4gICAgICAgICAgX2FkZEN1c3RvbUZpbHRlci5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PiB7XG4gICAgICAgICAgICBjb250cm9sLmFkZEN1c3RvbUZpbHRlcihmaWx0ZXJYbWwsIGVudGl0eUxvZ2ljYWxOYW1lKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLyoqXG4gICAgICAgKiBBZGRzIGFuIGFkZGl0aW9uYWwgY3VzdG9tIGZpbHRlciB0byB0aGUgbG9va3VwLCB3aXRoIHRoZSBcIkFORFwiIGZpbHRlciBvcGVyYXRvci5cbiAgICAgICAqIEBwYXJhbSBlbnRpdHlMb2dpY2FsTmFtZSAoT3B0aW9uYWwpIFRoZSBsb2dpY2FsIG5hbWUgb2YgdGhlIGVudGl0eS5cbiAgICAgICAqIEBwYXJhbSBwcmltYXJ5QXR0cmlidXRlSWROYW1lIChPcHRpb25hbCkgVGhlIGxvZ2ljYWwgbmFtZSBvZiB0aGUgcHJpbWFyeSBrZXkuXG4gICAgICAgKiBAcGFyYW0gZmV0Y2hYbWwgU3BlY2lmaWVzIHRoZSBGZXRjaFhNTCB1c2VkIHRvIGZpbHRlci5cbiAgICAgICAqIEByZW1hcmtzICAgICBJZiBlbnRpdHlMb2dpY2FsTmFtZSBpcyBub3Qgc3BlY2lmaWVkLCB0aGUgZmlsdGVyIHdpbGwgYmUgYXBwbGllZCB0byBhbGwgZW50aXRpZXNcbiAgICAgICAqICAgICAgICAgICAgICB2YWxpZCBmb3IgdGhlIExvb2t1cCBjb250cm9sLlxuICAgICAgICogQGV4YW1wbGUgICAgIEV4YW1wbGUgZmV0Y2hYbWw6IDxmZXRjaD5cbiAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGVudGl0eSBuYW1lPVwiY29udGFjdFwiPlxuICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGZpbHRlcj5cbiAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwiYWRkcmVzczFfY2l0eVwiIG9wZXJhdG9yPVwiZXFcIiB2YWx1ZT1cIlJlZG1vbmRcIiAvPlxuICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9maWx0ZXI+XG4gICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZW50aXR5PlxuICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2ZldGNoPlxuICAgICAgICovXG4gICAgICBhc3luYyBhZGRQcmVGaWx0ZXJUb0xvb2t1cEFkdmFuY2VkKFxuICAgICAgICBlbnRpdHlMb2dpY2FsTmFtZTogc3RyaW5nLFxuICAgICAgICBwcmltYXJ5QXR0cmlidXRlSWROYW1lOiBzdHJpbmcsXG4gICAgICAgIGZldGNoWG1sOiBzdHJpbmdcbiAgICAgICk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IFhybS5XZWJBcGkub25saW5lLnJldHJpZXZlTXVsdGlwbGVSZWNvcmRzKFxuICAgICAgICAgICAgZW50aXR5TG9naWNhbE5hbWUsXG4gICAgICAgICAgICBcIj9mZXRjaFhtbD1cIiArIGZldGNoWG1sXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25zdCBkYXRhID0gcmVzdWx0LmVudGl0aWVzO1xuICAgICAgICAgIGxldCBmaWx0ZXJlZEVudGl0aWVzID0gXCJcIjtcbiAgICAgICAgICBfYWRkQ3VzdG9tRmlsdGVyLmNvbnRyb2xzID0gdGhpcy5jb250cm9scztcbiAgICAgICAgICBkYXRhLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAgIGZpbHRlcmVkRW50aXRpZXMgKz0gYDx2YWx1ZT4ke2l0ZW1bcHJpbWFyeUF0dHJpYnV0ZUlkTmFtZV19PC92YWx1ZT5gO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGZldGNoWG1sID0gZmlsdGVyZWRFbnRpdGllc1xuICAgICAgICAgICAgPyBgPGZpbHRlcj48Y29uZGl0aW9uIGF0dHJpYnV0ZT0nJHtwcmltYXJ5QXR0cmlidXRlSWROYW1lfScgb3BlcmF0b3I9J2luJz4ke2ZpbHRlcmVkRW50aXRpZXN9PC9jb25kaXRpb24+PC9maWx0ZXI+YFxuICAgICAgICAgICAgOiBgPGZpbHRlcj48Y29uZGl0aW9uIGF0dHJpYnV0ZT0nJHtwcmltYXJ5QXR0cmlidXRlSWROYW1lfScgb3BlcmF0b3I9J251bGwnLz48L2ZpbHRlcj5gO1xuICAgICAgICAgIHRoaXMuY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT4ge1xuICAgICAgICAgICAgY29udHJvbC5hZGRQcmVTZWFyY2goX2FkZEN1c3RvbUZpbHRlcik7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5fY3VzdG9tRmlsdGVycy5wdXNoKF9hZGRDdXN0b21GaWx0ZXIpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBfYWRkQ3VzdG9tRmlsdGVyKCkge1xuICAgICAgICAgIF9hZGRDdXN0b21GaWx0ZXIuY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT4ge1xuICAgICAgICAgICAgY29udHJvbC5hZGRDdXN0b21GaWx0ZXIoZmV0Y2hYbWwsIGVudGl0eUxvZ2ljYWxOYW1lKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLyoqXG4gICAgICAgKiBSZW1vdmVzIGFsbCBmaWx0ZXJzIHNldCBvbiB0aGUgY3VycmVudCBsb29rdXAgYXR0cmlidXRlIGJ5IHVzaW5nIGFkZFByZUZpbHRlclRvTG9va3VwIG9yIGFkZFByZUZpbHRlclRvTG9va3VwQWR2YW5jZWRcbiAgICAgICAqL1xuICAgICAgY2xlYXJQcmVGaWx0ZXJGcm9tTG9va3VwKCk6IHRoaXMge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMuX2N1c3RvbUZpbHRlcnMuZm9yRWFjaChcbiAgICAgICAgICAgIChjdXN0b21GaWx0ZXI6IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXIpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PiB7XG4gICAgICAgICAgICAgICAgY29udHJvbC5yZW1vdmVQcmVTZWFyY2goY3VzdG9tRmlsdGVyKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdHlwZSBPcHRpb25WYWx1ZXMgPSB7XG4gICAgICBba2V5OiBzdHJpbmddOiBudW1iZXI7XG4gICAgfTtcbiAgICBleHBvcnQgY2xhc3MgT3B0aW9uc2V0RmllbGQ8T3B0aW9ucyBleHRlbmRzIE9wdGlvblZhbHVlcz5cbiAgICAgIGV4dGVuZHMgRmllbGRcbiAgICAgIGltcGxlbWVudHMgWHJtLkF0dHJpYnV0ZXMuT3B0aW9uU2V0QXR0cmlidXRlXG4gICAge1xuICAgICAgcHJvdGVjdGVkIGRlY2xhcmUgX2F0dHJpYnV0ZTogWHJtLkF0dHJpYnV0ZXMuT3B0aW9uU2V0QXR0cmlidXRlO1xuICAgICAgcHJvdGVjdGVkIF9jb250cm9sITogWHJtLkNvbnRyb2xzLk9wdGlvblNldENvbnRyb2w7XG4gICAgICBPcHRpb246IE9wdGlvbnM7XG4gICAgICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsIG9wdGlvbj86IE9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIoYXR0cmlidXRlTmFtZSk7XG4gICAgICAgIHRoaXMuT3B0aW9uID0gb3B0aW9uO1xuICAgICAgfVxuICAgICAgZ2V0Rm9ybWF0KCk6IFhybS5BdHRyaWJ1dGVzLk9wdGlvblNldEF0dHJpYnV0ZUZvcm1hdCB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRGb3JtYXQoKSBhcyBYcm0uQXR0cmlidXRlcy5PcHRpb25TZXRBdHRyaWJ1dGVGb3JtYXQ7XG4gICAgICB9XG4gICAgICBnZXRPcHRpb24odmFsdWU6IG51bWJlciB8IHN0cmluZyk6IFhybS5PcHRpb25TZXRWYWx1ZSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0T3B0aW9uKHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0T3B0aW9uKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZ2V0T3B0aW9ucygpOiBYcm0uT3B0aW9uU2V0VmFsdWVbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRPcHRpb25zKCk7XG4gICAgICB9XG4gICAgICBnZXRTZWxlY3RlZE9wdGlvbigpOiBYcm0uT3B0aW9uU2V0VmFsdWUge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0U2VsZWN0ZWRPcHRpb24oKTtcbiAgICAgIH1cbiAgICAgIGdldFRleHQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFRleHQoKTtcbiAgICAgIH1cbiAgICAgIGdldEluaXRpYWxWYWx1ZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0SW5pdGlhbFZhbHVlKCk7XG4gICAgICB9XG4gICAgICBnZXQgQXR0cmlidXRlKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuX2F0dHJpYnV0ZSA/Pz1cbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZSh0aGlzLk5hbWUpID8/XG4gICAgICAgICAgWHJtRXgudGhyb3dFcnJvcihgRmllbGQgJyR7dGhpcy5OYW1lfScgZG9lcyBub3QgZXhpc3RgKSk7XG4gICAgICB9XG4gICAgICBnZXQgY29udHJvbHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5jb250cm9scztcbiAgICAgIH1cbiAgICAgIGdldCBjb250cm9sKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuX2NvbnRyb2wgPz89XG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5nZXRDb250cm9sKHRoaXMuTmFtZSkgPz9cbiAgICAgICAgICBYcm1FeC50aHJvd0Vycm9yKGBDb250cm9sICcke3RoaXMuTmFtZX0nIGRvZXMgbm90IGV4aXN0YCkpO1xuICAgICAgfVxuICAgICAgZ2V0IFZhbHVlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRWYWx1ZSgpO1xuICAgICAgfVxuICAgICAgc2V0IFZhbHVlKHZhbHVlOiBrZXlvZiBPcHRpb25zIHwgbnVtYmVyKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gXCJudW1iZXJcIikgdGhpcy5BdHRyaWJ1dGUuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgICBlbHNlIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKHRoaXMuT3B0aW9uW3ZhbHVlXSk7XG4gICAgICB9XG4gICAgICAvKipcbiAgICAgICAqIEFkZHMgYW4gb3B0aW9uLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB2YWx1ZXMgYW4gYXJyYXkgd2l0aCB0aGUgb3B0aW9uIHZhbHVlcyB0byBhZGRcbiAgICAgICAqIEBwYXJhbSBpbmRleCAoT3B0aW9uYWwpIHplcm8tYmFzZWQgaW5kZXggb2YgdGhlIG9wdGlvbi5cbiAgICAgICAqXG4gICAgICAgKiBAcmVtYXJrcyBUaGlzIG1ldGhvZCBkb2VzIG5vdCBjaGVjayB0aGF0IHRoZSB2YWx1ZXMgd2l0aGluIHRoZSBvcHRpb25zIHlvdSBhZGQgYXJlIHZhbGlkLlxuICAgICAgICogICAgICAgICAgSWYgaW5kZXggaXMgbm90IHByb3ZpZGVkLCB0aGUgbmV3IG9wdGlvbiB3aWxsIGJlIGFkZGVkIHRvIHRoZSBlbmQgb2YgdGhlIGxpc3QuXG4gICAgICAgKi9cbiAgICAgIGFkZE9wdGlvbih2YWx1ZXM6IG51bWJlcltdLCBpbmRleD86IG51bWJlcik6IHRoaXMge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZXMpKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB2YWx1ZXMgaXMgbm90IGFuIEFycmF5OlxcbnZhbHVlczogJyR7dmFsdWVzfSdgKTtcbiAgICAgICAgICBjb25zdCBvcHRpb25TZXRWYWx1ZXMgPVxuICAgICAgICAgICAgdGhpcy5jb250cm9sLmdldEF0dHJpYnV0ZSgpLmdldE9wdGlvbnMoKSA/PyBbXTtcbiAgICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2Ygb3B0aW9uU2V0VmFsdWVzKSB7XG4gICAgICAgICAgICBpZiAodmFsdWVzLmluY2x1ZGVzKGVsZW1lbnQudmFsdWUpKSB7XG4gICAgICAgICAgICAgIHRoaXMuY29udHJvbC5hZGRPcHRpb24oZWxlbWVudCwgaW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICogUmVtb3ZlcyB0aGUgb3B0aW9uIG1hdGNoaW5nIHRoZSB2YWx1ZS5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlLlxuICAgICAgICovXG4gICAgICByZW1vdmVPcHRpb24odmFsdWVzOiBudW1iZXJbXSk6IHRoaXMge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZXMpKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB2YWx1ZXMgaXMgbm90IGFuIEFycmF5OlxcbnZhbHVlczogJyR7dmFsdWVzfSdgKTtcbiAgICAgICAgICBjb25zdCBvcHRpb25TZXRWYWx1ZXMgPVxuICAgICAgICAgICAgdGhpcy5jb250cm9sLmdldEF0dHJpYnV0ZSgpLmdldE9wdGlvbnMoKSA/PyBbXTtcbiAgICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2Ygb3B0aW9uU2V0VmFsdWVzKSB7XG4gICAgICAgICAgICBpZiAodmFsdWVzLmluY2x1ZGVzKGVsZW1lbnQudmFsdWUpKSB7XG4gICAgICAgICAgICAgIHRoaXMuY29udHJvbC5yZW1vdmVPcHRpb24oZWxlbWVudC52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLyoqXG4gICAgICAgKiBDbGVhcnMgYWxsIG9wdGlvbnMuXG4gICAgICAgKi9cbiAgICAgIGNsZWFyT3B0aW9ucygpOiB0aGlzIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLmNvbnRyb2wuY2xlYXJPcHRpb25zKCk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGV4cG9ydCBjbGFzcyBTZWN0aW9uIGltcGxlbWVudHMgWHJtLkNvbnRyb2xzLlNlY3Rpb24ge1xuICAgICAgcHVibGljIHJlYWRvbmx5IE5hbWUhOiBzdHJpbmc7XG4gICAgICBwcm90ZWN0ZWQgX3NlY3Rpb24/OiBYcm0uQ29udHJvbHMuU2VjdGlvbjtcbiAgICAgIHB1YmxpYyBwYXJlbnRUYWI/OiBYcm0uQ29udHJvbHMuVGFiO1xuICAgICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuTmFtZSA9IG5hbWU7XG4gICAgICB9XG4gICAgICBwdWJsaWMgZ2V0IFNlY3Rpb24oKTogWHJtLkNvbnRyb2xzLlNlY3Rpb24ge1xuICAgICAgICByZXR1cm4gKHRoaXMuX3NlY3Rpb24gPz89XG4gICAgICAgICAgdGhpcy5wYXJlbnRUYWIuc2VjdGlvbnMuZ2V0KHRoaXMuTmFtZSkgPz9cbiAgICAgICAgICBYcm1FeC50aHJvd0Vycm9yKFxuICAgICAgICAgICAgYFRoZSBzZWN0aW9uICcke3RoaXMuTmFtZX0nIHdhcyBub3QgZm91bmQgb24gdGhlIGZvcm0uYFxuICAgICAgICAgICkpO1xuICAgICAgfVxuICAgICAgZ2V0TmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5TZWN0aW9uLmdldE5hbWUoKTtcbiAgICAgIH1cbiAgICAgIGdldFBhcmVudCgpOiBYcm0uQ29udHJvbHMuVGFiIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuU2VjdGlvbi5nZXRQYXJlbnQoKTtcbiAgICAgIH1cbiAgICAgIGNvbnRyb2xzOiBYcm0uQ29sbGVjdGlvbi5JdGVtQ29sbGVjdGlvbjxYcm0uQ29udHJvbHMuQ29udHJvbD47XG4gICAgICBzZXRWaXNpYmxlKHZpc2libGU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuU2VjdGlvbi5zZXRWaXNpYmxlKHZpc2libGUpO1xuICAgICAgfVxuICAgICAgZ2V0VmlzaWJsZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuU2VjdGlvbi5nZXRWaXNpYmxlKCk7XG4gICAgICB9XG4gICAgICBnZXRMYWJlbCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5TZWN0aW9uLmdldExhYmVsKCk7XG4gICAgICB9XG4gICAgICBzZXRMYWJlbChsYWJlbDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLlNlY3Rpb24uc2V0TGFiZWwobGFiZWwpO1xuICAgICAgfVxuICAgIH1cbiAgICB0eXBlIFRhYlNlY3Rpb25zID0ge1xuICAgICAgW2tleTogc3RyaW5nXTogU2VjdGlvbjtcbiAgICB9O1xuICAgIGV4cG9ydCBjbGFzcyBUYWI8U2VjdGlvbnMgZXh0ZW5kcyBUYWJTZWN0aW9ucz4gaW1wbGVtZW50cyBYcm0uQ29udHJvbHMuVGFiIHtcbiAgICAgIHB1YmxpYyByZWFkb25seSBOYW1lITogc3RyaW5nO1xuICAgICAgcHJvdGVjdGVkIF90YWI/OiBYcm0uQ29udHJvbHMuVGFiO1xuICAgICAgU2VjdGlvbjogU2VjdGlvbnM7XG4gICAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIHNlY3Rpb24/OiBTZWN0aW9ucykge1xuICAgICAgICB0aGlzLk5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLlNlY3Rpb24gPSBzZWN0aW9uO1xuICAgICAgICBmb3IgKGxldCBrZXkgaW4gc2VjdGlvbikge1xuICAgICAgICAgIHNlY3Rpb25ba2V5XS5wYXJlbnRUYWIgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzZWN0aW9uczogWHJtLkNvbGxlY3Rpb24uSXRlbUNvbGxlY3Rpb248WHJtLkNvbnRyb2xzLlNlY3Rpb24+O1xuXG4gICAgICBwdWJsaWMgZ2V0IFRhYigpOiBYcm0uQ29udHJvbHMuVGFiIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl90YWIgPz89XG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC51aS50YWJzLmdldCh0aGlzLk5hbWUpID8/XG4gICAgICAgICAgWHJtRXgudGhyb3dFcnJvcihcbiAgICAgICAgICAgIGBUaGUgdGFiICcke3RoaXMuTmFtZX0nIHdhcyBub3QgZm91bmQgb24gdGhlIGZvcm0uYFxuICAgICAgICAgICkpO1xuICAgICAgfVxuICAgICAgYWRkVGFiU3RhdGVDaGFuZ2UoaGFuZGxlcjogWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlcik6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5UYWIuYWRkVGFiU3RhdGVDaGFuZ2UoaGFuZGxlcik7XG4gICAgICB9XG4gICAgICBnZXREaXNwbGF5U3RhdGUoKTogWHJtLkRpc3BsYXlTdGF0ZSB7XG4gICAgICAgIHJldHVybiB0aGlzLlRhYi5nZXREaXNwbGF5U3RhdGUoKTtcbiAgICAgIH1cbiAgICAgIGdldE5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuVGFiLmdldE5hbWUoKTtcbiAgICAgIH1cbiAgICAgIGdldFBhcmVudCgpOiBYcm0uVWkge1xuICAgICAgICByZXR1cm4gdGhpcy5UYWIuZ2V0UGFyZW50KCk7XG4gICAgICB9XG4gICAgICByZW1vdmVUYWJTdGF0ZUNoYW5nZShoYW5kbGVyOiBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyKTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLlRhYi5yZW1vdmVUYWJTdGF0ZUNoYW5nZShoYW5kbGVyKTtcbiAgICAgIH1cbiAgICAgIHNldERpc3BsYXlTdGF0ZShkaXNwbGF5U3RhdGU6IFhybS5EaXNwbGF5U3RhdGUpOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuVGFiLnNldERpc3BsYXlTdGF0ZShkaXNwbGF5U3RhdGUpO1xuICAgICAgfVxuICAgICAgc2V0VmlzaWJsZSh2aXNpYmxlOiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLlRhYi5zZXRWaXNpYmxlKHZpc2libGUpO1xuICAgICAgfVxuICAgICAgZ2V0VmlzaWJsZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuVGFiLmdldFZpc2libGUoKTtcbiAgICAgIH1cbiAgICAgIGdldExhYmVsKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLlRhYi5nZXRMYWJlbCgpO1xuICAgICAgfVxuICAgICAgc2V0TGFiZWwobGFiZWw6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5UYWIuc2V0TGFiZWwobGFiZWwpO1xuICAgICAgfVxuICAgICAgc2V0Rm9jdXMoKTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLlRhYi5zZXRGb2N1cygpO1xuICAgICAgfVxuICAgIH1cbiAgICBleHBvcnQgY2xhc3MgR3JpZENvbnRyb2wgaW1wbGVtZW50cyBYcm0uQ29udHJvbHMuR3JpZENvbnRyb2wge1xuICAgICAgcHVibGljIHJlYWRvbmx5IE5hbWUhOiBzdHJpbmc7XG4gICAgICBwcm90ZWN0ZWQgX2dyaWRDb250cm9sPzogWHJtLkNvbnRyb2xzLkdyaWRDb250cm9sO1xuICAgICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuTmFtZSA9IG5hbWU7XG4gICAgICB9XG4gICAgICBwdWJsaWMgZ2V0IEdyaWRDb250cm9sKCk6IFhybS5Db250cm9scy5HcmlkQ29udHJvbCB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgKHRoaXMuX2dyaWRDb250cm9sID8/PVxuICAgICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5nZXRDb250cm9sPFhybS5Db250cm9scy5HcmlkQ29udHJvbD4odGhpcy5OYW1lKSkgPz9cbiAgICAgICAgICBYcm1FeC50aHJvd0Vycm9yKGBUaGUgZ3JpZCAnJHt0aGlzLk5hbWV9JyB3YXMgbm90IGZvdW5kIG9uIHRoZSBmb3JtLmApXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBwdWJsaWMgZ2V0IEdyaWQoKTogWHJtLkNvbnRyb2xzLkdyaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRHcmlkKCk7XG4gICAgICB9XG4gICAgICBhZGRPbkxvYWQoaGFuZGxlcjogWHJtLkV2ZW50cy5HcmlkQ29udHJvbC5Mb2FkRXZlbnRIYW5kbGVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuR3JpZENvbnRyb2wucmVtb3ZlT25Mb2FkKGhhbmRsZXIgYXMgYW55KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuYWRkT25Mb2FkKGhhbmRsZXIpO1xuICAgICAgfVxuICAgICAgZ2V0Q29udGV4dFR5cGUoKTogWHJtRW51bS5HcmlkQ29udHJvbENvbnRleHQge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRDb250ZXh0VHlwZSgpO1xuICAgICAgfVxuICAgICAgZ2V0RW50aXR5TmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRFbnRpdHlOYW1lKCk7XG4gICAgICB9XG4gICAgICBnZXRGZXRjaFhtbCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRGZXRjaFhtbCgpO1xuICAgICAgfVxuICAgICAgZ2V0R3JpZCgpOiBYcm0uQ29udHJvbHMuR3JpZCB7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmdldEdyaWQoKTtcbiAgICAgIH1cbiAgICAgIGdldFJlbGF0aW9uc2hpcCgpOiBYcm0uQ29udHJvbHMuR3JpZFJlbGF0aW9uc2hpcCB7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmdldFJlbGF0aW9uc2hpcCgpO1xuICAgICAgfVxuICAgICAgZ2V0VXJsKGNsaWVudD86IFhybUVudW0uR3JpZENsaWVudCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmdldFVybChjbGllbnQpO1xuICAgICAgfVxuICAgICAgZ2V0Vmlld1NlbGVjdG9yKCk6IFhybS5Db250cm9scy5WaWV3U2VsZWN0b3Ige1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRWaWV3U2VsZWN0b3IoKTtcbiAgICAgIH1cbiAgICAgIG9wZW5SZWxhdGVkR3JpZCgpOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wub3BlblJlbGF0ZWRHcmlkKCk7XG4gICAgICB9XG4gICAgICByZWZyZXNoKCk6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5yZWZyZXNoKCk7XG4gICAgICB9XG4gICAgICByZWZyZXNoUmliYm9uKCk6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5yZWZyZXNoUmliYm9uKCk7XG4gICAgICB9XG4gICAgICByZW1vdmVPbkxvYWQoaGFuZGxlcjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5yZW1vdmVPbkxvYWQoaGFuZGxlcik7XG4gICAgICB9XG4gICAgICBnZXRDb250cm9sVHlwZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRDb250cm9sVHlwZSgpO1xuICAgICAgfVxuICAgICAgZ2V0TmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXROYW1lKCk7XG4gICAgICB9XG4gICAgICBnZXRQYXJlbnQoKTogWHJtLkNvbnRyb2xzLlNlY3Rpb24ge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRQYXJlbnQoKTtcbiAgICAgIH1cbiAgICAgIGdldExhYmVsKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmdldExhYmVsKCk7XG4gICAgICB9XG4gICAgICBzZXRMYWJlbChsYWJlbDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLnNldExhYmVsKGxhYmVsKTtcbiAgICAgIH1cbiAgICAgIGdldFZpc2libGUoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmdldFZpc2libGUoKTtcbiAgICAgIH1cbiAgICAgIHNldFZpc2libGUodmlzaWJsZTogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5zZXRWaXNpYmxlKHZpc2libGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19