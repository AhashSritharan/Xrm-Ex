[xrm-ex](../README.md) / [Exports](../modules.md) / [XrmEx](../modules/XrmEx.md) / LookupField

# Class: LookupField

[XrmEx](../modules/XrmEx.md).LookupField

Used to execute methods related to a single Attribute

## Hierarchy

- [`Field`](XrmEx.Field.md)

  ↳ **`LookupField`**

## Implements

- `LookupAttribute`

## Table of contents

### Constructors

- [constructor](XrmEx.LookupField.md#constructor)

### Properties

- [Name](XrmEx.LookupField.md#name)
- [\_attribute](XrmEx.LookupField.md#_attribute)
- [\_customFilters](XrmEx.LookupField.md#_customfilters)
- [allFields](XrmEx.LookupField.md#allfields)

### Accessors

- [Attribute](XrmEx.LookupField.md#attribute)
- [EntityType](XrmEx.LookupField.md#entitytype)
- [FormattedValue](XrmEx.LookupField.md#formattedvalue)
- [Id](XrmEx.LookupField.md#id)
- [Value](XrmEx.LookupField.md#value)
- [controls](XrmEx.LookupField.md#controls)

### Methods

- [addNotification](XrmEx.LookupField.md#addnotification)
- [addOnChange](XrmEx.LookupField.md#addonchange)
- [addPreFilterToLookup](XrmEx.LookupField.md#addprefiltertolookup)
- [addPreFilterToLookupAdvanced](XrmEx.LookupField.md#addprefiltertolookupadvanced)
- [clearPreFilterFromLookup](XrmEx.LookupField.md#clearprefilterfromlookup)
- [fireOnChange](XrmEx.LookupField.md#fireonchange)
- [getAttributeType](XrmEx.LookupField.md#getattributetype)
- [getFormat](XrmEx.LookupField.md#getformat)
- [getIsDirty](XrmEx.LookupField.md#getisdirty)
- [getIsPartyList](XrmEx.LookupField.md#getispartylist)
- [getName](XrmEx.LookupField.md#getname)
- [getParent](XrmEx.LookupField.md#getparent)
- [getRequiredLevel](XrmEx.LookupField.md#getrequiredlevel)
- [getSubmitMode](XrmEx.LookupField.md#getsubmitmode)
- [getUserPrivilege](XrmEx.LookupField.md#getuserprivilege)
- [getValue](XrmEx.LookupField.md#getvalue)
- [removeNotification](XrmEx.LookupField.md#removenotification)
- [removeOnChange](XrmEx.LookupField.md#removeonchange)
- [retrieve](XrmEx.LookupField.md#retrieve)
- [setDisabled](XrmEx.LookupField.md#setdisabled)
- [setIsValid](XrmEx.LookupField.md#setisvalid)
- [setLookupValue](XrmEx.LookupField.md#setlookupvalue)
- [setNotification](XrmEx.LookupField.md#setnotification)
- [setRequired](XrmEx.LookupField.md#setrequired)
- [setRequiredLevel](XrmEx.LookupField.md#setrequiredlevel)
- [setSubmitMode](XrmEx.LookupField.md#setsubmitmode)
- [setValue](XrmEx.LookupField.md#setvalue)
- [setVisible](XrmEx.LookupField.md#setvisible)

## Constructors

### constructor

• **new LookupField**(`attribute`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `attribute` | `string` |

#### Overrides

[Field](XrmEx.Field.md).[constructor](XrmEx.Field.md#constructor)

#### Defined in

[XrmEx.ts:999](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L999)

## Properties

### Name

• `Readonly` **Name**: `string`

#### Inherited from

[Field](XrmEx.Field.md).[Name](XrmEx.Field.md#name)

#### Defined in

[XrmEx.ts:584](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L584)

___

### \_attribute

• `Protected` **\_attribute**: `LookupAttribute`

#### Overrides

[Field](XrmEx.Field.md).[_attribute](XrmEx.Field.md#_attribute)

#### Defined in

[XrmEx.ts:997](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L997)

___

### \_customFilters

• `Protected` **\_customFilters**: `any` = `[]`

#### Defined in

[XrmEx.ts:998](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L998)

___

### allFields

▪ `Static` **allFields**: [`Field`](XrmEx.Field.md)[] = `[]`

#### Inherited from

[Field](XrmEx.Field.md).[allFields](XrmEx.Field.md#allfields)

#### Defined in

[XrmEx.ts:582](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L582)

## Accessors

### Attribute

• `get` **Attribute**(): `LookupAttribute`

#### Returns

`LookupAttribute`

#### Overrides

Field.Attribute

#### Defined in

[XrmEx.ts:1005](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L1005)

___

### EntityType

• `get` **EntityType**(): `string`

Gets the entityType of the first lookup value

#### Returns

`string`

#### Defined in

[XrmEx.ts:1020](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L1020)

___

### FormattedValue

• `get` **FormattedValue**(): `string`

Gets the formatted value of the first lookup value

#### Returns

`string`

#### Defined in

[XrmEx.ts:1026](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L1026)

___

### Id

• `get` **Id**(): `string`

Gets the id of the first lookup value

#### Returns

`string`

#### Defined in

[XrmEx.ts:1014](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L1014)

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

[XrmEx.ts:1029](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L1029)

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

[XrmEx.ts:1032](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L1032)

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

[XrmEx.ts:1010](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L1010)

## Methods

### addNotification

▸ **addNotification**(`message`, `notificationLevel`, `uniqueId`, `actions?`): [`LookupField`](XrmEx.LookupField.md)

Displays an error or recommendation notification for a control, and lets you specify actions to execute based on the notification.

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `notificationLevel` | ``"ERROR"`` \| ``"RECOMMENDATION"`` |
| `uniqueId` | `string` |
| `actions?` | `ControlNotificationAction`[] |

#### Returns

[`LookupField`](XrmEx.LookupField.md)

#### Inherited from

[Field](XrmEx.Field.md).[addNotification](XrmEx.Field.md#addnotification)

#### Defined in

[XrmEx.ts:778](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L778)

___

### addOnChange

▸ **addOnChange**(`handlers`): [`LookupField`](XrmEx.LookupField.md)

Adds a handler or an array of handlers to be called when the attribute's value is changed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `handlers` | `ContextSensitiveHandler` \| `ContextSensitiveHandler`[] | The function reference or an array of function references. |

#### Returns

[`LookupField`](XrmEx.LookupField.md)

#### Implementation of

Xrm.Attributes.LookupAttribute.addOnChange

#### Inherited from

[Field](XrmEx.Field.md).[addOnChange](XrmEx.Field.md#addonchange)

#### Defined in

[XrmEx.ts:750](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L750)

___

### addPreFilterToLookup

▸ **addPreFilterToLookup**(`filterXml`, `entityLogicalName?`): [`LookupField`](XrmEx.LookupField.md)

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

[`LookupField`](XrmEx.LookupField.md)

#### Defined in

[XrmEx.ts:1105](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L1105)

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

[XrmEx.ts:1138](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L1138)

___

### clearPreFilterFromLookup

▸ **clearPreFilterFromLookup**(): [`LookupField`](XrmEx.LookupField.md)

Removes all filters set on the current lookup attribute by using addPreFilterToLookup or addPreFilterToLookupAdvanced

#### Returns

[`LookupField`](XrmEx.LookupField.md)

#### Defined in

[XrmEx.ts:1173](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L1173)

___

### fireOnChange

▸ **fireOnChange**(): [`LookupField`](XrmEx.LookupField.md)

Fire all "on change" event handlers.

#### Returns

[`LookupField`](XrmEx.LookupField.md)

#### Implementation of

Xrm.Attributes.LookupAttribute.fireOnChange

#### Inherited from

[Field](XrmEx.Field.md).[fireOnChange](XrmEx.Field.md#fireonchange)

#### Defined in

[XrmEx.ts:737](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L737)

___

### getAttributeType

▸ **getAttributeType**(): `AttributeType`

#### Returns

`AttributeType`

#### Implementation of

Xrm.Attributes.LookupAttribute.getAttributeType

#### Inherited from

[Field](XrmEx.Field.md).[getAttributeType](XrmEx.Field.md#getattributetype)

#### Defined in

[XrmEx.ts:600](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L600)

___

### getFormat

▸ **getFormat**(): `AttributeFormat`

#### Returns

`AttributeFormat`

#### Implementation of

Xrm.Attributes.LookupAttribute.getFormat

#### Inherited from

[Field](XrmEx.Field.md).[getFormat](XrmEx.Field.md#getformat)

#### Defined in

[XrmEx.ts:603](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L603)

___

### getIsDirty

▸ **getIsDirty**(): `boolean`

#### Returns

`boolean`

#### Implementation of

Xrm.Attributes.LookupAttribute.getIsDirty

#### Inherited from

[Field](XrmEx.Field.md).[getIsDirty](XrmEx.Field.md#getisdirty)

#### Defined in

[XrmEx.ts:606](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L606)

___

### getIsPartyList

▸ **getIsPartyList**(): `boolean`

#### Returns

`boolean`

#### Implementation of

Xrm.Attributes.LookupAttribute.getIsPartyList

#### Defined in

[XrmEx.ts:1002](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L1002)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Attributes.LookupAttribute.getName

#### Inherited from

[Field](XrmEx.Field.md).[getName](XrmEx.Field.md#getname)

#### Defined in

[XrmEx.ts:609](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L609)

___

### getParent

▸ **getParent**(): `Entity`

#### Returns

`Entity`

#### Implementation of

Xrm.Attributes.LookupAttribute.getParent

#### Inherited from

[Field](XrmEx.Field.md).[getParent](XrmEx.Field.md#getparent)

#### Defined in

[XrmEx.ts:612](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L612)

___

### getRequiredLevel

▸ **getRequiredLevel**(): `RequirementLevel`

#### Returns

`RequirementLevel`

#### Implementation of

Xrm.Attributes.LookupAttribute.getRequiredLevel

#### Inherited from

[Field](XrmEx.Field.md).[getRequiredLevel](XrmEx.Field.md#getrequiredlevel)

#### Defined in

[XrmEx.ts:615](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L615)

___

### getSubmitMode

▸ **getSubmitMode**(): `SubmitMode`

#### Returns

`SubmitMode`

#### Implementation of

Xrm.Attributes.LookupAttribute.getSubmitMode

#### Inherited from

[Field](XrmEx.Field.md).[getSubmitMode](XrmEx.Field.md#getsubmitmode)

#### Defined in

[XrmEx.ts:618](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L618)

___

### getUserPrivilege

▸ **getUserPrivilege**(): `Privilege`

#### Returns

`Privilege`

#### Implementation of

Xrm.Attributes.LookupAttribute.getUserPrivilege

#### Inherited from

[Field](XrmEx.Field.md).[getUserPrivilege](XrmEx.Field.md#getuserprivilege)

#### Defined in

[XrmEx.ts:621](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L621)

___

### getValue

▸ **getValue**(): `any`

#### Returns

`any`

#### Implementation of

Xrm.Attributes.LookupAttribute.getValue

#### Inherited from

[Field](XrmEx.Field.md).[getValue](XrmEx.Field.md#getvalue)

#### Defined in

[XrmEx.ts:630](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L630)

___

### removeNotification

▸ **removeNotification**(`uniqueId`): [`LookupField`](XrmEx.LookupField.md)

Clears the notification identified by uniqueId.

**`Remarks`**

If the uniqueId parameter is not used, the current notification shown will be removed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `uniqueId` | `string` | (Optional) Unique identifier. |

#### Returns

[`LookupField`](XrmEx.LookupField.md)

true if it succeeds, false if it fails.

#### Inherited from

[Field](XrmEx.Field.md).[removeNotification](XrmEx.Field.md#removenotification)

#### Defined in

[XrmEx.ts:809](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L809)

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

[Field](XrmEx.Field.md).[removeOnChange](XrmEx.Field.md#removeonchange)

#### Defined in

[XrmEx.ts:624](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L624)

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

[XrmEx.ts:1082](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L1082)

___

### setDisabled

▸ **setDisabled**(`disabled`): [`LookupField`](XrmEx.LookupField.md)

Sets the state of the control to either enabled, or disabled.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `disabled` | `boolean` | true to disable, false to enable. |

#### Returns

[`LookupField`](XrmEx.LookupField.md)

#### Inherited from

[Field](XrmEx.Field.md).[setDisabled](XrmEx.Field.md#setdisabled)

#### Defined in

[XrmEx.ts:699](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L699)

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

[Field](XrmEx.Field.md).[setIsValid](XrmEx.Field.md#setisvalid)

#### Defined in

[XrmEx.ts:633](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L633)

___

### setLookupValue

▸ **setLookupValue**(`id`, `entityType`, `name`, `append?`): [`LookupField`](XrmEx.LookupField.md)

Sets the value of a lookup

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `id` | `string` | `undefined` | Guid of the record |
| `entityType` | `any` | `undefined` | logicalname of the entity |
| `name` | `any` | `undefined` | formatted value |
| `append` | `boolean` | `false` | if true, adds value to the array instead of replacing it |

#### Returns

[`LookupField`](XrmEx.LookupField.md)

#### Defined in

[XrmEx.ts:1042](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L1042)

___

### setNotification

▸ **setNotification**(`message`, `uniqueId`): [`LookupField`](XrmEx.LookupField.md)

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

[`LookupField`](XrmEx.LookupField.md)

true if it succeeds, false if it fails.

#### Inherited from

[Field](XrmEx.Field.md).[setNotification](XrmEx.Field.md#setnotification)

#### Defined in

[XrmEx.ts:669](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L669)

___

### setRequired

▸ **setRequired**(`required`): [`LookupField`](XrmEx.LookupField.md)

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `required` | `boolean` | The requirement level, as either false for "none" or true for "required" |

#### Returns

[`LookupField`](XrmEx.LookupField.md)

#### Inherited from

[Field](XrmEx.Field.md).[setRequired](XrmEx.Field.md#setrequired)

#### Defined in

[XrmEx.ts:727](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L727)

___

### setRequiredLevel

▸ **setRequiredLevel**(`requirementLevel`): [`LookupField`](XrmEx.LookupField.md)

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `requirementLevel` | `RequirementLevel` | The requirement level, as either "none", "required", or "recommended" |

#### Returns

[`LookupField`](XrmEx.LookupField.md)

#### Implementation of

Xrm.Attributes.LookupAttribute.setRequiredLevel

#### Inherited from

[Field](XrmEx.Field.md).[setRequiredLevel](XrmEx.Field.md#setrequiredlevel)

#### Defined in

[XrmEx.ts:712](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L712)

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

[Field](XrmEx.Field.md).[setSubmitMode](XrmEx.Field.md#setsubmitmode)

#### Defined in

[XrmEx.ts:627](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L627)

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

[Field](XrmEx.Field.md).[setValue](XrmEx.Field.md#setvalue)

#### Defined in

[XrmEx.ts:597](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L597)

___

### setVisible

▸ **setVisible**(`visible`): [`LookupField`](XrmEx.LookupField.md)

Sets the visibility state.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `visible` | `boolean` | true to show, false to hide. |

#### Returns

[`LookupField`](XrmEx.LookupField.md)

#### Inherited from

[Field](XrmEx.Field.md).[setVisible](XrmEx.Field.md#setvisible)

#### Defined in

[XrmEx.ts:686](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L686)
