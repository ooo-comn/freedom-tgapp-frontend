import { API_BASE_URL } from '../../../shared/config/api'
import { getTelegramAuthHeader } from "../../../shared/lib/telegram";

export const fetchCreatePassportData = async (formDataToSend: FormData) => {
	try {
		const response = await fetch(`${API_BASE_URL}/create-passport-data/`, {
			method: 'POST',
			headers: {
				Authorization: getTelegramAuthHeader(),
			},
			body: formDataToSend,
		})

		if (!response.ok) {
			throw new Error('Ошибка при отправке данных')
		}

		return true
	} catch (error) {
		console.error('Ошибка при отправке паспортных данных:', error)
		return false
	}
}
