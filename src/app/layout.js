"use client";

import { createTheme, ThemeProvider } from "@mui/material";
import "./globals.css";
import Script from "next/script";
import { Toaster } from "sonner";

// export const metadata = {
// 	title: "par3 예약 시스템입니다.",
// 	description: "",
// };

const theme = createTheme({
	typography: {
		fontFamily: "PretendardVariable",
	},
});

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body
				style={{
					maxWidth: "1350px",
					background: "white",
					margin: "auto",
					color: "#4B4C4C",
				}}
			>
				<ThemeProvider theme={theme}>
					{children}
					<Toaster position="top-center" richColors />
				</ThemeProvider>
			</body>
			{/* 포트원 */}
			<Script src="https://cdn.iamport.kr/v1/iamport.js" />

			{/* 페이플 */}
			{/* <Script
				type="text/javascript"
				src="https://code.jquery.com/jquery-3.2.1.min.js"
			></Script>
			<Script src="https://democpay.payple.kr/js/v1/payment.js"></Script>{" "}
			*/}
		</html>
	);
}
