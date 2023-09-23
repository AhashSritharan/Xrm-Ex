[xrm-ex](../README.md) / [Exports](../modules.md) / [XrmEx](../modules/XrmEx.md) / Field

# Class: Field

[XrmEx](../modules/XrmEx.md).Field

Used to execute methods related to a single Attribute

## Hierarchy

- **`Field`**

  ↳ [`TextField`](XrmEx.TextField.md)

  ↳ [`NumberField`](XrmEx.NumberField.md)

  ↳ [`DateField`](XrmEx.DateField.md)

  ↳ [`BooleanField`](XrmEx.BooleanField.md)

  ↳ [`MultiSelectOptionSetField`](XrmEx.MultiSelectOptionSetField.md)

  ↳ [`LookupField`](XrmEx.LookupField.md)

  ↳ [`OptionsetField`](XrmEx.OptionsetField.md)

## Implements

- `Attribute`

## Table of contents

### Constructors

- [constructor](XrmEx.Field.md#constructor)

### Properties

- [Name](XrmEx.Field.md#name)
- [\_attribute](XrmEx.Field.md#_attribute)
- [allFields](XrmEx.Field.md#allfields)

### Accessors

- [Attribute](XrmEx.Field.md#attribute)
- [Value](XrmEx.Field.md#value)
- [controls](XrmEx.Field.md#controls)

### Methods

- [addNotification](XrmEx.Field.md#addnotification)
- [addOnChange](XrmEx.Field.md#addonchange)
- [fireOnChange](XrmEx.Field.md#fireonchange)
- [getAttributeType](XrmEx.Field.md#getattributetype)
- [getFormat](XrmEx.Field.md#getformat)
- [getIsDirty](XrmEx.Field.md#getisdirty)
- [getName](XrmEx.Field.md#getname)
- [getParent](XrmEx.Field.md#getparent)
- [getRequiredLevel](XrmEx.Field.md#getrequiredlevel)
- [getSubmitMode](XrmEx.Field.md#getsubmitmode)
- [getUserPrivilege](XrmEx.Field.md#getuserprivilege)
- [getValue](XrmEx.Field.md#getvalue)
- [removeNotification](XrmEx.Field.md#removenotification)
- [removeOnChange](XrmEx.Field.md#removeonchange)
- [setDisabled](XrmEx.Field.md#setdisabled)
- [setIsValid](XrmEx.Field.md#setisvalid)
- [setNotification](XrmEx.Field.md#setnotification)
- [setRequired](XrmEx.Field.md#setrequired)
- [setRequiredLevel](XrmEx.Field.md#setrequiredlevel)
- [setSubmitMode](XrmEx.Field.md#setsubmitmode)
- [setValue](XrmEx.Field.md#setvalue)
- [setVisible](XrmEx.Field.md#setvisible)

## Constructors

### constructor

• **new Field**(`attributeName`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `attributeName` | `string` |

#### Defined in

[XrmEx.ts:587](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L587)

## Properties

### Name

• `Readonly` **Name**: `string`

#### Defined in

[XrmEx.ts:584](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L584)

___

### \_attribute

• `Protected` `Optional` **\_attribute**: `Attribute`<`any`\>

#### Defined in

[XrmEx.ts:585](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L585)

___

### allFields

▪ `Static` **allFields**: [`Field`](XrmEx.Field.md)[] = `[]`

#### Defined in

[XrmEx.ts:582](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L582)

## Accessors

### Attribute

• `get` **Attribute**(): `Attribute`<`any`\>

#### Returns

`Attribute`<`any`\>

#### Defined in

[XrmEx.ts:637](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L637)

___

### Value

• `get` **Value**(): `any`

Gets the value.

#### Returns

`any`

The value.

#### Defined in

[XrmEx.ts:653](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L653)

• `set` **Value**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `any` |

#### Returns

`void`

#### Defined in

[XrmEx.ts:657](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L657)

___

### controls

• `get` **controls**(): `ItemCollection`<`StandardControl`\>

#### Returns

`ItemCollection`<`StandardControl`\>

#### Implementation of

Xrm.Attributes.Attribute.controls

#### Defined in

[XrmEx.ts:645](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L645)

## Methods

### addNotification

▸ **addNotification**(`message`, `notificationLevel`, `uniqueId`, `actions?`): [`Field`](XrmEx.Field.md)

Displays an error or recommendation notification for a control, and lets you specify actions to execute based on the notification.

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `notificationLevel` | ``"ERROR"`` \| ``"RECOMMENDATION"`` |
| `uniqueId` | `string` |
| `actions?` | `ControlNotificationAction`[] |

#### Returns

[`Field`](XrmEx.Field.md)

#### Defined in

[XrmEx.ts:778](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L778)

___

### addOnChange

▸ **addOnChange**(`handlers`): [`Field`](XrmEx.Field.md)

Adds a handler or an array of handlers to be called when the attribute's value is changed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `handlers` | `ContextSensitiveHandler` \| `ContextSensitiveHandler`[] | The function reference or an array of function references. |

#### Returns

[`Field`](XrmEx.Field.md)

#### Implementation of

Xrm.Attributes.Attribute.addOnChange

#### Defined in

[XrmEx.ts:750](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L750)

___

### fireOnChange

▸ **fireOnChange**(): [`Field`](XrmEx.Field.md)

Fire all "on change" event handlers.

#### Returns

[`Field`](XrmEx.Field.md)

#### Implementation of

Xrm.Attributes.Attribute.fireOnChange

#### Defined in

[XrmEx.ts:737](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L737)

___

### getAttributeType

▸ **getAttributeType**(): `AttributeType`

#### Returns

`AttributeType`

#### Implementation of

Xrm.Attributes.Attribute.getAttributeType

#### Defined in

[XrmEx.ts:600](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L600)

___

### getFormat

▸ **getFormat**(): `AttributeFormat`

#### Returns

`AttributeFormat`

#### Implementation of

Xrm.Attributes.Attribute.getFormat

#### Defined in

[XrmEx.ts:603](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L603)

___

### getIsDirty

▸ **getIsDirty**(): `boolean`

#### Returns

`boolean`

#### Implementation of

Xrm.Attributes.Attribute.getIsDirty

#### Defined in

[XrmEx.ts:606](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L606)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Attributes.Attribute.getName

#### Defined in

[XrmEx.ts:609](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L609)

___

### getParent

▸ **getParent**(): `Entity`

#### Returns

`Entity`

#### Implementation of

Xrm.Attributes.Attribute.getParent

#### Defined in

[XrmEx.ts:612](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L612)

___

### getRequiredLevel

▸ **getRequiredLevel**(): `RequirementLevel`

#### Returns

`RequirementLevel`

#### Implementation of

Xrm.Attributes.Attribute.getRequiredLevel

#### Defined in

[XrmEx.ts:615](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L615)

___

### getSubmitMode

▸ **getSubmitMode**(): `SubmitMode`

#### Returns

`SubmitMode`

#### Implementation of

Xrm.Attributes.Attribute.getSubmitMode

#### Defined in

[XrmEx.ts:618](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L618)

___

### getUserPrivilege

▸ **getUserPrivilege**(): `Privilege`

#### Returns

`Privilege`

#### Implementation of

Xrm.Attributes.Attribute.getUserPrivilege

#### Defined in

[XrmEx.ts:621](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L621)

___

### getValue

▸ **getValue**(): `any`

#### Returns

`any`

#### Implementation of

Xrm.Attributes.Attribute.getValue

#### Defined in

[XrmEx.ts:630](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L630)

___

### removeNotification

▸ **removeNotification**(`uniqueId`): [`Field`](XrmEx.Field.md)

Clears the notification identified by uniqueId.

**`Remarks`**

If the uniqueId parameter is not used, the current notification shown will be removed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `uniqueId` | `string` | (Optional) Unique identifier. |

#### Returns

[`Field`](XrmEx.Field.md)

true if it succeeds, false if it fails.

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

Xrm.Attributes.Attribute.removeOnChange

#### Defined in

[XrmEx.ts:624](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L624)

___

### setDisabled

▸ **setDisabled**(`disabled`): [`Field`](XrmEx.Field.md)

Sets the state of the control to either enabled, or disabled.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `disabled` | `boolean` | true to disable, false to enable. |

#### Returns

[`Field`](XrmEx.Field.md)

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

Xrm.Attributes.Attribute.setIsValid

#### Defined in

[XrmEx.ts:633](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L633)

___

### setNotification

▸ **setNotification**(`message`, `uniqueId`): [`Field`](XrmEx.Field.md)

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

[`Field`](XrmEx.Field.md)

true if it succeeds, false if it fails.

#### Defined in

[XrmEx.ts:669](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L669)

___

### setRequired

▸ **setRequired**(`required`): [`Field`](XrmEx.Field.md)

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `required` | `boolean` | The requirement level, as either false for "none" or true for "required" |

#### Returns

[`Field`](XrmEx.Field.md)

#### Defined in

[XrmEx.ts:727](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L727)

___

### setRequiredLevel

▸ **setRequiredLevel**(`requirementLevel`): [`Field`](XrmEx.Field.md)

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `requirementLevel` | `RequirementLevel` | The requirement level, as either "none", "required", or "recommended" |

#### Returns

[`Field`](XrmEx.Field.md)

#### Implementation of

Xrm.Attributes.Attribute.setRequiredLevel

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

Xrm.Attributes.Attribute.setSubmitMode

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

Xrm.Attributes.Attribute.setValue

#### Defined in

[XrmEx.ts:597](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L597)

___

### setVisible

▸ **setVisible**(`visible`): [`Field`](XrmEx.Field.md)

Sets the visibility state.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `visible` | `boolean` | true to show, false to hide. |

#### Returns

[`Field`](XrmEx.Field.md)

#### Defined in

[XrmEx.ts:686](https://github.com/AhashSritharan/Xrm-Ex/blob/d65bc4b/src/XrmEx.ts#L686)
