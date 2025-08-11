import { FC } from 'react'
import { useWalletBalance } from 'src/entities/wallet/model/fetchWalletBalance'
import { useExchangeRate } from 'src/hooks/useExchangeRate'
import USDTImage from '../../../../shared/assets/wallet/USDT.png'
import styles from './WalletBalanceDisplay.module.css'

export const WalletBalanceDisplay: FC = () => {
	const { data: walletData } = useWalletBalance()
	const balance = (walletData?.balance ?? 0) / 10_000_000

	const {
		data: exchangeRate,
		isLoading: isRateLoading,
		error: rateError,
	} = useExchangeRate()

	const rubValue = exchangeRate?.price?.usdt_rub
		? (balance * exchangeRate.price.usdt_rub).toFixed(2)
		: '0.00'

	const rateValue = isRateLoading
		? 'Загрузка...'
		: rateError
		? 'Ошибка'
		: exchangeRate?.price?.usdt_rub
		? `${exchangeRate.price.usdt_rub.toFixed(2) + 0.5} ₽`
		: '0.00 ₽'

	return (
		<div className={styles['wallet-balance-display__wrapper']}>
			<img
				src={USDTImage}
				alt='картинка USDT'
				className={styles['wallet-balance-display__img']}
			/>
			<div className={styles['wallet-balance-display__info-wrapper']}>
				<div className={styles['wallet-balance-display__info']}>
					<h2 className={styles['wallet-balance-display__currency']}>USDT</h2>
					<h2 className={styles['wallet-balance-display__value']}>
						{rubValue} ₽
					</h2>
				</div>
				<div className={styles['wallet-balance-display__amount']}>
					<p className={styles['wallet-balance-display__rate']}>{rateValue}</p>
					<p className={styles['wallet-balance-display__crypto']}>
						{balance.toFixed(2)} USDT
					</p>
				</div>
			</div>
		</div>
	)
}
