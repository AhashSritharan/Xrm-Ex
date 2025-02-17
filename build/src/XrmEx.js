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
    function isGuid(value) {
        return /^\{?[0-9a-fA-F]{8}(-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}\}?$/.test(value);
    }
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
            // Check for GUID format e.g. "123e4567-e89b-12d3-a456-426614174000" with or without braces
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
            debugger;
            const mergedParams = Array.isArray(params)
                ? Object.assign({}, ...params.map((p) => {
                    console.log(`Parameter ${p.Name}: ${p.Value}`);
                    if (typeof p.Value === "string" && isGuid(p.Value)) {
                        console.log(`Original GUID value for ${p.Name}: ${p.Value}`);
                        const normalized = normalizeGuid(p.Value);
                        console.log(`Normalized GUID value for ${p.Name}: ${normalized}`);
                        return { [p.Name]: normalized };
                    }
                    return { [p.Name]: p.Value };
                }))
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWHJtRXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvWHJtRXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsOERBQThEO0FBa0M5RCxJQUFVLEtBQUssQ0E4aEVkO0FBOWhFRCxXQUFVLEtBQUs7SUFDYjs7OztPQUlHO0lBQ0gsU0FBZ0IsVUFBVSxDQUFDLFlBQW9CO1FBQzdDLE1BQU0sSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUZlLGdCQUFVLGFBRXpCLENBQUE7SUFDRDs7O09BR0c7SUFDSCxTQUFnQixlQUFlO1FBQzdCLElBQUk7WUFDRixNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQzFCLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDdkUsTUFBTSxtQkFBbUIsR0FDdkIsVUFBVSxJQUFJLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUNuRSxNQUFNLGlCQUFpQixHQUNyQixtQkFBbUIsRUFBRSxLQUFLLENBQUMsb0JBQW9CLENBQUM7Z0JBQ2hELG1CQUFtQixFQUFFLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUM5QyxNQUFNLFlBQVksR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUVuRSxPQUFPLFlBQVksQ0FBQztTQUNyQjtRQUFDLE9BQU8sS0FBVSxFQUFFO1lBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFD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LENBQUMsS0FBSyxDQUFDLENBQUM7WUFDMUMsQ0FBQztZQUNELFVBQVU7Z0JBQ1IsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3ZDLENBQUM7WUFDRCxVQUFVLENBQUMsT0FBZ0I7Z0JBQ3pCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDOUMsQ0FBQztTQUNGO1FBMUVZLGlCQUFXLGNBMEV2QixDQUFBO0lBQ0gsQ0FBQyxFQTNnQ2dCLEtBQUssR0FBTCxXQUFLLEtBQUwsV0FBSyxRQTJnQ3JCO0FBQ0gsQ0FBQyxFQTloRVMsS0FBSyxLQUFMLEtBQUssUUE4aEVkIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL25vZGVfbW9kdWxlcy9AdHlwZXMveHJtL2luZGV4LmQudHNcIiAvPlxuLyoqXG4gKiBSZXByZXNlbnRzIGEgcGFyYW1ldGVyIGZvciBhIHJlcXVlc3QuXG4gKiBAdHlwZSB7T2JqZWN0fSBSZXF1ZXN0UGFyYW1ldGVyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBwYXJhbWV0ZXIuXG4gKiBAcHJvcGVydHkgeydCb29sZWFuJyB8ICdEYXRlVGltZScgfCAnRGVjaW1hbCcgfCAnRW50aXR5JyB8ICdFbnRpdHlDb2xsZWN0aW9uJyB8ICdFbnRpdHlSZWZlcmVuY2UnIHwgJ0Zsb2F0JyB8ICdJbnRlZ2VyJyB8ICdNb25leScgfCAnUGlja2xpc3QnIHwgJ1N0cmluZyd9IFR5cGUgLSBUaGUgdHlwZSBvZiB0aGUgcGFyYW1ldGVyLlxuICogQHByb3BlcnR5IHsqfSBWYWx1ZSAtIFRoZSB2YWx1ZSBvZiB0aGUgcGFyYW1ldGVyLlxuICovXG50eXBlIFJlcXVlc3RQYXJhbWV0ZXIgPSB7XG4gIE5hbWU6IHN0cmluZztcbiAgVHlwZTpcbiAgfCBcIkJvb2xlYW5cIlxuICB8IFwiRGF0ZVRpbWVcIlxuICB8IFwiRGVjaW1hbFwiXG4gIHwgXCJFbnRpdHlcIlxuICB8IFwiRW50aXR5Q29sbGVjdGlvblwiXG4gIHwgXCJFbnRpdHlSZWZlcmVuY2VcIlxuICB8IFwiRmxvYXRcIlxuICB8IFwiSW50ZWdlclwiXG4gIHwgXCJNb25leVwiXG4gIHwgXCJQaWNrbGlzdFwiXG4gIHwgXCJTdHJpbmdcIjtcbiAgVmFsdWU6IGFueTtcbn07XG4vKipcbiAqIFJlcHJlc2VudHMgYSByZWZlcmVuY2UgdG8gYW4gZW50aXR5LlxuICogQHR5cGVcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBpZCAtIFRoZSBJRCBvZiB0aGUgZW50aXR5LlxuICogQHByb3BlcnR5IHtzdHJpbmd9IGVudGl0eVR5cGUgLSBUaGUgdHlwZSBvZiB0aGUgZW50aXR5LlxuICovXG50eXBlIEVudGl0eVJlZmVyZW5jZSA9IHtcbiAgaWQ6IHN0cmluZztcbiAgZW50aXR5VHlwZTogc3RyaW5nO1xufTtcbm5hbWVzcGFjZSBYcm1FeCB7XG4gIC8qKlxuICAgKiBUaHJvd3MgYW4gZXJyb3Igd2l0aCB0aGUgZ2l2ZW4gZXJyb3IgbWVzc2FnZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGVycm9yTWVzc2FnZSAtIFRoZSBlcnJvciBtZXNzYWdlIHRvIHRocm93LlxuICAgKiBAdGhyb3dzIHtFcnJvcn0gLSBBbHdheXMgdGhyb3dzIGFuIGVycm9yIHdpdGggdGhlIGdpdmVuIGVycm9yIG1lc3NhZ2UuXG4gICAqL1xuICBleHBvcnQgZnVuY3Rpb24gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2U6IHN0cmluZyk6IG5ldmVyIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgfVxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbmFtZSBvZiB0aGUgY2FsbGluZyBmdW5jdGlvbi5cbiAgICogQHJldHVybnMge3N0cmluZ30gLSBUaGUgbmFtZSBvZiB0aGUgY2FsbGluZyBmdW5jdGlvbi5cbiAgICovXG4gIGV4cG9ydCBmdW5jdGlvbiBnZXRGdW5jdGlvbk5hbWUoKTogc3RyaW5nIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoKTtcbiAgICAgIGNvbnN0IHN0YWNrVHJhY2UgPSBlcnJvci5zdGFjaz8uc3BsaXQoXCJcXG5cIikubWFwKChsaW5lKSA9PiBsaW5lLnRyaW0oKSk7XG4gICAgICBjb25zdCBjYWxsaW5nRnVuY3Rpb25MaW5lID1cbiAgICAgICAgc3RhY2tUcmFjZSAmJiBzdGFja1RyYWNlLmxlbmd0aCA+PSAzID8gc3RhY2tUcmFjZVsyXSA6IHVuZGVmaW5lZDtcbiAgICAgIGNvbnN0IGZ1bmN0aW9uTmFtZU1hdGNoID1cbiAgICAgICAgY2FsbGluZ0Z1bmN0aW9uTGluZT8ubWF0Y2goL2F0XFxzKyhbXlxcc10rKVxccytcXCgvKSB8fFxuICAgICAgICBjYWxsaW5nRnVuY3Rpb25MaW5lPy5tYXRjaCgvYXRcXHMrKFteXFxzXSspLyk7XG4gICAgICBjb25zdCBmdW5jdGlvbk5hbWUgPSBmdW5jdGlvbk5hbWVNYXRjaCA/IGZ1bmN0aW9uTmFtZU1hdGNoWzFdIDogXCJcIjtcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uTmFtZTtcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LmdldEZ1bmN0aW9uTmFtZTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBEaXNwbGF5cyBhIG5vdGlmaWNhdGlvbiBmb3IgYW4gYXBwIHdpdGggdGhlIGdpdmVuIG1lc3NhZ2UgYW5kIGxldmVsLCBhbmQgbGV0cyB5b3Ugc3BlY2lmeSB3aGV0aGVyIHRvIHNob3cgYSBjbG9zZSBidXR0b24uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gVGhlIG1lc3NhZ2UgdG8gZGlzcGxheSBpbiB0aGUgbm90aWZpY2F0aW9uLlxuICAgKiBAcGFyYW0geydTVUNDRVNTJyB8ICdFUlJPUicgfCAnV0FSTklORycgfCAnSU5GTyd9IGxldmVsIC0gVGhlIGxldmVsIG9mIHRoZSBub3RpZmljYXRpb24uIENhbiBiZSAnU1VDQ0VTUycsICdFUlJPUicsICdXQVJOSU5HJywgb3IgJ0lORk8nLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtzaG93Q2xvc2VCdXR0b249ZmFsc2VdIC0gV2hldGhlciB0byBzaG93IGEgY2xvc2UgYnV0dG9uIG9uIHRoZSBub3RpZmljYXRpb24uIERlZmF1bHRzIHRvIGZhbHNlLlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSAtIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIElEIG9mIHRoZSBjcmVhdGVkIG5vdGlmaWNhdGlvbi5cbiAgICovXG4gIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBhZGRHbG9iYWxOb3RpZmljYXRpb24oXG4gICAgbWVzc2FnZTogc3RyaW5nLFxuICAgIGxldmVsOiBcIlNVQ0NFU1NcIiB8IFwiRVJST1JcIiB8IFwiV0FSTklOR1wiIHwgXCJJTkZPXCIsXG4gICAgc2hvd0Nsb3NlQnV0dG9uID0gZmFsc2VcbiAgKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBsZXZlbE1hcCA9IHtcbiAgICAgIFNVQ0NFU1M6IDEsXG4gICAgICBFUlJPUjogMixcbiAgICAgIFdBUk5JTkc6IDMsXG4gICAgICBJTkZPOiA0LFxuICAgIH07XG4gICAgY29uc3QgbWVzc2FnZUxldmVsID0gbGV2ZWxNYXBbbGV2ZWxdIHx8IGxldmVsTWFwLklORk87XG4gICAgY29uc3Qgbm90aWZpY2F0aW9uID0ge1xuICAgICAgdHlwZTogMixcbiAgICAgIGxldmVsOiBtZXNzYWdlTGV2ZWwsXG4gICAgICBtZXNzYWdlLFxuICAgICAgc2hvd0Nsb3NlQnV0dG9uLFxuICAgIH07XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBhd2FpdCBYcm0uQXBwLmFkZEdsb2JhbE5vdGlmaWNhdGlvbihub3RpZmljYXRpb24pO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguJHtnZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogQ2xlYXJzIGEgbm90aWZpY2F0aW9uIGluIHRoZSBhcHAgd2l0aCB0aGUgZ2l2ZW4gdW5pcXVlIElELlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdW5pcXVlSWQgLSBUaGUgdW5pcXVlIElEIG9mIHRoZSBub3RpZmljYXRpb24gdG8gY2xlYXIuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IC0gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgbm90aWZpY2F0aW9uIGhhcyBiZWVuIGNsZWFyZWQuXG4gICAqL1xuICBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVtb3ZlR2xvYmFsTm90aWZpY2F0aW9uKFxuICAgIHVuaXF1ZUlkOiBzdHJpbmdcbiAgKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IFhybS5BcHAuY2xlYXJHbG9iYWxOb3RpZmljYXRpb24odW5pcXVlSWQpO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguJHtnZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSB2YWx1ZSBvZiBhbiBlbnZpcm9ubWVudCB2YXJpYWJsZSBieSB1c2luZyBpdHMgc2NoZW1hIG5hbWUgYXMga2V5LlxuICAgKiBJZiB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGUgaGFzIGJvdGggYSBkZWZhdWx0IHZhbHVlIGFuZCBhIGN1cnJlbnQgdmFsdWUsIHRoaXMgZnVuY3Rpb24gd2lsbCByZXRyaWV2ZSB0aGUgY3VycmVudCB2YWx1ZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGVudmlyb25tZW50VmFyaWFibGVTY2hlbWFOYW1lIC0gVGhlIHNjaGVtYSBuYW1lIG9mIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZSB0byByZXRyaWV2ZS5cbiAgICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gLSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSB2YWx1ZSBvZiB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGUuXG4gICAqIEBhc3luY1xuICAgKi9cbiAgZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEVudmlyb25tZW50VmFyaWFibGVWYWx1ZShcbiAgICBlbnZpcm9ubWVudFZhcmlhYmxlU2NoZW1hTmFtZTogc3RyaW5nXG4gICk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgZXhlY3V0ZUZ1bmN0aW9uKFwiUmV0cmlldmVFbnZpcm9ubWVudFZhcmlhYmxlVmFsdWVcIiwgW1xuICAgICAge1xuICAgICAgICBOYW1lOiBcIkRlZmluaXRpb25TY2hlbWFOYW1lXCIsXG4gICAgICAgIFR5cGU6IFwiU3RyaW5nXCIsXG4gICAgICAgIFZhbHVlOiBlbnZpcm9ubWVudFZhcmlhYmxlU2NoZW1hTmFtZSxcbiAgICAgIH0sXG4gICAgXSk7XG4gICAgcmV0dXJuIE9iamVjdC5oYXNPd24ocmVzcG9uc2UsIFwiVmFsdWVcIikgPyByZXNwb25zZS5WYWx1ZSA6IHJlc3BvbnNlO1xuICB9XG4gIGZ1bmN0aW9uIGlzR3VpZCh2YWx1ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIC9eXFx7P1swLTlhLWZBLUZdezh9KC1bMC05YS1mQS1GXXs0fSl7M30tWzAtOWEtZkEtRl17MTJ9XFx9PyQvLnRlc3QoXG4gICAgICB2YWx1ZVxuICAgICk7XG4gIH1cbiAgLyoqXG4gICAqIEEgbWFwIG9mIENSTSBkYXRhIHR5cGVzIHRvIHRoZWlyIGNvcnJlc3BvbmRpbmcgdHlwZSBuYW1lcywgc3RydWN0dXJhbCBwcm9wZXJ0aWVzLCBhbmQgSmF2YVNjcmlwdCB0eXBlcy5cbiAgICogQHR5cGUge09iamVjdC48c3RyaW5nLCB7IHR5cGVOYW1lOiBzdHJpbmcsIHN0cnVjdHVyYWxQcm9wZXJ0eTogbnVtYmVyLCBqc1R5cGU6IHN0cmluZyB9Pn1cbiAgICovXG4gIGxldCB0eXBlTWFwID0ge1xuICAgIFN0cmluZzogeyB0eXBlTmFtZTogXCJFZG0uU3RyaW5nXCIsIHN0cnVjdHVyYWxQcm9wZXJ0eTogMSwganNUeXBlOiBcInN0cmluZ1wiIH0sXG4gICAgSW50ZWdlcjogeyB0eXBlTmFtZTogXCJFZG0uSW50MzJcIiwgc3RydWN0dXJhbFByb3BlcnR5OiAxLCBqc1R5cGU6IFwibnVtYmVyXCIgfSxcbiAgICBCb29sZWFuOiB7XG4gICAgICB0eXBlTmFtZTogXCJFZG0uQm9vbGVhblwiLFxuICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiAxLFxuICAgICAganNUeXBlOiBcImJvb2xlYW5cIixcbiAgICB9LFxuICAgIERhdGVUaW1lOiB7XG4gICAgICB0eXBlTmFtZTogXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIixcbiAgICAgIHN0cnVjdHVyYWxQcm9wZXJ0eTogMSxcbiAgICAgIGpzVHlwZTogXCJvYmplY3RcIixcbiAgICB9LFxuICAgIEVudGl0eVJlZmVyZW5jZToge1xuICAgICAgdHlwZU5hbWU6IFwibXNjcm0uY3JtYmFzZWVudGl0eVwiLFxuICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiA1LFxuICAgICAganNUeXBlOiBcIm9iamVjdFwiLFxuICAgIH0sXG4gICAgRGVjaW1hbDoge1xuICAgICAgdHlwZU5hbWU6IFwiRWRtLkRlY2ltYWxcIixcbiAgICAgIHN0cnVjdHVyYWxQcm9wZXJ0eTogMSxcbiAgICAgIGpzVHlwZTogXCJudW1iZXJcIixcbiAgICB9LFxuICAgIEVudGl0eToge1xuICAgICAgdHlwZU5hbWU6IFwibXNjcm0uY3JtYmFzZWVudGl0eVwiLFxuICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiA1LFxuICAgICAganNUeXBlOiBcIm9iamVjdFwiLFxuICAgIH0sXG4gICAgRW50aXR5Q29sbGVjdGlvbjoge1xuICAgICAgdHlwZU5hbWU6IFwiQ29sbGVjdGlvbihtc2NybS5jcm1iYXNlZW50aXR5KVwiLFxuICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiA0LFxuICAgICAganNUeXBlOiBcIm9iamVjdFwiLFxuICAgIH0sXG4gICAgRmxvYXQ6IHsgdHlwZU5hbWU6IFwiRWRtLkRvdWJsZVwiLCBzdHJ1Y3R1cmFsUHJvcGVydHk6IDEsIGpzVHlwZTogXCJudW1iZXJcIiB9LFxuICAgIE1vbmV5OiB7IHR5cGVOYW1lOiBcIkVkbS5EZWNpbWFsXCIsIHN0cnVjdHVyYWxQcm9wZXJ0eTogMSwganNUeXBlOiBcIm51bWJlclwiIH0sXG4gICAgUGlja2xpc3Q6IHtcbiAgICAgIHR5cGVOYW1lOiBcIkVkbS5JbnQzMlwiLFxuICAgICAgc3RydWN0dXJhbFByb3BlcnR5OiAxLFxuICAgICAganNUeXBlOiBcIm51bWJlclwiLFxuICAgIH0sXG4gIH07XG4gIGV4cG9ydCBmdW5jdGlvbiBnZXRTdHJ1Y3R1cmFsUHJvcGVydHkodmFsdWU6IGFueSk6IG51bWJlciB7XG4gICAgY29uc3QgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgICBpZiAodHlwZSA9PSBcInN0cmluZ1wiIHx8IHR5cGUgPT0gXCJudW1iZXJcIiB8fCB0eXBlID09IFwiYm9vbGVhblwiKSByZXR1cm4gMTtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSByZXR1cm4gMTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHJldHVybiA0O1xuICAgIHJldHVybiA1O1xuICB9XG4gIGV4cG9ydCBmdW5jdGlvbiBnZXRUeXBlTmFtZSh2YWx1ZTogYW55KTogc3RyaW5nIHtcbiAgICBjb25zdCB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICAgIGlmICh0eXBlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAvLyBDaGVjayBmb3IgR1VJRCBmb3JtYXQgZS5nLiBcIjEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjYxNDE3NDAwMFwiIHdpdGggb3Igd2l0aG91dCBicmFjZXNcbiAgICAgIGlmIChpc0d1aWQodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBcIm1zY3JtLmNybWJhc2VlbnRpdHlcIjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBcIkVkbS5TdHJpbmdcIjtcbiAgICB9XG4gICAgaWYgKHR5cGUgPT09IFwibnVtYmVyXCIpIHJldHVybiBcIkVkbS5JbnQzMlwiOyAvLyBEZWZhdWx0IHRvIEludDMyIGZvciBudW1iZXJzXG4gICAgaWYgKHR5cGUgPT09IFwiYm9vbGVhblwiKSByZXR1cm4gXCJFZG0uQm9vbGVhblwiO1xuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHJldHVybiBcIkVkbS5EYXRlVGltZU9mZnNldFwiO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkgcmV0dXJuIFwiQ29sbGVjdGlvbihtc2NybS5jcm1iYXNlZW50aXR5KVwiO1xuICAgIHJldHVybiBcIm1zY3JtLmNybWJhc2VlbnRpdHlcIjsgLy8gRGVmYXVsdCBmb3Igb2JqZWN0cyBhbmQgdW5rbm93biB0eXBlc1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyBhIHJlcXVlc3Qgb2JqZWN0IGZvciB1c2Ugd2l0aCBYcm0uV2ViQXBpLm9ubGluZS5leGVjdXRlIG9yIGV4ZWN1dGVNdWx0aXBsZS5cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBleHRyYWN0cyB0aGUgbG9naWMgdG8gcHJlcGFyZSBwYXJhbWV0ZXJzIGFuZCBjcmVhdGVcbiAgICogdGhlIHJlcXVlc3Qgb2JqZWN0IHdpdGhvdXQgZXhlY3V0aW5nIGl0LiBZb3UgY2FuOlxuICAgKiAtIERpcmVjdGx5IGV4ZWN1dGUgdGhlIHJldHVybmVkIHJlcXVlc3Qgb2JqZWN0IHVzaW5nIGBYcm0uV2ViQXBpLm9ubGluZS5leGVjdXRlKClgLlxuICAgKiAtIFVzZSB0aGUgcmVxdWVzdCBvYmplY3QgbGF0ZXIgd2l0aCBgWHJtLldlYkFwaS5vbmxpbmUuZXhlY3V0ZU11bHRpcGxlKClgLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYWN0aW9uTmFtZSAtIFRoZSB1bmlxdWUgbmFtZSBvZiB0aGUgcmVxdWVzdCAoYWN0aW9uL2Z1bmN0aW9uL0NSVUQgb3BlcmF0aW9uKS5cbiAgICogQHBhcmFtIHtSZXF1ZXN0UGFyYW1ldGVyW10gfCB7W2tleTogc3RyaW5nXTogYW55fX0gcmVxdWVzdFBhcmFtZXRlcnMgLSBBbiBhcnJheSBvZiByZXF1ZXN0IHBhcmFtZXRlcnMgb3IgYW4gb2JqZWN0IHJlcHJlc2VudGluZyBrZXktdmFsdWUgcGFpcnMgb2YgcmVxdWVzdCBwYXJhbWV0ZXJzLlxuICAgKiAgIC0gSWYgYW4gYXJyYXkgb2YgYFJlcXVlc3RQYXJhbWV0ZXJbXWAgaXMgcHJvdmlkZWQsIGVhY2ggZWxlbWVudCBzaG91bGQgaGF2ZSBgTmFtZWAsIGBUeXBlYCwgYW5kIGBWYWx1ZWAgZmllbGRzIGRlc2NyaWJpbmcgdGhlIHJlcXVlc3QgcGFyYW1ldGVyLlxuICAgKiAgIC0gSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkLCBpdHMga2V5cyByZXByZXNlbnQgcGFyYW1ldGVyIG5hbWVzLCBhbmQgdmFsdWVzIHJlcHJlc2VudCB0aGUgcGFyYW1ldGVyIHZhbHVlcy5cbiAgICogQHBhcmFtIHtudW1iZXJ9IG9wZXJhdGlvblR5cGUgLSBUaGUgdHlwZSBvZiB0aGUgcmVxdWVzdC4gVXNlOlxuICAgKiAgIC0gYDBgIGZvciBBY3Rpb25cbiAgICogICAtIGAxYCBmb3IgRnVuY3Rpb25cbiAgICogICAtIGAyYCBmb3IgQ1JVRFxuICAgKiBAcGFyYW0ge0VudGl0eVJlZmVyZW5jZX0gW2JvdW5kRW50aXR5XSAtIEFuIG9wdGlvbmFsIGBFbnRpdHlSZWZlcmVuY2VgIGluZGljYXRpbmcgdGhlIGVudGl0eSB0aGUgcmVxdWVzdCBpcyBib3VuZCB0by5cbiAgICpcbiAgICogQHJldHVybnMge29iamVjdH0gLSBUaGUgcmVxdWVzdCBvYmplY3QgdGhhdCBjYW4gYmUgcGFzc2VkIGludG8gYFhybS5XZWJBcGkub25saW5lLmV4ZWN1dGVgIG9yIGBYcm0uV2ViQXBpLm9ubGluZS5leGVjdXRlTXVsdGlwbGVgLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAvLyBCdWlsZCBhIHJlcXVlc3Qgb2JqZWN0IGZvciBhIGN1c3RvbSBhY3Rpb24gXCJuZXdfRG9Tb21ldGhpbmdcIiAob3BlcmF0aW9uVHlwZSA9IDAgZm9yIGFjdGlvbnMpXG4gICAqIGNvbnN0IHJlcXVlc3QgPSBidWlsZFJlcXVlc3RPYmplY3QoXCJuZXdfRG9Tb21ldGhpbmdcIiwgeyBwYXJhbTE6IFwidmFsdWUxXCIsIHBhcmFtMjogMTIzIH0sIDApO1xuICAgKlxuICAgKiAvLyBFeGVjdXRlIHRoZSByZXF1ZXN0IGltbWVkaWF0ZWx5XG4gICAqIGNvbnN0IHJlc3VsdCA9IGF3YWl0IFhybS5XZWJBcGkub25saW5lLmV4ZWN1dGUocmVxdWVzdCk7XG4gICAqXG4gICAqIC8vIE9yIHN0b3JlIHRoZSByZXF1ZXN0IGFuZCBleGVjdXRlIGl0IGxhdGVyIHVzaW5nIGV4ZWN1dGVNdWx0aXBsZVxuICAgKiBjb25zdCByZXF1ZXN0cyA9IFtyZXF1ZXN0LCBhbm90aGVyUmVxdWVzdF07XG4gICAqIGNvbnN0IGJhdGNoUmVzdWx0ID0gYXdhaXQgWHJtLldlYkFwaS5vbmxpbmUuZXhlY3V0ZU11bHRpcGxlKHJlcXVlc3RzKTtcbiAgICovXG4gIGV4cG9ydCBmdW5jdGlvbiBidWlsZFJlcXVlc3RPYmplY3QoXG4gICAgYWN0aW9uTmFtZTogc3RyaW5nLFxuICAgIHJlcXVlc3RQYXJhbWV0ZXJzOiBSZXF1ZXN0UGFyYW1ldGVyW10gfCB7IFtrZXk6IHN0cmluZ106IGFueSB9LFxuICAgIG9wZXJhdGlvblR5cGU6IG51bWJlcixcbiAgICBib3VuZEVudGl0eT86IEVudGl0eVJlZmVyZW5jZVxuICApIHtcbiAgICBjb25zdCBwcmVwYXJlUGFyYW1ldGVyRGVmaW5pdGlvbiA9IChcbiAgICAgIHBhcmFtczogUmVxdWVzdFBhcmFtZXRlcltdIHwgeyBba2V5OiBzdHJpbmddOiBhbnkgfVxuICAgICkgPT4ge1xuICAgICAgY29uc3QgcGFyYW1ldGVyRGVmaW5pdGlvbjogeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuICAgICAgY29uc3QgcCA9IEFycmF5LmlzQXJyYXkocGFyYW1zKSA/IFsuLi5wYXJhbXNdIDogeyAuLi5wYXJhbXMgfTtcblxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkocCkpIHtcbiAgICAgICAgcC5mb3JFYWNoKChwYXJhbSkgPT4ge1xuICAgICAgICAgIHBhcmFtZXRlckRlZmluaXRpb25bcGFyYW0uTmFtZV0gPSB7XG4gICAgICAgICAgICB0eXBlTmFtZTogdHlwZU1hcFtwYXJhbS5UeXBlXS50eXBlTmFtZSxcbiAgICAgICAgICAgIHN0cnVjdHVyYWxQcm9wZXJ0eTogdHlwZU1hcFtwYXJhbS5UeXBlXS5zdHJ1Y3R1cmFsUHJvcGVydHksXG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBPYmplY3Qua2V5cyhwKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICBwYXJhbWV0ZXJEZWZpbml0aW9uW2tleV0gPSB7XG4gICAgICAgICAgICBzdHJ1Y3R1cmFsUHJvcGVydHk6IGdldFN0cnVjdHVyYWxQcm9wZXJ0eShwW2tleV0pLFxuICAgICAgICAgICAgdHlwZU5hbWU6IGdldFR5cGVOYW1lKHBba2V5XSksXG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwYXJhbWV0ZXJEZWZpbml0aW9uO1xuICAgIH07XG5cbiAgICBjb25zdCBjcmVhdGVSZXF1ZXN0ID0gKFxuICAgICAgcGFyYW1zOiBSZXF1ZXN0UGFyYW1ldGVyW10gfCB7IFtrZXk6IHN0cmluZ106IGFueSB9LFxuICAgICAgZGVmaW5pdGlvbjogeyBba2V5OiBzdHJpbmddOiBhbnkgfVxuICAgICkgPT4ge1xuICAgICAgY29uc3QgbWV0YWRhdGEgPSB7XG4gICAgICAgIGJvdW5kUGFyYW1ldGVyOiBib3VuZEVudGl0eSA/IFwiZW50aXR5XCIgOiBudWxsLFxuICAgICAgICBvcGVyYXRpb25UeXBlOiBvcGVyYXRpb25UeXBlLFxuICAgICAgICBvcGVyYXRpb25OYW1lOiBhY3Rpb25OYW1lLFxuICAgICAgICBwYXJhbWV0ZXJUeXBlczogZGVmaW5pdGlvbixcbiAgICAgIH07XG4gICAgICBjb25zdCBtZXJnZWRQYXJhbXMgPSBBcnJheS5pc0FycmF5KHBhcmFtcylcbiAgICAgICAgPyBPYmplY3QuYXNzaWduKFxuICAgICAgICAgIHt9LFxuICAgICAgICAgIC4uLnBhcmFtcy5tYXAoKHApID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYFBhcmFtZXRlciAke3AuTmFtZX06ICR7cC5WYWx1ZX1gKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcC5WYWx1ZSA9PT0gXCJzdHJpbmdcIiAmJiBpc0d1aWQocC5WYWx1ZSkpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhgT3JpZ2luYWwgR1VJRCB2YWx1ZSBmb3IgJHtwLk5hbWV9OiAke3AuVmFsdWV9YCk7XG4gICAgICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBub3JtYWxpemVHdWlkKHAuVmFsdWUpO1xuICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKFxuICAgICAgICAgICAgICAgIGBOb3JtYWxpemVkIEdVSUQgdmFsdWUgZm9yICR7cC5OYW1lfTogJHtub3JtYWxpemVkfWBcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHsgW3AuTmFtZV06IG5vcm1hbGl6ZWQgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IFtwLk5hbWVdOiBwLlZhbHVlIH07XG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgICA6IHBhcmFtcztcblxuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oeyBnZXRNZXRhZGF0YTogKCkgPT4gbWV0YWRhdGEgfSwgbWVyZ2VkUGFyYW1zKTtcbiAgICB9O1xuICAgIGlmIChib3VuZEVudGl0eSkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmVxdWVzdFBhcmFtZXRlcnMpKSB7XG4gICAgICAgIHJlcXVlc3RQYXJhbWV0ZXJzLnB1c2goe1xuICAgICAgICAgIE5hbWU6IFwiZW50aXR5XCIsXG4gICAgICAgICAgVmFsdWU6IGJvdW5kRW50aXR5LFxuICAgICAgICAgIFR5cGU6IFwiRW50aXR5UmVmZXJlbmNlXCIsXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVxdWVzdFBhcmFtZXRlcnNbXCJlbnRpdHlcIl0gPSBib3VuZEVudGl0eTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBwYXJhbWV0ZXJEZWZpbml0aW9uID0gcHJlcGFyZVBhcmFtZXRlckRlZmluaXRpb24ocmVxdWVzdFBhcmFtZXRlcnMpO1xuICAgIGNvbnN0IHJlcXVlc3QgPSBjcmVhdGVSZXF1ZXN0KHJlcXVlc3RQYXJhbWV0ZXJzLCBwYXJhbWV0ZXJEZWZpbml0aW9uKTtcbiAgICByZXR1cm4gcmVxdWVzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlcyBhIHJlcXVlc3QuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhY3Rpb25OYW1lIC0gVGhlIHVuaXF1ZSBuYW1lIG9mIHRoZSByZXF1ZXN0LlxuICAgKiBAcGFyYW0ge1JlcXVlc3RQYXJhbWV0ZXJbXSB8IG9iamVjdH0gcmVxdWVzdFBhcmFtZXRlcnMgLSBBbiBhcnJheSBvZiBvYmplY3RzIHdpdGggdGhlIHBhcmFtZXRlciBuYW1lLCB0eXBlLCBhbmQgdmFsdWUuXG4gICAqIEBwYXJhbSB7RW50aXR5UmVmZXJlbmNlfSBbYm91bmRFbnRpdHldIC0gQW4gb3B0aW9uYWwgRW50aXR5UmVmZXJlbmNlIG9mIHRoZSBib3VuZCBlbnRpdHkuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbb3BlcmF0aW9uVHlwZT0xXSAtIFRoZSB0eXBlIG9mIHRoZSByZXF1ZXN0LiAwIGZvciBhY3Rpb25zLCAxIGZvciBmdW5jdGlvbnMsIDIgZm9yIENSVUQgb3BlcmF0aW9ucy5cbiAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn0gLSBBIFByb21pc2Ugd2l0aCB0aGUgcmVxdWVzdCByZXNwb25zZS5cbiAgICogQHRocm93cyB7RXJyb3J9IC0gVGhyb3dzIGFuIGVycm9yIGlmIHRoZSByZXF1ZXN0IHBhcmFtZXRlciBpcyBub3Qgb2YgYSBzdXBwb3J0ZWQgdHlwZSBvciBoYXMgYW4gaW52YWxpZCB2YWx1ZS5cbiAgICovXG4gIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBleGVjdXRlKFxuICAgIGFjdGlvbk5hbWU6IHN0cmluZyxcbiAgICByZXF1ZXN0UGFyYW1ldGVyczogUmVxdWVzdFBhcmFtZXRlcltdIHwgeyBba2V5OiBzdHJpbmddOiBhbnkgfSxcbiAgICBib3VuZEVudGl0eT86IEVudGl0eVJlZmVyZW5jZSxcbiAgICBvcGVyYXRpb25UeXBlOiBudW1iZXIgPSAxXG4gICk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgcmVxdWVzdCA9IGJ1aWxkUmVxdWVzdE9iamVjdChcbiAgICAgIGFjdGlvbk5hbWUsXG4gICAgICByZXF1ZXN0UGFyYW1ldGVycyxcbiAgICAgIG9wZXJhdGlvblR5cGUsXG4gICAgICBib3VuZEVudGl0eVxuICAgICk7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgWHJtLldlYkFwaS5vbmxpbmUuZXhlY3V0ZShyZXF1ZXN0KTtcbiAgICBpZiAocmVzdWx0Lm9rKSByZXR1cm4gcmVzdWx0Lmpzb24oKS5jYXRjaCgoKSA9PiByZXN1bHQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGVzIGFuIEFjdGlvbi5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGFjdGlvbk5hbWUgLSBUaGUgdW5pcXVlIG5hbWUgb2YgdGhlIGFjdGlvbi5cbiAgICogQHBhcmFtIHtSZXF1ZXN0UGFyYW1ldGVyW10gfCBvYmplY3R9IHJlcXVlc3RQYXJhbWV0ZXJzIC0gQW4gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoIHRoZSBwYXJhbWV0ZXIgbmFtZSwgdHlwZSwgYW5kIHZhbHVlLlxuICAgKiBAcGFyYW0ge0VudGl0eVJlZmVyZW5jZX0gW2JvdW5kRW50aXR5XSAtIEFuIG9wdGlvbmFsIEVudGl0eVJlZmVyZW5jZSBvZiB0aGUgYm91bmQgZW50aXR5LlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fSAtIEEgUHJvbWlzZSB3aXRoIHRoZSByZXF1ZXN0IHJlc3BvbnNlLlxuICAgKiBAdGhyb3dzIHtFcnJvcn0gLSBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlIHJlcXVlc3QgcGFyYW1ldGVyIGlzIG5vdCBvZiBhIHN1cHBvcnRlZCB0eXBlIG9yIGhhcyBhbiBpbnZhbGlkIHZhbHVlLlxuICAgKi9cbiAgZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVBY3Rpb24oXG4gICAgZnVuY3Rpb25OYW1lOiBzdHJpbmcsXG4gICAgcmVxdWVzdFBhcmFtZXRlcnM6IFJlcXVlc3RQYXJhbWV0ZXJbXSB8IG9iamVjdCxcbiAgICBib3VuZEVudGl0eT86IEVudGl0eVJlZmVyZW5jZVxuICApOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBhd2FpdCBleGVjdXRlKGZ1bmN0aW9uTmFtZSwgcmVxdWVzdFBhcmFtZXRlcnMsIGJvdW5kRW50aXR5LCAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlcyBhIEZ1bmN0aW9uLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZnVuY3Rpb25OYW1lIC0gVGhlIHVuaXF1ZSBuYW1lIG9mIHRoZSBmdW5jdGlvbi5cbiAgICogQHBhcmFtIHtSZXF1ZXN0UGFyYW1ldGVyW10gfCBvYmplY3R9IHJlcXVlc3RQYXJhbWV0ZXJzIC0gQW4gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoIHRoZSBwYXJhbWV0ZXIgbmFtZSwgdHlwZSBhbmQgdmFsdWUuXG4gICAqIEBwYXJhbSB7RW50aXR5UmVmZXJlbmNlfSBbYm91bmRFbnRpdHldIC0gQW4gb3B0aW9uYWwgRW50aXR5UmVmZXJlbmNlIG9mIHRoZSBib3VuZCBlbnRpdHkuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59IC0gQSBQcm9taXNlIHdpdGggdGhlIHJlcXVlc3QgcmVzcG9uc2UuXG4gICAqIEB0aHJvd3Mge0Vycm9yfSAtIFRocm93cyBhbiBlcnJvciBpZiB0aGUgcmVxdWVzdCBwYXJhbWV0ZXIgaXMgbm90IG9mIGEgc3VwcG9ydGVkIHR5cGUgb3IgaGFzIGFuIGludmFsaWQgdmFsdWUuXG4gICAqL1xuICBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUZ1bmN0aW9uKFxuICAgIGZ1bmN0aW9uTmFtZTogc3RyaW5nLFxuICAgIHJlcXVlc3RQYXJhbWV0ZXJzOiBSZXF1ZXN0UGFyYW1ldGVyW10gfCBvYmplY3QsXG4gICAgYm91bmRFbnRpdHk/OiBFbnRpdHlSZWZlcmVuY2VcbiAgKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gYXdhaXQgZXhlY3V0ZShmdW5jdGlvbk5hbWUsIHJlcXVlc3RQYXJhbWV0ZXJzLCBib3VuZEVudGl0eSwgMSk7XG4gIH1cblxuICAvKipcbiAgICogRXhlY3V0ZXMgYSBDUlVEIHJlcXVlc3QuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlTmFtZSAtIFRoZSB1bmlxdWUgbmFtZSBvZiB0aGUgcmVxdWVzdC5cbiAgICogQHBhcmFtIHtSZXF1ZXN0UGFyYW1ldGVyW10gfCBvYmplY3R9IHJlcXVlc3RQYXJhbWV0ZXJzIC0gQW4gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoIHRoZSBwYXJhbWV0ZXIgbmFtZSwgdHlwZSwgYW5kIHZhbHVlLlxuICAgKiBAcGFyYW0ge0VudGl0eVJlZmVyZW5jZX0gW2JvdW5kRW50aXR5XSAtIEFuIG9wdGlvbmFsIEVudGl0eVJlZmVyZW5jZSBvZiB0aGUgYm91bmQgZW50aXR5LlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fSAtIEEgUHJvbWlzZSB3aXRoIHRoZSByZXF1ZXN0IHJlc3BvbnNlLlxuICAgKiBAdGhyb3dzIHtFcnJvcn0gLSBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlIHJlcXVlc3QgcGFyYW1ldGVyIGlzIG5vdCBvZiBhIHN1cHBvcnRlZCB0eXBlIG9yIGhhcyBhbiBpbnZhbGlkIHZhbHVlLlxuICAgKi9cbiAgZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVDUlVEKFxuICAgIGZ1bmN0aW9uTmFtZTogc3RyaW5nLFxuICAgIHJlcXVlc3RQYXJhbWV0ZXJzOiBSZXF1ZXN0UGFyYW1ldGVyW10gfCBvYmplY3QsXG4gICAgYm91bmRFbnRpdHk/OiBFbnRpdHlSZWZlcmVuY2VcbiAgKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gYXdhaXQgZXhlY3V0ZShmdW5jdGlvbk5hbWUsIHJlcXVlc3RQYXJhbWV0ZXJzLCBib3VuZEVudGl0eSwgMik7XG4gIH1cblxuICAvKipcbiAgICogTWFrZXMgYSBHVUlEIGxvd2VyY2FzZSBhbmQgcmVtb3ZlcyBicmFja2V0cy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGd1aWQgLSBUaGUgR1VJRCB0byBub3JtYWxpemUuXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gVGhlIG5vcm1hbGl6ZWQgR1VJRC5cbiAgICovXG4gIGV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVHdWlkKGd1aWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHR5cGVvZiBndWlkICE9PSBcInN0cmluZ1wiKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC5ub3JtYWxpemVHdWlkOlxcbicke2d1aWR9JyBpcyBub3QgYSBzdHJpbmdgKTtcbiAgICByZXR1cm4gZ3VpZC50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1t7fV0vZywgXCJcIik7XG4gIH1cblxuICAvKipcbiAgICogV3JhcHMgYSBmdW5jdGlvbiB0aGF0IHRha2VzIGEgY2FsbGJhY2sgYXMgaXRzIGxhc3QgcGFyYW1ldGVyIGFuZCByZXR1cm5zIGEgUHJvbWlzZS5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gdGhlIGZ1bmN0aW9uIHRvIHdyYXBcbiAgICogQHBhcmFtIGNvbnRleHQgdGhlIHBhcmVudCBwcm9wZXJ0eSBvZiB0aGUgZnVuY3Rpb24gZi5lLiBmb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MgZm9yIGZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5nZXRFbmFibGVkUHJvY2Vzc2VzXG4gICAqIEBwYXJhbSBhcmdzIHRoZSBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgZnVuY3Rpb25cbiAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn0gYSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgY2FsbGJhY2sgcmVzcG9uc2VcbiAgICovXG4gIGV4cG9ydCBmdW5jdGlvbiBhc1Byb21pc2U8VD4oZm46IEZ1bmN0aW9uLCBjb250ZXh0LCAuLi5hcmdzKTogUHJvbWlzZTxUPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPFQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IGNhbGxiYWNrID0gKHJlc3BvbnNlOiBUKSA9PiB7XG4gICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgfTtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIENhbGwgdGhlIGZ1bmN0aW9uIHdpdGggdGhlIGFyZ3VtZW50cyBhbmQgdGhlIGNhbGxiYWNrIGF0IHRoZSBlbmRcbiAgICAgICAgZm4uY2FsbChjb250ZXh0LCAuLi5hcmdzLCBjYWxsYmFjayk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKiBPcGVucyBhIGRpYWxvZyB3aXRoIGR5bmFtaWMgaGVpZ2h0IGFuZCB3aWR0aCBiYXNlZCBvbiB0ZXh0IGNvbnRlbnQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZSAtIFRoZSB0aXRsZSBvZiB0aGUgZGlhbG9nLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIFRoZSB0ZXh0IGNvbnRlbnQgb2YgdGhlIGRpYWxvZy5cbiAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn0gLSBBIFByb21pc2Ugd2l0aCB0aGUgZGlhbG9nIHJlc3BvbnNlLlxuICAgKi9cbiAgZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9wZW5BbGVydERpYWxvZyhcbiAgICB0aXRsZTogc3RyaW5nLFxuICAgIHRleHQ6IHN0cmluZ1xuICApOiBQcm9taXNlPGFueT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByb3dzID0gdGV4dC5zcGxpdCgvXFxyXFxufFxccnxcXG4vKTtcbiAgICAgIGxldCBhZGRpdGlvbmFsUm93cyA9IDA7XG4gICAgICByb3dzLmZvckVhY2goKHJvdykgPT4ge1xuICAgICAgICBsZXQgd2lkdGggPSBnZXRUZXh0V2lkdGgoXG4gICAgICAgICAgcm93LFxuICAgICAgICAgIFwiMXJlbSBTZWdvZSBVSSBSZWd1bGFyLCBTZWdvZVVJLCBTZWdvZSBVSVwiXG4gICAgICAgICk7XG4gICAgICAgIGlmICh3aWR0aCA+IDk0MCkge1xuICAgICAgICAgIGFkZGl0aW9uYWxSb3dzICs9IHdpZHRoIC8gOTQwO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGxvbmdlc3RSb3cgPSByb3dzLnJlZHVjZShcbiAgICAgICAgKGFjYywgcm93KSA9PiAocm93Lmxlbmd0aCA+IGFjYy5sZW5ndGggPyByb3cgOiBhY2MpLFxuICAgICAgICBcIlwiXG4gICAgICApO1xuICAgICAgY29uc3Qgd2lkdGggPSBNYXRoLm1pbihcbiAgICAgICAgZ2V0VGV4dFdpZHRoKGxvbmdlc3RSb3csIFwiMXJlbSBTZWdvZSBVSSBSZWd1bGFyLCBTZWdvZVVJLCBTZWdvZSBVSVwiKSxcbiAgICAgICAgMTAwMFxuICAgICAgKTtcbiAgICAgIGNvbnN0IGhlaWdodCA9IDEwOSArIChyb3dzLmxlbmd0aCArIGFkZGl0aW9uYWxSb3dzKSAqIDIwO1xuICAgICAgcmV0dXJuIGF3YWl0IFhybS5OYXZpZ2F0aW9uLm9wZW5BbGVydERpYWxvZyhcbiAgICAgICAge1xuICAgICAgICAgIGNvbmZpcm1CdXR0b25MYWJlbDogXCJPa1wiLFxuICAgICAgICAgIHRleHQsXG4gICAgICAgICAgdGl0bGUsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgd2lkdGgsXG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgY29uc29sZS5lcnJvcihlcnJvci5tZXNzYWdlKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguJHtnZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVc2VzIGNhbnZhcy5tZWFzdXJlVGV4dCB0byBjb21wdXRlIGFuZCByZXR1cm4gdGhlIHdpZHRoIG9mIHRoZSBnaXZlbiB0ZXh0IG9mIGdpdmVuIGZvbnQgaW4gcGl4ZWxzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRleHQgVGhlIHRleHQgdG8gYmUgcmVuZGVyZWQuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGZvbnQgVGhlIGNzcyBmb250IGRlc2NyaXB0b3IgdGhhdCB0ZXh0IGlzIHRvIGJlIHJlbmRlcmVkIHdpdGggKGUuZy4gXCJib2xkIDE0cHggdmVyZGFuYVwiKS5cbiAgICAgKlxuICAgICAqIEBzZWUgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTE4MjQxL2NhbGN1bGF0ZS10ZXh0LXdpZHRoLXdpdGgtamF2YXNjcmlwdC8yMTAxNTM5MyMyMTAxNTM5M1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldFRleHRXaWR0aCh0ZXh0OiBzdHJpbmcsIGZvbnQ6IHN0cmluZykge1xuICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgICAgY29udGV4dC5mb250ID0gZm9udDtcbiAgICAgIGNvbnN0IG1ldHJpY3MgPSBjb250ZXh0Lm1lYXN1cmVUZXh0KHRleHQpO1xuICAgICAgcmV0dXJuIG1ldHJpY3Mud2lkdGg7XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGNsYXNzIFByb2Nlc3Mge1xuICAgIHN0YXRpYyBnZXQgZGF0YSgpIHtcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2VzcztcbiAgICB9XG4gICAgc3RhdGljIGdldCB1aSgpIHtcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LnVpLnByb2Nlc3M7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVzZSB0aGlzIHRvIGFkZCBhIGZ1bmN0aW9uIGFzIGFuIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBPblByZVByb2Nlc3NTdGF0dXNDaGFuZ2UgZXZlbnQgc28gdGhhdCBpdCB3aWxsIGJlIGNhbGxlZCBiZWZvcmUgdGhlXG4gICAgICogYnVzaW5lc3MgcHJvY2VzcyBmbG93IHN0YXR1cyBjaGFuZ2VzLlxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGFkZGVkIHRvIHRoZSBib3R0b20gb2YgdGhlIGV2ZW50XG4gICAgICogICAgICAgICAgICAgICAgaGFuZGxlciBwaXBlbGluZS4gVGhlIGV4ZWN1dGlvbiBjb250ZXh0IGlzIGF1dG9tYXRpY2FsbHlcbiAgICAgKiAgICAgICAgICAgICAgICBzZXQgdG8gYmUgdGhlIGZpcnN0IHBhcmFtZXRlciBwYXNzZWQgdG8gdGhlIGV2ZW50IGhhbmRsZXIuXG4gICAgICogICAgICAgICAgICAgICAgVXNlIGEgcmVmZXJlbmNlIHRvIGEgbmFtZWQgZnVuY3Rpb24gcmF0aGVyIHRoYW4gYW5cbiAgICAgKiAgICAgICAgICAgICAgICBhbm9ueW1vdXMgZnVuY3Rpb24gaWYgeW91IG1heSBsYXRlciB3YW50IHRvIHJlbW92ZSB0aGVcbiAgICAgKiAgICAgICAgICAgICAgICBldmVudCBoYW5kbGVyLlxuICAgICAqL1xuICAgIHN0YXRpYyBhZGRPblByZVByb2Nlc3NTdGF0dXNDaGFuZ2UoXG4gICAgICBoYW5kbGVyOiBYcm0uRXZlbnRzLlByb2Nlc3NTdGF0dXNDaGFuZ2VIYW5kbGVyXG4gICAgKSB7XG4gICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5yZW1vdmVPblByZVByb2Nlc3NTdGF0dXNDaGFuZ2UoaGFuZGxlcik7XG4gICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MuYWRkT25QcmVQcm9jZXNzU3RhdHVzQ2hhbmdlKGhhbmRsZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVc2UgdGhpcyB0byBhZGQgYSBmdW5jdGlvbiBhcyBhbiBldmVudCBoYW5kbGVyIGZvciB0aGUgT25QcmVTdGFnZUNoYW5nZSBldmVudCBzbyB0aGF0IGl0IHdpbGwgYmUgY2FsbGVkIGJlZm9yZSB0aGVcbiAgICAgKiBidXNpbmVzcyBwcm9jZXNzIGZsb3cgc3RhZ2UgY2hhbmdlcy5cbiAgICAgKiBAcGFyYW0gaGFuZGxlciBUaGUgZnVuY3Rpb24gd2lsbCBiZSBhZGRlZCB0byB0aGUgYm90dG9tIG9mIHRoZSBldmVudFxuICAgICAqICAgICAgICAgICAgICAgIGhhbmRsZXIgcGlwZWxpbmUuIFRoZSBleGVjdXRpb24gY29udGV4dCBpcyBhdXRvbWF0aWNhbGx5XG4gICAgICogICAgICAgICAgICAgICAgc2V0IHRvIGJlIHRoZSBmaXJzdCBwYXJhbWV0ZXIgcGFzc2VkIHRvIHRoZSBldmVudCBoYW5kbGVyLlxuICAgICAqICAgICAgICAgICAgICAgIFVzZSBhIHJlZmVyZW5jZSB0byBhIG5hbWVkIGZ1bmN0aW9uIHJhdGhlciB0aGFuIGFuXG4gICAgICogICAgICAgICAgICAgICAgYW5vbnltb3VzIGZ1bmN0aW9uIGlmIHlvdSBtYXkgbGF0ZXIgd2FudCB0byByZW1vdmUgdGhlXG4gICAgICogICAgICAgICAgICAgICAgZXZlbnQgaGFuZGxlci5cbiAgICAgKi9cbiAgICBzdGF0aWMgYWRkT25QcmVTdGFnZUNoYW5nZShoYW5kbGVyOiBYcm0uRXZlbnRzLlN0YWdlQ2hhbmdlRXZlbnRIYW5kbGVyKSB7XG4gICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5yZW1vdmVPblByZVN0YWdlQ2hhbmdlKGhhbmRsZXIpO1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLmFkZE9uUHJlU3RhZ2VDaGFuZ2UoaGFuZGxlcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVzZSB0aGlzIHRvIGFkZCBhIGZ1bmN0aW9uIGFzIGFuIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBPblByZVByb2Nlc3NTdGF0dXNDaGFuZ2UgZXZlbnQgc28gdGhhdCBpdCB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoZVxuICAgICAqIGJ1c2luZXNzIHByb2Nlc3MgZmxvdyBzdGF0dXMgY2hhbmdlcy5cbiAgICAgKiBAcGFyYW0gaGFuZGxlciBUaGUgZnVuY3Rpb24gd2lsbCBiZSBhZGRlZCB0byB0aGUgYm90dG9tIG9mIHRoZSBldmVudFxuICAgICAqICAgICAgICAgICAgICAgIGhhbmRsZXIgcGlwZWxpbmUuIFRoZSBleGVjdXRpb24gY29udGV4dCBpcyBhdXRvbWF0aWNhbGx5XG4gICAgICogICAgICAgICAgICAgICAgc2V0IHRvIGJlIHRoZSBmaXJzdCBwYXJhbWV0ZXIgcGFzc2VkIHRvIHRoZSBldmVudCBoYW5kbGVyLlxuICAgICAqICAgICAgICAgICAgICAgIFVzZSBhIHJlZmVyZW5jZSB0byBhIG5hbWVkIGZ1bmN0aW9uIHJhdGhlciB0aGFuIGFuXG4gICAgICogICAgICAgICAgICAgICAgYW5vbnltb3VzIGZ1bmN0aW9uIGlmIHlvdSBtYXkgbGF0ZXIgd2FudCB0byByZW1vdmUgdGhlXG4gICAgICogICAgICAgICAgICAgICAgZXZlbnQgaGFuZGxlci5cbiAgICAgKi9cbiAgICBzdGF0aWMgYWRkT25Qcm9jZXNzU3RhdHVzQ2hhbmdlKFxuICAgICAgaGFuZGxlcjogWHJtLkV2ZW50cy5Qcm9jZXNzU3RhdHVzQ2hhbmdlSGFuZGxlclxuICAgICkge1xuICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MucmVtb3ZlT25Qcm9jZXNzU3RhdHVzQ2hhbmdlKGhhbmRsZXIpO1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLmFkZE9uUHJvY2Vzc1N0YXR1c0NoYW5nZShoYW5kbGVyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXNlIHRoaXMgdG8gYWRkIGEgZnVuY3Rpb24gYXMgYW4gZXZlbnQgaGFuZGxlciBmb3IgdGhlIE9uU3RhZ2VDaGFuZ2UgZXZlbnQgc28gdGhhdCBpdCB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoZVxuICAgICAqIGJ1c2luZXNzIHByb2Nlc3MgZmxvdyBzdGFnZSBjaGFuZ2VzLlxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGFkZGVkIHRvIHRoZSBib3R0b20gb2YgdGhlIGV2ZW50XG4gICAgICogICAgICAgICAgICAgICAgaGFuZGxlciBwaXBlbGluZS4gVGhlIGV4ZWN1dGlvbiBjb250ZXh0IGlzIGF1dG9tYXRpY2FsbHlcbiAgICAgKiAgICAgICAgICAgICAgICBzZXQgdG8gYmUgdGhlIGZpcnN0IHBhcmFtZXRlciBwYXNzZWQgdG8gdGhlIGV2ZW50IGhhbmRsZXIuXG4gICAgICogICAgICAgICAgICAgICAgVXNlIGEgcmVmZXJlbmNlIHRvIGEgbmFtZWQgZnVuY3Rpb24gcmF0aGVyIHRoYW4gYW5cbiAgICAgKiAgICAgICAgICAgICAgICBhbm9ueW1vdXMgZnVuY3Rpb24gaWYgeW91IG1heSBsYXRlciB3YW50IHRvIHJlbW92ZSB0aGVcbiAgICAgKiAgICAgICAgICAgICAgICBldmVudCBoYW5kbGVyLlxuICAgICAqL1xuICAgIHN0YXRpYyBhZGRPblN0YWdlQ2hhbmdlKGhhbmRsZXI6IFhybS5FdmVudHMuU3RhZ2VDaGFuZ2VFdmVudEhhbmRsZXIpIHtcbiAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLnJlbW92ZU9uU3RhZ2VDaGFuZ2UoaGFuZGxlcik7XG4gICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MuYWRkT25TdGFnZUNoYW5nZShoYW5kbGVyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXNlIHRoaXMgdG8gYWRkIGEgZnVuY3Rpb24gYXMgYW4gZXZlbnQgaGFuZGxlciBmb3IgdGhlIE9uU3RhZ2VTZWxlY3RlZCBldmVudCBzbyB0aGF0IGl0IHdpbGwgYmUgY2FsbGVkXG4gICAgICogd2hlbiBhIGJ1c2luZXNzIHByb2Nlc3MgZmxvdyBzdGFnZSBpcyBzZWxlY3RlZC5cbiAgICAgKiBAcGFyYW0gaGFuZGxlciBUaGUgZnVuY3Rpb24gd2lsbCBiZSBhZGRlZCB0byB0aGUgYm90dG9tIG9mIHRoZSBldmVudFxuICAgICAqICAgICAgICAgICAgICAgIGhhbmRsZXIgcGlwZWxpbmUuIFRoZSBleGVjdXRpb24gY29udGV4dCBpcyBhdXRvbWF0aWNhbGx5XG4gICAgICogICAgICAgICAgICAgICAgc2V0IHRvIGJlIHRoZSBmaXJzdCBwYXJhbWV0ZXIgcGFzc2VkIHRvIHRoZSBldmVudCBoYW5kbGVyLlxuICAgICAqICAgICAgICAgICAgICAgIFVzZSBhIHJlZmVyZW5jZSB0byBhIG5hbWVkIGZ1bmN0aW9uIHJhdGhlciB0aGFuIGFuXG4gICAgICogICAgICAgICAgICAgICAgYW5vbnltb3VzIGZ1bmN0aW9uIGlmIHlvdSBtYXkgbGF0ZXIgd2FudCB0byByZW1vdmUgdGhlXG4gICAgICogICAgICAgICAgICAgICAgZXZlbnQgaGFuZGxlci5cbiAgICAgKi9cbiAgICBzdGF0aWMgYWRkT25TdGFnZVNlbGVjdGVkKGhhbmRsZXI6IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXIpIHtcbiAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLnJlbW92ZU9uU3RhZ2VTZWxlY3RlZChoYW5kbGVyKTtcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5hZGRPblN0YWdlU2VsZWN0ZWQoaGFuZGxlcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVzZSB0aGlzIHRvIHJlbW92ZSBhIGZ1bmN0aW9uIGFzIGFuIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBPblByZVByb2Nlc3NTdGF0dXNDaGFuZ2UgZXZlbnQuXG4gICAgICogQHBhcmFtIGhhbmRsZXIgSWYgYW4gYW5vbnltb3VzIGZ1bmN0aW9uIGlzIHNldCB1c2luZyB0aGUgYWRkT25QcmVQcm9jZXNzU3RhdHVzQ2hhbmdlIG1ldGhvZCBpdFxuICAgICAqICAgICAgICAgICAgICAgIGNhbm5vdCBiZSByZW1vdmVkIHVzaW5nIHRoaXMgbWV0aG9kLlxuICAgICAqL1xuICAgIHN0YXRpYyByZW1vdmVPblByZVByb2Nlc3NTdGF0dXNDaGFuZ2UoXG4gICAgICBoYW5kbGVyOiBYcm0uRXZlbnRzLlByb2Nlc3NTdGF0dXNDaGFuZ2VIYW5kbGVyXG4gICAgKSB7XG4gICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MucmVtb3ZlT25QcmVQcm9jZXNzU3RhdHVzQ2hhbmdlKFxuICAgICAgICBoYW5kbGVyXG4gICAgICApO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVc2UgdGhpcyB0byByZW1vdmUgYSBmdW5jdGlvbiBhcyBhbiBldmVudCBoYW5kbGVyIGZvciB0aGUgT25QcmVTdGFnZUNoYW5nZSBldmVudC5cbiAgICAgKiBAcGFyYW0gaGFuZGxlciBJZiBhbiBhbm9ueW1vdXMgZnVuY3Rpb24gaXMgc2V0IHVzaW5nIHRoZSBhZGRPblByZVN0YWdlQ2hhbmdlIG1ldGhvZCBpdFxuICAgICAqICAgICAgICAgICAgICAgIGNhbm5vdCBiZSByZW1vdmVkIHVzaW5nIHRoaXMgbWV0aG9kLlxuICAgICAqL1xuICAgIHN0YXRpYyByZW1vdmVPblByZVN0YWdlQ2hhbmdlKGhhbmRsZXI6IFhybS5FdmVudHMuU3RhZ2VDaGFuZ2VFdmVudEhhbmRsZXIpIHtcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5yZW1vdmVPblByZVN0YWdlQ2hhbmdlKGhhbmRsZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVc2UgdGhpcyB0byByZW1vdmUgYSBmdW5jdGlvbiBhcyBhbiBldmVudCBoYW5kbGVyIGZvciB0aGUgT25Qcm9jZXNzU3RhdHVzQ2hhbmdlIGV2ZW50LlxuICAgICAqIEBwYXJhbSBoYW5kbGVyIElmIGFuIGFub255bW91cyBmdW5jdGlvbiBpcyBzZXQgdXNpbmcgdGhlIGFkZE9uUHJvY2Vzc1N0YXR1c0NoYW5nZSBtZXRob2QgaXRcbiAgICAgKiAgICAgICAgICAgICAgICBjYW5ub3QgYmUgcmVtb3ZlZCB1c2luZyB0aGlzIG1ldGhvZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVtb3ZlT25Qcm9jZXNzU3RhdHVzQ2hhbmdlKFxuICAgICAgaGFuZGxlcjogWHJtLkV2ZW50cy5Qcm9jZXNzU3RhdHVzQ2hhbmdlSGFuZGxlclxuICAgICkge1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLnJlbW92ZU9uUHJvY2Vzc1N0YXR1c0NoYW5nZShoYW5kbGVyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXNlIHRoaXMgdG8gcmVtb3ZlIGEgZnVuY3Rpb24gYXMgYW4gZXZlbnQgaGFuZGxlciBmb3IgdGhlIE9uU3RhZ2VDaGFuZ2UgZXZlbnQuXG4gICAgICogQHBhcmFtIGhhbmRsZXIgSWYgYW4gYW5vbnltb3VzIGZ1bmN0aW9uIGlzIHNldCB1c2luZyB0aGUgYWRkT25TdGFnZUNoYW5nZSBtZXRob2QgaXRcbiAgICAgKiAgICAgICAgICAgICAgICBjYW5ub3QgYmUgcmVtb3ZlZCB1c2luZyB0aGlzIG1ldGhvZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVtb3ZlT25TdGFnZUNoYW5nZShoYW5kbGVyOiBYcm0uRXZlbnRzLlN0YWdlQ2hhbmdlRXZlbnRIYW5kbGVyKSB7XG4gICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MucmVtb3ZlT25TdGFnZUNoYW5nZShoYW5kbGVyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXNlIHRoaXMgdG8gcmVtb3ZlIGEgZnVuY3Rpb24gYXMgYW4gZXZlbnQgaGFuZGxlciBmb3IgdGhlIE9uU3RhZ2VDaGFuZ2UgZXZlbnQuXG4gICAgICogQHBhcmFtIGhhbmRsZXIgSWYgYW4gYW5vbnltb3VzIGZ1bmN0aW9uIGlzIHNldCB1c2luZyB0aGUgYWRkT25TdGFnZUNoYW5nZSBtZXRob2QgaXRcbiAgICAgKiAgICAgICAgICAgICAgICBjYW5ub3QgYmUgcmVtb3ZlZCB1c2luZyB0aGlzIG1ldGhvZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVtb3ZlT25TdGFnZVNlbGVjdGVkKGhhbmRsZXI6IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXIpIHtcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5yZW1vdmVPblN0YWdlU2VsZWN0ZWQoaGFuZGxlcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXNlIHRoaXMgbWV0aG9kIHRvIGFzeW5jaHJvbm91c2x5IHJldHJpZXZlIHRoZSBlbmFibGVkIGJ1c2luZXNzIHByb2Nlc3MgZmxvd3MgdGhhdCB0aGUgdXNlciBjYW4gc3dpdGNoIHRvIGZvciBhbiBlbnRpdHkuXG4gICAgICogQHJldHVybnMgcmV0dXJucyBjYWxsYmFjayByZXNwb25zZSBhcyBQcm9taXNlXG4gICAgICovXG4gICAgc3RhdGljIGdldEVuYWJsZWRQcm9jZXNzZXMoKSB7XG4gICAgICByZXR1cm4gYXNQcm9taXNlPFhybS5Qcm9jZXNzRmxvdy5Qcm9jZXNzRGljdGlvbmFyeT4oXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLmdldEVuYWJsZWRQcm9jZXNzZXMsXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzXG4gICAgICApO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFsbCBwcm9jZXNzIGluc3RhbmNlcyBmb3IgdGhlIGVudGl0eSByZWNvcmQgdGhhdCB0aGUgY2FsbGluZyB1c2VyIGhhcyBhY2Nlc3MgdG8uXG4gICAgICogQHJldHVybnMgcmV0dXJucyBjYWxsYmFjayByZXNwb25zZSBhcyBQcm9taXNlXG4gICAgICovXG4gICAgc3RhdGljIGdldFByb2Nlc3NJbnN0YW5jZXMoKSB7XG4gICAgICByZXR1cm4gYXNQcm9taXNlPFhybS5Qcm9jZXNzRmxvdy5HZXRQcm9jZXNzSW5zdGFuY2VzRGVsZWdhdGU+KFxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5nZXRQcm9jZXNzSW5zdGFuY2VzLFxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzc1xuICAgICAgKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHJvZ3Jlc3NlcyB0byB0aGUgbmV4dCBzdGFnZS5cbiAgICAgKiBAcmV0dXJucyByZXR1cm5zIGNhbGxiYWNrIHJlc3BvbnNlIGFzIFByb21pc2VcbiAgICAgKi9cbiAgICBzdGF0aWMgbW92ZU5leHQoKSB7XG4gICAgICByZXR1cm4gYXNQcm9taXNlPFhybS5Qcm9jZXNzRmxvdy5Qcm9jZXNzQ2FsbGJhY2tEZWxlZ2F0ZT4oXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLm1vdmVOZXh0LFxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzc1xuICAgICAgKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTW92ZXMgdG8gdGhlIHByZXZpb3VzIHN0YWdlLlxuICAgICAqIEByZXR1cm5zIHJldHVybnMgY2FsbGJhY2sgcmVzcG9uc2UgYXMgUHJvbWlzZVxuICAgICAqL1xuICAgIHN0YXRpYyBtb3ZlUHJldmlvdXMoKSB7XG4gICAgICByZXR1cm4gYXNQcm9taXNlPFhybS5Qcm9jZXNzRmxvdy5Qcm9jZXNzQ2FsbGJhY2tEZWxlZ2F0ZT4oXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLm1vdmVQcmV2aW91cyxcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3NcbiAgICAgICk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldCBhIFByb2Nlc3MgYXMgdGhlIGFjdGl2ZSBwcm9jZXNzLlxuICAgICAqIEBwYXJhbSBwcm9jZXNzSWQgVGhlIElkIG9mIHRoZSBwcm9jZXNzIHRvIG1ha2UgdGhlIGFjdGl2ZSBwcm9jZXNzLlxuICAgICAqIEByZXR1cm5zIHJldHVybnMgY2FsbGJhY2sgcmVzcG9uc2UgYXMgUHJvbWlzZVxuICAgICAqL1xuICAgIHN0YXRpYyBzZXRBY3RpdmVQcm9jZXNzKHByb2Nlc3NJZDogc3RyaW5nKSB7XG4gICAgICByZXR1cm4gYXNQcm9taXNlPFhybS5Qcm9jZXNzRmxvdy5Qcm9jZXNzQ2FsbGJhY2tEZWxlZ2F0ZT4oXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLnNldEFjdGl2ZVByb2Nlc3MsXG4gICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5wcm9jZXNzLFxuICAgICAgICBwcm9jZXNzSWRcbiAgICAgICk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgYSBwcm9jZXNzIGluc3RhbmNlIGFzIHRoZSBhY3RpdmUgaW5zdGFuY2VcbiAgICAgKiBAcGFyYW0gcHJvY2Vzc0luc3RhbmNlSWQgVGhlIElkIG9mIHRoZSBwcm9jZXNzIGluc3RhbmNlIHRvIG1ha2UgdGhlIGFjdGl2ZSBpbnN0YW5jZS5cbiAgICAgKiBAcmV0dXJucyByZXR1cm5zIGNhbGxiYWNrIHJlc3BvbnNlIGFzIFByb21pc2VcbiAgICAgKi9cbiAgICBzdGF0aWMgc2V0QWN0aXZlUHJvY2Vzc0luc3RhbmNlKHByb2Nlc3NJbnN0YW5jZUlkOiBzdHJpbmcpIHtcbiAgICAgIHJldHVybiBhc1Byb21pc2U8WHJtLlByb2Nlc3NGbG93LlNldFByb2Nlc3NJbnN0YW5jZURlbGVnYXRlPihcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3Muc2V0QWN0aXZlUHJvY2Vzc0luc3RhbmNlLFxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2VzcyxcbiAgICAgICAgcHJvY2Vzc0luc3RhbmNlSWRcbiAgICAgICk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldCBhIHN0YWdlIGFzIHRoZSBhY3RpdmUgc3RhZ2UuXG4gICAgICogQHBhcmFtIHN0YWdlSWQgdGhlIElkIG9mIHRoZSBzdGFnZSB0byBtYWtlIHRoZSBhY3RpdmUgc3RhZ2UuXG4gICAgICogQHJldHVybnMgcmV0dXJucyBjYWxsYmFjayByZXNwb25zZSBhcyBQcm9taXNlXG4gICAgICovXG4gICAgc3RhdGljIHNldEFjdGl2ZVN0YWdlKHN0YWdlSWQ6IHN0cmluZykge1xuICAgICAgcmV0dXJuIGFzUHJvbWlzZTxYcm0uUHJvY2Vzc0Zsb3cuU2V0UHJvY2Vzc0luc3RhbmNlRGVsZWdhdGU+KFxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2Vzcy5zZXRBY3RpdmVTdGFnZSxcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3MsXG4gICAgICAgIHN0YWdlSWRcbiAgICAgICk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVzZSB0aGlzIG1ldGhvZCB0byBzZXQgdGhlIGN1cnJlbnQgc3RhdHVzIG9mIHRoZSBwcm9jZXNzIGluc3RhbmNlXG4gICAgICogQHBhcmFtIHN0YXR1cyBUaGUgbmV3IHN0YXR1cyBmb3IgdGhlIHByb2Nlc3NcbiAgICAgKiBAcmV0dXJucyByZXR1cm5zIGNhbGxiYWNrIHJlc3BvbnNlIGFzIFByb21pc2VcbiAgICAgKi9cbiAgICBzdGF0aWMgc2V0U3RhdHVzKHN0YXR1czogWHJtLlByb2Nlc3NGbG93LlByb2Nlc3NTdGF0dXMpIHtcbiAgICAgIHJldHVybiBhc1Byb21pc2U8WHJtLlByb2Nlc3NGbG93LlNldFByb2Nlc3NJbnN0YW5jZURlbGVnYXRlPihcbiAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnByb2Nlc3Muc2V0U3RhdHVzLFxuICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEucHJvY2VzcyxcbiAgICAgICAgc3RhdHVzXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGV4cG9ydCBjbGFzcyBGaWVsZHMge1xuICAgIC8qKlxuICAgICAqIEFkZHMgYSBoYW5kbGVyIG9yIGFuIGFycmF5IG9mIGhhbmRsZXJzIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBhdHRyaWJ1dGUncyB2YWx1ZSBpcyBjaGFuZ2VkLlxuICAgICAqIEBwYXJhbSBmaWVsZHMgQW4gYXJyYXkgb2YgZmllbGRzIHRvIG9uIHdoaWNoIHRoaXMgbWV0aG9kIHNob3VsZCBiZSBhcHBsaWVkLlxuICAgICAqIEBwYXJhbSBoYW5kbGVycyBUaGUgZnVuY3Rpb24gcmVmZXJlbmNlIG9yIGFuIGFycmF5IG9mIGZ1bmN0aW9uIHJlZmVyZW5jZXMuXG4gICAgICovXG4gICAgc3RhdGljIGFkZE9uQ2hhbmdlKFxuICAgICAgZmllbGRzOiBDbGFzcy5GaWVsZFtdLFxuICAgICAgaGFuZGxlcjogWHJtLkV2ZW50cy5BdHRyaWJ1dGUuQ2hhbmdlRXZlbnRIYW5kbGVyXG4gICAgKTogdm9pZCB7XG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgZmllbGQuYWRkT25DaGFuZ2UoaGFuZGxlcik7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRmlyZSBhbGwgXCJvbiBjaGFuZ2VcIiBldmVudCBoYW5kbGVycy5cbiAgICAgKiBAcGFyYW0gZmllbGRzIEFuIGFycmF5IG9mIGZpZWxkcyB0byBvbiB3aGljaCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgYXBwbGllZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgZmlyZU9uQ2hhbmdlKGZpZWxkczogQ2xhc3MuRmllbGRbXSk6IHZvaWQge1xuICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgIGZpZWxkLmZpcmVPbkNoYW5nZSgpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIGhhbmRsZXIgZnJvbSB0aGUgXCJvbiBjaGFuZ2VcIiBldmVudC5cbiAgICAgKiBAcGFyYW0gZmllbGRzIEFuIGFycmF5IG9mIGZpZWxkcyB0byBvbiB3aGljaCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgYXBwbGllZC5cbiAgICAgKiBAcGFyYW0gaGFuZGxlciBUaGUgaGFuZGxlci5cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVtb3ZlT25DaGFuZ2UoXG4gICAgICBmaWVsZHM6IENsYXNzLkZpZWxkW10sXG4gICAgICBoYW5kbGVyOiBYcm0uRXZlbnRzLkF0dHJpYnV0ZS5DaGFuZ2VFdmVudEhhbmRsZXJcbiAgICApOiB2b2lkIHtcbiAgICAgIGZpZWxkcy5mb3JFYWNoKChmaWVsZCkgPT4ge1xuICAgICAgICBmaWVsZC5yZW1vdmVPbkNoYW5nZShoYW5kbGVyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSByZXF1aXJlZCBsZXZlbC5cbiAgICAgKiBAcGFyYW0gZmllbGRzIEFuIGFycmF5IG9mIGZpZWxkcyB0byBvbiB3aGljaCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgYXBwbGllZC5cbiAgICAgKiBAcGFyYW0gcmVxdWlyZW1lbnRMZXZlbCBUaGUgcmVxdWlyZW1lbnQgbGV2ZWwsIGFzIGVpdGhlciBcIm5vbmVcIiwgXCJyZXF1aXJlZFwiLCBvciBcInJlY29tbWVuZGVkXCJcbiAgICAgKi9cbiAgICBzdGF0aWMgc2V0UmVxdWlyZWRMZXZlbChcbiAgICAgIGZpZWxkczogQ2xhc3MuRmllbGRbXSxcbiAgICAgIHJlcXVpcmVtZW50TGV2ZWw6IFhybS5BdHRyaWJ1dGVzLlJlcXVpcmVtZW50TGV2ZWxcbiAgICApOiB2b2lkIHtcbiAgICAgIGZpZWxkcy5mb3JFYWNoKChmaWVsZCkgPT4ge1xuICAgICAgICBmaWVsZC5zZXRSZXF1aXJlZExldmVsKHJlcXVpcmVtZW50TGV2ZWwpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHN1Ym1pdCBtb2RlLlxuICAgICAqIEBwYXJhbSBmaWVsZHMgQW4gYXJyYXkgb2YgZmllbGRzIHRvIG9uIHdoaWNoIHRoaXMgbWV0aG9kIHNob3VsZCBiZSBhcHBsaWVkLlxuICAgICAqIEBwYXJhbSBzdWJtaXRNb2RlIFRoZSBzdWJtaXQgbW9kZSwgYXMgZWl0aGVyIFwiYWx3YXlzXCIsIFwibmV2ZXJcIiwgb3IgXCJkaXJ0eVwiLlxuICAgICAqIEBkZWZhdWx0IHN1Ym1pdE1vZGUgXCJkaXJ0eVwiXG4gICAgICogQHNlZSB7QGxpbmsgWHJtRW51bS5BdHRyaWJ1dGVSZXF1aXJlbWVudExldmVsfVxuICAgICAqL1xuICAgIHN0YXRpYyBzZXRTdWJtaXRNb2RlKFxuICAgICAgZmllbGRzOiBDbGFzcy5GaWVsZFtdLFxuICAgICAgc3VibWl0TW9kZTogWHJtLlN1Ym1pdE1vZGVcbiAgICApOiB2b2lkIHtcbiAgICAgIGZpZWxkcy5mb3JFYWNoKChmaWVsZCkgPT4ge1xuICAgICAgICBmaWVsZC5zZXRTdWJtaXRNb2RlKHN1Ym1pdE1vZGUpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHZhbHVlLlxuICAgICAqIEBwYXJhbSBmaWVsZHMgQW4gYXJyYXkgb2YgZmllbGRzIHRvIG9uIHdoaWNoIHRoaXMgbWV0aG9kIHNob3VsZCBiZSBhcHBsaWVkLlxuICAgICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUuXG4gICAgICogQHJlbWFya3MgQXR0cmlidXRlcyBvbiBRdWljayBDcmVhdGUgRm9ybXMgd2lsbCBub3Qgc2F2ZSB2YWx1ZXMgc2V0IHdpdGggdGhpcyBtZXRob2QuXG4gICAgICovXG4gICAgc3RhdGljIHNldFZhbHVlKGZpZWxkczogQ2xhc3MuRmllbGRbXSwgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgIGZpZWxkLnNldFZhbHVlKHZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIGEgdmFsdWUgZm9yIGEgY29sdW1uIHRvIGRldGVybWluZSB3aGV0aGVyIGl0IGlzIHZhbGlkIG9yIGludmFsaWQgd2l0aCBhIG1lc3NhZ2VcbiAgICAgKiBAcGFyYW0gZmllbGRzIEFuIGFycmF5IG9mIGZpZWxkcyB0byBvbiB3aGljaCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgYXBwbGllZC5cbiAgICAgKiBAcGFyYW0gaXNWYWxpZCBTcGVjaWZ5IGZhbHNlIHRvIHNldCB0aGUgY29sdW1uIHZhbHVlIHRvIGludmFsaWQgYW5kIHRydWUgdG8gc2V0IHRoZSB2YWx1ZSB0byB2YWxpZC5cbiAgICAgKiBAcGFyYW0gbWVzc2FnZSBUaGUgbWVzc2FnZSB0byBkaXNwbGF5LlxuICAgICAqIEBzZWUge0BsaW5rIGh0dHBzOi8vbGVhcm4ubWljcm9zb2Z0LmNvbS9lbi11cy9wb3dlci1hcHBzL2RldmVsb3Blci9tb2RlbC1kcml2ZW4tYXBwcy9jbGllbnRhcGkvcmVmZXJlbmNlL2F0dHJpYnV0ZXMvc2V0aXN2YWxpZCBFeHRlcm5hbCBMaW5rOiBzZXRJc1ZhbGlkIChDbGllbnQgQVBJIHJlZmVyZW5jZSl9XG4gICAgICovXG4gICAgc3RhdGljIHNldElzVmFsaWQoXG4gICAgICBmaWVsZHM6IENsYXNzLkZpZWxkW10sXG4gICAgICBpc1ZhbGlkOiBib29sZWFuLFxuICAgICAgbWVzc2FnZT86IHN0cmluZ1xuICAgICk6IHZvaWQge1xuICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgIGZpZWxkLnNldElzVmFsaWQoaXNWYWxpZCwgbWVzc2FnZSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgcmVxdWlyZWQgbGV2ZWwuXG4gICAgICogQHBhcmFtIGZpZWxkcyBBbiBhcnJheSBvZiBmaWVsZHMgdG8gb24gd2hpY2ggdGhpcyBtZXRob2Qgc2hvdWxkIGJlIGFwcGxpZWQuXG4gICAgICogQHBhcmFtIHJlcXVpcmVkIFRoZSByZXF1aXJlbWVudCBsZXZlbCwgYXMgZWl0aGVyIGZhbHNlIGZvciBcIm5vbmVcIiBvciB0cnVlIGZvciBcInJlcXVpcmVkXCJcbiAgICAgKi9cbiAgICBzdGF0aWMgc2V0UmVxdWlyZWQoZmllbGRzOiBDbGFzcy5GaWVsZFtdLCByZXF1aXJlZDogYm9vbGVhbik6IHZvaWQge1xuICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgIGZpZWxkLnNldFJlcXVpcmVkKHJlcXVpcmVkKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBzdGF0ZSBvZiB0aGUgY29udHJvbCB0byBlaXRoZXIgZW5hYmxlZCwgb3IgZGlzYWJsZWQuXG4gICAgICogQHBhcmFtIGZpZWxkcyBBbiBhcnJheSBvZiBmaWVsZHMgdG8gb24gd2hpY2ggdGhpcyBtZXRob2Qgc2hvdWxkIGJlIGFwcGxpZWQuXG4gICAgICogQHBhcmFtIGRpc2FibGVkIHRydWUgdG8gZGlzYWJsZSwgZmFsc2UgdG8gZW5hYmxlLlxuICAgICAqL1xuICAgIHN0YXRpYyBzZXREaXNhYmxlZChmaWVsZHM6IENsYXNzLkZpZWxkW10sIGRpc2FibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgZmllbGQuc2V0RGlzYWJsZWQoZGlzYWJsZWQpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHZpc2liaWxpdHkgc3RhdGUuXG4gICAgICogQHBhcmFtIGZpZWxkcyBBbiBhcnJheSBvZiBmaWVsZHMgdG8gb24gd2hpY2ggdGhpcyBtZXRob2Qgc2hvdWxkIGJlIGFwcGxpZWQuXG4gICAgICogQHBhcmFtIHZpc2libGUgdHJ1ZSB0byBzaG93LCBmYWxzZSB0byBoaWRlLlxuICAgICAqL1xuICAgIHN0YXRpYyBzZXRWaXNpYmxlKGZpZWxkczogQ2xhc3MuRmllbGRbXSwgdmlzaWJsZTogYm9vbGVhbik6IHZvaWQge1xuICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgIGZpZWxkLnNldFZpc2libGUodmlzaWJsZSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyBhIGNvbnRyb2wtbG9jYWwgbm90aWZpY2F0aW9uIG1lc3NhZ2UuXG4gICAgICogQHBhcmFtIGZpZWxkcyBBbiBhcnJheSBvZiBmaWVsZHMgdG8gb24gd2hpY2ggdGhpcyBtZXRob2Qgc2hvdWxkIGJlIGFwcGxpZWQuXG4gICAgICogQHBhcmFtIG1lc3NhZ2UgVGhlIG1lc3NhZ2UuXG4gICAgICogQHBhcmFtIHVuaXF1ZUlkIFVuaXF1ZSBpZGVudGlmaWVyLlxuICAgICAqIEByZXR1cm5zIHRydWUgaWYgaXQgc3VjY2VlZHMsIGZhbHNlIGlmIGl0IGZhaWxzLlxuICAgICAqIEByZW1hcmtzICAgICBXaGVuIHRoaXMgbWV0aG9kIGlzIHVzZWQgb24gTWljcm9zb2Z0IER5bmFtaWNzIENSTSBmb3IgdGFibGV0cyBhIHJlZCBcIlhcIiBpY29uXG4gICAgICogICAgICAgICAgICAgIGFwcGVhcnMgbmV4dCB0byB0aGUgY29udHJvbC4gVGFwcGluZyBvbiB0aGUgaWNvbiB3aWxsIGRpc3BsYXkgdGhlIG1lc3NhZ2UuXG4gICAgICovXG4gICAgc3RhdGljIHNldE5vdGlmaWNhdGlvbihcbiAgICAgIGZpZWxkczogQ2xhc3MuRmllbGRbXSxcbiAgICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICAgIHVuaXF1ZUlkOiBzdHJpbmdcbiAgICApOiB2b2lkIHtcbiAgICAgIGZpZWxkcy5mb3JFYWNoKChmaWVsZCkgPT4ge1xuICAgICAgICBmaWVsZC5zZXROb3RpZmljYXRpb24obWVzc2FnZSwgdW5pcXVlSWQpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERpc3BsYXlzIGFuIGVycm9yIG9yIHJlY29tbWVuZGF0aW9uIG5vdGlmaWNhdGlvbiBmb3IgYSBjb250cm9sLCBhbmQgbGV0cyB5b3Ugc3BlY2lmeSBhY3Rpb25zIHRvIGV4ZWN1dGUgYmFzZWQgb24gdGhlIG5vdGlmaWNhdGlvbi5cbiAgICAgKiBAcGFyYW0gZmllbGRzIEFuIGFycmF5IG9mIGZpZWxkcyB0byBvbiB3aGljaCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgYXBwbGllZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgYWRkTm90aWZpY2F0aW9uKFxuICAgICAgZmllbGRzOiBDbGFzcy5GaWVsZFtdLFxuICAgICAgbWVzc2FnZTogc3RyaW5nLFxuICAgICAgbm90aWZpY2F0aW9uTGV2ZWw6IFwiRVJST1JcIiB8IFwiUkVDT01NRU5EQVRJT05cIixcbiAgICAgIHVuaXF1ZUlkOiBzdHJpbmcsXG4gICAgICBhY3Rpb25zPzogWHJtLkNvbnRyb2xzLkNvbnRyb2xOb3RpZmljYXRpb25BY3Rpb25bXVxuICAgICk6IHZvaWQge1xuICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgIGZpZWxkLmFkZE5vdGlmaWNhdGlvbihtZXNzYWdlLCBub3RpZmljYXRpb25MZXZlbCwgdW5pcXVlSWQsIGFjdGlvbnMpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENsZWFycyB0aGUgbm90aWZpY2F0aW9uIGlkZW50aWZpZWQgYnkgdW5pcXVlSWQuXG4gICAgICogQHBhcmFtIGZpZWxkcyBBbiBhcnJheSBvZiBmaWVsZHMgdG8gb24gd2hpY2ggdGhpcyBtZXRob2Qgc2hvdWxkIGJlIGFwcGxpZWQuXG4gICAgICogQHBhcmFtIHVuaXF1ZUlkIChPcHRpb25hbCkgVW5pcXVlIGlkZW50aWZpZXIuXG4gICAgICogQHJldHVybnMgdHJ1ZSBpZiBpdCBzdWNjZWVkcywgZmFsc2UgaWYgaXQgZmFpbHMuXG4gICAgICogQHJlbWFya3MgSWYgdGhlIHVuaXF1ZUlkIHBhcmFtZXRlciBpcyBub3QgdXNlZCwgdGhlIGN1cnJlbnQgbm90aWZpY2F0aW9uIHNob3duIHdpbGwgYmUgcmVtb3ZlZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVtb3ZlTm90aWZpY2F0aW9uKGZpZWxkczogQ2xhc3MuRmllbGRbXSwgdW5pcXVlSWQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgIGZpZWxkLnJlbW92ZU5vdGlmaWNhdGlvbih1bmlxdWVJZCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVwcmVzZW50cyBhIGZvcm0gaW4gRHluYW1pY3MgMzY1LlxuICAgKi9cbiAgZXhwb3J0IGNsYXNzIEZvcm0ge1xuICAgIHByb3RlY3RlZCBzdGF0aWMgX2Zvcm1Db250ZXh0OiBYcm0uRm9ybUNvbnRleHQ7XG4gICAgcHJvdGVjdGVkIHN0YXRpYyBfZXhlY3V0aW9uQ29udGV4dDogWHJtLkV2ZW50cy5FdmVudENvbnRleHQ7XG4gICAgY29uc3RydWN0b3IoKSB7IH1cbiAgICAvKipHZXRzIGEgcmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IGZvcm0gY29udGV4dCovXG4gICAgc3RhdGljIGdldCBmb3JtQ29udGV4dCgpOiBYcm0uRm9ybUNvbnRleHQge1xuICAgICAgcmV0dXJuIHRoaXMuX2Zvcm1Db250ZXh0O1xuICAgIH1cbiAgICAvKipHZXRzIGEgcmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IGV4ZWN1dGlvIGNvbnRleHQqL1xuICAgIHN0YXRpYyBnZXQgZXhlY3V0aW9uQ29udGV4dCgpOiBYcm0uRXZlbnRzLkV2ZW50Q29udGV4dCB7XG4gICAgICByZXR1cm4gdGhpcy5fZXhlY3V0aW9uQ29udGV4dDtcbiAgICB9XG4gICAgLyoqR2V0cyBhIGxvb2t1cCB2YWx1ZSB0aGF0IHJlZmVyZW5jZXMgdGhlIHJlY29yZC4qL1xuICAgIHN0YXRpYyBnZXQgZW50aXR5UmVmZXJlbmNlKCkge1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5lbnRpdHkuZ2V0RW50aXR5UmVmZXJlbmNlKCk7XG4gICAgfVxuICAgIC8qKlNldHMgYSByZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgZm9ybSBjb250ZXh0Ki9cbiAgICBzdGF0aWMgc2V0IGZvcm1Db250ZXh0KGNvbnRleHQ6IFhybS5Gb3JtQ29udGV4dCB8IFhybS5FdmVudHMuRXZlbnRDb250ZXh0KSB7XG4gICAgICBpZiAoIWNvbnRleHQpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgWHJtRXguRm9ybS5zZXRGb3JtQ29udGV4dDogVGhlIGV4ZWN1dGlvbkNvbnRleHQgb3IgZm9ybUNvbnRleHQgd2FzIG5vdCBwYXNzZWQgdG8gdGhlIGZ1bmN0aW9uLmBcbiAgICAgICAgKTtcbiAgICAgIGlmIChcImdldEZvcm1Db250ZXh0XCIgaW4gY29udGV4dCkge1xuICAgICAgICB0aGlzLl9leGVjdXRpb25Db250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgdGhpcy5fZm9ybUNvbnRleHQgPSBjb250ZXh0LmdldEZvcm1Db250ZXh0KCk7XG4gICAgICB9IGVsc2UgaWYgKFwiZGF0YVwiIGluIGNvbnRleHQpIHRoaXMuX2Zvcm1Db250ZXh0ID0gY29udGV4dDtcbiAgICAgIGVsc2VcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBYcm1FeC5Gb3JtLnNldEZvcm1Db250ZXh0OiBUaGUgcGFzc2VkIGNvbnRleHQgaXMgbm90IGFuIGV4ZWN1dGlvbkNvbnRleHQgb3IgZm9ybUNvbnRleHQuYFxuICAgICAgICApO1xuICAgIH1cbiAgICAvKipTZXRzIGEgcmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IGV4ZWN1dGlvbiBjb250ZXh0Ki9cbiAgICBzdGF0aWMgc2V0IGV4ZWN1dGlvbkNvbnRleHQoXG4gICAgICBjb250ZXh0OiBYcm0uRm9ybUNvbnRleHQgfCBYcm0uRXZlbnRzLkV2ZW50Q29udGV4dFxuICAgICkge1xuICAgICAgaWYgKCFjb250ZXh0KVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFhybUV4LkZvcm0uc2V0RXhlY3V0aW9uQ29udGV4dDogVGhlIGV4ZWN1dGlvbkNvbnRleHQgb3IgZm9ybUNvbnRleHQgd2FzIG5vdCBwYXNzZWQgdG8gdGhlIGZ1bmN0aW9uLmBcbiAgICAgICAgKTtcbiAgICAgIGlmIChcImdldEZvcm1Db250ZXh0XCIgaW4gY29udGV4dCkge1xuICAgICAgICB0aGlzLl9leGVjdXRpb25Db250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgdGhpcy5fZm9ybUNvbnRleHQgPSBjb250ZXh0LmdldEZvcm1Db250ZXh0KCk7XG4gICAgICB9IGVsc2UgaWYgKFwiZGF0YVwiIGluIGNvbnRleHQpIHRoaXMuX2Zvcm1Db250ZXh0ID0gY29udGV4dDtcbiAgICAgIGVsc2VcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBYcm1FeC5Gb3JtLnNldEV4ZWN1dGlvbkNvbnRleHQ6IFRoZSBwYXNzZWQgY29udGV4dCBpcyBub3QgYW4gZXhlY3V0aW9uQ29udGV4dCBvciBmb3JtQ29udGV4dC5gXG4gICAgICAgICk7XG4gICAgfVxuICAgIC8qKlJldHVybnMgdHJ1ZSBpZiBmb3JtIGlzIGZyb20gdHlwZSBjcmVhdGUqL1xuICAgIHN0YXRpYyBnZXQgSXNDcmVhdGUoKSB7XG4gICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC51aS5nZXRGb3JtVHlwZSgpID09IDE7XG4gICAgfVxuICAgIC8qKlJldHVybnMgdHJ1ZSBpZiBmb3JtIGlzIGZyb20gdHlwZSB1cGRhdGUqL1xuICAgIHN0YXRpYyBnZXQgSXNVcGRhdGUoKSB7XG4gICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC51aS5nZXRGb3JtVHlwZSgpID09IDI7XG4gICAgfVxuICAgIC8qKlJldHVybnMgdHJ1ZSBpZiBmb3JtIGlzIG5vdCBmcm9tIHR5cGUgY3JlYXRlKi9cbiAgICBzdGF0aWMgZ2V0IElzTm90Q3JlYXRlKCkge1xuICAgICAgcmV0dXJuIEZvcm0uZm9ybUNvbnRleHQudWkuZ2V0Rm9ybVR5cGUoKSAhPSAxO1xuICAgIH1cbiAgICAvKipSZXR1cm5zIHRydWUgaWYgZm9ybSBpcyBub3QgZnJvbSB0eXBlIHVwZGF0ZSovXG4gICAgc3RhdGljIGdldCBJc05vdFVwZGF0ZSgpIHtcbiAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LnVpLmdldEZvcm1UeXBlKCkgIT0gMjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEaXNwbGF5cyBhIGZvcm0gbGV2ZWwgbm90aWZpY2F0aW9uLiBBbnkgbnVtYmVyIG9mIG5vdGlmaWNhdGlvbnMgY2FuIGJlIGRpc3BsYXllZCBhbmQgd2lsbCByZW1haW4gdW50aWwgcmVtb3ZlZCB1c2luZyBjbGVhckZvcm1Ob3RpZmljYXRpb24uXG4gICAgICogVGhlIGhlaWdodCBvZiB0aGUgbm90aWZpY2F0aW9uIGFyZWEgaXMgbGltaXRlZCBzbyBlYWNoIG5ldyBtZXNzYWdlIHdpbGwgYmUgYWRkZWQgdG8gdGhlIHRvcC5cbiAgICAgKiBAcGFyYW0gbWVzc2FnZSBUaGUgdGV4dCBvZiB0aGUgbm90aWZpY2F0aW9uIG1lc3NhZ2UuXG4gICAgICogQHBhcmFtIGxldmVsIFRoZSBsZXZlbCBvZiB0aGUgbm90aWZpY2F0aW9uIHdoaWNoIGRlZmluZXMgaG93IHRoZSBtZXNzYWdlIHdpbGwgYmUgZGlzcGxheWVkLCBzdWNoIGFzIHRoZSBpY29uLlxuICAgICAqIEVSUk9SOiBOb3RpZmljYXRpb24gd2lsbCB1c2UgdGhlIHN5c3RlbSBlcnJvciBpY29uLlxuICAgICAqIFdBUk5JTkc6IE5vdGlmaWNhdGlvbiB3aWxsIHVzZSB0aGUgc3lzdGVtIHdhcm5pbmcgaWNvbi5cbiAgICAgKiBJTkZPOiBOb3RpZmljYXRpb24gd2lsbCB1c2UgdGhlIHN5c3RlbSBpbmZvIGljb24uXG4gICAgICogQHBhcmFtIHVuaXF1ZUlkIFVuaXF1ZSBpZGVudGlmaWVyIGZvciB0aGUgbm90aWZpY2F0aW9uIHdoaWNoIGlzIHVzZWQgd2l0aCBjbGVhckZvcm1Ob3RpZmljYXRpb24gdG8gcmVtb3ZlIHRoZSBub3RpZmljYXRpb24uXG4gICAgICogQHJldHVybnMgdHJ1ZSBpZiBpdCBzdWNjZWVkcywgb3RoZW5wcndpc2UgZmFsc2UuXG4gICAgICovXG4gICAgc3RhdGljIGFkZEZvcm1Ob3RpZmljYXRpb24oXG4gICAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgICBsZXZlbDogWHJtLkZvcm1Ob3RpZmljYXRpb25MZXZlbCxcbiAgICAgIHVuaXF1ZUlkOiBzdHJpbmdcbiAgICApIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBGb3JtLmZvcm1Db250ZXh0LnVpLnNldEZvcm1Ob3RpZmljYXRpb24oXG4gICAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgICBsZXZlbCxcbiAgICAgICAgICB1bmlxdWVJZFxuICAgICAgICApO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2xlYXJzIHRoZSBmb3JtIG5vdGlmaWNhdGlvbiBkZXNjcmliZWQgYnkgdW5pcXVlSWQuXG4gICAgICogQHBhcmFtIHVuaXF1ZUlkIFVuaXF1ZSBpZGVudGlmaWVyLlxuICAgICAqIEByZXR1cm5zIFRydWUgaWYgaXQgc3VjY2VlZHMsIG90aGVyd2lzZSBmYWxzZS5cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVtb3ZlRm9ybU5vdGlmaWNhdGlvbih1bmlxdWVJZDogc3RyaW5nKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gRm9ybS5mb3JtQ29udGV4dC51aS5jbGVhckZvcm1Ob3RpZmljYXRpb24odW5pcXVlSWQpO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhIGhhbmRsZXIgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHJlY29yZCBpcyBzYXZlZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgYWRkT25TYXZlKFxuICAgICAgaGFuZGxlcnM6XG4gICAgICAgIHwgWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlclxuICAgICAgICB8IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXJbXVxuICAgICkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGhhbmRsZXJzKSkge1xuICAgICAgICAgIGhhbmRsZXJzID0gW2hhbmRsZXJzXTtcbiAgICAgICAgfVxuICAgICAgICBoYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJyR7aGFuZGxlcn0nIGlzIG5vdCBhIGZ1bmN0aW9uYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5lbnRpdHkucmVtb3ZlT25TYXZlKGhhbmRsZXIpO1xuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5lbnRpdHkuYWRkT25TYXZlKGhhbmRsZXIpO1xuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgYWZ0ZXIgdGhlIE9uU2F2ZSBpcyBjb21wbGV0ZS5cbiAgICAgKiBAcGFyYW0gaGFuZGxlciBUaGUgaGFuZGxlci5cbiAgICAgKiBAcmVtYXJrcyBBZGRlZCBpbiA5LjJcbiAgICAgKiBAc2VlIHtAbGluayBodHRwczovL2RvY3MubWljcm9zb2Z0LmNvbS9lbi11cy9wb3dlcmFwcHMvZGV2ZWxvcGVyL21vZGVsLWRyaXZlbi1hcHBzL2NsaWVudGFwaS9yZWZlcmVuY2UvZXZlbnRzL3Bvc3RzYXZlIEV4dGVybmFsIExpbms6IFBvc3RTYXZlIEV2ZW50IERvY3VtZW50YXRpb259XG4gICAgICovXG4gICAgc3RhdGljIGFkZE9uUG9zdFNhdmUoXG4gICAgICBoYW5kbGVyczpcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyXG4gICAgICAgIHwgWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlcltdXG4gICAgKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoaGFuZGxlcnMpKSB7XG4gICAgICAgICAgaGFuZGxlcnMgPSBbaGFuZGxlcnNdO1xuICAgICAgICB9XG4gICAgICAgIGhhbmRsZXJzLmZvckVhY2goKGhhbmRsZXIpID0+IHtcbiAgICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAnJHtoYW5kbGVyfScgaXMgbm90IGEgZnVuY3Rpb25gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLmVudGl0eS5yZW1vdmVPblBvc3RTYXZlKGhhbmRsZXIpO1xuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZGF0YS5lbnRpdHkuYWRkT25Qb3N0U2F2ZShoYW5kbGVyKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gZm9ybSBkYXRhIGlzIGxvYWRlZC5cbiAgICAgKiBAcGFyYW0gaGFuZGxlciBUaGUgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQgd2hlbiB0aGUgZm9ybSBkYXRhIGxvYWRzLiBUaGUgZnVuY3Rpb24gd2lsbCBiZSBhZGRlZCB0byB0aGUgYm90dG9tIG9mIHRoZSBldmVudCBoYW5kbGVyIHBpcGVsaW5lLlxuICAgICAqL1xuICAgIHN0YXRpYyBhZGRPbkxvYWQoXG4gICAgICBoYW5kbGVyczpcbiAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyXG4gICAgICAgIHwgWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlcltdXG4gICAgKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoaGFuZGxlcnMpKSB7XG4gICAgICAgICAgaGFuZGxlcnMgPSBbaGFuZGxlcnNdO1xuICAgICAgICB9XG4gICAgICAgIGhhbmRsZXJzLmZvckVhY2goKGhhbmRsZXIpID0+IHtcbiAgICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAnJHtoYW5kbGVyfScgaXMgbm90IGEgZnVuY3Rpb25gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5kYXRhLnJlbW92ZU9uTG9hZChoYW5kbGVyKTtcbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmRhdGEuYWRkT25Mb2FkKGhhbmRsZXIpO1xuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBoYW5kbGVyIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBhdHRyaWJ1dGUncyB2YWx1ZSBpcyBjaGFuZ2VkLlxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFRoZSBmdW5jdGlvbiByZWZlcmVuY2UuXG4gICAgICovXG4gICAgc3RhdGljIGFkZE9uQ2hhbmdlKFxuICAgICAgZmllbGRzOiBDbGFzcy5GaWVsZFtdLFxuICAgICAgaGFuZGxlcnM6XG4gICAgICAgIHwgWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlclxuICAgICAgICB8IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXJbXSxcbiAgICAgIGV4ZWN1dGU/OiBib29sZWFuXG4gICAgKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoaGFuZGxlcnMpKSB7XG4gICAgICAgICAgaGFuZGxlcnMgPSBbaGFuZGxlcnNdO1xuICAgICAgICB9XG4gICAgICAgIGhhbmRsZXJzLmZvckVhY2goKGhhbmRsZXIpID0+IHtcbiAgICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAnJHtoYW5kbGVyfScgaXMgbm90IGEgZnVuY3Rpb25gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgICAgICBmaWVsZC5yZW1vdmVPbkNoYW5nZShoYW5kbGVyKTtcbiAgICAgICAgICAgIGZpZWxkLmFkZE9uQ2hhbmdlKGhhbmRsZXIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGV4ZWN1dGUpIHtcbiAgICAgICAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgICAgIGZpZWxkLkF0dHJpYnV0ZS5maXJlT25DaGFuZ2UoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBleHBvcnQgbmFtZXNwYWNlIENsYXNzIHtcbiAgICAvKipcbiAgICAgKiBVc2VkIHRvIGV4ZWN1dGUgbWV0aG9kcyByZWxhdGVkIHRvIGEgc2luZ2xlIEF0dHJpYnV0ZVxuICAgICAqL1xuICAgIGV4cG9ydCBjbGFzcyBGaWVsZCBpbXBsZW1lbnRzIFhybS5BdHRyaWJ1dGVzLkF0dHJpYnV0ZSB7XG4gICAgICBwdWJsaWMgcmVhZG9ubHkgTmFtZSE6IHN0cmluZztcbiAgICAgIHByb3RlY3RlZCBfYXR0cmlidXRlPzogWHJtLkF0dHJpYnV0ZXMuQXR0cmlidXRlO1xuXG4gICAgICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGVOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5OYW1lID0gYXR0cmlidXRlTmFtZTtcbiAgICAgIH1cbiAgICAgIHNldFZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIGdldEF0dHJpYnV0ZVR5cGUoKTogWHJtLkF0dHJpYnV0ZXMuQXR0cmlidXRlVHlwZSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRBdHRyaWJ1dGVUeXBlKCk7XG4gICAgICB9XG4gICAgICBnZXRGb3JtYXQoKTogWHJtLkF0dHJpYnV0ZXMuQXR0cmlidXRlRm9ybWF0IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEZvcm1hdCgpO1xuICAgICAgfVxuICAgICAgZ2V0SXNEaXJ0eSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldElzRGlydHkoKTtcbiAgICAgIH1cbiAgICAgIGdldE5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldE5hbWUoKTtcbiAgICAgIH1cbiAgICAgIGdldFBhcmVudCgpOiBYcm0uRW50aXR5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFBhcmVudCgpO1xuICAgICAgfVxuICAgICAgZ2V0UmVxdWlyZWRMZXZlbCgpOiBYcm0uQXR0cmlidXRlcy5SZXF1aXJlbWVudExldmVsIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFJlcXVpcmVkTGV2ZWwoKTtcbiAgICAgIH1cbiAgICAgIGdldFN1Ym1pdE1vZGUoKTogWHJtLlN1Ym1pdE1vZGUge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0U3VibWl0TW9kZSgpO1xuICAgICAgfVxuICAgICAgZ2V0VXNlclByaXZpbGVnZSgpOiBYcm0uUHJpdmlsZWdlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFVzZXJQcml2aWxlZ2UoKTtcbiAgICAgIH1cbiAgICAgIHJlbW92ZU9uQ2hhbmdlKGhhbmRsZXI6IFhybS5FdmVudHMuQXR0cmlidXRlLkNoYW5nZUV2ZW50SGFuZGxlcik6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUucmVtb3ZlT25DaGFuZ2UoaGFuZGxlcik7XG4gICAgICB9XG4gICAgICBzZXRTdWJtaXRNb2RlKHN1Ym1pdE1vZGU6IFhybS5TdWJtaXRNb2RlKTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5zZXRTdWJtaXRNb2RlKHN1Ym1pdE1vZGUpO1xuICAgICAgfVxuICAgICAgZ2V0VmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRWYWx1ZSgpO1xuICAgICAgfVxuICAgICAgc2V0SXNWYWxpZChpc1ZhbGlkOiBib29sZWFuLCBtZXNzYWdlPzogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5zZXRJc1ZhbGlkKGlzVmFsaWQsIG1lc3NhZ2UpO1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgZ2V0IEF0dHJpYnV0ZSgpOiBYcm0uQXR0cmlidXRlcy5BdHRyaWJ1dGUge1xuICAgICAgICByZXR1cm4gKHRoaXMuX2F0dHJpYnV0ZSA/Pz1cbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZSh0aGlzLk5hbWUpID8/XG4gICAgICAgICAgWHJtRXgudGhyb3dFcnJvcihcbiAgICAgICAgICAgIGBUaGUgYXR0cmlidXRlICcke3RoaXMuTmFtZX0nIHdhcyBub3QgZm91bmQgb24gdGhlIGZvcm0uYFxuICAgICAgICAgICkpO1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgZ2V0IGNvbnRyb2xzKCk6IFhybS5Db2xsZWN0aW9uLkl0ZW1Db2xsZWN0aW9uPFhybS5Db250cm9scy5TdGFuZGFyZENvbnRyb2w+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmNvbnRyb2xzO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEdldHMgdGhlIHZhbHVlLlxuICAgICAgICogQHJldHVybnMgVGhlIHZhbHVlLlxuICAgICAgICovXG4gICAgICBwdWJsaWMgZ2V0IFZhbHVlKCk6IGFueSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRWYWx1ZSgpO1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgc2V0IFZhbHVlKHZhbHVlOiBhbnkpIHtcbiAgICAgICAgdGhpcy5BdHRyaWJ1dGUuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFNldHMgYSBjb250cm9sLWxvY2FsIG5vdGlmaWNhdGlvbiBtZXNzYWdlLlxuICAgICAgICogQHBhcmFtIG1lc3NhZ2UgVGhlIG1lc3NhZ2UuXG4gICAgICAgKiBAcGFyYW0gdW5pcXVlSWQgVW5pcXVlIGlkZW50aWZpZXIuXG4gICAgICAgKiBAcmV0dXJucyB0cnVlIGlmIGl0IHN1Y2NlZWRzLCBmYWxzZSBpZiBpdCBmYWlscy5cbiAgICAgICAqIEByZW1hcmtzICAgICBXaGVuIHRoaXMgbWV0aG9kIGlzIHVzZWQgb24gTWljcm9zb2Z0IER5bmFtaWNzIENSTSBmb3IgdGFibGV0cyBhIHJlZCBcIlhcIiBpY29uXG4gICAgICAgKiAgICAgICAgICAgICAgYXBwZWFycyBuZXh0IHRvIHRoZSBjb250cm9sLiBUYXBwaW5nIG9uIHRoZSBpY29uIHdpbGwgZGlzcGxheSB0aGUgbWVzc2FnZS5cbiAgICAgICAqL1xuICAgICAgcHVibGljIHNldE5vdGlmaWNhdGlvbihtZXNzYWdlOiBzdHJpbmcsIHVuaXF1ZUlkOiBzdHJpbmcpOiB0aGlzIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoIW1lc3NhZ2UpIHRocm93IG5ldyBFcnJvcihgbm8gbWVzc2FnZSB3YXMgcHJvdmlkZWQuYCk7XG4gICAgICAgICAgaWYgKCF1bmlxdWVJZCkgdGhyb3cgbmV3IEVycm9yKGBubyB1bmlxdWVJZCB3YXMgcHJvdmlkZWQuYCk7XG4gICAgICAgICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PlxuICAgICAgICAgICAgY29udHJvbC5zZXROb3RpZmljYXRpb24obWVzc2FnZSwgdW5pcXVlSWQpXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBTZXRzIHRoZSB2aXNpYmlsaXR5IHN0YXRlLlxuICAgICAgICogQHBhcmFtIHZpc2libGUgdHJ1ZSB0byBzaG93LCBmYWxzZSB0byBoaWRlLlxuICAgICAgICovXG4gICAgICBwdWJsaWMgc2V0VmlzaWJsZSh2aXNpYmxlOiBib29sZWFuKTogdGhpcyB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PiBjb250cm9sLnNldFZpc2libGUodmlzaWJsZSkpO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFNldHMgdGhlIHN0YXRlIG9mIHRoZSBjb250cm9sIHRvIGVpdGhlciBlbmFibGVkLCBvciBkaXNhYmxlZC5cbiAgICAgICAqIEBwYXJhbSBkaXNhYmxlZCB0cnVlIHRvIGRpc2FibGUsIGZhbHNlIHRvIGVuYWJsZS5cbiAgICAgICAqL1xuICAgICAgcHVibGljIHNldERpc2FibGVkKGRpc2FibGVkOiBib29sZWFuKTogdGhpcyB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PiBjb250cm9sLnNldERpc2FibGVkKGRpc2FibGVkKSk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogU2V0cyB0aGUgcmVxdWlyZWQgbGV2ZWwuXG4gICAgICAgKiBAcGFyYW0gcmVxdWlyZW1lbnRMZXZlbCBUaGUgcmVxdWlyZW1lbnQgbGV2ZWwsIGFzIGVpdGhlciBcIm5vbmVcIiwgXCJyZXF1aXJlZFwiLCBvciBcInJlY29tbWVuZGVkXCJcbiAgICAgICAqL1xuICAgICAgcHVibGljIHNldFJlcXVpcmVkTGV2ZWwoXG4gICAgICAgIHJlcXVpcmVtZW50TGV2ZWw6IFhybS5BdHRyaWJ1dGVzLlJlcXVpcmVtZW50TGV2ZWxcbiAgICAgICk6IHRoaXMge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMuQXR0cmlidXRlLnNldFJlcXVpcmVkTGV2ZWwocmVxdWlyZW1lbnRMZXZlbCk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogU2V0cyB0aGUgcmVxdWlyZWQgbGV2ZWwuXG4gICAgICAgKiBAcGFyYW0gcmVxdWlyZWQgVGhlIHJlcXVpcmVtZW50IGxldmVsLCBhcyBlaXRoZXIgZmFsc2UgZm9yIFwibm9uZVwiIG9yIHRydWUgZm9yIFwicmVxdWlyZWRcIlxuICAgICAgICovXG4gICAgICBwdWJsaWMgc2V0UmVxdWlyZWQocmVxdWlyZWQ6IGJvb2xlYW4pOiB0aGlzIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLkF0dHJpYnV0ZS5zZXRSZXF1aXJlZExldmVsKHJlcXVpcmVkID8gXCJyZXF1aXJlZFwiIDogXCJub25lXCIpO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipGaXJlIGFsbCBcIm9uIGNoYW5nZVwiIGV2ZW50IGhhbmRsZXJzLiAqL1xuICAgICAgcHVibGljIGZpcmVPbkNoYW5nZSgpOiB0aGlzIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLkF0dHJpYnV0ZS5maXJlT25DaGFuZ2UoKTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBBZGRzIGEgaGFuZGxlciBvciBhbiBhcnJheSBvZiBoYW5kbGVycyB0byBiZSBjYWxsZWQgd2hlbiB0aGUgYXR0cmlidXRlJ3MgdmFsdWUgaXMgY2hhbmdlZC5cbiAgICAgICAqIEBwYXJhbSBoYW5kbGVycyBUaGUgZnVuY3Rpb24gcmVmZXJlbmNlIG9yIGFuIGFycmF5IG9mIGZ1bmN0aW9uIHJlZmVyZW5jZXMuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBhZGRPbkNoYW5nZShcbiAgICAgICAgaGFuZGxlcnM6XG4gICAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyXG4gICAgICAgICAgfCBYcm0uRXZlbnRzLkNvbnRleHRTZW5zaXRpdmVIYW5kbGVyW11cbiAgICAgICk6IHRoaXMge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGhhbmRsZXJzKSkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBoYW5kbGVyIG9mIGhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gXCJmdW5jdGlvblwiKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJyR7aGFuZGxlcn0nIGlzIG5vdCBhIGZ1bmN0aW9uYCk7XG4gICAgICAgICAgICAgIHRoaXMuQXR0cmlidXRlLnJlbW92ZU9uQ2hhbmdlKGhhbmRsZXIpO1xuICAgICAgICAgICAgICB0aGlzLkF0dHJpYnV0ZS5hZGRPbkNoYW5nZShoYW5kbGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVycyAhPT0gXCJmdW5jdGlvblwiKVxuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCcke2hhbmRsZXJzfScgaXMgbm90IGEgZnVuY3Rpb25gKTtcbiAgICAgICAgICAgIHRoaXMuQXR0cmlidXRlLnJlbW92ZU9uQ2hhbmdlKGhhbmRsZXJzKTtcbiAgICAgICAgICAgIHRoaXMuQXR0cmlidXRlLmFkZE9uQ2hhbmdlKGhhbmRsZXJzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogRGlzcGxheXMgYW4gZXJyb3Igb3IgcmVjb21tZW5kYXRpb24gbm90aWZpY2F0aW9uIGZvciBhIGNvbnRyb2wsIGFuZCBsZXRzIHlvdSBzcGVjaWZ5IGFjdGlvbnMgdG8gZXhlY3V0ZSBiYXNlZCBvbiB0aGUgbm90aWZpY2F0aW9uLlxuICAgICAgICovXG4gICAgICBwdWJsaWMgYWRkTm90aWZpY2F0aW9uKFxuICAgICAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgICAgIG5vdGlmaWNhdGlvbkxldmVsOiBcIkVSUk9SXCIgfCBcIlJFQ09NTUVOREFUSU9OXCIsXG4gICAgICAgIHVuaXF1ZUlkOiBzdHJpbmcsXG4gICAgICAgIGFjdGlvbnM/OiBYcm0uQ29udHJvbHMuQ29udHJvbE5vdGlmaWNhdGlvbkFjdGlvbltdXG4gICAgICApOiB0aGlzIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoIXVuaXF1ZUlkKSB0aHJvdyBuZXcgRXJyb3IoYG5vIHVuaXF1ZUlkIHdhcyBwcm92aWRlZC5gKTtcbiAgICAgICAgICBpZiAoYWN0aW9ucyAmJiAhQXJyYXkuaXNBcnJheShhY3Rpb25zKSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgYHRoZSBhY3Rpb24gcGFyYW1ldGVyIGlzIG5vdCBhbiBhcnJheSBvZiBDb250cm9sTm90aWZpY2F0aW9uQWN0aW9uYFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB0aGlzLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2wpID0+IHtcbiAgICAgICAgICAgIGNvbnRyb2wuYWRkTm90aWZpY2F0aW9uKHtcbiAgICAgICAgICAgICAgbWVzc2FnZXM6IFttZXNzYWdlXSxcbiAgICAgICAgICAgICAgbm90aWZpY2F0aW9uTGV2ZWw6IG5vdGlmaWNhdGlvbkxldmVsLFxuICAgICAgICAgICAgICB1bmlxdWVJZDogdW5pcXVlSWQsXG4gICAgICAgICAgICAgIGFjdGlvbnM6IGFjdGlvbnMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICogQ2xlYXJzIHRoZSBub3RpZmljYXRpb24gaWRlbnRpZmllZCBieSB1bmlxdWVJZC5cbiAgICAgICAqIEBwYXJhbSB1bmlxdWVJZCAoT3B0aW9uYWwpIFVuaXF1ZSBpZGVudGlmaWVyLlxuICAgICAgICogQHJldHVybnMgdHJ1ZSBpZiBpdCBzdWNjZWVkcywgZmFsc2UgaWYgaXQgZmFpbHMuXG4gICAgICAgKiBAcmVtYXJrcyBJZiB0aGUgdW5pcXVlSWQgcGFyYW1ldGVyIGlzIG5vdCB1c2VkLCB0aGUgY3VycmVudCBub3RpZmljYXRpb24gc2hvd24gd2lsbCBiZSByZW1vdmVkLlxuICAgICAgICovXG4gICAgICByZW1vdmVOb3RpZmljYXRpb24odW5pcXVlSWQ6IHN0cmluZyk6IHRoaXMge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMuY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT4ge1xuICAgICAgICAgICAgY29udHJvbC5jbGVhck5vdGlmaWNhdGlvbih1bmlxdWVJZCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGV4cG9ydCBjbGFzcyBUZXh0RmllbGRcbiAgICAgIGV4dGVuZHMgRmllbGRcbiAgICAgIGltcGxlbWVudHMgWHJtLkF0dHJpYnV0ZXMuU3RyaW5nQXR0cmlidXRlIHtcbiAgICAgIHByb3RlY3RlZCBkZWNsYXJlIF9hdHRyaWJ1dGU6IFhybS5BdHRyaWJ1dGVzLlN0cmluZ0F0dHJpYnV0ZTtcbiAgICAgIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZTogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKGF0dHJpYnV0ZSk7XG4gICAgICB9XG4gICAgICBnZXRNYXhMZW5ndGgoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldE1heExlbmd0aCgpO1xuICAgICAgfVxuICAgICAgZ2V0Rm9ybWF0KCk6IFhybS5BdHRyaWJ1dGVzLlN0cmluZ0F0dHJpYnV0ZUZvcm1hdCB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRGb3JtYXQoKSBhcyBYcm0uQXR0cmlidXRlcy5TdHJpbmdBdHRyaWJ1dGVGb3JtYXQ7XG4gICAgICB9XG4gICAgICBnZXQgQXR0cmlidXRlKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuX2F0dHJpYnV0ZSA/Pz1cbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZSh0aGlzLk5hbWUpID8/XG4gICAgICAgICAgWHJtRXgudGhyb3dFcnJvcihgRmllbGQgJyR7dGhpcy5OYW1lfScgZG9lcyBub3QgZXhpc3RgKSk7XG4gICAgICB9XG4gICAgICBnZXQgY29udHJvbHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5jb250cm9scztcbiAgICAgIH1cbiAgICAgIGdldCBWYWx1ZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0VmFsdWUoKSA/PyBudWxsO1xuICAgICAgfVxuICAgICAgc2V0IFZhbHVlKHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5BdHRyaWJ1dGUuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBleHBvcnQgY2xhc3MgTnVtYmVyRmllbGRcbiAgICAgIGV4dGVuZHMgRmllbGRcbiAgICAgIGltcGxlbWVudHMgWHJtLkF0dHJpYnV0ZXMuTnVtYmVyQXR0cmlidXRlIHtcbiAgICAgIHByb3RlY3RlZCBkZWNsYXJlIF9hdHRyaWJ1dGU6IFhybS5BdHRyaWJ1dGVzLk51bWJlckF0dHJpYnV0ZTtcbiAgICAgIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZTogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKGF0dHJpYnV0ZSk7XG4gICAgICB9XG4gICAgICBnZXRGb3JtYXQoKTogWHJtLkF0dHJpYnV0ZXMuSW50ZWdlckF0dHJpYnV0ZUZvcm1hdCB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRGb3JtYXQoKSBhcyBYcm0uQXR0cmlidXRlcy5JbnRlZ2VyQXR0cmlidXRlRm9ybWF0O1xuICAgICAgfVxuICAgICAgZ2V0TWF4KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRNYXgoKTtcbiAgICAgIH1cbiAgICAgIGdldE1pbigpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0TWluKCk7XG4gICAgICB9XG4gICAgICBnZXRQcmVjaXNpb24oKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFByZWNpc2lvbigpO1xuICAgICAgfVxuICAgICAgc2V0UHJlY2lzaW9uKHByZWNpc2lvbjogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5zZXRQcmVjaXNpb24ocHJlY2lzaW9uKTtcbiAgICAgIH1cbiAgICAgIGdldCBBdHRyaWJ1dGUoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5fYXR0cmlidXRlID8/PVxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKHRoaXMuTmFtZSkgPz9cbiAgICAgICAgICBYcm1FeC50aHJvd0Vycm9yKGBGaWVsZCAnJHt0aGlzLk5hbWV9JyBkb2VzIG5vdCBleGlzdGApKTtcbiAgICAgIH1cbiAgICAgIGdldCBjb250cm9scygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmNvbnRyb2xzO1xuICAgICAgfVxuICAgICAgZ2V0IFZhbHVlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRWYWx1ZSgpID8/IG51bGw7XG4gICAgICB9XG4gICAgICBzZXQgVmFsdWUodmFsdWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGV4cG9ydCBjbGFzcyBEYXRlRmllbGRcbiAgICAgIGV4dGVuZHMgRmllbGRcbiAgICAgIGltcGxlbWVudHMgWHJtLkF0dHJpYnV0ZXMuRGF0ZUF0dHJpYnV0ZSB7XG4gICAgICBwcm90ZWN0ZWQgZGVjbGFyZSBfYXR0cmlidXRlOiBYcm0uQXR0cmlidXRlcy5EYXRlQXR0cmlidXRlO1xuICAgICAgY29uc3RydWN0b3IoYXR0cmlidXRlOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoYXR0cmlidXRlKTtcbiAgICAgIH1cbiAgICAgIGdldEZvcm1hdCgpOiBYcm0uQXR0cmlidXRlcy5EYXRlQXR0cmlidXRlRm9ybWF0IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldEZvcm1hdCgpIGFzIFhybS5BdHRyaWJ1dGVzLkRhdGVBdHRyaWJ1dGVGb3JtYXQ7XG4gICAgICB9XG4gICAgICBnZXQgQXR0cmlidXRlKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuX2F0dHJpYnV0ZSA/Pz1cbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZSh0aGlzLk5hbWUpID8/XG4gICAgICAgICAgWHJtRXgudGhyb3dFcnJvcihgRmllbGQgJyR7dGhpcy5OYW1lfScgZG9lcyBub3QgZXhpc3RgKSk7XG4gICAgICB9XG4gICAgICBnZXQgY29udHJvbHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5jb250cm9scztcbiAgICAgIH1cbiAgICAgIGdldCBWYWx1ZSgpOiBEYXRlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFZhbHVlKCkgPz8gbnVsbDtcbiAgICAgIH1cbiAgICAgIHNldCBWYWx1ZSh2YWx1ZTogRGF0ZSkge1xuICAgICAgICB0aGlzLkF0dHJpYnV0ZS5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGV4cG9ydCBjbGFzcyBCb29sZWFuRmllbGRcbiAgICAgIGV4dGVuZHMgRmllbGRcbiAgICAgIGltcGxlbWVudHMgWHJtLkF0dHJpYnV0ZXMuQm9vbGVhbkF0dHJpYnV0ZSB7XG4gICAgICBwcm90ZWN0ZWQgZGVjbGFyZSBfYXR0cmlidXRlOiBYcm0uQXR0cmlidXRlcy5Cb29sZWFuQXR0cmlidXRlO1xuICAgICAgY29uc3RydWN0b3IoYXR0cmlidXRlOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoYXR0cmlidXRlKTtcbiAgICAgIH1cbiAgICAgIGdldEF0dHJpYnV0ZVR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRBdHRyaWJ1dGVUeXBlKCk7XG4gICAgICB9XG4gICAgICBnZXRJbml0aWFsVmFsdWUoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRJbml0aWFsVmFsdWUoKTtcbiAgICAgIH1cbiAgICAgIGdldCBBdHRyaWJ1dGUoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5fYXR0cmlidXRlID8/PVxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKHRoaXMuTmFtZSkgPz9cbiAgICAgICAgICBYcm1FeC50aHJvd0Vycm9yKGBGaWVsZCAnJHt0aGlzLk5hbWV9JyBkb2VzIG5vdCBleGlzdGApKTtcbiAgICAgIH1cbiAgICAgIGdldCBjb250cm9scygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmNvbnRyb2xzO1xuICAgICAgfVxuICAgICAgZ2V0IFZhbHVlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0VmFsdWUoKSA/PyBudWxsO1xuICAgICAgfVxuICAgICAgc2V0IFZhbHVlKHZhbHVlOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZXhwb3J0IGNsYXNzIE11bHRpU2VsZWN0T3B0aW9uU2V0RmllbGQ8T3B0aW9ucyBleHRlbmRzIE9wdGlvblZhbHVlcz5cbiAgICAgIGV4dGVuZHMgRmllbGRcbiAgICAgIGltcGxlbWVudHMgWHJtLkF0dHJpYnV0ZXMuTXVsdGlTZWxlY3RPcHRpb25TZXRBdHRyaWJ1dGUge1xuICAgICAgcHJvdGVjdGVkIGRlY2xhcmUgX2F0dHJpYnV0ZTogWHJtLkF0dHJpYnV0ZXMuTXVsdGlTZWxlY3RPcHRpb25TZXRBdHRyaWJ1dGU7XG4gICAgICBPcHRpb246IE9wdGlvbnM7XG4gICAgICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsIG9wdGlvbj86IE9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIoYXR0cmlidXRlTmFtZSk7XG4gICAgICAgIHRoaXMuT3B0aW9uID0gb3B0aW9uO1xuICAgICAgfVxuICAgICAgZ2V0Rm9ybWF0KCk6IFhybS5BdHRyaWJ1dGVzLk9wdGlvblNldEF0dHJpYnV0ZUZvcm1hdCB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRGb3JtYXQoKSBhcyBYcm0uQXR0cmlidXRlcy5PcHRpb25TZXRBdHRyaWJ1dGVGb3JtYXQ7XG4gICAgICB9XG4gICAgICBnZXRPcHRpb24odmFsdWU6IG51bWJlciB8IHN0cmluZyk6IFhybS5PcHRpb25TZXRWYWx1ZSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0T3B0aW9uKHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0T3B0aW9uKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZ2V0T3B0aW9ucygpOiBYcm0uT3B0aW9uU2V0VmFsdWVbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRPcHRpb25zKCk7XG4gICAgICB9XG4gICAgICBnZXRTZWxlY3RlZE9wdGlvbigpOiBYcm0uT3B0aW9uU2V0VmFsdWVbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRTZWxlY3RlZE9wdGlvbigpO1xuICAgICAgfVxuICAgICAgZ2V0VGV4dCgpOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRUZXh0KCk7XG4gICAgICB9XG4gICAgICBnZXRJbml0aWFsVmFsdWUoKTogbnVtYmVyW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0SW5pdGlhbFZhbHVlKCk7XG4gICAgICB9XG4gICAgICBnZXQgQXR0cmlidXRlKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuX2F0dHJpYnV0ZSA/Pz1cbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZSh0aGlzLk5hbWUpID8/XG4gICAgICAgICAgWHJtRXgudGhyb3dFcnJvcihgRmllbGQgJyR7dGhpcy5OYW1lfScgZG9lcyBub3QgZXhpc3RgKSk7XG4gICAgICB9XG4gICAgICBnZXQgY29udHJvbHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5jb250cm9scztcbiAgICAgIH1cbiAgICAgIGdldCBWYWx1ZSgpOiBudW1iZXJbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRWYWx1ZSgpO1xuICAgICAgfVxuICAgICAgc2V0IFZhbHVlKHZhbHVlOiAoa2V5b2YgT3B0aW9ucylbXSB8IG51bWJlcltdKSB7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkgdGhpcy5BdHRyaWJ1dGUuc2V0VmFsdWUobnVsbCk7XG4gICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgbGV0IHZhbHVlcyA9IFtdO1xuICAgICAgICAgIHZhbHVlLmZvckVhY2goKHYpID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdiA9PSBcIm51bWJlclwiKSB2YWx1ZXMucHVzaCh2KTtcbiAgICAgICAgICAgIGVsc2UgdmFsdWVzLnB1c2godGhpcy5PcHRpb25bdl0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKHZhbHVlcyk7XG4gICAgICAgIH0gZWxzZSBYcm1FeC50aHJvd0Vycm9yKGBGaWVsZCBWYWx1ZSAnJHt2YWx1ZX0nIGlzIG5vdCBhbiBBcnJheWApO1xuICAgICAgfVxuICAgIH1cbiAgICBleHBvcnQgY2xhc3MgTG9va3VwRmllbGRcbiAgICAgIGV4dGVuZHMgRmllbGRcbiAgICAgIGltcGxlbWVudHMgWHJtLkF0dHJpYnV0ZXMuTG9va3VwQXR0cmlidXRlIHtcbiAgICAgIHByb3RlY3RlZCBkZWNsYXJlIF9hdHRyaWJ1dGU6IFhybS5BdHRyaWJ1dGVzLkxvb2t1cEF0dHJpYnV0ZTtcbiAgICAgIHByb3RlY3RlZCBfY3VzdG9tRmlsdGVyczogYW55ID0gW107XG4gICAgICBwcml2YXRlIHZpZXdJZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG4gICAgICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGU6IHN0cmluZykge1xuICAgICAgICBzdXBlcihhdHRyaWJ1dGUpO1xuICAgICAgfVxuICAgICAgZ2V0SXNQYXJ0eUxpc3QoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRJc1BhcnR5TGlzdCgpO1xuICAgICAgfVxuICAgICAgZ2V0IEF0dHJpYnV0ZSgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl9hdHRyaWJ1dGUgPz89XG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUodGhpcy5OYW1lKSA/P1xuICAgICAgICAgIFhybUV4LnRocm93RXJyb3IoYEZpZWxkICcke3RoaXMuTmFtZX0nIGRvZXMgbm90IGV4aXN0YCkpO1xuICAgICAgfVxuICAgICAgZ2V0IGNvbnRyb2xzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuY29udHJvbHM7XG4gICAgICB9XG4gICAgICAvKipHZXRzIHRoZSBpZCBvZiB0aGUgZmlyc3QgbG9va3VwIHZhbHVlKi9cbiAgICAgIGdldCBJZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuVmFsdWUgJiYgdGhpcy5WYWx1ZS5sZW5ndGggPiAwXG4gICAgICAgICAgPyBYcm1FeC5ub3JtYWxpemVHdWlkKHRoaXMuVmFsdWVbMF0uaWQpXG4gICAgICAgICAgOiBudWxsO1xuICAgICAgfVxuICAgICAgLyoqR2V0cyB0aGUgZW50aXR5VHlwZSBvZiB0aGUgZmlyc3QgbG9va3VwIHZhbHVlKi9cbiAgICAgIGdldCBFbnRpdHlUeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5WYWx1ZSAmJiB0aGlzLlZhbHVlLmxlbmd0aCA+IDBcbiAgICAgICAgICA/IHRoaXMuVmFsdWVbMF0uZW50aXR5VHlwZVxuICAgICAgICAgIDogbnVsbDtcbiAgICAgIH1cbiAgICAgIC8qKkdldHMgdGhlIGZvcm1hdHRlZCB2YWx1ZSBvZiB0aGUgZmlyc3QgbG9va3VwIHZhbHVlKi9cbiAgICAgIGdldCBGb3JtYXR0ZWRWYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuVmFsdWUgJiYgdGhpcy5WYWx1ZS5sZW5ndGggPiAwID8gdGhpcy5WYWx1ZVswXS5uYW1lIDogbnVsbDtcbiAgICAgIH1cbiAgICAgIGdldCBWYWx1ZSgpOiBYcm0uTG9va3VwVmFsdWVbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRWYWx1ZSgpID8/IG51bGw7XG4gICAgICB9XG4gICAgICBzZXQgVmFsdWUodmFsdWU6IFhybS5Mb29rdXBWYWx1ZVtdKSB7XG4gICAgICAgIHRoaXMuQXR0cmlidXRlLnNldFZhbHVlKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICogU2V0cyB0aGUgdmFsdWUgb2YgYSBsb29rdXBcbiAgICAgICAqIEBwYXJhbSBpZCBHdWlkIG9mIHRoZSByZWNvcmRcbiAgICAgICAqIEBwYXJhbSBlbnRpdHlUeXBlIGxvZ2ljYWxuYW1lIG9mIHRoZSBlbnRpdHlcbiAgICAgICAqIEBwYXJhbSBuYW1lIGZvcm1hdHRlZCB2YWx1ZVxuICAgICAgICogQHBhcmFtIGFwcGVuZCBpZiB0cnVlLCBhZGRzIHZhbHVlIHRvIHRoZSBhcnJheSBpbnN0ZWFkIG9mIHJlcGxhY2luZyBpdFxuICAgICAgICovXG4gICAgICBzZXRMb29rdXBWYWx1ZShcbiAgICAgICAgaWQ6IHN0cmluZyxcbiAgICAgICAgZW50aXR5VHlwZTogYW55LFxuICAgICAgICBuYW1lOiBhbnksXG4gICAgICAgIGFwcGVuZCA9IGZhbHNlXG4gICAgICApOiB0aGlzIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoIWlkKSB0aHJvdyBuZXcgRXJyb3IoYG5vIGlkIHBhcmFtZXRlciB3YXMgcHJvdmlkZWQuYCk7XG4gICAgICAgICAgaWYgKCFlbnRpdHlUeXBlKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBubyBlbnRpdHlUeXBlIHBhcmFtZXRlciB3YXMgcHJvdmlkZWQuYCk7XG4gICAgICAgICAgaWQgPSBYcm1FeC5ub3JtYWxpemVHdWlkKGlkKTtcbiAgICAgICAgICBjb25zdCBsb29rdXBWYWx1ZSA9IHtcbiAgICAgICAgICAgIGlkLFxuICAgICAgICAgICAgZW50aXR5VHlwZSxcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgfTtcbiAgICAgICAgICB0aGlzLlZhbHVlID1cbiAgICAgICAgICAgIGFwcGVuZCAmJiB0aGlzLlZhbHVlXG4gICAgICAgICAgICAgID8gdGhpcy5WYWx1ZS5jb25jYXQobG9va3VwVmFsdWUpXG4gICAgICAgICAgICAgIDogW2xvb2t1cFZhbHVlXTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICogU2V0cyBhIGxvb2t1cCB3aXRoIGEgbG9va3VwIGZyb20gdGhlIHJldHJpZXZlZCByZWNvcmQuXG4gICAgICAgKiBAcGFyYW0gc2VsZWN0TmFtZVxuICAgICAgICogQHBhcmFtIHJldHJpZXZlZFJlY29yZFxuICAgICAgICogQGV4YW1wbGVcbiAgICAgICAqIHZhciBjb250YWN0ID0gYXdhaXQgZmllbGRzLkNvbnRhY3QucmV0cmlldmUoJz8kc2VsZWN0PV9wYXJlbnRjdXN0b21lcmlkX3ZhbHVlJyk7XG4gICAgICAgKiBmaWVsZHMuQWNjb3VudC5zZXRMb29rdXBGcm9tUmV0cmlldmUoJ19wYXJlbnRjdXN0b21lcmlkX3ZhbHVlJywgY29udGFjdCk7XG4gICAgICAgKiAvL0FsdGVybmF0ZVxuICAgICAgICogZmllbGRzLkFjY291bnQuc2V0TG9va3VwRnJvbVJldHJpZXZlKCdwYXJlbnRjdXN0b21lcmlkJywgY29udGFjdCk7XG4gICAgICAgKi9cbiAgICAgIHNldExvb2t1cEZyb21SZXRyaWV2ZShcbiAgICAgICAgc2VsZWN0TmFtZTogc3RyaW5nLFxuICAgICAgICByZXRyaWV2ZWRSZWNvcmQ6IHsgW3g6IHN0cmluZ106IGFueSB9XG4gICAgICApIHtcbiAgICAgICAgaWYgKCFzZWxlY3ROYW1lLmVuZHNXaXRoKFwiX3ZhbHVlXCIpKSBzZWxlY3ROYW1lID0gYF8ke3NlbGVjdE5hbWV9X3ZhbHVlYDtcbiAgICAgICAgaWYgKCFyZXRyaWV2ZWRSZWNvcmQgfHwgIXJldHJpZXZlZFJlY29yZFtgJHtzZWxlY3ROYW1lfWBdKSB7XG4gICAgICAgICAgdGhpcy5WYWx1ZSA9IG51bGw7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuVmFsdWUgPSBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgaWQ6IHJldHJpZXZlZFJlY29yZFtgJHtzZWxlY3ROYW1lfWBdLFxuICAgICAgICAgICAgZW50aXR5VHlwZTpcbiAgICAgICAgICAgICAgcmV0cmlldmVkUmVjb3JkW1xuICAgICAgICAgICAgICBgJHtzZWxlY3ROYW1lfUBNaWNyb3NvZnQuRHluYW1pY3MuQ1JNLmxvb2t1cGxvZ2ljYWxuYW1lYFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmFtZTogcmV0cmlldmVkUmVjb3JkW1xuICAgICAgICAgICAgICBgJHtzZWxlY3ROYW1lfUBPRGF0YS5Db21tdW5pdHkuRGlzcGxheS5WMS5Gb3JtYXR0ZWRWYWx1ZWBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXTtcbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICogUmV0cmlldmVzIGFuIGVudGl0eSByZWNvcmQuXG4gICAgICAgKiBAcGFyYW0gb3B0aW9ucyAoT3B0aW9uYWwpIE9EYXRhIHN5c3RlbSBxdWVyeSBvcHRpb25zLCAkc2VsZWN0IGFuZCAkZXhwYW5kLCB0byByZXRyaWV2ZSB5b3VyIGRhdGEuXG4gICAgICAgKiAtIFVzZSB0aGUgJHNlbGVjdCBzeXN0ZW0gcXVlcnkgb3B0aW9uIHRvIGxpbWl0IHRoZSBwcm9wZXJ0aWVzIHJldHVybmVkIGJ5IGluY2x1ZGluZyBhIGNvbW1hLXNlcGFyYXRlZFxuICAgICAgICogICBsaXN0IG9mIHByb3BlcnR5IG5hbWVzLiBUaGlzIGlzIGFuIGltcG9ydGFudCBwZXJmb3JtYW5jZSBiZXN0IHByYWN0aWNlLiBJZiBwcm9wZXJ0aWVzIGFyZW7igJl0XG4gICAgICAgKiAgIHNwZWNpZmllZCB1c2luZyAkc2VsZWN0LCBhbGwgcHJvcGVydGllcyB3aWxsIGJlIHJldHVybmVkLlxuICAgICAgICogLSBVc2UgdGhlICRleHBhbmQgc3lzdGVtIHF1ZXJ5IG9wdGlvbiB0byBjb250cm9sIHdoYXQgZGF0YSBmcm9tIHJlbGF0ZWQgZW50aXRpZXMgaXMgcmV0dXJuZWQuIElmIHlvdVxuICAgICAgICogICBqdXN0IGluY2x1ZGUgdGhlIG5hbWUgb2YgdGhlIG5hdmlnYXRpb24gcHJvcGVydHksIHlvdeKAmWxsIHJlY2VpdmUgYWxsIHRoZSBwcm9wZXJ0aWVzIGZvciByZWxhdGVkXG4gICAgICAgKiAgIHJlY29yZHMuIFlvdSBjYW4gbGltaXQgdGhlIHByb3BlcnRpZXMgcmV0dXJuZWQgZm9yIHJlbGF0ZWQgcmVjb3JkcyB1c2luZyB0aGUgJHNlbGVjdCBzeXN0ZW0gcXVlcnlcbiAgICAgICAqICAgb3B0aW9uIGluIHBhcmVudGhlc2VzIGFmdGVyIHRoZSBuYXZpZ2F0aW9uIHByb3BlcnR5IG5hbWUuIFVzZSB0aGlzIGZvciBib3RoIHNpbmdsZS12YWx1ZWQgYW5kXG4gICAgICAgKiAgIGNvbGxlY3Rpb24tdmFsdWVkIG5hdmlnYXRpb24gcHJvcGVydGllcy5cbiAgICAgICAqIC0gWW91IGNhbiBhbHNvIHNwZWNpZnkgbXVsdGlwbGUgcXVlcnkgb3B0aW9ucyBieSB1c2luZyAmIHRvIHNlcGFyYXRlIHRoZSBxdWVyeSBvcHRpb25zLlxuICAgICAgICogQGV4YW1wbGUgPGNhcHRpb24+b3B0aW9ucyBleGFtcGxlOjwvY2FwdGlvbj5cbiAgICAgICAqIG9wdGlvbnM6ICRzZWxlY3Q9bmFtZSYkZXhwYW5kPXByaW1hcnljb250YWN0aWQoJHNlbGVjdD1jb250YWN0aWQsZnVsbG5hbWUpXG4gICAgICAgKiBAcmV0dXJucyBPbiBzdWNjZXNzLCByZXR1cm5zIGEgcHJvbWlzZSBjb250YWluaW5nIGEgSlNPTiBvYmplY3Qgd2l0aCB0aGUgcmV0cmlldmVkIGF0dHJpYnV0ZXMgYW5kIHRoZWlyIHZhbHVlcy5cbiAgICAgICAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZG9jcy5taWNyb3NvZnQuY29tL2VuLXVzL2R5bmFtaWNzMzY1L2N1c3RvbWVyLWVuZ2FnZW1lbnQvZGV2ZWxvcGVyL2NsaWVudGFwaS9yZWZlcmVuY2UveHJtLXdlYmFwaS9yZXRyaWV2ZXJlY29yZCBFeHRlcm5hbCBMaW5rOiByZXRyaWV2ZVJlY29yZCAoQ2xpZW50IEFQSSByZWZlcmVuY2UpfVxuICAgICAgICovXG4gICAgICBhc3luYyByZXRyaWV2ZShvcHRpb25zOiBzdHJpbmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoIXRoaXMuSWQgfHwgIXRoaXMuRW50aXR5VHlwZSkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgY29uc3QgcmVjb3JkID0gYXdhaXQgWHJtLldlYkFwaS5yZXRyaWV2ZVJlY29yZChcbiAgICAgICAgICAgIHRoaXMuRW50aXR5VHlwZSxcbiAgICAgICAgICAgIHRoaXMuSWQsXG4gICAgICAgICAgICBvcHRpb25zXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gcmVjb3JkO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLyoqXG4gICAgICAgKiBBZGRzIGFuIGFkZGl0aW9uYWwgY3VzdG9tIGZpbHRlciB0byB0aGUgbG9va3VwLCB3aXRoIHRoZSBcIkFORFwiIGZpbHRlciBvcGVyYXRvci5cbiAgICAgICAqIEBwYXJhbSBmaWx0ZXIgU3BlY2lmaWVzIHRoZSBmaWx0ZXIsIGFzIGEgc2VyaWFsaXplZCBGZXRjaFhNTCBcImZpbHRlclwiIG5vZGUuXG4gICAgICAgKiBAcGFyYW0gZW50aXR5TG9naWNhbE5hbWUgKE9wdGlvbmFsKSBUaGUgbG9naWNhbCBuYW1lIG9mIHRoZSBlbnRpdHkuXG4gICAgICAgKiBAcmVtYXJrcyAgICAgSWYgZW50aXR5TG9naWNhbE5hbWUgaXMgbm90IHNwZWNpZmllZCwgdGhlIGZpbHRlciB3aWxsIGJlIGFwcGxpZWQgdG8gYWxsIGVudGl0aWVzXG4gICAgICAgKiAgICAgICAgICAgICAgdmFsaWQgZm9yIHRoZSBMb29rdXAgY29udHJvbC5cbiAgICAgICAqIEBleGFtcGxlICAgICBFeGFtcGxlIGZpbHRlcjogPGZpbHRlciB0eXBlPVwiYW5kXCI+XG4gICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwiYWRkcmVzczFfY2l0eVwiIG9wZXJhdG9yPVwiZXFcIiB2YWx1ZT1cIlJlZG1vbmRcIiAvPlxuICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2ZpbHRlcj5cbiAgICAgICAqL1xuICAgICAgYWRkUHJlRmlsdGVyVG9Mb29rdXAoXG4gICAgICAgIGZpbHRlclhtbDogc3RyaW5nLFxuICAgICAgICBlbnRpdHlMb2dpY2FsTmFtZT86IHN0cmluZ1xuICAgICAgKTogdGhpcyB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgX2FkZEN1c3RvbUZpbHRlci5jb250cm9scyA9IHRoaXMuY29udHJvbHM7XG4gICAgICAgICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PiB7XG4gICAgICAgICAgICBjb250cm9sLmFkZFByZVNlYXJjaChfYWRkQ3VzdG9tRmlsdGVyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLl9jdXN0b21GaWx0ZXJzLnB1c2goX2FkZEN1c3RvbUZpbHRlcik7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gX2FkZEN1c3RvbUZpbHRlcigpIHtcbiAgICAgICAgICBfYWRkQ3VzdG9tRmlsdGVyLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2wpID0+IHtcbiAgICAgICAgICAgIGNvbnRyb2wuYWRkQ3VzdG9tRmlsdGVyKGZpbHRlclhtbCwgZW50aXR5TG9naWNhbE5hbWUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvKipcbiAgICAgICAqIEBkZXByZWNhdGVkIFVzZSB7QGxpbmsgTG9va3VwRmllbGQuYWRkQ3VzdG9tVmlld30gaW5zdGVhZCwgd2hpY2ggcHJvdmlkZXMgbW9yZSBmbGV4aWJsZSBmaWx0ZXJpbmcgY2FwYWJpbGl0aWVzIGFuZCBiZXR0ZXIgcGVyZm9ybWFuY2VcbiAgICAgICAqIEFkZHMgYW4gYWRkaXRpb25hbCBjdXN0b20gZmlsdGVyIHRvIHRoZSBsb29rdXAsIHdpdGggdGhlIFwiQU5EXCIgZmlsdGVyIG9wZXJhdG9yLlxuICAgICAgICogQHBhcmFtIGVudGl0eUxvZ2ljYWxOYW1lIChPcHRpb25hbCkgVGhlIGxvZ2ljYWwgbmFtZSBvZiB0aGUgZW50aXR5LlxuICAgICAgICogQHBhcmFtIHByaW1hcnlBdHRyaWJ1dGVJZE5hbWUgKE9wdGlvbmFsKSBUaGUgbG9naWNhbCBuYW1lIG9mIHRoZSBwcmltYXJ5IGtleS5cbiAgICAgICAqIEBwYXJhbSBmZXRjaFhtbCBTcGVjaWZpZXMgdGhlIEZldGNoWE1MIHVzZWQgdG8gZmlsdGVyLlxuICAgICAgICogQHJlbWFya3MgICAgIElmIGVudGl0eUxvZ2ljYWxOYW1lIGlzIG5vdCBzcGVjaWZpZWQsIHRoZSBmaWx0ZXIgd2lsbCBiZSBhcHBsaWVkIHRvIGFsbCBlbnRpdGllc1xuICAgICAgICogICAgICAgICAgICAgIHZhbGlkIGZvciB0aGUgTG9va3VwIGNvbnRyb2wuXG4gICAgICAgKiBAZXhhbXBsZSAgICAgRXhhbXBsZSBmZXRjaFhtbDogPGZldGNoPlxuICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZW50aXR5IG5hbWU9XCJjb250YWN0XCI+XG4gICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZmlsdGVyPlxuICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCJhZGRyZXNzMV9jaXR5XCIgb3BlcmF0b3I9XCJlcVwiIHZhbHVlPVwiUmVkbW9uZFwiIC8+XG4gICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2ZpbHRlcj5cbiAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9lbnRpdHk+XG4gICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZmV0Y2g+XG4gICAgICAgKi9cbiAgICAgIGFzeW5jIGFkZFByZUZpbHRlclRvTG9va3VwQWR2YW5jZWQoXG4gICAgICAgIGVudGl0eUxvZ2ljYWxOYW1lOiBzdHJpbmcsXG4gICAgICAgIHByaW1hcnlBdHRyaWJ1dGVJZE5hbWU6IHN0cmluZyxcbiAgICAgICAgZmV0Y2hYbWw6IHN0cmluZ1xuICAgICAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgWHJtLldlYkFwaS5vbmxpbmUucmV0cmlldmVNdWx0aXBsZVJlY29yZHMoXG4gICAgICAgICAgICBlbnRpdHlMb2dpY2FsTmFtZSxcbiAgICAgICAgICAgIFwiP2ZldGNoWG1sPVwiICsgZmV0Y2hYbWxcbiAgICAgICAgICApO1xuICAgICAgICAgIGNvbnN0IGRhdGEgPSByZXN1bHQuZW50aXRpZXM7XG4gICAgICAgICAgbGV0IGZpbHRlcmVkRW50aXRpZXMgPSBcIlwiO1xuICAgICAgICAgIF9hZGRDdXN0b21GaWx0ZXIuY29udHJvbHMgPSB0aGlzLmNvbnRyb2xzO1xuICAgICAgICAgIGRhdGEuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgZmlsdGVyZWRFbnRpdGllcyArPSBgPHZhbHVlPiR7aXRlbVtwcmltYXJ5QXR0cmlidXRlSWROYW1lXX08L3ZhbHVlPmA7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZmV0Y2hYbWwgPSBmaWx0ZXJlZEVudGl0aWVzXG4gICAgICAgICAgICA/IGA8ZmlsdGVyPjxjb25kaXRpb24gYXR0cmlidXRlPScke3ByaW1hcnlBdHRyaWJ1dGVJZE5hbWV9JyBvcGVyYXRvcj0naW4nPiR7ZmlsdGVyZWRFbnRpdGllc308L2NvbmRpdGlvbj48L2ZpbHRlcj5gXG4gICAgICAgICAgICA6IGA8ZmlsdGVyPjxjb25kaXRpb24gYXR0cmlidXRlPScke3ByaW1hcnlBdHRyaWJ1dGVJZE5hbWV9JyBvcGVyYXRvcj0nbnVsbCcvPjwvZmlsdGVyPmA7XG4gICAgICAgICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PiB7XG4gICAgICAgICAgICBjb250cm9sLmFkZFByZVNlYXJjaChfYWRkQ3VzdG9tRmlsdGVyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLl9jdXN0b21GaWx0ZXJzLnB1c2goX2FkZEN1c3RvbUZpbHRlcik7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIF9hZGRDdXN0b21GaWx0ZXIoKSB7XG4gICAgICAgICAgX2FkZEN1c3RvbUZpbHRlci5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PiB7XG4gICAgICAgICAgICBjb250cm9sLmFkZEN1c3RvbUZpbHRlcihmZXRjaFhtbCwgZW50aXR5TG9naWNhbE5hbWUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvKipcbiAgICAgICAqIEFkZHMgYSBjdXN0b20gdmlldyB0byBmaWx0ZXIgdGhlIGxvb2t1cCB1c2luZyBGZXRjaFhNTFxuICAgICAgICogT25seSB3b3JrcyBmb3Igb25lIHRhYmxlIGF0IGEgdGltZSwgY2Fubm90IGFkZCB2aWV3cyBmb3IgbXVsdGlwbGUgdGFibGVzIGF0IHRoZSBzYW1lIHRpbWVcbiAgICAgICAqIEBwYXJhbSBmZXRjaFhtbCBUaGUgY29tcGxldGUgRmV0Y2hYTUwgcXVlcnkgaW5jbHVkaW5nIGZpbHRlcmluZyBjb25kaXRpb25zXG4gICAgICAgKiBAcmV0dXJucyBUaGUgTG9va3VwRmllbGQgaW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAgICovXG4gICAgICBhZGRDdXN0b21WaWV3KGZldGNoWG1sOiBzdHJpbmcpOiB0aGlzIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoIWZldGNoWG1sKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGZXRjaFhNTCBpcyByZXF1aXJlZFwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgdGFyZ2V0RW50aXR5ID0gdGhpcy5leHRyYWN0RW50aXR5RnJvbUZldGNoWG1sKGZldGNoWG1sKTtcbiAgICAgICAgICBjb25zdCBsYXlvdXRYbWwgPSB0aGlzLmdlbmVyYXRlTGF5b3V0WG1sKGZldGNoWG1sKTtcblxuICAgICAgICAgIHRoaXMuY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT4ge1xuICAgICAgICAgICAgY29udHJvbC5hZGRDdXN0b21WaWV3KFxuICAgICAgICAgICAgICB0aGlzLnZpZXdJZCxcbiAgICAgICAgICAgICAgdGFyZ2V0RW50aXR5LFxuICAgICAgICAgICAgICBcIkZpbHRlcmVkIFZpZXdcIixcbiAgICAgICAgICAgICAgZmV0Y2hYbWwsXG4gICAgICAgICAgICAgIGxheW91dFhtbCxcbiAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBFeHRyYWN0cyBlbnRpdHkgbmFtZSBmcm9tIGZldGNoWG1sXG4gICAgICAgKi9cbiAgICAgIHByaXZhdGUgZXh0cmFjdEVudGl0eUZyb21GZXRjaFhtbChmZXRjaFhtbDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSBmZXRjaFhtbC5tYXRjaCgvPGVudGl0eS4qP25hbWU9WydcIl0oLio/KVsnXCJdLyk7XG4gICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgZXh0cmFjdCBlbnRpdHkgbmFtZSBmcm9tIGZldGNoWG1sXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXRjaFsxXTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBHZW5lcmF0ZXMgbGF5b3V0WG1sIGJhc2VkIG9uIGZldGNoWG1sIGF0dHJpYnV0ZXNcbiAgICAgICAqL1xuICAgICAgcHJpdmF0ZSBnZW5lcmF0ZUxheW91dFhtbChmZXRjaFhtbDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgYXR0cmlidXRlczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgY29uc3QgcmVnZXggPSAvPGF0dHJpYnV0ZS4qP25hbWU9WydcIl0oLio/KVsnXCJdL2c7XG4gICAgICAgIGxldCBtYXRjaDtcblxuICAgICAgICAvLyBHZXQgdXAgdG8gMyBub24taWQgYXR0cmlidXRlc1xuICAgICAgICB3aGlsZSAoXG4gICAgICAgICAgKG1hdGNoID0gcmVnZXguZXhlYyhmZXRjaFhtbCkpICE9PSBudWxsICYmXG4gICAgICAgICAgYXR0cmlidXRlcy5sZW5ndGggPCAzXG4gICAgICAgICkge1xuICAgICAgICAgIGlmICghbWF0Y2hbMV0uZW5kc1dpdGgoXCJpZFwiKSkge1xuICAgICAgICAgICAgYXR0cmlidXRlcy5wdXNoKG1hdGNoWzFdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB3ZSBkaWRuJ3QgZ2V0IGFueSBhdHRyaWJ1dGVzLCB0cnkgdG8gZ2V0IHRoZSBmaXJzdCBhdHRyaWJ1dGUgZXZlbiBpZiBpdCdzIGFuIElEXG4gICAgICAgIGlmIChhdHRyaWJ1dGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIGNvbnN0IGZpcnN0TWF0Y2ggPSByZWdleC5leGVjKGZldGNoWG1sKTtcbiAgICAgICAgICBhdHRyaWJ1dGVzLnB1c2goZmlyc3RNYXRjaCA/IGZpcnN0TWF0Y2hbMV0gOiBcIm5hbWVcIik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZW5lcmF0ZSBjZWxscyBiYXNlZCBvbiBhdmFpbGFibGUgYXR0cmlidXRlc1xuICAgICAgICBjb25zdCBjZWxscyA9IGF0dHJpYnV0ZXNcbiAgICAgICAgICAubWFwKChhdHRyLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgd2lkdGggPSBpbmRleCA9PT0gMCA/IDIwMCA6IDEwMDtcbiAgICAgICAgICAgIHJldHVybiBgPGNlbGwgbmFtZT0nJHthdHRyfScgd2lkdGg9JyR7d2lkdGh9JyAvPmA7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuam9pbihcIlxcbiAgICAgICAgXCIpO1xuXG4gICAgICAgIHJldHVybiBgPGdyaWQgbmFtZT0ncmVzdWx0c2V0JyBvYmplY3Q9JzEnIGp1bXA9JyR7YXR0cmlidXRlc1swXX0nIHNlbGVjdD0nMScgaWNvbj0nMScgcHJldmlldz0nMSc+XG4gICAgICA8cm93IG5hbWU9J3Jlc3VsdCcgaWQ9JyR7YXR0cmlidXRlc1swXX0nPlxuICAgICAgICAke2NlbGxzfVxuICAgICAgPC9yb3c+XG4gICAgPC9ncmlkPmA7XG4gICAgICB9XG4gICAgICAvKipcbiAgICAgICAqIFJlbW92ZXMgYWxsIGZpbHRlcnMgc2V0IG9uIHRoZSBjdXJyZW50IGxvb2t1cCBhdHRyaWJ1dGUgYnkgdXNpbmcgYWRkUHJlRmlsdGVyVG9Mb29rdXAgb3IgYWRkUHJlRmlsdGVyVG9Mb29rdXBBZHZhbmNlZFxuICAgICAgICovXG4gICAgICBjbGVhclByZUZpbHRlckZyb21Mb29rdXAoKTogdGhpcyB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5fY3VzdG9tRmlsdGVycy5mb3JFYWNoKFxuICAgICAgICAgICAgKGN1c3RvbUZpbHRlcjogWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlcikgPT4ge1xuICAgICAgICAgICAgICB0aGlzLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2wpID0+IHtcbiAgICAgICAgICAgICAgICBjb250cm9sLnJlbW92ZVByZVNlYXJjaChjdXN0b21GaWx0ZXIpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0eXBlIE9wdGlvblZhbHVlcyA9IHtcbiAgICAgIFtrZXk6IHN0cmluZ106IG51bWJlcjtcbiAgICB9O1xuICAgIGV4cG9ydCBjbGFzcyBPcHRpb25zZXRGaWVsZDxPcHRpb25zIGV4dGVuZHMgT3B0aW9uVmFsdWVzPlxuICAgICAgZXh0ZW5kcyBGaWVsZFxuICAgICAgaW1wbGVtZW50cyBYcm0uQXR0cmlidXRlcy5PcHRpb25TZXRBdHRyaWJ1dGUge1xuICAgICAgcHJvdGVjdGVkIGRlY2xhcmUgX2F0dHJpYnV0ZTogWHJtLkF0dHJpYnV0ZXMuT3B0aW9uU2V0QXR0cmlidXRlO1xuICAgICAgcHJvdGVjdGVkIF9jb250cm9sITogWHJtLkNvbnRyb2xzLk9wdGlvblNldENvbnRyb2w7XG4gICAgICBPcHRpb246IE9wdGlvbnM7XG4gICAgICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsIG9wdGlvbj86IE9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIoYXR0cmlidXRlTmFtZSk7XG4gICAgICAgIHRoaXMuT3B0aW9uID0gb3B0aW9uO1xuICAgICAgfVxuICAgICAgZ2V0Rm9ybWF0KCk6IFhybS5BdHRyaWJ1dGVzLk9wdGlvblNldEF0dHJpYnV0ZUZvcm1hdCB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRGb3JtYXQoKSBhcyBYcm0uQXR0cmlidXRlcy5PcHRpb25TZXRBdHRyaWJ1dGVGb3JtYXQ7XG4gICAgICB9XG4gICAgICBnZXRPcHRpb24odmFsdWU6IG51bWJlciB8IHN0cmluZyk6IFhybS5PcHRpb25TZXRWYWx1ZSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0T3B0aW9uKHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0T3B0aW9uKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZ2V0T3B0aW9ucygpOiBYcm0uT3B0aW9uU2V0VmFsdWVbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRPcHRpb25zKCk7XG4gICAgICB9XG4gICAgICBnZXRTZWxlY3RlZE9wdGlvbigpOiBYcm0uT3B0aW9uU2V0VmFsdWUge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0U2VsZWN0ZWRPcHRpb24oKTtcbiAgICAgIH1cbiAgICAgIGdldFRleHQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0cmlidXRlLmdldFRleHQoKTtcbiAgICAgIH1cbiAgICAgIGdldEluaXRpYWxWYWx1ZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5BdHRyaWJ1dGUuZ2V0SW5pdGlhbFZhbHVlKCk7XG4gICAgICB9XG4gICAgICBnZXQgQXR0cmlidXRlKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuX2F0dHJpYnV0ZSA/Pz1cbiAgICAgICAgICBGb3JtLmZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZSh0aGlzLk5hbWUpID8/XG4gICAgICAgICAgWHJtRXgudGhyb3dFcnJvcihgRmllbGQgJyR7dGhpcy5OYW1lfScgZG9lcyBub3QgZXhpc3RgKSk7XG4gICAgICB9XG4gICAgICBnZXQgY29udHJvbHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5jb250cm9scztcbiAgICAgIH1cbiAgICAgIGdldCBjb250cm9sKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuX2NvbnRyb2wgPz89XG4gICAgICAgICAgRm9ybS5mb3JtQ29udGV4dC5nZXRDb250cm9sKHRoaXMuTmFtZSkgPz9cbiAgICAgICAgICBYcm1FeC50aHJvd0Vycm9yKGBDb250cm9sICcke3RoaXMuTmFtZX0nIGRvZXMgbm90IGV4aXN0YCkpO1xuICAgICAgfVxuICAgICAgZ2V0IFZhbHVlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJpYnV0ZS5nZXRWYWx1ZSgpO1xuICAgICAgfVxuICAgICAgc2V0IFZhbHVlKHZhbHVlOiBrZXlvZiBPcHRpb25zIHwgbnVtYmVyKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gXCJudW1iZXJcIikgdGhpcy5BdHRyaWJ1dGUuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgICBlbHNlIGlmICh2YWx1ZSA9PT0gbnVsbCkgdGhpcy5BdHRyaWJ1dGUuc2V0VmFsdWUobnVsbCk7XG4gICAgICAgIGVsc2UgdGhpcy5BdHRyaWJ1dGUuc2V0VmFsdWUodGhpcy5PcHRpb25bdmFsdWVdKTtcbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICogQWRkcyBhbiBvcHRpb24uXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHZhbHVlcyBhbiBhcnJheSB3aXRoIHRoZSBvcHRpb24gdmFsdWVzIHRvIGFkZFxuICAgICAgICogQHBhcmFtIGluZGV4IChPcHRpb25hbCkgemVyby1iYXNlZCBpbmRleCBvZiB0aGUgb3B0aW9uLlxuICAgICAgICpcbiAgICAgICAqIEByZW1hcmtzIFRoaXMgbWV0aG9kIGRvZXMgbm90IGNoZWNrIHRoYXQgdGhlIHZhbHVlcyB3aXRoaW4gdGhlIG9wdGlvbnMgeW91IGFkZCBhcmUgdmFsaWQuXG4gICAgICAgKiAgICAgICAgICBJZiBpbmRleCBpcyBub3QgcHJvdmlkZWQsIHRoZSBuZXcgb3B0aW9uIHdpbGwgYmUgYWRkZWQgdG8gdGhlIGVuZCBvZiB0aGUgbGlzdC5cbiAgICAgICAqL1xuICAgICAgYWRkT3B0aW9uKHZhbHVlczogbnVtYmVyW10sIGluZGV4PzogbnVtYmVyKTogdGhpcyB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlcykpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHZhbHVlcyBpcyBub3QgYW4gQXJyYXk6XFxudmFsdWVzOiAnJHt2YWx1ZXN9J2ApO1xuICAgICAgICAgIGNvbnN0IG9wdGlvblNldFZhbHVlcyA9XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2wuZ2V0QXR0cmlidXRlKCkuZ2V0T3B0aW9ucygpID8/IFtdO1xuICAgICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBvcHRpb25TZXRWYWx1ZXMpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZXMuaW5jbHVkZXMoZWxlbWVudC52YWx1ZSkpIHtcbiAgICAgICAgICAgICAgdGhpcy5jb250cm9sLmFkZE9wdGlvbihlbGVtZW50LCBpbmRleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFhybUV4LiR7WHJtRXguZ2V0RnVuY3Rpb25OYW1lKCl9OlxcbiR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLyoqXG4gICAgICAgKiBSZW1vdmVzIHRoZSBvcHRpb24gbWF0Y2hpbmcgdGhlIHZhbHVlLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUuXG4gICAgICAgKi9cbiAgICAgIHJlbW92ZU9wdGlvbih2YWx1ZXM6IG51bWJlcltdKTogdGhpcyB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlcykpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHZhbHVlcyBpcyBub3QgYW4gQXJyYXk6XFxudmFsdWVzOiAnJHt2YWx1ZXN9J2ApO1xuICAgICAgICAgIGNvbnN0IG9wdGlvblNldFZhbHVlcyA9XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2wuZ2V0QXR0cmlidXRlKCkuZ2V0T3B0aW9ucygpID8/IFtdO1xuICAgICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBvcHRpb25TZXRWYWx1ZXMpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZXMuaW5jbHVkZXMoZWxlbWVudC52YWx1ZSkpIHtcbiAgICAgICAgICAgICAgdGhpcy5jb250cm9sLnJlbW92ZU9wdGlvbihlbGVtZW50LnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgWHJtRXguJHtYcm1FeC5nZXRGdW5jdGlvbk5hbWUoKX06XFxuJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvKipcbiAgICAgICAqIENsZWFycyBhbGwgb3B0aW9ucy5cbiAgICAgICAqL1xuICAgICAgY2xlYXJPcHRpb25zKCk6IHRoaXMge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMuY29udHJvbC5jbGVhck9wdGlvbnMoKTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBYcm1FeC4ke1hybUV4LmdldEZ1bmN0aW9uTmFtZSgpfTpcXG4ke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgZXhwb3J0IGNsYXNzIFNlY3Rpb24gaW1wbGVtZW50cyBYcm0uQ29udHJvbHMuU2VjdGlvbiB7XG4gICAgICBwdWJsaWMgcmVhZG9ubHkgTmFtZSE6IHN0cmluZztcbiAgICAgIHByb3RlY3RlZCBfc2VjdGlvbj86IFhybS5Db250cm9scy5TZWN0aW9uO1xuICAgICAgcHVibGljIHBhcmVudFRhYj86IFhybS5Db250cm9scy5UYWI7XG4gICAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5OYW1lID0gbmFtZTtcbiAgICAgIH1cbiAgICAgIHB1YmxpYyBnZXQgU2VjdGlvbigpOiBYcm0uQ29udHJvbHMuU2VjdGlvbiB7XG4gICAgICAgIHJldHVybiAodGhpcy5fc2VjdGlvbiA/Pz1cbiAgICAgICAgICB0aGlzLnBhcmVudFRhYi5zZWN0aW9ucy5nZXQodGhpcy5OYW1lKSA/P1xuICAgICAgICAgIFhybUV4LnRocm93RXJyb3IoXG4gICAgICAgICAgICBgVGhlIHNlY3Rpb24gJyR7dGhpcy5OYW1lfScgd2FzIG5vdCBmb3VuZCBvbiB0aGUgZm9ybS5gXG4gICAgICAgICAgKSk7XG4gICAgICB9XG4gICAgICBnZXROYW1lKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLlNlY3Rpb24uZ2V0TmFtZSgpO1xuICAgICAgfVxuICAgICAgZ2V0UGFyZW50KCk6IFhybS5Db250cm9scy5UYWIge1xuICAgICAgICByZXR1cm4gdGhpcy5TZWN0aW9uLmdldFBhcmVudCgpO1xuICAgICAgfVxuICAgICAgY29udHJvbHM6IFhybS5Db2xsZWN0aW9uLkl0ZW1Db2xsZWN0aW9uPFhybS5Db250cm9scy5Db250cm9sPjtcbiAgICAgIHNldFZpc2libGUodmlzaWJsZTogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5TZWN0aW9uLnNldFZpc2libGUodmlzaWJsZSk7XG4gICAgICB9XG4gICAgICBnZXRWaXNpYmxlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5TZWN0aW9uLmdldFZpc2libGUoKTtcbiAgICAgIH1cbiAgICAgIGdldExhYmVsKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLlNlY3Rpb24uZ2V0TGFiZWwoKTtcbiAgICAgIH1cbiAgICAgIHNldExhYmVsKGxhYmVsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuU2VjdGlvbi5zZXRMYWJlbChsYWJlbCk7XG4gICAgICB9XG4gICAgfVxuICAgIHR5cGUgVGFiU2VjdGlvbnMgPSB7XG4gICAgICBba2V5OiBzdHJpbmddOiBTZWN0aW9uO1xuICAgIH07XG4gICAgZXhwb3J0IGNsYXNzIFRhYjxTZWN0aW9ucyBleHRlbmRzIFRhYlNlY3Rpb25zPiBpbXBsZW1lbnRzIFhybS5Db250cm9scy5UYWIge1xuICAgICAgcHVibGljIHJlYWRvbmx5IE5hbWUhOiBzdHJpbmc7XG4gICAgICBwcm90ZWN0ZWQgX3RhYj86IFhybS5Db250cm9scy5UYWI7XG4gICAgICBTZWN0aW9uOiBTZWN0aW9ucztcbiAgICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgc2VjdGlvbj86IFNlY3Rpb25zKSB7XG4gICAgICAgIHRoaXMuTmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuU2VjdGlvbiA9IHNlY3Rpb247XG4gICAgICAgIGZvciAobGV0IGtleSBpbiBzZWN0aW9uKSB7XG4gICAgICAgICAgc2VjdGlvbltrZXldLnBhcmVudFRhYiA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGdldCBzZWN0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuVGFiLnNlY3Rpb25zO1xuICAgICAgfVxuICAgICAgcHVibGljIGdldCBUYWIoKTogWHJtLkNvbnRyb2xzLlRhYiB7XG4gICAgICAgIHJldHVybiAodGhpcy5fdGFiID8/PVxuICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQudWkudGFicy5nZXQodGhpcy5OYW1lKSA/P1xuICAgICAgICAgIFhybUV4LnRocm93RXJyb3IoXG4gICAgICAgICAgICBgVGhlIHRhYiAnJHt0aGlzLk5hbWV9JyB3YXMgbm90IGZvdW5kIG9uIHRoZSBmb3JtLmBcbiAgICAgICAgICApKTtcbiAgICAgIH1cbiAgICAgIGFkZFRhYlN0YXRlQ2hhbmdlKGhhbmRsZXI6IFhybS5FdmVudHMuQ29udGV4dFNlbnNpdGl2ZUhhbmRsZXIpOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuVGFiLmFkZFRhYlN0YXRlQ2hhbmdlKGhhbmRsZXIpO1xuICAgICAgfVxuICAgICAgZ2V0RGlzcGxheVN0YXRlKCk6IFhybS5EaXNwbGF5U3RhdGUge1xuICAgICAgICByZXR1cm4gdGhpcy5UYWIuZ2V0RGlzcGxheVN0YXRlKCk7XG4gICAgICB9XG4gICAgICBnZXROYW1lKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLlRhYi5nZXROYW1lKCk7XG4gICAgICB9XG4gICAgICBnZXRQYXJlbnQoKTogWHJtLlVpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuVGFiLmdldFBhcmVudCgpO1xuICAgICAgfVxuICAgICAgcmVtb3ZlVGFiU3RhdGVDaGFuZ2UoaGFuZGxlcjogWHJtLkV2ZW50cy5Db250ZXh0U2Vuc2l0aXZlSGFuZGxlcik6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5UYWIucmVtb3ZlVGFiU3RhdGVDaGFuZ2UoaGFuZGxlcik7XG4gICAgICB9XG4gICAgICBzZXREaXNwbGF5U3RhdGUoZGlzcGxheVN0YXRlOiBYcm0uRGlzcGxheVN0YXRlKTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLlRhYi5zZXREaXNwbGF5U3RhdGUoZGlzcGxheVN0YXRlKTtcbiAgICAgIH1cbiAgICAgIHNldFZpc2libGUodmlzaWJsZTogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5UYWIuc2V0VmlzaWJsZSh2aXNpYmxlKTtcbiAgICAgIH1cbiAgICAgIGdldFZpc2libGUoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLlRhYi5nZXRWaXNpYmxlKCk7XG4gICAgICB9XG4gICAgICBnZXRMYWJlbCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5UYWIuZ2V0TGFiZWwoKTtcbiAgICAgIH1cbiAgICAgIHNldExhYmVsKGxhYmVsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuVGFiLnNldExhYmVsKGxhYmVsKTtcbiAgICAgIH1cbiAgICAgIHNldEZvY3VzKCk6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5UYWIuc2V0Rm9jdXMoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZXhwb3J0IGNsYXNzIEdyaWRDb250cm9sIGltcGxlbWVudHMgWHJtLkNvbnRyb2xzLkdyaWRDb250cm9sIHtcbiAgICAgIHB1YmxpYyByZWFkb25seSBOYW1lITogc3RyaW5nO1xuICAgICAgcHJvdGVjdGVkIF9ncmlkQ29udHJvbD86IFhybS5Db250cm9scy5HcmlkQ29udHJvbDtcbiAgICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLk5hbWUgPSBuYW1lO1xuICAgICAgfVxuICAgICAgcHVibGljIGdldCBHcmlkQ29udHJvbCgpOiBYcm0uQ29udHJvbHMuR3JpZENvbnRyb2wge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICh0aGlzLl9ncmlkQ29udHJvbCA/Pz1cbiAgICAgICAgICAgIEZvcm0uZm9ybUNvbnRleHQuZ2V0Q29udHJvbDxYcm0uQ29udHJvbHMuR3JpZENvbnRyb2w+KHRoaXMuTmFtZSkpID8/XG4gICAgICAgICAgWHJtRXgudGhyb3dFcnJvcihgVGhlIGdyaWQgJyR7dGhpcy5OYW1lfScgd2FzIG5vdCBmb3VuZCBvbiB0aGUgZm9ybS5gKVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcHVibGljIGdldCBHcmlkKCk6IFhybS5Db250cm9scy5HcmlkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0R3JpZCgpO1xuICAgICAgfVxuICAgICAgYWRkT25Mb2FkKGhhbmRsZXI6IFhybS5FdmVudHMuR3JpZENvbnRyb2wuTG9hZEV2ZW50SGFuZGxlcik6IHZvaWQge1xuICAgICAgICB0aGlzLkdyaWRDb250cm9sLnJlbW92ZU9uTG9hZChoYW5kbGVyIGFzIGFueSk7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLmFkZE9uTG9hZChoYW5kbGVyKTtcbiAgICAgIH1cbiAgICAgIGdldENvbnRleHRUeXBlKCk6IFhybUVudW0uR3JpZENvbnRyb2xDb250ZXh0IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0Q29udGV4dFR5cGUoKTtcbiAgICAgIH1cbiAgICAgIGdldEVudGl0eU5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0RW50aXR5TmFtZSgpO1xuICAgICAgfVxuICAgICAgZ2V0RmV0Y2hYbWwoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0RmV0Y2hYbWwoKTtcbiAgICAgIH1cbiAgICAgIGdldEdyaWQoKTogWHJtLkNvbnRyb2xzLkdyaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRHcmlkKCk7XG4gICAgICB9XG4gICAgICBnZXRSZWxhdGlvbnNoaXAoKTogWHJtLkNvbnRyb2xzLkdyaWRSZWxhdGlvbnNoaXAge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRSZWxhdGlvbnNoaXAoKTtcbiAgICAgIH1cbiAgICAgIGdldFVybChjbGllbnQ/OiBYcm1FbnVtLkdyaWRDbGllbnQpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRVcmwoY2xpZW50KTtcbiAgICAgIH1cbiAgICAgIGdldFZpZXdTZWxlY3RvcigpOiBYcm0uQ29udHJvbHMuVmlld1NlbGVjdG9yIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0Vmlld1NlbGVjdG9yKCk7XG4gICAgICB9XG4gICAgICBvcGVuUmVsYXRlZEdyaWQoKTogdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLkdyaWRDb250cm9sLm9wZW5SZWxhdGVkR3JpZCgpO1xuICAgICAgfVxuICAgICAgcmVmcmVzaCgpOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wucmVmcmVzaCgpO1xuICAgICAgfVxuICAgICAgcmVmcmVzaFJpYmJvbigpOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wucmVmcmVzaFJpYmJvbigpO1xuICAgICAgfVxuICAgICAgcmVtb3ZlT25Mb2FkKGhhbmRsZXI6ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wucmVtb3ZlT25Mb2FkKGhhbmRsZXIpO1xuICAgICAgfVxuICAgICAgZ2V0Q29udHJvbFR5cGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0Q29udHJvbFR5cGUoKTtcbiAgICAgIH1cbiAgICAgIGdldE5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0TmFtZSgpO1xuICAgICAgfVxuICAgICAgZ2V0UGFyZW50KCk6IFhybS5Db250cm9scy5TZWN0aW9uIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuZ2V0UGFyZW50KCk7XG4gICAgICB9XG4gICAgICBnZXRMYWJlbCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRMYWJlbCgpO1xuICAgICAgfVxuICAgICAgc2V0TGFiZWwobGFiZWw6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5zZXRMYWJlbChsYWJlbCk7XG4gICAgICB9XG4gICAgICBnZXRWaXNpYmxlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5HcmlkQ29udHJvbC5nZXRWaXNpYmxlKCk7XG4gICAgICB9XG4gICAgICBzZXRWaXNpYmxlKHZpc2libGU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuR3JpZENvbnRyb2wuc2V0VmlzaWJsZSh2aXNpYmxlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==