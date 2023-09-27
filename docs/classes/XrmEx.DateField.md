[xrm-ex](https://github.com/AhashSritharan/README.md) / [Exports](https://github.com/AhashSritharan/modules.md) / [XrmEx](https://github.com/AhashSritharan/modules/XrmEx.md) / DateField

# Class: DateField

[XrmEx](https://github.com/AhashSritharan/modules/XrmEx.md).DateField

Used to execute methods related to a single Attribute

## Hierarchy

- [`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)

  ↳ **`DateField`**

## Implements

- `DateAttribute`

## Table of contents

### Constructors

- [constructor](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#constructor)

### Properties

- [Name](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#name)
- [\_attribute](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#_attribute)
- [allFields](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#allfields)

### Accessors

- [Attribute](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#attribute)
- [Value](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#value)
- [controls](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#controls)

### Methods

- [addNotification](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#addnotification)
- [addOnChange](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#addonchange)
- [fireOnChange](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#fireonchange)
- [getAttributeType](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#getattributetype)
- [getFormat](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#getformat)
- [getIsDirty](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#getisdirty)
- [getName](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#getname)
- [getParent](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#getparent)
- [getRequiredLevel](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#getrequiredlevel)
- [getSubmitMode](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#getsubmitmode)
- [getUserPrivilege](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#getuserprivilege)
- [getValue](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#getvalue)
- [removeNotification](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#removenotification)
- [removeOnChange](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#removeonchange)
- [setDisabled](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#setdisabled)
- [setIsValid](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#setisvalid)
- [setNotification](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#setnotification)
- [setRequired](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#setrequired)
- [setRequiredLevel](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#setrequiredlevel)
- [setSubmitMode](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#setsubmitmode)
- [setValue](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#setvalue)
- [setVisible](https://github.com/AhashSritharan/classes/XrmEx.DateField.md#setvisible)

## Constructors

### constructor

• **new DateField**(`attribute`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `attribute` | `string` |

#### Overrides

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[constructor](https://github.com/AhashSritharan/classes/XrmEx.Field.md#constructor)

#### Defined in

[XrmEx.ts:891](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L891)

## Properties

### Name

• `Readonly` **Name**: `string`

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[Name](https://github.com/AhashSritharan/classes/XrmEx.Field.md#name)

#### Defined in

[XrmEx.ts:586](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L586)

___

### \_attribute

• `Protected` **\_attribute**: `DateAttribute`

#### Overrides

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[_attribute](https://github.com/AhashSritharan/classes/XrmEx.Field.md#_attribute)

#### Defined in

[XrmEx.ts:890](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L890)

___

### allFields

▪ `Static` **allFields**: [`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)[] = `[]`

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[allFields](https://github.com/AhashSritharan/classes/XrmEx.Field.md#allfields)

#### Defined in

[XrmEx.ts:584](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L584)

## Accessors

### Attribute

• `get` **Attribute**(): `DateAttribute`

#### Returns

`DateAttribute`

#### Overrides

Field.Attribute

#### Defined in

[XrmEx.ts:897](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L897)

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

[XrmEx.ts:905](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L905)

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

[XrmEx.ts:908](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L908)

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

[XrmEx.ts:902](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L902)

## Methods

### addNotification

▸ **addNotification**(`message`, `notificationLevel`, `uniqueId`, `actions?`): [`DateField`](https://github.com/AhashSritharan/classes/XrmEx.DateField.md)

Displays an error or recommendation notification for a control, and lets you specify actions to execute based on the notification.

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `notificationLevel` | ``"ERROR"`` \| ``"RECOMMENDATION"`` |
| `uniqueId` | `string` |
| `actions?` | `ControlNotificationAction`[] |

#### Returns

[`DateField`](https://github.com/AhashSritharan/classes/XrmEx.DateField.md)

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[addNotification](https://github.com/AhashSritharan/classes/XrmEx.Field.md#addnotification)

#### Defined in

[XrmEx.ts:780](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L780)

___

### addOnChange

▸ **addOnChange**(`handlers`): [`DateField`](https://github.com/AhashSritharan/classes/XrmEx.DateField.md)

Adds a handler or an array of handlers to be called when the attribute's value is changed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `handlers` | `ContextSensitiveHandler` \| `ContextSensitiveHandler`[] | The function reference or an array of function references. |

#### Returns

[`DateField`](https://github.com/AhashSritharan/classes/XrmEx.DateField.md)

#### Implementation of

Xrm.Attributes.DateAttribute.addOnChange

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[addOnChange](https://github.com/AhashSritharan/classes/XrmEx.Field.md#addonchange)

#### Defined in

[XrmEx.ts:752](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L752)

___

### fireOnChange

▸ **fireOnChange**(): [`DateField`](https://github.com/AhashSritharan/classes/XrmEx.DateField.md)

Fire all "on change" event handlers.

#### Returns

[`DateField`](https://github.com/AhashSritharan/classes/XrmEx.DateField.md)

#### Implementation of

Xrm.Attributes.DateAttribute.fireOnChange

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

Xrm.Attributes.DateAttribute.getAttributeType

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getAttributeType](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getattributetype)

#### Defined in

[XrmEx.ts:602](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L602)

___

### getFormat

▸ **getFormat**(): `DateAttributeFormat`

#### Returns

`DateAttributeFormat`

#### Implementation of

Xrm.Attributes.DateAttribute.getFormat

#### Overrides

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getFormat](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getformat)

#### Defined in

[XrmEx.ts:894](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L894)

___

### getIsDirty

▸ **getIsDirty**(): `boolean`

#### Returns

`boolean`

#### Implementation of

Xrm.Attributes.DateAttribute.getIsDirty

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

Xrm.Attributes.DateAttribute.getName

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

Xrm.Attributes.DateAttribute.getParent

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

Xrm.Attributes.DateAttribute.getRequiredLevel

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

Xrm.Attributes.DateAttribute.getSubmitMode

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

Xrm.Attributes.DateAttribute.getUserPrivilege

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

Xrm.Attributes.DateAttribute.getValue

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getValue](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getvalue)

#### Defined in

[XrmEx.ts:632](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L632)

___

### removeNotification

▸ **removeNotification**(`uniqueId`): [`DateField`](https://github.com/AhashSritharan/classes/XrmEx.DateField.md)

Clears the notification identified by uniqueId.

**`Remarks`**

If the uniqueId parameter is not used, the current notification shown will be removed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `uniqueId` | `string` | (Optional) Unique identifier. |

#### Returns

[`DateField`](https://github.com/AhashSritharan/classes/XrmEx.DateField.md)

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

Xrm.Attributes.DateAttribute.removeOnChange

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[removeOnChange](https://github.com/AhashSritharan/classes/XrmEx.Field.md#removeonchange)

#### Defined in

[XrmEx.ts:626](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L626)

___

### setDisabled

▸ **setDisabled**(`disabled`): [`DateField`](https://github.com/AhashSritharan/classes/XrmEx.DateField.md)

Sets the state of the control to either enabled, or disabled.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `disabled` | `boolean` | true to disable, false to enable. |

#### Returns

[`DateField`](https://github.com/AhashSritharan/classes/XrmEx.DateField.md)

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

Xrm.Attributes.DateAttribute.setIsValid

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setIsValid](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setisvalid)

#### Defined in

[XrmEx.ts:635](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L635)

___

### setNotification

▸ **setNotification**(`message`, `uniqueId`): [`DateField`](https://github.com/AhashSritharan/classes/XrmEx.DateField.md)

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

[`DateField`](https://github.com/AhashSritharan/classes/XrmEx.DateField.md)

true if it succeeds, false if it fails.

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setNotification](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setnotification)

#### Defined in

[XrmEx.ts:671](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L671)

___

### setRequired

▸ **setRequired**(`required`): [`DateField`](https://github.com/AhashSritharan/classes/XrmEx.DateField.md)

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `required` | `boolean` | The requirement level, as either false for "none" or true for "required" |

#### Returns

[`DateField`](https://github.com/AhashSritharan/classes/XrmEx.DateField.md)

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setRequired](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setrequired)

#### Defined in

[XrmEx.ts:729](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L729)

___

### setRequiredLevel

▸ **setRequiredLevel**(`requirementLevel`): [`DateField`](https://github.com/AhashSritharan/classes/XrmEx.DateField.md)

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `requirementLevel` | `RequirementLevel` | The requirement level, as either "none", "required", or "recommended" |

#### Returns

[`DateField`](https://github.com/AhashSritharan/classes/XrmEx.DateField.md)

#### Implementation of

Xrm.Attributes.DateAttribute.setRequiredLevel

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

Xrm.Attributes.DateAttribute.setSubmitMode

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

Xrm.Attributes.DateAttribute.setValue

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setValue](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setvalue)

#### Defined in

[XrmEx.ts:599](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L599)

___

### setVisible

▸ **setVisible**(`visible`): [`DateField`](https://github.com/AhashSritharan/classes/XrmEx.DateField.md)

Sets the visibility state.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `visible` | `boolean` | true to show, false to hide. |

#### Returns

[`DateField`](https://github.com/AhashSritharan/classes/XrmEx.DateField.md)

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setVisible](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setvisible)

#### Defined in

[XrmEx.ts:688](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L688)
