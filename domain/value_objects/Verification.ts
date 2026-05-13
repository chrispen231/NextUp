export interface VerificationRequirement {
  documentId: string;
  issuerType: 'LFA' | 'FIFA' | 'GOVERNMENT';
  expiryDate: string;
  fileUrl: string;
}

export function isValidVerification(req: VerificationRequirement): boolean {
  const expiry = new Date(req.expiryDate);
  return expiry > new Date();
}
