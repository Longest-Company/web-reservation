"use client";
import { Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import fetchWithAuth from "../api/api";
import calendarNoIcon from "@/../../public/assets/calendarNo.svg";
import calendarIcon from "@/../../public/assets/calendar.svg";
import selectedDateIcon from "@/../../public/assets/calendarSelect.svg";
import selectedSaturdayDateIcon from "@/../../public/assets/calendarSelectSaturday.svg";
import selectedSundayDateIcon from "@/../../public/assets/calendarSelectSunday.svg";
import arrowBlackIcon from "@/../../public/assets/arrowRightBlack.svg";
import arrowWhiteIcon from "@/../../public/assets/arrowRightWhite.svg";

import jwt from "jsonwebtoken";
import Image from "next/image";
import styled from "@emotion/styled";
import Dialog from "../components/Dialog";
import { useSearchParams } from "next/navigation";

const blueMain = "#283081";
const secondaryBlue = "#53599A";
const primaryRed = "#E16067";
const dayArr = ["일", "월", "화", "수", "목", "금", "토"];

const inputNumberWithComma = (str) => {
	return String(str).replace(/(\d)(?=(?:\d{3})+(?!\d))/g, "$1,");
};

const GoodsPriceContainer = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 40%;
	padding: 1.5rem 2.5rem;
	white-space: nowrap;
	font-size: 1.5rem;
	font-weight: 500;

	@media (max-width: 600px) {
		font-size: 0.875rem;
		padding: 1rem;
		text-align: left;
		flex-direction: column;
		width: 30%;
	}

	${({ isInfo }) =>
		isInfo
			? `background:linear-gradient(106.88deg, rgba(65, 50, 42, 0.05) 0%, rgba(40, 48, 129, 0.2) 100%); color: ${blueMain}`
			: "background: #F1F1F1; color: #A5A5A5"};

	div:last-child {
		font-size: 1.5rem;
		font-weight: 700;

		@media (max-width: 600px) {
			font-size: 1.2rem;
		}
	}
`;
const GoodsReservationContainer = styled.div`
	display: flex;
	justify-content: flex-end;
	align-items: center;
	width: 60%;
	padding: 1.5rem 2.5rem;
	white-space: nowrap;
	font-size: 2rem;
	font-weight: 700;
	cursor: ${({ isInfo }) => (isInfo ? "pointer" : "not-allowed")};

	img {
		margin-left: 1rem;
	}

	@media (max-width: 600px) {
		font-size: 1.2rem;
		padding: 1rem;
		width: 70%;

		img {
			width: 12px;
			height: 12px;
			margin-left: 0.5rem;
		}
	}

	${({ isInfo }) =>
		isInfo
			? `background: linear-gradient(180deg, #5675B9 0%, #283081 100%);`
			: "background: #FAFAFA;"};

	div:first-of-type {
		color: ${({ isInfo }) => (isInfo ? "white" : "#d2d2d2")};
	}

	div:last-child {
		font-size: 1.5rem;
		font-weight: 500;
		color: ${({ isInfo }) => (isInfo ? "white" : "#1e1f1f")};

		@media (max-width: 600px) {
			font-size: 0.875rem;
		}
	}
`;

const ReservationPage = () => {
	const companyId = useSearchParams().get("id");

	const [companyInfo, setCompanyInfo] = useState({
		id: -1,
		name: "",
		caution: "",
		reservationDueDate: -1,
		minUser: -1,
		maxUser: -1,
	});
	const [todayMonth, setTodayMonth] = useState(""); //헤더에 xxxx년 x월
	const [dateTable, setDateTable] = useState([]);
	//{
	// 	"date": "2024-08-08",
	// 	"day": 4,
	// 	"month": 8,
	// 	"reservationStatus": true
	// },
	const [selectedDate, setSelectedDate] = useState(""); //선택된 날짜
	const [goodsInfo, setGoodsInfo] = useState({ id: -1, name: "", price: 0 });
	const [timeTable, setTimeTable] = useState([]);
	const [selectedTime, setSelctedTime] = useState("");

	const [isOpenModal, setIsOpenModal] = useState(false);

	const getReservationTimeList = async (date) => {
		//선택된 날짜에 타임테이블 데이터 받아오기
		const today = date.split("-");
		setTodayMonth(`${today[0]}년 ${today[1]}월`);

		const res = await fetchWithAuth(`/admin/par3/web/${date}`, "GET");
		const json = await res.json();
		if (json.success) {
			const { goods, timetable: resTimeTable } = json.result;
			setGoodsInfo(goods);

			const times = {};
			resTimeTable.map((item) => {
				const keyHour = item.time.split(":")[0];
				if (times[keyHour]) {
					times[keyHour].push({
						times: {
							time: item.time,
							status: item.status,
						},
					});
				} else {
					times[keyHour] = [
						{
							times: {
								time: item.time,
								status: item.status,
							},
						},
					];
				}
			});
			setTimeTable(times);
		}
	};

	const JWTToken = () => {
		try {
			const secret = process.env.NEXT_PUBLIC_JWT_SECRET;
			const token = jwt.sign({ par3Id: companyId }, secret, {
				algorithm: "HS256",
				expiresIn: "1d",
			});
			localStorage.setItem("accessToken", token);
			getCompanyInfo();
		} catch (err) {
			console.log(err);
			return null;
		}
	};

	const getCompanyInfo = async () => {
		const res = await fetchWithAuth("/admin/par3/web", "GET");
		const json = await res.json();
		if (json.success) {
			const { par3, reservationDate } = json.result;
			setCompanyInfo({
				id: par3.id,
				name: par3.name,
				caution: par3.caution,
				reservationDueDate: par3.reservationDueDate,
				minUser: par3.minUser,
				maxUser: par3.maxUser,
			});
			const today = reservationDate[0].date.split("-");
			setTodayMonth(`${today[0]}년 ${today[1]}월`);
			setDateTable(reservationDate);
		}
	};

	useEffect(() => {
		JWTToken();
	}, []);

	const setFinish = () => {
		setGoodsInfo({ id: -1, name: "", price: 0 });
		setTimeTable([]);
		setSelectedDate("");
		setSelctedTime("");
		getCompanyInfo();
	};

	return (
		<>
			<title>{companyInfo.name}</title>

			<Stack
				sx={{
					background: "#F5F7FC",
					padding: { md: "2rem 4rem", xs: "2rem" },
				}}
			>
				<Stack
					sx={{
						padding: { md: "1.25rem 2rem", xs: "1rem 2rem" },
						border: "1px solid #CBD8EF",
						borderRadius: "15px",
						background: "white",
					}}
					flex
					direction="row"
					justifyContent="space-between"
				>
					<Typography
						color={blueMain}
						sx={{
							fontSize: { md: "1.5rem", sm: "1.25rem" },
							fontWeight: "700",
							margin: "auto 0",
						}}
					>
						{companyInfo.name}
					</Typography>

					<Typography
						sx={{
							fontSize: { md: "1.5rem", sm: "1.25rem" },
							fontWeight: "600",
							margin: "auto 0",
						}}
					>
						{todayMonth}
					</Typography>
				</Stack>

				<Typography
					color={blueMain}
					sx={{
						fontSize: { md: "1.5rem", sm: "1.25rem" },
						fontWeight: "700",
						marginTop: { md: "3.5rem", xs: "2rem" },
					}}
					align="center"
				>
					{companyInfo.name}
				</Typography>

				<Typography
					sx={{
						fontSize: { md: "1.125rem", sm: "1rem" },
						marginTop: "1.2rem",
					}}
					align="center"
				>
					예약 시스템에 오신 것을 환영합니다.
				</Typography>

				<Stack flex rowGap={1} sx={{ margin: "1.2rem auto auto" }}>
					{companyInfo.caution !== "" &&
						companyInfo.caution.split("\n").map((item, idx) => (
							<Typography
								sx={{
									fontSize: {
										md: "1.125rem",
										xs: "0.875rem",
									},
								}}
								key={idx}
							>
								{item}
							</Typography>
						))}
				</Stack>

				<Stack
					flex
					direction="row"
					width="100%"
					alignItems="center"
					sx={{
						marginTop: "3rem",
						columnGap: { md: "1.5rem", xs: "1.25rem" },
						overflowX: "scroll",
					}}
				>
					{dateTable.map((item, idx) => {
						return (
							<Stack
								key={item.date}
								sx={{
									width: "calc((100% - 4rem)/7)",
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
										setSelctedTime("");
										getReservationTimeList(item.date);
										setSelectedDate(item.date);
									}}
								>
									<Stack
										flex
										direction="row"
										justifyContent="space-between"
										sx={{
											background: item.reservationStatus
												? item.day === 0
													? primaryRed
													: item.day === 6
													? secondaryBlue
													: blueMain
												: "#E9E8E8",
											padding: "1rem 0.5rem",
											color: item.reservationStatus
												? "white"
												: "#A5A5A5",
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
												{item.date.split("-")[2][0] ===
												"0"
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
																? primaryRed
																: item.day === 6
																? secondaryBlue
																: blueMain
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
													? primaryRed
													: item.day === 6
													? secondaryBlue
													: blueMain
												: "#A5A5A5",
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
			</Stack>
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
									style={{
										marginBottom: "2rem",
										overflowX: "scroll",
										widtg: "100vw",
									}}
								>
									<Stack
										sx={{
											width: { md: "110px" },
											background: blueMain,
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
												border: "1px solid #E9E8E8",
												background: !item.times.status
													? "#E9E8E8"
													: item.times.time ===
													  selectedTime
													? blueMain
													: "white",
												color: !item.times.status
													? "#A5A5A5"
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

			<Stack
				flex
				direction="row"
				sx={{
					width: { xl: "1350px", xs: "100vw" },
					height: "86.5px",
					position: "fixed",
					bottom: "0",
					background: "white",
				}}
			>
				<GoodsPriceContainer isInfo={goodsInfo.id !== -1}>
					<Stack>1인당</Stack>
					<Stack>{inputNumberWithComma(goodsInfo.price)}원</Stack>
				</GoodsPriceContainer>
				<GoodsReservationContainer
					isInfo={selectedTime !== ""}
					onClick={() => {
						selectedTime !== "" && setIsOpenModal(true);
					}}
				>
					<Stack>
						{selectedTime !== ""
							? `${selectedTime.replace(":", "시 ")}분`
							: "00시 00분"}
						&nbsp;&nbsp;
					</Stack>
					<Stack flex direction="row" alignItems="center">
						으로 예약하기
						<Image
							src={
								selectedTime !== ""
									? arrowWhiteIcon
									: arrowBlackIcon
							}
							alt={`arrow`}
							style={{ marginLeft: { md: "1rem", xs: "0.5rem" } }}
						/>
					</Stack>
				</GoodsReservationContainer>
			</Stack>

			<Dialog
				isOpen={isOpenModal}
				setIsOpen={setIsOpenModal}
				date={selectedDate}
				time={selectedTime}
				goodsInfo={goodsInfo}
				companyInfo={companyInfo}
				setFinish={setFinish}
			/>
		</>
	);
};

export default ReservationPage;
