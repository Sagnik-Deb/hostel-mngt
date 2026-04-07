import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const connectionString = process.env.DATABASE_URL || "";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const HOSTELS = [
  { name: "Ganga Hostel", code: "GANGA", wardenName: "Dr. Rajesh Kumar", wardenEmail: "rajesh.kumar@university.edu", wardenPhone: "+91-9876543001", description: "Premium boys hostel with modern amenities, located near the main academic block.", address: "Block A, University Campus", totalRooms: 40, capacity: 120, rules: ["Curfew at 10:00 PM", "No visitors after 8:00 PM", "Maintain cleanliness in common areas", "No loud music after 9:00 PM"] },
  { name: "Yamuna Hostel", code: "YAMUNA", wardenName: "Dr. Priya Sharma", wardenEmail: "priya.sharma@university.edu", wardenPhone: "+91-9876543002", description: "Girls hostel with 24/7 security and well-furnished rooms.", address: "Block B, University Campus", totalRooms: 40, capacity: 120, rules: ["Curfew at 9:30 PM", "Visitors only in common area", "Mandatory sign-in/sign-out", "No cooking in rooms"] },
  { name: "Kaveri Hostel", code: "KAVERI", wardenName: "Dr. Sunita Patel", wardenEmail: "sunita.patel@university.edu", wardenPhone: "+91-9876543003", description: "Girls hostel with spacious rooms and a dedicated study area.", address: "Block C, University Campus", totalRooms: 35, capacity: 105, rules: ["Curfew at 9:30 PM", "ID card mandatory at entry", "No electrical appliances in rooms", "Silence hours 10 PM - 6 AM"] },
  { name: "Narmada Hostel", code: "NARMADA", wardenName: "Prof. Anil Verma", wardenEmail: "anil.verma@university.edu", wardenPhone: "+91-9876543004", description: "Senior boys hostel with single and double occupancy rooms.", address: "Block D, University Campus", totalRooms: 50, capacity: 100, rules: ["Curfew at 10:30 PM", "No ragging - zero tolerance", "Keep rooms tidy", "Report maintenance issues promptly"] },
  { name: "Godavari Hostel", code: "GODAVARI", wardenName: "Dr. Meena Reddy", wardenEmail: "meena.reddy@university.edu", wardenPhone: "+91-9876543005", description: "Co-ed postgraduate hostel with research facilities.", address: "Block E, University Campus", totalRooms: 30, capacity: 60, rules: ["24/7 access for PG students", "Guest registration required", "No pets allowed", "Common kitchen available"] },
  { name: "Krishna Hostel", code: "KRISHNA", wardenName: "Prof. Vikram Singh", wardenEmail: "vikram.singh@university.edu", wardenPhone: "+91-9876543006", description: "Boys hostel with sports facilities and gymnasium.", address: "Block F, University Campus", totalRooms: 45, capacity: 135, rules: ["Curfew at 10:00 PM", "Gym hours 6 AM - 8 PM", "No smoking on premises", "Respect common property"] },
  { name: "Tungabhadra Hostel", code: "TUNGABHADRA", wardenName: "Dr. Lakshmi Narayan", wardenEmail: "lakshmi.narayan@university.edu", wardenPhone: "+91-9876543007", description: "Girls hostel with in-house library and recreation area.", address: "Block G, University Campus", totalRooms: 35, capacity: 105, rules: ["Curfew at 9:30 PM", "Library open till 11 PM", "Mandatory attendance at roll call", "No male visitors past lobby"] },
  { name: "Brahmaputra Hostel", code: "BRAHMAPUTRA", wardenName: "Prof. Debashish Das", wardenEmail: "debashish.das@university.edu", wardenPhone: "+91-9876543008", description: "Premium boys hostel with AC rooms and modern cafeteria.", address: "Block H, University Campus", totalRooms: 30, capacity: 90, rules: ["Curfew at 10:00 PM", "Cafeteria hours 7 AM - 10 PM", "No outside food delivery after 9 PM", "Energy conservation mandatory"] },
  { name: "Mahanadi Hostel", code: "MAHANADI", wardenName: "Dr. Sanjay Mishra", wardenEmail: "sanjay.mishra@university.edu", wardenPhone: "+91-9876543009", description: "Boys hostel for first-year students with mentoring programs.", address: "Block I, University Campus", totalRooms: 50, capacity: 150, rules: ["Curfew at 9:00 PM for first years", "Mandatory study hours 7 PM - 9 PM", "Senior mentors available", "Anti-ragging committee active"] },
  { name: "Saraswati Hostel", code: "SARASWATI", wardenName: "Dr. Anita Joshi", wardenEmail: "anita.joshi@university.edu", wardenPhone: "+91-9876543010", description: "Girls hostel with yoga and meditation facilities.", address: "Block J, University Campus", totalRooms: 40, capacity: 120, rules: ["Curfew at 9:30 PM", "Yoga sessions at 6 AM", "Quiet zone in study area", "Visitors by appointment only"] },
  { name: "Sutlej Hostel", code: "SUTLEJ", wardenName: "Prof. Harpreet Kaur", wardenEmail: "harpreet.kaur@university.edu", wardenPhone: "+91-9876543011", description: "International students hostel with multicultural environment.", address: "Block K, University Campus", totalRooms: 25, capacity: 50, rules: ["24/7 access with key card", "Cultural sensitivity expected", "Translation services available", "Wi-Fi enabled throughout"] },
  { name: "Jhelum Hostel", code: "JHELUM", wardenName: "Dr. Farhan Ahmed", wardenEmail: "farhan.ahmed@university.edu", wardenPhone: "+91-9876543012", description: "Research scholars hostel with conference rooms and quiet study pods.", address: "Block L, University Campus", totalRooms: 20, capacity: 40, rules: ["24/7 access for research scholars", "Conference room booking required", "Maintain research equipment", "Collaborative spaces available"] },
];

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  await prisma.messRating.deleteMany();
  await prisma.messMenu.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.oTP.deleteMany();
  await prisma.application.deleteMany();
  await prisma.pastStudent.deleteMany();
  await prisma.user.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hostel.deleteMany();

  console.log("🗑️  Cleared existing data");

  // Create hostels
  for (const hostelData of HOSTELS) {
    const hostel = await prisma.hostel.create({
      data: hostelData,
    });

    console.log(`🏠 Created hostel: ${hostel.name}`);

    // Create rooms for each hostel
    const roomTypes = ["Triple Sharing", "Double Sharing", "Single"];
    const floors = Math.min(4, Math.ceil(hostelData.totalRooms / 10));

    for (let floor = 1; floor <= floors; floor++) {
      const roomsPerFloor = Math.ceil(hostelData.totalRooms / floors);
      for (let r = 1; r <= roomsPerFloor; r++) {
        const roomNumber = `${floor}${String(r).padStart(2, "0")}`;
        const roomType = roomTypes[Math.floor(Math.random() * 3)];
        const capacity =
          roomType === "Single" ? 1 : roomType === "Double Sharing" ? 2 : 3;

        await prisma.room.create({
          data: {
            number: roomNumber,
            floor,
            capacity,
            roomType,
            hostelId: hostel.id,
          },
        });
      }
    }

    console.log(`🚪 Created rooms for ${hostel.name}`);
  }

  // Create Primary Admin
  const firstHostel = await prisma.hostel.findFirst({
    where: { code: "GANGA" },
  });

  if (firstHostel) {
    const hashedPassword = await bcrypt.hash(
      process.env.PRIMARY_ADMIN_PASSWORD || "Admin@123456",
      12
    );

    await prisma.user.create({
      data: {
        email: process.env.PRIMARY_ADMIN_EMAIL || "admin@hostelmgmt.com",
        password: hashedPassword,
        name: "System Administrator",
        role: "PRIMARY_ADMIN",
        status: "ACTIVE",
        adminState: "APPROVED",
        hostelId: firstHostel.id,
        phone: "+91-9999999999",
      },
    });

    console.log("👑 Created Primary Admin");
  }

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
