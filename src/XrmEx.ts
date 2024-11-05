/// <reference path="../node_modules/@types/xrm/index.d.ts" />
/**
 * Represents a parameter for a request.
 * @type {Object} RequestParameter
 * @property {string} Name - The name of the parameter.
 * @property {'Boolean' | 'DateTime' | 'Decimal' | 'Entity' | 'EntityCollection' | 'EntityReference' | 'Float' | 'Integer' | 'Money' | 'Picklist' | 'String'} Type - The type of the parameter.
 * @property {*} Value - The value of the parameter.
 */
type RequestParameter = {
  Name: string;
  Type:
    | "Boolean"
    | "DateTime"
    | "Decimal"
    | "Entity"
    | "EntityCollection"
    | "EntityReference"
    | "Float"
    | "Integer"
    | "Money"
    | "Picklist"
    | "String";
  Value: any;
};
/**
 * Represents a reference to an entity.
 * @type
 * @property {string} id - The ID of the entity.
 * @property {string} entityType - The type of the entity.
 */
type EntityReference = {
  id: string;
  entityType: string;
};
export namespace XrmEx {
  /**
   * Throws an error with the given error message.
   * @param {string} errorMessage - The error message to throw.
   * @throws {Error} - Always throws an error with the given error message.
   */
  export function throwError(errorMessage: string): never {
    throw new Error(errorMessage);
  }
  /**
   * Returns the name of the calling function.
   * @returns {string} - The name of the calling function.
   */
  export function getFunctionName(): string {
    try {
      const error = new Error();
      const stackTrace = error.stack?.split("\n").map((line) => line.trim());
      const callingFunctionLine =
        stackTrace && stackTrace.length >= 3 ? stackTrace[2] : undefined;
      const functionNameMatch =
        callingFunctionLine?.match(/at\s+([^\s]+)\s+\(/) ||
        callingFunctionLine?.match(/at\s+([^\s]+)/);
      const functionName = functionNameMatch ? functionNameMatch[1] : "";

      return functionName;
    } catch (error: any) {
      throw new Error(`XrmEx.getFunctionName:\n${error.message}`);
    }
  }
  /**
   * Displays a notification for an app with the given message and level, and lets you specify whether to show a close button.
   * @param {string} message - The message to display in the notification.
   * @param {'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO'} level - The level of the notification. Can be 'SUCCESS', 'ERROR', 'WARNING', or 'INFO'.
   * @param {boolean} [showCloseButton=false] - Whether to show a close button on the notification. Defaults to false.
   * @returns {Promise<string>} - A promise that resolves with the ID of the created notification.
   */
  export async function addGlobalNotification(
    message: string,
    level: "SUCCESS" | "ERROR" | "WARNING" | "INFO",
    showCloseButton = false
  ): Promise<string> {
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
    } catch (error: any) {
      throw new Error(`XrmEx.${getFunctionName()}:\n${error.message}`);
    }
  }
  /**
   * Clears a notification in the app with the given unique ID.
   * @param {string} uniqueId - The unique ID of the notification to clear.
   * @returns {Promise<string>} - A promise that resolves when the notification has been cleared.
   */
  export async function removeGlobalNotification(
    uniqueId: string
  ): Promise<string> {
    try {
      return await Xrm.App.clearGlobalNotification(uniqueId);
    } catch (error: any) {
      throw new Error(`XrmEx.${getFunctionName()}:\n${error.message}`);
    }
  }
  /**
   * Retrieves the value of an environment variable by using its schema name as key.
   * If the environment variable has both a default value and a current value, this function will retrieve the current value.
   * @param {string} environmentVariableSchemaName - The schema name of the environment variable to retrieve.
   * @returns {Promise<string>} - A promise that resolves with the value of the environment variable.
   * @async
   */
  export async function getEnvironmentVariableValue(
    environmentVariableSchemaName: string
  ): Promise<string> {
    let response = await executeFunction("RetrieveEnvironmentVariableValue", [
      {
        Name: "DefinitionSchemaName",
        Type: "String",
        Value: environmentVariableSchemaName,
      },
    ]);
    return Object.hasOwn(response, "Value") ? response.Value : response;
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
  export function getStructuralProperty(value: any): number {
    const type = typeof value;
    if (type == "string" || type == "number" || type == "boolean") return 1;
    if (value instanceof Date) return 1;
    if (Array.isArray(value)) return 4;
    return 5;
  }
  /**
   * Executes a request.
   * @param {string} actionName - The unique name of the request.
   * @param {RequestParameter[] | object} requestParameters - An array of objects with the parameter name, type, and value.
   * @param {EntityReference} [boundEntity] - An optional EntityReference of the bound entity.
   * @param {number} [operationType] - The type of the request. 0 for functions 1 for actions, 2 for CRUD operations.
   * @returns {Promise<any>} - A Promise with the request response.
   * @throws {Error} - Throws an error if the request parameter is not of a supported type or has an invalid value.
   */
  export async function execute(
    actionName: string,
    requestParameters: RequestParameter[] | { [key: string]: any },
    boundEntity?: EntityReference,
    operationType: number = 1
  ): Promise<any> {
    const prepareParameterDefinition = (
      params: RequestParameter[] | { [key: string]: any }
    ) => {
      const parameterDefinition: { [key: string]: any } = {};
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
      } else {
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

    const createRequest = (
      params: RequestParameter[] | { [key: string]: any },
      definition: { [key: string]: any }
    ) => {
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
    if (result.ok) return result.json().catch(() => result);
  }

  /**
   * Executes an Action.
   * @param {string} actionName - The unique name of the action.
   * @param {RequestParameter[] | object} requestParameters - An array of objects with the parameter name, type, and value.
   * @param {EntityReference} [boundEntity] - An optional EntityReference of the bound entity.
   * @returns {Promise<any>} - A Promise with the request response.
   * @throws {Error} - Throws an error if the request parameter is not of a supported type or has an invalid value.
   */
  export async function executeAction(
    functionName: string,
    requestParameters: RequestParameter[] | object,
    boundEntity?: EntityReference
  ): Promise<any> {
    return await execute(functionName, requestParameters, boundEntity, 0);
  }

  /**
   * Executes a Function.
   * @param {string} functionName - The unique name of the function.
   * @param {RequestParameter[] | object} requestParameters - An array of objects with the parameter name, type and value.
   * @param {EntityReference} [boundEntity] - An optional EntityReference of the bound entity.
   * @returns {Promise<any>} - A Promise with the request response.
   * @throws {Error} - Throws an error if the request parameter is not of a supported type or has an invalid value.
   */
  export async function executeFunction(
    functionName: string,
    requestParameters: RequestParameter[] | object,
    boundEntity?: EntityReference
  ): Promise<any> {
    return await execute(functionName, requestParameters, boundEntity, 1);
  }

  /**
   * Executes a CRUD request.
   * @param {string} messageName - The unique name of the request.
   * @param {RequestParameter[] | object} requestParameters - An array of objects with the parameter name, type, and value.
   * @param {EntityReference} [boundEntity] - An optional EntityReference of the bound entity.
   * @returns {Promise<any>} - A Promise with the request response.
   * @throws {Error} - Throws an error if the request parameter is not of a supported type or has an invalid value.
   */
  export async function executeCRUD(
    functionName: string,
    requestParameters: RequestParameter[] | object,
    boundEntity?: EntityReference
  ): Promise<any> {
    return await execute(functionName, requestParameters, boundEntity, 2);
  }

  /**
   * Makes a GUID lowercase and removes brackets.
   * @param {string} guid - The GUID to normalize.
   * @returns {string} - The normalized GUID.
   */
  export function normalizeGuid(guid: string): string {
    if (typeof guid !== "string")
      throw new Error(`XrmEx.normalizeGuid:\n'${guid}' is not a string`);
    return guid.toLowerCase().replace(/[{}]/g, "");
  }

  /**
   * Wraps a function that takes a callback as its last parameter and returns a Promise.
   * @param {Function} fn the function to wrap
   * @param context the parent property of the function f.e. formContext.data.process for formContext.data.process.getEnabledProcesses
   * @param args the arguments to pass to the function
   * @returns {Promise<any>} a Promise that resolves with the callback response
   */
  export function asPromise<T>(fn: Function, context, ...args): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const callback = (response: T) => {
        resolve(response);
      };
      try {
        // Call the function with the arguments and the callback at the end
        fn.call(context, ...args, callback);
      } catch (error) {
        reject(error);
      }
    });
  }
  /**
   * Opens a dialog with dynamic height and width based on text content.
   * @param {string} title - The title of the dialog.
   * @param {string} text - The text content of the dialog.
   * @returns {Promise<any>} - A Promise with the dialog response.
   */
  export async function openAlertDialog(
    title: string,
    text: string
  ): Promise<any> {
    try {
      const rows = text.split(/\r\n|\r|\n/);
      let additionalRows = 0;
      rows.forEach((row) => {
        let width = getTextWidth(
          row,
          "1rem Segoe UI Regular, SegoeUI, Segoe UI"
        );
        if (width > 940) {
          additionalRows += width / 940;
        }
      });
      const longestRow = rows.reduce(
        (acc, row) => (row.length > acc.length ? row : acc),
        ""
      );
      const width = Math.min(
        getTextWidth(longestRow, "1rem Segoe UI Regular, SegoeUI, Segoe UI"),
        1000
      );
      const height = 109 + (rows.length + additionalRows) * 20;
      return await Xrm.Navigation.openAlertDialog(
        {
          confirmButtonLabel: "Ok",
          text,
          title,
        },
        {
          height,
          width,
        }
      );
    } catch (error: any) {
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
    function getTextWidth(text: string, font: string) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      context.font = font;
      const metrics = context.measureText(text);
      return metrics.width;
    }
  }

