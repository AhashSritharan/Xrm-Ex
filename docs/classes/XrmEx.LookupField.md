[xrm-ex](https://github.com/AhashSritharan/README.md) / [Exports](https://github.com/AhashSritharan/modules.md) / [XrmEx](https://github.com/AhashSritharan/modules/XrmEx.md) / LookupField

# Class: LookupField

[XrmEx](https://github.com/AhashSritharan/modules/XrmEx.md).LookupField

Used to execute methods related to a single Attribute

## Hierarchy

- [`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)

  ↳ **`LookupField`**

## Implements

- `LookupAttribute`

## Table of contents

### Constructors

- [constructor](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#constructor)

### Properties

- [Name](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#name)
- [\_attribute](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#_attribute)
- [\_customFilters](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#_customfilters)
- [allFields](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#allfields)

### Accessors

- [Attribute](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#attribute)
- [EntityType](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#entitytype)
- [FormattedValue](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#formattedvalue)
- [Id](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#id)
- [Value](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#value)
- [controls](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#controls)

### Methods

- [addNotification](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#addnotification)
- [addOnChange](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#addonchange)
- [addPreFilterToLookup](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#addprefiltertolookup)
- [addPreFilterToLookupAdvanced](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#addprefiltertolookupadvanced)
- [clearPreFilterFromLookup](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#clearprefilterfromlookup)
- [fireOnChange](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#fireonchange)
- [getAttributeType](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#getattributetype)
- [getFormat](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#getformat)
- [getIsDirty](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#getisdirty)
- [getIsPartyList](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#getispartylist)
- [getName](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#getname)
- [getParent](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#getparent)
- [getRequiredLevel](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#getrequiredlevel)
- [getSubmitMode](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#getsubmitmode)
- [getUserPrivilege](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#getuserprivilege)
- [getValue](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#getvalue)
- [removeNotification](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#removenotification)
- [removeOnChange](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#removeonchange)
- [retrieve](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#retrieve)
- [setDisabled](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#setdisabled)
- [setIsValid](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#setisvalid)
- [setLookupValue](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#setlookupvalue)
- [setNotification](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#setnotification)
- [setRequired](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#setrequired)
- [setRequiredLevel](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#setrequiredlevel)
- [setSubmitMode](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#setsubmitmode)
- [setValue](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#setvalue)
- [setVisible](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md#setvisible)

## Constructors

### constructor

• **new LookupField**(`attribute`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `attribute` | `string` |

#### Overrides

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[constructor](https://github.com/AhashSritharan/classes/XrmEx.Field.md#constructor)

#### Defined in

[XrmEx.ts:1001](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1001)

## Properties

### Name

• `Readonly` **Name**: `string`

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[Name](https://github.com/AhashSritharan/classes/XrmEx.Field.md#name)

#### Defined in

[XrmEx.ts:586](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L586)

___

### \_attribute

• `Protected` **\_attribute**: `LookupAttribute`

#### Overrides

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[_attribute](https://github.com/AhashSritharan/classes/XrmEx.Field.md#_attribute)

#### Defined in

[XrmEx.ts:999](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L999)

___

### \_customFilters

• `Protected` **\_customFilters**: `any` = `[]`

#### Defined in

[XrmEx.ts:1000](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1000)

___

### allFields

▪ `Static` **allFields**: [`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)[] = `[]`

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[allFields](https://github.com/AhashSritharan/classes/XrmEx.Field.md#allfields)

#### Defined in

[XrmEx.ts:584](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L584)

## Accessors

### Attribute

• `get` **Attribute**(): `LookupAttribute`

#### Returns

`LookupAttribute`

#### Overrides

Field.Attribute

#### Defined in

[XrmEx.ts:1007](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1007)

___

### EntityType

• `get` **EntityType**(): `string`

Gets the entityType of the first lookup value

#### Returns

`string`

#### Defined in

[XrmEx.ts:1022](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1022)

___

### FormattedValue

• `get` **FormattedValue**(): `string`

Gets the formatted value of the first lookup value

#### Returns

`string`

#### Defined in

[XrmEx.ts:1028](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1028)

___

### Id

• `get` **Id**(): `string`

Gets the id of the first lookup value

#### Returns

`string`

#### Defined in

[XrmEx.ts:1016](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1016)

___

### Value

• `get` **Value**(): `LookupValue`[]

Gets the value.

#### Returns

`LookupValue`[]

The value.

#### Overrides

Field.Value

#### Defined in

[XrmEx.ts:1031](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1031)

• `set` **Value**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `LookupValue`[] |

#### Returns

`void`

#### Overrides

Field.Value

#### Defined in

[XrmEx.ts:1034](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1034)

___

### controls

• `get` **controls**(): `ItemCollection`<`LookupControl`\>

#### Returns

`ItemCollection`<`LookupControl`\>

#### Implementation of

Xrm.Attributes.LookupAttribute.controls

#### Overrides

Field.controls

#### Defined in

[XrmEx.ts:1012](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1012)

## Methods

### addNotification

▸ **addNotification**(`message`, `notificationLevel`, `uniqueId`, `actions?`): [`LookupField`](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md)

Displays an error or recommendation notification for a control, and lets you specify actions to execute based on the notification.

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `notificationLevel` | ``"ERROR"`` \| ``"RECOMMENDATION"`` |
| `uniqueId` | `string` |
| `actions?` | `ControlNotificationAction`[] |

#### Returns

[`LookupField`](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md)

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[addNotification](https://github.com/AhashSritharan/classes/XrmEx.Field.md#addnotification)

#### Defined in

[XrmEx.ts:780](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L780)

___

### addOnChange

▸ **addOnChange**(`handlers`): [`LookupField`](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md)

Adds a handler or an array of handlers to be called when the attribute's value is changed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `handlers` | `ContextSensitiveHandler` \| `ContextSensitiveHandler`[] | The function reference or an array of function references. |

#### Returns

[`LookupField`](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md)

#### Implementation of

Xrm.Attributes.LookupAttribute.addOnChange

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[addOnChange](https://github.com/AhashSritharan/classes/XrmEx.Field.md#addonchange)

#### Defined in

[XrmEx.ts:752](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L752)

___

### addPreFilterToLookup

▸ **addPreFilterToLookup**(`filterXml`, `entityLogicalName?`): [`LookupField`](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md)

Adds an additional custom filter to the lookup, with the "AND" filter operator.

**`Remarks`**

If entityLogicalName is not specified, the filter will be applied to all entities
             valid for the Lookup control.

**`Example`**

```ts
Example filter: <filter type="and">
                             <condition attribute="address1_city" operator="eq" value="Redmond" />
                             </filter>
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filterXml` | `string` | - |
| `entityLogicalName?` | `string` | (Optional) The logical name of the entity. |

#### Returns

[`LookupField`](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md)

#### Defined in

[XrmEx.ts:1107](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1107)

___

### addPreFilterToLookupAdvanced

▸ **addPreFilterToLookupAdvanced**(`entityLogicalName`, `primaryAttributeIdName`, `fetchXml`): `Promise`<`void`\>

Adds an additional custom filter to the lookup, with the "AND" filter operator.

**`Remarks`**

If entityLogicalName is not specified, the filter will be applied to all entities
             valid for the Lookup control.

**`Example`**

```ts
Example fetchXml: <fetch>
                             <entity name="contact">
                                 <filter>
                                 <condition attribute="address1_city" operator="eq" value="Redmond" />
                                 </filter>
                             </entity>
                             </fetch>
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `entityLogicalName` | `string` | (Optional) The logical name of the entity. |
| `primaryAttributeIdName` | `string` | (Optional) The logical name of the primary key. |
| `fetchXml` | `string` | Specifies the FetchXML used to filter. |

#### Returns

`Promise`<`void`\>

#### Defined in

[XrmEx.ts:1140](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1140)

___

### clearPreFilterFromLookup

▸ **clearPreFilterFromLookup**(): [`LookupField`](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md)

Removes all filters set on the current lookup attribute by using addPreFilterToLookup or addPreFilterToLookupAdvanced

#### Returns

[`LookupField`](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md)

#### Defined in

[XrmEx.ts:1175](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1175)

___

### fireOnChange

▸ **fireOnChange**(): [`LookupField`](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md)

Fire all "on change" event handlers.

#### Returns

[`LookupField`](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md)

#### Implementation of

Xrm.Attributes.LookupAttribute.fireOnChange

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[fireOnChange](https://github.com/AhashSritharan/classes/XrmEx.Field.md#fireonchange)

#### Defined in

[XrmEx.ts:739](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L739)

___

### getAttributeType

▸ **getAttributeType**(): `AttributeType`

#### Returns

`AttributeType`

#### Implementation of

Xrm.Attributes.LookupAttribute.getAttributeType

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getAttributeType](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getattributetype)

#### Defined in

[XrmEx.ts:602](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L602)

___

### getFormat

▸ **getFormat**(): `AttributeFormat`

#### Returns

`AttributeFormat`

#### Implementation of

Xrm.Attributes.LookupAttribute.getFormat

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getFormat](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getformat)

#### Defined in

[XrmEx.ts:605](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L605)

___

### getIsDirty

▸ **getIsDirty**(): `boolean`

#### Returns

`boolean`

#### Implementation of

Xrm.Attributes.LookupAttribute.getIsDirty

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getIsDirty](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getisdirty)

#### Defined in

[XrmEx.ts:608](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L608)

___

### getIsPartyList

▸ **getIsPartyList**(): `boolean`

#### Returns

`boolean`

#### Implementation of

Xrm.Attributes.LookupAttribute.getIsPartyList

#### Defined in

[XrmEx.ts:1004](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1004)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Attributes.LookupAttribute.getName

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getName](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getname)

#### Defined in

[XrmEx.ts:611](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L611)

___

### getParent

▸ **getParent**(): `Entity`

#### Returns

`Entity`

#### Implementation of

Xrm.Attributes.LookupAttribute.getParent

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getParent](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getparent)

#### Defined in

[XrmEx.ts:614](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L614)

___

### getRequiredLevel

▸ **getRequiredLevel**(): `RequirementLevel`

#### Returns

`RequirementLevel`

#### Implementation of

Xrm.Attributes.LookupAttribute.getRequiredLevel

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getRequiredLevel](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getrequiredlevel)

#### Defined in

[XrmEx.ts:617](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L617)

___

### getSubmitMode

▸ **getSubmitMode**(): `SubmitMode`

#### Returns

`SubmitMode`

#### Implementation of

Xrm.Attributes.LookupAttribute.getSubmitMode

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getSubmitMode](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getsubmitmode)

#### Defined in

[XrmEx.ts:620](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L620)

___

### getUserPrivilege

▸ **getUserPrivilege**(): `Privilege`

#### Returns

`Privilege`

#### Implementation of

Xrm.Attributes.LookupAttribute.getUserPrivilege

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getUserPrivilege](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getuserprivilege)

#### Defined in

[XrmEx.ts:623](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L623)

___

### getValue

▸ **getValue**(): `any`

#### Returns

`any`

#### Implementation of

Xrm.Attributes.LookupAttribute.getValue

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getValue](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getvalue)

#### Defined in

[XrmEx.ts:632](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L632)

___

### removeNotification

▸ **removeNotification**(`uniqueId`): [`LookupField`](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md)

Clears the notification identified by uniqueId.

**`Remarks`**

If the uniqueId parameter is not used, the current notification shown will be removed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `uniqueId` | `string` | (Optional) Unique identifier. |

#### Returns

[`LookupField`](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md)

true if it succeeds, false if it fails.

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[removeNotification](https://github.com/AhashSritharan/classes/XrmEx.Field.md#removenotification)

#### Defined in

[XrmEx.ts:811](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L811)

___

### removeOnChange

▸ **removeOnChange**(`handler`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `handler` | `ChangeEventHandler` |

#### Returns

`void`

#### Implementation of

Xrm.Attributes.LookupAttribute.removeOnChange

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[removeOnChange](https://github.com/AhashSritharan/classes/XrmEx.Field.md#removeonchange)

#### Defined in

[XrmEx.ts:626](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L626)

___

### retrieve

▸ **retrieve**(`options`): `Promise`<`any`\>

Retrieves an entity record.

**`Example`**

options example:
```ts
options: $select=name&$expand=primarycontactid($select=contactid,fullname)
```

**`See`**

[External Link: retrieveRecord (Client API reference)](https://docs.microsoft.com/en-us/dynamics365/customer-engagement/developer/clientapi/reference/xrm-webapi/retrieverecord)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `string` | (Optional) OData system query options, $select and $expand, to retrieve your data. - Use the $select system query option to limit the properties returned by including a comma-separated list of property names. This is an important performance best practice. If properties aren’t specified using $select, all properties will be returned. - Use the $expand system query option to control what data from related entities is returned. If you just include the name of the navigation property, you’ll receive all the properties for related records. You can limit the properties returned for related records using the $select system query option in parentheses after the navigation property name. Use this for both single-valued and collection-valued navigation properties. - You can also specify multiple query options by using & to separate the query options. |

#### Returns

`Promise`<`any`\>

On success, returns a promise containing a JSON object with the retrieved attributes and their values.

#### Defined in

[XrmEx.ts:1084](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1084)

___

### setDisabled

▸ **setDisabled**(`disabled`): [`LookupField`](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md)

Sets the state of the control to either enabled, or disabled.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `disabled` | `boolean` | true to disable, false to enable. |

#### Returns

[`LookupField`](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md)

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setDisabled](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setdisabled)

#### Defined in

[XrmEx.ts:701](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L701)

___

### setIsValid

▸ **setIsValid**(`isValid`, `message?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `isValid` | `boolean` |
| `message?` | `string` |

#### Returns

`void`

#### Implementation of

Xrm.Attributes.LookupAttribute.setIsValid

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setIsValid](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setisvalid)

#### Defined in

[XrmEx.ts:635](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L635)

___

### setLookupValue

▸ **setLookupValue**(`id`, `entityType`, `name`, `append?`): [`LookupField`](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md)

Sets the value of a lookup

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `id` | `string` | `undefined` | Guid of the record |
| `entityType` | `any` | `undefined` | logicalname of the entity |
| `name` | `any` | `undefined` | formatted value |
| `append` | `boolean` | `false` | if true, adds value to the array instead of replacing it |

#### Returns

[`LookupField`](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md)

#### Defined in

[XrmEx.ts:1044](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1044)

___

### setNotification

▸ **setNotification**(`message`, `uniqueId`): [`LookupField`](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md)

Sets a control-local notification message.

**`Remarks`**

When this method is used on Microsoft Dynamics CRM for tablets a red "X" icon
             appears next to the control. Tapping on the icon will display the message.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` | The message. |
| `uniqueId` | `string` | Unique identifier. |

#### Returns

[`LookupField`](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md)

true if it succeeds, false if it fails.

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setNotification](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setnotification)

#### Defined in

[XrmEx.ts:671](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L671)

___

### setRequired

▸ **setRequired**(`required`): [`LookupField`](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md)

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `required` | `boolean` | The requirement level, as either false for "none" or true for "required" |

#### Returns

[`LookupField`](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md)

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setRequired](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setrequired)

#### Defined in

[XrmEx.ts:729](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L729)

___

### setRequiredLevel

▸ **setRequiredLevel**(`requirementLevel`): [`LookupField`](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md)

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `requirementLevel` | `RequirementLevel` | The requirement level, as either "none", "required", or "recommended" |

#### Returns

[`LookupField`](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md)

#### Implementation of

Xrm.Attributes.LookupAttribute.setRequiredLevel

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setRequiredLevel](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setrequiredlevel)

#### Defined in

[XrmEx.ts:714](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L714)

___

### setSubmitMode

▸ **setSubmitMode**(`submitMode`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `submitMode` | `SubmitMode` |

#### Returns

`void`

#### Implementation of

Xrm.Attributes.LookupAttribute.setSubmitMode

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setSubmitMode](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setsubmitmode)

#### Defined in

[XrmEx.ts:629](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L629)

___

### setValue

▸ **setValue**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `any` |

#### Returns

`void`

#### Implementation of

Xrm.Attributes.LookupAttribute.setValue

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setValue](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setvalue)

#### Defined in

[XrmEx.ts:599](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L599)

___

### setVisible

▸ **setVisible**(`visible`): [`LookupField`](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md)

Sets the visibility state.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `visible` | `boolean` | true to show, false to hide. |

#### Returns

[`LookupField`](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md)

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setVisible](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setvisible)

#### Defined in

[XrmEx.ts:688](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L688)
