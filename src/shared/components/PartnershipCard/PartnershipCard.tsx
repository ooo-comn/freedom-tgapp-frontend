import { FC } from 'react'
import PhoneIcon from '../../../shared/assets/course/Phone.svg'
import styles from './PartnershipCard.module.css'

const PartnershipCard: FC = () => {
	return (
		<div className={styles['partnershipCard']}>
			<div className={styles['partnershipCard__infoBlock']}>
				<img
					className={styles['partnershipCard__icon']}
					src={PhoneIcon}
					alt='Количество приглашенных друзей'
				/>
				<p className={styles['partnershipCard__counter']}>Приглашено 1/5</p>
			</div>
			<div className={styles['partnershipCard__content']}>
				<h3 className={styles['partnershipCard__title']}>Зови друзей</h3>
				<p className={styles['partnershipCard__description']}>
					Пригласи 5 друзей и получи подписку на 5 контактов за переходы по
					твоей ссылке и успешный онбординг пользователей.
				</p>
			</div>

			<button className={styles['partnershipCard__button']}>Советовать</button>
		</div>
	)
}

export default PartnershipCard
