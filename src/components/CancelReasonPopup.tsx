import * as React from 'react'
import { useState, useRef } from 'react'

import { useFormik } from 'formik'
import { string, object } from 'yup'
import { format, fromUnixTime } from 'date-fns'

import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogCloseButton,
	AlertDialogContent,
	AlertDialogOverlay,
	Button,
	Text,
	Flex,
	Radio,
	RadioGroup,
	Stack,
	FormErrorMessage,
	FormControl,
} from '@chakra-ui/react'
import { EventInterface } from '../Kanban'

interface CancelReasonPopupInterface {
	hanldeConfirmCancel: (reason: string) => void
	handleCloseCancelPopup: () => void
	event: EventInterface
}

const CancelReasonPopup: React.FC<CancelReasonPopupInterface> = ({
	hanldeConfirmCancel,
	handleCloseCancelPopup,
	event,
}: CancelReasonPopupInterface): React.ReactElement => {
	const [isOpen, setIsOpen] = useState<boolean>(true)

	const cancelRef = useRef(null)
	const handleClosePopup = (): void => {
		setIsOpen(false)
		handleCloseCancelPopup()
	}

	const {
		handleSubmit,
		values,
		errors,
		isSubmitting,
		setFieldValue,
	} = useFormik({
		initialValues: {
			cancelationReason: '',
		},
		validationSchema: object().shape({
			cancelationReason: string().required('Choose cancelation reason'),
		}),
		validateOnChange: false,
		validateOnBlur: false,
		enableReinitialize: true,
		onSubmit: (values, action) => {
			setTimeout(() => {
				action.setSubmitting(false)
				hanldeConfirmCancel(values.cancelationReason)
			}, 1000)
		},
	})
	return (
		<AlertDialog
			isOpen={isOpen}
			leastDestructiveRef={cancelRef}
			onClose={handleClosePopup}
			size="3xl"
		>
			<AlertDialogOverlay />
			<AlertDialogContent p="20px 10px 10px">
				<AlertDialogHeader fontSize="lg" fontWeight="bold" textAlign="center">
					Confirm event cancelation
				</AlertDialogHeader>
				<AlertDialogCloseButton />
				<AlertDialogBody>
					Confirm the cancelation reason for the event{' '}
					<Text color="gray.900" fontWeight="bold" as="span">
						{event.title}
					</Text>{' '}
					created at{' '}
					<Text color="gray.900" fontWeight="bold" as="span">
						{format(fromUnixTime(event.created_at), 'PPPP, kk:mm')}
					</Text>
				</AlertDialogBody>
				<AlertDialogFooter justifyContent="center">
					<Flex direction="column" align="center">
						<form noValidate onSubmit={handleSubmit}>
							<FormControl isInvalid={!!errors.cancelationReason} width="100%">
								<RadioGroup
									onChange={(value: string): void => {
										setFieldValue('cancelationReason', value)
									}}
									name="cancelationReason"
									defaultValue={values.cancelationReason}
								>
									<Stack spacing={5} direction="row">
										<Radio colorScheme="gray" value="error">
											Booked by error
										</Radio>
										<Radio colorScheme="gray" value="organizer">
											Organizer decision
										</Radio>
									</Stack>
								</RadioGroup>
								<FormErrorMessage>{errors.cancelationReason}</FormErrorMessage>
							</FormControl>
							<Flex justify="center" align="center" mt="40px">
								<Button
									colorScheme="gray"
									ref={cancelRef}
									onClick={handleClosePopup}
									width="160px"
								>
									Cancel
								</Button>
								<Button
									colorScheme="green"
									type="submit"
									isLoading={isSubmitting}
									width="160px"
									ml="10px"
								>
									Confirm
								</Button>
							</Flex>
						</form>
					</Flex>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}

export default CancelReasonPopup
