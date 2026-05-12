import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../src/config/db.js";
import { Doctor } from "../src/models/Doctor.js";
import { Manager } from "../src/models/Manager.js";

const doctors = [
  { email: "doc1@general.in", department: "general", name: "Dr. Rajesh Kumar", specialization: "General Medicine" },
  { email: "doc1@cardio.in", department: "cardiology", name: "Dr. Priya Sharma", specialization: "Cardiology" },
  { email: "doc1@ortho.in", department: "orthopedics", name: "Dr. Amit Patel", specialization: "Orthopedics" },
  { email: "doc1@pedia.in", department: "pediatrics", name: "Dr. Sneha Reddy", specialization: "Pediatrics" },
  { email: "doc1@derma.in", department: "dermatology", name: "Dr. Vikram Singh", specialization: "Dermatology" },
  { email: "doc1@neuro.in", department: "neurology", name: "Dr. Ananya Iyer", specialization: "Neurology" },
  { email: "doc1@gynec.in", department: "gynecology", name: "Dr. Kavita Nair", specialization: "Gynecology" },
  { email: "doc1@ent.in", department: "ent", name: "Dr. Suresh Menon", specialization: "ENT" },
  { email: "doc1@ophthal.in", department: "ophthalmology", name: "Dr. Divya Joshi", specialization: "Ophthalmology" },
  { email: "doc1@emergency.in", department: "emergency", name: "Dr. Rahul Verma", specialization: "Emergency Medicine" }
];

async function run() {
  await connectDB(process.env.MONGODB_URI);
  const password = await bcrypt.hash("12345678", 10);

  await Doctor.deleteMany({});
  await Manager.deleteMany({});

  await Doctor.insertMany(doctors.map((item) => ({ ...item, password })));
  await Manager.create({
    email: "admin@manager.in",
    password,
    name: "System Administrator",
    role: "manager"
  });

  process.stdout.write("Seed complete\n");
  process.exit(0);
}

run().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
