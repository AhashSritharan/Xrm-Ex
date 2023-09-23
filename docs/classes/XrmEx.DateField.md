[xrm-ex](../README.md) / [Exports](../modules.md) / [XrmEx](../modules/XrmEx.md) / DateField

# Class: DateField

[XrmEx](../modules/XrmEx.md).DateField

Used to execute methods related to a single Attribute

## Hierarchy

- [`Field`](XrmEx.Field.md)

  ↳ **`DateField`**

## Implements

- `DateAttribute`

## Table of contents

### Constructors

- [constructor](XrmEx.DateField.md#constructor)

### Properties

- [Name](XrmEx.DateField.md#name)
- [\_attribute](XrmEx.DateField.md#_attribute)
- [allFields](XrmEx.DateField.md#allfields)

### Accessors

- [Attribute](XrmEx.DateField.md#attribute)
- [Value](XrmEx.DateField.md#value)
- [controls](XrmEx.DateField.md#controls)

### Methods

- [addNotification](XrmEx.DateField.md#addnotification)
- [addOnChange](XrmEx.DateField.md#addonchange)
- [fireOnChange](XrmEx.DateField.md#fireonchange)
- [getAttributeType](XrmEx.DateField.md#getattributetype)
- [getFormat](XrmEx.DateField.md#getformat)
- [getIsDirty](XrmEx.DateField.md#getisdirty)
- [getName](XrmEx.DateField.md#getname)
- [getParent](XrmEx.DateField.md#getparent)
- [getRequiredLevel](XrmEx.DateField.md#getrequiredlevel)
- [getSubmitMode](XrmEx.DateField.md#getsubmitmode)
- [getUserPrivilege](XrmEx.DateField.md#getuserprivilege)
- [getValue](XrmEx.DateField.md#getvalue)
- [removeNotification](XrmEx.DateField.md#removenotification)
- [removeOnChange](XrmEx.DateField.md#removeonchange)
- [setDisabled](XrmEx.DateField.md#setdisabled)
- [setIsValid](XrmEx.DateField.md#setisvalid)
- [setNotification](XrmEx.DateField.md#setnotification)
- [setRequired](XrmEx.DateField.md#setrequired)
- [setRequiredLevel](XrmEx.DateField.md#setrequiredlevel)
- [setSubmitMode](XrmEx.DateField.md#setsubmitmode)
- [setValue](XrmEx.DateField.md#setvalue)
- [setVisible](XrmEx.DateField.md#setvisible)

## Constructors

### constructor

• **new DateField**(`attribute`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `attribute` | `string` |

#### Overrides

[Field](XrmEx.Field.md).[constructor](XrmEx.Field.md#constructor)

#### Defined in

[XrmEx.ts:889](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L889)

## Properties

### Name

• `Readonly` **Name**: `string`

#### Inherited from

[Field](XrmEx.Field.md).[Name](XrmEx.Field.md#name)

#### Defined in

[XrmEx.ts:584](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L584)

___

### \_attribute

• `Protected` **\_attribute**: `DateAttribute`

#### Overrides

[Field](XrmEx.Field.md).[_attribute](XrmEx.Field.md#_attribute)

#### Defined in

[XrmEx.ts:888](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L888)

___

### allFields

▪ `Static` **allFields**: [`Field`](XrmEx.Field.md)[] = `[]`

#### Inherited from

[Field](XrmEx.Field.md).[allFields](XrmEx.Field.md#allfields)

#### Defined in

[XrmEx.ts:582](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L582)

## Accessors

### Attribute

• `get` **Attribute**(): `DateAttribute`

#### Returns

`DateAttribute`

#### Overrides

Field.Attribute

#### Defined in

[XrmEx.ts:895](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L895)

___

### Value

• `get` **Value**(): `Date`

Gets the value.

#### Returns

`Date`

The value.

#### Overrides

Field.Value

#### Defined in

[XrmEx.ts:903](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L903)

• `set` **Value**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `Date` |

#### Returns

`void`

#### Overrides

Field.Value

#### Defined in

[XrmEx.ts:906](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L906)

___

### controls

• `get` **controls**(): `ItemCollection`<`DateControl`\>

#### Returns

`ItemCollection`<`DateControl`\>

#### Implementation of

Xrm.Attributes.DateAttribute.controls

#### Overrides

Field.controls

#### Defined in

[XrmEx.ts:900](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L900)

## Methods

### addNotification

▸ **addNotification**(`message`, `notificationLevel`, `uniqueId`, `actions?`): [`DateField`](XrmEx.DateField.md)

Displays an error or recommendation notification for a control, and lets you specify actions to execute based on the notification.

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `notificationLevel` | ``"ERROR"`` \| ``"RECOMMENDATION"`` |
| `uniqueId` | `string` |
| `actions?` | `ControlNotificationAction`[] |

#### Returns

[`DateField`](XrmEx.DateField.md)

#### Inherited from

[Field](XrmEx.Field.md).[addNotification](XrmEx.Field.md#addnotification)

#### Defined in

[XrmEx.ts:778](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L778)

___

### addOnChange

▸ **addOnChange**(`handlers`): [`DateField`](XrmEx.DateField.md)

Adds a handler or an array of handlers to be called when the attribute's value is changed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `handlers` | `ContextSensitiveHandler` \| `ContextSensitiveHandler`[] | The function reference or an array of function references. |

#### Returns

[`DateField`](XrmEx.DateField.md)

#### Implementation of

Xrm.Attributes.DateAttribute.addOnChange

#### Inherited from

[Field](XrmEx.Field.md).[addOnChange](XrmEx.Field.md#addonchange)

#### Defined in

[XrmEx.ts:750](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L750)

___

### fireOnChange

▸ **fireOnChange**(): [`DateField`](XrmEx.DateField.md)

Fire all "on change" event handlers.

#### Returns

[`DateField`](XrmEx.DateField.md)

#### Implementation of

Xrm.Attributes.DateAttribute.fireOnChange

#### Inherited from

[Field](XrmEx.Field.md).[fireOnChange](XrmEx.Field.md#fireonchange)

#### Defined in

[XrmEx.ts:737](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L737)

___

### getAttributeType

▸ **getAttributeType**(): `AttributeType`

#### Returns

`AttributeType`

#### Implementation of

Xrm.Attributes.DateAttribute.getAttributeType

#### Inherited from

[Field](XrmEx.Field.md).[getAttributeType](XrmEx.Field.md#getattributetype)

#### Defined in

[XrmEx.ts:600](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L600)

___

### getFormat

▸ **getFormat**(): `DateAttributeFormat`

#### Returns

`DateAttributeFormat`

#### Implementation of

Xrm.Attributes.DateAttribute.getFormat

#### Overrides

[Field](XrmEx.Field.md).[getFormat](XrmEx.Field.md#getformat)

#### Defined in

[XrmEx.ts:892](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L892)

___

### getIsDirty

▸ **getIsDirty**(): `boolean`

#### Returns

`boolean`

#### Implementation of

Xrm.Attributes.DateAttribute.getIsDirty

#### Inherited from

[Field](XrmEx.Field.md).[getIsDirty](XrmEx.Field.md#getisdirty)

#### Defined in

[XrmEx.ts:606](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L606)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Attributes.DateAttribute.getName

#### Inherited from

[Field](XrmEx.Field.md).[getName](XrmEx.Field.md#getname)

#### Defined in

[XrmEx.ts:609](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L609)

___

### getParent

▸ **getParent**(): `Entity`

#### Returns

`Entity`

#### Implementation of

Xrm.Attributes.DateAttribute.getParent

#### Inherited from

[Field](XrmEx.Field.md).[getParent](XrmEx.Field.md#getparent)

#### Defined in

[XrmEx.ts:612](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L612)

___

### getRequiredLevel

▸ **getRequiredLevel**(): `RequirementLevel`

#### Returns

`RequirementLevel`

#### Implementation of

Xrm.Attributes.DateAttribute.getRequiredLevel

#### Inherited from

[Field](XrmEx.Field.md).[getRequiredLevel](XrmEx.Field.md#getrequiredlevel)

#### Defined in

[XrmEx.ts:615](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L615)

___

### getSubmitMode

▸ **getSubmitMode**(): `SubmitMode`

#### Returns

`SubmitMode`

#### Implementation of

Xrm.Attributes.DateAttribute.getSubmitMode

#### Inherited from

[Field](XrmEx.Field.md).[getSubmitMode](XrmEx.Field.md#getsubmitmode)

#### Defined in

[XrmEx.ts:618](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L618)

___

### getUserPrivilege

▸ **getUserPrivilege**(): `Privilege`

#### Returns

`Privilege`

#### Implementation of

Xrm.Attributes.DateAttribute.getUserPrivilege

#### Inherited from

[Field](XrmEx.Field.md).[getUserPrivilege](XrmEx.Field.md#getuserprivilege)

#### Defined in

[XrmEx.ts:621](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L621)

___

### getValue

▸ **getValue**(): `any`

#### Returns

`any`

#### Implementation of

Xrm.Attributes.DateAttribute.getValue

#### Inherited from

[Field](XrmEx.Field.md).[getValue](XrmEx.Field.md#getvalue)

#### Defined in

[XrmEx.ts:630](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L630)

___

### removeNotification

▸ **removeNotification**(`uniqueId`): [`DateField`](XrmEx.DateField.md)

Clears the notification identified by uniqueId.

**`Remarks`**

If the uniqueId parameter is not used, the current notification shown will be removed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `uniqueId` | `string` | (Optional) Unique identifier. |

#### Returns

[`DateField`](XrmEx.DateField.md)

true if it succeeds, false if it fails.

#### Inherited from

[Field](XrmEx.Field.md).[removeNotification](XrmEx.Field.md#removenotification)

#### Defined in

[XrmEx.ts:809](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L809)

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

Xrm.Attributes.DateAttribute.removeOnChange

#### Inherited from

[Field](XrmEx.Field.md).[removeOnChange](XrmEx.Field.md#removeonchange)

#### Defined in

[XrmEx.ts:624](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L624)

___

### setDisabled

▸ **setDisabled**(`disabled`): [`DateField`](XrmEx.DateField.md)

Sets the state of the control to either enabled, or disabled.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `disabled` | `boolean` | true to disable, false to enable. |

#### Returns

[`DateField`](XrmEx.DateField.md)

#### Inherited from

[Field](XrmEx.Field.md).[setDisabled](XrmEx.Field.md#setdisabled)

#### Defined in

[XrmEx.ts:699](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L699)

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

Xrm.Attributes.DateAttribute.setIsValid

#### Inherited from

[Field](XrmEx.Field.md).[setIsValid](XrmEx.Field.md#setisvalid)

#### Defined in

[XrmEx.ts:633](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L633)

___

### setNotification

▸ **setNotification**(`message`, `uniqueId`): [`DateField`](XrmEx.DateField.md)

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

[`DateField`](XrmEx.DateField.md)

true if it succeeds, false if it fails.

#### Inherited from

[Field](XrmEx.Field.md).[setNotification](XrmEx.Field.md#setnotification)

#### Defined in

[XrmEx.ts:669](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L669)

___

### setRequired

▸ **setRequired**(`required`): [`DateField`](XrmEx.DateField.md)

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `required` | `boolean` | The requirement level, as either false for "none" or true for "required" |

#### Returns

[`DateField`](XrmEx.DateField.md)

#### Inherited from

[Field](XrmEx.Field.md).[setRequired](XrmEx.Field.md#setrequired)

#### Defined in

[XrmEx.ts:727](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L727)

___

### setRequiredLevel

▸ **setRequiredLevel**(`requirementLevel`): [`DateField`](XrmEx.DateField.md)

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `requirementLevel` | `RequirementLevel` | The requirement level, as either "none", "required", or "recommended" |

#### Returns

[`DateField`](XrmEx.DateField.md)

#### Implementation of

Xrm.Attributes.DateAttribute.setRequiredLevel

#### Inherited from

[Field](XrmEx.Field.md).[setRequiredLevel](XrmEx.Field.md#setrequiredlevel)

#### Defined in

[XrmEx.ts:712](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L712)

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

Xrm.Attributes.DateAttribute.setSubmitMode

#### Inherited from

[Field](XrmEx.Field.md).[setSubmitMode](XrmEx.Field.md#setsubmitmode)

#### Defined in

[XrmEx.ts:627](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L627)

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

Xrm.Attributes.DateAttribute.setValue

#### Inherited from

[Field](XrmEx.Field.md).[setValue](XrmEx.Field.md#setvalue)

#### Defined in

[XrmEx.ts:597](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L597)

___

### setVisible

▸ **setVisible**(`visible`): [`DateField`](XrmEx.DateField.md)

Sets the visibility state.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `visible` | `boolean` | true to show, false to hide. |

#### Returns

[`DateField`](XrmEx.DateField.md)

#### Inherited from

[Field](XrmEx.Field.md).[setVisible](XrmEx.Field.md#setvisible)

#### Defined in

[XrmEx.ts:686](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L686)
