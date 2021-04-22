import React from 'react'

import { usePreview } from 'react-dnd-preview'

import Card from './Card'

const MobileDragPreview = (): React.ReactElement => {
	const { display, item, style } = usePreview()
	if (!display) {
		return null
	}

	return (
		<Card
			appointment={item.data}
			sourceStatus={item.sourceStatus}
			style={{ ...style, maxWidth: '220px' }}
		/>
	)
}

export default MobileDragPreview
