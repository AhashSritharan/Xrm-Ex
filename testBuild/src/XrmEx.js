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
     * Retrieves the error message from an error object.
     * @param error - The error object to retrieve the message from.
     * @returns The error message.
     */
    function getErrorMessage(error) {
        let msg = error, seen = new Set(), depth = 0;
        const validJSON = (t) => {
            try {
                JSON.parse(t);
                return true;
            }
            catch {
                return false;
            }
        };
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
            if (typeof msg === "string" && validJSON(msg)) {
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
                errorCode: error?.errorCode,
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
            Fields;
            constructor(attribute, fields) {
                super(attribute);
                this.Fields = fields ?? {};
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
             * Gets the embedded form data entity context
             * @returns The entity context of the embedded form or null if not loaded
             */
            get Data() {
                try {
                    // Find the first loaded control
                    let control = null;
                    this.controls.forEach((c) => {
                        if (c?.isLoaded && !control) {
                            control = c;
                        }
                    });
                    if (!control || !control.isLoaded())
                        return null;
                    const entityData = control.data.entity;
                    // Create a proxy to access fields directly
                    const fieldsProxy = new Proxy(entityData, {
                        get: (target, prop) => {
                            if (prop === "attributes") {
                                return target.attributes;
                            }
                            if (this.Fields[prop]) {
                                const field = this.Fields[prop];
                                // Set the field's attribute from the embedded form
                                field._attribute = target.attributes.get(field.Name);
                                return field;
                            }
                            return target[prop];
                        },
                    });
                    return fieldsProxy;
                }
                catch (error) {
                    throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
                }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWHJtRXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvWHJtRXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsOERBQThEO0FBa0M5RCxNQUFNLEtBQVcsS0FBSyxDQXFyRXJCO0FBcnJFRCxXQUFpQixLQUFLO0lBQ3BCOzs7O09BSUc7SUFDSCxTQUFnQixVQUFVLENBQUMsWUFBb0I7UUFDN0MsTUFBTSxJQUFJLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRmUsZ0JBQVUsYUFFekIsQ0FBQTtJQUNEOzs7T0FHRztJQUNILFNBQWdCLGVBQWU7UUFDN0IsSUFBSTtZQUNGLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7WUFDMUIsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUN2RSxNQUFNLG1CQUFtQixHQUN2QixVQUFVLElBQUksVUFBVSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQ25FLE1BQU0saUJBQWlCLEdBQ3JCLG1CQUFtQixFQUFFLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQztnQkFDaEQsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzlDLE1BQU0sWUFBWSxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBRW5FLE9BQU8sWUFBWSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxLQUFVLEVBQUU7WUFDbkIsTUFBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7U0FDN0Q7SUFDSCxDQUFDO0lBZmUscUJBQWUsa0JBZTlCLENBQUE7SUFDRDs7OztPQUlHO0lBQ0gsU0FBZ0IsZUFBZSxDQUFDLEtBQVU7UUFDeEMsSUFBSSxHQUFHLEdBQUcsS0FBSyxFQUNiLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBRSxFQUNoQixLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ1osTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFTLEVBQUUsRUFBRTtZQUM5QixJQUFJO2dCQUNGLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2QsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUFDLE1BQU07Z0JBQ04sT0FBTyxLQUFLLENBQUM7YUFDZDtRQUNILENBQUMsQ0FBQztRQUNGLE9BQU8sR0FBRyxJQUFJLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDNUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNkLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRTtnQkFDWCxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQztnQkFDZCxTQUFTO2FBQ1Y7WUFDRCxJQUFJLEdBQUcsQ0FBQyxPQUFPLEVBQUU7Z0JBQ2YsR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUM7Z0JBQ2xCLFNBQVM7YUFDVjtZQUNELElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDN0MsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3RCLFNBQVM7YUFDVjtZQUNELE1BQU07U0FDUDtRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQTdCZSxxQkFBZSxrQkE2QjlCLENBQUE7SUFDRDs7Ozs7O09BTUc7SUFDSSxLQUFLLFVBQVUscUJBQXFCLENBQ3pDLE9BQWUsRUFDZixLQUErQyxFQUMvQyxlQUFlLEdBQUcsS0FBSztRQUV2QixNQUFNLFFBQVEsR0FBRztZQUNmLE9BQU8sRUFBRSxDQUFDO1lBQ1YsS0FBSyxFQUFFLENBQUM7WUFDUixPQUFPLEVBQUUsQ0FBQztZQUNWLElBQUksRUFBRSxDQUFDO1NBQ1IsQ0FBQztRQUNGLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ3RELE1BQU0sWUFBWSxHQUFHO1lBQ25CLElBQUksRUFBRSxDQUFDO1lBQ1AsS0FBSyxFQUFFLFlBQVk7WUFDbkIsT0FBTztZQUNQLGVBQWU7U0FDaEIsQ0FBQztRQUNGLElBQUk7WUFDRixPQUFPLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUMxRDtRQUFDLE9BQU8sS0FBVSxFQUFFO1lBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsU0FBUyxlQUFlLEVBQUUsTUFBTSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztTQUNsRTtJQUNILENBQUM7SUF2QnFCLDJCQUFxQix3QkF1QjFDLENBQUE7SUFDRDs7OztPQUlHO0lBQ0ksS0FBSyxVQUFVLHdCQUF3QixDQUM1QyxRQUFnQjtRQUVoQixJQUFJO1lBQ0YsT0FBTyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDeEQ7UUFBQyxPQUFPLEtBQVUsRUFBRTtZQUNuQixNQUFNLElBQUksS0FBSyxDQUFDLFNBQVMsZUFBZSxFQUFFLE1BQU0sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7U0FDbEU7SUFDSCxDQUFDO0lBUnFCLDhCQUF3QiwyQkFRN0MsQ0FBQTtJQUNEOzs7Ozs7T0FNRztJQUNJLEtBQUssVUFBVSwyQkFBMkIsQ0FDL0MsNkJBQXFDO1FBRXJDLElBQUksUUFBUSxHQUFHLE1BQU0sZUFBZSxDQUFDLGtDQUFrQyxFQUFFO1lBQ3ZFO2dCQUNFLElBQUksRUFBRSxzQkFBc0I7Z0JBQzVCLElBQUksRUFBRSxRQUFRO2dCQUNkLEtBQUssRUFBRSw2QkFBNkI7YUFDckM7U0FDRixDQUFDLENBQUM7UUFDSCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7SUFDdEUsQ0FBQztJQVhxQixpQ0FBMkIsOEJBV2hELENBQUE7SUFDRCxNQUFNLE1BQU0sR0FBRyxDQUFDLEtBQWEsRUFBVyxFQUFFLENBQ3hDLDREQUE0RCxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMzRTs7O09BR0c7SUFDSCxJQUFJLE9BQU8sR0FBRztRQUNaLE1BQU0sRUFBRSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUU7UUFDM0UsT0FBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxrQkFBa0IsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRTtRQUMzRSxPQUFPLEVBQUU7WUFDUCxRQUFRLEVBQUUsYUFBYTtZQUN2QixrQkFBa0IsRUFBRSxDQUFDO1lBQ3JCLE1BQU0sRUFBRSxTQUFTO1NBQ2xCO1FBQ0QsUUFBUSxFQUFFO1lBQ1IsUUFBUSxFQUFFLG9CQUFvQjtZQUM5QixrQkFBa0IsRUFBRSxDQUFDO1lBQ3JCLE1BQU0sRUFBRSxRQUFRO1NBQ2pCO1FBQ0QsZUFBZSxFQUFFO1lBQ2YsUUFBUSxFQUFFLHFCQUFxQjtZQUMvQixrQkFBa0IsRUFBRSxDQUFDO1lBQ3JCLE1BQU0sRUFBRSxRQUFRO1NBQ2pCO1FBQ0QsT0FBTyxFQUFFO1lBQ1AsUUFBUSxFQUFFLGFBQWE7WUFDdkIsa0JBQWtCLEVBQUUsQ0FBQztZQUNyQixNQUFNLEVBQUUsUUFBUTtTQUNqQjtRQUNELE1BQU0sRUFBRTtZQUNOLFFBQVEsRUFBRSxxQkFBcUI7WUFDL0Isa0JBQWtCLEVBQUUsQ0FBQztZQUNyQixNQUFNLEVBQUUsUUFBUTtTQUNqQjtRQUNELGdCQUFnQixFQUFFO1lBQ2hCLFFBQVEsRUFBRSxpQ0FBaUM7WUFDM0Msa0JBQWtCLEVBQUUsQ0FBQztZQUNyQixNQUFNLEVBQUUsUUFBUTtTQUNqQjtRQUNELEtBQUssRUFBRSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUU7UUFDMUUsS0FBSyxFQUFFLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRTtRQUMzRSxRQUFRLEVBQUU7WUFDUixRQUFRLEVBQUUsV0FBVztZQUNyQixrQkFBa0IsRUFBRSxDQUFDO1lBQ3JCLE1BQU0sRUFBRSxRQUFRO1NBQ2pCO0tBQ0YsQ0FBQztJQUNGLFNBQWdCLHFCQUFxQixDQUFDLEtBQVU7UUFDOUMsTUFBTSxJQUFJLEdBQUcsT0FBTyxLQUFLLENBQUM7UUFDMUIsSUFBSSxJQUFJLElBQUksUUFBUSxJQUFJLElBQUksSUFBSSxRQUFRLElBQUksSUFBSSxJQUFJLFNBQVM7WUFBRSxPQUFPLENBQUMsQ0FBQztRQUN4RSxJQUFJLEtBQUssWUFBWSxJQUFJO1lBQUUsT0FBTyxDQUFDLENBQUM7UUFDcEMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ25DLE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQU5lLDJCQUFxQix3QkFNcEMsQ0FBQTtJQUNELFNBQWdCLFdBQVcsQ0FBQyxLQUFVO1FBQ3BDLE1BQU0sSUFBSSxHQUFHLE9BQU8sS0FBSyxDQUFDO1FBQzFCLElBQUksSUFBSSxLQUFLLFFBQVEsRUFBRTtZQUNyQixJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDakIsT0FBTyxxQkFBcUIsQ0FBQzthQUM5QjtZQUNELE9BQU8sWUFBWSxDQUFDO1NBQ3JCO1FBQ0QsSUFBSSxJQUFJLEtBQUssUUFBUTtZQUFFLE9BQU8sV0FBVyxDQUFDLENBQUMsK0JBQStCO1FBQzFFLElBQUksSUFBSSxLQUFLLFNBQVM7WUFBRSxPQUFPLGFBQWEsQ0FBQztRQUM3QyxJQUFJLEtBQUssWUFBWSxJQUFJO1lBQUUsT0FBTyxvQkFBb0IsQ0FBQztRQUN2RCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1lBQUUsT0FBTyxpQ0FBaUMsQ0FBQztRQUNuRSxPQUFPLHFCQUFxQixDQUFDLENBQUMsd0NBQXdDO0lBQ3hFLENBQUM7SUFiZSxpQkFBVyxjQWExQixDQUFBO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQThCRztJQUNILFNBQWdCLGtCQUFrQixDQUNoQyxVQUFrQixFQUNsQixpQkFBOEQsRUFDOUQsYUFBcUIsRUFDckIsV0FBNkI7UUFFN0IsTUFBTSwwQkFBMEIsR0FBRyxDQUNqQyxNQUFtRCxFQUNuRCxFQUFFO1lBQ0YsTUFBTSxtQkFBbUIsR0FBMkIsRUFBRSxDQUFDO1lBQ3ZELE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLE1BQU0sRUFBRSxDQUFDO1lBRTlELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDcEIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO29CQUNsQixtQkFBbUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUc7d0JBQ2hDLFFBQVEsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVE7d0JBQ3RDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsa0JBQWtCO3FCQUMzRCxDQUFDO2dCQUNKLENBQUMsQ0FBQyxDQUFDO2FBQ0o7aUJBQU07Z0JBQ0wsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtvQkFDN0IsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEdBQUc7d0JBQ3pCLGtCQUFrQixFQUFFLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDakQsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7cUJBQzlCLENBQUM7Z0JBQ0osQ0FBQyxDQUFDLENBQUM7YUFDSjtZQUVELE9BQU8sbUJBQW1CLENBQUM7UUFDN0IsQ0FBQyxDQUFDO1FBRUYsTUFBTSxhQUFhLEdBQUcsQ0FDcEIsTUFBbUQsRUFDbkQsVUFBa0MsRUFDbEMsRUFBRTtZQUNGLE1BQU0sUUFBUSxHQUFHO2dCQUNmLGNBQWMsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDN0MsYUFBYSxFQUFFLGFBQWE7Z0JBQzVCLGFBQWEsRUFBRSxVQUFVO2dCQUN6QixjQUFjLEVBQUUsVUFBVTthQUMzQixDQUFDO1lBQ0YsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7Z0JBQ3hDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNsRSxDQUFDLENBQUMsTUFBTSxDQUFDO1lBRVgsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3RFLENBQUMsQ0FBQztRQUNGLElBQUksV0FBVyxFQUFFO1lBQ2YsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEVBQUU7Z0JBQ3BDLGlCQUFpQixDQUFDLElBQUksQ0FBQztvQkFDckIsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsS0FBSyxFQUFFLFdBQVc7b0JBQ2xCLElBQUksRUFBRSxpQkFBaUI7aUJBQ3hCLENBQUMsQ0FBQzthQUNKO2lCQUFNO2dCQUNMLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxHQUFHLFdBQVcsQ0FBQzthQUMzQztTQUNGO1FBRUQsTUFBTSxtQkFBbUIsR0FBRywwQkFBMEIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzFFLE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3RFLE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUE5RGUsd0JBQWtCLHFCQThEakMsQ0FBQTtJQUVEOzs7Ozs7OztPQVFHO0lBQ0ksS0FBSyxVQUFVLE9BQU8sQ0FDM0IsVUFBa0IsRUFDbEIsaUJBQThELEVBQzlELFdBQTZCLEVBQzdCLGdCQUF3QixDQUFDO1FBRXpCLE1BQU0sT0FBTyxHQUFHLGtCQUFrQixDQUNoQyxVQUFVLEVBQ1YsaUJBQWlCLEVBQ2pCLGFBQWEsRUFDYixXQUFXLENBQ1osQ0FBQztRQUNGLE1BQU0sTUFBTSxHQUFHLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3hELElBQUksTUFBTSxDQUFDLEVBQUU7WUFBRSxPQUFPLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQWRxQixhQUFPLFVBYzVCLENBQUE7SUFFRDs7Ozs7OztPQU9HO0lBQ0ksS0FBSyxVQUFVLGFBQWEsQ0FDakMsWUFBb0IsRUFDcEIsaUJBQThDLEVBQzlDLFdBQTZCO1FBRTdCLE9BQU8sTUFBTSxPQUFPLENBQUMsWUFBWSxFQUFFLGlCQUFpQixFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN4RSxDQUFDO0lBTnFCLG1CQUFhLGdCQU1sQyxDQUFBO0lBRUQ7Ozs7Ozs7T0FPRztJQUNJLEtBQUssVUFBVSxlQUFlLENBQ25DLFlBQW9CLEVBQ3BCLGlCQUE4QyxFQUM5QyxXQUE2QjtRQUU3QixPQUFPLE1BQU0sT0FBTyxDQUFDLFlBQVksRUFBRSxpQkFBaUIsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQU5xQixxQkFBZSxrQkFNcEMsQ0FBQTtJQUVEOzs7Ozs7O09BT0c7SUFDSSxLQUFLLFVBQVUsV0FBVyxDQUMvQixZQUFvQixFQUNwQixpQkFBOEMsRUFDOUMsV0FBNkI7UUFFN0IsT0FBTyxNQUFNLE9BQU8sQ0FBQyxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFOcUIsaUJBQVcsY0FNaEMsQ0FBQTtJQUVEOzs7O09BSUc7SUFDSCxTQUFnQixhQUFhLENBQUMsSUFBWTtRQUN4QyxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVE7WUFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsSUFBSSxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3JFLE9BQU8sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUplLG1CQUFhLGdCQUk1QixDQUFBO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsU0FBZ0IsU0FBUyxDQUFJLEVBQVksRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJO1FBQ3pELE9BQU8sSUFBSSxPQUFPLENBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDeEMsTUFBTSxRQUFRLEdBQUcsQ0FBQyxRQUFXLEVBQUUsRUFBRTtnQkFDL0IsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3BCLENBQUMsQ0FBQztZQUNGLElBQUk7Z0JBQ0YsbUVBQW1FO2dCQUNuRSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQzthQUNyQztZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNkLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNmO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBWmUsZUFBUyxZQVl4QixDQUFBO0lBQ0Q7Ozs7O09BS0c7SUFDSSxLQUFLLFVBQVUsZUFBZSxDQUNuQyxLQUFhLEVBQ2IsSUFBWTtRQUVaLElBQUk7WUFDRixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3RDLElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQztZQUN2QixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ25CLElBQUksS0FBSyxHQUFHLFlBQVksQ0FDdEIsR0FBRyxFQUNILDBDQUEwQyxDQUMzQyxDQUFDO2dCQUNGLElBQUksS0FBSyxHQUFHLEdBQUcsRUFBRTtvQkFDZixjQUFjLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQztpQkFDL0I7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUNILE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQzVCLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQ25ELEVBQUUsQ0FDSCxDQUFDO1lBQ0YsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FDcEIsWUFBWSxDQUFDLFVBQVUsRUFBRSwwQ0FBMEMsQ0FBQyxFQUNwRSxJQUFJLENBQ0wsQ0FBQztZQUNGLE1BQU0sTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ3pELE9BQU8sTUFBTSxHQUFHLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FDekM7Z0JBQ0Usa0JBQWtCLEVBQUUsSUFBSTtnQkFDeEIsSUFBSTtnQkFDSixLQUFLO2FBQ04sRUFDRDtnQkFDRSxNQUFNO2dCQUNOLEtBQUs7YUFDTixDQUNGLENBQUM7U0FDSDtRQUFDLE9BQU8sS0FBVSxFQUFFO1lBQ25CLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMsU0FBUyxlQUFlLEVBQUUsTUFBTSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztTQUNsRTtRQUNEOzs7Ozs7O1dBT0c7UUFDSCxTQUFTLFlBQVksQ0FBQyxJQUFZLEVBQUUsSUFBWTtZQUM5QyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hELE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEMsT0FBTyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFDcEIsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxQyxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDdkIsQ0FBQztJQUNILENBQUM7SUF2RHFCLHFCQUFlLGtCQXVEcEMsQ0FBQTtJQUVEOzs7T0FHRztJQUNJLEtBQUssVUFBVSxlQUFlLENBQUMsS0FBVTtRQUM5QyxJQUFJO1lBQ0YsT0FBTyxNQUFNLEdBQUcsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDO2dCQUMxQyxPQUFPLEVBQUUsZUFBZSxDQUFDLEtBQUssQ0FBQztnQkFDL0IsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ3ZDLFNBQVMsRUFBRSxLQUFLLEVBQUUsU0FBUzthQUM1QixDQUFDLENBQUM7U0FDSjtRQUFDLE9BQU8sS0FBVSxFQUFFO1lBQ25CLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMsU0FBUyxlQUFlLEVBQUUsTUFBTSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztTQUNsRTtJQUNILENBQUM7SUFYcUIscUJBQWUsa0JBV3BDLENBQUE7SUFFRCxNQUFhLE9BQU87UUFDbEIsTUFBTSxLQUFLLElBQUk7WUFDYixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN2QyxDQUFDO1FBQ0QsTUFBTSxLQUFLLEVBQUU7WUFDWCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQztRQUNyQyxDQUFDO1FBQ0Q7Ozs7Ozs7OztXQVNHO1FBQ0gsTUFBTSxDQUFDLDJCQUEyQixDQUNoQyxPQUE4QztZQUU5QyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsOEJBQThCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdEUsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsMkJBQTJCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDNUUsQ0FBQztRQUNEOzs7Ozs7Ozs7V0FTRztRQUNILE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxPQUEyQztZQUNwRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDOUQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcEUsQ0FBQztRQUNEOzs7Ozs7Ozs7V0FTRztRQUNILE1BQU0sQ0FBQyx3QkFBd0IsQ0FDN0IsT0FBOEM7WUFFOUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLDJCQUEyQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25FLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLHdCQUF3QixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pFLENBQUM7UUFDRDs7Ozs7Ozs7O1dBU0c7UUFDSCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBMkM7WUFDakUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzNELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2pFLENBQUM7UUFDRDs7Ozs7Ozs7O1dBU0c7UUFDSCxNQUFNLENBQUMsa0JBQWtCLENBQUMsT0FBMkM7WUFDbkUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25FLENBQUM7UUFDRDs7OztXQUlHO1FBQ0gsTUFBTSxDQUFDLDhCQUE4QixDQUNuQyxPQUE4QztZQUU5QyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyw4QkFBOEIsQ0FDakUsT0FBTyxDQUNSLENBQUM7UUFDSixDQUFDO1FBQ0Q7Ozs7V0FJRztRQUNILE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxPQUEyQztZQUN2RSxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2RSxDQUFDO1FBQ0Q7Ozs7V0FJRztRQUNILE1BQU0sQ0FBQywyQkFBMkIsQ0FDaEMsT0FBOEM7WUFFOUMsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsMkJBQTJCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDNUUsQ0FBQztRQUNEOzs7O1dBSUc7UUFDSCxNQUFNLENBQUMsbUJBQW1CLENBQUMsT0FBMkM7WUFDcEUsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcEUsQ0FBQztRQUNEOzs7O1dBSUc7UUFDSCxNQUFNLENBQUMscUJBQXFCLENBQUMsT0FBMkM7WUFDdEUsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdEUsQ0FBQztRQUVEOzs7V0FHRztRQUNILE1BQU0sQ0FBQyxtQkFBbUI7WUFDeEIsT0FBTyxTQUFTLENBQ2QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixFQUNqRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQzlCLENBQUM7UUFDSixDQUFDO1FBQ0Q7OztXQUdHO1FBQ0gsTUFBTSxDQUFDLG1CQUFtQjtZQUN4QixPQUFPLFNBQVMsQ0FDZCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQ2pELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FDOUIsQ0FBQztRQUNKLENBQUM7UUFDRDs7O1dBR0c7UUFDSCxNQUFNLENBQUMsUUFBUTtZQUNiLE9BQU8sU0FBUyxDQUNkLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQ3RDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FDOUIsQ0FBQztRQUNKLENBQUM7UUFDRDs7O1dBR0c7UUFDSCxNQUFNLENBQUMsWUFBWTtZQUNqQixPQUFPLFNBQVMsQ0FDZCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUMxQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQzlCLENBQUM7UUFDSixDQUFDO1FBQ0Q7Ozs7V0FJRztRQUNILE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFpQjtZQUN2QyxPQUFPLFNBQVMsQ0FDZCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQzlDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFDN0IsU0FBUyxDQUNWLENBQUM7UUFDSixDQUFDO1FBQ0Q7Ozs7V0FJRztRQUNILE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxpQkFBeUI7WUFDdkQsT0FBTyxTQUFTLENBQ2QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLHdCQUF3QixFQUN0RCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQzdCLGlCQUFpQixDQUNsQixDQUFDO1FBQ0osQ0FBQztRQUNEOzs7O1dBSUc7UUFDSCxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQWU7WUFDbkMsT0FBTyxTQUFTLENBQ2QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFDNUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUM3QixPQUFPLENBQ1IsQ0FBQztRQUNKLENBQUM7UUFDRDs7OztXQUlHO1FBQ0gsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFxQztZQUNwRCxPQUFPLFNBQVMsQ0FDZCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUN2QyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQzdCLE1BQU0sQ0FDUCxDQUFDO1FBQ0osQ0FBQztLQUNGO0lBeE5ZLGFBQU8sVUF3Tm5CLENBQUE7SUFFRCxNQUFhLE1BQU07UUFDakI7Ozs7V0FJRztRQUNILE1BQU0sQ0FBQyxXQUFXLENBQ2hCLE1BQXFCLEVBQ3JCLE9BQWdEO1lBRWhELE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDdkIsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3QixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFDRDs7O1dBR0c7UUFDSCxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQXFCO1lBQ3ZDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDdkIsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3ZCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUNEOzs7O1dBSUc7UUFDSCxNQUFNLENBQUMsY0FBYyxDQUNuQixNQUFxQixFQUNyQixPQUFnRDtZQUVoRCxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7Z0JBQ3ZCLEtBQUssQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDaEMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0Q7Ozs7V0FJRztRQUNILE1BQU0sQ0FBQyxnQkFBZ0IsQ0FDckIsTUFBcUIsRUFDckIsZ0JBQWlEO1lBRWpELE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDdkIsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDM0MsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0Q7Ozs7OztXQU1HO1FBQ0gsTUFBTSxDQUFDLGFBQWEsQ0FDbEIsTUFBcUIsRUFDckIsVUFBMEI7WUFFMUIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUN2QixLQUFLLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2xDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUNEOzs7OztXQUtHO1FBQ0gsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFxQixFQUFFLEtBQVU7WUFDL0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUN2QixLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUNEOzs7Ozs7V0FNRztRQUNILE1BQU0sQ0FBQyxVQUFVLENBQ2YsTUFBcUIsRUFDckIsT0FBZ0IsRUFDaEIsT0FBZ0I7WUFFaEIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUN2QixLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNyQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFDRDs7OztXQUlHO1FBQ0gsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFxQixFQUFFLFFBQWlCO1lBQ3pELE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDdkIsS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM5QixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFDRDs7OztXQUlHO1FBQ0gsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFxQixFQUFFLFFBQWlCO1lBQ3pELE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDdkIsS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM5QixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFDRDs7OztXQUlHO1FBQ0gsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFxQixFQUFFLE9BQWdCO1lBQ3ZELE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDdkIsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM1QixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFDRDs7Ozs7Ozs7V0FRRztRQUNILE1BQU0sQ0FBQyxlQUFlLENBQ3BCLE1BQXFCLEVBQ3JCLE9BQWUsRUFDZixRQUFnQjtZQUVoQixNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7Z0JBQ3ZCLEtBQUssQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzNDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUNEOzs7V0FHRztRQUNILE1BQU0sQ0FBQyxlQUFlLENBQ3BCLE1BQXFCLEVBQ3JCLE9BQWUsRUFDZixpQkFBNkMsRUFDN0MsUUFBZ0IsRUFDaEIsT0FBa0Q7WUFFbEQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUN2QixLQUFLLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDdkUsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0Q7Ozs7OztXQU1HO1FBQ0gsTUFBTSxDQUFDLGtCQUFrQixDQUFDLE1BQXFCLEVBQUUsUUFBZ0I7WUFDL0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUN2QixLQUFLLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDckMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0tBQ0Y7SUF0S1ksWUFBTSxTQXNLbEIsQ0FBQTtJQUVEOztPQUVHO0lBQ0gsTUFBYSxJQUFJO1FBQ0wsTUFBTSxDQUFDLFlBQVksQ0FBa0I7UUFDckMsTUFBTSxDQUFDLGlCQUFpQixDQUEwQjtRQUM1RCxnQkFBZSxDQUFDO1FBQ2hCLGlEQUFpRDtRQUNqRCxNQUFNLEtBQUssV0FBVztZQUNwQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDM0IsQ0FBQztRQUNELHFEQUFxRDtRQUNyRCxNQUFNLEtBQUssZ0JBQWdCO1lBQ3pCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDO1FBQ2hDLENBQUM7UUFDRCxvREFBb0Q7UUFDcEQsTUFBTSxLQUFLLGVBQWU7WUFDeEIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUMzRCxDQUFDO1FBQ0QsaURBQWlEO1FBQ2pELE1BQU0sS0FBSyxXQUFXLENBQUMsT0FBa0Q7WUFDdkUsSUFBSSxDQUFDLE9BQU87Z0JBQ1YsTUFBTSxJQUFJLEtBQUssQ0FDYixnR0FBZ0csQ0FDakcsQ0FBQztZQUNKLElBQUksZ0JBQWdCLElBQUksT0FBTyxFQUFFO2dCQUMvQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsT0FBTyxDQUFDO2dCQUNqQyxJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQzthQUM5QztpQkFBTSxJQUFJLE1BQU0sSUFBSSxPQUFPO2dCQUFFLElBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDOztnQkFFeEQsTUFBTSxJQUFJLEtBQUssQ0FDYiwwRkFBMEYsQ0FDM0YsQ0FBQztRQUNOLENBQUM7UUFDRCxzREFBc0Q7UUFDdEQsTUFBTSxLQUFLLGdCQUFnQixDQUN6QixPQUFrRDtZQUVsRCxJQUFJLENBQUMsT0FBTztnQkFDVixNQUFNLElBQUksS0FBSyxDQUNiLHFHQUFxRyxDQUN0RyxDQUFDO1lBQ0osSUFBSSxnQkFBZ0IsSUFBSSxPQUFPLEVBQUU7Z0JBQy9CLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxPQUFPLENBQUM7Z0JBQ2pDLElBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDO2FBQzlDO2lCQUFNLElBQUksTUFBTSxJQUFJLE9BQU87Z0JBQUUsSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUM7O2dCQUV4RCxNQUFNLElBQUksS0FBSyxDQUNiLCtGQUErRixDQUNoRyxDQUFDO1FBQ04sQ0FBQztRQUNELDZDQUE2QztRQUM3QyxNQUFNLEtBQUssUUFBUTtZQUNqQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBQ0QsNkNBQTZDO1FBQzdDLE1BQU0sS0FBSyxRQUFRO1lBQ2pCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFDRCxpREFBaUQ7UUFDakQsTUFBTSxLQUFLLFdBQVc7WUFDcEIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUNELGlEQUFpRDtRQUNqRCxNQUFNLEtBQUssV0FBVztZQUNwQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBRUQ7Ozs7Ozs7Ozs7V0FVRztRQUNILE1BQU0sQ0FBQyxtQkFBbUIsQ0FDeEIsT0FBZSxFQUNmLEtBQWdDLEVBQ2hDLFFBQWdCO1lBRWhCLElBQUk7Z0JBQ0YsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FDNUMsT0FBTyxFQUNQLEtBQUssRUFDTCxRQUFRLENBQ1QsQ0FBQzthQUNIO1lBQUMsT0FBTyxLQUFVLEVBQUU7Z0JBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsU0FBUyxLQUFLLENBQUMsZUFBZSxFQUFFLE1BQU0sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7YUFDeEU7UUFDSCxDQUFDO1FBQ0Q7Ozs7V0FJRztRQUNILE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxRQUFnQjtZQUM1QyxJQUFJO2dCQUNGLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDNUQ7WUFBQyxPQUFPLEtBQVUsRUFBRTtnQkFDbkIsTUFBTSxJQUFJLEtBQUssQ0FBQyxTQUFTLEtBQUssQ0FBQyxlQUFlLEVBQUUsTUFBTSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQzthQUN4RTtRQUNILENBQUM7UUFDRDs7V0FFRztRQUNILE1BQU0sQ0FBQyxTQUFTLENBQ2QsUUFFd0M7WUFFeEMsSUFBSTtnQkFDRixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDNUIsUUFBUSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ3ZCO2dCQUNELFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtvQkFDM0IsSUFBSSxPQUFPLE9BQU8sS0FBSyxVQUFVLEVBQUU7d0JBQ2pDLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxPQUFPLHFCQUFxQixDQUFDLENBQUM7cUJBQ25EO29CQUNELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ25ELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ2xELENBQUMsQ0FBQyxDQUFDO2FBQ0o7WUFBQyxPQUFPLEtBQVUsRUFBRTtnQkFDbkIsTUFBTSxJQUFJLEtBQUssQ0FBQyxTQUFTLEtBQUssQ0FBQyxlQUFlLEVBQUUsTUFBTSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQzthQUN4RTtRQUNILENBQUM7UUFDRDs7Ozs7V0FLRztRQUNILE1BQU0sQ0FBQyxhQUFhLENBQ2xCLFFBRXdDO1lBRXhDLElBQUk7Z0JBQ0YsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7b0JBQzVCLFFBQVEsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUN2QjtnQkFDRCxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7b0JBQzNCLElBQUksT0FBTyxPQUFPLEtBQUssVUFBVSxFQUFFO3dCQUNqQyxNQUFNLElBQUksS0FBSyxDQUFDLElBQUksT0FBTyxxQkFBcUIsQ0FBQyxDQUFDO3FCQUNuRDtvQkFDRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ3ZELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3RELENBQUMsQ0FBQyxDQUFDO2FBQ0o7WUFBQyxPQUFPLEtBQVUsRUFBRTtnQkFDbkIsTUFBTSxJQUFJLEtBQUssQ0FBQyxTQUFTLEtBQUssQ0FBQyxlQUFlLEVBQUUsTUFBTSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQzthQUN4RTtRQUNILENBQUM7UUFDRDs7O1dBR0c7UUFDSCxNQUFNLENBQUMsU0FBUyxDQUNkLFFBRXdDO1lBRXhDLElBQUk7Z0JBQ0YsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7b0JBQzVCLFFBQVEsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUN2QjtnQkFDRCxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7b0JBQzNCLElBQUksT0FBTyxPQUFPLEtBQUssVUFBVSxFQUFFO3dCQUNqQyxNQUFNLElBQUksS0FBSyxDQUFDLElBQUksT0FBTyxxQkFBcUIsQ0FBQyxDQUFDO3FCQUNuRDtvQkFDRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzVDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDM0MsQ0FBQyxDQUFDLENBQUM7YUFDSjtZQUFDLE9BQU8sS0FBVSxFQUFFO2dCQUNuQixNQUFNLElBQUksS0FBSyxDQUFDLFNBQVMsS0FBSyxDQUFDLGVBQWUsRUFBRSxNQUFNLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2FBQ3hFO1FBQ0gsQ0FBQztRQUNEOzs7V0FHRztRQUNILE1BQU0sQ0FBQyxXQUFXLENBQ2hCLE1BQXFCLEVBQ3JCLFFBRXdDLEVBQ3hDLE9BQWlCO1lBRWpCLElBQUk7Z0JBQ0YsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7b0JBQzVCLFFBQVEsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUN2QjtnQkFDRCxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7b0JBQzNCLElBQUksT0FBTyxPQUFPLEtBQUssVUFBVSxFQUFFO3dCQUNqQyxNQUFNLElBQUksS0FBSyxDQUFDLElBQUksT0FBTyxxQkFBcUIsQ0FBQyxDQUFDO3FCQUNuRDtvQkFDRCxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7d0JBQ3ZCLEtBQUssQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQzlCLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzdCLENBQUMsQ0FBQyxDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksT0FBTyxFQUFFO29CQUNYLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTt3QkFDdkIsS0FBSyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztvQkFDakMsQ0FBQyxDQUFDLENBQUM7aUJBQ0o7YUFDRjtZQUFDLE9BQU8sS0FBVSxFQUFFO2dCQUNuQixNQUFNLElBQUksS0FBSyxDQUFDLFNBQVMsS0FBSyxDQUFDLGVBQWUsRUFBRSxNQUFNLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2FBQ3hFO1FBQ0gsQ0FBQztRQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVztZQUN0QixJQUFJLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztZQUMzQixJQUFJLGNBQWMsR0FBRyxFQUFFLENBQUM7WUFDeEIsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzlELGlCQUFpQixDQUFDLFlBQVksQ0FBQyxHQUFHLFVBQVUsQ0FBQztZQUM3QyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUNwRCxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDekMsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNoQyxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2xDLElBQ0UsQ0FBQyxjQUFjO29CQUNmLGFBQWEsS0FBSyxXQUFXO29CQUM3QixhQUFhLEtBQUssWUFBWTtvQkFDOUIsYUFBYSxLQUFLLFdBQVc7b0JBQzdCLGFBQWEsS0FBSyxZQUFZO29CQUM5QixhQUFhLEtBQUssV0FBVztvQkFDN0IsYUFBYSxLQUFLLFNBQVM7b0JBQzNCLGFBQWEsS0FBSyxTQUFTO29CQUMzQixhQUFhLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDO29CQUUvQyxPQUFPO2dCQUNULElBQ0UsYUFBYSxLQUFLLFFBQVE7b0JBQzFCLENBQUUsQ0FBb0MsQ0FBQyxjQUFjLEVBQUU7b0JBQ3ZELGNBQWMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUN6QjtvQkFDQSxjQUFjLENBQUMsYUFBYSxDQUFDLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDckQsY0FBYyxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUMsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO29CQUNoRSxJQUNFLGFBQWEsS0FBSyxZQUFZO3dCQUM5QixhQUFhLEtBQUssa0JBQWtCO3dCQUNwQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0I7NEJBQ2pCLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLFFBQVE7NEJBQ2pDLE9BQVEsQ0FBUyxDQUFDLGNBQWMsS0FBSyxVQUFVOzRCQUMvQyxLQUFLLENBQUMsT0FBTyxDQUFFLENBQVMsQ0FBQyxjQUFjLEVBQUUsQ0FBQzs0QkFDekMsQ0FBUyxDQUFDLGNBQWMsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFDekM7d0JBQ0EsY0FBYyxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUM7NEJBQ3BDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7cUJBQ2hDO2lCQUNGO3FCQUFNLElBQUksYUFBYSxLQUFLLFVBQVUsRUFBRTtvQkFDdkMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUN0QyxjQUFjLENBQ2YsQ0FBQyxXQUFXLEVBQUUsQ0FBQztpQkFDakI7cUJBQU07b0JBQ0wsY0FBYyxDQUFDLGFBQWEsQ0FBQyxHQUFHLGNBQWMsQ0FBQztpQkFDaEQ7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUNILElBQUk7Z0JBQ0YsSUFBSSxNQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FDeEMsaUJBQWlCLEVBQ2pCLGNBQWMsQ0FDZixDQUFDO2dCQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDckI7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDN0IsTUFBTSxJQUFJLEtBQUssQ0FBQyxTQUFTLGVBQWUsRUFBRSxNQUFNLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2FBQ2xFO1FBQ0gsQ0FBQztLQUNGO0lBN1FZLFVBQUksT0E2UWhCLENBQUE7SUFFRCxJQUFpQixLQUFLLENBb2tDckI7SUFwa0NELFdBQWlCLEtBQUs7UUFDcEI7O1dBRUc7UUFDSCxNQUFhLEtBQUs7WUFDQSxJQUFJLENBQVU7WUFDcEIsVUFBVSxDQUE0QjtZQUVoRCxZQUFZLGFBQXFCO2dCQUMvQixJQUFJLENBQUMsSUFBSSxHQUFHLGFBQWEsQ0FBQztZQUM1QixDQUFDO1lBQ0QsUUFBUSxDQUFDLEtBQVU7Z0JBQ2pCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDeEMsQ0FBQztZQUNELGdCQUFnQjtnQkFDZCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUMzQyxDQUFDO1lBQ0QsU0FBUztnQkFDUCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDcEMsQ0FBQztZQUNELFVBQVU7Z0JBQ1IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3JDLENBQUM7WUFDRCxPQUFPO2dCQUNMLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNsQyxDQUFDO1lBQ0QsU0FBUztnQkFDUCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDcEMsQ0FBQztZQUNELGdCQUFnQjtnQkFDZCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUMzQyxDQUFDO1lBQ0QsYUFBYTtnQkFDWCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDeEMsQ0FBQztZQUNELGdCQUFnQjtnQkFDZCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUMzQyxDQUFDO1lBQ0QsY0FBYyxDQUFDLE9BQWdEO2dCQUM3RCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2hELENBQUM7WUFDRCxhQUFhLENBQUMsVUFBMEI7Z0JBQ3RDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbEQsQ0FBQztZQUNELFFBQVE7Z0JBQ04sT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ25DLENBQUM7WUFDRCxVQUFVLENBQUMsT0FBZ0IsRUFBRSxPQUFnQjtnQkFDM0MsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDckQsQ0FBQztZQUVELElBQVcsU0FBUztnQkFDbEIsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVO29CQUNyQixJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3dCQUN4QyxLQUFLLENBQUMsVUFBVSxDQUNkLGtCQUFrQixJQUFJLENBQUMsSUFBSSw4QkFBOEIsQ0FDMUQsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztZQUVELElBQVcsUUFBUTtnQkFDakIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztZQUNqQyxDQUFDO1lBRUQ7OztlQUdHO1lBQ0gsSUFBVyxLQUFLO2dCQUNkLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNuQyxDQUFDO1lBRUQsSUFBVyxLQUFLLENBQUMsS0FBVTtnQkFDekIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDakMsQ0FBQztZQUVEOzs7Ozs7O2VBT0c7WUFDSSxlQUFlLENBQUMsT0FBZSxFQUFFLFFBQWdCO2dCQUN0RCxJQUFJO29CQUNGLElBQUksQ0FBQyxPQUFPO3dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztvQkFDMUQsSUFBSSxDQUFDLFFBQVE7d0JBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO29CQUM1RCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQ2hDLE9BQU8sQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUMzQyxDQUFDO29CQUNGLE9BQU8sSUFBSSxDQUFDO2lCQUNiO2dCQUFDLE9BQU8sS0FBVSxFQUFFO29CQUNuQixNQUFNLElBQUksS0FBSyxDQUNiLFNBQVMsS0FBSyxDQUFDLGVBQWUsRUFBRSxNQUFNLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FDdEQsQ0FBQztpQkFDSDtZQUNILENBQUM7WUFFRDs7O2VBR0c7WUFDSSxVQUFVLENBQUMsT0FBZ0I7Z0JBQ2hDLElBQUk7b0JBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDaEUsT0FBTyxJQUFJLENBQUM7aUJBQ2I7Z0JBQUMsT0FBTyxLQUFVLEVBQUU7b0JBQ25CLE1BQU0sSUFBSSxLQUFLLENBQ2IsU0FBUyxLQUFLLENBQUMsZUFBZSxFQUFFLE1BQU0sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUN0RCxDQUFDO2lCQUNIO1lBQ0gsQ0FBQztZQUVEOzs7ZUFHRztZQUNJLFdBQVcsQ0FBQyxRQUFpQjtnQkFDbEMsSUFBSTtvQkFDRixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUNsRSxPQUFPLElBQUksQ0FBQztpQkFDYjtnQkFBQyxPQUFPLEtBQVUsRUFBRTtvQkFDbkIsTUFBTSxJQUFJLEtBQUssQ0FDYixTQUFTLEtBQUssQ0FBQyxlQUFlLEVBQUUsTUFBTSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQ3RELENBQUM7aUJBQ0g7WUFDSCxDQUFDO1lBRUQ7OztlQUdHO1lBQ0ksZ0JBQWdCLENBQ3JCLGdCQUFpRDtnQkFFakQsSUFBSTtvQkFDRixJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLENBQUM7b0JBQ2xELE9BQU8sSUFBSSxDQUFDO2lCQUNiO2dCQUFDLE9BQU8sS0FBVSxFQUFFO29CQUNuQixNQUFNLElBQUksS0FBSyxDQUNiLFNBQVMsS0FBSyxDQUFDLGVBQWUsRUFBRSxNQUFNLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FDdEQsQ0FBQztpQkFDSDtZQUNILENBQUM7WUFFRDs7O2VBR0c7WUFDSSxXQUFXLENBQUMsUUFBaUI7Z0JBQ2xDLElBQUk7b0JBQ0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ2hFLE9BQU8sSUFBSSxDQUFDO2lCQUNiO2dCQUFDLE9BQU8sS0FBVSxFQUFFO29CQUNuQixNQUFNLElBQUksS0FBSyxDQUNiLFNBQVMsS0FBSyxDQUFDLGVBQWUsRUFBRSxNQUFNLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FDdEQsQ0FBQztpQkFDSDtZQUNILENBQUM7WUFFRCwwQ0FBMEM7WUFDbkMsWUFBWTtnQkFDakIsSUFBSTtvQkFDRixJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO29CQUM5QixPQUFPLElBQUksQ0FBQztpQkFDYjtnQkFBQyxPQUFPLEtBQVUsRUFBRTtvQkFDbkIsTUFBTSxJQUFJLEtBQUssQ0FDYixTQUFTLEtBQUssQ0FBQyxlQUFlLEVBQUUsTUFBTSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQ3RELENBQUM7aUJBQ0g7WUFDSCxDQUFDO1lBRUQ7OztlQUdHO1lBQ0ksV0FBVyxDQUNoQixRQUV3QztnQkFFeEMsSUFBSTtvQkFDRixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7d0JBQzNCLEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxFQUFFOzRCQUM5QixJQUFJLE9BQU8sT0FBTyxLQUFLLFVBQVU7Z0NBQy9CLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxPQUFPLHFCQUFxQixDQUFDLENBQUM7NEJBQ3BELElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDOzRCQUN2QyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQzt5QkFDckM7cUJBQ0Y7eUJBQU07d0JBQ0wsSUFBSSxPQUFPLFFBQVEsS0FBSyxVQUFVOzRCQUNoQyxNQUFNLElBQUksS0FBSyxDQUFDLElBQUksUUFBUSxxQkFBcUIsQ0FBQyxDQUFDO3dCQUNyRCxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDeEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7cUJBQ3RDO29CQUNELE9BQU8sSUFBSSxDQUFDO2lCQUNiO2dCQUFDLE9BQU8sS0FBVSxFQUFFO29CQUNuQixNQUFNLElBQUksS0FBSyxDQUNiLFNBQVMsS0FBSyxDQUFDLGVBQWUsRUFBRSxNQUFNLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FDdEQsQ0FBQztpQkFDSDtZQUNILENBQUM7WUFFRDs7ZUFFRztZQUNJLGVBQWUsQ0FDcEIsT0FBZSxFQUNmLGlCQUE2QyxFQUM3QyxRQUFnQixFQUNoQixPQUFrRDtnQkFFbEQsSUFBSTtvQkFDRixJQUFJLENBQUMsUUFBUTt3QkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7b0JBQzVELElBQUksT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7d0JBQ3BDLE1BQU0sSUFBSSxLQUFLLENBQ2IsbUVBQW1FLENBQ3BFLENBQUM7b0JBQ0osSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTt3QkFDaEMsT0FBTyxDQUFDLGVBQWUsQ0FBQzs0QkFDdEIsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDOzRCQUNuQixpQkFBaUIsRUFBRSxpQkFBaUI7NEJBQ3BDLFFBQVEsRUFBRSxRQUFROzRCQUNsQixPQUFPLEVBQUUsT0FBTzt5QkFDakIsQ0FBQyxDQUFDO29CQUNMLENBQUMsQ0FBQyxDQUFDO29CQUNILE9BQU8sSUFBSSxDQUFDO2lCQUNiO2dCQUFDLE9BQU8sS0FBVSxFQUFFO29CQUNuQixNQUFNLElBQUksS0FBSyxDQUNiLFNBQVMsS0FBSyxDQUFDLGVBQWUsRUFBRSxNQUFNLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FDdEQsQ0FBQztpQkFDSDtZQUNILENBQUM7WUFDRDs7Ozs7ZUFLRztZQUNILGtCQUFrQixDQUFDLFFBQWdCO2dCQUNqQyxJQUFJO29CQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7d0JBQ2hDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDdEMsQ0FBQyxDQUFDLENBQUM7b0JBQ0gsT0FBTyxJQUFJLENBQUM7aUJBQ2I7Z0JBQUMsT0FBTyxLQUFVLEVBQUU7b0JBQ25CLE1BQU0sSUFBSSxLQUFLLENBQ2IsU0FBUyxLQUFLLENBQUMsZUFBZSxFQUFFLE1BQU0sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUN0RCxDQUFDO2lCQUNIO1lBQ0gsQ0FBQztTQUNGO1FBdlBZLFdBQUssUUF1UGpCLENBQUE7UUFDRCxNQUFhLFNBQ1gsU0FBUSxLQUFLO1lBSWIsWUFBWSxTQUFpQjtnQkFDM0IsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ25CLENBQUM7WUFDRCxZQUFZO2dCQUNWLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUN2QyxDQUFDO1lBQ0QsU0FBUztnQkFDUCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUEwQyxDQUFDO1lBQzVFLENBQUM7WUFDRCxJQUFJLFNBQVM7Z0JBQ1gsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVO29CQUNyQixJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3dCQUN4QyxLQUFLLENBQUMsVUFBVSxDQUFDLFVBQVUsSUFBSSxDQUFDLElBQUksa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQzdELENBQUM7WUFDRCxJQUFJLFFBQVE7Z0JBQ1YsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztZQUNqQyxDQUFDO1lBQ0QsSUFBSSxLQUFLO2dCQUNQLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxJQUFJLENBQUM7WUFDM0MsQ0FBQztZQUNELElBQUksS0FBSyxDQUFDLEtBQWE7Z0JBQ3JCLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2pDLENBQUM7U0FDRjtRQTVCWSxlQUFTLFlBNEJyQixDQUFBO1FBQ0QsTUFBYSxXQUNYLFNBQVEsS0FBSztZQUliLFlBQVksU0FBaUI7Z0JBQzNCLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNuQixDQUFDO1lBQ0QsU0FBUztnQkFDUCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUEyQyxDQUFDO1lBQzdFLENBQUM7WUFDRCxNQUFNO2dCQUNKLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNqQyxDQUFDO1lBQ0QsTUFBTTtnQkFDSixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDakMsQ0FBQztZQUNELFlBQVk7Z0JBQ1YsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3ZDLENBQUM7WUFDRCxZQUFZLENBQUMsU0FBaUI7Z0JBQzVCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDaEQsQ0FBQztZQUNELElBQUksU0FBUztnQkFDWCxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVU7b0JBQ3JCLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7d0JBQ3hDLEtBQUssQ0FBQyxVQUFVLENBQUMsVUFBVSxJQUFJLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDN0QsQ0FBQztZQUNELElBQUksUUFBUTtnQkFDVixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO1lBQ2pDLENBQUM7WUFDRCxJQUFJLEtBQUs7Z0JBQ1AsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxJQUFJLElBQUksQ0FBQztZQUMzQyxDQUFDO1lBQ0QsSUFBSSxLQUFLLENBQUMsS0FBYTtnQkFDckIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDakMsQ0FBQztTQUNGO1FBckNZLGlCQUFXLGNBcUN2QixDQUFBO1FBQ0QsTUFBYSxTQUNYLFNBQVEsS0FBSztZQUliLFlBQVksU0FBaUI7Z0JBQzNCLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNuQixDQUFDO1lBQ0QsU0FBUztnQkFDUCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUF3QyxDQUFDO1lBQzFFLENBQUM7WUFDRCxJQUFJLFNBQVM7Z0JBQ1gsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVO29CQUNyQixJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3dCQUN4QyxLQUFLLENBQUMsVUFBVSxDQUFDLFVBQVUsSUFBSSxDQUFDLElBQUksa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQzdELENBQUM7WUFDRCxJQUFJLFFBQVE7Z0JBQ1YsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztZQUNqQyxDQUFDO1lBQ0QsSUFBSSxLQUFLO2dCQUNQLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxJQUFJLENBQUM7WUFDM0MsQ0FBQztZQUNELElBQUksS0FBSyxDQUFDLEtBQVc7Z0JBQ25CLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2pDLENBQUM7U0FDRjtRQXpCWSxlQUFTLFlBeUJyQixDQUFBO1FBQ0QsTUFBYSxZQUNYLFNBQVEsS0FBSztZQUliLFlBQVksU0FBaUI7Z0JBQzNCLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNuQixDQUFDO1lBQ0QsZ0JBQWdCO2dCQUNkLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzNDLENBQUM7WUFDRCxlQUFlO2dCQUNiLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUMxQyxDQUFDO1lBQ0QsSUFBSSxTQUFTO2dCQUNYLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVTtvQkFDckIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzt3QkFDeEMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxVQUFVLElBQUksQ0FBQyxJQUFJLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUM3RCxDQUFDO1lBQ0QsSUFBSSxRQUFRO2dCQUNWLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7WUFDakMsQ0FBQztZQUNELElBQUksS0FBSztnQkFDUCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksSUFBSSxDQUFDO1lBQzNDLENBQUM7WUFDRCxJQUFJLEtBQUssQ0FBQyxLQUFjO2dCQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqQyxDQUFDO1NBQ0Y7UUE1Qlksa0JBQVksZUE0QnhCLENBQUE7UUFDRCxNQUFhLHlCQUNYLFNBQVEsS0FBSztZQUliLE1BQU0sQ0FBVTtZQUNoQixZQUFZLGFBQXFCLEVBQUUsTUFBZ0I7Z0JBQ2pELEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDckIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFDdkIsQ0FBQztZQUNELFNBQVM7Z0JBQ1AsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBNkMsQ0FBQztZQUMvRSxDQUFDO1lBQ0QsU0FBUyxDQUFDLEtBQXNCO2dCQUM5QixJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtvQkFDN0IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDeEM7cUJBQU07b0JBQ0wsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDeEM7WUFDSCxDQUFDO1lBQ0QsVUFBVTtnQkFDUixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDckMsQ0FBQztZQUNELGlCQUFpQjtnQkFDZixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUM1QyxDQUFDO1lBQ0QsT0FBTztnQkFDTCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDbEMsQ0FBQztZQUNELGVBQWU7Z0JBQ2IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQzFDLENBQUM7WUFDRCxJQUFJLFNBQVM7Z0JBQ1gsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVO29CQUNyQixJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3dCQUN4QyxLQUFLLENBQUMsVUFBVSxDQUFDLFVBQVUsSUFBSSxDQUFDLElBQUksa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQzdELENBQUM7WUFDRCxJQUFJLFFBQVE7Z0JBQ1YsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztZQUNqQyxDQUFDO1lBQ0QsSUFBSSxLQUFLO2dCQUNQLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNuQyxDQUFDO1lBQ0QsSUFBSSxLQUFLLENBQUMsS0FBbUM7Z0JBQzNDLElBQUksS0FBSyxLQUFLLElBQUk7b0JBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQzdDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDN0IsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO29CQUNoQixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7d0JBQ2xCLElBQUksT0FBTyxDQUFDLElBQUksUUFBUTs0QkFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs0QkFDcEMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ25DLENBQUMsQ0FBQyxDQUFDO29CQUNILElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUNqQzs7b0JBQU0sS0FBSyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsS0FBSyxtQkFBbUIsQ0FBQyxDQUFDO1lBQ3BFLENBQUM7U0FDRjtRQXREWSwrQkFBeUIsNEJBc0RyQyxDQUFBO1FBSUQsTUFBYSxXQUNYLFNBQVEsS0FBSztZQUlILGNBQWMsR0FBUSxFQUFFLENBQUM7WUFDM0IsTUFBTSxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUM5QixNQUFNLENBQVM7WUFDdEIsWUFBWSxTQUFpQixFQUFFLE1BQWU7Z0JBQzVDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDakIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLElBQUssRUFBYSxDQUFDO1lBQ3pDLENBQUM7WUFDRCxjQUFjO2dCQUNaLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN6QyxDQUFDO1lBQ0QsSUFBSSxTQUFTO2dCQUNYLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVTtvQkFDckIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzt3QkFDeEMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxVQUFVLElBQUksQ0FBQyxJQUFJLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUM3RCxDQUFDO1lBQ0QsSUFBSSxRQUFRO2dCQUNWLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7WUFDakMsQ0FBQztZQUNELDBDQUEwQztZQUMxQyxJQUFJLEVBQUU7Z0JBQ0osT0FBTyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUM7b0JBQ3hDLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUN2QyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ1gsQ0FBQztZQUNELGtEQUFrRDtZQUNsRCxJQUFJLFVBQVU7Z0JBQ1osT0FBTyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUM7b0JBQ3hDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVU7b0JBQzFCLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDWCxDQUFDO1lBQ0QsdURBQXVEO1lBQ3ZELElBQUksY0FBYztnQkFDaEIsT0FBTyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUN6RSxDQUFDO1lBQ0QsSUFBSSxLQUFLO2dCQUNQLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxJQUFJLENBQUM7WUFDM0MsQ0FBQztZQUNELElBQUksS0FBSyxDQUFDLEtBQXdCO2dCQUNoQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqQyxDQUFDO1lBQ0Q7OztlQUdHO1lBQ0gsSUFBVyxJQUFJO2dCQUtiLElBQUk7b0JBQ0YsZ0NBQWdDO29CQUNoQyxJQUFJLE9BQU8sR0FBUSxJQUFJLENBQUM7b0JBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7d0JBQzFCLElBQUssQ0FBUyxFQUFFLFFBQVEsSUFBSSxDQUFDLE9BQU8sRUFBRTs0QkFDcEMsT0FBTyxHQUFHLENBQUMsQ0FBQzt5QkFDYjtvQkFDSCxDQUFDLENBQUMsQ0FBQztvQkFFSCxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRTt3QkFBRSxPQUFPLElBQUksQ0FBQztvQkFFakQsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7b0JBRXZDLDJDQUEyQztvQkFDM0MsTUFBTSxXQUFXLEdBQUcsSUFBSSxLQUFLLENBQUMsVUFBVSxFQUFFO3dCQUN4QyxHQUFHLEVBQUUsQ0FBQyxNQUFNLEVBQUUsSUFBWSxFQUFFLEVBQUU7NEJBQzVCLElBQUksSUFBSSxLQUFLLFlBQVksRUFBRTtnQ0FDekIsT0FBTyxNQUFNLENBQUMsVUFBVSxDQUFDOzZCQUMxQjs0QkFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0NBQ3JCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0NBQ2hDLG1EQUFtRDtnQ0FDbEQsS0FBYSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7Z0NBQzlELE9BQU8sS0FBSyxDQUFDOzZCQUNkOzRCQUNELE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUN0QixDQUFDO3FCQUNGLENBQUMsQ0FBQztvQkFFSCxPQUFPLFdBQVcsQ0FBQztpQkFDcEI7Z0JBQUMsT0FBTyxLQUFVLEVBQUU7b0JBQ25CLE1BQU0sSUFBSSxLQUFLLENBQ2IsU0FBUyxLQUFLLENBQUMsZUFBZSxFQUFFLE1BQU0sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUN0RCxDQUFDO2lCQUNIO1lBQ0gsQ0FBQztZQUNEOzs7Ozs7ZUFNRztZQUNILGNBQWMsQ0FDWixFQUFVLEVBQ1YsVUFBZSxFQUNmLElBQVMsRUFDVCxNQUFNLEdBQUcsS0FBSztnQkFFZCxJQUFJO29CQUNGLElBQUksQ0FBQyxFQUFFO3dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztvQkFDMUQsSUFBSSxDQUFDLFVBQVU7d0JBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO29CQUMzRCxFQUFFLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDN0IsTUFBTSxXQUFXLEdBQUc7d0JBQ2xCLEVBQUU7d0JBQ0YsVUFBVTt3QkFDVixJQUFJO3FCQUNMLENBQUM7b0JBQ0YsSUFBSSxDQUFDLEtBQUs7d0JBQ1IsTUFBTSxJQUFJLElBQUksQ0FBQyxLQUFLOzRCQUNsQixDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDOzRCQUNoQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDcEIsT0FBTyxJQUFJLENBQUM7aUJBQ2I7Z0JBQUMsT0FBTyxLQUFVLEVBQUU7b0JBQ25CLE1BQU0sSUFBSSxLQUFLLENBQ2IsU0FBUyxLQUFLLENBQUMsZUFBZSxFQUFFLE1BQU0sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUN0RCxDQUFDO2lCQUNIO1lBQ0gsQ0FBQztZQUNEOzs7Ozs7Ozs7ZUFTRztZQUNILHFCQUFxQixDQUNuQixVQUFrQixFQUNsQixlQUFxQztnQkFFckMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO29CQUFFLFVBQVUsR0FBRyxJQUFJLFVBQVUsUUFBUSxDQUFDO2dCQUN4RSxJQUFJLENBQUMsZUFBZSxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsVUFBVSxFQUFFLENBQUMsRUFBRTtvQkFDekQsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7b0JBQ2xCLE9BQU87aUJBQ1I7Z0JBQ0QsSUFBSSxDQUFDLEtBQUssR0FBRztvQkFDWDt3QkFDRSxFQUFFLEVBQUUsZUFBZSxDQUFDLEdBQUcsVUFBVSxFQUFFLENBQUM7d0JBQ3BDLFVBQVUsRUFDUixlQUFlLENBQ2IsR0FBRyxVQUFVLDJDQUEyQyxDQUN6RDt3QkFDSCxJQUFJLEVBQUUsZUFBZSxDQUNuQixHQUFHLFVBQVUsNENBQTRDLENBQzFEO3FCQUNGO2lCQUNGLENBQUM7WUFDSixDQUFDO1lBQ0Q7Ozs7Ozs7Ozs7Ozs7Ozs7ZUFnQkc7WUFDSCxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQWU7Z0JBQzVCLElBQUk7b0JBQ0YsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVTt3QkFBRSxPQUFPLElBQUksQ0FBQztvQkFDOUMsTUFBTSxNQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FDNUMsSUFBSSxDQUFDLFVBQVUsRUFDZixJQUFJLENBQUMsRUFBRSxFQUNQLE9BQU8sQ0FDUixDQUFDO29CQUNGLE9BQU8sTUFBTSxDQUFDO2lCQUNmO2dCQUFDLE9BQU8sS0FBVSxFQUFFO29CQUNuQixNQUFNLElBQUksS0FBSyxDQUNiLFNBQVMsS0FBSyxDQUFDLGVBQWUsRUFBRSxNQUFNLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FDdEQsQ0FBQztpQkFDSDtZQUNILENBQUM7WUFDRDs7Ozs7Ozs7O2VBU0c7WUFDSCxvQkFBb0IsQ0FDbEIsU0FBaUIsRUFDakIsaUJBQTBCO2dCQUUxQixJQUFJO29CQUNGLGdCQUFnQixDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO29CQUMxQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO3dCQUNoQyxPQUFPLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUM7b0JBQ3pDLENBQUMsQ0FBQyxDQUFDO29CQUNILElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7b0JBQzNDLE9BQU8sSUFBSSxDQUFDO2lCQUNiO2dCQUFDLE9BQU8sS0FBVSxFQUFFO29CQUNuQixNQUFNLElBQUksS0FBSyxDQUNiLFNBQVMsS0FBSyxDQUFDLGVBQWUsRUFBRSxNQUFNLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FDdEQsQ0FBQztpQkFDSDtnQkFFRCxTQUFTLGdCQUFnQjtvQkFDdkIsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO3dCQUM1QyxPQUFPLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO29CQUN4RCxDQUFDLENBQUMsQ0FBQztnQkFDTCxDQUFDO1lBQ0gsQ0FBQztZQUNEOzs7Ozs7Ozs7Ozs7Ozs7ZUFlRztZQUNILEtBQUssQ0FBQyw0QkFBNEIsQ0FDaEMsaUJBQXlCLEVBQ3pCLHNCQUE4QixFQUM5QixRQUFnQjtnQkFFaEIsSUFBSTtvQkFDRixNQUFNLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUM1RCxpQkFBaUIsRUFDakIsWUFBWSxHQUFHLFFBQVEsQ0FDeEIsQ0FBQztvQkFDRixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO29CQUM3QixJQUFJLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztvQkFDMUIsZ0JBQWdCLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7b0JBQzFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTt3QkFDcEIsZ0JBQWdCLElBQUksVUFBVSxJQUFJLENBQUMsc0JBQXNCLENBQUMsVUFBVSxDQUFDO29CQUN2RSxDQUFDLENBQUMsQ0FBQztvQkFDSCxRQUFRLEdBQUcsZ0JBQWdCO3dCQUN6QixDQUFDLENBQUMsaUNBQWlDLHNCQUFzQixtQkFBbUIsZ0JBQWdCLHVCQUF1Qjt3QkFDbkgsQ0FBQyxDQUFDLGlDQUFpQyxzQkFBc0IsOEJBQThCLENBQUM7b0JBQzFGLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7d0JBQ2hDLE9BQU8sQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztvQkFDekMsQ0FBQyxDQUFDLENBQUM7b0JBQ0gsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztpQkFDNUM7Z0JBQUMsT0FBTyxLQUFVLEVBQUU7b0JBQ25CLE1BQU0sSUFBSSxLQUFLLENBQ2IsU0FBUyxLQUFLLENBQUMsZUFBZSxFQUFFLE1BQU0sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUN0RCxDQUFDO2lCQUNIO2dCQUNELFNBQVMsZ0JBQWdCO29CQUN2QixnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7d0JBQzVDLE9BQU8sQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLENBQUM7b0JBQ3ZELENBQUMsQ0FBQyxDQUFDO2dCQUNMLENBQUM7WUFDSCxDQUFDO1lBQ0Q7Ozs7O2VBS0c7WUFDSCxhQUFhLENBQUMsUUFBZ0I7Z0JBQzVCLElBQUk7b0JBQ0YsSUFBSSxDQUFDLFFBQVEsRUFBRTt3QkFDYixNQUFNLElBQUksS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUM7cUJBQ3pDO29CQUNELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDOUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUVuRCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO3dCQUNoQyxPQUFPLENBQUMsYUFBYSxDQUNuQixJQUFJLENBQUMsTUFBTSxFQUNYLFlBQVksRUFDWixlQUFlLEVBQ2YsUUFBUSxFQUNSLFNBQVMsRUFDVCxJQUFJLENBQ0wsQ0FBQztvQkFDSixDQUFDLENBQUMsQ0FBQztvQkFDSCxPQUFPLElBQUksQ0FBQztpQkFDYjtnQkFBQyxPQUFPLEtBQVUsRUFBRTtvQkFDbkIsTUFBTSxJQUFJLEtBQUssQ0FDYixTQUFTLEtBQUssQ0FBQyxlQUFlLEVBQUUsTUFBTSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQ3RELENBQUM7aUJBQ0g7WUFDSCxDQUFDO1lBRUQ7O2VBRUc7WUFDSyx5QkFBeUIsQ0FBQyxRQUFnQjtnQkFDaEQsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO2dCQUM3RCxJQUFJLENBQUMsS0FBSyxFQUFFO29CQUNWLE1BQU0sSUFBSSxLQUFLLENBQUMsNkNBQTZDLENBQUMsQ0FBQztpQkFDaEU7Z0JBQ0QsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEIsQ0FBQztZQUVEOztlQUVHO1lBQ0ssaUJBQWlCLENBQUMsUUFBZ0I7Z0JBQ3hDLE1BQU0sVUFBVSxHQUFhLEVBQUUsQ0FBQztnQkFDaEMsTUFBTSxLQUFLLEdBQUcsa0NBQWtDLENBQUM7Z0JBQ2pELElBQUksS0FBSyxDQUFDO2dCQUVWLGdDQUFnQztnQkFDaEMsT0FDRSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssSUFBSTtvQkFDdkMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQ3JCO29CQUNBLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUM1QixVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUMzQjtpQkFDRjtnQkFFRCxxRkFBcUY7Z0JBQ3JGLElBQUksVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQzNCLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3hDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUN0RDtnQkFFRCwrQ0FBK0M7Z0JBQy9DLE1BQU0sS0FBSyxHQUFHLFVBQVU7cUJBQ3JCLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTtvQkFDbkIsTUFBTSxLQUFLLEdBQUcsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7b0JBQ3RDLE9BQU8sZUFBZSxJQUFJLFlBQVksS0FBSyxNQUFNLENBQUM7Z0JBQ3BELENBQUMsQ0FBQztxQkFDRCxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBRXRCLE9BQU8sMkNBQTJDLFVBQVUsQ0FBQyxDQUFDLENBQUM7K0JBQ3hDLFVBQVUsQ0FBQyxDQUFDLENBQUM7VUFDbEMsS0FBSzs7WUFFSCxDQUFDO1lBQ1AsQ0FBQztZQUNEOztlQUVHO1lBQ0gsd0JBQXdCO2dCQUN0QixJQUFJO29CQUNGLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUN6QixDQUFDLFlBQWdELEVBQUUsRUFBRTt3QkFDbkQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTs0QkFDaEMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQzt3QkFDeEMsQ0FBQyxDQUFDLENBQUM7b0JBQ0wsQ0FBQyxDQUNGLENBQUM7b0JBQ0YsT0FBTyxJQUFJLENBQUM7aUJBQ2I7Z0JBQUMsT0FBTyxLQUFVLEVBQUU7b0JBQ25CLE1BQU0sSUFBSSxLQUFLLENBQ2IsU0FBUyxLQUFLLENBQUMsZUFBZSxFQUFFLE1BQU0sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUN0RCxDQUFDO2lCQUNIO1lBQ0gsQ0FBQztTQUNGO1FBblhZLGlCQUFXLGNBbVh2QixDQUFBO1FBSUQsTUFBYSxjQUNYLFNBQVEsS0FBSztZQUlILFFBQVEsQ0FBaUM7WUFDbkQsTUFBTSxDQUFVO1lBQ2hCLFlBQVksYUFBcUIsRUFBRSxNQUFnQjtnQkFDakQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUNyQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUN2QixDQUFDO1lBQ0QsU0FBUztnQkFDUCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUE2QyxDQUFDO1lBQy9FLENBQUM7WUFDRCxTQUFTLENBQUMsS0FBc0I7Z0JBQzlCLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO29CQUM3QixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUN4QztxQkFBTTtvQkFDTCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUN4QztZQUNILENBQUM7WUFDRCxVQUFVO2dCQUNSLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNyQyxDQUFDO1lBQ0QsaUJBQWlCO2dCQUNmLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQzVDLENBQUM7WUFDRCxPQUFPO2dCQUNMLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNsQyxDQUFDO1lBQ0QsZUFBZTtnQkFDYixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDMUMsQ0FBQztZQUNELElBQUksU0FBUztnQkFDWCxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVU7b0JBQ3JCLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7d0JBQ3hDLEtBQUssQ0FBQyxVQUFVLENBQUMsVUFBVSxJQUFJLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDN0QsQ0FBQztZQUNELElBQUksUUFBUTtnQkFDVixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO1lBQ2pDLENBQUM7WUFDRCxJQUFJLE9BQU87Z0JBQ1QsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRO29CQUNuQixJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3dCQUN0QyxLQUFLLENBQUMsVUFBVSxDQUFDLFlBQVksSUFBSSxDQUFDLElBQUksa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQy9ELENBQUM7WUFDRCxJQUFJLEtBQUs7Z0JBQ1AsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ25DLENBQUM7WUFDRCxJQUFJLEtBQUssQ0FBQyxLQUE2QjtnQkFDckMsSUFBSSxPQUFPLEtBQUssSUFBSSxRQUFRO29CQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO3FCQUN4RCxJQUFJLEtBQUssS0FBSyxJQUFJO29CQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDOztvQkFDbEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ25ELENBQUM7WUFDRDs7Ozs7Ozs7ZUFRRztZQUNILFNBQVMsQ0FBQyxNQUFnQixFQUFFLEtBQWM7Z0JBQ3hDLElBQUk7b0JBQ0YsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO3dCQUN4QixNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFxQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO29CQUNsRSxNQUFNLGVBQWUsR0FDbkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLENBQUM7b0JBQ2pELEtBQUssTUFBTSxPQUFPLElBQUksZUFBZSxFQUFFO3dCQUNyQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFOzRCQUNsQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7eUJBQ3hDO3FCQUNGO29CQUNELE9BQU8sSUFBSSxDQUFDO2lCQUNiO2dCQUFDLE9BQU8sS0FBVSxFQUFFO29CQUNuQixNQUFNLElBQUksS0FBSyxDQUNiLFNBQVMsS0FBSyxDQUFDLGVBQWUsRUFBRSxNQUFNLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FDdEQsQ0FBQztpQkFDSDtZQUNILENBQUM7WUFDRDs7OztlQUlHO1lBQ0gsWUFBWSxDQUFDLE1BQWdCO2dCQUMzQixJQUFJO29CQUNGLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQzt3QkFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBcUMsTUFBTSxHQUFHLENBQUMsQ0FBQztvQkFDbEUsTUFBTSxlQUFlLEdBQ25CLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxDQUFDO29CQUNqRCxLQUFLLE1BQU0sT0FBTyxJQUFJLGVBQWUsRUFBRTt3QkFDckMsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTs0QkFDbEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO3lCQUMxQztxQkFDRjtvQkFDRCxPQUFPLElBQUksQ0FBQztpQkFDYjtnQkFBQyxPQUFPLEtBQVUsRUFBRTtvQkFDbkIsTUFBTSxJQUFJLEtBQUssQ0FDYixTQUFTLEtBQUssQ0FBQyxlQUFlLEVBQUUsTUFBTSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQ3RELENBQUM7aUJBQ0g7WUFDSCxDQUFDO1lBQ0Q7O2VBRUc7WUFDSCxZQUFZO2dCQUNWLElBQUk7b0JBQ0YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztvQkFDNUIsT0FBTyxJQUFJLENBQUM7aUJBQ2I7Z0JBQUMsT0FBTyxLQUFVLEVBQUU7b0JBQ25CLE1BQU0sSUFBSSxLQUFLLENBQ2IsU0FBUyxLQUFLLENBQUMsZUFBZSxFQUFFLE1BQU0sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUN0RCxDQUFDO2lCQUNIO1lBQ0gsQ0FBQztTQUNGO1FBckhZLG9CQUFjLGlCQXFIMUIsQ0FBQTtRQUNELE1BQWEsT0FBTztZQUNGLElBQUksQ0FBVTtZQUNwQixRQUFRLENBQXdCO1lBQ25DLFNBQVMsQ0FBb0I7WUFDcEMsWUFBWSxJQUFZO2dCQUN0QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNuQixDQUFDO1lBQ0QsSUFBVyxPQUFPO2dCQUNoQixPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVE7b0JBQ25CLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3dCQUN0QyxLQUFLLENBQUMsVUFBVSxDQUNkLGdCQUFnQixJQUFJLENBQUMsSUFBSSw4QkFBOEIsQ0FDeEQsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztZQUNELE9BQU87Z0JBQ0wsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2hDLENBQUM7WUFDRCxTQUFTO2dCQUNQLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNsQyxDQUFDO1lBQ0QsUUFBUSxDQUFzRDtZQUM5RCxVQUFVLENBQUMsT0FBZ0I7Z0JBQ3pCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDMUMsQ0FBQztZQUNELFVBQVU7Z0JBQ1IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ25DLENBQUM7WUFDRCxRQUFRO2dCQUNOLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNqQyxDQUFDO1lBQ0QsUUFBUSxDQUFDLEtBQWE7Z0JBQ3BCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEMsQ0FBQztTQUNGO1FBakNZLGFBQU8sVUFpQ25CLENBQUE7UUFJRCxNQUFhLEdBQUc7WUFDRSxJQUFJLENBQVU7WUFDcEIsSUFBSSxDQUFvQjtZQUNsQyxPQUFPLENBQVc7WUFDbEIsWUFBWSxJQUFZLEVBQUUsT0FBa0I7Z0JBQzFDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO2dCQUNqQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztnQkFDdkIsS0FBSyxJQUFJLEdBQUcsSUFBSSxPQUFPLEVBQUU7b0JBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO2lCQUMvQjtZQUNILENBQUM7WUFDRCxJQUFJLFFBQVE7Z0JBQ1YsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztZQUMzQixDQUFDO1lBQ0QsSUFBVyxHQUFHO2dCQUNaLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSTtvQkFDZixJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7d0JBQ3ZDLEtBQUssQ0FBQyxVQUFVLENBQ2QsWUFBWSxJQUFJLENBQUMsSUFBSSw4QkFBOEIsQ0FDcEQsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztZQUNELGlCQUFpQixDQUFDLE9BQTJDO2dCQUMzRCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDN0MsQ0FBQztZQUNELGVBQWU7Z0JBQ2IsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3BDLENBQUM7WUFDRCxPQUFPO2dCQUNMLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUM1QixDQUFDO1lBQ0QsU0FBUztnQkFDUCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDOUIsQ0FBQztZQUNELG9CQUFvQixDQUFDLE9BQTJDO2dCQUM5RCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDaEQsQ0FBQztZQUNELGVBQWUsQ0FBQyxZQUE4QjtnQkFDNUMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNoRCxDQUFDO1lBQ0QsVUFBVSxDQUFDLE9BQWdCO2dCQUN6QixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3RDLENBQUM7WUFDRCxVQUFVO2dCQUNSLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUMvQixDQUFDO1lBQ0QsUUFBUTtnQkFDTixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDN0IsQ0FBQztZQUNELFFBQVEsQ0FBQyxLQUFhO2dCQUNwQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xDLENBQUM7WUFDRCxRQUFRO2dCQUNOLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUM3QixDQUFDO1NBQ0Y7UUF0RFksU0FBRyxNQXNEZixDQUFBO1FBQ0QsTUFBYSxXQUFXO1lBQ04sSUFBSSxDQUFVO1lBQ3BCLFlBQVksQ0FBNEI7WUFDbEQsWUFBWSxJQUFZO2dCQUN0QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNuQixDQUFDO1lBQ0QsSUFBVyxXQUFXO2dCQUNwQixPQUFPLENBQ0wsQ0FBQyxJQUFJLENBQUMsWUFBWTtvQkFDaEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQTJCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDbkUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxhQUFhLElBQUksQ0FBQyxJQUFJLDhCQUE4QixDQUFDLENBQ3ZFLENBQUM7WUFDSixDQUFDO1lBQ0QsSUFBVyxJQUFJO2dCQUNiLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNwQyxDQUFDO1lBQ0QsU0FBUyxDQUFDLE9BQWdEO2dCQUN4RCxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxPQUFjLENBQUMsQ0FBQztnQkFDOUMsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3QyxDQUFDO1lBQ0QsY0FBYztnQkFDWixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDM0MsQ0FBQztZQUNELGFBQWE7Z0JBQ1gsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzFDLENBQUM7WUFDRCxXQUFXO2dCQUNULE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN4QyxDQUFDO1lBQ0QsT0FBTztnQkFDTCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDcEMsQ0FBQztZQUNELGVBQWU7Z0JBQ2IsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQzVDLENBQUM7WUFDRCxNQUFNLENBQUMsTUFBMkI7Z0JBQ2hDLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDekMsQ0FBQztZQUNELGVBQWU7Z0JBQ2IsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQzVDLENBQUM7WUFDRCxlQUFlO2dCQUNiLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUM1QyxDQUFDO1lBQ0QsT0FBTztnQkFDTCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDcEMsQ0FBQztZQUNELGFBQWE7Z0JBQ1gsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzFDLENBQUM7WUFDRCxZQUFZLENBQUMsT0FBbUI7Z0JBQzlCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDaEQsQ0FBQztZQUNELGNBQWM7Z0JBQ1osT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQzNDLENBQUM7WUFDRCxPQUFPO2dCQUNMLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNwQyxDQUFDO1lBQ0QsU0FBUztnQkFDUCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDdEMsQ0FBQztZQUNELFFBQVE7Z0JBQ04sT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3JDLENBQUM7WUFDRCxRQUFRLENBQUMsS0FBYTtnQkFDcEIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMxQyxDQUFDO1lBQ0QsVUFBVTtnQkFDUixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDdkMsQ0FBQztZQUNELFVBQVUsQ0FBQyxPQUFnQjtnQkFDekIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM5QyxDQUFDO1NBQ0Y7UUExRVksaUJBQVcsY0EwRXZCLENBQUE7SUFDSCxDQUFDLEVBcGtDZ0IsS0FBSyxHQUFMLFdBQUssS0FBTCxXQUFLLFFBb2tDckI7QUFDSCxDQUFDLEVBcnJFZ0IsS0FBSyxLQUFMLEtBQUssUUFxckVyQiIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9ub2RlX21vZHVsZXMvQHR5cGVzL3hybS9pbmRleC5kLnRzXCIgLz5cbi8qKlxuICogUmVwcmVzZW50cyBhIHBhcmFtZXRlciBmb3IgYSByZXF1ZXN0LlxuICogQHR5cGUge09iamVjdH0gUmVxdWVzdFBhcmFtZXRlclxuICogQHByb3BlcnR5IHtzdHJpbmd9IE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgcGFyYW1ldGVyLlxuICogQHByb3BlcnR5IHsnQm9vbGVhbicgfCAnRGF0ZVRpbWUnIHwgJ0RlY2ltYWwnIHwgJ0VudGl0eScgfCAnRW50aXR5Q29sbGVjdGlvbicgfCAnRW50aXR5UmVmZXJlbmNlJyB8ICdGbG9hdCcgfCAnSW50ZWdlcicgfCAnTW9uZXknIHwgJ1BpY2tsaXN0JyB8ICdTdHJpbmcnfSBUeXBlIC0gVGhlIHR5cGUgb2YgdGhlIHBhcmFtZXRlci5cbiAqIEBwcm9wZXJ0eSB7Kn0gVmFsdWUgLSBUaGUgdmFsdWUgb2YgdGhlIHBhcmFtZXRlci5cbiAqL1xudHlwZSBSZXF1ZXN0UGFyYW1ldGVyID0ge1xuICBOYW1lOiBzdHJpbmc7XG4gIFR5cGU6XG4gICAgfCBcIkJvb2xlYW5cIlxuICAgIHwgXCJEYXRlVGltZVwiXG4gICAgfCBcIkRlY2ltYWxcIlxuICAgIHwgXCJFbnRpdHlcIlxuICAgIHwgXCJFbnRpdHlDb2xsZWN0aW9uXCJcbiAgICB8IFwiRW50aXR5UmVmZXJlbmNlXCJcbiAgICB8IFwiRmxvYXRcIlxuICAgIHwgXCJJbnRlZ2VyXCJcbiAgICB8IFwiTW9uZXlcIlxuICAgIHwgXCJQaWNrbGlzdFwiXG4gICAgfCBcIlN0cmluZ1wiO1xuICBWYWx1ZTogYW55O1xufTtcbi8qKlxuICogUmVwcmVzZW50cyBhIHJlZmVyZW5jZSB0byBhbiBlbnRpdHkuXG4gKiBAdHlwZVxuICogQHByb3BlcnR5IHtzdHJpbmd9IGlkIC0gVGhlIElEIG9mIHRoZSBlbnRpdHkuXG4gKiBAcHJvcGVydHkge3N0cmluZ30gZW50aXR5VHlwZSAtIFRoZSB0eXBlIG9mIHRoZSBlbnRpdHkuXG4gKi9cbnR5cGUgRW50aXR5UmVmZXJlbmNlID0ge1xuICBpZDogc3RyaW5nO1xuICBlbnRpdHlUeXBlOiBzdHJpbmc7XG59O1xuZXhwb3J0IG5hbWVzcGFjZSBYcm1FeCB7XG4gIC8qKlxuICAgKiBUaHJvd3MgYW4gZXJyb3Igd2l0aCB0aGUgZ2l2ZW4gZXJyb3IgbWVzc2FnZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGVycm9yTWVzc2FnZSAtIFRoZSBlcnJvciBtZXNzYWdlIHRvIHRocm93LlxuICAgKiBAdGhyb3dzIHtFcnJvcn0gLSBBbHdheXMgdGhyb3dzIGFuIGVycm9yIHdpdGggdGhlIGdpdmVuIGVycm9yIG1lc3NhZ2UuXG4gICAqL1xuICBleHBvcnQgZnVuY3Rpb24gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2U6IHN0cmluZyk6IG5ldmVyIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgfVxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbmFtZSBvZiB0aGUgY2FsbGluZyBmdW5jdGlvbi5cbiAgICogQHJldHVybnMge3N0cmluZ30gLSBUaGUgbmFtZSBvZiB0aGUgY2FsbGluZyBmdW5jdGlvbi5cbiAgICovXG4gIGV4cG9ydCBmdW5jdGlvbiBnZXRGdW5jdGlvbk5hbWUoKTogc3RyaW5nIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoKTtcbiAgICAgIGNvbnN0IHN0YWNrVHJhY2UgPSBlcnJvci5zdGFjaz8uc3BsaXQoXCJcXG5cIikubWFwKChsaW5lKSA9PiBsaW5lLnRyaW0oKSk7XG4gICAgICBjb25zdCBjYWxsaW5nRnVuY3Rpb25MaW5lID1cbiAgICAgICAgc3RhY2tUcmFjZSAmJiBzdGFja1RyYWNlLmxlbmd0aCA+PSAzID8gc3RhY2tUcmFjZVsyXSA6IHVuZGVmaW5lZDtcbiAgICAgIGNvbnN0IGZ1bmN0aW9uTmFtZU1hdGNoID1cbiAgICAgICAgY2FsbGluZ0Z1bmN0aW9uTGluZT8ubWF0Y2goL2F0XFxzKyhbXlxcc10rKVxccytcXCgvKSB8fFxuICAgICAgICBjYWxsaW5nRnVuY3Rpb25MaW5lPy5tYXRjaCgvYXRcXHMrKFteXFxzXSspLyk7XG4gICAgICBjb25zdCBmdW5jdGlvbk5hbWUgPSBmdW5jdGlvbk5hbWVNYXRjaCA/IGZ1bmN0aW9uTmFtZU1hdGNoWzFdIDogXCJcIjtcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uTmFtZTtcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LmdldEZ1bmN0aW9uTmFtZTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIGVycm9yIG1lc3NhZ2UgZnJvbSBhbiBlcnJvciBvYmplY3QuXG4gICAqIEBwYXJhbSBlcnJvciAtIFRoZSBlcnJvciBvYmplY3QgdG8gcmV0cmlldmUgdGhlIG1lc3NhZ2UgZnJvbS5cbiAgICogQHJldHVybnMgVGhlIGVycm9yIG1lc3NhZ2UuXG4gICAqL1xuICBleHBvcnQgZnVuY3Rpb24gZ2V0RXJyb3JNZXNzYWdlKGVycm9yOiBhbnkpOiBzdHJpbmcge1xuICAgIGxldCBtc2cgPSBlcnJvcixcbiAgICAgIHNlZW4gPSBuZXcgU2V0KCksXG4gICAgICBkZXB0aCA9IDA7XG4gICAgY29uc3QgdmFsaWRKU09OID0gKHQ6IHN0cmluZykgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgSlNPTi5wYXJzZSh0KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH07XG4gICAgd2hpbGUgKG1zZyAmJiBkZXB0aCsrIDwgMjAgJiYgIXNlZW4uaGFzKG1zZykpIHtcbiAgICAgIHNlZW4uYWRkKG1zZyk7XG4gICAgICBpZiAobXNnLnJhdykge1xuICAgICAgICBtc2cgPSBtc2cucmF3O1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmIChtc2cubWVzc2FnZSkge1xuICAgICAgICBtc2cgPSBtc2cubWVzc2FnZTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIG1zZyA9PT0gXCJzdHJpbmdcIiAmJiB2YWxpZEpTT04obXNnKSkge1xuICAgICAgICBtc2cgPSBKU09OLnBhcnNlKG1zZyk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiBtc2c7XG4gIH1cbiAgLyoqXG4gICAqIERpc3BsYXlzIGEgbm90aWZpY2F0aW9uIGZvciBhbiBhcHAgd2l0aCB0aGUgZ2l2ZW4gbWVzc2FnZSBhbmQgbGV2ZWwsIGFuZCBsZXRzIHlvdSBzcGVjaWZ5IHdoZXRoZXIgdG8gc2hvdyBhIGNsb3NlIGJ1dHRvbi5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSBUaGUgbWVzc2FnZSB0byBkaXNwbGF5IGluIHRoZSBub3RpZmljYXRpb24uXG4gICAqIEBwYXJhbSB7J1NVQ0NFU1MnIHwgJ0VSUk9SJyB8ICdXQVJOSU5HJyB8ICdJTkZPJ30gbGV2ZWwgLSBUaGUgbGV2ZWwgb2YgdGhlIG5vdGlmaWNhdGlvbi4gQ2FuIGJlICdTVUNDRVNTJywgJ0VSUk9SJywgJ1dBUk5JTkcnLCBvciAnSU5GTycuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3Nob3dDbG9zZUJ1dHRvbj1mYWxzZV0gLSBXaGV0aGVyIHRvIHNob3cgYSBjbG9zZSBidXR0b24gb24gdGhlIG5vdGlmaWNhdGlvbi4gRGVmYXVsdHMgdG8gZmFsc2UuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IC0gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgSUQgb2YgdGhlIGNyZWF0ZWQgbm90aWZpY2F0aW9uLlxuICAgKi9cbiAgZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZEdsb2JhbE5vdGlmaWNhdGlvbihcbiAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgbGV2ZWw6IFwiU1VDQ0VTU1wiIHwgXCJFUlJPUlwiIHwgXCJXQVJOSU5HXCIgfCBcIklORk9cIixcbiAgICBzaG93Q2xvc2VCdXR0b24gPSBmYWxzZVxuICApOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGxldmVsTWFwID0ge1xuICAgICAgU1VDQ0VTUzogMSxcbiAgICAgIEVSUk9SOiAyLFxuICAgICAgV0FSTklORzogMyxcbiAgICAgIElORk86IDQsXG4gICAgfTtcbiAgICBjb25zdCBtZXNzYWdlTGV2ZWwgPSBsZXZlbE1hcFtsZXZlbF0gfHwgbGV2ZWxNYXAuSU5GTztcbiAgICBjb25zdCBub3RpZmljYXRpb24gPSB7XG4gICAgICB0eXBlOiAyLFxuICAgICAgbGV2ZWw6IG1lc3NhZ2VMZXZlbCxcbiAgICAgIG1lc3NhZ2UsXG4gICAgICBzaG93Q2xvc2VCdXR0b24sXG4gICAgfTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IFhybS5BcHAuYWRkR2xvYmFsTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbik7XG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke2dldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBDbGVhcnMgYSBub3RpZmljYXRpb24gaW4gdGhlIGFwcCB3aXRoIHRoZSBnaXZlbiB1bmlxdWUgSUQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1bmlxdWVJZCAtIFRoZSB1bmlxdWUgSUQgb2YgdGhlIG5vdGlmaWNhdGlvbiB0byBjbGVhci5cbiAgICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gLSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBub3RpZmljYXRpb24gaGFzIGJlZW4gY2xlYXJlZC5cbiAgICovXG4gIGV4cG9ydCBhc3luYyBmdW5jdGlvbiByZW1vdmVHbG9iYWxOb3RpZmljYXRpb24oXG4gICAgdW5pcXVlSWQ6IHN0cmluZ1xuICApOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgWHJtLkFwcC5jbGVhckdsb2JhbE5vdGlmaWNhdGlvbih1bmlxdWVJZCk7XG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke2dldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIHZhbHVlIG9mIGFuIGVudmlyb25tZW50IHZhcmlhYmxlIGJ5IHVzaW5nIGl0cyBzY2hlbWEgbmFtZSBhcyBrZXkuXG4gICAqIElmIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZSBoYXMgYm90aCBhIGRlZmF1bHQgdmFsdWUgYW5kIGEgY3VycmVudCB2YWx1ZSwgdGhpcyBmdW5jdGlvbiB3aWxsIHJldHJpZXZlIHRoZSBjdXJyZW50IHZhbHVlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZW52aXJvbm1lbnRWYXJpYWJsZVNjaGVtYU5hbWUgLSBUaGUgc2NoZW1hIG5hbWUgb2YgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlIHRvIHJldHJpZXZlLlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSAtIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIHZhbHVlIG9mIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZS5cbiAgICogQGFzeW5jXG4gICAqL1xuICBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RW52aXJvbm1lbnRWYXJpYWJsZVZhbHVlKFxuICAgIGVudmlyb25tZW50VmFyaWFibGVTY2hlbWFOYW1lOiBzdHJpbmdcbiAgKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBleGVjdXRlRnVuY3Rpb24oXCJSZXRyaWV2ZUVudmlyb25tZW50VmFyaWFibGVWYWx1ZVwiLCBbXG4gICAgICB7XG4gICAgICAgIE5hbWU6IFwiRGVmaW5pdGlvblNjaGVtYU5hbWVcIixcbiAgICAgICAgVHlwZTogXCJTdHJpbmdcIixcbiAgICAgICAgVmFsdWU6IGVudmlyb25tZW50VmFyaWFibGVTY2hlbWFOYW1lLFxuICAgICAgfSxcbiAgICBdKTtcbiAgICByZXR1cm4gT2JqZWN0Lmhhc093bihyZXNwb25zZSwgXCJWYWx1ZVwiKSA/IHJlc3BvbnNlLlZhbHVlIDogcmVzcG9uc2U7XG4gIH1cbiAgY29uc3QgaXNHdWlkID0gKHZhbHVlOiBzdHJpbmcpOiBib29sZWFuID0+XG4gICAgL15cXHs/WzAtOWEtZkEtRl17OH0oLVswLTlhLWZBLUZdezR9KXszfS1bMC05YS1mQS1GXXsxMn1cXH0/JC8udGVzdCh2YWx1ZSk7XG4gIC8qKlxuICAgKiBBIG1hcCBvZiBDUk0gZGF0YSB0eXBlcyB0byB0aGVpciBjb3JyZXNwb25kaW5nIHR5cGUgbmFtZXMsIHN0cnVjdHVyYWwgcHJvcGVydGllcywgYW5kIEphdmFTY3JpcHQgdHlwZXMuXG4gICAqIEB0eXBlIHtPYmplY3QuPHN0cmluZywgeyB0eXBlTmFtZTogc3RyaW5nLCBzdHJ1Y3R1cmFsUHJvcGVydHk6IG51bWJlciwganNUeXBlOiBzdHJpbmcgfT59XG4gICAqL1xuICBsZXQgdHlwZU1hcCA9IHtcbiAgICBTdHJpbmc6IHsgdHlwZU5hbWU6IFwiRWRtLlN0cmluZ1wiLCBzdHJ1Y3R1cmFsUHJvcGVydHk6IDEsIGpzVHlwZTogXCJzdHJpbmdcIiB9LFxuICAgIEludGVnZXI6IHsgdHlwZU5hbWU6IFwiRWRtLkludDMyXCIsIHN0cnVjdHVyYWxQcm9wZXJ0eTogMSwganNUeXBlOiBcIm51bWJlclwiIH0sXG4gICAgQm9vbGVhbjoge1xuICAgICAgdHlwZU5hbWU6IFwiRWRtLkJvb2xlYW5cIixcbiAgICAgIHN0cnVjdHVyYWxQcm9wZXJ0eTogMSxcbiAgICAgIGpzVHlwZTogXCJib29sZWFuXCIsXG4gICAgfSxcbiAgICBEYXRlVGltZToge1xuICAgICAgdHlwZU5hbWU6IFwiRWRtLkRhdGVUaW1lT2Zmc2V0XCIsXG4gICAgICBzdHJ1Y3R1cmFsUHJvcGVydHk6IDEsXG4gICAgICBqc1R5cGU6IFwib2JqZWN0XCIsXG4gICAgfSxcbiAgICBFbnRpdHlSZWZlcmVuY2U6IHtcbiAgICAgIHR5cGVOYW1lOiBcIm1zY3JtLmNybWJhc2VlbnRpdHlcIixcbiAgICAgIHN0cnVjdHVyYWxQcm9wZXJ0eTogNSxcbiAgICAgIGpzVHlwZTogXCJvYmplY3RcIixcbiAgICB9LFxuICAgIERlY2ltYWw6IHtcbiAgICAgIHR5cGVOYW1lOiBcIkVkbS5EZWNpbWFsXCIsXG4gICAgICBzdHJ1Y3R1cmFsUHJvcGVydHk6IDEsXG4gICAgICBqc1R5cGU6IFwibnVtYmVyXCIsXG4gICAgfSxcbiAgICBFbnRpdHk6IHtcbiAgICAgIHR5cGVOYW1lOiBcIm1zY3JtLmNybWJhc2VlbnRpdHlcIixcbiAgICAgIHN0cnVjdHVyYWxQcm9wZXJ0eTogNSxcbiAgICAgIGpzVHlwZTogXCJvYmplY3RcIixcbiAgICB9LFxuICAgIEVudGl0eUNvbGxlY3Rpb246IHtcbiAgICAgIHR5cGVOYW1lOiBcIkNvbGxlY3Rpb24obXNjcm0uY3JtYmFzZWVudGl0eSlcIixcbiAgICAgIHN0cnVjdHVyYWxQcm9wZXJ0eTogNCxcbiAgICAgIGpzVHlwZTogXCJvYmplY3RcIixcbiAgICB9LFxuICAgIEZsb2F0OiB7IHR5cGVOYW1lOiBcIkVkbS5Eb3VibGVcIiwgc3RydWN0dXJhbFByb3BlcnR5OiAxLCBqc1R5cGU6IFwibnVtYmVyXCIgfSxcbiAgICBNb25leTogeyB0eXBlTmFtZTogXCJFZG0uRGVjaW1hbFwiLCBzdHJ1Y3R1cmFsUHJvcGVydHk6IDEsIGpzVHlwZTogXCJudW1iZXJcIiB9LFxuICAgIFBpY2tsaXN0OiB7XG4gICAgICB0eXBlTmFtZTogXCJFZG0uSW50MzJcIixcbiAgICAgIHN0cnVjdHVyYWxQcm9wZXJ0eTogMSxcbiAgICAgIGpzVHlwZTogXCJudW1iZXJcIixcbiAgICB9LFxuICB9O1xuICBleHBvcnQgZnVuY3Rpb24gZ2V0U3RydWN0dXJhbFByb3BlcnR5KHZhbHVlOiBhbnkpOiBudW1iZXIge1xuICAgIGNvbnN0IHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gICAgaWYgKHR5cGUgPT0gXCJzdHJpbmdcIiB8fCB0eXBlID09IFwibnVtYmVyXCIgfHwgdHlwZSA9PSBcImJvb2xlYW5cIikgcmV0dXJuIDE7XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkgcmV0dXJuIDE7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSByZXR1cm4gNDtcbiAgICByZXR1cm4gNTtcbiAgfVxuICBleHBvcnQgZnVuY3Rpb24gZ2V0VHlwZU5hbWUodmFsdWU6IGFueSk6IHN0cmluZyB7XG4gICAgY29uc3QgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgICBpZiAodHlwZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgaWYgKGlzR3VpZCh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIFwibXNjcm0uY3JtYmFzZWVudGl0eVwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFwiRWRtLlN0cmluZ1wiO1xuICAgIH1cbiAgICBpZiAodHlwZSA9PT0gXCJudW1iZXJcIikgcmV0dXJuIFwiRWRtLkludDMyXCI7IC8vIERlZmF1bHQgdG8gSW50MzIgZm9yIG51bWJlcnNcbiAgICBpZiAodHlwZSA9PT0gXCJib29sZWFuXCIpIHJldHVybiBcIkVkbS5Cb29sZWFuXCI7XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkgcmV0dXJuIFwiRWRtLkRhdGVUaW1lT2Zmc2V0XCI7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSByZXR1cm4gXCJDb2xsZWN0aW9uKG1zY3JtLmNybWJhc2VlbnRpdHkpXCI7XG4gICAgcmV0dXJuIFwibXNjcm0uY3JtYmFzZWVudGl0eVwiOyAvLyBEZWZhdWx0IGZvciBvYmplY3RzIGFuZCB1bmtub3duIHR5cGVzXG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGEgcmVxdWVzdCBvYmplY3QgZm9yIHVzZSB3aXRoIFhybS5XZWJBcGkub25saW5lLmV4ZWN1dGUgb3IgZXhlY3V0ZU11bHRpcGxlLlxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGV4dHJhY3RzIHRoZSBsb2dpYyB0byBwcmVwYXJlIHBhcmFtZXRlcnMgYW5kIGNyZWF0ZVxuICAgKiB0aGUgcmVxdWVzdCBvYmplY3Qgd2l0aG91dCBleGVjdXRpbmcgaXQuIFlvdSBjYW46XG4gICAqIC0gRGlyZWN0bHkgZXhlY3V0ZSB0aGUgcmV0dXJuZWQgcmVxdWVzdCBvYmplY3QgdXNpbmcgYFhybS5XZWJBcGkub25saW5lLmV4ZWN1dGUoKWAuXG4gICAqIC0gVXNlIHRoZSByZXF1ZXN0IG9iamVjdCBsYXRlciB3aXRoIGBYcm0uV2ViQXBpLm9ubGluZS5leGVjdXRlTXVsdGlwbGUoKWAuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhY3Rpb25OYW1lIC0gVGhlIHVuaXF1ZSBuYW1lIG9mIHRoZSByZXF1ZXN0IChhY3Rpb24vZnVuY3Rpb24vQ1JVRCBvcGVyYXRpb24pLlxuICAgKiBAcGFyYW0ge1JlcXVlc3RQYXJhbWV0ZXJbXSB8IHtba2V5OiBzdHJpbmddOiBhbnl9fSByZXF1ZXN0UGFyYW1ldGVycyAtIEFuIGFycmF5IG9mIHJlcXVlc3QgcGFyYW1ldGVycyBvciBhbiBvYmplY3QgcmVwcmVzZW50aW5nIGtleS12YWx1ZSBwYWlycyBvZiByZXF1ZXN0IHBhcmFtZXRlcnMuXG4gICAqICAgLSBJZiBhbiBhcnJheSBvZiBgUmVxdWVzdFBhcmFtZXRlcltdYCBpcyBwcm92aWRlZCwgZWFjaCBlbGVtZW50IHNob3VsZCBoYXZlIGBOYW1lYCwgYFR5cGVgLCBhbmQgYFZhbHVlYCBmaWVsZHMgZGVzY3JpYmluZyB0aGUgcmVxdWVzdCBwYXJhbWV0ZXIuXG4gICAqICAgLSBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQsIGl0cyBrZXlzIHJlcHJlc2VudCBwYXJhbWV0ZXIgbmFtZXMsIGFuZCB2YWx1ZXMgcmVwcmVzZW50IHRoZSBwYXJhbWV0ZXIgdmFsdWVzLlxuICAgKiBAcGFyYW0ge251bWJlcn0gb3BlcmF0aW9uVHlwZSAtIFRoZSB0eXBlIG9mIHRoZSByZXF1ZXN0LiBVc2U6XG4gICAqICAgLSBgMGAgZm9yIEFjdGlvblxuICAgKiAgIC0gYDFgIGZvciBGdW5jdGlvblxuICAgKiAgIC0gYDJgIGZvciBDUlVEXG4gICAqIEBwYXJhbSB7RW50aXR5UmVmZXJlbmNlfSBbYm91bmRFbnRpdHldIC0gQW4gb3B0aW9uYWwgYEVudGl0eVJlZmVyZW5jZWAgaW5kaWNhdGluZyB0aGUgZW50aXR5IHRoZSByZXF1ZXN0IGlzIGJvdW5kIHRvLlxuICAgKlxuICAgKiBAcmV0dXJucyB7b2JqZWN0fSAtIFRoZSByZXF1ZXN0IG9iamVjdCB0aGF0IGNhbiBiZSBwYXNzZWQgaW50byBgWHJtLldlYkFwaS5vbmxpbmUuZXhlY3V0ZWAgb3IgYFhybS5XZWJBcGkub25saW5lLmV4ZWN1dGVNdWx0aXBsZWAuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIC8vIEJ1aWxkIGEgcmVxdWVzdCBvYmplY3QgZm9yIGEgY3VzdG9tIGFjdGlvbiBcIm5ld19Eb1NvbWV0aGluZ1wiIChvcGVyYXRpb25UeXBlID0gMCBmb3IgYWN0aW9ucylcbiAgICogY29uc3QgcmVxdWVzdCA9IGJ1aWxkUmVxdWVzdE9iamVjdChcIm5ld19Eb1NvbWV0aGluZ1wiLCB7IHBhcmFtMTogXCJ2YWx1ZTFcIiwgcGFyYW0yOiAxMjMgfSwgMCk7XG4gICAqXG4gICAqIC8vIEV4ZWN1dGUgdGhlIHJlcXVlc3QgaW1tZWRpYXRlbHlcbiAgICogY29uc3QgcmVzdWx0ID0gYXdhaXQgWHJtLldlYkFwaS5vbmxpbmUuZXhlY3V0ZShyZXF1ZXN0KTtcbiAgICpcbiAgICogLy8gT3Igc3RvcmUgdGhlIHJlcXVlc3QgYW5kIGV4ZWN1dGUgaXQgbGF0ZXIgdXNpbmcgZXhlY3V0ZU11bHRpcGxlXG4gICAqIGNvbnN0IHJlcXVlc3RzID0gW3JlcXVlc3QsIGFub3RoZXJSZXF1ZXN0XTtcbiAgICogY29uc3QgYmF0Y2hSZXN1bHQgPSBhd2FpdCBYcm0uV2ViQXBpLm9ubGluZS5leGVjdXRlTXVsdGlwbGUocmVxdWVzdHMpO1xuICAgKi9cbiAgZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUmVxdWVzdE9iamVjdChcbiAgICBhY3Rpb25OYW1lOiBzdHJpbmcsXG4gICAgcmVxdWVzdFBhcmFtZXRlcnM6IFJlcXVlc3RQYXJhbWV0ZXJbXSB8IHsgW2tleTogc3RyaW5nXTogYW55IH0sXG4gICAgb3BlcmF0aW9uVHlwZTogbnVtYmVyLFxuICAgIGJvdW5kRW50aXR5PzogRW50aXR5UmVmZXJlbmNlXG4gICkge1xuICAgIGNvbnN0IHByZXBhcmVQYXJhbWV0ZXJEZWZpbml0aW9uID0gKFxuICAgICAgcGFyYW1zOiBSZXF1ZXN0UGFyYW1ldGVyW10gfCB7IFtrZXk6IHN0cmluZ106IGFueSB9XG4gICAgKSA9PiB7XG4gICAgICBjb25zdCBwYXJhbWV0ZXJEZWZpbml0aW9uOiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge307XG4gICAgICBjb25zdCBwID0gQXJyYXkuaXNBcnJheShwYXJhbXMpID8gWy4uLnBhcmFtc10gOiB7IC4uLnBhcmFtcyB9O1xuXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShwKSkge1xuICAgICAgICBwLmZvckVhY2goKHBhcmFtKSA9PiB7XG4gICAgICAgICAgcGFyYW1ldGVyRGVmaW5pdGlvbltwYXJhbS5OYW1lXSA9IHtcbiAgICAgICAgICAgIHR5cGVOYW1lOiB0eXBlTWFwW3BhcmFtLlR5cGVdLnR5cGVOYW1lLFxuICAgICAgICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiB0eXBlTWFwW3BhcmFtLlR5cGVdLnN0cnVjdHVyYWxQcm9wZXJ0eSxcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIE9iamVjdC5rZXlzKHApLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgIHBhcmFtZXRlckRlZmluaXRpb25ba2V5XSA9IHtcbiAgICAgICAgICAgIHN0cnVjdHVyYWxQcm9wZXJ0eTogZ2V0U3RydWN0dXJhbFByb3BlcnR5KHBba2V5XSksXG4gICAgICAgICAgICB0eXBlTmFtZTogZ2V0VHlwZU5hbWUocFtrZXldKSxcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBhcmFtZXRlckRlZmluaXRpb247XG4gICAgfTtcblxuICAgIGNvbnN0IGNyZWF0ZVJlcXVlc3QgPSAoXG4gICAgICBwYXJhbXM6IFJlcXVlc3RQYXJhbWV0ZXJbXSB8IHsgW2tleTogc3RyaW5nXTogYW55IH0sXG4gICAgICBkZWZpbml0aW9uOiB7IFtrZXk6IHN0cmluZ106IGFueSB9XG4gICAgKSA9PiB7XG4gICAgICBjb25zdCBtZXRhZGF0YSA9IHtcbiAgICAgICAgYm91bmRQYXJhbWV0ZXI6IGJvdW5kRW50aXR5ID8gXCJlbnRpdHlcIiA6IG51bGwsXG4gICAgICAgIG9wZXJhdGlvblR5cGU6IG9wZXJhdGlvblR5cGUsXG4gICAgICAgIG9wZXJhdGlvbk5hbWU6IGFjdGlvbk5hbWUsXG4gICAgICAgIHBhcmFtZXRlclR5cGVzOiBkZWZpbml0aW9uLFxuICAgICAgfTtcbiAgICAgIGNvbnN0IG1lcmdlZFBhcmFtcyA9IEFycmF5LmlzQXJyYXkocGFyYW1zKVxuICAgICAgICA/IE9iamVjdC5hc3NpZ24oe30sIC4uLnBhcmFtcy5tYXAoKHApID0+ICh7IFtwLk5hbWVdOiBwLlZhbHVlIH0pKSlcbiAgICAgICAgOiBwYXJhbXM7XG5cbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHsgZ2V0TWV0YWRhdGE6ICgpID0+IG1ldGFkYXRhIH0sIG1lcmdlZFBhcmFtcyk7XG4gICAgfTtcbiAgICBpZiAoYm91bmRFbnRpdHkpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHJlcXVlc3RQYXJhbWV0ZXJzKSkge1xuICAgICAgICByZXF1ZXN0UGFyYW1ldGVycy5wdXNoKHtcbiAgICAgICAgICBOYW1lOiBcImVudGl0eVwiLFxuICAgICAgICAgIFZhbHVlOiBib3VuZEVudGl0eSxcbiAgICAgICAgICBUeXBlOiBcIkVudGl0eVJlZmVyZW5jZVwiLFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcXVlc3RQYXJhbWV0ZXJzW1wiZW50aXR5XCJdID0gYm91bmRFbnRpdHk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcGFyYW1ldGVyRGVmaW5pdGlvbiA9IHByZXBhcmVQYXJhbWV0ZXJEZWZpbml0aW9uKHJlcXVlc3RQYXJhbWV0ZXJzKTtcbiAgICBjb25zdCByZXF1ZXN0ID0gY3JlYXRlUmVxdWVzdChyZXF1ZXN0UGFyYW1ldGVycywgcGFyYW1ldGVyRGVmaW5pdGlvbik7XG4gICAgcmV0dXJuIHJlcXVlc3Q7XG4gIH1cblxuICAvKipcbiAgICogRXhlY3V0ZXMgYSByZXF1ZXN0LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYWN0aW9uTmFtZSAtIFRoZSB1bmlxdWUgbmFtZSBvZiB0aGUgcmVxdWVzdC5cbiAgICogQHBhcmFtIHtSZXF1ZXN0UGFyYW1ldGVyW10gfCBvYmplY3R9IHJlcXVlc3RQYXJhbWV0ZXJzIC0gQW4gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoIHRoZSBwYXJhbWV0ZXIgbmFtZSwgdHlwZSwgYW5kIHZhbHVlLlxuICAgKiBAcGFyYW0ge0VudGl0eVJlZmVyZW5jZX0gW2JvdW5kRW50aXR5XSAtIEFuIG9wdGlvbmFsIEVudGl0eVJlZmVyZW5jZSBvZiB0aGUgYm91bmQgZW50aXR5LlxuICAgKiBAcGFyYW0ge251bWJlcn0gW29wZXJhdGlvblR5cGU9MV0gLSBUaGUgdHlwZSBvZiB0aGUgcmVxdWVzdC4gMCBmb3IgYWN0aW9ucywgMSBmb3IgZnVuY3Rpb25zLCAyIGZvciBDUlVEIG9wZXJhdGlvbnMuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59IC0gQSBQcm9taXNlIHdpdGggdGhlIHJlcXVlc3QgcmVzcG9uc2UuXG4gICAqIEB0aHJvd3Mge0Vycm9yfSAtIFRocm93cyBhbiBlcnJvciBpZiB0aGUgcmVxdWVzdCBwYXJhbWV0ZXIgaXMgbm90IG9mIGEgc3VwcG9ydGVkIHR5cGUgb3IgaGFzIGFuIGludmFsaWQgdmFsdWUuXG4gICAqL1xuICBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZShcbiAgICBhY3Rpb25OYW1lOiBzdHJpbmcsXG4gICAgcmVxdWVzdFBhcmFtZXRlcnM6IFJlcXVlc3RQYXJhbWV0ZXJbXSB8IHsgW2tleTogc3RyaW5nXTogYW55IH0sXG4gICAgYm91bmRFbnRpdHk/OiBFbnRpdHlSZWZlcmVuY2UsXG4gICAgb3BlcmF0aW9uVHlwZTogbnVtYmVyID0gMVxuICApOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBidWlsZFJlcXVlc3RPYmplY3QoXG4gICAgICBhY3Rpb25OYW1lLFxuICAgICAgcmVxdWVzdFBhcmFtZXRlcnMsXG4gICAgICBvcGVyYXRpb25UeXBlLFxuICAgICAgYm91bmRFbnRpdHlcbiAgICApO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IFhybS5XZWJBcGkub25saW5lLmV4ZWN1dGUocmVxdWVzdCk7XG4gICAgaWYgKHJlc3VsdC5vaykgcmV0dXJuIHJlc3VsdC5qc29uKCkuY2F0Y2goKCkgPT4gcmVzdWx0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlcyBhbiBBY3Rpb24uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhY3Rpb25OYW1lIC0gVGhlIHVuaXF1ZSBuYW1lIG9mIHRoZSBhY3Rpb24uXG4gICAqIEBwYXJhbSB7UmVxdWVzdFBhcmFtZXRlcltdIHwgb2JqZWN0fSByZXF1ZXN0UGFyYW1ldGVycyAtIEFuIGFycmF5IG9mIG9iamVjdHMgd2l0aCB0aGUgcGFyYW1ldGVyIG5hbWUsIHR5cGUsIGFuZCB2YWx1ZS5cbiAgICogQHBhcmFtIHtFbnRpdHlSZWZlcmVuY2V9IFtib3VuZEVudGl0eV0gLSBBbiBvcHRpb25hbCBFbnRpdHlSZWZlcmVuY2Ugb2YgdGhlIGJvdW5kIGVudGl0eS5cbiAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn0gLSBBIFByb21pc2Ugd2l0aCB0aGUgcmVxdWVzdCByZXNwb25zZS5cbiAgICogQHRocm93cyB7RXJyb3J9IC0gVGhyb3dzIGFuIGVycm9yIGlmIHRoZSByZXF1ZXN0IHBhcmFtZXRlciBpcyBub3Qgb2YgYSBzdXBwb3J0ZWQgdHlwZSBvciBoYXMgYW4gaW52YWxpZCB2YWx1ZS5cbiAgICovXG4gIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBleGVjdXRlQWN0aW9uKFxuICAgIGZ1bmN0aW9uTmFtZTogc3RyaW5nLFxuICAgIHJlcXVlc3RQYXJhbWV0ZXJzOiBSZXF1ZXN0UGFyYW1ldGVyW10gfCBvYmplY3QsXG4gICAgYm91bmRFbnRpdHk/OiBFbnRpdHlSZWZlcmVuY2VcbiAgKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gYXdhaXQgZXhlY3V0ZShmdW5jdGlvbk5hbWUsIHJlcXVlc3RQYXJhbWV0ZXJzLCBib3VuZEVudGl0eSwgMCk7XG4gIH1cblxuICAvKipcbiAgICogRXhlY3V0ZXMgYSBGdW5jdGlvbi5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGZ1bmN0aW9uTmFtZSAtIFRoZSB1bmlxdWUgbmFtZSBvZiB0aGUgZnVuY3Rpb24uXG4gICAqIEBwYXJhbSB7UmVxdWVzdFBhcmFtZXRlcltdIHwgb2JqZWN0fSByZXF1ZXN0UGFyYW1ldGVycyAtIEFuIGFycmF5IG9mIG9iamVjdHMgd2l0aCB0aGUgcGFyYW1ldGVyIG5hbWUsIHR5cGUgYW5kIHZhbHVlLlxuICAgKiBAcGFyYW0ge0VudGl0eVJlZmVyZW5jZX0gW2JvdW5kRW50aXR5XSAtIEFuIG9wdGlvbmFsIEVudGl0eVJlZmVyZW5jZSBvZiB0aGUgYm91bmQgZW50aXR5LlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fSAtIEEgUHJvbWlzZSB3aXRoIHRoZSByZXF1ZXN0IHJlc3BvbnNlLlxuICAgKiBAdGhyb3dzIHtFcnJvcn0gLSBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlIHJlcXVlc3QgcGFyYW1ldGVyIGlzIG5vdCBvZiBhIHN1cHBvcnRlZCB0eXBlIG9yIGhhcyBhbiBpbnZhbGlkIHZhbHVlLlxuICAgKi9cbiAgZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVGdW5jdGlvbihcbiAgICBmdW5jdGlvbk5hbWU6IHN0cmluZyxcbiAgICByZXF1ZXN0UGFyYW1ldGVyczogUmVxdWVzdFBhcmFtZXRlcltdIHwgb2JqZWN0LFxuICAgIGJvdW5kRW50aXR5PzogRW50aXR5UmVmZXJlbmNlXG4gICk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIGF3YWl0IGV4ZWN1dGUoZnVuY3Rpb25OYW1lLCByZXF1ZXN0UGFyYW1ldGVycywgYm91bmRFbnRpdHksIDEpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGVzIGEgQ1JVRCByZXF1ZXN0LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZU5hbWUgLSBUaGUgdW5pcXVlIG5hbWUgb2YgdGhlIHJlcXVlc3QuXG4gICAqIEBwYXJhbSB7UmVxdWVzdFBhcmFtZXRlcltdIHwgb2JqZWN0fSByZXF1ZXN0UGFyYW1ldGVycyAtIEFuIGFycmF5IG9mIG9iamVjdHMgd2l0aCB0aGUgcGFyYW1ldGVyIG5hbWUsIHR5cGUsIGFuZCB2YWx1ZS5cbiAgICogQHBhcmFtIHtFbnRpdHlSZWZlcmVuY2V9IFtib3VuZEVudGl0eV0gLSBBbiBvcHRpb25hbCBFbnRpdHlSZWZlcmVuY2Ugb2YgdGhlIGJvdW5kIGVudGl0eS5cbiAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn0gLSBBIFByb21pc2Ugd2l0aCB0aGUgcmVxdWVzdCByZXNwb25zZS5cbiAgICogQHRocm93cyB7RXJyb3J9IC0gVGhyb3dzIGFuIGVycm9yIGlmIHRoZSByZXF1ZXN0IHBhcmFtZXRlciBpcyBub3Qgb2YgYSBzdXBwb3J0ZWQgdHlwZSBvciBoYXMgYW4gaW52YWxpZCB2YWx1ZS5cbiAgICovXG4gIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBleGVjdXRlQ1JVRChcbiAgICBmdW5jdGlvbk5hbWU6IHN0cmluZyxcbiAgICByZXF1ZXN0UGFyYW1ldGVyczogUmVxdWVzdFBhcmFtZXRlcltdIHwgb2JqZWN0LFxuICAgIGJvdW5kRW50aXR5PzogRW50aXR5UmVmZXJlbmNlXG4gICk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIGF3YWl0IGV4ZWN1dGUoZnVuY3Rpb25OYW1lLCByZXF1ZXN0UGFyYW1ldGVycywgYm91bmRFbnRpdHksIDIpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ha2VzIGEgR1VJRCBsb3dlcmNhc2UgYW5kIHJlbW92ZXMgYnJhY2tldHMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBndWlkIC0gVGhlIEdVSUQgdG8gbm9ybWFsaXplLlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIFRoZSBub3JtYWxpemVkIEdVSUQuXG4gICAqL1xuICBleHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplR3VpZChndWlkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICh0eXBlb2YgZ3VpZCAhPT0gXCJzdHJpbmdcIilcbiAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXgubm9ybWFsaXplR3VpZDpcXG4nJHtndWlkfScgaXMgbm90IGEgc3RyaW5nYCk7XG4gICAgcmV0dXJuIGd1aWQudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9be31dL2csIFwiXCIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdyYXBzIGEgZnVuY3Rpb24gdGhhdCB0YWtlcyBhIGNhbGxiYWNrIGFzIGl0cyBsYXN0IHBhcmFtZXRlciBhbmQgcmV0dXJucyBhIFByb21pc2UuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIHRoZSBmdW5jdGlvbiB0byB3cmFwXG4gICAqIEBwYXJhbSBjb250ZXh0IHRoZSBwYXJlbnQgcHJvcGVydHkgb2YgdGhlIGZ1bmN0aW9uIGYuZS4gZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzIGZvciBmb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MuZ2V0RW5hYmxlZFByb2Nlc3Nlc1xuICAgKiBAcGFyYW0gYXJncyB0aGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIGZ1bmN0aW9uXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59IGEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIGNhbGxiYWNrIHJlc3BvbnNlXG4gICAqL1xuICBleHBvcnQgZnVuY3Rpb24gYXNQcm9taXNlPFQ+KGZuOiBGdW5jdGlvbiwgY29udGV4dCwgLi4uYXJncyk6IFByb21pc2U8VD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxUPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBjYWxsYmFjayA9IChyZXNwb25zZTogVCkgPT4ge1xuICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgIH07XG4gICAgICB0cnkge1xuICAgICAgICAvLyBDYWxsIHRoZSBmdW5jdGlvbiB3aXRoIHRoZSBhcmd1bWVudHMgYW5kIHRoZSBjYWxsYmFjayBhdCB0aGUgZW5kXG4gICAgICAgIGZuLmNhbGwoY29udGV4dCwgLi4uYXJncywgY2FsbGJhY2spO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICAvKipcbiAgICogT3BlbnMgYSBkaWFsb2cgd2l0aCBkeW5hbWljIGhlaWdodCBhbmQgd2lkdGggYmFzZWQgb24gdGV4dCBjb250ZW50LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGl0bGUgLSBUaGUgdGl0bGUgb2YgdGhlIGRpYWxvZy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBUaGUgdGV4dCBjb250ZW50IG9mIHRoZSBkaWFsb2cuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59IC0gQSBQcm9taXNlIHdpdGggdGhlIGRpYWxvZyByZXNwb25zZS5cbiAgICovXG4gIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcGVuQWxlcnREaWFsb2coXG4gICAgdGl0bGU6IHN0cmluZyxcbiAgICB0ZXh0OiBzdHJpbmdcbiAgKTogUHJvbWlzZTxhbnk+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgcm93cyA9IHRleHQuc3BsaXQoL1xcclxcbnxcXHJ8XFxuLyk7XG4gICAgICBsZXQgYWRkaXRpb25hbFJvd3MgPSAwO1xuICAgICAgcm93cy5mb3JFYWNoKChyb3cpID0+IHtcbiAgICAgICAgbGV0IHdpZHRoID0gZ2V0VGV4dFdpZHRoKFxuICAgICAgICAgIHJvdyxcbiAgICAgICAgICBcIjFyZW0gU2Vnb2UgVUkgUmVndWxhciwgU2Vnb2VVSSwgU2Vnb2UgVUlcIlxuICAgICAgICApO1xuICAgICAgICBpZiAod2lkdGggPiA5NDApIHtcbiAgICAgICAgICBhZGRpdGlvbmFsUm93cyArPSB3aWR0aCAvIDk0MDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBjb25zdCBsb25nZXN0Um93ID0gcm93cy5yZWR1Y2UoXG4gICAgICAgIChhY2MsIHJvdykgPT4gKHJvdy5sZW5ndGggPiBhY2MubGVuZ3RoID8gcm93IDogYWNjKSxcbiAgICAgICAgXCJcIlxuICAgICAgKTtcbiAgICAgIGNvbnN0IHdpZHRoID0gTWF0aC5taW4oXG4gICAgICAgIGdldFRleHRXaWR0aChsb25nZXN0Um93LCBcIjFyZW0gU2Vnb2UgVUkgUmVndWxhciwgU2Vnb2VVSSwgU2Vnb2UgVUlcIiksXG4gICAgICAgIDEwMDBcbiAgICAgICk7XG4gICAgICBjb25zdCBoZWlnaHQgPSAxMDkgKyAocm93cy5sZW5ndGggKyBhZGRpdGlvbmFsUm93cykgKiAyMDtcbiAgICAgIHJldHVybiBhd2FpdCBYcm0uTmF2aWdhdGlvbi5vcGVuQWxlcnREaWFsb2coXG4gICAgICAgIHtcbiAgICAgICAgICBjb25maXJtQnV0dG9uTGFiZWw6IFwiT2tcIixcbiAgICAgICAgICB0ZXh0LFxuICAgICAgICAgIHRpdGxlLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgIHdpZHRoLFxuICAgICAgICB9XG4gICAgICApO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IubWVzc2FnZSk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7Z2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXNlcyBjYW52YXMubWVhc3VyZVRleHQgdG8gY29tcHV0ZSBhbmQgcmV0dXJuIHRoZSB3aWR0aCBvZiB0aGUgZ2l2ZW4gdGV4dCBvZiBnaXZlbiBmb250IGluIHBpeGVscy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0IFRoZSB0ZXh0IHRvIGJlIHJlbmRlcmVkLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBmb250IFRoZSBjc3MgZm9udCBkZXNjcmlwdG9yIHRoYXQgdGV4dCBpcyB0byBiZSByZW5kZXJlZCB3aXRoIChlLmcuIFwiYm9sZCAxNHB4IHZlcmRhbmFcIikuXG4gICAgICpcbiAgICAgKiBAc2VlIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzExODI0MS9jYWxjdWxhdGUtdGV4dC13aWR0aC13aXRoLWphdmFzY3JpcHQvMjEwMTUzOTMjMjEwMTUzOTNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBnZXRUZXh0V2lkdGgodGV4dDogc3RyaW5nLCBmb250OiBzdHJpbmcpIHtcbiAgICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG4gICAgICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgIGNvbnRleHQuZm9udCA9IGZvbnQ7XG4gICAgICBjb25zdCBtZXRyaWNzID0gY29udGV4dC5tZWFzdXJlVGV4dCh0ZXh0KTtcbiAgICAgIHJldHVybiBtZXRyaWNzLndpZHRoO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyBhbiBlcnJvciBkaWFsb2cgd2l0aCB0aGUgc3BlY2lmaWVkIGVycm9yIGluZm9ybWF0aW9uLlxuICAgKiBAcGFyYW0gZXJyb3IgVGhlIGVycm9yIG9iamVjdCBjb250YWluaW5nIGRldGFpbHMgYWJvdXQgdGhlIGVycm9yLlxuICAgKi9cbiAgZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9wZW5FcnJvckRpYWxvZyhlcnJvcjogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBhd2FpdCBYcm0uTmF2aWdhdGlvbi5vcGVuRXJyb3JEaWFsb2coe1xuICAgICAgICBtZXNzYWdlOiBnZXRFcnJvck1lc3NhZ2UoZXJyb3IpLFxuICAgICAgICBkZXRhaWxzOiBKU09OLnN0cmluZ2lmeShlcnJvciwgbnVsbCwgNCksXG4gICAgICAgIGVycm9yQ29kZTogZXJyb3I/LmVycm9yQ29kZSxcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IubWVzc2FnZSk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7Z2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICB9XG4gIH1cblxuICBleHBvcnQgY2xhc3MgUHJvY2VzcyB7XG4gICAgc3RhdGljIGdldCBkYXRhKCkge1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzO1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0IHVpKCkge1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQudWkucHJvY2VzcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXNlIHRoaXMgdG8gYWRkIGEgZnVuY3Rpb24gYXMgYW4gZXZlbnQgaGFuZGxlciBmb3IgdGhlIE9uUHJlUHJvY2Vzc1N0YXR1c0NoYW5nZSBldmVudCBzbyB0aGF0IGl0IHdpbGwgYmUgY2FsbGVkIGJlZm9yZSB0aGVcbiAgICAgKiBidXNpbmVzcyBwcm9jZXNzIGZsb3cgc3RhdHVzIGNoYW5nZXMuXG4gICAgICogQHBhcmFtIGhhbmRsZXIgVGhlIGZ1bmN0aW9uIHdpbGwgYmUgYWRkZWQgdG8gdGhlIGJvdHRvbSBvZiB0aGUgZXZlbnRcbiAgICAgKiAgICAgICAgICAgICAgICBoYW5kbGVyIHBpcGVsaW5lLiBUaGUgZXhlY3V0aW9uIGNvbnRleHQgaXMgYXV0b21hdGljYWxseVxuICAgICAqICAgICAgICAgICAgICAgIHNldCB0byBiZSB0aGUgZmlyc3QgcGFyYW1ldGVyIHBhc3NlZCB0byB0aGUgZXZlbnQgaGFuZGxlci5cbiAgICAgKiAgICAgICAgICAgICAgICBVc2UgYSByZWZlcmVuY2UgdG8gYSBuYW1lZCBmdW5jdGlvbiByYXRoZXIgdGhhbiBhblxuICAgICAqICAgICAgICAgICAgICAgIGFub255bW91cyBmdW5jdGlvbiBpZiB5b3UgbWF5IGxhdGVyIHdhbnQgdG8gcmVtb3ZlIHRoZVxuICAgICAqICAgICAgICAgICAgICAgIGV2ZW50IGhhbmRsZXIuXG4gICAgICovXG4gICAgc3RhdGljIGFkZE9uUHJlUHJvY2Vzc1N0YXR1c0NoYW5nZShcbiAgICAgIGhhbmRsZXI6IFhybS5FdmVudHMuUHJvY2Vzc1N0YXR1c0NoYW5nZUhhbmRsZXJcbiAgICApIHtcbiAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLnJlbW92ZU9uUHJlUHJvY2Vzc1N0YXR1c0NoYW5nZShoYW5kbGVyKTtcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5hZGRPblByZVByb2Nlc3NTdGF0dXNDaGFuZ2UoaGFuZGxlcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVzZSB0aGlzIHRvIGFkZCBhIGZ1bmN0aW9uIGFzIGFuIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBPblByZVN0YWdlQ2hhbmdlIGV2ZW50IHNvIHRoYXQgaXQgd2lsbCBiZSBjYWxsZWQgYmVmb3JlIHRoZVxuICAgICAqIGJ1c2luZXNzIHByb2Nlc3MgZmxvdyBzdGFnZSBjaGFuZ2VzLlxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGFkZGVkIHRvIHRoZSBib3R0b20gb2YgdGhlIGV2ZW50XG4gICAgICogICAgICAgICAgICAgICAgaGFuZGxlciBwaXBlbGluZS4gVGhlIGV4ZWN1dGlvbiBjb250ZXh0IGlzIGF1dG9tYXRpY2FsbHlcbiAgICAgKiAgICAgICAgICAgICAgICBzZXQgdG8gYmUgdGhlIGZpcnN0IHBhcmFtZXRlciBwYXNzZWQgdG8gdGhlIGV2ZW50IGhhbmRsZXIuXG4gICAgICogICAgICAgICAgICAgICAgVXNlIGEgcmVmZXJlbmNlIHRvIGEgbmFtZWQgZnVuY3Rpb24gcmF0aGVyIHRoYW4gYW5cbiAgICAgKiAgICAgICAgICAgICAgICBhbm9ueW1vdXMgZnVuY3Rpb24gaWYgeW91IG1heSBsYXRlciB3YW50IHRvIHJlbW92ZSB0aGVcbiAgICAgKiAgICAgICAgICAgICAgICBldmVudCBoYW5kbGVyLlxuICAgICAqL1xuICAgIHN0YXRpYyBhZGRPblByZVN0YWdlQ2hhbmdlKGhhbmRsZXI6IFhybS5FdmVudHMuU3RhZ2VDaGFuZ2VFdmVudEhhbmRsZXIpIHtcbiAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLnJlbW92ZU9uUHJlU3RhZ2VDaGFuZ2UoaGFuZGxlcik7XG4gICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MuYWRkT25QcmVTdGFnZUNoYW5nZShoYW5kbGVyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXNlIHRoaXMgdG8gYWRkIGEgZnVuY3Rpb24gYXMgYW4gZXZlbnQgaGFuZGxlciBmb3IgdGhlIE9uUHJlUHJvY2Vzc1N0YXR1c0NoYW5nZSBldmVudCBzbyB0aGF0IGl0IHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhlXG4gICAgICogYnVzaW5lc3MgcHJvY2VzcyBmbG93IHN0YXR1cyBjaGFuZ2VzLlxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGFkZGVkIHRvIHRoZSBib3R0b20gb2YgdGhlIGV2ZW50XG4gICAgICogICAgICAgICAgICAgICAgaGFuZGxlciBwaXBlbGluZS4gVGhlIGV4ZWN1dGlvbiBjb250ZXh0IGlzIGF1dG9tYXRpY2FsbHlcbiAgICAgKiAgICAgICAgICAgICAgICBzZXQgdG8gYmUgdGhlIGZpcnN0IHBhcmFtZXRlciBwYXNzZWQgdG8gdGhlIGV2ZW50IGhhbmRsZXIuXG4gICAgICogICAgICAgICAgICAgICAgVXNlIGEgcmVmZXJlbmNlIHRvIGEgbmFtZWQgZnVuY3Rpb24gcmF0aGVyIHRoYW4gYW5cbiAgICAgKiAgICAgICAgICAgICAgICBhbm9ueW1vdXMgZnVuY3Rpb24gaWYgeW91IG1heSBsYXRlciB3YW50IHRvIHJlbW92ZSB0aGVcbiAgICAgKiAgICAgICAgICAgICAgICBldmVudCBoYW5kbGVyLlxuICAgICAqL1xuICAgIHN0YXRpYyBhZGRPblByb2Nlc3NTdGF0dXNDaGFuZ2UoXG4gICAgICBoYW5kbGVyOiBYcm0uRXZlbnRzLlByb2Nlc3NTdGF0dXNDaGFuZ2VIYW5kbGVyXG4gICAgKSB7XG4gICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5yZW1vdmVPblByb2Nlc3NTdGF0dXNDaGFuZ2UoaGFuZGxlcik7XG4gICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MuYWRkT25Qcm9jZXNzU3RhdHVzQ2hhbmdlKGhhbmRsZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVc2UgdGhpcyB0byBhZGQgYSBmdW5jdGlvbiBhcyBhbiBldmVudCBoYW5kbGVyIGZvciB0aGUgT25TdGFnZUNoYW5nZSBldmVudCBzbyB0aGF0IGl0IHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhlXG4gICAgICogYnVzaW5lc3MgcHJvY2VzcyBmbG93IHN0YWdlIGNoYW5nZXMuXG4gICAgICogQHBhcmFtIGhhbmRsZXIgVGhlIGZ1bmN0aW9uIHdpbGwgYmUgYWRkZWQgdG8gdGhlIGJvdHRvbSBvZiB0aGUgZXZlbnRcbiAgICAgKiAgICAgICAgICAgICAgICBoYW5kbGVyIHBpcGVsaW5lLiBUaGUgZXhlY3V0aW9uIGNvbnRleHQgaXMgYXV0b21hdGljYWxseVxuICAgICAqICAgICAgICAgICAgICAgIHNldCB0byBiZSB0aGUgZmlyc3QgcGFyYW1ldGVyIHBhc3NlZCB0byB0aGUgZXZlbnQgaGFuZGxlci5cbiAgICAgKiAgICAgICAgICAgICAgICBVc2UgYSByZWZlcmVuY2UgdG8gYSBuYW1lZCBmdW5jdGlvbiByYXRoZXIgdGhhbiBhblxuICAgICAqICAgICAgICAgICAgICAgIGFub255bW91cyBmdW5jdGlvbiBpZiB5b3UgbWF5IGxhdGVyIHdhbnQgdG8gcmVtb3ZlIHRoZVxuICAgICAqICAgICAgICAgICAgICAgIGV2ZW50IGhhbmRsZXIuXG4gICAgICovXG4gICAgc3RhdGljIGFkZE9uU3RhZ2VDaGFuZ2UoaGFuZGxlcjogWHJtLkV2ZW50cy5TdGFnZUNoYW5nZUV2ZW50SGFuZGxlcikge1xuICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MucmVtb3ZlT25TdGFnZUNoYW5nZShoYW5kbGVyKTtcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5hZGRPblN0YWdlQ2hhbmdlKGhhbmRsZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVc2UgdGhpcyB0byBhZGQgYSBmdW5jdGlvbiBhcyBhbiBldmVudCBoYW5kbGVyIGZvciB0aGUgT25TdGFnZVNlbGVjdGVkIGV2ZW50IHNvIHRoYXQgaXQgd2lsbCBiZSBjYWxsZWRcbiAgICAgKiB3aGVuIGEgYnVzaW5lc3MgcHJvY2VzcyBmbG93IHN0YWdlIGlzIHNlbGVjdGVkLlxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGFkZGVkIHRvIHRoZSBib3R0b20gb2YgdGhlIGV2ZW50XG4gICAgICogICAgICAgICAgICAgICAgaGFuZGxlciBwaXBlbGluZS4gVGhlIGV4ZWN1dGlvbiBjb250ZXh0IGlzIGF1dG9tYXRpY2FsbHlcbiAgICAgKiAgICAgICAgICAgICAgICBzZXQgdG8gYmUgdGhlIGZpcnN0IHBhcmFtZXRlciBwYXNzZWQgdG8gdGhlIGV2ZW50IGhhbmRsZXIuXG4gICAgICogICAgICAgICAgICAgICAgVXNlIGEgcmVmZXJlbmNlIHRvIGEgbmFtZWQgZnVuY3Rpb24gcmF0aGVyIHRoYW4gYW5cbiAgICAgKiAgICAgICAgICAgICAgICBhbm9ueW1vdXMgZnVuY3Rpb24gaWYgeW91IG1heSBsYXRlciB3YW50IHRvIHJlbW92ZSB0aGVcbiAgICAgKiAgICAgICAgICAgICAgICBldmVudCBoYW5kbGVyLlxuICAgICAqL1xuICAgIHN0YXRpYyBhZGRPblN0YWdlU2VsZWN0ZWQoaGFuZGxlcjogWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlcikge1xuICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MucmVtb3ZlT25TdGFnZVNlbGVjdGVkKGhhbmRsZXIpO1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLmFkZE9uU3RhZ2VTZWxlY3RlZChoYW5kbGVyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXNlIHRoaXMgdG8gcmVtb3ZlIGEgZnVuY3Rpb24gYXMgYW4gZXZlbnQgaGFuZGxlciBmb3IgdGhlIE9uUHJlUHJvY2Vzc1N0YXR1c0NoYW5nZSBldmVudC5cbiAgICAgKiBAcGFyYW0gaGFuZGxlciBJZiBhbiBhbm9ueW1vdXMgZnVuY3Rpb24gaXMgc2V0IHVzaW5nIHRoZSBhZGRPblByZVByb2Nlc3NTdGF0dXNDaGFuZ2UgbWV0aG9kIGl0XG4gICAgICogICAgICAgICAgICAgICAgY2Fubm90IGJlIHJlbW92ZWQgdXNpbmcgdGhpcyBtZXRob2QuXG4gICAgICovXG4gICAgc3RhdGljIHJlbW92ZU9uUHJlUHJvY2Vzc1N0YXR1c0NoYW5nZShcbiAgICAgIGhhbmRsZXI6IFhybS5FdmVudHMuUHJvY2Vzc1N0YXR1c0NoYW5nZUhhbmRsZXJcbiAgICApIHtcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5yZW1vdmVPblByZVByb2Nlc3NTdGF0dXNDaGFuZ2UoXG4gICAgICAgIGhhbmRsZXJcbiAgICAgICk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVzZSB0aGlzIHRvIHJlbW92ZSBhIGZ1bmN0aW9uIGFzIGFuIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBPblByZVN0YWdlQ2hhbmdlIGV2ZW50LlxuICAgICAqIEBwYXJhbSBoYW5kbGVyIElmIGFuIGFub255bW91cyBmdW5jdGlvbiBpcyBzZXQgdXNpbmcgdGhlIGFkZE9uUHJlU3RhZ2VDaGFuZ2UgbWV0aG9kIGl0XG4gICAgICogICAgICAgICAgICAgICAgY2Fubm90IGJlIHJlbW92ZWQgdXNpbmcgdGhpcyBtZXRob2QuXG4gICAgICovXG4gICAgc3RhdGljIHJlbW92ZU9uUHJlU3RhZ2VDaGFuZ2UoaGFuZGxlcjogWHJtLkV2ZW50cy5TdGFnZUNoYW5nZUV2ZW50SGFuZGxlcikge1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLnJlbW92ZU9uUHJlU3RhZ2VDaGFuZ2UoaGFuZGxlcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVzZSB0aGlzIHRvIHJlbW92ZSBhIGZ1bmN0aW9uIGFzIGFuIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBPblByb2Nlc3NTdGF0dXNDaGFuZ2UgZXZlbnQuXG4gICAgICogQHBhcmFtIGhhbmRsZXIgSWYgYW4gYW5vbnltb3VzIGZ1bmN0aW9uIGlzIHNldCB1c2luZyB0aGUgYWRkT25Qcm9jZXNzU3RhdHVzQ2hhbmdlIG1ldGhvZCBpdFxuICAgICAqICAgICAgICAgICAgICAgIGNhbm5vdCBiZSByZW1vdmVkIHVzaW5nIHRoaXMgbWV0aG9kLlxuICAgICAqL1xuICAgIHN0YXRpYyByZW1vdmVPblByb2Nlc3NTdGF0dXNDaGFuZ2UoXG4gICAgICBoYW5kbGVyOiBYcm0uRXZlbnRzLlByb2Nlc3NTdGF0dXNDaGFuZ2VIYW5kbGVyXG4gICAgKSB7XG4gICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MucmVtb3ZlT25Qcm9jZXNzU3RhdHVzQ2hhbmdlKGhhbmRsZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVc2UgdGhpcyB0byByZW1vdmUgYSBmdW5jdGlvbiBhcyBhbiBldmVudCBoYW5kbGVyIGZvciB0aGUgT25TdGFnZUNoYW5nZSBldmVudC5cbiAgICAgKiBAcGFyYW0gaGFuZGxlciBJZiBhbiBhbm9ueW1vdXMgZnVuY3Rpb24gaXMgc2V0IHVzaW5nIHRoZSBhZGRPblN0YWdlQ2hhbmdlIG1ldGhvZCBpdFxuICAgICAqICAgICAgICAgICAgICAgIGNhbm5vdCBiZSByZW1vdmVkIHVzaW5nIHRoaXMgbWV0aG9kLlxuICAgICAqL1xuICAgIHN0YXRpYyByZW1vdmVPblN0YWdlQ2hhbmdlKGhhbmRsZXI6IFhybS5FdmVudHMuU3RhZ2VDaGFuZ2VFdmVudEhhbmRsZXIpIHtcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5yZW1vdmVPblN0YWdlQ2hhbmdlKGhhbmRsZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVc2UgdGhpcyB0byByZW1vdmUgYSBmdW5jdGlvbiBhcyBhbiBldmVudCBoYW5kbGVyIGZvciB0aGUgT25TdGFnZUNoYW5nZSBldmVudC5cbiAgICAgKiBAcGFyYW0gaGFuZGxlciBJZiBhbiBhbm9ueW1vdXMgZnVuY3Rpb24gaXMgc2V0IHVzaW5nIHRoZSBhZGRPblN0YWdlQ2hhbmdlIG1ldGhvZCBpdFxuICAgICAqICAgICAgICAgICAgICAgIGNhbm5vdCBiZSByZW1vdmVkIHVzaW5nIHRoaXMgbWV0aG9kLlxuICAgICAqL1xuICAgIHN0YXRpYyByZW1vdmVPblN0YWdlU2VsZWN0ZWQoaGFuZGxlcjogWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlcikge1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLnJlbW92ZU9uU3RhZ2VTZWxlY3RlZChoYW5kbGVyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVc2UgdGhpcyBtZXRob2QgdG8gYXN5bmNocm9ub3VzbHkgcmV0cmlldmUgdGhlIGVuYWJsZWQgYnVzaW5lc3MgcHJvY2VzcyBmbG93cyB0aGF0IHRoZSB1c2VyIGNhbiBzd2l0Y2ggdG8gZm9yIGFuIGVudGl0eS5cbiAgICAgKiBAcmV0dXJucyByZXR1cm5zIGNhbGxiYWNrIHJlc3BvbnNlIGFzIFByb21pc2VcbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0RW5hYmxlZFByb2Nlc3NlcygpIHtcbiAgICAgIHJldHVybiBhc1Byb21pc2U8WHJtLlByb2Nlc3NGbG93LlByb2Nlc3NEaWN0aW9uYXJ5PihcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MuZ2V0RW5hYmxlZFByb2Nlc3NlcyxcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3NcbiAgICAgICk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYWxsIHByb2Nlc3MgaW5zdGFuY2VzIGZvciB0aGUgZW50aXR5IHJlY29yZCB0aGF0IHRoZSBjYWxsaW5nIHVzZXIgaGFzIGFjY2VzcyB0by5cbiAgICAgKiBAcmV0dXJucyByZXR1cm5zIGNhbGxiYWNrIHJlc3BvbnNlIGFzIFByb21pc2VcbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0UHJvY2Vzc0luc3RhbmNlcygpIHtcbiAgICAgIHJldHVybiBhc1Byb21pc2U8WHJtLlByb2Nlc3NGbG93LkdldFByb2Nlc3NJbnN0YW5jZXNEZWxlZ2F0ZT4oXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLmdldFByb2Nlc3NJbnN0YW5jZXMsXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzXG4gICAgICApO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQcm9ncmVzc2VzIHRvIHRoZSBuZXh0IHN0YWdlLlxuICAgICAqIEByZXR1cm5zIHJldHVybnMgY2FsbGJhY2sgcmVzcG9uc2UgYXMgUHJvbWlzZVxuICAgICAqL1xuICAgIHN0YXRpYyBtb3ZlTmV4dCgpIHtcbiAgICAgIHJldHVybiBhc1Byb21pc2U8WHJtLlByb2Nlc3NGbG93LlByb2Nlc3NDYWxsYmFja0RlbGVnYXRlPihcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MubW92ZU5leHQsXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzXG4gICAgICApO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBNb3ZlcyB0byB0aGUgcHJldmlvdXMgc3RhZ2UuXG4gICAgICogQHJldHVybnMgcmV0dXJucyBjYWxsYmFjayByZXNwb25zZSBhcyBQcm9taXNlXG4gICAgICovXG4gICAgc3RhdGljIG1vdmVQcmV2aW91cygpIHtcbiAgICAgIHJldHVybiBhc1Byb21pc2U8WHJtLlByb2Nlc3NGbG93LlByb2Nlc3NDYWxsYmFja0RlbGVnYXRlPihcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MubW92ZVByZXZpb3VzLFxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzc1xuICAgICAgKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0IGEgUHJvY2VzcyBhcyB0aGUgYWN0aXZlIHByb2Nlc3MuXG4gICAgICogQHBhcmFtIHByb2Nlc3NJZCBUaGUgSWQgb2YgdGhlIHByb2Nlc3MgdG8gbWFrZSB0aGUgYWN0aXZlIHByb2Nlc3MuXG4gICAgICogQHJldHVybnMgcmV0dXJucyBjYWxsYmFjayByZXNwb25zZSBhcyBQcm9taXNlXG4gICAgICovXG4gICAgc3RhdGljIHNldEFjdGl2ZVByb2Nlc3MocHJvY2Vzc0lkOiBzdHJpbmcpIHtcbiAgICAgIHJldHVybiBhc1Byb21pc2U8WHJtLlByb2Nlc3NGbG93LlByb2Nlc3NDYWxsYmFja0RlbGVnYXRlPihcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3Muc2V0QWN0aXZlUHJvY2VzcyxcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MsXG4gICAgICAgIHByb2Nlc3NJZFxuICAgICAgKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyBhIHByb2Nlc3MgaW5zdGFuY2UgYXMgdGhlIGFjdGl2ZSBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSBwcm9jZXNzSW5zdGFuY2VJZCBUaGUgSWQgb2YgdGhlIHByb2Nlc3MgaW5zdGFuY2UgdG8gbWFrZSB0aGUgYWN0aXZlIGluc3RhbmNlLlxuICAgICAqIEByZXR1cm5zIHJldHVybnMgY2FsbGJhY2sgcmVzcG9uc2UgYXMgUHJvbWlzZVxuICAgICAqL1xuICAgIHN0YXRpYyBzZXRBY3RpdmVQcm9jZXNzSW5zdGFuY2UocHJvY2Vzc0luc3RhbmNlSWQ6IHN0cmluZykge1xuICAgICAgcmV0dXJuIGFzUHJvbWlzZTxYcm0uUHJvY2Vzc0Zsb3cuU2V0UHJvY2Vzc0luc3RhbmNlRGVsZWdhdGU+KFxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5zZXRBY3RpdmVQcm9jZXNzSW5zdGFuY2UsXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLFxuICAgICAgICBwcm9jZXNzSW5zdGFuY2VJZFxuICAgICAgKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0IGEgc3RhZ2UgYXMgdGhlIGFjdGl2ZSBzdGFnZS5cbiAgICAgKiBAcGFyYW0gc3RhZ2VJZCB0aGUgSWQgb2YgdGhlIHN0YWdlIHRvIG1ha2UgdGhlIGFjdGl2ZSBzdGFnZS5cbiAgICAgKiBAcmV0dXJucyByZXR1cm5zIGNhbGxiYWNrIHJlc3BvbnNlIGFzIFByb21pc2VcbiAgICAgKi9cbiAgICBzdGF0aWMgc2V0QWN0aXZlU3RhZ2Uoc3RhZ2VJZDogc3RyaW5nKSB7XG4gICAgICByZXR1cm4gYXNQcm9taXNlPFhybS5Qcm9jZXNzRmxvdy5TZXRQcm9jZXNzSW5zdGFuY2VEZWxlZ2F0ZT4oXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLnNldEFjdGl2ZVN0YWdlLFxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2VzcyxcbiAgICAgICAgc3RhZ2VJZFxuICAgICAgKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXNlIHRoaXMgbWV0aG9kIHRvIHNldCB0aGUgY3VycmVudCBzdGF0dXMgb2YgdGhlIHByb2Nlc3MgaW5zdGFuY2VcbiAgICAgKiBAcGFyYW0gc3RhdHVzIFRoZSBuZXcgc3RhdHVzIGZvciB0aGUgcHJvY2Vzc1xuICAgICAqIEByZXR1cm5zIHJldHVybnMgY2FsbGJhY2sgcmVzcG9uc2UgYXMgUHJvbWlzZVxuICAgICAqL1xuICAgIHN0YXRpYyBzZXRTdGF0dXMoc3RhdHVzOiBYcm0uUHJvY2Vzc0Zsb3cuUHJvY2Vzc1N0YXR1cykge1xuICAgICAgcmV0dXJuIGFzUHJvbWlzZTxYcm0uUHJvY2Vzc0Zsb3cuU2V0UHJvY2Vzc0luc3RhbmNlRGVsZWdhdGU+KFxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5zZXRTdGF0dXMsXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLFxuICAgICAgICBzdGF0dXNcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGNsYXNzIEZpZWxkcyB7XG4gICAgLyoqXG4gICAgICogQWRkcyBhIGhhbmRsZXIgb3IgYW4gYXJyYXkgb2YgaGFuZGxlcnMgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGF0dHJpYnV0ZSdzIHZhbHVlIGlzIGNoYW5nZWQuXG4gICAgICogQHBhcmFtIGZpZWxkcyBBbiBhcnJheSBvZiBmaWVsZHMgdG8gb24gd2hpY2ggdGhpcyBtZXRob2Qgc2hvdWxkIGJlIGFwcGxpZWQuXG4gICAgICogQHBhcmFtIGhhbmRsZXJzIFRoZSBmdW5jdGlvbiByZWZlcmVuY2Ugb3IgYW4gYXJyYXkgb2YgZnVuY3Rpb24gcmVmZXJlbmNlcy5cbiAgICAgKi9cbiAgICBzdGF0aWMgYWRkT25DaGFuZ2UoXG4gICAgICBmaWVsZHM6IENsYXNzLkZpZWxkW10sXG4gICAgICBoYW5kbGVyOiBYcm0uRXZlbnRzLkF0dHJpYnV0ZS5DaGFuZ2VFdmVudEhhbmRsZXJcbiAgICApOiB2b2lkIHtcbiAgICAgIGZpZWxkcy5mb3JFYWNoKChmaWVsZCkgPT4ge1xuICAgICAgICBmaWVsZC5hZGRPbkNoYW5nZShoYW5kbGVyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBGaXJlIGFsbCBcIm9uIGNoYW5nZVwiIGV2ZW50IGhhbmRsZXJzLlxuICAgICAqIEBwYXJhbSBmaWVsZHMgQW4gYXJyYXkgb2YgZmllbGRzIHRvIG9uIHdoaWNoIHRoaXMgbWV0aG9kIHNob3VsZCBiZSBhcHBsaWVkLlxuICAgICAqL1xuICAgIHN0YXRpYyBmaXJlT25DaGFuZ2UoZmllbGRzOiBDbGFzcy5GaWVsZFtdKTogdm9pZCB7XG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgZmllbGQuZmlyZU9uQ2hhbmdlKCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgaGFuZGxlciBmcm9tIHRoZSBcIm9uIGNoYW5nZVwiIGV2ZW50LlxuICAgICAqIEBwYXJhbSBmaWVsZHMgQW4gYXJyYXkgb2YgZmllbGRzIHRvIG9uIHdoaWNoIHRoaXMgbWV0aG9kIHNob3VsZCBiZSBhcHBsaWVkLlxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFRoZSBoYW5kbGVyLlxuICAgICAqL1xuICAgIHN0YXRpYyByZW1vdmVPbkNoYW5nZShcbiAgICAgIGZpZWxkczogQ2xhc3MuRmllbGRbXSxcbiAgICAgIGhhbmRsZXI6IFhybS5FdmVudHMuQXR0cmlidXRlLkNoYW5nZUV2ZW50SGFuZGxlclxuICAgICk6IHZvaWQge1xuICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgIGZpZWxkLnJlbW92ZU9uQ2hhbmdlKGhhbmRsZXIpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHJlcXVpcmVkIGxldmVsLlxuICAgICAqIEBwYXJhbSBmaWVsZHMgQW4gYXJyYXkgb2YgZmllbGRzIHRvIG9uIHdoaWNoIHRoaXMgbWV0aG9kIHNob3VsZCBiZSBhcHBsaWVkLlxuICAgICAqIEBwYXJhbSByZXF1aXJlbWVudExldmVsIFRoZSByZXF1aXJlbWVudCBsZXZlbCwgYXMgZWl0aGVyIFwibm9uZVwiLCBcInJlcXVpcmVkXCIsIG9yIFwicmVjb21tZW5kZWRcIlxuICAgICAqL1xuICAgIHN0YXRpYyBzZXRSZXF1aXJlZExldmVsKFxuICAgICAgZmllbGRzOiBDbGFzcy5GaWVsZFtdLFxuICAgICAgcmVxdWlyZW1lbnRMZXZlbDogWHJtLkF0dHJpYnV0ZXMuUmVxdWlyZW1lbnRMZXZlbFxuICAgICk6IHZvaWQge1xuICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgIGZpZWxkLnNldFJlcXVpcmVkTGV2ZWwocmVxdWlyZW1lbnRMZXZlbCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgc3VibWl0IG1vZGUuXG4gICAgICogQHBhcmFtIGZpZWxkcyBBbiBhcnJheSBvZiBmaWVsZHMgdG8gb24gd2hpY2ggdGhpcyBtZXRob2Qgc2hvdWxkIGJlIGFwcGxpZWQuXG4gICAgICogQHBhcmFtIHN1Ym1pdE1vZGUgVGhlIHN1Ym1pdCBtb2RlLCBhcyBlaXRoZXIgXCJhbHdheXNcIiwgXCJuZXZlclwiLCBvciBcImRpcnR5XCIuXG4gICAgICogQGRlZmF1bHQgc3VibWl0TW9kZSBcImRpcnR5XCJcbiAgICAgKiBAc2VlIHtAbGluayBYcm1FbnVtLkF0dHJpYnV0ZVJlcXVpcmVtZW50TGV2ZWx9XG4gICAgICovXG4gICAgc3RhdGljIHNldFN1Ym1pdE1vZGUoXG4gICAgICBmaWVsZHM6IENsYXNzLkZpZWxkW10sXG4gICAgICBzdWJtaXRNb2RlOiBYcm0uU3VibWl0TW9kZVxuICAgICk6IHZvaWQge1xuICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgIGZpZWxkLnNldFN1Ym1pdE1vZGUoc3VibWl0TW9kZSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgdmFsdWUuXG4gICAgICogQHBhcmFtIGZpZWxkcyBBbiBhcnJheSBvZiBmaWVsZHMgdG8gb24gd2hpY2ggdGhpcyBtZXRob2Qgc2hvdWxkIGJlIGFwcGxpZWQuXG4gICAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZS5cbiAgICAgKiBAcmVtYXJrcyBBdHRyaWJ1dGVzIG9uIFF1aWNrIENyZWF0ZSBGb3JtcyB3aWxsIG5vdCBzYXZlIHZhbHVlcyBzZXQgd2l0aCB0aGlzIG1ldGhvZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgc2V0VmFsdWUoZmllbGRzOiBDbGFzcy5GaWVsZFtdLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgZmllbGQuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgYSB2YWx1ZSBmb3IgYSBjb2x1bW4gdG8gZGV0ZXJtaW5lIHdoZXRoZXIgaXQgaXMgdmFsaWQgb3IgaW52YWxpZCB3aXRoIGEgbWVzc2FnZVxuICAgICAqIEBwYXJhbSBmaWVsZHMgQW4gYXJyYXkgb2YgZmllbGRzIHRvIG9uIHdoaWNoIHRoaXMgbWV0aG9kIHNob3VsZCBiZSBhcHBsaWVkLlxuICAgICAqIEBwYXJhbSBpc1ZhbGlkIFNwZWNpZnkgZmFsc2UgdG8gc2V0IHRoZSBjb2x1bW4gdmFsdWUgdG8gaW52YWxpZCBhbmQgdHJ1ZSB0byBzZXQgdGhlIHZhbHVlIHRvIHZhbGlkLlxuICAgICAqIEBwYXJhbSBtZXNzYWdlIFRoZSBtZXNzYWdlIHRvIGRpc3BsYXkuXG4gICAgICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9sZWFybi5taWNyb3NvZnQuY29tL2VuLXVzL3Bvd2VyLWFwcHMvZGV2ZWxvcGVyL21vZGVsLWRyaXZlbi1hcHBzL2NsaWVudGFwaS9yZWZlcmVuY2UvYXR0cmlidXRlcy9zZXRpc3ZhbGlkIEV4dGVybmFsIExpbms6IHNldElzVmFsaWQgKENsaWVudCBBUEkgcmVmZXJlbmNlKX1cbiAgICAgKi9cbiAgICBzdGF0aWMgc2V0SXNWYWxpZChcbiAgICAgIGZpZWxkczogQ2xhc3MuRmllbGRbXSxcbiAgICAgIGlzVmFsaWQ6IGJvb2xlYW4sXG4gICAgICBtZXNzYWdlPzogc3RyaW5nXG4gICAgKTogdm9pZCB7XG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgZmllbGQuc2V0SXNWYWxpZChpc1ZhbGlkLCBtZXNzYWdlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSByZXF1aXJlZCBsZXZlbC5cbiAgICAgKiBAcGFyYW0gZmllbGRzIEFuIGFycmF5IG9mIGZpZWxkcyB0byBvbiB3aGljaCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgYXBwbGllZC5cbiAgICAgKiBAcGFyYW0gcmVxdWlyZWQgVGhlIHJlcXVpcmVtZW50IGxldmVsLCBhcyBlaXRoZXIgZmFsc2UgZm9yIFwibm9uZVwiIG9yIHRydWUgZm9yIFwicmVxdWlyZWRcIlxuICAgICAqL1xuICAgIHN0YXRpYyBzZXRSZXF1aXJlZChmaWVsZHM6IENsYXNzLkZpZWxkW10sIHJlcXVpcmVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgZmllbGQuc2V0UmVxdWlyZWQocmVxdWlyZWQpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHN0YXRlIG9mIHRoZSBjb250cm9sIHRvIGVpdGhlciBlbmFibGVkLCBvciBkaXNhYmxlZC5cbiAgICAgKiBAcGFyYW0gZmllbGRzIEFuIGFycmF5IG9mIGZpZWxkcyB0byBvbiB3aGljaCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgYXBwbGllZC5cbiAgICAgKiBAcGFyYW0gZGlzYWJsZWQgdHJ1ZSB0byBkaXNhYmxlLCBmYWxzZSB0byBlbmFibGUuXG4gICAgICovXG4gICAgc3RhdGljIHNldERpc2FibGVkKGZpZWxkczogQ2xhc3MuRmllbGRbXSwgZGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgIGZpZWxkcy5mb3JFYWNoKChmaWVsZCkgPT4ge1xuICAgICAgICBmaWVsZC5zZXREaXNhYmxlZChkaXNhYmxlZCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgdmlzaWJpbGl0eSBzdGF0ZS5cbiAgICAgKiBAcGFyYW0gZmllbGRzIEFuIGFycmF5IG9mIGZpZWxkcyB0byBvbiB3aGljaCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgYXBwbGllZC5cbiAgICAgKiBAcGFyYW0gdmlzaWJsZSB0cnVlIHRvIHNob3csIGZhbHNlIHRvIGhpZGUuXG4gICAgICovXG4gICAgc3RhdGljIHNldFZpc2libGUoZmllbGRzOiBDbGFzcy5GaWVsZFtdLCB2aXNpYmxlOiBib29sZWFuKTogdm9pZCB7XG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgZmllbGQuc2V0VmlzaWJsZSh2aXNpYmxlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIGEgY29udHJvbC1sb2NhbCBub3RpZmljYXRpb24gbWVzc2FnZS5cbiAgICAgKiBAcGFyYW0gZmllbGRzIEFuIGFycmF5IG9mIGZpZWxkcyB0byBvbiB3aGljaCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgYXBwbGllZC5cbiAgICAgKiBAcGFyYW0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAgICAgKiBAcGFyYW0gdW5pcXVlSWQgVW5pcXVlIGlkZW50aWZpZXIuXG4gICAgICogQHJldHVybnMgdHJ1ZSBpZiBpdCBzdWNjZWVkcywgZmFsc2UgaWYgaXQgZmFpbHMuXG4gICAgICogQHJlbWFya3MgICAgIFdoZW4gdGhpcyBtZXRob2QgaXMgdXNlZCBvbiBNaWNyb3NvZnQgRHluYW1pY3MgQ1JNIGZvciB0YWJsZXRzIGEgcmVkIFwiWFwiIGljb25cbiAgICAgKiAgICAgICAgICAgICAgYXBwZWFycyBuZXh0IHRvIHRoZSBjb250cm9sLiBUYXBwaW5nIG9uIHRoZSBpY29uIHdpbGwgZGlzcGxheSB0aGUgbWVzc2FnZS5cbiAgICAgKi9cbiAgICBzdGF0aWMgc2V0Tm90aWZpY2F0aW9uKFxuICAgICAgZmllbGRzOiBDbGFzcy5GaWVsZFtdLFxuICAgICAgbWVzc2FnZTogc3RyaW5nLFxuICAgICAgdW5pcXVlSWQ6IHN0cmluZ1xuICAgICk6IHZvaWQge1xuICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgIGZpZWxkLnNldE5vdGlmaWNhdGlvbihtZXNzYWdlLCB1bmlxdWVJZCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGlzcGxheXMgYW4gZXJyb3Igb3IgcmVjb21tZW5kYXRpb24gbm90aWZpY2F0aW9uIGZvciBhIGNvbnRyb2wsIGFuZCBsZXRzIHlvdSBzcGVjaWZ5IGFjdGlvbnMgdG8gZXhlY3V0ZSBiYXNlZCBvbiB0aGUgbm90aWZpY2F0aW9uLlxuICAgICAqIEBwYXJhbSBmaWVsZHMgQW4gYXJyYXkgb2YgZmllbGRzIHRvIG9uIHdoaWNoIHRoaXMgbWV0aG9kIHNob3VsZCBiZSBhcHBsaWVkLlxuICAgICAqL1xuICAgIHN0YXRpYyBhZGROb3RpZmljYXRpb24oXG4gICAgICBmaWVsZHM6IENsYXNzLkZpZWxkW10sXG4gICAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgICBub3RpZmljYXRpb25MZXZlbDogXCJFUlJPUlwiIHwgXCJSRUNPTU1FTkRBVElPTlwiLFxuICAgICAgdW5pcXVlSWQ6IHN0cmluZyxcbiAgICAgIGFjdGlvbnM/OiBYcm0uQ29udHJvbHMuQ29udHJvbE5vdGlmaWNhdGlvbkFjdGlvbltdXG4gICAgKTogdm9pZCB7XG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgZmllbGQuYWRkTm90aWZpY2F0aW9uKG1lc3NhZ2UsIG5vdGlmaWNhdGlvbkxldmVsLCB1bmlxdWVJZCwgYWN0aW9ucyk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2xlYXJzIHRoZSBub3RpZmljYXRpb24gaWRlbnRpZmllZCBieSB1bmlxdWVJZC5cbiAgICAgKiBAcGFyYW0gZmllbGRzIEFuIGFycmF5IG9mIGZpZWxkcyB0byBvbiB3aGljaCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgYXBwbGllZC5cbiAgICAgKiBAcGFyYW0gdW5pcXVlSWQgKE9wdGlvbmFsKSBVbmlxdWUgaWRlbnRpZmllci5cbiAgICAgKiBAcmV0dXJucyB0cnVlIGlmIGl0IHN1Y2NlZWRzLCBmYWxzZSBpZiBpdCBmYWlscy5cbiAgICAgKiBAcmVtYXJrcyBJZiB0aGUgdW5pcXVlSWQgcGFyYW1ldGVyIGlzIG5vdCB1c2VkLCB0aGUgY3VycmVudCBub3RpZmljYXRpb24gc2hvd24gd2lsbCBiZSByZW1vdmVkLlxuICAgICAqL1xuICAgIHN0YXRpYyByZW1vdmVOb3RpZmljYXRpb24oZmllbGRzOiBDbGFzcy5GaWVsZFtdLCB1bmlxdWVJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgZmllbGQucmVtb3ZlTm90aWZpY2F0aW9uKHVuaXF1ZUlkKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXByZXNlbnRzIGEgZm9ybSBpbiBEeW5hbWljcyAzNjUuXG4gICAqL1xuICBleHBvcnQgY2xhc3MgRm9ybSB7XG4gICAgcHJvdGVjdGVkIHN0YXRpYyBfZm9ybUNvbnRleHQ6IFhybS5Gb3JtQ29udGV4dDtcbiAgICBwcm90ZWN0ZWQgc3RhdGljIF9leGVjdXRpb25Db250ZXh0OiBYcm0uRXZlbnRzLkV2ZW50Q29udGV4dDtcbiAgICBjb25zdHJ1Y3RvcigpIHt9XG4gICAgLyoqR2V0cyBhIHJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBmb3JtIGNvbnRleHQqL1xuICAgIHN0YXRpYyBnZXQgZm9ybUNvbnRleHQoKTogWHJtLkZvcm1Db250ZXh0IHtcbiAgICAgIHJldHVybiB0aGlzLl9mb3JtQ29udGV4dDtcbiAgICB9XG4gICAgLyoqR2V0cyBhIHJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBleGVjdXRpbyBjb250ZXh0Ki9cbiAgICBzdGF0aWMgZ2V0IGV4ZWN1dGlvbkNvbnRleHQoKTogWHJtLkV2ZW50cy5FdmVudENvbnRleHQge1xuICAgICAgcmV0dXJuIHRoaXMuX2V4ZWN1dGlvbkNvbnRleHQ7XG4gICAgfVxuICAgIC8qKkdldHMgYSBsb29rdXAgdmFsdWUgdGhhdCByZWZlcmVuY2VzIHRoZSByZWNvcmQuKi9cbiAgICBzdGF0aWMgZ2V0IGVudGl0eVJlZmVyZW5jZSgpIHtcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LmRhdGEuZW50aXR5LmdldEVudGl0eVJlZmVyZW5jZSgpO1xuICAgIH1cbiAgICAvKipTZXRzIGEgcmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IGZvcm0gY29udGV4dCovXG4gICAgc3RhdGljIHNldCBmb3JtQ29udGV4dChjb250ZXh0OiBYcm0uRm9ybUNvbnRleHQgfCBYcm0uRXZlbnRzLkV2ZW50Q29udGV4dCkge1xuICAgICAgaWYgKCFjb250ZXh0KVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFhybUV4LkZvcm0uc2V0Rm9ybUNvbnRleHQ6IFRoZSBleGVjdXRpb25Db250ZXh0IG9yIGZvcm1Db250ZXh0IHdhcyBub3QgcGFzc2VkIHRvIHRoZSBmdW5jdGlvbi5gXG4gICAgICAgICk7XG4gICAgICBpZiAoXCJnZXRGb3JtQ29udGV4dFwiIGluIGNvbnRleHQpIHtcbiAgICAgICAgdGhpcy5fZXhlY3V0aW9uQ29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgIHRoaXMuX2Zvcm1Db250ZXh0ID0gY29udGV4dC5nZXRGb3JtQ29udGV4dCgpO1xuICAgICAgfSBlbHNlIGlmIChcImRhdGFcIiBpbiBjb250ZXh0KSB0aGlzLl9mb3JtQ29udGV4dCA9IGNvbnRleHQ7XG4gICAgICBlbHNlXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgWHJtRXguRm9ybS5zZXRGb3JtQ29udGV4dDogVGhlIHBhc3NlZCBjb250ZXh0IGlzIG5vdCBhbiBleGVjdXRpb25Db250ZXh0IG9yIGZvcm1Db250ZXh0LmBcbiAgICAgICAgKTtcbiAgICB9XG4gICAgLyoqU2V0cyBhIHJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBleGVjdXRpb24gY29udGV4dCovXG4gICAgc3RhdGljIHNldCBleGVjdXRpb25Db250ZXh0KFxuICAgICAgY29udGV4dDogWHJtLkZvcm1Db250ZXh0IHwgWHJtLkV2ZW50cy5FdmVudENvbnRleHRcbiAgICApIHtcbiAgICAgIGlmICghY29udGV4dClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBYcm1FeC5Gb3JtLnNldEV4ZWN1dGlvbkNvbnRleHQ6IFRoZSBleGVjdXRpb25Db250ZXh0IG9yIGZvcm1Db250ZXh0IHdhcyBub3QgcGFzc2VkIHRvIHRoZSBmdW5jdGlvbi5gXG4gICAgICAgICk7XG4gICAgICBpZiAoXCJnZXRGb3JtQ29udGV4dFwiIGluIGNvbnRleHQpIHtcbiAgICAgICAgdGhpcy5fZXhlY3V0aW9uQ29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgIHRoaXMuX2Zvcm1Db250ZXh0ID0gY29udGV4dC5nZXRGb3JtQ29udGV4dCgpO1xuICAgICAgfSBlbHNlIGlmIChcImRhdGFcIiBpbiBjb250ZXh0KSB0aGlzLl9mb3JtQ29udGV4dCA9IGNvbnRleHQ7XG4gICAgICBlbHNlXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgWHJtRXguRm9ybS5zZXRFeGVjdXRpb25Db250ZXh0OiBUaGUgcGFzc2VkIGNvbnRleHQgaXMgbm90IGFuIGV4ZWN1dGlvbkNvbnRleHQgb3IgZm9ybUNvbnRleHQuYFxuICAgICAgICApO1xuICAgIH1cbiAgICAvKipSZXR1cm5zIHRydWUgaWYgZm9ybSBpcyBmcm9tIHR5cGUgY3JlYXRlKi9cbiAgICBzdGF0aWMgZ2V0IElzQ3JlYXRlKCkge1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQudWkuZ2V0Rm9ybVR5cGUoKSA9PSAxO1xuICAgIH1cbiAgICAvKipSZXR1cm5zIHRydWUgaWYgZm9ybSBpcyBmcm9tIHR5cGUgdXBkYXRlKi9cbiAgICBzdGF0aWMgZ2V0IElzVXBkYXRlKCkge1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQudWkuZ2V0Rm9ybVR5cGUoKSA9PSAyO1xuICAgIH1cbiAgICAvKipSZXR1cm5zIHRydWUgaWYgZm9ybSBpcyBub3QgZnJvbSB0eXBlIGNyZWF0ZSovXG4gICAgc3RhdGljIGdldCBJc05vdENyZWF0ZSgpIHtcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LnVpLmdldEZvcm1UeXBlKCkgIT0gMTtcbiAgICB9XG4gICAgLyoqUmV0dXJucyB0cnVlIGlmIGZvcm0gaXMgbm90IGZyb20gdHlwZSB1cGRhdGUqL1xuICAgIHN0YXRpYyBnZXQgSXNOb3RVcGRhdGUoKSB7XG4gICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC51aS5nZXRGb3JtVHlwZSgpICE9IDI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGlzcGxheXMgYSBmb3JtIGxldmVsIG5vdGlmaWNhdGlvbi4gQW55IG51bWJlciBvZiBub3RpZmljYXRpb25zIGNhbiBiZSBkaXNwbGF5ZWQgYW5kIHdpbGwgcmVtYWluIHVudGlsIHJlbW92ZWQgdXNpbmcgY2xlYXJGb3JtTm90aWZpY2F0aW9uLlxuICAgICAqIFRoZSBoZWlnaHQgb2YgdGhlIG5vdGlmaWNhdGlvbiBhcmVhIGlzIGxpbWl0ZWQgc28gZWFjaCBuZXcgbWVzc2FnZSB3aWxsIGJlIGFkZGVkIHRvIHRoZSB0b3AuXG4gICAgICogQHBhcmFtIG1lc3NhZ2UgVGhlIHRleHQgb2YgdGhlIG5vdGlmaWNhdGlvbiBtZXNzYWdlLlxuICAgICAqIEBwYXJhbSBsZXZlbCBUaGUgbGV2ZWwgb2YgdGhlIG5vdGlmaWNhdGlvbiB3aGljaCBkZWZpbmVzIGhvdyB0aGUgbWVzc2FnZSB3aWxsIGJlIGRpc3BsYXllZCwgc3VjaCBhcyB0aGUgaWNvbi5cbiAgICAgKiBFUlJPUjogTm90aWZpY2F0aW9uIHdpbGwgdXNlIHRoZSBzeXN0ZW0gZXJyb3IgaWNvbi5cbiAgICAgKiBXQVJOSU5HOiBOb3RpZmljYXRpb24gd2lsbCB1c2UgdGhlIHN5c3RlbSB3YXJuaW5nIGljb24uXG4gICAgICogSU5GTzogTm90aWZpY2F0aW9uIHdpbGwgdXNlIHRoZSBzeXN0ZW0gaW5mbyBpY29uLlxuICAgICAqIEBwYXJhbSB1bmlxdWVJZCBVbmlxdWUgaWRlbnRpZmllciBmb3IgdGhlIG5vdGlmaWNhdGlvbiB3aGljaCBpcyB1c2VkIHdpdGggY2xlYXJGb3JtTm90aWZpY2F0aW9uIHRvIHJlbW92ZSB0aGUgbm90aWZpY2F0aW9uLlxuICAgICAqIEByZXR1cm5zIHRydWUgaWYgaXQgc3VjY2VlZHMsIG90aGVucHJ3aXNlIGZhbHNlLlxuICAgICAqL1xuICAgIHN0YXRpYyBhZGRGb3JtTm90aWZpY2F0aW9uKFxuICAgICAgbWVzc2FnZTogc3RyaW5nLFxuICAgICAgbGV2ZWw6IFhybS5Gb3JtTm90aWZpY2F0aW9uTGV2ZWwsXG4gICAgICB1bmlxdWVJZDogc3RyaW5nXG4gICAgKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC51aS5zZXRGb3JtTm90aWZpY2F0aW9uKFxuICAgICAgICAgIG1lc3NhZ2UsXG4gICAgICAgICAgbGV2ZWwsXG4gICAgICAgICAgdW5pcXVlSWRcbiAgICAgICAgKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENsZWFycyB0aGUgZm9ybSBub3RpZmljYXRpb24gZGVzY3JpYmVkIGJ5IHVuaXF1ZUlkLlxuICAgICAqIEBwYXJhbSB1bmlxdWVJZCBVbmlxdWUgaWRlbnRpZmllci5cbiAgICAgKiBAcmV0dXJucyBUcnVlIGlmIGl0IHN1Y2NlZWRzLCBvdGhlcndpc2UgZmFsc2UuXG4gICAgICovXG4gICAgc3RhdGljIHJlbW92ZUZvcm1Ob3RpZmljYXRpb24odW5pcXVlSWQ6IHN0cmluZykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQudWkuY2xlYXJGb3JtTm90aWZpY2F0aW9uKHVuaXF1ZUlkKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBoYW5kbGVyIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSByZWNvcmQgaXMgc2F2ZWQuXG4gICAgICovXG4gICAgc3RhdGljIGFkZE9uU2F2ZShcbiAgICAgIGhhbmRsZXJzOlxuICAgICAgICB8IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXJcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyW11cbiAgICApIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShoYW5kbGVycykpIHtcbiAgICAgICAgICBoYW5kbGVycyA9IFtoYW5kbGVyc107XG4gICAgICAgIH1cbiAgICAgICAgaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCcke2hhbmRsZXJ9JyBpcyBub3QgYSBmdW5jdGlvbmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEuZW50aXR5LnJlbW92ZU9uU2F2ZShoYW5kbGVyKTtcbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEuZW50aXR5LmFkZE9uU2F2ZShoYW5kbGVyKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIGFmdGVyIHRoZSBPblNhdmUgaXMgY29tcGxldGUuXG4gICAgICogQHBhcmFtIGhhbmRsZXIgVGhlIGhhbmRsZXIuXG4gICAgICogQHJlbWFya3MgQWRkZWQgaW4gOS4yXG4gICAgICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kb2NzLm1pY3Jvc29mdC5jb20vZW4tdXMvcG93ZXJhcHBzL2RldmVsb3Blci9tb2RlbC1kcml2ZW4tYXBwcy9jbGllbnRhcGkvcmVmZXJlbmNlL2V2ZW50cy9wb3N0c2F2ZSBFeHRlcm5hbCBMaW5rOiBQb3N0U2F2ZSBFdmVudCBEb2N1bWVudGF0aW9ufVxuICAgICAqL1xuICAgIHN0YXRpYyBhZGRPblBvc3RTYXZlKFxuICAgICAgaGFuZGxlcnM6XG4gICAgICAgIHwgWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlclxuICAgICAgICB8IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXJbXVxuICAgICkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGhhbmRsZXJzKSkge1xuICAgICAgICAgIGhhbmRsZXJzID0gW2hhbmRsZXJzXTtcbiAgICAgICAgfVxuICAgICAgICBoYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJyR7aGFuZGxlcn0nIGlzIG5vdCBhIGZ1bmN0aW9uYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5lbnRpdHkucmVtb3ZlT25Qb3N0U2F2ZShoYW5kbGVyKTtcbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEuZW50aXR5LmFkZE9uUG9zdFNhdmUoaGFuZGxlcik7XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIGZvcm0gZGF0YSBpcyBsb2FkZWQuXG4gICAgICogQHBhcmFtIGhhbmRsZXIgVGhlIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIGZvcm0gZGF0YSBsb2Fkcy4gVGhlIGZ1bmN0aW9uIHdpbGwgYmUgYWRkZWQgdG8gdGhlIGJvdHRvbSBvZiB0aGUgZXZlbnQgaGFuZGxlciBwaXBlbGluZS5cbiAgICAgKi9cbiAgICBzdGF0aWMgYWRkT25Mb2FkKFxuICAgICAgaGFuZGxlcnM6XG4gICAgICAgIHwgWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlclxuICAgICAgICB8IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXJbXVxuICAgICkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGhhbmRsZXJzKSkge1xuICAgICAgICAgIGhhbmRsZXJzID0gW2hhbmRsZXJzXTtcbiAgICAgICAgfVxuICAgICAgICBoYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJyR7aGFuZGxlcn0nIGlzIG5vdCBhIGZ1bmN0aW9uYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5yZW1vdmVPbkxvYWQoaGFuZGxlcik7XG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLmFkZE9uTG9hZChoYW5kbGVyKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgaGFuZGxlciB0byBiZSBjYWxsZWQgd2hlbiB0aGUgYXR0cmlidXRlJ3MgdmFsdWUgaXMgY2hhbmdlZC5cbiAgICAgKiBAcGFyYW0gaGFuZGxlciBUaGUgZnVuY3Rpb24gcmVmZXJlbmNlLlxuICAgICAqL1xuICAgIHN0YXRpYyBhZGRPbkNoYW5nZShcbiAgICAgIGZpZWxkczogQ2xhc3MuRmllbGRbXSxcbiAgICAgIGhhbmRsZXJzOlxuICAgICAgICB8IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXJcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyW10sXG4gICAgICBleGVjdXRlPzogYm9vbGVhblxuICAgICkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGhhbmRsZXJzKSkge1xuICAgICAgICAgIGhhbmRsZXJzID0gW2hhbmRsZXJzXTtcbiAgICAgICAgfVxuICAgICAgICBoYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJyR7aGFuZGxlcn0nIGlzIG5vdCBhIGZ1bmN0aW9uYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZpZWxkcy5mb3JFYWNoKChmaWVsZCkgPT4ge1xuICAgICAgICAgICAgZmllbGQucmVtb3ZlT25DaGFuZ2UoaGFuZGxlcik7XG4gICAgICAgICAgICBmaWVsZC5hZGRPbkNoYW5nZShoYW5kbGVyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChleGVjdXRlKSB7XG4gICAgICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgICAgICBmaWVsZC5BdHRyaWJ1dGUuZmlyZU9uQ2hhbmdlKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIGNsb25lUmVjb3JkKCkge1xuICAgICAgdmFyIGVudGl0eUZvcm1PcHRpb25zID0ge307XG4gICAgICB2YXIgZm9ybVBhcmFtZXRlcnMgPSB7fTtcbiAgICAgIHZhciBlbnRpdHlOYW1lID0gdGhpcy5mb3JtQ29udGV4dC5kYXRhLmVudGl0eS5nZXRFbnRpdHlOYW1lKCk7XG4gICAgICBlbnRpdHlGb3JtT3B0aW9uc1tcImVudGl0eU5hbWVcIl0gPSBlbnRpdHlOYW1lO1xuICAgICAgdGhpcy5mb3JtQ29udGV4dC5kYXRhLmVudGl0eS5hdHRyaWJ1dGVzLmZvckVhY2goKGMpID0+IHtcbiAgICAgICAgdmFyIGF0dHJpYnV0ZVR5cGUgPSBjLmdldEF0dHJpYnV0ZVR5cGUoKTtcbiAgICAgICAgdmFyIGF0dHJpYnV0ZU5hbWUgPSBjLmdldE5hbWUoKTtcbiAgICAgICAgdmFyIGF0dHJpYnV0ZVZhbHVlID0gYy5nZXRWYWx1ZSgpO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgIWF0dHJpYnV0ZVZhbHVlIHx8XG4gICAgICAgICAgYXR0cmlidXRlTmFtZSA9PT0gXCJjcmVhdGVkb25cIiB8fFxuICAgICAgICAgIGF0dHJpYnV0ZU5hbWUgPT09IFwibW9kaWZpZWRvblwiIHx8XG4gICAgICAgICAgYXR0cmlidXRlTmFtZSA9PT0gXCJjcmVhdGVkYnlcIiB8fFxuICAgICAgICAgIGF0dHJpYnV0ZU5hbWUgPT09IFwibW9kaWZpZWRieVwiIHx8XG4gICAgICAgICAgYXR0cmlidXRlTmFtZSA9PT0gXCJwcm9jZXNzaWRcIiB8fFxuICAgICAgICAgIGF0dHJpYnV0ZU5hbWUgPT09IFwic3RhZ2VpZFwiIHx8XG4gICAgICAgICAgYXR0cmlidXRlTmFtZSA9PT0gXCJvd25lcmlkXCIgfHxcbiAgICAgICAgICBhdHRyaWJ1dGVOYW1lLnN0YXJ0c1dpdGgoXCJ0cmFuc2FjdGlvbmN1cnJlbmN5XCIpXG4gICAgICAgIClcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmIChcbiAgICAgICAgICBhdHRyaWJ1dGVUeXBlID09PSBcImxvb2t1cFwiICYmXG4gICAgICAgICAgIShjIGFzIFhybS5BdHRyaWJ1dGVzLkxvb2t1cEF0dHJpYnV0ZSkuZ2V0SXNQYXJ0eUxpc3QoKSAmJlxuICAgICAgICAgIGF0dHJpYnV0ZVZhbHVlLmxlbmd0aCA+IDBcbiAgICAgICAgKSB7XG4gICAgICAgICAgZm9ybVBhcmFtZXRlcnNbYXR0cmlidXRlTmFtZV0gPSBhdHRyaWJ1dGVWYWx1ZVswXS5pZDtcbiAgICAgICAgICBmb3JtUGFyYW1ldGVyc1thdHRyaWJ1dGVOYW1lICsgXCJuYW1lXCJdID0gYXR0cmlidXRlVmFsdWVbMF0ubmFtZTtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBhdHRyaWJ1dGVOYW1lID09PSBcImN1c3RvbWVyaWRcIiB8fFxuICAgICAgICAgICAgYXR0cmlidXRlTmFtZSA9PT0gXCJwYXJlbnRjdXN0b21lcmlkXCIgfHxcbiAgICAgICAgICAgIChjLmdldEF0dHJpYnV0ZVR5cGUgJiZcbiAgICAgICAgICAgICAgYy5nZXRBdHRyaWJ1dGVUeXBlKCkgPT09IFwibG9va3VwXCIgJiZcbiAgICAgICAgICAgICAgdHlwZW9mIChjIGFzIGFueSkuZ2V0TG9va3VwVHlwZXMgPT09IFwiZnVuY3Rpb25cIiAmJlxuICAgICAgICAgICAgICBBcnJheS5pc0FycmF5KChjIGFzIGFueSkuZ2V0TG9va3VwVHlwZXMoKSkgJiZcbiAgICAgICAgICAgICAgKGMgYXMgYW55KS5nZXRMb29rdXBUeXBlcygpLmxlbmd0aCA+IDEpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBmb3JtUGFyYW1ldGVyc1thdHRyaWJ1dGVOYW1lICsgXCJ0eXBlXCJdID1cbiAgICAgICAgICAgICAgYXR0cmlidXRlVmFsdWVbMF0uZW50aXR5VHlwZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoYXR0cmlidXRlVHlwZSA9PT0gXCJkYXRldGltZVwiKSB7XG4gICAgICAgICAgZm9ybVBhcmFtZXRlcnNbYXR0cmlidXRlTmFtZV0gPSBuZXcgRGF0ZShcbiAgICAgICAgICAgIGF0dHJpYnV0ZVZhbHVlXG4gICAgICAgICAgKS50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvcm1QYXJhbWV0ZXJzW2F0dHJpYnV0ZU5hbWVdID0gYXR0cmlidXRlVmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGF3YWl0IFhybS5OYXZpZ2F0aW9uLm9wZW5Gb3JtKFxuICAgICAgICAgIGVudGl0eUZvcm1PcHRpb25zLFxuICAgICAgICAgIGZvcm1QYXJhbWV0ZXJzXG4gICAgICAgICk7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7Z2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBleHBvcnQgbmFtZXNwYWNlIENsYXNzIHtcbiAgICAvKipcbiAgICAgKiBVc2VkIHRvIGV4ZWN1dGUgbWV0aG9kcyByZWxhdGVkIHRvIGEgc2luZ2xlIEF0dHJpYnV0ZVxuICAgICAqL1xuICAgIGV4cG9ydCBjbGFzcyBGaWVsZCBpbXBsZW1lbnRzIFhybS5BdHRyaWJ1dGVzLkF0dHJpYnV0ZSB7XG4gICAgICBwdWJsaWMgcmVhZG9ubHkgTmFtZSE6IHN0cmluZztcbiAgICAgIHByb3RlY3RlZCBfYXR0cmlidXRlPzogWHJtLkF0dHJpYnV0ZXMuQXR0cmlidXRlO1xuXG4gICAgICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGVOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5OYW1lID0gYXR0cmlidXRlTmFtZTtcbiAgICAgIH1cbiAgICAgIHNldFZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIGdldEF0dHJpYnV0ZVR5cGUoKTogWHJtLkF0dHJpYnV0ZXMuQXR0cmlidXRlVHlwZSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRBdHRyaWJ1dGVUeXBlKCk7XG4gICAgICB9XG4gICAgICBnZXRGb3JtYXQoKTogWHJtLkF0dHJpYnV0ZXMuQXR0cmlidXRlRm9ybWF0IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEZvcm1hdCgpO1xuICAgICAgfVxuICAgICAgZ2V0SXNEaXJ0eSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldElzRGlydHkoKTtcbiAgICAgIH1cbiAgICAgIGdldE5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldE5hbWUoKTtcbiAgICAgIH1cbiAgICAgIGdldFBhcmVudCgpOiBYcm0uRW50aXR5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFBhcmVudCgpO1xuICAgICAgfVxuICAgICAgZ2V0UmVxdWlyZWRMZXZlbCgpOiBYcm0uQXR0cmlidXRlcy5SZXF1aXJlbWVudExldmVsIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFJlcXVpcmVkTGV2ZWwoKTtcbiAgICAgIH1cbiAgICAgIGdldFN1Ym1pdE1vZGUoKTogWHJtLlN1Ym1pdE1vZGUge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0U3VibWl0TW9kZSgpO1xuICAgICAgfVxuICAgICAgZ2V0VXNlclByaXZpbGVnZSgpOiBYcm0uUHJpdmlsZWdlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFVzZXJQcml2aWxlZ2UoKTtcbiAgICAgIH1cbiAgICAgIHJlbW92ZU9uQ2hhbmdlKGhhbmRsZXI6IFhybS5FdmVudHMuQXR0cmlidXRlLkNoYW5nZUV2ZW50SGFuZGxlcik6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUucmVtb3ZlT25DaGFuZ2UoaGFuZGxlcik7XG4gICAgICB9XG4gICAgICBzZXRTdWJtaXRNb2RlKHN1Ym1pdE1vZGU6IFhybS5TdWJtaXRNb2RlKTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5zZXRTdWJtaXRNb2RlKHN1Ym1pdE1vZGUpO1xuICAgICAgfVxuICAgICAgZ2V0VmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRWYWx1ZSgpO1xuICAgICAgfVxuICAgICAgc2V0SXNWYWxpZChpc1ZhbGlkOiBib29sZWFuLCBtZXNzYWdlPzogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5zZXRJc1ZhbGlkKGlzVmFsaWQsIG1lc3NhZ2UpO1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgZ2V0IEF0dHJpYnV0ZSgpOiBYcm0uQXR0cmlidXRlcy5BdHRyaWJ1dGUge1xuICAgICAgICByZXR1cm4gKHRoaXMuX2F0dHJpYnV0ZSA/Pz1cbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZSh0aGlzLk5hbWUpID8/XG4gICAgICAgICAgWHJtRXgudGhyb3dFcnJvcihcbiAgICAgICAgICAgIGBUaGUgYXR0cmlidXRlICcke3RoaXMuTmFtZX0nIHdhcyBub3QgZm91bmQgb24gdGhlIGZvcm0uYFxuICAgICAgICAgICkpO1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgZ2V0IGNvbnRyb2xzKCk6IFhybS5Db2xsZWN0aW9uLkl0ZW1Db2xsZWN0aW9uPFhybS5Db250cm9scy5TdGFuZGFyZENvbnRyb2w+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmNvbnRyb2xzO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEdldHMgdGhlIHZhbHVlLlxuICAgICAgICogQHJldHVybnMgVGhlIHZhbHVlLlxuICAgICAgICovXG4gICAgICBwdWJsaWMgZ2V0IFZhbHVlKCk6IGFueSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRWYWx1ZSgpO1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgc2V0IFZhbHVlKHZhbHVlOiBhbnkpIHtcbiAgICAgICAgdGhpcy5BdHRyaWJ1dGUuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFNldHMgYSBjb250cm9sLWxvY2FsIG5vdGlmaWNhdGlvbiBtZXNzYWdlLlxuICAgICAgICogQHBhcmFtIG1lc3NhZ2UgVGhlIG1lc3NhZ2UuXG4gICAgICAgKiBAcGFyYW0gdW5pcXVlSWQgVW5pcXVlIGlkZW50aWZpZXIuXG4gICAgICAgKiBAcmV0dXJucyB0cnVlIGlmIGl0IHN1Y2NlZWRzLCBmYWxzZSBpZiBpdCBmYWlscy5cbiAgICAgICAqIEByZW1hcmtzICAgICBXaGVuIHRoaXMgbWV0aG9kIGlzIHVzZWQgb24gTWljcm9zb2Z0IER5bmFtaWNzIENSTSBmb3IgdGFibGV0cyBhIHJlZCBcIlhcIiBpY29uXG4gICAgICAgKiAgICAgICAgICAgICAgYXBwZWFycyBuZXh0IHRvIHRoZSBjb250cm9sLiBUYXBwaW5nIG9uIHRoZSBpY29uIHdpbGwgZGlzcGxheSB0aGUgbWVzc2FnZS5cbiAgICAgICAqL1xuICAgICAgcHVibGljIHNldE5vdGlmaWNhdGlvbihtZXNzYWdlOiBzdHJpbmcsIHVuaXF1ZUlkOiBzdHJpbmcpOiB0aGlzIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoIW1lc3NhZ2UpIHRocm93IG5ldyBFcnJvcihgbm8gbWVzc2FnZSB3YXMgcHJvdmlkZWQuYCk7XG4gICAgICAgICAgaWYgKCF1bmlxdWVJZCkgdGhyb3cgbmV3IEVycm9yKGBubyB1bmlxdWVJZCB3YXMgcHJvdmlkZWQuYCk7XG4gICAgICAgICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PlxuICAgICAgICAgICAgY29udHJvbC5zZXROb3RpZmljYXRpb24obWVzc2FnZSwgdW5pcXVlSWQpXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBTZXRzIHRoZSB2aXNpYmlsaXR5IHN0YXRlLlxuICAgICAgICogQHBhcmFtIHZpc2libGUgdHJ1ZSB0byBzaG93LCBmYWxzZSB0byBoaWRlLlxuICAgICAgICovXG4gICAgICBwdWJsaWMgc2V0VmlzaWJsZSh2aXNpYmxlOiBib29sZWFuKTogdGhpcyB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PiBjb250cm9sLnNldFZpc2libGUodmlzaWJsZSkpO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFNldHMgdGhlIHN0YXRlIG9mIHRoZSBjb250cm9sIHRvIGVpdGhlciBlbmFibGVkLCBvciBkaXNhYmxlZC5cbiAgICAgICAqIEBwYXJhbSBkaXNhYmxlZCB0cnVlIHRvIGRpc2FibGUsIGZhbHNlIHRvIGVuYWJsZS5cbiAgICAgICAqL1xuICAgICAgcHVibGljIHNldERpc2FibGVkKGRpc2FibGVkOiBib29sZWFuKTogdGhpcyB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PiBjb250cm9sLnNldERpc2FibGVkKGRpc2FibGVkKSk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogU2V0cyB0aGUgcmVxdWlyZWQgbGV2ZWwuXG4gICAgICAgKiBAcGFyYW0gcmVxdWlyZW1lbnRMZXZlbCBUaGUgcmVxdWlyZW1lbnQgbGV2ZWwsIGFzIGVpdGhlciBcIm5vbmVcIiwgXCJyZXF1aXJlZFwiLCBvciBcInJlY29tbWVuZGVkXCJcbiAgICAgICAqL1xuICAgICAgcHVibGljIHNldFJlcXVpcmVkTGV2ZWwoXG4gICAgICAgIHJlcXVpcmVtZW50TGV2ZWw6IFhybS5BdHRyaWJ1dGVzLlJlcXVpcmVtZW50TGV2ZWxcbiAgICAgICk6IHRoaXMge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMuQXR0cmlidXRlLnNldFJlcXVpcmVkTGV2ZWwocmVxdWlyZW1lbnRMZXZlbCk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogU2V0cyB0aGUgcmVxdWlyZWQgbGV2ZWwuXG4gICAgICAgKiBAcGFyYW0gcmVxdWlyZWQgVGhlIHJlcXVpcmVtZW50IGxldmVsLCBhcyBlaXRoZXIgZmFsc2UgZm9yIFwibm9uZVwiIG9yIHRydWUgZm9yIFwicmVxdWlyZWRcIlxuICAgICAgICovXG4gICAgICBwdWJsaWMgc2V0UmVxdWlyZWQocmVxdWlyZWQ6IGJvb2xlYW4pOiB0aGlzIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLkF0dHJpYnV0ZS5zZXRSZXF1aXJlZExldmVsKHJlcXVpcmVkID8gXCJyZXF1aXJlZFwiIDogXCJub25lXCIpO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipGaXJlIGFsbCBcIm9uIGNoYW5nZVwiIGV2ZW50IGhhbmRsZXJzLiAqL1xuICAgICAgcHVibGljIGZpcmVPbkNoYW5nZSgpOiB0aGlzIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLkF0dHJpYnV0ZS5maXJlT25DaGFuZ2UoKTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBBZGRzIGEgaGFuZGxlciBvciBhbiBhcnJheSBvZiBoYW5kbGVycyB0byBiZSBjYWxsZWQgd2hlbiB0aGUgYXR0cmlidXRlJ3MgdmFsdWUgaXMgY2hhbmdlZC5cbiAgICAgICAqIEBwYXJhbSBoYW5kbGVycyBUaGUgZnVuY3Rpb24gcmVmZXJlbmNlIG9yIGFuIGFycmF5IG9mIGZ1bmN0aW9uIHJlZmVyZW5jZXMuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBhZGRPbkNoYW5nZShcbiAgICAgICAgaGFuZGxlcnM6XG4gICAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyXG4gICAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyW11cbiAgICAgICk6IHRoaXMge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGhhbmRsZXJzKSkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBoYW5kbGVyIG9mIGhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gXCJmdW5jdGlvblwiKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJyR7aGFuZGxlcn0nIGlzIG5vdCBhIGZ1bmN0aW9uYCk7XG4gICAgICAgICAgICAgIHRoaXMuQXR0cmlidXRlLnJlbW92ZU9uQ2hhbmdlKGhhbmRsZXIpO1xuICAgICAgICAgICAgICB0aGlzLkF0dHJpYnV0ZS5hZGRPbkNoYW5nZShoYW5kbGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVycyAhPT0gXCJmdW5jdGlvblwiKVxuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCcke2hhbmRsZXJzfScgaXMgbm90IGEgZnVuY3Rpb25gKTtcbiAgICAgICAgICAgIHRoaXMuQXR0cmlidXRlLnJlbW92ZU9uQ2hhbmdlKGhhbmRsZXJzKTtcbiAgICAgICAgICAgIHRoaXMuQXR0cmlidXRlLmFkZE9uQ2hhbmdlKGhhbmRsZXJzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogRGlzcGxheXMgYW4gZXJyb3Igb3IgcmVjb21tZW5kYXRpb24gbm90aWZpY2F0aW9uIGZvciBhIGNvbnRyb2wsIGFuZCBsZXRzIHlvdSBzcGVjaWZ5IGFjdGlvbnMgdG8gZXhlY3V0ZSBiYXNlZCBvbiB0aGUgbm90aWZpY2F0aW9uLlxuICAgICAgICovXG4gICAgICBwdWJsaWMgYWRkTm90aWZpY2F0aW9uKFxuICAgICAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgICAgIG5vdGlmaWNhdGlvbkxldmVsOiBcIkVSUk9SXCIgfCBcIlJFQ09NTUVOREFUSU9OXCIsXG4gICAgICAgIHVuaXF1ZUlkOiBzdHJpbmcsXG4gICAgICAgIGFjdGlvbnM/OiBYcm0uQ29udHJvbHMuQ29udHJvbE5vdGlmaWNhdGlvbkFjdGlvbltdXG4gICAgICApOiB0aGlzIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoIXVuaXF1ZUlkKSB0aHJvdyBuZXcgRXJyb3IoYG5vIHVuaXF1ZUlkIHdhcyBwcm92aWRlZC5gKTtcbiAgICAgICAgICBpZiAoYWN0aW9ucyAmJiAhQXJyYXkuaXNBcnJheShhY3Rpb25zKSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgYHRoZSBhY3Rpb24gcGFyYW1ldGVyIGlzIG5vdCBhbiBhcnJheSBvZiBDb250cm9sTm90aWZpY2F0aW9uQWN0aW9uYFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB0aGlzLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2wpID0+IHtcbiAgICAgICAgICAgIGNvbnRyb2wuYWRkTm90aWZpY2F0aW9uKHtcbiAgICAgICAgICAgICAgbWVzc2FnZXM6IFttZXNzYWdlXSxcbiAgICAgICAgICAgICAgbm90aWZpY2F0aW9uTGV2ZWw6IG5vdGlmaWNhdGlvbkxldmVsLFxuICAgICAgICAgICAgICB1bmlxdWVJZDogdW5pcXVlSWQsXG4gICAgICAgICAgICAgIGFjdGlvbnM6IGFjdGlvbnMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICogQ2xlYXJzIHRoZSBub3RpZmljYXRpb24gaWRlbnRpZmllZCBieSB1bmlxdWVJZC5cbiAgICAgICAqIEBwYXJhbSB1bmlxdWVJZCAoT3B0aW9uYWwpIFVuaXF1ZSBpZGVudGlmaWVyLlxuICAgICAgICogQHJldHVybnMgdHJ1ZSBpZiBpdCBzdWNjZWVkcywgZmFsc2UgaWYgaXQgZmFpbHMuXG4gICAgICAgKiBAcmVtYXJrcyBJZiB0aGUgdW5pcXVlSWQgcGFyYW1ldGVyIGlzIG5vdCB1c2VkLCB0aGUgY3VycmVudCBub3RpZmljYXRpb24gc2hvd24gd2lsbCBiZSByZW1vdmVkLlxuICAgICAgICovXG4gICAgICByZW1vdmVOb3RpZmljYXRpb24odW5pcXVlSWQ6IHN0cmluZyk6IHRoaXMge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMuY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT4ge1xuICAgICAgICAgICAgY29udHJvbC5jbGVhck5vdGlmaWNhdGlvbih1bmlxdWVJZCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGV4cG9ydCBjbGFzcyBUZXh0RmllbGRcbiAgICAgIGV4dGVuZHMgRmllbGRcbiAgICAgIGltcGxlbWVudHMgWHJtLkF0dHJpYnV0ZXMuU3RyaW5nQXR0cmlidXRlXG4gICAge1xuICAgICAgcHJvdGVjdGVkIGRlY2xhcmUgX2F0dHJpYnV0ZTogWHJtLkF0dHJpYnV0ZXMuU3RyaW5nQXR0cmlidXRlO1xuICAgICAgY29uc3RydWN0b3IoYXR0cmlidXRlOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoYXR0cmlidXRlKTtcbiAgICAgIH1cbiAgICAgIGdldE1heExlbmd0aCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0TWF4TGVuZ3RoKCk7XG4gICAgICB9XG4gICAgICBnZXRGb3JtYXQoKTogWHJtLkF0dHJpYnV0ZXMuU3RyaW5nQXR0cmlidXRlRm9ybWF0IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEZvcm1hdCgpIGFzIFhybS5BdHRyaWJ1dGVzLlN0cmluZ0F0dHJpYnV0ZUZvcm1hdDtcbiAgICAgIH1cbiAgICAgIGdldCBBdHRyaWJ1dGUoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5fYXR0cmlidXRlID8/PVxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKHRoaXMuTmFtZSkgPz9cbiAgICAgICAgICBYcm1FeC50aHJvd0Vycm9yKGBGaWVsZCAnJHt0aGlzLk5hbWV9JyBkb2VzIG5vdCBleGlzdGApKTtcbiAgICAgIH1cbiAgICAgIGdldCBjb250cm9scygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmNvbnRyb2xzO1xuICAgICAgfVxuICAgICAgZ2V0IFZhbHVlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRWYWx1ZSgpID8/IG51bGw7XG4gICAgICB9XG4gICAgICBzZXQgVmFsdWUodmFsdWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGV4cG9ydCBjbGFzcyBOdW1iZXJGaWVsZFxuICAgICAgZXh0ZW5kcyBGaWVsZFxuICAgICAgaW1wbGVtZW50cyBYcm0uQXR0cmlidXRlcy5OdW1iZXJBdHRyaWJ1dGVcbiAgICB7XG4gICAgICBwcm90ZWN0ZWQgZGVjbGFyZSBfYXR0cmlidXRlOiBYcm0uQXR0cmlidXRlcy5OdW1iZXJBdHRyaWJ1dGU7XG4gICAgICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGU6IHN0cmluZykge1xuICAgICAgICBzdXBlcihhdHRyaWJ1dGUpO1xuICAgICAgfVxuICAgICAgZ2V0Rm9ybWF0KCk6IFhybS5BdHRyaWJ1dGVzLkludGVnZXJBdHRyaWJ1dGVGb3JtYXQge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0Rm9ybWF0KCkgYXMgWHJtLkF0dHJpYnV0ZXMuSW50ZWdlckF0dHJpYnV0ZUZvcm1hdDtcbiAgICAgIH1cbiAgICAgIGdldE1heCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0TWF4KCk7XG4gICAgICB9XG4gICAgICBnZXRNaW4oKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldE1pbigpO1xuICAgICAgfVxuICAgICAgZ2V0UHJlY2lzaW9uKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRQcmVjaXNpb24oKTtcbiAgICAgIH1cbiAgICAgIHNldFByZWNpc2lvbihwcmVjaXNpb246IG51bWJlcik6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuc2V0UHJlY2lzaW9uKHByZWNpc2lvbik7XG4gICAgICB9XG4gICAgICBnZXQgQXR0cmlidXRlKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuX2F0dHJpYnV0ZSA/Pz1cbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZSh0aGlzLk5hbWUpID8/XG4gICAgICAgICAgWHJtRXgudGhyb3dFcnJvcihgRmllbGQgJyR7dGhpcy5OYW1lfScgZG9lcyBub3QgZXhpc3RgKSk7XG4gICAgICB9XG4gICAgICBnZXQgY29udHJvbHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5jb250cm9scztcbiAgICAgIH1cbiAgICAgIGdldCBWYWx1ZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0VmFsdWUoKSA/PyBudWxsO1xuICAgICAgfVxuICAgICAgc2V0IFZhbHVlKHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5BdHRyaWJ1dGUuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBleHBvcnQgY2xhc3MgRGF0ZUZpZWxkXG4gICAgICBleHRlbmRzIEZpZWxkXG4gICAgICBpbXBsZW1lbnRzIFhybS5BdHRyaWJ1dGVzLkRhdGVBdHRyaWJ1dGVcbiAgICB7XG4gICAgICBwcm90ZWN0ZWQgZGVjbGFyZSBfYXR0cmlidXRlOiBYcm0uQXR0cmlidXRlcy5EYXRlQXR0cmlidXRlO1xuICAgICAgY29uc3RydWN0b3IoYXR0cmlidXRlOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoYXR0cmlidXRlKTtcbiAgICAgIH1cbiAgICAgIGdldEZvcm1hdCgpOiBYcm0uQXR0cmlidXRlcy5EYXRlQXR0cmlidXRlRm9ybWF0IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEZvcm1hdCgpIGFzIFhybS5BdHRyaWJ1dGVzLkRhdGVBdHRyaWJ1dGVGb3JtYXQ7XG4gICAgICB9XG4gICAgICBnZXQgQXR0cmlidXRlKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuX2F0dHJpYnV0ZSA/Pz1cbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZSh0aGlzLk5hbWUpID8/XG4gICAgICAgICAgWHJtRXgudGhyb3dFcnJvcihgRmllbGQgJyR7dGhpcy5OYW1lfScgZG9lcyBub3QgZXhpc3RgKSk7XG4gICAgICB9XG4gICAgICBnZXQgY29udHJvbHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5jb250cm9scztcbiAgICAgIH1cbiAgICAgIGdldCBWYWx1ZSgpOiBEYXRlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFZhbHVlKCkgPz8gbnVsbDtcbiAgICAgIH1cbiAgICAgIHNldCBWYWx1ZSh2YWx1ZTogRGF0ZSkge1xuICAgICAgICB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGV4cG9ydCBjbGFzcyBCb29sZWFuRmllbGRcbiAgICAgIGV4dGVuZHMgRmllbGRcbiAgICAgIGltcGxlbWVudHMgWHJtLkF0dHJpYnV0ZXMuQm9vbGVhbkF0dHJpYnV0ZVxuICAgIHtcbiAgICAgIHByb3RlY3RlZCBkZWNsYXJlIF9hdHRyaWJ1dGU6IFhybS5BdHRyaWJ1dGVzLkJvb2xlYW5BdHRyaWJ1dGU7XG4gICAgICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGU6IHN0cmluZykge1xuICAgICAgICBzdXBlcihhdHRyaWJ1dGUpO1xuICAgICAgfVxuICAgICAgZ2V0QXR0cmlidXRlVHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEF0dHJpYnV0ZVR5cGUoKTtcbiAgICAgIH1cbiAgICAgIGdldEluaXRpYWxWYWx1ZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEluaXRpYWxWYWx1ZSgpO1xuICAgICAgfVxuICAgICAgZ2V0IEF0dHJpYnV0ZSgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl9hdHRyaWJ1dGUgPz89XG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUodGhpcy5OYW1lKSA/P1xuICAgICAgICAgIFhybUV4LnRocm93RXJyb3IoYEZpZWxkICcke3RoaXMuTmFtZX0nIGRvZXMgbm90IGV4aXN0YCkpO1xuICAgICAgfVxuICAgICAgZ2V0IGNvbnRyb2xzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuY29udHJvbHM7XG4gICAgICB9XG4gICAgICBnZXQgVmFsdWUoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRWYWx1ZSgpID8/IG51bGw7XG4gICAgICB9XG4gICAgICBzZXQgVmFsdWUodmFsdWU6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5BdHRyaWJ1dGUuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBleHBvcnQgY2xhc3MgTXVsdGlTZWxlY3RPcHRpb25TZXRGaWVsZDxPcHRpb25zIGV4dGVuZHMgT3B0aW9uVmFsdWVzPlxuICAgICAgZXh0ZW5kcyBGaWVsZFxuICAgICAgaW1wbGVtZW50cyBYcm0uQXR0cmlidXRlcy5NdWx0aVNlbGVjdE9wdGlvblNldEF0dHJpYnV0ZVxuICAgIHtcbiAgICAgIHByb3RlY3RlZCBkZWNsYXJlIF9hdHRyaWJ1dGU6IFhybS5BdHRyaWJ1dGVzLk11bHRpU2VsZWN0T3B0aW9uU2V0QXR0cmlidXRlO1xuICAgICAgT3B0aW9uOiBPcHRpb25zO1xuICAgICAgY29uc3RydWN0b3IoYXR0cmlidXRlTmFtZTogc3RyaW5nLCBvcHRpb24/OiBPcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKGF0dHJpYnV0ZU5hbWUpO1xuICAgICAgICB0aGlzLk9wdGlvbiA9IG9wdGlvbjtcbiAgICAgIH1cbiAgICAgIGdldEZvcm1hdCgpOiBYcm0uQXR0cmlidXRlcy5PcHRpb25TZXRBdHRyaWJ1dGVGb3JtYXQge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0Rm9ybWF0KCkgYXMgWHJtLkF0dHJpYnV0ZXMuT3B0aW9uU2V0QXR0cmlidXRlRm9ybWF0O1xuICAgICAgfVxuICAgICAgZ2V0T3B0aW9uKHZhbHVlOiBudW1iZXIgfCBzdHJpbmcpOiBYcm0uT3B0aW9uU2V0VmFsdWUge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldE9wdGlvbih2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldE9wdGlvbih2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGdldE9wdGlvbnMoKTogWHJtLk9wdGlvblNldFZhbHVlW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0T3B0aW9ucygpO1xuICAgICAgfVxuICAgICAgZ2V0U2VsZWN0ZWRPcHRpb24oKTogWHJtLk9wdGlvblNldFZhbHVlW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0U2VsZWN0ZWRPcHRpb24oKTtcbiAgICAgIH1cbiAgICAgIGdldFRleHQoKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0VGV4dCgpO1xuICAgICAgfVxuICAgICAgZ2V0SW5pdGlhbFZhbHVlKCk6IG51bWJlcltdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEluaXRpYWxWYWx1ZSgpO1xuICAgICAgfVxuICAgICAgZ2V0IEF0dHJpYnV0ZSgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl9hdHRyaWJ1dGUgPz89XG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUodGhpcy5OYW1lKSA/P1xuICAgICAgICAgIFhybUV4LnRocm93RXJyb3IoYEZpZWxkICcke3RoaXMuTmFtZX0nIGRvZXMgbm90IGV4aXN0YCkpO1xuICAgICAgfVxuICAgICAgZ2V0IGNvbnRyb2xzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuY29udHJvbHM7XG4gICAgICB9XG4gICAgICBnZXQgVmFsdWUoKTogbnVtYmVyW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0VmFsdWUoKTtcbiAgICAgIH1cbiAgICAgIHNldCBWYWx1ZSh2YWx1ZTogKGtleW9mIE9wdGlvbnMpW10gfCBudW1iZXJbXSkge1xuICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKG51bGwpO1xuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgIGxldCB2YWx1ZXMgPSBbXTtcbiAgICAgICAgICB2YWx1ZS5mb3JFYWNoKCh2KSA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHYgPT0gXCJudW1iZXJcIikgdmFsdWVzLnB1c2godik7XG4gICAgICAgICAgICBlbHNlIHZhbHVlcy5wdXNoKHRoaXMuT3B0aW9uW3ZdKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh2YWx1ZXMpO1xuICAgICAgICB9IGVsc2UgWHJtRXgudGhyb3dFcnJvcihgRmllbGQgVmFsdWUgJyR7dmFsdWV9JyBpcyBub3QgYW4gQXJyYXlgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdHlwZSBFbWJlZGRlZEZpZWxkcyA9IHtcbiAgICAgIFtrZXk6IHN0cmluZ106IEZpZWxkO1xuICAgIH07XG4gICAgZXhwb3J0IGNsYXNzIExvb2t1cEZpZWxkPEZpZWxkcyBleHRlbmRzIEVtYmVkZGVkRmllbGRzID0ge30+XG4gICAgICBleHRlbmRzIEZpZWxkXG4gICAgICBpbXBsZW1lbnRzIFhybS5BdHRyaWJ1dGVzLkxvb2t1cEF0dHJpYnV0ZVxuICAgIHtcbiAgICAgIHByb3RlY3RlZCBkZWNsYXJlIF9hdHRyaWJ1dGU6IFhybS5BdHRyaWJ1dGVzLkxvb2t1cEF0dHJpYnV0ZTtcbiAgICAgIHByb3RlY3RlZCBfY3VzdG9tRmlsdGVyczogYW55ID0gW107XG4gICAgICBwcml2YXRlIHZpZXdJZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG4gICAgICBwdWJsaWMgRmllbGRzOiBGaWVsZHM7XG4gICAgICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGU6IHN0cmluZywgZmllbGRzPzogRmllbGRzKSB7XG4gICAgICAgIHN1cGVyKGF0dHJpYnV0ZSk7XG4gICAgICAgIHRoaXMuRmllbGRzID0gZmllbGRzID8/ICh7fSBhcyBGaWVsZHMpO1xuICAgICAgfVxuICAgICAgZ2V0SXNQYXJ0eUxpc3QoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRJc1BhcnR5TGlzdCgpO1xuICAgICAgfVxuICAgICAgZ2V0IEF0dHJpYnV0ZSgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl9hdHRyaWJ1dGUgPz89XG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUodGhpcy5OYW1lKSA/P1xuICAgICAgICAgIFhybUV4LnRocm93RXJyb3IoYEZpZWxkICcke3RoaXMuTmFtZX0nIGRvZXMgbm90IGV4aXN0YCkpO1xuICAgICAgfVxuICAgICAgZ2V0IGNvbnRyb2xzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuY29udHJvbHM7XG4gICAgICB9XG4gICAgICAvKipHZXRzIHRoZSBpZCBvZiB0aGUgZmlyc3QgbG9va3VwIHZhbHVlKi9cbiAgICAgIGdldCBJZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuVmFsdWUgJiYgdGhpcy5WYWx1ZS5sZW5ndGggPiAwXG4gICAgICAgICAgPyBYcm1FeC5ub3JtYWxpemVHdWlkKHRoaXMuVmFsdWVbMF0uaWQpXG4gICAgICAgICAgOiBudWxsO1xuICAgICAgfVxuICAgICAgLyoqR2V0cyB0aGUgZW50aXR5VHlwZSBvZiB0aGUgZmlyc3QgbG9va3VwIHZhbHVlKi9cbiAgICAgIGdldCBFbnRpdHlUeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5WYWx1ZSAmJiB0aGlzLlZhbHVlLmxlbmd0aCA+IDBcbiAgICAgICAgICA/IHRoaXMuVmFsdWVbMF0uZW50aXR5VHlwZVxuICAgICAgICAgIDogbnVsbDtcbiAgICAgIH1cbiAgICAgIC8qKkdldHMgdGhlIGZvcm1hdHRlZCB2YWx1ZSBvZiB0aGUgZmlyc3QgbG9va3VwIHZhbHVlKi9cbiAgICAgIGdldCBGb3JtYXR0ZWRWYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuVmFsdWUgJiYgdGhpcy5WYWx1ZS5sZW5ndGggPiAwID8gdGhpcy5WYWx1ZVswXS5uYW1lIDogbnVsbDtcbiAgICAgIH1cbiAgICAgIGdldCBWYWx1ZSgpOiBYcm0uTG9va3VwVmFsdWVbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRWYWx1ZSgpID8/IG51bGw7XG4gICAgICB9XG4gICAgICBzZXQgVmFsdWUodmFsdWU6IFhybS5Mb29rdXBWYWx1ZVtdKSB7XG4gICAgICAgIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICogR2V0cyB0aGUgZW1iZWRkZWQgZm9ybSBkYXRhIGVudGl0eSBjb250ZXh0XG4gICAgICAgKiBAcmV0dXJucyBUaGUgZW50aXR5IGNvbnRleHQgb2YgdGhlIGVtYmVkZGVkIGZvcm0gb3IgbnVsbCBpZiBub3QgbG9hZGVkXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBnZXQgRGF0YSgpOlxuICAgICAgICB8ICh7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiBYcm0uQ29sbGVjdGlvbi5JdGVtQ29sbGVjdGlvbjxYcm0uQXR0cmlidXRlcy5BdHRyaWJ1dGU+O1xuICAgICAgICAgIH0gJiB7IFtLIGluIGtleW9mIEZpZWxkc106IEZpZWxkc1tLXSB9KVxuICAgICAgICB8IG51bGwge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIEZpbmQgdGhlIGZpcnN0IGxvYWRlZCBjb250cm9sXG4gICAgICAgICAgbGV0IGNvbnRyb2w6IGFueSA9IG51bGw7XG4gICAgICAgICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjKSA9PiB7XG4gICAgICAgICAgICBpZiAoKGMgYXMgYW55KT8uaXNMb2FkZWQgJiYgIWNvbnRyb2wpIHtcbiAgICAgICAgICAgICAgY29udHJvbCA9IGM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZiAoIWNvbnRyb2wgfHwgIWNvbnRyb2wuaXNMb2FkZWQoKSkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgICBjb25zdCBlbnRpdHlEYXRhID0gY29udHJvbC5kYXRhLmVudGl0eTtcblxuICAgICAgICAgIC8vIENyZWF0ZSBhIHByb3h5IHRvIGFjY2VzcyBmaWVsZHMgZGlyZWN0bHlcbiAgICAgICAgICBjb25zdCBmaWVsZHNQcm94eSA9IG5ldyBQcm94eShlbnRpdHlEYXRhLCB7XG4gICAgICAgICAgICBnZXQ6ICh0YXJnZXQsIHByb3A6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICBpZiAocHJvcCA9PT0gXCJhdHRyaWJ1dGVzXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0LmF0dHJpYnV0ZXM7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKHRoaXMuRmllbGRzW3Byb3BdKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmllbGQgPSB0aGlzLkZpZWxkc1twcm9wXTtcbiAgICAgICAgICAgICAgICAvLyBTZXQgdGhlIGZpZWxkJ3MgYXR0cmlidXRlIGZyb20gdGhlIGVtYmVkZGVkIGZvcm1cbiAgICAgICAgICAgICAgICAoZmllbGQgYXMgYW55KS5fYXR0cmlidXRlID0gdGFyZ2V0LmF0dHJpYnV0ZXMuZ2V0KGZpZWxkLk5hbWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmaWVsZDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BdO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHJldHVybiBmaWVsZHNQcm94eTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICogU2V0cyB0aGUgdmFsdWUgb2YgYSBsb29rdXBcbiAgICAgICAqIEBwYXJhbSBpZCBHdWlkIG9mIHRoZSByZWNvcmRcbiAgICAgICAqIEBwYXJhbSBlbnRpdHlUeXBlIGxvZ2ljYWxuYW1lIG9mIHRoZSBlbnRpdHlcbiAgICAgICAqIEBwYXJhbSBuYW1lIGZvcm1hdHRlZCB2YWx1ZVxuICAgICAgICogQHBhcmFtIGFwcGVuZCBpZiB0cnVlLCBhZGRzIHZhbHVlIHRvIHRoZSBhcnJheSBpbnN0ZWFkIG9mIHJlcGxhY2luZyBpdFxuICAgICAgICovXG4gICAgICBzZXRMb29rdXBWYWx1ZShcbiAgICAgICAgaWQ6IHN0cmluZyxcbiAgICAgICAgZW50aXR5VHlwZTogYW55LFxuICAgICAgICBuYW1lOiBhbnksXG4gICAgICAgIGFwcGVuZCA9IGZhbHNlXG4gICAgICApOiB0aGlzIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoIWlkKSB0aHJvdyBuZXcgRXJyb3IoYG5vIGlkIHBhcmFtZXRlciB3YXMgcHJvdmlkZWQuYCk7XG4gICAgICAgICAgaWYgKCFlbnRpdHlUeXBlKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBubyBlbnRpdHlUeXBlIHBhcmFtZXRlciB3YXMgcHJvdmlkZWQuYCk7XG4gICAgICAgICAgaWQgPSBYcm1FeC5ub3JtYWxpemVHdWlkKGlkKTtcbiAgICAgICAgICBjb25zdCBsb29rdXBWYWx1ZSA9IHtcbiAgICAgICAgICAgIGlkLFxuICAgICAgICAgICAgZW50aXR5VHlwZSxcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgfTtcbiAgICAgICAgICB0aGlzLlZhbHVlID1cbiAgICAgICAgICAgIGFwcGVuZCAmJiB0aGlzLlZhbHVlXG4gICAgICAgICAgICAgID8gdGhpcy5WYWx1ZS5jb25jYXQobG9va3VwVmFsdWUpXG4gICAgICAgICAgICAgIDogW2xvb2t1cFZhbHVlXTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICogU2V0cyBhIGxvb2t1cCB3aXRoIGEgbG9va3VwIGZyb20gdGhlIHJldHJpZXZlZCByZWNvcmQuXG4gICAgICAgKiBAcGFyYW0gc2VsZWN0TmFtZVxuICAgICAgICogQHBhcmFtIHJldHJpZXZlZFJlY29yZFxuICAgICAgICogQGV4YW1wbGVcbiAgICAgICAqIHZhciBjb250YWN0ID0gYXdhaXQgZmllbGRzLkNvbnRhY3QucmV0cmlldmUoJz8kc2VsZWN0PV9wYXJlbnRjdXN0b21lcmlkX3ZhbHVlJyk7XG4gICAgICAgKiBmaWVsZHMuQWNjb3VudC5zZXRMb29rdXBGcm9tUmV0cmlldmUoJ19wYXJlbnRjdXN0b21lcmlkX3ZhbHVlJywgY29udGFjdCk7XG4gICAgICAgKiAvL0FsdGVybmF0ZVxuICAgICAgICogZmllbGRzLkFjY291bnQuc2V0TG9va3VwRnJvbVJldHJpZXZlKCdwYXJlbnRjdXN0b21lcmlkJywgY29udGFjdCk7XG4gICAgICAgKi9cbiAgICAgIHNldExvb2t1cEZyb21SZXRyaWV2ZShcbiAgICAgICAgc2VsZWN0TmFtZTogc3RyaW5nLFxuICAgICAgICByZXRyaWV2ZWRSZWNvcmQ6IHsgW3g6IHN0cmluZ106IGFueSB9XG4gICAgICApIHtcbiAgICAgICAgaWYgKCFzZWxlY3ROYW1lLmVuZHNXaXRoKFwiX3ZhbHVlXCIpKSBzZWxlY3ROYW1lID0gYF8ke3NlbGVjdE5hbWV9X3ZhbHVlYDtcbiAgICAgICAgaWYgKCFyZXRyaWV2ZWRSZWNvcmQgfHwgIXJldHJpZXZlZFJlY29yZFtgJHtzZWxlY3ROYW1lfWBdKSB7XG4gICAgICAgICAgdGhpcy5WYWx1ZSA9IG51bGw7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuVmFsdWUgPSBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgaWQ6IHJldHJpZXZlZFJlY29yZFtgJHtzZWxlY3ROYW1lfWBdLFxuICAgICAgICAgICAgZW50aXR5VHlwZTpcbiAgICAgICAgICAgICAgcmV0cmlldmVkUmVjb3JkW1xuICAgICAgICAgICAgICAgIGAke3NlbGVjdE5hbWV9QE1pY3Jvc29mdC5EeW5hbWljcy5DUk0ubG9va3VwbG9naWNhbG5hbWVgXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuYW1lOiByZXRyaWV2ZWRSZWNvcmRbXG4gICAgICAgICAgICAgIGAke3NlbGVjdE5hbWV9QE9EYXRhLkNvbW11bml0eS5EaXNwbGF5LlYxLkZvcm1hdHRlZFZhbHVlYFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICBdO1xuICAgICAgfVxuICAgICAgLyoqXG4gICAgICAgKiBSZXRyaWV2ZXMgYW4gZW50aXR5IHJlY29yZC5cbiAgICAgICAqIEBwYXJhbSBvcHRpb25zIChPcHRpb25hbCkgT0RhdGEgc3lzdGVtIHF1ZXJ5IG9wdGlvbnMsICRzZWxlY3QgYW5kICRleHBhbmQsIHRvIHJldHJpZXZlIHlvdXIgZGF0YS5cbiAgICAgICAqIC0gVXNlIHRoZSAkc2VsZWN0IHN5c3RlbSBxdWVyeSBvcHRpb24gdG8gbGltaXQgdGhlIHByb3BlcnRpZXMgcmV0dXJuZWQgYnkgaW5jbHVkaW5nIGEgY29tbWEtc2VwYXJhdGVkXG4gICAgICAgKiAgIGxpc3Qgb2YgcHJvcGVydHkgbmFtZXMuIFRoaXMgaXMgYW4gaW1wb3J0YW50IHBlcmZvcm1hbmNlIGJlc3QgcHJhY3RpY2UuIElmIHByb3BlcnRpZXMgYXJlbuKAmXRcbiAgICAgICAqICAgc3BlY2lmaWVkIHVzaW5nICRzZWxlY3QsIGFsbCBwcm9wZXJ0aWVzIHdpbGwgYmUgcmV0dXJuZWQuXG4gICAgICAgKiAtIFVzZSB0aGUgJGV4cGFuZCBzeXN0ZW0gcXVlcnkgb3B0aW9uIHRvIGNvbnRyb2wgd2hhdCBkYXRhIGZyb20gcmVsYXRlZCBlbnRpdGllcyBpcyByZXR1cm5lZC4gSWYgeW91XG4gICAgICAgKiAgIGp1c3QgaW5jbHVkZSB0aGUgbmFtZSBvZiB0aGUgbmF2aWdhdGlvbiBwcm9wZXJ0eSwgeW914oCZbGwgcmVjZWl2ZSBhbGwgdGhlIHByb3BlcnRpZXMgZm9yIHJlbGF0ZWRcbiAgICAgICAqICAgcmVjb3Jkcy4gWW91IGNhbiBsaW1pdCB0aGUgcHJvcGVydGllcyByZXR1cm5lZCBmb3IgcmVsYXRlZCByZWNvcmRzIHVzaW5nIHRoZSAkc2VsZWN0IHN5c3RlbSBxdWVyeVxuICAgICAgICogICBvcHRpb24gaW4gcGFyZW50aGVzZXMgYWZ0ZXIgdGhlIG5hdmlnYXRpb24gcHJvcGVydHkgbmFtZS4gVXNlIHRoaXMgZm9yIGJvdGggc2luZ2xlLXZhbHVlZCBhbmRcbiAgICAgICAqICAgY29sbGVjdGlvbi12YWx1ZWQgbmF2aWdhdGlvbiBwcm9wZXJ0aWVzLlxuICAgICAgICogLSBZb3UgY2FuIGFsc28gc3BlY2lmeSBtdWx0aXBsZSBxdWVyeSBvcHRpb25zIGJ5IHVzaW5nICYgdG8gc2VwYXJhdGUgdGhlIHF1ZXJ5IG9wdGlvbnMuXG4gICAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5vcHRpb25zIGV4YW1wbGU6PC9jYXB0aW9uPlxuICAgICAgICogb3B0aW9uczogJHNlbGVjdD1uYW1lJiRleHBhbmQ9cHJpbWFyeWNvbnRhY3RpZCgkc2VsZWN0PWNvbnRhY3RpZCxmdWxsbmFtZSlcbiAgICAgICAqIEByZXR1cm5zIE9uIHN1Y2Nlc3MsIHJldHVybnMgYSBwcm9taXNlIGNvbnRhaW5pbmcgYSBKU09OIG9iamVjdCB3aXRoIHRoZSByZXRyaWV2ZWQgYXR0cmlidXRlcyBhbmQgdGhlaXIgdmFsdWVzLlxuICAgICAgICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kb2NzLm1pY3Jvc29mdC5jb20vZW4tdXMvZHluYW1pY3MzNjUvY3VzdG9tZXItZW5nYWdlbWVudC9kZXZlbG9wZXIvY2xpZW50YXBpL3JlZmVyZW5jZS94cm0td2ViYXBpL3JldHJpZXZlcmVjb3JkIEV4dGVybmFsIExpbms6IHJldHJpZXZlUmVjb3JkIChDbGllbnQgQVBJIHJlZmVyZW5jZSl9XG4gICAgICAgKi9cbiAgICAgIGFzeW5jIHJldHJpZXZlKG9wdGlvbnM6IHN0cmluZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghdGhpcy5JZCB8fCAhdGhpcy5FbnRpdHlUeXBlKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICBjb25zdCByZWNvcmQgPSBhd2FpdCBYcm0uV2ViQXBpLnJldHJpZXZlUmVjb3JkKFxuICAgICAgICAgICAgdGhpcy5FbnRpdHlUeXBlLFxuICAgICAgICAgICAgdGhpcy5JZCxcbiAgICAgICAgICAgIG9wdGlvbnNcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiByZWNvcmQ7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvKipcbiAgICAgICAqIEFkZHMgYW4gYWRkaXRpb25hbCBjdXN0b20gZmlsdGVyIHRvIHRoZSBsb29rdXAsIHdpdGggdGhlIFwiQU5EXCIgZmlsdGVyIG9wZXJhdG9yLlxuICAgICAgICogQHBhcmFtIGZpbHRlciBTcGVjaWZpZXMgdGhlIGZpbHRlciwgYXMgYSBzZXJpYWxpemVkIEZldGNoWE1MIFwiZmlsdGVyXCIgbm9kZS5cbiAgICAgICAqIEBwYXJhbSBlbnRpdHlMb2dpY2FsTmFtZSAoT3B0aW9uYWwpIFRoZSBsb2dpY2FsIG5hbWUgb2YgdGhlIGVudGl0eS5cbiAgICAgICAqIEByZW1hcmtzICAgICBJZiBlbnRpdHlMb2dpY2FsTmFtZSBpcyBub3Qgc3BlY2lmaWVkLCB0aGUgZmlsdGVyIHdpbGwgYmUgYXBwbGllZCB0byBhbGwgZW50aXRpZXNcbiAgICAgICAqICAgICAgICAgICAgICB2YWxpZCBmb3IgdGhlIExvb2t1cCBjb250cm9sLlxuICAgICAgICogQGV4YW1wbGUgICAgIEV4YW1wbGUgZmlsdGVyOiA8ZmlsdGVyIHR5cGU9XCJhbmRcIj5cbiAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCJhZGRyZXNzMV9jaXR5XCIgb3BlcmF0b3I9XCJlcVwiIHZhbHVlPVwiUmVkbW9uZFwiIC8+XG4gICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZmlsdGVyPlxuICAgICAgICovXG4gICAgICBhZGRQcmVGaWx0ZXJUb0xvb2t1cChcbiAgICAgICAgZmlsdGVyWG1sOiBzdHJpbmcsXG4gICAgICAgIGVudGl0eUxvZ2ljYWxOYW1lPzogc3RyaW5nXG4gICAgICApOiB0aGlzIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBfYWRkQ3VzdG9tRmlsdGVyLmNvbnRyb2xzID0gdGhpcy5jb250cm9scztcbiAgICAgICAgICB0aGlzLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2wpID0+IHtcbiAgICAgICAgICAgIGNvbnRyb2wuYWRkUHJlU2VhcmNoKF9hZGRDdXN0b21GaWx0ZXIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuX2N1c3RvbUZpbHRlcnMucHVzaChfYWRkQ3VzdG9tRmlsdGVyKTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBfYWRkQ3VzdG9tRmlsdGVyKCkge1xuICAgICAgICAgIF9hZGRDdXN0b21GaWx0ZXIuY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT4ge1xuICAgICAgICAgICAgY29udHJvbC5hZGRDdXN0b21GaWx0ZXIoZmlsdGVyWG1sLCBlbnRpdHlMb2dpY2FsTmFtZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICogQGRlcHJlY2F0ZWQgVXNlIHtAbGluayBMb29rdXBGaWVsZC5hZGRDdXN0b21WaWV3fSBpbnN0ZWFkLCB3aGljaCBwcm92aWRlcyBtb3JlIGZsZXhpYmxlIGZpbHRlcmluZyBjYXBhYmlsaXRpZXMgYW5kIGJldHRlciBwZXJmb3JtYW5jZVxuICAgICAgICogQWRkcyBhbiBhZGRpdGlvbmFsIGN1c3RvbSBmaWx0ZXIgdG8gdGhlIGxvb2t1cCwgd2l0aCB0aGUgXCJBTkRcIiBmaWx0ZXIgb3BlcmF0b3IuXG4gICAgICAgKiBAcGFyYW0gZW50aXR5TG9naWNhbE5hbWUgKE9wdGlvbmFsKSBUaGUgbG9naWNhbCBuYW1lIG9mIHRoZSBlbnRpdHkuXG4gICAgICAgKiBAcGFyYW0gcHJpbWFyeUF0dHJpYnV0ZUlkTmFtZSAoT3B0aW9uYWwpIFRoZSBsb2dpY2FsIG5hbWUgb2YgdGhlIHByaW1hcnkga2V5LlxuICAgICAgICogQHBhcmFtIGZldGNoWG1sIFNwZWNpZmllcyB0aGUgRmV0Y2hYTUwgdXNlZCB0byBmaWx0ZXIuXG4gICAgICAgKiBAcmVtYXJrcyAgICAgSWYgZW50aXR5TG9naWNhbE5hbWUgaXMgbm90IHNwZWNpZmllZCwgdGhlIGZpbHRlciB3aWxsIGJlIGFwcGxpZWQgdG8gYWxsIGVudGl0aWVzXG4gICAgICAgKiAgICAgICAgICAgICAgdmFsaWQgZm9yIHRoZSBMb29rdXAgY29udHJvbC5cbiAgICAgICAqIEBleGFtcGxlICAgICBFeGFtcGxlIGZldGNoWG1sOiA8ZmV0Y2g+XG4gICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxlbnRpdHkgbmFtZT1cImNvbnRhY3RcIj5cbiAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxmaWx0ZXI+XG4gICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cImFkZHJlc3MxX2NpdHlcIiBvcGVyYXRvcj1cImVxXCIgdmFsdWU9XCJSZWRtb25kXCIgLz5cbiAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZmlsdGVyPlxuICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2VudGl0eT5cbiAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9mZXRjaD5cbiAgICAgICAqL1xuICAgICAgYXN5bmMgYWRkUHJlRmlsdGVyVG9Mb29rdXBBZHZhbmNlZChcbiAgICAgICAgZW50aXR5TG9naWNhbE5hbWU6IHN0cmluZyxcbiAgICAgICAgcHJpbWFyeUF0dHJpYnV0ZUlkTmFtZTogc3RyaW5nLFxuICAgICAgICBmZXRjaFhtbDogc3RyaW5nXG4gICAgICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBYcm0uV2ViQXBpLm9ubGluZS5yZXRyaWV2ZU11bHRpcGxlUmVjb3JkcyhcbiAgICAgICAgICAgIGVudGl0eUxvZ2ljYWxOYW1lLFxuICAgICAgICAgICAgXCI/ZmV0Y2hYbWw9XCIgKyBmZXRjaFhtbFxuICAgICAgICAgICk7XG4gICAgICAgICAgY29uc3QgZGF0YSA9IHJlc3VsdC5lbnRpdGllcztcbiAgICAgICAgICBsZXQgZmlsdGVyZWRFbnRpdGllcyA9IFwiXCI7XG4gICAgICAgICAgX2FkZEN1c3RvbUZpbHRlci5jb250cm9scyA9IHRoaXMuY29udHJvbHM7XG4gICAgICAgICAgZGF0YS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICBmaWx0ZXJlZEVudGl0aWVzICs9IGA8dmFsdWU+JHtpdGVtW3ByaW1hcnlBdHRyaWJ1dGVJZE5hbWVdfTwvdmFsdWU+YDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBmZXRjaFhtbCA9IGZpbHRlcmVkRW50aXRpZXNcbiAgICAgICAgICAgID8gYDxmaWx0ZXI+PGNvbmRpdGlvbiBhdHRyaWJ1dGU9JyR7cHJpbWFyeUF0dHJpYnV0ZUlkTmFtZX0nIG9wZXJhdG9yPSdpbic+JHtmaWx0ZXJlZEVudGl0aWVzfTwvY29uZGl0aW9uPjwvZmlsdGVyPmBcbiAgICAgICAgICAgIDogYDxmaWx0ZXI+PGNvbmRpdGlvbiBhdHRyaWJ1dGU9JyR7cHJpbWFyeUF0dHJpYnV0ZUlkTmFtZX0nIG9wZXJhdG9yPSdudWxsJy8+PC9maWx0ZXI+YDtcbiAgICAgICAgICB0aGlzLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2wpID0+IHtcbiAgICAgICAgICAgIGNvbnRyb2wuYWRkUHJlU2VhcmNoKF9hZGRDdXN0b21GaWx0ZXIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuX2N1c3RvbUZpbHRlcnMucHVzaChfYWRkQ3VzdG9tRmlsdGVyKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gX2FkZEN1c3RvbUZpbHRlcigpIHtcbiAgICAgICAgICBfYWRkQ3VzdG9tRmlsdGVyLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2wpID0+IHtcbiAgICAgICAgICAgIGNvbnRyb2wuYWRkQ3VzdG9tRmlsdGVyKGZldGNoWG1sLCBlbnRpdHlMb2dpY2FsTmFtZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICogQWRkcyBhIGN1c3RvbSB2aWV3IHRvIGZpbHRlciB0aGUgbG9va3VwIHVzaW5nIEZldGNoWE1MXG4gICAgICAgKiBPbmx5IHdvcmtzIGZvciBvbmUgdGFibGUgYXQgYSB0aW1lLCBjYW5ub3QgYWRkIHZpZXdzIGZvciBtdWx0aXBsZSB0YWJsZXMgYXQgdGhlIHNhbWUgdGltZVxuICAgICAgICogQHBhcmFtIGZldGNoWG1sIFRoZSBjb21wbGV0ZSBGZXRjaFhNTCBxdWVyeSBpbmNsdWRpbmcgZmlsdGVyaW5nIGNvbmRpdGlvbnNcbiAgICAgICAqIEByZXR1cm5zIFRoZSBMb29rdXBGaWVsZCBpbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICAgKi9cbiAgICAgIGFkZEN1c3RvbVZpZXcoZmV0Y2hYbWw6IHN0cmluZyk6IHRoaXMge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghZmV0Y2hYbWwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZldGNoWE1MIGlzIHJlcXVpcmVkXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCB0YXJnZXRFbnRpdHkgPSB0aGlzLmV4dHJhY3RFbnRpdHlGcm9tRmV0Y2hYbWwoZmV0Y2hYbWwpO1xuICAgICAgICAgIGNvbnN0IGxheW91dFhtbCA9IHRoaXMuZ2VuZXJhdGVMYXlvdXRYbWwoZmV0Y2hYbWwpO1xuXG4gICAgICAgICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PiB7XG4gICAgICAgICAgICBjb250cm9sLmFkZEN1c3RvbVZpZXcoXG4gICAgICAgICAgICAgIHRoaXMudmlld0lkLFxuICAgICAgICAgICAgICB0YXJnZXRFbnRpdHksXG4gICAgICAgICAgICAgIFwiRmlsdGVyZWQgVmlld1wiLFxuICAgICAgICAgICAgICBmZXRjaFhtbCxcbiAgICAgICAgICAgICAgbGF5b3V0WG1sLFxuICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEV4dHJhY3RzIGVudGl0eSBuYW1lIGZyb20gZmV0Y2hYbWxcbiAgICAgICAqL1xuICAgICAgcHJpdmF0ZSBleHRyYWN0RW50aXR5RnJvbUZldGNoWG1sKGZldGNoWG1sOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBtYXRjaCA9IGZldGNoWG1sLm1hdGNoKC88ZW50aXR5Lio/bmFtZT1bJ1wiXSguKj8pWydcIl0vKTtcbiAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBleHRyYWN0IGVudGl0eSBuYW1lIGZyb20gZmV0Y2hYbWxcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hdGNoWzFdO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEdlbmVyYXRlcyBsYXlvdXRYbWwgYmFzZWQgb24gZmV0Y2hYbWwgYXR0cmlidXRlc1xuICAgICAgICovXG4gICAgICBwcml2YXRlIGdlbmVyYXRlTGF5b3V0WG1sKGZldGNoWG1sOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBhdHRyaWJ1dGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBjb25zdCByZWdleCA9IC88YXR0cmlidXRlLio/bmFtZT1bJ1wiXSguKj8pWydcIl0vZztcbiAgICAgICAgbGV0IG1hdGNoO1xuXG4gICAgICAgIC8vIEdldCB1cCB0byAzIG5vbi1pZCBhdHRyaWJ1dGVzXG4gICAgICAgIHdoaWxlIChcbiAgICAgICAgICAobWF0Y2ggPSByZWdleC5leGVjKGZldGNoWG1sKSkgIT09IG51bGwgJiZcbiAgICAgICAgICBhdHRyaWJ1dGVzLmxlbmd0aCA8IDNcbiAgICAgICAgKSB7XG4gICAgICAgICAgaWYgKCFtYXRjaFsxXS5lbmRzV2l0aChcImlkXCIpKSB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzLnB1c2gobWF0Y2hbMV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHdlIGRpZG4ndCBnZXQgYW55IGF0dHJpYnV0ZXMsIHRyeSB0byBnZXQgdGhlIGZpcnN0IGF0dHJpYnV0ZSBldmVuIGlmIGl0J3MgYW4gSURcbiAgICAgICAgaWYgKGF0dHJpYnV0ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgY29uc3QgZmlyc3RNYXRjaCA9IHJlZ2V4LmV4ZWMoZmV0Y2hYbWwpO1xuICAgICAgICAgIGF0dHJpYnV0ZXMucHVzaChmaXJzdE1hdGNoID8gZmlyc3RNYXRjaFsxXSA6IFwibmFtZVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdlbmVyYXRlIGNlbGxzIGJhc2VkIG9uIGF2YWlsYWJsZSBhdHRyaWJ1dGVzXG4gICAgICAgIGNvbnN0IGNlbGxzID0gYXR0cmlidXRlc1xuICAgICAgICAgIC5tYXAoKGF0dHIsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB3aWR0aCA9IGluZGV4ID09PSAwID8gMjAwIDogMTAwO1xuICAgICAgICAgICAgcmV0dXJuIGA8Y2VsbCBuYW1lPScke2F0dHJ9JyB3aWR0aD0nJHt3aWR0aH0nIC8+YDtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5qb2luKFwiXFxuICAgICAgICBcIik7XG5cbiAgICAgICAgcmV0dXJuIGA8Z3JpZCBuYW1lPSdyZXN1bHRzZXQnIG9iamVjdD0nMScganVtcD0nJHthdHRyaWJ1dGVzWzBdfScgc2VsZWN0PScxJyBpY29uPScxJyBwcmV2aWV3PScxJz5cbiAgICAgIDxyb3cgbmFtZT0ncmVzdWx0JyBpZD0nJHthdHRyaWJ1dGVzWzBdfSc+XG4gICAgICAgICR7Y2VsbHN9XG4gICAgICA8L3Jvdz5cbiAgICA8L2dyaWQ+YDtcbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICogUmVtb3ZlcyBhbGwgZmlsdGVycyBzZXQgb24gdGhlIGN1cnJlbnQgbG9va3VwIGF0dHJpYnV0ZSBieSB1c2luZyBhZGRQcmVGaWx0ZXJUb0xvb2t1cCBvciBhZGRQcmVGaWx0ZXJUb0xvb2t1cEFkdmFuY2VkXG4gICAgICAgKi9cbiAgICAgIGNsZWFyUHJlRmlsdGVyRnJvbUxvb2t1cCgpOiB0aGlzIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLl9jdXN0b21GaWx0ZXJzLmZvckVhY2goXG4gICAgICAgICAgICAoY3VzdG9tRmlsdGVyOiBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnRyb2wucmVtb3ZlUHJlU2VhcmNoKGN1c3RvbUZpbHRlcik7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHR5cGUgT3B0aW9uVmFsdWVzID0ge1xuICAgICAgW2tleTogc3RyaW5nXTogbnVtYmVyO1xuICAgIH07XG4gICAgZXhwb3J0IGNsYXNzIE9wdGlvbnNldEZpZWxkPE9wdGlvbnMgZXh0ZW5kcyBPcHRpb25WYWx1ZXM+XG4gICAgICBleHRlbmRzIEZpZWxkXG4gICAgICBpbXBsZW1lbnRzIFhybS5BdHRyaWJ1dGVzLk9wdGlvblNldEF0dHJpYnV0ZVxuICAgIHtcbiAgICAgIHByb3RlY3RlZCBkZWNsYXJlIF9hdHRyaWJ1dGU6IFhybS5BdHRyaWJ1dGVzLk9wdGlvblNldEF0dHJpYnV0ZTtcbiAgICAgIHByb3RlY3RlZCBfY29udHJvbCE6IFhybS5Db250cm9scy5PcHRpb25TZXRDb250cm9sO1xuICAgICAgT3B0aW9uOiBPcHRpb25zO1xuICAgICAgY29uc3RydWN0b3IoYXR0cmlidXRlTmFtZTogc3RyaW5nLCBvcHRpb24/OiBPcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKGF0dHJpYnV0ZU5hbWUpO1xuICAgICAgICB0aGlzLk9wdGlvbiA9IG9wdGlvbjtcbiAgICAgIH1cbiAgICAgIGdldEZvcm1hdCgpOiBYcm0uQXR0cmlidXRlcy5PcHRpb25TZXRBdHRyaWJ1dGVGb3JtYXQge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0Rm9ybWF0KCkgYXMgWHJtLkF0dHJpYnV0ZXMuT3B0aW9uU2V0QXR0cmlidXRlRm9ybWF0O1xuICAgICAgfVxuICAgICAgZ2V0T3B0aW9uKHZhbHVlOiBudW1iZXIgfCBzdHJpbmcpOiBYcm0uT3B0aW9uU2V0VmFsdWUge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldE9wdGlvbih2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldE9wdGlvbih2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGdldE9wdGlvbnMoKTogWHJtLk9wdGlvblNldFZhbHVlW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0T3B0aW9ucygpO1xuICAgICAgfVxuICAgICAgZ2V0U2VsZWN0ZWRPcHRpb24oKTogWHJtLk9wdGlvblNldFZhbHVlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFNlbGVjdGVkT3B0aW9uKCk7XG4gICAgICB9XG4gICAgICBnZXRUZXh0KCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRUZXh0KCk7XG4gICAgICB9XG4gICAgICBnZXRJbml0aWFsVmFsdWUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEluaXRpYWxWYWx1ZSgpO1xuICAgICAgfVxuICAgICAgZ2V0IEF0dHJpYnV0ZSgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl9hdHRyaWJ1dGUgPz89XG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUodGhpcy5OYW1lKSA/P1xuICAgICAgICAgIFhybUV4LnRocm93RXJyb3IoYEZpZWxkICcke3RoaXMuTmFtZX0nIGRvZXMgbm90IGV4aXN0YCkpO1xuICAgICAgfVxuICAgICAgZ2V0IGNvbnRyb2xzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuY29udHJvbHM7XG4gICAgICB9XG4gICAgICBnZXQgY29udHJvbCgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl9jb250cm9sID8/PVxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZ2V0Q29udHJvbCh0aGlzLk5hbWUpID8/XG4gICAgICAgICAgWHJtRXgudGhyb3dFcnJvcihgQ29udHJvbCAnJHt0aGlzLk5hbWV9JyBkb2VzIG5vdCBleGlzdGApKTtcbiAgICAgIH1cbiAgICAgIGdldCBWYWx1ZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0VmFsdWUoKTtcbiAgICAgIH1cbiAgICAgIHNldCBWYWx1ZSh2YWx1ZToga2V5b2YgT3B0aW9ucyB8IG51bWJlcikge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09IFwibnVtYmVyXCIpIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKHZhbHVlKTtcbiAgICAgICAgZWxzZSBpZiAodmFsdWUgPT09IG51bGwpIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKG51bGwpO1xuICAgICAgICBlbHNlIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKHRoaXMuT3B0aW9uW3ZhbHVlXSk7XG4gICAgICB9XG4gICAgICAvKipcbiAgICAgICAqIEFkZHMgYW4gb3B0aW9uLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB2YWx1ZXMgYW4gYXJyYXkgd2l0aCB0aGUgb3B0aW9uIHZhbHVlcyB0byBhZGRcbiAgICAgICAqIEBwYXJhbSBpbmRleCAoT3B0aW9uYWwpIHplcm8tYmFzZWQgaW5kZXggb2YgdGhlIG9wdGlvbi5cbiAgICAgICAqXG4gICAgICAgKiBAcmVtYXJrcyBUaGlzIG1ldGhvZCBkb2VzIG5vdCBjaGVjayB0aGF0IHRoZSB2YWx1ZXMgd2l0aGluIHRoZSBvcHRpb25zIHlvdSBhZGQgYXJlIHZhbGlkLlxuICAgICAgICogICAgICAgICAgSWYgaW5kZXggaXMgbm90IHByb3ZpZGVkLCB0aGUgbmV3IG9wdGlvbiB3aWxsIGJlIGFkZGVkIHRvIHRoZSBlbmQgb2YgdGhlIGxpc3QuXG4gICAgICAgKi9cbiAgICAgIGFkZE9wdGlvbih2YWx1ZXM6IG51bWJlcltdLCBpbmRleD86IG51bWJlcik6IHRoaXMge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZXMpKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB2YWx1ZXMgaXMgbm90IGFuIEFycmF5OlxcbnZhbHVlczogJyR7dmFsdWVzfSdgKTtcbiAgICAgICAgICBjb25zdCBvcHRpb25TZXRWYWx1ZXMgPVxuICAgICAgICAgICAgdGhpcy5jb250cm9sLmdldEF0dHJpYnV0ZSgpLmdldE9wdGlvbnMoKSA/PyBbXTtcbiAgICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2Ygb3B0aW9uU2V0VmFsdWVzKSB7XG4gICAgICAgICAgICBpZiAodmFsdWVzLmluY2x1ZGVzKGVsZW1lbnQudmFsdWUpKSB7XG4gICAgICAgICAgICAgIHRoaXMuY29udHJvbC5hZGRPcHRpb24oZWxlbWVudCwgaW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICogUmVtb3ZlcyB0aGUgb3B0aW9uIG1hdGNoaW5nIHRoZSB2YWx1ZS5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlLlxuICAgICAgICovXG4gICAgICByZW1vdmVPcHRpb24odmFsdWVzOiBudW1iZXJbXSk6IHRoaXMge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZXMpKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB2YWx1ZXMgaXMgbm90IGFuIEFycmF5OlxcbnZhbHVlczogJyR7dmFsdWVzfSdgKTtcbiAgICAgICAgICBjb25zdCBvcHRpb25TZXRWYWx1ZXMgPVxuICAgICAgICAgICAgdGhpcy5jb250cm9sLmdldEF0dHJpYnV0ZSgpLmdldE9wdGlvbnMoKSA/PyBbXTtcbiAgICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2Ygb3B0aW9uU2V0VmFsdWVzKSB7XG4gICAgICAgICAgICBpZiAodmFsdWVzLmluY2x1ZGVzKGVsZW1lbnQudmFsdWUpKSB7XG4gICAgICAgICAgICAgIHRoaXMuY29udHJvbC5yZW1vdmVPcHRpb24oZWxlbWVudC52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLyoqXG4gICAgICAgKiBDbGVhcnMgYWxsIG9wdGlvbnMuXG4gICAgICAgKi9cbiAgICAgIGNsZWFyT3B0aW9ucygpOiB0aGlzIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLmNvbnRyb2wuY2xlYXJPcHRpb25zKCk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGV4cG9ydCBjbGFzcyBTZWN0aW9uIGltcGxlbWVudHMgWHJtLkNvbnRyb2xzLlNlY3Rpb24ge1xuICAgICAgcHVibGljIHJlYWRvbmx5IE5hbWUhOiBzdHJpbmc7XG4gICAgICBwcm90ZWN0ZWQgX3NlY3Rpb24/OiBYcm0uQ29udHJvbHMuU2VjdGlvbjtcbiAgICAgIHB1YmxpYyBwYXJlbnRUYWI/OiBYcm0uQ29udHJvbHMuVGFiO1xuICAgICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuTmFtZSA9IG5hbWU7XG4gICAgICB9XG4gICAgICBwdWJsaWMgZ2V0IFNlY3Rpb24oKTogWHJtLkNvbnRyb2xzLlNlY3Rpb24ge1xuICAgICAgICByZXR1cm4gKHRoaXMuX3NlY3Rpb24gPz89XG4gICAgICAgICAgdGhpcy5wYXJlbnRUYWIuc2VjdGlvbnMuZ2V0KHRoaXMuTmFtZSkgPz9cbiAgICAgICAgICBYcm1FeC50aHJvd0Vycm9yKFxuICAgICAgICAgICAgYFRoZSBzZWN0aW9uICcke3RoaXMuTmFtZX0nIHdhcyBub3QgZm91bmQgb24gdGhlIGZvcm0uYFxuICAgICAgICAgICkpO1xuICAgICAgfVxuICAgICAgZ2V0TmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5TZWN0aW9uLmdldE5hbWUoKTtcbiAgICAgIH1cbiAgICAgIGdldFBhcmVudCgpOiBYcm0uQ29udHJvbHMuVGFiIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuU2VjdGlvbi5nZXRQYXJlbnQoKTtcbiAgICAgIH1cbiAgICAgIGNvbnRyb2xzOiBYcm0uQ29sbGVjdGlvbi5JdGVtQ29sbGVjdGlvbjxYcm0uQ29udHJvbHMuQ29udHJvbD47XG4gICAgICBzZXRWaXNpYmxlKHZpc2libGU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuU2VjdGlvbi5zZXRWaXNpYmxlKHZpc2libGUpO1xuICAgICAgfVxuICAgICAgZ2V0VmlzaWJsZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuU2VjdGlvbi5nZXRWaXNpYmxlKCk7XG4gICAgICB9XG4gICAgICBnZXRMYWJlbCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5TZWN0aW9uLmdldExhYmVsKCk7XG4gICAgICB9XG4gICAgICBzZXRMYWJlbChsYWJlbDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLlNlY3Rpb24uc2V0TGFiZWwobGFiZWwpO1xuICAgICAgfVxuICAgIH1cbiAgICB0eXBlIFRhYlNlY3Rpb25zID0ge1xuICAgICAgW2tleTogc3RyaW5nXTogU2VjdGlvbjtcbiAgICB9O1xuICAgIGV4cG9ydCBjbGFzcyBUYWI8U2VjdGlvbnMgZXh0ZW5kcyBUYWJTZWN0aW9ucz4gaW1wbGVtZW50cyBYcm0uQ29udHJvbHMuVGFiIHtcbiAgICAgIHB1YmxpYyByZWFkb25seSBOYW1lITogc3RyaW5nO1xuICAgICAgcHJvdGVjdGVkIF90YWI/OiBYcm0uQ29udHJvbHMuVGFiO1xuICAgICAgU2VjdGlvbjogU2VjdGlvbnM7XG4gICAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIHNlY3Rpb24/OiBTZWN0aW9ucykge1xuICAgICAgICB0aGlzLk5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLlNlY3Rpb24gPSBzZWN0aW9uO1xuICAgICAgICBmb3IgKGxldCBrZXkgaW4gc2VjdGlvbikge1xuICAgICAgICAgIHNlY3Rpb25ba2V5XS5wYXJlbnRUYWIgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBnZXQgc2VjdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLlRhYi5zZWN0aW9ucztcbiAgICAgIH1cbiAgICAgIHB1YmxpYyBnZXQgVGFiKCk6IFhybS5Db250cm9scy5UYWIge1xuICAgICAgICByZXR1cm4gKHRoaXMuX3RhYiA/Pz1cbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LnVpLnRhYnMuZ2V0KHRoaXMuTmFtZSkgPz9cbiAgICAgICAgICBYcm1FeC50aHJvd0Vycm9yKFxuICAgICAgICAgICAgYFRoZSB0YWIgJyR7dGhpcy5OYW1lfScgd2FzIG5vdCBmb3VuZCBvbiB0aGUgZm9ybS5gXG4gICAgICAgICAgKSk7XG4gICAgICB9XG4gICAgICBhZGRUYWJTdGF0ZUNoYW5nZShoYW5kbGVyOiBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyKTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLlRhYi5hZGRUYWJTdGF0ZUNoYW5nZShoYW5kbGVyKTtcbiAgICAgIH1cbiAgICAgIGdldERpc3BsYXlTdGF0ZSgpOiBYcm0uRGlzcGxheVN0YXRlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuVGFiLmdldERpc3BsYXlTdGF0ZSgpO1xuICAgICAgfVxuICAgICAgZ2V0TmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5UYWIuZ2V0TmFtZSgpO1xuICAgICAgfVxuICAgICAgZ2V0UGFyZW50KCk6IFhybS5VaSB7XG4gICAgICAgIHJldHVybiB0aGlzLlRhYi5nZXRQYXJlbnQoKTtcbiAgICAgIH1cbiAgICAgIHJlbW92ZVRhYlN0YXRlQ2hhbmdlKGhhbmRsZXI6IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXIpOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuVGFiLnJlbW92ZVRhYlN0YXRlQ2hhbmdlKGhhbmRsZXIpO1xuICAgICAgfVxuICAgICAgc2V0RGlzcGxheVN0YXRlKGRpc3BsYXlTdGF0ZTogWHJtLkRpc3BsYXlTdGF0ZSk6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5UYWIuc2V0RGlzcGxheVN0YXRlKGRpc3BsYXlTdGF0ZSk7XG4gICAgICB9XG4gICAgICBzZXRWaXNpYmxlKHZpc2libGU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuVGFiLnNldFZpc2libGUodmlzaWJsZSk7XG4gICAgICB9XG4gICAgICBnZXRWaXNpYmxlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5UYWIuZ2V0VmlzaWJsZSgpO1xuICAgICAgfVxuICAgICAgZ2V0TGFiZWwoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuVGFiLmdldExhYmVsKCk7XG4gICAgICB9XG4gICAgICBzZXRMYWJlbChsYWJlbDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLlRhYi5zZXRMYWJlbChsYWJlbCk7XG4gICAgICB9XG4gICAgICBzZXRGb2N1cygpOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuVGFiLnNldEZvY3VzKCk7XG4gICAgICB9XG4gICAgfVxuICAgIGV4cG9ydCBjbGFzcyBHcmlkQ29udHJvbCBpbXBsZW1lbnRzIFhybS5Db250cm9scy5HcmlkQ29udHJvbCB7XG4gICAgICBwdWJsaWMgcmVhZG9ubHkgTmFtZSE6IHN0cmluZztcbiAgICAgIHByb3RlY3RlZCBfZ3JpZENvbnRyb2w/OiBYcm0uQ29udHJvbHMuR3JpZENvbnRyb2w7XG4gICAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5OYW1lID0gbmFtZTtcbiAgICAgIH1cbiAgICAgIHB1YmxpYyBnZXQgR3JpZENvbnRyb2woKTogWHJtLkNvbnRyb2xzLkdyaWRDb250cm9sIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAodGhpcy5fZ3JpZENvbnRyb2wgPz89XG4gICAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmdldENvbnRyb2w8WHJtLkNvbnRyb2xzLkdyaWRDb250cm9sPih0aGlzLk5hbWUpKSA/P1xuICAgICAgICAgIFhybUV4LnRocm93RXJyb3IoYFRoZSBncmlkICcke3RoaXMuTmFtZX0nIHdhcyBub3QgZm91bmQgb24gdGhlIGZvcm0uYClcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHB1YmxpYyBnZXQgR3JpZCgpOiBYcm0uQ29udHJvbHMuR3JpZCB7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmdldEdyaWQoKTtcbiAgICAgIH1cbiAgICAgIGFkZE9uTG9hZChoYW5kbGVyOiBYcm0uRXZlbnRzLkdyaWRDb250cm9sLkxvYWRFdmVudEhhbmRsZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5HcmlkQ29udHJvbC5yZW1vdmVPbkxvYWQoaGFuZGxlciBhcyBhbnkpO1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5hZGRPbkxvYWQoaGFuZGxlcik7XG4gICAgICB9XG4gICAgICBnZXRDb250ZXh0VHlwZSgpOiBYcm1FbnVtLkdyaWRDb250cm9sQ29udGV4dCB7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmdldENvbnRleHRUeXBlKCk7XG4gICAgICB9XG4gICAgICBnZXRFbnRpdHlOYW1lKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmdldEVudGl0eU5hbWUoKTtcbiAgICAgIH1cbiAgICAgIGdldEZldGNoWG1sKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmdldEZldGNoWG1sKCk7XG4gICAgICB9XG4gICAgICBnZXRHcmlkKCk6IFhybS5Db250cm9scy5HcmlkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0R3JpZCgpO1xuICAgICAgfVxuICAgICAgZ2V0UmVsYXRpb25zaGlwKCk6IFhybS5Db250cm9scy5HcmlkUmVsYXRpb25zaGlwIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0UmVsYXRpb25zaGlwKCk7XG4gICAgICB9XG4gICAgICBnZXRVcmwoY2xpZW50PzogWHJtRW51bS5HcmlkQ2xpZW50KTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0VXJsKGNsaWVudCk7XG4gICAgICB9XG4gICAgICBnZXRWaWV3U2VsZWN0b3IoKTogWHJtLkNvbnRyb2xzLlZpZXdTZWxlY3RvciB7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmdldFZpZXdTZWxlY3RvcigpO1xuICAgICAgfVxuICAgICAgb3BlblJlbGF0ZWRHcmlkKCk6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5vcGVuUmVsYXRlZEdyaWQoKTtcbiAgICAgIH1cbiAgICAgIHJlZnJlc2goKTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLnJlZnJlc2goKTtcbiAgICAgIH1cbiAgICAgIHJlZnJlc2hSaWJib24oKTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLnJlZnJlc2hSaWJib24oKTtcbiAgICAgIH1cbiAgICAgIHJlbW92ZU9uTG9hZChoYW5kbGVyOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLnJlbW92ZU9uTG9hZChoYW5kbGVyKTtcbiAgICAgIH1cbiAgICAgIGdldENvbnRyb2xUeXBlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmdldENvbnRyb2xUeXBlKCk7XG4gICAgICB9XG4gICAgICBnZXROYW1lKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmdldE5hbWUoKTtcbiAgICAgIH1cbiAgICAgIGdldFBhcmVudCgpOiBYcm0uQ29udHJvbHMuU2VjdGlvbiB7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmdldFBhcmVudCgpO1xuICAgICAgfVxuICAgICAgZ2V0TGFiZWwoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0TGFiZWwoKTtcbiAgICAgIH1cbiAgICAgIHNldExhYmVsKGxhYmVsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuc2V0TGFiZWwobGFiZWwpO1xuICAgICAgfVxuICAgICAgZ2V0VmlzaWJsZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0VmlzaWJsZSgpO1xuICAgICAgfVxuICAgICAgc2V0VmlzaWJsZSh2aXNpYmxlOiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLnNldFZpc2libGUodmlzaWJsZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=