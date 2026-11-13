import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Resource } from '../models/Resource.js';

const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

const sampleResources = [
  {
    title: 'End-Semester Examination Timetable',
    description: 'The final examination timetable for semester 3 and semester 5 students.',
    category: 'notice',
    resourceType: 'Examination',
    department: 'Computer Science',
    academicYear: '2026-27',
    tags: ['examination', 'timetable', 'semester'],
    metadata: { priority: 'high' }
  },
  {
    title: 'Software Engineer Placement Drive',
    description: 'Campus placement drive for software engineering roles. Eligible students should register before the deadline.',
    category: 'placement',
    resourceType: 'Placement Drive',
    department: 'Computer Science',
    academicYear: '2026-27',
    tags: ['placement', 'software', 'engineering', 'drive'],
    metadata: {
      companyName: 'Northstar Technologies',
      minimumCgpa: 7.5,
      applicationDeadline: '2026-12-10',
      driveDate: '2026-12-15'
    }
  },
  {
    title: 'Annual Technical Symposium',
    description: 'A two-day technical symposium featuring workshops, project demonstrations, and coding contests.',
    category: 'event',
    resourceType: 'Technical Event',
    department: 'Computer Science',
    academicYear: '2026-27',
    tags: ['event', 'technical', 'workshop', 'coding'],
    metadata: {
      organizer: 'Computer Science Association',
      eventDate: '2026-12-20',
      startTime: '09:30',
      endTime: '17:00',
      venue: 'Main Auditorium'
    }
  },
  {
    title: 'Dr. Ananya Rao Faculty Profile',
    description: 'Associate Professor specializing in database systems and information retrieval.',
    category: 'faculty',
    resourceType: 'Faculty Profile',
    department: 'Computer Science',
    tags: ['faculty', 'dbms', 'database', 'information retrieval'],
    metadata: {
      designation: 'Associate Professor',
      email: 'ananya.rao@ucisp.edu',
      officeLocation: 'Academic Block A',
      cabinNumber: 'A-204',
      availability: 'Monday to Friday, 10:00-16:00'
    }
  },
  {
    title: 'DBMS Notes - Third Semester',
    description: 'Study material covering relational algebra, normalization, transactions, indexing, and query optimization.',
    category: 'academic',
    resourceType: 'Notes',
    department: 'Computer Science',
    semester: 3,
    academicYear: '2026-27',
    tags: ['dbms', 'notes', 'third semester', 'database'],
    metadata: { subject: 'Database Management Systems' }
  },
  {
    title: 'Python Lab Programs',
    description: 'Practice programs for data structures, file handling, exceptions, and object-oriented programming in Python.',
    category: 'academic',
    resourceType: 'Lab Programs',
    department: 'Computer Science',
    semester: 3,
    academicYear: '2026-27',
    tags: ['python', 'lab', 'programs', 'practical'],
    metadata: { subject: 'Python Programming' }
  }
];

try {
  await mongoose.connect(env.mongoUri);
  const admin = await User.findOne({ email: adminEmail.toLowerCase(), role: 'admin' });
  if (!admin) {
    throw new Error(`Admin not found for ${adminEmail}. Run seed:admin first or set ADMIN_EMAIL.`);
  }

  let inserted = 0;
  let updated = 0;
  for (const data of sampleResources) {
    const publishedAt = data.category === 'event'
      ? new Date('2026-11-20T09:00:00.000Z')
      : data.category === 'placement'
        ? new Date('2026-11-15T09:00:00.000Z')
        : new Date('2026-11-13T09:00:00.000Z');
    const result = await Resource.updateOne(
      { title: data.title, category: data.category },
      { $setOnInsert: { ...data, publishedAt, createdBy: admin._id, indexingStatus: 'pending' } },
      { upsert: true }
    );
    if (result.upsertedCount) inserted += 1;
    else updated += 1;
  }

  console.log(`Sample data ready: ${inserted} inserted, ${updated} already existed.`);
} finally {
  await mongoose.disconnect();
}