  export class Process {
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
    static addOnPreProcessStatusChange(
      handler: Xrm.Events.ProcessStatusChangeHandler
    ) {
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
    static addOnPreStageChange(handler: Xrm.Events.StageChangeEventHandler) {
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
    static addOnProcessStatusChange(
      handler: Xrm.Events.ProcessStatusChangeHandler
    ) {
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
    static addOnStageChange(handler: Xrm.Events.StageChangeEventHandler) {
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
    static addOnStageSelected(handler: Xrm.Events.ContextSensitiveHandler) {
      Form.formContext.data.process.removeOnStageSelected(handler);
      return Form.formContext.data.process.addOnStageSelected(handler);
    }
    /**
     * Use this to remove a function as an event handler for the OnPreProcessStatusChange event.
     * @param handler If an anonymous function is set using the addOnPreProcessStatusChange method it
     *                cannot be removed using this method.
     */
    static removeOnPreProcessStatusChange(
      handler: Xrm.Events.ProcessStatusChangeHandler
    ) {
      return Form.formContext.data.process.removeOnPreProcessStatusChange(
        handler
      );
    }
    /**
     * Use this to remove a function as an event handler for the OnPreStageChange event.
     * @param handler If an anonymous function is set using the addOnPreStageChange method it
     *                cannot be removed using this method.
     */
    static removeOnPreStageChange(handler: Xrm.Events.StageChangeEventHandler) {
      return Form.formContext.data.process.removeOnPreStageChange(handler);
    }
    /**
     * Use this to remove a function as an event handler for the OnProcessStatusChange event.
     * @param handler If an anonymous function is set using the addOnProcessStatusChange method it
     *                cannot be removed using this method.
     */
    static removeOnProcessStatusChange(
      handler: Xrm.Events.ProcessStatusChangeHandler
    ) {
      return Form.formContext.data.process.removeOnProcessStatusChange(handler);
    }
    /**
     * Use this to remove a function as an event handler for the OnStageChange event.
     * @param handler If an anonymous function is set using the addOnStageChange method it
     *                cannot be removed using this method.
     */
    static removeOnStageChange(handler: Xrm.Events.StageChangeEventHandler) {
      return Form.formContext.data.process.removeOnStageChange(handler);
    }
    /**
     * Use this to remove a function as an event handler for the OnStageChange event.
     * @param handler If an anonymous function is set using the addOnStageChange method it
     *                cannot be removed using this method.
     */
    static removeOnStageSelected(handler: Xrm.Events.ContextSensitiveHandler) {
      return Form.formContext.data.process.removeOnStageSelected(handler);
    }

    /**
     * Use this method to asynchronously retrieve the enabled business process flows that the user can switch to for an entity.
     * @returns returns callback response as Promise
     */
    static getEnabledProcesses() {
      return asPromise<Xrm.ProcessFlow.ProcessDictionary>(
        Form.formContext.data.process.getEnabledProcesses,
        Form.formContext.data.process
      );
    }
    /**
     * Returns all process instances for the entity record that the calling user has access to.
     * @returns returns callback response as Promise
     */
    static getProcessInstances() {
      return asPromise<Xrm.ProcessFlow.GetProcessInstancesDelegate>(
        Form.formContext.data.process.getProcessInstances,
        Form.formContext.data.process
      );
    }
    /**
     * Progresses to the next stage.
     * @returns returns callback response as Promise
     */
    static moveNext() {
      return asPromise<Xrm.ProcessFlow.ProcessCallbackDelegate>(
        Form.formContext.data.process.moveNext,
        Form.formContext.data.process
      );
    }
    /**
     * Moves to the previous stage.
     * @returns returns callback response as Promise
     */
    static movePrevious() {
      return asPromise<Xrm.ProcessFlow.ProcessCallbackDelegate>(
        Form.formContext.data.process.movePrevious,
        Form.formContext.data.process
      );
    }
    /**
     * Set a Process as the active process.
     * @param processId The Id of the process to make the active process.
     * @returns returns callback response as Promise
     */
    static setActiveProcess(processId: string) {
      return asPromise<Xrm.ProcessFlow.ProcessCallbackDelegate>(
        Form.formContext.data.process.setActiveProcess,
        Form.formContext.data.process,
        processId
      );
    }
    /**
     * Sets a process instance as the active instance
     * @param processInstanceId The Id of the process instance to make the active instance.
     * @returns returns callback response as Promise
     */
    static setActiveProcessInstance(processInstanceId: string) {
      return asPromise<Xrm.ProcessFlow.SetProcessInstanceDelegate>(
        Form.formContext.data.process.setActiveProcessInstance,
        Form.formContext.data.process,
        processInstanceId
      );
    }
    /**
     * Set a stage as the active stage.
     * @param stageId the Id of the stage to make the active stage.
     * @returns returns callback response as Promise
     */
    static setActiveStage(stageId: string) {
      return asPromise<Xrm.ProcessFlow.SetProcessInstanceDelegate>(
        Form.formContext.data.process.setActiveStage,
        Form.formContext.data.process,
        stageId
      );
    }
    /**
     * Use this method to set the current status of the process instance
     * @param status The new status for the process
     * @returns returns callback response as Promise
     */
    static setStatus(status: Xrm.ProcessFlow.ProcessStatus) {
      return asPromise<Xrm.ProcessFlow.SetProcessInstanceDelegate>(
        Form.formContext.data.process.setStatus,
        Form.formContext.data.process,
        status
      );
    }
  }

  export class Fields {
    /**
     * Adds a handler or an array of handlers to be called when the attribute's value is changed.
     * @param fields An array of fields to on which this method should be applied.
     * @param handlers The function reference or an array of function references.
     */
    static addOnChange(
      fields: Class.Field[],
      handler: Xrm.Events.Attribute.ChangeEventHandler
    ): void {
      fields.forEach((field) => {
        field.addOnChange(handler);
      });
    }
    /**
     * Fire all "on change" event handlers.
     * @param fields An array of fields to on which this method should be applied.
     */
    static fireOnChange(fields: Class.Field[]): void {
      fields.forEach((field) => {
        field.fireOnChange();
      });
    }
    /**
     * Removes the handler from the "on change" event.
     * @param fields An array of fields to on which this method should be applied.
     * @param handler The handler.
     */
    static removeOnChange(
      fields: Class.Field[],
      handler: Xrm.Events.Attribute.ChangeEventHandler
    ): void {
      fields.forEach((field) => {
        field.removeOnChange(handler);
      });
    }
    /**
     * Sets the required level.
     * @param fields An array of fields to on which this method should be applied.
     * @param requirementLevel The requirement level, as either "none", "required", or "recommended"
     */
    static setRequiredLevel(
      fields: Class.Field[],
      requirementLevel: Xrm.Attributes.RequirementLevel
    ): void {
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
    static setSubmitMode(
      fields: Class.Field[],
      submitMode: Xrm.SubmitMode
    ): void {
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
    static setValue(fields: Class.Field[], value: any): void {
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
    static setIsValid(
      fields: Class.Field[],
      isValid: boolean,
      message?: string
    ): void {
      fields.forEach((field) => {
        field.setIsValid(isValid, message);
      });
    }
    /**
     * Sets the required level.
     * @param fields An array of fields to on which this method should be applied.
     * @param required The requirement level, as either false for "none" or true for "required"
     */
    static setRequired(fields: Class.Field[], required: boolean): void {
      fields.forEach((field) => {
        field.setRequired(required);
      });
    }
    /**
     * Sets the state of the control to either enabled, or disabled.
     * @param fields An array of fields to on which this method should be applied.
     * @param disabled true to disable, false to enable.
     */
    static setDisabled(fields: Class.Field[], disabled: boolean): void {
      fields.forEach((field) => {
        field.setDisabled(disabled);
      });
    }
    /**
     * Sets the visibility state.
     * @param fields An array of fields to on which this method should be applied.
     * @param visible true to show, false to hide.
     */
    static setVisible(fields: Class.Field[], visible: boolean): void {
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
    static setNotification(
      fields: Class.Field[],
      message: string,
      uniqueId: string
    ): void {
      fields.forEach((field) => {
        field.setNotification(message, uniqueId);
      });
    }
    /**
     * Displays an error or recommendation notification for a control, and lets you specify actions to execute based on the notification.
     * @param fields An array of fields to on which this method should be applied.
     */
    static addNotification(
      fields: Class.Field[],
      message: string,
      notificationLevel: "ERROR" | "RECOMMENDATION",
      uniqueId: string,
      actions?: Xrm.Controls.ControlNotificationAction[]
    ): void {
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
    static removeNotification(fields: Class.Field[], uniqueId: string): void {
      fields.forEach((field) => {
        field.removeNotification(uniqueId);
      });
    }
  }

  /**
   * Represents a form in Dynamics 365.
   */
  export class Form {
    protected static _formContext: Xrm.FormContext;
    protected static _executionContext: Xrm.Events.EventContext;
    constructor() {}
    /**Gets a reference to the current form context*/
    static get formContext(): Xrm.FormContext {
      return this._formContext;
    }
    /**Gets a reference to the current executio context*/
    static get executionContext(): Xrm.Events.EventContext {
      return this._executionContext;
    }
    /**Gets a lookup value that references the record.*/
    static get entityReference() {
      return Form.formContext.data.entity.getEntityReference();
    }
    /**Sets a reference to the current form context*/
    static set formContext(context: Xrm.FormContext | Xrm.Events.EventContext) {
      if (!context)
        throw new Error(
          `XrmEx.Form.setFormContext: The executionContext or formContext was not passed to the function.`
        );
      if ("getFormContext" in context) {
        this._executionContext = context;
        this._formContext = context.getFormContext();
      } else if ("data" in context) this._formContext = context;
      else
        throw new Error(
          `XrmEx.Form.setFormContext: The passed context is not an executionContext or formContext.`
        );
    }
    /**Sets a reference to the current execution context*/
    static set executionContext(
      context: Xrm.FormContext | Xrm.Events.EventContext
    ) {
      if (!context)
        throw new Error(
          `XrmEx.Form.setExecutionContext: The executionContext or formContext was not passed to the function.`
        );
      if ("getFormContext" in context) {
        this._executionContext = context;
        this._formContext = context.getFormContext();
      } else if ("data" in context) this._formContext = context;
      else
        throw new Error(
          `XrmEx.Form.setExecutionContext: The passed context is not an executionContext or formContext.`
        );
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
    static addFormNotification(
      message: string,
      level: Xrm.FormNotificationLevel,
      uniqueId: string
    ) {
      try {
        return Form.formContext.ui.setFormNotification(
          message,
          level,
          uniqueId
        );
      } catch (error: any) {
        throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
      }
    }
    /**
     * Clears the form notification described by uniqueId.
     * @param uniqueId Unique identifier.
     * @returns True if it succeeds, otherwise false.
     */
    static removeFormNotification(uniqueId: string) {
      try {
        return Form.formContext.ui.clearFormNotification(uniqueId);
      } catch (error: any) {
        throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
      }
    }
    /**
     * Adds a handler to be called when the record is saved.
     */
    static addOnSave(
      handlers:
        | Xrm.Events.ContextSensitiveHandler
        | Xrm.Events.ContextSensitiveHandler[]
    ) {
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
      } catch (error: any) {
        throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
      }
    }
    /**
     * Adds a function to be called after the OnSave is complete.
     * @param handler The handler.
     * @remarks Added in 9.2
     * @see {@link https://docs.microsoft.com/en-us/powerapps/developer/model-driven-apps/clientapi/reference/events/postsave External Link: PostSave Event Documentation}
     */
    static addOnPostSave(
      handlers:
        | Xrm.Events.ContextSensitiveHandler
        | Xrm.Events.ContextSensitiveHandler[]
    ) {
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
      } catch (error: any) {
        throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
      }
    }
    /**
     * Adds a function to be called when form data is loaded.
     * @param handler The function to be executed when the form data loads. The function will be added to the bottom of the event handler pipeline.
     */
    static addOnLoad(
      handlers:
        | Xrm.Events.ContextSensitiveHandler
        | Xrm.Events.ContextSensitiveHandler[]
    ) {
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
      } catch (error: any) {
        throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
      }
    }
    /**
     * Adds a handler to be called when the attribute's value is changed.
     * @param handler The function reference.
     */
    static addOnChange(
      fields: Class.Field[],
      handlers:
        | Xrm.Events.ContextSensitiveHandler
        | Xrm.Events.ContextSensitiveHandler[],
      execute?: boolean
    ) {
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
      } catch (error: any) {
        throw new Error(`XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`);
      }
    }
  }

  export namespace Class {
    /**
     * Used to execute methods related to a single Attribute
     */
    export class Field implements Xrm.Attributes.Attribute {
      public readonly Name!: string;
      protected _attribute?: Xrm.Attributes.Attribute;

      constructor(attributeName: string) {
        this.Name = attributeName;
      }
      setValue(value: any): void {
        return this.Attribute.setValue(value);
      }
      getAttributeType(): Xrm.Attributes.AttributeType {
        return this.Attribute.getAttributeType();
      }
      getFormat(): Xrm.Attributes.AttributeFormat {
        return this.Attribute.getFormat();
      }
      getIsDirty(): boolean {
        return this.Attribute.getIsDirty();
      }
      getName(): string {
        return this.Attribute.getName();
      }
      getParent(): Xrm.Entity {
        return this.Attribute.getParent();
      }
      getRequiredLevel(): Xrm.Attributes.RequirementLevel {
        return this.Attribute.getRequiredLevel();
      }
      getSubmitMode(): Xrm.SubmitMode {
        return this.Attribute.getSubmitMode();
      }
      getUserPrivilege(): Xrm.Privilege {
        return this.Attribute.getUserPrivilege();
      }
      removeOnChange(handler: Xrm.Events.Attribute.ChangeEventHandler): void {
        return this.Attribute.removeOnChange(handler);
      }
      setSubmitMode(submitMode: Xrm.SubmitMode): void {
        return this.Attribute.setSubmitMode(submitMode);
      }
      getValue() {
        return this.Attribute.getValue();
      }
      setIsValid(isValid: boolean, message?: string): void {
        return this.Attribute.setIsValid(isValid, message);
      }

      public get Attribute(): Xrm.Attributes.Attribute {
        return (this._attribute ??=
          Form.formContext.getAttribute(this.Name) ??
          XrmEx.throwError(
            `The attribute '${this.Name}' was not found on the form.`
          ));
      }

      public get controls(): Xrm.Collection.ItemCollection<Xrm.Controls.StandardControl> {
        return this.Attribute.controls;
      }

      /**
       * Gets the value.
       * @returns The value.
       */
      public get Value(): any {
        return this.Attribute.getValue();
      }

      public set Value(value: any) {
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
      public setNotification(message: string, uniqueId: string): this {
        try {
          if (!message) throw new Error(`no message was provided.`);
          if (!uniqueId) throw new Error(`no uniqueId was provided.`);
          this.controls.forEach((control) =>
            control.setNotification(message, uniqueId)
          );
          return this;
        } catch (error: any) {
          throw new Error(
            `XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`
          );
        }
      }

      /**
       * Sets the visibility state.
       * @param visible true to show, false to hide.
       */
      public setVisible(visible: boolean): this {
        try {
          this.controls.forEach((control) => control.setVisible(visible));
          return this;
        } catch (error: any) {
          throw new Error(
            `XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`
          );
        }
      }

      /**
       * Sets the state of the control to either enabled, or disabled.
       * @param disabled true to disable, false to enable.
       */
      public setDisabled(disabled: boolean): this {
        try {
          this.controls.forEach((control) => control.setDisabled(disabled));
          return this;
        } catch (error: any) {
          throw new Error(
            `XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`
          );
        }
      }

      /**
       * Sets the required level.
       * @param requirementLevel The requirement level, as either "none", "required", or "recommended"
       */
      public setRequiredLevel(
        requirementLevel: Xrm.Attributes.RequirementLevel
      ): this {
        try {
          this.Attribute.setRequiredLevel(requirementLevel);
          return this;
        } catch (error: any) {
          throw new Error(
            `XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`
          );
        }
      }

      /**
       * Sets the required level.
       * @param required The requirement level, as either false for "none" or true for "required"
       */
      public setRequired(required: boolean): this {
        try {
          this.Attribute.setRequiredLevel(required ? "required" : "none");
          return this;
        } catch (error: any) {
          throw new Error(
            `XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`
          );
        }
      }

      /**Fire all "on change" event handlers. */
      public fireOnChange(): this {
        try {
          this.Attribute.fireOnChange();
          return this;
        } catch (error: any) {
          throw new Error(
            `XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`
          );
        }
      }

      /**
       * Adds a handler or an array of handlers to be called when the attribute's value is changed.
       * @param handlers The function reference or an array of function references.
       */
      public addOnChange(
        handlers:
          | Xrm.Events.ContextSensitiveHandler
          | Xrm.Events.ContextSensitiveHandler[]
      ): this {
        try {
          if (Array.isArray(handlers)) {
            for (const handler of handlers) {
              if (typeof handler !== "function")
                throw new Error(`'${handler}' is not a function`);
              this.Attribute.removeOnChange(handler);
              this.Attribute.addOnChange(handler);
            }
          } else {
            if (typeof handlers !== "function")
              throw new Error(`'${handlers}' is not a function`);
            this.Attribute.removeOnChange(handlers);
            this.Attribute.addOnChange(handlers);
          }
          return this;
        } catch (error: any) {
          throw new Error(
            `XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`
          );
        }
      }

      /**
       * Displays an error or recommendation notification for a control, and lets you specify actions to execute based on the notification.
       */
      public addNotification(
        message: string,
        notificationLevel: "ERROR" | "RECOMMENDATION",
        uniqueId: string,
        actions?: Xrm.Controls.ControlNotificationAction[]
      ): this {
        try {
          if (!uniqueId) throw new Error(`no uniqueId was provided.`);
          if (actions && !Array.isArray(actions))
            throw new Error(
              `the action parameter is not an array of ControlNotificationAction`
            );
          this.controls.forEach((control) => {
            control.addNotification({
              messages: [message],
              notificationLevel: notificationLevel,
              uniqueId: uniqueId,
              actions: actions,
            });
          });
          return this;
        } catch (error: any) {
          throw new Error(
            `XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`
          );
        }
      }
      /**
       * Clears the notification identified by uniqueId.
       * @param uniqueId (Optional) Unique identifier.
       * @returns true if it succeeds, false if it fails.
       * @remarks If the uniqueId parameter is not used, the current notification shown will be removed.
       */
      removeNotification(uniqueId: string): this {
        try {
          this.controls.forEach((control) => {
            control.clearNotification(uniqueId);
          });
          return this;
        } catch (error: any) {
          throw new Error(
            `XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`
          );
        }
      }
    }
    export class TextField
      extends Field
      implements Xrm.Attributes.StringAttribute
    {
      protected declare _attribute: Xrm.Attributes.StringAttribute;
      constructor(attribute: string) {
        super(attribute);
      }
      getMaxLength(): number {
        return this.Attribute.getMaxLength();
      }
      getFormat(): Xrm.Attributes.StringAttributeFormat {
        return this.Attribute.getFormat() as Xrm.Attributes.StringAttributeFormat;
      }
      get Attribute() {
        return (this._attribute ??=
          Form.formContext.getAttribute(this.Name) ??
          XrmEx.throwError(`Field '${this.Name}' does not exist`));
      }
      get controls() {
        return this.Attribute.controls;
      }
      get Value(): string {
        return this.Attribute.getValue() ?? null;
      }
      set Value(value: string) {
        this.Attribute.setValue(value);
      }
    }
    export class NumberField
      extends Field
      implements Xrm.Attributes.NumberAttribute
    {
      protected declare _attribute: Xrm.Attributes.NumberAttribute;
      constructor(attribute: string) {
        super(attribute);
      }
      getFormat(): Xrm.Attributes.IntegerAttributeFormat {
        return this.Attribute.getFormat() as Xrm.Attributes.IntegerAttributeFormat;
      }
      getMax(): number {
        return this.Attribute.getMax();
      }
      getMin(): number {
        return this.Attribute.getMin();
      }
      getPrecision(): number {
        return this.Attribute.getPrecision();
      }
      setPrecision(precision: number): void {
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
      get Value(): number {
        return this.Attribute.getValue() ?? null;
      }
      set Value(value: number) {
        this.Attribute.setValue(value);
      }
    }
    export class DateField
      extends Field
      implements Xrm.Attributes.DateAttribute
    {
      protected declare _attribute: Xrm.Attributes.DateAttribute;
      constructor(attribute: string) {
        super(attribute);
      }
      getFormat(): Xrm.Attributes.DateAttributeFormat {
        return this.Attribute.getFormat() as Xrm.Attributes.DateAttributeFormat;
      }
      get Attribute() {
        return (this._attribute ??=
          Form.formContext.getAttribute(this.Name) ??
          XrmEx.throwError(`Field '${this.Name}' does not exist`));
      }
      get controls() {
        return this.Attribute.controls;
      }
      get Value(): Date {
        return this.Attribute.getValue() ?? null;
      }
      set Value(value: Date) {
        this.Attribute.setValue(value);
      }
    }
    export class BooleanField
      extends Field
      implements Xrm.Attributes.BooleanAttribute
    {
      protected declare _attribute: Xrm.Attributes.BooleanAttribute;
      constructor(attribute: string) {
        super(attribute);
      }
      getAttributeType() {
        return this.Attribute.getAttributeType();
      }
      getInitialValue(): boolean {
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
      get Value(): boolean {
        return this.Attribute.getValue() ?? null;
      }
      set Value(value: boolean) {
        this.Attribute.setValue(value);
      }
    }
    export class MultiSelectOptionSetField<Options extends OptionValues>
      extends Field
      implements Xrm.Attributes.MultiSelectOptionSetAttribute
    {
      protected declare _attribute: Xrm.Attributes.MultiSelectOptionSetAttribute;
      Option: Options;
      constructor(attributeName: string, option?: Options) {
        super(attributeName);
        this.Option = option;
      }
      getFormat(): Xrm.Attributes.OptionSetAttributeFormat {
        return this.Attribute.getFormat() as Xrm.Attributes.OptionSetAttributeFormat;
      }
      getOption(value: number | string): Xrm.OptionSetValue {
        if (typeof value === "number") {
          return this.Attribute.getOption(value);
        } else {
          return this.Attribute.getOption(value);
        }
      }
      getOptions(): Xrm.OptionSetValue[] {
        return this.Attribute.getOptions();
      }
      getSelectedOption(): Xrm.OptionSetValue[] {
        return this.Attribute.getSelectedOption();
      }
      getText(): string[] {
        return this.Attribute.getText();
      }
      getInitialValue(): number[] {
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
      get Value(): number[] {
        return this.Attribute.getValue();
      }
      set Value(value: (keyof Options)[] | number[]) {
        if (Array.isArray(value)) {
          let values = [];
          value.forEach((v) => {
            if (typeof v == "number") values.push(v);
            else values.push(this.Option[v]);
          });
          this.Attribute.setValue(values);
        } else XrmEx.throwError(`Field Value '${value}' is not an Array`);
      }
    }
    export class LookupField
      extends Field
      implements Xrm.Attributes.LookupAttribute
    {
      protected declare _attribute: Xrm.Attributes.LookupAttribute;
      protected _customFilters: any = [];
      private viewId = crypto.randomUUID();
      constructor(attribute: string) {
        super(attribute);
      }
      getIsPartyList(): boolean {
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
      get Value(): Xrm.LookupValue[] {
        return this.Attribute.getValue() ?? null;
      }
      set Value(value: Xrm.LookupValue[]) {
        this.Attribute.setValue(value);
      }
      /**
       * Sets the value of a lookup
       * @param id Guid of the record
       * @param entityType logicalname of the entity
       * @param name formatted value
       * @param append if true, adds value to the array instead of replacing it
       */
      setLookupValue(
        id: string,
        entityType: any,
        name: any,
        append = false
      ): this {
        try {
          if (!id) throw new Error(`no id parameter was provided.`);
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
        } catch (error: any) {
          throw new Error(
            `XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`
          );
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
      setLookupFromRetrieve(
        selectName: string,
        retrievedRecord: { [x: string]: any }
      ) {
        if (!selectName.endsWith("_value")) selectName = `_${selectName}_value`;
        if (!retrievedRecord || !retrievedRecord[`${selectName}`]) {
          this.Value = null;
          return;
        }
        this.Value = [
          {
            id: retrievedRecord[`${selectName}`],
            entityType:
              retrievedRecord[
                `${selectName}@Microsoft.Dynamics.CRM.lookuplogicalname`
              ],
            name: retrievedRecord[
              `${selectName}@OData.Community.Display.V1.FormattedValue`
            ],
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
      async retrieve(options: string) {
        try {
          if (!this.Id || !this.EntityType) return null;
          const record = await Xrm.WebApi.retrieveRecord(
            this.EntityType,
            this.Id,
            options
          );
          return record;
        } catch (error: any) {
          throw new Error(
            `XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`
          );
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
      addPreFilterToLookup(
        filterXml: string,
        entityLogicalName?: string
      ): this {
        try {
          _addCustomFilter.controls = this.controls;
          this.controls.forEach((control) => {
            control.addPreSearch(_addCustomFilter);
          });
          this._customFilters.push(_addCustomFilter);
          return this;
        } catch (error: any) {
          throw new Error(
            `XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`
          );
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
      async addPreFilterToLookupAdvanced(
        entityLogicalName: string,
        primaryAttributeIdName: string,
        fetchXml: string
      ): Promise<void> {
        try {
          const result = await Xrm.WebApi.online.retrieveMultipleRecords(
            entityLogicalName,
            "?fetchXml=" + fetchXml
          );
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
        } catch (error: any) {
          throw new Error(
            `XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`
          );
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
      addCustomView(fetchXml: string): this {
        try {
          if (!fetchXml) {
            throw new Error("FetchXML is required");
          }
          const targetEntity = this.extractEntityFromFetchXml(fetchXml);
          const layoutXml = this.generateLayoutXml(fetchXml);

          this.controls.forEach((control) => {
            control.addCustomView(
              this.viewId,
              targetEntity,
              "Filtered View",
              fetchXml,
              layoutXml,
              true
            );
          });
          return this;
        } catch (error: any) {
          throw new Error(
            `XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`
          );
        }
      }

      /**
       * Extracts entity name from fetchXml
       */
      private extractEntityFromFetchXml(fetchXml: string): string {
        const match = fetchXml.match(/<entity.*?name=['"](.*?)['"]/);
        if (!match) {
          throw new Error("Could not extract entity name from fetchXml");
        }
        return match[1];
      }

      /**
       * Generates layoutXml based on fetchXml attributes
       */
      private generateLayoutXml(fetchXml: string): string {
        const attributes: string[] = [];
        const regex = /<attribute.*?name=['"](.*?)['"]/g;
        let match;

        // Get up to 3 non-id attributes
        while (
          (match = regex.exec(fetchXml)) !== null &&
          attributes.length < 3
        ) {
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
      clearPreFilterFromLookup(): this {
        try {
          this._customFilters.forEach(
            (customFilter: Xrm.Events.ContextSensitiveHandler) => {
              this.controls.forEach((control) => {
                control.removePreSearch(customFilter);
              });
            }
          );
          return this;
        } catch (error: any) {
          throw new Error(
            `XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`
          );
        }
      }
    }
    type OptionValues = {
      [key: string]: number;
    };
    export class OptionsetField<Options extends OptionValues>
      extends Field
      implements Xrm.Attributes.OptionSetAttribute
    {
      protected declare _attribute: Xrm.Attributes.OptionSetAttribute;
      protected _control!: Xrm.Controls.OptionSetControl;
      Option: Options;
      constructor(attributeName: string, option?: Options) {
        super(attributeName);
        this.Option = option;
      }
      getFormat(): Xrm.Attributes.OptionSetAttributeFormat {
        return this.Attribute.getFormat() as Xrm.Attributes.OptionSetAttributeFormat;
      }
      getOption(value: number | string): Xrm.OptionSetValue {
        if (typeof value === "number") {
          return this.Attribute.getOption(value);
        } else {
          return this.Attribute.getOption(value);
        }
      }
      getOptions(): Xrm.OptionSetValue[] {
        return this.Attribute.getOptions();
      }
      getSelectedOption(): Xrm.OptionSetValue {
        return this.Attribute.getSelectedOption();
      }
      getText(): string {
        return this.Attribute.getText();
      }
      getInitialValue(): number {
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
      get Value(): number {
        return this.Attribute.getValue();
      }
      set Value(value: keyof Options | number) {
        if (typeof value == "number") this.Attribute.setValue(value);
        else this.Attribute.setValue(this.Option[value]);
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
      addOption(values: number[], index?: number): this {
        try {
          if (!Array.isArray(values))
            throw new Error(`values is not an Array:\nvalues: '${values}'`);
          const optionSetValues =
            this.control.getAttribute().getOptions() ?? [];
          for (const element of optionSetValues) {
            if (values.includes(element.value)) {
              this.control.addOption(element, index);
            }
          }
          return this;
        } catch (error: any) {
          throw new Error(
            `XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`
          );
        }
      }
      /**
       * Removes the option matching the value.
       *
       * @param value The value.
       */
      removeOption(values: number[]): this {
        try {
          if (!Array.isArray(values))
            throw new Error(`values is not an Array:\nvalues: '${values}'`);
          const optionSetValues =
            this.control.getAttribute().getOptions() ?? [];
          for (const element of optionSetValues) {
            if (values.includes(element.value)) {
              this.control.removeOption(element.value);
            }
          }
          return this;
        } catch (error: any) {
          throw new Error(
            `XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`
          );
        }
      }
      /**
       * Clears all options.
       */
      clearOptions(): this {
        try {
          this.control.clearOptions();
          return this;
        } catch (error: any) {
          throw new Error(
            `XrmEx.${XrmEx.getFunctionName()}:\n${error.message}`
          );
        }
      }
    }
    export class Section implements Xrm.Controls.Section {
      public readonly Name!: string;
      protected _section?: Xrm.Controls.Section;
      public parentTab?: Xrm.Controls.Tab;
      constructor(name: string) {
        this.Name = name;
      }
      public get Section(): Xrm.Controls.Section {
        return (this._section ??=
          this.parentTab.sections.get(this.Name) ??
          XrmEx.throwError(
            `The section '${this.Name}' was not found on the form.`
          ));
      }
      getName(): string {
        return this.Section.getName();
      }
      getParent(): Xrm.Controls.Tab {
        return this.Section.getParent();
      }
      controls: Xrm.Collection.ItemCollection<Xrm.Controls.Control>;
      setVisible(visible: boolean): void {
        return this.Section.setVisible(visible);
      }
      getVisible(): boolean {
        return this.Section.getVisible();
      }
      getLabel(): string {
        return this.Section.getLabel();
      }
      setLabel(label: string): void {
        return this.Section.setLabel(label);
      }
    }
    type TabSections = {
      [key: string]: Section;
    };
    export class Tab<Sections extends TabSections> implements Xrm.Controls.Tab {
      public readonly Name!: string;
      protected _tab?: Xrm.Controls.Tab;
      Section: Sections;
      constructor(name: string, section?: Sections) {
        this.Name = name;
        this.Section = section;
        for (let key in section) {
          section[key].parentTab = this;
        }
      }
      get sections() {
        return this.Tab.sections;
      }
      public get Tab(): Xrm.Controls.Tab {
        return (this._tab ??=
          Form.formContext.ui.tabs.get(this.Name) ??
          XrmEx.throwError(
            `The tab '${this.Name}' was not found on the form.`
          ));
      }
      addTabStateChange(handler: Xrm.Events.ContextSensitiveHandler): void {
        return this.Tab.addTabStateChange(handler);
      }
      getDisplayState(): Xrm.DisplayState {
        return this.Tab.getDisplayState();
      }
      getName(): string {
        return this.Tab.getName();
      }
      getParent(): Xrm.Ui {
        return this.Tab.getParent();
      }
      removeTabStateChange(handler: Xrm.Events.ContextSensitiveHandler): void {
        return this.Tab.removeTabStateChange(handler);
      }
      setDisplayState(displayState: Xrm.DisplayState): void {
        return this.Tab.setDisplayState(displayState);
      }
      setVisible(visible: boolean): void {
        return this.Tab.setVisible(visible);
      }
      getVisible(): boolean {
        return this.Tab.getVisible();
      }
      getLabel(): string {
        return this.Tab.getLabel();
      }
      setLabel(label: string): void {
        return this.Tab.setLabel(label);
      }
      setFocus(): void {
        return this.Tab.setFocus();
      }
    }
    export class GridControl implements Xrm.Controls.GridControl {
      public readonly Name!: string;
      protected _gridControl?: Xrm.Controls.GridControl;
      constructor(name: string) {
        this.Name = name;
      }
      public get GridControl(): Xrm.Controls.GridControl {
        return (
          (this._gridControl ??=
            Form.formContext.getControl<Xrm.Controls.GridControl>(this.Name)) ??
          XrmEx.throwError(`The grid '${this.Name}' was not found on the form.`)
        );
      }
      public get Grid(): Xrm.Controls.Grid {
        return this.GridControl.getGrid();
      }
      addOnLoad(handler: Xrm.Events.GridControl.LoadEventHandler): void {
        this.GridControl.removeOnLoad(handler as any);
        return this.GridControl.addOnLoad(handler);
      }
      getContextType(): XrmEnum.GridControlContext {
        return this.GridControl.getContextType();
      }
      getEntityName(): string {
        return this.GridControl.getEntityName();
      }
      getFetchXml(): string {
        return this.GridControl.getFetchXml();
      }
      getGrid(): Xrm.Controls.Grid {
        return this.GridControl.getGrid();
      }
      getRelationship(): Xrm.Controls.GridRelationship {
        return this.GridControl.getRelationship();
      }
      getUrl(client?: XrmEnum.GridClient): string {
        return this.GridControl.getUrl(client);
      }
      getViewSelector(): Xrm.Controls.ViewSelector {
        return this.GridControl.getViewSelector();
      }
      openRelatedGrid(): void {
        return this.GridControl.openRelatedGrid();
      }
      refresh(): void {
        return this.GridControl.refresh();
      }
      refreshRibbon(): void {
        return this.GridControl.refreshRibbon();
      }
      removeOnLoad(handler: () => void): void {
        return this.GridControl.removeOnLoad(handler);
      }
      getControlType(): string {
        return this.GridControl.getControlType();
      }
      getName(): string {
        return this.GridControl.getName();
      }
      getParent(): Xrm.Controls.Section {
        return this.GridControl.getParent();
      }
      getLabel(): string {
        return this.GridControl.getLabel();
      }
      setLabel(label: string): void {
        return this.GridControl.setLabel(label);
      }
      getVisible(): boolean {
        return this.GridControl.getVisible();
      }
      setVisible(visible: boolean): void {
        return this.GridControl.setVisible(visible);
      }
    }
  }
}
