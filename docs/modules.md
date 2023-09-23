[xrm-ex](README.md) / Exports

# xrm-ex

## Table of contents

### Namespaces

- [XrmEx](modules/XrmEx.md)

### Type Aliases

- [EntityReference](modules.md#entityreference)
- [RequestParameter](modules.md#requestparameter)

## Type Aliases

### EntityReference

Ƭ **EntityReference**: `Object`

Represents a reference to an entity.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `entityType` | `string` |
| `id` | `string` |

#### Defined in

[XrmEx.ts:31](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L31)

___

### RequestParameter

Ƭ **RequestParameter**: `Object`

Represents a parameter for a request.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `Name` | `string` |
| `Type` | ``"Boolean"`` \| ``"DateTime"`` \| ``"Decimal"`` \| ``"Entity"`` \| ``"EntityCollection"`` \| ``"EntityReference"`` \| ``"Float"`` \| ``"Integer"`` \| ``"Money"`` \| ``"Picklist"`` \| ``"String"`` |
| `Value` | `any` |

#### Defined in

[XrmEx.ts:9](https://github.com/AhashSritharan/Xrm-Ex/blob/b300141/src/XrmEx.ts#L9)
