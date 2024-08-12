"use client";
import { Inter } from "next/font/google";
import jwt from "jsonwebtoken";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Loading from "./loading";

const ReservationLayout = ({ children }) => {
	const companyId = location.href.split("=")[1];
	//useSearchParams().get("id");

	const JWTToken = () => {
		try {
			const secret = process.env.NEXT_PUBLIC_JWT_SECRET;
			return jwt.sign({ par3Id: companyId }, secret, {
				algorithm: "HS256",
				expiresIn: "1d",
			});
		} catch (err) {
			console.log(err);
			return null;
		}
	};

	useEffect(() => {
		const token = JWTToken();
		localStorage.setItem("accessToken", token);
	}, []);

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
				<Suspense fallback={<Loading />}>{children}</Suspense>
			</body>
		</html>
	);
};

export default ReservationLayout;
