import { FC, MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import StarFeedbackIcon from '../../../../shared/assets/course/StarFeedback.svg'
import CheckIcon from '../../../../shared/assets/wallet/CheckIcon.svg'
import LinkArrow from '../../../../shared/assets/wallet/LinkArrow.svg'
import styles from './FilterItem.module.css'

interface IFilterItem {
	filterItemType: 'checkbox' | 'link' | 'button'
	text: string
	isNotify?: boolean
	isNotifyFAQ?: any
	checked?: boolean
	path?: string
	handleCheckboxChange?: () => void
}

const FilterItem: FC<IFilterItem> = ({
	text,
	filterItemType,
	isNotify,
	isNotifyFAQ,
	checked,
	handleCheckboxChange,
	path,
}) => {
	const handleClick = (e: MouseEvent) => {
		if (e.target instanceof HTMLInputElement) {
			e.stopPropagation()
			return
		}

		if (filterItemType === 'checkbox') {
			isNotifyFAQ && isNotifyFAQ()
		} else if (filterItemType === 'button') {
			handleCheckboxChange && handleCheckboxChange()
		}
	}

	const content = (
		<div className={styles['filter-item']} onClick={handleClick}>
			{filterItemType === 'button' && (
				<div className={styles['filter-item__button-content']}>
					<img
						className={styles['filter-item__icon']}
						src={StarFeedbackIcon}
						alt='Фильтр'
					/>
					<p className={styles['filter-item__text']}>{text}</p>
				</div>
			)}

			{filterItemType !== 'button' && (
				<p className={styles['filter-item__text']}>{text}</p>
			)}

			{filterItemType === 'button' ? (
				<div className={styles['filter-item__toggle']}>
					<input
						className={styles['filter-item__toggle-input']}
						type='checkbox'
						id='toggle'
						checked={checked}
						onChange={handleCheckboxChange}
					/>
					<label
						className={styles['filter-item__toggle-label']}
						htmlFor='toggle'
					></label>
				</div>
			) : filterItemType === 'checkbox' ? (
				<label className={styles['filter-item__checkbox-label']}>
					<input
						type='checkbox'
						checked={isNotify}
						onChange={isNotifyFAQ}
						className={styles['filter-item__checkbox-input']}
					/>
					<span
						className={`${styles['filter-item__checkbox-custom']} ${
							isNotify ? styles['filter-item__checkbox-custom--checked'] : ''
						}`}
					>
						{isNotify && (
							<img
								className={styles['filter-item__checkbox-icon']}
								src={CheckIcon}
								alt='✔'
							/>
						)}
					</span>
				</label>
			) : (
				<img
					className={styles['filter-item__link-icon']}
					src={LinkArrow}
					alt='Фильтр'
				/>
			)}
		</div>
	)

	return path ? <Link to={path}>{content}</Link> : content
}

export default FilterItem
