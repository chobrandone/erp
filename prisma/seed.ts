import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.containerMovement.deleteMany();
  await prisma.gateTransaction.deleteMany();
  await prisma.reeferMonitoring.deleteMany();
  await prisma.pTIInspection.deleteMany();
  await prisma.pTIRequest.deleteMany();
  await prisma.repair.deleteMany();
  await prisma.document.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.container.deleteMany();
  await prisma.location.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.shippingLine.deleteMany();
  await prisma.containerType.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@depot.local",
      passwordHash: "dev-placeholder",
      role: "ADMIN",
    },
  });

  const containerTypes = await Promise.all(
    [
      { code: "20GP", description: "20ft General Purpose", lengthFt: 20, isReefer: false },
      { code: "40GP", description: "40ft General Purpose", lengthFt: 40, isReefer: false },
      { code: "40HC", description: "40ft High Cube", lengthFt: 40, isReefer: false },
      { code: "20RF", description: "20ft Reefer", lengthFt: 20, isReefer: true },
      { code: "40RF", description: "40ft Reefer", lengthFt: 40, isReefer: true },
    ].map((ct) => prisma.containerType.create({ data: ct }))
  );

  const shippingLines = await Promise.all(
    [
      { code: "MAEU", name: "Maersk" },
      { code: "MSCU", name: "MSC" },
      { code: "CMAU", name: "CMA CGM" },
      { code: "HLCU", name: "Hapag-Lloyd" },
    ].map((sl) => prisma.shippingLine.create({ data: sl }))
  );

  const customers = await Promise.all(
    [
      { code: "CUST-001", name: "Atlantic Freight Forwarders", contactName: "J. Dupont", phone: "+225 07 00 00 01" },
      { code: "CUST-002", name: "Global Logistics SARL", contactName: "A. Koffi", phone: "+225 07 00 00 02" },
      { code: "CUST-003", name: "PortLink Depot Services", contactName: "M. Traoré", phone: "+225 07 00 00 03" },
    ].map((c) => prisma.customer.create({ data: c }))
  );

  await Promise.all(
    [
      { code: "RS-01", type: "REACH_STACKER" },
      { code: "RS-02", type: "REACH_STACKER" },
      { code: "FL-01", type: "FORKLIFT" },
      { code: "TRK-01", type: "TRUCK" },
    ].map((e) => prisma.equipment.create({ data: e }))
  );

  const blocks = ["A", "B", "C"];
  const rows = ["01", "02", "03", "04", "05"];
  const bays = ["01", "02", "03", "04", "05", "06", "07", "08"];
  const tiers = [1, 2, 3, 4];

  const locationData: {
    block: string;
    row: string;
    bay: string;
    tier: number;
    code: string;
    isReeferSlot: boolean;
  }[] = [];

  for (const block of blocks) {
    for (const row of rows) {
      for (const bay of bays) {
        for (const tier of tiers) {
          locationData.push({
            block,
            row,
            bay,
            tier,
            code: `${block}-${row}-${bay}-${tier}`,
            isReeferSlot: false,
          });
        }
      }
    }
  }

  for (const row of ["01", "02"]) {
    for (const bay of ["01", "02", "03", "04"]) {
      for (const tier of [1, 2]) {
        locationData.push({
          block: "R",
          row,
          bay,
          tier,
          code: `R-${row}-${bay}-${tier}`,
          isReeferSlot: true,
        });
      }
    }
  }

  await prisma.location.createMany({ data: locationData });

  const sampleContainers = [
    { containerNumber: "MSCU1234567", typeCode: "40HC", lineCode: "MSCU", status: "FULL" },
    { containerNumber: "MAEU7654321", typeCode: "20GP", lineCode: "MAEU", status: "EMPTY" },
    { containerNumber: "CMAU1122334", typeCode: "40GP", lineCode: "CMAU", status: "FULL" },
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
      data: {
        containerNumber: s.containerNumber,
        containerTypeId: ct.id,
        shippingLineId: sl.id,
        status: s.status,
      },
    });

    const loc = ct.isReefer ? reeferLocations[i % reeferLocations.length] : normalLocations[i % normalLocations.length];
    await prisma.inventory.create({
      data: {
        containerId: container.id,
        locationId: loc.id,
        status: "IN_YARD",
      },
    });

    if (ct.isReefer) {
      await prisma.reeferMonitoring.create({
        data: {
          containerId: container.id,
          setTempC: -18,
          actualTempC: -17.8,
          humidity: 65,
          powerStatus: "CONNECTED",
        },
      });
    }
  }

  console.log("Seed complete:", { admin: admin.email, containers: sampleContainers.length, locations: locationData.length, customers: customers.length });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
