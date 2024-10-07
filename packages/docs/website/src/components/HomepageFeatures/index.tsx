import Heading from '@theme/Heading'
import clsx from 'clsx'
import { FaGhost } from 'react-icons/fa'
import { GiWashingMachine } from 'react-icons/gi'
import { LuGlasses } from 'react-icons/lu'
import { TbFeather } from 'react-icons/tb'

import styles from './styles.module.css'

type FeatureItem = {
	description: JSX.Element
	Svg: React.ComponentType<React.ComponentProps<'svg'>>
	title: string
}

const FeatureList: FeatureItem[] = [
	{
		description: (
			<>
				Finite state machine helps model an application logic in a way that is
				expressive of domain knowledge.
			</>
		),
		Svg: GiWashingMachine,
		title: 'State Machines',
	},
	{
		description: (
			<>
				Optics are a way of getting and setting parts of a larger data structure
				in a purely functional way.
			</>
		),
		Svg: LuGlasses,
		title: 'Functional Optics',
	},
	{
		description: <>Jotai is a great complement, yet it's fully decoupled.</>,
		Svg: FaGhost,
		title: 'Jotai integration (optional)',
	},
	{
		description: <>The library is tree-shakable and dependency-free.</>,
		Svg: TbFeather,
		title: 'Lightweight',
	},
]

function Feature({ description, Svg, title }: FeatureItem) {
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
