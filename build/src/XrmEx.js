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
        let response = await executeFunction("RetrieveEnvironmentVariableValue", [
            {
                Name: "DefinitionSchemaName",
                Type: "String",
                Value: environmentVariableSchemaName,
            },
        ]);
        return Object.hasOwn(response, "Value") ? response.Value : response;
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
    function getStructuralProperty(value) {
        const type = typeof value;
        if (type == "string" || type == "number" || type == "boolean")
            return 1;
        if (value instanceof Date)
            return 1;
        if (Array.isArray(value))
            return 4;
        return 5;
    }
    XrmEx.getStructuralProperty = getStructuralProperty;
    /**
     * Executes a request.
     * @param {string} actionName - The unique name of the request.
     * @param {RequestParameter[] | object} requestParameters - An array of objects with the parameter name, type, and value.
     * @param {EntityReference} [boundEntity] - An optional EntityReference of the bound entity.
     * @param {number} [operationType] - The type of the request. 0 for functions 1 for actions, 2 for CRUD operations.
     * @returns {Promise<any>} - A Promise with the request response.
     * @throws {Error} - Throws an error if the request parameter is not of a supported type or has an invalid value.
     */
    async function execute(actionName, requestParameters, boundEntity, operationType = 1) {
        const prepareParameterDefinition = (params) => {
            const parameterDefinition = {};
            if (Array.isArray(params)) {
                if (boundEntity) {
                    params.push({
                        Name: "entity",
                        Value: boundEntity,
                        Type: "EntityReference",
                    });
                }
                params.forEach((p) => {
                    parameterDefinition[p.Name] = {
                        typeName: typeMap[p.Type].typeName,
                        structuralProperty: typeMap[p.Type].structuralProperty,
                    };
                });
            }
            else {
                if (boundEntity) {
                    params["entity"] = boundEntity;
                }
                Object.keys(params).forEach((key) => {
                    parameterDefinition[key] = {
                        structuralProperty: getStructuralProperty(params[key]),
                    };
                });
            }
            return parameterDefinition;
        };
        const createRequest = (params, definition) => {
            const metadata = {
                boundParameter: boundEntity ? "entity" : null,
                operationType: operationType,
                operationName: actionName,
                parameterTypes: definition,
            };
            const mergedParams = Array.isArray(params)
                ? Object.assign({}, ...params.map((p) => ({ [p.Name]: p.Value })))
                : params;
            return Object.assign({ getMetadata: () => metadata }, mergedParams);
        };
        const parameterDefinition = prepareParameterDefinition(requestParameters);
        const request = createRequest(requestParameters, parameterDefinition);
        const result = await Xrm.WebApi.online.execute(request);
        if (result.ok)
            return result.json().catch(() => result);
    }
    XrmEx.execute = execute;
    /**
     * Executes an Action.
     * @param {string} actionName - The unique name of the action.
     * @param {RequestParameter[] | object} requestParameters - An array of objects with the parameter name, type, and value.
     * @param {EntityReference} [boundEntity] - An optional EntityReference of the bound entity.
     * @returns {Promise<any>} - A Promise with the request response.
     * @throws {Error} - Throws an error if the request parameter is not of a supported type or has an invalid value.
     */
    async function executeAction(functionName, requestParameters, boundEntity) {
        return await execute(functionName, requestParameters, boundEntity, 0);
    }
    XrmEx.executeAction = executeAction;
    /**
     * Executes a Function.
     * @param {string} functionName - The unique name of the function.
     * @param {RequestParameter[] | object} requestParameters - An array of objects with the parameter name, type and value.
     * @param {EntityReference} [boundEntity] - An optional EntityReference of the bound entity.
     * @returns {Promise<any>} - A Promise with the request response.
     * @throws {Error} - Throws an error if the request parameter is not of a supported type or has an invalid value.
     */
    async function executeFunction(functionName, requestParameters, boundEntity) {
        return await execute(functionName, requestParameters, boundEntity, 1);
    }
    XrmEx.executeFunction = executeFunction;
    /**
     * Executes a CRUD request.
     * @param {string} messageName - The unique name of the request.
     * @param {RequestParameter[] | object} requestParameters - An array of objects with the parameter name, type, and value.
     * @param {EntityReference} [boundEntity] - An optional EntityReference of the bound entity.
     * @returns {Promise<any>} - A Promise with the request response.
     * @throws {Error} - Throws an error if the request parameter is not of a supported type or has an invalid value.
     */
    async function executeCRUD(functionName, requestParameters, boundEntity) {
        return await execute(functionName, requestParameters, boundEntity, 2);
    }
    XrmEx.executeCRUD = executeCRUD;
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
            Name;
            _attribute;
            constructor(attributeName) {
                this.Name = attributeName;
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
                if (value === null)
                    this.Attribute.setValue(null);
                else if (Array.isArray(value)) {
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
            viewId = crypto.randomUUID();
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
             * @deprecated Use {@link LookupField.addCustomView} instead, which provides more flexible filtering capabilities and better performance
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
             * Adds a custom view to filter the lookup using FetchXML
             * Only works for one table at a time, cannot add views for multiple tables at the same time
             * @param fetchXml The complete FetchXML query including filtering conditions
             * @returns The LookupField instance for method chaining
             */
            addCustomView(fetchXml) {
                try {
                    if (!fetchXml) {
                        throw new Error("FetchXML is required");
                    }
                    const targetEntity = this.extractEntityFromFetchXml(fetchXml);
                    const layoutXml = this.generateLayoutXml(fetchXml);
                    this.controls.forEach((control) => {
                        control.addCustomView(this.viewId, targetEntity, "Filtered View", fetchXml, layoutXml, true);
                    });
                    return this;
                }
                catch (error) {
                    throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
                }
            }
            /**
             * Extracts entity name from fetchXml
             */
            extractEntityFromFetchXml(fetchXml) {
                const match = fetchXml.match(/<entity.*?name=['"](.*?)['"]/);
                if (!match) {
                    throw new Error("Could not extract entity name from fetchXml");
                }
                return match[1];
            }
            /**
             * Generates layoutXml based on fetchXml attributes
             */
            generateLayoutXml(fetchXml) {
                const attributes = [];
                const regex = /<attribute.*?name=['"](.*?)['"]/g;
                let match;
                // Get up to 3 non-id attributes
                while ((match = regex.exec(fetchXml)) !== null &&
                    attributes.length < 3) {
                    if (!match[1].endsWith("id")) {
                        attributes.push(match[1]);
                    }
                }
                // If we didn't get any attributes, try to get the first attribute even if it's an ID
                if (attributes.length === 0) {
                    const firstMatch = regex.exec(fetchXml);
                    attributes.push(firstMatch ? firstMatch[1] : "name");
                }
                // Generate cells based on available attributes
                const cells = attributes
                    .map((attr, index) => {
                    const width = index === 0 ? 200 : 100;
                    return `<cell name='${attr}' width='${width}' />`;
                })
                    .join("\n        ");
                return `<grid name='resultset' object='1' jump='${attributes[0]}' select='1' icon='1' preview='1'>
      <row name='result' id='${attributes[0]}'>
        ${cells}
      </row>
    </grid>`;
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
                else if (value === null)
                    this.Attribute.setValue(null);
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
            get sections() {
                return this.Tab.sections;
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWHJtRXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvWHJtRXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsOERBQThEO0FBa0M5RCxJQUFVLEtBQUssQ0FzOERkO0FBdDhERCxXQUFVLEtBQUs7SUFDYjs7OztPQUlHO0lBQ0gsU0FBZ0IsVUFBVSxDQUFDLFlBQW9CO1FBQzdDLE1BQU0sSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUZlLGdCQUFVLGFBRXpCLENBQUE7SUFDRDs7O09BR0c7SUFDSCxTQUFnQixlQUFlO1FBQzdCLElBQUk7WUFDRixNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQzFCLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDdkUsTUFBTSxtQkFBbUIsR0FDdkIsVUFBVSxJQUFJLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUNuRSxNQUFNLGlCQUFpQixHQUNyQixtQkFBbUIsRUFBRSxLQUFLLENBQUMsb0JBQW9CLENBQUM7Z0JBQ2hELG1CQUFtQixFQUFFLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUM5QyxNQUFNLFlBQVksR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUVuRSxPQUFPLFlBQVksQ0FBQztTQUNyQjtRQUFDLE9BQU8sS0FBVSxFQUFFO1lBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFD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Z0JBQ1osT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQzNDLENBQUM7WUFDRCxPQUFPO2dCQUNMLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNwQyxDQUFDO1lBQ0QsU0FBUztnQkFDUCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDdEMsQ0FBQztZQUNELFFBQVE7Z0JBQ04sT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3JDLENBQUM7WUFDRCxRQUFRLENBQUMsS0FBYTtnQkFDcEIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMxQyxDQUFDO1lBQ0QsVUFBVTtnQkFDUixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDdkMsQ0FBQztZQUNELFVBQVUsQ0FBQyxPQUFnQjtnQkFDekIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM5QyxDQUFDO1NBQ0Y7UUExRVksaUJBQVcsY0EwRXZCLENBQUE7SUFDSCxDQUFDLEVBM2dDZ0IsS0FBSyxHQUFMLFdBQUssS0FBTCxXQUFLLFFBMmdDckI7QUFDSCxDQUFDLEVBdDhEUyxLQUFLLEtBQUwsS0FBSyxRQXM4RGQiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vbm9kZV9tb2R1bGVzL0B0eXBlcy94cm0vaW5kZXguZC50c1wiIC8+XG4vKipcbiAqIFJlcHJlc2VudHMgYSBwYXJhbWV0ZXIgZm9yIGEgcmVxdWVzdC5cbiAqIEB0eXBlIHtPYmplY3R9IFJlcXVlc3RQYXJhbWV0ZXJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBOYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHBhcmFtZXRlci5cbiAqIEBwcm9wZXJ0eSB7J0Jvb2xlYW4nIHwgJ0RhdGVUaW1lJyB8ICdEZWNpbWFsJyB8ICdFbnRpdHknIHwgJ0VudGl0eUNvbGxlY3Rpb24nIHwgJ0VudGl0eVJlZmVyZW5jZScgfCAnRmxvYXQnIHwgJ0ludGVnZXInIHwgJ01vbmV5JyB8ICdQaWNrbGlzdCcgfCAnU3RyaW5nJ30gVHlwZSAtIFRoZSB0eXBlIG9mIHRoZSBwYXJhbWV0ZXIuXG4gKiBAcHJvcGVydHkgeyp9IFZhbHVlIC0gVGhlIHZhbHVlIG9mIHRoZSBwYXJhbWV0ZXIuXG4gKi9cbnR5cGUgUmVxdWVzdFBhcmFtZXRlciA9IHtcbiAgTmFtZTogc3RyaW5nO1xuICBUeXBlOlxuICB8IFwiQm9vbGVhblwiXG4gIHwgXCJEYXRlVGltZVwiXG4gIHwgXCJEZWNpbWFsXCJcbiAgfCBcIkVudGl0eVwiXG4gIHwgXCJFbnRpdHlDb2xsZWN0aW9uXCJcbiAgfCBcIkVudGl0eVJlZmVyZW5jZVwiXG4gIHwgXCJGbG9hdFwiXG4gIHwgXCJJbnRlZ2VyXCJcbiAgfCBcIk1vbmV5XCJcbiAgfCBcIlBpY2tsaXN0XCJcbiAgfCBcIlN0cmluZ1wiO1xuICBWYWx1ZTogYW55O1xufTtcbi8qKlxuICogUmVwcmVzZW50cyBhIHJlZmVyZW5jZSB0byBhbiBlbnRpdHkuXG4gKiBAdHlwZVxuICogQHByb3BlcnR5IHtzdHJpbmd9IGlkIC0gVGhlIElEIG9mIHRoZSBlbnRpdHkuXG4gKiBAcHJvcGVydHkge3N0cmluZ30gZW50aXR5VHlwZSAtIFRoZSB0eXBlIG9mIHRoZSBlbnRpdHkuXG4gKi9cbnR5cGUgRW50aXR5UmVmZXJlbmNlID0ge1xuICBpZDogc3RyaW5nO1xuICBlbnRpdHlUeXBlOiBzdHJpbmc7XG59O1xubmFtZXNwYWNlIFhybUV4IHtcbiAgLyoqXG4gICAqIFRocm93cyBhbiBlcnJvciB3aXRoIHRoZSBnaXZlbiBlcnJvciBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXJyb3JNZXNzYWdlIC0gVGhlIGVycm9yIG1lc3NhZ2UgdG8gdGhyb3cuXG4gICAqIEB0aHJvd3Mge0Vycm9yfSAtIEFsd2F5cyB0aHJvd3MgYW4gZXJyb3Igd2l0aCB0aGUgZ2l2ZW4gZXJyb3IgbWVzc2FnZS5cbiAgICovXG4gIGV4cG9ydCBmdW5jdGlvbiB0aHJvd0Vycm9yKGVycm9yTWVzc2FnZTogc3RyaW5nKTogbmV2ZXIge1xuICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpO1xuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBuYW1lIG9mIHRoZSBjYWxsaW5nIGZ1bmN0aW9uLlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIFRoZSBuYW1lIG9mIHRoZSBjYWxsaW5nIGZ1bmN0aW9uLlxuICAgKi9cbiAgZXhwb3J0IGZ1bmN0aW9uIGdldEZ1bmN0aW9uTmFtZSgpOiBzdHJpbmcge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcigpO1xuICAgICAgY29uc3Qgc3RhY2tUcmFjZSA9IGVycm9yLnN0YWNrPy5zcGxpdChcIlxcblwiKS5tYXAoKGxpbmUpID0+IGxpbmUudHJpbSgpKTtcbiAgICAgIGNvbnN0IGNhbGxpbmdGdW5jdGlvbkxpbmUgPVxuICAgICAgICBzdGFja1RyYWNlICYmIHN0YWNrVHJhY2UubGVuZ3RoID49IDMgPyBzdGFja1RyYWNlWzJdIDogdW5kZWZpbmVkO1xuICAgICAgY29uc3QgZnVuY3Rpb25OYW1lTWF0Y2ggPVxuICAgICAgICBjYWxsaW5nRnVuY3Rpb25MaW5lPy5tYXRjaCgvYXRcXHMrKFteXFxzXSspXFxzK1xcKC8pIHx8XG4gICAgICAgIGNhbGxpbmdGdW5jdGlvbkxpbmU/Lm1hdGNoKC9hdFxccysoW15cXHNdKykvKTtcbiAgICAgIGNvbnN0IGZ1bmN0aW9uTmFtZSA9IGZ1bmN0aW9uTmFtZU1hdGNoID8gZnVuY3Rpb25OYW1lTWF0Y2hbMV0gOiBcIlwiO1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb25OYW1lO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguZ2V0RnVuY3Rpb25OYW1lOlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIERpc3BsYXlzIGEgbm90aWZpY2F0aW9uIGZvciBhbiBhcHAgd2l0aCB0aGUgZ2l2ZW4gbWVzc2FnZSBhbmQgbGV2ZWwsIGFuZCBsZXRzIHlvdSBzcGVjaWZ5IHdoZXRoZXIgdG8gc2hvdyBhIGNsb3NlIGJ1dHRvbi5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSBUaGUgbWVzc2FnZSB0byBkaXNwbGF5IGluIHRoZSBub3RpZmljYXRpb24uXG4gICAqIEBwYXJhbSB7J1NVQ0NFU1MnIHwgJ0VSUk9SJyB8ICdXQVJOSU5HJyB8ICdJTkZPJ30gbGV2ZWwgLSBUaGUgbGV2ZWwgb2YgdGhlIG5vdGlmaWNhdGlvbi4gQ2FuIGJlICdTVUNDRVNTJywgJ0VSUk9SJywgJ1dBUk5JTkcnLCBvciAnSU5GTycuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3Nob3dDbG9zZUJ1dHRvbj1mYWxzZV0gLSBXaGV0aGVyIHRvIHNob3cgYSBjbG9zZSBidXR0b24gb24gdGhlIG5vdGlmaWNhdGlvbi4gRGVmYXVsdHMgdG8gZmFsc2UuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IC0gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgSUQgb2YgdGhlIGNyZWF0ZWQgbm90aWZpY2F0aW9uLlxuICAgKi9cbiAgZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZEdsb2JhbE5vdGlmaWNhdGlvbihcbiAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgbGV2ZWw6IFwiU1VDQ0VTU1wiIHwgXCJFUlJPUlwiIHwgXCJXQVJOSU5HXCIgfCBcIklORk9cIixcbiAgICBzaG93Q2xvc2VCdXR0b24gPSBmYWxzZVxuICApOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGxldmVsTWFwID0ge1xuICAgICAgU1VDQ0VTUzogMSxcbiAgICAgIEVSUk9SOiAyLFxuICAgICAgV0FSTklORzogMyxcbiAgICAgIElORk86IDQsXG4gICAgfTtcbiAgICBjb25zdCBtZXNzYWdlTGV2ZWwgPSBsZXZlbE1hcFtsZXZlbF0gfHwgbGV2ZWxNYXAuSU5GTztcbiAgICBjb25zdCBub3RpZmljYXRpb24gPSB7XG4gICAgICB0eXBlOiAyLFxuICAgICAgbGV2ZWw6IG1lc3NhZ2VMZXZlbCxcbiAgICAgIG1lc3NhZ2UsXG4gICAgICBzaG93Q2xvc2VCdXR0b24sXG4gICAgfTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IFhybS5BcHAuYWRkR2xvYmFsTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbik7XG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke2dldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBDbGVhcnMgYSBub3RpZmljYXRpb24gaW4gdGhlIGFwcCB3aXRoIHRoZSBnaXZlbiB1bmlxdWUgSUQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1bmlxdWVJZCAtIFRoZSB1bmlxdWUgSUQgb2YgdGhlIG5vdGlmaWNhdGlvbiB0byBjbGVhci5cbiAgICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gLSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBub3RpZmljYXRpb24gaGFzIGJlZW4gY2xlYXJlZC5cbiAgICovXG4gIGV4cG9ydCBhc3luYyBmdW5jdGlvbiByZW1vdmVHbG9iYWxOb3RpZmljYXRpb24oXG4gICAgdW5pcXVlSWQ6IHN0cmluZ1xuICApOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgWHJtLkFwcC5jbGVhckdsb2JhbE5vdGlmaWNhdGlvbih1bmlxdWVJZCk7XG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke2dldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIHZhbHVlIG9mIGFuIGVudmlyb25tZW50IHZhcmlhYmxlIGJ5IHVzaW5nIGl0cyBzY2hlbWEgbmFtZSBhcyBrZXkuXG4gICAqIElmIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZSBoYXMgYm90aCBhIGRlZmF1bHQgdmFsdWUgYW5kIGEgY3VycmVudCB2YWx1ZSwgdGhpcyBmdW5jdGlvbiB3aWxsIHJldHJpZXZlIHRoZSBjdXJyZW50IHZhbHVlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZW52aXJvbm1lbnRWYXJpYWJsZVNjaGVtYU5hbWUgLSBUaGUgc2NoZW1hIG5hbWUgb2YgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlIHRvIHJldHJpZXZlLlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSAtIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIHZhbHVlIG9mIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZS5cbiAgICogQGFzeW5jXG4gICAqL1xuICBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RW52aXJvbm1lbnRWYXJpYWJsZVZhbHVlKFxuICAgIGVudmlyb25tZW50VmFyaWFibGVTY2hlbWFOYW1lOiBzdHJpbmdcbiAgKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBleGVjdXRlRnVuY3Rpb24oXCJSZXRyaWV2ZUVudmlyb25tZW50VmFyaWFibGVWYWx1ZVwiLCBbXG4gICAgICB7XG4gICAgICAgIE5hbWU6IFwiRGVmaW5pdGlvblNjaGVtYU5hbWVcIixcbiAgICAgICAgVHlwZTogXCJTdHJpbmdcIixcbiAgICAgICAgVmFsdWU6IGVudmlyb25tZW50VmFyaWFibGVTY2hlbWFOYW1lLFxuICAgICAgfSxcbiAgICBdKTtcbiAgICByZXR1cm4gT2JqZWN0Lmhhc093bihyZXNwb25zZSwgXCJWYWx1ZVwiKSA/IHJlc3BvbnNlLlZhbHVlIDogcmVzcG9uc2U7XG4gIH1cbiAgLyoqXG4gICAqIEEgbWFwIG9mIENSTSBkYXRhIHR5cGVzIHRvIHRoZWlyIGNvcnJlc3BvbmRpbmcgdHlwZSBuYW1lcywgc3RydWN0dXJhbCBwcm9wZXJ0aWVzLCBhbmQgSmF2YVNjcmlwdCB0eXBlcy5cbiAgICogQHR5cGUge09iamVjdC48c3RyaW5nLCB7IHR5cGVOYW1lOiBzdHJpbmcsIHN0cnVjdHVyYWxQcm9wZXJ0eTogbnVtYmVyLCBqc1R5cGU6IHN0cmluZyB9Pn1cbiAgICovXG4gIGxldCB0eXBlTWFwID0ge1xuICAgIFN0cmluZzogeyB0eXBlTmFtZTogXCJFZG0uU3RyaW5nXCIsIHN0cnVjdHVyYWxQcm9wZXJ0eTogMSwganNUeXBlOiBcInN0cmluZ1wiIH0sXG4gICAgSW50ZWdlcjogeyB0eXBlTmFtZTogXCJFZG0uSW50MzJcIiwgc3RydWN0dXJhbFByb3BlcnR5OiAxLCBqc1R5cGU6IFwibnVtYmVyXCIgfSxcbiAgICBCb29sZWFuOiB7XG4gICAgICB0eXBlTmFtZTogXCJFZG0uQm9vbGVhblwiLFxuICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiAxLFxuICAgICAganNUeXBlOiBcImJvb2xlYW5cIixcbiAgICB9LFxuICAgIERhdGVUaW1lOiB7XG4gICAgICB0eXBlTmFtZTogXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIixcbiAgICAgIHN0cnVjdHVyYWxQcm9wZXJ0eTogMSxcbiAgICAgIGpzVHlwZTogXCJvYmplY3RcIixcbiAgICB9LFxuICAgIEVudGl0eVJlZmVyZW5jZToge1xuICAgICAgdHlwZU5hbWU6IFwibXNjcm0uY3JtYmFzZWVudGl0eVwiLFxuICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiA1LFxuICAgICAganNUeXBlOiBcIm9iamVjdFwiLFxuICAgIH0sXG4gICAgRGVjaW1hbDoge1xuICAgICAgdHlwZU5hbWU6IFwiRWRtLkRlY2ltYWxcIixcbiAgICAgIHN0cnVjdHVyYWxQcm9wZXJ0eTogMSxcbiAgICAgIGpzVHlwZTogXCJudW1iZXJcIixcbiAgICB9LFxuICAgIEVudGl0eToge1xuICAgICAgdHlwZU5hbWU6IFwibXNjcm0uY3JtYmFzZWVudGl0eVwiLFxuICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiA1LFxuICAgICAganNUeXBlOiBcIm9iamVjdFwiLFxuICAgIH0sXG4gICAgRW50aXR5Q29sbGVjdGlvbjoge1xuICAgICAgdHlwZU5hbWU6IFwiQ29sbGVjdGlvbihtc2NybS5jcm1iYXNlZW50aXR5KVwiLFxuICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiA0LFxuICAgICAganNUeXBlOiBcIm9iamVjdFwiLFxuICAgIH0sXG4gICAgRmxvYXQ6IHsgdHlwZU5hbWU6IFwiRWRtLkRvdWJsZVwiLCBzdHJ1Y3R1cmFsUHJvcGVydHk6IDEsIGpzVHlwZTogXCJudW1iZXJcIiB9LFxuICAgIE1vbmV5OiB7IHR5cGVOYW1lOiBcIkVkbS5EZWNpbWFsXCIsIHN0cnVjdHVyYWxQcm9wZXJ0eTogMSwganNUeXBlOiBcIm51bWJlclwiIH0sXG4gICAgUGlja2xpc3Q6IHtcbiAgICAgIHR5cGVOYW1lOiBcIkVkbS5JbnQzMlwiLFxuICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiAxLFxuICAgICAganNUeXBlOiBcIm51bWJlclwiLFxuICAgIH0sXG4gIH07XG4gIGV4cG9ydCBmdW5jdGlvbiBnZXRTdHJ1Y3R1cmFsUHJvcGVydHkodmFsdWU6IGFueSk6IG51bWJlciB7XG4gICAgY29uc3QgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgICBpZiAodHlwZSA9PSBcInN0cmluZ1wiIHx8IHR5cGUgPT0gXCJudW1iZXJcIiB8fCB0eXBlID09IFwiYm9vbGVhblwiKSByZXR1cm4gMTtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSByZXR1cm4gMTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHJldHVybiA0O1xuICAgIHJldHVybiA1O1xuICB9XG4gIC8qKlxuICAgKiBFeGVjdXRlcyBhIHJlcXVlc3QuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhY3Rpb25OYW1lIC0gVGhlIHVuaXF1ZSBuYW1lIG9mIHRoZSByZXF1ZXN0LlxuICAgKiBAcGFyYW0ge1JlcXVlc3RQYXJhbWV0ZXJbXSB8IG9iamVjdH0gcmVxdWVzdFBhcmFtZXRlcnMgLSBBbiBhcnJheSBvZiBvYmplY3RzIHdpdGggdGhlIHBhcmFtZXRlciBuYW1lLCB0eXBlLCBhbmQgdmFsdWUuXG4gICAqIEBwYXJhbSB7RW50aXR5UmVmZXJlbmNlfSBbYm91bmRFbnRpdHldIC0gQW4gb3B0aW9uYWwgRW50aXR5UmVmZXJlbmNlIG9mIHRoZSBib3VuZCBlbnRpdHkuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbb3BlcmF0aW9uVHlwZV0gLSBUaGUgdHlwZSBvZiB0aGUgcmVxdWVzdC4gMCBmb3IgZnVuY3Rpb25zIDEgZm9yIGFjdGlvbnMsIDIgZm9yIENSVUQgb3BlcmF0aW9ucy5cbiAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn0gLSBBIFByb21pc2Ugd2l0aCB0aGUgcmVxdWVzdCByZXNwb25zZS5cbiAgICogQHRocm93cyB7RXJyb3J9IC0gVGhyb3dzIGFuIGVycm9yIGlmIHRoZSByZXF1ZXN0IHBhcmFtZXRlciBpcyBub3Qgb2YgYSBzdXBwb3J0ZWQgdHlwZSBvciBoYXMgYW4gaW52YWxpZCB2YWx1ZS5cbiAgICovXG4gIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBleGVjdXRlKFxuICAgIGFjdGlvbk5hbWU6IHN0cmluZyxcbiAgICByZXF1ZXN0UGFyYW1ldGVyczogUmVxdWVzdFBhcmFtZXRlcltdIHwgeyBba2V5OiBzdHJpbmddOiBhbnkgfSxcbiAgICBib3VuZEVudGl0eT86IEVudGl0eVJlZmVyZW5jZSxcbiAgICBvcGVyYXRpb25UeXBlOiBudW1iZXIgPSAxXG4gICk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgcHJlcGFyZVBhcmFtZXRlckRlZmluaXRpb24gPSAoXG4gICAgICBwYXJhbXM6IFJlcXVlc3RQYXJhbWV0ZXJbXSB8IHsgW2tleTogc3RyaW5nXTogYW55IH1cbiAgICApID0+IHtcbiAgICAgIGNvbnN0IHBhcmFtZXRlckRlZmluaXRpb246IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7fTtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHBhcmFtcykpIHtcbiAgICAgICAgaWYgKGJvdW5kRW50aXR5KSB7XG4gICAgICAgICAgcGFyYW1zLnB1c2goe1xuICAgICAgICAgICAgTmFtZTogXCJlbnRpdHlcIixcbiAgICAgICAgICAgIFZhbHVlOiBib3VuZEVudGl0eSxcbiAgICAgICAgICAgIFR5cGU6IFwiRW50aXR5UmVmZXJlbmNlXCIsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcGFyYW1zLmZvckVhY2goKHApID0+IHtcbiAgICAgICAgICBwYXJhbWV0ZXJEZWZpbml0aW9uW3AuTmFtZV0gPSB7XG4gICAgICAgICAgICB0eXBlTmFtZTogdHlwZU1hcFtwLlR5cGVdLnR5cGVOYW1lLFxuICAgICAgICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiB0eXBlTWFwW3AuVHlwZV0uc3RydWN0dXJhbFByb3BlcnR5LFxuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGJvdW5kRW50aXR5KSB7XG4gICAgICAgICAgcGFyYW1zW1wiZW50aXR5XCJdID0gYm91bmRFbnRpdHk7XG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmtleXMocGFyYW1zKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICBwYXJhbWV0ZXJEZWZpbml0aW9uW2tleV0gPSB7XG4gICAgICAgICAgICBzdHJ1Y3R1cmFsUHJvcGVydHk6IGdldFN0cnVjdHVyYWxQcm9wZXJ0eShwYXJhbXNba2V5XSksXG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcGFyYW1ldGVyRGVmaW5pdGlvbjtcbiAgICB9O1xuXG4gICAgY29uc3QgY3JlYXRlUmVxdWVzdCA9IChcbiAgICAgIHBhcmFtczogUmVxdWVzdFBhcmFtZXRlcltdIHwgeyBba2V5OiBzdHJpbmddOiBhbnkgfSxcbiAgICAgIGRlZmluaXRpb246IHsgW2tleTogc3RyaW5nXTogYW55IH1cbiAgICApID0+IHtcbiAgICAgIGNvbnN0IG1ldGFkYXRhID0ge1xuICAgICAgICBib3VuZFBhcmFtZXRlcjogYm91bmRFbnRpdHkgPyBcImVudGl0eVwiIDogbnVsbCxcbiAgICAgICAgb3BlcmF0aW9uVHlwZTogb3BlcmF0aW9uVHlwZSxcbiAgICAgICAgb3BlcmF0aW9uTmFtZTogYWN0aW9uTmFtZSxcbiAgICAgICAgcGFyYW1ldGVyVHlwZXM6IGRlZmluaXRpb24sXG4gICAgICB9O1xuICAgICAgY29uc3QgbWVyZ2VkUGFyYW1zID0gQXJyYXkuaXNBcnJheShwYXJhbXMpXG4gICAgICAgID8gT2JqZWN0LmFzc2lnbih7fSwgLi4ucGFyYW1zLm1hcCgocCkgPT4gKHsgW3AuTmFtZV06IHAuVmFsdWUgfSkpKVxuICAgICAgICA6IHBhcmFtcztcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHsgZ2V0TWV0YWRhdGE6ICgpID0+IG1ldGFkYXRhIH0sIG1lcmdlZFBhcmFtcyk7XG4gICAgfTtcbiAgICBjb25zdCBwYXJhbWV0ZXJEZWZpbml0aW9uID0gcHJlcGFyZVBhcmFtZXRlckRlZmluaXRpb24ocmVxdWVzdFBhcmFtZXRlcnMpO1xuICAgIGNvbnN0IHJlcXVlc3QgPSBjcmVhdGVSZXF1ZXN0KHJlcXVlc3RQYXJhbWV0ZXJzLCBwYXJhbWV0ZXJEZWZpbml0aW9uKTtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBYcm0uV2ViQXBpLm9ubGluZS5leGVjdXRlKHJlcXVlc3QpO1xuICAgIGlmIChyZXN1bHQub2spIHJldHVybiByZXN1bHQuanNvbigpLmNhdGNoKCgpID0+IHJlc3VsdCk7XG4gIH1cblxuICAvKipcbiAgICogRXhlY3V0ZXMgYW4gQWN0aW9uLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYWN0aW9uTmFtZSAtIFRoZSB1bmlxdWUgbmFtZSBvZiB0aGUgYWN0aW9uLlxuICAgKiBAcGFyYW0ge1JlcXVlc3RQYXJhbWV0ZXJbXSB8IG9iamVjdH0gcmVxdWVzdFBhcmFtZXRlcnMgLSBBbiBhcnJheSBvZiBvYmplY3RzIHdpdGggdGhlIHBhcmFtZXRlciBuYW1lLCB0eXBlLCBhbmQgdmFsdWUuXG4gICAqIEBwYXJhbSB7RW50aXR5UmVmZXJlbmNlfSBbYm91bmRFbnRpdHldIC0gQW4gb3B0aW9uYWwgRW50aXR5UmVmZXJlbmNlIG9mIHRoZSBib3VuZCBlbnRpdHkuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59IC0gQSBQcm9taXNlIHdpdGggdGhlIHJlcXVlc3QgcmVzcG9uc2UuXG4gICAqIEB0aHJvd3Mge0Vycm9yfSAtIFRocm93cyBhbiBlcnJvciBpZiB0aGUgcmVxdWVzdCBwYXJhbWV0ZXIgaXMgbm90IG9mIGEgc3VwcG9ydGVkIHR5cGUgb3IgaGFzIGFuIGludmFsaWQgdmFsdWUuXG4gICAqL1xuICBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUFjdGlvbihcbiAgICBmdW5jdGlvbk5hbWU6IHN0cmluZyxcbiAgICByZXF1ZXN0UGFyYW1ldGVyczogUmVxdWVzdFBhcmFtZXRlcltdIHwgb2JqZWN0LFxuICAgIGJvdW5kRW50aXR5PzogRW50aXR5UmVmZXJlbmNlXG4gICk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIGF3YWl0IGV4ZWN1dGUoZnVuY3Rpb25OYW1lLCByZXF1ZXN0UGFyYW1ldGVycywgYm91bmRFbnRpdHksIDApO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGVzIGEgRnVuY3Rpb24uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmdW5jdGlvbk5hbWUgLSBUaGUgdW5pcXVlIG5hbWUgb2YgdGhlIGZ1bmN0aW9uLlxuICAgKiBAcGFyYW0ge1JlcXVlc3RQYXJhbWV0ZXJbXSB8IG9iamVjdH0gcmVxdWVzdFBhcmFtZXRlcnMgLSBBbiBhcnJheSBvZiBvYmplY3RzIHdpdGggdGhlIHBhcmFtZXRlciBuYW1lLCB0eXBlIGFuZCB2YWx1ZS5cbiAgICogQHBhcmFtIHtFbnRpdHlSZWZlcmVuY2V9IFtib3VuZEVudGl0eV0gLSBBbiBvcHRpb25hbCBFbnRpdHlSZWZlcmVuY2Ugb2YgdGhlIGJvdW5kIGVudGl0eS5cbiAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn0gLSBBIFByb21pc2Ugd2l0aCB0aGUgcmVxdWVzdCByZXNwb25zZS5cbiAgICogQHRocm93cyB7RXJyb3J9IC0gVGhyb3dzIGFuIGVycm9yIGlmIHRoZSByZXF1ZXN0IHBhcmFtZXRlciBpcyBub3Qgb2YgYSBzdXBwb3J0ZWQgdHlwZSBvciBoYXMgYW4gaW52YWxpZCB2YWx1ZS5cbiAgICovXG4gIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBleGVjdXRlRnVuY3Rpb24oXG4gICAgZnVuY3Rpb25OYW1lOiBzdHJpbmcsXG4gICAgcmVxdWVzdFBhcmFtZXRlcnM6IFJlcXVlc3RQYXJhbWV0ZXJbXSB8IG9iamVjdCxcbiAgICBib3VuZEVudGl0eT86IEVudGl0eVJlZmVyZW5jZVxuICApOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBhd2FpdCBleGVjdXRlKGZ1bmN0aW9uTmFtZSwgcmVxdWVzdFBhcmFtZXRlcnMsIGJvdW5kRW50aXR5LCAxKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlcyBhIENSVUQgcmVxdWVzdC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2VOYW1lIC0gVGhlIHVuaXF1ZSBuYW1lIG9mIHRoZSByZXF1ZXN0LlxuICAgKiBAcGFyYW0ge1JlcXVlc3RQYXJhbWV0ZXJbXSB8IG9iamVjdH0gcmVxdWVzdFBhcmFtZXRlcnMgLSBBbiBhcnJheSBvZiBvYmplY3RzIHdpdGggdGhlIHBhcmFtZXRlciBuYW1lLCB0eXBlLCBhbmQgdmFsdWUuXG4gICAqIEBwYXJhbSB7RW50aXR5UmVmZXJlbmNlfSBbYm91bmRFbnRpdHldIC0gQW4gb3B0aW9uYWwgRW50aXR5UmVmZXJlbmNlIG9mIHRoZSBib3VuZCBlbnRpdHkuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59IC0gQSBQcm9taXNlIHdpdGggdGhlIHJlcXVlc3QgcmVzcG9uc2UuXG4gICAqIEB0aHJvd3Mge0Vycm9yfSAtIFRocm93cyBhbiBlcnJvciBpZiB0aGUgcmVxdWVzdCBwYXJhbWV0ZXIgaXMgbm90IG9mIGEgc3VwcG9ydGVkIHR5cGUgb3IgaGFzIGFuIGludmFsaWQgdmFsdWUuXG4gICAqL1xuICBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUNSVUQoXG4gICAgZnVuY3Rpb25OYW1lOiBzdHJpbmcsXG4gICAgcmVxdWVzdFBhcmFtZXRlcnM6IFJlcXVlc3RQYXJhbWV0ZXJbXSB8IG9iamVjdCxcbiAgICBib3VuZEVudGl0eT86IEVudGl0eVJlZmVyZW5jZVxuICApOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBhd2FpdCBleGVjdXRlKGZ1bmN0aW9uTmFtZSwgcmVxdWVzdFBhcmFtZXRlcnMsIGJvdW5kRW50aXR5LCAyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYWtlcyBhIEdVSUQgbG93ZXJjYXNlIGFuZCByZW1vdmVzIGJyYWNrZXRzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZ3VpZCAtIFRoZSBHVUlEIHRvIG5vcm1hbGl6ZS5cbiAgICogQHJldHVybnMge3N0cmluZ30gLSBUaGUgbm9ybWFsaXplZCBHVUlELlxuICAgKi9cbiAgZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZUd1aWQoZ3VpZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAodHlwZW9mIGd1aWQgIT09IFwic3RyaW5nXCIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4Lm5vcm1hbGl6ZUd1aWQ6XFxuJyR7Z3VpZH0nIGlzIG5vdCBhIHN0cmluZ2ApO1xuICAgIHJldHVybiBndWlkLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW3t9XS9nLCBcIlwiKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXcmFwcyBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYSBjYWxsYmFjayBhcyBpdHMgbGFzdCBwYXJhbWV0ZXIgYW5kIHJldHVybnMgYSBQcm9taXNlLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiB0aGUgZnVuY3Rpb24gdG8gd3JhcFxuICAgKiBAcGFyYW0gY29udGV4dCB0aGUgcGFyZW50IHByb3BlcnR5IG9mIHRoZSBmdW5jdGlvbiBmLmUuIGZvcm1Db250ZXh0LmRhdGEucHJvY2VzcyBmb3IgZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLmdldEVuYWJsZWRQcm9jZXNzZXNcbiAgICogQHBhcmFtIGFyZ3MgdGhlIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBmdW5jdGlvblxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fSBhIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBjYWxsYmFjayByZXNwb25zZVxuICAgKi9cbiAgZXhwb3J0IGZ1bmN0aW9uIGFzUHJvbWlzZTxUPihmbjogRnVuY3Rpb24sIGNvbnRleHQsIC4uLmFyZ3MpOiBQcm9taXNlPFQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgY2FsbGJhY2sgPSAocmVzcG9uc2U6IFQpID0+IHtcbiAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICB9O1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQ2FsbCB0aGUgZnVuY3Rpb24gd2l0aCB0aGUgYXJndW1lbnRzIGFuZCB0aGUgY2FsbGJhY2sgYXQgdGhlIGVuZFxuICAgICAgICBmbi5jYWxsKGNvbnRleHQsIC4uLmFyZ3MsIGNhbGxiYWNrKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgLyoqXG4gICAqIE9wZW5zIGEgZGlhbG9nIHdpdGggZHluYW1pYyBoZWlnaHQgYW5kIHdpZHRoIGJhc2VkIG9uIHRleHQgY29udGVudC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlIC0gVGhlIHRpdGxlIG9mIHRoZSBkaWFsb2cuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gVGhlIHRleHQgY29udGVudCBvZiB0aGUgZGlhbG9nLlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fSAtIEEgUHJvbWlzZSB3aXRoIHRoZSBkaWFsb2cgcmVzcG9uc2UuXG4gICAqL1xuICBleHBvcnQgYXN5bmMgZnVuY3Rpb24gb3BlbkFsZXJ0RGlhbG9nKFxuICAgIHRpdGxlOiBzdHJpbmcsXG4gICAgdGV4dDogc3RyaW5nXG4gICk6IFByb21pc2U8YW55PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJvd3MgPSB0ZXh0LnNwbGl0KC9cXHJcXG58XFxyfFxcbi8pO1xuICAgICAgbGV0IGFkZGl0aW9uYWxSb3dzID0gMDtcbiAgICAgIHJvd3MuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgICAgIGxldCB3aWR0aCA9IGdldFRleHRXaWR0aChcbiAgICAgICAgICByb3csXG4gICAgICAgICAgXCIxcmVtIFNlZ29lIFVJIFJlZ3VsYXIsIFNlZ29lVUksIFNlZ29lIFVJXCJcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHdpZHRoID4gOTQwKSB7XG4gICAgICAgICAgYWRkaXRpb25hbFJvd3MgKz0gd2lkdGggLyA5NDA7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgY29uc3QgbG9uZ2VzdFJvdyA9IHJvd3MucmVkdWNlKFxuICAgICAgICAoYWNjLCByb3cpID0+IChyb3cubGVuZ3RoID4gYWNjLmxlbmd0aCA/IHJvdyA6IGFjYyksXG4gICAgICAgIFwiXCJcbiAgICAgICk7XG4gICAgICBjb25zdCB3aWR0aCA9IE1hdGgubWluKFxuICAgICAgICBnZXRUZXh0V2lkdGgobG9uZ2VzdFJvdywgXCIxcmVtIFNlZ29lIFVJIFJlZ3VsYXIsIFNlZ29lVUksIFNlZ29lIFVJXCIpLFxuICAgICAgICAxMDAwXG4gICAgICApO1xuICAgICAgY29uc3QgaGVpZ2h0ID0gMTA5ICsgKHJvd3MubGVuZ3RoICsgYWRkaXRpb25hbFJvd3MpICogMjA7XG4gICAgICByZXR1cm4gYXdhaXQgWHJtLk5hdmlnYXRpb24ub3BlbkFsZXJ0RGlhbG9nKFxuICAgICAgICB7XG4gICAgICAgICAgY29uZmlybUJ1dHRvbkxhYmVsOiBcIk9rXCIsXG4gICAgICAgICAgdGV4dCxcbiAgICAgICAgICB0aXRsZSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICB3aWR0aCxcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycm9yLm1lc3NhZ2UpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke2dldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVzZXMgY2FudmFzLm1lYXN1cmVUZXh0IHRvIGNvbXB1dGUgYW5kIHJldHVybiB0aGUgd2lkdGggb2YgdGhlIGdpdmVuIHRleHQgb2YgZ2l2ZW4gZm9udCBpbiBwaXhlbHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdGV4dCBUaGUgdGV4dCB0byBiZSByZW5kZXJlZC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZm9udCBUaGUgY3NzIGZvbnQgZGVzY3JpcHRvciB0aGF0IHRleHQgaXMgdG8gYmUgcmVuZGVyZWQgd2l0aCAoZS5nLiBcImJvbGQgMTRweCB2ZXJkYW5hXCIpLlxuICAgICAqXG4gICAgICogQHNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMTgyNDEvY2FsY3VsYXRlLXRleHQtd2lkdGgtd2l0aC1qYXZhc2NyaXB0LzIxMDE1MzkzIzIxMDE1MzkzXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0VGV4dFdpZHRoKHRleHQ6IHN0cmluZywgZm9udDogc3RyaW5nKSB7XG4gICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICBjb250ZXh0LmZvbnQgPSBmb250O1xuICAgICAgY29uc3QgbWV0cmljcyA9IGNvbnRleHQubWVhc3VyZVRleHQodGV4dCk7XG4gICAgICByZXR1cm4gbWV0cmljcy53aWR0aDtcbiAgICB9XG4gIH1cblxuICBleHBvcnQgY2xhc3MgUHJvY2VzcyB7XG4gICAgc3RhdGljIGdldCBkYXRhKCkge1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzO1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0IHVpKCkge1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQudWkucHJvY2VzcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXNlIHRoaXMgdG8gYWRkIGEgZnVuY3Rpb24gYXMgYW4gZXZlbnQgaGFuZGxlciBmb3IgdGhlIE9uUHJlUHJvY2Vzc1N0YXR1c0NoYW5nZSBldmVudCBzbyB0aGF0IGl0IHdpbGwgYmUgY2FsbGVkIGJlZm9yZSB0aGVcbiAgICAgKiBidXNpbmVzcyBwcm9jZXNzIGZsb3cgc3RhdHVzIGNoYW5nZXMuXG4gICAgICogQHBhcmFtIGhhbmRsZXIgVGhlIGZ1bmN0aW9uIHdpbGwgYmUgYWRkZWQgdG8gdGhlIGJvdHRvbSBvZiB0aGUgZXZlbnRcbiAgICAgKiAgICAgICAgICAgICAgICBoYW5kbGVyIHBpcGVsaW5lLiBUaGUgZXhlY3V0aW9uIGNvbnRleHQgaXMgYXV0b21hdGljYWxseVxuICAgICAqICAgICAgICAgICAgICAgIHNldCB0byBiZSB0aGUgZmlyc3QgcGFyYW1ldGVyIHBhc3NlZCB0byB0aGUgZXZlbnQgaGFuZGxlci5cbiAgICAgKiAgICAgICAgICAgICAgICBVc2UgYSByZWZlcmVuY2UgdG8gYSBuYW1lZCBmdW5jdGlvbiByYXRoZXIgdGhhbiBhblxuICAgICAqICAgICAgICAgICAgICAgIGFub255bW91cyBmdW5jdGlvbiBpZiB5b3UgbWF5IGxhdGVyIHdhbnQgdG8gcmVtb3ZlIHRoZVxuICAgICAqICAgICAgICAgICAgICAgIGV2ZW50IGhhbmRsZXIuXG4gICAgICovXG4gICAgc3RhdGljIGFkZE9uUHJlUHJvY2Vzc1N0YXR1c0NoYW5nZShcbiAgICAgIGhhbmRsZXI6IFhybS5FdmVudHMuUHJvY2Vzc1N0YXR1c0NoYW5nZUhhbmRsZXJcbiAgICApIHtcbiAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLnJlbW92ZU9uUHJlUHJvY2Vzc1N0YXR1c0NoYW5nZShoYW5kbGVyKTtcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5hZGRPblByZVByb2Nlc3NTdGF0dXNDaGFuZ2UoaGFuZGxlcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVzZSB0aGlzIHRvIGFkZCBhIGZ1bmN0aW9uIGFzIGFuIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBPblByZVN0YWdlQ2hhbmdlIGV2ZW50IHNvIHRoYXQgaXQgd2lsbCBiZSBjYWxsZWQgYmVmb3JlIHRoZVxuICAgICAqIGJ1c2luZXNzIHByb2Nlc3MgZmxvdyBzdGFnZSBjaGFuZ2VzLlxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGFkZGVkIHRvIHRoZSBib3R0b20gb2YgdGhlIGV2ZW50XG4gICAgICogICAgICAgICAgICAgICAgaGFuZGxlciBwaXBlbGluZS4gVGhlIGV4ZWN1dGlvbiBjb250ZXh0IGlzIGF1dG9tYXRpY2FsbHlcbiAgICAgKiAgICAgICAgICAgICAgICBzZXQgdG8gYmUgdGhlIGZpcnN0IHBhcmFtZXRlciBwYXNzZWQgdG8gdGhlIGV2ZW50IGhhbmRsZXIuXG4gICAgICogICAgICAgICAgICAgICAgVXNlIGEgcmVmZXJlbmNlIHRvIGEgbmFtZWQgZnVuY3Rpb24gcmF0aGVyIHRoYW4gYW5cbiAgICAgKiAgICAgICAgICAgICAgICBhbm9ueW1vdXMgZnVuY3Rpb24gaWYgeW91IG1heSBsYXRlciB3YW50IHRvIHJlbW92ZSB0aGVcbiAgICAgKiAgICAgICAgICAgICAgICBldmVudCBoYW5kbGVyLlxuICAgICAqL1xuICAgIHN0YXRpYyBhZGRPblByZVN0YWdlQ2hhbmdlKGhhbmRsZXI6IFhybS5FdmVudHMuU3RhZ2VDaGFuZ2VFdmVudEhhbmRsZXIpIHtcbiAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLnJlbW92ZU9uUHJlU3RhZ2VDaGFuZ2UoaGFuZGxlcik7XG4gICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MuYWRkT25QcmVTdGFnZUNoYW5nZShoYW5kbGVyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXNlIHRoaXMgdG8gYWRkIGEgZnVuY3Rpb24gYXMgYW4gZXZlbnQgaGFuZGxlciBmb3IgdGhlIE9uUHJlUHJvY2Vzc1N0YXR1c0NoYW5nZSBldmVudCBzbyB0aGF0IGl0IHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhlXG4gICAgICogYnVzaW5lc3MgcHJvY2VzcyBmbG93IHN0YXR1cyBjaGFuZ2VzLlxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGFkZGVkIHRvIHRoZSBib3R0b20gb2YgdGhlIGV2ZW50XG4gICAgICogICAgICAgICAgICAgICAgaGFuZGxlciBwaXBlbGluZS4gVGhlIGV4ZWN1dGlvbiBjb250ZXh0IGlzIGF1dG9tYXRpY2FsbHlcbiAgICAgKiAgICAgICAgICAgICAgICBzZXQgdG8gYmUgdGhlIGZpcnN0IHBhcmFtZXRlciBwYXNzZWQgdG8gdGhlIGV2ZW50IGhhbmRsZXIuXG4gICAgICogICAgICAgICAgICAgICAgVXNlIGEgcmVmZXJlbmNlIHRvIGEgbmFtZWQgZnVuY3Rpb24gcmF0aGVyIHRoYW4gYW5cbiAgICAgKiAgICAgICAgICAgICAgICBhbm9ueW1vdXMgZnVuY3Rpb24gaWYgeW91IG1heSBsYXRlciB3YW50IHRvIHJlbW92ZSB0aGVcbiAgICAgKiAgICAgICAgICAgICAgICBldmVudCBoYW5kbGVyLlxuICAgICAqL1xuICAgIHN0YXRpYyBhZGRPblByb2Nlc3NTdGF0dXNDaGFuZ2UoXG4gICAgICBoYW5kbGVyOiBYcm0uRXZlbnRzLlByb2Nlc3NTdGF0dXNDaGFuZ2VIYW5kbGVyXG4gICAgKSB7XG4gICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5yZW1vdmVPblByb2Nlc3NTdGF0dXNDaGFuZ2UoaGFuZGxlcik7XG4gICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MuYWRkT25Qcm9jZXNzU3RhdHVzQ2hhbmdlKGhhbmRsZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVc2UgdGhpcyB0byBhZGQgYSBmdW5jdGlvbiBhcyBhbiBldmVudCBoYW5kbGVyIGZvciB0aGUgT25TdGFnZUNoYW5nZSBldmVudCBzbyB0aGF0IGl0IHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhlXG4gICAgICogYnVzaW5lc3MgcHJvY2VzcyBmbG93IHN0YWdlIGNoYW5nZXMuXG4gICAgICogQHBhcmFtIGhhbmRsZXIgVGhlIGZ1bmN0aW9uIHdpbGwgYmUgYWRkZWQgdG8gdGhlIGJvdHRvbSBvZiB0aGUgZXZlbnRcbiAgICAgKiAgICAgICAgICAgICAgICBoYW5kbGVyIHBpcGVsaW5lLiBUaGUgZXhlY3V0aW9uIGNvbnRleHQgaXMgYXV0b21hdGljYWxseVxuICAgICAqICAgICAgICAgICAgICAgIHNldCB0byBiZSB0aGUgZmlyc3QgcGFyYW1ldGVyIHBhc3NlZCB0byB0aGUgZXZlbnQgaGFuZGxlci5cbiAgICAgKiAgICAgICAgICAgICAgICBVc2UgYSByZWZlcmVuY2UgdG8gYSBuYW1lZCBmdW5jdGlvbiByYXRoZXIgdGhhbiBhblxuICAgICAqICAgICAgICAgICAgICAgIGFub255bW91cyBmdW5jdGlvbiBpZiB5b3UgbWF5IGxhdGVyIHdhbnQgdG8gcmVtb3ZlIHRoZVxuICAgICAqICAgICAgICAgICAgICAgIGV2ZW50IGhhbmRsZXIuXG4gICAgICovXG4gICAgc3RhdGljIGFkZE9uU3RhZ2VDaGFuZ2UoaGFuZGxlcjogWHJtLkV2ZW50cy5TdGFnZUNoYW5nZUV2ZW50SGFuZGxlcikge1xuICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MucmVtb3ZlT25TdGFnZUNoYW5nZShoYW5kbGVyKTtcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5hZGRPblN0YWdlQ2hhbmdlKGhhbmRsZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVc2UgdGhpcyB0byBhZGQgYSBmdW5jdGlvbiBhcyBhbiBldmVudCBoYW5kbGVyIGZvciB0aGUgT25TdGFnZVNlbGVjdGVkIGV2ZW50IHNvIHRoYXQgaXQgd2lsbCBiZSBjYWxsZWRcbiAgICAgKiB3aGVuIGEgYnVzaW5lc3MgcHJvY2VzcyBmbG93IHN0YWdlIGlzIHNlbGVjdGVkLlxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGFkZGVkIHRvIHRoZSBib3R0b20gb2YgdGhlIGV2ZW50XG4gICAgICogICAgICAgICAgICAgICAgaGFuZGxlciBwaXBlbGluZS4gVGhlIGV4ZWN1dGlvbiBjb250ZXh0IGlzIGF1dG9tYXRpY2FsbHlcbiAgICAgKiAgICAgICAgICAgICAgICBzZXQgdG8gYmUgdGhlIGZpcnN0IHBhcmFtZXRlciBwYXNzZWQgdG8gdGhlIGV2ZW50IGhhbmRsZXIuXG4gICAgICogICAgICAgICAgICAgICAgVXNlIGEgcmVmZXJlbmNlIHRvIGEgbmFtZWQgZnVuY3Rpb24gcmF0aGVyIHRoYW4gYW5cbiAgICAgKiAgICAgICAgICAgICAgICBhbm9ueW1vdXMgZnVuY3Rpb24gaWYgeW91IG1heSBsYXRlciB3YW50IHRvIHJlbW92ZSB0aGVcbiAgICAgKiAgICAgICAgICAgICAgICBldmVudCBoYW5kbGVyLlxuICAgICAqL1xuICAgIHN0YXRpYyBhZGRPblN0YWdlU2VsZWN0ZWQoaGFuZGxlcjogWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlcikge1xuICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MucmVtb3ZlT25TdGFnZVNlbGVjdGVkKGhhbmRsZXIpO1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLmFkZE9uU3RhZ2VTZWxlY3RlZChoYW5kbGVyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXNlIHRoaXMgdG8gcmVtb3ZlIGEgZnVuY3Rpb24gYXMgYW4gZXZlbnQgaGFuZGxlciBmb3IgdGhlIE9uUHJlUHJvY2Vzc1N0YXR1c0NoYW5nZSBldmVudC5cbiAgICAgKiBAcGFyYW0gaGFuZGxlciBJZiBhbiBhbm9ueW1vdXMgZnVuY3Rpb24gaXMgc2V0IHVzaW5nIHRoZSBhZGRPblByZVByb2Nlc3NTdGF0dXNDaGFuZ2UgbWV0aG9kIGl0XG4gICAgICogICAgICAgICAgICAgICAgY2Fubm90IGJlIHJlbW92ZWQgdXNpbmcgdGhpcyBtZXRob2QuXG4gICAgICovXG4gICAgc3RhdGljIHJlbW92ZU9uUHJlUHJvY2Vzc1N0YXR1c0NoYW5nZShcbiAgICAgIGhhbmRsZXI6IFhybS5FdmVudHMuUHJvY2Vzc1N0YXR1c0NoYW5nZUhhbmRsZXJcbiAgICApIHtcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5yZW1vdmVPblByZVByb2Nlc3NTdGF0dXNDaGFuZ2UoXG4gICAgICAgIGhhbmRsZXJcbiAgICAgICk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVzZSB0aGlzIHRvIHJlbW92ZSBhIGZ1bmN0aW9uIGFzIGFuIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBPblByZVN0YWdlQ2hhbmdlIGV2ZW50LlxuICAgICAqIEBwYXJhbSBoYW5kbGVyIElmIGFuIGFub255bW91cyBmdW5jdGlvbiBpcyBzZXQgdXNpbmcgdGhlIGFkZE9uUHJlU3RhZ2VDaGFuZ2UgbWV0aG9kIGl0XG4gICAgICogICAgICAgICAgICAgICAgY2Fubm90IGJlIHJlbW92ZWQgdXNpbmcgdGhpcyBtZXRob2QuXG4gICAgICovXG4gICAgc3RhdGljIHJlbW92ZU9uUHJlU3RhZ2VDaGFuZ2UoaGFuZGxlcjogWHJtLkV2ZW50cy5TdGFnZUNoYW5nZUV2ZW50SGFuZGxlcikge1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLnJlbW92ZU9uUHJlU3RhZ2VDaGFuZ2UoaGFuZGxlcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVzZSB0aGlzIHRvIHJlbW92ZSBhIGZ1bmN0aW9uIGFzIGFuIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBPblByb2Nlc3NTdGF0dXNDaGFuZ2UgZXZlbnQuXG4gICAgICogQHBhcmFtIGhhbmRsZXIgSWYgYW4gYW5vbnltb3VzIGZ1bmN0aW9uIGlzIHNldCB1c2luZyB0aGUgYWRkT25Qcm9jZXNzU3RhdHVzQ2hhbmdlIG1ldGhvZCBpdFxuICAgICAqICAgICAgICAgICAgICAgIGNhbm5vdCBiZSByZW1vdmVkIHVzaW5nIHRoaXMgbWV0aG9kLlxuICAgICAqL1xuICAgIHN0YXRpYyByZW1vdmVPblByb2Nlc3NTdGF0dXNDaGFuZ2UoXG4gICAgICBoYW5kbGVyOiBYcm0uRXZlbnRzLlByb2Nlc3NTdGF0dXNDaGFuZ2VIYW5kbGVyXG4gICAgKSB7XG4gICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MucmVtb3ZlT25Qcm9jZXNzU3RhdHVzQ2hhbmdlKGhhbmRsZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVc2UgdGhpcyB0byByZW1vdmUgYSBmdW5jdGlvbiBhcyBhbiBldmVudCBoYW5kbGVyIGZvciB0aGUgT25TdGFnZUNoYW5nZSBldmVudC5cbiAgICAgKiBAcGFyYW0gaGFuZGxlciBJZiBhbiBhbm9ueW1vdXMgZnVuY3Rpb24gaXMgc2V0IHVzaW5nIHRoZSBhZGRPblN0YWdlQ2hhbmdlIG1ldGhvZCBpdFxuICAgICAqICAgICAgICAgICAgICAgIGNhbm5vdCBiZSByZW1vdmVkIHVzaW5nIHRoaXMgbWV0aG9kLlxuICAgICAqL1xuICAgIHN0YXRpYyByZW1vdmVPblN0YWdlQ2hhbmdlKGhhbmRsZXI6IFhybS5FdmVudHMuU3RhZ2VDaGFuZ2VFdmVudEhhbmRsZXIpIHtcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5yZW1vdmVPblN0YWdlQ2hhbmdlKGhhbmRsZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVc2UgdGhpcyB0byByZW1vdmUgYSBmdW5jdGlvbiBhcyBhbiBldmVudCBoYW5kbGVyIGZvciB0aGUgT25TdGFnZUNoYW5nZSBldmVudC5cbiAgICAgKiBAcGFyYW0gaGFuZGxlciBJZiBhbiBhbm9ueW1vdXMgZnVuY3Rpb24gaXMgc2V0IHVzaW5nIHRoZSBhZGRPblN0YWdlQ2hhbmdlIG1ldGhvZCBpdFxuICAgICAqICAgICAgICAgICAgICAgIGNhbm5vdCBiZSByZW1vdmVkIHVzaW5nIHRoaXMgbWV0aG9kLlxuICAgICAqL1xuICAgIHN0YXRpYyByZW1vdmVPblN0YWdlU2VsZWN0ZWQoaGFuZGxlcjogWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlcikge1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLnJlbW92ZU9uU3RhZ2VTZWxlY3RlZChoYW5kbGVyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVc2UgdGhpcyBtZXRob2QgdG8gYXN5bmNocm9ub3VzbHkgcmV0cmlldmUgdGhlIGVuYWJsZWQgYnVzaW5lc3MgcHJvY2VzcyBmbG93cyB0aGF0IHRoZSB1c2VyIGNhbiBzd2l0Y2ggdG8gZm9yIGFuIGVudGl0eS5cbiAgICAgKiBAcmV0dXJucyByZXR1cm5zIGNhbGxiYWNrIHJlc3BvbnNlIGFzIFByb21pc2VcbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0RW5hYmxlZFByb2Nlc3NlcygpIHtcbiAgICAgIHJldHVybiBhc1Byb21pc2U8WHJtLlByb2Nlc3NGbG93LlByb2Nlc3NEaWN0aW9uYXJ5PihcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MuZ2V0RW5hYmxlZFByb2Nlc3NlcyxcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3NcbiAgICAgICk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYWxsIHByb2Nlc3MgaW5zdGFuY2VzIGZvciB0aGUgZW50aXR5IHJlY29yZCB0aGF0IHRoZSBjYWxsaW5nIHVzZXIgaGFzIGFjY2VzcyB0by5cbiAgICAgKiBAcmV0dXJucyByZXR1cm5zIGNhbGxiYWNrIHJlc3BvbnNlIGFzIFByb21pc2VcbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0UHJvY2Vzc0luc3RhbmNlcygpIHtcbiAgICAgIHJldHVybiBhc1Byb21pc2U8WHJtLlByb2Nlc3NGbG93LkdldFByb2Nlc3NJbnN0YW5jZXNEZWxlZ2F0ZT4oXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLmdldFByb2Nlc3NJbnN0YW5jZXMsXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzXG4gICAgICApO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQcm9ncmVzc2VzIHRvIHRoZSBuZXh0IHN0YWdlLlxuICAgICAqIEByZXR1cm5zIHJldHVybnMgY2FsbGJhY2sgcmVzcG9uc2UgYXMgUHJvbWlzZVxuICAgICAqL1xuICAgIHN0YXRpYyBtb3ZlTmV4dCgpIHtcbiAgICAgIHJldHVybiBhc1Byb21pc2U8WHJtLlByb2Nlc3NGbG93LlByb2Nlc3NDYWxsYmFja0RlbGVnYXRlPihcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MubW92ZU5leHQsXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzXG4gICAgICApO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBNb3ZlcyB0byB0aGUgcHJldmlvdXMgc3RhZ2UuXG4gICAgICogQHJldHVybnMgcmV0dXJucyBjYWxsYmFjayByZXNwb25zZSBhcyBQcm9taXNlXG4gICAgICovXG4gICAgc3RhdGljIG1vdmVQcmV2aW91cygpIHtcbiAgICAgIHJldHVybiBhc1Byb21pc2U8WHJtLlByb2Nlc3NGbG93LlByb2Nlc3NDYWxsYmFja0RlbGVnYXRlPihcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MubW92ZVByZXZpb3VzLFxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzc1xuICAgICAgKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0IGEgUHJvY2VzcyBhcyB0aGUgYWN0aXZlIHByb2Nlc3MuXG4gICAgICogQHBhcmFtIHByb2Nlc3NJZCBUaGUgSWQgb2YgdGhlIHByb2Nlc3MgdG8gbWFrZSB0aGUgYWN0aXZlIHByb2Nlc3MuXG4gICAgICogQHJldHVybnMgcmV0dXJucyBjYWxsYmFjayByZXNwb25zZSBhcyBQcm9taXNlXG4gICAgICovXG4gICAgc3RhdGljIHNldEFjdGl2ZVByb2Nlc3MocHJvY2Vzc0lkOiBzdHJpbmcpIHtcbiAgICAgIHJldHVybiBhc1Byb21pc2U8WHJtLlByb2Nlc3NGbG93LlByb2Nlc3NDYWxsYmFja0RlbGVnYXRlPihcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3Muc2V0QWN0aXZlUHJvY2VzcyxcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MsXG4gICAgICAgIHByb2Nlc3NJZFxuICAgICAgKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyBhIHByb2Nlc3MgaW5zdGFuY2UgYXMgdGhlIGFjdGl2ZSBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSBwcm9jZXNzSW5zdGFuY2VJZCBUaGUgSWQgb2YgdGhlIHByb2Nlc3MgaW5zdGFuY2UgdG8gbWFrZSB0aGUgYWN0aXZlIGluc3RhbmNlLlxuICAgICAqIEByZXR1cm5zIHJldHVybnMgY2FsbGJhY2sgcmVzcG9uc2UgYXMgUHJvbWlzZVxuICAgICAqL1xuICAgIHN0YXRpYyBzZXRBY3RpdmVQcm9jZXNzSW5zdGFuY2UocHJvY2Vzc0luc3RhbmNlSWQ6IHN0cmluZykge1xuICAgICAgcmV0dXJuIGFzUHJvbWlzZTxYcm0uUHJvY2Vzc0Zsb3cuU2V0UHJvY2Vzc0luc3RhbmNlRGVsZWdhdGU+KFxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5zZXRBY3RpdmVQcm9jZXNzSW5zdGFuY2UsXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLFxuICAgICAgICBwcm9jZXNzSW5zdGFuY2VJZFxuICAgICAgKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0IGEgc3RhZ2UgYXMgdGhlIGFjdGl2ZSBzdGFnZS5cbiAgICAgKiBAcGFyYW0gc3RhZ2VJZCB0aGUgSWQgb2YgdGhlIHN0YWdlIHRvIG1ha2UgdGhlIGFjdGl2ZSBzdGFnZS5cbiAgICAgKiBAcmV0dXJucyByZXR1cm5zIGNhbGxiYWNrIHJlc3BvbnNlIGFzIFByb21pc2VcbiAgICAgKi9cbiAgICBzdGF0aWMgc2V0QWN0aXZlU3RhZ2Uoc3RhZ2VJZDogc3RyaW5nKSB7XG4gICAgICByZXR1cm4gYXNQcm9taXNlPFhybS5Qcm9jZXNzRmxvdy5TZXRQcm9jZXNzSW5zdGFuY2VEZWxlZ2F0ZT4oXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLnNldEFjdGl2ZVN0YWdlLFxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2VzcyxcbiAgICAgICAgc3RhZ2VJZFxuICAgICAgKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXNlIHRoaXMgbWV0aG9kIHRvIHNldCB0aGUgY3VycmVudCBzdGF0dXMgb2YgdGhlIHByb2Nlc3MgaW5zdGFuY2VcbiAgICAgKiBAcGFyYW0gc3RhdHVzIFRoZSBuZXcgc3RhdHVzIGZvciB0aGUgcHJvY2Vzc1xuICAgICAqIEByZXR1cm5zIHJldHVybnMgY2FsbGJhY2sgcmVzcG9uc2UgYXMgUHJvbWlzZVxuICAgICAqL1xuICAgIHN0YXRpYyBzZXRTdGF0dXMoc3RhdHVzOiBYcm0uUHJvY2Vzc0Zsb3cuUHJvY2Vzc1N0YXR1cykge1xuICAgICAgcmV0dXJuIGFzUHJvbWlzZTxYcm0uUHJvY2Vzc0Zsb3cuU2V0UHJvY2Vzc0luc3RhbmNlRGVsZWdhdGU+KFxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5zZXRTdGF0dXMsXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLFxuICAgICAgICBzdGF0dXNcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGNsYXNzIEZpZWxkcyB7XG4gICAgLyoqXG4gICAgICogQWRkcyBhIGhhbmRsZXIgb3IgYW4gYXJyYXkgb2YgaGFuZGxlcnMgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGF0dHJpYnV0ZSdzIHZhbHVlIGlzIGNoYW5nZWQuXG4gICAgICogQHBhcmFtIGZpZWxkcyBBbiBhcnJheSBvZiBmaWVsZHMgdG8gb24gd2hpY2ggdGhpcyBtZXRob2Qgc2hvdWxkIGJlIGFwcGxpZWQuXG4gICAgICogQHBhcmFtIGhhbmRsZXJzIFRoZSBmdW5jdGlvbiByZWZlcmVuY2Ugb3IgYW4gYXJyYXkgb2YgZnVuY3Rpb24gcmVmZXJlbmNlcy5cbiAgICAgKi9cbiAgICBzdGF0aWMgYWRkT25DaGFuZ2UoXG4gICAgICBmaWVsZHM6IENsYXNzLkZpZWxkW10sXG4gICAgICBoYW5kbGVyOiBYcm0uRXZlbnRzLkF0dHJpYnV0ZS5DaGFuZ2VFdmVudEhhbmRsZXJcbiAgICApOiB2b2lkIHtcbiAgICAgIGZpZWxkcy5mb3JFYWNoKChmaWVsZCkgPT4ge1xuICAgICAgICBmaWVsZC5hZGRPbkNoYW5nZShoYW5kbGVyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBGaXJlIGFsbCBcIm9uIGNoYW5nZVwiIGV2ZW50IGhhbmRsZXJzLlxuICAgICAqIEBwYXJhbSBmaWVsZHMgQW4gYXJyYXkgb2YgZmllbGRzIHRvIG9uIHdoaWNoIHRoaXMgbWV0aG9kIHNob3VsZCBiZSBhcHBsaWVkLlxuICAgICAqL1xuICAgIHN0YXRpYyBmaXJlT25DaGFuZ2UoZmllbGRzOiBDbGFzcy5GaWVsZFtdKTogdm9pZCB7XG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgZmllbGQuZmlyZU9uQ2hhbmdlKCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgaGFuZGxlciBmcm9tIHRoZSBcIm9uIGNoYW5nZVwiIGV2ZW50LlxuICAgICAqIEBwYXJhbSBmaWVsZHMgQW4gYXJyYXkgb2YgZmllbGRzIHRvIG9uIHdoaWNoIHRoaXMgbWV0aG9kIHNob3VsZCBiZSBhcHBsaWVkLlxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFRoZSBoYW5kbGVyLlxuICAgICAqL1xuICAgIHN0YXRpYyByZW1vdmVPbkNoYW5nZShcbiAgICAgIGZpZWxkczogQ2xhc3MuRmllbGRbXSxcbiAgICAgIGhhbmRsZXI6IFhybS5FdmVudHMuQXR0cmlidXRlLkNoYW5nZUV2ZW50SGFuZGxlclxuICAgICk6IHZvaWQge1xuICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgIGZpZWxkLnJlbW92ZU9uQ2hhbmdlKGhhbmRsZXIpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHJlcXVpcmVkIGxldmVsLlxuICAgICAqIEBwYXJhbSBmaWVsZHMgQW4gYXJyYXkgb2YgZmllbGRzIHRvIG9uIHdoaWNoIHRoaXMgbWV0aG9kIHNob3VsZCBiZSBhcHBsaWVkLlxuICAgICAqIEBwYXJhbSByZXF1aXJlbWVudExldmVsIFRoZSByZXF1aXJlbWVudCBsZXZlbCwgYXMgZWl0aGVyIFwibm9uZVwiLCBcInJlcXVpcmVkXCIsIG9yIFwicmVjb21tZW5kZWRcIlxuICAgICAqL1xuICAgIHN0YXRpYyBzZXRSZXF1aXJlZExldmVsKFxuICAgICAgZmllbGRzOiBDbGFzcy5GaWVsZFtdLFxuICAgICAgcmVxdWlyZW1lbnRMZXZlbDogWHJtLkF0dHJpYnV0ZXMuUmVxdWlyZW1lbnRMZXZlbFxuICAgICk6IHZvaWQge1xuICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgIGZpZWxkLnNldFJlcXVpcmVkTGV2ZWwocmVxdWlyZW1lbnRMZXZlbCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgc3VibWl0IG1vZGUuXG4gICAgICogQHBhcmFtIGZpZWxkcyBBbiBhcnJheSBvZiBmaWVsZHMgdG8gb24gd2hpY2ggdGhpcyBtZXRob2Qgc2hvdWxkIGJlIGFwcGxpZWQuXG4gICAgICogQHBhcmFtIHN1Ym1pdE1vZGUgVGhlIHN1Ym1pdCBtb2RlLCBhcyBlaXRoZXIgXCJhbHdheXNcIiwgXCJuZXZlclwiLCBvciBcImRpcnR5XCIuXG4gICAgICogQGRlZmF1bHQgc3VibWl0TW9kZSBcImRpcnR5XCJcbiAgICAgKiBAc2VlIHtAbGluayBYcm1FbnVtLkF0dHJpYnV0ZVJlcXVpcmVtZW50TGV2ZWx9XG4gICAgICovXG4gICAgc3RhdGljIHNldFN1Ym1pdE1vZGUoXG4gICAgICBmaWVsZHM6IENsYXNzLkZpZWxkW10sXG4gICAgICBzdWJtaXRNb2RlOiBYcm0uU3VibWl0TW9kZVxuICAgICk6IHZvaWQge1xuICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgIGZpZWxkLnNldFN1Ym1pdE1vZGUoc3VibWl0TW9kZSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgdmFsdWUuXG4gICAgICogQHBhcmFtIGZpZWxkcyBBbiBhcnJheSBvZiBmaWVsZHMgdG8gb24gd2hpY2ggdGhpcyBtZXRob2Qgc2hvdWxkIGJlIGFwcGxpZWQuXG4gICAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZS5cbiAgICAgKiBAcmVtYXJrcyBBdHRyaWJ1dGVzIG9uIFF1aWNrIENyZWF0ZSBGb3JtcyB3aWxsIG5vdCBzYXZlIHZhbHVlcyBzZXQgd2l0aCB0aGlzIG1ldGhvZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgc2V0VmFsdWUoZmllbGRzOiBDbGFzcy5GaWVsZFtdLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgZmllbGQuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgYSB2YWx1ZSBmb3IgYSBjb2x1bW4gdG8gZGV0ZXJtaW5lIHdoZXRoZXIgaXQgaXMgdmFsaWQgb3IgaW52YWxpZCB3aXRoIGEgbWVzc2FnZVxuICAgICAqIEBwYXJhbSBmaWVsZHMgQW4gYXJyYXkgb2YgZmllbGRzIHRvIG9uIHdoaWNoIHRoaXMgbWV0aG9kIHNob3VsZCBiZSBhcHBsaWVkLlxuICAgICAqIEBwYXJhbSBpc1ZhbGlkIFNwZWNpZnkgZmFsc2UgdG8gc2V0IHRoZSBjb2x1bW4gdmFsdWUgdG8gaW52YWxpZCBhbmQgdHJ1ZSB0byBzZXQgdGhlIHZhbHVlIHRvIHZhbGlkLlxuICAgICAqIEBwYXJhbSBtZXNzYWdlIFRoZSBtZXNzYWdlIHRvIGRpc3BsYXkuXG4gICAgICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9sZWFybi5taWNyb3NvZnQuY29tL2VuLXVzL3Bvd2VyLWFwcHMvZGV2ZWxvcGVyL21vZGVsLWRyaXZlbi1hcHBzL2NsaWVudGFwaS9yZWZlcmVuY2UvYXR0cmlidXRlcy9zZXRpc3ZhbGlkIEV4dGVybmFsIExpbms6IHNldElzVmFsaWQgKENsaWVudCBBUEkgcmVmZXJlbmNlKX1cbiAgICAgKi9cbiAgICBzdGF0aWMgc2V0SXNWYWxpZChcbiAgICAgIGZpZWxkczogQ2xhc3MuRmllbGRbXSxcbiAgICAgIGlzVmFsaWQ6IGJvb2xlYW4sXG4gICAgICBtZXNzYWdlPzogc3RyaW5nXG4gICAgKTogdm9pZCB7XG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgZmllbGQuc2V0SXNWYWxpZChpc1ZhbGlkLCBtZXNzYWdlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSByZXF1aXJlZCBsZXZlbC5cbiAgICAgKiBAcGFyYW0gZmllbGRzIEFuIGFycmF5IG9mIGZpZWxkcyB0byBvbiB3aGljaCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgYXBwbGllZC5cbiAgICAgKiBAcGFyYW0gcmVxdWlyZWQgVGhlIHJlcXVpcmVtZW50IGxldmVsLCBhcyBlaXRoZXIgZmFsc2UgZm9yIFwibm9uZVwiIG9yIHRydWUgZm9yIFwicmVxdWlyZWRcIlxuICAgICAqL1xuICAgIHN0YXRpYyBzZXRSZXF1aXJlZChmaWVsZHM6IENsYXNzLkZpZWxkW10sIHJlcXVpcmVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgZmllbGQuc2V0UmVxdWlyZWQocmVxdWlyZWQpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHN0YXRlIG9mIHRoZSBjb250cm9sIHRvIGVpdGhlciBlbmFibGVkLCBvciBkaXNhYmxlZC5cbiAgICAgKiBAcGFyYW0gZmllbGRzIEFuIGFycmF5IG9mIGZpZWxkcyB0byBvbiB3aGljaCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgYXBwbGllZC5cbiAgICAgKiBAcGFyYW0gZGlzYWJsZWQgdHJ1ZSB0byBkaXNhYmxlLCBmYWxzZSB0byBlbmFibGUuXG4gICAgICovXG4gICAgc3RhdGljIHNldERpc2FibGVkKGZpZWxkczogQ2xhc3MuRmllbGRbXSwgZGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgIGZpZWxkcy5mb3JFYWNoKChmaWVsZCkgPT4ge1xuICAgICAgICBmaWVsZC5zZXREaXNhYmxlZChkaXNhYmxlZCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgdmlzaWJpbGl0eSBzdGF0ZS5cbiAgICAgKiBAcGFyYW0gZmllbGRzIEFuIGFycmF5IG9mIGZpZWxkcyB0byBvbiB3aGljaCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgYXBwbGllZC5cbiAgICAgKiBAcGFyYW0gdmlzaWJsZSB0cnVlIHRvIHNob3csIGZhbHNlIHRvIGhpZGUuXG4gICAgICovXG4gICAgc3RhdGljIHNldFZpc2libGUoZmllbGRzOiBDbGFzcy5GaWVsZFtdLCB2aXNpYmxlOiBib29sZWFuKTogdm9pZCB7XG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgZmllbGQuc2V0VmlzaWJsZSh2aXNpYmxlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIGEgY29udHJvbC1sb2NhbCBub3RpZmljYXRpb24gbWVzc2FnZS5cbiAgICAgKiBAcGFyYW0gZmllbGRzIEFuIGFycmF5IG9mIGZpZWxkcyB0byBvbiB3aGljaCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgYXBwbGllZC5cbiAgICAgKiBAcGFyYW0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAgICAgKiBAcGFyYW0gdW5pcXVlSWQgVW5pcXVlIGlkZW50aWZpZXIuXG4gICAgICogQHJldHVybnMgdHJ1ZSBpZiBpdCBzdWNjZWVkcywgZmFsc2UgaWYgaXQgZmFpbHMuXG4gICAgICogQHJlbWFya3MgICAgIFdoZW4gdGhpcyBtZXRob2QgaXMgdXNlZCBvbiBNaWNyb3NvZnQgRHluYW1pY3MgQ1JNIGZvciB0YWJsZXRzIGEgcmVkIFwiWFwiIGljb25cbiAgICAgKiAgICAgICAgICAgICAgYXBwZWFycyBuZXh0IHRvIHRoZSBjb250cm9sLiBUYXBwaW5nIG9uIHRoZSBpY29uIHdpbGwgZGlzcGxheSB0aGUgbWVzc2FnZS5cbiAgICAgKi9cbiAgICBzdGF0aWMgc2V0Tm90aWZpY2F0aW9uKFxuICAgICAgZmllbGRzOiBDbGFzcy5GaWVsZFtdLFxuICAgICAgbWVzc2FnZTogc3RyaW5nLFxuICAgICAgdW5pcXVlSWQ6IHN0cmluZ1xuICAgICk6IHZvaWQge1xuICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgIGZpZWxkLnNldE5vdGlmaWNhdGlvbihtZXNzYWdlLCB1bmlxdWVJZCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGlzcGxheXMgYW4gZXJyb3Igb3IgcmVjb21tZW5kYXRpb24gbm90aWZpY2F0aW9uIGZvciBhIGNvbnRyb2wsIGFuZCBsZXRzIHlvdSBzcGVjaWZ5IGFjdGlvbnMgdG8gZXhlY3V0ZSBiYXNlZCBvbiB0aGUgbm90aWZpY2F0aW9uLlxuICAgICAqIEBwYXJhbSBmaWVsZHMgQW4gYXJyYXkgb2YgZmllbGRzIHRvIG9uIHdoaWNoIHRoaXMgbWV0aG9kIHNob3VsZCBiZSBhcHBsaWVkLlxuICAgICAqL1xuICAgIHN0YXRpYyBhZGROb3RpZmljYXRpb24oXG4gICAgICBmaWVsZHM6IENsYXNzLkZpZWxkW10sXG4gICAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgICBub3RpZmljYXRpb25MZXZlbDogXCJFUlJPUlwiIHwgXCJSRUNPTU1FTkRBVElPTlwiLFxuICAgICAgdW5pcXVlSWQ6IHN0cmluZyxcbiAgICAgIGFjdGlvbnM/OiBYcm0uQ29udHJvbHMuQ29udHJvbE5vdGlmaWNhdGlvbkFjdGlvbltdXG4gICAgKTogdm9pZCB7XG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgZmllbGQuYWRkTm90aWZpY2F0aW9uKG1lc3NhZ2UsIG5vdGlmaWNhdGlvbkxldmVsLCB1bmlxdWVJZCwgYWN0aW9ucyk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2xlYXJzIHRoZSBub3RpZmljYXRpb24gaWRlbnRpZmllZCBieSB1bmlxdWVJZC5cbiAgICAgKiBAcGFyYW0gZmllbGRzIEFuIGFycmF5IG9mIGZpZWxkcyB0byBvbiB3aGljaCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgYXBwbGllZC5cbiAgICAgKiBAcGFyYW0gdW5pcXVlSWQgKE9wdGlvbmFsKSBVbmlxdWUgaWRlbnRpZmllci5cbiAgICAgKiBAcmV0dXJucyB0cnVlIGlmIGl0IHN1Y2NlZWRzLCBmYWxzZSBpZiBpdCBmYWlscy5cbiAgICAgKiBAcmVtYXJrcyBJZiB0aGUgdW5pcXVlSWQgcGFyYW1ldGVyIGlzIG5vdCB1c2VkLCB0aGUgY3VycmVudCBub3RpZmljYXRpb24gc2hvd24gd2lsbCBiZSByZW1vdmVkLlxuICAgICAqL1xuICAgIHN0YXRpYyByZW1vdmVOb3RpZmljYXRpb24oZmllbGRzOiBDbGFzcy5GaWVsZFtdLCB1bmlxdWVJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgZmllbGQucmVtb3ZlTm90aWZpY2F0aW9uKHVuaXF1ZUlkKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXByZXNlbnRzIGEgZm9ybSBpbiBEeW5hbWljcyAzNjUuXG4gICAqL1xuICBleHBvcnQgY2xhc3MgRm9ybSB7XG4gICAgcHJvdGVjdGVkIHN0YXRpYyBfZm9ybUNvbnRleHQ6IFhybS5Gb3JtQ29udGV4dDtcbiAgICBwcm90ZWN0ZWQgc3RhdGljIF9leGVjdXRpb25Db250ZXh0OiBYcm0uRXZlbnRzLkV2ZW50Q29udGV4dDtcbiAgICBjb25zdHJ1Y3RvcigpIHsgfVxuICAgIC8qKkdldHMgYSByZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgZm9ybSBjb250ZXh0Ki9cbiAgICBzdGF0aWMgZ2V0IGZvcm1Db250ZXh0KCk6IFhybS5Gb3JtQ29udGV4dCB7XG4gICAgICByZXR1cm4gdGhpcy5fZm9ybUNvbnRleHQ7XG4gICAgfVxuICAgIC8qKkdldHMgYSByZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgZXhlY3V0aW8gY29udGV4dCovXG4gICAgc3RhdGljIGdldCBleGVjdXRpb25Db250ZXh0KCk6IFhybS5FdmVudHMuRXZlbnRDb250ZXh0IHtcbiAgICAgIHJldHVybiB0aGlzLl9leGVjdXRpb25Db250ZXh0O1xuICAgIH1cbiAgICAvKipHZXRzIGEgbG9va3VwIHZhbHVlIHRoYXQgcmVmZXJlbmNlcyB0aGUgcmVjb3JkLiovXG4gICAgc3RhdGljIGdldCBlbnRpdHlSZWZlcmVuY2UoKSB7XG4gICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC5kYXRhLmVudGl0eS5nZXRFbnRpdHlSZWZlcmVuY2UoKTtcbiAgICB9XG4gICAgLyoqU2V0cyBhIHJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBmb3JtIGNvbnRleHQqL1xuICAgIHN0YXRpYyBzZXQgZm9ybUNvbnRleHQoY29udGV4dDogWHJtLkZvcm1Db250ZXh0IHwgWHJtLkV2ZW50cy5FdmVudENvbnRleHQpIHtcbiAgICAgIGlmICghY29udGV4dClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBYcm1FeC5Gb3JtLnNldEZvcm1Db250ZXh0OiBUaGUgZXhlY3V0aW9uQ29udGV4dCBvciBmb3JtQ29udGV4dCB3YXMgbm90IHBhc3NlZCB0byB0aGUgZnVuY3Rpb24uYFxuICAgICAgICApO1xuICAgICAgaWYgKFwiZ2V0Rm9ybUNvbnRleHRcIiBpbiBjb250ZXh0KSB7XG4gICAgICAgIHRoaXMuX2V4ZWN1dGlvbkNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICB0aGlzLl9mb3JtQ29udGV4dCA9IGNvbnRleHQuZ2V0Rm9ybUNvbnRleHQoKTtcbiAgICAgIH0gZWxzZSBpZiAoXCJkYXRhXCIgaW4gY29udGV4dCkgdGhpcy5fZm9ybUNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgZWxzZVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFhybUV4LkZvcm0uc2V0Rm9ybUNvbnRleHQ6IFRoZSBwYXNzZWQgY29udGV4dCBpcyBub3QgYW4gZXhlY3V0aW9uQ29udGV4dCBvciBmb3JtQ29udGV4dC5gXG4gICAgICAgICk7XG4gICAgfVxuICAgIC8qKlNldHMgYSByZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgZXhlY3V0aW9uIGNvbnRleHQqL1xuICAgIHN0YXRpYyBzZXQgZXhlY3V0aW9uQ29udGV4dChcbiAgICAgIGNvbnRleHQ6IFhybS5Gb3JtQ29udGV4dCB8IFhybS5FdmVudHMuRXZlbnRDb250ZXh0XG4gICAgKSB7XG4gICAgICBpZiAoIWNvbnRleHQpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgWHJtRXguRm9ybS5zZXRFeGVjdXRpb25Db250ZXh0OiBUaGUgZXhlY3V0aW9uQ29udGV4dCBvciBmb3JtQ29udGV4dCB3YXMgbm90IHBhc3NlZCB0byB0aGUgZnVuY3Rpb24uYFxuICAgICAgICApO1xuICAgICAgaWYgKFwiZ2V0Rm9ybUNvbnRleHRcIiBpbiBjb250ZXh0KSB7XG4gICAgICAgIHRoaXMuX2V4ZWN1dGlvbkNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICB0aGlzLl9mb3JtQ29udGV4dCA9IGNvbnRleHQuZ2V0Rm9ybUNvbnRleHQoKTtcbiAgICAgIH0gZWxzZSBpZiAoXCJkYXRhXCIgaW4gY29udGV4dCkgdGhpcy5fZm9ybUNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgZWxzZVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFhybUV4LkZvcm0uc2V0RXhlY3V0aW9uQ29udGV4dDogVGhlIHBhc3NlZCBjb250ZXh0IGlzIG5vdCBhbiBleGVjdXRpb25Db250ZXh0IG9yIGZvcm1Db250ZXh0LmBcbiAgICAgICAgKTtcbiAgICB9XG4gICAgLyoqUmV0dXJucyB0cnVlIGlmIGZvcm0gaXMgZnJvbSB0eXBlIGNyZWF0ZSovXG4gICAgc3RhdGljIGdldCBJc0NyZWF0ZSgpIHtcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LnVpLmdldEZvcm1UeXBlKCkgPT0gMTtcbiAgICB9XG4gICAgLyoqUmV0dXJucyB0cnVlIGlmIGZvcm0gaXMgZnJvbSB0eXBlIHVwZGF0ZSovXG4gICAgc3RhdGljIGdldCBJc1VwZGF0ZSgpIHtcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LnVpLmdldEZvcm1UeXBlKCkgPT0gMjtcbiAgICB9XG4gICAgLyoqUmV0dXJucyB0cnVlIGlmIGZvcm0gaXMgbm90IGZyb20gdHlwZSBjcmVhdGUqL1xuICAgIHN0YXRpYyBnZXQgSXNOb3RDcmVhdGUoKSB7XG4gICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC51aS5nZXRGb3JtVHlwZSgpICE9IDE7XG4gICAgfVxuICAgIC8qKlJldHVybnMgdHJ1ZSBpZiBmb3JtIGlzIG5vdCBmcm9tIHR5cGUgdXBkYXRlKi9cbiAgICBzdGF0aWMgZ2V0IElzTm90VXBkYXRlKCkge1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQudWkuZ2V0Rm9ybVR5cGUoKSAhPSAyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERpc3BsYXlzIGEgZm9ybSBsZXZlbCBub3RpZmljYXRpb24uIEFueSBudW1iZXIgb2Ygbm90aWZpY2F0aW9ucyBjYW4gYmUgZGlzcGxheWVkIGFuZCB3aWxsIHJlbWFpbiB1bnRpbCByZW1vdmVkIHVzaW5nIGNsZWFyRm9ybU5vdGlmaWNhdGlvbi5cbiAgICAgKiBUaGUgaGVpZ2h0IG9mIHRoZSBub3RpZmljYXRpb24gYXJlYSBpcyBsaW1pdGVkIHNvIGVhY2ggbmV3IG1lc3NhZ2Ugd2lsbCBiZSBhZGRlZCB0byB0aGUgdG9wLlxuICAgICAqIEBwYXJhbSBtZXNzYWdlIFRoZSB0ZXh0IG9mIHRoZSBub3RpZmljYXRpb24gbWVzc2FnZS5cbiAgICAgKiBAcGFyYW0gbGV2ZWwgVGhlIGxldmVsIG9mIHRoZSBub3RpZmljYXRpb24gd2hpY2ggZGVmaW5lcyBob3cgdGhlIG1lc3NhZ2Ugd2lsbCBiZSBkaXNwbGF5ZWQsIHN1Y2ggYXMgdGhlIGljb24uXG4gICAgICogRVJST1I6IE5vdGlmaWNhdGlvbiB3aWxsIHVzZSB0aGUgc3lzdGVtIGVycm9yIGljb24uXG4gICAgICogV0FSTklORzogTm90aWZpY2F0aW9uIHdpbGwgdXNlIHRoZSBzeXN0ZW0gd2FybmluZyBpY29uLlxuICAgICAqIElORk86IE5vdGlmaWNhdGlvbiB3aWxsIHVzZSB0aGUgc3lzdGVtIGluZm8gaWNvbi5cbiAgICAgKiBAcGFyYW0gdW5pcXVlSWQgVW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoZSBub3RpZmljYXRpb24gd2hpY2ggaXMgdXNlZCB3aXRoIGNsZWFyRm9ybU5vdGlmaWNhdGlvbiB0byByZW1vdmUgdGhlIG5vdGlmaWNhdGlvbi5cbiAgICAgKiBAcmV0dXJucyB0cnVlIGlmIGl0IHN1Y2NlZWRzLCBvdGhlbnByd2lzZSBmYWxzZS5cbiAgICAgKi9cbiAgICBzdGF0aWMgYWRkRm9ybU5vdGlmaWNhdGlvbihcbiAgICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICAgIGxldmVsOiBYcm0uRm9ybU5vdGlmaWNhdGlvbkxldmVsLFxuICAgICAgdW5pcXVlSWQ6IHN0cmluZ1xuICAgICkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQudWkuc2V0Rm9ybU5vdGlmaWNhdGlvbihcbiAgICAgICAgICBtZXNzYWdlLFxuICAgICAgICAgIGxldmVsLFxuICAgICAgICAgIHVuaXF1ZUlkXG4gICAgICAgICk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDbGVhcnMgdGhlIGZvcm0gbm90aWZpY2F0aW9uIGRlc2NyaWJlZCBieSB1bmlxdWVJZC5cbiAgICAgKiBAcGFyYW0gdW5pcXVlSWQgVW5pcXVlIGlkZW50aWZpZXIuXG4gICAgICogQHJldHVybnMgVHJ1ZSBpZiBpdCBzdWNjZWVkcywgb3RoZXJ3aXNlIGZhbHNlLlxuICAgICAqL1xuICAgIHN0YXRpYyByZW1vdmVGb3JtTm90aWZpY2F0aW9uKHVuaXF1ZUlkOiBzdHJpbmcpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LnVpLmNsZWFyRm9ybU5vdGlmaWNhdGlvbih1bmlxdWVJZCk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgaGFuZGxlciB0byBiZSBjYWxsZWQgd2hlbiB0aGUgcmVjb3JkIGlzIHNhdmVkLlxuICAgICAqL1xuICAgIHN0YXRpYyBhZGRPblNhdmUoXG4gICAgICBoYW5kbGVyczpcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyXG4gICAgICAgIHwgWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlcltdXG4gICAgKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoaGFuZGxlcnMpKSB7XG4gICAgICAgICAgaGFuZGxlcnMgPSBbaGFuZGxlcnNdO1xuICAgICAgICB9XG4gICAgICAgIGhhbmRsZXJzLmZvckVhY2goKGhhbmRsZXIpID0+IHtcbiAgICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAnJHtoYW5kbGVyfScgaXMgbm90IGEgZnVuY3Rpb25gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLmVudGl0eS5yZW1vdmVPblNhdmUoaGFuZGxlcik7XG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLmVudGl0eS5hZGRPblNhdmUoaGFuZGxlcik7XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBhZnRlciB0aGUgT25TYXZlIGlzIGNvbXBsZXRlLlxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFRoZSBoYW5kbGVyLlxuICAgICAqIEByZW1hcmtzIEFkZGVkIGluIDkuMlxuICAgICAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZG9jcy5taWNyb3NvZnQuY29tL2VuLXVzL3Bvd2VyYXBwcy9kZXZlbG9wZXIvbW9kZWwtZHJpdmVuLWFwcHMvY2xpZW50YXBpL3JlZmVyZW5jZS9ldmVudHMvcG9zdHNhdmUgRXh0ZXJuYWwgTGluazogUG9zdFNhdmUgRXZlbnQgRG9jdW1lbnRhdGlvbn1cbiAgICAgKi9cbiAgICBzdGF0aWMgYWRkT25Qb3N0U2F2ZShcbiAgICAgIGhhbmRsZXJzOlxuICAgICAgICB8IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXJcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyW11cbiAgICApIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShoYW5kbGVycykpIHtcbiAgICAgICAgICBoYW5kbGVycyA9IFtoYW5kbGVyc107XG4gICAgICAgIH1cbiAgICAgICAgaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCcke2hhbmRsZXJ9JyBpcyBub3QgYSBmdW5jdGlvbmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEuZW50aXR5LnJlbW92ZU9uUG9zdFNhdmUoaGFuZGxlcik7XG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLmVudGl0eS5hZGRPblBvc3RTYXZlKGhhbmRsZXIpO1xuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiBmb3JtIGRhdGEgaXMgbG9hZGVkLlxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFRoZSBmdW5jdGlvbiB0byBiZSBleGVjdXRlZCB3aGVuIHRoZSBmb3JtIGRhdGEgbG9hZHMuIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGFkZGVkIHRvIHRoZSBib3R0b20gb2YgdGhlIGV2ZW50IGhhbmRsZXIgcGlwZWxpbmUuXG4gICAgICovXG4gICAgc3RhdGljIGFkZE9uTG9hZChcbiAgICAgIGhhbmRsZXJzOlxuICAgICAgICB8IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXJcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyW11cbiAgICApIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShoYW5kbGVycykpIHtcbiAgICAgICAgICBoYW5kbGVycyA9IFtoYW5kbGVyc107XG4gICAgICAgIH1cbiAgICAgICAgaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCcke2hhbmRsZXJ9JyBpcyBub3QgYSBmdW5jdGlvbmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucmVtb3ZlT25Mb2FkKGhhbmRsZXIpO1xuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5hZGRPbkxvYWQoaGFuZGxlcik7XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhIGhhbmRsZXIgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGF0dHJpYnV0ZSdzIHZhbHVlIGlzIGNoYW5nZWQuXG4gICAgICogQHBhcmFtIGhhbmRsZXIgVGhlIGZ1bmN0aW9uIHJlZmVyZW5jZS5cbiAgICAgKi9cbiAgICBzdGF0aWMgYWRkT25DaGFuZ2UoXG4gICAgICBmaWVsZHM6IENsYXNzLkZpZWxkW10sXG4gICAgICBoYW5kbGVyczpcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyXG4gICAgICAgIHwgWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlcltdLFxuICAgICAgZXhlY3V0ZT86IGJvb2xlYW5cbiAgICApIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShoYW5kbGVycykpIHtcbiAgICAgICAgICBoYW5kbGVycyA9IFtoYW5kbGVyc107XG4gICAgICAgIH1cbiAgICAgICAgaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCcke2hhbmRsZXJ9JyBpcyBub3QgYSBmdW5jdGlvbmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgICAgIGZpZWxkLnJlbW92ZU9uQ2hhbmdlKGhhbmRsZXIpO1xuICAgICAgICAgICAgZmllbGQuYWRkT25DaGFuZ2UoaGFuZGxlcik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoZXhlY3V0ZSkge1xuICAgICAgICAgIGZpZWxkcy5mb3JFYWNoKChmaWVsZCkgPT4ge1xuICAgICAgICAgICAgZmllbGQuQXR0cmlidXRlLmZpcmVPbkNoYW5nZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGV4cG9ydCBuYW1lc3BhY2UgQ2xhc3Mge1xuICAgIC8qKlxuICAgICAqIFVzZWQgdG8gZXhlY3V0ZSBtZXRob2RzIHJlbGF0ZWQgdG8gYSBzaW5nbGUgQXR0cmlidXRlXG4gICAgICovXG4gICAgZXhwb3J0IGNsYXNzIEZpZWxkIGltcGxlbWVudHMgWHJtLkF0dHJpYnV0ZXMuQXR0cmlidXRlIHtcbiAgICAgIHB1YmxpYyByZWFkb25seSBOYW1lITogc3RyaW5nO1xuICAgICAgcHJvdGVjdGVkIF9hdHRyaWJ1dGU/OiBYcm0uQXR0cmlidXRlcy5BdHRyaWJ1dGU7XG5cbiAgICAgIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZU5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLk5hbWUgPSBhdHRyaWJ1dGVOYW1lO1xuICAgICAgfVxuICAgICAgc2V0VmFsdWUodmFsdWU6IGFueSk6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgfVxuICAgICAgZ2V0QXR0cmlidXRlVHlwZSgpOiBYcm0uQXR0cmlidXRlcy5BdHRyaWJ1dGVUeXBlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEF0dHJpYnV0ZVR5cGUoKTtcbiAgICAgIH1cbiAgICAgIGdldEZvcm1hdCgpOiBYcm0uQXR0cmlidXRlcy5BdHRyaWJ1dGVGb3JtYXQge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0Rm9ybWF0KCk7XG4gICAgICB9XG4gICAgICBnZXRJc0RpcnR5KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0SXNEaXJ0eSgpO1xuICAgICAgfVxuICAgICAgZ2V0TmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0TmFtZSgpO1xuICAgICAgfVxuICAgICAgZ2V0UGFyZW50KCk6IFhybS5FbnRpdHkge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0UGFyZW50KCk7XG4gICAgICB9XG4gICAgICBnZXRSZXF1aXJlZExldmVsKCk6IFhybS5BdHRyaWJ1dGVzLlJlcXVpcmVtZW50TGV2ZWwge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0UmVxdWlyZWRMZXZlbCgpO1xuICAgICAgfVxuICAgICAgZ2V0U3VibWl0TW9kZSgpOiBYcm0uU3VibWl0TW9kZSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRTdWJtaXRNb2RlKCk7XG4gICAgICB9XG4gICAgICBnZXRVc2VyUHJpdmlsZWdlKCk6IFhybS5Qcml2aWxlZ2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0VXNlclByaXZpbGVnZSgpO1xuICAgICAgfVxuICAgICAgcmVtb3ZlT25DaGFuZ2UoaGFuZGxlcjogWHJtLkV2ZW50cy5BdHRyaWJ1dGUuQ2hhbmdlRXZlbnRIYW5kbGVyKTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5yZW1vdmVPbkNoYW5nZShoYW5kbGVyKTtcbiAgICAgIH1cbiAgICAgIHNldFN1Ym1pdE1vZGUoc3VibWl0TW9kZTogWHJtLlN1Ym1pdE1vZGUpOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLnNldFN1Ym1pdE1vZGUoc3VibWl0TW9kZSk7XG4gICAgICB9XG4gICAgICBnZXRWYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFZhbHVlKCk7XG4gICAgICB9XG4gICAgICBzZXRJc1ZhbGlkKGlzVmFsaWQ6IGJvb2xlYW4sIG1lc3NhZ2U/OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLnNldElzVmFsaWQoaXNWYWxpZCwgbWVzc2FnZSk7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBnZXQgQXR0cmlidXRlKCk6IFhybS5BdHRyaWJ1dGVzLkF0dHJpYnV0ZSB7XG4gICAgICAgIHJldHVybiAodGhpcy5fYXR0cmlidXRlID8/PVxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKHRoaXMuTmFtZSkgPz9cbiAgICAgICAgICBYcm1FeC50aHJvd0Vycm9yKFxuICAgICAgICAgICAgYFRoZSBhdHRyaWJ1dGUgJyR7dGhpcy5OYW1lfScgd2FzIG5vdCBmb3VuZCBvbiB0aGUgZm9ybS5gXG4gICAgICAgICAgKSk7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBnZXQgY29udHJvbHMoKTogWHJtLkNvbGxlY3Rpb24uSXRlbUNvbGxlY3Rpb248WHJtLkNvbnRyb2xzLlN0YW5kYXJkQ29udHJvbD4ge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuY29udHJvbHM7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogR2V0cyB0aGUgdmFsdWUuXG4gICAgICAgKiBAcmV0dXJucyBUaGUgdmFsdWUuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBnZXQgVmFsdWUoKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFZhbHVlKCk7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBzZXQgVmFsdWUodmFsdWU6IGFueSkge1xuICAgICAgICB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogU2V0cyBhIGNvbnRyb2wtbG9jYWwgbm90aWZpY2F0aW9uIG1lc3NhZ2UuXG4gICAgICAgKiBAcGFyYW0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAgICAgICAqIEBwYXJhbSB1bmlxdWVJZCBVbmlxdWUgaWRlbnRpZmllci5cbiAgICAgICAqIEByZXR1cm5zIHRydWUgaWYgaXQgc3VjY2VlZHMsIGZhbHNlIGlmIGl0IGZhaWxzLlxuICAgICAgICogQHJlbWFya3MgICAgIFdoZW4gdGhpcyBtZXRob2QgaXMgdXNlZCBvbiBNaWNyb3NvZnQgRHluYW1pY3MgQ1JNIGZvciB0YWJsZXRzIGEgcmVkIFwiWFwiIGljb25cbiAgICAgICAqICAgICAgICAgICAgICBhcHBlYXJzIG5leHQgdG8gdGhlIGNvbnRyb2wuIFRhcHBpbmcgb24gdGhlIGljb24gd2lsbCBkaXNwbGF5IHRoZSBtZXNzYWdlLlxuICAgICAgICovXG4gICAgICBwdWJsaWMgc2V0Tm90aWZpY2F0aW9uKG1lc3NhZ2U6IHN0cmluZywgdW5pcXVlSWQ6IHN0cmluZyk6IHRoaXMge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghbWVzc2FnZSkgdGhyb3cgbmV3IEVycm9yKGBubyBtZXNzYWdlIHdhcyBwcm92aWRlZC5gKTtcbiAgICAgICAgICBpZiAoIXVuaXF1ZUlkKSB0aHJvdyBuZXcgRXJyb3IoYG5vIHVuaXF1ZUlkIHdhcyBwcm92aWRlZC5gKTtcbiAgICAgICAgICB0aGlzLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2wpID0+XG4gICAgICAgICAgICBjb250cm9sLnNldE5vdGlmaWNhdGlvbihtZXNzYWdlLCB1bmlxdWVJZClcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFNldHMgdGhlIHZpc2liaWxpdHkgc3RhdGUuXG4gICAgICAgKiBAcGFyYW0gdmlzaWJsZSB0cnVlIHRvIHNob3csIGZhbHNlIHRvIGhpZGUuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBzZXRWaXNpYmxlKHZpc2libGU6IGJvb2xlYW4pOiB0aGlzIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2wpID0+IGNvbnRyb2wuc2V0VmlzaWJsZSh2aXNpYmxlKSk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogU2V0cyB0aGUgc3RhdGUgb2YgdGhlIGNvbnRyb2wgdG8gZWl0aGVyIGVuYWJsZWQsIG9yIGRpc2FibGVkLlxuICAgICAgICogQHBhcmFtIGRpc2FibGVkIHRydWUgdG8gZGlzYWJsZSwgZmFsc2UgdG8gZW5hYmxlLlxuICAgICAgICovXG4gICAgICBwdWJsaWMgc2V0RGlzYWJsZWQoZGlzYWJsZWQ6IGJvb2xlYW4pOiB0aGlzIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2wpID0+IGNvbnRyb2wuc2V0RGlzYWJsZWQoZGlzYWJsZWQpKTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBTZXRzIHRoZSByZXF1aXJlZCBsZXZlbC5cbiAgICAgICAqIEBwYXJhbSByZXF1aXJlbWVudExldmVsIFRoZSByZXF1aXJlbWVudCBsZXZlbCwgYXMgZWl0aGVyIFwibm9uZVwiLCBcInJlcXVpcmVkXCIsIG9yIFwicmVjb21tZW5kZWRcIlxuICAgICAgICovXG4gICAgICBwdWJsaWMgc2V0UmVxdWlyZWRMZXZlbChcbiAgICAgICAgcmVxdWlyZW1lbnRMZXZlbDogWHJtLkF0dHJpYnV0ZXMuUmVxdWlyZW1lbnRMZXZlbFxuICAgICAgKTogdGhpcyB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5BdHRyaWJ1dGUuc2V0UmVxdWlyZWRMZXZlbChyZXF1aXJlbWVudExldmVsKTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBTZXRzIHRoZSByZXF1aXJlZCBsZXZlbC5cbiAgICAgICAqIEBwYXJhbSByZXF1aXJlZCBUaGUgcmVxdWlyZW1lbnQgbGV2ZWwsIGFzIGVpdGhlciBmYWxzZSBmb3IgXCJub25lXCIgb3IgdHJ1ZSBmb3IgXCJyZXF1aXJlZFwiXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBzZXRSZXF1aXJlZChyZXF1aXJlZDogYm9vbGVhbik6IHRoaXMge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMuQXR0cmlidXRlLnNldFJlcXVpcmVkTGV2ZWwocmVxdWlyZWQgPyBcInJlcXVpcmVkXCIgOiBcIm5vbmVcIik7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKkZpcmUgYWxsIFwib24gY2hhbmdlXCIgZXZlbnQgaGFuZGxlcnMuICovXG4gICAgICBwdWJsaWMgZmlyZU9uQ2hhbmdlKCk6IHRoaXMge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMuQXR0cmlidXRlLmZpcmVPbkNoYW5nZSgpO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEFkZHMgYSBoYW5kbGVyIG9yIGFuIGFycmF5IG9mIGhhbmRsZXJzIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBhdHRyaWJ1dGUncyB2YWx1ZSBpcyBjaGFuZ2VkLlxuICAgICAgICogQHBhcmFtIGhhbmRsZXJzIFRoZSBmdW5jdGlvbiByZWZlcmVuY2Ugb3IgYW4gYXJyYXkgb2YgZnVuY3Rpb24gcmVmZXJlbmNlcy5cbiAgICAgICAqL1xuICAgICAgcHVibGljIGFkZE9uQ2hhbmdlKFxuICAgICAgICBoYW5kbGVyczpcbiAgICAgICAgICB8IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXJcbiAgICAgICAgICB8IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXJbXVxuICAgICAgKTogdGhpcyB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaGFuZGxlcnMpKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGhhbmRsZXIgb2YgaGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSBcImZ1bmN0aW9uXCIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAnJHtoYW5kbGVyfScgaXMgbm90IGEgZnVuY3Rpb25gKTtcbiAgICAgICAgICAgICAgdGhpcy5BdHRyaWJ1dGUucmVtb3ZlT25DaGFuZ2UoaGFuZGxlcik7XG4gICAgICAgICAgICAgIHRoaXMuQXR0cmlidXRlLmFkZE9uQ2hhbmdlKGhhbmRsZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXJzICE9PSBcImZ1bmN0aW9uXCIpXG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJyR7aGFuZGxlcnN9JyBpcyBub3QgYSBmdW5jdGlvbmApO1xuICAgICAgICAgICAgdGhpcy5BdHRyaWJ1dGUucmVtb3ZlT25DaGFuZ2UoaGFuZGxlcnMpO1xuICAgICAgICAgICAgdGhpcy5BdHRyaWJ1dGUuYWRkT25DaGFuZ2UoaGFuZGxlcnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBEaXNwbGF5cyBhbiBlcnJvciBvciByZWNvbW1lbmRhdGlvbiBub3RpZmljYXRpb24gZm9yIGEgY29udHJvbCwgYW5kIGxldHMgeW91IHNwZWNpZnkgYWN0aW9ucyB0byBleGVjdXRlIGJhc2VkIG9uIHRoZSBub3RpZmljYXRpb24uXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBhZGROb3RpZmljYXRpb24oXG4gICAgICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICAgICAgbm90aWZpY2F0aW9uTGV2ZWw6IFwiRVJST1JcIiB8IFwiUkVDT01NRU5EQVRJT05cIixcbiAgICAgICAgdW5pcXVlSWQ6IHN0cmluZyxcbiAgICAgICAgYWN0aW9ucz86IFhybS5Db250cm9scy5Db250cm9sTm90aWZpY2F0aW9uQWN0aW9uW11cbiAgICAgICk6IHRoaXMge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghdW5pcXVlSWQpIHRocm93IG5ldyBFcnJvcihgbm8gdW5pcXVlSWQgd2FzIHByb3ZpZGVkLmApO1xuICAgICAgICAgIGlmIChhY3Rpb25zICYmICFBcnJheS5pc0FycmF5KGFjdGlvbnMpKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICBgdGhlIGFjdGlvbiBwYXJhbWV0ZXIgaXMgbm90IGFuIGFycmF5IG9mIENvbnRyb2xOb3RpZmljYXRpb25BY3Rpb25gXG4gICAgICAgICAgICApO1xuICAgICAgICAgIHRoaXMuY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT4ge1xuICAgICAgICAgICAgY29udHJvbC5hZGROb3RpZmljYXRpb24oe1xuICAgICAgICAgICAgICBtZXNzYWdlczogW21lc3NhZ2VdLFxuICAgICAgICAgICAgICBub3RpZmljYXRpb25MZXZlbDogbm90aWZpY2F0aW9uTGV2ZWwsXG4gICAgICAgICAgICAgIHVuaXF1ZUlkOiB1bmlxdWVJZCxcbiAgICAgICAgICAgICAgYWN0aW9uczogYWN0aW9ucyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLyoqXG4gICAgICAgKiBDbGVhcnMgdGhlIG5vdGlmaWNhdGlvbiBpZGVudGlmaWVkIGJ5IHVuaXF1ZUlkLlxuICAgICAgICogQHBhcmFtIHVuaXF1ZUlkIChPcHRpb25hbCkgVW5pcXVlIGlkZW50aWZpZXIuXG4gICAgICAgKiBAcmV0dXJucyB0cnVlIGlmIGl0IHN1Y2NlZWRzLCBmYWxzZSBpZiBpdCBmYWlscy5cbiAgICAgICAqIEByZW1hcmtzIElmIHRoZSB1bmlxdWVJZCBwYXJhbWV0ZXIgaXMgbm90IHVzZWQsIHRoZSBjdXJyZW50IG5vdGlmaWNhdGlvbiBzaG93biB3aWxsIGJlIHJlbW92ZWQuXG4gICAgICAgKi9cbiAgICAgIHJlbW92ZU5vdGlmaWNhdGlvbih1bmlxdWVJZDogc3RyaW5nKTogdGhpcyB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PiB7XG4gICAgICAgICAgICBjb250cm9sLmNsZWFyTm90aWZpY2F0aW9uKHVuaXF1ZUlkKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgZXhwb3J0IGNsYXNzIFRleHRGaWVsZFxuICAgICAgZXh0ZW5kcyBGaWVsZFxuICAgICAgaW1wbGVtZW50cyBYcm0uQXR0cmlidXRlcy5TdHJpbmdBdHRyaWJ1dGUge1xuICAgICAgcHJvdGVjdGVkIGRlY2xhcmUgX2F0dHJpYnV0ZTogWHJtLkF0dHJpYnV0ZXMuU3RyaW5nQXR0cmlidXRlO1xuICAgICAgY29uc3RydWN0b3IoYXR0cmlidXRlOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoYXR0cmlidXRlKTtcbiAgICAgIH1cbiAgICAgIGdldE1heExlbmd0aCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0TWF4TGVuZ3RoKCk7XG4gICAgICB9XG4gICAgICBnZXRGb3JtYXQoKTogWHJtLkF0dHJpYnV0ZXMuU3RyaW5nQXR0cmlidXRlRm9ybWF0IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEZvcm1hdCgpIGFzIFhybS5BdHRyaWJ1dGVzLlN0cmluZ0F0dHJpYnV0ZUZvcm1hdDtcbiAgICAgIH1cbiAgICAgIGdldCBBdHRyaWJ1dGUoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5fYXR0cmlidXRlID8/PVxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKHRoaXMuTmFtZSkgPz9cbiAgICAgICAgICBYcm1FeC50aHJvd0Vycm9yKGBGaWVsZCAnJHt0aGlzLk5hbWV9JyBkb2VzIG5vdCBleGlzdGApKTtcbiAgICAgIH1cbiAgICAgIGdldCBjb250cm9scygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmNvbnRyb2xzO1xuICAgICAgfVxuICAgICAgZ2V0IFZhbHVlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRWYWx1ZSgpID8/IG51bGw7XG4gICAgICB9XG4gICAgICBzZXQgVmFsdWUodmFsdWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGV4cG9ydCBjbGFzcyBOdW1iZXJGaWVsZFxuICAgICAgZXh0ZW5kcyBGaWVsZFxuICAgICAgaW1wbGVtZW50cyBYcm0uQXR0cmlidXRlcy5OdW1iZXJBdHRyaWJ1dGUge1xuICAgICAgcHJvdGVjdGVkIGRlY2xhcmUgX2F0dHJpYnV0ZTogWHJtLkF0dHJpYnV0ZXMuTnVtYmVyQXR0cmlidXRlO1xuICAgICAgY29uc3RydWN0b3IoYXR0cmlidXRlOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoYXR0cmlidXRlKTtcbiAgICAgIH1cbiAgICAgIGdldEZvcm1hdCgpOiBYcm0uQXR0cmlidXRlcy5JbnRlZ2VyQXR0cmlidXRlRm9ybWF0IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEZvcm1hdCgpIGFzIFhybS5BdHRyaWJ1dGVzLkludGVnZXJBdHRyaWJ1dGVGb3JtYXQ7XG4gICAgICB9XG4gICAgICBnZXRNYXgoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldE1heCgpO1xuICAgICAgfVxuICAgICAgZ2V0TWluKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRNaW4oKTtcbiAgICAgIH1cbiAgICAgIGdldFByZWNpc2lvbigpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0UHJlY2lzaW9uKCk7XG4gICAgICB9XG4gICAgICBzZXRQcmVjaXNpb24ocHJlY2lzaW9uOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLnNldFByZWNpc2lvbihwcmVjaXNpb24pO1xuICAgICAgfVxuICAgICAgZ2V0IEF0dHJpYnV0ZSgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl9hdHRyaWJ1dGUgPz89XG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUodGhpcy5OYW1lKSA/P1xuICAgICAgICAgIFhybUV4LnRocm93RXJyb3IoYEZpZWxkICcke3RoaXMuTmFtZX0nIGRvZXMgbm90IGV4aXN0YCkpO1xuICAgICAgfVxuICAgICAgZ2V0IGNvbnRyb2xzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuY29udHJvbHM7XG4gICAgICB9XG4gICAgICBnZXQgVmFsdWUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFZhbHVlKCkgPz8gbnVsbDtcbiAgICAgIH1cbiAgICAgIHNldCBWYWx1ZSh2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZXhwb3J0IGNsYXNzIERhdGVGaWVsZFxuICAgICAgZXh0ZW5kcyBGaWVsZFxuICAgICAgaW1wbGVtZW50cyBYcm0uQXR0cmlidXRlcy5EYXRlQXR0cmlidXRlIHtcbiAgICAgIHByb3RlY3RlZCBkZWNsYXJlIF9hdHRyaWJ1dGU6IFhybS5BdHRyaWJ1dGVzLkRhdGVBdHRyaWJ1dGU7XG4gICAgICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGU6IHN0cmluZykge1xuICAgICAgICBzdXBlcihhdHRyaWJ1dGUpO1xuICAgICAgfVxuICAgICAgZ2V0Rm9ybWF0KCk6IFhybS5BdHRyaWJ1dGVzLkRhdGVBdHRyaWJ1dGVGb3JtYXQge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0Rm9ybWF0KCkgYXMgWHJtLkF0dHJpYnV0ZXMuRGF0ZUF0dHJpYnV0ZUZvcm1hdDtcbiAgICAgIH1cbiAgICAgIGdldCBBdHRyaWJ1dGUoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5fYXR0cmlidXRlID8/PVxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKHRoaXMuTmFtZSkgPz9cbiAgICAgICAgICBYcm1FeC50aHJvd0Vycm9yKGBGaWVsZCAnJHt0aGlzLk5hbWV9JyBkb2VzIG5vdCBleGlzdGApKTtcbiAgICAgIH1cbiAgICAgIGdldCBjb250cm9scygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmNvbnRyb2xzO1xuICAgICAgfVxuICAgICAgZ2V0IFZhbHVlKCk6IERhdGUge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0VmFsdWUoKSA/PyBudWxsO1xuICAgICAgfVxuICAgICAgc2V0IFZhbHVlKHZhbHVlOiBEYXRlKSB7XG4gICAgICAgIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZXhwb3J0IGNsYXNzIEJvb2xlYW5GaWVsZFxuICAgICAgZXh0ZW5kcyBGaWVsZFxuICAgICAgaW1wbGVtZW50cyBYcm0uQXR0cmlidXRlcy5Cb29sZWFuQXR0cmlidXRlIHtcbiAgICAgIHByb3RlY3RlZCBkZWNsYXJlIF9hdHRyaWJ1dGU6IFhybS5BdHRyaWJ1dGVzLkJvb2xlYW5BdHRyaWJ1dGU7XG4gICAgICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGU6IHN0cmluZykge1xuICAgICAgICBzdXBlcihhdHRyaWJ1dGUpO1xuICAgICAgfVxuICAgICAgZ2V0QXR0cmlidXRlVHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEF0dHJpYnV0ZVR5cGUoKTtcbiAgICAgIH1cbiAgICAgIGdldEluaXRpYWxWYWx1ZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEluaXRpYWxWYWx1ZSgpO1xuICAgICAgfVxuICAgICAgZ2V0IEF0dHJpYnV0ZSgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl9hdHRyaWJ1dGUgPz89XG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUodGhpcy5OYW1lKSA/P1xuICAgICAgICAgIFhybUV4LnRocm93RXJyb3IoYEZpZWxkICcke3RoaXMuTmFtZX0nIGRvZXMgbm90IGV4aXN0YCkpO1xuICAgICAgfVxuICAgICAgZ2V0IGNvbnRyb2xzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuY29udHJvbHM7XG4gICAgICB9XG4gICAgICBnZXQgVmFsdWUoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRWYWx1ZSgpID8/IG51bGw7XG4gICAgICB9XG4gICAgICBzZXQgVmFsdWUodmFsdWU6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5BdHRyaWJ1dGUuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBleHBvcnQgY2xhc3MgTXVsdGlTZWxlY3RPcHRpb25TZXRGaWVsZDxPcHRpb25zIGV4dGVuZHMgT3B0aW9uVmFsdWVzPlxuICAgICAgZXh0ZW5kcyBGaWVsZFxuICAgICAgaW1wbGVtZW50cyBYcm0uQXR0cmlidXRlcy5NdWx0aVNlbGVjdE9wdGlvblNldEF0dHJpYnV0ZSB7XG4gICAgICBwcm90ZWN0ZWQgZGVjbGFyZSBfYXR0cmlidXRlOiBYcm0uQXR0cmlidXRlcy5NdWx0aVNlbGVjdE9wdGlvblNldEF0dHJpYnV0ZTtcbiAgICAgIE9wdGlvbjogT3B0aW9ucztcbiAgICAgIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgb3B0aW9uPzogT3B0aW9ucykge1xuICAgICAgICBzdXBlcihhdHRyaWJ1dGVOYW1lKTtcbiAgICAgICAgdGhpcy5PcHRpb24gPSBvcHRpb247XG4gICAgICB9XG4gICAgICBnZXRGb3JtYXQoKTogWHJtLkF0dHJpYnV0ZXMuT3B0aW9uU2V0QXR0cmlidXRlRm9ybWF0IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEZvcm1hdCgpIGFzIFhybS5BdHRyaWJ1dGVzLk9wdGlvblNldEF0dHJpYnV0ZUZvcm1hdDtcbiAgICAgIH1cbiAgICAgIGdldE9wdGlvbih2YWx1ZTogbnVtYmVyIHwgc3RyaW5nKTogWHJtLk9wdGlvblNldFZhbHVlIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRPcHRpb24odmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRPcHRpb24odmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBnZXRPcHRpb25zKCk6IFhybS5PcHRpb25TZXRWYWx1ZVtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldE9wdGlvbnMoKTtcbiAgICAgIH1cbiAgICAgIGdldFNlbGVjdGVkT3B0aW9uKCk6IFhybS5PcHRpb25TZXRWYWx1ZVtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFNlbGVjdGVkT3B0aW9uKCk7XG4gICAgICB9XG4gICAgICBnZXRUZXh0KCk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFRleHQoKTtcbiAgICAgIH1cbiAgICAgIGdldEluaXRpYWxWYWx1ZSgpOiBudW1iZXJbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRJbml0aWFsVmFsdWUoKTtcbiAgICAgIH1cbiAgICAgIGdldCBBdHRyaWJ1dGUoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5fYXR0cmlidXRlID8/PVxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKHRoaXMuTmFtZSkgPz9cbiAgICAgICAgICBYcm1FeC50aHJvd0Vycm9yKGBGaWVsZCAnJHt0aGlzLk5hbWV9JyBkb2VzIG5vdCBleGlzdGApKTtcbiAgICAgIH1cbiAgICAgIGdldCBjb250cm9scygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmNvbnRyb2xzO1xuICAgICAgfVxuICAgICAgZ2V0IFZhbHVlKCk6IG51bWJlcltdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFZhbHVlKCk7XG4gICAgICB9XG4gICAgICBzZXQgVmFsdWUodmFsdWU6IChrZXlvZiBPcHRpb25zKVtdIHwgbnVtYmVyW10pIHtcbiAgICAgICAgaWYgKHZhbHVlID09PSBudWxsKSB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZShudWxsKTtcbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICBsZXQgdmFsdWVzID0gW107XG4gICAgICAgICAgdmFsdWUuZm9yRWFjaCgodikgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2ID09IFwibnVtYmVyXCIpIHZhbHVlcy5wdXNoKHYpO1xuICAgICAgICAgICAgZWxzZSB2YWx1ZXMucHVzaCh0aGlzLk9wdGlvblt2XSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5BdHRyaWJ1dGUuc2V0VmFsdWUodmFsdWVzKTtcbiAgICAgICAgfSBlbHNlIFhybUV4LnRocm93RXJyb3IoYEZpZWxkIFZhbHVlICcke3ZhbHVlfScgaXMgbm90IGFuIEFycmF5YCk7XG4gICAgICB9XG4gICAgfVxuICAgIGV4cG9ydCBjbGFzcyBMb29rdXBGaWVsZFxuICAgICAgZXh0ZW5kcyBGaWVsZFxuICAgICAgaW1wbGVtZW50cyBYcm0uQXR0cmlidXRlcy5Mb29rdXBBdHRyaWJ1dGUge1xuICAgICAgcHJvdGVjdGVkIGRlY2xhcmUgX2F0dHJpYnV0ZTogWHJtLkF0dHJpYnV0ZXMuTG9va3VwQXR0cmlidXRlO1xuICAgICAgcHJvdGVjdGVkIF9jdXN0b21GaWx0ZXJzOiBhbnkgPSBbXTtcbiAgICAgIHByaXZhdGUgdmlld0lkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcbiAgICAgIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZTogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKGF0dHJpYnV0ZSk7XG4gICAgICB9XG4gICAgICBnZXRJc1BhcnR5TGlzdCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldElzUGFydHlMaXN0KCk7XG4gICAgICB9XG4gICAgICBnZXQgQXR0cmlidXRlKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuX2F0dHJpYnV0ZSA/Pz1cbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZSh0aGlzLk5hbWUpID8/XG4gICAgICAgICAgWHJtRXgudGhyb3dFcnJvcihgRmllbGQgJyR7dGhpcy5OYW1lfScgZG9lcyBub3QgZXhpc3RgKSk7XG4gICAgICB9XG4gICAgICBnZXQgY29udHJvbHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5jb250cm9scztcbiAgICAgIH1cbiAgICAgIC8qKkdldHMgdGhlIGlkIG9mIHRoZSBmaXJzdCBsb29rdXAgdmFsdWUqL1xuICAgICAgZ2V0IElkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5WYWx1ZSAmJiB0aGlzLlZhbHVlLmxlbmd0aCA+IDBcbiAgICAgICAgICA/IFhybUV4Lm5vcm1hbGl6ZUd1aWQodGhpcy5WYWx1ZVswXS5pZClcbiAgICAgICAgICA6IG51bGw7XG4gICAgICB9XG4gICAgICAvKipHZXRzIHRoZSBlbnRpdHlUeXBlIG9mIHRoZSBmaXJzdCBsb29rdXAgdmFsdWUqL1xuICAgICAgZ2V0IEVudGl0eVR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLlZhbHVlICYmIHRoaXMuVmFsdWUubGVuZ3RoID4gMFxuICAgICAgICAgID8gdGhpcy5WYWx1ZVswXS5lbnRpdHlUeXBlXG4gICAgICAgICAgOiBudWxsO1xuICAgICAgfVxuICAgICAgLyoqR2V0cyB0aGUgZm9ybWF0dGVkIHZhbHVlIG9mIHRoZSBmaXJzdCBsb29rdXAgdmFsdWUqL1xuICAgICAgZ2V0IEZvcm1hdHRlZFZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5WYWx1ZSAmJiB0aGlzLlZhbHVlLmxlbmd0aCA+IDAgPyB0aGlzLlZhbHVlWzBdLm5hbWUgOiBudWxsO1xuICAgICAgfVxuICAgICAgZ2V0IFZhbHVlKCk6IFhybS5Mb29rdXBWYWx1ZVtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFZhbHVlKCkgPz8gbnVsbDtcbiAgICAgIH1cbiAgICAgIHNldCBWYWx1ZSh2YWx1ZTogWHJtLkxvb2t1cFZhbHVlW10pIHtcbiAgICAgICAgdGhpcy5BdHRyaWJ1dGUuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgfVxuICAgICAgLyoqXG4gICAgICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiBhIGxvb2t1cFxuICAgICAgICogQHBhcmFtIGlkIEd1aWQgb2YgdGhlIHJlY29yZFxuICAgICAgICogQHBhcmFtIGVudGl0eVR5cGUgbG9naWNhbG5hbWUgb2YgdGhlIGVudGl0eVxuICAgICAgICogQHBhcmFtIG5hbWUgZm9ybWF0dGVkIHZhbHVlXG4gICAgICAgKiBAcGFyYW0gYXBwZW5kIGlmIHRydWUsIGFkZHMgdmFsdWUgdG8gdGhlIGFycmF5IGluc3RlYWQgb2YgcmVwbGFjaW5nIGl0XG4gICAgICAgKi9cbiAgICAgIHNldExvb2t1cFZhbHVlKFxuICAgICAgICBpZDogc3RyaW5nLFxuICAgICAgICBlbnRpdHlUeXBlOiBhbnksXG4gICAgICAgIG5hbWU6IGFueSxcbiAgICAgICAgYXBwZW5kID0gZmFsc2VcbiAgICAgICk6IHRoaXMge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghaWQpIHRocm93IG5ldyBFcnJvcihgbm8gaWQgcGFyYW1ldGVyIHdhcyBwcm92aWRlZC5gKTtcbiAgICAgICAgICBpZiAoIWVudGl0eVR5cGUpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYG5vIGVudGl0eVR5cGUgcGFyYW1ldGVyIHdhcyBwcm92aWRlZC5gKTtcbiAgICAgICAgICBpZCA9IFhybUV4Lm5vcm1hbGl6ZUd1aWQoaWQpO1xuICAgICAgICAgIGNvbnN0IGxvb2t1cFZhbHVlID0ge1xuICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICBlbnRpdHlUeXBlLFxuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICB9O1xuICAgICAgICAgIHRoaXMuVmFsdWUgPVxuICAgICAgICAgICAgYXBwZW5kICYmIHRoaXMuVmFsdWVcbiAgICAgICAgICAgICAgPyB0aGlzLlZhbHVlLmNvbmNhdChsb29rdXBWYWx1ZSlcbiAgICAgICAgICAgICAgOiBbbG9va3VwVmFsdWVdO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLyoqXG4gICAgICAgKiBTZXRzIGEgbG9va3VwIHdpdGggYSBsb29rdXAgZnJvbSB0aGUgcmV0cmlldmVkIHJlY29yZC5cbiAgICAgICAqIEBwYXJhbSBzZWxlY3ROYW1lXG4gICAgICAgKiBAcGFyYW0gcmV0cmlldmVkUmVjb3JkXG4gICAgICAgKiBAZXhhbXBsZVxuICAgICAgICogdmFyIGNvbnRhY3QgPSBhd2FpdCBmaWVsZHMuQ29udGFjdC5yZXRyaWV2ZSgnPyRzZWxlY3Q9X3BhcmVudGN1c3RvbWVyaWRfdmFsdWUnKTtcbiAgICAgICAqIGZpZWxkcy5BY2NvdW50LnNldExvb2t1cEZyb21SZXRyaWV2ZSgnX3BhcmVudGN1c3RvbWVyaWRfdmFsdWUnLCBjb250YWN0KTtcbiAgICAgICAqIC8vQWx0ZXJuYXRlXG4gICAgICAgKiBmaWVsZHMuQWNjb3VudC5zZXRMb29rdXBGcm9tUmV0cmlldmUoJ3BhcmVudGN1c3RvbWVyaWQnLCBjb250YWN0KTtcbiAgICAgICAqL1xuICAgICAgc2V0TG9va3VwRnJvbVJldHJpZXZlKFxuICAgICAgICBzZWxlY3ROYW1lOiBzdHJpbmcsXG4gICAgICAgIHJldHJpZXZlZFJlY29yZDogeyBbeDogc3RyaW5nXTogYW55IH1cbiAgICAgICkge1xuICAgICAgICBpZiAoIXNlbGVjdE5hbWUuZW5kc1dpdGgoXCJfdmFsdWVcIikpIHNlbGVjdE5hbWUgPSBgXyR7c2VsZWN0TmFtZX1fdmFsdWVgO1xuICAgICAgICBpZiAoIXJldHJpZXZlZFJlY29yZCB8fCAhcmV0cmlldmVkUmVjb3JkW2Ake3NlbGVjdE5hbWV9YF0pIHtcbiAgICAgICAgICB0aGlzLlZhbHVlID0gbnVsbDtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5WYWx1ZSA9IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBpZDogcmV0cmlldmVkUmVjb3JkW2Ake3NlbGVjdE5hbWV9YF0sXG4gICAgICAgICAgICBlbnRpdHlUeXBlOlxuICAgICAgICAgICAgICByZXRyaWV2ZWRSZWNvcmRbXG4gICAgICAgICAgICAgIGAke3NlbGVjdE5hbWV9QE1pY3Jvc29mdC5EeW5hbWljcy5DUk0ubG9va3VwbG9naWNhbG5hbWVgXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuYW1lOiByZXRyaWV2ZWRSZWNvcmRbXG4gICAgICAgICAgICAgIGAke3NlbGVjdE5hbWV9QE9EYXRhLkNvbW11bml0eS5EaXNwbGF5LlYxLkZvcm1hdHRlZFZhbHVlYFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICBdO1xuICAgICAgfVxuICAgICAgLyoqXG4gICAgICAgKiBSZXRyaWV2ZXMgYW4gZW50aXR5IHJlY29yZC5cbiAgICAgICAqIEBwYXJhbSBvcHRpb25zIChPcHRpb25hbCkgT0RhdGEgc3lzdGVtIHF1ZXJ5IG9wdGlvbnMsICRzZWxlY3QgYW5kICRleHBhbmQsIHRvIHJldHJpZXZlIHlvdXIgZGF0YS5cbiAgICAgICAqIC0gVXNlIHRoZSAkc2VsZWN0IHN5c3RlbSBxdWVyeSBvcHRpb24gdG8gbGltaXQgdGhlIHByb3BlcnRpZXMgcmV0dXJuZWQgYnkgaW5jbHVkaW5nIGEgY29tbWEtc2VwYXJhdGVkXG4gICAgICAgKiAgIGxpc3Qgb2YgcHJvcGVydHkgbmFtZXMuIFRoaXMgaXMgYW4gaW1wb3J0YW50IHBlcmZvcm1hbmNlIGJlc3QgcHJhY3RpY2UuIElmIHByb3BlcnRpZXMgYXJlbuKAmXRcbiAgICAgICAqICAgc3BlY2lmaWVkIHVzaW5nICRzZWxlY3QsIGFsbCBwcm9wZXJ0aWVzIHdpbGwgYmUgcmV0dXJuZWQuXG4gICAgICAgKiAtIFVzZSB0aGUgJGV4cGFuZCBzeXN0ZW0gcXVlcnkgb3B0aW9uIHRvIGNvbnRyb2wgd2hhdCBkYXRhIGZyb20gcmVsYXRlZCBlbnRpdGllcyBpcyByZXR1cm5lZC4gSWYgeW91XG4gICAgICAgKiAgIGp1c3QgaW5jbHVkZSB0aGUgbmFtZSBvZiB0aGUgbmF2aWdhdGlvbiBwcm9wZXJ0eSwgeW914oCZbGwgcmVjZWl2ZSBhbGwgdGhlIHByb3BlcnRpZXMgZm9yIHJlbGF0ZWRcbiAgICAgICAqICAgcmVjb3Jkcy4gWW91IGNhbiBsaW1pdCB0aGUgcHJvcGVydGllcyByZXR1cm5lZCBmb3IgcmVsYXRlZCByZWNvcmRzIHVzaW5nIHRoZSAkc2VsZWN0IHN5c3RlbSBxdWVyeVxuICAgICAgICogICBvcHRpb24gaW4gcGFyZW50aGVzZXMgYWZ0ZXIgdGhlIG5hdmlnYXRpb24gcHJvcGVydHkgbmFtZS4gVXNlIHRoaXMgZm9yIGJvdGggc2luZ2xlLXZhbHVlZCBhbmRcbiAgICAgICAqICAgY29sbGVjdGlvbi12YWx1ZWQgbmF2aWdhdGlvbiBwcm9wZXJ0aWVzLlxuICAgICAgICogLSBZb3UgY2FuIGFsc28gc3BlY2lmeSBtdWx0aXBsZSBxdWVyeSBvcHRpb25zIGJ5IHVzaW5nICYgdG8gc2VwYXJhdGUgdGhlIHF1ZXJ5IG9wdGlvbnMuXG4gICAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5vcHRpb25zIGV4YW1wbGU6PC9jYXB0aW9uPlxuICAgICAgICogb3B0aW9uczogJHNlbGVjdD1uYW1lJiRleHBhbmQ9cHJpbWFyeWNvbnRhY3RpZCgkc2VsZWN0PWNvbnRhY3RpZCxmdWxsbmFtZSlcbiAgICAgICAqIEByZXR1cm5zIE9uIHN1Y2Nlc3MsIHJldHVybnMgYSBwcm9taXNlIGNvbnRhaW5pbmcgYSBKU09OIG9iamVjdCB3aXRoIHRoZSByZXRyaWV2ZWQgYXR0cmlidXRlcyBhbmQgdGhlaXIgdmFsdWVzLlxuICAgICAgICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kb2NzLm1pY3Jvc29mdC5jb20vZW4tdXMvZHluYW1pY3MzNjUvY3VzdG9tZXItZW5nYWdlbWVudC9kZXZlbG9wZXIvY2xpZW50YXBpL3JlZmVyZW5jZS94cm0td2ViYXBpL3JldHJpZXZlcmVjb3JkIEV4dGVybmFsIExpbms6IHJldHJpZXZlUmVjb3JkIChDbGllbnQgQVBJIHJlZmVyZW5jZSl9XG4gICAgICAgKi9cbiAgICAgIGFzeW5jIHJldHJpZXZlKG9wdGlvbnM6IHN0cmluZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghdGhpcy5JZCB8fCAhdGhpcy5FbnRpdHlUeXBlKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICBjb25zdCByZWNvcmQgPSBhd2FpdCBYcm0uV2ViQXBpLnJldHJpZXZlUmVjb3JkKFxuICAgICAgICAgICAgdGhpcy5FbnRpdHlUeXBlLFxuICAgICAgICAgICAgdGhpcy5JZCxcbiAgICAgICAgICAgIG9wdGlvbnNcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiByZWNvcmQ7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvKipcbiAgICAgICAqIEFkZHMgYW4gYWRkaXRpb25hbCBjdXN0b20gZmlsdGVyIHRvIHRoZSBsb29rdXAsIHdpdGggdGhlIFwiQU5EXCIgZmlsdGVyIG9wZXJhdG9yLlxuICAgICAgICogQHBhcmFtIGZpbHRlciBTcGVjaWZpZXMgdGhlIGZpbHRlciwgYXMgYSBzZXJpYWxpemVkIEZldGNoWE1MIFwiZmlsdGVyXCIgbm9kZS5cbiAgICAgICAqIEBwYXJhbSBlbnRpdHlMb2dpY2FsTmFtZSAoT3B0aW9uYWwpIFRoZSBsb2dpY2FsIG5hbWUgb2YgdGhlIGVudGl0eS5cbiAgICAgICAqIEByZW1hcmtzICAgICBJZiBlbnRpdHlMb2dpY2FsTmFtZSBpcyBub3Qgc3BlY2lmaWVkLCB0aGUgZmlsdGVyIHdpbGwgYmUgYXBwbGllZCB0byBhbGwgZW50aXRpZXNcbiAgICAgICAqICAgICAgICAgICAgICB2YWxpZCBmb3IgdGhlIExvb2t1cCBjb250cm9sLlxuICAgICAgICogQGV4YW1wbGUgICAgIEV4YW1wbGUgZmlsdGVyOiA8ZmlsdGVyIHR5cGU9XCJhbmRcIj5cbiAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCJhZGRyZXNzMV9jaXR5XCIgb3BlcmF0b3I9XCJlcVwiIHZhbHVlPVwiUmVkbW9uZFwiIC8+XG4gICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZmlsdGVyPlxuICAgICAgICovXG4gICAgICBhZGRQcmVGaWx0ZXJUb0xvb2t1cChcbiAgICAgICAgZmlsdGVyWG1sOiBzdHJpbmcsXG4gICAgICAgIGVudGl0eUxvZ2ljYWxOYW1lPzogc3RyaW5nXG4gICAgICApOiB0aGlzIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBfYWRkQ3VzdG9tRmlsdGVyLmNvbnRyb2xzID0gdGhpcy5jb250cm9scztcbiAgICAgICAgICB0aGlzLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2wpID0+IHtcbiAgICAgICAgICAgIGNvbnRyb2wuYWRkUHJlU2VhcmNoKF9hZGRDdXN0b21GaWx0ZXIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuX2N1c3RvbUZpbHRlcnMucHVzaChfYWRkQ3VzdG9tRmlsdGVyKTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBfYWRkQ3VzdG9tRmlsdGVyKCkge1xuICAgICAgICAgIF9hZGRDdXN0b21GaWx0ZXIuY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT4ge1xuICAgICAgICAgICAgY29udHJvbC5hZGRDdXN0b21GaWx0ZXIoZmlsdGVyWG1sLCBlbnRpdHlMb2dpY2FsTmFtZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICogQGRlcHJlY2F0ZWQgVXNlIHtAbGluayBMb29rdXBGaWVsZC5hZGRDdXN0b21WaWV3fSBpbnN0ZWFkLCB3aGljaCBwcm92aWRlcyBtb3JlIGZsZXhpYmxlIGZpbHRlcmluZyBjYXBhYmlsaXRpZXMgYW5kIGJldHRlciBwZXJmb3JtYW5jZVxuICAgICAgICogQWRkcyBhbiBhZGRpdGlvbmFsIGN1c3RvbSBmaWx0ZXIgdG8gdGhlIGxvb2t1cCwgd2l0aCB0aGUgXCJBTkRcIiBmaWx0ZXIgb3BlcmF0b3IuXG4gICAgICAgKiBAcGFyYW0gZW50aXR5TG9naWNhbE5hbWUgKE9wdGlvbmFsKSBUaGUgbG9naWNhbCBuYW1lIG9mIHRoZSBlbnRpdHkuXG4gICAgICAgKiBAcGFyYW0gcHJpbWFyeUF0dHJpYnV0ZUlkTmFtZSAoT3B0aW9uYWwpIFRoZSBsb2dpY2FsIG5hbWUgb2YgdGhlIHByaW1hcnkga2V5LlxuICAgICAgICogQHBhcmFtIGZldGNoWG1sIFNwZWNpZmllcyB0aGUgRmV0Y2hYTUwgdXNlZCB0byBmaWx0ZXIuXG4gICAgICAgKiBAcmVtYXJrcyAgICAgSWYgZW50aXR5TG9naWNhbE5hbWUgaXMgbm90IHNwZWNpZmllZCwgdGhlIGZpbHRlciB3aWxsIGJlIGFwcGxpZWQgdG8gYWxsIGVudGl0aWVzXG4gICAgICAgKiAgICAgICAgICAgICAgdmFsaWQgZm9yIHRoZSBMb29rdXAgY29udHJvbC5cbiAgICAgICAqIEBleGFtcGxlICAgICBFeGFtcGxlIGZldGNoWG1sOiA8ZmV0Y2g+XG4gICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxlbnRpdHkgbmFtZT1cImNvbnRhY3RcIj5cbiAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxmaWx0ZXI+XG4gICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cImFkZHJlc3MxX2NpdHlcIiBvcGVyYXRvcj1cImVxXCIgdmFsdWU9XCJSZWRtb25kXCIgLz5cbiAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZmlsdGVyPlxuICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2VudGl0eT5cbiAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9mZXRjaD5cbiAgICAgICAqL1xuICAgICAgYXN5bmMgYWRkUHJlRmlsdGVyVG9Mb29rdXBBZHZhbmNlZChcbiAgICAgICAgZW50aXR5TG9naWNhbE5hbWU6IHN0cmluZyxcbiAgICAgICAgcHJpbWFyeUF0dHJpYnV0ZUlkTmFtZTogc3RyaW5nLFxuICAgICAgICBmZXRjaFhtbDogc3RyaW5nXG4gICAgICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBYcm0uV2ViQXBpLm9ubGluZS5yZXRyaWV2ZU11bHRpcGxlUmVjb3JkcyhcbiAgICAgICAgICAgIGVudGl0eUxvZ2ljYWxOYW1lLFxuICAgICAgICAgICAgXCI/ZmV0Y2hYbWw9XCIgKyBmZXRjaFhtbFxuICAgICAgICAgICk7XG4gICAgICAgICAgY29uc3QgZGF0YSA9IHJlc3VsdC5lbnRpdGllcztcbiAgICAgICAgICBsZXQgZmlsdGVyZWRFbnRpdGllcyA9IFwiXCI7XG4gICAgICAgICAgX2FkZEN1c3RvbUZpbHRlci5jb250cm9scyA9IHRoaXMuY29udHJvbHM7XG4gICAgICAgICAgZGF0YS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICBmaWx0ZXJlZEVudGl0aWVzICs9IGA8dmFsdWU+JHtpdGVtW3ByaW1hcnlBdHRyaWJ1dGVJZE5hbWVdfTwvdmFsdWU+YDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBmZXRjaFhtbCA9IGZpbHRlcmVkRW50aXRpZXNcbiAgICAgICAgICAgID8gYDxmaWx0ZXI+PGNvbmRpdGlvbiBhdHRyaWJ1dGU9JyR7cHJpbWFyeUF0dHJpYnV0ZUlkTmFtZX0nIG9wZXJhdG9yPSdpbic+JHtmaWx0ZXJlZEVudGl0aWVzfTwvY29uZGl0aW9uPjwvZmlsdGVyPmBcbiAgICAgICAgICAgIDogYDxmaWx0ZXI+PGNvbmRpdGlvbiBhdHRyaWJ1dGU9JyR7cHJpbWFyeUF0dHJpYnV0ZUlkTmFtZX0nIG9wZXJhdG9yPSdudWxsJy8+PC9maWx0ZXI+YDtcbiAgICAgICAgICB0aGlzLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2wpID0+IHtcbiAgICAgICAgICAgIGNvbnRyb2wuYWRkUHJlU2VhcmNoKF9hZGRDdXN0b21GaWx0ZXIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuX2N1c3RvbUZpbHRlcnMucHVzaChfYWRkQ3VzdG9tRmlsdGVyKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gX2FkZEN1c3RvbUZpbHRlcigpIHtcbiAgICAgICAgICBfYWRkQ3VzdG9tRmlsdGVyLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2wpID0+IHtcbiAgICAgICAgICAgIGNvbnRyb2wuYWRkQ3VzdG9tRmlsdGVyKGZldGNoWG1sLCBlbnRpdHlMb2dpY2FsTmFtZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICogQWRkcyBhIGN1c3RvbSB2aWV3IHRvIGZpbHRlciB0aGUgbG9va3VwIHVzaW5nIEZldGNoWE1MXG4gICAgICAgKiBPbmx5IHdvcmtzIGZvciBvbmUgdGFibGUgYXQgYSB0aW1lLCBjYW5ub3QgYWRkIHZpZXdzIGZvciBtdWx0aXBsZSB0YWJsZXMgYXQgdGhlIHNhbWUgdGltZVxuICAgICAgICogQHBhcmFtIGZldGNoWG1sIFRoZSBjb21wbGV0ZSBGZXRjaFhNTCBxdWVyeSBpbmNsdWRpbmcgZmlsdGVyaW5nIGNvbmRpdGlvbnNcbiAgICAgICAqIEByZXR1cm5zIFRoZSBMb29rdXBGaWVsZCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICAgKi9cbiAgICAgIGFkZEN1c3RvbVZpZXcoZmV0Y2hYbWw6IHN0cmluZyk6IHRoaXMge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghZmV0Y2hYbWwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZldGNoWE1MIGlzIHJlcXVpcmVkXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCB0YXJnZXRFbnRpdHkgPSB0aGlzLmV4dHJhY3RFbnRpdHlGcm9tRmV0Y2hYbWwoZmV0Y2hYbWwpO1xuICAgICAgICAgIGNvbnN0IGxheW91dFhtbCA9IHRoaXMuZ2VuZXJhdGVMYXlvdXRYbWwoZmV0Y2hYbWwpO1xuXG4gICAgICAgICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PiB7XG4gICAgICAgICAgICBjb250cm9sLmFkZEN1c3RvbVZpZXcoXG4gICAgICAgICAgICAgIHRoaXMudmlld0lkLFxuICAgICAgICAgICAgICB0YXJnZXRFbnRpdHksXG4gICAgICAgICAgICAgIFwiRmlsdGVyZWQgVmlld1wiLFxuICAgICAgICAgICAgICBmZXRjaFhtbCxcbiAgICAgICAgICAgICAgbGF5b3V0WG1sLFxuICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEV4dHJhY3RzIGVudGl0eSBuYW1lIGZyb20gZmV0Y2hYbWxcbiAgICAgICAqL1xuICAgICAgcHJpdmF0ZSBleHRyYWN0RW50aXR5RnJvbUZldGNoWG1sKGZldGNoWG1sOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBtYXRjaCA9IGZldGNoWG1sLm1hdGNoKC88ZW50aXR5Lio/bmFtZT1bJ1wiXSguKj8pWydcIl0vKTtcbiAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBleHRyYWN0IGVudGl0eSBuYW1lIGZyb20gZmV0Y2hYbWxcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hdGNoWzFdO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEdlbmVyYXRlcyBsYXlvdXRYbWwgYmFzZWQgb24gZmV0Y2hYbWwgYXR0cmlidXRlc1xuICAgICAgICovXG4gICAgICBwcml2YXRlIGdlbmVyYXRlTGF5b3V0WG1sKGZldGNoWG1sOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBhdHRyaWJ1dGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBjb25zdCByZWdleCA9IC88YXR0cmlidXRlLio/bmFtZT1bJ1wiXSguKj8pWydcIl0vZztcbiAgICAgICAgbGV0IG1hdGNoO1xuXG4gICAgICAgIC8vIEdldCB1cCB0byAzIG5vbi1pZCBhdHRyaWJ1dGVzXG4gICAgICAgIHdoaWxlIChcbiAgICAgICAgICAobWF0Y2ggPSByZWdleC5leGVjKGZldGNoWG1sKSkgIT09IG51bGwgJiZcbiAgICAgICAgICBhdHRyaWJ1dGVzLmxlbmd0aCA8IDNcbiAgICAgICAgKSB7XG4gICAgICAgICAgaWYgKCFtYXRjaFsxXS5lbmRzV2l0aChcImlkXCIpKSB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzLnB1c2gobWF0Y2hbMV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHdlIGRpZG4ndCBnZXQgYW55IGF0dHJpYnV0ZXMsIHRyeSB0byBnZXQgdGhlIGZpcnN0IGF0dHJpYnV0ZSBldmVuIGlmIGl0J3MgYW4gSURcbiAgICAgICAgaWYgKGF0dHJpYnV0ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgY29uc3QgZmlyc3RNYXRjaCA9IHJlZ2V4LmV4ZWMoZmV0Y2hYbWwpO1xuICAgICAgICAgIGF0dHJpYnV0ZXMucHVzaChmaXJzdE1hdGNoID8gZmlyc3RNYXRjaFsxXSA6IFwibmFtZVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdlbmVyYXRlIGNlbGxzIGJhc2VkIG9uIGF2YWlsYWJsZSBhdHRyaWJ1dGVzXG4gICAgICAgIGNvbnN0IGNlbGxzID0gYXR0cmlidXRlc1xuICAgICAgICAgIC5tYXAoKGF0dHIsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB3aWR0aCA9IGluZGV4ID09PSAwID8gMjAwIDogMTAwO1xuICAgICAgICAgICAgcmV0dXJuIGA8Y2VsbCBuYW1lPScke2F0dHJ9JyB3aWR0aD0nJHt3aWR0aH0nIC8+YDtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5qb2luKFwiXFxuICAgICAgICBcIik7XG5cbiAgICAgICAgcmV0dXJuIGA8Z3JpZCBuYW1lPSdyZXN1bHRzZXQnIG9iamVjdD0nMScganVtcD0nJHthdHRyaWJ1dGVzWzBdfScgc2VsZWN0PScxJyBpY29uPScxJyBwcmV2aWV3PScxJz5cbiAgICAgIDxyb3cgbmFtZT0ncmVzdWx0JyBpZD0nJHthdHRyaWJ1dGVzWzBdfSc+XG4gICAgICAgICR7Y2VsbHN9XG4gICAgICA8L3Jvdz5cbiAgICA8L2dyaWQ+YDtcbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICogUmVtb3ZlcyBhbGwgZmlsdGVycyBzZXQgb24gdGhlIGN1cnJlbnQgbG9va3VwIGF0dHJpYnV0ZSBieSB1c2luZyBhZGRQcmVGaWx0ZXJUb0xvb2t1cCBvciBhZGRQcmVGaWx0ZXJUb0xvb2t1cEFkdmFuY2VkXG4gICAgICAgKi9cbiAgICAgIGNsZWFyUHJlRmlsdGVyRnJvbUxvb2t1cCgpOiB0aGlzIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLl9jdXN0b21GaWx0ZXJzLmZvckVhY2goXG4gICAgICAgICAgICAoY3VzdG9tRmlsdGVyOiBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnRyb2wucmVtb3ZlUHJlU2VhcmNoKGN1c3RvbUZpbHRlcik7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHR5cGUgT3B0aW9uVmFsdWVzID0ge1xuICAgICAgW2tleTogc3RyaW5nXTogbnVtYmVyO1xuICAgIH07XG4gICAgZXhwb3J0IGNsYXNzIE9wdGlvbnNldEZpZWxkPE9wdGlvbnMgZXh0ZW5kcyBPcHRpb25WYWx1ZXM+XG4gICAgICBleHRlbmRzIEZpZWxkXG4gICAgICBpbXBsZW1lbnRzIFhybS5BdHRyaWJ1dGVzLk9wdGlvblNldEF0dHJpYnV0ZSB7XG4gICAgICBwcm90ZWN0ZWQgZGVjbGFyZSBfYXR0cmlidXRlOiBYcm0uQXR0cmlidXRlcy5PcHRpb25TZXRBdHRyaWJ1dGU7XG4gICAgICBwcm90ZWN0ZWQgX2NvbnRyb2whOiBYcm0uQ29udHJvbHMuT3B0aW9uU2V0Q29udHJvbDtcbiAgICAgIE9wdGlvbjogT3B0aW9ucztcbiAgICAgIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgb3B0aW9uPzogT3B0aW9ucykge1xuICAgICAgICBzdXBlcihhdHRyaWJ1dGVOYW1lKTtcbiAgICAgICAgdGhpcy5PcHRpb24gPSBvcHRpb247XG4gICAgICB9XG4gICAgICBnZXRGb3JtYXQoKTogWHJtLkF0dHJpYnV0ZXMuT3B0aW9uU2V0QXR0cmlidXRlRm9ybWF0IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEZvcm1hdCgpIGFzIFhybS5BdHRyaWJ1dGVzLk9wdGlvblNldEF0dHJpYnV0ZUZvcm1hdDtcbiAgICAgIH1cbiAgICAgIGdldE9wdGlvbih2YWx1ZTogbnVtYmVyIHwgc3RyaW5nKTogWHJtLk9wdGlvblNldFZhbHVlIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRPcHRpb24odmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRPcHRpb24odmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBnZXRPcHRpb25zKCk6IFhybS5PcHRpb25TZXRWYWx1ZVtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldE9wdGlvbnMoKTtcbiAgICAgIH1cbiAgICAgIGdldFNlbGVjdGVkT3B0aW9uKCk6IFhybS5PcHRpb25TZXRWYWx1ZSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRTZWxlY3RlZE9wdGlvbigpO1xuICAgICAgfVxuICAgICAgZ2V0VGV4dCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0VGV4dCgpO1xuICAgICAgfVxuICAgICAgZ2V0SW5pdGlhbFZhbHVlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRJbml0aWFsVmFsdWUoKTtcbiAgICAgIH1cbiAgICAgIGdldCBBdHRyaWJ1dGUoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5fYXR0cmlidXRlID8/PVxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKHRoaXMuTmFtZSkgPz9cbiAgICAgICAgICBYcm1FeC50aHJvd0Vycm9yKGBGaWVsZCAnJHt0aGlzLk5hbWV9JyBkb2VzIG5vdCBleGlzdGApKTtcbiAgICAgIH1cbiAgICAgIGdldCBjb250cm9scygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmNvbnRyb2xzO1xuICAgICAgfVxuICAgICAgZ2V0IGNvbnRyb2woKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5fY29udHJvbCA/Pz1cbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmdldENvbnRyb2wodGhpcy5OYW1lKSA/P1xuICAgICAgICAgIFhybUV4LnRocm93RXJyb3IoYENvbnRyb2wgJyR7dGhpcy5OYW1lfScgZG9lcyBub3QgZXhpc3RgKSk7XG4gICAgICB9XG4gICAgICBnZXQgVmFsdWUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFZhbHVlKCk7XG4gICAgICB9XG4gICAgICBzZXQgVmFsdWUodmFsdWU6IGtleW9mIE9wdGlvbnMgfCBudW1iZXIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PSBcIm51bWJlclwiKSB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlID09PSBudWxsKSB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZShudWxsKTtcbiAgICAgICAgZWxzZSB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh0aGlzLk9wdGlvblt2YWx1ZV0pO1xuICAgICAgfVxuICAgICAgLyoqXG4gICAgICAgKiBBZGRzIGFuIG9wdGlvbi5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0gdmFsdWVzIGFuIGFycmF5IHdpdGggdGhlIG9wdGlvbiB2YWx1ZXMgdG8gYWRkXG4gICAgICAgKiBAcGFyYW0gaW5kZXggKE9wdGlvbmFsKSB6ZXJvLWJhc2VkIGluZGV4IG9mIHRoZSBvcHRpb24uXG4gICAgICAgKlxuICAgICAgICogQHJlbWFya3MgVGhpcyBtZXRob2QgZG9lcyBub3QgY2hlY2sgdGhhdCB0aGUgdmFsdWVzIHdpdGhpbiB0aGUgb3B0aW9ucyB5b3UgYWRkIGFyZSB2YWxpZC5cbiAgICAgICAqICAgICAgICAgIElmIGluZGV4IGlzIG5vdCBwcm92aWRlZCwgdGhlIG5ldyBvcHRpb24gd2lsbCBiZSBhZGRlZCB0byB0aGUgZW5kIG9mIHRoZSBsaXN0LlxuICAgICAgICovXG4gICAgICBhZGRPcHRpb24odmFsdWVzOiBudW1iZXJbXSwgaW5kZXg/OiBudW1iZXIpOiB0aGlzIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWVzKSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgdmFsdWVzIGlzIG5vdCBhbiBBcnJheTpcXG52YWx1ZXM6ICcke3ZhbHVlc30nYCk7XG4gICAgICAgICAgY29uc3Qgb3B0aW9uU2V0VmFsdWVzID1cbiAgICAgICAgICAgIHRoaXMuY29udHJvbC5nZXRBdHRyaWJ1dGUoKS5nZXRPcHRpb25zKCkgPz8gW107XG4gICAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIG9wdGlvblNldFZhbHVlcykge1xuICAgICAgICAgICAgaWYgKHZhbHVlcy5pbmNsdWRlcyhlbGVtZW50LnZhbHVlKSkge1xuICAgICAgICAgICAgICB0aGlzLmNvbnRyb2wuYWRkT3B0aW9uKGVsZW1lbnQsIGluZGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvKipcbiAgICAgICAqIFJlbW92ZXMgdGhlIG9wdGlvbiBtYXRjaGluZyB0aGUgdmFsdWUuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZS5cbiAgICAgICAqL1xuICAgICAgcmVtb3ZlT3B0aW9uKHZhbHVlczogbnVtYmVyW10pOiB0aGlzIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWVzKSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgdmFsdWVzIGlzIG5vdCBhbiBBcnJheTpcXG52YWx1ZXM6ICcke3ZhbHVlc30nYCk7XG4gICAgICAgICAgY29uc3Qgb3B0aW9uU2V0VmFsdWVzID1cbiAgICAgICAgICAgIHRoaXMuY29udHJvbC5nZXRBdHRyaWJ1dGUoKS5nZXRPcHRpb25zKCkgPz8gW107XG4gICAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIG9wdGlvblNldFZhbHVlcykge1xuICAgICAgICAgICAgaWYgKHZhbHVlcy5pbmNsdWRlcyhlbGVtZW50LnZhbHVlKSkge1xuICAgICAgICAgICAgICB0aGlzLmNvbnRyb2wucmVtb3ZlT3B0aW9uKGVsZW1lbnQudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICogQ2xlYXJzIGFsbCBvcHRpb25zLlxuICAgICAgICovXG4gICAgICBjbGVhck9wdGlvbnMoKTogdGhpcyB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5jb250cm9sLmNsZWFyT3B0aW9ucygpO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBleHBvcnQgY2xhc3MgU2VjdGlvbiBpbXBsZW1lbnRzIFhybS5Db250cm9scy5TZWN0aW9uIHtcbiAgICAgIHB1YmxpYyByZWFkb25seSBOYW1lITogc3RyaW5nO1xuICAgICAgcHJvdGVjdGVkIF9zZWN0aW9uPzogWHJtLkNvbnRyb2xzLlNlY3Rpb247XG4gICAgICBwdWJsaWMgcGFyZW50VGFiPzogWHJtLkNvbnRyb2xzLlRhYjtcbiAgICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLk5hbWUgPSBuYW1lO1xuICAgICAgfVxuICAgICAgcHVibGljIGdldCBTZWN0aW9uKCk6IFhybS5Db250cm9scy5TZWN0aW9uIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl9zZWN0aW9uID8/PVxuICAgICAgICAgIHRoaXMucGFyZW50VGFiLnNlY3Rpb25zLmdldCh0aGlzLk5hbWUpID8/XG4gICAgICAgICAgWHJtRXgudGhyb3dFcnJvcihcbiAgICAgICAgICAgIGBUaGUgc2VjdGlvbiAnJHt0aGlzLk5hbWV9JyB3YXMgbm90IGZvdW5kIG9uIHRoZSBmb3JtLmBcbiAgICAgICAgICApKTtcbiAgICAgIH1cbiAgICAgIGdldE5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuU2VjdGlvbi5nZXROYW1lKCk7XG4gICAgICB9XG4gICAgICBnZXRQYXJlbnQoKTogWHJtLkNvbnRyb2xzLlRhYiB7XG4gICAgICAgIHJldHVybiB0aGlzLlNlY3Rpb24uZ2V0UGFyZW50KCk7XG4gICAgICB9XG4gICAgICBjb250cm9sczogWHJtLkNvbGxlY3Rpb24uSXRlbUNvbGxlY3Rpb248WHJtLkNvbnRyb2xzLkNvbnRyb2w+O1xuICAgICAgc2V0VmlzaWJsZSh2aXNpYmxlOiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLlNlY3Rpb24uc2V0VmlzaWJsZSh2aXNpYmxlKTtcbiAgICAgIH1cbiAgICAgIGdldFZpc2libGUoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLlNlY3Rpb24uZ2V0VmlzaWJsZSgpO1xuICAgICAgfVxuICAgICAgZ2V0TGFiZWwoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuU2VjdGlvbi5nZXRMYWJlbCgpO1xuICAgICAgfVxuICAgICAgc2V0TGFiZWwobGFiZWw6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5TZWN0aW9uLnNldExhYmVsKGxhYmVsKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdHlwZSBUYWJTZWN0aW9ucyA9IHtcbiAgICAgIFtrZXk6IHN0cmluZ106IFNlY3Rpb247XG4gICAgfTtcbiAgICBleHBvcnQgY2xhc3MgVGFiPFNlY3Rpb25zIGV4dGVuZHMgVGFiU2VjdGlvbnM+IGltcGxlbWVudHMgWHJtLkNvbnRyb2xzLlRhYiB7XG4gICAgICBwdWJsaWMgcmVhZG9ubHkgTmFtZSE6IHN0cmluZztcbiAgICAgIHByb3RlY3RlZCBfdGFiPzogWHJtLkNvbnRyb2xzLlRhYjtcbiAgICAgIFNlY3Rpb246IFNlY3Rpb25zO1xuICAgICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCBzZWN0aW9uPzogU2VjdGlvbnMpIHtcbiAgICAgICAgdGhpcy5OYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5TZWN0aW9uID0gc2VjdGlvbjtcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHNlY3Rpb24pIHtcbiAgICAgICAgICBzZWN0aW9uW2tleV0ucGFyZW50VGFiID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZ2V0IHNlY3Rpb25zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5UYWIuc2VjdGlvbnM7XG4gICAgICB9XG4gICAgICBwdWJsaWMgZ2V0IFRhYigpOiBYcm0uQ29udHJvbHMuVGFiIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl90YWIgPz89XG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC51aS50YWJzLmdldCh0aGlzLk5hbWUpID8/XG4gICAgICAgICAgWHJtRXgudGhyb3dFcnJvcihcbiAgICAgICAgICAgIGBUaGUgdGFiICcke3RoaXMuTmFtZX0nIHdhcyBub3QgZm91bmQgb24gdGhlIGZvcm0uYFxuICAgICAgICAgICkpO1xuICAgICAgfVxuICAgICAgYWRkVGFiU3RhdGVDaGFuZ2UoaGFuZGxlcjogWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlcik6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5UYWIuYWRkVGFiU3RhdGVDaGFuZ2UoaGFuZGxlcik7XG4gICAgICB9XG4gICAgICBnZXREaXNwbGF5U3RhdGUoKTogWHJtLkRpc3BsYXlTdGF0ZSB7XG4gICAgICAgIHJldHVybiB0aGlzLlRhYi5nZXREaXNwbGF5U3RhdGUoKTtcbiAgICAgIH1cbiAgICAgIGdldE5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuVGFiLmdldE5hbWUoKTtcbiAgICAgIH1cbiAgICAgIGdldFBhcmVudCgpOiBYcm0uVWkge1xuICAgICAgICByZXR1cm4gdGhpcy5UYWIuZ2V0UGFyZW50KCk7XG4gICAgICB9XG4gICAgICByZW1vdmVUYWJTdGF0ZUNoYW5nZShoYW5kbGVyOiBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyKTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLlRhYi5yZW1vdmVUYWJTdGF0ZUNoYW5nZShoYW5kbGVyKTtcbiAgICAgIH1cbiAgICAgIHNldERpc3BsYXlTdGF0ZShkaXNwbGF5U3RhdGU6IFhybS5EaXNwbGF5U3RhdGUpOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuVGFiLnNldERpc3BsYXlTdGF0ZShkaXNwbGF5U3RhdGUpO1xuICAgICAgfVxuICAgICAgc2V0VmlzaWJsZSh2aXNpYmxlOiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLlRhYi5zZXRWaXNpYmxlKHZpc2libGUpO1xuICAgICAgfVxuICAgICAgZ2V0VmlzaWJsZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuVGFiLmdldFZpc2libGUoKTtcbiAgICAgIH1cbiAgICAgIGdldExhYmVsKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLlRhYi5nZXRMYWJlbCgpO1xuICAgICAgfVxuICAgICAgc2V0TGFiZWwobGFiZWw6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5UYWIuc2V0TGFiZWwobGFiZWwpO1xuICAgICAgfVxuICAgICAgc2V0Rm9jdXMoKTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLlRhYi5zZXRGb2N1cygpO1xuICAgICAgfVxuICAgIH1cbiAgICBleHBvcnQgY2xhc3MgR3JpZENvbnRyb2wgaW1wbGVtZW50cyBYcm0uQ29udHJvbHMuR3JpZENvbnRyb2wge1xuICAgICAgcHVibGljIHJlYWRvbmx5IE5hbWUhOiBzdHJpbmc7XG4gICAgICBwcm90ZWN0ZWQgX2dyaWRDb250cm9sPzogWHJtLkNvbnRyb2xzLkdyaWRDb250cm9sO1xuICAgICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuTmFtZSA9IG5hbWU7XG4gICAgICB9XG4gICAgICBwdWJsaWMgZ2V0IEdyaWRDb250cm9sKCk6IFhybS5Db250cm9scy5HcmlkQ29udHJvbCB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgKHRoaXMuX2dyaWRDb250cm9sID8/PVxuICAgICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5nZXRDb250cm9sPFhybS5Db250cm9scy5HcmlkQ29udHJvbD4odGhpcy5OYW1lKSkgPz9cbiAgICAgICAgICBYcm1FeC50aHJvd0Vycm9yKGBUaGUgZ3JpZCAnJHt0aGlzLk5hbWV9JyB3YXMgbm90IGZvdW5kIG9uIHRoZSBmb3JtLmApXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBwdWJsaWMgZ2V0IEdyaWQoKTogWHJtLkNvbnRyb2xzLkdyaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRHcmlkKCk7XG4gICAgICB9XG4gICAgICBhZGRPbkxvYWQoaGFuZGxlcjogWHJtLkV2ZW50cy5HcmlkQ29udHJvbC5Mb2FkRXZlbnRIYW5kbGVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuR3JpZENvbnRyb2wucmVtb3ZlT25Mb2FkKGhhbmRsZXIgYXMgYW55KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuYWRkT25Mb2FkKGhhbmRsZXIpO1xuICAgICAgfVxuICAgICAgZ2V0Q29udGV4dFR5cGUoKTogWHJtRW51bS5HcmlkQ29udHJvbENvbnRleHQge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRDb250ZXh0VHlwZSgpO1xuICAgICAgfVxuICAgICAgZ2V0RW50aXR5TmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRFbnRpdHlOYW1lKCk7XG4gICAgICB9XG4gICAgICBnZXRGZXRjaFhtbCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRGZXRjaFhtbCgpO1xuICAgICAgfVxuICAgICAgZ2V0R3JpZCgpOiBYcm0uQ29udHJvbHMuR3JpZCB7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmdldEdyaWQoKTtcbiAgICAgIH1cbiAgICAgIGdldFJlbGF0aW9uc2hpcCgpOiBYcm0uQ29udHJvbHMuR3JpZFJlbGF0aW9uc2hpcCB7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmdldFJlbGF0aW9uc2hpcCgpO1xuICAgICAgfVxuICAgICAgZ2V0VXJsKGNsaWVudD86IFhybUVudW0uR3JpZENsaWVudCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmdldFVybChjbGllbnQpO1xuICAgICAgfVxuICAgICAgZ2V0Vmlld1NlbGVjdG9yKCk6IFhybS5Db250cm9scy5WaWV3U2VsZWN0b3Ige1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRWaWV3U2VsZWN0b3IoKTtcbiAgICAgIH1cbiAgICAgIG9wZW5SZWxhdGVkR3JpZCgpOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wub3BlblJlbGF0ZWRHcmlkKCk7XG4gICAgICB9XG4gICAgICByZWZyZXNoKCk6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5yZWZyZXNoKCk7XG4gICAgICB9XG4gICAgICByZWZyZXNoUmliYm9uKCk6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5yZWZyZXNoUmliYm9uKCk7XG4gICAgICB9XG4gICAgICByZW1vdmVPbkxvYWQoaGFuZGxlcjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5yZW1vdmVPbkxvYWQoaGFuZGxlcik7XG4gICAgICB9XG4gICAgICBnZXRDb250cm9sVHlwZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRDb250cm9sVHlwZSgpO1xuICAgICAgfVxuICAgICAgZ2V0TmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXROYW1lKCk7XG4gICAgICB9XG4gICAgICBnZXRQYXJlbnQoKTogWHJtLkNvbnRyb2xzLlNlY3Rpb24ge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRQYXJlbnQoKTtcbiAgICAgIH1cbiAgICAgIGdldExhYmVsKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmdldExhYmVsKCk7XG4gICAgICB9XG4gICAgICBzZXRMYWJlbChsYWJlbDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLnNldExhYmVsKGxhYmVsKTtcbiAgICAgIH1cbiAgICAgIGdldFZpc2libGUoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmdldFZpc2libGUoKTtcbiAgICAgIH1cbiAgICAgIHNldFZpc2libGUodmlzaWJsZTogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5zZXRWaXNpYmxlKHZpc2libGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19