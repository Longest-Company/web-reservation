import { Stack } from "@mui/material";

const TimeTable = ({ timeTable, selectedTime, setSelctedTime }) => {
	return (
		<Stack
			sx={{
				marginTop: "1rem",
				padding: { md: "2rem 4rem 86.5px", xs: "2rem 2rem 86.5px" },
			}}
		>
			{timeTable &&
				Object.entries(timeTable)
					.sort((a, b) => a[0] - b[0])
					.map(([key, value]) => {
						return (
							<Stack
								key={key}
								flex
								direction="row"
								sx={{
									marginBottom: "2rem",

									overflowX: {
										lg: "hidden",
										md: "scroll",
										xs: "scroll",
									},
									//width: "100vw",
								}}
							>
								<Stack
									sx={{
										width: { md: "110px" },
										background: "var(--primary-blue)",
										fontWeight: "600",
										whiteSpace: "nowrap",
										padding: "1rem 1.5rem",
										textAlign: "center",
										justifyContent: "center",
										fontSize: {
											xs: "0.875rem",
										},
										color: "white",
										borderTopLeftRadius: "8px",
										borderBottomLeftRadius: "8px",
									}}
								>
									{key}시
								</Stack>
								{value.map((item, idx) => (
									<Stack
										key={idx}
										direction="column"
										sx={{
											width: {
												md: "110px",
												xs: "73px",
											},
											justifyContent: "center",
											cursor: item.times.status
												? "pointer"
												: "not-allowed",
											padding: "0.5rem 1rem",
											textAlign: "center",
											border: "1px solid var(--gray-3)",
											background: !item.times.status
												? "var(--gray-3)"
												: item.times.time ===
												  selectedTime
												? "var(--primary-blue)"
												: "white",
											color: !item.times.status
												? "var(--gray-5)"
												: item.times.time ===
												  selectedTime
												? "white"
												: "",
										}}
										onClick={() => {
											if (!item.times.status) return;
											setSelctedTime(item.times.time);
										}}
									>
										<Stack>{item.times.time}</Stack>
									</Stack>
								))}
							</Stack>
						);
					})}
		</Stack>
	);
};

export default TimeTable;
