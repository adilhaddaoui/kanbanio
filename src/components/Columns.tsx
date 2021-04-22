import * as React from 'react'
import { useRef } from 'react'

import { Flex, Badge, Text, FlexProps } from '@chakra-ui/react'

import { useDrop, DragObjectWithType } from 'react-dnd'
import { EventInterface } from '../Kanban'

interface DroppedEventInterface extends DragObjectWithType {
	data: EventInterface
	sourceStatus: string
}

interface ColumnInterface extends FlexProps {
	count: number
	label: string
	targetStatus: string
	triggerCancelation: (
		sourceStatus: string,
		targetStatus: string,
		event: EventInterface,
	) => void
	changeEventStatus: (
		selectedEvent: EventInterface,
		targetStatus: string,
		sourceStatus: string,
		cancelReason?: string,
	) => Promise<void>
	children: React.ReactNode
}
const Column: React.FC<ColumnInterface> = ({
	count,
	label,
	targetStatus,
	triggerCancelation,
	changeEventStatus,
	children,
	...props
}: ColumnInterface): React.ReactElement => {
	const ref = useRef(null)

	const [, drop] = useDrop({
		accept: 'card',
		drop(item: DroppedEventInterface) {
			if (targetStatus === 'canceled') {
				triggerCancelation(item.sourceStatus, targetStatus, item.data)
			} else {
				changeEventStatus(item.data, targetStatus, item.sourceStatus)
			}
		},
		canDrop(item: DroppedEventInterface) {
			if (targetStatus === item.sourceStatus) {
				return false
			}
			return true
		},
	})
	drop(ref)
	return (
		<>
			<Flex
				{...props}
				key={1}
				minWidth="220px"
				width="100%"
				minHeight="490px"
				height="100%"
				bg="gray.300"
				p="14px 8px"
				justify="flex-start"
				direction="column"
				boxShadow="0 2px 12px rgba(0,0,0, .1)"
				ref={ref}
			>
				<Flex justify="space-between" align="center" mb="20px">
					<Text fontSize="sm" color="gray.800" fontWeight="bold">
						{label}
					</Text>
					<Badge
						bg="gray.50"
						color="gray.800"
						width="22px"
						height="22px"
						borderRadius="50%"
						paddingX="2px"
						paddingY="2px"
						textAlign="center"
						fontSize="xs"
					>
						{count}
					</Badge>
				</Flex>
				{children}
			</Flex>
		</>
	)
}

export default Column
