import type { ProductDraft, ProductEditableField } from './types'

export function parsePrice(rawValue: string | number) {
	const normalized = String(rawValue).replace(/\s/g, '').replace(',', '.')
	return Number(normalized)
}

export function validateProductField(
	field: ProductEditableField,
	value: string | number
): string | null {
	const stringValue = String(value).trim()

	if (field === 'price') {
		const numeric = parsePrice(value)
		if (!stringValue) {
			return 'Цена обязательна'
		}
		if (Number.isNaN(numeric) || numeric <= 0) {
			return 'Цена должна быть больше 0'
		}
		return null
	}

	if (!stringValue) {
		return 'Поле обязательно'
	}

	return null
}

export function validateDraft(draft: ProductDraft) {
	const errors: Partial<Record<ProductEditableField, string>> = {}

	;(['name', 'price', 'vendor', 'sku'] as ProductEditableField[]).forEach(field => {
		const error = validateProductField(field, draft[field])
		if (error) {
			errors[field] = error
		}
	})

	return errors
}
