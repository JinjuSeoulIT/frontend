"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";

import type { PatientItem } from "@/features/staff/staff.types";
import MedicalQuickMenu from "./staffQuickMenu";
import EmployeeCommonDashboard from "./staffDashboard";
import MedicalSummaryCards from "./staffStateCards";
import { receptionActions } from "@/features/Reception/ReceptionSlice";

const MedicalMainDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list } = useSelector((state: RootState) => state.receptions);
  console.log( list);

  useEffect(() => {
    dispatch(receptionActions.fetchReceptionsRequest());
  }, [dispatch]);


  //환자 메인 상세정보 (겉화면 들어오면)
  const receptions: PatientItem[] = list.map((item) => ({
    receptionId: item.receptionId,                //환자 접수
    receptionNo: item.receptionNo,                //환자 접수번호
    patientName: item.patientName ?? "",          //환자 이름
    visitType :  item.visitType ,                 //
    status: item.status ,                         //환자 상태 //스트롱..

  }));

  const State = {
    total:    receptions.length,                                           //전체환자

    waiting:  receptions.filter((receptions) => receptions.status ===  "WAITING").length,    //대기환자
                                                  //웨이팅
    treating: receptions.filter((receptions) => receptions.status === "TREATING").length,    //진료중
                                                  //트리링
    done:     receptions.filter((receptions) => receptions.status ===     "DONE").length,    //완료
                                                  //던
  };



  return (
    <div>

      //환자 상태  (타입 "WAITING" / "TREATING"/ "DONE")
      <MedicalSummaryCards State={State} />

      {/* //환자 목록
      <MedicalPatient receptions={receptions} /> */}

      //업무 목록
      <MedicalQuickMenu />

      //직원 관리
      <EmployeeCommonDashboard/>
    </div>





  );
};

export default MedicalMainDashboard;




//   patientId: number;
//   patientNo?: string | null;
//   name: string;
//   gender?: "M" | "F" | string | null;
//   birthDate?: string | null;
//   phone?: string | null;

//  gender?: "M" | "F" | string | null;
//   birthDate?: string | null;
//   phone?: string | null;
//   email?: string | null;
//   address?: string | null;
//   addressDetail?: string | null;

//   guardianName?: string | null;
//   guardianPhone?: string | null;
//   guardianRelation?: string | null;
//   isForeigner?: boolean | null;
//   contactPriority?: ContactPriority | null;
//   note?: string | null;

//   isVip?: boolean | null;
//   photoUrl?: string | null;
//   statusCode?: string | null;
// }

