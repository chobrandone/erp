// Container inspection / repair dropdown options, modeled on depot ERPs used by
// major shipping lines (Hapag-Lloyd, Maersk, CMA CGM, MSC). Each option carries
// a stable machine value plus English/French labels so the UI can localize
// without bloating the message catalogs.

export type RepairOption = { value: string; en: string; fr: string };

export const REPAIR_COMPONENTS: RepairOption[] = [
  { value: "ROOF", en: "Roof", fr: "Toit" },
  { value: "LEFT_SIDE", en: "Left Side", fr: "Côté gauche" },
  { value: "RIGHT_SIDE", en: "Right Side", fr: "Côté droit" },
  { value: "FRONT_WALL", en: "Front Wall", fr: "Paroi avant" },
  { value: "REAR_FRAME", en: "Rear Frame", fr: "Cadre arrière" },
  { value: "DOOR", en: "Door", fr: "Porte" },
  { value: "FLOOR", en: "Floor", fr: "Plancher" },
  { value: "CORNER_POST", en: "Corner Post", fr: "Montant d'angle" },
  { value: "CORNER_CASTING", en: "Corner Casting", fr: "Pièce de coin" },
  { value: "CROSS_MEMBER", en: "Cross Member", fr: "Traverse" },
  { value: "BOTTOM_RAIL", en: "Bottom Rail", fr: "Longeron inférieur" },
  { value: "TOP_RAIL", en: "Top Rail", fr: "Longeron supérieur" },
];

export const REPAIR_DAMAGE_TYPES: RepairOption[] = [
  { value: "DENT", en: "Dent", fr: "Bosse" },
  { value: "HOLE", en: "Hole", fr: "Trou" },
  { value: "CRACK", en: "Crack", fr: "Fissure" },
  { value: "BENT", en: "Bent", fr: "Plié" },
  { value: "CORROSION", en: "Corrosion", fr: "Corrosion" },
  { value: "MISSING", en: "Missing", fr: "Manquant" },
  { value: "TEAR", en: "Tear", fr: "Déchirure" },
  { value: "GOUGE", en: "Gouge", fr: "Entaille" },
  { value: "SCRATCH", en: "Scratch", fr: "Éraflure" },
];

export const REPAIR_SEVERITIES: RepairOption[] = [
  { value: "MINOR", en: "Minor", fr: "Mineur" },
  { value: "MODERATE", en: "Moderate", fr: "Modéré" },
  { value: "MAJOR", en: "Major", fr: "Majeur" },
];

export const REPAIR_METHODS: RepairOption[] = [
  { value: "WELD", en: "Weld", fr: "Soudure" },
  { value: "PATCH", en: "Patch", fr: "Rustine" },
  { value: "STRAIGHTEN", en: "Straighten", fr: "Redressage" },
  { value: "REPLACE", en: "Replace", fr: "Remplacement" },
  { value: "CLEAN", en: "Clean", fr: "Nettoyage" },
  { value: "PAINT", en: "Paint", fr: "Peinture" },
  { value: "SEAL", en: "Seal", fr: "Étanchéité" },
];

export const REPAIR_RESPONSIBILITIES: RepairOption[] = [
  { value: "CARRIER", en: "Carrier", fr: "Transporteur" },
  { value: "CUSTOMER", en: "Customer", fr: "Client" },
  { value: "DEPOT", en: "Depot", fr: "Dépôt" },
  { value: "SURVEYOR", en: "Surveyor", fr: "Expert" },
];

export const REPAIR_STATUSES: RepairOption[] = [
  { value: "PENDING", en: "Pending", fr: "En attente" },
  { value: "APPROVED", en: "Approved", fr: "Approuvé" },
  { value: "REPAIRED", en: "Repaired", fr: "Réparé" },
  { value: "REJECTED", en: "Rejected", fr: "Rejeté" },
  { value: "NOT_REPAIRABLE", en: "Not Repairable", fr: "Non réparable" },
];

/** Label an option value for the given locale, falling back to the raw value. */
export function repairLabel(options: RepairOption[], value: string | null | undefined, locale: string): string {
  if (!value) return "-";
  const opt = options.find((o) => o.value === value);
  if (!opt) return value;
  return locale.startsWith("fr") ? opt.fr : opt.en;
}
