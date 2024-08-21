import fetchWithAuth from "./api";
import { toast } from "sonner";
export default async function apiPortOne(reqData, type) {
	const url =
		type === "approach"
			? "/admin/approach/web/reservation"
			: "/admin/par3/web/reservePortone";

	const res = await fetchWithAuth(url, "POST", {
		body: reqData,
	});
	const json = await res.json();
	if (json.success) {
		toast.success("예약을 완료하였습니다.");

		return true;
	} else {
		toast.error(json.message);
		return false;
	}
}
