"use client";

const ReservationLayout = ({ children }) => {
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
				{children}
			</body>
		</html>
	);
};

export default ReservationLayout;
