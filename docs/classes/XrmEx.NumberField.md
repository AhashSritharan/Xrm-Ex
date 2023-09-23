[xrm-ex](../README.md) / [Exports](../modules.md) / [XrmEx](../modules/XrmEx.md) / NumberField

# Class: NumberField

[XrmEx](../modules/XrmEx.md).NumberField

Used to execute methods related to a single Attribute

## Hierarchy

- [`Field`](XrmEx.Field.md)

  ↳ **`NumberField`**

## Implements

- `NumberAttribute`

## Table of contents

### Constructors

- [constructor](XrmEx.NumberField.md#constructor)

### Properties

- [Name](XrmEx.NumberField.md#name)
- [\_attribute](XrmEx.NumberField.md#_attribute)
- [allFields](XrmEx.NumberField.md#allfields)

### Accessors

- [Attribute](XrmEx.NumberField.md#attribute)
- [Value](XrmEx.NumberField.md#value)
- [controls](XrmEx.NumberField.md#controls)

### Methods

- [addNotification](XrmEx.NumberField.md#addnotification)
- [addOnChange](XrmEx.NumberField.md#addonchange)
- [fireOnChange](XrmEx.NumberField.md#fireonchange)
- [getAttributeType](XrmEx.NumberField.md#getattributetype)
- [getFormat](XrmEx.NumberField.md#getformat)
- [getIsDirty](XrmEx.NumberField.md#getisdirty)
- [getMax](XrmEx.NumberField.md#getmax)
- [getMin](XrmEx.NumberField.md#getmin)
- [getName](XrmEx.NumberField.md#getname)
- [getParent](XrmEx.NumberField.md#getparent)
- [getPrecision](XrmEx.NumberField.md#getprecision)
- [getRequiredLevel](XrmEx.NumberField.md#getrequiredlevel)
- [getSubmitMode](XrmEx.NumberField.md#getsubmitmode)
- [getUserPrivilege](XrmEx.NumberField.md#getuserprivilege)
- [getValue](XrmEx.NumberField.md#getvalue)
- [removeNotification](XrmEx.NumberField.md#removenotification)
- [removeOnChange](XrmEx.NumberField.md#removeonchange)
- [setDisabled](XrmEx.NumberField.md#setdisabled)
- [setIsValid](XrmEx.NumberField.md#setisvalid)
- [setNotification](XrmEx.NumberField.md#setnotification)
- [setPrecision](XrmEx.NumberField.md#setprecision)
- [setRequired](XrmEx.NumberField.md#setrequired)
- [setRequiredLevel](XrmEx.NumberField.md#setrequiredlevel)
- [setSubmitMode](XrmEx.NumberField.md#setsubmitmode)
- [setValue](XrmEx.NumberField.md#setvalue)
- [setVisible](XrmEx.NumberField.md#setvisible)

## Constructors

### constructor

• **new NumberField**(`attribute`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `attribute` | `string` |

#### Overrides

[Field](XrmEx.Field.md).[constructor](XrmEx.Field.md#constructor)

#### Defined in

[XrmEx.ts:854](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L854)

## Properties

### Name

• `Readonly` **Name**: `string`

#### Inherited from

[Field](XrmEx.Field.md).[Name](XrmEx.Field.md#name)

#### Defined in

[XrmEx.ts:584](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L584)

___

### \_attribute

• `Protected` **\_attribute**: `NumberAttribute`

#### Overrides

[Field](XrmEx.Field.md).[_attribute](XrmEx.Field.md#_attribute)

#### Defined in

[XrmEx.ts:853](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L853)

___

### allFields

▪ `Static` **allFields**: [`Field`](XrmEx.Field.md)[] = `[]`

#### Inherited from

[Field](XrmEx.Field.md).[allFields](XrmEx.Field.md#allfields)

#### Defined in

[XrmEx.ts:582](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L582)

## Accessors

### Attribute

• `get` **Attribute**(): `NumberAttribute`

#### Returns

`NumberAttribute`

#### Overrides

Field.Attribute

#### Defined in

[XrmEx.ts:872](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L872)

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

[XrmEx.ts:880](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L880)

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

[XrmEx.ts:883](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L883)

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

[XrmEx.ts:877](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L877)

## Methods

### addNotification

▸ **addNotification**(`message`, `notificationLevel`, `uniqueId`, `actions?`): [`NumberField`](XrmEx.NumberField.md)

Displays an error or recommendation notification for a control, and lets you specify actions to execute based on the notification.

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `notificationLevel` | ``"ERROR"`` \| ``"RECOMMENDATION"`` |
| `uniqueId` | `string` |
| `actions?` | `ControlNotificationAction`[] |

#### Returns

[`NumberField`](XrmEx.NumberField.md)

#### Inherited from

[Field](XrmEx.Field.md).[addNotification](XrmEx.Field.md#addnotification)

#### Defined in

[XrmEx.ts:778](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L778)

___

### addOnChange

▸ **addOnChange**(`handlers`): [`NumberField`](XrmEx.NumberField.md)

Adds a handler or an array of handlers to be called when the attribute's value is changed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `handlers` | `ContextSensitiveHandler` \| `ContextSensitiveHandler`[] | The function reference or an array of function references. |

#### Returns

[`NumberField`](XrmEx.NumberField.md)

#### Implementation of

Xrm.Attributes.NumberAttribute.addOnChange

#### Inherited from

[Field](XrmEx.Field.md).[addOnChange](XrmEx.Field.md#addonchange)

#### Defined in

[XrmEx.ts:750](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L750)

___

### fireOnChange

▸ **fireOnChange**(): [`NumberField`](XrmEx.NumberField.md)

Fire all "on change" event handlers.

#### Returns

[`NumberField`](XrmEx.NumberField.md)

#### Implementation of

Xrm.Attributes.NumberAttribute.fireOnChange

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

Xrm.Attributes.NumberAttribute.getAttributeType

#### Inherited from

[Field](XrmEx.Field.md).[getAttributeType](XrmEx.Field.md#getattributetype)

#### Defined in

[XrmEx.ts:600](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L600)

___

### getFormat

▸ **getFormat**(): `IntegerAttributeFormat`

#### Returns

`IntegerAttributeFormat`

#### Implementation of

Xrm.Attributes.NumberAttribute.getFormat

#### Overrides

[Field](XrmEx.Field.md).[getFormat](XrmEx.Field.md#getformat)

#### Defined in

[XrmEx.ts:857](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L857)

___

### getIsDirty

▸ **getIsDirty**(): `boolean`

#### Returns

`boolean`

#### Implementation of

Xrm.Attributes.NumberAttribute.getIsDirty

#### Inherited from

[Field](XrmEx.Field.md).[getIsDirty](XrmEx.Field.md#getisdirty)

#### Defined in

[XrmEx.ts:606](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L606)

___

### getMax

▸ **getMax**(): `number`

#### Returns

`number`

#### Implementation of

Xrm.Attributes.NumberAttribute.getMax

#### Defined in

[XrmEx.ts:860](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L860)

___

### getMin

▸ **getMin**(): `number`

#### Returns

`number`

#### Implementation of

Xrm.Attributes.NumberAttribute.getMin

#### Defined in

[XrmEx.ts:863](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L863)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Attributes.NumberAttribute.getName

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

Xrm.Attributes.NumberAttribute.getParent

#### Inherited from

[Field](XrmEx.Field.md).[getParent](XrmEx.Field.md#getparent)

#### Defined in

[XrmEx.ts:612](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L612)

___

### getPrecision

▸ **getPrecision**(): `number`

#### Returns

`number`

#### Implementation of

Xrm.Attributes.NumberAttribute.getPrecision

#### Defined in

[XrmEx.ts:866](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L866)

___

### getRequiredLevel

▸ **getRequiredLevel**(): `RequirementLevel`

#### Returns

`RequirementLevel`

#### Implementation of

Xrm.Attributes.NumberAttribute.getRequiredLevel

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

Xrm.Attributes.NumberAttribute.getSubmitMode

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

Xrm.Attributes.NumberAttribute.getUserPrivilege

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

Xrm.Attributes.NumberAttribute.getValue

#### Inherited from

[Field](XrmEx.Field.md).[getValue](XrmEx.Field.md#getvalue)

#### Defined in

[XrmEx.ts:630](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L630)

___

### removeNotification

▸ **removeNotification**(`uniqueId`): [`NumberField`](XrmEx.NumberField.md)

Clears the notification identified by uniqueId.

**`Remarks`**

If the uniqueId parameter is not used, the current notification shown will be removed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `uniqueId` | `string` | (Optional) Unique identifier. |

#### Returns

[`NumberField`](XrmEx.NumberField.md)

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

Xrm.Attributes.NumberAttribute.removeOnChange

#### Inherited from

[Field](XrmEx.Field.md).[removeOnChange](XrmEx.Field.md#removeonchange)

#### Defined in

[XrmEx.ts:624](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L624)

___

### setDisabled

▸ **setDisabled**(`disabled`): [`NumberField`](XrmEx.NumberField.md)

Sets the state of the control to either enabled, or disabled.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `disabled` | `boolean` | true to disable, false to enable. |

#### Returns

[`NumberField`](XrmEx.NumberField.md)

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

Xrm.Attributes.NumberAttribute.setIsValid

#### Inherited from

[Field](XrmEx.Field.md).[setIsValid](XrmEx.Field.md#setisvalid)

#### Defined in

[XrmEx.ts:633](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L633)

___

### setNotification

▸ **setNotification**(`message`, `uniqueId`): [`NumberField`](XrmEx.NumberField.md)

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

[`NumberField`](XrmEx.NumberField.md)

true if it succeeds, false if it fails.

#### Inherited from

[Field](XrmEx.Field.md).[setNotification](XrmEx.Field.md#setnotification)

#### Defined in

[XrmEx.ts:669](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L669)

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

[XrmEx.ts:869](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L869)

___

### setRequired

▸ **setRequired**(`required`): [`NumberField`](XrmEx.NumberField.md)

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `required` | `boolean` | The requirement level, as either false for "none" or true for "required" |

#### Returns

[`NumberField`](XrmEx.NumberField.md)

#### Inherited from

[Field](XrmEx.Field.md).[setRequired](XrmEx.Field.md#setrequired)

#### Defined in

[XrmEx.ts:727](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L727)

___

### setRequiredLevel

▸ **setRequiredLevel**(`requirementLevel`): [`NumberField`](XrmEx.NumberField.md)

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `requirementLevel` | `RequirementLevel` | The requirement level, as either "none", "required", or "recommended" |

#### Returns

[`NumberField`](XrmEx.NumberField.md)

#### Implementation of

Xrm.Attributes.NumberAttribute.setRequiredLevel

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

Xrm.Attributes.NumberAttribute.setSubmitMode

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

Xrm.Attributes.NumberAttribute.setValue

#### Inherited from

[Field](XrmEx.Field.md).[setValue](XrmEx.Field.md#setvalue)

#### Defined in

[XrmEx.ts:597](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L597)

___

### setVisible

▸ **setVisible**(`visible`): [`NumberField`](XrmEx.NumberField.md)

Sets the visibility state.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `visible` | `boolean` | true to show, false to hide. |

#### Returns

[`NumberField`](XrmEx.NumberField.md)

#### Inherited from

[Field](XrmEx.Field.md).[setVisible](XrmEx.Field.md#setvisible)

#### Defined in

[XrmEx.ts:686](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L686)
