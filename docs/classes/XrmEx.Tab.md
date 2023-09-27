[xrm-ex](https://github.com/AhashSritharan/README.md) / [Exports](https://github.com/AhashSritharan/modules.md) / [XrmEx](https://github.com/AhashSritharan/modules/XrmEx.md) / Tab

# Class: Tab<Sections\>

[XrmEx](https://github.com/AhashSritharan/modules/XrmEx.md).Tab

## Type parameters

| Name | Type |
| :------ | :------ |
| `Sections` | extends `TabSections` |

## Implements

- `Tab`

## Table of contents

### Constructors

- [constructor](https://github.com/AhashSritharan/classes/XrmEx.Tab.md#constructor)

### Properties

- [Name](https://github.com/AhashSritharan/classes/XrmEx.Tab.md#name)
- [Section](https://github.com/AhashSritharan/classes/XrmEx.Tab.md#section)
- [\_tab](https://github.com/AhashSritharan/classes/XrmEx.Tab.md#_tab)
- [sections](https://github.com/AhashSritharan/classes/XrmEx.Tab.md#sections)

### Accessors

- [Tab](https://github.com/AhashSritharan/classes/XrmEx.Tab.md#tab)

### Methods

- [addTabStateChange](https://github.com/AhashSritharan/classes/XrmEx.Tab.md#addtabstatechange)
- [getDisplayState](https://github.com/AhashSritharan/classes/XrmEx.Tab.md#getdisplaystate)
- [getLabel](https://github.com/AhashSritharan/classes/XrmEx.Tab.md#getlabel)
- [getName](https://github.com/AhashSritharan/classes/XrmEx.Tab.md#getname)
- [getParent](https://github.com/AhashSritharan/classes/XrmEx.Tab.md#getparent)
- [getVisible](https://github.com/AhashSritharan/classes/XrmEx.Tab.md#getvisible)
- [removeTabStateChange](https://github.com/AhashSritharan/classes/XrmEx.Tab.md#removetabstatechange)
- [setDisplayState](https://github.com/AhashSritharan/classes/XrmEx.Tab.md#setdisplaystate)
- [setFocus](https://github.com/AhashSritharan/classes/XrmEx.Tab.md#setfocus)
- [setLabel](https://github.com/AhashSritharan/classes/XrmEx.Tab.md#setlabel)
- [setVisible](https://github.com/AhashSritharan/classes/XrmEx.Tab.md#setvisible)

## Constructors

### constructor

• **new Tab**<`Sections`\>(`name`, `section?`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Sections` | extends `TabSections` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `section?` | `Sections` |

#### Defined in

[XrmEx.ts:1343](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1343)

## Properties

### Name

• `Readonly` **Name**: `string`

#### Defined in

[XrmEx.ts:1340](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1340)

___

### Section

• **Section**: `Sections`

#### Defined in

[XrmEx.ts:1342](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1342)

___

### \_tab

• `Protected` `Optional` **\_tab**: `Tab`

#### Defined in

[XrmEx.ts:1341](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1341)

___

### sections

• **sections**: `ItemCollection`<`Section`\>

#### Implementation of

Xrm.Controls.Tab.sections

#### Defined in

[XrmEx.ts:1350](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1350)

## Accessors

### Tab

• `get` **Tab**(): `Tab`

#### Returns

`Tab`

#### Defined in

[XrmEx.ts:1352](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1352)

## Methods

### addTabStateChange

▸ **addTabStateChange**(`handler`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `handler` | `ContextSensitiveHandler` |

#### Returns

`void`

#### Implementation of

Xrm.Controls.Tab.addTabStateChange

#### Defined in

[XrmEx.ts:1357](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1357)

___

### getDisplayState

▸ **getDisplayState**(): `DisplayState`

#### Returns

`DisplayState`

#### Implementation of

Xrm.Controls.Tab.getDisplayState

#### Defined in

[XrmEx.ts:1360](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1360)

___

### getLabel

▸ **getLabel**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Controls.Tab.getLabel

#### Defined in

[XrmEx.ts:1381](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1381)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Controls.Tab.getName

#### Defined in

[XrmEx.ts:1363](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1363)

___

### getParent

▸ **getParent**(): `Ui`

#### Returns

`Ui`

#### Implementation of

Xrm.Controls.Tab.getParent

#### Defined in

[XrmEx.ts:1366](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1366)

___

### getVisible

▸ **getVisible**(): `boolean`

#### Returns

`boolean`

#### Implementation of

Xrm.Controls.Tab.getVisible

#### Defined in

[XrmEx.ts:1378](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1378)

___

### removeTabStateChange

▸ **removeTabStateChange**(`handler`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `handler` | `ContextSensitiveHandler` |

#### Returns

`void`

#### Implementation of

Xrm.Controls.Tab.removeTabStateChange

#### Defined in

[XrmEx.ts:1369](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1369)

___

### setDisplayState

▸ **setDisplayState**(`displayState`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `displayState` | `DisplayState` |

#### Returns

`void`

#### Implementation of

Xrm.Controls.Tab.setDisplayState

#### Defined in

[XrmEx.ts:1372](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1372)

___

### setFocus

▸ **setFocus**(): `void`

#### Returns

`void`

#### Implementation of

Xrm.Controls.Tab.setFocus

#### Defined in

[XrmEx.ts:1387](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1387)

___

### setLabel

▸ **setLabel**(`label`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `label` | `string` |

#### Returns

`void`

#### Implementation of

Xrm.Controls.Tab.setLabel

#### Defined in

[XrmEx.ts:1384](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1384)

___

### setVisible

▸ **setVisible**(`visible`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `visible` | `boolean` |

#### Returns

`void`

#### Implementation of

Xrm.Controls.Tab.setVisible

#### Defined in

[XrmEx.ts:1375](https://github.com/AhashSritharan/Xrm-Ex/blob/6521b1e/src/XrmEx.ts#L1375)
