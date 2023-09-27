[xrm-ex](https://github.com/AhashSritharan/README.md) / [Exports](https://github.com/AhashSritharan/modules.md) / [XrmEx](https://github.com/AhashSritharan/modules/XrmEx.md) / BooleanField

# Class: BooleanField

[XrmEx](https://github.com/AhashSritharan/modules/XrmEx.md).BooleanField

Used to execute methods related to a single Attribute

## Hierarchy

- [`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)

  ↳ **`BooleanField`**

## Implements

- `BooleanAttribute`

## Table of contents

### Constructors

- [constructor](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#constructor)

### Properties

- [Name](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#name)
- [\_attribute](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#_attribute)
- [allFields](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#allfields)

### Accessors

- [Attribute](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#attribute)
- [Value](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#value)
- [controls](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#controls)

### Methods

- [addNotification](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#addnotification)
- [addOnChange](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#addonchange)
- [fireOnChange](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#fireonchange)
- [getAttributeType](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#getattributetype)
- [getFormat](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#getformat)
- [getInitialValue](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#getinitialvalue)
- [getIsDirty](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#getisdirty)
- [getName](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#getname)
- [getParent](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#getparent)
- [getRequiredLevel](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#getrequiredlevel)
- [getSubmitMode](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#getsubmitmode)
- [getUserPrivilege](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#getuserprivilege)
- [getValue](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#getvalue)
- [removeNotification](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#removenotification)
- [removeOnChange](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#removeonchange)
- [setDisabled](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#setdisabled)
- [setIsValid](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#setisvalid)
- [setNotification](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#setnotification)
- [setRequired](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#setrequired)
- [setRequiredLevel](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#setrequiredlevel)
- [setSubmitMode](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#setsubmitmode)
- [setValue](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#setvalue)
- [setVisible](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md#setvisible)

## Constructors

### constructor

• **new BooleanField**(`attribute`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `attribute` | `string` |

#### Overrides

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[constructor](https://github.com/AhashSritharan/classes/XrmEx.Field.md#constructor)

#### Defined in

[XrmEx.ts:917](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L917)

## Properties

### Name

• `Readonly` **Name**: `string`

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[Name](https://github.com/AhashSritharan/classes/XrmEx.Field.md#name)

#### Defined in

[XrmEx.ts:586](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L586)

___

### \_attribute

• `Protected` **\_attribute**: `BooleanAttribute`

#### Overrides

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[_attribute](https://github.com/AhashSritharan/classes/XrmEx.Field.md#_attribute)

#### Defined in

[XrmEx.ts:916](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L916)

___

### allFields

▪ `Static` **allFields**: [`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)[] = `[]`

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[allFields](https://github.com/AhashSritharan/classes/XrmEx.Field.md#allfields)

#### Defined in

[XrmEx.ts:584](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L584)

## Accessors

### Attribute

• `get` **Attribute**(): `BooleanAttribute`

#### Returns

`BooleanAttribute`

#### Overrides

Field.Attribute

#### Defined in

[XrmEx.ts:926](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L926)

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

[XrmEx.ts:934](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L934)

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

[XrmEx.ts:937](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L937)

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

[XrmEx.ts:931](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L931)

## Methods

### addNotification

▸ **addNotification**(`message`, `notificationLevel`, `uniqueId`, `actions?`): [`BooleanField`](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md)

Displays an error or recommendation notification for a control, and lets you specify actions to execute based on the notification.

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `notificationLevel` | ``"ERROR"`` \| ``"RECOMMENDATION"`` |
| `uniqueId` | `string` |
| `actions?` | `ControlNotificationAction`[] |

#### Returns

[`BooleanField`](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md)

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[addNotification](https://github.com/AhashSritharan/classes/XrmEx.Field.md#addnotification)

#### Defined in

[XrmEx.ts:780](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L780)

___

### addOnChange

▸ **addOnChange**(`handlers`): [`BooleanField`](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md)

Adds a handler or an array of handlers to be called when the attribute's value is changed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `handlers` | `ContextSensitiveHandler` \| `ContextSensitiveHandler`[] | The function reference or an array of function references. |

#### Returns

[`BooleanField`](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md)

#### Implementation of

Xrm.Attributes.BooleanAttribute.addOnChange

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[addOnChange](https://github.com/AhashSritharan/classes/XrmEx.Field.md#addonchange)

#### Defined in

[XrmEx.ts:752](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L752)

___

### fireOnChange

▸ **fireOnChange**(): [`BooleanField`](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md)

Fire all "on change" event handlers.

#### Returns

[`BooleanField`](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md)

#### Implementation of

Xrm.Attributes.BooleanAttribute.fireOnChange

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[fireOnChange](https://github.com/AhashSritharan/classes/XrmEx.Field.md#fireonchange)

#### Defined in

[XrmEx.ts:739](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L739)

___

### getAttributeType

▸ **getAttributeType**(): ``"boolean"``

#### Returns

``"boolean"``

#### Implementation of

Xrm.Attributes.BooleanAttribute.getAttributeType

#### Overrides

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getAttributeType](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getattributetype)

#### Defined in

[XrmEx.ts:920](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L920)

___

### getFormat

▸ **getFormat**(): `AttributeFormat`

#### Returns

`AttributeFormat`

#### Implementation of

Xrm.Attributes.BooleanAttribute.getFormat

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getFormat](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getformat)

#### Defined in

[XrmEx.ts:605](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L605)

___

### getInitialValue

▸ **getInitialValue**(): `boolean`

#### Returns

`boolean`

#### Implementation of

Xrm.Attributes.BooleanAttribute.getInitialValue

#### Defined in

[XrmEx.ts:923](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L923)

___

### getIsDirty

▸ **getIsDirty**(): `boolean`

#### Returns

`boolean`

#### Implementation of

Xrm.Attributes.BooleanAttribute.getIsDirty

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getIsDirty](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getisdirty)

#### Defined in

[XrmEx.ts:608](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L608)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Attributes.BooleanAttribute.getName

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

Xrm.Attributes.BooleanAttribute.getParent

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

Xrm.Attributes.BooleanAttribute.getRequiredLevel

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

Xrm.Attributes.BooleanAttribute.getSubmitMode

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

Xrm.Attributes.BooleanAttribute.getUserPrivilege

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

Xrm.Attributes.BooleanAttribute.getValue

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getValue](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getvalue)

#### Defined in

[XrmEx.ts:632](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L632)

___

### removeNotification

▸ **removeNotification**(`uniqueId`): [`BooleanField`](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md)

Clears the notification identified by uniqueId.

**`Remarks`**

If the uniqueId parameter is not used, the current notification shown will be removed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `uniqueId` | `string` | (Optional) Unique identifier. |

#### Returns

[`BooleanField`](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md)

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

Xrm.Attributes.BooleanAttribute.removeOnChange

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[removeOnChange](https://github.com/AhashSritharan/classes/XrmEx.Field.md#removeonchange)

#### Defined in

[XrmEx.ts:626](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L626)

___

### setDisabled

▸ **setDisabled**(`disabled`): [`BooleanField`](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md)

Sets the state of the control to either enabled, or disabled.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `disabled` | `boolean` | true to disable, false to enable. |

#### Returns

[`BooleanField`](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md)

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

Xrm.Attributes.BooleanAttribute.setIsValid

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setIsValid](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setisvalid)

#### Defined in

[XrmEx.ts:635](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L635)

___

### setNotification

▸ **setNotification**(`message`, `uniqueId`): [`BooleanField`](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md)

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

[`BooleanField`](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md)

true if it succeeds, false if it fails.

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setNotification](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setnotification)

#### Defined in

[XrmEx.ts:671](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L671)

___

### setRequired

▸ **setRequired**(`required`): [`BooleanField`](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md)

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `required` | `boolean` | The requirement level, as either false for "none" or true for "required" |

#### Returns

[`BooleanField`](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md)

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setRequired](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setrequired)

#### Defined in

[XrmEx.ts:729](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L729)

___

### setRequiredLevel

▸ **setRequiredLevel**(`requirementLevel`): [`BooleanField`](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md)

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `requirementLevel` | `RequirementLevel` | The requirement level, as either "none", "required", or "recommended" |

#### Returns

[`BooleanField`](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md)

#### Implementation of

Xrm.Attributes.BooleanAttribute.setRequiredLevel

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

Xrm.Attributes.BooleanAttribute.setSubmitMode

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

Xrm.Attributes.BooleanAttribute.setValue

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setValue](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setvalue)

#### Defined in

[XrmEx.ts:599](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L599)

___

### setVisible

▸ **setVisible**(`visible`): [`BooleanField`](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md)

Sets the visibility state.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `visible` | `boolean` | true to show, false to hide. |

#### Returns

[`BooleanField`](https://github.com/AhashSritharan/classes/XrmEx.BooleanField.md)

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setVisible](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setvisible)

#### Defined in

[XrmEx.ts:688](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L688)
