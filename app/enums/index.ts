export enum ETypeProduct {
  product = "product",
  envase = "envase",
}

export enum ETypeCustomer {
  person = "person",
  company = "company",
}

export enum ETypeVoucher {
  order = "order",
  sale = "sale",
}

export enum ETypeMovement {
  fuel = "fuel",
  toll = "toll",
  lunch = "lunch",
  others = "others",
}

export enum ETypePaymentReason {
  expense = "expense",
  income = "income",
}

export enum EBank {
  bcp = "BCP",
  bbva = "BBVA",
  scotiabank = "SCOTIABANK",
}

export enum EMovement {
  increment,
  decrement,
}

export enum EStatusVoucher {
  process = "process",
  sold = "sold",
  canceled = "canceled",
}

export enum EStatusDistribution {
  process = "process",
  closed = "closed",
}

export enum ERole {
  admin = "administrator",
  operator = "operator",
  distributor = "distributor",
}

export enum EWaterOutlet {
  normal = "normal",
  spout = "spout",
  other = "other",
}

export enum EFilterDate {
  all,
  year,
  month,
  week,
  today,
  custom,
}

export enum EWayToPay {
  cash = "cash",
  yape = "yape",
  card = "card",
  credit = "credit",
}

export enum EMonths {
  jan,
  feb,
  mar,
  apr,
  may,
  jun,
  jul,
  aug,
  sep,
  oct,
  nov,
  dec,
}

export enum ETypeDoc {
  nn = 0,
  dni = 1,
  cardForeign = 4,
  ruc = 6,
  passport = 7,
  diplomaticIdentityCard = "A",
}

export enum EReasonTransfer {
  venta = "01",
  ventaSujetaConfirmacionComprador = "14",
  compra = "02",
  trasladoEntraEstablecimientoMismaEmpresa = "04",
  trasladoEmisorItineranteCP = "18",
  importacion = "08",
  exportacion = "09",
  otros = "13",
  consignacion = "05",
  trasladoBienesTransformacion = "17",
  ventaEntregaTerceros = "03",
  devolucion = "06",
  recojoBienesTransformados = "07",
}

export enum ETypeTransport {
  publico = "01",
  privado = "02",
}

export enum ETypeSunatVoucher {
  factura = 1,
  boleta = 2,
  notaCredito = 3,
  notaDebito = 4,
}

export enum ESunatTransaction {
  ventaInterna = 1,
  exportacion = 2,
  ventaInternaAnticipos = 4,
  ventasNoDomiciliados = 29,
  operacionSujetaDetraccion = 30,
}

export enum ETypeCurrency {
  soles = 1,
  dolares = 2,
  euros = 3,
  libraEsterlina = 4,
}

export enum ETypePerception {
  pVentaInternaTasa2 = 1,
  pAdquisicionCombustibleTasa1 = 2,
  pRealizadaAgente = 3,
}

export enum ETypeDocModified {
  eFactura = 1,
  eBoleta = 2,
}

export enum ETypeIGV {
  gravadoOperacionOnerosa = 1,
  gravadoRetiroPremio = 2,
  inafectoOperacionOnerosa = 3,
}

export enum ETypeGuide {
  remisionRemitente = 1,
  remisionTransportista = 2,
}
