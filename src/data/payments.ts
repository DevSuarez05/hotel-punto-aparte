/**
 * ============================================================================
 * HOTEL PUNTO APARTE - CONFIGURACIÓN DE MEDIOS DE PAGO Y BANCOLOMBIA OFICIAL
 * ============================================================================
 */

export type DocumentType = "CC" | "CE" | "NIT" | "PAS";

export interface DocumentTypeOption {
  value: DocumentType;
  label: string;
  shortLabel: string;
  placeholder: string;
  patternHelp: string;
}

export const DOCUMENT_TYPES: DocumentTypeOption[] = [
  {
    value: "CC",
    label: "Cédula de Ciudadanía (CC)",
    shortLabel: "CC",
    placeholder: "Ej: 1077458921",
    patternHelp: "Número de 6 a 10 dígitos sin puntos ni guiones",
  },
  {
    value: "CE",
    label: "Cédula de Extranjería (CE)",
    shortLabel: "CE",
    placeholder: "Ej: 548921",
    patternHelp: "Número de 6 a 12 caracteres alfanuméricos",
  },
  {
    value: "NIT",
    label: "NIT — Factura Empresa (NIT)",
    shortLabel: "NIT",
    placeholder: "Ej: 900123456-7",
    patternHelp: "NIT con dígito de verificación opcional (ej: 900123456-7)",
  },
  {
    value: "PAS",
    label: "Pasaporte (PAS)",
    shortLabel: "PAS",
    placeholder: "Ej: PA12345678",
    patternHelp: "Número de pasaporte alfanumérico internacional",
  },
];

export interface BankOption {
  code: string;
  name: string;
  popular?: boolean;
}

export const PSE_BANKS: BankOption[] = [
  { code: "1007", name: "Bancolombia (Entidad Oficial)", popular: true },
];

export const HOTEL_PAYMENT_ACCOUNTS = {
  beneficiaryName: "José Raúl Gómez Botero",
  bankName: "Bancolombia",
  accountType: "Cuenta de Ahorros",
  accountNumber: "29853008433",
  accountNumberFormatted: "298-530084-33",
  portalUrl: "https://www.bancolombia.com/personas",
  mobileDeepLink: "bancolombia://",
  city: "Quibdó, Chocó, Colombia",
  bancolombia: {
    bankName: "Bancolombia",
    bankCode: "1007",
    savingsAccount: {
      type: "Cuenta de Ahorros Bancolombia",
      number: "29853008433",
      numberFormatted: "298-530084-33",
      numberRaw: "29853008433",
      beneficiary: "José Raúl Gómez Botero",
    },
    qrTransferKey: "3018940859",
    instructions:
      "Realiza la transferencia desde la App Bancolombia, Sucursal Virtual o Nequi a la Cuenta de Ahorros N° 29853008433 a nombre de José Raúl Gómez Botero. Envía el comprobante para confirmar tu reserva al instante.",
  },
};

/**
 * Validador estricto según el Tipo de Documento en Colombia
 */
export const validateDocumentNumber = (
  type: DocumentType,
  value: string
): { isValid: boolean; message?: string } => {
  const trimmed = value.trim();

  if (!trimmed) {
    return { isValid: false, message: "El número de documento es obligatorio" };
  }

  switch (type) {
    case "CC": {
      const isDigits = /^\d{6,10}$/.test(trimmed);
      if (!isDigits) {
        return {
          isValid: false,
          message: "La Cédula de Ciudadanía debe contener entre 6 y 10 dígitos numéricos.",
        };
      }
      return { isValid: true };
    }
    case "CE": {
      const isCeValid = /^[a-zA-Z0-9]{5,12}$/.test(trimmed);
      if (!isCeValid) {
        return {
          isValid: false,
          message: "La Cédula de Extranjería debe tener entre 5 y 12 caracteres alfanuméricos.",
        };
      }
      return { isValid: true };
    }
    case "NIT": {
      const isNitValid = /^[0-9]{8,10}(-[0-9]{1})?$/.test(trimmed);
      if (!isNitValid) {
        return {
          isValid: false,
          message: "El NIT debe tener entre 8 y 10 dígitos (ej: 900123456 o 900123456-7).",
        };
      }
      return { isValid: true };
    }
    case "PAS": {
      const isPasValid = /^[a-zA-Z0-9]{6,15}$/.test(trimmed);
      if (!isPasValid) {
        return {
          isValid: false,
          message: "El Pasaporte debe tener entre 6 y 15 caracteres alfanuméricos.",
        };
      }
      return { isValid: true };
    }
    default:
      return { isValid: true };
  }
};
