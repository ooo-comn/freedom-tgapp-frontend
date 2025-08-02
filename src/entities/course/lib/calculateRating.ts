import { IReview } from '../model/types'

export const calculateRating = (feedback: IReview[]) => {
	if (!feedback || feedback.length === 0) return 0
	const totalRate = feedback.reduce((sum, { rating }) => sum + rating, 0)
	return Math.round((totalRate / feedback.length) * 100) / 100
}
