[xrm-ex](https://github.com/AhashSritharan/README.md) / [Exports](https://github.com/AhashSritharan/modules.md) / [XrmEx](https://github.com/AhashSritharan/modules/XrmEx.md) / NumberField

# Class: NumberField

[XrmEx](https://github.com/AhashSritharan/modules/XrmEx.md).NumberField

Used to execute methods related to a single Attribute

## Hierarchy

- [`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)

  ↳ **`NumberField`**

## Implements

- `NumberAttribute`

## Table of contents

### Constructors

- [constructor](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#constructor)

### Properties

- [Name](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#name)
- [\_attribute](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#_attribute)
- [allFields](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#allfields)

### Accessors

- [Attribute](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#attribute)
- [Value](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#value)
- [controls](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#controls)

### Methods

- [addNotification](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#addnotification)
- [addOnChange](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#addonchange)
- [fireOnChange](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#fireonchange)
- [getAttributeType](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#getattributetype)
- [getFormat](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#getformat)
- [getIsDirty](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#getisdirty)
- [getMax](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#getmax)
- [getMin](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#getmin)
- [getName](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#getname)
- [getParent](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#getparent)
- [getPrecision](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#getprecision)
- [getRequiredLevel](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#getrequiredlevel)
- [getSubmitMode](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#getsubmitmode)
- [getUserPrivilege](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#getuserprivilege)
- [getValue](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#getvalue)
- [removeNotification](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#removenotification)
- [removeOnChange](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#removeonchange)
- [setDisabled](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#setdisabled)
- [setIsValid](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#setisvalid)
- [setNotification](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#setnotification)
- [setPrecision](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#setprecision)
- [setRequired](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#setrequired)
- [setRequiredLevel](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#setrequiredlevel)
- [setSubmitMode](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#setsubmitmode)
- [setValue](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#setvalue)
- [setVisible](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md#setvisible)

## Constructors

### constructor

• **new NumberField**(`attribute`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `attribute` | `string` |

#### Overrides

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[constructor](https://github.com/AhashSritharan/classes/XrmEx.Field.md#constructor)

#### Defined in

[XrmEx.ts:856](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L856)

## Properties

### Name

• `Readonly` **Name**: `string`

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[Name](https://github.com/AhashSritharan/classes/XrmEx.Field.md#name)

#### Defined in

[XrmEx.ts:586](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L586)

___

### \_attribute

• `Protected` **\_attribute**: `NumberAttribute`

#### Overrides

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[_attribute](https://github.com/AhashSritharan/classes/XrmEx.Field.md#_attribute)

#### Defined in

[XrmEx.ts:855](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L855)

___

### allFields

▪ `Static` **allFields**: [`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)[] = `[]`

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[allFields](https://github.com/AhashSritharan/classes/XrmEx.Field.md#allfields)

#### Defined in

[XrmEx.ts:584](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L584)

## Accessors

### Attribute

• `get` **Attribute**(): `NumberAttribute`

#### Returns

`NumberAttribute`

#### Overrides

Field.Attribute

#### Defined in

[XrmEx.ts:874](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L874)

___

### Value

• `get` **Value**(): `number`

Gets the value.

#### Returns

`number`

The value.

#### Overrides

Field.Value

#### Defined in

[XrmEx.ts:882](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L882)

• `set` **Value**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Overrides

Field.Value

#### Defined in

[XrmEx.ts:885](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L885)

___

### controls

• `get` **controls**(): `ItemCollection`<`NumberControl`\>

#### Returns

`ItemCollection`<`NumberControl`\>

#### Implementation of

Xrm.Attributes.NumberAttribute.controls

#### Overrides

Field.controls

#### Defined in

[XrmEx.ts:879](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L879)

## Methods

### addNotification

▸ **addNotification**(`message`, `notificationLevel`, `uniqueId`, `actions?`): [`NumberField`](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md)

Displays an error or recommendation notification for a control, and lets you specify actions to execute based on the notification.

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `notificationLevel` | ``"ERROR"`` \| ``"RECOMMENDATION"`` |
| `uniqueId` | `string` |
| `actions?` | `ControlNotificationAction`[] |

#### Returns

[`NumberField`](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md)

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[addNotification](https://github.com/AhashSritharan/classes/XrmEx.Field.md#addnotification)

#### Defined in

[XrmEx.ts:780](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L780)

___

### addOnChange

▸ **addOnChange**(`handlers`): [`NumberField`](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md)

Adds a handler or an array of handlers to be called when the attribute's value is changed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `handlers` | `ContextSensitiveHandler` \| `ContextSensitiveHandler`[] | The function reference or an array of function references. |

#### Returns

[`NumberField`](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md)

#### Implementation of

Xrm.Attributes.NumberAttribute.addOnChange

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[addOnChange](https://github.com/AhashSritharan/classes/XrmEx.Field.md#addonchange)

#### Defined in

[XrmEx.ts:752](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L752)

___

### fireOnChange

▸ **fireOnChange**(): [`NumberField`](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md)

Fire all "on change" event handlers.

#### Returns

[`NumberField`](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md)

#### Implementation of

Xrm.Attributes.NumberAttribute.fireOnChange

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

Xrm.Attributes.NumberAttribute.getAttributeType

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getAttributeType](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getattributetype)

#### Defined in

[XrmEx.ts:602](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L602)

___

### getFormat

▸ **getFormat**(): `IntegerAttributeFormat`

#### Returns

`IntegerAttributeFormat`

#### Implementation of

Xrm.Attributes.NumberAttribute.getFormat

#### Overrides

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getFormat](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getformat)

#### Defined in

[XrmEx.ts:859](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L859)

___

### getIsDirty

▸ **getIsDirty**(): `boolean`

#### Returns

`boolean`

#### Implementation of

Xrm.Attributes.NumberAttribute.getIsDirty

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getIsDirty](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getisdirty)

#### Defined in

[XrmEx.ts:608](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L608)

___

### getMax

▸ **getMax**(): `number`

#### Returns

`number`

#### Implementation of

Xrm.Attributes.NumberAttribute.getMax

#### Defined in

[XrmEx.ts:862](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L862)

___

### getMin

▸ **getMin**(): `number`

#### Returns

`number`

#### Implementation of

Xrm.Attributes.NumberAttribute.getMin

#### Defined in

[XrmEx.ts:865](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L865)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Attributes.NumberAttribute.getName

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

Xrm.Attributes.NumberAttribute.getParent

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getParent](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getparent)

#### Defined in

[XrmEx.ts:614](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L614)

___

### getPrecision

▸ **getPrecision**(): `number`

#### Returns

`number`

#### Implementation of

Xrm.Attributes.NumberAttribute.getPrecision

#### Defined in

[XrmEx.ts:868](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L868)

___

### getRequiredLevel

▸ **getRequiredLevel**(): `RequirementLevel`

#### Returns

`RequirementLevel`

#### Implementation of

Xrm.Attributes.NumberAttribute.getRequiredLevel

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

Xrm.Attributes.NumberAttribute.getSubmitMode

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

Xrm.Attributes.NumberAttribute.getUserPrivilege

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

Xrm.Attributes.NumberAttribute.getValue

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getValue](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getvalue)

