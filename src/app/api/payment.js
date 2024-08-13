import fetchWithAuth from "./api";
import { toast } from "sonner";
export default async function apiPortOne(reqData) {
	const res = await fetchWithAuth(`/admin/par3/web/reservePortone`, "POST", {
		body: reqData,
	});
	const json = await res.json();
	if (json.success) {
		toast.success("예약을 완료하였습니다.");
		//closeInit();

		return true;
	} else {
		toast.error(json.message);
		return false;
	}
}
