"use client";
import { Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import fetchWithAuth from "../../api/api";
import arrowBlackIcon from "@/../../public/assets/arrowRightBlack.svg";
import arrowWhiteIcon from "@/../../public/assets/arrowRightWhite.svg";

import { redirect, useSearchParams } from "next/navigation";
import jwt from "jsonwebtoken";
import { toast } from "sonner";

import Image from "next/image";
import styled from "@emotion/styled";
import DateTable from "../../components/DateTable";
import TimeTable from "../../components/TimeTable";
import Dialog from "../../components/Dialog";
import apiPortOne from "../../api/payment";
import inputNumberWithComma from "../../utils/method";

const dayArr = ["일", "월", "화", "수", "목", "금", "토"];

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
			? `background:linear-gradient(106.88deg, rgba(65, 50, 42, 0.05) 0%, rgba(40, 48, 129, 0.2) 100%); color: var(--primary-blue)`
			: "background: var(--gray-1); color: var(--gray-5)"};

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
			? `background: linear-gradient(180deg, var(--secondary-blue) 0%, var(--primary-blue) 100%);`
			: "background: var(--gray-0);"};

	div:first-of-type {
		color: ${({ isInfo }) => (isInfo ? "white" : "#d2d2d2")};
	}

	div:last-child {
		font-size: 1.5rem;
		font-weight: 500;
		color: ${({ isInfo }) => (isInfo ? "white" : "var(--another-black)")};

		@media (max-width: 600px) {
			font-size: 0.875rem;
		}
	}
`;

const Par3ReservationPage = () => {
	const companyId = useSearchParams().get("id");
	const impUid = useSearchParams().get("imp_uid");
	const errorMsg = useSearchParams().get("error_msg");
	const [modalData, setModalData] = useState();

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

	const successPayment = async (data) => {
		const isSuccess = await apiPortOne(data);
		isSuccess && settingFinish();
	};

	const changeSelectedDate = (date) => {
		setSelctedTime("");
		getReservationTimeList(date);
		setSelectedDate(date);
	};

	useEffect(() => {
		if (impUid) {
			sessionStorage.setItem("impUid", impUid);
			errorMsg && sessionStorage.setItem("errorMsg", errorMsg);
			redirect(`/par3/reservation?id=${companyId}`);
		} else {
			if (sessionStorage.getItem("impUid")) {
				const paymenyErrorMsg = sessionStorage.getItem("errorMsg");
				getCompanyInfo(); //회사 정보 호출

				const reservationData = JSON.parse(
					sessionStorage.getItem("reservationData")
				);
				const reservationGoodsId = JSON.parse(
					sessionStorage.getItem("reservationGoodsInfo")
				).id;
				const [date, time] = sessionStorage
					.getItem("reservationTime")
					.split(" ");

				getReservationTimeList(date); //타임테이블 호출

				if (paymenyErrorMsg) {
					//결제 실패
					toast.error(paymenyErrorMsg);
					setSelectedDate(date);
					setSelctedTime(time);

					setModalData(reservationData);
					setIsOpenModal(true);
				} else {
					//결제 성공

					const data = {
						portoneId: sessionStorage.getItem("impUid"),
						name: reservationData.name,
						phoneNumber: reservationData.phoneNumber,
						reserveNumber: Number(reservationData.peopleCnt),
						date: date,
						time: time,
						goodsId: reservationGoodsId,
					};
					successPayment(data);
				}

				sessionStorage.clear();
			} else {
				JWTToken();
			}
		}
	}, []);

	const settingFinish = () => {
		setGoodsInfo({ id: -1, name: "", price: 0 });
		setTimeTable([]);
		setSelectedDate("");
		setSelctedTime("");
		getCompanyInfo();
	};

	return (
		<>
			<title>{companyInfo.name}</title>
			<meta
				property="og:title"
				content={`${companyInfo.name} 예약 시스템`}
			/>

			<Stack
				sx={{
					background: "var(--sky-blue-0)",
					padding: { md: "2rem 4rem", xs: "2rem" },
				}}
			>
				<Stack
					sx={{
						padding: { md: "1.25rem 2rem", xs: "1rem 2rem" },
						border: "1px solid var(--sky-blue-1)",
						borderRadius: "15px",
						background: "white",
					}}
					flex
					direction="row"
					justifyContent="space-between"
				>
					<Typography
						color="var(--primary-blue)"
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
					color="var(--primary-blue)"
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

				<DateTable
					dateArr={dateTable}
					selectedDate={selectedDate}
					changeSelectedDate={changeSelectedDate}
				/>
			</Stack>
			{/* <Stack
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
			</Stack> */}

			<TimeTable
				timeTable={timeTable}
				selectedTime={selectedTime}
				setSelctedTime={setSelctedTime}
			/>

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
				settingFinish={settingFinish}
				modalData={modalData}
			/>
		</>
	);
};

export default Par3ReservationPage;