#### Defined in

[XrmEx.ts:632](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L632)

___

### removeNotification

▸ **removeNotification**(`uniqueId`): [`NumberField`](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md)

Clears the notification identified by uniqueId.

**`Remarks`**

If the uniqueId parameter is not used, the current notification shown will be removed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `uniqueId` | `string` | (Optional) Unique identifier. |

#### Returns

[`NumberField`](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md)

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

Xrm.Attributes.NumberAttribute.removeOnChange

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[removeOnChange](https://github.com/AhashSritharan/classes/XrmEx.Field.md#removeonchange)

#### Defined in

[XrmEx.ts:626](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L626)

___

### setDisabled

▸ **setDisabled**(`disabled`): [`NumberField`](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md)

Sets the state of the control to either enabled, or disabled.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `disabled` | `boolean` | true to disable, false to enable. |

#### Returns

[`NumberField`](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md)

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

Xrm.Attributes.NumberAttribute.setIsValid

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setIsValid](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setisvalid)

#### Defined in

[XrmEx.ts:635](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L635)

___

### setNotification

▸ **setNotification**(`message`, `uniqueId`): [`NumberField`](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md)

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

[`NumberField`](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md)

true if it succeeds, false if it fails.

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setNotification](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setnotification)

#### Defined in

[XrmEx.ts:671](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L671)

___

### setPrecision

▸ **setPrecision**(`precision`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `precision` | `number` |

#### Returns

`void`

#### Implementation of

Xrm.Attributes.NumberAttribute.setPrecision

#### Defined in

[XrmEx.ts:871](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L871)

___

### setRequired

▸ **setRequired**(`required`): [`NumberField`](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md)

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `required` | `boolean` | The requirement level, as either false for "none" or true for "required" |

#### Returns

[`NumberField`](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md)

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setRequired](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setrequired)

#### Defined in

[XrmEx.ts:729](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L729)

___

### setRequiredLevel

▸ **setRequiredLevel**(`requirementLevel`): [`NumberField`](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md)

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `requirementLevel` | `RequirementLevel` | The requirement level, as either "none", "required", or "recommended" |

#### Returns

[`NumberField`](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md)

#### Implementation of

Xrm.Attributes.NumberAttribute.setRequiredLevel

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

Xrm.Attributes.NumberAttribute.setSubmitMode

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

Xrm.Attributes.NumberAttribute.setValue

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setValue](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setvalue)

#### Defined in

[XrmEx.ts:599](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L599)

___

### setVisible

▸ **setVisible**(`visible`): [`NumberField`](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md)

Sets the visibility state.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `visible` | `boolean` | true to show, false to hide. |

#### Returns

[`NumberField`](https://github.com/AhashSritharan/classes/XrmEx.NumberField.md)

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setVisible](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setvisible)

#### Defined in

[XrmEx.ts:688](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L688)
