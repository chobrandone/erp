import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // FK-safe delete order (children first).
  await prisma.auditLog.deleteMany();
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.containerMovement.deleteMany();
  await prisma.gateTransaction.deleteMany();
  await prisma.reeferMonitoring.deleteMany();
  await prisma.reeferConnection.deleteMany();
  await prisma.pTIInspection.deleteMany();
  await prisma.pTIRequest.deleteMany();
  await prisma.damageSurvey.deleteMany();
  await prisma.repairEstimate.deleteMany();
  await prisma.repairWorkOrder.deleteMany();
  await prisma.repair.deleteMany();
  await prisma.releaseOrder.deleteMany();
  await prisma.document.deleteMany();
  await prisma.vehicleDocument.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.container.deleteMany();
  await prisma.location.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.shippingLine.deleteMany();
  await prisma.containerType.deleteMany();
  await prisma.billingRate.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("admin123", 10);

  // --- Real NEGOCE & SERVICES (N.S. SARL) staff (see client discovery questionnaire) ---
  // permissions = JSON array of module slugs; null = full access (ADMIN).
  const [admin] = await Promise.all(
    [
      { name: "MOUMAHA HUBERT NAZAIRE (Directeur Général)", email: "negoser@yahoo.fr", role: "ADMIN", permissions: null },
      { name: "Assistante de Direction", email: "assistante@ns-sarl.cm", role: "FINANCE", permissions: JSON.stringify(["billing-finance", "reporting-dashboard", "document-management"]) },
      { name: "Responsable du Parc", email: "parc@ns-sarl.cm", role: "YARD_PLANNER", permissions: JSON.stringify(["gate-operations", "yard-management", "container-inventory", "reefer-management", "pti-management"]) },
      { name: "Fleet Manager", email: "fleet@ns-sarl.cm", role: "GATE_CLERK", permissions: JSON.stringify(["fleet-management", "gate-operations"]) },
      // Kept for the implementation team.
      { name: "Administrateur Système", email: "admin@depot.local", role: "ADMIN", permissions: null },
    ].map((u) => prisma.user.create({ data: { ...u, passwordHash } }))
  );

  // --- Container types: DRY + FRIGO (Reefer), 20ft & 40ft ---
  const containerTypes = await Promise.all(
    [
      { code: "20DV", description: "20ft DRY", lengthFt: 20, isReefer: false },
      { code: "40DV", description: "40ft DRY", lengthFt: 40, isReefer: false },
      { code: "40HC", description: "40ft DRY High Cube", lengthFt: 40, isReefer: false },
      { code: "20RF", description: "20ft FRIGO (Reefer)", lengthFt: 20, isReefer: true },
      { code: "40RF", description: "40ft FRIGO (Reefer)", lengthFt: 40, isReefer: true },
    ].map((ct) => prisma.containerType.create({ data: ct }))
  );

  // --- Shipping lines confirmed by client ---
  const shippingLines = await Promise.all(
    [
      { code: "MSCU", name: "MSC" },
      { code: "HLCU", name: "HAPAG LLOYD" },
      { code: "CMAU", name: "CMA CGM" },
      { code: "MAEU", name: "MAERSK" },
    ].map((sl) => prisma.shippingLine.create({ data: sl }))
  );

  // --- Customers confirmed by client ---
  const customers = await Promise.all(
    [
      { code: "DHL", name: "DHL", contactName: "-", phone: "-" },
      { code: "HAPAG", name: "HAPAG LLOYD", contactName: "-", phone: "-" },
      { code: "MULTI", name: "Clients Multinationaux", contactName: "-", phone: "-" },
      { code: "PME", name: "PME / Particuliers", contactName: "-", phone: "-" },
    ].map((c) => prisma.customer.create({ data: c }))
  );

  // --- Yard equipment confirmed by client ---
  await Promise.all(
    [
      { code: "CHALLENGER", type: "REACH_STACKER" },
      { code: "RS-01", type: "REACH_STACKER" },
      { code: "FL-01", type: "FORKLIFT" },
    ].map((e) => prisma.equipment.create({ data: e }))
  );

  // --- Billing tariff (XAF) — Depot & Truck Transport Service Contract, App. 1A & 1C ---
  const rates: {
    code: string; service: string; category: string; size?: string; isReefer?: boolean; unit?: string; rateXaf: number;
  }[] = [
    // Storage (per TEU / day)
    { code: "STORAGE_EMPTY_20", service: "Storage Empty 20'", category: "STORAGE", size: "20", unit: "teu_day", rateXaf: 241.25 },
    { code: "STORAGE_EMPTY_40", service: "Storage Empty 40'", category: "STORAGE", size: "40", unit: "teu_day", rateXaf: 241.25 },
    { code: "STORAGE_EMPTY_20RF", service: "Storage Empty 20' (Reefer)", category: "STORAGE", size: "20", isReefer: true, unit: "teu_day", rateXaf: 241.25 },
    { code: "STORAGE_EMPTY_40RF", service: "Storage Empty 40' (Reefer)", category: "STORAGE", size: "40", isReefer: true, unit: "teu_day", rateXaf: 482.5 },
    // Lift On / Lift Off
    { code: "LOLO_EMPTY_20", service: "Lift On/Off Empty 20'", category: "LOLO", size: "20", rateXaf: 6272.5 },
    { code: "LOLO_EMPTY_40", service: "Lift On/Off Empty 40'", category: "LOLO", size: "40", rateXaf: 9650 },
    { code: "LOLO_EMPTY_20RF", service: "Lift On/Off Empty 20' (Reefer)", category: "LOLO", size: "20", isReefer: true, rateXaf: 6272.5 },
    { code: "LOLO_EMPTY_40RF", service: "Lift On/Off Empty 40' (Reefer)", category: "LOLO", size: "40", isReefer: true, rateXaf: 9650 },
    // Washing
    { code: "WASH_20", service: "Washing 20'", category: "WASHING", size: "20", rateXaf: 22291.5 },
    { code: "WASH_40", service: "Washing 40'", category: "WASHING", size: "40", rateXaf: 28950 },
    { code: "WASH_20RF", service: "Washing 20' (Reefer)", category: "WASHING", size: "20", isReefer: true, rateXaf: 22291 },
    { code: "WASH_40RF", service: "Washing 40' (Reefer)", category: "WASHING", size: "40", isReefer: true, rateXaf: 44583 },
    // Special Cleaning
    { code: "CLEAN_20", service: "Special Cleaning 20'", category: "CLEANING", size: "20", rateXaf: 8492 },
    { code: "CLEAN_40", service: "Special Cleaning 40'", category: "CLEANING", size: "40", rateXaf: 16984 },
    { code: "CLEAN_20RF", service: "Special Cleaning 20' (Reefer)", category: "CLEANING", size: "20", isReefer: true, rateXaf: 8492 },
    { code: "CLEAN_40RF", service: "Special Cleaning 40' (Reefer)", category: "CLEANING", size: "40", isReefer: true, rateXaf: 16984 },
    // Food Grade Upgrade
    { code: "FOODGRADE_20", service: "Food Grade Upgrade 20'", category: "FOOD_GRADE", size: "20", rateXaf: 8492 },
    { code: "FOODGRADE_40", service: "Food Grade Upgrade 40'", category: "FOOD_GRADE", size: "40", rateXaf: 16984 },
    // PTI (Reefer)
    { code: "PTI_SHORT_20", service: "Short PTI Reefer 20'", category: "PTI", size: "20", isReefer: true, rateXaf: 26537.5 },
    { code: "PTI_SHORT_40", service: "Short PTI Reefer 40'", category: "PTI", size: "40", isReefer: true, rateXaf: 26537.5 },
    { code: "PTI_EXT_20", service: "Extended PTI Reefer 20'", category: "PTI", size: "20", isReefer: true, rateXaf: 26537.5 },
    { code: "PTI_EXT_40", service: "Extended PTI Reefer 40'", category: "PTI", size: "40", isReefer: true, rateXaf: 26537.5 },
    { code: "PTI_VIS_20", service: "Visual PTI Reefer 20'", category: "PTI", size: "20", isReefer: true, rateXaf: 26537.5 },
    { code: "PTI_VIS_40", service: "Visual PTI Reefer 40'", category: "PTI", size: "40", isReefer: true, rateXaf: 26537.5 },
    // Empty trucking depot <-> port
    { code: "TRUCK_EMPTY_20", service: "Empty Trucking Depot-Port 20'", category: "TRUCKING", size: "20", rateXaf: 20000 },
    { code: "TRUCK_EMPTY_40", service: "Empty Trucking Depot-Port 40'", category: "TRUCKING", size: "40", rateXaf: 40000 },
    { code: "TRUCK_EMPTY_20RF", service: "Empty Trucking Depot-Port 20' (Reefer)", category: "TRUCKING", size: "20", isReefer: true, rateXaf: 20000 },
    { code: "TRUCK_EMPTY_40RF", service: "Empty Trucking Depot-Port 40' (Reefer)", category: "TRUCKING", size: "40", isReefer: true, rateXaf: 40000 },
  ];
  await prisma.billingRate.createMany({ data: rates.map((r) => ({ ...r, isReefer: r.isReefer ?? false, unit: r.unit ?? "unit" })) });

  // --- Fleet: 15 trucks with document expiry (some intentionally near-expiry for alerts) ---
  const today = new Date();
  const addDays = (days: number) => new Date(today.getTime() + days * 86400000);
  for (let i = 1; i <= 15; i++) {
    const plate = `CE-${String(100 + i).padStart(3, "0")}-NS`;
    const vehicle = await prisma.vehicle.create({
      data: {
        plateNumber: plate,
        make: i % 2 === 0 ? "Mercedes-Benz" : "Renault",
        model: "Actros",
        type: "TRUCK",
        driverName: `Chauffeur ${i}`,
        status: "ACTIVE",
      },
    });
    await prisma.vehicleDocument.createMany({
      data: [
        { vehicleId: vehicle.id, docType: "INSURANCE", reference: `ASS-${1000 + i}`, expiryDate: addDays((i * 20) - 10) },
        { vehicleId: vehicle.id, docType: "TECHNICAL_INSPECTION", reference: `VT-${2000 + i}`, expiryDate: addDays((i * 15) + 5) },
        { vehicleId: vehicle.id, docType: "DRIVER_LICENSE", reference: `PC-${3000 + i}`, expiryDate: addDays((i * 30) + 60) },
      ],
    });
  }

  // --- Yard location grid ---
  const blocks = ["A", "B", "C"];
  const rows = ["01", "02", "03", "04", "05"];
  const bays = ["01", "02", "03", "04", "05", "06", "07", "08"];
  const tiers = [1, 2, 3, 4];

  const locationData: {
    block: string; row: string; bay: string; tier: number; code: string; isReeferSlot: boolean;
  }[] = [];

  for (const block of blocks)
    for (const row of rows)
      for (const bay of bays)
        for (const tier of tiers)
          locationData.push({ block, row, bay, tier, code: `${block}-${row}-${bay}-${tier}`, isReeferSlot: false });

  for (const row of ["01", "02"])
    for (const bay of ["01", "02", "03", "04"])
      for (const tier of [1, 2])
        locationData.push({ block: "R", row, bay, tier, code: `R-${row}-${bay}-${tier}`, isReeferSlot: true });

  await prisma.location.createMany({ data: locationData });

  // --- A few sample containers in yard ---
  const sampleContainers = [
    { containerNumber: "MSCU1234567", typeCode: "40HC", lineCode: "MSCU", status: "FULL" },
    { containerNumber: "MAEU7654321", typeCode: "20DV", lineCode: "MAEU", status: "EMPTY" },
    { containerNumber: "CMAU1122334", typeCode: "40DV", lineCode: "CMAU", status: "FULL" },
    { containerNumber: "TRIU5566778", typeCode: "40RF", lineCode: "HLCU", status: "FULL" },
    { containerNumber: "HLCU9988776", typeCode: "20RF", lineCode: "HLCU", status: "EMPTY" },
  ];

  const allLocations = await prisma.location.findMany();
  const normalLocations = allLocations.filter((l) => !l.isReeferSlot);
  const reeferLocations = allLocations.filter((l) => l.isReeferSlot);

  for (let i = 0; i < sampleContainers.length; i++) {
    const s = sampleContainers[i];
    const ct = containerTypes.find((c) => c.code === s.typeCode)!;
    const sl = shippingLines.find((l) => l.code === s.lineCode)!;
    const container = await prisma.container.create({
      data: { containerNumber: s.containerNumber, containerTypeId: ct.id, shippingLineId: sl.id, status: s.status },
    });

    const loc = ct.isReefer ? reeferLocations[i % reeferLocations.length] : normalLocations[i % normalLocations.length];
    await prisma.inventory.create({ data: { containerId: container.id, locationId: loc.id, status: "IN_YARD" } });

    if (ct.isReefer) {
      await prisma.reeferMonitoring.create({
        data: { containerId: container.id, setTempC: -18, actualTempC: -17.8, humidity: 65, powerStatus: "CONNECTED" },
      });
    }
  }

  console.log("Seed complete:", {
    company: "NEGOCE & SERVICES (N.S. SARL)",
    admin: admin.email,
    password: "admin123 (change on first login — same for all seeded users)",
    users: 5,
    shippingLines: shippingLines.length,
    customers: customers.length,
    billingRates: rates.length,
    vehicles: 15,
    containers: sampleContainers.length,
    locations: locationData.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
