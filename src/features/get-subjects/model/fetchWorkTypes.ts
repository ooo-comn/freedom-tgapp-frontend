import { API_BASE_URL } from 'src/shared/config/api'

export const fetchSubjects = async (): Promise<string[]> => {
	try {
		const response = await fetch(`${API_BASE_URL}/subjects`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		})

		if (!response.ok) {
			throw new Error(`Ошибка HTTP: ${response.status}`)
		}

		return await response.json()
	} catch (error) {
		console.error('Ошибка при загрузке списка предметов:', error)
		throw error
	}
}
