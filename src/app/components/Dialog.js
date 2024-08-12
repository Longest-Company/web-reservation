"use client";

import {
	Box,
	Button,
	Container,
	Input,
	InputLabel,
	MenuItem,
	Modal,
	Paper,
	Select,
	Stack,
	Typography,
} from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";
import closeIcon from "@/../../public/assets/close.svg";

import kakaoPay from "@/../../public/assets/kakaopay.svg";
import naverPay from "@/../../public/assets/naverpay.svg";
import creditCard from "@/../../public/assets/creditcard.svg";
import { toast } from "sonner";
import fetchWithAuth from "../api/api";

const inputNumberWithComma = (str) => {
	return String(str).replace(/(\d)(?=(?:\d{3})+(?!\d))/g, "$1,");
};

const originFormData = {
	name: "",
	phoneNumber: "",
	peopleCnt: "",
};
const Dialog = ({
	isOpen,
	setIsOpen,
	date,
	time,
	goodsInfo,
	companyInfo,
	setFinish,
}) => {
	const dateSplit = date.split("-");
	const formatDate = `${dateSplit[0]}년 ${dateSplit[1]}월 ${dateSplit[2]}일`;

	const [formData, setFormData] = useState(originFormData);
	const [isPossibleClick, setIsPossibleClick] = useState(false);
	const [showChoosePayment, setShowChoosePayment] = useState(false);

	const [pg, setPg] = useState("");

	let peopleSelect = [];
	for (let i = companyInfo.minUser; i <= companyInfo.maxUser; i++) {
		peopleSelect.push({
			key: i,
			value: i,
			i,
			label: `${i}명`,
		});
	}

	const closeInit = () => {
		setIsOpen(false);
		setShowChoosePayment(false);
		setIsPossibleClick(false);
		setFormData(originFormData);
	};

	const apiPortOne = async (reqData) => {
		const res = await fetchWithAuth(
			`/admin/par3/web/reservePortone`,
			"POST",
			{
				body: reqData,
			}
		);
		const json = await res.json();
		if (json.success) {
			toast.success("예약을 완료하였습니다.");
			closeInit();
			setFinish();
		} else {
			toast.error(json.message);
		}
	};

	const paymentPortOne = () => {
		//v1사용
		if (window.IMP) {
			if (!window.IMP) return;
			/* 1. 가맹점 식별하기 */
			const { IMP } = window;
			IMP.init(process.env.NEXT_PUBLIC_PORTONE); // 가맹점 식별코드

			//const payM = pg === "kcp" ? "card" : pg;
			let pgData = pg;
			let payMethod = "card";

			if (pgData === "kcp.IP25K") {
				payMethod = "kakaopay";
			} else if (pgData === "kcp.IP25N") {
				payMethod = "naverpay";
			}

			const data = {
				pg: pgData, // PG사
				pay_method: payMethod, // 결제수단
				setChoosePaymentmerchant_uid: `mid_${new Date().getTime()}`, // 주문번호
				amount: formData.peopleCnt * goodsInfo.price, // 결제금액
				name: `${formatDate} ${time} ${formData.peopleCnt}명`, // 주문명
				buyer_name: formData.name, // 구매자 이름
				buyer_tel: formData.phoneNumber, // 구매자 전화번호
				m_redirect_url: "http://localhost:3001/reservation?id=8",
				notice_url: "",
			};

			/* 4. 결제 창 호출하기 */
			IMP.request_pay(data, (response) => {
				const { success, error_msg } = response;

				if (success) {
					const data = {
						portoneId: response.imp_uid,
						name: formData.name,
						phoneNumber: formData.phoneNumber,
						reserveNumber: Number(formData.peopleCnt),
						date: date,
						time: time,
						goodsId: goodsInfo.id,
					};
					apiPortOne(data);
				} else {
					toast.error(error_msg);
				}
			});
		}
	};

	useEffect(() => {
		setIsPossibleClick(
			formData.name !== "" &&
				formData.phoneNumber !== "" &&
				(formData.phoneNumber.length === 12 ||
					formData.phoneNumber.length === 13) &&
				formData.peopleCnt !== ""
		);
	}, [formData]);

	return (
		<Modal open={isOpen} onClose={closeInit}>
			<Container
				//maxWidth={{ md: "420px", xs: "90%" }}
				sx={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					width: { md: "420px", xs: "90%" },
				}}
			>
				<Paper
					sx={{
						border: "1px solid var(--mui-palette-divider)",
						boxShadow: "2px 2px 12px 0px rgba(86, 117, 185, 0.25)",

						padding: "1.5rem",
						minHeight: "600px",
					}}
				>
					<Stack flex>
						<Stack
							flex
							direction="row"
							justifyContent="space-between"
						>
							<Stack flex>
								<Typography
									sx={{
										fontSize: { md: "1.2rem", xs: "1rem" },
										color: "#A5A5A5",
										fontWeight: "700",
									}}
								>
									{formatDate}
								</Typography>
								<Typography
									sx={{
										marginBottom: "1rem",
										fontSize: {
											md: "1.6rem",
											xs: "1.45rem",
										},
										color: "#4B4C4C",
										fontWeight: "700",
									}}
								>
									{time}&nbsp;예약
								</Typography>
							</Stack>
							<Button
								sx={{
									margin: "0 0 auto",
									justifyContent: "flex-end",
									padding: "0",
								}}
								onClick={closeInit}
							>
								<Image src={closeIcon} alt="close" />
							</Button>
						</Stack>

						{!showChoosePayment ? (
							<>
								<InputLabel htmlFor="name">
									예약자 이름{" "}
									<span style={{ color: "red" }}>*</span>
								</InputLabel>
								<Input
									id="name"
									value={formData.name}
									onChange={(event) => {
										setFormData({
											...formData,
											name: event.target.value,
										});
									}}
									fullWidth
									sx={{
										marginTop: "0.3rem",
										"& .MuiInputBase-input": {
											borderRadius: "8px",
											border: "1px solid #E9E8E8",
											fontSize: 16,
											padding: "10px 12px",
											"&:focus": {
												border: "2px solid #E9E8E8",
											},
										},
										"::after": {
											border: "none",
										},
										"::before": {
											border: "none",
										},
										"&:hover:not(.Mui-disabled, .Mui-error):before":
											{
												borderBottom: "none",
											},
										"input::placeholder": {
											color: "#D2D2D2",
										},
									}}
									placeholder="예약자명"
									required
								/>

								<InputLabel
									htmlFor="phone"
									sx={{ marginTop: "1rem" }}
								>
									연락처{" "}
									<span style={{ color: "red" }}>*</span>
								</InputLabel>
								<Input
									id="phone"
									inputProps={{
										maxLength: 13,
										inputMode: "numeric",
										pattern: "[0-9]*",
									}}
									value={formData.phoneNumber}
									onChange={(event) => {
										const newPhone = event.target.value
											.replace(/[^0-9]/g, "")
											.replace(
												/^(\d{2,3})(\d{3,4})(\d{4})$/,
												`$1-$2-$3`
											);

										setFormData({
											...formData,
											phoneNumber: newPhone,
										});
									}}
									fullWidth
									sx={{
										marginTop: "0.3rem",
										"& .MuiInputBase-input": {
											borderRadius: "8px",
											border: "1px solid #E9E8E8",
											fontSize: 16,
											padding: "10px 12px",
											"&:focus": {
												border: "2px solid #E9E8E8",
											},
										},
										"::after": {
											border: "none",
										},
										"::before": {
											border: "none",
										},
										"&:hover:not(.Mui-disabled, .Mui-error):before":
											{
												borderBottom: "none",
											},
										"input::placeholder": {
											color: "#D2D2D2",
										},
									}}
									placeholder="숫자만 입력"
									required
								/>

								<InputLabel
									htmlFor="peopleCnt"
									sx={{ marginTop: "1rem" }}
								>
									입장 인원 수{" "}
									<span style={{ color: "red" }}>*</span>
								</InputLabel>
								<Select
									id="peopleCnt"
									value={formData.peopleCnt}
									fullWidth
									required
									onChange={(event) => {
										setFormData({
											...formData,
											peopleCnt: event.target.value,
										});
									}}
									sx={{ height: "45px" }}
								>
									{peopleSelect.map((option) => (
										<MenuItem
											key={option.key}
											value={option.key}
										>
											{option.label}
										</MenuItem>
									))}
								</Select>
								<Typography
									sx={{
										fontSize: "0.8rem",
										color: "#A5A5A5",
									}}
								>
									{companyInfo.maxUser}명까지 가능
								</Typography>
							</>
						) : (
							<Stack
								sx={{
									height: "300px",
									marginTop: "1rem",
								}}
							>
								<Button
									sx={{
										width: "100%",
										justifyContent: "flex-start",
										marginBottom: "1rem",
										border: "1px solid",
										borderColor:
											pg === "kcp"
												? "#283081"
												: "#d2d2d2",
										borderRadius: "10px",
										padding: "0.5rem",
									}}
									onClick={() => {
										setPg("kcp");
									}}
								>
									<Image
										src={creditCard}
										alt="kcp"
										style={{ marginRight: "1rem" }}
									/>
									<Typography color="#4B4C4C" fontSize="1rem">
										일반 카드 결제
									</Typography>
								</Button>
								<Button
									sx={{
										width: "100%",
										justifyContent: "flex-start",
										marginBottom: "1rem",
										border: "1px solid",
										borderColor:
											pg === "kcp.IP25N"
												? "#283081"
												: "#d2d2d2",
										borderRadius: "10px",
										padding: "0.5rem",
									}}
									onClick={() => {
										setPg("kcp.IP25N");
									}}
								>
									<Image
										src={naverPay}
										alt="naverpay"
										style={{ marginRight: "1rem" }}
									/>
									<Typography color="#4B4C4C" fontSize="1rem">
										네이버페이
									</Typography>
								</Button>
								{/* <Button
									sx={{
										width: "100%",
										justifyContent: "flex-start",
										border: "1px solid",
										borderColor:
											pg === "kcp.IP25K"
												? "#283081"
												: "#d2d2d2",
										borderRadius: "10px",
										padding: "0.5rem",
									}}
									onClick={() => {
										setPg("kcp.IP25K");
									}}
								>
									<Image
										src={kakaoPay}
										alt="kakaopay"
										style={{ marginRight: "1rem" }}
									/>
									<Typography color="#4B4C4C" fontSize="1rem">
										카카오페이
									</Typography>
								</Button> */}
							</Stack>
						)}
						<Stack
							justifyContent={"center"}
							columnGap={1}
							sx={{
								marginTop: "2.5rem",
							}}
						>
							<Stack
								sx={{
									padding: "1rem",
									border: "1px solid",
									borderColor:
										formData.peopleCnt !== ""
											? "#283081"
											: "#A5A5A5",
									borderRadius: "8px",
									marginBottom: "1rem",
									color:
										formData.peopleCnt !== ""
											? "#283081"
											: "#A5A5A5",
								}}
							>
								<Stack flex direction="row">
									<Typography>최종결제금액</Typography>
								</Stack>
								<Stack
									sx={{
										border: "1px solid rgba(233, 232, 232, 1)",
										margin: "0.2rem 0",
									}}
								/>
								<Stack
									flex
									direction="row"
									justifyContent="space-between"
								>
									<Typography>
										{inputNumberWithComma(goodsInfo.price)}
										원 x
										{formData.peopleCnt !== ""
											? formData.peopleCnt
											: "0"}
										인
									</Typography>
									<Typography sx={{ fontWeight: "700" }}>
										{formData.peopleCnt !== ""
											? inputNumberWithComma(
													formData.peopleCnt *
														goodsInfo.price
											  )
											: "0"}
										원
									</Typography>
								</Stack>
							</Stack>
							<Stack
								flex
								direction="row"
								columnGap={1}
								sx={{ margin: "auto" }}
							>
								<Button
									variant="outlined"
									onClick={() => {
										if (showChoosePayment) {
											setShowChoosePayment(false);
											setIsPossibleClick(true);
											setPg("");
										} else {
											closeInit();
										}
									}}
									sx={{
										border: "1px solid rgba(233, 232, 232, 1)",
										color: "#787979",
										"&:hover": {
											border: "1px solid rgba(233, 232, 232, 1)",
										},
										padding: "0.5rem 1.25rem",
									}}
								>
									{showChoosePayment
										? "이전 단계"
										: "취소하기"}
								</Button>
								<Button
									variant="contained"
									onClick={() => {
										pg !== ""
											? paymentPortOne()
											: setShowChoosePayment(true);
									}}
									disabled={
										showChoosePayment && pg === ""
											? true
											: !isPossibleClick
									}
									sx={{
										background: isPossibleClick
											? "#283081"
											: "#E9E8E8",
										color: isPossibleClick
											? "white"
											: "#A5A5A5",
										boxShadow: "none",
										"&:hover": {
											background: "#283081",
											color: "white",
										},
										padding: "0.5rem 1.25rem",
									}}
								>
									결제하기
								</Button>
							</Stack>
						</Stack>
					</Stack>
				</Paper>
			</Container>
		</Modal>
	);
};

export default Dialog;
