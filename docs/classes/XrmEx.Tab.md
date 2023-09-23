[xrm-ex](../README.md) / [Exports](../modules.md) / [XrmEx](../modules/XrmEx.md) / Tab

# Class: Tab<Sections\>

[XrmEx](../modules/XrmEx.md).Tab

## Type parameters

| Name | Type |
| :------ | :------ |
| `Sections` | extends `TabSections` |

## Implements

- `Tab`

## Table of contents

### Constructors

- [constructor](XrmEx.Tab.md#constructor)

### Properties

- [Name](XrmEx.Tab.md#name)
- [Section](XrmEx.Tab.md#section)
- [\_tab](XrmEx.Tab.md#_tab)
- [sections](XrmEx.Tab.md#sections)

### Accessors

- [Tab](XrmEx.Tab.md#tab)

### Methods

- [addTabStateChange](XrmEx.Tab.md#addtabstatechange)
- [getDisplayState](XrmEx.Tab.md#getdisplaystate)
- [getLabel](XrmEx.Tab.md#getlabel)
- [getName](XrmEx.Tab.md#getname)
- [getParent](XrmEx.Tab.md#getparent)
- [getVisible](XrmEx.Tab.md#getvisible)
- [removeTabStateChange](XrmEx.Tab.md#removetabstatechange)
- [setDisplayState](XrmEx.Tab.md#setdisplaystate)
- [setFocus](XrmEx.Tab.md#setfocus)
- [setLabel](XrmEx.Tab.md#setlabel)
- [setVisible](XrmEx.Tab.md#setvisible)

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

[XrmEx.ts:1341](https://github.com/AhashSritharan/Xrm-Ex/blob/63388f2/src/XrmEx.ts#L1341)

## Properties

### Name

• `Readonly` **Name**: `string`

#### Defined in

[XrmEx.ts:1338](https://github.com/AhashSritharan/Xrm-Ex/blob/63388f2/src/XrmEx.ts#L1338)

___

### Section

• **Section**: `Sections`

#### Defined in

[XrmEx.ts:1340](https://github.com/AhashSritharan/Xrm-Ex/blob/63388f2/src/XrmEx.ts#L1340)

___

### \_tab

• `Protected` `Optional` **\_tab**: `Tab`

#### Defined in

[XrmEx.ts:1339](https://github.com/AhashSritharan/Xrm-Ex/blob/63388f2/src/XrmEx.ts#L1339)

___

### sections

• **sections**: `ItemCollection`<`Section`\>

#### Implementation of

Xrm.Controls.Tab.sections

#### Defined in

[XrmEx.ts:1348](https://github.com/AhashSritharan/Xrm-Ex/blob/63388f2/src/XrmEx.ts#L1348)

## Accessors

### Tab

• `get` **Tab**(): `Tab`

#### Returns

`Tab`

#### Defined in

[XrmEx.ts:1350](https://github.com/AhashSritharan/Xrm-Ex/blob/63388f2/src/XrmEx.ts#L1350)

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

[XrmEx.ts:1355](https://github.com/AhashSritharan/Xrm-Ex/blob/63388f2/src/XrmEx.ts#L1355)

___

### getDisplayState

▸ **getDisplayState**(): `DisplayState`

#### Returns

`DisplayState`

#### Implementation of

Xrm.Controls.Tab.getDisplayState

#### Defined in

[XrmEx.ts:1358](https://github.com/AhashSritharan/Xrm-Ex/blob/63388f2/src/XrmEx.ts#L1358)

___

### getLabel

▸ **getLabel**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Controls.Tab.getLabel

#### Defined in

[XrmEx.ts:1379](https://github.com/AhashSritharan/Xrm-Ex/blob/63388f2/src/XrmEx.ts#L1379)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Implementation of

Xrm.Controls.Tab.getName

#### Defined in

[XrmEx.ts:1361](https://github.com/AhashSritharan/Xrm-Ex/blob/63388f2/src/XrmEx.ts#L1361)

___

### getParent

▸ **getParent**(): `Ui`

#### Returns

`Ui`

#### Implementation of

Xrm.Controls.Tab.getParent

#### Defined in

[XrmEx.ts:1364](https://github.com/AhashSritharan/Xrm-Ex/blob/63388f2/src/XrmEx.ts#L1364)

___

### getVisible

▸ **getVisible**(): `boolean`

#### Returns

`boolean`

#### Implementation of

Xrm.Controls.Tab.getVisible

#### Defined in

[XrmEx.ts:1376](https://github.com/AhashSritharan/Xrm-Ex/blob/63388f2/src/XrmEx.ts#L1376)

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

[XrmEx.ts:1367](https://github.com/AhashSritharan/Xrm-Ex/blob/63388f2/src/XrmEx.ts#L1367)

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

[XrmEx.ts:1370](https://github.com/AhashSritharan/Xrm-Ex/blob/63388f2/src/XrmEx.ts#L1370)

___

### setFocus

▸ **setFocus**(): `void`

#### Returns

`void`

#### Implementation of

Xrm.Controls.Tab.setFocus

#### Defined in

[XrmEx.ts:1385](https://github.com/AhashSritharan/Xrm-Ex/blob/63388f2/src/XrmEx.ts#L1385)

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

[XrmEx.ts:1382](https://github.com/AhashSritharan/Xrm-Ex/blob/63388f2/src/XrmEx.ts#L1382)

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

[XrmEx.ts:1373](https://github.com/AhashSritharan/Xrm-Ex/blob/63388f2/src/XrmEx.ts#L1373)
