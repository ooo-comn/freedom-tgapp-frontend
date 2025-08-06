import { Skeleton } from '@mui/material'
import { FC, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { calculateRating } from 'src/entities/course/lib/calculateRating'
import PaymentLimits from 'src/features/PaymentLimits/PaymentLimits'
import { WalletVerification } from 'src/features/WalletVerification/WalletVerification'
import LinksFAQ from 'src/pages/EditProfile/ui/LinksFAQ/LinksFAQ'
import EmptyStar from 'src/shared/assets/feedback/EmptyStar.svg'
import FillStar from 'src/shared/assets/feedback/FillStar.svg'
import creditCardSolid from 'src/shared/assets/profile/credit-card-solid.svg'
import NavBar from 'src/shared/components/NavBar/NavBar'
import useTheme from 'src/shared/hooks/useTheme'
import { useUserProfile } from '../model/useUserProfile'
import styles from './UserProfile.module.css'

const UserProfile: FC = () => {
	window.scrollTo(0, 0)
	const { id } = window.Telegram.WebApp.initDataUnsafe.user

	const BackButton = window.Telegram.WebApp.BackButton
	BackButton.show()
	BackButton.onClick(function () {
		BackButton.hide()
	})
	window.Telegram.WebApp.onEvent('backButtonClicked', function () {
		window.history.back()
	})

	// const [verifyed, setVerifyed] = useState<string | null>(null);

	const { userData, feedbacks, contactData } = useUserProfile()

	console.log('userData:', userData)
	console.log('contactData:', contactData)
	console.log('contactData.is_visible:', contactData?.is_visible)

	useEffect(() => {
		const fetchData = async () => {
			// const result = await fetchUserTransactions(id);
			// if (result) {
			//   setVerifyed(result.verifyed);
			// }
		}
		fetchData()
	}, [id])

	// const totalStudents = coursesData?.customer_count;

	const averageRate = feedbacks?.length > 0 ? calculateRating(feedbacks) : 0.0

	// Создаем массив звезд для отображения рейтинга
	const stars = Array.from({ length: 5 }, (_, i) =>
		i < Math.floor(averageRate) ? FillStar : EmptyStar
	)

	// Функция для склонения слова "отзыв"
	const getReviewsText = (count: number) => {
		const lastDigit = count % 10
		const lastTwoDigits = count % 100

		if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
			return `${count} отзывов`
		}

		if (lastDigit === 1) {
			return `${count} отзыв`
		}

		if (lastDigit >= 2 && lastDigit <= 4) {
			return `${count} отзыва`
		}

		return `${count} отзывов`
	}

	const { theme } = useTheme()

	return (
		<div className={styles['user-profile']}>
			<header className={styles['user-profile__header']}>
				<h2 className={styles['user-profile__title']}>Профиль</h2>
				{!userData ? (
					<>
						{theme === 'dark' ? (
							<>
								<Skeleton
									variant='circular'
									animation='wave'
									className={styles['user-profile__skeleton']}
									sx={{ bgcolor: 'grey.800' }}
								/>

								<Skeleton
									variant='rounded'
									animation='wave'
									className={styles['user-profile__skeleton-name']}
									sx={{ bgcolor: 'grey.800' }}
								/>
							</>
						) : theme === 'light' ? (
							<>
								<Skeleton
									variant='circular'
									animation='wave'
									className={styles['user-profile__skeleton']}
									sx={{ bgcolor: 'grey.300' }}
								/>

								<Skeleton
									variant='rounded'
									animation='wave'
									className={styles['user-profile__skeleton-name']}
									sx={{ bgcolor: 'grey.300' }}
								/>
							</>
						) : null}
					</>
				) : (
					<>
						<div
							className={styles['user-profile__avatar']}
							style={{
								backgroundImage: `url(${contactData?.image_url})`,
							}}
						/>
						<p className={styles['user-profile__name']}>
							{userData?.first_name} {userData?.last_name}
						</p>
						<Link
							to={`/user-feedback/${userData?.id}`}
							className={styles['user-profile__rating-link']}
						>
							<div className={styles['user-profile__rating']}>
								<span className={styles['user-profile__rating-value']}>
									{averageRate.toFixed(1)}
								</span>
								<div className={styles['user-profile__rating-stars']}>
									{stars.map((star, index) => (
										<img
											key={index}
											className={styles['user-profile__rating-star']}
											src={star}
											alt='Рейтинг звезда'
										/>
									))}
								</div>
								<span className={styles['user-profile__rating-count']}>
									{getReviewsText(feedbacks?.length || 0)}
								</span>
							</div>
						</Link>
					</>
				)}
			</header>

			<PaymentLimits />

			<WalletVerification />

			<LinksFAQ
				isSubmit={true}
				path={creditCardSolid}
				text='Реферальная программа'
			/>

			<div>
				<LinksFAQ isSubmit={true} path={creditCardSolid} text='Безопасность' />
				<LinksFAQ isSubmit={true} path={creditCardSolid} text='Язык' />
			</div>

			<div>
				<LinksFAQ isSubmit={true} path={creditCardSolid} text='Telegram' />
				<LinksFAQ isSubmit={true} path={creditCardSolid} text='FAQ' />
				<LinksFAQ isSubmit={true} path={creditCardSolid} text='Документация' />
				<LinksFAQ isSubmit={true} path={creditCardSolid} text='Поддержка' />
			</div>

			<NavBar />
		</div>
	)
}

export default UserProfile
