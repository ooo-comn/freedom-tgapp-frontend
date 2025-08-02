import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ITelegramUser } from '../../../entities/course/model/types'
import { API_BASE_URL } from '../../../shared/config/api'

const useUserCoursesData = (
	id: number,
	navigate: ReturnType<typeof useNavigate>
): {
	userCourses: ITelegramUser[] | null
	isLoading: boolean
	error: string | null
} => {
	const [userCourses, setUserCourses] = useState<ITelegramUser[] | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true)
			setError(null)

			try {
				const response = await fetch(
					`${API_BASE_URL}/users/?telegram_id=${id}`,
					{
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `tma ${window.Telegram.WebApp.initData}`,
						},
					}
				)

				const result: ITelegramUser[] = await response.json()

				console.log('result', result)

				if (result.length === 0) {
					sessionStorage.setItem('userCourses', JSON.stringify(result))
					navigate('/landing')
				} else {
					setUserCourses(result)
				}
			} catch (error) {
				console.error('Ошибка загрузки курсов:', error)
				setError('Ошибка загрузки данных')
			} finally {
				setIsLoading(false)
			}
		}

		fetchData()
	}, [id, navigate])

	return { userCourses, isLoading, error }
}

export default useUserCoursesData
