import { EStatusCoil } from "~/enums";

export default (status: EStatusCoil) => {
  if (status === EStatusCoil.process) return "Pendiente";
  else if (status === EStatusCoil.useless) return "Perdido";
  else return "Completo";
};
