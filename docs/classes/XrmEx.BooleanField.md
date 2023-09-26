[xrm-ex](../README.md) / [Exports](../modules.md) / [XrmEx](../modules/XrmEx.md) / BooleanField

# Class: BooleanField

[XrmEx](../modules/XrmEx.md).BooleanField

Used to execute methods related to a single Attribute

## Hierarchy

- [`Field`](XrmEx.Field.md)

  ↳ **`BooleanField`**

## Implements

- `BooleanAttribute`

## Table of contents

### Constructors

- [constructor](XrmEx.BooleanField.md#constructor)

### Properties

- [Name](XrmEx.BooleanField.md#name)
- [\_attribute](XrmEx.BooleanField.md#_attribute)
- [allFields](XrmEx.BooleanField.md#allfields)

### Accessors

- [Attribute](XrmEx.BooleanField.md#attribute)
- [Value](XrmEx.BooleanField.md#value)
- [controls](XrmEx.BooleanField.md#controls)

### Methods

- [addNotification](XrmEx.BooleanField.md#addnotification)
- [addOnChange](XrmEx.BooleanField.md#addonchange)
- [fireOnChange](XrmEx.BooleanField.md#fireonchange)
- [getAttributeType](XrmEx.BooleanField.md#getattributetype)
- [getFormat](XrmEx.BooleanField.md#getformat)
- [getInitialValue](XrmEx.BooleanField.md#getinitialvalue)
- [getIsDirty](XrmEx.BooleanField.md#getisdirty)
- [getName](XrmEx.BooleanField.md#getname)
- [getParent](XrmEx.BooleanField.md#getparent)
- [getRequiredLevel](XrmEx.BooleanField.md#getrequiredlevel)
- [getSubmitMode](XrmEx.BooleanField.md#getsubmitmode)
- [getUserPrivilege](XrmEx.BooleanField.md#getuserprivilege)
- [getValue](XrmEx.BooleanField.md#getvalue)
- [removeNotification](XrmEx.BooleanField.md#removenotification)
- [removeOnChange](XrmEx.BooleanField.md#removeonchange)
- [setDisabled](XrmEx.BooleanField.md#setdisabled)
- [setIsValid](XrmEx.BooleanField.md#setisvalid)
- [setNotification](XrmEx.BooleanField.md#setnotification)
- [setRequired](XrmEx.BooleanField.md#setrequired)
- [setRequiredLevel](XrmEx.BooleanField.md#setrequiredlevel)
- [setSubmitMode](XrmEx.BooleanField.md#setsubmitmode)
- [setValue](XrmEx.BooleanField.md#setvalue)
- [setVisible](XrmEx.BooleanField.md#setvisible)

## Constructors

### constructor

• **new BooleanField**(`attribute`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `attribute` | `string` |

#### Overrides

[Field](XrmEx.Field.md).[constructor](XrmEx.Field.md#constructor)

#### Defined in

[XrmEx.ts:917](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L917)

## Properties

### Name

• `Readonly` **Name**: `string`

#### Inherited from

[Field](XrmEx.Field.md).[Name](XrmEx.Field.md#name)

#### Defined in

[XrmEx.ts:586](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L586)

___

### \_attribute

• `Protected` **\_attribute**: `BooleanAttribute`

#### Overrides

[Field](XrmEx.Field.md).[_attribute](XrmEx.Field.md#_attribute)

#### Defined in

[XrmEx.ts:916](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L916)

___

### allFields

▪ `Static` **allFields**: [`Field`](XrmEx.Field.md)[] = `[]`

#### Inherited from

[Field](XrmEx.Field.md).[allFields](XrmEx.Field.md#allfields)

#### Defined in

[XrmEx.ts:584](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L584)

## Accessors

### Attribute

• `get` **Attribute**(): `BooleanAttribute`

#### Returns

`BooleanAttribute`

#### Overrides

Field.Attribute

#### Defined in

[XrmEx.ts:926](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L926)

___

### Value

• `get` **Value**(): `boolean`

Gets the value.

#### Returns

`boolean`

The value.

#### Overrides

Field.Value

#### Defined in

[XrmEx.ts:934](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L934)

• `set` **Value**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `boolean` |

#### Returns

`void`

#### Overrides

Field.Value

#### Defined in

[XrmEx.ts:937](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L937)

___

### controls

• `get` **controls**(): `ItemCollection`<`BooleanControl`\>

#### Returns

`ItemCollection`<`BooleanControl`\>

#### Implementation of

Xrm.Attributes.BooleanAttribute.controls

#### Overrides

Field.controls

#### Defined in

[XrmEx.ts:931](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L931)

## Methods

### addNotification

▸ **addNotification**(`message`, `notificationLevel`, `uniqueId`, `actions?`): [`BooleanField`](XrmEx.BooleanField.md)

Displays an error or recommendation notification for a control, and lets you specify actions to execute based on the notification.

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `notificationLevel` | ``"ERROR"`` \| ``"RECOMMENDATION"`` |
| `uniqueId` | `string` |
| `actions?` | `ControlNotificationAction`[] |

#### Returns

[`BooleanField`](XrmEx.BooleanField.md)

#### Inherited from

[Field](XrmEx.Field.md).[addNotification](XrmEx.Field.md#addnotification)

#### Defined in

[XrmEx.ts:780](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L780)

___

### addOnChange

▸ **addOnChange**(`handlers`): [`BooleanField`](XrmEx.BooleanField.md)

Adds a handler or an array of handlers to be called when the attribute's value is changed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `handlers` | `ContextSensitiveHandler` \| `ContextSensitiveHandler`[] | The function reference or an array of function references. |

#### Returns

[`BooleanField`](XrmEx.BooleanField.md)

#### Implementation of

Xrm.Attributes.BooleanAttribute.addOnChange

#### Inherited from

[Field](XrmEx.Field.md).[addOnChange](XrmEx.Field.md#addonchange)

#### Defined in

[XrmEx.ts:752](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L752)

___

### fireOnChange

▸ **fireOnChange**(): [`BooleanField`](XrmEx.BooleanField.md)

Fire all "on change" event handlers.

#### Returns

[`BooleanField`](XrmEx.BooleanField.md)

#### Implementation of

Xrm.Attributes.BooleanAttribute.fireOnChange

#### Inherited from

[Field](XrmEx.Field.md).[fireOnChange](XrmEx.Field.md#fireonchange)

#### Defined in

[XrmEx.ts:739](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L739)

___

### getAttributeType

▸ **getAttributeType**(): ``"boolean"``

#### Returns

``"boolean"``

#### Implementation of

Xrm.Attributes.BooleanAttribute.getAttributeType

#### Overrides

[Field](XrmEx.Field.md).[getAttributeType](XrmEx.Field.md#getattributetype)

#### Defined in

[XrmEx.ts:920](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L920)

___

### getFormat

▸ **getFormat**(): `AttributeFormat`

#### Returns

`AttributeFormat`

#### Implementation of

Xrm.Attributes.BooleanAttribute.getFormat

#### Inherited from

[Field](XrmEx.Field.md).[getFormat](XrmEx.Field.md#getformat)

#### Defined in

[XrmEx.ts:605](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L605)

___

### getInitialValue

▸ **getInitialValue**(): `boolean`

#### Returns

`boolean`

#### Implementation of

Xrm.Attributes.BooleanAttribute.getInitialValue

#### Defined in

[XrmEx.ts:923](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L923)

___

### getIsDirty

▸ **getIsDirty**(): `boolean`

#### Returns

`boolean`

#### Implementation of

Xrm.Attributes.BooleanAttribute.getIsDirty

#### Inherited from

[Field](XrmEx.Field.md).[getIsDirty](XrmEx.Field.md#getisdirty)

#### Defined in

[XrmEx.ts:608](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L608)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Attributes.BooleanAttribute.getName

#### Inherited from

[Field](XrmEx.Field.md).[getName](XrmEx.Field.md#getname)

#### Defined in

[XrmEx.ts:611](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L611)

___

### getParent

▸ **getParent**(): `Entity`

#### Returns

`Entity`

#### Implementation of

Xrm.Attributes.BooleanAttribute.getParent

#### Inherited from

[Field](XrmEx.Field.md).[getParent](XrmEx.Field.md#getparent)

#### Defined in

[XrmEx.ts:614](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L614)

___

### getRequiredLevel

▸ **getRequiredLevel**(): `RequirementLevel`

#### Returns

`RequirementLevel`

#### Implementation of

Xrm.Attributes.BooleanAttribute.getRequiredLevel

#### Inherited from

[Field](XrmEx.Field.md).[getRequiredLevel](XrmEx.Field.md#getrequiredlevel)

#### Defined in

[XrmEx.ts:617](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L617)

___

### getSubmitMode

▸ **getSubmitMode**(): `SubmitMode`

#### Returns

`SubmitMode`

#### Implementation of

Xrm.Attributes.BooleanAttribute.getSubmitMode

#### Inherited from

[Field](XrmEx.Field.md).[getSubmitMode](XrmEx.Field.md#getsubmitmode)

#### Defined in

[XrmEx.ts:620](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L620)

___

### getUserPrivilege

▸ **getUserPrivilege**(): `Privilege`

#### Returns

`Privilege`

#### Implementation of

Xrm.Attributes.BooleanAttribute.getUserPrivilege

#### Inherited from

[Field](XrmEx.Field.md).[getUserPrivilege](XrmEx.Field.md#getuserprivilege)

#### Defined in

[XrmEx.ts:623](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L623)

___

### getValue

▸ **getValue**(): `any`

#### Returns

`any`

#### Implementation of

Xrm.Attributes.BooleanAttribute.getValue

#### Inherited from

[Field](XrmEx.Field.md).[getValue](XrmEx.Field.md#getvalue)

#### Defined in

[XrmEx.ts:632](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L632)

___

### removeNotification

▸ **removeNotification**(`uniqueId`): [`BooleanField`](XrmEx.BooleanField.md)

Clears the notification identified by uniqueId.

**`Remarks`**

If the uniqueId parameter is not used, the current notification shown will be removed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `uniqueId` | `string` | (Optional) Unique identifier. |

#### Returns

[`BooleanField`](XrmEx.BooleanField.md)

true if it succeeds, false if it fails.

#### Inherited from

[Field](XrmEx.Field.md).[removeNotification](XrmEx.Field.md#removenotification)

#### Defined in

[XrmEx.ts:811](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L811)

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

Xrm.Attributes.BooleanAttribute.removeOnChange

#### Inherited from

[Field](XrmEx.Field.md).[removeOnChange](XrmEx.Field.md#removeonchange)

#### Defined in

[XrmEx.ts:626](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L626)

___

### setDisabled

▸ **setDisabled**(`disabled`): [`BooleanField`](XrmEx.BooleanField.md)

Sets the state of the control to either enabled, or disabled.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `disabled` | `boolean` | true to disable, false to enable. |

#### Returns

[`BooleanField`](XrmEx.BooleanField.md)

#### Inherited from

[Field](XrmEx.Field.md).[setDisabled](XrmEx.Field.md#setdisabled)

#### Defined in

[XrmEx.ts:701](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L701)

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

Xrm.Attributes.BooleanAttribute.setIsValid

#### Inherited from

[Field](XrmEx.Field.md).[setIsValid](XrmEx.Field.md#setisvalid)

#### Defined in

[XrmEx.ts:635](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L635)

___

### setNotification

▸ **setNotification**(`message`, `uniqueId`): [`BooleanField`](XrmEx.BooleanField.md)

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

[`BooleanField`](XrmEx.BooleanField.md)

true if it succeeds, false if it fails.

#### Inherited from

[Field](XrmEx.Field.md).[setNotification](XrmEx.Field.md#setnotification)

#### Defined in

[XrmEx.ts:671](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L671)

___

### setRequired

▸ **setRequired**(`required`): [`BooleanField`](XrmEx.BooleanField.md)

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `required` | `boolean` | The requirement level, as either false for "none" or true for "required" |

#### Returns

[`BooleanField`](XrmEx.BooleanField.md)

#### Inherited from

[Field](XrmEx.Field.md).[setRequired](XrmEx.Field.md#setrequired)

#### Defined in

[XrmEx.ts:729](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L729)

___

### setRequiredLevel

▸ **setRequiredLevel**(`requirementLevel`): [`BooleanField`](XrmEx.BooleanField.md)

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `requirementLevel` | `RequirementLevel` | The requirement level, as either "none", "required", or "recommended" |

#### Returns

[`BooleanField`](XrmEx.BooleanField.md)

#### Implementation of

Xrm.Attributes.BooleanAttribute.setRequiredLevel

#### Inherited from

[Field](XrmEx.Field.md).[setRequiredLevel](XrmEx.Field.md#setrequiredlevel)

#### Defined in

[XrmEx.ts:714](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L714)

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

Xrm.Attributes.BooleanAttribute.setSubmitMode

#### Inherited from

[Field](XrmEx.Field.md).[setSubmitMode](XrmEx.Field.md#setsubmitmode)

#### Defined in

[XrmEx.ts:629](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L629)

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

Xrm.Attributes.BooleanAttribute.setValue

#### Inherited from

[Field](XrmEx.Field.md).[setValue](XrmEx.Field.md#setvalue)

#### Defined in

[XrmEx.ts:599](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L599)

___

### setVisible

▸ **setVisible**(`visible`): [`BooleanField`](XrmEx.BooleanField.md)

Sets the visibility state.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `visible` | `boolean` | true to show, false to hide. |

#### Returns

[`BooleanField`](XrmEx.BooleanField.md)

#### Inherited from

[Field](XrmEx.Field.md).[setVisible](XrmEx.Field.md#setvisible)

#### Defined in

[XrmEx.ts:688](https://github.com/zucccerberg/Xrm-Ex/blob/6795b36/src/XrmEx.ts#L688)
