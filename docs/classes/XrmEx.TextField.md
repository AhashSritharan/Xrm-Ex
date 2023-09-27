[xrm-ex](https://github.com/AhashSritharan/README.md) / [Exports](https://github.com/AhashSritharan/modules.md) / [XrmEx](https://github.com/AhashSritharan/modules/XrmEx.md) / TextField

# Class: TextField

[XrmEx](https://github.com/AhashSritharan/modules/XrmEx.md).TextField

Used to execute methods related to a single Attribute

## Hierarchy

- [`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)

  ↳ **`TextField`**

## Implements

- `StringAttribute`

## Table of contents

### Constructors

- [constructor](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#constructor)

### Properties

- [Name](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#name)
- [\_attribute](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#_attribute)
- [allFields](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#allfields)

### Accessors

- [Attribute](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#attribute)
- [Value](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#value)
- [controls](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#controls)

### Methods

- [addNotification](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#addnotification)
- [addOnChange](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#addonchange)
- [fireOnChange](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#fireonchange)
- [getAttributeType](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#getattributetype)
- [getFormat](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#getformat)
- [getIsDirty](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#getisdirty)
- [getMaxLength](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#getmaxlength)
- [getName](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#getname)
- [getParent](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#getparent)
- [getRequiredLevel](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#getrequiredlevel)
- [getSubmitMode](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#getsubmitmode)
- [getUserPrivilege](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#getuserprivilege)
- [getValue](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#getvalue)
- [removeNotification](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#removenotification)
- [removeOnChange](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#removeonchange)
- [setDisabled](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#setdisabled)
- [setIsValid](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#setisvalid)
- [setNotification](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#setnotification)
- [setRequired](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#setrequired)
- [setRequiredLevel](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#setrequiredlevel)
- [setSubmitMode](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#setsubmitmode)
- [setValue](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#setvalue)
- [setVisible](https://github.com/AhashSritharan/classes/XrmEx.TextField.md#setvisible)

## Constructors

### constructor

• **new TextField**(`attribute`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `attribute` | `string` |

#### Overrides

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[constructor](https://github.com/AhashSritharan/classes/XrmEx.Field.md#constructor)

#### Defined in

[XrmEx.ts:827](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L827)

## Properties

### Name

• `Readonly` **Name**: `string`

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[Name](https://github.com/AhashSritharan/classes/XrmEx.Field.md#name)

#### Defined in

[XrmEx.ts:586](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L586)

___

### \_attribute

• `Protected` **\_attribute**: `StringAttribute`

#### Overrides

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[_attribute](https://github.com/AhashSritharan/classes/XrmEx.Field.md#_attribute)

#### Defined in

[XrmEx.ts:826](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L826)

___

### allFields

▪ `Static` **allFields**: [`Field`](https://github.com/AhashSritharan/classes/XrmEx.Field.md)[] = `[]`

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[allFields](https://github.com/AhashSritharan/classes/XrmEx.Field.md#allfields)

#### Defined in

[XrmEx.ts:584](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L584)

## Accessors

### Attribute

• `get` **Attribute**(): `StringAttribute`

#### Returns

`StringAttribute`

#### Overrides

Field.Attribute

#### Defined in

[XrmEx.ts:836](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L836)

___

### Value

• `get` **Value**(): `string`

Gets the value.

#### Returns

`string`

The value.

#### Overrides

Field.Value

#### Defined in

[XrmEx.ts:844](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L844)

• `set` **Value**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

#### Returns

`void`

#### Overrides

Field.Value

#### Defined in

[XrmEx.ts:847](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L847)

___

### controls

• `get` **controls**(): `ItemCollection`<`StringControl`\>

#### Returns

`ItemCollection`<`StringControl`\>

#### Implementation of

Xrm.Attributes.StringAttribute.controls

#### Overrides

Field.controls

#### Defined in

[XrmEx.ts:841](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L841)

## Methods

### addNotification

▸ **addNotification**(`message`, `notificationLevel`, `uniqueId`, `actions?`): [`TextField`](https://github.com/AhashSritharan/classes/XrmEx.TextField.md)

Displays an error or recommendation notification for a control, and lets you specify actions to execute based on the notification.

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `notificationLevel` | ``"ERROR"`` \| ``"RECOMMENDATION"`` |
| `uniqueId` | `string` |
| `actions?` | `ControlNotificationAction`[] |

#### Returns

[`TextField`](https://github.com/AhashSritharan/classes/XrmEx.TextField.md)

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[addNotification](https://github.com/AhashSritharan/classes/XrmEx.Field.md#addnotification)

#### Defined in

[XrmEx.ts:780](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L780)

___

### addOnChange

▸ **addOnChange**(`handlers`): [`TextField`](https://github.com/AhashSritharan/classes/XrmEx.TextField.md)

Adds a handler or an array of handlers to be called when the attribute's value is changed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `handlers` | `ContextSensitiveHandler` \| `ContextSensitiveHandler`[] | The function reference or an array of function references. |

#### Returns

[`TextField`](https://github.com/AhashSritharan/classes/XrmEx.TextField.md)

#### Implementation of

Xrm.Attributes.StringAttribute.addOnChange

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[addOnChange](https://github.com/AhashSritharan/classes/XrmEx.Field.md#addonchange)

#### Defined in

[XrmEx.ts:752](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L752)

___

### fireOnChange

▸ **fireOnChange**(): [`TextField`](https://github.com/AhashSritharan/classes/XrmEx.TextField.md)

Fire all "on change" event handlers.

#### Returns

[`TextField`](https://github.com/AhashSritharan/classes/XrmEx.TextField.md)

#### Implementation of

Xrm.Attributes.StringAttribute.fireOnChange

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

Xrm.Attributes.StringAttribute.getAttributeType

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getAttributeType](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getattributetype)

#### Defined in

[XrmEx.ts:602](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L602)

___

### getFormat

▸ **getFormat**(): `StringAttributeFormat`

#### Returns

`StringAttributeFormat`

#### Implementation of

Xrm.Attributes.StringAttribute.getFormat

#### Overrides

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getFormat](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getformat)

#### Defined in

[XrmEx.ts:833](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L833)

___

### getIsDirty

▸ **getIsDirty**(): `boolean`

#### Returns

`boolean`

#### Implementation of

Xrm.Attributes.StringAttribute.getIsDirty

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getIsDirty](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getisdirty)

#### Defined in

[XrmEx.ts:608](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L608)

___

### getMaxLength

▸ **getMaxLength**(): `number`

#### Returns

`number`

#### Implementation of

Xrm.Attributes.StringAttribute.getMaxLength

#### Defined in

[XrmEx.ts:830](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L830)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Attributes.StringAttribute.getName

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

Xrm.Attributes.StringAttribute.getParent

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

Xrm.Attributes.StringAttribute.getRequiredLevel

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

Xrm.Attributes.StringAttribute.getSubmitMode

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

Xrm.Attributes.StringAttribute.getUserPrivilege

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

Xrm.Attributes.StringAttribute.getValue

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[getValue](https://github.com/AhashSritharan/classes/XrmEx.Field.md#getvalue)

#### Defined in

[XrmEx.ts:632](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L632)

___

### removeNotification

▸ **removeNotification**(`uniqueId`): [`TextField`](https://github.com/AhashSritharan/classes/XrmEx.TextField.md)

Clears the notification identified by uniqueId.

**`Remarks`**

If the uniqueId parameter is not used, the current notification shown will be removed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `uniqueId` | `string` | (Optional) Unique identifier. |

#### Returns

[`TextField`](https://github.com/AhashSritharan/classes/XrmEx.TextField.md)

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

Xrm.Attributes.StringAttribute.removeOnChange

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[removeOnChange](https://github.com/AhashSritharan/classes/XrmEx.Field.md#removeonchange)

#### Defined in

[XrmEx.ts:626](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L626)

___

### setDisabled

▸ **setDisabled**(`disabled`): [`TextField`](https://github.com/AhashSritharan/classes/XrmEx.TextField.md)

Sets the state of the control to either enabled, or disabled.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `disabled` | `boolean` | true to disable, false to enable. |

#### Returns

[`TextField`](https://github.com/AhashSritharan/classes/XrmEx.TextField.md)

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

Xrm.Attributes.StringAttribute.setIsValid

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setIsValid](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setisvalid)

#### Defined in

[XrmEx.ts:635](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L635)

___

### setNotification

▸ **setNotification**(`message`, `uniqueId`): [`TextField`](https://github.com/AhashSritharan/classes/XrmEx.TextField.md)

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

[`TextField`](https://github.com/AhashSritharan/classes/XrmEx.TextField.md)

true if it succeeds, false if it fails.

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setNotification](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setnotification)

#### Defined in

[XrmEx.ts:671](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L671)

___

### setRequired

▸ **setRequired**(`required`): [`TextField`](https://github.com/AhashSritharan/classes/XrmEx.TextField.md)

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `required` | `boolean` | The requirement level, as either false for "none" or true for "required" |

#### Returns

[`TextField`](https://github.com/AhashSritharan/classes/XrmEx.TextField.md)

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setRequired](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setrequired)

#### Defined in

[XrmEx.ts:729](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L729)

___

### setRequiredLevel

▸ **setRequiredLevel**(`requirementLevel`): [`TextField`](https://github.com/AhashSritharan/classes/XrmEx.TextField.md)

Sets the required level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `requirementLevel` | `RequirementLevel` | The requirement level, as either "none", "required", or "recommended" |

#### Returns

[`TextField`](https://github.com/AhashSritharan/classes/XrmEx.TextField.md)

#### Implementation of

Xrm.Attributes.StringAttribute.setRequiredLevel

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

Xrm.Attributes.StringAttribute.setSubmitMode

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

Xrm.Attributes.StringAttribute.setValue

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setValue](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setvalue)

#### Defined in

[XrmEx.ts:599](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L599)

___

### setVisible

▸ **setVisible**(`visible`): [`TextField`](https://github.com/AhashSritharan/classes/XrmEx.TextField.md)

Sets the visibility state.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `visible` | `boolean` | true to show, false to hide. |

#### Returns

[`TextField`](https://github.com/AhashSritharan/classes/XrmEx.TextField.md)

#### Inherited from

[Field](https://github.com/AhashSritharan/classes/XrmEx.Field.md).[setVisible](https://github.com/AhashSritharan/classes/XrmEx.Field.md#setvisible)

#### Defined in

[XrmEx.ts:688](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L688)
