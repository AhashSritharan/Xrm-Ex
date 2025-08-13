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
     * Retrieves the error message from an error object.
     * @param error - The error object to retrieve the message from.
     * @returns The error message.
     */
    function getErrorMessage(error) {
        let msg = error, seen = new Set(), depth = 0;
        const validJSON = (t) => { try {
            JSON.parse(t);
            return true;
        }
        catch {
            return false;
        } };
        while (msg && depth++ < 20 && !seen.has(msg)) {
            seen.add(msg);
            if (msg.raw) {
                msg = msg.raw;
                continue;
            }
            if (msg.message) {
                msg = msg.message;
                continue;
            }
            if (typeof msg === 'string' && validJSON(msg)) {
                msg = JSON.parse(msg);
                continue;
            }
            break;
        }
        return msg;
    }
    XrmEx.getErrorMessage = getErrorMessage;
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
    const isGuid = (value) => /^\{?[0-9a-fA-F]{8}(-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}\}?$/.test(value);
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
    function getTypeName(value) {
        const type = typeof value;
        if (type === "string") {
            if (isGuid(value)) {
                return "mscrm.crmbaseentity";
            }
            return "Edm.String";
        }
        if (type === "number")
            return "Edm.Int32"; // Default to Int32 for numbers
        if (type === "boolean")
            return "Edm.Boolean";
        if (value instanceof Date)
            return "Edm.DateTimeOffset";
        if (Array.isArray(value))
            return "Collection(mscrm.crmbaseentity)";
        return "mscrm.crmbaseentity"; // Default for objects and unknown types
    }
    XrmEx.getTypeName = getTypeName;
    /**
     * Builds a request object for use with Xrm.WebApi.online.execute or executeMultiple.
     *
     * This function extracts the logic to prepare parameters and create
     * the request object without executing it. You can:
     * - Directly execute the returned request object using `Xrm.WebApi.online.execute()`.
     * - Use the request object later with `Xrm.WebApi.online.executeMultiple()`.
     *
     * @param {string} actionName - The unique name of the request (action/function/CRUD operation).
     * @param {RequestParameter[] | {[key: string]: any}} requestParameters - An array of request parameters or an object representing key-value pairs of request parameters.
     *   - If an array of `RequestParameter[]` is provided, each element should have `Name`, `Type`, and `Value` fields describing the request parameter.
     *   - If an object is provided, its keys represent parameter names, and values represent the parameter values.
     * @param {number} operationType - The type of the request. Use:
     *   - `0` for Action
     *   - `1` for Function
     *   - `2` for CRUD
     * @param {EntityReference} [boundEntity] - An optional `EntityReference` indicating the entity the request is bound to.
     *
     * @returns {object} - The request object that can be passed into `Xrm.WebApi.online.execute` or `Xrm.WebApi.online.executeMultiple`.
     *
     * @example
     * // Build a request object for a custom action "new_DoSomething" (operationType = 0 for actions)
     * const request = buildRequestObject("new_DoSomething", { param1: "value1", param2: 123 }, 0);
     *
     * // Execute the request immediately
     * const result = await Xrm.WebApi.online.execute(request);
     *
     * // Or store the request and execute it later using executeMultiple
     * const requests = [request, anotherRequest];
     * const batchResult = await Xrm.WebApi.online.executeMultiple(requests);
     */
    function buildRequestObject(actionName, requestParameters, operationType, boundEntity) {
        const prepareParameterDefinition = (params) => {
            const parameterDefinition = {};
            const p = Array.isArray(params) ? [...params] : { ...params };
            if (Array.isArray(p)) {
                p.forEach((param) => {
                    parameterDefinition[param.Name] = {
                        typeName: typeMap[param.Type].typeName,
                        structuralProperty: typeMap[param.Type].structuralProperty,
                    };
                });
            }
            else {
                Object.keys(p).forEach((key) => {
                    parameterDefinition[key] = {
                        structuralProperty: getStructuralProperty(p[key]),
                        typeName: getTypeName(p[key]),
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
        if (boundEntity) {
            if (Array.isArray(requestParameters)) {
                requestParameters.push({
                    Name: "entity",
                    Value: boundEntity,
                    Type: "EntityReference",
                });
            }
            else {
                requestParameters["entity"] = boundEntity;
            }
        }
        const parameterDefinition = prepareParameterDefinition(requestParameters);
        const request = createRequest(requestParameters, parameterDefinition);
        return request;
    }
    XrmEx.buildRequestObject = buildRequestObject;
    /**
     * Executes a request.
     * @param {string} actionName - The unique name of the request.
     * @param {RequestParameter[] | object} requestParameters - An array of objects with the parameter name, type, and value.
     * @param {EntityReference} [boundEntity] - An optional EntityReference of the bound entity.
     * @param {number} [operationType=1] - The type of the request. 0 for actions, 1 for functions, 2 for CRUD operations.
     * @returns {Promise<any>} - A Promise with the request response.
     * @throws {Error} - Throws an error if the request parameter is not of a supported type or has an invalid value.
     */
    async function execute(actionName, requestParameters, boundEntity, operationType = 1) {
        const request = buildRequestObject(actionName, requestParameters, operationType, boundEntity);
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
    /**
     * Opens an error dialog with the specified error information.
     * @param error The error object containing details about the error.
     */
    async function openErrorDialog(error) {
        try {
            return await Xrm.Navigation.openErrorDialog({
                message: getErrorMessage(error),
                details: JSON.stringify(error, null, 4),
                errorCode: error?.errorCode
            });
        }
        catch (error) {
            console.error(error.message);
            throw new Error(`XrmEx.${getFunctionName()}:\n${error.message}`);
        }
    }
    XrmEx.openErrorDialog = openErrorDialog;
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
        static async cloneRecord() {
            var entityFormOptions = {};
            var formParameters = {};
            var entityName = this.formContext.data.entity.getEntityName();
            entityFormOptions["entityName"] = entityName;
            this.formContext.data.entity.attributes.forEach((c) => {
                var attributeType = c.getAttributeType();
                var attributeName = c.getName();
                var attributeValue = c.getValue();
                if (!attributeValue ||
                    attributeName === "createdon" ||
                    attributeName === "modifiedon" ||
                    attributeName === "createdby" ||
                    attributeName === "modifiedby" ||
                    attributeName === "processid" ||
                    attributeName === "stageid" ||
                    attributeName === "ownerid" ||
                    attributeName.startsWith("transactioncurrency"))
                    return;
                if (attributeType === "lookup" &&
                    !c.getIsPartyList() &&
                    attributeValue.length > 0) {
                    formParameters[attributeName] = attributeValue[0].id;
                    formParameters[attributeName + "name"] = attributeValue[0].name;
                    if (attributeName === "customerid" ||
                        attributeName === "parentcustomerid" ||
                        (c.getAttributeType &&
                            c.getAttributeType() === "lookup" &&
                            typeof c.getLookupTypes === "function" &&
                            Array.isArray(c.getLookupTypes()) &&
                            c.getLookupTypes().length > 1)) {
                        formParameters[attributeName + "type"] =
                            attributeValue[0].entityType;
                    }
                }
                else if (attributeType === "datetime") {
                    formParameters[attributeName] = new Date(attributeValue).toISOString();
                }
                else {
                    formParameters[attributeName] = attributeValue;
                }
            });
            try {
                var result = await Xrm.Navigation.openForm(entityFormOptions, formParameters);
                console.log(result);
            }
            catch (error) {
                console.error(error.message);
                throw new Error(`XrmEx.${getFunctionName()}:\n${error.message}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWHJtRXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvWHJtRXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsOERBQThEO0FBa0M5RCxJQUFVLEtBQUssQ0EwbUVkO0FBMW1FRCxXQUFVLEtBQUs7SUFDYjs7OztPQUlHO0lBQ0gsU0FBZ0IsVUFBVSxDQUFDLFlBQW9CO1FBQzdDLE1BQU0sSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUZlLGdCQUFVLGFBRXpCLENBQUE7SUFDRDs7O09BR0c7SUFDSCxTQUFnQixlQUFlO1FBQzdCLElBQUk7WUFDRixNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQzFCLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDdkUsTUFBTSxtQkFBbUIsR0FDdkIsVUFBVSxJQUFJLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUNuRSxNQUFNLGlCQUFpQixHQUNyQixtQkFBbUIsRUFBRSxLQUFLLENBQUMsb0JBQW9CLENBQUM7Z0JBQ2hELG1CQUFtQixFQUFFLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUM5QyxNQUFNLFlBQVksR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUVuRSxPQUFPLFlBQVksQ0FBQztTQUNyQjtRQUFDLE9BQU8sS0FBVSxFQUFFO1lBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFD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MUVZLGlCQUFXLGNBMEV2QixDQUFBO0lBQ0gsQ0FBQyxFQTNnQ2dCLEtBQUssR0FBTCxXQUFLLEtBQUwsV0FBSyxRQTJnQ3JCO0FBQ0gsQ0FBQyxFQTFtRVMsS0FBSyxLQUFMLEtBQUssUUEwbUVkIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL25vZGVfbW9kdWxlcy9AdHlwZXMveHJtL2luZGV4LmQudHNcIiAvPlxyXG4vKipcclxuICogUmVwcmVzZW50cyBhIHBhcmFtZXRlciBmb3IgYSByZXF1ZXN0LlxyXG4gKiBAdHlwZSB7T2JqZWN0fSBSZXF1ZXN0UGFyYW1ldGVyXHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBOYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHBhcmFtZXRlci5cclxuICogQHByb3BlcnR5IHsnQm9vbGVhbicgfCAnRGF0ZVRpbWUnIHwgJ0RlY2ltYWwnIHwgJ0VudGl0eScgfCAnRW50aXR5Q29sbGVjdGlvbicgfCAnRW50aXR5UmVmZXJlbmNlJyB8ICdGbG9hdCcgfCAnSW50ZWdlcicgfCAnTW9uZXknIHwgJ1BpY2tsaXN0JyB8ICdTdHJpbmcnfSBUeXBlIC0gVGhlIHR5cGUgb2YgdGhlIHBhcmFtZXRlci5cclxuICogQHByb3BlcnR5IHsqfSBWYWx1ZSAtIFRoZSB2YWx1ZSBvZiB0aGUgcGFyYW1ldGVyLlxyXG4gKi9cclxudHlwZSBSZXF1ZXN0UGFyYW1ldGVyID0ge1xyXG4gIE5hbWU6IHN0cmluZztcclxuICBUeXBlOlxyXG4gIHwgXCJCb29sZWFuXCJcclxuICB8IFwiRGF0ZVRpbWVcIlxyXG4gIHwgXCJEZWNpbWFsXCJcclxuICB8IFwiRW50aXR5XCJcclxuICB8IFwiRW50aXR5Q29sbGVjdGlvblwiXHJcbiAgfCBcIkVudGl0eVJlZmVyZW5jZVwiXHJcbiAgfCBcIkZsb2F0XCJcclxuICB8IFwiSW50ZWdlclwiXHJcbiAgfCBcIk1vbmV5XCJcclxuICB8IFwiUGlja2xpc3RcIlxyXG4gIHwgXCJTdHJpbmdcIjtcclxuICBWYWx1ZTogYW55O1xyXG59O1xyXG4vKipcclxuICogUmVwcmVzZW50cyBhIHJlZmVyZW5jZSB0byBhbiBlbnRpdHkuXHJcbiAqIEB0eXBlXHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBpZCAtIFRoZSBJRCBvZiB0aGUgZW50aXR5LlxyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gZW50aXR5VHlwZSAtIFRoZSB0eXBlIG9mIHRoZSBlbnRpdHkuXHJcbiAqL1xyXG50eXBlIEVudGl0eVJlZmVyZW5jZSA9IHtcclxuICBpZDogc3RyaW5nO1xyXG4gIGVudGl0eVR5cGU6IHN0cmluZztcclxufTtcclxubmFtZXNwYWNlIFhybUV4IHtcclxuICAvKipcclxuICAgKiBUaHJvd3MgYW4gZXJyb3Igd2l0aCB0aGUgZ2l2ZW4gZXJyb3IgbWVzc2FnZS5cclxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXJyb3JNZXNzYWdlIC0gVGhlIGVycm9yIG1lc3NhZ2UgdG8gdGhyb3cuXHJcbiAgICogQHRocm93cyB7RXJyb3J9IC0gQWx3YXlzIHRocm93cyBhbiBlcnJvciB3aXRoIHRoZSBnaXZlbiBlcnJvciBtZXNzYWdlLlxyXG4gICAqL1xyXG4gIGV4cG9ydCBmdW5jdGlvbiB0aHJvd0Vycm9yKGVycm9yTWVzc2FnZTogc3RyaW5nKTogbmV2ZXIge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTWVzc2FnZSk7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIG5hbWUgb2YgdGhlIGNhbGxpbmcgZnVuY3Rpb24uXHJcbiAgICogQHJldHVybnMge3N0cmluZ30gLSBUaGUgbmFtZSBvZiB0aGUgY2FsbGluZyBmdW5jdGlvbi5cclxuICAgKi9cclxuICBleHBvcnQgZnVuY3Rpb24gZ2V0RnVuY3Rpb25OYW1lKCk6IHN0cmluZyB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcigpO1xyXG4gICAgICBjb25zdCBzdGFja1RyYWNlID0gZXJyb3Iuc3RhY2s/LnNwbGl0KFwiXFxuXCIpLm1hcCgobGluZSkgPT4gbGluZS50cmltKCkpO1xyXG4gICAgICBjb25zdCBjYWxsaW5nRnVuY3Rpb25MaW5lID1cclxuICAgICAgICBzdGFja1RyYWNlICYmIHN0YWNrVHJhY2UubGVuZ3RoID49IDMgPyBzdGFja1RyYWNlWzJdIDogdW5kZWZpbmVkO1xyXG4gICAgICBjb25zdCBmdW5jdGlvbk5hbWVNYXRjaCA9XHJcbiAgICAgICAgY2FsbGluZ0Z1bmN0aW9uTGluZT8ubWF0Y2goL2F0XFxzKyhbXlxcc10rKVxccytcXCgvKSB8fFxyXG4gICAgICAgIGNhbGxpbmdGdW5jdGlvbkxpbmU/Lm1hdGNoKC9hdFxccysoW15cXHNdKykvKTtcclxuICAgICAgY29uc3QgZnVuY3Rpb25OYW1lID0gZnVuY3Rpb25OYW1lTWF0Y2ggPyBmdW5jdGlvbk5hbWVNYXRjaFsxXSA6IFwiXCI7XHJcblxyXG4gICAgICByZXR1cm4gZnVuY3Rpb25OYW1lO1xyXG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LmdldEZ1bmN0aW9uTmFtZTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIFJldHJpZXZlcyB0aGUgZXJyb3IgbWVzc2FnZSBmcm9tIGFuIGVycm9yIG9iamVjdC5cclxuICAgKiBAcGFyYW0gZXJyb3IgLSBUaGUgZXJyb3Igb2JqZWN0IHRvIHJldHJpZXZlIHRoZSBtZXNzYWdlIGZyb20uXHJcbiAgICogQHJldHVybnMgVGhlIGVycm9yIG1lc3NhZ2UuXHJcbiAgICovXHJcbiAgZXhwb3J0IGZ1bmN0aW9uIGdldEVycm9yTWVzc2FnZShlcnJvcjogYW55KTogc3RyaW5nIHtcclxuICAgIGxldCBtc2cgPSBlcnJvciwgc2VlbiA9IG5ldyBTZXQoKSwgZGVwdGggPSAwO1xyXG4gICAgY29uc3QgdmFsaWRKU09OID0gKHQ6IHN0cmluZykgPT4geyB0cnkgeyBKU09OLnBhcnNlKHQpOyByZXR1cm4gdHJ1ZTsgfSBjYXRjaCB7IHJldHVybiBmYWxzZTsgfSB9O1xyXG4gICAgd2hpbGUgKG1zZyAmJiBkZXB0aCsrIDwgMjAgJiYgIXNlZW4uaGFzKG1zZykpIHtcclxuICAgICAgc2Vlbi5hZGQobXNnKTtcclxuICAgICAgaWYgKG1zZy5yYXcpIHsgbXNnID0gbXNnLnJhdzsgY29udGludWU7IH1cclxuICAgICAgaWYgKG1zZy5tZXNzYWdlKSB7IG1zZyA9IG1zZy5tZXNzYWdlOyBjb250aW51ZTsgfVxyXG4gICAgICBpZiAodHlwZW9mIG1zZyA9PT0gJ3N0cmluZycgJiYgdmFsaWRKU09OKG1zZykpIHsgbXNnID0gSlNPTi5wYXJzZShtc2cpOyBjb250aW51ZTsgfVxyXG4gICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHJldHVybiBtc2c7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIERpc3BsYXlzIGEgbm90aWZpY2F0aW9uIGZvciBhbiBhcHAgd2l0aCB0aGUgZ2l2ZW4gbWVzc2FnZSBhbmQgbGV2ZWwsIGFuZCBsZXRzIHlvdSBzcGVjaWZ5IHdoZXRoZXIgdG8gc2hvdyBhIGNsb3NlIGJ1dHRvbi5cclxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIFRoZSBtZXNzYWdlIHRvIGRpc3BsYXkgaW4gdGhlIG5vdGlmaWNhdGlvbi5cclxuICAgKiBAcGFyYW0geydTVUNDRVNTJyB8ICdFUlJPUicgfCAnV0FSTklORycgfCAnSU5GTyd9IGxldmVsIC0gVGhlIGxldmVsIG9mIHRoZSBub3RpZmljYXRpb24uIENhbiBiZSAnU1VDQ0VTUycsICdFUlJPUicsICdXQVJOSU5HJywgb3IgJ0lORk8nLlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3Nob3dDbG9zZUJ1dHRvbj1mYWxzZV0gLSBXaGV0aGVyIHRvIHNob3cgYSBjbG9zZSBidXR0b24gb24gdGhlIG5vdGlmaWNhdGlvbi4gRGVmYXVsdHMgdG8gZmFsc2UuXHJcbiAgICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gLSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBJRCBvZiB0aGUgY3JlYXRlZCBub3RpZmljYXRpb24uXHJcbiAgICovXHJcbiAgZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZEdsb2JhbE5vdGlmaWNhdGlvbihcclxuICAgIG1lc3NhZ2U6IHN0cmluZyxcclxuICAgIGxldmVsOiBcIlNVQ0NFU1NcIiB8IFwiRVJST1JcIiB8IFwiV0FSTklOR1wiIHwgXCJJTkZPXCIsXHJcbiAgICBzaG93Q2xvc2VCdXR0b24gPSBmYWxzZVxyXG4gICk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICBjb25zdCBsZXZlbE1hcCA9IHtcclxuICAgICAgU1VDQ0VTUzogMSxcclxuICAgICAgRVJST1I6IDIsXHJcbiAgICAgIFdBUk5JTkc6IDMsXHJcbiAgICAgIElORk86IDQsXHJcbiAgICB9O1xyXG4gICAgY29uc3QgbWVzc2FnZUxldmVsID0gbGV2ZWxNYXBbbGV2ZWxdIHx8IGxldmVsTWFwLklORk87XHJcbiAgICBjb25zdCBub3RpZmljYXRpb24gPSB7XHJcbiAgICAgIHR5cGU6IDIsXHJcbiAgICAgIGxldmVsOiBtZXNzYWdlTGV2ZWwsXHJcbiAgICAgIG1lc3NhZ2UsXHJcbiAgICAgIHNob3dDbG9zZUJ1dHRvbixcclxuICAgIH07XHJcbiAgICB0cnkge1xyXG4gICAgICByZXR1cm4gYXdhaXQgWHJtLkFwcC5hZGRHbG9iYWxOb3RpZmljYXRpb24obm90aWZpY2F0aW9uKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke2dldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIENsZWFycyBhIG5vdGlmaWNhdGlvbiBpbiB0aGUgYXBwIHdpdGggdGhlIGdpdmVuIHVuaXF1ZSBJRC5cclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdW5pcXVlSWQgLSBUaGUgdW5pcXVlIElEIG9mIHRoZSBub3RpZmljYXRpb24gdG8gY2xlYXIuXHJcbiAgICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gLSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBub3RpZmljYXRpb24gaGFzIGJlZW4gY2xlYXJlZC5cclxuICAgKi9cclxuICBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVtb3ZlR2xvYmFsTm90aWZpY2F0aW9uKFxyXG4gICAgdW5pcXVlSWQ6IHN0cmluZ1xyXG4gICk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICB0cnkge1xyXG4gICAgICByZXR1cm4gYXdhaXQgWHJtLkFwcC5jbGVhckdsb2JhbE5vdGlmaWNhdGlvbih1bmlxdWVJZCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguJHtnZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gICAgfVxyXG4gIH1cclxuICAvKipcclxuICAgKiBSZXRyaWV2ZXMgdGhlIHZhbHVlIG9mIGFuIGVudmlyb25tZW50IHZhcmlhYmxlIGJ5IHVzaW5nIGl0cyBzY2hlbWEgbmFtZSBhcyBrZXkuXHJcbiAgICogSWYgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlIGhhcyBib3RoIGEgZGVmYXVsdCB2YWx1ZSBhbmQgYSBjdXJyZW50IHZhbHVlLCB0aGlzIGZ1bmN0aW9uIHdpbGwgcmV0cmlldmUgdGhlIGN1cnJlbnQgdmFsdWUuXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGVudmlyb25tZW50VmFyaWFibGVTY2hlbWFOYW1lIC0gVGhlIHNjaGVtYSBuYW1lIG9mIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZSB0byByZXRyaWV2ZS5cclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSAtIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIHZhbHVlIG9mIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZS5cclxuICAgKiBAYXN5bmNcclxuICAgKi9cclxuICBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RW52aXJvbm1lbnRWYXJpYWJsZVZhbHVlKFxyXG4gICAgZW52aXJvbm1lbnRWYXJpYWJsZVNjaGVtYU5hbWU6IHN0cmluZ1xyXG4gICk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBleGVjdXRlRnVuY3Rpb24oXCJSZXRyaWV2ZUVudmlyb25tZW50VmFyaWFibGVWYWx1ZVwiLCBbXHJcbiAgICAgIHtcclxuICAgICAgICBOYW1lOiBcIkRlZmluaXRpb25TY2hlbWFOYW1lXCIsXHJcbiAgICAgICAgVHlwZTogXCJTdHJpbmdcIixcclxuICAgICAgICBWYWx1ZTogZW52aXJvbm1lbnRWYXJpYWJsZVNjaGVtYU5hbWUsXHJcbiAgICAgIH0sXHJcbiAgICBdKTtcclxuICAgIHJldHVybiBPYmplY3QuaGFzT3duKHJlc3BvbnNlLCBcIlZhbHVlXCIpID8gcmVzcG9uc2UuVmFsdWUgOiByZXNwb25zZTtcclxuICB9XHJcbiAgY29uc3QgaXNHdWlkID0gKHZhbHVlOiBzdHJpbmcpOiBib29sZWFuID0+XHJcbiAgICAvXlxcez9bMC05YS1mQS1GXXs4fSgtWzAtOWEtZkEtRl17NH0pezN9LVswLTlhLWZBLUZdezEyfVxcfT8kLy50ZXN0KHZhbHVlKTtcclxuICAvKipcclxuICAgKiBBIG1hcCBvZiBDUk0gZGF0YSB0eXBlcyB0byB0aGVpciBjb3JyZXNwb25kaW5nIHR5cGUgbmFtZXMsIHN0cnVjdHVyYWwgcHJvcGVydGllcywgYW5kIEphdmFTY3JpcHQgdHlwZXMuXHJcbiAgICogQHR5cGUge09iamVjdC48c3RyaW5nLCB7IHR5cGVOYW1lOiBzdHJpbmcsIHN0cnVjdHVyYWxQcm9wZXJ0eTogbnVtYmVyLCBqc1R5cGU6IHN0cmluZyB9Pn1cclxuICAgKi9cclxuICBsZXQgdHlwZU1hcCA9IHtcclxuICAgIFN0cmluZzogeyB0eXBlTmFtZTogXCJFZG0uU3RyaW5nXCIsIHN0cnVjdHVyYWxQcm9wZXJ0eTogMSwganNUeXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICBJbnRlZ2VyOiB7IHR5cGVOYW1lOiBcIkVkbS5JbnQzMlwiLCBzdHJ1Y3R1cmFsUHJvcGVydHk6IDEsIGpzVHlwZTogXCJudW1iZXJcIiB9LFxyXG4gICAgQm9vbGVhbjoge1xyXG4gICAgICB0eXBlTmFtZTogXCJFZG0uQm9vbGVhblwiLFxyXG4gICAgICBzdHJ1Y3R1cmFsUHJvcGVydHk6IDEsXHJcbiAgICAgIGpzVHlwZTogXCJib29sZWFuXCIsXHJcbiAgICB9LFxyXG4gICAgRGF0ZVRpbWU6IHtcclxuICAgICAgdHlwZU5hbWU6IFwiRWRtLkRhdGVUaW1lT2Zmc2V0XCIsXHJcbiAgICAgIHN0cnVjdHVyYWxQcm9wZXJ0eTogMSxcclxuICAgICAganNUeXBlOiBcIm9iamVjdFwiLFxyXG4gICAgfSxcclxuICAgIEVudGl0eVJlZmVyZW5jZToge1xyXG4gICAgICB0eXBlTmFtZTogXCJtc2NybS5jcm1iYXNlZW50aXR5XCIsXHJcbiAgICAgIHN0cnVjdHVyYWxQcm9wZXJ0eTogNSxcclxuICAgICAganNUeXBlOiBcIm9iamVjdFwiLFxyXG4gICAgfSxcclxuICAgIERlY2ltYWw6IHtcclxuICAgICAgdHlwZU5hbWU6IFwiRWRtLkRlY2ltYWxcIixcclxuICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiAxLFxyXG4gICAgICBqc1R5cGU6IFwibnVtYmVyXCIsXHJcbiAgICB9LFxyXG4gICAgRW50aXR5OiB7XHJcbiAgICAgIHR5cGVOYW1lOiBcIm1zY3JtLmNybWJhc2VlbnRpdHlcIixcclxuICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiA1LFxyXG4gICAgICBqc1R5cGU6IFwib2JqZWN0XCIsXHJcbiAgICB9LFxyXG4gICAgRW50aXR5Q29sbGVjdGlvbjoge1xyXG4gICAgICB0eXBlTmFtZTogXCJDb2xsZWN0aW9uKG1zY3JtLmNybWJhc2VlbnRpdHkpXCIsXHJcbiAgICAgIHN0cnVjdHVyYWxQcm9wZXJ0eTogNCxcclxuICAgICAganNUeXBlOiBcIm9iamVjdFwiLFxyXG4gICAgfSxcclxuICAgIEZsb2F0OiB7IHR5cGVOYW1lOiBcIkVkbS5Eb3VibGVcIiwgc3RydWN0dXJhbFByb3BlcnR5OiAxLCBqc1R5cGU6IFwibnVtYmVyXCIgfSxcclxuICAgIE1vbmV5OiB7IHR5cGVOYW1lOiBcIkVkbS5EZWNpbWFsXCIsIHN0cnVjdHVyYWxQcm9wZXJ0eTogMSwganNUeXBlOiBcIm51bWJlclwiIH0sXHJcbiAgICBQaWNrbGlzdDoge1xyXG4gICAgICB0eXBlTmFtZTogXCJFZG0uSW50MzJcIixcclxuICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiAxLFxyXG4gICAgICBqc1R5cGU6IFwibnVtYmVyXCIsXHJcbiAgICB9LFxyXG4gIH07XHJcbiAgZXhwb3J0IGZ1bmN0aW9uIGdldFN0cnVjdHVyYWxQcm9wZXJ0eSh2YWx1ZTogYW55KTogbnVtYmVyIHtcclxuICAgIGNvbnN0IHR5cGUgPSB0eXBlb2YgdmFsdWU7XHJcbiAgICBpZiAodHlwZSA9PSBcInN0cmluZ1wiIHx8IHR5cGUgPT0gXCJudW1iZXJcIiB8fCB0eXBlID09IFwiYm9vbGVhblwiKSByZXR1cm4gMTtcclxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHJldHVybiAxO1xyXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSByZXR1cm4gNDtcclxuICAgIHJldHVybiA1O1xyXG4gIH1cclxuICBleHBvcnQgZnVuY3Rpb24gZ2V0VHlwZU5hbWUodmFsdWU6IGFueSk6IHN0cmluZyB7XHJcbiAgICBjb25zdCB0eXBlID0gdHlwZW9mIHZhbHVlO1xyXG4gICAgaWYgKHR5cGUgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgaWYgKGlzR3VpZCh2YWx1ZSkpIHtcclxuICAgICAgICByZXR1cm4gXCJtc2NybS5jcm1iYXNlZW50aXR5XCI7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFwiRWRtLlN0cmluZ1wiO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGUgPT09IFwibnVtYmVyXCIpIHJldHVybiBcIkVkbS5JbnQzMlwiOyAvLyBEZWZhdWx0IHRvIEludDMyIGZvciBudW1iZXJzXHJcbiAgICBpZiAodHlwZSA9PT0gXCJib29sZWFuXCIpIHJldHVybiBcIkVkbS5Cb29sZWFuXCI7XHJcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSByZXR1cm4gXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIjtcclxuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkgcmV0dXJuIFwiQ29sbGVjdGlvbihtc2NybS5jcm1iYXNlZW50aXR5KVwiO1xyXG4gICAgcmV0dXJuIFwibXNjcm0uY3JtYmFzZWVudGl0eVwiOyAvLyBEZWZhdWx0IGZvciBvYmplY3RzIGFuZCB1bmtub3duIHR5cGVzXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBCdWlsZHMgYSByZXF1ZXN0IG9iamVjdCBmb3IgdXNlIHdpdGggWHJtLldlYkFwaS5vbmxpbmUuZXhlY3V0ZSBvciBleGVjdXRlTXVsdGlwbGUuXHJcbiAgICpcclxuICAgKiBUaGlzIGZ1bmN0aW9uIGV4dHJhY3RzIHRoZSBsb2dpYyB0byBwcmVwYXJlIHBhcmFtZXRlcnMgYW5kIGNyZWF0ZVxyXG4gICAqIHRoZSByZXF1ZXN0IG9iamVjdCB3aXRob3V0IGV4ZWN1dGluZyBpdC4gWW91IGNhbjpcclxuICAgKiAtIERpcmVjdGx5IGV4ZWN1dGUgdGhlIHJldHVybmVkIHJlcXVlc3Qgb2JqZWN0IHVzaW5nIGBYcm0uV2ViQXBpLm9ubGluZS5leGVjdXRlKClgLlxyXG4gICAqIC0gVXNlIHRoZSByZXF1ZXN0IG9iamVjdCBsYXRlciB3aXRoIGBYcm0uV2ViQXBpLm9ubGluZS5leGVjdXRlTXVsdGlwbGUoKWAuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gYWN0aW9uTmFtZSAtIFRoZSB1bmlxdWUgbmFtZSBvZiB0aGUgcmVxdWVzdCAoYWN0aW9uL2Z1bmN0aW9uL0NSVUQgb3BlcmF0aW9uKS5cclxuICAgKiBAcGFyYW0ge1JlcXVlc3RQYXJhbWV0ZXJbXSB8IHtba2V5OiBzdHJpbmddOiBhbnl9fSByZXF1ZXN0UGFyYW1ldGVycyAtIEFuIGFycmF5IG9mIHJlcXVlc3QgcGFyYW1ldGVycyBvciBhbiBvYmplY3QgcmVwcmVzZW50aW5nIGtleS12YWx1ZSBwYWlycyBvZiByZXF1ZXN0IHBhcmFtZXRlcnMuXHJcbiAgICogICAtIElmIGFuIGFycmF5IG9mIGBSZXF1ZXN0UGFyYW1ldGVyW11gIGlzIHByb3ZpZGVkLCBlYWNoIGVsZW1lbnQgc2hvdWxkIGhhdmUgYE5hbWVgLCBgVHlwZWAsIGFuZCBgVmFsdWVgIGZpZWxkcyBkZXNjcmliaW5nIHRoZSByZXF1ZXN0IHBhcmFtZXRlci5cclxuICAgKiAgIC0gSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkLCBpdHMga2V5cyByZXByZXNlbnQgcGFyYW1ldGVyIG5hbWVzLCBhbmQgdmFsdWVzIHJlcHJlc2VudCB0aGUgcGFyYW1ldGVyIHZhbHVlcy5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gb3BlcmF0aW9uVHlwZSAtIFRoZSB0eXBlIG9mIHRoZSByZXF1ZXN0LiBVc2U6XHJcbiAgICogICAtIGAwYCBmb3IgQWN0aW9uXHJcbiAgICogICAtIGAxYCBmb3IgRnVuY3Rpb25cclxuICAgKiAgIC0gYDJgIGZvciBDUlVEXHJcbiAgICogQHBhcmFtIHtFbnRpdHlSZWZlcmVuY2V9IFtib3VuZEVudGl0eV0gLSBBbiBvcHRpb25hbCBgRW50aXR5UmVmZXJlbmNlYCBpbmRpY2F0aW5nIHRoZSBlbnRpdHkgdGhlIHJlcXVlc3QgaXMgYm91bmQgdG8uXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7b2JqZWN0fSAtIFRoZSByZXF1ZXN0IG9iamVjdCB0aGF0IGNhbiBiZSBwYXNzZWQgaW50byBgWHJtLldlYkFwaS5vbmxpbmUuZXhlY3V0ZWAgb3IgYFhybS5XZWJBcGkub25saW5lLmV4ZWN1dGVNdWx0aXBsZWAuXHJcbiAgICpcclxuICAgKiBAZXhhbXBsZVxyXG4gICAqIC8vIEJ1aWxkIGEgcmVxdWVzdCBvYmplY3QgZm9yIGEgY3VzdG9tIGFjdGlvbiBcIm5ld19Eb1NvbWV0aGluZ1wiIChvcGVyYXRpb25UeXBlID0gMCBmb3IgYWN0aW9ucylcclxuICAgKiBjb25zdCByZXF1ZXN0ID0gYnVpbGRSZXF1ZXN0T2JqZWN0KFwibmV3X0RvU29tZXRoaW5nXCIsIHsgcGFyYW0xOiBcInZhbHVlMVwiLCBwYXJhbTI6IDEyMyB9LCAwKTtcclxuICAgKlxyXG4gICAqIC8vIEV4ZWN1dGUgdGhlIHJlcXVlc3QgaW1tZWRpYXRlbHlcclxuICAgKiBjb25zdCByZXN1bHQgPSBhd2FpdCBYcm0uV2ViQXBpLm9ubGluZS5leGVjdXRlKHJlcXVlc3QpO1xyXG4gICAqXHJcbiAgICogLy8gT3Igc3RvcmUgdGhlIHJlcXVlc3QgYW5kIGV4ZWN1dGUgaXQgbGF0ZXIgdXNpbmcgZXhlY3V0ZU11bHRpcGxlXHJcbiAgICogY29uc3QgcmVxdWVzdHMgPSBbcmVxdWVzdCwgYW5vdGhlclJlcXVlc3RdO1xyXG4gICAqIGNvbnN0IGJhdGNoUmVzdWx0ID0gYXdhaXQgWHJtLldlYkFwaS5vbmxpbmUuZXhlY3V0ZU11bHRpcGxlKHJlcXVlc3RzKTtcclxuICAgKi9cclxuICBleHBvcnQgZnVuY3Rpb24gYnVpbGRSZXF1ZXN0T2JqZWN0KFxyXG4gICAgYWN0aW9uTmFtZTogc3RyaW5nLFxyXG4gICAgcmVxdWVzdFBhcmFtZXRlcnM6IFJlcXVlc3RQYXJhbWV0ZXJbXSB8IHsgW2tleTogc3RyaW5nXTogYW55IH0sXHJcbiAgICBvcGVyYXRpb25UeXBlOiBudW1iZXIsXHJcbiAgICBib3VuZEVudGl0eT86IEVudGl0eVJlZmVyZW5jZVxyXG4gICkge1xyXG4gICAgY29uc3QgcHJlcGFyZVBhcmFtZXRlckRlZmluaXRpb24gPSAoXHJcbiAgICAgIHBhcmFtczogUmVxdWVzdFBhcmFtZXRlcltdIHwgeyBba2V5OiBzdHJpbmddOiBhbnkgfVxyXG4gICAgKSA9PiB7XHJcbiAgICAgIGNvbnN0IHBhcmFtZXRlckRlZmluaXRpb246IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7fTtcclxuICAgICAgY29uc3QgcCA9IEFycmF5LmlzQXJyYXkocGFyYW1zKSA/IFsuLi5wYXJhbXNdIDogeyAuLi5wYXJhbXMgfTtcclxuXHJcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHApKSB7XHJcbiAgICAgICAgcC5mb3JFYWNoKChwYXJhbSkgPT4ge1xyXG4gICAgICAgICAgcGFyYW1ldGVyRGVmaW5pdGlvbltwYXJhbS5OYW1lXSA9IHtcclxuICAgICAgICAgICAgdHlwZU5hbWU6IHR5cGVNYXBbcGFyYW0uVHlwZV0udHlwZU5hbWUsXHJcbiAgICAgICAgICAgIHN0cnVjdHVyYWxQcm9wZXJ0eTogdHlwZU1hcFtwYXJhbS5UeXBlXS5zdHJ1Y3R1cmFsUHJvcGVydHksXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIE9iamVjdC5rZXlzKHApLmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICAgICAgcGFyYW1ldGVyRGVmaW5pdGlvbltrZXldID0ge1xyXG4gICAgICAgICAgICBzdHJ1Y3R1cmFsUHJvcGVydHk6IGdldFN0cnVjdHVyYWxQcm9wZXJ0eShwW2tleV0pLFxyXG4gICAgICAgICAgICB0eXBlTmFtZTogZ2V0VHlwZU5hbWUocFtrZXldKSxcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBwYXJhbWV0ZXJEZWZpbml0aW9uO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBjcmVhdGVSZXF1ZXN0ID0gKFxyXG4gICAgICBwYXJhbXM6IFJlcXVlc3RQYXJhbWV0ZXJbXSB8IHsgW2tleTogc3RyaW5nXTogYW55IH0sXHJcbiAgICAgIGRlZmluaXRpb246IHsgW2tleTogc3RyaW5nXTogYW55IH1cclxuICAgICkgPT4ge1xyXG4gICAgICBjb25zdCBtZXRhZGF0YSA9IHtcclxuICAgICAgICBib3VuZFBhcmFtZXRlcjogYm91bmRFbnRpdHkgPyBcImVudGl0eVwiIDogbnVsbCxcclxuICAgICAgICBvcGVyYXRpb25UeXBlOiBvcGVyYXRpb25UeXBlLFxyXG4gICAgICAgIG9wZXJhdGlvbk5hbWU6IGFjdGlvbk5hbWUsXHJcbiAgICAgICAgcGFyYW1ldGVyVHlwZXM6IGRlZmluaXRpb24sXHJcbiAgICAgIH07XHJcbiAgICAgIGNvbnN0IG1lcmdlZFBhcmFtcyA9IEFycmF5LmlzQXJyYXkocGFyYW1zKVxyXG4gICAgICAgID8gT2JqZWN0LmFzc2lnbih7fSwgLi4ucGFyYW1zLm1hcCgocCkgPT4gKHsgW3AuTmFtZV06IHAuVmFsdWUgfSkpKVxyXG4gICAgICAgIDogcGFyYW1zO1xyXG5cclxuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oeyBnZXRNZXRhZGF0YTogKCkgPT4gbWV0YWRhdGEgfSwgbWVyZ2VkUGFyYW1zKTtcclxuICAgIH07XHJcbiAgICBpZiAoYm91bmRFbnRpdHkpIHtcclxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmVxdWVzdFBhcmFtZXRlcnMpKSB7XHJcbiAgICAgICAgcmVxdWVzdFBhcmFtZXRlcnMucHVzaCh7XHJcbiAgICAgICAgICBOYW1lOiBcImVudGl0eVwiLFxyXG4gICAgICAgICAgVmFsdWU6IGJvdW5kRW50aXR5LFxyXG4gICAgICAgICAgVHlwZTogXCJFbnRpdHlSZWZlcmVuY2VcIixcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXF1ZXN0UGFyYW1ldGVyc1tcImVudGl0eVwiXSA9IGJvdW5kRW50aXR5O1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcGFyYW1ldGVyRGVmaW5pdGlvbiA9IHByZXBhcmVQYXJhbWV0ZXJEZWZpbml0aW9uKHJlcXVlc3RQYXJhbWV0ZXJzKTtcclxuICAgIGNvbnN0IHJlcXVlc3QgPSBjcmVhdGVSZXF1ZXN0KHJlcXVlc3RQYXJhbWV0ZXJzLCBwYXJhbWV0ZXJEZWZpbml0aW9uKTtcclxuICAgIHJldHVybiByZXF1ZXN0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRXhlY3V0ZXMgYSByZXF1ZXN0LlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhY3Rpb25OYW1lIC0gVGhlIHVuaXF1ZSBuYW1lIG9mIHRoZSByZXF1ZXN0LlxyXG4gICAqIEBwYXJhbSB7UmVxdWVzdFBhcmFtZXRlcltdIHwgb2JqZWN0fSByZXF1ZXN0UGFyYW1ldGVycyAtIEFuIGFycmF5IG9mIG9iamVjdHMgd2l0aCB0aGUgcGFyYW1ldGVyIG5hbWUsIHR5cGUsIGFuZCB2YWx1ZS5cclxuICAgKiBAcGFyYW0ge0VudGl0eVJlZmVyZW5jZX0gW2JvdW5kRW50aXR5XSAtIEFuIG9wdGlvbmFsIEVudGl0eVJlZmVyZW5jZSBvZiB0aGUgYm91bmQgZW50aXR5LlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbb3BlcmF0aW9uVHlwZT0xXSAtIFRoZSB0eXBlIG9mIHRoZSByZXF1ZXN0LiAwIGZvciBhY3Rpb25zLCAxIGZvciBmdW5jdGlvbnMsIDIgZm9yIENSVUQgb3BlcmF0aW9ucy5cclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fSAtIEEgUHJvbWlzZSB3aXRoIHRoZSByZXF1ZXN0IHJlc3BvbnNlLlxyXG4gICAqIEB0aHJvd3Mge0Vycm9yfSAtIFRocm93cyBhbiBlcnJvciBpZiB0aGUgcmVxdWVzdCBwYXJhbWV0ZXIgaXMgbm90IG9mIGEgc3VwcG9ydGVkIHR5cGUgb3IgaGFzIGFuIGludmFsaWQgdmFsdWUuXHJcbiAgICovXHJcbiAgZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGUoXHJcbiAgICBhY3Rpb25OYW1lOiBzdHJpbmcsXHJcbiAgICByZXF1ZXN0UGFyYW1ldGVyczogUmVxdWVzdFBhcmFtZXRlcltdIHwgeyBba2V5OiBzdHJpbmddOiBhbnkgfSxcclxuICAgIGJvdW5kRW50aXR5PzogRW50aXR5UmVmZXJlbmNlLFxyXG4gICAgb3BlcmF0aW9uVHlwZTogbnVtYmVyID0gMVxyXG4gICk6IFByb21pc2U8YW55PiB7XHJcbiAgICBjb25zdCByZXF1ZXN0ID0gYnVpbGRSZXF1ZXN0T2JqZWN0KFxyXG4gICAgICBhY3Rpb25OYW1lLFxyXG4gICAgICByZXF1ZXN0UGFyYW1ldGVycyxcclxuICAgICAgb3BlcmF0aW9uVHlwZSxcclxuICAgICAgYm91bmRFbnRpdHlcclxuICAgICk7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBYcm0uV2ViQXBpLm9ubGluZS5leGVjdXRlKHJlcXVlc3QpO1xyXG4gICAgaWYgKHJlc3VsdC5vaykgcmV0dXJuIHJlc3VsdC5qc29uKCkuY2F0Y2goKCkgPT4gcmVzdWx0KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEV4ZWN1dGVzIGFuIEFjdGlvbi5cclxuICAgKiBAcGFyYW0ge3N0cmluZ30gYWN0aW9uTmFtZSAtIFRoZSB1bmlxdWUgbmFtZSBvZiB0aGUgYWN0aW9uLlxyXG4gICAqIEBwYXJhbSB7UmVxdWVzdFBhcmFtZXRlcltdIHwgb2JqZWN0fSByZXF1ZXN0UGFyYW1ldGVycyAtIEFuIGFycmF5IG9mIG9iamVjdHMgd2l0aCB0aGUgcGFyYW1ldGVyIG5hbWUsIHR5cGUsIGFuZCB2YWx1ZS5cclxuICAgKiBAcGFyYW0ge0VudGl0eVJlZmVyZW5jZX0gW2JvdW5kRW50aXR5XSAtIEFuIG9wdGlvbmFsIEVudGl0eVJlZmVyZW5jZSBvZiB0aGUgYm91bmQgZW50aXR5LlxyXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59IC0gQSBQcm9taXNlIHdpdGggdGhlIHJlcXVlc3QgcmVzcG9uc2UuXHJcbiAgICogQHRocm93cyB7RXJyb3J9IC0gVGhyb3dzIGFuIGVycm9yIGlmIHRoZSByZXF1ZXN0IHBhcmFtZXRlciBpcyBub3Qgb2YgYSBzdXBwb3J0ZWQgdHlwZSBvciBoYXMgYW4gaW52YWxpZCB2YWx1ZS5cclxuICAgKi9cclxuICBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUFjdGlvbihcclxuICAgIGZ1bmN0aW9uTmFtZTogc3RyaW5nLFxyXG4gICAgcmVxdWVzdFBhcmFtZXRlcnM6IFJlcXVlc3RQYXJhbWV0ZXJbXSB8IG9iamVjdCxcclxuICAgIGJvdW5kRW50aXR5PzogRW50aXR5UmVmZXJlbmNlXHJcbiAgKTogUHJvbWlzZTxhbnk+IHtcclxuICAgIHJldHVybiBhd2FpdCBleGVjdXRlKGZ1bmN0aW9uTmFtZSwgcmVxdWVzdFBhcmFtZXRlcnMsIGJvdW5kRW50aXR5LCAwKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEV4ZWN1dGVzIGEgRnVuY3Rpb24uXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZ1bmN0aW9uTmFtZSAtIFRoZSB1bmlxdWUgbmFtZSBvZiB0aGUgZnVuY3Rpb24uXHJcbiAgICogQHBhcmFtIHtSZXF1ZXN0UGFyYW1ldGVyW10gfCBvYmplY3R9IHJlcXVlc3RQYXJhbWV0ZXJzIC0gQW4gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoIHRoZSBwYXJhbWV0ZXIgbmFtZSwgdHlwZSBhbmQgdmFsdWUuXHJcbiAgICogQHBhcmFtIHtFbnRpdHlSZWZlcmVuY2V9IFtib3VuZEVudGl0eV0gLSBBbiBvcHRpb25hbCBFbnRpdHlSZWZlcmVuY2Ugb2YgdGhlIGJvdW5kIGVudGl0eS5cclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fSAtIEEgUHJvbWlzZSB3aXRoIHRoZSByZXF1ZXN0IHJlc3BvbnNlLlxyXG4gICAqIEB0aHJvd3Mge0Vycm9yfSAtIFRocm93cyBhbiBlcnJvciBpZiB0aGUgcmVxdWVzdCBwYXJhbWV0ZXIgaXMgbm90IG9mIGEgc3VwcG9ydGVkIHR5cGUgb3IgaGFzIGFuIGludmFsaWQgdmFsdWUuXHJcbiAgICovXHJcbiAgZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVGdW5jdGlvbihcclxuICAgIGZ1bmN0aW9uTmFtZTogc3RyaW5nLFxyXG4gICAgcmVxdWVzdFBhcmFtZXRlcnM6IFJlcXVlc3RQYXJhbWV0ZXJbXSB8IG9iamVjdCxcclxuICAgIGJvdW5kRW50aXR5PzogRW50aXR5UmVmZXJlbmNlXHJcbiAgKTogUHJvbWlzZTxhbnk+IHtcclxuICAgIHJldHVybiBhd2FpdCBleGVjdXRlKGZ1bmN0aW9uTmFtZSwgcmVxdWVzdFBhcmFtZXRlcnMsIGJvdW5kRW50aXR5LCAxKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEV4ZWN1dGVzIGEgQ1JVRCByZXF1ZXN0LlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlTmFtZSAtIFRoZSB1bmlxdWUgbmFtZSBvZiB0aGUgcmVxdWVzdC5cclxuICAgKiBAcGFyYW0ge1JlcXVlc3RQYXJhbWV0ZXJbXSB8IG9iamVjdH0gcmVxdWVzdFBhcmFtZXRlcnMgLSBBbiBhcnJheSBvZiBvYmplY3RzIHdpdGggdGhlIHBhcmFtZXRlciBuYW1lLCB0eXBlLCBhbmQgdmFsdWUuXHJcbiAgICogQHBhcmFtIHtFbnRpdHlSZWZlcmVuY2V9IFtib3VuZEVudGl0eV0gLSBBbiBvcHRpb25hbCBFbnRpdHlSZWZlcmVuY2Ugb2YgdGhlIGJvdW5kIGVudGl0eS5cclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fSAtIEEgUHJvbWlzZSB3aXRoIHRoZSByZXF1ZXN0IHJlc3BvbnNlLlxyXG4gICAqIEB0aHJvd3Mge0Vycm9yfSAtIFRocm93cyBhbiBlcnJvciBpZiB0aGUgcmVxdWVzdCBwYXJhbWV0ZXIgaXMgbm90IG9mIGEgc3VwcG9ydGVkIHR5cGUgb3IgaGFzIGFuIGludmFsaWQgdmFsdWUuXHJcbiAgICovXHJcbiAgZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVDUlVEKFxyXG4gICAgZnVuY3Rpb25OYW1lOiBzdHJpbmcsXHJcbiAgICByZXF1ZXN0UGFyYW1ldGVyczogUmVxdWVzdFBhcmFtZXRlcltdIHwgb2JqZWN0LFxyXG4gICAgYm91bmRFbnRpdHk/OiBFbnRpdHlSZWZlcmVuY2VcclxuICApOiBQcm9taXNlPGFueT4ge1xyXG4gICAgcmV0dXJuIGF3YWl0IGV4ZWN1dGUoZnVuY3Rpb25OYW1lLCByZXF1ZXN0UGFyYW1ldGVycywgYm91bmRFbnRpdHksIDIpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFrZXMgYSBHVUlEIGxvd2VyY2FzZSBhbmQgcmVtb3ZlcyBicmFja2V0cy5cclxuICAgKiBAcGFyYW0ge3N0cmluZ30gZ3VpZCAtIFRoZSBHVUlEIHRvIG5vcm1hbGl6ZS5cclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIFRoZSBub3JtYWxpemVkIEdVSUQuXHJcbiAgICovXHJcbiAgZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZUd1aWQoZ3VpZDogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGlmICh0eXBlb2YgZ3VpZCAhPT0gXCJzdHJpbmdcIilcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC5ub3JtYWxpemVHdWlkOlxcbicke2d1aWR9JyBpcyBub3QgYSBzdHJpbmdgKTtcclxuICAgIHJldHVybiBndWlkLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW3t9XS9nLCBcIlwiKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdyYXBzIGEgZnVuY3Rpb24gdGhhdCB0YWtlcyBhIGNhbGxiYWNrIGFzIGl0cyBsYXN0IHBhcmFtZXRlciBhbmQgcmV0dXJucyBhIFByb21pc2UuXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gdGhlIGZ1bmN0aW9uIHRvIHdyYXBcclxuICAgKiBAcGFyYW0gY29udGV4dCB0aGUgcGFyZW50IHByb3BlcnR5IG9mIHRoZSBmdW5jdGlvbiBmLmUuIGZvcm1Db250ZXh0LmRhdGEucHJvY2VzcyBmb3IgZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLmdldEVuYWJsZWRQcm9jZXNzZXNcclxuICAgKiBAcGFyYW0gYXJncyB0aGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIGZ1bmN0aW9uXHJcbiAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn0gYSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgY2FsbGJhY2sgcmVzcG9uc2VcclxuICAgKi9cclxuICBleHBvcnQgZnVuY3Rpb24gYXNQcm9taXNlPFQ+KGZuOiBGdW5jdGlvbiwgY29udGV4dCwgLi4uYXJncyk6IFByb21pc2U8VD4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPFQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgY29uc3QgY2FsbGJhY2sgPSAocmVzcG9uc2U6IFQpID0+IHtcclxuICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcclxuICAgICAgfTtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICAvLyBDYWxsIHRoZSBmdW5jdGlvbiB3aXRoIHRoZSBhcmd1bWVudHMgYW5kIHRoZSBjYWxsYmFjayBhdCB0aGUgZW5kXHJcbiAgICAgICAgZm4uY2FsbChjb250ZXh0LCAuLi5hcmdzLCBjYWxsYmFjayk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgcmVqZWN0KGVycm9yKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIE9wZW5zIGEgZGlhbG9nIHdpdGggZHluYW1pYyBoZWlnaHQgYW5kIHdpZHRoIGJhc2VkIG9uIHRleHQgY29udGVudC5cclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGl0bGUgLSBUaGUgdGl0bGUgb2YgdGhlIGRpYWxvZy5cclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIFRoZSB0ZXh0IGNvbnRlbnQgb2YgdGhlIGRpYWxvZy5cclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fSAtIEEgUHJvbWlzZSB3aXRoIHRoZSBkaWFsb2cgcmVzcG9uc2UuXHJcbiAgICovXHJcbiAgZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9wZW5BbGVydERpYWxvZyhcclxuICAgIHRpdGxlOiBzdHJpbmcsXHJcbiAgICB0ZXh0OiBzdHJpbmdcclxuICApOiBQcm9taXNlPGFueT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3Qgcm93cyA9IHRleHQuc3BsaXQoL1xcclxcbnxcXHJ8XFxuLyk7XHJcbiAgICAgIGxldCBhZGRpdGlvbmFsUm93cyA9IDA7XHJcbiAgICAgIHJvd3MuZm9yRWFjaCgocm93KSA9PiB7XHJcbiAgICAgICAgbGV0IHdpZHRoID0gZ2V0VGV4dFdpZHRoKFxyXG4gICAgICAgICAgcm93LFxyXG4gICAgICAgICAgXCIxcmVtIFNlZ29lIFVJIFJlZ3VsYXIsIFNlZ29lVUksIFNlZ29lIFVJXCJcclxuICAgICAgICApO1xyXG4gICAgICAgIGlmICh3aWR0aCA+IDk0MCkge1xyXG4gICAgICAgICAgYWRkaXRpb25hbFJvd3MgKz0gd2lkdGggLyA5NDA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgY29uc3QgbG9uZ2VzdFJvdyA9IHJvd3MucmVkdWNlKFxyXG4gICAgICAgIChhY2MsIHJvdykgPT4gKHJvdy5sZW5ndGggPiBhY2MubGVuZ3RoID8gcm93IDogYWNjKSxcclxuICAgICAgICBcIlwiXHJcbiAgICAgICk7XHJcbiAgICAgIGNvbnN0IHdpZHRoID0gTWF0aC5taW4oXHJcbiAgICAgICAgZ2V0VGV4dFdpZHRoKGxvbmdlc3RSb3csIFwiMXJlbSBTZWdvZSBVSSBSZWd1bGFyLCBTZWdvZVVJLCBTZWdvZSBVSVwiKSxcclxuICAgICAgICAxMDAwXHJcbiAgICAgICk7XHJcbiAgICAgIGNvbnN0IGhlaWdodCA9IDEwOSArIChyb3dzLmxlbmd0aCArIGFkZGl0aW9uYWxSb3dzKSAqIDIwO1xyXG4gICAgICByZXR1cm4gYXdhaXQgWHJtLk5hdmlnYXRpb24ub3BlbkFsZXJ0RGlhbG9nKFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGNvbmZpcm1CdXR0b25MYWJlbDogXCJPa1wiLFxyXG4gICAgICAgICAgdGV4dCxcclxuICAgICAgICAgIHRpdGxlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgaGVpZ2h0LFxyXG4gICAgICAgICAgd2lkdGgsXHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7Z2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVXNlcyBjYW52YXMubWVhc3VyZVRleHQgdG8gY29tcHV0ZSBhbmQgcmV0dXJuIHRoZSB3aWR0aCBvZiB0aGUgZ2l2ZW4gdGV4dCBvZiBnaXZlbiBmb250IGluIHBpeGVscy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdGV4dCBUaGUgdGV4dCB0byBiZSByZW5kZXJlZC5cclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBmb250IFRoZSBjc3MgZm9udCBkZXNjcmlwdG9yIHRoYXQgdGV4dCBpcyB0byBiZSByZW5kZXJlZCB3aXRoIChlLmcuIFwiYm9sZCAxNHB4IHZlcmRhbmFcIikuXHJcbiAgICAgKlxyXG4gICAgICogQHNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMTgyNDEvY2FsY3VsYXRlLXRleHQtd2lkdGgtd2l0aC1qYXZhc2NyaXB0LzIxMDE1MzkzIzIxMDE1MzkzXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGdldFRleHRXaWR0aCh0ZXh0OiBzdHJpbmcsIGZvbnQ6IHN0cmluZykge1xyXG4gICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG4gICAgICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuICAgICAgY29udGV4dC5mb250ID0gZm9udDtcclxuICAgICAgY29uc3QgbWV0cmljcyA9IGNvbnRleHQubWVhc3VyZVRleHQodGV4dCk7XHJcbiAgICAgIHJldHVybiBtZXRyaWNzLndpZHRoO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogT3BlbnMgYW4gZXJyb3IgZGlhbG9nIHdpdGggdGhlIHNwZWNpZmllZCBlcnJvciBpbmZvcm1hdGlvbi5cclxuICAgKiBAcGFyYW0gZXJyb3IgVGhlIGVycm9yIG9iamVjdCBjb250YWluaW5nIGRldGFpbHMgYWJvdXQgdGhlIGVycm9yLlxyXG4gICAqL1xyXG4gIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcGVuRXJyb3JEaWFsb2coZXJyb3I6IGFueSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgcmV0dXJuIGF3YWl0IFhybS5OYXZpZ2F0aW9uLm9wZW5FcnJvckRpYWxvZyh7XHJcbiAgICAgICAgbWVzc2FnZTogZ2V0RXJyb3JNZXNzYWdlKGVycm9yKSxcclxuICAgICAgICBkZXRhaWxzOiBKU09OLnN0cmluZ2lmeShlcnJvciwgbnVsbCwgNCksXHJcbiAgICAgICAgZXJyb3JDb2RlOiBlcnJvcj8uZXJyb3JDb2RlXHJcbiAgICAgIH0pO1xyXG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7Z2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGV4cG9ydCBjbGFzcyBQcm9jZXNzIHtcclxuICAgIHN0YXRpYyBnZXQgZGF0YSgpIHtcclxuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldCB1aSgpIHtcclxuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQudWkucHJvY2VzcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVXNlIHRoaXMgdG8gYWRkIGEgZnVuY3Rpb24gYXMgYW4gZXZlbnQgaGFuZGxlciBmb3IgdGhlIE9uUHJlUHJvY2Vzc1N0YXR1c0NoYW5nZSBldmVudCBzbyB0aGF0IGl0IHdpbGwgYmUgY2FsbGVkIGJlZm9yZSB0aGVcclxuICAgICAqIGJ1c2luZXNzIHByb2Nlc3MgZmxvdyBzdGF0dXMgY2hhbmdlcy5cclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGFkZGVkIHRvIHRoZSBib3R0b20gb2YgdGhlIGV2ZW50XHJcbiAgICAgKiAgICAgICAgICAgICAgICBoYW5kbGVyIHBpcGVsaW5lLiBUaGUgZXhlY3V0aW9uIGNvbnRleHQgaXMgYXV0b21hdGljYWxseVxyXG4gICAgICogICAgICAgICAgICAgICAgc2V0IHRvIGJlIHRoZSBmaXJzdCBwYXJhbWV0ZXIgcGFzc2VkIHRvIHRoZSBldmVudCBoYW5kbGVyLlxyXG4gICAgICogICAgICAgICAgICAgICAgVXNlIGEgcmVmZXJlbmNlIHRvIGEgbmFtZWQgZnVuY3Rpb24gcmF0aGVyIHRoYW4gYW5cclxuICAgICAqICAgICAgICAgICAgICAgIGFub255bW91cyBmdW5jdGlvbiBpZiB5b3UgbWF5IGxhdGVyIHdhbnQgdG8gcmVtb3ZlIHRoZVxyXG4gICAgICogICAgICAgICAgICAgICAgZXZlbnQgaGFuZGxlci5cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFkZE9uUHJlUHJvY2Vzc1N0YXR1c0NoYW5nZShcclxuICAgICAgaGFuZGxlcjogWHJtLkV2ZW50cy5Qcm9jZXNzU3RhdHVzQ2hhbmdlSGFuZGxlclxyXG4gICAgKSB7XHJcbiAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLnJlbW92ZU9uUHJlUHJvY2Vzc1N0YXR1c0NoYW5nZShoYW5kbGVyKTtcclxuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLmFkZE9uUHJlUHJvY2Vzc1N0YXR1c0NoYW5nZShoYW5kbGVyKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVXNlIHRoaXMgdG8gYWRkIGEgZnVuY3Rpb24gYXMgYW4gZXZlbnQgaGFuZGxlciBmb3IgdGhlIE9uUHJlU3RhZ2VDaGFuZ2UgZXZlbnQgc28gdGhhdCBpdCB3aWxsIGJlIGNhbGxlZCBiZWZvcmUgdGhlXHJcbiAgICAgKiBidXNpbmVzcyBwcm9jZXNzIGZsb3cgc3RhZ2UgY2hhbmdlcy5cclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGFkZGVkIHRvIHRoZSBib3R0b20gb2YgdGhlIGV2ZW50XHJcbiAgICAgKiAgICAgICAgICAgICAgICBoYW5kbGVyIHBpcGVsaW5lLiBUaGUgZXhlY3V0aW9uIGNvbnRleHQgaXMgYXV0b21hdGljYWxseVxyXG4gICAgICogICAgICAgICAgICAgICAgc2V0IHRvIGJlIHRoZSBmaXJzdCBwYXJhbWV0ZXIgcGFzc2VkIHRvIHRoZSBldmVudCBoYW5kbGVyLlxyXG4gICAgICogICAgICAgICAgICAgICAgVXNlIGEgcmVmZXJlbmNlIHRvIGEgbmFtZWQgZnVuY3Rpb24gcmF0aGVyIHRoYW4gYW5cclxuICAgICAqICAgICAgICAgICAgICAgIGFub255bW91cyBmdW5jdGlvbiBpZiB5b3UgbWF5IGxhdGVyIHdhbnQgdG8gcmVtb3ZlIHRoZVxyXG4gICAgICogICAgICAgICAgICAgICAgZXZlbnQgaGFuZGxlci5cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFkZE9uUHJlU3RhZ2VDaGFuZ2UoaGFuZGxlcjogWHJtLkV2ZW50cy5TdGFnZUNoYW5nZUV2ZW50SGFuZGxlcikge1xyXG4gICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5yZW1vdmVPblByZVN0YWdlQ2hhbmdlKGhhbmRsZXIpO1xyXG4gICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MuYWRkT25QcmVTdGFnZUNoYW5nZShoYW5kbGVyKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVXNlIHRoaXMgdG8gYWRkIGEgZnVuY3Rpb24gYXMgYW4gZXZlbnQgaGFuZGxlciBmb3IgdGhlIE9uUHJlUHJvY2Vzc1N0YXR1c0NoYW5nZSBldmVudCBzbyB0aGF0IGl0IHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhlXHJcbiAgICAgKiBidXNpbmVzcyBwcm9jZXNzIGZsb3cgc3RhdHVzIGNoYW5nZXMuXHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlciBUaGUgZnVuY3Rpb24gd2lsbCBiZSBhZGRlZCB0byB0aGUgYm90dG9tIG9mIHRoZSBldmVudFxyXG4gICAgICogICAgICAgICAgICAgICAgaGFuZGxlciBwaXBlbGluZS4gVGhlIGV4ZWN1dGlvbiBjb250ZXh0IGlzIGF1dG9tYXRpY2FsbHlcclxuICAgICAqICAgICAgICAgICAgICAgIHNldCB0byBiZSB0aGUgZmlyc3QgcGFyYW1ldGVyIHBhc3NlZCB0byB0aGUgZXZlbnQgaGFuZGxlci5cclxuICAgICAqICAgICAgICAgICAgICAgIFVzZSBhIHJlZmVyZW5jZSB0byBhIG5hbWVkIGZ1bmN0aW9uIHJhdGhlciB0aGFuIGFuXHJcbiAgICAgKiAgICAgICAgICAgICAgICBhbm9ueW1vdXMgZnVuY3Rpb24gaWYgeW91IG1heSBsYXRlciB3YW50IHRvIHJlbW92ZSB0aGVcclxuICAgICAqICAgICAgICAgICAgICAgIGV2ZW50IGhhbmRsZXIuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBhZGRPblByb2Nlc3NTdGF0dXNDaGFuZ2UoXHJcbiAgICAgIGhhbmRsZXI6IFhybS5FdmVudHMuUHJvY2Vzc1N0YXR1c0NoYW5nZUhhbmRsZXJcclxuICAgICkge1xyXG4gICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5yZW1vdmVPblByb2Nlc3NTdGF0dXNDaGFuZ2UoaGFuZGxlcik7XHJcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5hZGRPblByb2Nlc3NTdGF0dXNDaGFuZ2UoaGFuZGxlcik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFVzZSB0aGlzIHRvIGFkZCBhIGZ1bmN0aW9uIGFzIGFuIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBPblN0YWdlQ2hhbmdlIGV2ZW50IHNvIHRoYXQgaXQgd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGVcclxuICAgICAqIGJ1c2luZXNzIHByb2Nlc3MgZmxvdyBzdGFnZSBjaGFuZ2VzLlxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIgVGhlIGZ1bmN0aW9uIHdpbGwgYmUgYWRkZWQgdG8gdGhlIGJvdHRvbSBvZiB0aGUgZXZlbnRcclxuICAgICAqICAgICAgICAgICAgICAgIGhhbmRsZXIgcGlwZWxpbmUuIFRoZSBleGVjdXRpb24gY29udGV4dCBpcyBhdXRvbWF0aWNhbGx5XHJcbiAgICAgKiAgICAgICAgICAgICAgICBzZXQgdG8gYmUgdGhlIGZpcnN0IHBhcmFtZXRlciBwYXNzZWQgdG8gdGhlIGV2ZW50IGhhbmRsZXIuXHJcbiAgICAgKiAgICAgICAgICAgICAgICBVc2UgYSByZWZlcmVuY2UgdG8gYSBuYW1lZCBmdW5jdGlvbiByYXRoZXIgdGhhbiBhblxyXG4gICAgICogICAgICAgICAgICAgICAgYW5vbnltb3VzIGZ1bmN0aW9uIGlmIHlvdSBtYXkgbGF0ZXIgd2FudCB0byByZW1vdmUgdGhlXHJcbiAgICAgKiAgICAgICAgICAgICAgICBldmVudCBoYW5kbGVyLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYWRkT25TdGFnZUNoYW5nZShoYW5kbGVyOiBYcm0uRXZlbnRzLlN0YWdlQ2hhbmdlRXZlbnRIYW5kbGVyKSB7XHJcbiAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLnJlbW92ZU9uU3RhZ2VDaGFuZ2UoaGFuZGxlcik7XHJcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5hZGRPblN0YWdlQ2hhbmdlKGhhbmRsZXIpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2UgdGhpcyB0byBhZGQgYSBmdW5jdGlvbiBhcyBhbiBldmVudCBoYW5kbGVyIGZvciB0aGUgT25TdGFnZVNlbGVjdGVkIGV2ZW50IHNvIHRoYXQgaXQgd2lsbCBiZSBjYWxsZWRcclxuICAgICAqIHdoZW4gYSBidXNpbmVzcyBwcm9jZXNzIGZsb3cgc3RhZ2UgaXMgc2VsZWN0ZWQuXHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlciBUaGUgZnVuY3Rpb24gd2lsbCBiZSBhZGRlZCB0byB0aGUgYm90dG9tIG9mIHRoZSBldmVudFxyXG4gICAgICogICAgICAgICAgICAgICAgaGFuZGxlciBwaXBlbGluZS4gVGhlIGV4ZWN1dGlvbiBjb250ZXh0IGlzIGF1dG9tYXRpY2FsbHlcclxuICAgICAqICAgICAgICAgICAgICAgIHNldCB0byBiZSB0aGUgZmlyc3QgcGFyYW1ldGVyIHBhc3NlZCB0byB0aGUgZXZlbnQgaGFuZGxlci5cclxuICAgICAqICAgICAgICAgICAgICAgIFVzZSBhIHJlZmVyZW5jZSB0byBhIG5hbWVkIGZ1bmN0aW9uIHJhdGhlciB0aGFuIGFuXHJcbiAgICAgKiAgICAgICAgICAgICAgICBhbm9ueW1vdXMgZnVuY3Rpb24gaWYgeW91IG1heSBsYXRlciB3YW50IHRvIHJlbW92ZSB0aGVcclxuICAgICAqICAgICAgICAgICAgICAgIGV2ZW50IGhhbmRsZXIuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBhZGRPblN0YWdlU2VsZWN0ZWQoaGFuZGxlcjogWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlcikge1xyXG4gICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5yZW1vdmVPblN0YWdlU2VsZWN0ZWQoaGFuZGxlcik7XHJcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5hZGRPblN0YWdlU2VsZWN0ZWQoaGFuZGxlcik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFVzZSB0aGlzIHRvIHJlbW92ZSBhIGZ1bmN0aW9uIGFzIGFuIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBPblByZVByb2Nlc3NTdGF0dXNDaGFuZ2UgZXZlbnQuXHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlciBJZiBhbiBhbm9ueW1vdXMgZnVuY3Rpb24gaXMgc2V0IHVzaW5nIHRoZSBhZGRPblByZVByb2Nlc3NTdGF0dXNDaGFuZ2UgbWV0aG9kIGl0XHJcbiAgICAgKiAgICAgICAgICAgICAgICBjYW5ub3QgYmUgcmVtb3ZlZCB1c2luZyB0aGlzIG1ldGhvZC5cclxuICAgICAqL1xyXG4gICAgc3RhdGljIHJlbW92ZU9uUHJlUHJvY2Vzc1N0YXR1c0NoYW5nZShcclxuICAgICAgaGFuZGxlcjogWHJtLkV2ZW50cy5Qcm9jZXNzU3RhdHVzQ2hhbmdlSGFuZGxlclxyXG4gICAgKSB7XHJcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5yZW1vdmVPblByZVByb2Nlc3NTdGF0dXNDaGFuZ2UoXHJcbiAgICAgICAgaGFuZGxlclxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2UgdGhpcyB0byByZW1vdmUgYSBmdW5jdGlvbiBhcyBhbiBldmVudCBoYW5kbGVyIGZvciB0aGUgT25QcmVTdGFnZUNoYW5nZSBldmVudC5cclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIElmIGFuIGFub255bW91cyBmdW5jdGlvbiBpcyBzZXQgdXNpbmcgdGhlIGFkZE9uUHJlU3RhZ2VDaGFuZ2UgbWV0aG9kIGl0XHJcbiAgICAgKiAgICAgICAgICAgICAgICBjYW5ub3QgYmUgcmVtb3ZlZCB1c2luZyB0aGlzIG1ldGhvZC5cclxuICAgICAqL1xyXG4gICAgc3RhdGljIHJlbW92ZU9uUHJlU3RhZ2VDaGFuZ2UoaGFuZGxlcjogWHJtLkV2ZW50cy5TdGFnZUNoYW5nZUV2ZW50SGFuZGxlcikge1xyXG4gICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MucmVtb3ZlT25QcmVTdGFnZUNoYW5nZShoYW5kbGVyKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVXNlIHRoaXMgdG8gcmVtb3ZlIGEgZnVuY3Rpb24gYXMgYW4gZXZlbnQgaGFuZGxlciBmb3IgdGhlIE9uUHJvY2Vzc1N0YXR1c0NoYW5nZSBldmVudC5cclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIElmIGFuIGFub255bW91cyBmdW5jdGlvbiBpcyBzZXQgdXNpbmcgdGhlIGFkZE9uUHJvY2Vzc1N0YXR1c0NoYW5nZSBtZXRob2QgaXRcclxuICAgICAqICAgICAgICAgICAgICAgIGNhbm5vdCBiZSByZW1vdmVkIHVzaW5nIHRoaXMgbWV0aG9kLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgcmVtb3ZlT25Qcm9jZXNzU3RhdHVzQ2hhbmdlKFxyXG4gICAgICBoYW5kbGVyOiBYcm0uRXZlbnRzLlByb2Nlc3NTdGF0dXNDaGFuZ2VIYW5kbGVyXHJcbiAgICApIHtcclxuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLnJlbW92ZU9uUHJvY2Vzc1N0YXR1c0NoYW5nZShoYW5kbGVyKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVXNlIHRoaXMgdG8gcmVtb3ZlIGEgZnVuY3Rpb24gYXMgYW4gZXZlbnQgaGFuZGxlciBmb3IgdGhlIE9uU3RhZ2VDaGFuZ2UgZXZlbnQuXHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlciBJZiBhbiBhbm9ueW1vdXMgZnVuY3Rpb24gaXMgc2V0IHVzaW5nIHRoZSBhZGRPblN0YWdlQ2hhbmdlIG1ldGhvZCBpdFxyXG4gICAgICogICAgICAgICAgICAgICAgY2Fubm90IGJlIHJlbW92ZWQgdXNpbmcgdGhpcyBtZXRob2QuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyByZW1vdmVPblN0YWdlQ2hhbmdlKGhhbmRsZXI6IFhybS5FdmVudHMuU3RhZ2VDaGFuZ2VFdmVudEhhbmRsZXIpIHtcclxuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLnJlbW92ZU9uU3RhZ2VDaGFuZ2UoaGFuZGxlcik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFVzZSB0aGlzIHRvIHJlbW92ZSBhIGZ1bmN0aW9uIGFzIGFuIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBPblN0YWdlQ2hhbmdlIGV2ZW50LlxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIgSWYgYW4gYW5vbnltb3VzIGZ1bmN0aW9uIGlzIHNldCB1c2luZyB0aGUgYWRkT25TdGFnZUNoYW5nZSBtZXRob2QgaXRcclxuICAgICAqICAgICAgICAgICAgICAgIGNhbm5vdCBiZSByZW1vdmVkIHVzaW5nIHRoaXMgbWV0aG9kLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgcmVtb3ZlT25TdGFnZVNlbGVjdGVkKGhhbmRsZXI6IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXIpIHtcclxuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLnJlbW92ZU9uU3RhZ2VTZWxlY3RlZChoYW5kbGVyKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVzZSB0aGlzIG1ldGhvZCB0byBhc3luY2hyb25vdXNseSByZXRyaWV2ZSB0aGUgZW5hYmxlZCBidXNpbmVzcyBwcm9jZXNzIGZsb3dzIHRoYXQgdGhlIHVzZXIgY2FuIHN3aXRjaCB0byBmb3IgYW4gZW50aXR5LlxyXG4gICAgICogQHJldHVybnMgcmV0dXJucyBjYWxsYmFjayByZXNwb25zZSBhcyBQcm9taXNlXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXRFbmFibGVkUHJvY2Vzc2VzKCkge1xyXG4gICAgICByZXR1cm4gYXNQcm9taXNlPFhybS5Qcm9jZXNzRmxvdy5Qcm9jZXNzRGljdGlvbmFyeT4oXHJcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MuZ2V0RW5hYmxlZFByb2Nlc3NlcyxcclxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzc1xyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGFsbCBwcm9jZXNzIGluc3RhbmNlcyBmb3IgdGhlIGVudGl0eSByZWNvcmQgdGhhdCB0aGUgY2FsbGluZyB1c2VyIGhhcyBhY2Nlc3MgdG8uXHJcbiAgICAgKiBAcmV0dXJucyByZXR1cm5zIGNhbGxiYWNrIHJlc3BvbnNlIGFzIFByb21pc2VcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldFByb2Nlc3NJbnN0YW5jZXMoKSB7XHJcbiAgICAgIHJldHVybiBhc1Byb21pc2U8WHJtLlByb2Nlc3NGbG93LkdldFByb2Nlc3NJbnN0YW5jZXNEZWxlZ2F0ZT4oXHJcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MuZ2V0UHJvY2Vzc0luc3RhbmNlcyxcclxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzc1xyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBQcm9ncmVzc2VzIHRvIHRoZSBuZXh0IHN0YWdlLlxyXG4gICAgICogQHJldHVybnMgcmV0dXJucyBjYWxsYmFjayByZXNwb25zZSBhcyBQcm9taXNlXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBtb3ZlTmV4dCgpIHtcclxuICAgICAgcmV0dXJuIGFzUHJvbWlzZTxYcm0uUHJvY2Vzc0Zsb3cuUHJvY2Vzc0NhbGxiYWNrRGVsZWdhdGU+KFxyXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLm1vdmVOZXh0LFxyXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIE1vdmVzIHRvIHRoZSBwcmV2aW91cyBzdGFnZS5cclxuICAgICAqIEByZXR1cm5zIHJldHVybnMgY2FsbGJhY2sgcmVzcG9uc2UgYXMgUHJvbWlzZVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgbW92ZVByZXZpb3VzKCkge1xyXG4gICAgICByZXR1cm4gYXNQcm9taXNlPFhybS5Qcm9jZXNzRmxvdy5Qcm9jZXNzQ2FsbGJhY2tEZWxlZ2F0ZT4oXHJcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MubW92ZVByZXZpb3VzLFxyXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFNldCBhIFByb2Nlc3MgYXMgdGhlIGFjdGl2ZSBwcm9jZXNzLlxyXG4gICAgICogQHBhcmFtIHByb2Nlc3NJZCBUaGUgSWQgb2YgdGhlIHByb2Nlc3MgdG8gbWFrZSB0aGUgYWN0aXZlIHByb2Nlc3MuXHJcbiAgICAgKiBAcmV0dXJucyByZXR1cm5zIGNhbGxiYWNrIHJlc3BvbnNlIGFzIFByb21pc2VcclxuICAgICAqL1xyXG4gICAgc3RhdGljIHNldEFjdGl2ZVByb2Nlc3MocHJvY2Vzc0lkOiBzdHJpbmcpIHtcclxuICAgICAgcmV0dXJuIGFzUHJvbWlzZTxYcm0uUHJvY2Vzc0Zsb3cuUHJvY2Vzc0NhbGxiYWNrRGVsZWdhdGU+KFxyXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLnNldEFjdGl2ZVByb2Nlc3MsXHJcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MsXHJcbiAgICAgICAgcHJvY2Vzc0lkXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFNldHMgYSBwcm9jZXNzIGluc3RhbmNlIGFzIHRoZSBhY3RpdmUgaW5zdGFuY2VcclxuICAgICAqIEBwYXJhbSBwcm9jZXNzSW5zdGFuY2VJZCBUaGUgSWQgb2YgdGhlIHByb2Nlc3MgaW5zdGFuY2UgdG8gbWFrZSB0aGUgYWN0aXZlIGluc3RhbmNlLlxyXG4gICAgICogQHJldHVybnMgcmV0dXJucyBjYWxsYmFjayByZXNwb25zZSBhcyBQcm9taXNlXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBzZXRBY3RpdmVQcm9jZXNzSW5zdGFuY2UocHJvY2Vzc0luc3RhbmNlSWQ6IHN0cmluZykge1xyXG4gICAgICByZXR1cm4gYXNQcm9taXNlPFhybS5Qcm9jZXNzRmxvdy5TZXRQcm9jZXNzSW5zdGFuY2VEZWxlZ2F0ZT4oXHJcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3Muc2V0QWN0aXZlUHJvY2Vzc0luc3RhbmNlLFxyXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLFxyXG4gICAgICAgIHByb2Nlc3NJbnN0YW5jZUlkXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFNldCBhIHN0YWdlIGFzIHRoZSBhY3RpdmUgc3RhZ2UuXHJcbiAgICAgKiBAcGFyYW0gc3RhZ2VJZCB0aGUgSWQgb2YgdGhlIHN0YWdlIHRvIG1ha2UgdGhlIGFjdGl2ZSBzdGFnZS5cclxuICAgICAqIEByZXR1cm5zIHJldHVybnMgY2FsbGJhY2sgcmVzcG9uc2UgYXMgUHJvbWlzZVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgc2V0QWN0aXZlU3RhZ2Uoc3RhZ2VJZDogc3RyaW5nKSB7XHJcbiAgICAgIHJldHVybiBhc1Byb21pc2U8WHJtLlByb2Nlc3NGbG93LlNldFByb2Nlc3NJbnN0YW5jZURlbGVnYXRlPihcclxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5zZXRBY3RpdmVTdGFnZSxcclxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2VzcyxcclxuICAgICAgICBzdGFnZUlkXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFVzZSB0aGlzIG1ldGhvZCB0byBzZXQgdGhlIGN1cnJlbnQgc3RhdHVzIG9mIHRoZSBwcm9jZXNzIGluc3RhbmNlXHJcbiAgICAgKiBAcGFyYW0gc3RhdHVzIFRoZSBuZXcgc3RhdHVzIGZvciB0aGUgcHJvY2Vzc1xyXG4gICAgICogQHJldHVybnMgcmV0dXJucyBjYWxsYmFjayByZXNwb25zZSBhcyBQcm9taXNlXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBzZXRTdGF0dXMoc3RhdHVzOiBYcm0uUHJvY2Vzc0Zsb3cuUHJvY2Vzc1N0YXR1cykge1xyXG4gICAgICByZXR1cm4gYXNQcm9taXNlPFhybS5Qcm9jZXNzRmxvdy5TZXRQcm9jZXNzSW5zdGFuY2VEZWxlZ2F0ZT4oXHJcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3Muc2V0U3RhdHVzLFxyXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLFxyXG4gICAgICAgIHN0YXR1c1xyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZXhwb3J0IGNsYXNzIEZpZWxkcyB7XHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYSBoYW5kbGVyIG9yIGFuIGFycmF5IG9mIGhhbmRsZXJzIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBhdHRyaWJ1dGUncyB2YWx1ZSBpcyBjaGFuZ2VkLlxyXG4gICAgICogQHBhcmFtIGZpZWxkcyBBbiBhcnJheSBvZiBmaWVsZHMgdG8gb24gd2hpY2ggdGhpcyBtZXRob2Qgc2hvdWxkIGJlIGFwcGxpZWQuXHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlcnMgVGhlIGZ1bmN0aW9uIHJlZmVyZW5jZSBvciBhbiBhcnJheSBvZiBmdW5jdGlvbiByZWZlcmVuY2VzLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYWRkT25DaGFuZ2UoXHJcbiAgICAgIGZpZWxkczogQ2xhc3MuRmllbGRbXSxcclxuICAgICAgaGFuZGxlcjogWHJtLkV2ZW50cy5BdHRyaWJ1dGUuQ2hhbmdlRXZlbnRIYW5kbGVyXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XHJcbiAgICAgICAgZmllbGQuYWRkT25DaGFuZ2UoaGFuZGxlcik7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBGaXJlIGFsbCBcIm9uIGNoYW5nZVwiIGV2ZW50IGhhbmRsZXJzLlxyXG4gICAgICogQHBhcmFtIGZpZWxkcyBBbiBhcnJheSBvZiBmaWVsZHMgdG8gb24gd2hpY2ggdGhpcyBtZXRob2Qgc2hvdWxkIGJlIGFwcGxpZWQuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBmaXJlT25DaGFuZ2UoZmllbGRzOiBDbGFzcy5GaWVsZFtdKTogdm9pZCB7XHJcbiAgICAgIGZpZWxkcy5mb3JFYWNoKChmaWVsZCkgPT4ge1xyXG4gICAgICAgIGZpZWxkLmZpcmVPbkNoYW5nZSgpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyB0aGUgaGFuZGxlciBmcm9tIHRoZSBcIm9uIGNoYW5nZVwiIGV2ZW50LlxyXG4gICAgICogQHBhcmFtIGZpZWxkcyBBbiBhcnJheSBvZiBmaWVsZHMgdG8gb24gd2hpY2ggdGhpcyBtZXRob2Qgc2hvdWxkIGJlIGFwcGxpZWQuXHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlciBUaGUgaGFuZGxlci5cclxuICAgICAqL1xyXG4gICAgc3RhdGljIHJlbW92ZU9uQ2hhbmdlKFxyXG4gICAgICBmaWVsZHM6IENsYXNzLkZpZWxkW10sXHJcbiAgICAgIGhhbmRsZXI6IFhybS5FdmVudHMuQXR0cmlidXRlLkNoYW5nZUV2ZW50SGFuZGxlclxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgIGZpZWxkcy5mb3JFYWNoKChmaWVsZCkgPT4ge1xyXG4gICAgICAgIGZpZWxkLnJlbW92ZU9uQ2hhbmdlKGhhbmRsZXIpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgcmVxdWlyZWQgbGV2ZWwuXHJcbiAgICAgKiBAcGFyYW0gZmllbGRzIEFuIGFycmF5IG9mIGZpZWxkcyB0byBvbiB3aGljaCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgYXBwbGllZC5cclxuICAgICAqIEBwYXJhbSByZXF1aXJlbWVudExldmVsIFRoZSByZXF1aXJlbWVudCBsZXZlbCwgYXMgZWl0aGVyIFwibm9uZVwiLCBcInJlcXVpcmVkXCIsIG9yIFwicmVjb21tZW5kZWRcIlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgc2V0UmVxdWlyZWRMZXZlbChcclxuICAgICAgZmllbGRzOiBDbGFzcy5GaWVsZFtdLFxyXG4gICAgICByZXF1aXJlbWVudExldmVsOiBYcm0uQXR0cmlidXRlcy5SZXF1aXJlbWVudExldmVsXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XHJcbiAgICAgICAgZmllbGQuc2V0UmVxdWlyZWRMZXZlbChyZXF1aXJlbWVudExldmVsKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIHN1Ym1pdCBtb2RlLlxyXG4gICAgICogQHBhcmFtIGZpZWxkcyBBbiBhcnJheSBvZiBmaWVsZHMgdG8gb24gd2hpY2ggdGhpcyBtZXRob2Qgc2hvdWxkIGJlIGFwcGxpZWQuXHJcbiAgICAgKiBAcGFyYW0gc3VibWl0TW9kZSBUaGUgc3VibWl0IG1vZGUsIGFzIGVpdGhlciBcImFsd2F5c1wiLCBcIm5ldmVyXCIsIG9yIFwiZGlydHlcIi5cclxuICAgICAqIEBkZWZhdWx0IHN1Ym1pdE1vZGUgXCJkaXJ0eVwiXHJcbiAgICAgKiBAc2VlIHtAbGluayBYcm1FbnVtLkF0dHJpYnV0ZVJlcXVpcmVtZW50TGV2ZWx9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBzZXRTdWJtaXRNb2RlKFxyXG4gICAgICBmaWVsZHM6IENsYXNzLkZpZWxkW10sXHJcbiAgICAgIHN1Ym1pdE1vZGU6IFhybS5TdWJtaXRNb2RlXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XHJcbiAgICAgICAgZmllbGQuc2V0U3VibWl0TW9kZShzdWJtaXRNb2RlKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIHZhbHVlLlxyXG4gICAgICogQHBhcmFtIGZpZWxkcyBBbiBhcnJheSBvZiBmaWVsZHMgdG8gb24gd2hpY2ggdGhpcyBtZXRob2Qgc2hvdWxkIGJlIGFwcGxpZWQuXHJcbiAgICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlLlxyXG4gICAgICogQHJlbWFya3MgQXR0cmlidXRlcyBvbiBRdWljayBDcmVhdGUgRm9ybXMgd2lsbCBub3Qgc2F2ZSB2YWx1ZXMgc2V0IHdpdGggdGhpcyBtZXRob2QuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBzZXRWYWx1ZShmaWVsZHM6IENsYXNzLkZpZWxkW10sIHZhbHVlOiBhbnkpOiB2b2lkIHtcclxuICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XHJcbiAgICAgICAgZmllbGQuc2V0VmFsdWUodmFsdWUpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyBhIHZhbHVlIGZvciBhIGNvbHVtbiB0byBkZXRlcm1pbmUgd2hldGhlciBpdCBpcyB2YWxpZCBvciBpbnZhbGlkIHdpdGggYSBtZXNzYWdlXHJcbiAgICAgKiBAcGFyYW0gZmllbGRzIEFuIGFycmF5IG9mIGZpZWxkcyB0byBvbiB3aGljaCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgYXBwbGllZC5cclxuICAgICAqIEBwYXJhbSBpc1ZhbGlkIFNwZWNpZnkgZmFsc2UgdG8gc2V0IHRoZSBjb2x1bW4gdmFsdWUgdG8gaW52YWxpZCBhbmQgdHJ1ZSB0byBzZXQgdGhlIHZhbHVlIHRvIHZhbGlkLlxyXG4gICAgICogQHBhcmFtIG1lc3NhZ2UgVGhlIG1lc3NhZ2UgdG8gZGlzcGxheS5cclxuICAgICAqIEBzZWUge0BsaW5rIGh0dHBzOi8vbGVhcm4ubWljcm9zb2Z0LmNvbS9lbi11cy9wb3dlci1hcHBzL2RldmVsb3Blci9tb2RlbC1kcml2ZW4tYXBwcy9jbGllbnRhcGkvcmVmZXJlbmNlL2F0dHJpYnV0ZXMvc2V0aXN2YWxpZCBFeHRlcm5hbCBMaW5rOiBzZXRJc1ZhbGlkIChDbGllbnQgQVBJIHJlZmVyZW5jZSl9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBzZXRJc1ZhbGlkKFxyXG4gICAgICBmaWVsZHM6IENsYXNzLkZpZWxkW10sXHJcbiAgICAgIGlzVmFsaWQ6IGJvb2xlYW4sXHJcbiAgICAgIG1lc3NhZ2U/OiBzdHJpbmdcclxuICAgICk6IHZvaWQge1xyXG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcclxuICAgICAgICBmaWVsZC5zZXRJc1ZhbGlkKGlzVmFsaWQsIG1lc3NhZ2UpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgcmVxdWlyZWQgbGV2ZWwuXHJcbiAgICAgKiBAcGFyYW0gZmllbGRzIEFuIGFycmF5IG9mIGZpZWxkcyB0byBvbiB3aGljaCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgYXBwbGllZC5cclxuICAgICAqIEBwYXJhbSByZXF1aXJlZCBUaGUgcmVxdWlyZW1lbnQgbGV2ZWwsIGFzIGVpdGhlciBmYWxzZSBmb3IgXCJub25lXCIgb3IgdHJ1ZSBmb3IgXCJyZXF1aXJlZFwiXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBzZXRSZXF1aXJlZChmaWVsZHM6IENsYXNzLkZpZWxkW10sIHJlcXVpcmVkOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgIGZpZWxkcy5mb3JFYWNoKChmaWVsZCkgPT4ge1xyXG4gICAgICAgIGZpZWxkLnNldFJlcXVpcmVkKHJlcXVpcmVkKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIHN0YXRlIG9mIHRoZSBjb250cm9sIHRvIGVpdGhlciBlbmFibGVkLCBvciBkaXNhYmxlZC5cclxuICAgICAqIEBwYXJhbSBmaWVsZHMgQW4gYXJyYXkgb2YgZmllbGRzIHRvIG9uIHdoaWNoIHRoaXMgbWV0aG9kIHNob3VsZCBiZSBhcHBsaWVkLlxyXG4gICAgICogQHBhcmFtIGRpc2FibGVkIHRydWUgdG8gZGlzYWJsZSwgZmFsc2UgdG8gZW5hYmxlLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgc2V0RGlzYWJsZWQoZmllbGRzOiBDbGFzcy5GaWVsZFtdLCBkaXNhYmxlZDogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcclxuICAgICAgICBmaWVsZC5zZXREaXNhYmxlZChkaXNhYmxlZCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSB2aXNpYmlsaXR5IHN0YXRlLlxyXG4gICAgICogQHBhcmFtIGZpZWxkcyBBbiBhcnJheSBvZiBmaWVsZHMgdG8gb24gd2hpY2ggdGhpcyBtZXRob2Qgc2hvdWxkIGJlIGFwcGxpZWQuXHJcbiAgICAgKiBAcGFyYW0gdmlzaWJsZSB0cnVlIHRvIHNob3csIGZhbHNlIHRvIGhpZGUuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBzZXRWaXNpYmxlKGZpZWxkczogQ2xhc3MuRmllbGRbXSwgdmlzaWJsZTogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcclxuICAgICAgICBmaWVsZC5zZXRWaXNpYmxlKHZpc2libGUpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyBhIGNvbnRyb2wtbG9jYWwgbm90aWZpY2F0aW9uIG1lc3NhZ2UuXHJcbiAgICAgKiBAcGFyYW0gZmllbGRzIEFuIGFycmF5IG9mIGZpZWxkcyB0byBvbiB3aGljaCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgYXBwbGllZC5cclxuICAgICAqIEBwYXJhbSBtZXNzYWdlIFRoZSBtZXNzYWdlLlxyXG4gICAgICogQHBhcmFtIHVuaXF1ZUlkIFVuaXF1ZSBpZGVudGlmaWVyLlxyXG4gICAgICogQHJldHVybnMgdHJ1ZSBpZiBpdCBzdWNjZWVkcywgZmFsc2UgaWYgaXQgZmFpbHMuXHJcbiAgICAgKiBAcmVtYXJrcyAgICAgV2hlbiB0aGlzIG1ldGhvZCBpcyB1c2VkIG9uIE1pY3Jvc29mdCBEeW5hbWljcyBDUk0gZm9yIHRhYmxldHMgYSByZWQgXCJYXCIgaWNvblxyXG4gICAgICogICAgICAgICAgICAgIGFwcGVhcnMgbmV4dCB0byB0aGUgY29udHJvbC4gVGFwcGluZyBvbiB0aGUgaWNvbiB3aWxsIGRpc3BsYXkgdGhlIG1lc3NhZ2UuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBzZXROb3RpZmljYXRpb24oXHJcbiAgICAgIGZpZWxkczogQ2xhc3MuRmllbGRbXSxcclxuICAgICAgbWVzc2FnZTogc3RyaW5nLFxyXG4gICAgICB1bmlxdWVJZDogc3RyaW5nXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XHJcbiAgICAgICAgZmllbGQuc2V0Tm90aWZpY2F0aW9uKG1lc3NhZ2UsIHVuaXF1ZUlkKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIERpc3BsYXlzIGFuIGVycm9yIG9yIHJlY29tbWVuZGF0aW9uIG5vdGlmaWNhdGlvbiBmb3IgYSBjb250cm9sLCBhbmQgbGV0cyB5b3Ugc3BlY2lmeSBhY3Rpb25zIHRvIGV4ZWN1dGUgYmFzZWQgb24gdGhlIG5vdGlmaWNhdGlvbi5cclxuICAgICAqIEBwYXJhbSBmaWVsZHMgQW4gYXJyYXkgb2YgZmllbGRzIHRvIG9uIHdoaWNoIHRoaXMgbWV0aG9kIHNob3VsZCBiZSBhcHBsaWVkLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYWRkTm90aWZpY2F0aW9uKFxyXG4gICAgICBmaWVsZHM6IENsYXNzLkZpZWxkW10sXHJcbiAgICAgIG1lc3NhZ2U6IHN0cmluZyxcclxuICAgICAgbm90aWZpY2F0aW9uTGV2ZWw6IFwiRVJST1JcIiB8IFwiUkVDT01NRU5EQVRJT05cIixcclxuICAgICAgdW5pcXVlSWQ6IHN0cmluZyxcclxuICAgICAgYWN0aW9ucz86IFhybS5Db250cm9scy5Db250cm9sTm90aWZpY2F0aW9uQWN0aW9uW11cclxuICAgICk6IHZvaWQge1xyXG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcclxuICAgICAgICBmaWVsZC5hZGROb3RpZmljYXRpb24obWVzc2FnZSwgbm90aWZpY2F0aW9uTGV2ZWwsIHVuaXF1ZUlkLCBhY3Rpb25zKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIENsZWFycyB0aGUgbm90aWZpY2F0aW9uIGlkZW50aWZpZWQgYnkgdW5pcXVlSWQuXHJcbiAgICAgKiBAcGFyYW0gZmllbGRzIEFuIGFycmF5IG9mIGZpZWxkcyB0byBvbiB3aGljaCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgYXBwbGllZC5cclxuICAgICAqIEBwYXJhbSB1bmlxdWVJZCAoT3B0aW9uYWwpIFVuaXF1ZSBpZGVudGlmaWVyLlxyXG4gICAgICogQHJldHVybnMgdHJ1ZSBpZiBpdCBzdWNjZWVkcywgZmFsc2UgaWYgaXQgZmFpbHMuXHJcbiAgICAgKiBAcmVtYXJrcyBJZiB0aGUgdW5pcXVlSWQgcGFyYW1ldGVyIGlzIG5vdCB1c2VkLCB0aGUgY3VycmVudCBub3RpZmljYXRpb24gc2hvd24gd2lsbCBiZSByZW1vdmVkLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgcmVtb3ZlTm90aWZpY2F0aW9uKGZpZWxkczogQ2xhc3MuRmllbGRbXSwgdW5pcXVlSWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcclxuICAgICAgICBmaWVsZC5yZW1vdmVOb3RpZmljYXRpb24odW5pcXVlSWQpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlcHJlc2VudHMgYSBmb3JtIGluIER5bmFtaWNzIDM2NS5cclxuICAgKi9cclxuICBleHBvcnQgY2xhc3MgRm9ybSB7XHJcbiAgICBwcm90ZWN0ZWQgc3RhdGljIF9mb3JtQ29udGV4dDogWHJtLkZvcm1Db250ZXh0O1xyXG4gICAgcHJvdGVjdGVkIHN0YXRpYyBfZXhlY3V0aW9uQ29udGV4dDogWHJtLkV2ZW50cy5FdmVudENvbnRleHQ7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHsgfVxyXG4gICAgLyoqR2V0cyBhIHJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBmb3JtIGNvbnRleHQqL1xyXG4gICAgc3RhdGljIGdldCBmb3JtQ29udGV4dCgpOiBYcm0uRm9ybUNvbnRleHQge1xyXG4gICAgICByZXR1cm4gdGhpcy5fZm9ybUNvbnRleHQ7XHJcbiAgICB9XHJcbiAgICAvKipHZXRzIGEgcmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IGV4ZWN1dGlvIGNvbnRleHQqL1xyXG4gICAgc3RhdGljIGdldCBleGVjdXRpb25Db250ZXh0KCk6IFhybS5FdmVudHMuRXZlbnRDb250ZXh0IHtcclxuICAgICAgcmV0dXJuIHRoaXMuX2V4ZWN1dGlvbkNvbnRleHQ7XHJcbiAgICB9XHJcbiAgICAvKipHZXRzIGEgbG9va3VwIHZhbHVlIHRoYXQgcmVmZXJlbmNlcyB0aGUgcmVjb3JkLiovXHJcbiAgICBzdGF0aWMgZ2V0IGVudGl0eVJlZmVyZW5jZSgpIHtcclxuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5lbnRpdHkuZ2V0RW50aXR5UmVmZXJlbmNlKCk7XHJcbiAgICB9XHJcbiAgICAvKipTZXRzIGEgcmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IGZvcm0gY29udGV4dCovXHJcbiAgICBzdGF0aWMgc2V0IGZvcm1Db250ZXh0KGNvbnRleHQ6IFhybS5Gb3JtQ29udGV4dCB8IFhybS5FdmVudHMuRXZlbnRDb250ZXh0KSB7XHJcbiAgICAgIGlmICghY29udGV4dClcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICBgWHJtRXguRm9ybS5zZXRGb3JtQ29udGV4dDogVGhlIGV4ZWN1dGlvbkNvbnRleHQgb3IgZm9ybUNvbnRleHQgd2FzIG5vdCBwYXNzZWQgdG8gdGhlIGZ1bmN0aW9uLmBcclxuICAgICAgICApO1xyXG4gICAgICBpZiAoXCJnZXRGb3JtQ29udGV4dFwiIGluIGNvbnRleHQpIHtcclxuICAgICAgICB0aGlzLl9leGVjdXRpb25Db250ZXh0ID0gY29udGV4dDtcclxuICAgICAgICB0aGlzLl9mb3JtQ29udGV4dCA9IGNvbnRleHQuZ2V0Rm9ybUNvbnRleHQoKTtcclxuICAgICAgfSBlbHNlIGlmIChcImRhdGFcIiBpbiBjb250ZXh0KSB0aGlzLl9mb3JtQ29udGV4dCA9IGNvbnRleHQ7XHJcbiAgICAgIGVsc2VcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICBgWHJtRXguRm9ybS5zZXRGb3JtQ29udGV4dDogVGhlIHBhc3NlZCBjb250ZXh0IGlzIG5vdCBhbiBleGVjdXRpb25Db250ZXh0IG9yIGZvcm1Db250ZXh0LmBcclxuICAgICAgICApO1xyXG4gICAgfVxyXG4gICAgLyoqU2V0cyBhIHJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBleGVjdXRpb24gY29udGV4dCovXHJcbiAgICBzdGF0aWMgc2V0IGV4ZWN1dGlvbkNvbnRleHQoXHJcbiAgICAgIGNvbnRleHQ6IFhybS5Gb3JtQ29udGV4dCB8IFhybS5FdmVudHMuRXZlbnRDb250ZXh0XHJcbiAgICApIHtcclxuICAgICAgaWYgKCFjb250ZXh0KVxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgIGBYcm1FeC5Gb3JtLnNldEV4ZWN1dGlvbkNvbnRleHQ6IFRoZSBleGVjdXRpb25Db250ZXh0IG9yIGZvcm1Db250ZXh0IHdhcyBub3QgcGFzc2VkIHRvIHRoZSBmdW5jdGlvbi5gXHJcbiAgICAgICAgKTtcclxuICAgICAgaWYgKFwiZ2V0Rm9ybUNvbnRleHRcIiBpbiBjb250ZXh0KSB7XHJcbiAgICAgICAgdGhpcy5fZXhlY3V0aW9uQ29udGV4dCA9IGNvbnRleHQ7XHJcbiAgICAgICAgdGhpcy5fZm9ybUNvbnRleHQgPSBjb250ZXh0LmdldEZvcm1Db250ZXh0KCk7XHJcbiAgICAgIH0gZWxzZSBpZiAoXCJkYXRhXCIgaW4gY29udGV4dCkgdGhpcy5fZm9ybUNvbnRleHQgPSBjb250ZXh0O1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICAgYFhybUV4LkZvcm0uc2V0RXhlY3V0aW9uQ29udGV4dDogVGhlIHBhc3NlZCBjb250ZXh0IGlzIG5vdCBhbiBleGVjdXRpb25Db250ZXh0IG9yIGZvcm1Db250ZXh0LmBcclxuICAgICAgICApO1xyXG4gICAgfVxyXG4gICAgLyoqUmV0dXJucyB0cnVlIGlmIGZvcm0gaXMgZnJvbSB0eXBlIGNyZWF0ZSovXHJcbiAgICBzdGF0aWMgZ2V0IElzQ3JlYXRlKCkge1xyXG4gICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC51aS5nZXRGb3JtVHlwZSgpID09IDE7XHJcbiAgICB9XHJcbiAgICAvKipSZXR1cm5zIHRydWUgaWYgZm9ybSBpcyBmcm9tIHR5cGUgdXBkYXRlKi9cclxuICAgIHN0YXRpYyBnZXQgSXNVcGRhdGUoKSB7XHJcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LnVpLmdldEZvcm1UeXBlKCkgPT0gMjtcclxuICAgIH1cclxuICAgIC8qKlJldHVybnMgdHJ1ZSBpZiBmb3JtIGlzIG5vdCBmcm9tIHR5cGUgY3JlYXRlKi9cclxuICAgIHN0YXRpYyBnZXQgSXNOb3RDcmVhdGUoKSB7XHJcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LnVpLmdldEZvcm1UeXBlKCkgIT0gMTtcclxuICAgIH1cclxuICAgIC8qKlJldHVybnMgdHJ1ZSBpZiBmb3JtIGlzIG5vdCBmcm9tIHR5cGUgdXBkYXRlKi9cclxuICAgIHN0YXRpYyBnZXQgSXNOb3RVcGRhdGUoKSB7XHJcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LnVpLmdldEZvcm1UeXBlKCkgIT0gMjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERpc3BsYXlzIGEgZm9ybSBsZXZlbCBub3RpZmljYXRpb24uIEFueSBudW1iZXIgb2Ygbm90aWZpY2F0aW9ucyBjYW4gYmUgZGlzcGxheWVkIGFuZCB3aWxsIHJlbWFpbiB1bnRpbCByZW1vdmVkIHVzaW5nIGNsZWFyRm9ybU5vdGlmaWNhdGlvbi5cclxuICAgICAqIFRoZSBoZWlnaHQgb2YgdGhlIG5vdGlmaWNhdGlvbiBhcmVhIGlzIGxpbWl0ZWQgc28gZWFjaCBuZXcgbWVzc2FnZSB3aWxsIGJlIGFkZGVkIHRvIHRoZSB0b3AuXHJcbiAgICAgKiBAcGFyYW0gbWVzc2FnZSBUaGUgdGV4dCBvZiB0aGUgbm90aWZpY2F0aW9uIG1lc3NhZ2UuXHJcbiAgICAgKiBAcGFyYW0gbGV2ZWwgVGhlIGxldmVsIG9mIHRoZSBub3RpZmljYXRpb24gd2hpY2ggZGVmaW5lcyBob3cgdGhlIG1lc3NhZ2Ugd2lsbCBiZSBkaXNwbGF5ZWQsIHN1Y2ggYXMgdGhlIGljb24uXHJcbiAgICAgKiBFUlJPUjogTm90aWZpY2F0aW9uIHdpbGwgdXNlIHRoZSBzeXN0ZW0gZXJyb3IgaWNvbi5cclxuICAgICAqIFdBUk5JTkc6IE5vdGlmaWNhdGlvbiB3aWxsIHVzZSB0aGUgc3lzdGVtIHdhcm5pbmcgaWNvbi5cclxuICAgICAqIElORk86IE5vdGlmaWNhdGlvbiB3aWxsIHVzZSB0aGUgc3lzdGVtIGluZm8gaWNvbi5cclxuICAgICAqIEBwYXJhbSB1bmlxdWVJZCBVbmlxdWUgaWRlbnRpZmllciBmb3IgdGhlIG5vdGlmaWNhdGlvbiB3aGljaCBpcyB1c2VkIHdpdGggY2xlYXJGb3JtTm90aWZpY2F0aW9uIHRvIHJlbW92ZSB0aGUgbm90aWZpY2F0aW9uLlxyXG4gICAgICogQHJldHVybnMgdHJ1ZSBpZiBpdCBzdWNjZWVkcywgb3RoZW5wcndpc2UgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBhZGRGb3JtTm90aWZpY2F0aW9uKFxyXG4gICAgICBtZXNzYWdlOiBzdHJpbmcsXHJcbiAgICAgIGxldmVsOiBYcm0uRm9ybU5vdGlmaWNhdGlvbkxldmVsLFxyXG4gICAgICB1bmlxdWVJZDogc3RyaW5nXHJcbiAgICApIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC51aS5zZXRGb3JtTm90aWZpY2F0aW9uKFxyXG4gICAgICAgICAgbWVzc2FnZSxcclxuICAgICAgICAgIGxldmVsLFxyXG4gICAgICAgICAgdW5pcXVlSWRcclxuICAgICAgICApO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQ2xlYXJzIHRoZSBmb3JtIG5vdGlmaWNhdGlvbiBkZXNjcmliZWQgYnkgdW5pcXVlSWQuXHJcbiAgICAgKiBAcGFyYW0gdW5pcXVlSWQgVW5pcXVlIGlkZW50aWZpZXIuXHJcbiAgICAgKiBAcmV0dXJucyBUcnVlIGlmIGl0IHN1Y2NlZWRzLCBvdGhlcndpc2UgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyByZW1vdmVGb3JtTm90aWZpY2F0aW9uKHVuaXF1ZUlkOiBzdHJpbmcpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC51aS5jbGVhckZvcm1Ob3RpZmljYXRpb24odW5pcXVlSWQpO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyBhIGhhbmRsZXIgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHJlY29yZCBpcyBzYXZlZC5cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFkZE9uU2F2ZShcclxuICAgICAgaGFuZGxlcnM6XHJcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyXHJcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyW11cclxuICAgICkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShoYW5kbGVycykpIHtcclxuICAgICAgICAgIGhhbmRsZXJzID0gW2hhbmRsZXJzXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAnJHtoYW5kbGVyfScgaXMgbm90IGEgZnVuY3Rpb25gKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5lbnRpdHkucmVtb3ZlT25TYXZlKGhhbmRsZXIpO1xyXG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLmVudGl0eS5hZGRPblNhdmUoaGFuZGxlcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGEgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIGFmdGVyIHRoZSBPblNhdmUgaXMgY29tcGxldGUuXHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlciBUaGUgaGFuZGxlci5cclxuICAgICAqIEByZW1hcmtzIEFkZGVkIGluIDkuMlxyXG4gICAgICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kb2NzLm1pY3Jvc29mdC5jb20vZW4tdXMvcG93ZXJhcHBzL2RldmVsb3Blci9tb2RlbC1kcml2ZW4tYXBwcy9jbGllbnRhcGkvcmVmZXJlbmNlL2V2ZW50cy9wb3N0c2F2ZSBFeHRlcm5hbCBMaW5rOiBQb3N0U2F2ZSBFdmVudCBEb2N1bWVudGF0aW9ufVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYWRkT25Qb3N0U2F2ZShcclxuICAgICAgaGFuZGxlcnM6XHJcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyXHJcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyW11cclxuICAgICkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShoYW5kbGVycykpIHtcclxuICAgICAgICAgIGhhbmRsZXJzID0gW2hhbmRsZXJzXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAnJHtoYW5kbGVyfScgaXMgbm90IGEgZnVuY3Rpb25gKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5lbnRpdHkucmVtb3ZlT25Qb3N0U2F2ZShoYW5kbGVyKTtcclxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5lbnRpdHkuYWRkT25Qb3N0U2F2ZShoYW5kbGVyKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiBmb3JtIGRhdGEgaXMgbG9hZGVkLlxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIgVGhlIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIGZvcm0gZGF0YSBsb2Fkcy4gVGhlIGZ1bmN0aW9uIHdpbGwgYmUgYWRkZWQgdG8gdGhlIGJvdHRvbSBvZiB0aGUgZXZlbnQgaGFuZGxlciBwaXBlbGluZS5cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFkZE9uTG9hZChcclxuICAgICAgaGFuZGxlcnM6XHJcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyXHJcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyW11cclxuICAgICkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShoYW5kbGVycykpIHtcclxuICAgICAgICAgIGhhbmRsZXJzID0gW2hhbmRsZXJzXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAnJHtoYW5kbGVyfScgaXMgbm90IGEgZnVuY3Rpb25gKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5yZW1vdmVPbkxvYWQoaGFuZGxlcik7XHJcbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEuYWRkT25Mb2FkKGhhbmRsZXIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyBhIGhhbmRsZXIgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGF0dHJpYnV0ZSdzIHZhbHVlIGlzIGNoYW5nZWQuXHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlciBUaGUgZnVuY3Rpb24gcmVmZXJlbmNlLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYWRkT25DaGFuZ2UoXHJcbiAgICAgIGZpZWxkczogQ2xhc3MuRmllbGRbXSxcclxuICAgICAgaGFuZGxlcnM6XHJcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyXHJcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyW10sXHJcbiAgICAgIGV4ZWN1dGU/OiBib29sZWFuXHJcbiAgICApIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoaGFuZGxlcnMpKSB7XHJcbiAgICAgICAgICBoYW5kbGVycyA9IFtoYW5kbGVyc107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhhbmRsZXJzLmZvckVhY2goKGhhbmRsZXIpID0+IHtcclxuICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJyR7aGFuZGxlcn0nIGlzIG5vdCBhIGZ1bmN0aW9uYCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcclxuICAgICAgICAgICAgZmllbGQucmVtb3ZlT25DaGFuZ2UoaGFuZGxlcik7XHJcbiAgICAgICAgICAgIGZpZWxkLmFkZE9uQ2hhbmdlKGhhbmRsZXIpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKGV4ZWN1dGUpIHtcclxuICAgICAgICAgIGZpZWxkcy5mb3JFYWNoKChmaWVsZCkgPT4ge1xyXG4gICAgICAgICAgICBmaWVsZC5BdHRyaWJ1dGUuZmlyZU9uQ2hhbmdlKCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBjbG9uZVJlY29yZCgpIHtcclxuICAgICAgdmFyIGVudGl0eUZvcm1PcHRpb25zID0ge307XHJcbiAgICAgIHZhciBmb3JtUGFyYW1ldGVycyA9IHt9O1xyXG4gICAgICB2YXIgZW50aXR5TmFtZSA9IHRoaXMuZm9ybUNvbnRleHQuZGF0YS5lbnRpdHkuZ2V0RW50aXR5TmFtZSgpO1xyXG4gICAgICBlbnRpdHlGb3JtT3B0aW9uc1tcImVudGl0eU5hbWVcIl0gPSBlbnRpdHlOYW1lO1xyXG4gICAgICB0aGlzLmZvcm1Db250ZXh0LmRhdGEuZW50aXR5LmF0dHJpYnV0ZXMuZm9yRWFjaCgoYykgPT4ge1xyXG4gICAgICAgIHZhciBhdHRyaWJ1dGVUeXBlID0gYy5nZXRBdHRyaWJ1dGVUeXBlKCk7XHJcbiAgICAgICAgdmFyIGF0dHJpYnV0ZU5hbWUgPSBjLmdldE5hbWUoKTtcclxuICAgICAgICB2YXIgYXR0cmlidXRlVmFsdWUgPSBjLmdldFZhbHVlKCk7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgIWF0dHJpYnV0ZVZhbHVlIHx8XHJcbiAgICAgICAgICBhdHRyaWJ1dGVOYW1lID09PSBcImNyZWF0ZWRvblwiIHx8XHJcbiAgICAgICAgICBhdHRyaWJ1dGVOYW1lID09PSBcIm1vZGlmaWVkb25cIiB8fFxyXG4gICAgICAgICAgYXR0cmlidXRlTmFtZSA9PT0gXCJjcmVhdGVkYnlcIiB8fFxyXG4gICAgICAgICAgYXR0cmlidXRlTmFtZSA9PT0gXCJtb2RpZmllZGJ5XCIgfHxcclxuICAgICAgICAgIGF0dHJpYnV0ZU5hbWUgPT09IFwicHJvY2Vzc2lkXCIgfHxcclxuICAgICAgICAgIGF0dHJpYnV0ZU5hbWUgPT09IFwic3RhZ2VpZFwiIHx8XHJcbiAgICAgICAgICBhdHRyaWJ1dGVOYW1lID09PSBcIm93bmVyaWRcIiB8fFxyXG4gICAgICAgICAgYXR0cmlidXRlTmFtZS5zdGFydHNXaXRoKFwidHJhbnNhY3Rpb25jdXJyZW5jeVwiKVxyXG4gICAgICAgIClcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICBhdHRyaWJ1dGVUeXBlID09PSBcImxvb2t1cFwiICYmXHJcbiAgICAgICAgICAhKGMgYXMgWHJtLkF0dHJpYnV0ZXMuTG9va3VwQXR0cmlidXRlKS5nZXRJc1BhcnR5TGlzdCgpICYmXHJcbiAgICAgICAgICBhdHRyaWJ1dGVWYWx1ZS5sZW5ndGggPiAwXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICBmb3JtUGFyYW1ldGVyc1thdHRyaWJ1dGVOYW1lXSA9IGF0dHJpYnV0ZVZhbHVlWzBdLmlkO1xyXG4gICAgICAgICAgZm9ybVBhcmFtZXRlcnNbYXR0cmlidXRlTmFtZSArIFwibmFtZVwiXSA9IGF0dHJpYnV0ZVZhbHVlWzBdLm5hbWU7XHJcbiAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZU5hbWUgPT09IFwiY3VzdG9tZXJpZFwiIHx8XHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZU5hbWUgPT09IFwicGFyZW50Y3VzdG9tZXJpZFwiIHx8XHJcbiAgICAgICAgICAgIChjLmdldEF0dHJpYnV0ZVR5cGUgJiZcclxuICAgICAgICAgICAgICBjLmdldEF0dHJpYnV0ZVR5cGUoKSA9PT0gXCJsb29rdXBcIiAmJlxyXG4gICAgICAgICAgICAgIHR5cGVvZiAoYyBhcyBhbnkpLmdldExvb2t1cFR5cGVzID09PSBcImZ1bmN0aW9uXCIgJiZcclxuICAgICAgICAgICAgICBBcnJheS5pc0FycmF5KChjIGFzIGFueSkuZ2V0TG9va3VwVHlwZXMoKSkgJiZcclxuICAgICAgICAgICAgICAoYyBhcyBhbnkpLmdldExvb2t1cFR5cGVzKCkubGVuZ3RoID4gMSlcclxuICAgICAgICAgICkge1xyXG4gICAgICAgICAgICBmb3JtUGFyYW1ldGVyc1thdHRyaWJ1dGVOYW1lICsgXCJ0eXBlXCJdID1cclxuICAgICAgICAgICAgICBhdHRyaWJ1dGVWYWx1ZVswXS5lbnRpdHlUeXBlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoYXR0cmlidXRlVHlwZSA9PT0gXCJkYXRldGltZVwiKSB7XHJcbiAgICAgICAgICBmb3JtUGFyYW1ldGVyc1thdHRyaWJ1dGVOYW1lXSA9IG5ldyBEYXRlKFxyXG4gICAgICAgICAgICBhdHRyaWJ1dGVWYWx1ZVxyXG4gICAgICAgICAgKS50b0lTT1N0cmluZygpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBmb3JtUGFyYW1ldGVyc1thdHRyaWJ1dGVOYW1lXSA9IGF0dHJpYnV0ZVZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IGF3YWl0IFhybS5OYXZpZ2F0aW9uLm9wZW5Gb3JtKFxyXG4gICAgICAgICAgZW50aXR5Rm9ybU9wdGlvbnMsXHJcbiAgICAgICAgICBmb3JtUGFyYW1ldGVyc1xyXG4gICAgICAgICk7XHJcbiAgICAgICAgY29uc29sZS5sb2cocmVzdWx0KTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguJHtnZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBleHBvcnQgbmFtZXNwYWNlIENsYXNzIHtcclxuICAgIC8qKlxyXG4gICAgICogVXNlZCB0byBleGVjdXRlIG1ldGhvZHMgcmVsYXRlZCB0byBhIHNpbmdsZSBBdHRyaWJ1dGVcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIEZpZWxkIGltcGxlbWVudHMgWHJtLkF0dHJpYnV0ZXMuQXR0cmlidXRlIHtcclxuICAgICAgcHVibGljIHJlYWRvbmx5IE5hbWUhOiBzdHJpbmc7XHJcbiAgICAgIHByb3RlY3RlZCBfYXR0cmlidXRlPzogWHJtLkF0dHJpYnV0ZXMuQXR0cmlidXRlO1xyXG5cclxuICAgICAgY29uc3RydWN0b3IoYXR0cmlidXRlTmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5OYW1lID0gYXR0cmlidXRlTmFtZTtcclxuICAgICAgfVxyXG4gICAgICBzZXRWYWx1ZSh2YWx1ZTogYW55KTogdm9pZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKHZhbHVlKTtcclxuICAgICAgfVxyXG4gICAgICBnZXRBdHRyaWJ1dGVUeXBlKCk6IFhybS5BdHRyaWJ1dGVzLkF0dHJpYnV0ZVR5cGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRBdHRyaWJ1dGVUeXBlKCk7XHJcbiAgICAgIH1cclxuICAgICAgZ2V0Rm9ybWF0KCk6IFhybS5BdHRyaWJ1dGVzLkF0dHJpYnV0ZUZvcm1hdCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEZvcm1hdCgpO1xyXG4gICAgICB9XHJcbiAgICAgIGdldElzRGlydHkoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldElzRGlydHkoKTtcclxuICAgICAgfVxyXG4gICAgICBnZXROYW1lKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldE5hbWUoKTtcclxuICAgICAgfVxyXG4gICAgICBnZXRQYXJlbnQoKTogWHJtLkVudGl0eSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFBhcmVudCgpO1xyXG4gICAgICB9XHJcbiAgICAgIGdldFJlcXVpcmVkTGV2ZWwoKTogWHJtLkF0dHJpYnV0ZXMuUmVxdWlyZW1lbnRMZXZlbCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFJlcXVpcmVkTGV2ZWwoKTtcclxuICAgICAgfVxyXG4gICAgICBnZXRTdWJtaXRNb2RlKCk6IFhybS5TdWJtaXRNb2RlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0U3VibWl0TW9kZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIGdldFVzZXJQcml2aWxlZ2UoKTogWHJtLlByaXZpbGVnZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFVzZXJQcml2aWxlZ2UoKTtcclxuICAgICAgfVxyXG4gICAgICByZW1vdmVPbkNoYW5nZShoYW5kbGVyOiBYcm0uRXZlbnRzLkF0dHJpYnV0ZS5DaGFuZ2VFdmVudEhhbmRsZXIpOiB2b2lkIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUucmVtb3ZlT25DaGFuZ2UoaGFuZGxlcik7XHJcbiAgICAgIH1cclxuICAgICAgc2V0U3VibWl0TW9kZShzdWJtaXRNb2RlOiBYcm0uU3VibWl0TW9kZSk6IHZvaWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5zZXRTdWJtaXRNb2RlKHN1Ym1pdE1vZGUpO1xyXG4gICAgICB9XHJcbiAgICAgIGdldFZhbHVlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRWYWx1ZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIHNldElzVmFsaWQoaXNWYWxpZDogYm9vbGVhbiwgbWVzc2FnZT86IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5zZXRJc1ZhbGlkKGlzVmFsaWQsIG1lc3NhZ2UpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwdWJsaWMgZ2V0IEF0dHJpYnV0ZSgpOiBYcm0uQXR0cmlidXRlcy5BdHRyaWJ1dGUge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5fYXR0cmlidXRlID8/PVxyXG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUodGhpcy5OYW1lKSA/P1xyXG4gICAgICAgICAgWHJtRXgudGhyb3dFcnJvcihcclxuICAgICAgICAgICAgYFRoZSBhdHRyaWJ1dGUgJyR7dGhpcy5OYW1lfScgd2FzIG5vdCBmb3VuZCBvbiB0aGUgZm9ybS5gXHJcbiAgICAgICAgICApKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcHVibGljIGdldCBjb250cm9scygpOiBYcm0uQ29sbGVjdGlvbi5JdGVtQ29sbGVjdGlvbjxYcm0uQ29udHJvbHMuU3RhbmRhcmRDb250cm9sPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmNvbnRyb2xzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogR2V0cyB0aGUgdmFsdWUuXHJcbiAgICAgICAqIEByZXR1cm5zIFRoZSB2YWx1ZS5cclxuICAgICAgICovXHJcbiAgICAgIHB1YmxpYyBnZXQgVmFsdWUoKTogYW55IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0VmFsdWUoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcHVibGljIHNldCBWYWx1ZSh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgdGhpcy5BdHRyaWJ1dGUuc2V0VmFsdWUodmFsdWUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU2V0cyBhIGNvbnRyb2wtbG9jYWwgbm90aWZpY2F0aW9uIG1lc3NhZ2UuXHJcbiAgICAgICAqIEBwYXJhbSBtZXNzYWdlIFRoZSBtZXNzYWdlLlxyXG4gICAgICAgKiBAcGFyYW0gdW5pcXVlSWQgVW5pcXVlIGlkZW50aWZpZXIuXHJcbiAgICAgICAqIEByZXR1cm5zIHRydWUgaWYgaXQgc3VjY2VlZHMsIGZhbHNlIGlmIGl0IGZhaWxzLlxyXG4gICAgICAgKiBAcmVtYXJrcyAgICAgV2hlbiB0aGlzIG1ldGhvZCBpcyB1c2VkIG9uIE1pY3Jvc29mdCBEeW5hbWljcyBDUk0gZm9yIHRhYmxldHMgYSByZWQgXCJYXCIgaWNvblxyXG4gICAgICAgKiAgICAgICAgICAgICAgYXBwZWFycyBuZXh0IHRvIHRoZSBjb250cm9sLiBUYXBwaW5nIG9uIHRoZSBpY29uIHdpbGwgZGlzcGxheSB0aGUgbWVzc2FnZS5cclxuICAgICAgICovXHJcbiAgICAgIHB1YmxpYyBzZXROb3RpZmljYXRpb24obWVzc2FnZTogc3RyaW5nLCB1bmlxdWVJZDogc3RyaW5nKTogdGhpcyB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGlmICghbWVzc2FnZSkgdGhyb3cgbmV3IEVycm9yKGBubyBtZXNzYWdlIHdhcyBwcm92aWRlZC5gKTtcclxuICAgICAgICAgIGlmICghdW5pcXVlSWQpIHRocm93IG5ldyBFcnJvcihgbm8gdW5pcXVlSWQgd2FzIHByb3ZpZGVkLmApO1xyXG4gICAgICAgICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PlxyXG4gICAgICAgICAgICBjb250cm9sLnNldE5vdGlmaWNhdGlvbihtZXNzYWdlLCB1bmlxdWVJZClcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBTZXRzIHRoZSB2aXNpYmlsaXR5IHN0YXRlLlxyXG4gICAgICAgKiBAcGFyYW0gdmlzaWJsZSB0cnVlIHRvIHNob3csIGZhbHNlIHRvIGhpZGUuXHJcbiAgICAgICAqL1xyXG4gICAgICBwdWJsaWMgc2V0VmlzaWJsZSh2aXNpYmxlOiBib29sZWFuKTogdGhpcyB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIHRoaXMuY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT4gY29udHJvbC5zZXRWaXNpYmxlKHZpc2libGUpKTtcclxuICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFNldHMgdGhlIHN0YXRlIG9mIHRoZSBjb250cm9sIHRvIGVpdGhlciBlbmFibGVkLCBvciBkaXNhYmxlZC5cclxuICAgICAgICogQHBhcmFtIGRpc2FibGVkIHRydWUgdG8gZGlzYWJsZSwgZmFsc2UgdG8gZW5hYmxlLlxyXG4gICAgICAgKi9cclxuICAgICAgcHVibGljIHNldERpc2FibGVkKGRpc2FibGVkOiBib29sZWFuKTogdGhpcyB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIHRoaXMuY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT4gY29udHJvbC5zZXREaXNhYmxlZChkaXNhYmxlZCkpO1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU2V0cyB0aGUgcmVxdWlyZWQgbGV2ZWwuXHJcbiAgICAgICAqIEBwYXJhbSByZXF1aXJlbWVudExldmVsIFRoZSByZXF1aXJlbWVudCBsZXZlbCwgYXMgZWl0aGVyIFwibm9uZVwiLCBcInJlcXVpcmVkXCIsIG9yIFwicmVjb21tZW5kZWRcIlxyXG4gICAgICAgKi9cclxuICAgICAgcHVibGljIHNldFJlcXVpcmVkTGV2ZWwoXHJcbiAgICAgICAgcmVxdWlyZW1lbnRMZXZlbDogWHJtLkF0dHJpYnV0ZXMuUmVxdWlyZW1lbnRMZXZlbFxyXG4gICAgICApOiB0aGlzIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgdGhpcy5BdHRyaWJ1dGUuc2V0UmVxdWlyZWRMZXZlbChyZXF1aXJlbWVudExldmVsKTtcclxuICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFNldHMgdGhlIHJlcXVpcmVkIGxldmVsLlxyXG4gICAgICAgKiBAcGFyYW0gcmVxdWlyZWQgVGhlIHJlcXVpcmVtZW50IGxldmVsLCBhcyBlaXRoZXIgZmFsc2UgZm9yIFwibm9uZVwiIG9yIHRydWUgZm9yIFwicmVxdWlyZWRcIlxyXG4gICAgICAgKi9cclxuICAgICAgcHVibGljIHNldFJlcXVpcmVkKHJlcXVpcmVkOiBib29sZWFuKTogdGhpcyB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIHRoaXMuQXR0cmlidXRlLnNldFJlcXVpcmVkTGV2ZWwocmVxdWlyZWQgPyBcInJlcXVpcmVkXCIgOiBcIm5vbmVcIik7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKkZpcmUgYWxsIFwib24gY2hhbmdlXCIgZXZlbnQgaGFuZGxlcnMuICovXHJcbiAgICAgIHB1YmxpYyBmaXJlT25DaGFuZ2UoKTogdGhpcyB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIHRoaXMuQXR0cmlidXRlLmZpcmVPbkNoYW5nZSgpO1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogQWRkcyBhIGhhbmRsZXIgb3IgYW4gYXJyYXkgb2YgaGFuZGxlcnMgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGF0dHJpYnV0ZSdzIHZhbHVlIGlzIGNoYW5nZWQuXHJcbiAgICAgICAqIEBwYXJhbSBoYW5kbGVycyBUaGUgZnVuY3Rpb24gcmVmZXJlbmNlIG9yIGFuIGFycmF5IG9mIGZ1bmN0aW9uIHJlZmVyZW5jZXMuXHJcbiAgICAgICAqL1xyXG4gICAgICBwdWJsaWMgYWRkT25DaGFuZ2UoXHJcbiAgICAgICAgaGFuZGxlcnM6XHJcbiAgICAgICAgICB8IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXJcclxuICAgICAgICAgIHwgWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlcltdXHJcbiAgICAgICk6IHRoaXMge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShoYW5kbGVycykpIHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBoYW5kbGVyIG9mIGhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCcke2hhbmRsZXJ9JyBpcyBub3QgYSBmdW5jdGlvbmApO1xyXG4gICAgICAgICAgICAgIHRoaXMuQXR0cmlidXRlLnJlbW92ZU9uQ2hhbmdlKGhhbmRsZXIpO1xyXG4gICAgICAgICAgICAgIHRoaXMuQXR0cmlidXRlLmFkZE9uQ2hhbmdlKGhhbmRsZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXJzICE9PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAnJHtoYW5kbGVyc30nIGlzIG5vdCBhIGZ1bmN0aW9uYCk7XHJcbiAgICAgICAgICAgIHRoaXMuQXR0cmlidXRlLnJlbW92ZU9uQ2hhbmdlKGhhbmRsZXJzKTtcclxuICAgICAgICAgICAgdGhpcy5BdHRyaWJ1dGUuYWRkT25DaGFuZ2UoaGFuZGxlcnMpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogRGlzcGxheXMgYW4gZXJyb3Igb3IgcmVjb21tZW5kYXRpb24gbm90aWZpY2F0aW9uIGZvciBhIGNvbnRyb2wsIGFuZCBsZXRzIHlvdSBzcGVjaWZ5IGFjdGlvbnMgdG8gZXhlY3V0ZSBiYXNlZCBvbiB0aGUgbm90aWZpY2F0aW9uLlxyXG4gICAgICAgKi9cclxuICAgICAgcHVibGljIGFkZE5vdGlmaWNhdGlvbihcclxuICAgICAgICBtZXNzYWdlOiBzdHJpbmcsXHJcbiAgICAgICAgbm90aWZpY2F0aW9uTGV2ZWw6IFwiRVJST1JcIiB8IFwiUkVDT01NRU5EQVRJT05cIixcclxuICAgICAgICB1bmlxdWVJZDogc3RyaW5nLFxyXG4gICAgICAgIGFjdGlvbnM/OiBYcm0uQ29udHJvbHMuQ29udHJvbE5vdGlmaWNhdGlvbkFjdGlvbltdXHJcbiAgICAgICk6IHRoaXMge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBpZiAoIXVuaXF1ZUlkKSB0aHJvdyBuZXcgRXJyb3IoYG5vIHVuaXF1ZUlkIHdhcyBwcm92aWRlZC5gKTtcclxuICAgICAgICAgIGlmIChhY3Rpb25zICYmICFBcnJheS5pc0FycmF5KGFjdGlvbnMpKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICAgICAgYHRoZSBhY3Rpb24gcGFyYW1ldGVyIGlzIG5vdCBhbiBhcnJheSBvZiBDb250cm9sTm90aWZpY2F0aW9uQWN0aW9uYFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnRyb2wuYWRkTm90aWZpY2F0aW9uKHtcclxuICAgICAgICAgICAgICBtZXNzYWdlczogW21lc3NhZ2VdLFxyXG4gICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkxldmVsOiBub3RpZmljYXRpb25MZXZlbCxcclxuICAgICAgICAgICAgICB1bmlxdWVJZDogdW5pcXVlSWQsXHJcbiAgICAgICAgICAgICAgYWN0aW9uczogYWN0aW9ucyxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAvKipcclxuICAgICAgICogQ2xlYXJzIHRoZSBub3RpZmljYXRpb24gaWRlbnRpZmllZCBieSB1bmlxdWVJZC5cclxuICAgICAgICogQHBhcmFtIHVuaXF1ZUlkIChPcHRpb25hbCkgVW5pcXVlIGlkZW50aWZpZXIuXHJcbiAgICAgICAqIEByZXR1cm5zIHRydWUgaWYgaXQgc3VjY2VlZHMsIGZhbHNlIGlmIGl0IGZhaWxzLlxyXG4gICAgICAgKiBAcmVtYXJrcyBJZiB0aGUgdW5pcXVlSWQgcGFyYW1ldGVyIGlzIG5vdCB1c2VkLCB0aGUgY3VycmVudCBub3RpZmljYXRpb24gc2hvd24gd2lsbCBiZSByZW1vdmVkLlxyXG4gICAgICAgKi9cclxuICAgICAgcmVtb3ZlTm90aWZpY2F0aW9uKHVuaXF1ZUlkOiBzdHJpbmcpOiB0aGlzIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnRyb2wuY2xlYXJOb3RpZmljYXRpb24odW5pcXVlSWQpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGV4cG9ydCBjbGFzcyBUZXh0RmllbGRcclxuICAgICAgZXh0ZW5kcyBGaWVsZFxyXG4gICAgICBpbXBsZW1lbnRzIFhybS5BdHRyaWJ1dGVzLlN0cmluZ0F0dHJpYnV0ZSB7XHJcbiAgICAgIHByb3RlY3RlZCBkZWNsYXJlIF9hdHRyaWJ1dGU6IFhybS5BdHRyaWJ1dGVzLlN0cmluZ0F0dHJpYnV0ZTtcclxuICAgICAgY29uc3RydWN0b3IoYXR0cmlidXRlOiBzdHJpbmcpIHtcclxuICAgICAgICBzdXBlcihhdHRyaWJ1dGUpO1xyXG4gICAgICB9XHJcbiAgICAgIGdldE1heExlbmd0aCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRNYXhMZW5ndGgoKTtcclxuICAgICAgfVxyXG4gICAgICBnZXRGb3JtYXQoKTogWHJtLkF0dHJpYnV0ZXMuU3RyaW5nQXR0cmlidXRlRm9ybWF0IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0Rm9ybWF0KCkgYXMgWHJtLkF0dHJpYnV0ZXMuU3RyaW5nQXR0cmlidXRlRm9ybWF0O1xyXG4gICAgICB9XHJcbiAgICAgIGdldCBBdHRyaWJ1dGUoKSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLl9hdHRyaWJ1dGUgPz89XHJcbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZSh0aGlzLk5hbWUpID8/XHJcbiAgICAgICAgICBYcm1FeC50aHJvd0Vycm9yKGBGaWVsZCAnJHt0aGlzLk5hbWV9JyBkb2VzIG5vdCBleGlzdGApKTtcclxuICAgICAgfVxyXG4gICAgICBnZXQgY29udHJvbHMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmNvbnRyb2xzO1xyXG4gICAgICB9XHJcbiAgICAgIGdldCBWYWx1ZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRWYWx1ZSgpID8/IG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgc2V0IFZhbHVlKHZhbHVlOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh2YWx1ZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGV4cG9ydCBjbGFzcyBOdW1iZXJGaWVsZFxyXG4gICAgICBleHRlbmRzIEZpZWxkXHJcbiAgICAgIGltcGxlbWVudHMgWHJtLkF0dHJpYnV0ZXMuTnVtYmVyQXR0cmlidXRlIHtcclxuICAgICAgcHJvdGVjdGVkIGRlY2xhcmUgX2F0dHJpYnV0ZTogWHJtLkF0dHJpYnV0ZXMuTnVtYmVyQXR0cmlidXRlO1xyXG4gICAgICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGU6IHN0cmluZykge1xyXG4gICAgICAgIHN1cGVyKGF0dHJpYnV0ZSk7XHJcbiAgICAgIH1cclxuICAgICAgZ2V0Rm9ybWF0KCk6IFhybS5BdHRyaWJ1dGVzLkludGVnZXJBdHRyaWJ1dGVGb3JtYXQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRGb3JtYXQoKSBhcyBYcm0uQXR0cmlidXRlcy5JbnRlZ2VyQXR0cmlidXRlRm9ybWF0O1xyXG4gICAgICB9XHJcbiAgICAgIGdldE1heCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRNYXgoKTtcclxuICAgICAgfVxyXG4gICAgICBnZXRNaW4oKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0TWluKCk7XHJcbiAgICAgIH1cclxuICAgICAgZ2V0UHJlY2lzaW9uKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFByZWNpc2lvbigpO1xyXG4gICAgICB9XHJcbiAgICAgIHNldFByZWNpc2lvbihwcmVjaXNpb246IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5zZXRQcmVjaXNpb24ocHJlY2lzaW9uKTtcclxuICAgICAgfVxyXG4gICAgICBnZXQgQXR0cmlidXRlKCkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5fYXR0cmlidXRlID8/PVxyXG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUodGhpcy5OYW1lKSA/P1xyXG4gICAgICAgICAgWHJtRXgudGhyb3dFcnJvcihgRmllbGQgJyR7dGhpcy5OYW1lfScgZG9lcyBub3QgZXhpc3RgKSk7XHJcbiAgICAgIH1cclxuICAgICAgZ2V0IGNvbnRyb2xzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5jb250cm9scztcclxuICAgICAgfVxyXG4gICAgICBnZXQgVmFsdWUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0VmFsdWUoKSA/PyBudWxsO1xyXG4gICAgICB9XHJcbiAgICAgIHNldCBWYWx1ZSh2YWx1ZTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5BdHRyaWJ1dGUuc2V0VmFsdWUodmFsdWUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBleHBvcnQgY2xhc3MgRGF0ZUZpZWxkXHJcbiAgICAgIGV4dGVuZHMgRmllbGRcclxuICAgICAgaW1wbGVtZW50cyBYcm0uQXR0cmlidXRlcy5EYXRlQXR0cmlidXRlIHtcclxuICAgICAgcHJvdGVjdGVkIGRlY2xhcmUgX2F0dHJpYnV0ZTogWHJtLkF0dHJpYnV0ZXMuRGF0ZUF0dHJpYnV0ZTtcclxuICAgICAgY29uc3RydWN0b3IoYXR0cmlidXRlOiBzdHJpbmcpIHtcclxuICAgICAgICBzdXBlcihhdHRyaWJ1dGUpO1xyXG4gICAgICB9XHJcbiAgICAgIGdldEZvcm1hdCgpOiBYcm0uQXR0cmlidXRlcy5EYXRlQXR0cmlidXRlRm9ybWF0IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0Rm9ybWF0KCkgYXMgWHJtLkF0dHJpYnV0ZXMuRGF0ZUF0dHJpYnV0ZUZvcm1hdDtcclxuICAgICAgfVxyXG4gICAgICBnZXQgQXR0cmlidXRlKCkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5fYXR0cmlidXRlID8/PVxyXG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUodGhpcy5OYW1lKSA/P1xyXG4gICAgICAgICAgWHJtRXgudGhyb3dFcnJvcihgRmllbGQgJyR7dGhpcy5OYW1lfScgZG9lcyBub3QgZXhpc3RgKSk7XHJcbiAgICAgIH1cclxuICAgICAgZ2V0IGNvbnRyb2xzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5jb250cm9scztcclxuICAgICAgfVxyXG4gICAgICBnZXQgVmFsdWUoKTogRGF0ZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFZhbHVlKCkgPz8gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICBzZXQgVmFsdWUodmFsdWU6IERhdGUpIHtcclxuICAgICAgICB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh2YWx1ZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGV4cG9ydCBjbGFzcyBCb29sZWFuRmllbGRcclxuICAgICAgZXh0ZW5kcyBGaWVsZFxyXG4gICAgICBpbXBsZW1lbnRzIFhybS5BdHRyaWJ1dGVzLkJvb2xlYW5BdHRyaWJ1dGUge1xyXG4gICAgICBwcm90ZWN0ZWQgZGVjbGFyZSBfYXR0cmlidXRlOiBYcm0uQXR0cmlidXRlcy5Cb29sZWFuQXR0cmlidXRlO1xyXG4gICAgICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGU6IHN0cmluZykge1xyXG4gICAgICAgIHN1cGVyKGF0dHJpYnV0ZSk7XHJcbiAgICAgIH1cclxuICAgICAgZ2V0QXR0cmlidXRlVHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0QXR0cmlidXRlVHlwZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIGdldEluaXRpYWxWYWx1ZSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0SW5pdGlhbFZhbHVlKCk7XHJcbiAgICAgIH1cclxuICAgICAgZ2V0IEF0dHJpYnV0ZSgpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuX2F0dHJpYnV0ZSA/Pz1cclxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKHRoaXMuTmFtZSkgPz9cclxuICAgICAgICAgIFhybUV4LnRocm93RXJyb3IoYEZpZWxkICcke3RoaXMuTmFtZX0nIGRvZXMgbm90IGV4aXN0YCkpO1xyXG4gICAgICB9XHJcbiAgICAgIGdldCBjb250cm9scygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuY29udHJvbHM7XHJcbiAgICAgIH1cclxuICAgICAgZ2V0IFZhbHVlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRWYWx1ZSgpID8/IG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgc2V0IFZhbHVlKHZhbHVlOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5BdHRyaWJ1dGUuc2V0VmFsdWUodmFsdWUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBleHBvcnQgY2xhc3MgTXVsdGlTZWxlY3RPcHRpb25TZXRGaWVsZDxPcHRpb25zIGV4dGVuZHMgT3B0aW9uVmFsdWVzPlxyXG4gICAgICBleHRlbmRzIEZpZWxkXHJcbiAgICAgIGltcGxlbWVudHMgWHJtLkF0dHJpYnV0ZXMuTXVsdGlTZWxlY3RPcHRpb25TZXRBdHRyaWJ1dGUge1xyXG4gICAgICBwcm90ZWN0ZWQgZGVjbGFyZSBfYXR0cmlidXRlOiBYcm0uQXR0cmlidXRlcy5NdWx0aVNlbGVjdE9wdGlvblNldEF0dHJpYnV0ZTtcclxuICAgICAgT3B0aW9uOiBPcHRpb25zO1xyXG4gICAgICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsIG9wdGlvbj86IE9wdGlvbnMpIHtcclxuICAgICAgICBzdXBlcihhdHRyaWJ1dGVOYW1lKTtcclxuICAgICAgICB0aGlzLk9wdGlvbiA9IG9wdGlvbjtcclxuICAgICAgfVxyXG4gICAgICBnZXRGb3JtYXQoKTogWHJtLkF0dHJpYnV0ZXMuT3B0aW9uU2V0QXR0cmlidXRlRm9ybWF0IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0Rm9ybWF0KCkgYXMgWHJtLkF0dHJpYnV0ZXMuT3B0aW9uU2V0QXR0cmlidXRlRm9ybWF0O1xyXG4gICAgICB9XHJcbiAgICAgIGdldE9wdGlvbih2YWx1ZTogbnVtYmVyIHwgc3RyaW5nKTogWHJtLk9wdGlvblNldFZhbHVlIHtcclxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0T3B0aW9uKHZhbHVlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldE9wdGlvbih2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGdldE9wdGlvbnMoKTogWHJtLk9wdGlvblNldFZhbHVlW10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRPcHRpb25zKCk7XHJcbiAgICAgIH1cclxuICAgICAgZ2V0U2VsZWN0ZWRPcHRpb24oKTogWHJtLk9wdGlvblNldFZhbHVlW10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRTZWxlY3RlZE9wdGlvbigpO1xyXG4gICAgICB9XHJcbiAgICAgIGdldFRleHQoKTogc3RyaW5nW10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRUZXh0KCk7XHJcbiAgICAgIH1cclxuICAgICAgZ2V0SW5pdGlhbFZhbHVlKCk6IG51bWJlcltdIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0SW5pdGlhbFZhbHVlKCk7XHJcbiAgICAgIH1cclxuICAgICAgZ2V0IEF0dHJpYnV0ZSgpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuX2F0dHJpYnV0ZSA/Pz1cclxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKHRoaXMuTmFtZSkgPz9cclxuICAgICAgICAgIFhybUV4LnRocm93RXJyb3IoYEZpZWxkICcke3RoaXMuTmFtZX0nIGRvZXMgbm90IGV4aXN0YCkpO1xyXG4gICAgICB9XHJcbiAgICAgIGdldCBjb250cm9scygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuY29udHJvbHM7XHJcbiAgICAgIH1cclxuICAgICAgZ2V0IFZhbHVlKCk6IG51bWJlcltdIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0VmFsdWUoKTtcclxuICAgICAgfVxyXG4gICAgICBzZXQgVmFsdWUodmFsdWU6IChrZXlvZiBPcHRpb25zKVtdIHwgbnVtYmVyW10pIHtcclxuICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKG51bGwpO1xyXG4gICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XHJcbiAgICAgICAgICBsZXQgdmFsdWVzID0gW107XHJcbiAgICAgICAgICB2YWx1ZS5mb3JFYWNoKCh2KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdiA9PSBcIm51bWJlclwiKSB2YWx1ZXMucHVzaCh2KTtcclxuICAgICAgICAgICAgZWxzZSB2YWx1ZXMucHVzaCh0aGlzLk9wdGlvblt2XSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKHZhbHVlcyk7XHJcbiAgICAgICAgfSBlbHNlIFhybUV4LnRocm93RXJyb3IoYEZpZWxkIFZhbHVlICcke3ZhbHVlfScgaXMgbm90IGFuIEFycmF5YCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGV4cG9ydCBjbGFzcyBMb29rdXBGaWVsZFxyXG4gICAgICBleHRlbmRzIEZpZWxkXHJcbiAgICAgIGltcGxlbWVudHMgWHJtLkF0dHJpYnV0ZXMuTG9va3VwQXR0cmlidXRlIHtcclxuICAgICAgcHJvdGVjdGVkIGRlY2xhcmUgX2F0dHJpYnV0ZTogWHJtLkF0dHJpYnV0ZXMuTG9va3VwQXR0cmlidXRlO1xyXG4gICAgICBwcm90ZWN0ZWQgX2N1c3RvbUZpbHRlcnM6IGFueSA9IFtdO1xyXG4gICAgICBwcml2YXRlIHZpZXdJZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XHJcbiAgICAgIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZTogc3RyaW5nKSB7XHJcbiAgICAgICAgc3VwZXIoYXR0cmlidXRlKTtcclxuICAgICAgfVxyXG4gICAgICBnZXRJc1BhcnR5TGlzdCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0SXNQYXJ0eUxpc3QoKTtcclxuICAgICAgfVxyXG4gICAgICBnZXQgQXR0cmlidXRlKCkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5fYXR0cmlidXRlID8/PVxyXG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUodGhpcy5OYW1lKSA/P1xyXG4gICAgICAgICAgWHJtRXgudGhyb3dFcnJvcihgRmllbGQgJyR7dGhpcy5OYW1lfScgZG9lcyBub3QgZXhpc3RgKSk7XHJcbiAgICAgIH1cclxuICAgICAgZ2V0IGNvbnRyb2xzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5jb250cm9scztcclxuICAgICAgfVxyXG4gICAgICAvKipHZXRzIHRoZSBpZCBvZiB0aGUgZmlyc3QgbG9va3VwIHZhbHVlKi9cclxuICAgICAgZ2V0IElkKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLlZhbHVlICYmIHRoaXMuVmFsdWUubGVuZ3RoID4gMFxyXG4gICAgICAgICAgPyBYcm1FeC5ub3JtYWxpemVHdWlkKHRoaXMuVmFsdWVbMF0uaWQpXHJcbiAgICAgICAgICA6IG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgLyoqR2V0cyB0aGUgZW50aXR5VHlwZSBvZiB0aGUgZmlyc3QgbG9va3VwIHZhbHVlKi9cclxuICAgICAgZ2V0IEVudGl0eVR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuVmFsdWUgJiYgdGhpcy5WYWx1ZS5sZW5ndGggPiAwXHJcbiAgICAgICAgICA/IHRoaXMuVmFsdWVbMF0uZW50aXR5VHlwZVxyXG4gICAgICAgICAgOiBudWxsO1xyXG4gICAgICB9XHJcbiAgICAgIC8qKkdldHMgdGhlIGZvcm1hdHRlZCB2YWx1ZSBvZiB0aGUgZmlyc3QgbG9va3VwIHZhbHVlKi9cclxuICAgICAgZ2V0IEZvcm1hdHRlZFZhbHVlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLlZhbHVlICYmIHRoaXMuVmFsdWUubGVuZ3RoID4gMCA/IHRoaXMuVmFsdWVbMF0ubmFtZSA6IG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgZ2V0IFZhbHVlKCk6IFhybS5Mb29rdXBWYWx1ZVtdIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0VmFsdWUoKSA/PyBudWxsO1xyXG4gICAgICB9XHJcbiAgICAgIHNldCBWYWx1ZSh2YWx1ZTogWHJtLkxvb2t1cFZhbHVlW10pIHtcclxuICAgICAgICB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh2YWx1ZSk7XHJcbiAgICAgIH1cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFNldHMgdGhlIHZhbHVlIG9mIGEgbG9va3VwXHJcbiAgICAgICAqIEBwYXJhbSBpZCBHdWlkIG9mIHRoZSByZWNvcmRcclxuICAgICAgICogQHBhcmFtIGVudGl0eVR5cGUgbG9naWNhbG5hbWUgb2YgdGhlIGVudGl0eVxyXG4gICAgICAgKiBAcGFyYW0gbmFtZSBmb3JtYXR0ZWQgdmFsdWVcclxuICAgICAgICogQHBhcmFtIGFwcGVuZCBpZiB0cnVlLCBhZGRzIHZhbHVlIHRvIHRoZSBhcnJheSBpbnN0ZWFkIG9mIHJlcGxhY2luZyBpdFxyXG4gICAgICAgKi9cclxuICAgICAgc2V0TG9va3VwVmFsdWUoXHJcbiAgICAgICAgaWQ6IHN0cmluZyxcclxuICAgICAgICBlbnRpdHlUeXBlOiBhbnksXHJcbiAgICAgICAgbmFtZTogYW55LFxyXG4gICAgICAgIGFwcGVuZCA9IGZhbHNlXHJcbiAgICAgICk6IHRoaXMge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBpZiAoIWlkKSB0aHJvdyBuZXcgRXJyb3IoYG5vIGlkIHBhcmFtZXRlciB3YXMgcHJvdmlkZWQuYCk7XHJcbiAgICAgICAgICBpZiAoIWVudGl0eVR5cGUpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgbm8gZW50aXR5VHlwZSBwYXJhbWV0ZXIgd2FzIHByb3ZpZGVkLmApO1xyXG4gICAgICAgICAgaWQgPSBYcm1FeC5ub3JtYWxpemVHdWlkKGlkKTtcclxuICAgICAgICAgIGNvbnN0IGxvb2t1cFZhbHVlID0ge1xyXG4gICAgICAgICAgICBpZCxcclxuICAgICAgICAgICAgZW50aXR5VHlwZSxcclxuICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICB0aGlzLlZhbHVlID1cclxuICAgICAgICAgICAgYXBwZW5kICYmIHRoaXMuVmFsdWVcclxuICAgICAgICAgICAgICA/IHRoaXMuVmFsdWUuY29uY2F0KGxvb2t1cFZhbHVlKVxyXG4gICAgICAgICAgICAgIDogW2xvb2t1cFZhbHVlXTtcclxuICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAvKipcclxuICAgICAgICogU2V0cyBhIGxvb2t1cCB3aXRoIGEgbG9va3VwIGZyb20gdGhlIHJldHJpZXZlZCByZWNvcmQuXHJcbiAgICAgICAqIEBwYXJhbSBzZWxlY3ROYW1lXHJcbiAgICAgICAqIEBwYXJhbSByZXRyaWV2ZWRSZWNvcmRcclxuICAgICAgICogQGV4YW1wbGVcclxuICAgICAgICogdmFyIGNvbnRhY3QgPSBhd2FpdCBmaWVsZHMuQ29udGFjdC5yZXRyaWV2ZSgnPyRzZWxlY3Q9X3BhcmVudGN1c3RvbWVyaWRfdmFsdWUnKTtcclxuICAgICAgICogZmllbGRzLkFjY291bnQuc2V0TG9va3VwRnJvbVJldHJpZXZlKCdfcGFyZW50Y3VzdG9tZXJpZF92YWx1ZScsIGNvbnRhY3QpO1xyXG4gICAgICAgKiAvL0FsdGVybmF0ZVxyXG4gICAgICAgKiBmaWVsZHMuQWNjb3VudC5zZXRMb29rdXBGcm9tUmV0cmlldmUoJ3BhcmVudGN1c3RvbWVyaWQnLCBjb250YWN0KTtcclxuICAgICAgICovXHJcbiAgICAgIHNldExvb2t1cEZyb21SZXRyaWV2ZShcclxuICAgICAgICBzZWxlY3ROYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgcmV0cmlldmVkUmVjb3JkOiB7IFt4OiBzdHJpbmddOiBhbnkgfVxyXG4gICAgICApIHtcclxuICAgICAgICBpZiAoIXNlbGVjdE5hbWUuZW5kc1dpdGgoXCJfdmFsdWVcIikpIHNlbGVjdE5hbWUgPSBgXyR7c2VsZWN0TmFtZX1fdmFsdWVgO1xyXG4gICAgICAgIGlmICghcmV0cmlldmVkUmVjb3JkIHx8ICFyZXRyaWV2ZWRSZWNvcmRbYCR7c2VsZWN0TmFtZX1gXSkge1xyXG4gICAgICAgICAgdGhpcy5WYWx1ZSA9IG51bGw7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuVmFsdWUgPSBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGlkOiByZXRyaWV2ZWRSZWNvcmRbYCR7c2VsZWN0TmFtZX1gXSxcclxuICAgICAgICAgICAgZW50aXR5VHlwZTpcclxuICAgICAgICAgICAgICByZXRyaWV2ZWRSZWNvcmRbXHJcbiAgICAgICAgICAgICAgYCR7c2VsZWN0TmFtZX1ATWljcm9zb2Z0LkR5bmFtaWNzLkNSTS5sb29rdXBsb2dpY2FsbmFtZWBcclxuICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICBuYW1lOiByZXRyaWV2ZWRSZWNvcmRbXHJcbiAgICAgICAgICAgICAgYCR7c2VsZWN0TmFtZX1AT0RhdGEuQ29tbXVuaXR5LkRpc3BsYXkuVjEuRm9ybWF0dGVkVmFsdWVgXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF07XHJcbiAgICAgIH1cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFJldHJpZXZlcyBhbiBlbnRpdHkgcmVjb3JkLlxyXG4gICAgICAgKiBAcGFyYW0gb3B0aW9ucyAoT3B0aW9uYWwpIE9EYXRhIHN5c3RlbSBxdWVyeSBvcHRpb25zLCAkc2VsZWN0IGFuZCAkZXhwYW5kLCB0byByZXRyaWV2ZSB5b3VyIGRhdGEuXHJcbiAgICAgICAqIC0gVXNlIHRoZSAkc2VsZWN0IHN5c3RlbSBxdWVyeSBvcHRpb24gdG8gbGltaXQgdGhlIHByb3BlcnRpZXMgcmV0dXJuZWQgYnkgaW5jbHVkaW5nIGEgY29tbWEtc2VwYXJhdGVkXHJcbiAgICAgICAqICAgbGlzdCBvZiBwcm9wZXJ0eSBuYW1lcy4gVGhpcyBpcyBhbiBpbXBvcnRhbnQgcGVyZm9ybWFuY2UgYmVzdCBwcmFjdGljZS4gSWYgcHJvcGVydGllcyBhcmVu4oCZdFxyXG4gICAgICAgKiAgIHNwZWNpZmllZCB1c2luZyAkc2VsZWN0LCBhbGwgcHJvcGVydGllcyB3aWxsIGJlIHJldHVybmVkLlxyXG4gICAgICAgKiAtIFVzZSB0aGUgJGV4cGFuZCBzeXN0ZW0gcXVlcnkgb3B0aW9uIHRvIGNvbnRyb2wgd2hhdCBkYXRhIGZyb20gcmVsYXRlZCBlbnRpdGllcyBpcyByZXR1cm5lZC4gSWYgeW91XHJcbiAgICAgICAqICAganVzdCBpbmNsdWRlIHRoZSBuYW1lIG9mIHRoZSBuYXZpZ2F0aW9uIHByb3BlcnR5LCB5b3XigJlsbCByZWNlaXZlIGFsbCB0aGUgcHJvcGVydGllcyBmb3IgcmVsYXRlZFxyXG4gICAgICAgKiAgIHJlY29yZHMuIFlvdSBjYW4gbGltaXQgdGhlIHByb3BlcnRpZXMgcmV0dXJuZWQgZm9yIHJlbGF0ZWQgcmVjb3JkcyB1c2luZyB0aGUgJHNlbGVjdCBzeXN0ZW0gcXVlcnlcclxuICAgICAgICogICBvcHRpb24gaW4gcGFyZW50aGVzZXMgYWZ0ZXIgdGhlIG5hdmlnYXRpb24gcHJvcGVydHkgbmFtZS4gVXNlIHRoaXMgZm9yIGJvdGggc2luZ2xlLXZhbHVlZCBhbmRcclxuICAgICAgICogICBjb2xsZWN0aW9uLXZhbHVlZCBuYXZpZ2F0aW9uIHByb3BlcnRpZXMuXHJcbiAgICAgICAqIC0gWW91IGNhbiBhbHNvIHNwZWNpZnkgbXVsdGlwbGUgcXVlcnkgb3B0aW9ucyBieSB1c2luZyAmIHRvIHNlcGFyYXRlIHRoZSBxdWVyeSBvcHRpb25zLlxyXG4gICAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5vcHRpb25zIGV4YW1wbGU6PC9jYXB0aW9uPlxyXG4gICAgICAgKiBvcHRpb25zOiAkc2VsZWN0PW5hbWUmJGV4cGFuZD1wcmltYXJ5Y29udGFjdGlkKCRzZWxlY3Q9Y29udGFjdGlkLGZ1bGxuYW1lKVxyXG4gICAgICAgKiBAcmV0dXJucyBPbiBzdWNjZXNzLCByZXR1cm5zIGEgcHJvbWlzZSBjb250YWluaW5nIGEgSlNPTiBvYmplY3Qgd2l0aCB0aGUgcmV0cmlldmVkIGF0dHJpYnV0ZXMgYW5kIHRoZWlyIHZhbHVlcy5cclxuICAgICAgICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kb2NzLm1pY3Jvc29mdC5jb20vZW4tdXMvZHluYW1pY3MzNjUvY3VzdG9tZXItZW5nYWdlbWVudC9kZXZlbG9wZXIvY2xpZW50YXBpL3JlZmVyZW5jZS94cm0td2ViYXBpL3JldHJpZXZlcmVjb3JkIEV4dGVybmFsIExpbms6IHJldHJpZXZlUmVjb3JkIChDbGllbnQgQVBJIHJlZmVyZW5jZSl9XHJcbiAgICAgICAqL1xyXG4gICAgICBhc3luYyByZXRyaWV2ZShvcHRpb25zOiBzdHJpbmcpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgaWYgKCF0aGlzLklkIHx8ICF0aGlzLkVudGl0eVR5cGUpIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgY29uc3QgcmVjb3JkID0gYXdhaXQgWHJtLldlYkFwaS5yZXRyaWV2ZVJlY29yZChcclxuICAgICAgICAgICAgdGhpcy5FbnRpdHlUeXBlLFxyXG4gICAgICAgICAgICB0aGlzLklkLFxyXG4gICAgICAgICAgICBvcHRpb25zXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgcmV0dXJuIHJlY29yZDtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEFkZHMgYW4gYWRkaXRpb25hbCBjdXN0b20gZmlsdGVyIHRvIHRoZSBsb29rdXAsIHdpdGggdGhlIFwiQU5EXCIgZmlsdGVyIG9wZXJhdG9yLlxyXG4gICAgICAgKiBAcGFyYW0gZmlsdGVyIFNwZWNpZmllcyB0aGUgZmlsdGVyLCBhcyBhIHNlcmlhbGl6ZWQgRmV0Y2hYTUwgXCJmaWx0ZXJcIiBub2RlLlxyXG4gICAgICAgKiBAcGFyYW0gZW50aXR5TG9naWNhbE5hbWUgKE9wdGlvbmFsKSBUaGUgbG9naWNhbCBuYW1lIG9mIHRoZSBlbnRpdHkuXHJcbiAgICAgICAqIEByZW1hcmtzICAgICBJZiBlbnRpdHlMb2dpY2FsTmFtZSBpcyBub3Qgc3BlY2lmaWVkLCB0aGUgZmlsdGVyIHdpbGwgYmUgYXBwbGllZCB0byBhbGwgZW50aXRpZXNcclxuICAgICAgICogICAgICAgICAgICAgIHZhbGlkIGZvciB0aGUgTG9va3VwIGNvbnRyb2wuXHJcbiAgICAgICAqIEBleGFtcGxlICAgICBFeGFtcGxlIGZpbHRlcjogPGZpbHRlciB0eXBlPVwiYW5kXCI+XHJcbiAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCJhZGRyZXNzMV9jaXR5XCIgb3BlcmF0b3I9XCJlcVwiIHZhbHVlPVwiUmVkbW9uZFwiIC8+XHJcbiAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9maWx0ZXI+XHJcbiAgICAgICAqL1xyXG4gICAgICBhZGRQcmVGaWx0ZXJUb0xvb2t1cChcclxuICAgICAgICBmaWx0ZXJYbWw6IHN0cmluZyxcclxuICAgICAgICBlbnRpdHlMb2dpY2FsTmFtZT86IHN0cmluZ1xyXG4gICAgICApOiB0aGlzIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgX2FkZEN1c3RvbUZpbHRlci5jb250cm9scyA9IHRoaXMuY29udHJvbHM7XHJcbiAgICAgICAgICB0aGlzLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2wpID0+IHtcclxuICAgICAgICAgICAgY29udHJvbC5hZGRQcmVTZWFyY2goX2FkZEN1c3RvbUZpbHRlcik7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMuX2N1c3RvbUZpbHRlcnMucHVzaChfYWRkQ3VzdG9tRmlsdGVyKTtcclxuICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX2FkZEN1c3RvbUZpbHRlcigpIHtcclxuICAgICAgICAgIF9hZGRDdXN0b21GaWx0ZXIuY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT4ge1xyXG4gICAgICAgICAgICBjb250cm9sLmFkZEN1c3RvbUZpbHRlcihmaWx0ZXJYbWwsIGVudGl0eUxvZ2ljYWxOYW1lKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAvKipcclxuICAgICAgICogQGRlcHJlY2F0ZWQgVXNlIHtAbGluayBMb29rdXBGaWVsZC5hZGRDdXN0b21WaWV3fSBpbnN0ZWFkLCB3aGljaCBwcm92aWRlcyBtb3JlIGZsZXhpYmxlIGZpbHRlcmluZyBjYXBhYmlsaXRpZXMgYW5kIGJldHRlciBwZXJmb3JtYW5jZVxyXG4gICAgICAgKiBBZGRzIGFuIGFkZGl0aW9uYWwgY3VzdG9tIGZpbHRlciB0byB0aGUgbG9va3VwLCB3aXRoIHRoZSBcIkFORFwiIGZpbHRlciBvcGVyYXRvci5cclxuICAgICAgICogQHBhcmFtIGVudGl0eUxvZ2ljYWxOYW1lIChPcHRpb25hbCkgVGhlIGxvZ2ljYWwgbmFtZSBvZiB0aGUgZW50aXR5LlxyXG4gICAgICAgKiBAcGFyYW0gcHJpbWFyeUF0dHJpYnV0ZUlkTmFtZSAoT3B0aW9uYWwpIFRoZSBsb2dpY2FsIG5hbWUgb2YgdGhlIHByaW1hcnkga2V5LlxyXG4gICAgICAgKiBAcGFyYW0gZmV0Y2hYbWwgU3BlY2lmaWVzIHRoZSBGZXRjaFhNTCB1c2VkIHRvIGZpbHRlci5cclxuICAgICAgICogQHJlbWFya3MgICAgIElmIGVudGl0eUxvZ2ljYWxOYW1lIGlzIG5vdCBzcGVjaWZpZWQsIHRoZSBmaWx0ZXIgd2lsbCBiZSBhcHBsaWVkIHRvIGFsbCBlbnRpdGllc1xyXG4gICAgICAgKiAgICAgICAgICAgICAgdmFsaWQgZm9yIHRoZSBMb29rdXAgY29udHJvbC5cclxuICAgICAgICogQGV4YW1wbGUgICAgIEV4YW1wbGUgZmV0Y2hYbWw6IDxmZXRjaD5cclxuICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZW50aXR5IG5hbWU9XCJjb250YWN0XCI+XHJcbiAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxmaWx0ZXI+XHJcbiAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwiYWRkcmVzczFfY2l0eVwiIG9wZXJhdG9yPVwiZXFcIiB2YWx1ZT1cIlJlZG1vbmRcIiAvPlxyXG4gICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2ZpbHRlcj5cclxuICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2VudGl0eT5cclxuICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2ZldGNoPlxyXG4gICAgICAgKi9cclxuICAgICAgYXN5bmMgYWRkUHJlRmlsdGVyVG9Mb29rdXBBZHZhbmNlZChcclxuICAgICAgICBlbnRpdHlMb2dpY2FsTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHByaW1hcnlBdHRyaWJ1dGVJZE5hbWU6IHN0cmluZyxcclxuICAgICAgICBmZXRjaFhtbDogc3RyaW5nXHJcbiAgICAgICk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBYcm0uV2ViQXBpLm9ubGluZS5yZXRyaWV2ZU11bHRpcGxlUmVjb3JkcyhcclxuICAgICAgICAgICAgZW50aXR5TG9naWNhbE5hbWUsXHJcbiAgICAgICAgICAgIFwiP2ZldGNoWG1sPVwiICsgZmV0Y2hYbWxcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBjb25zdCBkYXRhID0gcmVzdWx0LmVudGl0aWVzO1xyXG4gICAgICAgICAgbGV0IGZpbHRlcmVkRW50aXRpZXMgPSBcIlwiO1xyXG4gICAgICAgICAgX2FkZEN1c3RvbUZpbHRlci5jb250cm9scyA9IHRoaXMuY29udHJvbHM7XHJcbiAgICAgICAgICBkYXRhLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgZmlsdGVyZWRFbnRpdGllcyArPSBgPHZhbHVlPiR7aXRlbVtwcmltYXJ5QXR0cmlidXRlSWROYW1lXX08L3ZhbHVlPmA7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGZldGNoWG1sID0gZmlsdGVyZWRFbnRpdGllc1xyXG4gICAgICAgICAgICA/IGA8ZmlsdGVyPjxjb25kaXRpb24gYXR0cmlidXRlPScke3ByaW1hcnlBdHRyaWJ1dGVJZE5hbWV9JyBvcGVyYXRvcj0naW4nPiR7ZmlsdGVyZWRFbnRpdGllc308L2NvbmRpdGlvbj48L2ZpbHRlcj5gXHJcbiAgICAgICAgICAgIDogYDxmaWx0ZXI+PGNvbmRpdGlvbiBhdHRyaWJ1dGU9JyR7cHJpbWFyeUF0dHJpYnV0ZUlkTmFtZX0nIG9wZXJhdG9yPSdudWxsJy8+PC9maWx0ZXI+YDtcclxuICAgICAgICAgIHRoaXMuY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT4ge1xyXG4gICAgICAgICAgICBjb250cm9sLmFkZFByZVNlYXJjaChfYWRkQ3VzdG9tRmlsdGVyKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5fY3VzdG9tRmlsdGVycy5wdXNoKF9hZGRDdXN0b21GaWx0ZXIpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBfYWRkQ3VzdG9tRmlsdGVyKCkge1xyXG4gICAgICAgICAgX2FkZEN1c3RvbUZpbHRlci5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnRyb2wuYWRkQ3VzdG9tRmlsdGVyKGZldGNoWG1sLCBlbnRpdHlMb2dpY2FsTmFtZSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEFkZHMgYSBjdXN0b20gdmlldyB0byBmaWx0ZXIgdGhlIGxvb2t1cCB1c2luZyBGZXRjaFhNTFxyXG4gICAgICAgKiBPbmx5IHdvcmtzIGZvciBvbmUgdGFibGUgYXQgYSB0aW1lLCBjYW5ub3QgYWRkIHZpZXdzIGZvciBtdWx0aXBsZSB0YWJsZXMgYXQgdGhlIHNhbWUgdGltZVxyXG4gICAgICAgKiBAcGFyYW0gZmV0Y2hYbWwgVGhlIGNvbXBsZXRlIEZldGNoWE1MIHF1ZXJ5IGluY2x1ZGluZyBmaWx0ZXJpbmcgY29uZGl0aW9uc1xyXG4gICAgICAgKiBAcmV0dXJucyBUaGUgTG9va3VwRmllbGQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xyXG4gICAgICAgKi9cclxuICAgICAgYWRkQ3VzdG9tVmlldyhmZXRjaFhtbDogc3RyaW5nKTogdGhpcyB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGlmICghZmV0Y2hYbWwpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmV0Y2hYTUwgaXMgcmVxdWlyZWRcIik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zdCB0YXJnZXRFbnRpdHkgPSB0aGlzLmV4dHJhY3RFbnRpdHlGcm9tRmV0Y2hYbWwoZmV0Y2hYbWwpO1xyXG4gICAgICAgICAgY29uc3QgbGF5b3V0WG1sID0gdGhpcy5nZW5lcmF0ZUxheW91dFhtbChmZXRjaFhtbCk7XHJcblxyXG4gICAgICAgICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnRyb2wuYWRkQ3VzdG9tVmlldyhcclxuICAgICAgICAgICAgICB0aGlzLnZpZXdJZCxcclxuICAgICAgICAgICAgICB0YXJnZXRFbnRpdHksXHJcbiAgICAgICAgICAgICAgXCJGaWx0ZXJlZCBWaWV3XCIsXHJcbiAgICAgICAgICAgICAgZmV0Y2hYbWwsXHJcbiAgICAgICAgICAgICAgbGF5b3V0WG1sLFxyXG4gICAgICAgICAgICAgIHRydWVcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogRXh0cmFjdHMgZW50aXR5IG5hbWUgZnJvbSBmZXRjaFhtbFxyXG4gICAgICAgKi9cclxuICAgICAgcHJpdmF0ZSBleHRyYWN0RW50aXR5RnJvbUZldGNoWG1sKGZldGNoWG1sOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IG1hdGNoID0gZmV0Y2hYbWwubWF0Y2goLzxlbnRpdHkuKj9uYW1lPVsnXCJdKC4qPylbJ1wiXS8pO1xyXG4gICAgICAgIGlmICghbWF0Y2gpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBleHRyYWN0IGVudGl0eSBuYW1lIGZyb20gZmV0Y2hYbWxcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBtYXRjaFsxXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEdlbmVyYXRlcyBsYXlvdXRYbWwgYmFzZWQgb24gZmV0Y2hYbWwgYXR0cmlidXRlc1xyXG4gICAgICAgKi9cclxuICAgICAgcHJpdmF0ZSBnZW5lcmF0ZUxheW91dFhtbChmZXRjaFhtbDogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBhdHRyaWJ1dGVzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgIGNvbnN0IHJlZ2V4ID0gLzxhdHRyaWJ1dGUuKj9uYW1lPVsnXCJdKC4qPylbJ1wiXS9nO1xyXG4gICAgICAgIGxldCBtYXRjaDtcclxuXHJcbiAgICAgICAgLy8gR2V0IHVwIHRvIDMgbm9uLWlkIGF0dHJpYnV0ZXNcclxuICAgICAgICB3aGlsZSAoXHJcbiAgICAgICAgICAobWF0Y2ggPSByZWdleC5leGVjKGZldGNoWG1sKSkgIT09IG51bGwgJiZcclxuICAgICAgICAgIGF0dHJpYnV0ZXMubGVuZ3RoIDwgM1xyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgaWYgKCFtYXRjaFsxXS5lbmRzV2l0aChcImlkXCIpKSB7XHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZXMucHVzaChtYXRjaFsxXSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiB3ZSBkaWRuJ3QgZ2V0IGFueSBhdHRyaWJ1dGVzLCB0cnkgdG8gZ2V0IHRoZSBmaXJzdCBhdHRyaWJ1dGUgZXZlbiBpZiBpdCdzIGFuIElEXHJcbiAgICAgICAgaWYgKGF0dHJpYnV0ZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICBjb25zdCBmaXJzdE1hdGNoID0gcmVnZXguZXhlYyhmZXRjaFhtbCk7XHJcbiAgICAgICAgICBhdHRyaWJ1dGVzLnB1c2goZmlyc3RNYXRjaCA/IGZpcnN0TWF0Y2hbMV0gOiBcIm5hbWVcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBHZW5lcmF0ZSBjZWxscyBiYXNlZCBvbiBhdmFpbGFibGUgYXR0cmlidXRlc1xyXG4gICAgICAgIGNvbnN0IGNlbGxzID0gYXR0cmlidXRlc1xyXG4gICAgICAgICAgLm1hcCgoYXR0ciwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgd2lkdGggPSBpbmRleCA9PT0gMCA/IDIwMCA6IDEwMDtcclxuICAgICAgICAgICAgcmV0dXJuIGA8Y2VsbCBuYW1lPScke2F0dHJ9JyB3aWR0aD0nJHt3aWR0aH0nIC8+YDtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAuam9pbihcIlxcbiAgICAgICAgXCIpO1xyXG5cclxuICAgICAgICByZXR1cm4gYDxncmlkIG5hbWU9J3Jlc3VsdHNldCcgb2JqZWN0PScxJyBqdW1wPScke2F0dHJpYnV0ZXNbMF19JyBzZWxlY3Q9JzEnIGljb249JzEnIHByZXZpZXc9JzEnPlxyXG4gICAgICA8cm93IG5hbWU9J3Jlc3VsdCcgaWQ9JyR7YXR0cmlidXRlc1swXX0nPlxyXG4gICAgICAgICR7Y2VsbHN9XHJcbiAgICAgIDwvcm93PlxyXG4gICAgPC9ncmlkPmA7XHJcbiAgICAgIH1cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFJlbW92ZXMgYWxsIGZpbHRlcnMgc2V0IG9uIHRoZSBjdXJyZW50IGxvb2t1cCBhdHRyaWJ1dGUgYnkgdXNpbmcgYWRkUHJlRmlsdGVyVG9Mb29rdXAgb3IgYWRkUHJlRmlsdGVyVG9Mb29rdXBBZHZhbmNlZFxyXG4gICAgICAgKi9cclxuICAgICAgY2xlYXJQcmVGaWx0ZXJGcm9tTG9va3VwKCk6IHRoaXMge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICB0aGlzLl9jdXN0b21GaWx0ZXJzLmZvckVhY2goXHJcbiAgICAgICAgICAgIChjdXN0b21GaWx0ZXI6IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXIpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2wpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnRyb2wucmVtb3ZlUHJlU2VhcmNoKGN1c3RvbUZpbHRlcik7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHR5cGUgT3B0aW9uVmFsdWVzID0ge1xyXG4gICAgICBba2V5OiBzdHJpbmddOiBudW1iZXI7XHJcbiAgICB9O1xyXG4gICAgZXhwb3J0IGNsYXNzIE9wdGlvbnNldEZpZWxkPE9wdGlvbnMgZXh0ZW5kcyBPcHRpb25WYWx1ZXM+XHJcbiAgICAgIGV4dGVuZHMgRmllbGRcclxuICAgICAgaW1wbGVtZW50cyBYcm0uQXR0cmlidXRlcy5PcHRpb25TZXRBdHRyaWJ1dGUge1xyXG4gICAgICBwcm90ZWN0ZWQgZGVjbGFyZSBfYXR0cmlidXRlOiBYcm0uQXR0cmlidXRlcy5PcHRpb25TZXRBdHRyaWJ1dGU7XHJcbiAgICAgIHByb3RlY3RlZCBfY29udHJvbCE6IFhybS5Db250cm9scy5PcHRpb25TZXRDb250cm9sO1xyXG4gICAgICBPcHRpb246IE9wdGlvbnM7XHJcbiAgICAgIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgb3B0aW9uPzogT3B0aW9ucykge1xyXG4gICAgICAgIHN1cGVyKGF0dHJpYnV0ZU5hbWUpO1xyXG4gICAgICAgIHRoaXMuT3B0aW9uID0gb3B0aW9uO1xyXG4gICAgICB9XHJcbiAgICAgIGdldEZvcm1hdCgpOiBYcm0uQXR0cmlidXRlcy5PcHRpb25TZXRBdHRyaWJ1dGVGb3JtYXQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRGb3JtYXQoKSBhcyBYcm0uQXR0cmlidXRlcy5PcHRpb25TZXRBdHRyaWJ1dGVGb3JtYXQ7XHJcbiAgICAgIH1cclxuICAgICAgZ2V0T3B0aW9uKHZhbHVlOiBudW1iZXIgfCBzdHJpbmcpOiBYcm0uT3B0aW9uU2V0VmFsdWUge1xyXG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRPcHRpb24odmFsdWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0T3B0aW9uKHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZ2V0T3B0aW9ucygpOiBYcm0uT3B0aW9uU2V0VmFsdWVbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldE9wdGlvbnMoKTtcclxuICAgICAgfVxyXG4gICAgICBnZXRTZWxlY3RlZE9wdGlvbigpOiBYcm0uT3B0aW9uU2V0VmFsdWUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRTZWxlY3RlZE9wdGlvbigpO1xyXG4gICAgICB9XHJcbiAgICAgIGdldFRleHQoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0VGV4dCgpO1xyXG4gICAgICB9XHJcbiAgICAgIGdldEluaXRpYWxWYWx1ZSgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRJbml0aWFsVmFsdWUoKTtcclxuICAgICAgfVxyXG4gICAgICBnZXQgQXR0cmlidXRlKCkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5fYXR0cmlidXRlID8/PVxyXG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUodGhpcy5OYW1lKSA/P1xyXG4gICAgICAgICAgWHJtRXgudGhyb3dFcnJvcihgRmllbGQgJyR7dGhpcy5OYW1lfScgZG9lcyBub3QgZXhpc3RgKSk7XHJcbiAgICAgIH1cclxuICAgICAgZ2V0IGNvbnRyb2xzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5jb250cm9scztcclxuICAgICAgfVxyXG4gICAgICBnZXQgY29udHJvbCgpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuX2NvbnRyb2wgPz89XHJcbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmdldENvbnRyb2wodGhpcy5OYW1lKSA/P1xyXG4gICAgICAgICAgWHJtRXgudGhyb3dFcnJvcihgQ29udHJvbCAnJHt0aGlzLk5hbWV9JyBkb2VzIG5vdCBleGlzdGApKTtcclxuICAgICAgfVxyXG4gICAgICBnZXQgVmFsdWUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0VmFsdWUoKTtcclxuICAgICAgfVxyXG4gICAgICBzZXQgVmFsdWUodmFsdWU6IGtleW9mIE9wdGlvbnMgfCBudW1iZXIpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09IFwibnVtYmVyXCIpIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKHZhbHVlKTtcclxuICAgICAgICBlbHNlIGlmICh2YWx1ZSA9PT0gbnVsbCkgdGhpcy5BdHRyaWJ1dGUuc2V0VmFsdWUobnVsbCk7XHJcbiAgICAgICAgZWxzZSB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh0aGlzLk9wdGlvblt2YWx1ZV0pO1xyXG4gICAgICB9XHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBBZGRzIGFuIG9wdGlvbi5cclxuICAgICAgICpcclxuICAgICAgICogQHBhcmFtIHZhbHVlcyBhbiBhcnJheSB3aXRoIHRoZSBvcHRpb24gdmFsdWVzIHRvIGFkZFxyXG4gICAgICAgKiBAcGFyYW0gaW5kZXggKE9wdGlvbmFsKSB6ZXJvLWJhc2VkIGluZGV4IG9mIHRoZSBvcHRpb24uXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEByZW1hcmtzIFRoaXMgbWV0aG9kIGRvZXMgbm90IGNoZWNrIHRoYXQgdGhlIHZhbHVlcyB3aXRoaW4gdGhlIG9wdGlvbnMgeW91IGFkZCBhcmUgdmFsaWQuXHJcbiAgICAgICAqICAgICAgICAgIElmIGluZGV4IGlzIG5vdCBwcm92aWRlZCwgdGhlIG5ldyBvcHRpb24gd2lsbCBiZSBhZGRlZCB0byB0aGUgZW5kIG9mIHRoZSBsaXN0LlxyXG4gICAgICAgKi9cclxuICAgICAgYWRkT3B0aW9uKHZhbHVlczogbnVtYmVyW10sIGluZGV4PzogbnVtYmVyKTogdGhpcyB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZXMpKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHZhbHVlcyBpcyBub3QgYW4gQXJyYXk6XFxudmFsdWVzOiAnJHt2YWx1ZXN9J2ApO1xyXG4gICAgICAgICAgY29uc3Qgb3B0aW9uU2V0VmFsdWVzID1cclxuICAgICAgICAgICAgdGhpcy5jb250cm9sLmdldEF0dHJpYnV0ZSgpLmdldE9wdGlvbnMoKSA/PyBbXTtcclxuICAgICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBvcHRpb25TZXRWYWx1ZXMpIHtcclxuICAgICAgICAgICAgaWYgKHZhbHVlcy5pbmNsdWRlcyhlbGVtZW50LnZhbHVlKSkge1xyXG4gICAgICAgICAgICAgIHRoaXMuY29udHJvbC5hZGRPcHRpb24oZWxlbWVudCwgaW5kZXgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFJlbW92ZXMgdGhlIG9wdGlvbiBtYXRjaGluZyB0aGUgdmFsdWUuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUuXHJcbiAgICAgICAqL1xyXG4gICAgICByZW1vdmVPcHRpb24odmFsdWVzOiBudW1iZXJbXSk6IHRoaXMge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWVzKSlcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB2YWx1ZXMgaXMgbm90IGFuIEFycmF5OlxcbnZhbHVlczogJyR7dmFsdWVzfSdgKTtcclxuICAgICAgICAgIGNvbnN0IG9wdGlvblNldFZhbHVlcyA9XHJcbiAgICAgICAgICAgIHRoaXMuY29udHJvbC5nZXRBdHRyaWJ1dGUoKS5nZXRPcHRpb25zKCkgPz8gW107XHJcbiAgICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2Ygb3B0aW9uU2V0VmFsdWVzKSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZXMuaW5jbHVkZXMoZWxlbWVudC52YWx1ZSkpIHtcclxuICAgICAgICAgICAgICB0aGlzLmNvbnRyb2wucmVtb3ZlT3B0aW9uKGVsZW1lbnQudmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgLyoqXHJcbiAgICAgICAqIENsZWFycyBhbGwgb3B0aW9ucy5cclxuICAgICAgICovXHJcbiAgICAgIGNsZWFyT3B0aW9ucygpOiB0aGlzIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgdGhpcy5jb250cm9sLmNsZWFyT3B0aW9ucygpO1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBleHBvcnQgY2xhc3MgU2VjdGlvbiBpbXBsZW1lbnRzIFhybS5Db250cm9scy5TZWN0aW9uIHtcclxuICAgICAgcHVibGljIHJlYWRvbmx5IE5hbWUhOiBzdHJpbmc7XHJcbiAgICAgIHByb3RlY3RlZCBfc2VjdGlvbj86IFhybS5Db250cm9scy5TZWN0aW9uO1xyXG4gICAgICBwdWJsaWMgcGFyZW50VGFiPzogWHJtLkNvbnRyb2xzLlRhYjtcclxuICAgICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5OYW1lID0gbmFtZTtcclxuICAgICAgfVxyXG4gICAgICBwdWJsaWMgZ2V0IFNlY3Rpb24oKTogWHJtLkNvbnRyb2xzLlNlY3Rpb24ge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5fc2VjdGlvbiA/Pz1cclxuICAgICAgICAgIHRoaXMucGFyZW50VGFiLnNlY3Rpb25zLmdldCh0aGlzLk5hbWUpID8/XHJcbiAgICAgICAgICBYcm1FeC50aHJvd0Vycm9yKFxyXG4gICAgICAgICAgICBgVGhlIHNlY3Rpb24gJyR7dGhpcy5OYW1lfScgd2FzIG5vdCBmb3VuZCBvbiB0aGUgZm9ybS5gXHJcbiAgICAgICAgICApKTtcclxuICAgICAgfVxyXG4gICAgICBnZXROYW1lKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuU2VjdGlvbi5nZXROYW1lKCk7XHJcbiAgICAgIH1cclxuICAgICAgZ2V0UGFyZW50KCk6IFhybS5Db250cm9scy5UYWIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLlNlY3Rpb24uZ2V0UGFyZW50KCk7XHJcbiAgICAgIH1cclxuICAgICAgY29udHJvbHM6IFhybS5Db2xsZWN0aW9uLkl0ZW1Db2xsZWN0aW9uPFhybS5Db250cm9scy5Db250cm9sPjtcclxuICAgICAgc2V0VmlzaWJsZSh2aXNpYmxlOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuU2VjdGlvbi5zZXRWaXNpYmxlKHZpc2libGUpO1xyXG4gICAgICB9XHJcbiAgICAgIGdldFZpc2libGUoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuU2VjdGlvbi5nZXRWaXNpYmxlKCk7XHJcbiAgICAgIH1cclxuICAgICAgZ2V0TGFiZWwoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5TZWN0aW9uLmdldExhYmVsKCk7XHJcbiAgICAgIH1cclxuICAgICAgc2V0TGFiZWwobGFiZWw6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLlNlY3Rpb24uc2V0TGFiZWwobGFiZWwpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0eXBlIFRhYlNlY3Rpb25zID0ge1xyXG4gICAgICBba2V5OiBzdHJpbmddOiBTZWN0aW9uO1xyXG4gICAgfTtcclxuICAgIGV4cG9ydCBjbGFzcyBUYWI8U2VjdGlvbnMgZXh0ZW5kcyBUYWJTZWN0aW9ucz4gaW1wbGVtZW50cyBYcm0uQ29udHJvbHMuVGFiIHtcclxuICAgICAgcHVibGljIHJlYWRvbmx5IE5hbWUhOiBzdHJpbmc7XHJcbiAgICAgIHByb3RlY3RlZCBfdGFiPzogWHJtLkNvbnRyb2xzLlRhYjtcclxuICAgICAgU2VjdGlvbjogU2VjdGlvbnM7XHJcbiAgICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgc2VjdGlvbj86IFNlY3Rpb25zKSB7XHJcbiAgICAgICAgdGhpcy5OYW1lID0gbmFtZTtcclxuICAgICAgICB0aGlzLlNlY3Rpb24gPSBzZWN0aW9uO1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBzZWN0aW9uKSB7XHJcbiAgICAgICAgICBzZWN0aW9uW2tleV0ucGFyZW50VGFiID0gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZ2V0IHNlY3Rpb25zKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLlRhYi5zZWN0aW9ucztcclxuICAgICAgfVxyXG4gICAgICBwdWJsaWMgZ2V0IFRhYigpOiBYcm0uQ29udHJvbHMuVGFiIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuX3RhYiA/Pz1cclxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQudWkudGFicy5nZXQodGhpcy5OYW1lKSA/P1xyXG4gICAgICAgICAgWHJtRXgudGhyb3dFcnJvcihcclxuICAgICAgICAgICAgYFRoZSB0YWIgJyR7dGhpcy5OYW1lfScgd2FzIG5vdCBmb3VuZCBvbiB0aGUgZm9ybS5gXHJcbiAgICAgICAgICApKTtcclxuICAgICAgfVxyXG4gICAgICBhZGRUYWJTdGF0ZUNoYW5nZShoYW5kbGVyOiBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyKTogdm9pZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuVGFiLmFkZFRhYlN0YXRlQ2hhbmdlKGhhbmRsZXIpO1xyXG4gICAgICB9XHJcbiAgICAgIGdldERpc3BsYXlTdGF0ZSgpOiBYcm0uRGlzcGxheVN0YXRlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5UYWIuZ2V0RGlzcGxheVN0YXRlKCk7XHJcbiAgICAgIH1cclxuICAgICAgZ2V0TmFtZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLlRhYi5nZXROYW1lKCk7XHJcbiAgICAgIH1cclxuICAgICAgZ2V0UGFyZW50KCk6IFhybS5VaSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuVGFiLmdldFBhcmVudCgpO1xyXG4gICAgICB9XHJcbiAgICAgIHJlbW92ZVRhYlN0YXRlQ2hhbmdlKGhhbmRsZXI6IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXIpOiB2b2lkIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5UYWIucmVtb3ZlVGFiU3RhdGVDaGFuZ2UoaGFuZGxlcik7XHJcbiAgICAgIH1cclxuICAgICAgc2V0RGlzcGxheVN0YXRlKGRpc3BsYXlTdGF0ZTogWHJtLkRpc3BsYXlTdGF0ZSk6IHZvaWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLlRhYi5zZXREaXNwbGF5U3RhdGUoZGlzcGxheVN0YXRlKTtcclxuICAgICAgfVxyXG4gICAgICBzZXRWaXNpYmxlKHZpc2libGU6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5UYWIuc2V0VmlzaWJsZSh2aXNpYmxlKTtcclxuICAgICAgfVxyXG4gICAgICBnZXRWaXNpYmxlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLlRhYi5nZXRWaXNpYmxlKCk7XHJcbiAgICAgIH1cclxuICAgICAgZ2V0TGFiZWwoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5UYWIuZ2V0TGFiZWwoKTtcclxuICAgICAgfVxyXG4gICAgICBzZXRMYWJlbChsYWJlbDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuVGFiLnNldExhYmVsKGxhYmVsKTtcclxuICAgICAgfVxyXG4gICAgICBzZXRGb2N1cygpOiB2b2lkIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5UYWIuc2V0Rm9jdXMoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZXhwb3J0IGNsYXNzIEdyaWRDb250cm9sIGltcGxlbWVudHMgWHJtLkNvbnRyb2xzLkdyaWRDb250cm9sIHtcclxuICAgICAgcHVibGljIHJlYWRvbmx5IE5hbWUhOiBzdHJpbmc7XHJcbiAgICAgIHByb3RlY3RlZCBfZ3JpZENvbnRyb2w/OiBYcm0uQ29udHJvbHMuR3JpZENvbnRyb2w7XHJcbiAgICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuTmFtZSA9IG5hbWU7XHJcbiAgICAgIH1cclxuICAgICAgcHVibGljIGdldCBHcmlkQ29udHJvbCgpOiBYcm0uQ29udHJvbHMuR3JpZENvbnRyb2wge1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAodGhpcy5fZ3JpZENvbnRyb2wgPz89XHJcbiAgICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZ2V0Q29udHJvbDxYcm0uQ29udHJvbHMuR3JpZENvbnRyb2w+KHRoaXMuTmFtZSkpID8/XHJcbiAgICAgICAgICBYcm1FeC50aHJvd0Vycm9yKGBUaGUgZ3JpZCAnJHt0aGlzLk5hbWV9JyB3YXMgbm90IGZvdW5kIG9uIHRoZSBmb3JtLmApXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICBwdWJsaWMgZ2V0IEdyaWQoKTogWHJtLkNvbnRyb2xzLkdyaWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmdldEdyaWQoKTtcclxuICAgICAgfVxyXG4gICAgICBhZGRPbkxvYWQoaGFuZGxlcjogWHJtLkV2ZW50cy5HcmlkQ29udHJvbC5Mb2FkRXZlbnRIYW5kbGVyKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5HcmlkQ29udHJvbC5yZW1vdmVPbkxvYWQoaGFuZGxlciBhcyBhbnkpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmFkZE9uTG9hZChoYW5kbGVyKTtcclxuICAgICAgfVxyXG4gICAgICBnZXRDb250ZXh0VHlwZSgpOiBYcm1FbnVtLkdyaWRDb250cm9sQ29udGV4dCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0Q29udGV4dFR5cGUoKTtcclxuICAgICAgfVxyXG4gICAgICBnZXRFbnRpdHlOYW1lKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0RW50aXR5TmFtZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIGdldEZldGNoWG1sKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0RmV0Y2hYbWwoKTtcclxuICAgICAgfVxyXG4gICAgICBnZXRHcmlkKCk6IFhybS5Db250cm9scy5HcmlkIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRHcmlkKCk7XHJcbiAgICAgIH1cclxuICAgICAgZ2V0UmVsYXRpb25zaGlwKCk6IFhybS5Db250cm9scy5HcmlkUmVsYXRpb25zaGlwIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRSZWxhdGlvbnNoaXAoKTtcclxuICAgICAgfVxyXG4gICAgICBnZXRVcmwoY2xpZW50PzogWHJtRW51bS5HcmlkQ2xpZW50KTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRVcmwoY2xpZW50KTtcclxuICAgICAgfVxyXG4gICAgICBnZXRWaWV3U2VsZWN0b3IoKTogWHJtLkNvbnRyb2xzLlZpZXdTZWxlY3RvciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0Vmlld1NlbGVjdG9yKCk7XHJcbiAgICAgIH1cclxuICAgICAgb3BlblJlbGF0ZWRHcmlkKCk6IHZvaWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLm9wZW5SZWxhdGVkR3JpZCgpO1xyXG4gICAgICB9XHJcbiAgICAgIHJlZnJlc2goKTogdm9pZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wucmVmcmVzaCgpO1xyXG4gICAgICB9XHJcbiAgICAgIHJlZnJlc2hSaWJib24oKTogdm9pZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wucmVmcmVzaFJpYmJvbigpO1xyXG4gICAgICB9XHJcbiAgICAgIHJlbW92ZU9uTG9hZChoYW5kbGVyOiAoKSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wucmVtb3ZlT25Mb2FkKGhhbmRsZXIpO1xyXG4gICAgICB9XHJcbiAgICAgIGdldENvbnRyb2xUeXBlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0Q29udHJvbFR5cGUoKTtcclxuICAgICAgfVxyXG4gICAgICBnZXROYW1lKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0TmFtZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIGdldFBhcmVudCgpOiBYcm0uQ29udHJvbHMuU2VjdGlvbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0UGFyZW50KCk7XHJcbiAgICAgIH1cclxuICAgICAgZ2V0TGFiZWwoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRMYWJlbCgpO1xyXG4gICAgICB9XHJcbiAgICAgIHNldExhYmVsKGxhYmVsOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5zZXRMYWJlbChsYWJlbCk7XHJcbiAgICAgIH1cclxuICAgICAgZ2V0VmlzaWJsZSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRWaXNpYmxlKCk7XHJcbiAgICAgIH1cclxuICAgICAgc2V0VmlzaWJsZSh2aXNpYmxlOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuc2V0VmlzaWJsZSh2aXNpYmxlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=