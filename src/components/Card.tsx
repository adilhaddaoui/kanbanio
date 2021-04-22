import * as React from 'react'
import { useRef } from 'react'

import { Flex, Text, FlexProps } from '@chakra-ui/react'
import { useDrag } from 'react-dnd'
import { fromUnixTime, format } from 'date-fns'

import { EventInterface } from '../Kanban'
import { FiCalendar } from 'react-icons/fi'
import { WiTime9 } from 'react-icons/wi'
import { MdUpdate } from 'react-icons/md'
import { AiOutlineStop } from 'react-icons/ai'

interface CardInteface extends FlexProps {
	event: EventInterface
	sourceStatus: string
}
const Card: React.FC<CardInteface> = ({
	event,
	sourceStatus,
	...props
}: CardInteface): React.ReactElement => {
	const cancellation_reasons: { [key: string]: string } = {
		organizer: 'Organizer decision',
		error: 'Created by error',
	}

	const ref = useRef(null)
	const [{ isDragging }, drag] = useDrag({
		item: { type: 'card', id: event.id, data: event, sourceStatus },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	})
	const opacity = isDragging ? 0 : 1
	drag(ref)
	return (
		<Flex
			bg="gray.50"
			width="100%"
			p="14px 12px"
			my="5px"
			direction="column"
			borderLeft={`4px solid ${event.color}`}
			ref={ref}
			opacity={opacity}
			{...props}
		>
			{event && event.cancellation_reason && (
				<Flex
					justify="space-between"
					mb="12px"
					align="center"
					flexWrap="wrap"
					width="100%"
				>
					{event.cancellation_reason && (
						<Flex align="center" justify="flex-end">
							<Text color="red.800" fontSize="xs">
								<AiOutlineStop />
							</Text>
							<Text color="red.800" fontSize="xs" ml="2px">
								{cancellation_reasons[event.cancellation_reason]}
							</Text>
						</Flex>
					)}
				</Flex>
			)}
			<Text
				color="gray.600"
				fontWeight="bold"
				fontSize="sm"
				mb="6px"
				cursor="pointer"
			>
				{event.title}
			</Text>
			{event.updated_at ? (
				<Flex direction="column" mb="6px">
					<Flex align="center">
						<Text color="gray.600" fontSize="xs">
							<FiCalendar />
						</Text>
						<Text color="gray.600" fontSize="xs" fontWeight="500" ml="2px">
							{format(fromUnixTime(event.created_at), 'dd-MM-yyyy')}
						</Text>
					</Flex>
					<Flex>
						<Flex align="center">
							<Text color="gray.600" fontSize="xs">
								<WiTime9 />
							</Text>
							<Text color="gray.600" fontSize="xs" fontWeight="500" ml="2px">
								{format(fromUnixTime(event.created_at), 'kk:mm')}
							</Text>
						</Flex>
						<Flex align="center" ml="5px">
							<Text color="gray.600" fontSize="xs">
								<MdUpdate />
							</Text>
							<Text color="gray.600" fontSize="xs" fontWeight="500" ml="2px">
								{format(fromUnixTime(event.updated_at), 'kk:mm')}
							</Text>
						</Flex>
					</Flex>
				</Flex>
			) : (
				<Flex mb="6px" align="center">
					<Flex align="center">
						<Text color="gray.600" fontSize="xs">
							<FiCalendar />
						</Text>
						<Text color="gray.600" fontSize="xs" fontWeight="500" ml="2px">
							{format(fromUnixTime(event.created_at), 'dd-MM-yyyy')}
						</Text>
					</Flex>
					<Flex align="center" ml="5px">
						<Text color="gray.600" fontSize="xs">
							<WiTime9 />
						</Text>
						<Text color="gray.600" fontSize="xs" fontWeight="500" ml="2px">
							{format(fromUnixTime(event.created_at), 'kk:mm')}
						</Text>
					</Flex>
				</Flex>
			)}
			{event.comment && (
				<Text color="gray.600" fontSize="xs" lineHeight="12px">
					{event.comment}
				</Text>
			)}
		</Flex>
	)
}

export default Card
