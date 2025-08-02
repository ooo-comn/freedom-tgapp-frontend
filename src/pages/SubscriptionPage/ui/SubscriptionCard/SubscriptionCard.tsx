import { FC } from 'react'
import PhoneIcon from '../../../../shared/assets/course/Phone.svg'
import TgStar from '../../../../shared/assets/wallet/TgStar.svg'
import styles from './SubscriptionCard.module.css'

interface ISubscriptionCard {
	contactsCount: string
	price: number
	priceType: string
}

const SubscriptionCard: FC<ISubscriptionCard> = ({
	contactsCount,
	price,
	priceType,
}) => {
	return (
		<div className={styles['subscription-card']}>
			<div className={styles['subscription-card__icon-wrapper']}>
				<img
					className={styles['subscription-card__icon']}
					src={PhoneIcon}
					alt='Стоимость подписки'
				/>
			</div>
			<div className={styles['subscription-card__info']}>
				<p className={styles['subscription-card__contacts-count']}>
					{contactsCount}
				</p>
				{priceType === 'card' ? (
					<p className={styles['subscription-card__price']}>
						{price} рублей на месяц
					</p>
				) : (
					<div className={styles['subscription-card__wrapper-stars']}>
						<img
							src={TgStar}
							alt='Оплатить звездами'
							className={styles['subscription-card__star-icon']}
						/>
						<p className={styles['subscription-card__stars-price']}>{price}</p>
					</div>
				)}
			</div>
		</div>
	)
}

export default SubscriptionCard
