import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const demoHash = await bcrypt.hash("demo1234", 10);
  const adminHash = await bcrypt.hash("admin1234", 10);

  const demo = await prisma.user.upsert({
    where: { email: "demo@workbal.dev" },
    update: {},
    create: {
      email: "demo@workbal.dev",
      passwordHash: demoHash,
      name: "Demo Client",
      role: "CLIENT",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@workbal.dev" },
    update: {},
    create: {
      email: "admin@workbal.dev",
      passwordHash: adminHash,
      name: "WorkBal Admin",
      role: "ADMIN",
    },
  });

  const existing = await prisma.task.count({ where: { userId: demo.id } });
  if (existing === 0) {
    const t1 = await prisma.task.create({
      data: {
        title: "Competitive landscape brief",
        description: "Summarize the top competitors in B2B workflow automation for SMBs.",
        instructions:
          "List 5 competitors with a one-paragraph positioning summary each.\nNote pricing model if publicly known.\nEnd with a short recommendation matrix.",
        context: "Focus on European market; avoid scraping login-walled pages.",
        priceUsd: 49,
        status: "COMPLETED",
        result: `# WorkBal Completion Report

**Task:** Competitive landscape brief
**Agent:** WorkBal Seed Artifact

## Summary
Completed the client-submitted competitive landscape brief from provided instructions.

## Deliverable

### Competitors
1. **Zapier** — No-code automation connector focused on app-to-app workflows; freemium SaaS.
2. **Make (Integromat)** — Visual scenario builder for complex multi-step automations; usage-based tiers.
3. **n8n** — Open-source / cloud workflow automation with self-host option; strong developer appeal.
4. **Microsoft Power Automate** — Enterprise RPA + connectors inside Microsoft 365 ecosystem.
5. **Workato** — Enterprise iPaaS with recipe marketplace and governance features.

### Recommendation
For SMB Europe: prioritize Zapier/Make for speed-to-value; evaluate n8n when data residency or cost control matters.

---
*Seeded sample — client-submitted work only.*
`,
        startedAt: new Date(Date.now() - 3600_000),
        completedAt: new Date(Date.now() - 3500_000),
        userId: demo.id,
      },
    });

    await prisma.invoice.create({
      data: {
        amountUsd: 49,
        status: "UNPAID",
        taskId: t1.id,
        userId: demo.id,
      },
    });

    const t2 = await prisma.task.create({
      data: {
        title: "Customer onboarding email draft",
        description: "Draft a welcome email sequence outline for a SaaS onboarding flow.",
        instructions:
          "Write 3 email outlines: Day 0 welcome, Day 2 tips, Day 7 check-in.\nKeep tone professional and friendly.\nInclude subject line suggestions.",
        context: "Product: analytics dashboard for e-commerce brands.",
        priceUsd: 29,
        status: "COMPLETED",
        result: `# WorkBal Completion Report

**Task:** Customer onboarding email draft

## Deliverable

### Email 1 — Day 0 Welcome
- **Subject:** Welcome aboard — your analytics workspace is ready
- **Outline:** Greet by name, confirm account, link to quick-start checklist, invite to book a 15-min setup call.

### Email 2 — Day 2 Tips
- **Subject:** 3 dashboards most stores build first
- **Outline:** Share starter templates (sales, inventory, ads), one tip per template, CTA to import sample data.

### Email 3 — Day 7 Check-in
- **Subject:** How is your first week going?
- **Outline:** Ask one feedback question, offer office hours, link to docs / support.

---
*Seeded sample — client-submitted work only.*
`,
        startedAt: new Date(Date.now() - 7200_000),
        completedAt: new Date(Date.now() - 7100_000),
        userId: demo.id,
      },
    });

    await prisma.invoice.create({
      data: {
        amountUsd: 29,
        status: "PAID",
        taskId: t2.id,
        userId: demo.id,
        paidAt: new Date(Date.now() - 7000_000),
      },
    });
  }

  console.log("Seed complete:");
  console.log("  demo@workbal.dev / demo1234 (CLIENT)");
  console.log("  admin@workbal.dev / admin1234 (ADMIN)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
