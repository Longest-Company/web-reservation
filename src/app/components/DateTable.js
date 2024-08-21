import { Stack, Typography } from "@mui/material";
import Image from "next/image";
import calendarNoIcon from "@/../../public/assets/calendarNo.svg";
import calendarIcon from "@/../../public/assets/calendar.svg";
import selectedDateIcon from "@/../../public/assets/calendarSelect.svg";
import selectedSaturdayDateIcon from "@/../../public/assets/calendarSelectSaturday.svg";
import selectedSundayDateIcon from "@/../../public/assets/calendarSelectSunday.svg";

const dayArr = ["일", "월", "화", "수", "목", "금", "토"];

const DateTable = ({ dateArr, selectedDate, changeSelectedDate }) => {
	return (
		<Stack
			flex
			direction="row"
			width="100%"
			alignItems="center"
			sx={{
				marginTop: "3rem",
				columnGap: { md: "1.5rem", xs: "1.25rem" },
				overflowX: { lg: "hidden", md: "scroll", xs: "scroll" },
			}}
		>
			{dateArr.map((item, idx) => {
				return (
					<Stack
						key={item.date}
						sx={{
							minWidth: "150px",
							cursor: item.reservationStatus
								? "pointer"
								: "not-allowed",
						}}
					>
						<Stack
							sx={{
								height: { md: "140px", xs: "120px" },
								border: "none",
								borderRadius: "8px",
								boxShadow:
									"0px 4px 8px 0px rgba(0, 0, 0, 0.04)",
							}}
							onClick={() => {
								if (!item.reservationStatus) {
									return;
								}
								changeSelectedDate(item.date, idx);
							}}
						>
							<Stack
								flex
								direction="row"
								justifyContent="space-between"
								sx={{
									background: item.reservationStatus
										? item.day === 0
											? "var(--primary-red)"
											: item.day === 6
											? "var(--secondary-blue)"
											: "var(--primary-blue)"
										: "var(--gray-3)",
									padding: "1rem 0.5rem",
									color: item.reservationStatus
										? "white"
										: "var(--gray-5)",
									borderTopLeftRadius: "8px",
									borderTopRightRadius: "8px",
								}}
							>
								<Stack
									flex
									direction="row"
									alignItems="center"
									sx={{
										"> img": {
											color: "white",
										},
									}}
								>
									<Image
										src={
											item.reservationStatus
												? calendarIcon
												: calendarNoIcon
										}
										alt={`calendar-${idx}`}
									/>
									<Typography
										sx={{
											marginLeft: "0.3rem",
										}}
									>
										{item.date.split("-")[2][0] === "0"
											? item.date.split("-")[2][1]
											: item.date.split("-")[2]}
										일
									</Typography>
								</Stack>
								<Stack
									justifyContent="center"
									sx={{
										fontSize: "0.875rem",
									}}
								>
									{dayArr[item.day]}
								</Stack>
							</Stack>
							<Stack
								sx={{
									background: "white",
									height: "100%",
									border:
										item.date === selectedDate
											? `1px solid ${
													item.day === 0
														? "var(--primary-red)"
														: item.day === 6
														? "var(--secondary-blue)"
														: "var(--primary-blue)"
											  }`
											: "none",
									borderBottomLeftRadius: "8px",
									borderBottomRightRadius: "8px",
									justifyContent: "center",
									alignItems: "center",
									fontWeight: "600",
									fontSize: "1.125rem",
									color: item.reservationStatus
										? item.day === 0
											? "var(--primary-red)"
											: item.day === 6
											? "var(--secondary-blue)"
											: "var(--primary-blue)"
										: "var(--gray-5)",
								}}
							>
								<Typography>
									{item.reservationStatus
										? "예약 가능"
										: "예약 불가"}
								</Typography>
							</Stack>
						</Stack>

						<Stack
							sx={{
								margin: "0.5rem auto auto",
								height: "34px",
							}}
						>
							{selectedDate === item.date &&
								item.reservationStatus && (
									<Image
										src={
											item.day === 0
												? selectedSundayDateIcon
												: item.day === 6
												? selectedSaturdayDateIcon
												: selectedDateIcon
										}
										alt={`select-${idx}`}
									/>
								)}
						</Stack>
					</Stack>
				);
			})}
		</Stack>
	);
};

export default DateTable;
