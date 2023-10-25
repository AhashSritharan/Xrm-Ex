/// <reference types="xrm" />
/// <reference types="xrm" />
/**
 * Represents a parameter for a request.
 * @type {Object} RequestParameter
 * @property {string} Name - The name of the parameter.
 * @property {'Boolean' | 'DateTime' | 'Decimal' | 'Entity' | 'EntityCollection' | 'EntityReference' | 'Float' | 'Integer' | 'Money' | 'Picklist' | 'String'} Type - The type of the parameter.
 * @property {*} Value - The value of the parameter.
 */
type RequestParameter = {
    Name: string;
    Type: "Boolean" | "DateTime" | "Decimal" | "Entity" | "EntityCollection" | "EntityReference" | "Float" | "Integer" | "Money" | "Picklist" | "String";
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
export declare namespace XrmEx {
    /**
     * Throws an error with the given error message.
     * @param {string} errorMessage - The error message to throw.
     * @throws {Error} - Always throws an error with the given error message.
     */
    function throwError(errorMessage: string): never;
    /**
     * Returns the name of the calling function.
     * @returns {string} - The name of the calling function.
     */
    function getFunctionName(): string;
    /**
     * Displays a notification for an app with the given message and level, and lets you specify whether to show a close button.
     * @param {string} message - The message to display in the notification.
     * @param {'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO'} level - The level of the notification. Can be 'SUCCESS', 'ERROR', 'WARNING', or 'INFO'.
     * @param {boolean} [showCloseButton=false] - Whether to show a close button on the notification. Defaults to false.
     * @returns {Promise<string>} - A promise that resolves with the ID of the created notification.
     */
    function addGlobalNotification(message: string, level: "SUCCESS" | "ERROR" | "WARNING" | "INFO", showCloseButton?: boolean): Promise<string>;
    /**
     * Clears a notification in the app with the given unique ID.
     * @param {string} uniqueId - The unique ID of the notification to clear.
     * @returns {Promise<string>} - A promise that resolves when the notification has been cleared.
     */
    function removeGlobalNotification(uniqueId: string): Promise<string>;
    /**
     * Retrieves the value of an environment variable by using its schema name as key.
     * If the environment variable has both a default value and a current value, this function will retrieve the current value.
     * @param {string} environmentVariableSchemaName - The schema name of the environment variable to retrieve.
     * @returns {Promise<string>} - A promise that resolves with the value of the environment variable.
     * @async
     */
    function getEnvironmentVariableValue(environmentVariableSchemaName: string): Promise<string>;
    /**
     * Checks if the given request parameter is of a supported type and has a valid value.
     * @param {RequestParameter} requestParameter - The request parameter to check.
     * @returns {void}
     * @throws {Error} - Throws an error if the request parameter is not of a supported type or has an invalid value.
     */
    function checkRequestParameterType(requestParameter: RequestParameter): void;
    /**
     * Executes an Action.
     * @param {string} actionName - The unique name of the action.
     * @param {RequestParameter[]} requestParameters - An array of objects with the parameter name, type and value.
     * @param {EntityReference} [boundEntity] - An optional EntityReference of the bound entity.
     * @returns {Promise<any>} - A Promise with the request response.
     * @throws {Error} - Throws an error if the request parameter is not of a supported type or has an invalid value.
     */
    function executeAction(actionName: string, requestParameters: RequestParameter[], boundEntity?: EntityReference): Promise<any>;
    /**
     * Executes a Function.
     * @param {string} functionName - The unique name of the function.
     * @param {RequestParameter[]} requestParameters - An array of objects with the parameter name, type and value.
     * @param {EntityReference} [boundEntity] - An optional EntityReference of the bound entity.
     * @returns {Promise<any>} - A Promise with the request response.
     * @throws {Error} - Throws an error if the request parameter is not of a supported type or has an invalid value.
     */
    function executeFunction(functionName: string, requestParameters: RequestParameter[], boundEntity?: EntityReference): Promise<any>;
    /**
     * Makes a GUID lowercase and removes brackets.
     * @param {string} guid - The GUID to normalize.
     * @returns {string} - The normalized GUID.
     */
    function normalizeGuid(guid: string): string;
    /**
     * Opens a dialog with dynamic height and width based on text content.
     * @param {string} title - The title of the dialog.
     * @param {string} text - The text content of the dialog.
     * @returns {Promise<any>} - A Promise with the dialog response.
     */
    function openAlertDialog(title: string, text: string): Promise<any>;
    /**
     * Represents a form in Dynamics 365.
     */
    class Form {
        protected static _formContext: Xrm.FormContext;
        protected static _executionContext: Xrm.Events.EventContext;
        constructor();
        /**Gets a reference to the current form context*/
        static get formContext(): Xrm.FormContext;
        /**Gets a reference to the current executio context*/
        static get executionContext(): Xrm.Events.EventContext;
        /**Gets a lookup value that references the record.*/
        static get entityReference(): Xrm.LookupValue;
        /**Sets a reference to the current form context*/
        static set formContext(context: Xrm.FormContext | Xrm.Events.EventContext);
        /**Sets a reference to the current execution context*/
        static set executionContext(context: Xrm.FormContext | Xrm.Events.EventContext);
        /**Returns true if form is from type create*/
        static get IsCreate(): boolean;
        /**Returns true if form is from type update*/
        static get IsUpdate(): boolean;
        /**Returns true if form is not from type create*/
        static get IsNotCreate(): boolean;
        /**Returns true if form is not from type update*/
        static get IsNotUpdate(): boolean;
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
        static addFormNotification(message: string, level: Xrm.FormNotificationLevel, uniqueId: string): boolean;
        /**
         * Clears the form notification described by uniqueId.
         * @param uniqueId Unique identifier.
         * @returns True if it succeeds, otherwise false.
         */
        static removeFormNotification(uniqueId: string): boolean;
        /**
         * Adds a handler to be called when the record is saved.
         */
        static addOnSaveEventHandler(handlers: Xrm.Events.ContextSensitiveHandler | Xrm.Events.ContextSensitiveHandler[]): void;
        /**
         * Adds a function to be called after the OnSave is complete.
         * @param handler The handler.
         * @remarks Added in 9.2
         * @see {@link https://docs.microsoft.com/en-us/powerapps/developer/model-driven-apps/clientapi/reference/events/postsave External Link: PostSave Event Documentation}
         */
        static addOnPostSaveEventHandler(handlers: Xrm.Events.ContextSensitiveHandler | Xrm.Events.ContextSensitiveHandler[]): void;
        /**
         * Adds a function to be called when form data is loaded.
         * @param handler The function to be executed when the form data loads. The function will be added to the bottom of the event handler pipeline.
         */
        static addOnLoadEventHandler(handlers: Xrm.Events.ContextSensitiveHandler | Xrm.Events.ContextSensitiveHandler[]): void;
        /**
         * Adds a handler to be called when the attribute's value is changed.
         * @param handler The function reference.
         */
        static addOnChangeEventHandler(fields: Class.Field[], handlers: Xrm.Events.ContextSensitiveHandler | Xrm.Events.ContextSensitiveHandler[], execute?: boolean): void;
    }
    namespace Class {
        /**
         * Used to execute methods related to a single Attribute
         */
        export class Field implements Xrm.Attributes.Attribute {
            static allFields: Field[];
            readonly Name: string;
            protected _attribute?: Xrm.Attributes.Attribute;
            constructor(attributeName: string);
            setValue(value: any): void;
            getAttributeType(): Xrm.Attributes.AttributeType;
            getFormat(): Xrm.Attributes.AttributeFormat;
            getIsDirty(): boolean;
            getName(): string;
            getParent(): Xrm.Entity;
            getRequiredLevel(): Xrm.Attributes.RequirementLevel;
            getSubmitMode(): Xrm.SubmitMode;
            getUserPrivilege(): Xrm.Privilege;
            removeOnChange(handler: Xrm.Events.Attribute.ChangeEventHandler): void;
            setSubmitMode(submitMode: Xrm.SubmitMode): void;
            getValue(): any;
            setIsValid(isValid: boolean, message?: string): void;
            get Attribute(): Xrm.Attributes.Attribute;
            get controls(): Xrm.Collection.ItemCollection<Xrm.Controls.StandardControl>;
            /**
             * Gets the value.
             * @returns The value.
             */
            get Value(): any;
            set Value(value: any);
            /**
             * Sets a control-local notification message.
             * @param message The message.
             * @param uniqueId Unique identifier.
             * @returns true if it succeeds, false if it fails.
             * @remarks     When this method is used on Microsoft Dynamics CRM for tablets a red "X" icon
             *              appears next to the control. Tapping on the icon will display the message.
             */
            setNotification(message: string, uniqueId: string): this;
            /**
             * Sets the visibility state.
             * @param visible true to show, false to hide.
             */
            setVisible(visible: boolean): this;
            /**
             * Sets the state of the control to either enabled, or disabled.
             * @param disabled true to disable, false to enable.
             */
            setDisabled(disabled: boolean): this;
            /**
             * Sets the required level.
             * @param requirementLevel The requirement level, as either "none", "required", or "recommended"
             */
            setRequiredLevel(requirementLevel: Xrm.Attributes.RequirementLevel): this;
            /**
             * Sets the required level.
             * @param required The requirement level, as either false for "none" or true for "required"
             */
            setRequired(required: boolean): this;
            /**Fire all "on change" event handlers. */
            fireOnChange(): this;
            /**
             * Adds a handler or an array of handlers to be called when the attribute's value is changed.
             * @param handlers The function reference or an array of function references.
             */
            addOnChange(handlers: Xrm.Events.ContextSensitiveHandler | Xrm.Events.ContextSensitiveHandler[]): this;
            /**
             * Displays an error or recommendation notification for a control, and lets you specify actions to execute based on the notification.
             */
            addNotification(message: string, notificationLevel: "ERROR" | "RECOMMENDATION", uniqueId: string, actions?: Xrm.Controls.ControlNotificationAction[]): this;
            /**
             * Clears the notification identified by uniqueId.
             * @param uniqueId (Optional) Unique identifier.
             * @returns true if it succeeds, false if it fails.
             * @remarks If the uniqueId parameter is not used, the current notification shown will be removed.
             */
            removeNotification(uniqueId: string): this;
        }
        export class TextField extends Field implements Xrm.Attributes.StringAttribute {
            protected _attribute: Xrm.Attributes.StringAttribute;
            constructor(attribute: string);
            getMaxLength(): number;
            getFormat(): Xrm.Attributes.StringAttributeFormat;
            get Attribute(): Xrm.Attributes.StringAttribute;
            get controls(): Xrm.Collection.ItemCollection<Xrm.Controls.StringControl>;
            get Value(): string;
            set Value(value: string);
        }
        export class NumberField extends Field implements Xrm.Attributes.NumberAttribute {
            protected _attribute: Xrm.Attributes.NumberAttribute;
            constructor(attribute: string);
            getFormat(): Xrm.Attributes.IntegerAttributeFormat;
            getMax(): number;
            getMin(): number;
            getPrecision(): number;
            setPrecision(precision: number): void;
            get Attribute(): Xrm.Attributes.NumberAttribute;
            get controls(): Xrm.Collection.ItemCollection<Xrm.Controls.NumberControl>;
            get Value(): number;
            set Value(value: number);
        }
        export class DateField extends Field implements Xrm.Attributes.DateAttribute {
            protected _attribute: Xrm.Attributes.DateAttribute;
            constructor(attribute: string);
            getFormat(): Xrm.Attributes.DateAttributeFormat;
            get Attribute(): Xrm.Attributes.DateAttribute;
            get controls(): Xrm.Collection.ItemCollection<Xrm.Controls.DateControl>;
            get Value(): Date;
            set Value(value: Date);
        }
        export class BooleanField extends Field implements Xrm.Attributes.BooleanAttribute {
            protected _attribute: Xrm.Attributes.BooleanAttribute;
            constructor(attribute: string);
            getAttributeType(): "boolean";
            getInitialValue(): boolean;
            get Attribute(): Xrm.Attributes.BooleanAttribute;
            get controls(): Xrm.Collection.ItemCollection<Xrm.Controls.BooleanControl>;
            get Value(): boolean;
            set Value(value: boolean);
        }
        export class MultiSelectOptionSetField<Options extends OptionValues> extends Field implements Xrm.Attributes.MultiSelectOptionSetAttribute {
            protected _attribute: Xrm.Attributes.MultiSelectOptionSetAttribute;
            Option: Options;
            constructor(attributeName: string, option?: Options);
            getFormat(): Xrm.Attributes.OptionSetAttributeFormat;
            getOption(value: number | string): Xrm.OptionSetValue;
            getOptions(): Xrm.OptionSetValue[];
            getSelectedOption(): Xrm.OptionSetValue[];
            getText(): string[];
            getInitialValue(): number[];
            get Attribute(): Xrm.Attributes.MultiSelectOptionSetAttribute;
            get controls(): Xrm.Collection.ItemCollection<Xrm.Controls.OptionSetControl>;
            get Value(): number[];
            set Value(value: (keyof Options)[] | number[]);
        }
        export class LookupField extends Field implements Xrm.Attributes.LookupAttribute {
            protected _attribute: Xrm.Attributes.LookupAttribute;
            protected _customFilters: any;
            constructor(attribute: string);
            getIsPartyList(): boolean;
            get Attribute(): Xrm.Attributes.LookupAttribute;
            get controls(): Xrm.Collection.ItemCollection<Xrm.Controls.LookupControl>;
            /**Gets the id of the first lookup value*/
            get Id(): string;
            /**Gets the entityType of the first lookup value*/
            get EntityType(): string;
            /**Gets the formatted value of the first lookup value*/
            get FormattedValue(): string;
            get Value(): Xrm.LookupValue[];
            set Value(value: Xrm.LookupValue[]);
            /**
             * Sets the value of a lookup
             * @param id Guid of the record
             * @param entityType logicalname of the entity
             * @param name formatted value
             * @param append if true, adds value to the array instead of replacing it
             */
            setLookupValue(id: string, entityType: any, name: any, append?: boolean): this;
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
            retrieve(options: string): Promise<any>;
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
            addPreFilterToLookup(filterXml: string, entityLogicalName?: string): this;
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
            addPreFilterToLookupAdvanced(entityLogicalName: string, primaryAttributeIdName: string, fetchXml: string): Promise<void>;
            /**
             * Removes all filters set on the current lookup attribute by using addPreFilterToLookup or addPreFilterToLookupAdvanced
             */
            clearPreFilterFromLookup(): this;
        }
        type OptionValues = {
            [key: string]: number;
        };
        export class OptionsetField<Options extends OptionValues> extends Field implements Xrm.Attributes.OptionSetAttribute {
            protected _attribute: Xrm.Attributes.OptionSetAttribute;
            protected _control: Xrm.Controls.OptionSetControl;
            Option: Options;
            constructor(attributeName: string, option?: Options);
            getFormat(): Xrm.Attributes.OptionSetAttributeFormat;
            getOption(value: number | string): Xrm.OptionSetValue;
            getOptions(): Xrm.OptionSetValue[];
            getSelectedOption(): Xrm.OptionSetValue;
            getText(): string;
            getInitialValue(): number;
            get Attribute(): Xrm.Attributes.OptionSetAttribute<number>;
            get controls(): Xrm.Collection.ItemCollection<Xrm.Controls.OptionSetControl>;
            get control(): Xrm.Controls.OptionSetControl;
            get Value(): number;
            set Value(value: keyof Options | number);
            /**
             * Adds an option.
             *
             * @param values an array with the option values to add
             * @param index (Optional) zero-based index of the option.
             *
             * @remarks This method does not check that the values within the options you add are valid.
             *          If index is not provided, the new option will be added to the end of the list.
             */
            addOption(values: number[], index?: number): this;
            /**
             * Removes the option matching the value.
             *
             * @param value The value.
             */
            removeOption(values: number[]): this;
            /**
             * Clears all options.
             */
            clearOptions(): this;
        }
        export class Section implements Xrm.Controls.Section {
            readonly Name: string;
            protected _section?: Xrm.Controls.Section;
            parentTab?: Xrm.Controls.Tab;
            constructor(name: string);
            get Section(): Xrm.Controls.Section;
            getName(): string;
            getParent(): Xrm.Controls.Tab;
            controls: Xrm.Collection.ItemCollection<Xrm.Controls.Control>;
            setVisible(visible: boolean): void;
            getVisible(): boolean;
            getLabel(): string;
            setLabel(label: string): void;
        }
        type TabSections = {
            [key: string]: Section;
        };
        export class Tab<Sections extends TabSections> implements Xrm.Controls.Tab {
            readonly Name: string;
            protected _tab?: Xrm.Controls.Tab;
            Section: Sections;
            constructor(name: string, section?: Sections);
            sections: Xrm.Collection.ItemCollection<Xrm.Controls.Section>;
            get Tab(): Xrm.Controls.Tab;
            addTabStateChange(handler: Xrm.Events.ContextSensitiveHandler): void;
            getDisplayState(): Xrm.DisplayState;
            getName(): string;
            getParent(): Xrm.Ui;
            removeTabStateChange(handler: Xrm.Events.ContextSensitiveHandler): void;
            setDisplayState(displayState: Xrm.DisplayState): void;
            setVisible(visible: boolean): void;
            getVisible(): boolean;
            getLabel(): string;
            setLabel(label: string): void;
            setFocus(): void;
        }
        export class GridControl implements Xrm.Controls.GridControl {
            readonly Name: string;
            protected _gridControl?: Xrm.Controls.GridControl;
            constructor(name: string);
            get GridControl(): Xrm.Controls.GridControl;
            get Grid(): Xrm.Controls.Grid;
            addOnLoad(handler: Xrm.Events.GridControl.LoadEventHandler): void;
            getContextType(): XrmEnum.GridControlContext;
            getEntityName(): string;
            getFetchXml(): string;
            getGrid(): Xrm.Controls.Grid;
            getRelationship(): Xrm.Controls.GridRelationship;
            getUrl(client?: XrmEnum.GridClient): string;
            getViewSelector(): Xrm.Controls.ViewSelector;
            openRelatedGrid(): void;
            refresh(): void;
            refreshRibbon(): void;
            removeOnLoad(handler: () => void): void;
            getControlType(): string;
            getName(): string;
            getParent(): Xrm.Controls.Section;
            getLabel(): string;
            setLabel(label: string): void;
            getVisible(): boolean;
            setVisible(visible: boolean): void;
        }
        export {};
    }
}
export {};
