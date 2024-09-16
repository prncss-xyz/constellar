import Heading from '@theme/Heading'
import clsx from 'clsx'
import {
	TbBatteryCharging,
	TbCheckbox,
	TbFeather,
	TbHelmet,
	TbLambda,
} from 'react-icons/tb'

import styles from './styles.module.css'

type FeatureItem = {
	title: string
	Svg: React.ComponentType<React.ComponentProps<'svg'>>
	description: JSX.Element
}

const FeatureList: FeatureItem[] = [
	{
		title: 'Pure Functions',
		Svg: TbLambda,
		description: (
			<>
				Define your state logic with composable pure functions. Make it
				uncoupled and testable.
			</>
		),
	},
	{
		title: 'Well known abstractions',
		Svg: TbBatteryCharging,
		description: (
			<>Enjoy finite state machines, functional optics, and async primitives.</>
		),
	},
	{
		title: 'Lightweight',
		Svg: TbFeather,
		description: <>The library is tree-shakable and dependency-free.</>,
	},
	{
		title: 'Opt-in integration',
		Svg: TbCheckbox,
		description: <>Use react integration with a separate package.</>,
	},
	{
		title: 'Reliable',
		Svg: TbHelmet,
		description: (
			<>
				The library is written in TypeScript, with focus on the quality of the
				typing. It is also well tested.
			</>
		),
	},
]

function Feature({ title, Svg, description }: FeatureItem) {
	return (
		<div className={clsx('col col--4')}>
			<div className="text--center">
				<Svg className={styles.featureSvg} role="img" />
			</div>
			<div className="text--center padding-horiz--md">
				<Heading as="h3">{title}</Heading>
				<p>{description}</p>
			</div>
		</div>
	)
}

export default function HomepageFeatures(): JSX.Element {
	return (
		<section className={styles.features}>
			<div className="container">
				<div className="row">
					{FeatureList.map((props, idx) => (
						<Feature key={idx} {...props} />
					))}
				</div>
			</div>
		</section>
	)
}
