import cn from 'classnames'
import { FC } from 'react'
import styles from './LinksFAQ.module.css'

interface ILinksFAQ {
	path: string
	text: string
	isSubmit: boolean
	isNotifyFAQ?: any
	className?: string
}

const LinksFAQ: FC<ILinksFAQ> = ({ path, text, className }) => {
	return (
		<div className={styles['linksFAQ']}>
			<div className={styles['linksFAQ__content']}>
				<div className={styles['linksFAQ__image-wrapper']}>
					<img
						src={path}
						alt='Ссылка на документацию'
						className={cn(styles['linksFAQ__image'], className)}
					/>
				</div>
				<h3 className={styles['linksFAQ__text']}>{text}</h3>
			</div>
		</div>
	)
}

export default LinksFAQ
