import { IReview } from 'src/entities/course/model/types'
import { API_BASE_URL } from '../../../shared/config/api'

export const fetchFeedbacks = async (
	telegram_id: string
): Promise<IReview[]> => {
	try {
		const response = await fetch(
			`${API_BASE_URL}/reviews/?telegram_id=${telegram_id}`
		)
		const data = await response.json()
		return data.feedback || []
	} catch (error) {
		console.error('Error fetching data:', error)
		return []
	}
}
