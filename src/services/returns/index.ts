export { requestReturn, getMyReturns, getAdminReturns } from "./core/returns.service";
export { ReturnsRepository } from "./repositories/returns.repository";
export { useMyReturns, useAdminReturns, useRequestReturn } from "./hooks/useReturnsService";
export type { ReturnStatus, ReturnReason, ReturnRequest, CreateReturnPayload, ProcessReturnPayload } from "./interfaces/types";