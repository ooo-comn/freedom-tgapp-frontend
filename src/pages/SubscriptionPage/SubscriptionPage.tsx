import { FC, useState } from 'react'
import CreditCardSolid from '../../shared/assets/wallet/CreditCardSolid.svg'
import TgStar from '../../shared/assets/wallet/TgStar.svg'
import styles from './SubscriptionPage.module.css'
import SubscriptionButton from './ui/SubscriptionButton/SubscriptionButton'
import SubscriptionCard from './ui/SubscriptionCard/SubscriptionCard'

const SubscriptionPage: FC = () => {
	var BackButton = window.Telegram.WebApp.BackButton
	BackButton.show()
	BackButton.onClick(function () {
		BackButton.hide()
	})
	window.Telegram.WebApp.onEvent('backButtonClicked', function () {
		window.history.back()
	})

	const [activeButton, setActiveButton] = useState<'card' | 'telegram'>('card')

	const handleButtonClick = (buttonType: 'card' | 'telegram') => {
		setActiveButton(buttonType)
	}

	return (
		<div className={styles['subscription-page']}>
			<h1 className={styles['subscription-page__title']}>Подписки</h1>
			<div className={styles['subscription-page__cards-container']}>
				<SubscriptionCard
					contactsCount='1 контакт'
					price={activeButton === 'card' ? 29 : 20}
					priceType={activeButton}
				/>
				<SubscriptionCard
					contactsCount='5 контактов'
					price={activeButton === 'card' ? 49 : 40}
					priceType={activeButton}
				/>
				<SubscriptionCard
					contactsCount='10 контактов'
					price={activeButton === 'card' ? 99 : 60}
					priceType={activeButton}
				/>
				<p className={styles['subscription-page__disclaimer']}>
					Ты покупаешь контакты на месяц, по истечении этого времени контакты
					сгорают.
				</p>
			</div>
			<div className={styles['subscription-page__payment-section']}>
				<p className={styles['subscription-page__payment-title']}>
					Выберите способ оплаты
				</p>
				<div className={styles['subscription-page__payment-buttons']}>
					<SubscriptionButton
						imagePath={CreditCardSolid}
						saleType='Оплата картой'
						isActive={activeButton === 'card'}
						onClick={() => handleButtonClick('card')}
					/>
					<SubscriptionButton
						imagePath={TgStar}
						saleType='Оплата звездами Telegram'
						isActive={activeButton === 'telegram'}
						onClick={() => handleButtonClick('telegram')}
					/>
				</div>
			</div>

			<button className={styles['subscription-page__payment-button']}>
				Оплатить
			</button>
		</div>
	)
}

export default SubscriptionPage
