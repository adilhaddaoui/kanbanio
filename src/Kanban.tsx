import * as React from 'react'
import { useState, useCallback } from 'react'

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import { toDate, compareAsc, getUnixTime } from 'date-fns'

import { Flex, Heading, Text } from '@chakra-ui/react'
import Column from './components/Columns'
import Card from './components/Card'
import MobileDragPreview from './components/MobileDragPreview'
import CancelReasonPopup from './components/CancelReasonPopup'
import {
	BiCalendarEvent,
	BiCalendarStar,
	BiCalendarEdit,
	BiCalendarCheck,
	BiCalendarX,
} from 'react-icons/bi'

import eventsData from './events-data.json'

export interface EventInterface {
	id: number
	created_at: number
	updated_at?: number
	title: string
	color: string
	comment?: string
	cancellation_reason?: string
}

interface KanbanColumnInterface {
	[key: string]: {
		events: Array<EventInterface>
		count: number
	}
}

const isTouchDevice = (): boolean => {
	if ('ontouchstart' in window) {
		return true
	}
	return false
}

const Kanban: React.FC = (): React.ReactElement => {
	const [events, setEvents] = useState<KanbanColumnInterface>(eventsData)
	const [cancelationData, setCancelationData] = useState<{
		isCanceling: boolean
		sourceStatus: string
		targetStatus: string
		event: EventInterface
	}>({
		isCanceling: false,
		sourceStatus: '',
		targetStatus: '',
		event: {} as EventInterface,
	})

	const handleCloseCancelPopup = (): void => {
		setCancelationData({
			sourceStatus: '',
			targetStatus: '',
			event: {} as EventInterface,
			isCanceling: false,
		})
	}

	const handleChangeEventStatus = useCallback(
		async (
			selectedEvent: EventInterface,
			targetStatus: string,
			sourceStatus: string,
			cancelReason?: string,
		): Promise<void> => {
			if (cancelReason) {
				setCancelationData({
					sourceStatus: '',
					targetStatus: '',
					event: {} as EventInterface,
					isCanceling: false,
				})
			}

			const eventIndex: number = events[sourceStatus].events.findIndex(
				(event) => event.id === selectedEvent.id,
			)

			let targetEvent = events[sourceStatus]['events'][eventIndex]

			if (targetStatus === 'on_hold') {
				targetEvent.updated_at = undefined
			} else if (targetStatus === 'canceled') {
				targetEvent.updated_at =
					targetEvent.updated_at || getUnixTime(new Date())
			}
			targetEvent.cancellation_reason = cancelReason
			const targetEvents = [
				...events[targetStatus].events,
				{
					...targetEvent,
				},
			]

			const newTargetEvents: {
				count: number
				events: Array<EventInterface>
			} = {
				...events[targetStatus],
				count: events[targetStatus].count + 1,
				events: targetEvents,
			}

			const sourceEvents = events[sourceStatus].events
			sourceEvents.splice(eventIndex, 1)
			const newSourceEvents: {
				count: number
				events: Array<EventInterface>
			} = {
				...events[sourceStatus],
				count: events[sourceStatus].count - 1,
				events: sourceEvents,
			}
			setEvents({
				...events,
				[targetStatus]: newTargetEvents,
				[sourceStatus]: newSourceEvents,
			})

			if (cancelReason) {
				/*
				 * API request to cancel event
				 * with body: JSON.stringify({
				 *		reason_for_delete: cancelReason,
				 *	})
				 */
			} else {
				/*
				 * API request to update event
				 * body: JSON.stringify({
				 *		updated_at,
				 *		status: targetStatus,
				 * }),
				 */
			}
		},
		[events],
	)

	const triggerCancelation = (
		sourceStatus: string,
		targetStatus: string,
		event: EventInterface,
	): void => {
		setCancelationData({
			sourceStatus,
			targetStatus,
			event,
			isCanceling: true,
		})
	}

	const sortByDate = (type: string, date: string): Array<EventInterface> => {
		return events[type].events.sort((a, b) => {
			if (!a.updated_at || !b.updated_at) {
				return 0
			}
			let dateA = null
			let dateB = null
			if (date === 'updated_at') {
				dateA = toDate(a.updated_at)
				dateB = toDate(b.updated_at)
			}
			if (date === 'date') {
				dateA = toDate(a.created_at)
				dateB = toDate(b.created_at)
			}
			if (!dateA || !dateB) {
				return 0
			}
			return compareAsc(dateA, dateB)
		})
	}

	return (
		<Flex direction="column" p="22px">
			<Heading as="h1" fontSize="2xl" color="gray.600">
				Kanban
			</Heading>

			<DndProvider backend={isTouchDevice() ? TouchBackend : HTML5Backend}>
				<Flex justify="space-between" mt="20px" overflowX="auto">
					{isTouchDevice() && <MobileDragPreview />}
					<Column
						count={events ? events.on_hold.count : 0}
						changeEventStatus={handleChangeEventStatus}
						label="On hold"
						targetStatus="on_hold"
						triggerCancelation={triggerCancelation}
						mr="10px"
					>
						{events && events.on_hold.events.length > 0 ? (
							sortByDate('on_hold', 'date').map((event, index) => (
								<Card event={event} key={index} sourceStatus="on_hold" />
							))
						) : (
							<Flex
								direction="column"
								align="center"
								justify="center"
								textAlign="center"
								mt="50%"
							>
								<BiCalendarEvent size={42} />
								<Text mt="12px" fontWeight="bold" color="gray.700">
									No events on hold
								</Text>
							</Flex>
						)}
					</Column>
					<Column
						count={events ? events.planned.count : 0}
						changeEventStatus={handleChangeEventStatus}
						label="Planned"
						mx="10px"
						targetStatus="planned"
						triggerCancelation={triggerCancelation}
					>
						{events && events.planned.events.length > 0 ? (
							sortByDate('planned', 'updated_at').map((event, index) => (
								<Card event={event} key={index} sourceStatus="planned" />
							))
						) : (
							<Flex
								direction="column"
								align="center"
								justify="center"
								textAlign="center"
								mt="50%"
							>
								<BiCalendarStar size={42} />
								<Text mt="12px" fontWeight="bold" color="gray.700">
									No events planned
								</Text>
							</Flex>
						)}
					</Column>
					<Column
						count={events ? events.in_progress.count : 0}
						changeEventStatus={handleChangeEventStatus}
						label="In Progress"
						mx="10px"
						targetStatus="in_progress"
						triggerCancelation={triggerCancelation}
					>
						{events && events.in_progress.events.length > 0 ? (
							sortByDate('in_progress', 'updated_at').map((event, index) => (
								<Card event={event} key={index} sourceStatus="in_progress" />
							))
						) : (
							<Flex
								direction="column"
								align="center"
								justify="center"
								textAlign="center"
								mt="50%"
							>
								<BiCalendarEdit size={42} />
								<Text mt="12px" fontWeight="bold" color="gray.700">
									No events in progress
								</Text>
							</Flex>
						)}
					</Column>

					<Column
						count={events ? events.finished.count : 0}
						changeEventStatus={handleChangeEventStatus}
						label="Finished"
						targetStatus="finished"
						triggerCancelation={triggerCancelation}
						ml="10px"
					>
						{events && events.finished.events.length > 0 ? (
							sortByDate('finished', 'updated_at').map((event, index) => (
								<Card event={event} key={index} sourceStatus="finished" />
							))
						) : (
							<Flex
								direction="column"
								align="center"
								justify="center"
								textAlign="center"
								mt="50%"
							>
								<BiCalendarCheck size={42} />
								<Text mt="12px" fontWeight="bold" color="gray.700">
									No events finished
								</Text>
							</Flex>
						)}
					</Column>
					<Column
						count={events ? events.canceled.count : 0}
						changeEventStatus={handleChangeEventStatus}
						label="Canceled"
						mx="10px"
						targetStatus="canceled"
						triggerCancelation={triggerCancelation}
					>
						{events && events.canceled.events.length > 0 ? (
							sortByDate('canceled', 'updated_at').map((event, index) => (
								<Card event={event} key={index} sourceStatus="canceled" />
							))
						) : (
							<Flex
								direction="column"
								align="center"
								justify="center"
								textAlign="center"
								mt="50%"
							>
								<BiCalendarX size={42} />
								<Text mt="12px" fontWeight="bold" color="gray.700">
									No events canceled
								</Text>
							</Flex>
						)}
					</Column>
				</Flex>
			</DndProvider>
			{cancelationData.isCanceling && (
				<CancelReasonPopup
					hanldeConfirmCancel={(cancelReason: string): Promise<void> =>
						handleChangeEventStatus(
							cancelationData.event,
							cancelationData.targetStatus,
							cancelationData.sourceStatus,
							cancelReason,
						)
					}
					handleCloseCancelPopup={handleCloseCancelPopup}
					event={cancelationData.event}
				/>
			)}
		</Flex>
	)
}

export default Kanban
