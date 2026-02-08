import { memo, type FC } from 'react'

import styles from './progress.module.scss'

type ProgressBarProps = {
	isVisible: boolean
}

const ProgressBarComponent: FC<ProgressBarProps> = ({ isVisible }) => {
	return isVisible ? (
		<div
			className={styles.progressBar}
			role='status'
			aria-live='polite'
		>
			<span className={styles.progressLine} />
		</div>
	) : null
}

export const ProgressBar = memo(ProgressBarComponent)
