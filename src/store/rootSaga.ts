import { all, fork } from "redux-saga/effects";
import billingSaga from "@/features/billing/billingSaga";
import { watchConsentSaga } from "@/features/consent/consentSaga";
import { watchEmergencyReceptionSaga } from "@/features/EmergencyReception/EmergencyReceptionSaga";
import { watchInsuranceSaga } from "@/features/insurance/insuranceSaga";
import { watchInpatientReceptionSaga } from "@/features/InpatientReception/InpatientReceptionSaga";
import { watchPatientSaga } from "@/features/patients/patientSaga";
import { watchRecordSaga } from "@/features/medical_support/record/recordSaga";
import { watchTestExecutionSaga } from "@/features/medical_support/testExecution/testExecutionSaga";
import { watchReceptionSaga as watchReceptionsSaga } from "@/features/Reception/ReceptionSaga";
import { watchReservationSaga } from "@/features/Reservations/ReservationSaga";
import { watchEmployeeNurseSaga } from "@/features/staff/nurse/nurseSaga";
import { watchEmployeeDoctorSaga } from "@/features/staff/doctor/doctorSaga";
import { watchEmployeeStaffSaga } from "@/features/staff/Basiclnfo/BasiclnfoSaga";
import { watchEmployeeReceptionSaga } from "@/features/staff/reception/receptionSaga";
import watchStaffDepartmentSaga from "@/features/staff/department/departmentSaga";
import watchStaffLocationSaga from "@/features/staff/location/locationSaga";
import watchStaffPositionSaga from "@/features/staff/position/positionSaga";
import { watchClinicalSaga } from "@/features/clinical/clinicalSaga";
import { watchImagingSaga } from "@/features/medical_support/imaging/imagingSaga";
import { watchSpecimenSaga } from "@/features/medical_support/specimen/specimenSaga";
import { watchPathologySaga } from "@/features/medical_support/pathology/pathologySaga";
import { watchEndoscopySaga } from "@/features/medical_support/endoscopy/endoscopySaga";
import { watchPhysiologicalSaga } from "@/features/medical_support/physiological/physiologicalSaga";
import { watchMedicationRecordSaga } from "@/features/medical_support/medicationRecord/medicationRecordSaga";
import { watchTreatmentResultSaga } from "@/features/medical_support/treatmentResult/treatmentResultSaga";
import { watchTestResultSaga } from "@/features/medical_support/testResult/testResultSaga";
import { watchDoctorMedicalSaga, watchDoctorSpecialtySaga } from "@/features/staff/doctor/MedicalSpecialty/medicalSpecialtySaga";


export default function* rootSaga() {
  yield all([
    fork(watchEmergencyReceptionSaga),
    fork(watchInpatientReceptionSaga),
    fork(watchPatientSaga),
    fork(watchRecordSaga),
    fork(watchTestExecutionSaga),
    fork(watchInsuranceSaga),
    fork(watchConsentSaga),
    fork(watchReceptionsSaga),
    fork(watchReservationSaga),
    fork(billingSaga),
    fork(watchEmployeeNurseSaga),
    fork(watchEmployeeDoctorSaga),
    fork(watchEmployeeStaffSaga),
    fork(watchEmployeeReceptionSaga),
    fork(watchStaffDepartmentSaga),
    fork(watchStaffLocationSaga),
    fork(watchStaffPositionSaga),
    fork(watchImagingSaga),
    fork(watchSpecimenSaga),
    fork(watchPathologySaga),
    fork(watchEndoscopySaga),
    fork(watchPhysiologicalSaga),
    fork(watchMedicationRecordSaga),
    fork(watchTreatmentResultSaga),
    fork(watchTestResultSaga),
    fork(watchDoctorMedicalSaga),
    fork(watchDoctorSpecialtySaga),
    fork(watchClinicalSaga)
  ]);
}
