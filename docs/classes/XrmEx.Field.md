[xrm-ex](https://github.com/AhashSritharan/README.md) / [Exports](https://github.com/AhashSritharan/modules.md) / [XrmEx](https://github.com/AhashSritharan/modules/XrmEx.md) / Field

# Class: Field

[XrmEx](https://github.com/AhashSritharan/modules/XrmEx.md).Field

Used to execute methods related to a single Attribute

## Hierarchy

- **`Field`**

  ↳ [`TextField`](https://github.com/AhashSritharan/classes/XrmEx.TextField.md)

  ↳ [`NumberField`](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md)

  ↳ [`DateField`](https://github.com/AhashSritharan/classes/XrmEx.DateField.md)

  ↳ [`BooleanField`](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md)

  ↳ [`MultiSelectOptionSetField`](https://github.com/AhashSritharan/classes/XrmEx.MultiSelectOptionSetField.md)

  ↳ [`LookupField`](https://github.com/AhashSritharan/classes/XrmEx.LookupField.md)

  ↳ [`OptionsetField`](https://github.com/AhashSritharan/classes/XrmEx.OptionsetField.md)

## Implements

- `Attribute`

## Table of contents

### Constructors

- [constructor](https://github.com/AhashSritharan/classes/XrmEx.Field.md#constructor)

### Properties

- [Name](https://github.com/AhashSritharan/classes/XrmEx.Field.md#name)
- [\_attribute](https://github.com/AhashSritharan/classes/XrmEx.Field.md#_attribute)
- [allFields](https://github.com/AhashSritharan/classes/XrmEx.Field.md#allfields)

### Accessors

- [Attribute](https://github.com/AhashSritharan/classes/XrmEx.Field.md#attribute)
- [Value](https://github.com/AhashSritharan/classes/XrmEx.Field.md#value)
- [controls](https://github.com/AhashSritharan/classes/XrmEx.Field.md#controls)

### Methods

- [addNotification](https://github.com/AhashSritharan/classes/XrmEx.Field.md#addnotification)
- [addOnChange](https://github.com/AhashSritharan/classes/XrmEx.Field.md#addonchange)
- [fireOnChange](https://github.com/AhashSritharan/classes/XrmEx.Field.md#fireonchange)
- [getAttributeType](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getattributetype)
- [getFormat](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getformat)
- [getIsDirty](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getisdirty)
- [getName](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getname)
- [getParent](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getparent)
- [getRequiredLevel](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getrequiredlevel)
- [getSubmitMode](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getsubmitmode)
- [getUserPrivilege](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getuserprivilege)
- [getValue](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getvalue)
- [removeNotification](https://github.com/AhashSritharan/classes/XrmEx.Field.md#removenotification)
- [removeOnChange](https://github.com/AhashSritharan/classes/XrmEx.Field.md#removeonchange)
- [setDisabled](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setdisabled)
- [setIsValid](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setisvalid)
- [setNotification](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setnotification)
- [setRequired](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setrequired)
- [setRequiredLevel](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setrequiredlevel)
- [setSubmitMode](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setsubmitmode)
- [setValue](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setvalue)
- [setVisible](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setvisible)

## Constructors

### constructor

• **new Field**(`attributeName`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `attributeName` | `string` |

#### Defined in

[XrmEx.ts:589](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L589)

## Properties

### Name

• `Readonly` **Name**: `string`

#### Defined in

[XrmEx.ts:586](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L586)

___

### \_attribute

• `Protected` `Optional` **\_attribute**: `Attribute`<`any`\>

#### Defined in

[XrmEx.ts:587](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L587)

___

### allFields

▪ `Static` **allFields**: [`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)[] = `[]`

#### Defined in

[XrmEx.ts:584](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L584)

## Accessors

### Attribute

• `get` **Attribute**(): `Attribute`<`any`\>

#### Returns

`Attribute`<`any`\>

#### Defined in

[XrmEx.ts:639](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L639)

___

### Value

• `get` **Value**(): `any`

Gets the value.

#### Returns

`any`

The value.

#### Defined in

[XrmEx.ts:655](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L655)

• `set` **Value**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `any` |

#### Returns

`void`

#### Defined in

[XrmEx.ts:659](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L659)

___

### controls

• `get` **controls**(): `ItemCollection`<`StandardControl`\>

#### Returns

`ItemCollection`<`StandardControl`\>

#### Implementation of

Xrm.Attributes.Attribute.controls

#### Defined in

[XrmEx.ts:647](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L647)

## Methods

### addNotification

▸ **addNotification**(`message`, `notificationLevel`, `uniqueId`, `actions?`): [`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)

Displays an error or recommendation notification for a control, and lets you specify actions to execute based on the notification.

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `notificationLevel` | ``"ERROR"`` \| ``"RECOMMENDATION"`` |
| `uniqueId` | `string` |
| `actions?` | `ControlNotificationAction`[] |

#### Returns

[`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)

#### Defined in

[XrmEx.ts:780](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L780)

___

### addOnChange

▸ **addOnChange**(`handlers`): [`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)

Adds a handler or an array of handlers to be called when the attribute's value is changed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `handlers` | `ContextSensitiveHandler` \| `ContextSensitiveHandler`[] | The function reference or an array of function references. |

#### Returns

[`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)

#### Implementation of

Xrm.Attributes.Attribute.addOnChange

#### Defined in

[XrmEx.ts:752](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L752)

___

### fireOnChange

▸ **fireOnChange**(): [`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)

Fire all "on change" event handlers.

#### Returns

[`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)

#### Implementation of

Xrm.Attributes.Attribute.fireOnChange

#### Defined in

[XrmEx.ts:739](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L739)

___

### getAttributeType

▸ **getAttributeType**(): `AttributeType`

#### Returns

`AttributeType`

#### Implementation of

Xrm.Attributes.Attribute.getAttributeType

#### Defined in

[XrmEx.ts:602](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L602)

___

### getFormat

▸ **getFormat**(): `AttributeFormat`

#### Returns

`AttributeFormat`

#### Implementation of

Xrm.Attributes.Attribute.getFormat

#### Defined in

[XrmEx.ts:605](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L605)

___

### getIsDirty

▸ **getIsDirty**(): `boolean`

#### Returns

`boolean`

#### Implementation of

Xrm.Attributes.Attribute.getIsDirty

#### Defined in

[XrmEx.ts:608](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L608)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Attributes.Attribute.getName

#### Defined in

[XrmEx.ts:611](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L611)

___

### getParent

▸ **getParent**(): `Entity`

#### Returns

`Entity`

#### Implementation of

Xrm.Attributes.Attribute.getParent

#### Defined in

[XrmEx.ts:614](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L614)

___

### getRequiredLevel

▸ **getRequiredLevel**(): `RequirementLevel`

#### Returns

`RequirementLevel`

#### Implementation of

Xrm.Attributes.Attribute.getRequiredLevel

#### Defined in

[XrmEx.ts:617](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L617)

___

### getSubmitMode

▸ **getSubmitMode**(): `SubmitMode`

#### Returns

`SubmitMode`

#### Implementation of

Xrm.Attributes.Attribute.getSubmitMode

#### Defined in

[XrmEx.ts:620](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L620)

___

### getUserPrivilege

▸ **getUserPrivilege**(): `Privilege`

#### Returns

`Privilege`

#### Implementation of

Xrm.Attributes.Attribute.getUserPrivilege

#### Defined in

[XrmEx.ts:623](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L623)

___

### getValue

▸ **getValue**(): `any`

#### Returns

`any`

#### Implementation of

Xrm.Attributes.Attribute.getValue

#### Defined in

[XrmEx.ts:632](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L632)

___

### removeNotification

▸ **removeNotification**(`uniqueId`): [`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)

Clears the notification identified by uniqueId.

**`Remarks`**

If the uniqueId parameter is not used, the current notification shown will be removed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `uniqueId` | `string` | (Optional) Unique identifier. |

#### Returns

[`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)

true if it succeeds, false if it fails.

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

Xrm.Attributes.Attribute.removeOnChange

#### Defined in

[XrmEx.ts:626](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L626)

___

### setDisabled

▸ **setDisabled**(`disabled`): [`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)

Sets the state of the control to either enabled, or disabled.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `disabled` | `boolean` | true to disable, false to enable. |

#### Returns

[`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)

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

Xrm.Attributes.Attribute.setIsValid

#### Defined in

[XrmEx.ts:635](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L635)

___

### setNotification

▸ **setNotification**(`message`, `uniqueId`): [`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)

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

[`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)

true if it succeeds, false if it fails.

#### Defined in

[XrmEx.ts:671](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L671)

___

### setRequired

▸ **setRequired**(`required`): [`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `required` | `boolean` | The requirement level, as either false for "none" or true for "required" |

#### Returns

[`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)

#### Defined in

[XrmEx.ts:729](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L729)

___

### setRequiredLevel

▸ **setRequiredLevel**(`requirementLevel`): [`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `requirementLevel` | `RequirementLevel` | The requirement level, as either "none", "required", or "recommended" |

#### Returns

[`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)

#### Implementation of

Xrm.Attributes.Attribute.setRequiredLevel

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

Xrm.Attributes.Attribute.setSubmitMode

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

Xrm.Attributes.Attribute.setValue

#### Defined in

[XrmEx.ts:599](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L599)

___

### setVisible

▸ **setVisible**(`visible`): [`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)

Sets the visibility state.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `visible` | `boolean` | true to show, false to hide. |

#### Returns

[`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)

#### Defined in

[XrmEx.ts:688](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L688)
