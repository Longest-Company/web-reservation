"use client";

import {
  Button,
  Container,
  Input,
  InputLabel,
  Modal,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import closeIcon from "@/../../public/assets/close.svg";
import enablePlusIcon from "@/../../public/assets/enablePlus.svg";
import disablePlusIcon from "@/../../public/assets/disablePlus.svg";
import enableMinusIcon from "@/../../public/assets/enableMinus.svg";
import disableMinusIcon from "@/../../public/assets/disableMinus.svg";
import Image from "next/image";

import kakaoPay from "@/../../public/assets/kakaopay.svg";
import naverPay from "@/../../public/assets/naverpay.svg";
import creditCard from "@/../../public/assets/creditcard.svg";

import { toast } from "sonner";
import apiPortOne from "../api/payment";
import inputNumberWithComma from "../utils/method";

const ApproachDialog = ({
  isOpen,
  setIsOpen,
  date,
  time,
  goodsInfo,
  companyInfo,
  settingFinish,
  modalData,
}) => {
  const dateSplit = date.split("-");
  const formatDate = `${dateSplit[0]}년 ${dateSplit[1]}월 ${dateSplit[2]}일`;
  const [showChoosePayment, setShowChoosePayment] = useState(false);
  const [phoneNumberArr, setPhoneNumberArr] = useState([""]);
  const [reserveNumber, setReserveNumber] = useState(1);
  const [isPossibleClick, setIsPossibleClick] = useState(false);
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

  useEffect(() => {
    const filter = phoneNumberArr.filter(
      (item) => item.length === 12 || item.length === 13
    );
    setIsPossibleClick(filter.length === reserveNumber);
  }, [phoneNumberArr, reserveNumber]);

  const closeInit = () => {
    setIsOpen(false);
    setShowChoosePayment(false);
    setReserveNumber(1);
    setPhoneNumberArr([""]);
    setPg("");
  };

  const verifyPayment = async (data) => {
    const isSuccess = await apiPortOne(data, "approach");
    if (isSuccess) {
      closeInit();
      settingFinish();
    }
  };

  const paymentPortOne = () => {
    //v1사용
    if (window.IMP) {
      if (!window.IMP) return;
      /* 1. 가맹점 식별하기 */
      const { IMP } = window;
      IMP.init(process.env.NEXT_PUBLIC_PORTONE); // 가맹점 식별코드

      let payMethod = "card";

      if (pg === "kcp.IP25L") {
        payMethod = "kakaopay";
      } else if (pg === "kcp.IP25N") {
        payMethod = "naverpay";
      }

      const redirectURL = process.env.NEXT_PUBLIC_REDIRECT
        ? process.env.NEXT_PUBLIC_REDIRECT
        : "http://localhost:3001";

      const data = {
        pg: pg, // PG사
        pay_method: payMethod, // 결제수단
        setChoosePaymentmerchant_uid: `mid_${new Date().getTime()}`, // 주문번호
        amount: reserveNumber * goodsInfo.price, // 결제금액
        name: `${formatDate} ${time} ${reserveNumber}명`, // 주문명
        m_redirect_url:
          redirectURL + `/approach/reservation?id=${companyInfo.id}`,
        notice_url: "",
      };

      /* 4. 결제 창 호출하기 */
      IMP.request_pay(data, (response) => {
        const { success, error_msg } = response;

        if (success) {
          const data = {
            portoneId: response.imp_uid,
            phoneNumber: phoneNumberArr,
            reserveNumber: reserveNumber,
            date: date,
            time: time,
            goodsId: goodsInfo.id,
          };

          verifyPayment(data);
        } else {
          toast.error(error_msg);
        }
      });
    }
  };

  //모달 데이터 세팅
  useEffect(() => {
    if (modalData) {
      const { phoneNumberArr, reserveNumber } = modalData;
      setPhoneNumberArr(phoneNumberArr);
      setReserveNumber(reserveNumber);
    }
  }, [modalData]);

  return (
    <Modal open={isOpen} onClose={closeInit} disableAutoFocus>
      <Container
        //maxWidth={{ md: "420px", xs: "90%" }}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { md: "420px", xs: "90%" },
          padding: "0px !important",
        }}
      >
        <Paper
          sx={{
            border: "1px solid var(--gray-4)",
            boxShadow: "2px 2px 12px 0px rgba(86, 117, 185, 0.25)",

            padding: "1.5rem",
            minHeight: "670px",
          }}
        >
          <Stack flex>
            <Stack flex direction="row" justifyContent="space-between">
              <Stack flex>
                <Typography
                  sx={{
                    fontSize: { md: "1.2rem", xs: "1rem" },
                    color: "var(--gray-5)",
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
                <InputLabel htmlFor="peopleCnt" sx={{ marginTop: "1rem" }}>
                  입장 인원 수{" "}
                  <span style={{ fontSize: "0.875rem" }}>
                    (최대 3명까지 가능)
                  </span>
                  <span style={{ color: "red" }}>*</span>
                </InputLabel>

                <Stack
                  spacing={2}
                  direction="row"
                  sx={{
                    marginTop: "1rem",
                    alignItems: "center",
                  }}
                >
                  <Image
                    src={
                      phoneNumberArr.length === 1
                        ? disableMinusIcon
                        : enableMinusIcon
                    }
                    width={20}
                    alt="minusPeople"
                    onClick={() => {
                      if (phoneNumberArr.length !== 1) {
                        setReserveNumber((prev) => prev - 1);
                        const tmpPhoneNumberArr = phoneNumberArr;
                        tmpPhoneNumberArr.pop();
                        setPhoneNumberArr(tmpPhoneNumberArr);
                      }
                    }}
                    style={{
                      cursor:
                        phoneNumberArr.length === 1 ? "not-allowed" : "pointer",
                    }}
                  />
                  <Typography>{reserveNumber}</Typography>
                  <Image
                    src={
                      phoneNumberArr.length === 3
                        ? disablePlusIcon
                        : enablePlusIcon
                    }
                    width={20}
                    alt="plusPeople"
                    onClick={() => {
                      if (phoneNumberArr.length !== 3) {
                        setReserveNumber((prev) => prev + 1);
                        const tmpPhoneNumberArr = phoneNumberArr;
                        tmpPhoneNumberArr.push("");
                        setPhoneNumberArr(tmpPhoneNumberArr);
                      }
                    }}
                    style={{
                      cursor:
                        phoneNumberArr.length === 3 ? "not-allowed" : "pointer",
                    }}
                  />
                </Stack>

                {phoneNumberArr.map((item, idx) => {
                  return (
                    <Stack key={idx}>
                      <InputLabel
                        htmlFor={`phone-${idx}`}
                        sx={{ marginTop: "1rem" }}
                      >
                        연락처 {idx + 1} <span style={{ color: "red" }}>*</span>
                      </InputLabel>
                      <Input
                        id={`phone-${idx}`}
                        inputProps={{
                          maxLength: 13,
                          inputMode: "numeric",
                          pattern: "[0-9]*",
                        }}
                        value={item}
                        onChange={(event) => {
                          const newPhone = event.target.value
                            .replace(/[^0-9]/g, "")
                            .replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);

                          const tmpPhoneArr = [...phoneNumberArr];

                          tmpPhoneArr[idx] = newPhone;
                          setPhoneNumberArr(tmpPhoneArr);
                        }}
                        fullWidth
                        sx={{
                          marginTop: "0.3rem",
                          "& .MuiInputBase-input": {
                            borderRadius: "8px",
                            border: "1px solid var(--gray-3)",
                            fontSize: 16,
                            padding: "10px 12px",
                            "&:focus": {
                              border: "2px solid var(--gray-3)",
                            },
                          },
                          "::after": {
                            border: "none",
                          },
                          "::before": {
                            border: "none",
                          },
                          "&:hover:not(.Mui-disabled, .Mui-error):before": {
                            borderBottom: "none",
                          },
                          "input::placeholder": {
                            color: "var(--gray-4)",
                          },
                        }}
                        placeholder="숫자만 입력"
                        required
                      />
                    </Stack>
                  );
                })}
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
                      pg === "kcp" ? "var(--primary-blue)" : "var(--gray-4)",
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
                        ? "var(--primary-blue)"
                        : "var(--gray-4)",
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
                <Button
                  sx={{
                    width: "100%",
                    justifyContent: "flex-start",
                    border: "1px solid",
                    borderColor: pg === "kcp.IP25L" ? "#283081" : "#d2d2d2",
                    borderRadius: "10px",
                    padding: "0.5rem",
                  }}
                  onClick={() => {
                    setPg("kcp.IP25L");
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
                </Button>
              </Stack>
            )}
            <Stack
              justifyContent={"center"}
              columnGap={1}
              sx={{
                marginTop: "2.5rem",
                position: "absolute",
                bottom: "20px",
                width: {
                  md: "calc(420px - 3rem)",
                  xs: "calc(100% - 3rem)",
                },
              }}
            >
              <Stack
                sx={{
                  padding: "1rem",
                  border: "1px solid",
                  borderColor: "var(--primary-blue)",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  color: "var(--primary-blue)",
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
                <Stack flex direction="row" justifyContent="space-between">
                  <Typography>
                    {inputNumberWithComma(goodsInfo.price)}원 x{reserveNumber}인
                  </Typography>
                  <Typography sx={{ fontWeight: "700" }}>
                    {inputNumberWithComma(reserveNumber * goodsInfo.price)}원
                  </Typography>
                </Stack>
              </Stack>
              <Stack flex direction="row" columnGap={1} sx={{ margin: "auto" }}>
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
                  {showChoosePayment ? "이전 단계" : "취소하기"}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    if (pg !== "") {
                      paymentPortOne();
                    } else {
                      sessionStorage.setItem(
                        "reservationData",
                        JSON.stringify({
                          phoneNumberArr,
                          reserveNumber,
                        })
                      );
                      sessionStorage.setItem(
                        "reservationTime",
                        `${date} ${time}`
                      );
                      sessionStorage.setItem(
                        "reservationGoodsInfo",
                        JSON.stringify(goodsInfo)
                      );
                      setShowChoosePayment(true);
                      setIsPossibleClick(false);
                    }
                  }}
                  disabled={
                    !(isPossibleClick || (pg !== "" && showChoosePayment))
                  }
                  sx={{
                    background: "#283081",
                    color: "white",
                    boxShadow: "none",
                    "&:hover": {
                      background: "#283081",
                      color: "white",
                    },
                    "&.Mui-disabled": {
                      background: "var(--gray-3)",
                      color: "var(--gray-4)",
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

export default ApproachDialog;
